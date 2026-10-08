import type { CardConfig } from "../types";

/**
 * Full-Coverage Visual Editor (v1.2.0) — safe-mode YAML parsing (FR-908-Y,
 * Constitution II).
 *
 * The HA `window.jsyaml` global is the standard js-yaml. Its `load` schema is
 * version-dependent (safe in v3, unsafe in v4), so we cannot rely on the
 * schema alone to block hostile tags such as `!!python/object`. Instead we run
 * a **defense in depth**:
 *   1. catch any parse error (syntax error, or a hostile tag that the active
 *      schema refuses) → inline error, no emit;
 *   2. reject any result that is not a plain mapping (a scalar, array, or
 *      `null` is not a card config);
 *   3. reject any result containing a **non-plain object** — a class instance
 *      produced by a hostile tag has a prototype other than `Object.prototype`
 *      / `null`, so it is detected and rejected regardless of jsyaml version.
 *
 * No code is ever executed and no arbitrary object is ever instantiated from
 * the parsed text.
 */
export type SafeParseResult =
  | { ok: true; config: CardConfig }
  | { ok: false; error: string };

/**
 * Parses YAML text in safe mode. Returns the parsed config on success, or a
 * stable error code / message on failure. Never throws.
 */
export function safeParseYaml(text: string): SafeParseResult {
  const jsyaml =
    typeof window !== "undefined" ? window.jsyaml : undefined;
  if (!jsyaml) {
    return { ok: false, error: "yaml-unavailable" };
  }

  let parsed: unknown;
  try {
    parsed = jsyaml.load(text);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "not-a-mapping" };
  }

  if (!isPlainValue(parsed)) {
    return { ok: false, error: "hostile-content" };
  }

  return { ok: true, config: parsed as CardConfig };
}

/**
 * Recursively asserts that a parsed value contains only plain objects, arrays,
 * and primitives. A class instance (e.g. from a hostile `!!python/object` tag)
 * has a prototype other than `Object.prototype` / `null` and is rejected.
 */
function isPlainValue(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return true; // primitives (string / number / boolean / null) are safe
  }
  if (Array.isArray(value)) {
    return value.every(isPlainValue);
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return false; // a class instance → hostile, reject
  }
  return Object.values(value as Record<string, unknown>).every(isPlainValue);
}
