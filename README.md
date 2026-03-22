# Energy Horizon Card
[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy+me+a+coffee&emoji=&slug=hello.sebastian&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/hello.sebastian)

A Lovelace card for Home Assistant that compares cumulative energy usage between the current period and a corresponding historical period (year-over-year or month-over-year), with a chart, summary stats, and optional forecast.

![Home Assistant version](https://img.shields.io/badge/Home%20Assistant-2024.6%2B-blue)
![HACS](https://img.shields.io/badge/HACS-Custom-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Cumulative comparison chart** – Visual comparison of current vs. reference period (e.g. this month vs. same month last year)
- **Summary statistics** – Current cumulative, reference cumulative, difference and percentage
- **Text summary** – Localized heading describing the trend (higher/lower/similar)
- **Forecast** – Predicted total for the current period using a **time-aligned** reference split (works with gaps in statistics), **percentage-based** activation across the whole period (day/week/month), capped trend factor, and **confidence** derived from how much of the period has elapsed; extreme year-over-year ratios cap confidence at **low** (anomalous reference handling)
- **Flexible periods** – Year-over-year or month-over-year comparison
- **Aggregation** – Daily, weekly, or monthly aggregation of data
- **Localization (i18n)** – Card follows your Home Assistant language and number format. Optional per-card overrides: `language` and `number_format` in YAML. Supported languages include English, Polish, and German (others can be added via translation files).
- **Smart unit scaling** – Automatic or manual SI prefix scaling (Wh → kWh, A → mA, etc.) for readable chart labels and summary. Avoids „walls of zeros” on axes. Supports `auto`, `none`, or forced prefix (`k`, `M`, `G`, `m`, `µ`). Time units (h, min, s) and non-scalable units (%, °C) are left unchanged.

## Requirements

- Home Assistant **2024.6** or newer
- Long-term statistics recorder enabled for your energy entities
- An energy statistics entity (e.g. `sensor.grid_consumption` or a statistic from the Energy dashboard)

## Installation

### HACS (recommended)

1. In HACS, go to **Frontend** and click **Add repository**
2. Add the URL of this repository
3. Install **Energy Horizon Card**
4. Restart Home Assistant

### Manual

1. Download `energy-horizon-card.js` from the [latest release](/releases)
2. Place it in `config/www/` (or your `www` folder)
3. Add the resource in your dashboard configuration (see below)

## Configuration

### 1. Add the resource

In **Settings → Dashboards → Resources** (or your Lovelace YAML), add:

```yaml
url: /local/energy-horizon-card.js
type: module
```

*(If using HACS, the URL will typically be `/hacsfiles/energy-horizon-card/energy-horizon-card.js`)*

### 2. Add the card

Use the visual editor (add card → Manual) or YAML:

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy_statistic
comparison_mode: year_over_year
```

### Configuration options

| Option            | Type     | Default            | Description                                                                 |
|-------------------|----------|--------------------|-----------------------------------------------------------------------------|
| `type`            | string   | required           | Must be `custom:energy-horizon-card`                                      |
| `entity`          | string   | required           | Statistics entity ID (e.g. `sensor.grid_consumption`)                       |
| `comparison_mode` | string   | required           | `year_over_year` or `month_over_year`                                      |
| `aggregation`     | string   | `day`              | `day`, `week`, or `month`                                                  |
| `period_offset`   | number   | `-1`               | Offset for reference period (e.g. -1 = previous year)                      |
| `show_forecast`   | boolean  | —                  | `false` = hide forecast block and chart line. `true` = show forecast line on the chart when a forecast is enabled. If omitted, the forecast **summary** can still appear when the model is enabled; the **chart line** is drawn only when set to `true` (recommended: `true` if you want the line). |
| `precision`       | number   | `2`                | Decimal places for numeric values (chart, summary, tooltips)                |
| `title`           | string   | -                  | Optional card title. If not set (or empty), falls back to entity `friendly_name`, then entity ID. |
| `show_title`      | boolean  | `true`             | Show/hide the title text in the header                                     |
| `icon`            | string   | -                  | Optional icon (e.g. `mdi:flash`). If not set (or empty), card uses the entity icon (including Home Assistant’s default icon for that entity) |
| `show_icon`       | boolean  | `true`             | Show/hide the pictogram in the header                                      |
| `connect_nulls`  | boolean  | `true`             | Draw dashed interpolation segments across null (missing-data) days |
| `show_legend`     | boolean  | `false`            | Controls the **chart legend** in ECharts (series labels for current, reference, and forecast). `true` shows it; omitted or `false` hides it. **Does not** change the text/numeric summary above the chart (e.g. “Current period” / “Reference period” lines in `.ehc-stats`). |
| `language`        | string   | from HA            | Override dashboard language for this card only (e.g. `en`, `pl`, `de`)     |
| `number_format`   | string   | from HA            | Override number format: `comma`, `decimal`, `language`, or `system`         |
| `primary_color`   | string   | accent color HA    | CSS color value for current series line, fill, and markers (e.g. `#E53935`). Fallback: `--accent-color` HA → `--primary-color` HA → `#03a9f4` |
| `fill_current`    | boolean  | `true`             | Show semi-transparent fill under the current series line                   |
| `fill_reference`  | boolean  | `false`            | Show semi-transparent fill under the reference series line                 |
| `fill_current_opacity` | number | `30`              | Opacity of current series fill (0–100)                                     |
| `fill_reference_opacity` | number | `30`             | Opacity of reference series fill (0–100)                                   |
| `force_prefix`    | string  | — (same as `auto`) | SI unit scaling at **card root**: `auto` = choose prefix from data; `none` = raw values from HA; `k`, `M`, `G`, `m`, `u` = force a specific prefix. Omit for automatic scaling. |
| `debug`           | boolean  | `false`            | Log API query/response to browser console (F12) for troubleshooting        |

### Example configurations

**Year-over-year comparison:**
```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
aggregation: day
```

**Header options (title + icon):**
```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year

# Title (optional)
title: "My Solar Panels"
show_title: true      # set to false to hide title text

# Pictogram (optional)
icon: mdi:solar-power # e.g. any Home Assistant icon identifier like mdi:flash
show_icon: true       # set to false to hide the pictogram
```

If you omit `icon`, the card will **inherit the entity icon** (including Home Assistant’s default icon for that entity).  
If you set both `show_title: false` and `show_icon: false`, the entire header row is omitted.

**Month-over-year (current month vs. same month last year):**
```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: month_over_year
aggregation: day
show_forecast: true
```

**Language override (e.g. show this card in Polish while dashboard is in English):**
```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
language: pl
number_format: comma
```

**Chart customization (colors, fill, forecast):**
```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
aggregation: day

# Chart appearance
primary_color: "#E53935"       # Red color for current series
fill_current: true             # Show fill under current series (default: true)
fill_current_opacity: 20       # Adjust transparency (0–100, default: 30)
fill_reference: true           # Show fill under reference series (default: false)
fill_reference_opacity: 15     # Reference series transparency (0–100, default: 30)
show_forecast: true            # Forecast line on chart + summary when enabled (use false to hide all)
```

**Smart unit scaling (auto kWh for Wh entities):**
```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year

# Unit scaling — flat keys on the card (optional; omit force_prefix for auto)
force_prefix: auto   # auto = pick best prefix from data; none = raw values; k/m/M/G/u = force
precision: 2         # decimal places for displayed numbers
```

**Force specific unit prefix:**
```yaml
force_prefix: k      # always show kWh (e.g. 500 Wh → 0.5 kWh)
# or: force_prefix: none   # no scaling, show raw values from HA
```

Configuration for scaling and precision is **flat** at the card root (`force_prefix`, `precision`). There is no nested `unit_display` block; extra YAML keys are ignored by Home Assistant as usual, so an old `unit_display:` section would not apply—migrate to the keys above.

## Supported entities

The card uses the `recorder/statistics_during_period` API. Use entity IDs that have long-term statistics:

- Energy sensors from integrations (Shelly, Tasmota, etc.)
- Statistics from the Energy dashboard
- Entities that appear in **Developer Tools → Statistics**

## Theming and CSS customization

The card follows Home Assistant theming and automatically adapts to light/dark modes by using HA CSS variables such as:

- `--primary-color` / `--accent-color` – main line color for the current period,
- `--secondary-text-color` – line color for the reference period and secondary labels,
- `--divider-color` – grid color for chart axes.

Advanced users can further customize the layout using CSS classes exposed on the DOM:

| Section            | CSS class      |
|--------------------|----------------|
| Whole card         | `.ehc-card`    |
| Card content       | `.ehc-content` |
| Text heading       | `.ehc-header`  |
| Numeric summary    | `.ehc-stats`   |
| Forecast section   | `.ehc-forecast`|
| Chart container    | `.ehc-chart`   |

Example (with Card-Mod) – hide forecast section and increase chart height:

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
card_mod:
  style: |
    .ehc-forecast {
      display: none;
    }

    .ehc-chart {
      height: 260px;
    }
```

Internally, the card’s visual styles are grouped in a dedicated style module imported by the main component, so most visual changes can be done without touching the data/logic code.

## Forecast calculation

The card uses a **scaled remainder** model: compare how much energy you have used so far (**A**) to the reference period over the **same elapsed time** (**B**), then scale the reference period’s **remaining** amount (**C**) by a capped trend factor.

### When a forecast is shown (`enabled`)

The model runs only if all of the following hold:

- Valid **period length** in buckets: `periodTotalBuckets` is the length of the full comparison timeline (depends on `comparison_mode` and `aggregation`: e.g. days in the month or year).
- At least **3** completed buckets in the current series, and **≥ 5%** of the period completed:  
  `(currentPoints.length - 1) / periodTotalBuckets ≥ 0.05`.
- Reference series exists, aligns in time, and **B > 0** (sum of reference usage over the elapsed window).

### Time alignment (not index alignment)

The split between “elapsed” and “remainder” in the **reference** series uses **timestamps**, not array positions—so missing statistics in the middle of the period do not skew **B** and **C** the way a pure day-index split would.

For **year-over-year** and **month-over-year**, reference points come from a different calendar period (e.g. 2024 vs 2025). Before comparing with the cutoff, reference timestamps are **aligned to the current period axis** (same alignment as the chart): `refAlignedTs = refTimestamp + (currentStart − referenceStart)`. This ensures the "elapsed" portion **B** corresponds to the same portion of the period as the current series.

- **cutoff** = start of current series + (time span from first to last **completed** current point).
- **splitIdx** = last reference point whose **aligned** timestamp is `≤ cutoff`.
- If no such reference point exists, the forecast is disabled.

### Symbols and formula

Let:

- **A** – sum of `rawValue` over current points from the first bucket through the last **completed** bucket (all but the open “today” bucket).
- **B** – sum of reference `rawValue` from the first reference point through **splitIdx** (same elapsed window in time).
- **C** – sum of reference `rawValue` after **splitIdx** (the remainder of the reference period; **C** can be **0** if the reference series ends at the split—then `forecast_total = A`).
- **rawTrend** = **A / B**
- **trend** = `rawTrend` clamped to **[0.2, 5]**
- **forecast_total** = **A + C × trend**
- **reference_total** = **B + C** (reference period total implied by the same split)

Intuition: the rest of the period is assumed to track the reference remainder, scaled by how this period’s completed slice compares to the reference slice.

### Confidence (`low` / `medium` / `high`)

Based on the fraction of the period that has **completed** buckets:  
**pct** = `(currentPoints.length - 1) / periodTotalBuckets`

- **high** – pct ≥ **40%**
- **medium** – **20%** ≤ pct &lt; 40%
- **low** – pct &lt; 20%

If the year-over-year ratio is extreme (**rawTrend &lt; 0.3** or **rawTrend &gt; 3.3**), the reference year is treated as **anomalous**: confidence is forced to **low** (values **0.3** and **3.3** themselves are *not* flagged). The forecast value is still returned when otherwise enabled; the UI reflects the lowered confidence in the forecast note.

### Implementation note

Details and acceptance criteria for this logic live in [`specs/001-compute-forecast/`](specs/001-compute-forecast/) (spec, plan, tests).

## Smart unit scaling

The card scales energy and current values to readable SI prefixes (Wh → kWh, A → mA, etc.) based on the data range, avoiding cluttered axes with large raw numbers. Use root-level `force_prefix` and `precision` in YAML (not a nested section).

### Modes

- **`auto`** (default) – Choose prefix from maximum value in the series. ≥1000 → scale up (k, M, G); &lt;1 → scale down (m, µ).
- **`none`** – No scaling; display raw values and units from the entity.
- **`k`**, **`M`**, **`G`**, **`m`**, **`u`** – Force a specific prefix (e.g. always kWh even for small values).

### Non-scalable units

Time units (`h`, `min`, `s`) and units like `%` or `°C` are never scaled.

### Implementation note

Spec and tasks: [`specs/004-smart-unit-scaling/`](specs/004-smart-unit-scaling/).

## Troubleshooting

| Issue                           | Solution                                                                 |
|---------------------------------|---------------------------------------------------------------------------|
| "Custom element doesn't exist"  | Ensure the resource URL is correct and the file loads (check browser console) |
| No data / empty chart           | Verify the entity has statistics; check that the recorder is enabled     |
| No forecast / forecast disabled | Needs ≥3 completed buckets, ≥5% of the period elapsed, valid reference slice (**B** > 0), and time alignment; set `show_forecast: true` for the chart line |
| Wrong units                     | Ensure all data points use the same unit of measurement                  |
| Unit scaling unexpected         | Set `force_prefix: none` on the card to disable; check `unit_of_measurement` on the entity |
| Card shows error                | Open browser console (F12) for details; verify entity ID is correct      |

## Development

Stack: **TypeScript** (strict), **Lit** 3, **Apache ECharts** 5, **Vite** 6, **Vitest** 2.

```bash
npm install
npm run build    # Output: dist/energy-horizon-card.js
npm run dev      # Local dev server
npm test
npm run lint
```

## License

MIT
