# Energy Horizon Card
[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy+me+a+coffee&emoji=&slug=hello.sebastian&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/hello.sebastian)
[![Buy me a coffee on buycoffee.to](https://buycoffee.to/static/img/share/share-button-primary.png)](https://buycoffee.to/hello.sebastian)

Energy Horizon Card is a Home Assistant Lovelace card for comparing cumulative energy usage between the current period and a historical one (year-over-year or month-over-year).

It is designed for long-term energy statistics (not live instant power charts).

![Home Assistant version](https://img.shields.io/badge/Home%20Assistant-2024.6%2B-blue)
![HACS](https://img.shields.io/badge/HACS-Custom-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Table of contents

- [What you get on the card](#what-you-get-on-the-card)
- [Before you start](#before-you-start)
- [Quick start (3 minutes)](#quick-start-3-minutes)
- [How to choose the right entity](#how-to-choose-the-right-entity)
- [Minimal configuration examples](#minimal-configuration-examples)
- [Beginner-friendly options](#beginner-friendly-options)
- [Forecast in plain words](#forecast-in-plain-words)
- [Visual Editor](#visual-editor)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Advanced documentation (Wiki)](#advanced-documentation-wiki)
- [Support and releases](#support-and-releases)
- [Development](#development)
- [License](#license)

## What you get on the card

- A chart comparing current cumulative energy vs. reference period (eg. same month but year ago)
- Forecast for the current period total
- Numeric summary (current, reference, difference, percentage)
- Localized trend text (higher/lower/similar)


![Energy Horizon Card screenshot](wiki-publish/energy-horizon-card.png)

## Before you start

You need:

- Home Assistant **2024.6+**
- Recorder and long-term statistics enabled
- An entity that appears in **Developer Tools -> Statistics**

If your entity does not have long-term statistics, the card will usually show no data.

## Quick start (3 minutes)

### 1) Install the card

**HACS (recommended):**

1. Open HACS -> **Frontend**
2. Click **Add repository**
3. Add this repository URL
4. Install **Energy Horizon Card**
5. Restart Home Assistant

**Manual installation:**

1. Download `energy-horizon-card.js` from [latest release](https://github.com/hello-sebastian/energy-horizon/releases/latest)
2. Copy it to `config/www/`
3. Add the resource (next step)

### 2) Add Lovelace resource

Go to **Settings -> Dashboards -> Resources** and add:

```yaml
url: /local/energy-horizon-card.js
type: module
```

If installed via HACS, resource URL is usually:

```yaml
url: /hacsfiles/energy-horizon-card/energy-horizon-card.js
type: module
```

### 3) Add the card

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy_statistic
comparison_mode: year_over_year
```

### 4) Confirm it works

After adding the card, you should see:

- two series (current and reference),
- non-empty summary values,
- expected energy unit (for example Wh or kWh).

If not, see [Troubleshooting](#troubleshooting).

## How to choose the right entity

This is the most common source of setup problems.

Use an entity that:

- appears in **Developer Tools -> Statistics**,
- represents cumulative energy-like data with stable unit,
- has real historical data (not just a few recent points).

Good examples:

- Energy sensors from integrations (Shelly, Tasmota, etc.)
- Statistics used in the Energy Dashboard
- Utility meter entities with proper long-term statistics

Common mistakes:

- Using entities that have no long-term statistics
- Using entities with changing units over time
- Using live power-only entities when you actually need energy history

## Minimal configuration examples

### Year-over-year

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
aggregation: day
```

### Month-over-year

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: month_over_year
aggregation: day
show_forecast: true
```

## Beginner-friendly options

Start with defaults. Change only what you need.

| Option | Default | Typical use |
|---|---|---|
| `entity` | required | Your statistics entity ID |
| `comparison_mode` | required | `year_over_year` for yearly trend, `month_over_year` for month trend |
| `aggregation` | `day` | Use `week`/`month` for less detail |
| `show_forecast` | `false` | Set `true` if you want forecast line on chart |
| `title` | auto | Custom card title |
| `icon` | entity icon | Custom icon, e.g. `mdi:flash` |
| `precision` | `2` | Number of decimals |
| `force_prefix` | `auto` | Unit scaling: `auto`, `none`, `k`, `M`, `G`, `m`, `u` |

Notes:

- `show_forecast: true` displays forecast line on chart when forecast is available.
- Use `u` in YAML for micro prefix (ASCII-safe form).

## Forecast in plain words

The card estimates current period total by comparing progress so far against the same part of a reference period.

Forecast may be unavailable when:

- there is not enough data in current period,
- the reference slice is missing or invalid,
- historical data quality is too low.

For the full algorithm and confidence rules, see Wiki:

- [Forecast and Data Internals](https://github.com/hello-sebastian/energy-horizon/wiki/Forecast-and-Data-Internals)

## Visual Editor

The card supports a **visual editor** for common options. In the Lovelace dashboard, open the card's **three-dot menu** -> **Edit** to configure the card. The editor panel is titled **Energy Horizon**.

- **Entity** - sensor-domain statistics entity (`entity` in YAML)
- **Title** - optional display name for the card header
- **Comparison Mode** - `year_over_year` or `month_over_year`. Labels are localized (e.g. English: "Year over year" / "Month over year"; Polish: "Rok do roku" / "Miesiac do miesiaca rok temu").
- **Unit Prefix** - `auto`, empty (base unit, no forced prefix), `none`, `G`, `M`, `k`, `m`, or `u` (same meaning as root-level `force_prefix` in YAML). The empty option appears first and means the base unit without scaling.

The editor includes a **YAML** (text) mode toggle so you can edit the **full** configuration, including advanced options such as colors and opacities. **YAML-only** fields are **preserved** when you use the visual form: keys not covered by the four fields above are kept when saving from the form.

## Troubleshooting

| Symptom | Most likely cause | What to check |
|---|---|---|
| "Custom element doesn't exist" | Resource not loaded | Resource URL and browser console (F12) |
| Empty chart / no data | Wrong entity or no statistics | Entity in **Developer Tools -> Statistics** |
| No forecast | Conditions not met or hidden line | Data coverage and `show_forecast: true` |
| Wrong units | Mixed or unexpected units in history | Entity `unit_of_measurement` consistency |
| Values look too big/small | Auto scaling not desired | Set `force_prefix: none` |
| Card error | Invalid config or entity ID typo | YAML keys and entity name |

## FAQ

### Does this card work without the Energy Dashboard?

Yes, as long as the selected entity has long-term statistics.

### What is the difference between `year_over_year` and `month_over_year`?

- `year_over_year`: compares current year period to previous year period.
- `month_over_year`: compares current month to the same month in previous year.

### Why do I not see forecast line?

Set `show_forecast: true`, then verify that enough valid data exists.

### Should I use `force_prefix`?

Usually no. Keep `auto` unless you want fixed units (for example always `kWh`).

## Advanced documentation (Wiki)

README is intentionally beginner-focused. Full technical docs live in Wiki:

- [Getting Started](https://github.com/hello-sebastian/energy-horizon/wiki/Getting-Started)
- [Configuration and Customization](https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization)
- [Forecast and Data Internals](https://github.com/hello-sebastian/energy-horizon/wiki/Forecast-and-Data-Internals)
- [Troubleshooting and FAQ](https://github.com/hello-sebastian/energy-horizon/wiki/Troubleshooting-and-FAQ)
- [Releases and Migration](https://github.com/hello-sebastian/energy-horizon/wiki/Releases-and-Migration)

## Support and releases

- Releases: [GitHub Releases](https://github.com/hello-sebastian/energy-horizon/releases)
- Issues: [GitHub Issues](https://github.com/hello-sebastian/energy-horizon/issues)
- Discussions: [GitHub Discussions](https://github.com/hello-sebastian/energy-horizon/discussions)

## Development

Stack: **TypeScript** (strict), **Lit** 3, **Apache ECharts** 5, **Vite** 6, **Vitest** 2.

```bash
npm install
npm run build
npm run dev
npm test
npm run lint
```

## License

MIT
