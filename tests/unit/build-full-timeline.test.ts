import { describe, it, expect } from "vitest";
import { buildFullTimeline } from "../../src/card/timeline";
import type { ComparisonPeriod } from "../../src/card/types";

describe("buildFullTimeline", () => {
  it("should return 365 slots for non-leap year 2025, day aggregation", () => {
    const period: ComparisonPeriod = {
      current_start: new Date(2025, 0, 1, 0, 0, 0, 0), // Jan 1, 2025
      current_end: new Date(2025, 11, 31, 23, 59, 59, 999),
      reference_start: new Date(2024, 0, 1, 0, 0, 0, 0),
      reference_end: new Date(2024, 11, 31, 23, 59, 59, 999),
      aggregation: "day",
      time_zone: "UTC"
    };
    const fullEnd = new Date(2025, 11, 31); // Dec 31, 2025

    const timeline = buildFullTimeline(period, fullEnd);

    expect(timeline.length).toBe(365);
  });

  it("should return 366 slots for leap year 2024, day aggregation", () => {
    const period: ComparisonPeriod = {
      current_start: new Date(2024, 0, 1, 0, 0, 0, 0), // Jan 1, 2024
      current_end: new Date(2024, 11, 31, 23, 59, 59, 999),
      reference_start: new Date(2023, 0, 1, 0, 0, 0, 0),
      reference_end: new Date(2023, 11, 31, 23, 59, 59, 999),
      aggregation: "day",
      time_zone: "UTC"
    };
    const fullEnd = new Date(2024, 11, 31); // Dec 31, 2024

    const timeline = buildFullTimeline(period, fullEnd);

    expect(timeline.length).toBe(366);
  });

  it("should return 30 slots for April 2026, day aggregation", () => {
    const period: ComparisonPeriod = {
      current_start: new Date(2026, 3, 1, 0, 0, 0, 0), // Apr 1, 2026
      current_end: new Date(2026, 3, 30, 23, 59, 59, 999),
      reference_start: new Date(2025, 3, 1, 0, 0, 0, 0),
      reference_end: new Date(2025, 3, 30, 23, 59, 59, 999),
      aggregation: "day",
      time_zone: "UTC"
    };
    const fullEnd = new Date(2026, 3, 30); // Apr 30, 2026

    const timeline = buildFullTimeline(period, fullEnd);

    expect(timeline.length).toBe(30);
  });

  it("should return ~5 slots for January 2026, week aggregation", () => {
    const period: ComparisonPeriod = {
      current_start: new Date(2026, 0, 1, 0, 0, 0, 0), // Jan 1, 2026
      current_end: new Date(2026, 0, 31, 23, 59, 59, 999),
      reference_start: new Date(2025, 0, 1, 0, 0, 0, 0),
      reference_end: new Date(2025, 0, 31, 23, 59, 59, 999),
      aggregation: "week",
      time_zone: "UTC"
    };
    const fullEnd = new Date(2026, 0, 31); // Jan 31, 2026

    const timeline = buildFullTimeline(period, fullEnd);

    // January has 31 days, so 31/7 ≈ 4.4, we expect 5 slots (starting from Jan 1)
    expect(timeline.length).toBe(5);
  });

  it("should return 12 slots for year 2026, month aggregation", () => {
    const period: ComparisonPeriod = {
      current_start: new Date(2026, 0, 1, 0, 0, 0, 0), // Jan 1, 2026
      current_end: new Date(2026, 11, 31, 23, 59, 59, 999),
      reference_start: new Date(2025, 0, 1, 0, 0, 0, 0),
      reference_end: new Date(2025, 11, 31, 23, 59, 59, 999),
      aggregation: "month",
      time_zone: "UTC"
    };
    const fullEnd = new Date(2026, 11, 31); // Dec 31, 2026

    const timeline = buildFullTimeline(period, fullEnd);

    expect(timeline.length).toBe(12);
  });
});
