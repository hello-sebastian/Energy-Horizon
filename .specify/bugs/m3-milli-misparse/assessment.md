# Bug Assessment: m³ parsed as milli prefix — 1500 m³ displays as "1.5 ³"

- **Slug**: m3-milli-misparse
- **Created**: 2026-10-31
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> With automatic scaling, an entity reporting 1500 m³ of consumption displays 1.5 ³. The unit parser mistakes the meter symbol for a milli prefix, changing both the consumption total and its unit.

## Symptom

An entity with `unit_of_measurement: "m³"` (cubic meters, e.g. gas or water consumption) and a value of 1500 is displayed as **1.5 ³** instead of **1500 m³**. The value is off by a factor of 1000 and the unit label is mangled (the `m` is stripped, leaving only the superscript `³`).

## Reproduction

1. Create an HA entity with `unit_of_measurement: "m³"` (e.g. a gas meter).
2. Give it a value of 1500 (or any value ≥ 1).
3. Add the Energy Horizon card with default `force_prefix: auto` (or omit `force_prefix`).
4. Observe the chart Y-axis, summary, and tooltip: they show **1.5 ³** instead of **1500 m³**.

No unknowns — the behavior is fully determined by the code path below.

## Suspected Code Paths

- `src/utils/unit-scaler.ts:129` — `NON_SCALABLE_UNITS` set. It contains `'m'` (meter, deliberately, to stop bare `m` being read as milli) but **not** `'m³'` or `'m²'`. This is the missing guard.
- `src/utils/unit-scaler.ts:150` — `parseUnit(rawUnit)`. For input `"m³"` the loop over `prefixKeys = ['G','M','k','m','u']` matches the leading `'m'`; the remainder `"³"` is non-empty and not in `NON_SCALABLE_UNITS`, so it returns `{ baseUnit: '³', existingPrefix: 'm', scalable: true }`.
- `src/utils/unit-scaler.ts:267` — `absoluteMaxInBase = absoluteMaxInSeries * inputFactor` → `1500 * 0.001 = 1.5`. The milli factor is wrongly applied.
- `src/utils/unit-scaler.ts:294` — `const unit = displayPrefix + parsed.baseUnit` → `'' + '³' = '³'`. The `m` is lost from the label.

## Root Cause Hypothesis

**Confidence: high.** `parseUnit` uses a "strip the leading SI-prefix character" heuristic. It is protected against the bare meter unit (`'m'` is in `NON_SCALABLE_UNITS`), but the protection does not extend to compound meter units. `"m³"` is not in the non-scalable set, so the leading `m` is consumed as the milli prefix and the superscript `³` is left as the "base unit". The milli factor (×0.001) is then applied to the value and the `m` is dropped from the label. The same latent defect affects `"m²"` (square meters) and any other unit that legitimately begins with the letter `m` followed by a non-prefix character.

## Proposed Remediation

**Preferred**: Add the compound meter units to `NON_SCALABLE_UNITS` in `src/utils/unit-scaler.ts` (line ~129), alongside the existing `'m'` entry:

```ts
'm',   // meter — not to be confused with milli
'm²',  // square meter — not to be confused with milli
'm³',  // cubic meter — not to be confused with milli
```

This is consistent with how the codebase already treats bare `'m'`: compound meter units are not SI-prefix-scalable, so they bypass scaling entirely (identity pass-through, `factor: 1`, unit preserved verbatim). It is a minimal, low-risk change that fixes the reported symptom and the `m²` variant in one place.

**Alternatives**:
- **Harden `parseUnit` to reject remainders that start with a digit or superscript** (e.g. `³`, `²`, `⁴`). This would catch the whole class of "unit begins with `m` + non-letter" cases (and similar future ones) rather than enumerating units. Trade-off: broader behavioral change to the parser, needs careful testing to avoid regressing legitimate prefixed units; more code than the set addition.
- **Whitelist approach**: only treat a leading character as a prefix when the remainder is a known base unit. Trade-off: requires maintaining a base-unit list; larger refactor.

**Files likely to change**:
- `src/utils/unit-scaler.ts` (add `'m²'`, `'m³'` to `NON_SCALABLE_UNITS`)
- `tests/unit/unit-scaler.test.ts` (add regression tests)

**Tests to add or update**:
- `scaleSeriesValues([1500], 'm³', { force_prefix: 'auto' })` → values `[1500]`, unit `'m³'`, prefix `''`, factor `1`.
- `scaleSeriesValues([25], 'm²', { force_prefix: 'auto' })` → values `[25]`, unit `'m²'`, prefix `''`, factor `1`.
- `scaleSeriesValues([1500], 'm³', { force_prefix: 'k' })` → still identity (force_prefix ignored on non-scalable unit), unit `'m³'`.
- Confirm existing `'m'` (meter) behavior is unchanged.

## Risks & Considerations

- **Display-only, no data loss**: the raw HA value is never mutated; only the on-card scaling/label is wrong. Workaround exists (`force_prefix: none`), which is why this is `high` rather than `critical`.
- **Blast radius**: any entity using `m³`/`m²` (gas, water, area) is affected in auto and manual prefix modes.
- **Consistency**: the fix must keep `m³`/`m²` non-scalable in *all* modes (auto, manual, none) — the set-based approach guarantees this because non-scalable units short-circuit before prefix selection.
- **No API break**: `NON_SCALABLE_UNITS` is internal; no public contract changes.
- **Superscript encoding**: ensure the test file and source use the same Unicode superscript characters (`²` U+00B2, `³` U+00B3) that HA actually emits in `unit_of_measurement`.

## Open Questions

- [NEEDS CLARIFICATION: Does HA emit `m³` with the superscript character (U+00B3) or as plain `m3` in `unit_of_measurement`? The fix targets the superscript form; if HA also emits `m3`, that variant should be verified/handled too.]
