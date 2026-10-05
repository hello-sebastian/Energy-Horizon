# Configuration and Customization

**Reference** for every YAML key accepted by the card, with defaults, precedence rules, and “why it fails” notes.

- **Naming authority**: `src/card/types.ts` (if this page disagrees with code, **code wins**).
- **Behavior authority**: `README.advanced.md` (this wiki expands it, but must not contradict it).

If you came here from the project README:

- Quick recipes: [First Comparisons: Quick Recipes](First-Comparisons-Quick-Recipes)
- Advanced windows: [How-To: Time Windows](How-To-Time-Windows) / [Time Window Reference](Time-Window-Reference)
- Date formatting: [Luxon Formats Reference](Luxon-Formats-Reference)
- “Why does it work like this?”: [Mental Model: Comparisons and Timelines](Mental-Model-Comparisons-and-Timelines)

---

## Key precedence rules (read this once)

- **`comparison_preset` wins** over legacy `comparison_mode` when both are set.
- **`forecast` is an alias** for `show_forecast` (same meaning); prefer `show_forecast` in docs/config.
- **`time_window` deep-merges** into the preset’s internal template (you override only what you specify).
- **Effective `aggregation`** is resolved after merge; if still empty, the card can **auto-pick** a step from window duration.

---

## Core configuration

| Key | Type | Default | Mental model | Common failure / gotcha | Related |
|-----|------|---------|--------------|-------------------------|---------|
| `type` | string | required | Identifies the custom card | Wrong value → “custom element”/config errors | [Getting Started](Getting-Started) |
| `entity` | string | required | One statistic ID → many LTS queries (one per resolved window) | Entity has **no long-term statistics** → empty chart | [Troubleshooting and FAQ](Troubleshooting-and-FAQ) |
| `comparison_preset` | `year_over_year \| month_over_year \| month_over_month` | `year_over_year` | Chooses a preset window template (then YAML can override) | Confusing MoY vs MoM | [First Comparisons](First-Comparisons-Quick-Recipes) |
| `comparison_mode` | same as above | — | **Deprecated** legacy name | If both set, it is ignored in favor of `comparison_preset` | [Releases and Migration](Releases-and-Migration) |
| `time_window` | object | — | Advanced override of window template (deep merge) | Invalid window → fail-fast config error | [How-To: Time Windows](How-To-Time-Windows) / [Time Window Reference](Time-Window-Reference) |
| `aggregation` | `hour \| day \| week \| month` | auto/derived | LTS bucket size used for *all* windows | Too fine + long window → point cap error; the “now” marker uses the bucket that contains the current instant **inside window 0** (HA time zone), mapped to the shared axis | [How-To: Aggregation & Performance](How-To-Aggregation-and-Performance) |
| `period_offset` | number | `-1` | Shifts **reference year** in legacy YoY/MoY presets | Only meaningful for YoY/MoY legacy semantics | [Mental Model](Mental-Model-Comparisons-and-Timelines) |

---

## Forecast

| Key | Type | Default | Mental model | Common failure / gotcha | Related |
|-----|------|---------|--------------|-------------------------|---------|
| `show_forecast` | boolean | `true` | Show the forecast overlay *when forecast can be computed* | Forecast can be hidden even when true (data gating rules) | [Forecast and Data Internals](Forecast-and-Data-Internals) |
| `forecast` | boolean | — | Alias for `show_forecast` | Prefer `show_forecast` to avoid ambiguity | [Releases and Migration](Releases-and-Migration) |

---

## Display (header + legend)

| Key | Type | Default | Mental model | Common failure / gotcha |
|-----|------|---------|--------------|-------------------------|
| `title` | string | entity `friendly_name` | Header label only | — |
| `show_title` | boolean | `true` | Toggle header title | — |
| `icon` | string | from entity | Header icon only | Invalid MDI name just shows default |
| `show_icon` | boolean | `true` | Toggle header icon | — |
| `show_legend` | boolean | `false` | Legend is opt-in | Don’t expect legend unless explicitly enabled |

---

## Layout sections (Figma-aligned)

