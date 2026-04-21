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
| `interpretation` | `consumption` \| `production` | `consumption` | Semantic “better/worse” for **narrative + chart delta** only (not chip signs, not Forecast \| Total) | Case-insensitive; unknown → `consumption` | [README.advanced.md](https://github.com/hello-sebastian/energy-horizon/blob/main/README.advanced.md) |
| `neutral_interpretation` | number (≥ 0) | `2` | **Neutral band** on chip percent **p**: **|p| ≤ T** → neutral styling | Invalid → `2`; YAML-only in v1 (editor preserves key) | [README.advanced.md](https://github.com/hello-sebastian/energy-horizon/blob/main/README.advanced.md) |

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

Optional **visibility** flags (default **on**: omit the key or use any value other than `false`). Map to layers in [`specs/001-figma-ui-rollout/figma-ui-project-source.md`](https://github.com/hello-sebastian/energy-horizon/blob/main/specs/001-figma-ui-rollout/figma-ui-project-source.md) §2.

| Key | Figma layer (reference) | Effect |
|-----|-------------------------|--------|
| `show_comparison_summary` | **Data series info** (current vs reference “to this day”) | When `false`, the comparison panel (`.ebc-section--comparison`) is not rendered. |
| `show_forecast_total_panel` | **Surface Container** (Forecast \| Total) | When `false`, hides that panel **only** if it would otherwise show. Still requires `show_forecast` not to be `false` and forecast data gating — if forecast is off, the whole panel stays absent (same as before these flags). |
| `show_narrative_comment` | **Inteligent comment** | When `false`, the comment block (icon + narrative) is not rendered. |

The Lovelace **visual editor** exposes these three fields plus **`interpretation`** (consumption vs production); YAML mode remains authoritative for the full config (see editor contract in the card repo). **`neutral_interpretation`** is YAML-only in v1 but is preserved when editing other fields in Visual mode.

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
