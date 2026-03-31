import { DateTime } from "luxon";
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
    tooltipFormatPattern
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

  switch (primaryAggregation) {
    case "month":
      return new Intl.DateTimeFormat(labelLocale, { month: "long" }).format(d);
    case "week":
    case "day":
      return new Intl.DateTimeFormat(labelLocale, {
        day: "numeric",
        month: "long"
      }).format(d);
    case "hour": {
      const timePart = new Intl.DateTimeFormat(labelLocale, {
        hour: "numeric",
        minute: "2-digit"
      }).format(d);
      if (mergedDurationMs > MS_DAY) {
        const dayPart = new Intl.DateTimeFormat(labelLocale, {
          day: "numeric",
          month: "short"
        }).format(d);
        return `${timePart}, ${dayPart}`;
      }
      return timePart;
    }
    default:
      return new Intl.DateTimeFormat(labelLocale, {
        day: "numeric",
        month: "long"
      }).format(d);
  }
}
