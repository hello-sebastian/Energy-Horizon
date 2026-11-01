import { describe, expect, it } from "vitest";
import {
  buildChartTimeline,
  countBucketsForWindow
} from "../../src/card/ha-api";
import type { MergedTimeWindowConfig, ResolvedWindow } from "../../src/card/types";

const day = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0): Date =>
  new Date(y, m - 1, d, h, min, s, ms);

describe("buildChartTimeline — forecastPeriodBuckets vs chart axis", () => {
  it("multi-window: forecast denominator follows window 0, not longest window span", () => {
    const windows: ResolvedWindow[] = [
      {
        index: 0,
        id: "current",
        role: "current",
        start: day(2025, 1, 1),
        end: day(2025, 1, 31),
        aggregation: "day"
      },
      {
        index: 1,
        role: "reference",
        id: "reference",
        start: day(2024, 1, 1),
        end: day(2024, 4, 30),
        aggregation: "day"
      },
      {
        index: 2,
        role: "context",
        id: "context",
        start: day(2023, 1, 1),
        end: day(2023, 2, 28),
        aggregation: "day"
      }
    ];
    const merged: MergedTimeWindowConfig = {
      currentEndIsNow: false,
      referenceFullPeriod: false,
      aggregation: "day"
    };

    const { timeline, forecastPeriodBuckets } = buildChartTimeline(
      windows,
      merged,
      "UTC"
    );

    const w0Buckets = countBucketsForWindow(windows[0]!, "UTC");
    expect(forecastPeriodBuckets).toBe(w0Buckets);
    expect(timeline.length).toBeGreaterThan(forecastPeriodBuckets);
  });

  it("YoY-style two windows: forecastPeriodBuckets is window 0 slots, axis uses max span (006 FR-D)", () => {
    const windows: ResolvedWindow[] = [
      {
        index: 0,
        id: "current",
        role: "current",
        start: day(2025, 1, 1),
        end: day(2025, 6, 15, 12, 0, 0, 0),
        aggregation: "day"
      },
      {
        index: 1,
        id: "reference",
        role: "reference",
        start: day(2024, 1, 1),
        end: day(2024, 12, 31, 23, 59, 59, 999),
        aggregation: "day"
      }
    ];
    const merged: MergedTimeWindowConfig = {
      currentEndIsNow: true,
      referenceFullPeriod: true,
      aggregation: "day"
    };

    const { timeline, forecastPeriodBuckets } = buildChartTimeline(
      windows,
      merged,
      "UTC"
    );

    const w0Buckets = countBucketsForWindow(windows[0]!, "UTC");
    expect(forecastPeriodBuckets).toBe(w0Buckets);
    expect(timeline.length).toBeGreaterThan(forecastPeriodBuckets);
  });
});
