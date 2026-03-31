import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  mergeTimeWindowConfig,
  validateMergedTimeWindowConfig,
  resolveTimeWindows
} from "../../src/card/time-windows";

const TZ = "UTC";

describe("resolveTimeWindows", () => {
  it("SC-002: −1 month from 31 March lands on last day of February (leap and non-leap)", () => {
    const base = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 2
      },
      periodOffset: -1
    });
    const v2024 = validateMergedTimeWindowConfig({
      ...base,
      aggregation: "day"
    });
    expect(v2024.ok).toBe(true);
    if (!v2024.ok) return;

    const nowLeap = DateTime.fromObject(
      { year: 2024, month: 3, day: 31, hour: 12 },
      { zone: TZ }
    ).toJSDate();
    const wLeap = resolveTimeWindows(v2024.merged, nowLeap, TZ, 24, "day");
    expect(wLeap[0]!.start.getUTCDate()).toBe(1);
    expect(wLeap[0]!.start.getUTCMonth()).toBe(2);
    expect(wLeap[1]!.start.getUTCMonth()).toBe(1);
    expect(wLeap[1]!.end.getUTCMonth()).toBe(1);
    expect(wLeap[1]!.end.getUTCDate()).toBe(29);

    const nowPlain = DateTime.fromObject(
      { year: 2025, month: 3, day: 31, hour: 12 },
      { zone: TZ }
    ).toJSDate();
    const v2025 = validateMergedTimeWindowConfig({
      ...base,
      aggregation: "day"
    });
    if (!v2025.ok) throw new Error("validate");
    const wPlain = resolveTimeWindows(v2025.merged, nowPlain, TZ, 24, "day");
    expect(wPlain[1]!.end.getUTCMonth()).toBe(1);
    expect(wPlain[1]!.end.getUTCDate()).toBe(28);
  });

  it("resolve honors maxWindows beyond default 24 when passed explicitly", () => {
    const merged = {
      anchor: "start_of_hour" as const,
      duration: "1h",
      step: "1h",
      count: 30,
      aggregation: "hour" as const
    };
    const now = DateTime.fromObject(
      { year: 2026, month: 1, day: 1, hour: 12 },
      { zone: TZ }
    ).toJSDate();
    const w = resolveTimeWindows(merged, now, TZ, 30, "hour");
    expect(w).toHaveLength(30);
  });

  it("US3: fiscal year from October — two adjacent 12-month cycles", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_year",
        offset: "+9M",
        duration: "1y",
        step: "1y",
        count: 2
      },
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig({ ...merged, aggregation: "month" });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const now = DateTime.fromObject(
      { year: 2026, month: 3, day: 15, hour: 12 },
      { zone: TZ }
    ).toJSDate();
    const w = resolveTimeWindows(v.merged, now, TZ, 24, "month");
    expect(w).toHaveLength(2);
    expect(w[0]!.start.getUTCFullYear()).toBe(2025);
    expect(w[0]!.start.getUTCMonth()).toBe(9);
    expect(w[0]!.start.getUTCDate()).toBe(1);
    expect(w[1]!.start.getUTCFullYear()).toBe(2024);
    expect(w[1]!.start.getUTCMonth()).toBe(9);
    expect(w[1]!.start.getUTCDate()).toBe(1);
  });

  it("US4: six full hours back from frozen now", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_hour",
        duration: "1h",
        step: "1h",
        count: 6
      },
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig({ ...merged, aggregation: "hour" });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const now = DateTime.fromObject(
      { year: 2026, month: 6, day: 10, hour: 14, minute: 30 },
      { zone: TZ }
    ).toJSDate();
    const w = resolveTimeWindows(v.merged, now, TZ, 24, "hour");
    expect(w).toHaveLength(6);
    for (const win of w) {
      expect(win.start.getUTCMinutes()).toBe(0);
      expect(win.start.getUTCSeconds()).toBe(0);
      expect(win.end.getTime() - win.start.getTime()).toBeLessThan(3_700_000);
    }
    expect(w[0]!.start.getUTCHours()).toBe(14);
    expect(w[5]!.start.getUTCHours()).toBe(9);
  });
});
