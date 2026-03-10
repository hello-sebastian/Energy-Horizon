# Energy Burndown Card

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

## Requirements

- Home Assistant **2024.6** or newer
- Long-term statistics recorder enabled for your energy entities
- An energy statistics entity (e.g. `sensor.grid_consumption` or a statistic from the Energy dashboard)

## Installation

### HACS (recommended)

1. In HACS, go to **Frontend** and click **Add repository**
2. Add the URL of this repository
3. Install **Energy Burndown Card**
4. Restart Home Assistant

### Manual

1. Download `energy-burndown-card.js` from the [latest release](/releases)
2. Place it in `config/www/` (or your `www` folder)
3. Add the resource in your dashboard configuration (see below)

## Configuration

### 1. Add the resource

In **Settings → Dashboards → Resources** (or your Lovelace YAML), add:

```yaml
url: /local/energy-burndown-card.js
type: module
```

*(If using HACS, the URL will typically be `/hacsfiles/energy-burndown-card/energy-burndown-card.js`)*

### 2. Add the card

Use the visual editor (add card → Manual) or YAML:

```yaml
type: custom:energy-burndown-card
entity: sensor.your_energy_statistic
comparison_mode: year_over_year
```

### Configuration options

| Option            | Type     | Default            | Description                                                                 |
|-------------------|----------|--------------------|-----------------------------------------------------------------------------|
| `type`            | string   | required           | Must be `custom:energy-burndown-card`                                      |
| `entity`          | string   | required           | Statistics entity ID (e.g. `sensor.grid_consumption`)                       |
| `comparison_mode` | string   | required           | `year_over_year` or `month_over_year`                                      |
| `aggregation`     | string   | `day`              | `day`, `week`, or `month`                                                  |
| `period_offset`   | number   | `-1`               | Offset for reference period (e.g. -1 = previous year)                      |
| `show_forecast`   | boolean  | `true`             | Show forecast of total usage for current period                            |
| `precision`       | number   | `1`                | Decimal places for numeric values                                          |
| `title`           | string   | -                  | Optional card title                                                        |
| `debug`           | boolean  | `false`            | Log API query/response to browser console (F12) for troubleshooting        |

### Example configurations

**Year-over-year comparison:**
```yaml
type: custom:energy-burndown-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
aggregation: day
```

**Month-over-year (current month vs. same month last year):**
```yaml
type: custom:energy-burndown-card
entity: sensor.energy_consumption_total
comparison_mode: month_over_year
aggregation: day
show_forecast: true
```

## Supported entities

The card uses the `recorder/statistics_during_period` API. Use entity IDs that have long-term statistics:

- Energy sensors from integrations (Shelly, Tasmota, etc.)
- Statistics from the Energy dashboard
- Entities that appear in **Developer Tools → Statistics**

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
npm run build    # Output: dist/energy-burndown-card.js
npm run dev      # Local dev server
npm test
npm run lint
```

## License

MIT
