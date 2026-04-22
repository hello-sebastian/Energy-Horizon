# Energy Horizon Card — advanced reference (YAML and behavior)

This document is the **authoritative reference** for configuring `custom:energy-horizon-card`, aligned with the implementation in this repository (`src/card/`). It covers all configuration fields, data flow from Home Assistant (LTS), time-window presets, limits, and visual options.

**Prerequisites:** the entity must have **long-term statistics** (LTS) recorded by the Home Assistant recorder — the card calls the WebSocket API `recorder/statistics_during_period`.

![Energy Horizon Card screenshot](wiki-publish/ehorizon-screenshot.png)

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
| **X-axis** | Shared axis length = **max nominal bucket count** across windows at the chart aggregation (window 0’s grain), not wall‑clock span alone; shorter series end earlier on that axis. |
| **Numeric summary** | Cumulative values at the end of the current timeline vs reference, using the same alignment as the chart. |
| **Trend text** | Narrative + chart delta use **`interpretation`** (`consumption` vs `production`), optional **`neutral_interpretation`** band on the chip percent **p**, and dedicated copy when comparison data is insufficient; delta chip **signs** stay pure arithmetic. |
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
| `interpretation` | `consumption` \| `production` | `consumption` | Semantic polarity for **comparison narrative**, **trend icon**, and **chart delta** segment only. Case-insensitive; unknown → `consumption` (optional `debug` console note). |
| `neutral_interpretation` | number (≥ 0) | `2` | Neutral styling when **|p| ≤ T** where **p** is the same signed % as the delta chip; invalid / negative → `2`. Large values (e.g. ≥ 100) effectively keep outcomes neutral. |
| `number_format` | `comma` \| `decimal` \| `language` \| `system` | from HA / `system` | Number formatting locale; invalid value → `system` (+ warning when `debug`). |
| `fill_current` | boolean | `true` | Fill under the current series. |
| `fill_reference` | boolean | `false` | Fill under the reference series. |
| `fill_current_opacity` | number 0–100 | `30` | Invalid / out of range → `30`. |
| `fill_reference_opacity` | number 0–100 | `30` | Same as above. |
| `primary_color` | string | empty → card token `#119894` | Current series line, fill, and caption swatch. Use `var(--accent-color)`, `ha-accent` / `ha-primary-accent`, or `ha-primary` to follow HA theme; override `--eh-series-current` with Card Mod if needed. |
| `connect_nulls` | boolean | `true` | Dashed visual interpolation across `null` gaps; `false` = gaps on the chart. |
| `show_legend` | boolean | `false` | Legend **only** with explicit `show_legend: true`. |
| `show_comparison_summary` | boolean | `true` (visible when not `false`) | Hides the **comparison** panel (current vs reference “to this day” + delta chip) when `false`. |
| `show_forecast_total_panel` | boolean | `true` | Hides the **Forecast \| Total** panel when `false`. Still requires forecast gating: if `show_forecast` is `false`, the panel stays absent regardless of this flag. |
| `show_narrative_comment` | boolean | `true` | Hides the **narrative comment** block (trend icon + text) when `false`. |
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

### Shared chart axis (multi-window)

For `count ≥ 2`, the horizontal axis uses **Longest-window axis span** (max nominal bucket count at the chart aggregation). **Tick timestamps** are anchored to **window 0** for the initial slots, then continue with **ordinal** steps if a longer window needs extra slots—so the axis does not adopt the reference window’s calendar for the whole range. The **“now”** marker uses the bucket containing the current instant **inside window 0** (HA time zone). Default adaptive labels may **omit the year** (different start years) or use **day-of-month only** (same year, different start months) on the axis; forced `x_axis_format` / `tooltip_format` override that. Details: `specs/006-time-windows-unify/` and the wiki [Mental Model: Comparisons and Timelines](https://github.com/hello-sebastian/energy-horizon/wiki/Mental-Model-Comparisons-and-Timelines).

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
- Value preference: increments from **`sum`** (difference of consecutive sums), else **`change`**, else **`state`**, else—when those three are absent but both are finite numbers—**`max - min`** per LTS row (buckets with `max - min < 0` are skipped). That last path is a **heuristic** for `state_class: measurement` entities whose underlying signal is still a monotonic cumulative-style counter (e.g. a template summing `total_increasing` sources without being declared `total_increasing`); for real meters, prefer **`state_class: total_increasing`** in Home Assistant so LTS exposes **`sum`**.
- For **`sum`**, each increment is timestamped at the **previous row’s period start** (the bucket that increment covers), so daily/hourly chart columns align with axis ticks. **`change`**, **`state`**, and **`max - min`** increments use the **current row’s `start`** (same slot semantics as non-`sum` fields; distinct from **FR-DATA-1** for `sum` in spec 006).
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

**Tooltip header (default matrix):** the first line shows the **same timeline slot** as the axis column under the pointer. The renderer resolves the slot from the axis (`axisValue`) or from the current/reference line’s X coordinate — not from sparse helper series (e.g. the forecast segment has only two points). Calendar parts in default **Intl** formatting use **`timeZone`** = your Home Assistant IANA zone.

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

- **`primary_color`**: current series line, area fill, and the small caption swatch. When omitted, the card uses the Figma brand teal (`#119894`) from CSS `--eh-series-current` on `:host` (not Home Assistant `--primary-color`). To match the HA theme again, set e.g. `primary_color: ha-primary` or `primary_color: var(--primary-color)`, or `ha-accent` / `var(--accent-color)` for accent-first. Values are resolved on the card host so `var(--…)` works in YAML.
- **`fill_*` / `fill_*_opacity`**: fills under lines; invalid opacity → 30%.
- **`connect_nulls`**: adds an auxiliary series with dashed interpolation across gaps; the solid line still breaks on `null`.
- **`show_legend`**: no legend by default; explicit `true` shows it.

---

## Localization and numbers

- **`language`**: must match `src/translations/<lang>.json`; otherwise the card uses **English** (warning when `debug`).
- **Comparison narrative (`text_summary.*`):** full sentences live under `text_summary.{consumption|production|generic}.{higher|lower|similar|neutral_band}` with `{{deltaUnit}}`, `{{deltaPercent}}`, and `{{referencePeriod}}`. The period fragment comes from `text_summary.period.{day|week|month|year|reference}`, chosen from merged **`time_window.step`** (intent), not from window geometry. Shared states: `text_summary.no_reference`, `text_summary.insufficient_data`. New languages can ship with only the **11** mandatory keys documented in domain spec **FR-903-NG** / **FR-905-L**; see `src/translations/CONTEXT.md` for how `period.*` must read after comparatives in each language.
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

**Visual mode (`ha-form`):** entity (`sensor` domain), title, `comparison_preset`, **`interpretation`** (consumption vs production), `force_prefix`, `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment` (boolean toggles).

**YAML mode:** requires global `window.jsyaml` (standard HA frontend). All other fields are set in YAML or by pasting full config — including **`neutral_interpretation`** (YAML-only in v1; shallow merge preserves it when editing other fields in Visual mode).

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

### Solar / production entity (higher generation = success semantics)

```yaml
type: custom:energy-horizon-card
entity: sensor.solar_production_month
comparison_preset: year_over_year
interpretation: production
# optional: neutral_interpretation: 2
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
