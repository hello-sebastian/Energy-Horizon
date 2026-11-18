import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { CardConfig } from "../../src/card/types";
import {
  normalizeForLoad,
  normalizeForSave
} from "../../src/card/editor/config-normalize";
import { YAML_PARSE_DEBOUNCE_MS } from "../../src/card/editor/config-merge";
import { createYamlMode, type YamlMode } from "../../src/card/editor/yaml-mode";

/**
 * 911/TD-12 (FR-904-P): unit tests for the DOM-free YAML mode state machine.
 * Runs in plain node (no DOM): the `window.jsyaml` codec is replaced with a
 * JSON stand-in so the state, the timers, and the self-echo guard are
 * exercised in isolation.
 *
 * The harness mirrors the shell: the authoritative config is ALWAYS the
 * output of `normalizeForLoad` (`setConfig` normalizes before storing), and
 * the self-echo input is the **saved form** (`normalizeForSave`) — that is
 * what HA round-trips back into `setConfig`.
 */

// A minimal valid CardConfig with sensible required keys.
const cfg = (overrides: Partial<CardConfig> = {}): CardConfig => ({
  type: "energy-horizon-card",
  entity: "sensor.power",
  comparison_preset: "year_over_year",
  ...overrides
});

// Fake YAML codec: JSON in place of js-yaml (same success/error shape).
const dump = (config: CardConfig): string =>
  JSON.stringify(normalizeForSave(config));

const parseYaml = (text: string) => {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false as const, error: "not-a-mapping" };
    }
    return { ok: true as const, config: parsed as CardConfig };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

interface Harness {
  mode: YamlMode;
  /** The harness's view of the shell's authoritative config. */
  config: () => CardConfig | undefined;
  onConfigParsed: ReturnType<typeof vi.fn>;
  onEmit: ReturnType<typeof vi.fn>;
  onChange: ReturnType<typeof vi.fn>;
}

