import { referenceCumulativeAtAlignedCurrentEnd } from "./timeline";
import type {
  ComparisonSeries,
  CumulativeSeries,
  ForecastStats,
  LtsStatisticPoint,
  LtsStatisticsQuery,
  LtsStatisticsResponse,
  ResolvedWindow,
  SummaryStats,
  TextSummary,
  TimeSeriesPoint,
  WindowAggregation
} from "./types";

const LTS_PERIOD_MAP: Record<WindowAggregation, LtsStatisticsQuery["period"]> = {
  day: "day",
  week: "week",
  month: "month",
  hour: "hour"
};

export function buildLtsQueriesForWindows(
  windows: ResolvedWindow[],
  entityId: string
): LtsStatisticsQuery[] {
  return windows.map((w) => ({
    type: "recorder/statistics_during_period",
    start_time: w.start.toISOString(),
    end_time: w.end.toISOString(),
    statistic_ids: [entityId],
    period: LTS_PERIOD_MAP[w.aggregation]
  }));
}

/**
 * Shape of an LTS WebSocket message as the card receives it (911/TD-3, contract
 * `lts-websocket-response.md`): Shape A envelope `{ success?, result? }` or Shape B (the
 * `LtsStatisticsResponse` itself). The transport returns `unknown`; applied at the boundary.
 */
export type LtsMessageResponse =
  | { success?: boolean; result?: LtsStatisticsResponse }
  | LtsStatisticsResponse;

/**
 * Single normalization point for LTS WebSocket responses (911/TD-3, contract
 * `lts-websocket-response.md`): malformed input degrades to `undefined`, never throws.
 * The `?? data` fallbacks keep the legacy bare shape (contract edge case 4).
 */
export function extractLtsResults(
  response: LtsMessageResponse
): LtsStatisticsResponse | undefined {
  if (response === null || typeof response !== "object") return undefined;
  // Step 1: envelope form → its `result`; bare form → the message itself.
  const data: unknown =
    (response as { result?: LtsStatisticsResponse }).result ?? response;
  if (data === null || typeof data !== "object") return undefined;
  // Step 2: results record (the `?? data` fallback keeps the legacy bare shape).
  const results: unknown = (data as LtsStatisticsResponse).results ?? data;
  if (!results || typeof results !== "object") return undefined;
  return { results: results as Record<string, LtsStatisticPoint[]> };
}

export function mapLtsResponseToCumulativeSeries(
  response: LtsMessageResponse,
  entityId: string,
  periodLabel: string
): CumulativeSeries | undefined {
  // 911/TD-3: envelope normalization happens once in `extractLtsResults`
  // (contract: lts-websocket-response.md); entity lookup stays in the mapper.
  const normalized = extractLtsResults(response);
  if (!normalized) return undefined;
  const results = normalized.results;

  let points = results[entityId];
  if (!points || points.length === 0) {
    const keys = Object.keys(results);
    if (keys.length === 1) {
      const key = keys[0];
      if (key !== undefined) {
        points = results[key];
      }
    }
  }
  if (!points || points.length === 0) return undefined;

  const { unit, timeSeries } = normalizePoints(points);
  return toCumulativeSeries(timeSeries, unit, periodLabel);
}