Optional **visibility** flags (default **on**: omit the key or use any value other than `false`). Map to layers in [`figma-design.md`](https://github.com/hello-sebastian/energy-horizon/blob/main/figma-design.md) §2.

| Key | Figma layer (reference) | Effect |
|-----|-------------------------|--------|
| `show_comparison_summary` | **Data series info** (current vs reference “to this day”) | When `false`, the comparison panel (`.ebc-section--comparison`) is not rendered. |
| `show_forecast_total_panel` | **Surface Container** (Forecast \| Total) | When `false`, hides that panel **only** if it would otherwise show. Still requires `show_forecast` not to be `false` and forecast data gating — if forecast is off, the whole panel stays absent (same as before these flags). |
| `show_narrative_comment` | **Inteligent comment** | When `false`, the comment block (icon + narrative) is not rendered. |

The Lovelace **visual editor** exposes these three fields (and, since full coverage, every other field below) — see [Visual editor coverage](#visual-editor-coverage). YAML mode remains authoritative for the full config.

---

## Visual editor coverage

The card's visual editor (`energy-horizon-card-editor`) covers **all 27 user-configurable fields** in **8 sections**. The first three sections are always visible; the other five are collapsed under **Advanced**. A section is expanded or collapsed **only by clicking its header** (title + chevron); interacting with the controls inside a section (dropdowns, inputs, toggles) does not change its expanded state. Every change is written back to the card's YAML; fields you don't touch are preserved unchanged (zero data loss). `type` (constant) and `forecast` (alias of `show_forecast`) are not editor-controlled.

| Section | Field | Control | Default | Notes |
|---|---|---|---|---|
| **Comparison** | `entity` | entity picker (`sensor`) | required | The statistic to compare. |
| | `title` | text | entity `friendly_name` | Header label. |
| | `comparison_preset` | select (dropdown) | `year_over_year` | `year_over_year` / `month_over_year` / `month_over_month`. |
| | `force_prefix` | select (dropdown) | `auto` | Unit scaling (`auto`/`none`/`k`/`M`/`G`/`m`/`µ`). |
| | `show_comparison_summary` | toggle | on | Comparison panel visibility. |
| | `show_forecast_total_panel` | toggle | on | Forecast \| Total panel visibility. |
| | `show_narrative_comment` | toggle | on | Narrative comment visibility. |
| **Header** | `show_title` | toggle | on | Header title visibility. |
| | `icon` | select (dropdown, searchable) | entity icon | Header icon. First option = entity icon (auto); selecting it omits `icon` from YAML. Searchable — type any MDI icon name (e.g. `mdi:flash`) to use it. |
| | `show_icon` | toggle | on | Header icon visibility. |
| **Forecast** | `show_forecast` | toggle | on | Dashed forecast line. |
| **Time window** | `aggregation` | select (dropdown) | `auto` | Chart resolution (`auto`/`hour`/`day`/`week`/`month`). |
| | `period_offset` | number | `-1` | Reference period offset (years). |
| | `time_window_anchor` | select (dropdown) | preset | Window start anchor (6 `TimeAnchor` values). |
| | `time_window_offset` | text | preset | Duration token (e.g. `+9M`). |
| | `time_window_duration` | text | preset | Duration token (e.g. `1y`). |
| | `time_window_step` | text | preset | Duration token. |
| | `time_window_count` | number (1–24) | preset | Number of windows. |
| | `time_window_aggregation` | select (dropdown) | `auto` | Per-window aggregation override. |
| **Chart style** | `fill_current` | toggle | on | Fill under current series. |
| | `fill_reference` | toggle | off | Fill under reference series. |
| | `fill_current_opacity` | number (0–100) | `30` | Current fill opacity. |
| | `fill_reference_opacity` | number (0–100) | `30` | Reference fill opacity. |
| | `primary_color` | text | `#119894` | Current series color. |
| | `connect_nulls` | toggle | on | Dashed bridge across null gaps. |
| | `show_legend` | toggle | off | Legend visibility. |
| **Localization** | `language` | select (dropdown) | HA language | Translation dictionary (`auto`/`en`/`pl`/`de`/`fr`). |
| | `number_format` | select (dropdown) | system | `system`/`comma`/`decimal`/`language`. |
| | `precision` | number (0–6) | `2` | Decimal places. |
| **Date formats** | `x_axis_format` | text | adaptive | Luxon pattern for X-axis ticks. |
| | `tooltip_format` | text | adaptive | Luxon pattern for tooltip header. |
| **Diagnostics** | `debug` | toggle | off | Extra console diagnostics. |

**Mapping rules:** `toForm` applies card defaults for unset fields; `aggregation`/`language`/`icon` `undefined` → `auto`; an unset `time_window` shows the active preset's template values. `fromForm` maps `auto` → `undefined` (key omitted) for `aggregation`/`language`/`force_prefix`/`icon`, and omits untouched `time_window` sub-fields so the preset applies. Unknown select values (a YAML typo) display as `auto`/empty but the **raw value is preserved in the stored config** and emitted unchanged.

---

## Chart styling (fills, colors, gaps)

| Key | Type | Default | Mental model | Common failure / gotcha | Related |
|-----|------|---------|--------------|-------------------------|---------|
| `primary_color` | string | `#119894` (`--eh-series-current`) | Current series line, fill, caption swatch | `var(--accent-color)`, aliases `ha-accent` / `ha-primary-accent` / `ha-primary`; invalid/unresolved → token / `#119894` | [`README.advanced.md`](https://github.com/hello-sebastian/energy-horizon/blob/main/README.advanced.md) |
| `fill_current` | boolean | `true` | Fill under current series | — | — |
| `fill_reference` | boolean | `false` | Fill under reference series | — | — |
| `fill_current_opacity` | number (0–100) | `30` | Percent opacity for current fill | Out of range resets to default | — |
| `fill_reference_opacity` | number (0–100) | `30` | Percent opacity for reference fill | Out of range resets to default | — |
| `connect_nulls` | boolean | `true` | Adds a **dashed overlay** bridging null gaps (solid line still breaks) | Visual interpolation only | [Aggregation and Axis Labels](Aggregation-and-Axis-Labels) |

**Migration (default series color):** If you preferred the old look where the current series followed Home Assistant **`--primary-color`** without setting YAML, add e.g. `primary_color: ha-primary` or `primary_color: var(--primary-color)`.

---

## Units, scaling, precision

| Key | Type | Default | Mental model | Common failure / gotcha |
|-----|------|---------|--------------|-------------------------|
| `force_prefix` | `auto \| none \| k \| M \| G \| m \| u \| µ` | `auto` | Scales **display** units for readability | Non-scalable units (%/time/°C…) ignore scaling |
| `precision` | number | `2` | Decimal places for UI numbers | Too high can look noisy |

---

## Localization and number formatting

| Key | Type | Default | Mental model | Common failure / gotcha |
|-----|------|---------|--------------|-------------------------|
| `language` | string | HA language | Chooses translation dictionary for labels | Missing dictionary → fallback to English. The consumption summary uses full-sentence templates with `{{deltaUnit}}` and `{{deltaPercent}}` (see `src/translations/en.json`). |
| `number_format` | `comma \| decimal \| language \| system` | HA/system | Controls which locale `Intl` uses for numbers | Use `decimal` for “always English-style decimals” |

Time zone is taken from **`hass.config.time_zone`** (fallback UTC).

---

## Axis and tooltip formatting (Luxon)

| Key | Type | Default | Mental model | Common failure / gotcha | Related |
|-----|------|---------|--------------|-------------------------|---------|
| `x_axis_format` | string | adaptive | Forces Luxon formatting on X-axis ticks | Invalid pattern → **config error** at load | [Luxon Formats Reference](Luxon-Formats-Reference) |
| `tooltip_format` | string | adaptive | Forces Luxon formatting in tooltip header | Same validator as `x_axis_format` | [Luxon Formats Reference](Luxon-Formats-Reference) |

---

## Debug

| Key | Type | Default | Mental model | Common failure / gotcha | Related |
|-----|------|---------|--------------|-------------------------|---------|
| `debug` | boolean | `false` | Enables extra diagnostics in browser console | Don’t paste logs publicly if entity names are sensitive | [Troubleshooting and FAQ](Troubleshooting-and-FAQ) |

---

## Theming and Card-Mod

The card follows Home Assistant theme variables for text, grid, and reference series. The **current** series defaults to `--eh-series-current` (`#119894`); override that variable or use `primary_color` / `ha-primary` / `var(--primary-color)` to tie it to the theme. If you use Card-Mod, these CSS classes are useful:

- `.ehc-card`
- `.ehc-content`
- `.ehc-header`
- `.ehc-stats`
- `.ehc-forecast`
- `.ehc-chart`

Example (set chart height):

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_preset: year_over_year
card_mod:
  style: |
    .ehc-chart {
      height: 260px;
    }
```

---

## Coverage note

When adding options in code, update **`src/card/types.ts`**, the editor schema, and this page in the same PR.
