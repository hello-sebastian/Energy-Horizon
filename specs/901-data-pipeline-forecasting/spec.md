# 901-data-pipeline-forecasting
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Data Pipeline & Forecasting  
**Replaces**: `001-compute-forecast`  
**Primary code**: `src/card/ha-api.ts`  
**Last updated**: 2026-04-21  

---

<!-- NORMATIVE -->

## Current Behavior (normative)

This domain covers the data pipeline from Home Assistant Long-Term Statistics (LTS) to the chart renderer, and the `computeForecast` function that projects period-end energy consumption.

### LTS data fetching

For each `ComparisonWindow` the card calls the HA statistics API with the window's `start`/`end` boundaries and the effective `aggregation`. Fetches for multiple windows may be issued in parallel. The results are normalized, sorted by timestamp, and converted to cumulative series (`toCumulativeSeries`).

### `buildChartTimeline` / `forecastPeriodBuckets`

`buildChartTimeline` in `ha-api.ts` produces `timeline[]` (shared X-axis slot timestamps) and `forecastPeriodBuckets` — the nominal slot count of window 0 (current) at its aggregation grain. `forecastPeriodBuckets` is derived solely from window 0's `start`/`end`/`aggregation`; it is **not** equal to `timeline.length` when Longest-window axis span is in effect.

### `computeForecast`

`computeForecast(currentPoints, periodTotalBuckets, referencePoints)` projects the current window's end-of-period consumption using a trend factor derived from the reference series.

**Activation gates** (all must pass for `enabled: true`):
- `periodTotalBuckets > 0`
- `completedBuckets = currentPoints.length - 1 ≥ 3`
- `pct = completedBuckets / periodTotalBuckets ≥ 0.05`
- `splitIdx` exists (≥ 0) — at least one reference point falls within `currentRangeMs`
- `B > 0` (reference has non-zero data in the current time range)

**Confidence levels** (when enabled):
- `pct ≥ 0.40` → `"high"`
- `pct ≥ 0.20` → `"medium"`
- otherwise → `"low"`

**Anomaly detection**: If `rawTrend = A / B` is outside `(0.3, 3.3)` exclusive, `anomalousReference: true` is set and confidence is forced to `"low"` regardless of `pct`.

**Forecast formula**: `trend = clamp(rawTrend, 0.2, 5)`, `forecast_total = A + C * trend`.

**Special cases**:
- `C = 0`: `forecast_total = A`; anomaly detection still applies.
- `B = 0` or `rawTrend === Infinity`: `enabled: false`.
- Boundary values (`rawTrend === 0.3` or `rawTrend === 3.3`): NOT treated as anomaly (strict `<`/`>`).

### Split-point alignment

The split index (`splitIdx`) divides the reference series into "past" (B) and "future" (C) portions. It is determined by the time range of the current data (`currentRangeMs = currentPoints[completedBuckets-1].timestamp - currentPoints[0].timestamp`), not by array index. Reference points are guaranteed sorted by `normalizePoints()` before `computeForecast` receives them.

---

## Public Contract

```typescript
// Input types
interface ForecastPoint {
  timestamp: number;    // Unix ms
  rawValue: number;     // per-bucket increment (not cumulative)
}

// Function signature
function computeForecast(
  currentPoints: ForecastPoint[],
  periodTotalBuckets: number,     // nominal slot count of window 0 only
  referencePoints: ForecastPoint[]
): ForecastStats;

// Output type
interface ForecastStats {
  enabled: boolean;
  confidence: 'low' | 'medium' | 'high';
  forecast_total: number;
  anomalousReference?: boolean;   // absent = false
}
```

`forecastPeriodBuckets` passed from the call site in `cumulative-comparison-chart.ts` MUST be `buildChartTimeline`'s output for window 0 — never `timeline.length` when windows have different nominal lengths.

---

## Cross-domain Contracts

**Consumes from**:
- `900-time-model-windows`: `ComparisonWindow[]` with `start`, `end`, `aggregation` for each window; `forecastPeriodBuckets` = window 0 nominal slot count.
- `905-localization-formatting`: HA instance IANA time zone (used for timestamp interpretation in `buildChartTimeline`).

**Publishes to**:
- `902-chart-rendering-interaction`: `ComparisonSeries[]` (cumulative series aligned to `timeline[]`), `timeline[]`, `forecastPeriodBuckets`, `ForecastStats`.
- `903-card-ui-composition`: `ForecastStats` for rendering the forecast summary chip/value in the card header.

