# Bug Assessment: Tooltip reference value inconsistent with panel; forecast value duplicated at today slot

- **Slug**: tooltip-reference-mismatch
- **Created**: 2026-11-02
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

The user reports two issues with the Energy Horizon card (YoY comparison, `show_forecast: true`):

1. **Panel vs. tooltip inconsistency** — the "DO DZIŚ" (up-to-today) panel shows:
   - Biżąca seria: 1580,39 kWh
   - Seria referencyjna: 1483,20 kWh
   - Różnica: +98,15 | 6,6%

   But the tooltip at the current day (29.10) shows:
   - Seria bieżąca: 1580,39 kWh
   - Seria referencyjna: 1556,42 kWh ← inconsistent; the difference no longer matches 6,6%.

   The user states the two surfaces must be consistent: the "up-to-today" cumulative in the panel and in the tooltip of the current (open) bucket on the chart.

2. **Forecast value in the tooltip at the today slot** — the tooltip at the current day also shows "Prognoza bieżącego okresu: 1580,35 kWh", which equals the current-series value. The user asks where it comes from and requests a UX fix: at the today slot, omit the forecast value (it duplicates the actual consumption and disorients the user); only the actual consumption and the reference period matter there. The forecast value should only be shown for future slots, where the current-consumption value is not shown.

Config:
```yaml
type: custom:energy-horizon-card
entity: sensor.boiler_total_meter
force_prefix: k
time_window:
  anchor: start_of_year
  duration: 1y
  step: 1y
  count: 2
comparison_preset: year_over_year
show_forecast: true
interpretation: consumption
neutral_threshold: 2
number_format: language
language: pl
```

## Symptom

The "up-to-today" reference cumulative in the panel (1483,20) differs from the reference value shown in the tooltip at the current-day slot (1556,42). The panel compares current (up to the last closed day) against reference (up to the same aligned day), but the tooltip at the open "today" bucket shows the reference value at that bucket (one day further), producing an asymmetric comparison. Additionally, the tooltip at the today slot renders the forecast row, whose value equals the current-series value (both are the carry-forward cumulative), causing user confusion.

## Reproduction

1. Configure the card with `comparison_preset: year_over_year`, `show_forecast: true`, and a daily aggregation (e.g. `time_window: { anchor: start_of_year, duration: 1y, step: 1y, count: 2 }`).
2. Load the card on a day where the current year is partially complete (e.g. 29.10).
3. Read the "DO DZIŚ" panel: it shows current and reference cumulative values up to the last closed day (28.10), plus a difference and percentage.
4. Hover the "today" slot (29.10) on the chart: the tooltip shows the current series (carry-forward), the reference series (at 29.10 of the reference year — one day further than the panel), and the forecast series (equal to the current series).
5. Observe that the tooltip reference value (1556,42) differs from the panel (1483,20), and that the forecast row duplicates the current value.

## Suspected Code Paths

- `src/card/ha-api.ts` — `referenceCumulativeAtAlignedCurrentEnd()` computes the panel's reference cumulative at the **last closed current day** (aligned). This is the "correct" value (1483,20).
- `src/card/ha-api.ts` — `computeSummary()` uses `referenceCumulativeAtAlignedCurrentEnd` for the panel.
- `src/card/echarts-renderer.ts` — `alignSeriesOnTimeline()` aligns the reference series to the shared timeline; at the today slot the reference value is the cumulative at that slot (1556,42), not the panel-consistent value.
- `src/card/echarts-renderer.ts` — `buildOption()` → tooltip `formatter` renders the current / reference / forecast rows at the hovered slot using the raw aligned values, so at the today slot the reference value is inconsistent with the panel and the forecast row duplicates the current value.
- `src/card/echarts-renderer.ts` — `buildOption()` → forecast series is defined as `[[todaySlotIndex, todayCurrentY], [lastSlot, forecastTotal]]`, so at the today slot the forecast value equals `todayCurrentY` (the current cumulative).

## Root Cause Hypothesis

**Confidence: high.**

The current series has **no real data point for the open "today" bucket**. Home Assistant LTS does not return a partial day for `period: "day"` (the day is not yet closed), so the daily query ends at the last closed day (e.g. 28.10). The renderer then fills the today slot via carry-forward (FR-900-G), repeating the last known cumulative (1580,39). The reference series, however, is for a complete past year and **does** have a full-day point for the today slot (29.10 of the reference year = 1556,42).

The panel's "up-to-today" reference value comes from `referenceCumulativeAtAlignedCurrentEnd`, which aligns the reference to the **last closed current day** (28.10 → 1483,20), so the panel is internally consistent (both series up to 28.10). The tooltip at the today slot instead shows the reference value **at that slot** (29.10 → 1556,42), one day further than the panel — hence the panel/tooltip mismatch.

The forecast row at the today slot equals the current value because the forecast line's first point is `[todaySlotIndex, todayCurrentY]`; at that start point the forecast value is exactly the current cumulative.

The user initially considered fetching hourly data for the open day ("up to and including today"), but **retracted that on 2026-11-02** and chose the semantics **"up to the last full (closed) day"** for both the panel and the tooltip. The fix is therefore a display/consistency fix, not a data-pipeline change.