function normalizePoints(points: LtsStatisticPoint[]): {
  unit: string;
  timeSeries: TimeSeriesPoint[];
} {
  let unit = "";
  const series: TimeSeriesPoint[] = [];
  let previousSum: number | undefined;
  /** Start of the LTS row `previousSum` belongs to; delta timestamps use this (bucket start). */
  let previousSumStartMs: number | undefined;

  for (const p of points) {
    const startMs = new Date(p.start).getTime();
    let rawValue: number | undefined;
    /** For sum-deltas: period start of the increment; else use `startMs`. */
    let timestampMs = startMs;

    if (typeof p.change === "number") {
      // `total` / `total_increasing` statistics: HA returns the per-bucket increment as
      // `change`; prefer it over differencing `sum` — keeps the first bucket, preserves
      // zero-consumption buckets, stamps each value with its own bucket start (issue #56).
      if (Number.isFinite(p.change) && p.change >= 0) {
        rawValue = p.change;
      }
      // Negative `change` = meter reset / inconsistent data — skip the bucket.
    } else if (typeof p.sum === "number") {
      // Fallback for `sum` without `change` (older HA): treat `sum` as a running total, emit deltas.
      if (previousSum === undefined) {
        previousSum = p.sum;
        previousSumStartMs = startMs;
        continue;
      } else {
        const delta = p.sum - previousSum;
        previousSum = p.sum;
        if (!Number.isFinite(delta) || delta <= 0) {
          // Reset licznika lub dane niespójne – pomijamy
          previousSumStartMs = startMs;
          continue;
        }
        rawValue = delta;
        timestampMs = previousSumStartMs ?? startMs;
        previousSumStartMs = startMs;
      }
    } else if (typeof p.state === "number") {
      rawValue = p.state;
    } else if (
      typeof p.max === "number" &&
      Number.isFinite(p.max) &&
      typeof p.min === "number" &&
      Number.isFinite(p.min)
    ) {
      // `state_class: measurement` sensors only record mean/min/max: for a monotonically
      // increasing counter, `max - min` is the per-bucket delta (issue #45). Negative
      // values would indicate a decreasing reading — skip rather than pollute the chart.
      const delta = p.max - p.min;
      if (!Number.isFinite(delta) || delta < 0) continue;
      rawValue = delta;
    }

    if (rawValue == null || !Number.isFinite(rawValue)) continue;

    if (!unit && p.unit_of_measurement) {
      unit = p.unit_of_measurement;
    } else if (unit && p.unit_of_measurement && p.unit_of_measurement !== unit) {
      // jednostki niespójne – na razie przerywamy i zwracamy pustą serię
      return { unit: "", timeSeries: [] };
    }

    series.push({
      timestamp: timestampMs,
      value: rawValue,
      rawValue
    });
  }

  return { unit, timeSeries: series.sort((a, b) => a.timestamp - b.timestamp) };
}

function toCumulativeSeries(
  series: TimeSeriesPoint[],
  unit: string,
  periodLabel: string
): CumulativeSeries {
  let running = 0;
  const points = series.map((p) => {
    const raw = p.rawValue ?? p.value;
    running += raw;
    return { ...p, value: running };
  });

  const total = points[points.length - 1]?.value ?? 0;

  return {
    points,
    unit,
    periodLabel,
    total
  };
}

export function computeSummary(
  series: ComparisonSeries,
  alignOffsetMs?: number
): SummaryStats {
  const currentPoints = series.current.points;
  const current_cumulative =
    currentPoints[currentPoints.length - 1]?.value ?? 0;

  let reference_cumulative: number | undefined;
  if (series.reference?.points?.length) {
    reference_cumulative = referenceCumulativeAtAlignedCurrentEnd(
      currentPoints,
      series.reference.points,
      alignOffsetMs
    );
  }

  let difference: number | undefined;
  let differencePercent: number | undefined;

  if (reference_cumulative != null) {
    difference = current_cumulative - reference_cumulative;
    if (reference_cumulative !== 0) {
      differencePercent = (difference / reference_cumulative) * 100;
    }
  }

  return {
    current_cumulative,
    reference_cumulative,
    difference,
    differencePercent,
    unit: series.current.unit
  };
}

/** Sum of per-bucket increments (`rawValue`) over the full reference LTS series — the whole
 * reference window's total consumption (Figma **Total** / §1.3). */
export function fullReferenceWindowRawTotal(points: TimeSeriesPoint[]): number {
  return points.reduce((acc, p) => acc + (p.rawValue ?? 0), 0);
}

