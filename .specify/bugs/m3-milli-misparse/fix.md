# Bug Fix: m³ parsed as milli prefix — 1500 m³ displays as "1.5 ³"

- **Slug**: m3-milli-misparse
- **Fixed**: 2026-10-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Added the compound meter units `m²` and `m³` to the `NON_SCALABLE_UNITS` set in `src/utils/unit-scaler.ts`, so the leading `m` is no longer consumed as a milli prefix. Cubic/square meter entities now pass through unscaled with their unit label intact (1500 m³ stays 1500 m³).

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/utils/unit-scaler.ts` | modified | Added `'m²'` and `'m³'` to `NON_SCALABLE_UNITS`; extended the explanatory comment to cover the compound meter units. |
| `tests/unit/unit-scaler.test.ts` | added tests | 4 regression tests pinning `m³`/`m²` identity behavior (auto + forced prefix) and confirming bare `m` is still non-scalable. |

## Diff Highlights (optional)

```ts
// src/utils/unit-scaler.ts — NON_SCALABLE_UNITS
  'bar', 'Pa', 'hPa', 'kPa', 'mbar',
  'm', // meter — not to be confused with milli
  'm²', // square meter — not to be confused with milli
  'm³', // cubic meter — not to be confused with milli
  'Hz', 'kHz', 'MHz', 'GHz',
```

```ts
// tests/unit/unit-scaler.test.ts — new regression test (representative)
it('should not scale cubic meters m³ (meter base, not milli prefix)', () => {
  const result = scaleSeriesValues([1500], 'm³', { force_prefix: 'auto' });
  expect(result.values).toEqual([1500]);
  expect(result.unit).toBe('m³');
  expect(result.prefix).toBe('');
  expect(result.factor).toBe(1);
});
```

## Tests Added or Updated

- `tests/unit/unit-scaler.test.ts` › `should not scale cubic meters m³ (meter base, not milli prefix)` — pins `1500 m³` → `[1500]`, unit `m³`, factor 1 (the exact reported symptom).
- `tests/unit/unit-scaler.test.ts` › `should not scale square meters m² (meter base, not milli prefix)` — pins the `m²` variant.
- `tests/unit/unit-scaler.test.ts` › `should ignore force_prefix on cubic meters m³` — pins that manual `force_prefix: k` is also ignored for `m³` (non-scalable short-circuits before prefix selection).
- `tests/unit/unit-scaler.test.ts` › `should still treat bare meter m as non-scalable` — guards the pre-existing `'m'` behavior against regression.

## Local Verification

- Commands run: `TZ=UTC npx vitest run tests/unit/unit-scaler.test.ts` → 58 passed (58), including the 4 new tests.
- Commands run: `npm test` → 542 passed (542) across 53 files — no regressions.
- Commands run: `npm run lint` → clean (no errors).
- Manual checks: Confirmed against HA core `homeassistant/const.py` that `UnitOfVolume.CUBIC_METERS = "m³"` and `UnitOfArea.SQUARE_METERS = "m²"` use the superscript characters (U+00B3 / U+00B2), matching the strings added to the set. This resolves the assessment's open question (HA emits superscript, not plain `m3`).

## Deviations from Assessment

None. The fix matches the assessment's preferred remediation exactly (set-based addition of `m²`/`m³`). Scope was kept minimal per the assessment; the related volume-flow-rate units (`m³/h`, `m³/min`, `m³/s`) were intentionally left out of this change and are tracked as a follow-up.

## Follow-ups

- **Volume flow rate units**: `m³/h`, `m³/min`, `m³/s` (HA `UnitOfVolumeFlowRate`) share the same latent defect — the leading `m` is read as milli, yielding e.g. `1500 m³/h` → `1.5 ³/h`. Consider a follow-up bug (or extending this fix) to add these to `NON_SCALABLE_UNITS`, or to harden `parseUnit` to reject remainders that begin with a superscript/digit.
- **Documentation**: If the wiki/spec (domain 906) enumerates excluded units, add `m²`/`m³` to the "Excluded units" list for consistency.
