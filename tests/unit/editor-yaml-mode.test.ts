/**
 * T025 — SC-908-9: YAML live-edit (FR-908-Y, Constitution II).
 *
 * The YAML textarea is a **first-class input path**. This file covers the
 * quickstart.md §4 "YAML live-edit" automated checks:
 *
 *  - YAML keystroke → debounced emit with **no-op suppression**
 *    (reformat → 0 emits; value change → 1 emit);
 *  - invalid YAML → inline error, no emit, last valid config kept;
 *  - hostile YAML tags (`!!python/object`) → rejected in safe mode, no code
 *    execution, no emit;
 *  - `setConfig` self-echo → textarea NOT re-serialized;
 *  - external `setConfig` change → textarea re-serialized;
 *  - `setConfig` preserves the YAML editor mode (does not reset to Visual);
 *  - blur / close (Save without switching) force-flush the pending
 *    parse+emit atomically and in order.
 *
 * The HA `window.jsyaml` global is the standard js-yaml. We install the real
 * js-yaml (a transitive dependency) as a faithful stand-in so the dump → load
 * round-trip is exercised exactly as it is in Home Assistant.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as jsyaml from "js-yaml";
import "../helpers/setup-dom";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";
import { safeParseYaml } from "../../src/card/editor/yaml-safe";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig, CardConfigInput } from "../../src/card/types";

type EditorEl = EnergyHorizonCardEditor & {
  setConfig: (c: CardConfigInput) => void;
  hass: HomeAssistant;
  updateComplete: Promise<boolean>;
};

function makeHass(): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states: {},
    connection: { sendMessagePromise: async () => ({}) }
  } as HomeAssistant;
}

function mountEditor(config: CardConfigInput): EditorEl {
  const el = new EnergyHorizonCardEditor() as EditorEl;
  el.hass = makeHass();
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

function trackEmits(el: EditorEl): void {
  (el as unknown as { __emitted?: CardConfig[] }).__emitted = [];
  el.addEventListener("config-changed", (e) => {
    const detail = (e as CustomEvent).detail as { config: CardConfig };
    (el as unknown as { __emitted: CardConfig[] }).__emitted!.push(detail.config);
  });
}

function emittedConfigs(el: EditorEl): CardConfig[] {
  return (el as unknown as { __emitted?: CardConfig[] }).__emitted ?? [];
}

/** The YAML-mode textarea (present only in YAML mode). */
function yamlTextarea(el: EditorEl): HTMLTextAreaElement {
  return el.shadowRoot!.querySelector<HTMLTextAreaElement>("textarea.yaml-editor")!;
}

/** Clicks the "YAML" toggle button (the second button in the toggle row). */
function switchToYaml(el: EditorEl): void {
  const buttons = el.shadowRoot!.querySelectorAll<HTMLButtonElement>(
    ".toggle-row button"
  );
  buttons[1]!.dispatchEvent(new Event("click", { bubbles: true }));
}

/** Installs the real js-yaml as the HA `window.jsyaml` global. */
function installJsyaml(): void {
  window.jsyaml = {
    dump: (obj: unknown) => jsyaml.dump(obj),
    load: (str: string) => jsyaml.load(str)
  };
}

const BASE: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  title: "Energy"
};

// ---------------------------------------------------------------------------
// safeParseYaml (pure, Constitution II)
// ---------------------------------------------------------------------------

