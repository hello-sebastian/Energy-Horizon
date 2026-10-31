import { DateTime } from "luxon";
import type { HomeAssistant } from "../../ha-types";
import type { ComparisonAxisLabelHints } from "../labels/comparison-label-hints";
import type { CardConfig, WindowAggregation } from "../types";

/**
 * Label locale: card `language` → `hass.locale.language` → `en` (no dictionary gate).
 */
export function resolveLabelLocale(
  hass: HomeAssistant | null | undefined,
  config: Pick<CardConfig, "language">
): string {
  const raw = config.language;
  if (raw !== undefined && String(raw).trim() !== "") {
    return String(raw).trim();
  }
  return (
    hass?.locale?.language ??
    (hass as { language?: string } | undefined)?.language ??
    "en"
  );
}

export function formatForcedTickLabel(
  ms: number,
  zone: string,
  locale: string,
  pattern: string
): string {
  return DateTime.fromMillis(ms, { zone })
    .setLocale(locale)
    .toFormat(pattern);
}

/**
 * Adaptive X-axis labels: `Intl.DateTimeFormat` + boundary context; index `0` is always a boundary.
 */
export function formatAdaptiveTickLabel(
  index: number,
  fullTimeline: number[],
  zone: string,
  locale: string,
  aggregation: WindowAggregation,
  opts?: {
    tailFromIndex?: number;
    comparisonHints?: ComparisonAxisLabelHints;
    /** HA `locale.time_format` → `true`/`false`; `undefined` = locale default. */
    hour12?: boolean;
  }
): string {
  const ms = fullTimeline[index];
  if (ms == null) return "";

  const cur = DateTime.fromMillis(ms, { zone });
  const tailFrom = opts?.tailFromIndex;
  const isTail = tailFrom != null && index >= tailFrom && tailFrom < fullTimeline.length;
  const prev =
    index > 0
      ? DateTime.fromMillis(fullTimeline[index - 1]!, { zone })
      : undefined;

  const dayChanged =
    !!prev &&
    (cur.day !== prev.day ||
      cur.month !== prev.month ||
      cur.year !== prev.year);
  const yearChanged = !!prev && cur.year !== prev.year;
  const monthChanged =
    !!prev && (cur.month !== prev.month || cur.year !== prev.year);

  const isFirst = index === 0;
  const hints = opts?.comparisonHints;
  const tz: Intl.DateTimeFormatOptions = { timeZone: zone };
  const d = new Date(ms);
  const hour12Opts: Intl.DateTimeFormatOptions =
    opts?.hour12 !== undefined ? { hour12: opts.hour12 } : {};

  if (isTail) {
    switch (aggregation) {
      case "day":
        return new Intl.DateTimeFormat(locale, {
          month: "short",
          day: "numeric",
          ...tz
        }).format(d);
      case "week":
      case "month":
        return new Intl.DateTimeFormat(locale, {
          month: "short",
          day: "numeric",
          ...tz
        }).format(d);
      case "hour":
        return new Intl.DateTimeFormat(locale, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          ...hour12Opts,
          ...tz
        }).format(d);
      default:
        return new Intl.DateTimeFormat(locale, {
          month: "short",
          day: "numeric",
          ...tz
        }).format(d);
    }
  }

  switch (aggregation) {
    case "hour": {
      if (isFirst || dayChanged) {
        return new Intl.DateTimeFormat(locale, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          ...hour12Opts,
          ...tz
        }).format(d);
      }
      return new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        ...hour12Opts,
        ...tz
      }).format(d);
    }
    case "day": {
      if (hints?.dayOfMonthOnlyOnAxis) {
        return new Intl.DateTimeFormat(locale, { day: "numeric", ...tz }).format(
          d
        );
      }
      const includeYear =
        (isFirst || yearChanged) && !hints?.omitYearOnAxis;
      const dOpts: Intl.DateTimeFormatOptions = includeYear
        ? { year: "numeric", month: "short", day: "numeric", ...tz }
        : { month: "short", day: "numeric", ...tz };
      return new Intl.DateTimeFormat(locale, dOpts).format(d);
    }
    case "week": {
      const wOpts: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        ...tz
      };
      if ((isFirst || yearChanged) && !hints?.omitYearOnAxis) {
        wOpts.year = "numeric";
      }
      return new Intl.DateTimeFormat(locale, wOpts).format(d);
    }
    case "month": {
      const mOpts: Intl.DateTimeFormatOptions = {
        month: "short",
        ...tz
      };
      if (
        (isFirst || yearChanged || monthChanged) &&
        !hints?.omitYearOnAxis
      ) {
        mOpts.year = "numeric";
      }
      return new Intl.DateTimeFormat(locale, mOpts).format(d);
    }
    default:
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        ...tz
      }).format(d);
  }
}
