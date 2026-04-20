import { DateTime } from "luxon";
import { findTimelineSlotContainingInstant } from "./axis/now-marker-slot";
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
  TextSummary,
  ResolvedWindow,
  WindowAggregation,
  MergedTimeWindowConfig
} from "./types";

/**
 * First timeline index whose aligned slot start (for series 0) is strictly after `windowEnd`.
 * Used for FR-B tail labeling when another window extends the axis past the current window.
 */
export function firstTailAxisLabelIndex(
  timeline: number[],
  alignStartMs: number,
  windowEnd: Date
): number {
  if (timeline.length === 0) {
    return 0;
  }
  const t0 = timeline[0]!;
  const endMs = windowEnd.getTime();
  for (let j = 0; j < timeline.length; j++) {
    const alignedSlotStart = alignStartMs + (timeline[j]! - t0);
    if (alignedSlotStart <= endMs) {
      continue;
    }
    return j;
  }
  return timeline.length;
}

/**
 * FR-G: if “now” falls in a day/week/month bucket on the chart timeline and the aligned
 * current series has no LTS point there, repeat the last known cumulative value in-window.
 */
export function carryForwardCurrentCumulativeAtNow(
  alignedValues: (number | null)[],
  timeline: number[],
  nowMs: number,
  alignStartMs: number,
  windowStartMs: number,
  windowEndMs: number,
  aggregation: WindowAggregation,
  timeZone: string
): void {
  if (aggregation === "hour") {
    return;
  }
  if (timeline.length === 0 || alignedValues.length !== timeline.length) {
    return;
  }
  const prefix = buildTimelineSlots(
    new Date(windowStartMs),
    new Date(windowEndMs),
    aggregation,
    timeZone
  );
  const idx = findTimelineSlotContainingInstant(prefix, nowMs);
  if (idx < 0 || idx >= alignedValues.length) {
    return;
  }
  const t0 = timeline[0]!;
  const alignedSlotStart = alignStartMs + (timeline[idx]! - t0);
  if (alignedSlotStart < windowStartMs || alignedSlotStart > windowEndMs) {
    return;
  }
  if (alignedValues[idx] != null) {
    return;
  }
  let last: number | null = null;
  for (let i = idx - 1; i >= 0; i--) {
    const v = alignedValues[i];
    if (v != null) {
      last = v;
      break;
    }
  }
  if (last == null) {
    return;
  }
  alignedValues[idx] = last;
}

