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

## Visual editor vs YAML

Since **v1.2.0** the **visual editor** covers the **full configuration surface** — every option above (and the advanced ones: `time_window`, `x_axis_format` / `tooltip_format`, fills, `connect_nulls`, `debug`, …) is editable in the GUI across six sections. You do **not** need to switch to YAML for advanced fields.

YAML mode inside the editor is still available as a first-class input path (live preview, last valid values saved) — both modes show the complete config and switching between them is lossless. Use whichever you prefer.

---

## Common next steps

- Add a 3rd context series: [How-To: Time Windows](How-To-Time-Windows)
- Reduce points / fix performance: [How-To: Aggregation & Performance](How-To-Aggregation-and-Performance)
- Understand forecast: [Forecast and Data Internals](Forecast-and-Data-Internals)
- Fix empty charts: [Troubleshooting and FAQ](Troubleshooting-and-FAQ)

