/**
 * Tooltip/legend row labels (issue #74).
 *
 * Tests the pure `isNameablePeriod()` (FR-905-O) and `rowPeriodLabel()`
 * (FR-905-P) from `src/card/labels/period-label.ts` (domain 905;
 * refinement FR-902-AE, domain 902).
 *
 * A window is calendar-nameable when it is a full calendar unit in the
 * given zone (year: Jan 1 start, end = Jan 1 next year − 1 ms; month:
 * day-1 start, end = next month day-1 − 1 ms) or, for `role === "current"`
 * only, when it is the in-progress current window (unit-boundary start,
 * end = now) — which represents its nominal unit, consistent with
 * `expandCurrentWindowForCaption`.
 *
 * Zone behavior is exercised via the explicit `zone` argument (the suite
 * runs with TZ=UTC).
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isNameablePeriod,
  rowPeriodLabel
} from "../../src/card/labels/period-label";
import type { LocalizeFunction } from "../../src/card/localize";
import type { ResolvedWindow, WindowRole } from "../../src/card/types";

const d = (iso: string): Date => new Date(iso);

/** 2026-11-22T12:00Z — a deterministic "now" for in-progress windows. */
const NOW = "2026-11-22T12:00:00.000Z";

function call(
  startIso: string,
  endIso: string,
  role: WindowRole,
  zone: string
): boolean {
  return isNameablePeriod(d(startIso), d(endIso), role, zone);
}

describe("isNameablePeriod — full calendar units", () => {
  it("full calendar year (Jan 1 → Jan 1 next year − 1 ms) → nameable", () => {
    expect(
      call(
        "2025-01-01T00:00:00.000Z",
        "2025-12-31T23:59:59.999Z",
        "reference",
        "UTC"
      )
    ).toBe(true);
  });

  it("full calendar month (day 1 → next month day 1 − 1 ms) → nameable", () => {
    expect(
      call("2026-05-01T00:00:00.000Z", "2026-05-31T23:59:59.999Z", "reference", "UTC")
    ).toBe(true);
  });

  it("full month with 28 days (February, non-leap) → nameable", () => {
    expect(
      call("2025-02-01T00:00:00.000Z", "2025-02-28T23:59:59.999Z", "reference", "UTC")
    ).toBe(true);
  });

  it("a year ending exactly at the boundary (no −1 ms) is not the pinned geometry", () => {
    // resolve-windows always ends full units at unit − 1 ms; the +1 ms
    // normalization in the predicate must not treat an over-long window
    // (end = Jan 1 next year, 0 ms) as nameable... (e1 = Jan 2 ≠ Jan 1+1y)
    expect(
      call("2025-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z", "reference", "UTC")
    ).toBe(false);
  });
});

describe("isNameablePeriod — in-progress current (role exception)", () => {
  it("in-progress year (Jan 1 start, end = now) with role current → nameable", () => {
    expect(call("2026-01-01T00:00:00.000Z", NOW, "current", "UTC")).toBe(true);
  });

  it("in-progress month (day-1 start, end = now) with role current → nameable", () => {
    expect(call("2026-11-01T00:00:00.000Z", NOW, "current", "UTC")).toBe(true);
  });

  it("the role exception applies only to role current — same geometry, role reference", () => {
    expect(call("2026-01-01T00:00:00.000Z", NOW, "reference", "UTC")).toBe(false);
  });

  it("the role exception applies only to role current — same geometry, role context", () => {
    expect(call("2026-11-01T00:00:00.000Z", NOW, "context", "UTC")).toBe(false);
  });
});

describe("isNameablePeriod — non-nameable geometries", () => {
  it("custom 30d window anchored at now (arbitrary start day) → not nameable", () => {
    expect(call("2026-10-23T12:00:00.000Z", NOW, "current", "UTC")).toBe(false);
  });

  it("6-month window anchored at now (arbitrary start day) → not nameable", () => {
    // NOW (2026-11-22T12:00Z) − 6M = 2026-05-22T12:00Z — not a day-1 start.
    expect(call("2026-05-22T12:00:00.000Z", NOW, "current", "UTC")).toBe(false);
  });

  it("2-month window anchored at now (arbitrary start day) → not nameable", () => {
    // NOW − 2M = 2026-09-22T12:00Z — not a day-1 start.
    expect(call("2026-09-22T12:00:00.000Z", NOW, "current", "UTC")).toBe(false);
  });

  it("week-based window (start_of_week, arbitrary weekday start) → not nameable", () => {
    // Wednesday-start 7d window (2026-04-08 is a Wednesday).
    expect(
      call("2026-04-08T00:00:00.000Z", "2026-04-14T23:59:59.999Z", "current", "UTC")
    ).toBe(false);
  });

  it("day-1 start but non-midnight (30d from noon), role reference → not nameable", () => {
    expect(
      call("2026-05-01T12:00:00.000Z", "2026-05-31T11:59:59.999Z", "reference", "UTC")
    ).toBe(false);
  });

  it("day-1 start but non-midnight, role current → nameable via the role exception", () => {
    // The approved predicate keys the in-progress-current exception on the
    // calendar day, not the time of day: a current window starting May 1
    // 12:00 labels as its nominal month ("May 2026").
    expect(
      call("2026-05-01T12:00:00.000Z", "2026-05-31T11:59:59.999Z", "current", "UTC")
    ).toBe(true);
  });

  it("month window ending 1 ms short of the unit end → not nameable", () => {
    expect(
      call("2026-05-01T00:00:00.000Z", "2026-05-31T23:59:59.998Z", "reference", "UTC")
    ).toBe(false);
  });

  it("year window ending 1 ms short of the unit end → not nameable", () => {
    expect(
      call("2025-01-01T00:00:00.000Z", "2025-12-31T23:59:59.998Z", "reference", "UTC")
    ).toBe(false);
  });
});