/** Timeline slot timestamps (ms) from `rangeStart` through `rangeEnd` for the given aggregation. */
export function buildTimelineSlots(
  rangeStart: Date,
  rangeEnd: Date,
  aggregation: WindowAggregation,
  timeZone: string
): number[] {
  const timeline: number[] = [];
  const zone = { zone: timeZone };
  const endDt = DateTime.fromJSDate(rangeEnd, zone);

  if (aggregation === "hour") {
    let cursor = DateTime.fromJSDate(rangeStart, zone).startOf("hour");
    while (cursor.toMillis() <= endDt.toMillis()) {
      timeline.push(cursor.toMillis());
      cursor = cursor.plus({ hours: 1 });
    }
    return timeline;
  }

  if (aggregation === "day") {
    let cursor = DateTime.fromJSDate(rangeStart, zone).startOf("day");
    while (cursor.toMillis() <= endDt.toMillis()) {
      timeline.push(cursor.toMillis());
      cursor = cursor.plus({ days: 1 });
    }
    return timeline;
  }

  if (aggregation === "week") {
    let cursor = DateTime.fromJSDate(rangeStart, zone);
    while (cursor.toMillis() <= endDt.toMillis()) {
      timeline.push(cursor.toMillis());
      cursor = cursor.plus({ weeks: 1 });
    }
    return timeline;
  }

  // Month slots: keep native `Date` calendar math to match legacy chart behavior
  // (tests and card use `new Date(y, m, d)` local dates; mixing with Luxon+UTC shifts boundaries).
  {
    const cursor = new Date(rangeStart.getTime());
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(1);
    const fullEnd = new Date(rangeEnd.getTime());
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

/** Next bucket start after `prevStartMs`, same rules as {@link buildTimelineSlots} steps (FR-H zone). */
export function advanceSlotStartMs(
  prevStartMs: number,
  aggregation: WindowAggregation,
  timeZone: string
): number {
  const zone = { zone: timeZone };
  if (aggregation === "hour") {
    return DateTime.fromMillis(prevStartMs, zone).plus({ hours: 1 }).toMillis();
  }
  if (aggregation === "day") {
    return DateTime.fromMillis(prevStartMs, zone).plus({ days: 1 }).toMillis();
  }
  if (aggregation === "week") {
    return DateTime.fromMillis(prevStartMs, zone).plus({ weeks: 1 }).toMillis();
  }
  const d = new Date(prevStartMs);
  d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

/**
 * “Now” on the shared comparison axis: bucket within **window 0** that contains `nowMs`, mapped to
 * `fullTimeline` index (006 FR-B / FR-G). Does not use the reference/longest calendar on the axis.
 */
export function findNowSlotIndexOnComparisonAxis(
  fullTimeline: number[],
  windowStartMs: number,
  windowEndMs: number,
  aggregation: WindowAggregation,
  timeZone: string,
  nowMs: number
): number {
  const prefix = buildTimelineSlots(
    new Date(windowStartMs),
    new Date(windowEndMs),
    aggregation,
    timeZone
  );
  if (prefix.length === 0 || fullTimeline.length === 0) {
    return -1;
  }
  const idx = findTimelineSlotContainingInstant(prefix, nowMs);
  if (idx < 0) {
    return -1;
  }
  return Math.min(idx, fullTimeline.length - 1);
}

/**
 * Slot count for one resolved window — use as `periodTotalBuckets` for {@link computeForecast}.
 * Chart X-axis may use a longer span (longest window, FR-009); forecast progress must use
 * the current window (index 0) only.
 */
export function countBucketsForWindow(
  window: ResolvedWindow,
  timeZone: string
): number {
  return buildTimelineSlots(
    window.start,
    window.end,
    window.aggregation,
    timeZone
  ).length;
}

export function buildFullTimeline(
  period: ComparisonPeriod,
  fullEnd: Date
): number[] {
  return buildTimelineSlots(
    period.current_start,
    fullEnd,
    period.aggregation,
    period.time_zone
  );
}

/**
 * Multi-window chart axis (006 FR-C + FR-B): axis **length** = max nominal slot count at
 * `windows[0].aggregation`; timeline **millis** = prefix from **window 0** + ordinal tail
 * (`advanceSlotStartMs`) so ticks and alignment follow the current window’s calendar, not the
 * longest reference window alone.
 */
export function buildFullTimelineForWindows(
  windows: ResolvedWindow[],
  timeZone: string
): { timeline: number[]; alignStartsMs: number[] } {
  if (windows.length === 0) {
    return { timeline: [], alignStartsMs: [] };
  }
  const primaryAgg = windows[0]!.aggregation;
  const w0 = windows[0]!;
  let maxSlots = 0;
  for (const w of windows) {
    const count = buildTimelineSlots(
      w.start,
      w.end,
      primaryAgg,
      timeZone
    ).length;
    if (count > maxSlots) {
      maxSlots = count;
    }
  }
  const prefix = buildTimelineSlots(w0.start, w0.end, primaryAgg, timeZone);
  const timeline = [...prefix];
  let lastMs =
    timeline.length > 0 ? timeline[timeline.length - 1]! : null;
  while (timeline.length < maxSlots && lastMs != null) {
    lastMs = advanceSlotStartMs(lastMs, primaryAgg, timeZone);
    timeline.push(lastMs);
  }
  return {
    timeline,
    alignStartsMs: windows.map((w) => w.start.getTime())
  };
}

/**
 * Single timeline policy for `N >= 2`: longest-window axis span (FR-C) + `forecastPeriodBuckets` from window 0 (FR-D).
 * `merged` is reserved for future label hints; geometry does not branch on preset name (006 FR-A / FR-F).
 */
export function buildChartTimeline(
  windows: ResolvedWindow[],
  _merged: MergedTimeWindowConfig,
  timeZone: string
): {
  timeline: number[];
  alignStartsMs: number[];
  /** Denominator for `computeForecast` — full current-window bucket count, not always `timeline.length` when windows differ in length. */
  forecastPeriodBuckets: number;
} {
  void _merged;
  const alignStartsMs = windows.map((w) => w.start.getTime());
  if (windows.length === 0) {
    return { timeline: [], alignStartsMs: [], forecastPeriodBuckets: 0 };
  }

  const forecastPeriodBuckets = countBucketsForWindow(windows[0]!, timeZone);

  if (windows.length === 1) {
    const w0 = windows[0]!;
    const timeline = buildTimelineSlots(
      w0.start,
      w0.end,
      w0.aggregation,
      timeZone
    );
    return { timeline, alignStartsMs, forecastPeriodBuckets };
  }

  const { timeline, alignStartsMs: align } =
    buildFullTimelineForWindows(windows, timeZone);
  return { timeline, alignStartsMs: align, forecastPeriodBuckets };
}

export function comparisonPeriodFromResolvedWindows(
  windows: ResolvedWindow[],
  timeZone: string,
  aggregation: WindowAggregation
): ComparisonPeriod {
  const w0 = windows[0]!;
  const w1 = windows[1];
  return {
    current_start: w0.start,
    current_end: w0.end,
    reference_start: w1?.start ?? w0.start,
    reference_end: w1?.end ?? w0.end,
    aggregation,
    time_zone: timeZone
  };
}

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

  if (config.comparison_preset === "year_over_year") {
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
  return {
    type: "recorder/statistics_during_period",
    start_time: period.current_start.toISOString(),
    end_time: period.current_end.toISOString(),
    statistic_ids: [entityId],
    period: LTS_PERIOD_MAP[period.aggregation]
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
  /** Start of the LTS row that `previousSum` belongs to; delta timestamps use this (bucket start). */
  let previousSumStartMs: number | undefined;

  for (const p of points) {
    const startMs = new Date(p.start).getTime();
    let rawValue: number | undefined;
    /** For sum-deltas: period start of the increment; else use `startMs`. */
    let timestampMs = startMs;

    if (typeof p.sum === "number") {
      if (previousSum === undefined) {
        // Pierwszy punkt przy braku `change` traktujemy jako punkt odniesienia
        // dla bieżącego okresu (różnice liczymy względem niego).
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
    } else if (typeof p.change === "number") {
      rawValue = p.change;
    } else if (typeof p.state === "number") {
      rawValue = p.state;
    } else if (
      typeof p.max === "number" &&
      Number.isFinite(p.max) &&
      typeof p.min === "number" &&
      Number.isFinite(p.min)
    ) {
      // `state_class: measurement` sensors only record mean/min/max. When the underlying
      // reading is a monotonically increasing counter (e.g. a template sensor that sums
      // cumulative sensors but was not declared as `total_increasing`), `max - min` is
      // the per-bucket delta — see issue #45. Negative values would indicate a decreasing
      // reading (not a cumulative counter), so skip rather than pollute the chart.
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

  const total = points.length > 0 ? points[points.length - 1].value : 0;

  return {
    points,
    unit,
    periodLabel,
    total
  };
}

/**
 * Cumulative reference value at the same aligned time as the last current point
 * (same periodAlignMs logic as {@link computeForecast} / chart).
 */
export function referenceCumulativeAtAlignedCurrentEnd(
  currentPoints: TimeSeriesPoint[],
  refPoints: TimeSeriesPoint[]
): number | undefined {
  if (currentPoints.length === 0 || refPoints.length === 0) {
    return undefined;
  }
  const periodAlignMs =
    currentPoints[0]!.timestamp - refPoints[0]!.timestamp;
  const lastTs = currentPoints[currentPoints.length - 1]!.timestamp;
  let bestIdx = -1;
  for (let i = refPoints.length - 1; i >= 0; i--) {
    const alignedTs = refPoints[i]!.timestamp + periodAlignMs;
    if (alignedTs <= lastTs) {
      bestIdx = i;
      break;
    }
  }
  if (bestIdx === -1) {
    return undefined;
  }
  return refPoints[bestIdx]!.value;
}

export function computeSummary(series: ComparisonSeries): SummaryStats {
  const currentPoints = series.current.points;
  const current_cumulative =
    currentPoints[currentPoints.length - 1]?.value ?? 0;

  let reference_cumulative: number | undefined;
  if (series.reference?.points?.length) {
    reference_cumulative = referenceCumulativeAtAlignedCurrentEnd(
      currentPoints,
      series.reference.points
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

/**
 * Sum of per-bucket increments (`rawValue`) over the full reference LTS series —
 * total consumption for the **whole** reference window (Figma **Total** / §1.3).
 */
export function fullReferenceWindowRawTotal(points: TimeSeriesPoint[]): number {
  return points.reduce((acc, p) => acc + (p.rawValue ?? 0), 0);
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

  // Align reference timestamps to current period axis (same alignment as chart).
  // YoY: reference is in year N, current in N+1; raw comparison would put all ref ≤ cutoff.
  const periodAlignMs =
    currentPoints[0]!.timestamp - referencePoints[0]!.timestamp;

  let splitIdx = -1;
  for (let i = referencePoints.length - 1; i >= 0; i--) {
    const refAlignedTs = referencePoints[i]!.timestamp + periodAlignMs;
    if (refAlignedTs <= cutoffTs) {
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

