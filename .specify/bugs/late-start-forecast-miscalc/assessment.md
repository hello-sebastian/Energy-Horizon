# Bug Assessment: Misscalculation when current usage starts later than reference

- **Slug**: late-start-forecast-miscalc
- **Created**: 2026-10-31
- **Source**: pasted text (+ browser per-window API dump + screenshot)
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

User reports two related symptoms on a card configured with `comparison_preset: custom`,
`time_window: { anchor: start_of_month, duration: 1M, step: 1y, count: 2 }`,
`aggregation: day`, `interpretation: consumption`, `neutral_threshold: 2`:

1. **Inflated forecast** — the forecasted month-end value (170.14 kWh) is far higher than
   what the current month's consumption to date (67.62 kWh) would suggest.
2. **Inverted interpretation** — although the chart and the cumulative value show the current
   period's consumption (~67.62 kWh) is about *half* of the reference series, the delta chip /
   narrative says the current period is **14.9% higher** than the reference (+8.79 kWh | +14.9%).

The current period (Oct 2026) has **no consumption for the first ~14 days** (meter reads 0 from
Oct 1 to Oct 14), then starts accumulating from Oct 15. The reference period (Oct 2025) has
consumption from day 1.

Browser per-window API dump confirms:
- Window 0 (current, Oct 2026): 26 daily buckets; buckets 0–13 have `state: 0`, then
  1.31, 6.48, 14.54, …, 67.62.
- Window 1 (reference, Oct 2025): 31 daily buckets; 2.1, 9.87, 16.83, …, 147.24.

## Symptom

When the current period's data starts later than the reference period's (leading zero/missing
buckets), the card computes the reference "to this day" value and the forecast using an
alignment offset derived from the **first data point** of each series rather than the
**window/calendar start**. The late start shifts this offset, so the reference "to this day" is
read from an earlier calendar day (understated), producing a wrong (inverted) difference/percent
and an inflated forecast.

## Reproduction

1. Configure a card with `comparison_preset: custom`,
   `time_window: { anchor: start_of_month, duration: 1M, step: 1y, count: 2 }`,
   `aggregation: day`.
2. Use a `total_increasing` sensor whose current month has **no readings (or zero delta) for the
   first N days** but has readings in the reference month from day 1.
3. Open the card. Observe:
   - The reference "TO THIS DAY" value is lower than the reference cumulative at the same
     calendar day.
   - The delta chip / narrative shows the current period as *higher* than the reference even
     though the current cumulative is well below the reference curve.
   - The forecast total is inflated relative to the current run-rate.

[NEEDS CLARIFICATION: exact sensor `state_class` — assumed `total_increasing` (LTS `sum`
present) from the "total_meter" name and the cumulative-looking values.]

## Suspected Code Paths

- `src/card/ha-api.ts:559` — `referenceCumulativeAtAlignedCurrentEnd()` computes
  `periodAlignMs = currentPoints[0].timestamp - refPoints[0].timestamp` (line 566). Aligns by
  **first data point**, not window start.
- `src/card/ha-api.ts:583` — `computeSummary()` calls the above to get `reference_cumulative`,
  then computes `difference` and `differencePercent` (lines 599–603).
- `src/card/ha-api.ts:623` — `computeForecast()` computes its own
  `periodAlignMs = currentPoints[0].timestamp - referencePoints[0].timestamp` (line 668) and uses
  it to find `splitIdx` (the reference split point), then `trend = A/B` and
  `forecast_total = A + C*trend`.
- `src/card/ha-api.ts:475` — `normalizePoints()` sum-delta branch skips buckets where
  `delta <= 0` (line 481), dropping legitimate zero-consumption days so the current series' first
  point is at the first *non-zero* day, not the window start.
- `src/card/cumulative-comparison-chart.ts:414` — call sites `computeSummary(scaledSeries)` and
  `computeForecast(scaledSeries, chartTimeRaw.forecastPeriodBuckets)`; `chartTimeRaw.alignStartsMs`
  (the correct window starts) is available here but not passed in.

## Root Cause Hypothesis

