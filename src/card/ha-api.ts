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

const MIN_POINTS_FOR_FORECAST = 5;

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
  period: ComparisonPeriod
): ComparisonSeries | undefined {
  const data = (response as { result?: LtsStatisticsResponse }).result ?? response;
  const results = (data as LtsStatisticsResponse).results;
  if (!results || typeof results !== "object") return undefined;

  const points = results[entityId];
  if (!points || points.length === 0) return undefined;

  const { unit, timeSeries } = normalizePoints(points);
  const cumulative = toCumulativeSeries(
    timeSeries,
    unit,
    "Bieżący okres"
  );

  return {
    current: cumulative,
    aggregation: period.aggregation,
    time_zone: period.time_zone
  };
}

function normalizePoints(points: LtsStatisticPoint[]): {
  unit: string;
  timeSeries: TimeSeriesPoint[];
} {
  let unit = "";
  const series: TimeSeriesPoint[] = [];

  for (const p of points) {
    const value = p.sum ?? p.state;
    if (value == null) continue;
    if (!unit && p.unit_of_measurement) {
      unit = p.unit_of_measurement;
    } else if (unit && p.unit_of_measurement && p.unit_of_measurement !== unit) {
      // jednostki niespójne – na razie przerywamy i zwracamy pustą serię
      return { unit: "", timeSeries: [] };
    }

    series.push({
      timestamp: new Date(p.start).getTime(),
      value,
      rawValue: value
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
  series: ComparisonSeries
): ForecastStats {
  const points = series.current.points;
  const n = points.length;

  if (n < MIN_POINTS_FOR_FORECAST) {
    return { enabled: false, unit: series.current.unit };
  }

  const current_cumulative = points[n - 1].value;
  const avg_per_day = current_cumulative / n;

  // Przybliżenie FULL_PERIOD_DAYS na podstawie zakresu danych:
  const firstDate = new Date(points[0].timestamp);
  const lastDate = new Date(points[n - 1].timestamp);
  const spanMs = lastDate.getTime() - firstDate.getTime();
  const spanDays = spanMs / (1000 * 60 * 60 * 24);

  let fullPeriodDays: number;

  // Uproszczone rozróżnienie: jeśli zakres > ~200 dni traktujemy jako rok, inaczej jako miesiąc
  if (spanDays > 200) {
    const year = firstDate.getFullYear();
    const isLeap =
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    fullPeriodDays = isLeap ? 366 : 365;
  } else {
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    fullPeriodDays = new Date(year, month + 1, 0).getDate();
  }

  const forecast_total = avg_per_day * fullPeriodDays;

  let confidence: ForecastStats["confidence"] = "low";
  if (n >= 14) confidence = "high";
  else if (n >= 7) confidence = "medium";

  return {
    enabled: true,
    forecast_total,
    unit: series.current.unit,
    confidence
  };
}

export function computeTextSummary(
  summary: SummaryStats
): TextSummary {
  const { current_cumulative, reference_cumulative, difference, unit } =
    summary;

  if (reference_cumulative == null || difference == null) {
    return {
      trend: "unknown",
      heading:
        "Brak wystarczających danych z wcześniejszego okresu, aby porównać zużycie."
    };
  }

  const absDiff = Math.abs(difference);
  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2
  });
  const diffText = `${formatter.format(absDiff)} ${unit}`;

  if (absDiff < 0.01) {
    return {
      trend: "similar",
      heading:
        "Twoje zużycie jest na podobnym poziomie jak w tym samym okresie w poprzednim roku."
    };
  }

  if (difference > 0) {
    return {
      trend: "higher",
      heading: `Twoje zużycie jest o ${diffText} wyższe niż w tym samym okresie w poprzednim roku.`
    };
  }

  return {
    trend: "lower",
    heading: `Twoje zużycie jest o ${diffText} niższe niż w tym samym okresie w poprzednim roku.`
  };
}

