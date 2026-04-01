# Energy Horizon Card — advanced reference (YAML and behavior)

This document is the **authoritative reference** for configuring `custom:energy-horizon-card`, aligned with the implementation in this repository (`src/card/`). It covers all configuration fields, data flow from Home Assistant (LTS), time-window presets, limits, and visual options.

**Prerequisites:** the entity must have **long-term statistics** (LTS) recorded by the Home Assistant recorder — the card calls the WebSocket API `recorder/statistics_during_period`.

---

## Table of contents

1. [Minimal configuration](#minimal-configuration)
2. [Card feature overview](#card-feature-overview)
3. [YAML parameters (full reference)](#yaml-parameters-full-reference)
4. [Comparison presets (`comparison_preset`)](#comparison-presets-comparison_preset)
5. [Custom windows: `time_window`](#custom-windows-time_window)
6. [Aggregation (`aggregation`) and automatic selection](#aggregation-aggregation-and-automatic-selection)
7. [Limits and validation](#limits-and-validation)
8. [Data, cumulation, and forecast](#data-cumulation-and-forecast)
9. [Unit scaling (`force_prefix`)](#unit-scaling-force_prefix)
10. [X-axis, tooltip, and Luxon formats](#x-axis-tooltip-and-luxon-formats)
11. [Chart: colors, fills, legend, gaps](#chart-colors-fills-legend-gaps)
12. [Localization and numbers](#localization-and-numbers)
13. [Multiple windows (context series)](#multiple-windows-context-series)
14. [Lovelace editor](#lovelace-editor)
15. [YAML examples](#yaml-examples)

---

## Minimal configuration

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy
comparison_preset: year_over_year
```

- **`comparison_preset`** may be omitted — then `year_over_year` applies (unless a non-empty legacy **`comparison_mode`** is set).
- **`entity`** should be a valid `statistic_id`; an empty entity does not fail `setConfig`, but the card usually ends up in a no-data state or an API error.

---

## Card feature overview

| Area | Behavior |
|------|----------|
| **Data source** | One entity, multiple LTS queries — one per resolved time window. |
| **Time windows** | Preset (`comparison_preset`) + optional override via `time_window` (deep merge). |
| **Chart** | Apache ECharts: current series (window 0), reference (window 1), optional background for windows ≥ 2. |
| **X-axis** | Shared axis = longest window (by time span); shorter series end earlier. |
| **Numeric summary** | Cumulative values at the end of the current timeline vs reference, using the same alignment as the chart. |
| **Trend text** | Higher / lower / similar vs reference (“similar” threshold: difference &lt; 0.01 in display units). |
| **Forecast** | End-of-period estimate from elapsed fraction and reference profile; disabled in single-window mode or with `show_forecast: false`. |
| **SI scaling** | Optional `force_prefix` (auto / none / forced prefix) on cumulative values. |

---

## YAML parameters (full reference)

Target types: `CardConfig` / `CardConfigInput` in [`src/card/types.ts`](src/card/types.ts).

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `type` | string | — | Always `custom:energy-horizon-card`. |
| `entity` | string | — | Entity ID (sensor) with LTS. |
| `comparison_preset` | see [presets](#comparison-presets-comparison_preset) | `year_over_year` | Canonical mode / window template. |
| `comparison_mode` | same as above | — | **Deprecated** alias; if **both** are set, `comparison_preset` wins. |
| `title` | string | entity `friendly_name` | Card header title. |
| `show_title` | boolean | `true` | Hides title when `false`. |
| `icon` | string | from entity attributes | MDI, e.g. `mdi:lightning-bolt`. |
| `show_icon` | boolean | `true` | Hides icon when `false`. |
| `time_window` | object | — | Overrides preset template fields; see [dedicated section](#custom-windows-time_window). |
| `period_offset` | number | `-1` | Reference year shift in legacy YoY / MoY presets (years relative to current). |
| `aggregation` | `hour` \| `day` \| `week` \| `month` | see [aggregation](#aggregation-aggregation-and-automatic-selection) | LTS step; merged with preset / `time_window`. |
| `show_forecast` | boolean | `true` (line on when forecast is computed) | Explicit `false` turns off the forecast line. |
| `forecast` | boolean | — | **Alias** for `show_forecast` (merged in `setConfig`). |
| `precision` | number | **`2`** | Decimal places in UI numbers (implementation: `?? 2`). |
| `debug` | boolean | `false` | Console logs (windows, LTS queries, diagnostics). |
| `language` | string | HA language | Translation language code; missing dictionary → fallback `en`. |
| `number_format` | `comma` \| `decimal` \| `language` \| `system` | from HA / `system` | Number formatting locale; invalid value → `system` (+ warning when `debug`). |
| `fill_current` | boolean | `true` | Fill under the current series. |
| `fill_reference` | boolean | `false` | Fill under the reference series. |
| `fill_current_opacity` | number 0–100 | `30` | Invalid / out of range → `30`. |
| `fill_reference_opacity` | number 0–100 | `30` | Same as above. |
| `primary_color` | string (CSS color) | empty → HA accent | Current series line color; invalid CSS may be ignored by the browser. |
| `connect_nulls` | boolean | `true` | Dashed visual interpolation across `null` gaps; `false` = gaps on the chart. |
| `show_legend` | boolean | `false` | Legend **only** with explicit `show_legend: true`. |
| `x_axis_format` | string | — | Luxon pattern for X-axis labels; disables adaptive label mode. |
| `tooltip_format` | string | — | Luxon pattern for tooltip header (first line). Validated like `x_axis_format`. |
| `force_prefix` | see [scaling](#unit-scaling-force_prefix) | `auto` (when omitted) | SI prefix control for scalable units. |

---

## Comparison presets (`comparison_preset`)

### `year_over_year`

- Internal template: anchor `start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`, legacy flags: current window ends **now**, reference is a **full calendar year** shifted by `period_offset` (default one year back).
- Resolution path: **legacy** (when `currentEndIsNow` + `referenceFullPeriod` remain and `count === 2`).

### `month_over_year`

- Anchor `start_of_month`, `duration: 1M`, `step: 1y`, `count: 2`, same legacy flags as YoY — “same month in the reference year”, not “previous month”.
- `period_offset` shifts the reference year (default −1).

### `month_over_month`

- Anchor `start_of_month`, `duration: 1M`, `step: 1M`, `count: 2` — **no** legacy flags; **generic** resolution (`resolveGeneric`): window 0 = current calendar month, window 1 = previous **full** calendar month.

### Legacy: `comparison_mode`

Kept for compatibility only. Use `comparison_preset` in new configs.

---

## Custom time windows: `time_window`

The YAML object is **deep-merged** with the preset template: fields in `time_window` override preset defaults.

### Fields (`TimeWindowYaml` / merged template)

| Field | Meaning |
|-------|---------|
| `anchor` | `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now` — reference point for window 0 (see fiscal-year offset logic for `start_of_year` in code). |
| `offset` | Optional duration token (e.g. `+3M`) shifting the base point relative to the anchor. |
| `duration` | Length of one window (tokens: `y`, `M`, `w`, `d`, `h`, `m`, `s` — see `duration-parse.ts`). **Minimum 1 h** for LTS. |
| `step` | Spacing between consecutive windows (backward from window 0): window *i* starts `i × step` before window 0’s start. Must parse to a positive duration. |
| `count` | Number of windows (1–24). Window 0 = current, 1 = reference, ≥2 = visual context. |
| `aggregation` | Explicit LTS step for all windows (current version: one effective value for the whole card). |

### Customization vs legacy path

If you change `anchor`, `step`, `count`, or set a non-empty `offset` different from the preset, the card **strips** legacy flags (`currentEndIsNow`, `referenceFullPeriod`) and uses **generic** resolution — even if you started from YoY/MoY.

### Duration tokens (`duration`, `step`, `offset`)

Format: optional `+`/`-` sign, number, unit. Units mapped to Luxon: **`y`**, **`M`** (month), **`w`**, **`d`**, **`h`**, **`m`** (minutes), **`s`**.

---

## Aggregation (`aggregation`) and automatic selection

**Merge order** (simplified):

1. Preset template (+ merge with `time_window`).
2. Window-level `aggregation` from the merge takes precedence; otherwise card-level `aggregation` applies.

**Automatic step:** if after that chain **`aggregation` is still empty**, the card derives it from merged **`duration`** via `pickAutoAggregation`, targeting roughly 20–100 buckets per window (readability), using allowed LTS steps (`hour` … `month`). Windows shorter than ~1 h force `hour`.

**Note:** In the current product version **all resolved windows** share the **same** `aggregation` (no per-window steps in YAML without a schema extension).

---

## Limits and validation

| Condition | Result |
|-----------|--------|
| `count` &lt; 1, non-integer, or missing | Config error (invalid `time_window` message). |
| `count` &gt; 24 | Error: too many windows. |
| `step` / `duration` empty, invalid, or ≤ 0 | Invalid `time_window` error. |
| `anchor` empty after merge | Invalid `time_window` error. |
| `anchor` outside LTS allow-list | **Throws** in `setConfig` (English message listing allowed values). |
| `duration` &lt; 1 h | **Throws** in `setConfig` (LTS). |
| Explicit `aggregation` not in `hour|day|week|month` | **Throws** in `setConfig`. |
| Timeline length &gt; **5000** points | Card error state (`status.point_cap_exceeded`, `max` param). |
| `x_axis_format` / `tooltip_format` non-empty but invalid tokens | Error state (`config_invalid_*`). |

An empty or invalid `x_axis_format` after trim does not run the validator (empty = no forced format).

---

## Data, cumulation, and forecast

### LTS → series mapping

- Points for `entity` are taken from the HA response; if `results` has a single key, it is used as fallback.
- Value preference: increments from **`sum`** (difference of consecutive sums), else **`change`**, else **`state`**.
- The plotted series is **cumulative** (running total over time).
- Inconsistent `unit_of_measurement` across points → series may be rejected (empty result).

### Forecast (`computeForecast`)

Enabled only when:

- there are **at least two windows** and a reference series exists;
- `periodTotalBuckets` (aggregation slot count for **window 0**) is finite and &gt; 0;
- `completedBuckets = currentPoints.length - 1` satisfies **≥ 3** and **`completedBuckets / periodTotalBuckets` ≥ 0.05**;
- reference has data alignable in time with the current series.

The **period progress denominator** is the bucket count of the **current window**, not the X-axis length — when windows differ in length, the axis can be longer than the forecast period.

**Forecast line on chart:** on by default (`show_forecast` is not `false`), but the renderer **disables** it in **single-window** mode (`windows.length < 2`).

---

## Unit scaling (`force_prefix`)

Implemented in [`src/utils/unit-scaler.ts`](src/utils/unit-scaler.ts).

| Value | Meaning |
|-------|---------|
| *(omitted)* / `auto` | Choose SI prefix from max absolute value (after the entity unit’s existing prefix). |
| `none` | No scaling; raw values and unit label from HA. |
| `k`, `M`, `G`, `m`, `u` or `µ` | Forced prefix (micro normalized to `u` internally). |

**Non-scalable** units (time, %, temperature, etc. per parser) ignore forced prefix and use factor 1.

---

## X-axis, tooltip, and Luxon formats

### Adaptive mode (default)

When **`x_axis_format` is omitted**, X-axis label density and style depend on aggregation and context (“smart” boundaries in the renderer).

### Forced mode

Non-empty `x_axis_format` after trim:

- Each category label on the X-axis uses **Luxon `toFormat`** in the HA time zone.
- Disables adaptive boundary labels.

### `tooltip_format`

Non-empty → tooltip header (first line) uses this pattern instead of the default aggregation-based matrix.

### Allowed tokens

The validator (`validateXAxisFormat`) accepts a **subset** of Luxon tokens (letter sequences from the list in `x-axis-format-validate.ts`) plus separators: spaces, `+`, `-`, `:`, `.`, `,`, `_`, `/`, digits, `T`. Single-quoted `'` literals are allowed. Any disallowed character → config error.

Full Luxon token table: [Luxon — formatting tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).

---

## Chart: colors, fills, legend, gaps

- **`primary_color`**: current series line; empty string → theme default (accent).
- **`fill_*` / `fill_*_opacity`**: fills under lines; invalid opacity → 30%.
- **`connect_nulls`**: adds an auxiliary series with dashed interpolation across gaps; the solid line still breaks on `null`.
- **`show_legend`**: no legend by default; explicit `true` shows it.

---

## Localization and numbers

- **`language`**: must match `src/translations/<lang>.json`; otherwise the card uses **English** (warning when `debug`).
- **`number_format`**: maps to `Intl` locale (`comma` → `de`, `decimal` → `en`, `language` → selected language, `system` → `navigator.language` or card language).

Time zone always from **`hass.config.time_zone`** (fallback `UTC`).

---

## Multiple windows (context series)

For **`count` ≥ 3**:

- Windows **0** and **1** keep full semantics (summary, forecast, tooltip for current and reference).
- Windows **≥ 2** (index-wise: the third window onward) render as **background layers** (visual context); they are **not** in the tooltip or forecast logic.
- Internal series labels: “current”, “reference”, “reference (2)”, etc.

---

## Lovelace editor

`EnergyHorizonCard` exposes `getConfigElement()` → `energy-horizon-card-editor`.

**Visual mode (`ha-form`):** entity (`sensor` domain), title, `comparison_preset`, `force_prefix`.

**YAML mode:** requires global `window.jsyaml` (standard HA frontend). All other fields are set in YAML or by pasting full config.

---

## YAML examples

### YoY with title and forecast disabled

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
title: Annual consumption
show_forecast: false
precision: 1
```

### Month over month, daily aggregation

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: month_over_month
aggregation: day
```

### Window width override (e.g. year / year) — merge with YoY preset

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
time_window:
  duration: 1y
  step: 1y
  count: 2
```

### Three years back (visual context)

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
time_window:
  anchor: start_of_year
  duration: 1y
  step: 1y
  count: 3
aggregation: month
```

### Custom Luxon X-axis and tooltip

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: month_over_month
aggregation: day
x_axis_format: dd.MM.yyyy
tooltip_format: DDDD, dd LLL yyyy HH:mm
```

### Raw watt-hours (no k, M)

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
force_prefix: none
```

### Legend and reference fill

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: month_over_year
show_legend: true
fill_reference: true
fill_reference_opacity: 20
connect_nulls: false
```

---

## Speckit reference

Design details and historical decisions live under `specs/` and in [`speckit.md`](speckit.md) (including the time-windows engine and public contracts). This file **documents behavior as implemented**; if an older contract disagrees with code, **`src/` wins**.

---

*Last aligned with code: types and logic in `src/card/types.ts`, `cumulative-comparison-chart.ts`, `time-windows/`, `ha-api.ts`, `axis/`, `utils/unit-scaler.ts`.*