**Confidence: high.** Both `referenceCumulativeAtAlignedCurrentEnd` and `computeForecast` derive
the reference→current alignment offset from the **first data point** of each series
(`currentPoints[0].timestamp - refPoints[0].timestamp`). When the current series has a late start
(leading zero/missing buckets, which `normalizePoints` drops because it skips `delta <= 0`),
`currentPoints[0]` is at the first non-zero day (e.g. Oct 14) while `refPoints[0]` is at the
window start (Oct 1). The offset is therefore too large by the number of leading empty days
(13 days in this case). Downstream:

- The reference "to this day" is looked up 13 days *early* in the reference (Oct 12/13 instead of
  Oct 25/26), understating it (58.83 instead of ~120). Current (67.62) then appears *higher* →
  inverted +14.9% chip.
- The forecast's `splitIdx`/`B`/`C`/`trend` are all computed on the misaligned split, so
  `trend = A/B` compares the current's real ~11 usage-days against the reference's first ~11
  days, inflating `forecast_total` (170.14 vs a correct ~85).

The chart itself aligns correctly by window start (`alignStartsMs`), which is why the *visual*
curves look right while the *numbers* (summary, forecast, interpretation) are wrong.

## Proposed Remediation

**Preferred**: Align the summary and forecast by the **window start** (calendar anchor), not the
first data point. Pass the window starts (or the resulting offset
`currentWindowStart - referenceWindowStart`) from the call site
(`cumulative-comparison-chart.ts`, where `chartTimeRaw.alignStartsMs` is already available) into
`computeSummary`/`referenceCumulativeAtAlignedCurrentEnd` and `computeForecast`, and use that
offset in place of `currentPoints[0].timestamp - refPoints[0].timestamp`. This makes the numeric
pipeline consistent with the chart's existing window-start alignment and is independent of where
the data actually begins.

**Alternatives**:
- Keep zero-consumption buckets in `normalizePoints` (change the `delta <= 0` skip to
  `delta < 0` so only true counter resets are dropped). This makes `currentPoints[0]` coincide
  with the window start and fixes the alignment at the source, but it changes the series shape
  (adds leading zero points), which shifts `completedBuckets`/forecast confidence and the chart's
  leading segment — a broader behavior change than the surgical alignment fix.
- (Not recommended) Clamp/flag the forecast when the current series starts late, without fixing
  the alignment — masks the symptom but leaves the summary/interpretation wrong.

**Files likely to change**:
- `src/card/ha-api.ts`
- `src/card/cumulative-comparison-chart.ts`
- `tests/unit/ha-api.test.ts`

**Tests to add or update**:
- `referenceCumulativeAtAlignedCurrentEnd` / `computeSummary` with a late-start current series
  (leading empty buckets) → assert the reference "to this day" is read at the correct calendar day
  and the difference/percent match a hand-computed value.
- `computeForecast` with a late-start current series → assert `forecast_total` is not inflated
  (within a sane band of the current run-rate) and the split point is at the correct calendar day.
- A regression test encoding the exact scenario from the report (current: 14 zero days then ramp
  to 67.62; reference: full month to 147.24) asserting the chip is *lower*, not *higher*.

## Risks & Considerations

- Changing `computeSummary`/`computeForecast` signatures touches a shared numeric pipeline; all
  call sites and existing unit tests must be updated to keep passing.
- If the "keep zeros" alternative is chosen, forecast confidence and the chart's leading segment
  change for *all* late-start cases, not just the misaligned ones — needs careful review.
- The off-by-one in `normalizePoints` delta timestamping (a delta is stamped at the *previous*
  bucket start) is a separate pre-existing quirk; it does not cause this bug but should not be
  "fixed" as a side effect without its own analysis.
- Ensure the fix also holds for `week`/`month` aggregations and for the single-window /
  no-reference cases (guards already return `disabled`/`undefined`).

## Open Questions

- [NEEDS CLARIFICATION: confirm the sensor's `state_class` is `total_increasing` (LTS `sum`
  present). If it were `measurement` (mean/min/max), the `normalizePoints` path differs and the
  analysis would need re-checking.]
- [NEEDS CLARIFICATION: is the leading-zero period a genuine "device off" period, or a
  sensor/recorder gap? Both produce the same symptom, but a recorder gap might warrant a distinct
  "insufficient data" treatment rather than a zero.]