---

## Non-Goals

- Changing the HA LTS data model or statistics API.
- Machine-learning or non-linear forecast models.
- Per-entity anomaly thresholds (threshold `0.3`/`3.3` is fixed).
- Sub-hour aggregation (excluded until LTS supports it).
- Changing `computeSummary`, `computeTextSummary`, `buildComparisonPeriod`, or the chart renderer interface.

---

<!-- EXECUTION -->

## User Stories

### US-901-1 — Semantically consistent forecast activation across period lengths (P1)

As a user comparing year-over-year or month-over-year, I need the forecast to activate when a meaningful fraction of the current period has elapsed (e.g. 5%), not after a fixed number of buckets that means different things for a 30-day vs 365-day period, so the forecast threshold feels equally credible regardless of the window length.

**Independent test**: Call `computeForecast` with year-level data (365 buckets total, 4 completed) and month-level data (30 buckets total, 4 completed) — the activation decision differs based on `pct`, not the absolute bucket count alone.

**Acceptance Scenarios**:

1. **Given** 2 completed buckets out of 365 (`pct ≈ 0.005`), **When** `computeForecast` is called, **Then** the result has `enabled: false` (below 5% threshold and below 3-bucket floor).
2. **Given** 4 completed buckets out of 30 (`pct ≈ 0.13`), **When** `computeForecast` is called, **Then** `enabled: true` and `confidence: "low"` (≥ 3 buckets, 5% ≤ pct < 20%).
3. **Given** 7 completed buckets out of 30 (`pct ≈ 0.23`), **When** `computeForecast` is called, **Then** `enabled: true` and `confidence: "medium"` (20% ≤ pct < 40%).
4. **Given** 13 completed buckets out of 30 (`pct ≈ 0.43`), **When** `computeForecast` is called, **Then** `enabled: true` and `confidence: "high"` (pct ≥ 40%).

---

### US-901-2 — Correct split alignment with data gaps (P1)

As a user whose HA instance had a data collection gap, I need the forecast to remain correct by splitting the reference series at the correct time boundary — not at a raw array index — so a gap in the current series does not silently shift the "past reference" vs "future reference" division.

**Independent test**: Unit test with a current series that has a time gap in the middle and a continuous reference series; verify `splitIdx`, B, and C are computed correctly.

**Acceptance Scenarios**:

1. **Given** the current series has a gap (missing middle bucket) and the reference is continuous, **When** `computeForecast` is called, **Then** `splitIdx` is derived from `currentRangeMs` (time-based), and B/C reflect the correct reference proportions.
2. **Given** the reference series has a gap, **When** `computeForecast` is called, **Then** `splitIdx` is still time-based; result is `enabled: true` if other activation gates are met.
3. **Given** all reference points have timestamps later than `currentRangeMs`, **When** `computeForecast` is called, **Then** `enabled: false` (`splitIdx` = -1, no reference data in current time range).

---

### US-901-3 — Anomalous reference year detection (P2)

As a user whose reference year was anomalous (pandemic, equipment failure), I need the forecast confidence to be forced to "low" with an `anomalousReference` flag, so I can tell at a glance that the projection is unreliable, rather than trusting a high-confidence number that reflects abnormal data.

**Independent test**: Unit test with `rawTrend = 4.0` (current consumption far above reference) → `anomalousReference: true`, `confidence: "low"`, `enabled: true`.

**Acceptance Scenarios**:

1. **Given** `rawTrend = 4.0` (current/reference ratio greatly above 3.3), **When** `computeForecast` is called, **Then** `anomalousReference: true`, `confidence: "low"`, `enabled: true`.
2. **Given** `rawTrend = 0.2` (current far below reference), **When** `computeForecast` is called, **Then** `anomalousReference: true`, `confidence: "low"`, `enabled: true`.
3. **Given** `rawTrend = 1.1` (normal year), **When** `computeForecast` is called, **Then** `anomalousReference` is absent or `false`; confidence not degraded by anomaly detection.
4. **Given** `rawTrend = 0.3` (exactly on boundary), **When** `computeForecast` is called, **Then** `anomalousReference` is absent or `false` (boundary is NOT treated as anomaly, condition is strictly `< 0.3`).

---

### US-901-4 — Reference series ends before current (C = 0) (P2)

