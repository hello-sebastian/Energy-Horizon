# Forecast and Data Internals

**Explanation** — how the card turns Home Assistant long-term statistics into a comparison chart, and what “forecast” means (and does not mean) in this context.

If you want the mental model of windows + timelines first, read:

- [Mental Model: Comparisons and Timelines](Mental-Model-Comparisons-and-Timelines)

If you came here from the project README and want to *do something specific*:

- Hide/show the dashed line: [`show_forecast`](Configuration-and-Customization#forecast)
- Troubleshoot missing forecast: [Troubleshooting and FAQ](Troubleshooting-and-FAQ)

---

## Data source: Long-term statistics (LTS)

Energy Horizon **does not** read raw history points (minute-by-minute state history). It requests **long-term statistics** via Home Assistant’s recorder/statistics APIs.

**What this implies for advanced users:**

- Your `entity:` must have statistics visible in **Developer Tools → Statistics**.
- If your entity is instant power (W) without LTS, the card will usually show **empty/no data**.
- Unit consistency matters: if your entity’s historical units changed, comparisons and forecast assumptions can degrade.

---

## From LTS points to chart values (the pipeline)

### 1) Per-window LTS queries

For each resolved time window, the card builds one WebSocket request:

- `recorder/statistics_during_period`

### 2) “Which value is used?” (sum > change > state > min/max)

Each returned point may carry multiple numeric fields. The card prefers:

1. `sum` (converted into increments via delta between consecutive sums)
2. else `change`
3. else `state`
4. else, when none of the above are present as usable numbers, **`max - min`** on that row (requires finite `min` and `max`). Rows where `max - min` is negative are **skipped** (typical for non-monotonic measurement sensors).

This preference exists to keep cumulative energy math consistent when `sum` is available.

**Timestamp for `sum` deltas:** each increment (current row’s `sum` minus previous row’s `sum`) is the energy for the interval **between** those rows. The card stores that increment at the **previous row’s `start`** — i.e. the **start of the LTS aggregation bucket** that increment belongs to. That matches the chart’s timeline slots (bucket starts in the Home Assistant time zone), so the first plotted value lines up with the first axis tick (e.g. day 1 of the month at `aggregation: day`), not the next bucket. Rows that only use `change`, `state`, or the **`max - min`** fallback use each row’s **own `start`** as the timestamp (same as `change` / `state`; see **FR-DATA-2** in spec 006).

**`max - min` caveat:** Home Assistant often stores only `mean` / `min` / `max` for `state_class: measurement`. That works for a **monotonic cumulative-style** template (issue #45) but is not a substitute for correct entity semantics—use **`state_class: total_increasing`** when the entity is a real cumulative meter so LTS includes **`sum`**.

### 3) Cumulative series (running total)

The plotted series is cumulative: each slot is the running total up to that point.

---

## Comparison semantics (presets in plain language)

The card compares a **current** cumulative series to a **reference** series. The baseline windows come from:

- `comparison_preset` (YAML key; editor label: **Comparison Preset**)

| Preset | User-facing meaning |
|--------|---------------------|
| `year_over_year` | Current year **so far** vs a reference year (default: previous year) |
| `month_over_year` | Current month **so far** vs the same calendar month in the reference year |
| `month_over_month` | Current calendar month vs the previous full calendar month |

Legacy `comparison_mode` may exist in old dashboards, but **`comparison_preset` wins** when both are set.

---

## Forecast: what it is (and what it is not)

Forecast is a **statistics-driven end-of-period estimate** for the current series. It projects the remainder of the current period using the reference series profile.

It is **not** a weather model, price model, or machine-learning predictor.

---

## When forecast is enabled (gating rules)

Forecast requires a meaningful comparison context and a minimum amount of progress/data.

### Required conditions (high signal)

- There must be **at least two windows** (a reference series must exist).
- The period must have a finite, positive bucket count (current period only).
- You must have at least **3 completed buckets**.
- You must be at least **5%** through the current period.

If any condition fails, forecast is **disabled** even if `show_forecast: true`.

### Confidence tiers

When enabled, confidence is derived from period progress:

- **low**: 5%–20%
- **medium**: 20%–40%
- **high**: ≥ 40%

Additionally, the card can detect an **anomalous reference** year (extreme ratio vs reference) and cap confidence to **low**.

---

## Multi-window charts: what forecast uses as the denominator

If you define multiple windows with different lengths, the X-axis can be longer than the current period. Tick dates follow **window 0’s** calendar for the prefix and **ordinal** extra slots for the tail; the “now” marker is based on **window 0**, not the reference calendar alone.

Forecast progress thresholds use **only window 0 (current)** bucket count as the denominator — not the longest axis.

This keeps forecast semantics stable: it always answers “where will the **current period** end up?”.

---

## “Why is my forecast missing?” (fast diagnostics)

1. Confirm you have **two windows** (count ≥ 2) and a reference series exists.
2. Ensure you are far enough into the period (≥ 5%) and have ≥ 3 completed buckets.
3. If data is sparse/inconsistent, forecast suppression can be normal.

See also:

- [Troubleshooting and FAQ](Troubleshooting-and-FAQ)

---

## Specs (implementation references)

- `specs/001-compute-forecast/`
- `specs/001-time-windows-engine/`
- `specs/006-time-windows-unify/`
- `specs/004-smart-unit-scaling/`
