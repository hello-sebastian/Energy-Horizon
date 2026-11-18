import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  mergeTimeWindowConfig,
  validateMergedTimeWindowConfig,
  resolveTimeWindows
} from "../../src/card/time-windows";

function assertClose(a: Date, b: Date): void {
  expect(Math.abs(a.getTime() - b.getTime())).toBeLessThan(3000);
}

describe("preset golden window boundaries (frozen values, 911/TD-7)", () => {
  const now = new Date(2026, 2, 15, 12, 0, 0, 0);
  const timeZone = "UTC";

  it("year_over_year matches the legacy period boundaries", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const windows = resolveTimeWindows(v.merged, now, timeZone, 24, "day");
    expect(windows).toHaveLength(2);
    // Frozen golden values — the boundaries the legacy buildComparisonPeriod produced.
    assertClose(windows[0]!.start, new Date(2026, 0, 1, 0, 0, 0, 0));
    assertClose(windows[0]!.end, now);
    assertClose(windows[1]!.start, new Date(2025, 0, 1, 0, 0, 0, 0));
    assertClose(windows[1]!.end, new Date(2025, 11, 31, 23, 59, 59, 999));
  });

  it("month_over_year matches the legacy period boundaries", () => {
    const merged = mergeTimeWindowConfig({
      mode: "month_over_year",
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const windows = resolveTimeWindows(v.merged, now, timeZone, 24, "day");
    expect(windows).toHaveLength(2);
    // Frozen golden values — the boundaries the legacy buildComparisonPeriod produced.
    assertClose(windows[0]!.start, new Date(2026, 2, 1, 0, 0, 0, 0));
    assertClose(windows[0]!.end, now);
    assertClose(windows[1]!.start, new Date(2025, 2, 1, 0, 0, 0, 0));
    assertClose(windows[1]!.end, new Date(2025, 3, 0, 23, 59, 59, 999));
  });

  it("month_over_month resolves two consecutive calendar months via resolveGeneric", () => {
    const now = new Date(2026, 2, 15, 12, 0, 0, 0);
    const timeZone = "UTC";

    const merged = mergeTimeWindowConfig({
      mode: "month_over_month"
    });
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const windows = resolveTimeWindows(v.merged, now, timeZone, 24, "day");
    expect(windows).toHaveLength(2);

    const dt = DateTime.fromJSDate(now, { zone: timeZone });
    const currentMonthStart = dt.startOf("month");
    const currentMonthEnd = currentMonthStart
      .plus({ months: 1 })
      .minus({ milliseconds: 1 });
    const previousMonthStart = currentMonthStart.minus({ months: 1 });
    const previousMonthEnd = previousMonthStart
      .plus({ months: 1 })
      .minus({ milliseconds: 1 });

    assertClose(windows[0]!.start, currentMonthStart.toJSDate());
    assertClose(windows[0]!.end, currentMonthEnd.toJSDate());
    assertClose(windows[1]!.start, previousMonthStart.toJSDate());
    assertClose(windows[1]!.end, previousMonthEnd.toJSDate());
  });

  it("US-900-1: omitted offset vs P0D yields identical validation and window[0].start", () => {
    const now = DateTime.fromObject(
      { year: 2026, month: 3, day: 10, hour: 12 },
      { zone: "UTC" }
    ).toJSDate();
    const basePartial = {
      anchor: "start_of_month" as const,
      duration: "1M",
      step: "1M",
      count: 2 as const
    };
    const mergedOmit = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: basePartial,
      periodOffset: -1
    });
    const mergedP0 = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: { ...basePartial, offset: "P0D" },
      periodOffset: -1
    });
    const v1 = validateMergedTimeWindowConfig({
      ...mergedOmit,
      aggregation: "day"
    });
    const v2 = validateMergedTimeWindowConfig({
      ...mergedP0,
      aggregation: "day"
    });
    expect(v1.ok).toBe(true);
    expect(v2.ok).toBe(true);
    if (!v1.ok || !v2.ok) return;

    const w1 = resolveTimeWindows(v1.merged, now, "UTC", 24, "day");
    const w2 = resolveTimeWindows(v2.merged, now, "UTC", 24, "day");
    expect(w1[0]!.start.getTime()).toBe(w2[0]!.start.getTime());
    expect(w1[0]!.end.getTime()).toBe(w2[0]!.end.getTime());
  });
});