describe("safeParseYaml (SC-908-9, Constitution II)", () => {
  afterEach(() => {
    delete window.jsyaml;
  });

  it("parses a valid mapping", () => {
    installJsyaml();
    const res = safeParseYaml("entity: sensor.energy\ntitle: Energy\n");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.config.entity).toBe("sensor.energy");
      expect(res.config.title).toBe("Energy");
    }
  });

  it("rejects a non-mapping (scalar)", () => {
    installJsyaml();
    const res = safeParseYaml("just a string");
    expect(res.ok).toBe(false);
  });

  it("rejects a non-mapping (array)", () => {
    installJsyaml();
    const res = safeParseYaml("- 1\n- 2\n");
    expect(res.ok).toBe(false);
  });

  it("rejects a syntax error", () => {
    installJsyaml();
    const res = safeParseYaml("entity: [unclosed");
    expect(res.ok).toBe(false);
  });

  it("rejects a hostile tag (no code execution)", () => {
    installJsyaml();
    const res = safeParseYaml(
      "!!python/object/apply:os.system ['echo pwned']"
    );
    expect(res.ok).toBe(false);
  });

  it("rejects a class instance (defense in depth)", () => {
    // Simulate a jsyaml whose load returns a class instance (a hostile tag
    // that the active schema would instantiate). The prototype check must
    // reject it regardless of jsyaml version.
    class Hostile {}
    window.jsyaml = {
      dump: () => "",
      load: () => new Hostile()
    };
    const res = safeParseYaml("anything");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("hostile-content");
    }
  });

  it("returns yaml-unavailable when window.jsyaml is absent", () => {
    delete window.jsyaml;
    const res = safeParseYaml("entity: x");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("yaml-unavailable");
    }
  });
});

// ---------------------------------------------------------------------------
// Editor YAML mode (element-level, FR-908-Y)
// ---------------------------------------------------------------------------

