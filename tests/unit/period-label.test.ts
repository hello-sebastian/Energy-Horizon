import { describe, it, expect } from "vitest";
import { isForecastLineVisible } from "../../src/card/cumulative-comparison-chart";
import {
  expandCurrentWindowForCaption,
  formatCompactPeriodCaption,
  hour12FromHaTimeFormat,
  resolvedWindowForCaption
} from "../../src/card/labels/compact-period-caption";
import type {
  ComparisonPeriod,
  MergedTimeWindowConfig,
  ResolvedWindow
} from "../../src/card/types";

const ZONE = "UTC";
const en = { zone: ZONE, locale: "en" };

function rw(
  start: Date,
  end: Date,
  aggregation: ResolvedWindow["aggregation"] = "day",
  role: ResolvedWindow["role"] = "current"
): ResolvedWindow {
  return {
    index: 0,
    id: "w0",
    role,
    start,
    end,
    aggregation
  };
}

describe("formatCompactPeriodCaption", () => {
  it("full calendar year → yyyy", () => {
    const start = new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(2025, 11, 31, 23, 59, 59, 999));
    const w = rw(start, end, "day");
    expect(formatCompactPeriodCaption(w, undefined, en)).toBe("2025");
  });

  it("full calendar month → short month + year (en)", () => {
    const start = new Date(Date.UTC(2026, 4, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(2026, 4, 31, 23, 59, 59, 999));
    const w = rw(start, end, "day");
    expect(formatCompactPeriodCaption(w, undefined, en)).toBe("May 2026");
  });

  it("full calendar month includes year in pl", () => {
    const start = new Date(Date.UTC(2026, 4, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(2026, 4, 31, 23, 59, 59, 999));
    const w = rw(start, end, "day");
    const s = formatCompactPeriodCaption(w, undefined, { zone: ZONE, locale: "pl" });
    expect(s).toMatch(/2026/);
  });

  it("same calendar day without peer → day + short month, no year", () => {
    const start = new Date(Date.UTC(2026, 3, 11, 8, 0, 0, 0));
    const end = new Date(Date.UTC(2026, 3, 11, 18, 0, 0, 0));
    const w = rw(start, end, "day");
    expect(formatCompactPeriodCaption(w, undefined, en)).toBe("11 Apr");
  });

  it("same calendar day with peer in different year → includes year", () => {
    const current = rw(
      new Date(Date.UTC(2026, 3, 11, 0, 0, 0, 0)),
      new Date(Date.UTC(2026, 3, 11, 23, 59, 59, 999)),
      "day",
      "current"
    );
    const reference = rw(
      new Date(Date.UTC(2025, 3, 11, 0, 0, 0, 0)),
      new Date(Date.UTC(2025, 3, 11, 23, 59, 59, 999)),
      "day",
      "reference"
    );
    expect(formatCompactPeriodCaption(current, reference, en)).toBe("11 Apr 2026");
    expect(formatCompactPeriodCaption(reference, current, en)).toBe("11 Apr 2025");
  });

  it("same month different days, same peer year → range without repeated year", () => {
    const a = rw(
      new Date(Date.UTC(2026, 3, 11, 0, 0, 0, 0)),
      new Date(Date.UTC(2026, 3, 23, 23, 59, 59, 999)),
      "day"
    );
    const b = rw(
      new Date(Date.UTC(2026, 3, 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2026, 3, 30, 23, 59, 59, 999)),
      "day",
      "reference"
    );
    expect(formatCompactPeriodCaption(a, b, en)).toBe("11 Apr – 23 Apr");
  });

  it("cross-month same calendar year → compact range", () => {
    const w = rw(
      new Date(Date.UTC(2026, 3, 28, 0, 0, 0, 0)),
      new Date(Date.UTC(2026, 4, 5, 23, 59, 59, 999)),
      "day"
    );
    expect(formatCompactPeriodCaption(w, undefined, en)).toBe("28 Apr – 5 May");
  });

  it("cross calendar year → both sides include year", () => {
    const w = rw(
      new Date(Date.UTC(2025, 11, 30, 0, 0, 0, 0)),
      new Date(Date.UTC(2026, 0, 2, 23, 59, 59, 999)),
      "day"
    );
    expect(formatCompactPeriodCaption(w, undefined, en)).toBe(
      "30 Dec 2025 – 2 Jan 2026"
    );
  });

  it("hour aggregation same day → time range, then date", () => {
    const w = rw(
      new Date(Date.UTC(2026, 3, 10, 10, 12, 0, 0)),
      new Date(Date.UTC(2026, 3, 10, 15, 12, 0, 0)),
      "hour"
    );
    expect(formatCompactPeriodCaption(w, undefined, { ...en, hour12: false })).toBe(
      "10:12 – 15:12, 10 Apr"
    );
  });

  it("hour aggregation multi-day same year → date+time range with year when peer differs", () => {
    const w = rw(
      new Date(Date.UTC(2026, 3, 10, 8, 0, 0, 0)),
      new Date(Date.UTC(2026, 3, 11, 16, 0, 0, 0)),
      "hour"
    );
    const peer = rw(
      new Date(Date.UTC(2025, 3, 10, 0, 0, 0, 0)),
      new Date(Date.UTC(2025, 3, 11, 0, 0, 0, 0)),
      "hour",
      "reference"
    );
    const s = formatCompactPeriodCaption(w, peer, { ...en, hour12: false });
    expect(s).toContain("2026");
    expect(s).toContain("–");
  });
});

describe("expandCurrentWindowForCaption", () => {
  const mergedNow: MergedTimeWindowConfig = { currentEndIsNow: true };

  it("extends current day window to end of month for month_over_year (caption shows full month)", () => {
    const start = new Date(Date.UTC(2026, 3, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(2026, 3, 12, 15, 0, 0, 0));
    const w = rw(start, end, "day", "current");
    const ref = rw(
      new Date(Date.UTC(2025, 3, 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2025, 3, 30, 23, 59, 59, 999)),
      "day",
      "reference"
    );
    const wCap = expandCurrentWindowForCaption(w, mergedNow, "month_over_year", ZONE);
    expect(wCap.end.getTime()).toBeGreaterThan(end.getTime());
    expect(formatCompactPeriodCaption(wCap, ref, en)).toBe("Apr 2026");
    expect(formatCompactPeriodCaption(ref, w, en)).toBe("Apr 2025");
  });

  it("extends current to end of year for year_over_year", () => {
    const start = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(2026, 3, 12, 12, 0, 0, 0));
    const w = rw(start, end, "day", "current");
    const wCap = expandCurrentWindowForCaption(w, mergedNow, "year_over_year", ZONE);
    expect(formatCompactPeriodCaption(wCap, undefined, en)).toBe("2026");
  });

  it("does not expand when currentEndIsNow is unset or false", () => {
    const start = new Date(Date.UTC(2026, 3, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(2026, 3, 12, 12, 0, 0, 0));
    const w = rw(start, end, "day", "current");
    expect(expandCurrentWindowForCaption(w, {}, "month_over_year", ZONE)).toBe(w);
    expect(
      expandCurrentWindowForCaption(w, { currentEndIsNow: false }, "month_over_year", ZONE)
    ).toBe(w);
  });

  it("does not expand hour aggregation", () => {
    const w = rw(
      new Date(Date.UTC(2026, 3, 1, 8, 0, 0, 0)),
      new Date(Date.UTC(2026, 3, 1, 12, 0, 0, 0)),
      "hour",
      "current"
    );
    expect(expandCurrentWindowForCaption(w, mergedNow, "month_over_year", ZONE)).toBe(w);
  });

  it("does not expand reference window", () => {
    const w = rw(
      new Date(Date.UTC(2026, 3, 1, 0, 0, 0, 0)),
      new Date(Date.UTC(2026, 3, 12, 0, 0, 0, 0)),
      "day",
      "reference"
    );
    expect(expandCurrentWindowForCaption(w, mergedNow, "month_over_year", ZONE)).toBe(w);
  });
});

describe("hour12FromHaTimeFormat", () => {
  it("maps HA time_format", () => {
    expect(hour12FromHaTimeFormat("12")).toBe(true);
    expect(hour12FromHaTimeFormat("24")).toBe(false);
    expect(hour12FromHaTimeFormat("language")).toBeUndefined();
    expect(hour12FromHaTimeFormat(undefined)).toBeUndefined();
  });
});

describe("resolvedWindowForCaption", () => {
  it("uses rw entry when present", () => {
    const period: ComparisonPeriod = {
      current_start: new Date(0),
      current_end: new Date(0),
      reference_start: new Date(0),
      reference_end: new Date(0),
      aggregation: "day",
      time_zone: "UTC"
    };
    const custom: ResolvedWindow = {
      index: 0,
      id: "x",
      role: "current",
      start: new Date(Date.UTC(2026, 0, 5)),
      end: new Date(Date.UTC(2026, 0, 6)),
      aggregation: "day"
    };
    expect(resolvedWindowForCaption([custom], period, 0)).toBe(custom);
  });

  it("falls back to ComparisonPeriod when rw missing", () => {
    const period: ComparisonPeriod = {
      current_start: new Date(Date.UTC(2026, 1, 1)),
      current_end: new Date(Date.UTC(2026, 1, 28)),
      reference_start: new Date(Date.UTC(2025, 1, 1)),
      reference_end: new Date(Date.UTC(2025, 1, 28)),
      aggregation: "day",
      time_zone: "UTC"
    };
    const w1 = resolvedWindowForCaption(undefined, period, 1);
    expect(w1.start).toBe(period.reference_start);
    expect(w1.end).toBe(period.reference_end);
  });
});

describe("isForecastLineVisible", () => {
  it("is true when show_forecast is omitted", () => {
    expect(
      isForecastLineVisible({
        type: "custom:energy-horizon-card",
        entity: "sensor.e",
        comparison_preset: "year_over_year"
      })
    ).toBe(true);
  });

  it("is false when show_forecast is false", () => {
    expect(
      isForecastLineVisible({
        type: "custom:energy-horizon-card",
        entity: "sensor.e",
        comparison_preset: "year_over_year",
        show_forecast: false
      })
    ).toBe(false);
  });
});
