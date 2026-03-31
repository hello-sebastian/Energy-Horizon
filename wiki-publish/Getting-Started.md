# Getting Started

This guide is for new and casual Home Assistant users who want a working card quickly.

## 1) Requirements

- Home Assistant `2024.6+`
- Recorder and long-term statistics enabled
- An entity visible in **Developer Tools -> Statistics**

If the entity has no statistics, the chart will usually be empty.

## 2) Install the card

### HACS (recommended)

1. Open **HACS -> Frontend**
2. Click **Add repository**
3. Add `https://github.com/hello-sebastian/Energy-Horizon`
4. Install **Energy Horizon Card**
5. Restart Home Assistant

### Manual installation

1. Download `energy-horizon-card.js` from latest release
2. Copy it to `config/www/`
3. Add resource:

```yaml
url: /local/energy-horizon-card.js
type: module
```

HACS resource URL is usually:

```yaml
url: /hacsfiles/energy-horizon-card/energy-horizon-card.js
type: module
```

## 3) Add your first card

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy_statistic
comparison_preset: year_over_year
aggregation: day
```

The forecast line on the chart is **on by default**. Set `show_forecast: false` only if you want to hide it.

### Optional: compare consecutive months

If you want **this calendar month** vs the **previous full month** (not “same month last year”), use:

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy_statistic
comparison_preset: month_over_month
aggregation: day
```

## 4) Choose the right entity

Use entities that:

- are present in **Developer Tools -> Statistics**,
- have stable `unit_of_measurement`,
- contain enough historical data.

Good candidates:

- Utility meter entities with statistics
- Energy Dashboard statistics
- Integration sensors exposing cumulative energy

Common mistakes:

- entity has no statistics history,
- historical units changed,
- selecting instant power sensor instead of cumulative energy sensor.

## 5) Quick validation checklist

After saving card config, verify:

- chart has current + reference series,
- summary values are non-empty,
- unit is what you expect (for example `kWh`).

If not, go to [Troubleshooting and FAQ](Troubleshooting-and-FAQ).

## Migration / Legacy

Older examples may use `comparison_mode` instead of `comparison_preset`. Both keys are still read; prefer **`comparison_preset`** in new YAML. If both are set, **`comparison_preset` wins**. See [Configuration and Customization](Configuration-and-Customization.md#migration--legacy).
