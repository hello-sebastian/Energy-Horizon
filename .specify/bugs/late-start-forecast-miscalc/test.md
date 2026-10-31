# Bug Test Report: late-start-forecast-miscalc

- **Slug**: `late-start-forecast-miscalc`
- **Tested**: 2026-07-10
- **Assessment**: `.specify/bugs/late-start-forecast-miscalc/assessment.md`
- **Fix**: `.specify/bugs/late-start-forecast-miscalc/fix.md`
- **Result**: `verified`

## Summary

The fix aligns the summary ("reference to this day") and the forecast to the
reference window by **window start** (`alignStartsMs[0] - alignStartsMs[1]`)
instead of by the first data point of each series. Two regression tests were
added that reproduce the exact reported scenario (current period starting 13
days late, 1 kWh/day in both periods) and assert the correct values:

- `computeSummary`: reference cumulative = 25 (not 12), difference = -13,
  differencePercent ≈ -52% (not +14.9%).
- `computeForecast`: forecast_total ≈ 14.21 (not 31), split at reference day 24
  (not day 11), confidence `medium`, no false anomaly.

Both tests fail on the pre-fix code path (verified by computing the buggy
values in-test) and pass with the fix. The full suite passes under the
project's canonical `TZ=UTC` environment, and lint is clean. The user
additionally deployed the build to their Home Assistant instance and confirmed
the card now shows correct values for the real sensor that triggered the bug.

## Checks Performed

| Check | Command | Result |
|-------|---------|--------|
| Regression tests (targeted) | `npx vitest run tests/unit/ha-api.test.ts tests/unit/aggregation.test.ts` | PASS — 45/45 |
| Full test suite (canonical TZ) | `npm test` (`TZ=UTC vitest run`) | PASS — 554/554, 53 files |
| Lint | `npm run lint` | PASS — no findings |
| Manual reproduction (user) | Deployed build on real HA instance with the original sensor | PASS — user confirmed values now correct ("na oko działa") |

## Output Excerpts

```
# npx vitest run tests/unit/ha-api.test.ts tests/unit/aggregation.test.ts
 Test Files  2 passed (2)
      Tests  45 passed (45)

# npm test (TZ=UTC vitest run)
 Test Files  53 passed (53)
      Tests  554 passed (554)

# npm run lint
(no output — clean)
```

## Residual Risks

- The `alignOffsetMs` parameter is optional and falls back to the old
  first-point offset when not provided. `computeSummary`/`computeForecast`
  are only called from `cumulative-comparison-chart.ts`, which now always
  passes the window-start offset when more than one window is present, so the
  fallback only affects single-window calls (where the offset is irrelevant).
- The `normalizePoints` sum-delta branch still drops leading zero-consumption
  days from the *chart* data. This is intentional (the chart aligns by window
  start via `alignStartsMs`), but if a future feature derives per-day values
  from `series.points` assuming day-0 = window start, it will see the same
  class of misalignment. Worth a comment or a follow-up spec if that happens.
- The 2 `time-windows-presets-golden` failures seen when running vitest
  without `TZ=UTC` are pre-existing and environment-dependent (local TZ), not
  caused by this fix — they pass under the project's canonical `TZ=UTC`
  command.

## Recommendation

`verified` — ship it. All automated checks pass under the project's canonical
environment, the regression tests pin the exact reported scenario, and the
user confirmed the fix on the live instance that originally exhibited the bug.
