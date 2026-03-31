# Forecast and Data Internals

**Explanation** — how the card uses Home Assistant data and what “forecast” means here. Most users can start with [Getting Started](Getting-Started); return here when you need the mental model.

## Long-term statistics (LTS) — what the card actually reads

Energy Horizon does **not** plot raw entity state history for every minute. It requests **long-term statistics** through Home Assistant’s statistics/recorder APIs (the same family of data used by the Energy Dashboard).

**Implications for you:**

- The **entity** you put in `entity:` must expose **long-term statistics**. Confirm in **Developer Tools → Statistics** (not just **States**).
- If the entity is wrong (instant power, or no LTS), the chart is usually **empty** — see [Troubleshooting and FAQ](Troubleshooting-and-FAQ).
- **Units** should be stable over time. If the entity changed units historically, comparisons and forecast quality can suffer.

## Comparison semantics (presets)

The card compares a **current** cumulative series to a **reference** series. Which calendar windows are used is driven by `comparison_preset` (YAML; the visual editor labels this **Comparison Preset**):

| `comparison_preset` | Meaning (user-facing) |
|---------------------|-------------------------|
| `year_over_year` | Current period vs the **same period one calendar year earlier** (year-over-year). |
| `month_over_year` | Current **calendar month** vs the **same calendar month in the previous year**. |
| `month_over_month` | **Current full calendar month** vs the **previous full calendar month** (two consecutive months). |

Legacy YAML may still use `comparison_mode`; **`comparison_preset` wins** if both are set. See [Configuration and Customization](Configuration-and-Customization#migration--legacy).

**Alignment:** Reference data is aligned to the current timeline so “elapsed vs elapsed” comparisons are fair (same point in the window, not mixed calendar shortcuts).

## Forecast model (high level)

Forecast **estimates the end-of-period total** for the **current** series by comparing how far you are through the period now vs how the **reference** period behaved in the **same elapsed slice**, then projecting the remainder.

It is **not** a weather or tariff model — it is a **statistics-driven projection** from your history.

## When forecast is shown (enablement rules)

Forecast is computed only when the data passes internal checks, including:

- the comparison window length is valid for the preset,
- enough **completed** buckets exist (minimum data rule),
- enough of the current period has elapsed (not only a tiny slice),
- a usable **reference** slice exists with a valid cumulative sum.

If any check fails, the forecast line may be **hidden** even when `show_forecast` is true — this is expected when data is too sparse.

## Time windows (multi-window YAML)

If you use advanced **`time_window`** YAML (merged with the preset), the chart can show **more than two** series. The **forecast denominator** uses the **current** window (index **0**), not the longest window on the X-axis. That keeps forecast consistent with the primary current-vs-reference pair. Details: repository spec `specs/001-time-windows-engine`.

## Confidence levels

The card exposes a **confidence** tier (low / medium / high) derived from how much of the period has elapsed. Extreme year-over-year ratio anomalies can cap confidence to **low**.

## Specs (implementation references)

For low-level formulas and unit scaling:

- `specs/001-compute-forecast/`
- `specs/004-smart-unit-scaling/`
