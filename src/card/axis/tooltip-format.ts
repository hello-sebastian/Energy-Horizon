import { DateTime } from "luxon";
import type { ComparisonAxisLabelHints } from "../labels/comparison-label-hints";
import type { WindowAggregation } from "../types";

const MS_DAY = 86400000;

export interface FormatTooltipHeaderParams {
  slotIndex: number;
  fullTimeline: number[];
  /** Home Assistant IANA time zone. */
  zone: string;
  /** Same locale as X-axis labels (`resolveLabelLocale` / `xAxisLabelLocale`). */
  labelLocale: string;
  primaryAggregation: WindowAggregation;
  /** Merged window `duration` in ms (for hour + multi-day EC2). */
  mergedDurationMs: number;
  /** Optional Luxon pattern from card `tooltip_format`; overrides matrix. */
  tooltipFormatPattern?: string;
  /** When set, default tooltip header mirrors comparison X-axis label policy. */
  comparisonHints?: ComparisonAxisLabelHints;
  /** HA `locale.time_format` → `true`/`false`; `undefined` = locale default. */
  hour12?: boolean;
}

/**
 * Tooltip header: precision matches aggregation; no year in default matrix (comparison context).
 * Uses `fullTimeline[slotIndex]` only (primary window axis — EC1).
 */
export function formatTooltipHeader(p: FormatTooltipHeaderParams): string {
  const {
    slotIndex,
    fullTimeline,
    zone,
    labelLocale,
    primaryAggregation,
    mergedDurationMs,
    tooltipFormatPattern,
    comparisonHints,
    hour12
  } = p;

  if (
    !Number.isFinite(slotIndex) ||
    slotIndex < 0 ||
    slotIndex >= fullTimeline.length
  ) {
    return "";
  }

  const ms = fullTimeline[slotIndex];
  if (ms == null) return "";

  const trimmed = tooltipFormatPattern?.trim();
  if (trimmed) {
    return DateTime.fromMillis(ms, { zone })
      .setLocale(labelLocale)
      .toFormat(trimmed);
  }

  const d = new Date(ms);
  const tz: Intl.DateTimeFormatOptions = { timeZone: zone };

  switch (primaryAggregation) {
    case "month":
      return new Intl.DateTimeFormat(labelLocale, { month: "long", ...tz }).format(
        d
      );
    case "week":
    case "day":
      if (comparisonHints?.dayOfMonthOnlyOnAxis && primaryAggregation === "day") {
        return new Intl.DateTimeFormat(labelLocale, {
          day: "numeric",
          ...tz
        }).format(d);
      }
      if (comparisonHints?.omitYearOnAxis) {
        return new Intl.DateTimeFormat(labelLocale, {
          day: "numeric",
          month: "long",
          ...tz
        }).format(d);
      }
      return new Intl.DateTimeFormat(labelLocale, {
        day: "numeric",
        month: "long",
        ...tz
      }).format(d);
    case "hour": {
      const timePart = new Intl.DateTimeFormat(labelLocale, {
        hour: "numeric",
        minute: "2-digit",
        ...(hour12 !== undefined ? { hour12 } : {}),
        ...tz
      }).format(d);
      if (mergedDurationMs > MS_DAY) {
        const dayPart = new Intl.DateTimeFormat(labelLocale, {
          day: "numeric",
          month: "short",
          ...tz
        }).format(d);
        return `${timePart}, ${dayPart}`;
      }
      return timePart;
    }
    default:
      return new Intl.DateTimeFormat(labelLocale, {
        day: "numeric",
        month: "long",
        ...tz
      }).format(d);
  }
}
