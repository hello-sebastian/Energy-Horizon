import { DateTime } from "luxon";
import type {
  ComparisonMode,
  ComparisonPeriod,
  MergedTimeWindowConfig,
  ResolvedWindow
} from "../types";

/** Resolved window for caption formatting when `rw[i]` is missing (fallback to `ComparisonPeriod`). */
export function resolvedWindowForCaption(
  rw: ResolvedWindow[] | undefined,
  period: ComparisonPeriod,
  index: 0 | 1
): ResolvedWindow {
  const w = rw?.[index];
  if (w) {
    return w;
  }
  if (index === 0) {
    return {
      index: 0,
      id: "w0",
      role: "current",
      start: period.current_start,
      end: period.current_end,
      aggregation: period.aggregation
    };
  }
  return {
    index: 1,
    id: "w1",
    role: "reference",
    start: period.reference_start,
    end: period.reference_end,
    aggregation: period.aggregation
  };
}

export interface CompactPeriodCaptionOptions {
  zone: string;
  locale: string;
  /** `true` / `false` from HA `time_format`; omit for locale default */
  hour12?: boolean;
}

const RANGE_SEP = " – ";

/** Wall-clock instant in `zone` — do not set locale here; Luxon `equals()` is locale-sensitive. */
function atZone(dt: Date, zone: string): DateTime {
  return DateTime.fromMillis(dt.getTime(), { zone });
}

/**
 * For legacy presets with `currentEndIsNow`, LTS uses `end = now` while the **nominal**
 * comparison period is the full calendar month or year. Expand `end` for captions only
 * so `formatCompactPeriodCaption` can show e.g. `Apr 2026` instead of `1 Apr – 12 Apr 2026`.
 * Skipped for `hour` aggregation (would imply an unusably long hourly range label).
 */
export function expandCurrentWindowForCaption(
  window: ResolvedWindow,
  merged: MergedTimeWindowConfig | undefined,
  comparisonPreset: ComparisonMode,
  zone: string
): ResolvedWindow {
  if (merged?.currentEndIsNow !== true || window.role !== "current") {
    return window;
  }
  if (window.aggregation === "hour") {
    return window;
  }
  const s = atZone(window.start, zone);
  let nominalEnd: DateTime;
  if (comparisonPreset === "year_over_year") {
    nominalEnd = s.endOf("year");
  } else if (
    comparisonPreset === "month_over_year" ||
    comparisonPreset === "month_over_month"
  ) {
    nominalEnd = s.endOf("month");
  } else {
    return window;
  }
  return { ...window, end: nominalEnd.toJSDate() };
}

function forFormat(dt: DateTime, locale: string): DateTime {
  return dt.setLocale(locale);
}

function spansCalendarYears(s: DateTime, e: DateTime): boolean {
  return s.startOf("day").year !== e.startOf("day").year;
}

function isFullCalendarYear(s: DateTime, e: DateTime, zone: string): boolean {
  const y = s.year;
  const yearStart = DateTime.fromObject({ year: y, month: 1, day: 1 }, { zone }).startOf("day");
  const yearEnd = DateTime.fromObject({ year: y, month: 12, day: 31 }, { zone }).endOf("day");
  if (!s.startOf("day").equals(yearStart) || e.year !== y) {
    return false;
  }
  return e >= yearEnd.startOf("day") && e <= yearEnd;
}

function isFullCalendarMonth(s: DateTime, e: DateTime, zone: string): boolean {
  if (!s.startOf("day").equals(s.startOf("month").startOf("day"))) {
    return false;
  }
  if (s.year !== e.year || s.month !== e.month) {
    return false;
  }
  const last = DateTime.fromObject(
    { year: s.year, month: s.month, day: 1 },
    { zone }
  )
    .endOf("month")
    .startOf("day");
  return e.startOf("day").equals(last);
}

