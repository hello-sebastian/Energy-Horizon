/**
 * Single source for the card's period label (911/TD-10, FR-010; domain 905).
 *
 * A period starting on January 1 is labeled with the year alone ("2025");
 * any other start is labeled with the localized long month name and the
 * year ("October 2024", "październik 2024").
 *
 * Deliberately preserved quirk (byte-for-byte parity, 911 FR-019): the
 * January 1 edge check runs in `zone` (the user's Home Assistant time
 * zone), while the month name is produced by `Intl.DateTimeFormat` with
 * the host default zone (no `timeZone` option). Do not "fix" the second
 * half without a user-visible change decision.
 */
import { DateTime } from "luxon";
import type { LocalizeFunction } from "../localize";
import type { ResolvedWindow, WindowRole } from "../types";

/**
 * Formats the label for a comparison period starting at `instant`.
 *
 * @param instant - Period start as a JS `Date`.
 * @param locale - Display language (BCP-47 tag, e.g. `"pl"`).
 * @param zone - IANA time zone used for the January 1 edge check (the
 * user's HA time zone).
 */
export function formatPeriodLabel(
  instant: Date,
  locale: string,
  zone: string
): string {
  const local = DateTime.fromJSDate(instant, { zone });
  if (local.month === 1 && local.day === 1) {
    return String(local.year);
  }
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric"
  }).format(instant);
}

/**
 * Whether a window is calendar-nameable — i.e. whether the row that
 * represents it can be labeled with the concrete period name via
 * `formatPeriodLabel` (FR-905-O, issue #74).
 *
 * Nameable geometries (all evaluated in `zone`):
 * - a full calendar year: start Jan 1 00:00, end Jan 1 next year − 1 ms;
 * - a full calendar month: start day 1 00:00, end next month day 1 − 1 ms;
 * - the in-progress current window (role exception): unit-boundary start
 *   (Jan 1 or day 1) with `end = now` — it represents its nominal unit,
 *   consistent with `expandCurrentWindowForCaption`. Applies to
 *   `role === "current"` only.
 *
 * Full units end at `unit − 1 ms` (the resolver's pinned geometry), so the
 * check normalizes `end` with +1 ms before comparing against the unit
 * boundary.
 */
export function isNameablePeriod(
  start: Date,
  end: Date,
  role: WindowRole,
  zone: string
): boolean {
  const s = DateTime.fromJSDate(start, { zone });
  const e1 = DateTime.fromJSDate(end, { zone }).plus({ milliseconds: 1 });
  const fullYear =
    s.month === 1 &&
    s.day === 1 &&
    e1.equals(s.startOf("year").plus({ years: 1 }));
  const fullMonth =
    s.day === 1 && e1.equals(s.startOf("month").plus({ months: 1 }));
  const inProgressCurrent = role === "current" && (s.month === 1 || s.day === 1);
  return fullYear || fullMonth || inProgressCurrent;
}

/**
 * The label for a chart tooltip/legend row (FR-905-P, FR-902-AE, issue #74).
 *
 * A calendar-nameable window is labeled with its concrete period name
 * (`formatPeriodLabel`). Rows whose window is not nameable fall back to a
 * role-aware generic label:
 * - index 0, not preview → `period.current` ("Current period") — reserved
 *   for the actual current (green) series;
 * - index 0, preview → `period.generic` ("Period") — a rolled-back (preview)
 *   window is never labeled "Current period" (owner constraint);
 * - index 1 → `period.reference`;
 * - index ≥ 2 → `period.reference (n)` (existing form kept).
 *
 * Row labels are pairwise distinct per chart (calendar-stepped windows +
 * the index suffix), which protects the renderer's tooltip `seriesName`
 * matching.
 */
export function rowPeriodLabel(
  w: ResolvedWindow,
  index: number,
  isPreview: boolean,
  locale: string,
  zone: string,
  localize: LocalizeFunction
): string {
  if (isNameablePeriod(w.start, w.end, w.role, zone)) {
    return formatPeriodLabel(w.start, locale, zone);
  }
  if (index === 0) {
    return isPreview ? localize("period.generic") : localize("period.current");
  }
  if (index === 1) {
    return localize("period.reference");
  }
  return `${localize("period.reference")} (${index})`;
}
