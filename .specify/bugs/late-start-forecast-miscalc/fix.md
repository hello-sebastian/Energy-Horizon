# Bug Fix: Misscalculation when current usage starts later than reference

- **Slug**: late-start-forecast-miscalc
- **Fixed**: 2026-10-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The summary ("to this day" reference value, difference, percent) and the forecast were
aligning the reference series to the current series by the **first data point** of each
(`currentPoints[0].ts − refPoints[0].ts`). When the current period starts late (leading
zero/missing buckets, which `normalizePoints` drops), that offset drifts by the number of
leading empty days, understating the reference "to this day" value (inverting the
difference/percent) and inflating the forecast. The fix aligns both by the **window start**
(`alignStartsMs[0] − alignStartsMs[1]`), matching how the chart already aligns the curves.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/ha-api.ts` | modified | `referenceCumulativeAtAlignedCurrentEnd`, `computeSummary`, `computeForecast` now accept an optional `alignOffsetMs` (window-start offset) and use it when provided; otherwise fall back to the previous first-point offset (keeps existing tests green). |
| `src/card/cumulative-comparison-chart.ts` | modified | Computes `alignOffsetMs = alignStartsMs[0] − alignStartsMs[1]` (when `windows.length > 1`) and passes it to `computeSummary` and `computeForecast`. |
| `tests/unit/ha-api.test.ts` | added test | Two late-start regression tests pinning the window-start alignment for `computeSummary` and `computeForecast`. |

## Diff Highlights (optional)

`src/card/ha-api.ts` — `referenceCumulativeAtAlignedCurrentEnd`:
```ts
export function referenceCumulativeAtAlignedCurrentEnd(
  currentPoints: TimeSeriesPoint[],
  refPoints: TimeSeriesPoint[],
  alignOffsetMs?: number
): number | undefined {
  ...
  // Prefer the window-start offset when provided: it is correct even when the current
  // series starts late (leading zero/missing buckets), whereas the first-point offset
  // drifts by the number of leading empty buckets.
  const periodAlignMs =
    typeof alignOffsetMs === "number" && Number.isFinite(alignOffsetMs)
      ? alignOffsetMs
      : currentPoints[0]!.timestamp - refPoints[0]!.timestamp;
```

`src/card/cumulative-comparison-chart.ts` — call site:
```ts
const alignOffsetMs =
  windows.length > 1
    ? chartTimeRaw.alignStartsMs[0]! - chartTimeRaw.alignStartsMs[1]!
    : undefined;

const summary = computeSummary(scaledSeries, alignOffsetMs);
const forecast = computeForecast(
  scaledSeries,
  chartTimeRaw.forecastPeriodBuckets,
  alignOffsetMs
);
```

## Tests Added or Updated

- `tests/unit/ha-api.test.ts` › `computeSummary` › "late-start current: reference 'to this day' aligns by window start (alignOffsetMs)" — pins that with a 13-day-late current series the reference "to this day" is read at the correct calendar day (cumulative 25, difference −13, −52%) and that the no-offset path reproduces the bug (reference 12).
- `tests/unit/ha-api.test.ts` › `computeForecast` › "late-start current: forecast aligns by window start (alignOffsetMs), not first data point" — pins that the forecast uses the window-start split (≈14.21, medium confidence, no anomaly) and that the no-offset path inflates it (31).

## Local Verification

- Commands run:
  - `npx vitest run tests/unit/ha-api.test.ts tests/unit/aggregation.test.ts` → 45 passed (45), including the 2 new regression tests.
  - `npx vitest run` (full suite) → 552 passed, 2 failed. The 2 failures are in `tests/unit/time-windows-presets-golden.test.ts` (`buildComparisonPeriod` legacy preset boundaries, a 1-hour timezone/DST offset) and are **pre-existing** — confirmed by `git stash` + re-run, which fails identically without my changes. Unrelated to this fix.
- Type check: no errors in `ha-api.ts`, `cumulative-comparison-chart.ts`, or `ha-api.test.ts`.
- Manual checks: traced the user's exact data (current: 14 zero days then ramp to 67.62; reference: full month to 147.24). With the window-start offset the reference "to this day" is read at the correct calendar day, so the difference/percent no longer inverts and the forecast is no longer inflated.

## Deviations from Assessment

None. The fix follows the assessment's preferred remediation (align by window start via
`alignStartsMs`) exactly. The `alignOffsetMs` parameter is optional with a first-point
fallback so the existing unit tests (which build synthetic series without window starts)
continue to pass unchanged.

## Follow-ups

- The pre-existing `time-windows-presets-golden.test.ts` failures (1-hour offset in
  `buildComparisonPeriod` legacy boundaries) are a separate timezone/DST issue and should be
  triaged independently.
- Consider whether `normalizePoints` should retain zero-consumption buckets (change the
  `delta <= 0` skip to `delta < 0`) so the current series' first point coincides with the
  window start — a broader behavior change that would also affect forecast confidence and the
  chart's leading segment. Not required for this fix.
- Optionally document the late-start behavior in the wiki (Forecast-and-Data-Internals /
  Troubleshooting) once the fix is released.