function peerRequiresYearSuffix(w: DateTime, wEnd: DateTime, peer: ResolvedWindow | undefined, zone: string): boolean {
  if (!peer) {
    return spansCalendarYears(w, wEnd);
  }
  const p0 = atZone(peer.start, zone);
  if (w.year !== p0.year) {
    return true;
  }
  if (spansCalendarYears(w, wEnd)) {
    return true;
  }
  const p1 = atZone(peer.end, zone);
  if (spansCalendarYears(p0, p1)) {
    return true;
  }
  return false;
}

function timeFormatToken(hour12: boolean | undefined): string {
  if (hour12 === true) {
    return "h:mm a";
  }
  return "HH:mm";
}

function formatTime(dt: DateTime, locale: string, hour12: boolean | undefined): string {
  return forFormat(dt, locale).toFormat(timeFormatToken(hour12));
}

/**
 * Compact period label for summary captions (narrow tiles).
 * Uses Home Assistant time zone and label locale; optional HA `time_format` for clock times.
 */
export function formatCompactPeriodCaption(
  window: ResolvedWindow,
  peerWindow: ResolvedWindow | undefined,
  opts: CompactPeriodCaptionOptions
): string {
  const { zone, locale, hour12 } = opts;
  const s = atZone(window.start, zone);
  const e = atZone(window.end, zone);
  const { aggregation } = window;

  if (isFullCalendarYear(s, e, zone)) {
    return String(s.year);
  }

  if (isFullCalendarMonth(s, e, zone)) {
    return forFormat(s, locale).toFormat("LLL yyyy");
  }

  const sameDay = s.startOf("day").equals(e.startOf("day"));
  const sameMonth = s.year === e.year && s.month === e.month;
  const needYear = peerRequiresYearSuffix(s, e, peerWindow, zone);

  if (aggregation === "hour" && sameDay) {
    const timePart = `${formatTime(s, locale, hour12)}${RANGE_SEP}${formatTime(e, locale, hour12)}`;
    const datePart = needYear
      ? forFormat(s, locale).toFormat("d LLL yyyy")
      : forFormat(s, locale).toFormat("d LLL");
    return `${timePart}, ${datePart}`;
  }

  if (aggregation === "hour" && !sameDay) {
    if (spansCalendarYears(s, e)) {
      return `${forFormat(s, locale).toFormat("d LLL yyyy")} ${formatTime(s, locale, hour12)}${RANGE_SEP}${forFormat(e, locale).toFormat("d LLL yyyy")} ${formatTime(e, locale, hour12)}`;
    }
    const left = `${forFormat(s, locale).toFormat("d LLL")} ${formatTime(s, locale, hour12)}`;
    const right = `${forFormat(e, locale).toFormat("d LLL")} ${formatTime(e, locale, hour12)}`;
    const yearSuffix = needYear ? ` ${s.year}` : "";
    return `${left}${RANGE_SEP}${right}${yearSuffix}`;
  }

  if (sameDay) {
    const core = forFormat(s, locale).toFormat("d LLL");
    return needYear ? `${core} ${s.year}` : core;
  }

  if (sameMonth) {
    const left = forFormat(s, locale).toFormat("d LLL");
    const right = forFormat(e, locale).toFormat("d LLL");
    const core = `${left}${RANGE_SEP}${right}`;
    return needYear ? `${core} ${s.year}` : core;
  }

  if (s.year !== e.year) {
    return `${forFormat(s, locale).toFormat("d LLL yyyy")}${RANGE_SEP}${forFormat(e, locale).toFormat("d LLL yyyy")}`;
  }

  const core = `${forFormat(s, locale).toFormat("d LLL")}${RANGE_SEP}${forFormat(e, locale).toFormat("d LLL")}`;
  return needYear ? `${core} ${s.year}` : core;
}

/** Maps Home Assistant `locale.time_format` to `hour12` when set. */
export function hour12FromHaTimeFormat(
  timeFormat: string | undefined
): boolean | undefined {
  if (timeFormat === "12") {
    return true;
  }
  if (timeFormat === "24") {
    return false;
  }
  return undefined;
}