## Proposed Remediation

**Preferred (Option A+ — "up to the last full day", tooltip + delta-segment fix)**:

1. **Problem 1 (panel/tooltip consistency)** — in the tooltip formatter (`buildOption` in `src/card/echarts-renderer.ts`), when the hovered slot is the today slot (`slotIndex === todaySlotIndex`), render the reference row using the **previous slot's** aligned value (`referenceValues[todaySlotIndex - 1]`) instead of the value at the today slot. This matches the panel's "up to the last closed day" semantics (both series up to the last full day). Fall back to the item's own value when the previous slot is out of bounds or null.

2. **Problem 2 (forecast duplication at today slot)** — in the same tooltip formatter, skip the forecast series when `slotIndex === todaySlotIndex` (do not emit the "Prognoza bieżącego okresu" row). For future slots (`slotIndex > todaySlotIndex`) the current series is null (no data beyond the open bucket), so only the reference and forecast rows appear — the desired behavior with no extra change.

3. **Delta-segment consistency (A+ addition)** — in `buildOption`, the "today" delta segment (the thick colored markLine between the two series at `todaySlotIndex`) currently uses `todayReferenceY = referenceValues[todaySlotIndex]`. Change its reference endpoint to the **previous slot's** value (`referenceValues[todaySlotIndex - 1]`) so the visual delta matches the panel (e.g. +98,15) instead of the raw one-day-further reference (≈24 kWh). The current endpoint stays `todayCurrentY` (carry-forward = last closed day). The **reference dot** (markPoint) stays on the reference line at `referenceValues[todaySlotIndex]` — moving it off the line would look worse. Fall back to `referenceValues[todaySlotIndex]` when the previous slot is out of bounds or null.

**Alternatives**:
- **Option A (superseded)**: tooltip-only fix (points 1–2 above) without the delta-segment change. The user upgraded to A+ on 2026-11-02 so the visual delta also matches the panel.
- **Option B (retracted)**: fetch hourly LTS data for the open day so both series show real "up to and including today" consumption. Larger change (two extra queries, DST/timezone alignment, carry-forward interaction). The user retracted this on 2026-11-02 in favor of Option A.
- Pass the panel-consistent reference value (from `computeSummary`) into `ChartRendererConfig` and use it verbatim in the tooltip at the today slot. More explicit, but requires a config-surface change and duplicates state already derivable from `referenceValues`.

**Files likely to change**:
- `src/card/echarts-renderer.ts` (tooltip `formatter` and the "today" delta-segment markLine inside `buildOption`)

**Tests to add or update**:
- Unit test for the tooltip formatter: at the today slot, the reference row equals the previous slot's aligned value (panel-consistent) and the forecast row is omitted.
- Unit test for the tooltip formatter: at a future slot, the forecast row is present and the current row is absent (null).
- Unit test for the tooltip formatter: fallback when the previous slot is out of bounds or null (the item's own value is used).
- Unit test for the delta segment: at the today slot, the delta markLine's reference endpoint equals the previous slot's aligned value (panel-consistent), while the reference dot stays at the today slot's value.
- Integration test: the panel's reference cumulative equals the tooltip's reference value at the today slot for a YoY window with an open current bucket.

## Risks & Considerations

- The change is localized to the tooltip formatter and the "today" delta-segment markLine in `buildOption`; it does not alter the panel, the data pipeline, the forecast line, or the reference line itself.
- Using `referenceValues[todaySlotIndex - 1]` assumes the previous slot has data; the fallback to the item's value (tooltip) / `referenceValues[todaySlotIndex]` (delta segment) preserves current behavior in edge cases (missing reference data).
- Omitting the forecast row at the today slot is a UX change; verify the legend and any tooltip-dependent UI do not assume the forecast series is always present in the tooltip.
- The dashed forecast line remains rendered on the chart; only its tooltip row is suppressed at the today slot.
- The chart's reference line still visually shows the full reference year (including the today slot); only the tooltip value and the delta segment at that slot are adjusted. The reference dot stays on the line. This is acceptable under the "up to the last full day" semantics, but worth noting in the fix summary.
- The delta segment now spans a slightly larger gap (current vs. last-closed-day reference) than before (current vs. today-slot reference); this is the intended panel-consistent behavior.

## Open Questions

- [NEEDS CLARIFICATION: should the "DO DZIŚ" panel caption be clarified (e.g. "do ostatniego pełnego dnia") to match the actual semantics, or is the current caption acceptable?]

## Decision Log

- 2026-11-02: User initially chose **Option B** (fetch hourly today data so the series shows real "up to and including today" consumption).
- 2026-11-02: User **retracted Option B** and chose **Option A** — semantics "up to the last full (closed) day" for both the panel and the tooltip; tooltip-only fix, no data-pipeline change.
- 2026-11-02: User upgraded to **Option A+** — in addition to the tooltip fix, the "today" delta segment also uses the previous slot's reference value so the visual delta matches the panel; the reference dot stays on the line.