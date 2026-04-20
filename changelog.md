# Changelog

All notable changes to **Energy Horizon Card** (Home Assistant Lovelace / HACS) are documented in this file.



## [1.0.2]

### Added
- French language fr.json (by [joebar38](https://github.com/joebar38))

### Fixed

- **LTS measurement buckets (#45):** charts could stay **blank** when Home Assistant returned only **`mean` / `min` / `max`** (no `sum`, `change`, or `state`)—typical for `state_class: measurement` entities such as a **template sensor** summing cumulative sources without `state_class: total_increasing`. The card now derives a per-bucket increment from **`max - min`** when those three fields are absent, and skips buckets with a negative range. For true cumulative meters, prefer declaring **`total_increasing`** in HA so LTS exposes **`sum`**. (by [lukpep](https://github.com/lukpep))
- **Chart grid height consistency:** The chart plot area now maintains a stable, identical height across all axis modes (adaptive rich / standard) and “today” positions. `containLabel: false` with an always-fixed `grid.bottom = GRID_BOTTOM_PX` (38 px) eliminates the ~20 px height drift that occurred when `grid.bottom` switched between `0` and `42` depending on whether “today” was in range. The axis-tick-to-label gap (`AXIS_TICK_LABEL_GAP_PX`) is reduced from 8 → 4 px, tightening the visible bottom margin. Y-axis label space is now an explicit `GRID_LEFT_PX = 56 px` constant instead of relying on ECharts `containLabel` auto-expansion. All grid layout values are exported constants in `src/card/axis/x-axis-rich-styles.ts` and `src/card/echarts-renderer.ts`.
- **Adaptive X-axis — “now” tick label:** The highlighted tick for the current instant always uses a **two-line** layout so the substantive label (adaptive date/time) sits **below** other tick captions. The short localized **“Now”** line and collision-only branching are **removed**; spacing uses one **full** two-line budget whenever “now” is shown (`src/card/axis/x-axis-rich-styles.ts`, `src/card/echarts-renderer.ts`).


## [1.0.1-beta]

### Added

- **Figma-aligned card chrome:** When the card **title** is enabled, a **subtitle** shows the **`entity_id`** so the YAML-friendly id is visible next to the friendly name; when the title is **disabled**, both title lines are hidden (including `entity_id`). **Entity icon** sits in a **fixed-size** header container using Home Assistant’s **`ha-icon` / `ha-state-icon`** (no raster assets from the design file).
- **Figma-aligned comparison panel (*Data series info*):** **Two-column** layout (**Current** / **Reference**) with **period captions**, cumulative values for the comparison story (“to today”), and a **single delta chip** combining absolute difference and percent — colors follow the **HA theme**, not hard-coded Figma hex. The chip stays **visible** for zero and for missing data (**`---`** / **`-- %`**) with unit suffixes aligned to the card formatter.
- **Figma-aligned Forecast | Total panel (*Surface Container*):** With forecast **on**, **Forecast** describes the **full current period** and **Total** is the **full reference window** from long-term statistics (not the same as “to today” in the first panel). With **`show_forecast: false`**, the **entire** second panel is removed (unchanged from 0.4.x semantics).
- **Figma-aligned narrative & warnings:** **Narrative summary** (`textSummary`) in a row with a **trend icon** (higher / lower / similar vs reference) aligned with chart delta semantics. **Warnings** (e.g. incomplete reference) appear in a **dedicated bottom section** only — the full warning text is **not** duplicated inside the summary block.
- **Figma-aligned chart:** **Vertical “today”** line spans the full plot height; **delta segment** between current and reference at the **current aggregation** step; refreshed **reference-series** point styling. When the **current series is hidden**, X-axis tick **count and spacing** stay in line with the last release **before** the Figma UI (no forced “three labels” rule).
- **Layout visibility toggles** (YAML + Lovelace visual editor): **`show_comparison_summary`** (comparison panel), **`show_forecast_total_panel`** (Forecast | Total block), and **`show_narrative_comment`** (narrative row). Each defaults to **on** when omitted or any value other than **`false`**.
- With forecast **on**, **`show_forecast_total_panel: false`** hides only the Forecast | Total **panel** while keeping dashed **forecast line** behavior driven by **`show_forecast`**. **`show_forecast: false`** still removes the whole second panel.

### Changed

- **Period captions** in the comparison panel use a single **compact** formatter (`formatCompactPeriodCaption`): short month names, **Home Assistant time zone**, optional **`time_format`** for hourly windows, and compressed ranges (e.g. a full calendar month → `Mar 2026`).
- **Unified multi-window chart axis:** For **two or more** windows, **`buildChartTimeline`** uses **one** rule — axis length is the **maximum nominal bucket count** at window 0’s aggregation (**Longest-window axis span**), not a separate YoY/MoY legacy path. **Forecast** still uses **`forecastPeriodBuckets`** from **window 0** only when that differs from axis length.
- **`timeline[]` construction:** Built from **window 0’s** slot starts, then an **ordinal tail** to reach the longest span — **not** from the longest window’s calendar alone. Fixes wrong month/year on the X-axis and the **“now”** marker jumping to the **last day of the reference** period (MoM / YoY / MoY).
- **Tail axis labels:** X-axis ticks **past** the current window’s nominal end use **compact date-style** tail formatting. **FR-G carry-forward** fills the current cumulative at the **“today”** slot when LTS has not closed that bucket yet (**day** / **week** / **month** where supported), using **window 0** boundaries and HA **`time_zone`** consistently with the marker.
- **Default comparison labels:** Adaptive X-axis and tooltip headers **omit redundant years** when the two windows start in different years, and use **day-of-month only** for **daily** aggregation when the year matches but start **months** differ (MoM). **`x_axis_format`** / **`tooltip_format`** still override this matrix.
- **Intl time zone:** Default **Intl**-based axis and tooltip calendar strings use **`timeZone`** = **Home Assistant instance** zone instead of the browser default.

### Fixed

- **LTS `sum` vs chart slots:** Increments from consecutive **`sum`** values are timestamped at the **start of the bucket** they belong to (**previous row’s `start`**), so the first visible point aligns with the **first axis tick** for **`aggregation: day`** / **`hour`** (e.g. month-over-year no longer looks shifted by one day or hour). ECharts slot matching uses the **next timeline timestamp** as the slot end when available (same idea as the historical Chart.js path), improving **DST**-length days.
- **Chart tooltip vs X-axis:** Tooltip date headers resolve the **same timeline slot** as the axis (`axisValue` / current or reference series X), so sparse series such as the **two-point forecast line** no longer shift the header by one day or drop the tail column label.
- **FR-G carry-forward:** The “now” slot used to fill missing LTS buckets matches **window 0** bucket boundaries with HA **`time_zone`**, consistent with the **“now”** marker.
- **Comparison panel — current period caption:** For presets with **`currentEndIsNow`**, the **current** window caption shows the **full nominal** month/year again (`expandCurrentWindowForCaption`), not a partial range to today (e.g. **`Apr 2026`** vs **`1 Apr – 12 Apr 2026`**).

### Documentation

- Cross-linked specs and wiki mental model with the unified axis + forecast rules (`specs/006-time-windows-unify/`, `wiki-publish/Mental-Model-Comparisons-and-Timelines.md`).
- Updated **`README.md`**, **`README.advanced.md`**, **`wiki-publish/Luxon-Formats-Reference.md`**, and **`wiki-publish/Forecast-and-Data-Internals.md`** for timeline prefix/tail, **“now”**, label policy, **LTS `sum` → bucket** alignment, and **`max - min`** when only min/max are present.
- **`sum` → axis alignment:** `wiki-publish/Forecast-and-Data-Internals.md`, `README.advanced.md`, and `README.md` describe how LTS `sum` increments map to bucket starts; `specs/006-time-windows-unify/` adds **G9** / **FR-DATA-1** / **FR-DATA-2**.

## [0.4.0-beta]

### Added
- **Time Windows Engine**: advanced data engine enable new way that data can handle to dispaly: use `time_window` in YAML to customize (preset merge, validation, LTS constraints).
– **New `Month Over Month` comparison preset**. 
- **Luxon** dependency for resolving anchored time ranges and window calculations.
- **Inteligent Aggregation & X-axis**: optional card-level `x_axis_format` (Luxon subset, validated at config time); automatic `hour`/`day`/`week`/`month` selection from merged `duration` when `aggregation` is omitted (~20–100 slot target).
- **Inteligent X-axis labeling**: adaptive Intl-based X labels (HA time zone; first tick is always a boundary); label locale cascade (`language` → HA → `en`); horizontal X labels with overlap hiding.
- **Tooltip header**: aggregation-aligned default formatting (no redundant year in comparisons; hour + multi-day window gets date disambiguation); optional card-level `tooltip_format` (Luxon subset, same validation as `x_axis_format`).
– **README_advanced.md**: advanced documentation
– **changelog.md**: release log

### Changed
- **Clarified `comparison_preset`** semantics in docs (`year_over_year`, `month_over_year`, `month_over_month`, including “month over month” meaning two consecutive full calendar months).
- **Forecast default behavior** and configuration (`show_forecast`, alias `forecast`).
– **Github Wiki**: rewitten source of knowledge abour card dedicated more advanced users [https://github.com/hello-sebastian/Energy-Horizon/wiki](https://github.com/hello-sebastian/Energy-Horizon/wiki)

### Fixed
- **ECharts renderer refactors** (series layering and legend ordering).
–  **5000** max timeline slots per series with localized error and optional `debug` console details.
- **Auto-aggregation** for **one-hour** (or shorter) windows now selects **`hour`** for LTS instead of incorrectly preferring **`month`**, which could yield empty or wrong charts for hourly `time_window` configs.
- **Summary period labels** for **custom** `time_window` (non-legacy multi-window YAML) now show each window’s **date range** instead of only the calendar year from the default `year_over_year` preset.
- **LTS anchors**: `start_of_day` and `start_of_week` are **allowed** (`start_of_week` aligns to **Monday** / Luxon ISO week, same as `startOf("week")`).


## [0.3.1-beta] - First public beta release 
### Changed
  – Visual configuration form: lovelace visual editor (`getConfigElement` / `getStubConfig`) for common fields: entity, title, comparison preset, and `force_prefix`, with YAML mode preserving YAML-only keys.
  - Chartjs -> ECharts migration


## [0.2.0]
### Added
  - Localization / locale formatting
  - Smart unit scaling
  - Theming and style separation
### Fixed
  – Chart fixies


## [0.1.0]
### Added
  - Base functionality
  – Data visualizing
  - Base card/LTS support
  – Forecasting
  – Statistics


### Notes
The format is based on [Keep a Changelog](https://keepachangelog.com/).
