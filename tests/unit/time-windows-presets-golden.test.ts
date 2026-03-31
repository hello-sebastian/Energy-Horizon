import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import type { CardConfig } from "../../src/card/types";
import { buildComparisonPeriod } from "../../src/card/ha-api";
import {
  mergeTimeWindowConfig,
  validateMergedTimeWindowConfig,
  resolveTimeWindows
} from "../../src/card/time-windows";

function assertClose(a: Date, b: Date): void {
  expect(Math.abs(a.getTime() - b.getTime())).toBeLessThan(3000);
}

describe("preset golden vs buildComparisonPeriod", () => {
  const now = new Date(2026, 2, 15, 12, 0, 0, 0);
  const timeZone = "UTC";

  it("year_over_year matches legacy period boundaries", () => {
    const config = {
      type: "custom:energy-horizon-card",
      entity: "sensor.e",
      comparison_preset: "year_over_year",
      period_offset: -1
    } as CardConfig;

    const period = buildComparisonPeriod(config, now, timeZone);
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      periodOffset: config.period_offset
    });
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const windows = resolveTimeWindows(v.merged, now, timeZone, 24, "day");
    expect(windows).toHaveLength(2);
    assertClose(windows[0]!.start, period.current_start);
    assertClose(windows[0]!.end, period.current_end);
    assertClose(windows[1]!.start, period.reference_start);
    assertClose(windows[1]!.end, period.reference_end);
  });

  it("month_over_year matches legacy period boundaries", () => {
    const config = {
      type: "custom:energy-horizon-card",
      entity: "sensor.e",
      comparison_preset: "month_over_year",
      period_offset: -1
    } as CardConfig;

    const period = buildComparisonPeriod(config, now, timeZone);
    const merged = mergeTimeWindowConfig({
      mode: "month_over_year",
      periodOffset: config.period_offset
    });
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const windows = resolveTimeWindows(v.merged, now, timeZone, 24, "day");
    expect(windows).toHaveLength(2);
    assertClose(windows[0]!.start, period.current_start);
    assertClose(windows[0]!.end, period.current_end);
    assertClose(windows[1]!.start, period.reference_start);
    assertClose(windows[1]!.end, period.reference_end);
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
});
