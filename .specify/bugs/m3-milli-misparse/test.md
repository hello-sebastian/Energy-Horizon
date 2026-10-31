# Bug Verification: m³ parsed as milli prefix — 1500 m³ displays as "1.5 ³"

- **Slug**: m3-milli-misparse
- **Tested**: 2026-10-31
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original symptom no longer reproduces: `scaleSeriesValues([1500], 'm³', { force_prefix: 'auto' })` now returns `[1500]` with unit `m³` and factor 1 (previously `1.5` / `³`). The full regression suite (542 tests) and lint pass with no new failures.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | `TZ=UTC npx vitest run tests/unit/unit-scaler.test.ts -t "cubic meters"` | pass | Automated equivalent of the assessment's repro: exact input `1500 m³` + `auto` now yields `1500 m³` (factor 1), not `1.5 ³`. 2 passed. |
| New / updated tests | `TZ=UTC npx vitest run tests/unit/unit-scaler.test.ts` | pass | All 4 regression tests from the fix pass (m³ auto, m² auto, m³ + force_prefix k, bare m guard). 58 passed. |
| Regression suite | `npm test` | pass | 542 passed (542) across 53 files — no regressions from the change. |
| Lint / type-check | `npm run lint` | pass | ESLint clean, exit 0. |

## Output Excerpts

Reproduction (post-fix) — the exact reported input:
```
Test Files  1 passed (1)
     Tests  2 passed | 56 skipped (58)
```

Full regression suite:
```
Test Files  53 passed (53)
     Tests  542 passed (542)
```

Lint:
```
> eslint --config config/eslint.config.js "src/**/*.{ts,tsx,js,jsx}"
LINT_EXIT=0
```

## Residual Risks

- **Verification level**: The reproduction was exercised at the unit-logic level (the `scaleSeriesValues` function with the exact reported input), which is where the symptom is entirely produced. A live HA card render (entity → chart/tooltip) was **not** performed because no HA instance is available in this environment. The chart/tooltip simply render whatever the scaler returns, so the logic-level check covers the root cause, but an on-card visual confirmation was not done.
- **Out-of-scope follow-up**: Volume flow rate units `m³/h`, `m³/min`, `m³/s` still carry the same latent defect (leading `m` read as milli). They were intentionally excluded from this fix and remain unfixed — a separate bug/follow-up is recommended.
- **Encoding assumption**: The fix and tests use the superscript characters `m³` (U+00B3) / `m²` (U+00B2), confirmed to match HA core's `UnitOfVolume.CUBIC_METERS` / `UnitOfArea.SQUARE_METERS`. If a third-party integration ever emits a non-superscript variant (e.g. `m3`), it would not be covered.

## Recommendation

Close the bug — the reported symptom (`1500 m³` → `1.5 ³`) is resolved at the logic level, all new and existing tests pass, and lint is clean. Track the volume-flow-rate units (`m³/h`, `m³/min`, `m³/s`) as a separate follow-up, and optionally confirm the fix visually on a live HA card when convenient.
