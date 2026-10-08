import type { CardConfig } from "../types";

/**
 * Full-Coverage Visual Editor (v1.2.0) — preservative config merge + emit gate.
 *
 * `preservativeMerge` is the inverse of the v1.1.0 shallow merge: it starts
 * from the full incoming config, applies the changed field(s) by path, and
 * copies every unmodeled key through unchanged (research R3). `hasConfigDelta`
 * is the deep, field-path-aware comparison that gates `config-changed`
 * emission (research R5) and provides YAML no-op suppression (research R13).
 */

/**
 * Short idle timeout for free-text / number fields: the displayed value and
 * `_config` update immediately; only the `config-changed` emit is debounced
 * (research R1). Discrete controls emit immediately.
 */
export const EMIT_DEBOUNCE_MS = 300;

/** YAML parse debounce — short interval for fast inline error feedback (R13). */
export const YAML_PARSE_DEBOUNCE_MS = 150;

/** YAML emit debounce — longer interval for the live preview (R13). */
export const YAML_EMIT_DEBOUNCE_MS = 1000;

type ConfigRecord = Record<string, unknown>;

/**
 * Normalizes a raw control value for storage: `undefined` and `""` both mean
 * "absent" (adaptive / cleared). This is what lets the `aggregation` `auto`
 * option map to an omitted key, and lets a cleared text field drop its key.
 */
function normalizeValue(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}

/**
 * Applies a single path → value change to a config object, returning a new
 * object. Top-level scalars are set directly; `time_window` is merged
 * key-by-key (so editing `time_window.count` preserves `time_window.offset`).
 * A normalized `undefined` value deletes the key (adaptive / cleared).
 */
function applyChange(base: ConfigRecord, path: string, rawValue: unknown): ConfigRecord {
  const value = normalizeValue(rawValue);
  const parts = path.split(".");
  const out: ConfigRecord = { ...base };

  if (parts.length === 1) {
    if (value === undefined) {
      delete out[parts[0]!];
    } else {
      out[parts[0]!] = value;
    }
    return out;
  }

  // Nested path (e.g. `time_window.count`): merge the object key-by-key.
  const [head, ...rest] = parts;
  const existing = out[head!];
  const nested: ConfigRecord =
    existing !== null && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as ConfigRecord) }
      : {};
  const key = rest[rest.length - 1]!;
  if (value === undefined) {
    delete nested[key];
  } else {
    nested[key] = value;
  }
  out[head!] = nested;
  return out;
}

/**
 * Preservative deep merge (research R3, FR-908-P):
 * - starts from the full `base` config (authoritative object);
 * - applies each `changes` entry by path (top-level scalars set; `time_window`
 *   merged key-by-key);
 * - every key present in `base` that is not touched is copied through
 *   unchanged (deprecated `comparison_mode`, legacy `forecast`, unknown keys).
 *
 * Pure: returns a new object; never mutates `base`.
 */
export function preservativeMerge(
  base: CardConfig,
  changes: Record<string, unknown>
): CardConfig {
  let out: ConfigRecord = { ...(base as ConfigRecord) };
  for (const [path, value] of Object.entries(changes)) {
    out = applyChange(out, path, value);
  }
  return out as CardConfig;
}

/**
 * Normalizes a value for structural comparison so the delta check is robust
 * to the known HA round-trip normalizations (key order, scalar type coercion):
 * - `undefined` and `""` are both "absent";
 * - numeric strings coerce to numbers (`"1"` ≡ `1`);
 * - `null` is distinct from absent.
 */
function normalizeForCompare(value: unknown): unknown {
  if (value === undefined) {
    return null; // absent
  }
  if (typeof value === "string" && value.trim() === "") {
    return null; // empty string ≡ absent
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed); // scalar type coercion
    }
    return value;
  }
  return value;
}

/**
 * Deep structural equality, robust to key order and scalar type coercion
 * (research R5 / R13). Used by the emit gate and the YAML self-echo /
 * external-change classification.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);

  if (na === nb) {
    return true;
  }
  if (typeof na === "number" && typeof nb === "number") {
    return na === nb;
  }
  if (na === null || nb === null) {
    return false; // one absent, the other present
  }
  if (typeof na !== "object" || typeof nb !== "object") {
    return false;
  }
  if (Array.isArray(na) !== Array.isArray(nb)) {
    return false;
  }
  if (Array.isArray(na)) {
    const arrA = na as unknown[];
    const arrB = nb as unknown[];
    if (arrA.length !== arrB.length) {
      return false;
    }
    return arrA.every((item, i) => deepEqual(item, arrB[i]));
  }
  const objA = na as ConfigRecord;
  const objB = nb as ConfigRecord;
  // A key is "present" only if its normalized value is not absent (null). This
  // makes `{ title: "" }` ≡ `{}` and `{ title: null }` ≡ `{}` — robust to the
  // HA round-trip where a cleared field may be dropped or kept as empty.
  const keysA = Object.keys(objA).filter(
    (k) => normalizeForCompare(objA[k]) !== null
  );
  const keysB = Object.keys(objB).filter(
    (k) => normalizeForCompare(objB[k]) !== null
  );
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(objB, key) &&
      deepEqual(objA[key], objB[key])
  );
}

/**
 * Emit gate (research R5, FR-908-N): `true` when the would-be emitted config
 * structurally differs from the last-emitted config. Reference identity alone
 * is NOT sufficient — a re-created but equal object yields `false` (no emit).
 */
export function hasConfigDelta(a: CardConfig, b: CardConfig): boolean {
  return !deepEqual(a, b);
}
