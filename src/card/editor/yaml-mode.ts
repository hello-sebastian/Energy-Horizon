import type { CardConfig } from "../types";
import {
  deepEqual,
  hasConfigDelta,
  EMIT_DEBOUNCE_MS,
  YAML_PARSE_DEBOUNCE_MS,
  YAML_EMIT_DEBOUNCE_MS
} from "./config-merge";
import { normalizeForLoad, normalizeForSave } from "./config-normalize";
import {
  type SafeParseResult
} from "./yaml-safe";

/**
 * Full-Coverage Visual Editor (v1.2.0) — the YAML mode state machine
 * (FR-908-Y, FR-904-P, 911/TD-12).
 *
 * Owns **all** YAML-mode state that the editor shell used to carry: the
 * YAML `text`, the inline `parseError`, the `lastEmitted` config (save
 * form), the self-echo guard, and all three debounce timers (visual emit
 * 300 ms, YAML parse 150 ms, YAML emit 1000 ms). It is DOM-free: the YAML
 * codec, the shell's authoritative config, and the re-render / emit hooks
 * are injected, so the state machine is unit-testable in plain node.
 *
 * Behavior parity with the pre-extraction shell (911 FR-019):
 *   - a `setConfig` **self-echo** (structurally equal to `lastEmitted`) must
 *     NOT re-serialize the textarea (it would steal the caret); an external
 *     change must;
 *   - `enter()` (Visual → YAML) ALWAYS re-serializes, bypassing the guard;
 *   - a YAML parse **replaces** `_config` wholesale (not a preservative
 *     merge); on parse failure the last valid config is kept and may still
 *     be emitted if it differs from `lastEmitted`;
 *   - `flush()` runs a pending parse first, then the emit gate (atomic
 *     ordering used on blur / mode switch / close).
 */

/**
 * Injected dependencies. The codec functions are the `yaml-safe` module's
 * `yamlSupported` / `dumpYaml` / `safeParseYaml` in production.
 */
export interface YamlModeOptions {
  /** True when the YAML codec (`window.jsyaml`) is available. */
  supported(): boolean;
  /** Serializes a config to YAML (save form); `""` when unavailable. */
  dump(config: CardConfig): string;
  /** Safe-mode YAML parse; never throws. */
  parseYaml(text: string): SafeParseResult;
  /** The shell's current authoritative config (the emit gate's input). */
  getConfig(): CardConfig | undefined;
  /** A YAML parse succeeded: replace the authoritative config. */
  onConfigParsed(config: CardConfig): void;
  /** The emit gate passed: dispatch `config-changed` with this config. */
  onEmit(config: CardConfig): void;
  /** A parse run completed (success or failure): re-render. */
  onChange(): void;
}

export interface YamlParseResult {
  /** The dumped text stored when an external change was classified. */
  text?: string;
  /** Set when the change could not be serialized (codec unavailable). */
  error?: string;
}

export interface YamlCommitResult {
  /** The normalized parsed config (present on success). */
  config?: CardConfig;
  /** The stable error code / message (present on failure). */
  error?: string;
}

export interface YamlMode {
  /** The current YAML text (the textarea's value). */
  readonly text: string;
  /** The inline parse error, or null. */
  readonly parseError: string | null;
  /** The last config dispatched via `config-changed` (save form). */
  readonly lastEmitted: CardConfig | undefined;

  /** Whether the YAML codec is available (toggle visibility, FR-904-K). */
  supported(): boolean;
  /**
   * Classifies a `setConfig` against the self-echo guard. External change
   * → stores the dumped text and returns `{ text }`; self-echo → returns
   * `{}` and leaves the textarea exactly as the user left it.
   */
  parse(config: CardConfig): YamlParseResult;
  /**
   * Visual → YAML: flushes the pending emit, then re-serializes the config
   * into the textarea (bypassing the self-echo guard) and clears the error.
   */
  enter(config: CardConfig): void;
  /**
   * A keystroke in the textarea: stores the text and schedules both the
   * parse (150 ms) and the live-preview emit (1000 ms).
   */
  onInput(text: string): void;
  /**
   * Pure parse: `parseYaml` → normalized config, or error. Never mutates
   * state and never fires callbacks.
   */
  commit(text: string): YamlCommitResult;
  /** Clears the inline parse error. */
  clearError(): void;
  /** Debounces a visual-mode emit (300 ms, text/number fields). */
  scheduleEmit(): void;
  /**
   * The emit gate (FR-908-N): clears the visual emit timer and dispatches
   * via `onEmit` only when the would-be config (save form) structurally
   * differs from the last-emitted config.
   */
  flushEmit(): void;
  /**
   * Force-flushes the pending YAML parse/emit **atomically and in order**
   * (parse first, then emit if valid). Used on blur / mode switch / close.
   */
  flush(): void;
}