describe("editor YAML mode (SC-908-9, FR-908-Y)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installJsyaml();
  });
  afterEach(() => {
    vi.useRealTimers();
    delete window.jsyaml;
    document.body.innerHTML = "";
  });

  it("shows the Visual/YAML toggle when jsyaml is present", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".toggle-row")).not.toBeNull();
  });

  it("hides the toggle when jsyaml is absent", async () => {
    delete window.jsyaml;
    const el = mountEditor(BASE);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".toggle-row")).toBeNull();
  });

  it("a YAML value change emits exactly once (SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const afterSwitch = emittedConfigs(el).length;

    const ta = yamlTextarea(el);
    ta.value = ta.value.replace("title: Energy", "title: Renamed");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    // Parse (150 ms) then emit (1000 ms).
    vi.advanceTimersByTime(150);
    await el.updateComplete;
    vi.advanceTimersByTime(1000);
    await el.updateComplete;

    expect(emittedConfigs(el).length).toBe(afterSwitch + 1);
    expect(emittedConfigs(el).at(-1)!.title).toBe("Renamed");
  });

  it("a YAML reformat (same values) emits nothing (no-op suppression, SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const afterSwitch = emittedConfigs(el).length;

    // Reformat: add a comment (same values, different text).
    const ta = yamlTextarea(el);
    ta.value = "# reformatted\n" + ta.value;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    vi.advanceTimersByTime(150);
    await el.updateComplete;
    vi.advanceTimersByTime(1000);
    await el.updateComplete;

    // No-op suppression: the parsed values equal the last-emitted config.
    expect(emittedConfigs(el).length).toBe(afterSwitch);
  });

  it("invalid YAML shows an inline error, keeps last valid config, emits nothing (SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const afterSwitch = emittedConfigs(el).length;

    const ta = yamlTextarea(el);
    const full = ta.value;
    ta.value = full.replace("title: Energy", "title: [unclosed");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    vi.advanceTimersByTime(150); // parse
    await el.updateComplete;
    // Inline error is shown.
    expect(el.shadowRoot!.querySelector(".error")).not.toBeNull();

    // No emit (the last valid config is kept).
    vi.advanceTimersByTime(1000);
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(afterSwitch);
  });

  it("fixing a YAML error emits the new values (SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const afterSwitch = emittedConfigs(el).length;

    const ta = yamlTextarea(el);
    const full = ta.value;
    // Introduce a syntax error.
    ta.value = full.replace("title: Energy", "title: [unclosed");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    vi.advanceTimersByTime(150);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".error")).not.toBeNull();

    // Fix it.
    ta.value = full.replace("title: Energy", "title: Fixed");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    vi.advanceTimersByTime(150);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".error")).toBeNull();

    vi.advanceTimersByTime(1000);
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(afterSwitch + 1);
    expect(emittedConfigs(el).at(-1)!.title).toBe("Fixed");
  });

  it("a hostile YAML tag is rejected in safe mode (no code execution, SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const afterSwitch = emittedConfigs(el).length;

    const ta = yamlTextarea(el);
    ta.value =
      "entity: sensor.energy\n!!python/object/apply:os.system ['echo pwned']\n";
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    vi.advanceTimersByTime(150); // parse
    await el.updateComplete;
    // Inline error is shown; nothing executed.
    expect(el.shadowRoot!.querySelector(".error")).not.toBeNull();

    vi.advanceTimersByTime(1000);
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(afterSwitch);
  });

  it("a setConfig self-echo does not re-serialize the textarea (SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    // Establish _lastEmitted (the switch emits the current config on a fresh
    // editor).
    const lastEmitted = emittedConfigs(el).at(-1);
    expect(lastEmitted).toBeDefined();

    // The user makes an un-emitted edit in the textarea.
    const ta = yamlTextarea(el);
    ta.value = ta.value + "# my un-emitted comment";
    const userText = ta.value;

    // HA echoes back the last-emitted config (a self-echo).
    el.setConfig(lastEmitted!);
    await el.updateComplete;

    // The textarea is left exactly as the user left it (not re-serialized).
    expect(ta.value).toBe(userText);
  });

  it("an external setConfig change re-serializes the textarea (SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const lastEmitted = emittedConfigs(el).at(-1);
    expect(lastEmitted).toBeDefined();

    // The user makes an un-emitted edit in the textarea.
    const ta = yamlTextarea(el);
    ta.value = ta.value + "# my un-emitted comment";

    // HA sends a DIFFERENT config (an external change).
    el.setConfig({ ...lastEmitted!, title: "External" });
    await el.updateComplete;

    // The textarea is re-serialized from the external config: the un-emitted
    // comment is gone and the new title is present.
    expect(ta.value).not.toContain("# my un-emitted comment");
    expect(ta.value).toContain("title: External");
  });

  it("setConfig preserves the YAML editor mode (does not reset to Visual)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    switchToYaml(el);
    await el.updateComplete;
    // In YAML mode: textarea present, sections absent.
    expect(yamlTextarea(el)).not.toBeNull();
    expect(el.shadowRoot!.querySelector(".sections")).toBeNull();

    // A passive re-render must keep the YAML mode.
    el.setConfig({ ...BASE });
    await el.updateComplete;
    expect(yamlTextarea(el)).not.toBeNull();
    expect(el.shadowRoot!.querySelector(".sections")).toBeNull();
  });

  it("blur force-flushes the pending YAML parse+emit (SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const afterSwitch = emittedConfigs(el).length;

    const ta = yamlTextarea(el);
    ta.value = ta.value.replace("title: Energy", "title: Blurred");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    // No emit yet (debounced).
    expect(emittedConfigs(el).length).toBe(afterSwitch);

    // Blur flushes parse+emit immediately (no need to wait for the timers).
    ta.dispatchEvent(new Event("blur", { bubbles: true }));
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(afterSwitch + 1);
    expect(emittedConfigs(el).at(-1)!.title).toBe("Blurred");
  });

  it("disconnect (close) force-flushes the pending YAML parse+emit (SC-908-9)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);
    switchToYaml(el);
    await el.updateComplete;
    const afterSwitch = emittedConfigs(el).length;

    const ta = yamlTextarea(el);
    ta.value = ta.value.replace("title: Energy", "title: Closed");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(afterSwitch);

    // Close the editor (Save without switching to Visual).
    el.remove();
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(afterSwitch + 1);
    expect(emittedConfigs(el).at(-1)!.title).toBe("Closed");
  });
});
