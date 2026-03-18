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
- **Forecast** – Predicted total usage for the current period based on observed data, with confidence level
- **Flexible periods** – Year-over-year or month-over-year comparison
- **Aggregation** – Daily, weekly, or monthly aggregation of data
- **Localization (i18n)** – Card follows your Home Assistant language and number format. Optional per-card overrides: `language` and `number_format` in YAML. Supported languages include English, Polish, and German (others can be added via translation files).

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
| `show_forecast`   | boolean  | `false`            | Show forecast of total usage for current period                            |
| `precision`       | number   | `1`                | Decimal places for numeric values                                          |
| `title`           | string   | -                  | Optional card title. If not set (or empty), falls back to entity `friendly_name`, then entity ID. |
| `show_title`      | boolean  | `true`             | Show/hide the title text in the header                                     |
| `icon`            | string   | -                  | Optional icon (e.g. `mdi:flash`). If not set (or empty), card uses the entity icon (including Home Assistant’s default icon for that entity) |
| `show_icon`       | boolean  | `true`             | Show/hide the pictogram in the header                                      |
| `connect_nulls`  | boolean  | `true`             | Draw dashed interpolation segments across null (missing-data) days |
| `language`        | string   | from HA            | Override dashboard language for this card only (e.g. `en`, `pl`, `de`)     |
| `number_format`   | string   | from HA            | Override number format: `comma`, `decimal`, `language`, or `system`         |
| `primary_color`   | string   | accent color HA    | CSS color value for current series line, fill, and markers (e.g. `#E53935`). Fallback: `--accent-color` HA → `--primary-color` HA → `#03a9f4` |
| `fill_current`    | boolean  | `true`             | Show semi-transparent fill under the current series line                   |
| `fill_reference`  | boolean  | `false`            | Show semi-transparent fill under the reference series line                 |
| `fill_current_opacity` | number | `30`              | Opacity of current series fill (0–100)                                     |
| `fill_reference_opacity` | number | `30`             | Opacity of reference series fill (0–100)                                   |
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
show_forecast: true            # Show forecast line (default: true)
```

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

The forecast for the current period uses a **Historical Index** method that takes into account how the rest of the same month behaved in the previous year.

For daily aggregation we split the month into two parts:

- from day **1** to **yesterday** (completed days),
- from **today** to the **end of the month**.

Let:
- **A** – sum of usage in the current year from day 1 to yesterday,
- **B** – sum of usage in the previous year for the same days (day 1 to yesterday),
- **C** – sum of usage in the previous year from today to the end of the month,
- **k** – trend factor describing how this year compares to last year.

We compute:

- **k = A / B**
- **forecast_total = A + C * k**

The idea: we assume that the remaining part of the month will behave similarly to the same days last year, but scaled by the current trend \(k\) (you already use more or less energy than a year ago).

The confidence level is derived only from the number of **completed days**:
- **low** – fewer than 7 completed days,
- **medium** – from 7 to 13 completed days,
- **high** – 14 or more completed days.

## Troubleshooting

| Issue                           | Solution                                                                 |
|---------------------------------|---------------------------------------------------------------------------|
| "Custom element doesn't exist"  | Ensure the resource URL is correct and the file loads (check browser console) |
| No data / empty chart           | Verify the entity has statistics; check that the recorder is enabled     |
| Wrong units                     | Ensure all data points use the same unit of measurement                  |
| Card shows error                | Open browser console (F12) for details; verify entity ID is correct      |

## Development

```bash
npm install
npm run build    # Output: dist/energy-horizon-card.js
npm run dev      # Local dev server
npm test
npm run lint
```

## License

MIT