As a user whose reference series covers only part of the current window's time range, I need the forecast to still produce a result using only the current series' cumulative value as the projection, without silently disabling the forecast.

**Independent test**: Unit test with empty C portion (all reference points fall within the current time range) — result has `enabled: true` and `forecast_total = A`.

**Acceptance Scenarios**:

1. **Given** `C = 0` (all reference points fall within `currentRangeMs`), **When** `computeForecast` is called, **Then** `enabled: true` and `forecast_total = A`.
2. **Given** `C = 0` and simultaneously `rawTrend > 3.3`, **When** `computeForecast` is called, **Then** both `forecast_total = A` and `anomalousReference: true` and `confidence: "low"` apply (mechanisms accumulate independently).

---

## Edge Cases

1. **`completedBuckets < 3`**: `enabled: false` regardless of `pct` — minimum 3 completed buckets required.
2. **`periodTotalBuckets = 0`**: `enabled: false` — prevents division by zero.
3. **`referencePoints` is empty or null**: `enabled: false` — no reference data to split.
4. **`splitIdx = -1`** (all reference timestamps fall after `currentRangeMs`): `enabled: false`.
5. **`completedBuckets = 0`** (current series has only 1 point): `enabled: false`.
6. **`B = 0` or `rawTrend === Infinity`**: `enabled: false` — trend cannot be computed.
7. **Boundary values** (`rawTrend === 0.3` or `rawTrend === 3.3`): NOT an anomaly (strict `< 0.3 || > 3.3`).
8. **`C = 0` and `rawTrend` out-of-bounds**: both `forecast_total = A` and `anomalousReference: true` and `confidence: "low"` apply simultaneously.
9. **`forecastPeriodBuckets` ≠ `timeline.length`**: When Longest-window axis span produces a longer `timeline[]`, `forecastPeriodBuckets` MUST still equal window 0's nominal slot count; using `timeline.length` would inflate `pct` and suppress legitimate early-period forecasts.
10. **`normalizePoints()` sorts input**: `computeForecast` relies on `referencePoints` being sorted ascending by timestamp; callers MUST invoke `normalizePoints()` before calling `computeForecast`.

---

## Functional Requirements

- **FR-901-A (Period bucket count parameter)**: `computeForecast` MUST accept `periodTotalBuckets: number` as its second argument, representing the nominal slot count of window 0 at its aggregation grain. This value MUST come from `buildChartTimeline`'s `forecastPeriodBuckets` output, not from `timeline.length`.

- **FR-901-B (completedBuckets and pct)**: MUST compute `completedBuckets = currentPoints.length - 1` and `pct = completedBuckets / periodTotalBuckets`.

- **FR-901-C (Activation gates)**: MUST return `enabled: false` when ANY of: `periodTotalBuckets ≤ 0`, `completedBuckets < 3`, `pct < 0.05`.

- **FR-901-D (Confidence levels)**: When `enabled`, MUST assign: `pct ≥ 0.40` → `"high"`, `pct ≥ 0.20` → `"medium"`, otherwise → `"low"`.

- **FR-901-E (Time-based split)**: `splitIdx` MUST be derived from `currentRangeMs = currentPoints[completedBuckets-1].timestamp - currentPoints[0].timestamp`, not from array position. MUST return `enabled: false` when `splitIdx = -1`.

- **FR-901-F (B and C sums)**: B = sum of `rawValue` for reference points at indices `0..splitIdx` inclusive. C = sum for indices `splitIdx+1..end`. When `B = 0` MUST return `enabled: false`.

- **FR-901-G (A and rawTrend)**: A = sum of `rawValue` for `currentPoints[0..completedBuckets-1]`. `rawTrend = A / B`.

- **FR-901-H (Anomaly detection)**: When `rawTrend < 0.3` OR `rawTrend > 3.3` (strictly exclusive boundaries), MUST set `anomalousReference: true` and force `confidence: "low"`; forecast remains `enabled: true`.

- **FR-901-I (Trend clamp and formula)**: `trend = Math.min(5, Math.max(0.2, rawTrend))`. `forecast_total = A + C * trend`.

- **FR-901-J (C = 0 special case)**: When `C = 0`, MUST return `enabled: true`, `forecast_total = A`. FR-901-H still applies — if `rawTrend` is simultaneously out of bounds, `anomalousReference: true` and `confidence: "low"` also apply.

