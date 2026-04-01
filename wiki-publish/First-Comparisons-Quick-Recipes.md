# First Comparisons: Quick Recipes

**Tutorial / quick-start companion** — copy/paste working YAML for the most common comparisons, with a short “what you should see” section.

If you need the full option reference, use [Configuration and Customization](Configuration-and-Customization).

---

## Prerequisite (do this first)

Your `entity` must have **long-term statistics** (LTS). Check in **Developer Tools → Statistics**.

If it’s missing there, the card usually renders an empty chart.

---

## Recipe: Year-over-year (this year so far vs reference year)

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy
comparison_preset: year_over_year
aggregation: month
```

**What you should see:** Two series (current + reference), cumulative numbers, and optionally a forecast line when data rules allow.

---

## Recipe: Month-over-year (this month vs same month last year)

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy
comparison_preset: month_over_year
aggregation: day
```

**What you should see:** Current calendar month vs the same calendar month one year earlier.

---

## Recipe: Month-over-month (this month vs previous full month)

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy
comparison_preset: month_over_month
aggregation: day
```

**What you should see:** Two consecutive calendar months (not “same month last year”).

---

## When to use the visual editor vs YAML

- Use the **visual editor** when you only need `entity`, `comparison_preset`, and basic display options.
- Switch to **YAML** when you need any of:
  - `time_window` recipes
  - `x_axis_format` / `tooltip_format`
  - `connect_nulls`, fills, fine styling
  - `debug: true`

---

## Common next steps

- Add a 3rd context series: [How-To: Time Windows](How-To-Time-Windows)
- Reduce points / fix performance: [How-To: Aggregation & Performance](How-To-Aggregation-and-Performance)
- Understand forecast: [Forecast and Data Internals](Forecast-and-Data-Internals)
- Fix empty charts: [Troubleshooting and FAQ](Troubleshooting-and-FAQ)

