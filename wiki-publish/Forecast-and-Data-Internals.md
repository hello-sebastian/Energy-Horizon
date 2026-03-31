# Forecast and Data Internals

This article covers advanced internals. Most users can skip it.

## Data source and assumptions

Energy Horizon reads long-term statistics via Home Assistant statistics API.

Assumptions:

- selected entity has long-term statistics,
- historical units are consistent,
- data coverage is sufficient for comparison.

Sparse or inconsistent data can reduce forecast availability or quality.

## Forecast model (high level)

Forecast compares current progress to the same elapsed slice of a reference period, then estimates the remaining part.

## Forecast enablement rules

Forecast is available only when:

- period length is valid,
- at least 3 completed buckets exist,
- at least 5% of period elapsed,
- aligned reference slice exists and has valid sum.

### Time Windows (multi-window configs)

The “period length” and elapsed fraction use the **current window** (index 0) bucket count. The chart X-axis may span a **longer** window (longest span among series), but that axis length is **not** used as the forecast denominator. This keeps `computeForecast` consistent with the current-vs-reference pair; see `specs/001-time-windows-engine` (FR-017).

## Confidence levels

Confidence is derived from elapsed period fraction.
It can be capped to low for anomalous year-over-year trend ratios.

## Comparison semantics

### `year_over_year`

Compares current period to the same period one year earlier.

### `month_over_year`

Compares current month to the same month in previous year.

### Alignment note

Reference data is aligned to current timeline for fair elapsed-vs-elapsed comparison.

## Specs

For implementation-level details, see:

- `specs/001-compute-forecast/`
- `specs/004-smart-unit-scaling/`
