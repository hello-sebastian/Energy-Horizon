import { DateTime, type DateTime as LuxonDateTime } from "luxon";
import type { ResolvedWindow, WindowAggregation } from "../types";
import type { MergedTimeWindowConfig } from "../types";
import { durationToMillis, parseDurationToken } from "./duration-parse";

function resolveLegacy(
  merged: MergedTimeWindowConfig,
  now: DateTime,
  timeZone: string,
  aggregation: WindowAggregation
): ResolvedWindow[] {
  const mode = merged.comparisonMode!;
  const offsetYears = merged.periodOffsetYears ?? -1;
  const duration = parseDurationToken(merged.duration ?? "1y")!;

  if (mode === "year_over_year") {
    const year = now.year;
    const currentStart = DateTime.fromObject(
      { year, month: 1, day: 1 },
      { zone: timeZone }
    );
    const currentEnd = now;
    const refYear = year + offsetYears;
    const refStart = DateTime.fromObject(
      { year: refYear, month: 1, day: 1 },
      { zone: timeZone }
    );
    const refEnd = refStart.plus(duration).minus({ milliseconds: 1 });

    return [
      {
        index: 0,
        id: "current",
        role: "current",
        start: currentStart.toJSDate(),
        end: currentEnd.toJSDate(),
        aggregation
      },
      {
        index: 1,
        id: "reference",
        role: "reference",
        start: refStart.toJSDate(),
        end: refEnd.toJSDate(),
        aggregation
      }
    ];
  }

  const year = now.year;
  const month = now.month;
  const currentStart = DateTime.fromObject(
    { year, month, day: 1 },
    { zone: timeZone }
  );
  const currentEnd = now;
  const refYear = year + offsetYears;
  const refStart = DateTime.fromObject(
    { year: refYear, month, day: 1 },
    { zone: timeZone }
  );
  const refEnd = refStart.plus(duration).minus({ milliseconds: 1 });

  return [
    {
      index: 0,
      id: "current",
      role: "current",
      start: currentStart.toJSDate(),
      end: currentEnd.toJSDate(),
      aggregation
    },
    {
      index: 1,
      id: "reference",
      role: "reference",
      start: refStart.toJSDate(),
      end: refEnd.toJSDate(),
      aggregation
    }
  ];
}

function resolveAnchorPoint(anchor: string, now: DateTime): DateTime {
  switch (anchor) {
    case "start_of_year":
      return now.startOf("year");
    case "start_of_month":
      return now.startOf("month");
    case "start_of_hour":
      return now.startOf("hour");
    case "now":
      return now;
    default:
      throw new Error(`Unknown anchor: ${anchor}`);
  }
}

function computeStartOfWindow0(
  merged: MergedTimeWindowConfig,
  now: DateTime,
  _timeZone: string
): DateTime {
  const anchor = merged.anchor!;
  const anchorPoint = resolveAnchorPoint(anchor, now);
  const offsetDur =
    merged.offset && merged.offset.trim() !== ""
      ? parseDurationToken(merged.offset)
      : undefined;

  if (!offsetDur || durationToMillis(offsetDur) === 0) {
    return anchorPoint;
  }

  if (anchor === "start_of_year") {
    let candidate = anchorPoint.plus(offsetDur);
    while (candidate > now) {
      candidate = candidate.minus({ years: 1 });
    }
    return candidate;
  }

  return anchorPoint.plus(offsetDur);
}

function minusStepRepeated(start: DateTime, step: ReturnType<typeof parseDurationToken>, i: number): DateTime {
  const s = step!;
  let cur = start;
  for (let k = 0; k < i; k++) {
    cur = cur.minus(s);
  }
  return cur;
}

function resolveGeneric(
  merged: MergedTimeWindowConfig,
  now: DateTime,
  _timeZone: string,
  count: number,
  aggregation: WindowAggregation
): ResolvedWindow[] {
  const duration = parseDurationToken(merged.duration!)!;
  const step = parseDurationToken(merged.step!)!;
  const start0 = computeStartOfWindow0(merged, now, _timeZone);

  const windows: ResolvedWindow[] = [];
  for (let i = 0; i < count; i++) {
    const start = minusStepRepeated(start0, step, i);
    const end = start.plus(duration).minus({ milliseconds: 1 });
    const role =
      i === 0 ? "current" : i === 1 ? "reference" : "context";
    const id =
      i === 0 ? "current" : i === 1 ? "reference" : `historical_${i}`;

    windows.push({
      index: i,
      id,
      role,
      start: start.toJSDate(),
      end: end.toJSDate(),
      aggregation
    });
  }
  return windows;
}

export function resolveTimeWindows(
  merged: MergedTimeWindowConfig,
  now: Date | LuxonDateTime,
  timeZone: string,
  maxWindows = 24,
  aggregationFallback: WindowAggregation = "day"
): ResolvedWindow[] {
  const dt =
    now instanceof Date
      ? DateTime.fromJSDate(now, { zone: timeZone })
      : (now as LuxonDateTime).setZone(timeZone);

  const agg = merged.aggregation ?? aggregationFallback;
  const count = Math.min(merged.count ?? 1, maxWindows);

  if (merged.currentEndIsNow && merged.referenceFullPeriod && count === 2) {
    return resolveLegacy(merged, dt, timeZone, agg);
  }

  return resolveGeneric(merged, dt, timeZone, count, agg);
}
