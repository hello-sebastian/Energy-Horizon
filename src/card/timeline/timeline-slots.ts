import { DateTime } from "luxon";
import type {
  ComparisonPeriod,
  MergedTimeWindowConfig,
  ResolvedWindow,
  WindowAggregation
} from "../types";

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
  const w0 = windows[0];
  if (!w0) {
    return { timeline: [], alignStartsMs: [] }; // dead path: length checked above (911/TD-6)
  }
  const primaryAgg = w0.aggregation;
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
  let lastMs = timeline.length > 0 ? timeline[timeline.length - 1] : null;
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

  const w0 = windows[0];
  if (!w0) {
    return { timeline: [], alignStartsMs: [], forecastPeriodBuckets: 0 }; // dead path: length checked above (911/TD-6)
  }
  const forecastPeriodBuckets = countBucketsForWindow(w0, timeZone);

  if (windows.length === 1) {
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