describe("isNameablePeriod — zone correctness", () => {
  it("full month across a US DST transition (America/Chicago) → nameable in the zone", () => {
    // March 2026 in America/Chicago: DST starts Mar 8.
    // Mar 1 00:00 CST = 2026-03-01T06:00:00Z; Apr 1 00:00 CDT = 2026-04-01T05:00:00Z.
    expect(
      call(
        "2026-03-01T06:00:00.000Z",
        "2026-04-01T04:59:59.999Z",
        "reference",
        "America/Chicago"
      )
    ).toBe(true);
  });

  it("the same instants are not a full month in UTC (start not at midnight)", () => {
    expect(
      call(
        "2026-03-01T06:00:00.000Z",
        "2026-04-01T04:59:59.999Z",
        "reference",
        "UTC"
      )
    ).toBe(false);
  });

  it("full month in Asia/Kolkata (UTC+5:30) → nameable in the zone", () => {
    // May 1 00:00 IST = 2026-04-30T18:30:00Z; Jun 1 00:00 IST = 2026-05-31T18:30:00Z.
    expect(
      call(
        "2026-04-30T18:30:00.000Z",
        "2026-05-31T18:29:59.999Z",
        "reference",
        "Asia/Kolkata"
      )
    ).toBe(true);
  });

  it("the same instants are not a full month in UTC", () => {
    expect(
      call(
        "2026-04-30T18:30:00.000Z",
        "2026-05-31T18:29:59.999Z",
        "reference",
        "UTC"
      )
    ).toBe(false);
  });

  it("in-progress month current, boundary visible only in the zone", () => {
    // Nov 1 23:00 CDT = 2026-11-02T04:00:00Z: still day 1 in America/Chicago,
    // but day 2 in UTC — the role exception must fire only in the zone.
    expect(call("2026-11-02T04:00:00.000Z", NOW, "current", "America/Chicago")).toBe(
      true
    );
    expect(call("2026-11-02T04:00:00.000Z", NOW, "current", "UTC")).toBe(false);
  });

  it("in-progress year current, boundary visible only in Asia/Kolkata", () => {
    // Jan 1 00:00 IST = 2025-12-31T18:30:00Z.
    expect(
      call("2025-12-31T18:30:00.000Z", NOW, "current", "Asia/Kolkata")
    ).toBe(true);
    expect(call("2025-12-31T18:30:00.000Z", NOW, "current", "UTC")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rowPeriodLabel (FR-905-P) — concrete name or role-aware fallback.
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const translationsDir = join(__dirname, "../../src/translations");

/**
 * Identity localize: returns the key itself, so assertions pin the exact
 * translation key selection (the string values are pinned by the i18n guard
 * below and by the translation files).
 */
const identity: LocalizeFunction = (key) => key;

function window(
  index: number,
  role: WindowRole,
  startIso: string,
  endIso: string
): ResolvedWindow {
  return {
    index,
    id: `w${index}`,
    role,
    start: d(startIso),
    end: d(endIso),
    aggregation: "day"
  };
}

/** Non-nameable 30d window anchored at NOW (arbitrary start day). */
const NON_NAMEABLE = {
  start: "2026-10-23T12:00:00.000Z",
  end: NOW
};

describe("rowPeriodLabel — concrete names (FR-902-AE)", () => {
  it("YoY reference (1 I 2025 → 1 I 2026 − 1 ms) → '2025'", () => {
    const w = window(1, "reference", "2025-01-01T00:00:00.000Z", "2025-12-31T23:59:59.999Z");
    expect(rowPeriodLabel(w, 1, false, "en", "UTC", identity)).toBe("2025");
  });

  it("in-progress YoY current (1 I 2026 → now, role exception) → '2026'", () => {
    const w = window(0, "current", "2026-01-01T00:00:00.000Z", NOW);
    expect(rowPeriodLabel(w, 0, false, "en", "UTC", identity)).toBe("2026");
  });

  it("in-progress MoM current → localized month + year in all 5 locales", () => {
    const w = window(0, "current", "2026-11-01T00:00:00.000Z", NOW);
    expect(rowPeriodLabel(w, 0, false, "en", "UTC", identity)).toBe("November 2026");
    expect(rowPeriodLabel(w, 0, false, "pl", "UTC", identity)).toBe("listopad 2026");
    expect(rowPeriodLabel(w, 0, false, "de", "UTC", identity)).toBe("November 2026");
    expect(rowPeriodLabel(w, 0, false, "fr", "UTC", identity)).toBe("novembre 2026");
    expect(rowPeriodLabel(w, 0, false, "nl", "UTC", identity)).toBe("november 2026");
  });

  it("full MoM reference → localized month + year", () => {
    const w = window(1, "reference", "2025-11-01T00:00:00.000Z", "2025-11-30T23:59:59.999Z");
    expect(rowPeriodLabel(w, 1, false, "en", "UTC", identity)).toBe("November 2025");
    expect(rowPeriodLabel(w, 1, false, "pl", "UTC", identity)).toBe("listopad 2025");
  });

  it("December window (1 XII → 1 I − 1 ms) → 'December 2026'", () => {
    const w = window(1, "reference", "2026-12-01T00:00:00.000Z", "2026-12-31T23:59:59.999Z");
    expect(rowPeriodLabel(w, 1, false, "en", "UTC", identity)).toBe("December 2026");
  });

  it("nameable preview current → the shifted period's concrete name, never the current label", () => {
    const w = window(0, "current", "2026-10-01T00:00:00.000Z", "2026-10-31T23:59:59.999Z");
    const label = rowPeriodLabel(w, 0, true, "en", "UTC", identity);
    expect(label).toBe("October 2026");
    expect(label).not.toBe("period.current");
    expect(label).not.toBe("Current period");
  });
});

describe("rowPeriodLabel — role-aware fallbacks (FR-905-P)", () => {
  it("non-nameable default current (index 0, not preview) → period.current", () => {
    const w = window(0, "current", NON_NAMEABLE.start, NON_NAMEABLE.end);
    expect(rowPeriodLabel(w, 0, false, "en", "UTC", identity)).toBe("period.current");
  });

  it("non-nameable preview current (index 0, preview) → period.generic, never period.current", () => {
    const w = window(0, "current", NON_NAMEABLE.start, NON_NAMEABLE.end);
    expect(rowPeriodLabel(w, 0, true, "en", "UTC", identity)).toBe("period.generic");
  });

  it("non-nameable index 1 → period.reference", () => {
    const w = window(1, "reference", NON_NAMEABLE.start, NON_NAMEABLE.end);
    expect(rowPeriodLabel(w, 1, false, "en", "UTC", identity)).toBe("period.reference");
  });

  it("non-nameable context rows (index >= 2) → 'period.reference (n)' (existing form)", () => {
    expect(
      rowPeriodLabel(
        window(2, "context", NON_NAMEABLE.start, NON_NAMEABLE.end),
        2,
        false,
        "en",
        "UTC",
        identity
      )
    ).toBe("period.reference (2)");
    expect(
      rowPeriodLabel(
        window(5, "context", NON_NAMEABLE.start, NON_NAMEABLE.end),
        5,
        false,
        "en",
        "UTC",
        identity
      )
    ).toBe("period.reference (5)");
  });

  it("a nameable window is labeled by its concrete name even in preview (fallback only when not nameable)", () => {
    const w = window(0, "current", "2026-10-01T00:00:00.000Z", "2026-10-31T23:59:59.999Z");
    expect(rowPeriodLabel(w, 0, true, "en", "UTC", identity)).toBe("October 2026");
    expect(rowPeriodLabel(w, 0, true, "en", "UTC", identity)).not.toBe("period.generic");
  });
});

describe("rowPeriodLabel — uniqueness invariant (tooltip seriesName matching)", () => {
  it("24 consecutive monthly windows (2 years) yield pairwise distinct row labels", () => {
    const labels: string[] = [];
    for (let i = 0; i < 24; i++) {
      const start = new Date(Date.UTC(2025, i, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(2025, i + 1, 1, 0, 0, 0, 0));
      const w: ResolvedWindow = {
        index: i,
        id: `w${i}`,
        role: i === 0 ? "current" : i === 1 ? "reference" : "context",
        start,
        end: new Date(end.getTime() - 1),
        aggregation: "day"
      };
      labels.push(rowPeriodLabel(w, i, false, "en", "UTC", identity));
    }
    expect(new Set(labels).size).toBe(24);
  });
});

describe("period.generic i18n guard (FR-905-P)", () => {
  it("exists with the signed-off value in all 5 translation files", () => {
    const expected: Record<string, string> = {
      "en.json": "Period",
      "pl.json": "Okres",
      "de.json": "Zeitraum",
      "fr.json": "Période",
      "nl.json": "Periode"
    };
    const files = readdirSync(translationsDir)
      .filter((f) => f.endsWith(".json"))
      .sort();
    expect(files).toEqual(Object.keys(expected).sort());
    for (const file of files) {
      const raw = readFileSync(join(translationsDir, file), "utf-8");
      const dict = JSON.parse(raw) as Record<string, string>;
      expect(dict["period.generic"], `${file}: period.generic`).toBe(
        expected[file]
      );
    }
  });
});