function makeHarness(
  config: CardConfig | null = null,
  supported = true,
  dumpFn = dump
): Harness {
  let current: CardConfig | undefined =
    config === null ? undefined : normalizeForLoad(config);
  const onConfigParsed = vi.fn((c: CardConfig) => {
    current = c;
  });
  const onEmit = vi.fn();
  const onChange = vi.fn();
  const mode = createYamlMode({
    supported: () => supported,
    dump: dumpFn,
    parseYaml,
    getConfig: () => current,
    onConfigParsed,
    onEmit,
    onChange
  });
  return { mode, config: () => current, onConfigParsed, onEmit, onChange };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("YamlMode.parse — setConfig classification (self-echo guard)", () => {
  it("an external change (no prior emit) stores the dumped text", () => {
    const h = makeHarness(cfg({ title: "A" }));
    const result = h.mode.parse(cfg({ title: "A" }));
    expect(result.error).toBeUndefined();
    expect(result.text).toBe(dump(cfg({ title: "A" })));
    expect(h.mode.text).toBe(dump(cfg({ title: "A" })));
  });

  it("a self-echo (the HA round-trip of lastEmitted, ref-insensitive) does NOT re-serialize", () => {
    const A = cfg({ title: "A" });
    const h = makeHarness(A);
    h.mode.flushEmit(); // lastEmitted = save form of the loaded config
    h.mode.onInput("user edited text");
    // The saved form is what HA round-trips back — structurally equal to
    // lastEmitted, but a fresh object reference.
    const roundTripped = normalizeForSave(h.config()!);
    const result = h.mode.parse(roundTripped);
    expect(result).toEqual({});
    expect(h.mode.text).toBe("user edited text");
  });

  it("a change after a self-echo re-serializes again", () => {
    const h = makeHarness(cfg({ title: "A" }));
    h.mode.flushEmit();
    const result = h.mode.parse(cfg({ title: "B" }));
    expect(result.text).toBe(dump(cfg({ title: "B" })));
    expect(h.mode.text).toBe(dump(cfg({ title: "B" })));
  });

  it("an unavailable serializer → error, text untouched", () => {
    const h = makeHarness(cfg(), true, () => "");
    h.mode.onInput("keep me");
    const result = h.mode.parse(cfg({ title: "B" }));
    expect(result).toEqual({ error: "yaml-unavailable" });
    expect(h.mode.text).toBe("keep me");
  });
});

describe("YamlMode.commit — pure parse", () => {
  it("valid text → normalized config; no state mutation, no callbacks", () => {
    const h = makeHarness(cfg());
    h.mode.onInput("seed");
    const result = h.mode.commit(JSON.stringify({ entity: "sensor.other" }));
    expect(result.error).toBeUndefined();
    expect(result.config).toMatchObject({ entity: "sensor.other" });
    expect(h.mode.text).toBe("seed"); // untouched
    expect(h.mode.parseError).toBeNull();
    expect(h.onConfigParsed).not.toHaveBeenCalled();
    expect(h.onEmit).not.toHaveBeenCalled();
    expect(h.onChange).not.toHaveBeenCalled();
  });

  it("invalid text → error; no state mutation, no callbacks", () => {
    const h = makeHarness(cfg());
    const result = h.mode.commit("not json {");
    expect(result.config).toBeUndefined();
    expect(result.error).toBeTruthy();
    expect(h.onConfigParsed).not.toHaveBeenCalled();
    expect(h.onEmit).not.toHaveBeenCalled();
    expect(h.onChange).not.toHaveBeenCalled();
  });

  it("a non-mapping result → error", () => {
    const h = makeHarness();
    const result = h.mode.commit("[1, 2, 3]");
    expect(result.config).toBeUndefined();
    expect(result.error).toBe("not-a-mapping");
  });
});

describe("YamlMode.onInput — debounced parse + live-preview emit", () => {
  it("the parse runs at 150 ms, replaces the config, and triggers one change", () => {
    const h = makeHarness(cfg());
    h.mode.onInput(JSON.stringify({ entity: "sensor.other" }));
    expect(h.onConfigParsed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(YAML_PARSE_DEBOUNCE_MS - 1);
    expect(h.onConfigParsed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(h.onConfigParsed).toHaveBeenCalledTimes(1);
    expect(h.config()!.entity).toBe("sensor.other");
    expect(h.mode.parseError).toBeNull();
    expect(h.onChange).toHaveBeenCalledTimes(1);
  });

  it("an invalid parse keeps the last valid config and sets the inline error", () => {
    const A = cfg();
    const h = makeHarness(A);
    h.mode.onInput("bad {");
    vi.advanceTimersByTime(YAML_PARSE_DEBOUNCE_MS);
    expect(h.config()).toEqual(normalizeForLoad(A)); // unchanged
    expect(h.mode.parseError).not.toBeNull();
    expect(h.onChange).toHaveBeenCalledTimes(1);
  });

  it("rapid keystrokes coalesce: only the last text is parsed", () => {
    const h = makeHarness(cfg());
    h.mode.onInput(JSON.stringify({ entity: "sensor.a" }));
    h.mode.onInput(JSON.stringify({ entity: "sensor.b" }));
    h.mode.onInput(JSON.stringify({ entity: "sensor.c" }));
    vi.advanceTimersByTime(YAML_PARSE_DEBOUNCE_MS);
    expect(h.onConfigParsed).toHaveBeenCalledTimes(1);
    expect(h.config()!.entity).toBe("sensor.c");
  });

  it("the live-preview emit fires at 1000 ms, after the parse", () => {
    const h = makeHarness(cfg({ title: "A" }));
    h.mode.flushEmit(); // emit #1 (initial config vs no lastEmitted)
    h.mode.onInput(JSON.stringify({ entity: "sensor.power", title: "B" }));
    vi.advanceTimersByTime(YAML_PARSE_DEBOUNCE_MS); // parse runs first
    expect(h.onEmit).toHaveBeenCalledTimes(1); // no live-preview emit yet
    vi.advanceTimersByTime(1000 - YAML_PARSE_DEBOUNCE_MS);
    expect(h.onEmit).toHaveBeenCalledTimes(2);
    expect(h.onEmit.mock.calls[1]![0]!.title).toBe("B");
  });

  it("no-op suppression: identical config → no live-preview emit", () => {
    const h = makeHarness(cfg({ title: "A" }));
    h.mode.flushEmit(); // lastEmitted = save form of the loaded config
    // The textarea holds the serialized config (what enter() puts in it) and
    // the user made no change: the parse must round-trip to a save form that
    // is structurally equal to lastEmitted, so the 1000 ms emit is suppressed.
    h.mode.onInput(dump(h.config()!));
    vi.advanceTimersByTime(1000);
    expect(h.onEmit).toHaveBeenCalledTimes(1); // only the initial emit
  });
});

describe("YamlMode.flush — atomic parse-then-emit", () => {
  it("runs the pending parse FIRST, then the emit gate, and clears the yaml emit timer", () => {
    const h = makeHarness(cfg({ title: "A" }));
    h.mode.flushEmit(); // emit #1
    h.mode.onInput(JSON.stringify({ entity: "sensor.power", title: "B" }));
    h.mode.flush();
    expect(h.onConfigParsed).toHaveBeenCalledTimes(1);
    expect(h.onEmit).toHaveBeenCalledTimes(2);
    // The parse ran before the second emit.
    expect(h.onConfigParsed.mock.invocationCallOrder[0]!).toBeLessThan(
      h.onEmit.mock.invocationCallOrder[1]!
    );
    expect(h.onEmit.mock.calls[1]![0]!.title).toBe("B");
    // The yaml emit timer was cleared: no third emit after 1000 ms.
    vi.advanceTimersByTime(1000);
    expect(h.onEmit).toHaveBeenCalledTimes(2);
  });

  it("on parse failure the last valid config is kept and still emitted if it differs", () => {
    const h = makeHarness(cfg({ title: "A" }));
    h.mode.flushEmit(); // lastEmitted = save form of A
    // An external setConfig replaced the config without emitting.
    h.onConfigParsed(cfg({ title: "B" }));
    h.mode.onInput("bad {");
    h.mode.flush();
    expect(h.config()!.title).toBe("B"); // kept
    expect(h.mode.parseError).not.toBeNull();
    expect(h.onEmit).toHaveBeenCalledTimes(2);
    expect(h.onEmit.mock.calls[1]![0]!.title).toBe("B");
  });

  it("with no config the flush is a silent no-op", () => {
    const h = makeHarness(null);
    h.mode.flush();
    expect(h.onEmit).not.toHaveBeenCalled();
    expect(h.onChange).not.toHaveBeenCalled();
  });
});

describe("YamlMode.scheduleEmit / flushEmit — visual emit pipeline", () => {
  it("debounces at 300 ms and coalesces repeated calls", () => {
    const h = makeHarness(cfg());
    h.mode.scheduleEmit();
    h.mode.scheduleEmit();
    h.mode.scheduleEmit();
    vi.advanceTimersByTime(300);
    expect(h.onEmit).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(h.onEmit).toHaveBeenCalledTimes(1); // nothing pending after the flush
  });

  it("the emit gate suppresses a no-delta flushEmit", () => {
    const h = makeHarness(cfg());
    h.mode.flushEmit();
    h.mode.flushEmit();
    expect(h.onEmit).toHaveBeenCalledTimes(1);
  });

  it("lastEmitted starts undefined and becomes the save form after an emit", () => {
    const h = makeHarness(cfg({ title: "A" }));
    expect(h.mode.lastEmitted).toBeUndefined();
    h.mode.flushEmit();
    expect(h.mode.lastEmitted).toMatchObject({
      entity: "sensor.power",
      title: "A",
      comparison_preset: "year_over_year",
      show_forecast: true
    });
  });
});

describe("YamlMode.enter — Visual → YAML", () => {
  it("ALWAYS re-serializes (bypassing the self-echo guard), clears the error, and flushes the pending visual emit", () => {
    const A = cfg({ title: "A" });
    const h = makeHarness(A);
    h.mode.scheduleEmit();
    h.mode.onInput("stale user text {");
    vi.advanceTimersByTime(YAML_PARSE_DEBOUNCE_MS); // parse fails → error set
    expect(h.mode.parseError).not.toBeNull();

    h.mode.enter(A);
    expect(h.mode.text).toBe(dump(A));
    expect(h.mode.parseError).toBeNull();
    expect(h.onEmit).toHaveBeenCalledTimes(1); // pending visual emit flushed
    vi.advanceTimersByTime(1000);
    expect(h.onEmit).toHaveBeenCalledTimes(1); // nothing else to emit
  });
});

describe("YamlMode — misc", () => {
  it("supported() passes through the injected codec check", () => {
    expect(makeHarness(null, true).mode.supported()).toBe(true);
    expect(makeHarness(null, false).mode.supported()).toBe(false);
  });

  it("clearError() clears a set parse error", () => {
    const h = makeHarness();
    h.mode.onInput("bad {");
    vi.advanceTimersByTime(YAML_PARSE_DEBOUNCE_MS);
    expect(h.mode.parseError).not.toBeNull();
    h.mode.clearError();
    expect(h.mode.parseError).toBeNull();
  });
});
