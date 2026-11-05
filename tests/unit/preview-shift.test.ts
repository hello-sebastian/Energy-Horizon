import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  mergeTimeWindowConfig,
  resolveTimeWindows,
  resolvePreviewShiftedWindows,
  nextPreviewShift
} from "../../src/card/time-windows";
import type { MergedTimeWindowConfig } from "../../src/card/types";

const TZ = "UTC";

/**
 * Build a generic (non-legacy) merged config for a given nominal width. No
 * `currentEndIsNow` / `referenceFullPeriod` flags, so `resolveTimeWindows`
 * routes to the generic path (windows derived purely from anchor/offset/
 * duration/step/count).
 */
function genericMerged(width: string, count = 2): MergedTimeWindowConfig {
  return {
    anchor: "now",
    duration: width,
    step: width,
    count,
    aggregation: "day"
  };
}

describe("resolvePreviewShiftedWindows — shift algebra (T005)", () => {
  it("one step back moves window0 to where window1 was, for every supported width", () => {
    const cases: { width: string; now: DateTime }[] = [
      { width: "1y", now: DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 12 }, { zone: TZ }) },
      { width: "1M", now: DateTime.fromObject({ year: 2024, month: 3, day: 31, hour: 12 }, { zone: TZ }) },
      { width: "1w", now: DateTime.fromObject({ year: 2024, month: 3, day: 10, hour: 12 }, { zone: TZ }) },
      { width: "1d", now: DateTime.fromObject({ year: 2024, month: 3, day: 10, hour: 12 }, { zone: TZ }) },
      { width: "1h", now: DateTime.fromObject({ year: 2024, month: 3, day: 10, hour: 12, minute: 30 }, { zone: TZ }) },
      { width: "1m", now: DateTime.fromObject({ year: 2024, month: 3, day: 10, hour: 12, minute: 30, second: 45 }, { zone: TZ }) },
      { width: "1s", now: DateTime.fromObject({ year: 2024, month: 3, day: 10, hour: 12, minute: 30, second: 45, millisecond: 123 }, { zone: TZ }) }
    ];

    for (const { width, now } of cases) {
      const merged = genericMerged(width);
      const nowDate = now.toJSDate();
      const def = resolveTimeWindows(merged, nowDate, TZ, 24, "day");
      const shifted = resolvePreviewShiftedWindows(merged, nowDate, TZ, -1);

      // One nominal width back: shifted window0 is exactly the default window1
      // (same start AND same end). Comparing to window1 (not window0) is exact —
      // a calendar window's ms width can differ by a day across a leap day, but
      // window1 and the shifted window0 span the identical range.
      expect(shifted[0]!.start.getTime(), `width ${width}: start`).toBe(
        def[1]!.start.getTime()
      );
      expect(shifted[0]!.end.getTime(), `width ${width}: end`).toBe(
        def[1]!.end.getTime()
      );
      // Count preserved.
      expect(shifted.length, `width ${width}: count`).toBe(def.length);
      // Aggregation preserved on the window.
      expect(shifted[0]!.aggregation, `width ${width}: aggregation`).toBe(
        def[0]!.aggregation
      );
    }
  });

  it("calendar-aware month shift respects month-length and end-of-month (leap and non-leap)", () => {
    const merged = genericMerged("1M");

    // Leap year: 2024-03-31 minus 1M lands on 2024-02-29.
    const leap = DateTime.fromObject({ year: 2024, month: 3, day: 31, hour: 12 }, { zone: TZ });
    const sLeap = resolvePreviewShiftedWindows(merged, leap.toJSDate(), TZ, -1);
    expect(sLeap[0]!.start.getUTCFullYear()).toBe(2024);
    expect(sLeap[0]!.start.getUTCMonth()).toBe(1); // February
    expect(sLeap[0]!.start.getUTCDate()).toBe(29);

    // Non-leap year: 2025-03-31 minus 1M lands on 2025-02-28.
    const plain = DateTime.fromObject({ year: 2025, month: 3, day: 31, hour: 12 }, { zone: TZ });
    const sPlain = resolvePreviewShiftedWindows(merged, plain.toJSDate(), TZ, -1);
    expect(sPlain[0]!.start.getUTCFullYear()).toBe(2025);
    expect(sPlain[0]!.start.getUTCMonth()).toBe(1);
    expect(sPlain[0]!.start.getUTCDate()).toBe(28);
  });

  it("shift 0 is the identity (returns the default window set)", () => {
    const merged = genericMerged("1M");
    const now = DateTime.fromObject({ year: 2024, month: 3, day: 15, hour: 12 }, { zone: TZ }).toJSDate();
    const def = resolveTimeWindows(merged, now, TZ, 24, "day");
    const s0 = resolvePreviewShiftedWindows(merged, now, TZ, 0);
    expect(s0.map((w) => w.start.getTime())).toEqual(def.map((w) => w.start.getTime()));
  });

  it("a positive shift is clamped to 0 (forward is bounded at the default)", () => {
    const merged = genericMerged("1M");
    const now = DateTime.fromObject({ year: 2024, month: 3, day: 15, hour: 12 }, { zone: TZ }).toJSDate();
    const def = resolveTimeWindows(merged, now, TZ, 24, "day");
    const sPos = resolvePreviewShiftedWindows(merged, now, TZ, 3);
    expect(sPos.map((w) => w.start.getTime())).toEqual(def.map((w) => w.start.getTime()));
  });

  it("multiple steps back move by that many nominal widths (count 3, shift −2)", () => {
    const merged = genericMerged("1d", 3);
    const now = DateTime.fromObject({ year: 2024, month: 3, day: 10, hour: 12 }, { zone: TZ }).toJSDate();
    const def = resolveTimeWindows(merged, now, TZ, 24, "day");
    const shifted = resolvePreviewShiftedWindows(merged, now, TZ, -2);
    expect(shifted[0]!.start.getTime()).toBe(def[2]!.start.getTime());
  });

  it("legacy preset path (YoY) shifts by exactly one nominal width", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: { anchor: "start_of_year", duration: "1y", step: "1y", count: 2 },
      periodOffset: -1
    });
    const now = DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 12 }, { zone: TZ }).toJSDate();
    const def = resolveTimeWindows(merged, now, TZ, 24, "day");
    const shifted = resolvePreviewShiftedWindows(merged, now, TZ, -1);
    expect(shifted[0]!.start.getTime()).toBe(def[1]!.start.getTime());
    // The shifted current period is the previous calendar year.
    expect(shifted[0]!.start.getUTCFullYear()).toBe(2023);
    expect(shifted[0]!.start.getUTCMonth()).toBe(0);
    expect(shifted[0]!.start.getUTCDate()).toBe(1);
  });

  it("legacy preset path (MoY) shifts by exactly one nominal width", () => {
    const merged = mergeTimeWindowConfig({
      mode: "month_over_year",
      timeWindowPartial: { anchor: "start_of_month", duration: "1M", step: "1M", count: 2 },
      periodOffset: -1
    });
    const now = DateTime.fromObject({ year: 2024, month: 3, day: 15, hour: 12 }, { zone: TZ }).toJSDate();
    const def = resolveTimeWindows(merged, now, TZ, 24, "day");
    const shifted = resolvePreviewShiftedWindows(merged, now, TZ, -1);
    expect(shifted[0]!.start.getTime()).toBe(def[1]!.start.getTime());
    // The shifted current period is the previous calendar month.
    expect(shifted[0]!.start.getUTCFullYear()).toBe(2024);
    expect(shifted[0]!.start.getUTCMonth()).toBe(1); // February
    expect(shifted[0]!.start.getUTCDate()).toBe(1);
  });

  it("legacy and generic paths exhibit identical one-width behavior", () => {
    const legacy = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: { anchor: "start_of_year", duration: "1y", step: "1y", count: 2 },
      periodOffset: -1
    });
    const generic = genericMerged("1y");
    const now = DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 12 }, { zone: TZ }).toJSDate();

    const lDef = resolveTimeWindows(legacy, now, TZ, 24, "day");
    const lShifted = resolvePreviewShiftedWindows(legacy, now, TZ, -1);
    const gDef = resolveTimeWindows(generic, now, TZ, 24, "day");
    const gShifted = resolvePreviewShiftedWindows(generic, now, TZ, -1);

    // In both paths, one step back moves window0 to where window1 was.
    expect(lShifted[0]!.start.getTime()).toBe(lDef[1]!.start.getTime());
    expect(gShifted[0]!.start.getTime()).toBe(gDef[1]!.start.getTime());
  });
});

