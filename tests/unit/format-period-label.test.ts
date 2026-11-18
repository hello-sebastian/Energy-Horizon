/**
 * 911/TD-10 — single period-label implementation (W1).
 *
 * Tests the pure `formatPeriodLabel()` from
 * `src/card/labels/period-label.ts`. (Note: `period-label.test.ts` is the
 * pre-existing test file for the compact period *caption* feature —
 * `formatCompactPeriodCaption` — not this function; the files only share
 * the "period label" wording.)
 *
 * Pinned behavior (FR-019 byte-for-byte parity with the removed inline
 * duplicates): a period starting on January 1 — evaluated in the given
 * zone — is labeled by the year alone; any other start gets the localized
 * long month name plus year. The January 1 edge check runs in the HA
 * zone, while the month name comes from `Intl.DateTimeFormat` with the
 * host zone (preserved quirk — the suite runs with TZ=UTC, so the host
 * zone is deterministic).
 *
 * Domain: 905 (FR-905-N).
 */
import { describe, expect, it } from "vitest";
import { formatPeriodLabel } from "../../src/card/labels/period-label";

const ALL_LANGUAGES = ["en", "pl", "de", "fr", "nl"] as const;

describe("formatPeriodLabel (911/TD-10)", () => {
  it("Jan 1 in the given zone → year only", () => {
    expect(
      formatPeriodLabel(new Date("2025-01-01T00:00:00Z"), "en", "UTC")
    ).toBe("2025");
  });

  it("year-only label is independent of the language", () => {
    const instant = new Date("2025-01-01T00:00:00Z");
    for (const locale of ALL_LANGUAGES) {
      expect(formatPeriodLabel(instant, locale, "UTC")).toBe("2025");
    }
  });

  it("Jan 1 in a non-UTC zone (UTC offset lands on Jan 1) → year only", () => {
    // 2025-01-01T05:00Z is 2025-01-01T06:00 in Europe/Warsaw (UTC+1 in January).
    expect(
      formatPeriodLabel(
        new Date("2025-01-01T05:00:00Z"),
        "en",
        "Europe/Warsaw"
      )
    ).toBe("2025");
  });

  it("Dec 31 in the zone → long month + year, not the year only", () => {
    expect(
      formatPeriodLabel(new Date("2024-12-31T23:00:00Z"), "en", "UTC")
    ).toBe("December 2024");
  });

  it("mid-month start → long month + year", () => {
    expect(
      formatPeriodLabel(new Date("2024-10-15T12:00:00Z"), "en", "UTC")
    ).toBe("October 2024");
  });

  it("the January 1 edge is decided in the zone, not the host zone", () => {
    // 2024-12-31T23:00Z is 2025-01-01T13:00 in Pacific/Kiritimati (UTC+14)
    // → year only, even though the host (UTC) still reads December.
    expect(
      formatPeriodLabel(
        new Date("2024-12-31T23:00:00Z"),
        "en",
        "Pacific/Kiritimati"
      )
    ).toBe("2025");
  });

  it("month name is formatted in the host zone (preserved pre-911 quirk)", () => {
    // Host zone is UTC (suite runs with TZ=UTC): the label reads
    // "January 2025" even though in Los Angeles the instant is
    // 2024-12-31T19:00 (December). This matches the removed inline
    // implementations byte-for-byte (FR-019) and is intentionally kept.
    expect(
      formatPeriodLabel(
        new Date("2025-01-01T03:00:00Z"),
        "en",
        "America/Los_Angeles"
      )
    ).toBe("January 2025");
  });

  it("formats the long month name in all five card languages", () => {
    const instant = new Date("2024-10-15T12:00:00Z");
    expect(formatPeriodLabel(instant, "en", "UTC")).toBe("October 2024");
    // Polish month names are lowercase in ICU (as in the language).
    expect(formatPeriodLabel(instant, "pl", "UTC")).toBe("październik 2024");
    expect(formatPeriodLabel(instant, "de", "UTC")).toBe("Oktober 2024");
    expect(formatPeriodLabel(instant, "fr", "UTC")).toBe("octobre 2024");
    expect(formatPeriodLabel(instant, "nl", "UTC")).toBe("oktober 2024");
  });
});
