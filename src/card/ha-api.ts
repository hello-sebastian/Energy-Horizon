import type {
  CardConfig,
  ComparisonPeriod,
  LtsStatisticPoint,
  LtsStatisticsQuery,
  LtsStatisticsResponse,
  TimeSeriesPoint,
  CumulativeSeries,
  ComparisonSeries,
  SummaryStats,
  ForecastStats,
  TextSummary
} from "./types";

export function buildFullTimeline(
  period: ComparisonPeriod,
  fullEnd: Date
): number[] {
  const timeline: number[] = [];
  const cursor = new Date(period.current_start);
  cursor.setHours(0, 0, 0, 0);

  if (period.aggregation === "day") {
    while (cursor.getTime() <= fullEnd.getTime()) {
      timeline.push(cursor.getTime());
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (period.aggregation === "week") {
    while (cursor.getTime() <= fullEnd.getTime()) {
      timeline.push(cursor.getTime());
      cursor.setDate(cursor.getDate() + 7);
    }
  } else if (period.aggregation === "month") {
    cursor.setDate(1);
    while (
      cursor.getFullYear() < fullEnd.getFullYear() ||
      (cursor.getFullYear() === fullEnd.getFullYear() &&
        cursor.getMonth() <= fullEnd.getMonth())
    ) {
      timeline.push(cursor.getTime());
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return timeline;
}

export function buildComparisonPeriod(
  config: CardConfig,
  now: Date,
  timeZone: string
): ComparisonPeriod {
  const current = new Date(now.getTime());
  const offsetYears = config.period_offset ?? -1;

  let current_start: Date;
  let current_end: Date;
  let reference_start: Date;
  let reference_end: Date;

  if (config.comparison_mode === "year_over_year") {
    const year = current.getFullYear();

    current_start = new Date(year, 0, 1, 0, 0, 0, 0);
    current_end = current;

    const refYear = year + offsetYears;
    reference_start = new Date(refYear, 0, 1, 0, 0, 0, 0);
    // Koniec roku referencyjnego – ostatni dzień roku o 23:59:59.999
    reference_end = new Date(refYear, 11, 31, 23, 59, 59, 999);
  } else {
    // month_over_year
    const year = current.getFullYear();
    const month = current.getMonth(); // 0‑based

    current_start = new Date(year, month, 1, 0, 0, 0, 0);
    current_end = current;

    const refYear = year + offsetYears;
    reference_start = new Date(refYear, month, 1, 0, 0, 0, 0);
    // Ostatni dzień tego samego miesiąca w roku referencyjnym
    reference_end = new Date(refYear, month + 1, 0, 23, 59, 59, 999);
  }

  return {
    current_start,
    current_end,
    reference_start,
    reference_end,
    aggregation: config.aggregation ?? "day",
    time_zone: timeZone
  };
}

export function buildLtsQuery(
  period: ComparisonPeriod,
  entityId: string
): LtsStatisticsQuery {
  const periodMap: Record<ComparisonPeriod["aggregation"], LtsStatisticsQuery["period"]> =
    {
      day: "day",
      week: "week",
      month: "month"
    };

  return {
    type: "recorder/statistics_during_period",
    start_time: period.current_start.toISOString(),
    end_time: period.current_end.toISOString(),
    statistic_ids: [entityId],
    period: periodMap[period.aggregation]
  };
}

export function mapLtsResponseToSeries(
  response: LtsStatisticsResponse | { result?: LtsStatisticsResponse },
  entityId: string,
  period: ComparisonPeriod,
  periodLabel: string
): ComparisonSeries | undefined {
  const cumulative = mapLtsResponseToCumulativeSeries(
    response,
    entityId,
    periodLabel
  );
  if (!cumulative) return undefined;

  return {
    current: cumulative,
    aggregation: period.aggregation,
    time_zone: period.time_zone
  };
}

export function mapLtsResponseToCumulativeSeries(
  response: LtsStatisticsResponse | { result?: LtsStatisticsResponse },
  entityId: string,
  periodLabel: string
): CumulativeSeries | undefined {
  const data = (response as { result?: LtsStatisticsResponse }).result ?? response;
  // HA WebSocket returns result either as { results: { [statistic_id]: [...] } }
  // or directly as { [statistic_id]: [...] } without a wrapper.
  const results =
    (data as LtsStatisticsResponse).results ??
    (data as Record<string, LtsStatisticPoint[]>);
  if (!results || typeof results !== "object") return undefined;

  let points = results[entityId];
  if (!points || points.length === 0) {
    const keys = Object.keys(results);
    if (keys.length === 1) {
      points = results[keys[0]!];
    }
  }
  if (!points || points.length === 0) return undefined;

  const { unit, timeSeries } = normalizePoints(points);
  const cumulative = toCumulativeSeries(
    timeSeries,
    unit,
    periodLabel
  );

  return cumulative;
}

function normalizePoints(points: LtsStatisticPoint[]): {
  unit: string;
  timeSeries: TimeSeriesPoint[];
} {
  let unit = "";
  const series: TimeSeriesPoint[] = [];
  let previousSum: number | undefined;

  for (const p of points) {
    let rawValue: number | undefined;

    if (typeof p.sum === "number") {
      if (previousSum === undefined) {
        // Pierwszy punkt przy braku `change` traktujemy jako punkt odniesienia
        // dla bieżącego okresu (różnice liczymy względem niego).
        previousSum = p.sum;
        continue;
      } else {
        const delta = p.sum - previousSum;
        previousSum = p.sum;
        if (!Number.isFinite(delta) || delta <= 0) {
          // Reset licznika lub dane niespójne – pomijamy
          continue;
        }
        rawValue = delta;
      }
    } else if (typeof p.change === "number") {
      rawValue = p.change;
    } else if (typeof p.state === "number") {
      rawValue = p.state;
    }

    if (rawValue == null || !Number.isFinite(rawValue)) continue;

    if (!unit && p.unit_of_measurement) {
      unit = p.unit_of_measurement;
    } else if (unit && p.unit_of_measurement && p.unit_of_measurement !== unit) {
      // jednostki niespójne – na razie przerywamy i zwracamy pustą serię
      return { unit: "", timeSeries: [] };
    }

    series.push({
      timestamp: new Date(p.start).getTime(),
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

  const total = points.length > 0 ? points[points.length - 1].value : 0;

  return {
    points,
    unit,
    periodLabel,
    total
  };
}

export function computeSummary(series: ComparisonSeries): SummaryStats {
  const currentPoints = series.current.points;
  const current_cumulative =
    currentPoints[currentPoints.length - 1]?.value ?? 0;

  let reference_cumulative: number | undefined;
  if (series.reference && series.reference.points.length >= currentPoints.length) {
    const refPoints = series.reference.points;
    reference_cumulative =
      refPoints[currentPoints.length - 1]?.value ??
      refPoints[refPoints.length - 1]?.value;
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

export function computeForecast(
  series: ComparisonSeries,
  periodTotalBuckets: number
): ForecastStats {
  const disabled = (unit: string): ForecastStats => ({
    enabled: false,
    confidence: "low",
    unit
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
    return disabled(unit);
  }

  const completedBuckets = currentPoints.length - 1;
  const pct = completedBuckets / periodTotalBuckets;

  // Guard 2 — wbudowany floor 3 (FR-016) + próg procentowy 5%
  if (completedBuckets < 3 || pct < 0.05) {
    return disabled(unit);
  }

  const referencePoints = series.reference?.points;

  // Guard 3
  if (!referencePoints || referencePoints.length === 0) {
    return disabled(unit);
  }

  const currentRangeMs =
    currentPoints[completedBuckets - 1]!.timestamp -
    currentPoints[0]!.timestamp;
  const cutoffTs = currentPoints[0]!.timestamp + currentRangeMs;

  let splitIdx = -1;
  for (let i = referencePoints.length - 1; i >= 0; i--) {
    if (referencePoints[i]!.timestamp <= cutoffTs) {
      splitIdx = i;
      break;
    }
  }

  // Guard 4
  if (splitIdx === -1) {
    return disabled(unit);
  }

  const B = referencePoints
    .slice(0, splitIdx + 1)
    .reduce((acc, p) => acc + (p.rawValue ?? 0), 0);

  // Guard 5
  if (!Number.isFinite(B) || B <= 0) {
    return disabled(unit);
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

  const reference_total = B + C;
  const forecast_total = A + C * trend;

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