/** Creates a YAML mode state machine over the injected dependencies. */
export function createYamlMode(options: YamlModeOptions): YamlMode {
  let text = "";
  let parseError: string | null = null;
  let lastEmitted: CardConfig | undefined;

  // All three debounce timers live here; the shell holds none (911/TD-12).
  let emitTimer: ReturnType<typeof setTimeout> | null = null;
  let parseTimer: ReturnType<typeof setTimeout> | null = null;
  let yamlEmitTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Pure parse: safe-parse the text and normalize for load. On success the
   * parsed config is authoritative (a wholesale replacement, not a
   * preservative merge).
   */
  const commit = (input: string): YamlCommitResult => {
    const result = options.parseYaml(input);
    if (result.ok) {
      return { config: normalizeForLoad(result.config) };
    }
    return { error: result.error };
  };

  const runYamlParse = (): void => {
    const result = commit(text);
    if (result.config !== undefined) {
      options.onConfigParsed(result.config);
      parseError = null;
    } else {
      parseError = result.error ?? "yaml-unavailable";
    }
    // The ONLY re-render hook per parse run — parity with the old
    // `_runYamlParse` (one `requestUpdate` per run, success or failure).
    options.onChange();
  };

  const flushEmit = (): void => {
    if (emitTimer !== null) {
      clearTimeout(emitTimer);
      emitTimer = null;
    }
    const config = options.getConfig();
    if (config === undefined) {
      return;
    }
    const toEmit = normalizeForSave(config);
    if (hasConfigDelta(toEmit, lastEmitted ?? ({} as CardConfig))) {
      lastEmitted = toEmit;
      options.onEmit(toEmit);
    }
  };

  const scheduleYamlParse = (): void => {
    if (parseTimer !== null) {
      clearTimeout(parseTimer);
    }
    parseTimer = setTimeout(() => {
      parseTimer = null;
      runYamlParse();
    }, YAML_PARSE_DEBOUNCE_MS);
  };

  const scheduleYamlEmit = (): void => {
    if (yamlEmitTimer !== null) {
      clearTimeout(yamlEmitTimer);
    }
    yamlEmitTimer = setTimeout(() => {
      yamlEmitTimer = null;
      flushEmit();
    }, YAML_EMIT_DEBOUNCE_MS);
  };

  return {
    get text(): string {
      return text;
    },
    get parseError(): string | null {
      return parseError;
    },
    get lastEmitted(): CardConfig | undefined {
      return lastEmitted;
    },

    supported: (): boolean => options.supported(),

    parse: (config: CardConfig): YamlParseResult => {
      const savedForm = normalizeForSave(config);
      // Self-echo guard: structurally equal to the last-emitted config
      // (robust to HA round-trip normalizations, and reference-insensitive).
      if (lastEmitted !== undefined && deepEqual(savedForm, lastEmitted)) {
        return {};
      }
      const dumped = options.dump(config);
      if (dumped === "") {
        return { error: "yaml-unavailable" };
      }
      text = dumped;
      return { text: dumped };
    },

    enter: (config: CardConfig): void => {
      // Visual → YAML: flush any pending emit, then ALWAYS re-serialize
      // (this is the deliberate bypass of the self-echo guard).
      flushEmit();
      text = options.dump(config);
      parseError = null;
    },

    onInput: (newText: string): void => {
      text = newText;
      scheduleYamlParse();
      scheduleYamlEmit();
    },

    commit,

    clearError: (): void => {
      parseError = null;
    },

    scheduleEmit: (): void => {
      if (emitTimer !== null) {
        clearTimeout(emitTimer);
      }
      emitTimer = setTimeout(() => {
        emitTimer = null;
        flushEmit();
      }, EMIT_DEBOUNCE_MS);
    },

    flushEmit,

    flush: (): void => {
      // Atomic, in order: a pending parse runs first, then the emit gate.
      if (parseTimer !== null) {
        clearTimeout(parseTimer);
        parseTimer = null;
        runYamlParse();
      }
      if (yamlEmitTimer !== null) {
        clearTimeout(yamlEmitTimer);
        yamlEmitTimer = null;
      }
      flushEmit();
    }
  };
}
