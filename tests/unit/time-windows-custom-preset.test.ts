import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  getPresetTemplate,
  mergeTimeWindowConfig,
  validateMergedTimeWindowConfig,
  resolveTimeWindows
} from "../../src/card/time-windows";
import type { MergedTimeWindowConfig } from "../../src/card/types";

const TZ = "UTC";

describe("custom comparison preset (domain 900 touch, v1.2.0)", () => {
  it("getPresetTemplate('custom') returns the generic shape with no legacy flags", () => {
    const t = getPresetTemplate("custom", -1);
    expect(t.anchor).toBe("start_of_year");
    expect(t.duration).toBe("1y");
    expect(t.step).toBe("1y");
    expect(t.count).toBe(2);
    // No legacy YoY/MoY geometry flags — this is what routes to resolveGeneric.
    expect(t.currentEndIsNow).toBeUndefined();
    expect(t.referenceFullPeriod).toBeUndefined();
    expect(t.periodOffsetYears).toBeUndefined();
  });

  it("resolveTimeWindows routes a custom preset to resolveGeneric (no legacy path)", () => {
    const merged = mergeTimeWindowConfig({ mode: "custom" });
    const v = validateMergedTimeWindowConfig({ ...merged, aggregation: "day" });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const now = DateTime.fromObject(
      { year: 2026, month: 3, day: 15, hour: 12 },
      { zone: TZ }
    ).toJSDate();
    const windows = resolveTimeWindows(v.merged, now, TZ, 24, "day");

    // Generic geometry: two 1y windows stepped back 1y from the start-of-year
    // anchor — NOT the legacy "current ends at now" geometry.
    expect(windows).toHaveLength(2);
    const w0 = windows[0]!;
    const w1 = windows[1]!;
    expect(w0.role).toBe("current");
    expect(w1.role).toBe("reference");
    expect(w0.start.getUTCFullYear()).toBe(2026);
    expect(w0.start.getUTCMonth()).toBe(0);
    expect(w0.start.getUTCDate()).toBe(1);
    // Full calendar year, not "to now".
    expect(w0.end.getUTCFullYear()).toBe(2026);
    expect(w0.end.getUTCMonth()).toBe(11);
    expect(w0.end.getUTCDate()).toBe(31);
    // Reference is the previous full year.
    expect(w1.start.getUTCFullYear()).toBe(2025);
    expect(w1.end.getUTCFullYear()).toBe(2025);
  });

  it("custom with a user time_window override resolves generically from the override", () => {
    const merged = mergeTimeWindowConfig({
      mode: "custom",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 3
      }
    });
    const v = validateMergedTimeWindowConfig({ ...merged, aggregation: "day" });
    expect(v.ok).toBe(true);
    if (!v.ok) return;

    const now = DateTime.fromObject(
      { year: 2026, month: 3, day: 15, hour: 12 },
      { zone: TZ }
    ).toJSDate();
    const windows = resolveTimeWindows(v.merged, now, TZ, 24, "day");
    expect(windows).toHaveLength(3);
    // Three consecutive calendar months ending at the current month.
    expect(windows[0]!.start.getUTCMonth()).toBe(2); // March
    expect(windows[1]!.start.getUTCMonth()).toBe(1); // February
    expect(windows[2]!.start.getUTCMonth()).toBe(0); // January
  });

  it("standard presets still carry the legacy flags (regression guard)", () => {
    const yoy = getPresetTemplate("year_over_year", -1);
    expect(yoy.currentEndIsNow).toBe(true);
    expect(yoy.referenceFullPeriod).toBe(true);
    const moy = getPresetTemplate("month_over_year", -1);
    expect(moy.currentEndIsNow).toBe(true);
    expect(moy.referenceFullPeriod).toBe(true);
    const mom = getPresetTemplate("month_over_month", -1);
    expect(mom.currentEndIsNow).toBeUndefined();
    expect(mom.referenceFullPeriod).toBeUndefined();
  });

  it("custom template is a valid MergedTimeWindowConfig shape", () => {
    const t: MergedTimeWindowConfig = getPresetTemplate("custom", -1);
    expect(t.comparisonMode).toBe("custom");
  });
});
