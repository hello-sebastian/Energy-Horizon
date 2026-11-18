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
