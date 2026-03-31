# Configuration and Customization

**Reference** for YAML keys accepted by the card, plus practical notes. **Naming authority:** implementation types in the repository (`src/card/types.ts`). If this page disagrees with the code, the code wins until the docs are fixed (FR-007).

## Core options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | required | Must be `custom:energy-horizon-card` |
| `entity` | string | required | Entity with **long-term statistics** |
| `comparison_preset` | string | `year_over_year` if omitted | `year_over_year`, `month_over_year`, or `month_over_month`. Visual editor: **Comparison Preset**. Legacy: `comparison_mode` (deprecated); if both set, **`comparison_preset` wins**. |
| `aggregation` | string | see merge rules | After merge with preset/`time_window`, one of `hour`, `day`, `week`, `month`. May be **omitted** for automatic selection from window `duration` (~20–100 slots). |
| `period_offset` | number | `-1` | Shifts the reference period by N comparable steps (e.g. `-1` = previous comparable period). |
| `time_window` | object | optional | Advanced YAML for custom windows (merged with preset). See [Time Windows (advanced)](https://github.com/hello-sebastian/energy-horizon/blob/main/specs/001-time-windows-engine/wiki-time-windows.md). |

## Display options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | entity name | Card title |
| `show_title` | boolean | `true` | Show title |
| `icon` | string | entity icon | Icon |
| `show_icon` | boolean | `true` | Show icon |
| `show_legend` | boolean | `false` | When `true`, shows the ECharts legend |
| `show_forecast` | boolean | `true` | Show forecast overlay when forecast is available. Alias: `forecast` (merged into `show_forecast` at load) |
| `primary_color` | string | optional | Primary accent (theme-aware if omitted) |

## Chart behavior (gaps, fills, legend)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `connect_nulls` | boolean | optional | If `true`, missing points get a visual bridge (dashed overlay); if `false`, gaps stay gaps |
| `fill_current` | boolean | optional | Area fill under current series |
| `fill_reference` | boolean | optional | Area fill under reference series |
| `fill_current_opacity` | number | optional | Opacity for current fill |
| `fill_reference_opacity` | number | optional | Opacity for reference fill |

## Units, precision, language

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `precision` | number | `2` | Decimal places in summary |
| `force_prefix` | string | `auto` | SI scaling: `auto`, `none`, or forced `k`, `M`, `G`, `m`, `u` |
| `language` | string | from HA | Overrides label/tooltip locale cascade |
| `number_format` | string | from HA | `comma`, `decimal`, `language`, `system` |

### Smart prefix scaling

- `auto`: pick prefix from data range  
- `none`: raw values from HA  
- `k`, `M`, `G`, `m`, `u`: forced prefix (`u` = micro in YAML)

Non-scalable units (e.g. `%`, `degC`) remain unscaled.

## Axis and tooltip (Luxon formats)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `x_axis_format` | string | optional | Luxon `toFormat` pattern for X ticks (HA time zone). Invalid pattern → **config error** at load. |
| `tooltip_format` | string | optional | Luxon pattern for tooltip header (same validation subset as `x_axis_format`) |

Default adaptive labeling when omitted: see [Aggregation and Axis Labels](Aggregation-and-Axis-Labels).

## Debugging

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | `false` | Logs extra diagnostics to **browser console** (use for troubleshooting only) |

## Comparison behavior (detail)

### `comparison_preset`

- `year_over_year` — current period vs same period one year earlier  
- `month_over_year` — current **calendar month** vs same month **previous year**  
- `month_over_month` — current **full calendar month** vs **previous full calendar month**

### `aggregation`

- `hour`, `day`, `week`, `month` — LTS aggregation step  
- If still unset after merge with preset/`time_window`, the card may **auto-pick** a step from merged `duration` (readability band; short windows force `hour`)

### `period_offset`

Shifts reference by N comparable periods (`-1` = previous).

## Migration / legacy

- **Canonical key:** `comparison_preset`  
- **Deprecated:** `comparison_mode` — still accepted; **`comparison_preset` takes precedence** if both are set. The visual editor saves `comparison_preset`.

## Theming and Card-Mod

The card follows HA theme variables:

- `--primary-color`
- `--accent-color`
- `--secondary-text-color`
- `--divider-color`

Exposed CSS classes:

- `.ehc-card`
- `.ehc-content`
- `.ehc-header`
- `.ehc-stats`
- `.ehc-forecast`
- `.ehc-chart`

Example:

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

## Coverage note (SC-001)

This table is intended to cover **all** user-facing keys on `CardConfig` / `CardConfigInput` for the current release. When adding options in code, update **`src/card/types.ts`**, the visual editor schema, and this page in the same PR whenever possible.
