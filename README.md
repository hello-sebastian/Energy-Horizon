# Energy Horizon Card

Elegant energy comparisons for Home Assistant dashboards — **cumulative usage** now vs a historical reference, with optional forecast.

![Home Assistant version](https://img.shields.io/badge/Home%20Assistant-2024.6%2B-blue)
![HACS](https://img.shields.io/badge/HACS-Custom-orange)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

<!-- IMAGE PLACEHOLDER: High-quality screenshot/GIF of the card with an active tooltip and visible current-vs-reference comparison. -->
<!-- Example: a phone-width view + desktop-width view, if possible. -->

- **Clear comparisons**: see “this period so far” vs a reference period at a glance.
- **Readable timelines**: smart axis labels that stay legible on mobile.
- **Always-usable charts**: automatic aggregation keeps the chart clean.
- **Optional forecast**: a dashed estimate for the period total when it’s meaningful.

> This card is built for **long-term statistics** (energy history), not live power charts.

![Energy Horizon Card screenshot](wiki-publish/ehorizon-screenshot.png)

## Quick start (copy/paste)

### 1) Install

- **HACS (recommended)**: HACS → **Frontend** → **Add repository** → install **Energy Horizon Card** → restart Home Assistant.
- **Manual**: download `energy-horizon-card.js` from the [latest release](https://github.com/hello-sebastian/energy-horizon/releases/latest) → copy to `config/www/`.

### 2) Add the Lovelace resource

Settings → Dashboards → Resources:

```yaml
url: /hacsfiles/energy-horizon-card/energy-horizon-card.js
type: module
```

Manual installs usually use:

```yaml
url: /local/energy-horizon-card.js
type: module
```

### 3) Add the card

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy_statistic
comparison_preset: year_over_year
```

### 4) If you see an empty chart

Most often, the selected entity has **no long-term statistics**.

- Check Home Assistant **Developer Tools → Statistics**.
- Then follow: [Troubleshooting and FAQ](https://github.com/hello-sebastian/energy-horizon/wiki/Troubleshooting-and-FAQ).

## Basic configuration (first knobs to turn)

These are the options most people adjust first. Everything else is in the Wiki and `README.advanced.md`.

| Option | What it does | Learn more |
|---|---|---|
| `comparison_preset` | Pick the comparison: year-over-year / month-over-year / month-over-month. | [First Comparisons: Quick Recipes](https://github.com/hello-sebastian/energy-horizon/wiki/First-Comparisons-Quick-Recipes) |
| `aggregation` | Control the chart resolution (`hour`/`day`/`week`/`month`) or omit for auto. | [How-To: Aggregation & Performance](https://github.com/hello-sebastian/energy-horizon/wiki/How-To-Aggregation-and-Performance) |
| `show_forecast` | Show/hide the dashed forecast line. | [Forecast and Data Internals](https://github.com/hello-sebastian/energy-horizon/wiki/Forecast-and-Data-Internals) |
| `precision` | Decimal places for UI numbers. | [Configuration and Customization](https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization) |
| `force_prefix` | Unit scaling (`auto`, `none`, `k`, `M`, …). | [Configuration and Customization](https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization) |
| `primary_color` | Current series line/fill color; default is the card’s brand teal (`#119894`). Use `ha-primary` or `var(--primary-color)` to follow your HA theme. | [`README.advanced.md`](./README.advanced.md) |
| `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment` | Hide specific card sections (comparison panel, Forecast \| Total panel, narrative comment). | [Configuration and Customization](https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization) |
| `title`, `icon` | Card header customization. | [Configuration and Customization](https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization) |

## Key features (in plain words)

### Smart X-axis (labels that “just make sense”)

The card adjusts date/time labels automatically so they stay readable (especially on phones). With **two or more windows**, the shared axis length follows the **largest nominal slot count** at the chart’s aggregation (e.g. February vs March at daily grain uses 31 slots); tick dates follow **window 0’s** calendar (with an ordinal tail if the axis is longer), and the **“now”** marker is based on today **inside window 0**. **Forecast progress** still uses **window 0** only, so the axis can be longer than the forecast period. **Tooltip** headers use that same slot index and the **Home Assistant time zone** for calendar text (not the browser’s zone). For YoY/MoY/MoM, adaptive labels drop redundant years or months so the axis matches the comparison story (see wiki mental model). **Long-term statistics** that expose **`sum`** are mapped so each daily (or hourly) increment sits under the correct calendar bucket on that axis; when LTS has only **`min`**/**`max`** (common for misclassified cumulative templates), increments use **`max - min`**. See [Forecast and Data Internals](https://github.com/hello-sebastian/energy-horizon/wiki/Forecast-and-Data-Internals) and [README.advanced](README.advanced.md).

- Learn more: [Aggregation and Axis Labels](https://github.com/hello-sebastian/energy-horizon/wiki/Aggregation-and-Axis-Labels)

### Automatic aggregation

If you don’t set `aggregation`, the card picks a sensible bucket size so you get a clear chart instead of thousands of cramped points.

- Learn more: [How-To: Aggregation & Performance](https://github.com/hello-sebastian/energy-horizon/wiki/How-To-Aggregation-and-Performance)

### Forecast

When there’s enough data and a valid reference, the dashed line estimates the period total based on your history.

- Learn more: [Forecast and Data Internals](https://github.com/hello-sebastian/energy-horizon/wiki/Forecast-and-Data-Internals)

## Advanced configuration (power users)

Want more control? Start here:

- **Custom time windows** (`time_window`):
  - How-to: [How-To: Time Windows](https://github.com/hello-sebastian/energy-horizon/wiki/How-To-Time-Windows)
  - Reference: [Time Window Reference](https://github.com/hello-sebastian/energy-horizon/wiki/Time-Window-Reference)
- **Date formatting (Luxon)** (`x_axis_format`, `tooltip_format`):
  - Reference: [Luxon Formats Reference](https://github.com/hello-sebastian/energy-horizon/wiki/Luxon-Formats-Reference)
- **Full YAML reference (authoritative)**:
  - [`README.advanced.md`](./README.advanced.md)
  - Wiki: [Configuration and Customization](https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization)

## Visual editor

Select the card and open its **editor** (pencil icon) to configure everything visually — no YAML required. The editor covers **all 27 user-configurable fields** in **8 sections**. The first three are always visible; the other five are collapsed under **Advanced** (click to expand). Every change is written back to the card's YAML, and fields you don't touch are preserved.

| Section | Field | Control | Default |
|---|---|---|---|
| **Comparison** | `entity` | entity picker (`sensor`) | required |
| | `title` | text | entity name |
| | `comparison_preset` | select | `year_over_year` |
| | `force_prefix` | select (list) | `auto` |
| | `show_comparison_summary` | toggle | on |
| | `show_forecast_total_panel` | toggle | on |
| | `show_narrative_comment` | toggle | on |
| **Header** | `show_title` | toggle | on |
| | `icon` | select (entity icon / custom) | entity icon |
| | `show_icon` | toggle | on |
| **Forecast** | `show_forecast` | toggle | on |
| **Time window** *(advanced)* | `aggregation` | select (list) | `auto` |
| | `period_offset` | number | `-1` |
| | `time_window` | nested (anchor, offset, duration, step, count, aggregation) | preset template |
| **Chart style** *(advanced)* | `fill_current` | toggle | on |
| | `fill_reference` | toggle | off |
| | `fill_current_opacity` | number (0–100) | `30` |
| | `fill_reference_opacity` | number (0–100) | `30` |
| | `primary_color` | text | `#119894` |
| | `connect_nulls` | toggle | on |
| | `show_legend` | toggle | off |
| **Localization** *(advanced)* | `language` | select | HA language |
| | `number_format` | select (list) | system |
| | `precision` | number (0–6) | `2` |
| **Date formats** *(advanced)* | `x_axis_format` | text | adaptive |
| | `tooltip_format` | text | adaptive |
| **Diagnostics** *(advanced)* | `debug` | toggle | off |

For the full field reference (types, validation, and behavior) see [`README.advanced.md`](./README.advanced.md) and the [Configuration and Customization](https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization) wiki page.

## Documentation map

- **Wiki Home (Diátaxis map)**: [Energy Horizon Wiki](https://github.com/hello-sebastian/energy-horizon/wiki)
- **Advanced reference**: [`README.advanced.md`](./README.advanced.md)

## Support and releases

- Releases: [GitHub Releases](https://github.com/hello-sebastian/energy-horizon/releases)
- Issues: [GitHub Issues](https://github.com/hello-sebastian/energy-horizon/issues)
- Discussions: [GitHub Discussions](https://github.com/hello-sebastian/energy-horizon/discussions)

If this card saves you time, you can support development:

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy+me+a+coffee&emoji=&slug=hello.sebastian&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/hello.sebastian)

## Development

Stack: **TypeScript** (strict), **Lit** 3, **Apache ECharts** 5, **Luxon** 3 (time windows), **Vite** 6, **Vitest** 2.

User-visible strings live in [`src/translations/`](./src/translations/) (`en.json` is the key reference). Use **one full sentence per message** with `{{camelCase}}` placeholders for injected values — see [`specs/002-i18n-localization/`](./specs/002-i18n-localization/).

```bash
npm install
npm run build
npm run dev
npm test
npm run lint
```

## License

Energy Horizon
Copyright (C) 2026 Sebastian Sikora
https://github.com/hello-sebastian/Energy-Horizon

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