- **FR-901-K (ForecastStats type)**: `ForecastStats` MUST include optional field `anomalousReference?: boolean`. Absence is equivalent to `false` for UI consumers.

- **FR-901-L (Call-site contract)**: The call site in `cumulative-comparison-chart.ts` MUST pass `forecastPeriodBuckets` (from `buildChartTimeline`) as `periodTotalBuckets` to `computeForecast`. MUST NOT use `timeline.length` when Longest-window axis span makes it different from window 0's nominal slot count.

- **FR-901-M (Remove fixed constant)**: The constant `MIN_POINTS_FOR_FORECAST = 5` (or equivalent) MUST be removed or replaced by the in-line floor of 3 (not an exported constant). The floor-3 rule is part of the activation gate (FR-901-C), not a named constant.

- **FR-901-N (Data normalization)**: `normalizePoints()` MUST sort points ascending by `timestamp` before passing them to `computeForecast`. `computeForecast` itself MUST NOT re-sort (it may rely on sorted input as a precondition).

- **FR-901-O (No regression)**: `computeSummary`, `computeTextSummary`, `buildComparisonPeriod`, and the chart renderer interface MUST NOT require changes as a result of this domain's implementation.

- **FR-901-P (Parallel LTS fetches)**: LTS data for multiple windows MAY be fetched in parallel. Time range correctness MUST be maintained regardless of fetch ordering.

---

## Key Entities

- **`ForecastPoint`**: `{ timestamp: number, rawValue: number }` — a single per-bucket increment from a cumulative LTS series.
- **`ForecastStats`**: `{ enabled, confidence, forecast_total, anomalousReference? }` — the complete output of `computeForecast`.
- **`periodTotalBuckets`** (= `forecastPeriodBuckets`): Nominal slot count of window 0 at its aggregation grain; the denominator for `pct`. Produced by `buildChartTimeline` in `ha-api.ts`; always window 0 only.
- **`splitIdx`**: Index into sorted `referencePoints` dividing "past reference" (B) from "future reference" (C). Derived by time range, not array position.
- **A, B, C**: Three cumulative sums used in the forecast formula. A = current window data so far; B = reference data covering the same elapsed time; C = reference data covering the remaining period.
- **`rawTrend`**: `A / B` before clamping. Detects anomalous reference year when outside `(0.3, 3.3)`.
- **`normalizePoints()`**: Preprocessing function in `ha-api.ts` that sorts points by timestamp ascending before series conversion.

---

## Success Criteria

- **SC-901-1**: `computeForecast` activates at the same percentage thresholds (5% / 20% / 40%) for both month-level and year-level windows when called with the correct `periodTotalBuckets`; verified by unit tests.
- **SC-901-2**: All activation gate edge cases (min 10: empty current, empty reference, B=0, splitIdx=-1, C=0, anomaly boundary values, etc.) pass without errors in Vitest.
- **SC-901-3**: When the current series has a time gap, the resulting B and C match the expected reference proportions based on time range — verified by unit test with gap fixtures.
- **SC-901-4**: A reference year with `rawTrend > 3.3` or `< 0.3` never produces `confidence` above `"low"` — verified by unit tests covering all anomaly scenarios.
- **SC-901-5**: `forecastPeriodBuckets` from `buildChartTimeline` equals window 0's nominal slot count; a Vitest test confirms it is independent of `timeline.length` when the shared axis is longer due to Longest-window axis span.
- **SC-901-6**: No regression in `computeSummary`, `computeTextSummary`, or `buildComparisonPeriod`; existing tests for those functions continue to pass unchanged.

---

## Assumptions

- `referencePoints` are always sorted ascending by `timestamp` after `normalizePoints()` is applied; `computeForecast` may rely on this as a precondition.
- Points have `timestamp` in Unix milliseconds and `rawValue` as a per-bucket numeric increment (not cumulative).
- Anomaly detection thresholds (`0.3`, `3.3`) and trend clamp bounds (`0.2`, `5`) are fixed constants; per-entity or configurable thresholds are out of scope.
- The HA statistics API is not changed; `ha-api.ts` continues to use the same LTS endpoint.
- `anomalousReference` being absent from the output type is semantically equivalent to `false` for UI consumers; no explicit `false` write is required.
- Documentation changes (wiki, README, changelog) reflecting forecast behavior are covered by domain `907-docs-product-knowledge`.
