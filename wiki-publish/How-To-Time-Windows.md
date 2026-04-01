# How-To: Time Windows

**How-to** — task-oriented recipes for `time_window`. Each section has a “done” criterion and a “when it fails” branch.

Before using recipes, it helps to understand the baseline model: [Mental Model: Comparisons and Timelines](Mental-Model-Comparisons-and-Timelines).

If you came here from the project README and want to get results quickly:

- For exact field definitions and limits: [Time Window Reference](Time-Window-Reference)
- For a ready-made setup: [First Comparisons: Quick Recipes](First-Comparisons-Quick-Recipes)

---

## How-to: add a 3rd historical context window (YoY + one extra year)

**Goal:** Show current year (window 0), last year (window 1), and the year before that (window 2) as a faint background.

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
time_window:
  anchor: start_of_year
  duration: 1y
  step: 1y
  count: 3
aggregation: month
```

**Expected outcome:** 3 series are visible; tooltip only shows 2 rows (current + reference). The third series is visual context only.

**When it fails:**

- If you get a point cap error, use a coarser aggregation (e.g. `month`) or reduce window length. See [How-To: Aggregation & Performance](How-To-Aggregation-and-Performance).

---

## How-to: compare the current month vs the previous full month (MoM)

**Goal:** Two consecutive calendar months (not “same month last year”).

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: month_over_month
aggregation: day
```

**Expected outcome:** Window 0 is the current calendar month, window 1 is the previous full calendar month.

**When it fails:**

- If you expected “same month in the previous year”, use `month_over_year` instead.

---

## How-to: build a fiscal year starting in October

**Goal:** Define a 12-month “year” that starts on Oct 1, and compare to the previous fiscal year.

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
time_window:
  anchor: start_of_year
  offset: "+9M"
  duration: 1y
  step: 1y
  count: 2
aggregation: month
```

**Expected outcome:** Window boundaries align to Oct–Sep in your HA time zone.

**When it fails:**

- If the card errors: validate tokens and hard limits in [Time Window Reference](Time-Window-Reference).

---

## How-to: show the last 6 full hours (hourly windows)

**Goal:** Plot 6 hourly windows (current hour + 5 previous hours) using LTS.

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: month_over_month
time_window:
  anchor: start_of_hour
  duration: 1h
  step: 1h
  count: 6
aggregation: hour
show_forecast: false
```

**Expected outcome:** 6 windows are plotted; tooltip remains focused on the first two windows.

**When it fails:**

- If your entity has no hourly LTS, you may see empty/no-data. Confirm statistics exist.
- If you try sub-hour windows (e.g. `30m`), config is rejected by design (LTS hard limit).

---

## How-to: shift the reference year by 2 years (legacy YoY/MoY)

**Goal:** Compare current period to a reference 2 years back.

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
period_offset: -2
aggregation: month
```

**Expected outcome:** Reference series is shifted by 2 years instead of 1.

**When it fails:**

- If you heavily customize `time_window`, you may move onto generic semantics; in that case prefer explicit windows with `step`/`count` instead of relying on `period_offset`.

---

## See also

- [Time Window Reference](Time-Window-Reference)
- [Troubleshooting and FAQ](Troubleshooting-and-FAQ)
