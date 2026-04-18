# Golden scenarios: unified time windows & axis (006)

**Purpose**: Traceable matrix between YAML/presets, resolved windows, `buildChartTimeline`, and Vitest. **SC-1** parity for preset users; **FR-C** / **FR-D** invariants for multi-window.

## Invariants (all multi-window rows)

| ID | Rule | Check |
|----|------|--------|
| I1 | **FR-C** — Longest-window axis span | For `N ≥ 2`, `timeline.length` = max per-window nominal slot count at `windows[0].aggregation` |
| I2 | **FR-D** — Forecast denominator | `forecastPeriodBuckets` = `countBucketsForWindow(windows[0], timeZone)`, not `timeline.length` when they differ |
| I3 | **FR-H** | Resolve, slots, and tests use the same IANA `time_zone` as HA (no browser-local drift) |
| I4 | Shorter series | Values only within each window’s nominal span on the shared axis; nulls after |

## Scenario matrix

| Row | Preset / YAML sketch | N | primaryAgg | Note |
|-----|----------------------|---|------------|------|
| G1 | `year_over_year` default | 2 | day | YoY — boundaries match `buildComparisonPeriod` + `resolveTimeWindows` |
| G2 | `month_over_year` default | 2 | day | MoY |
| G3 | `month_over_month` default | 2 | day | Two consecutive calendar months |
| G4 | Generic multi-window (count≥3) | ≥3 | day | `timeline.length` = max slots; `forecastPeriodBuckets` from window 0 |
| **G5** | **Two calendar months, day grain (unequal length)** | **2** | **day** | **Current = shorter month (e.g. Feb leap), reference = longer month (e.g. Mar). Same `time_zone`. Expect `timeline.length` = **31** (max of 29 and 31), `forecastPeriodBuckets` = **29** (window 0 only). **`timeline` ms**: prefix = Feb 1…Feb 29 (window 0); tail indices 29–30 = Mar 1, Mar 2 (ordinal continuation). Reference series ends at index 30; current has no points in tail indices ≥ 29. |
| **G6** | **YoY / MoY (different start years)** | **2** | **day** | Window 0 and 1 start in different years → default axis/tooltip omit calendar **year** on adaptive formatting; captions carry year disambiguation (**SC-LABEL-1**). |
| **G7** | **MoM (same year, different months)** | **2** | **day** | Window starts differ by month, same year → default axis/tooltip **day-of-month only** for `day` aggregation (**SC-LABEL-1**). **Example (30 vs 31 days):** current = April, reference = March → `timeline.length` = **31**; slots **0–29** = April 1…30 (prefix); slot **30** = ordinal tail (calendar “May 1” at daily grain). Tooltip header for column *i* must match **`timeline[i]`** (same slot semantics as the axis), including the tail. |
| **G8** | **“Now” with longer reference** | **2** | **day** | Partial current + full reference (nominal FR-C longer axis): vertical “now” index = bucket of today **inside window 0** in HA TZ, not last slot of reference calendar (**SC-NOW-1**). Covered by `findNowSlotIndexOnComparisonAxis` + renderer wiring. |
| **G9** | **MoY / any preset + `aggregation: day`, LTS `sum`** | **2** | **day** | After `mapLtsResponseToCumulativeSeries`, the **first** point’s `timestamp` MUST equal **`buildTimelineSlots(window0.start, …, "day", HA_TZ)[0]`** (same ms as first axis slot). Prevents “series starts on day 2” when ticks show day 1. |
| **G10** | **Adaptive axis — “now” on first or last tick** | **1+** | **day** (typ.) | When the “now” slot index equals **0** or **last** on the adaptive three-tick axis, the implementation MUST stack the **edge** calendar line and a short **“now”** caption on two lines and reserve vertical space (**SC-AXIS-NOW-EDGE-1**). See `tests/unit/echarts-renderer.test.ts` (“X-axis: now label stacks below edge when colliding”). |

## SC-4 — Reader checklist (wiki / YAML mental model)

After updating `wiki-publish/Mental-Model-Comparisons-and-Timelines.md`, confirm:

- [ ] A reader can configure “this month vs previous month” from YAML without reading `src/` paths.
- [ ] MoY and YoY are described with the same axis rules as this doc (**FR-C**, **FR-D**, tail labeling **FR-B**).
- [ ] Links from this file point at the updated wiki pages.

## Test mapping

| Row | Primary test file |
|-----|-------------------|
| G1–G3 | `tests/unit/time-windows-presets-golden.test.ts` |
| G4 | `tests/unit/ha-api.test.ts` (N≥3 timeline) |
| **G5** | **`tests/unit/ha-api.test.ts` (N=2 unequal month lengths + prefix/tail ms + now index)** |
| G6–G7 | `tests/unit/comparison-label-hints.test.ts` + `tests/unit/axis-label-format.test.ts` / `tests/unit/tooltip-format.test.ts` |
| G8 | `tests/unit/ha-api.test.ts` (`findNowSlotIndexOnComparisonAxis`) + `src/card/echarts-renderer.ts` |
| G7 tooltip parity | `tests/unit/echarts-renderer.test.ts` (`resolveTimelineSlotIndexFromAxisParams`, axis tooltip formatter) + `tests/unit/tooltip-format.test.ts` / `tests/unit/axis-label-format.test.ts` (FR-H `Intl.timeZone`) |
| **G9** | **`tests/unit/ha-api.test.ts`** (`mapLtsResponseToSeries` timestamps + `places sum-delta timestamps on period start…`) |
| **G10** | **`tests/unit/echarts-renderer.test.ts`** (describe “X-axis: now label stacks below edge when colliding”) |
