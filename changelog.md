# Changelog

All notable changes to **Energy Horizon Card** (Home Assistant Lovelace / HACS) are documented in this file.



## Unreleased

### Fixed

- **LTS `sum` vs chart slots:** increments from consecutive **`sum`** values are timestamped at the **start of the bucket** they belong to (previous row’s `start`), so the first visible point aligns with the first axis tick for `aggregation: day` / `hour` (e.g. month-over-year no longer looks shifted by one day or one hour). ECharts slot matching uses the **next timeline timestamp** as the slot end when available (same idea as the Chart.js path), improving DST-length days.
- **Chart tooltip vs X-axis (spec 006):** tooltip date headers now resolve the **same timeline slot** as the axis (`axisValue` / current or reference series X), so sparse series such as the **two-point forecast line** no longer shift the header by one day or drop the tail column label. Default **Intl** axis and tooltip strings use **`timeZone: <HA zone>`** (FR-H) instead of the browser default.
- **Multi-window chart axis (spec 006)**: `timeline[]` is built from **window 0’s** slot starts, then **ordinal tail** steps to reach **Longest-window axis span** — not from the longest window’s calendar alone. Resolves wrong month/year on the X-axis and the “now” marker jumping to the last day of the reference period (MoM / YoY / MoY).
- **FR-G carry-forward**: the “now” slot for filling missing LTS buckets uses the same **window 0** bucket boundaries (with HA `time_zone`), consistent with the marker.

### Changed

- **Unified multi-window chart axis (spec 006)**: `buildChartTimeline` uses one rule for all `N ≥ 2` windows — axis length is the **maximum nominal bucket count** at window 0’s aggregation (not a separate YoY/MoY “legacy” axis path). **Forecast** still uses `forecastPeriodBuckets` from **window 0** only when it differs from axis length.
- **FR-B tail labels**: X-axis ticks past the current window’s nominal end use compact date-style tail formatting; **FR-G** carry-forward fills the current cumulative at the “today” slot when LTS has not closed that bucket yet (day/week/month).
- **Comparison axis labels**: default adaptive X-axis and tooltip headers **omit redundant years** when the two windows start in different years, and use **day-of-month only** for daily aggregation when the year matches but start months differ (MoM). Forced `x_axis_format` / `tooltip_format` still override this matrix.

### Documentation

- Cross-linked specs and wiki mental model with the unified axis + forecast rules (`specs/006-time-windows-unify/`, `wiki-publish/Mental-Model-Comparisons-and-Timelines.md`).
- Updated `README.md`, `README.advanced.md`, `wiki-publish/Luxon-Formats-Reference.md`, and `wiki-publish/Forecast-and-Data-Internals.md` for timeline prefix/tail, “now”, and label policy.
- **`sum` → axis alignment:** `wiki-publish/Forecast-and-Data-Internals.md`, `README.advanced.md`, and `README.md` describe how LTS `sum` increments map to bucket starts; `specs/006-time-windows-unify/` adds **G9** / **FR-DATA-1**.

## [1.0.2]

### Fixed

- **LTS measurement buckets (#45):** charts could stay **blank** when Home Assistant returned only **`mean` / `min` / `max`** (no `sum`, `change`, or `state`)—typical for `state_class: measurement` entities such as a **template sensor** summing cumulative sources without `state_class: total_increasing`. The card now derives a per-bucket increment from **`max - min`** when those three fields are absent, and skips buckets with a negative range. For true cumulative meters, prefer declaring **`total_increasing`** in HA so LTS exposes **`sum`**.

## [0.5.1]

### Added

- **Layout visibility toggles** (YAML + Lovelace visual editor): `show_comparison_summary` (Figma *Data series info* — current vs reference “to this day”), `show_forecast_total_panel` (*Surface Container* — Forecast | Total), and `show_narrative_comment` (*Inteligent comment*). Each defaults to **on** when omitted or any value other than `false`.
- With forecast **on**, `show_forecast_total_panel: false` hides only the Forecast | Total **panel** while keeping the dashed forecast line behavior driven by `show_forecast`. `show_forecast: false` still removes the entire second panel (unchanged).

## [0.5.0]

### Added
– **New GUI** 
– **Delta line on chart**

### Changed
– Current label on x axis
– **Period captions** in the comparison panel use a single **compact** formatter (`formatCompactPeriodCaption`): short month names, HA time zone, optional `time_format` for hourly windows, and compressed ranges (e.g. full month → `Mar 2026`).

### Fixed
– Comparison panel **current** period caption again shows the **full nominal** month/year for preset `currentEndIsNow` windows (`expandCurrentWindowForCaption`), not a partial range to today (e.g. `Apr 2026` vs `1 Apr – 12 Apr 2026`).

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