describe("nextPreviewShift — preview state transitions (T006)", () => {
  it("step back decrements with no lower bound (FR-004)", () => {
    expect(nextPreviewShift(0, "back")).toBe(-1);
    expect(nextPreviewShift(-1, "back")).toBe(-2);
    expect(nextPreviewShift(-5, "back")).toBe(-6);
  });

  it("step forward increments, clamped at 0 (no-op at the default, FR-003)", () => {
    expect(nextPreviewShift(0, "forward")).toBe(0); // no-op at default
    expect(nextPreviewShift(-1, "forward")).toBe(0);
    expect(nextPreviewShift(-2, "forward")).toBe(-1);
  });

  it("reset sets 0 (FR-009)", () => {
    expect(nextPreviewShift(-3, "reset")).toBe(0);
    expect(nextPreviewShift(0, "reset")).toBe(0);
  });

  it("previewShift is always an integer ≤ 0 across any action sequence (validation rule 1)", () => {
    const actions = [
      "back",
      "back",
      "forward",
      "back",
      "reset",
      "back",
      "forward",
      "forward",
      "back"
    ] as const;
    let shift = 0;
    for (const a of actions) {
      shift = nextPreviewShift(shift, a);
      expect(Number.isInteger(shift)).toBe(true);
      expect(shift).toBeLessThanOrEqual(0);
    }
  });
});