export function computeForecast(
  series: ComparisonSeries,
  periodTotalBuckets: number,
  alignOffsetMs?: number
): ForecastStats {
  const disabled = (
    unit: string,
    disabledReason: NonNullable<ForecastStats["disabledReason"]>
  ): ForecastStats => ({
    enabled: false,
    confidence: "low",
    unit,
    disabledReason
  });

  const currentPoints = series.current.points;
  const unit = series.current.unit;

  // Guard 1 (wymagany skończony periodTotalBuckets > 0 — kontrakt computeForecast)
  if (
    typeof periodTotalBuckets !== "number" ||
    !Number.isFinite(periodTotalBuckets) ||
    periodTotalBuckets <= 0 ||
    currentPoints.length === 0
  ) {
    return disabled(unit, "invalid_period");
  }

  const completedBuckets = currentPoints.length - 1;
  const pct = completedBuckets / periodTotalBuckets;

  // Guard 2 — wbudowany floor 3 (FR-016) + próg procentowy 5%
  if (completedBuckets < 3 || pct < 0.05) {
    return disabled(
      unit,
      completedBuckets < 3 ? "insufficient_buckets" : "below_percent_threshold"
    );
  }

  const referencePoints = series.reference?.points;

  // Guard 3
  if (!referencePoints || referencePoints.length === 0) {
    return disabled(unit, "no_reference");
  }

  // Compiler guards for `noUncheckedIndexedAccess` (911/TD-6) — guards 1–3 already prove non-emptiness; not runtime paths.
  const firstCurrentPoint = currentPoints[0];
  const lastCompletedPoint = currentPoints[completedBuckets - 1];
  const firstReferencePoint = referencePoints[0];
  if (!firstCurrentPoint || !lastCompletedPoint || !firstReferencePoint) {
    return disabled(unit, "invalid_period");
  }

  const currentRangeMs =
    lastCompletedPoint.timestamp - firstCurrentPoint.timestamp;
  const cutoffTs = firstCurrentPoint.timestamp + currentRangeMs;

  // Align reference timestamps to the current axis (as the chart does); prefer the window-start
  // offset (alignOffsetMs) — correct even when the series starts late (first-point offset drifts).
  const periodAlignMs =
    typeof alignOffsetMs === "number" && Number.isFinite(alignOffsetMs)
      ? alignOffsetMs
      : firstCurrentPoint.timestamp - firstReferencePoint.timestamp;

  let splitIdx = -1;
  for (let i = referencePoints.length - 1; i >= 0; i--) {
    const refPoint = referencePoints[i];
    if (!refPoint) continue;
    const refAlignedTs = refPoint.timestamp + periodAlignMs;
    if (refAlignedTs <= cutoffTs) {
      splitIdx = i;
      break;
    }
  }

  // Guard 4
  if (splitIdx === -1) {
    return disabled(unit, "no_split");
  }

  const B = referencePoints
    .slice(0, splitIdx + 1)
    .reduce((acc, p) => acc + (p.rawValue ?? 0), 0);

  // Guard 5
  if (!Number.isFinite(B) || B <= 0) {
    return disabled(unit, "zero_reference_in_range");
  }

  const A = currentPoints
    .slice(0, completedBuckets)
    .reduce((acc, p) => acc + (p.rawValue ?? 0), 0);

  const rawTrend = A / B;
  const trend = Math.min(5, Math.max(0.2, rawTrend));

  // Granice 0.3 i 3.3 — porównania 10A vs 3B / 33B (równoważne A/B < 0.3 / > 3.3 przy B > 0),
  // unikają błędu float przy brzegu (np. A=33, B=10).
  const anomalousReference = 10 * A < 3 * B || 10 * A > 33 * B;

  let confidence: ForecastStats["confidence"] =
    pct >= 0.4 ? "high" : pct >= 0.2 ? "medium" : "low";
  if (anomalousReference) {
    confidence = "low";
  }

  const C = referencePoints
    .slice(splitIdx + 1)
    .reduce((acc, p) => acc + (p.rawValue ?? 0), 0);

  const reference_total = fullReferenceWindowRawTotal(referencePoints);
  let forecast_total = A + C * trend;

  // Never forecast below known cumulative (monotonicity guarantee)
  const lastCurrentCumulative =
    currentPoints[currentPoints.length - 1]?.value ?? 0;
  forecast_total = Math.max(forecast_total, lastCurrentCumulative);

  const result: ForecastStats = {
    enabled: true,
    forecast_total,
    reference_total,
    confidence,
    unit
  };
  if (anomalousReference) {
    result.anomalousReference = true;
  }
  return result;
}

export function computeTextSummary(
  summary: SummaryStats
): TextSummary {
  const { reference_cumulative, difference, unit } = summary;

  if (reference_cumulative == null || difference == null) {
    return {
      trend: "unknown",
      unit: unit
    };
  }

  const absDiff = Math.abs(difference);

  if (absDiff < 0.01) {
    return {
      trend: "similar",
      diffValue: absDiff,
      unit
    };
  }

  if (difference > 0) {
    return {
      trend: "higher",
      diffValue: absDiff,
      unit
    };
  }

  return {
    trend: "lower",
    diffValue: absDiff,
    unit
  };
}
