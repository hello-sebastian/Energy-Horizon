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
| `comparison_preset` | `year_over_year \| month_over_year \| month_over_month \| custom` | `year_over_year` | Chooses a preset window template (then YAML can override); **`custom`** (v1.2.0) resolves windows generically from `time_window` with no preset template | Confusing MoY vs MoM | [First Comparisons](First-Comparisons-Quick-Recipes) |
| `comparison_mode` | same as above | — | **Deprecated** legacy name | If both set, it is ignored in favor of `comparison_preset` | [Releases and Migration](Releases-and-Migration) |
| `time_window` | object | — | Advanced override of window template (deep merge) | Invalid window → fail-fast config error | [How-To: Time Windows](How-To-Time-Windows) / [Time Window Reference](Time-Window-Reference) |
| `aggregation` | `hour \| day \| week \| month` | auto/derived | LTS bucket size used for *all* windows | Too fine + long window → point cap error; the “now” marker uses the bucket that contains the current instant **inside window 0** (HA time zone), mapped to the shared axis | [How-To: Aggregation & Performance](How-To-Aggregation-and-Performance) |
| `period_offset` | number | `-1` | Shifts **reference year** in legacy YoY/MoY presets | Only meaningful for YoY/MoY legacy semantics | [Mental Model](Mental-Model-Comparisons-and-Timelines) |
| `interpretation` | `consumption` \| `production` | `consumption` | Semantic “better/worse” for **narrative + chart delta** only (not chip signs, not Forecast \| Total). Narrative **period** wording follows merged **`time_window.step`**, not window geometry. | Case-insensitive; unknown → `consumption` | [README.advanced.md](https://github.com/hello-sebastian/energy-horizon/blob/main/README.advanced.md) |
| `neutral_threshold` | number (≥ 0) | `2` | **Neutral band** on chip percent **p**: **|p| ≤ T** → neutral styling | Invalid → `2`; GUI-editable in v1.2.0 (General). Previously `neutral_interpretation` (deprecated alias; backward compatibility will be removed in a future release) | [README.advanced.md](https://github.com/hello-sebastian/energy-horizon/blob/main/README.advanced.md) |

---

## Forecast

| Key | Type | Default | Mental model | Common failure / gotcha | Related |
|-----|------|---------|--------------|-------------------------|---------|
| `show_forecast` | boolean | `true` | Show the forecast **line on the chart** *when forecast can be computed* | Controls the chart line only — the Forecast \| Total panel is separate (`show_forecast_total_panel`). The line can be hidden even when true (data gating rules) | [Forecast and Data Internals](Forecast-and-Data-Internals) |
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
| `show_forecast_total_panel` | **Surface Container** (Forecast \| Total) | When `false`, hides that panel **only** if it would otherwise show. Independent of `show_forecast` (which controls only the chart line); the panel still requires forecast data gating and not single-window mode. |
| `show_narrative_comment` | **Inteligent comment** | When `false`, the comment block (icon + narrative) is not rendered. |

Since **v1.2.0** the Lovelace **visual editor** covers the **full configuration surface** — every key on this page is GUI-editable. **`neutral_threshold`** is GUI-editable in v1.2.0 (General). See the [Visual editor](#visual-editor-v120) block below and [`README.advanced.md`](https://github.com/hello-sebastian/energy-horizon/blob/main/README.advanced.md#lovelace-editor) for the full section mapping.

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
| `language` | string | HA language | Chooses translation dictionary for labels | Missing dictionary → fallback to English. In the visual editor this is a **dropdown** over the available card dictionaries (plus an **Auto** option that inherits the HA profile language). **Auto** is the default and is always displayed when the `language` key is omitted. The consumption summary uses full-sentence templates with `{{deltaUnit}}` and `{{deltaPercent}}` (see `src/translations/en.json`). |
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

## Visual editor (v1.2.0)

Since **v1.2.0** the Lovelace visual editor covers the **full configuration surface** — every key on this page is GUI-editable. The form is organized into **seven sections** (each an expandable panel; **General** and **Time windows** are expanded by default, the rest collapsed). Some sections contain non-collapsible **subsections**:

| Section | Keys |
|---------|------|
| **General** | `entity`, `show_title` + `title`, `show_icon` + `icon`, `interpretation` + `neutral_threshold`, `aggregation` |
| **Time windows** | `comparison_preset`; **Custom settings** subsection: `time_window.anchor` / `duration` / `step` / `count` / `offset` (custom preset only) |
| **Panels** | `show_comparison_summary`, `show_chart` (always-on, disabled — the chart is always shown), `show_forecast_total_panel`, `show_narrative_comment` |
| **Formatting & Localization** | `language`; **Unit** subsection: `force_prefix`, `number_format`, `precision`; **Dates** subsection: `x_axis_format`, `tooltip_format` |
| **Chart settings** | `show_forecast`, `connect_nulls`, `show_legend` |
| **Style** | **two-column grid** — **Current series** subsection (first column): `primary_color`, `fill_current`, `fill_current_opacity`; **Reference series** subsection (second column): `fill_reference`, `fill_reference_opacity`; components of the same feature sit in the same row |
| **Diagnostics** | `debug` |

**Inline rows:** in **General**, `show_title` renders in the same row as `title` (to its right), `show_icon` in the same row as `icon`, and `interpretation` in the same row as `neutral_threshold`; each keeps its label-above-control layout, the primary field takes the available width, and the paired control is compact.

**`period_offset` is YAML-only.** It is a legacy value managed at the config level by the preset switch (removed on standard → `custom`, restored to `-1` on `custom` → standard) but it is not a control in the visual editor.

**Conditional rendering:** `comparison_preset: custom` shows the `time_window` sub-block (under the **Custom settings** subsection); a standard preset hides it. **Forecast line / panel independence:** `show_forecast` controls only the forecast line on the chart; the `show_forecast_total_panel` control is always enabled (independent of `show_forecast`), so the line and the panel can be toggled separately.

**Per-section documentation links:** every section header carries a help-circle icon that opens the wiki chapter covering that section's keys (in a new tab; clicking it does not collapse the section). The mapping is the `SECTION_DOCS_URLS` constant in `src/card/editor/field-registry.ts`:

| Section | Wiki chapter |
|---------|--------------|
| General | [Core configuration](#core-configuration) |
| Time windows | [Time Window Reference](Time-Window-Reference) |
| Panels | [Layout sections (Figma-aligned)](#layout-sections-figma-aligned) |
| Formatting & Localization | [Localization and number formatting](#localization-and-number-formatting) |
| Chart settings | [Forecast](#forecast) |
| Style | [Chart styling (fills, colors, gaps)](#chart-styling-fills-colors-gaps) |
| Diagnostics | [Debug](#debug) |

**Visual ↔ YAML round-trip:** both modes show the complete config; switching is lossless in both directions. YAML mode is a first-class input path (live preview, last valid values saved). The editor does not perform inline validation — invalid values surface as the standard card error.

### Visual → YAML mapping

Every editor control maps **1:1** to a YAML key — what you set in the form is exactly what is written to the config (the deprecated `comparison_mode` and the `forecast` alias are normalized away on save). The full mapping:

| Section | Control | YAML key |
|---------|---------|----------|
| General | Entity | `entity` |
| General | Show title / Title | `show_title` / `title` |
| General | Show icon / Icon | `show_icon` / `icon` |
| General | Interpretation / Neutral threshold | `interpretation` / `neutral_threshold` |
| General | Aggregation | `aggregation` |
| Time windows | Comparison preset | `comparison_preset` |
| Time windows → Custom settings | Anchor / Duration / Step / Count / Offset | `time_window.anchor` / `time_window.duration` / `time_window.step` / `time_window.count` / `time_window.offset` |
| Panels | Show comparison summary | `show_comparison_summary` |
| Panels | Show forecast & reference total panel | `show_forecast_total_panel` |
| Panels | Show narrative comment | `show_narrative_comment` |
| Formatting & Localization | Language | `language` |
| Formatting & Localization → Unit | Unit prefix / Number format / Precision | `force_prefix` / `number_format` / `precision` |
| Formatting & Localization → Dates | X-axis format / Tooltip format | `x_axis_format` / `tooltip_format` |
| Chart settings | Show forecast on chart / Connect nulls / Show legend | `show_forecast` / `connect_nulls` / `show_legend` |
| Style → Current series | Color / Fill / Fill opacity | `primary_color` / `fill_current` / `fill_current_opacity` |
| Style → Reference series | Fill / Fill opacity | `fill_reference` / `fill_reference_opacity` |
| Diagnostics | Debug | `debug` |

**Worked example.** Configuring the card entirely in the visual editor — preset **custom**, `anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 3`, `aggregation: month`, `primary_color: #119894`, `fill_reference: on` — produces exactly this YAML:

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_preset: custom
time_window:
  anchor: start_of_year
  duration: 1y
  step: 1y
  count: 3
aggregation: month
primary_color: "#119894"
fill_reference: true
```

**Preservative merge & round-trip.** A visual edit is applied with a **preservative deep merge**: changed fields are updated, `time_window` is merged key-by-key (editing `count` does not wipe `offset`), and **every key not modeled by the editor is preserved verbatim** — nothing is silently dropped. Because of this, Visual and YAML modes are two lossless views of the same config.

<!-- IMAGE PLACEHOLDER: Screenshot of the editor with the Time windows section expanded and the Custom settings subsection visible (comparison_preset set to custom, showing the anchor/duration/step/count/offset fields). -->

---

## Coverage note

When adding options in code, update **`src/card/types.ts`**, the editor schema, and this page in the same PR.
