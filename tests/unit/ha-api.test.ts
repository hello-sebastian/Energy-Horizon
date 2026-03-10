import { describe, it, expect } from "vitest";
import {
  computeSummary,
  computeTextSummary
} from "../../src/card/ha-api";
import type { ComparisonSeries } from "../../src/card/types";

function makeSeries(values: number[]): ComparisonSeries {
  const points = values.map((v, idx) => ({
    timestamp: idx,
    value: v
  }));

  return {
    current: {
      points,
      unit: "kWh",
      periodLabel: "Bieżący okres",
      total: points[points.length - 1]?.value ?? 0
    },
    aggregation: "day",
    time_zone: "UTC"
  };
}

describe("computeSummary", () => {
  it("computes difference and percent when reference is available", () => {
    const current = makeSeries([10, 20]);
    const reference = makeSeries([5, 15]);

    const series: ComparisonSeries = {
      ...current,
      reference: reference.current
    };

    const summary = computeSummary(series);

    expect(summary.current_cumulative).toBe(20);
    expect(summary.reference_cumulative).toBe(15);
    expect(summary.difference).toBe(5);
    expect(summary.differencePercent).toBeCloseTo(33.33, 1);
  });
});

describe("computeTextSummary", () => {
  it("reports higher usage correctly", () => {
    const summary = {
      current_cumulative: 20,
      reference_cumulative: 10,
      difference: 10,
      differencePercent: 100,
      unit: "kWh"
    };

    const text = computeTextSummary(summary);

    expect(text.trend).toBe("higher");
    expect(text.heading).toContain("wyższe");
  });

  it("reports lower usage correctly", () => {
    const summary = {
      current_cumulative: 5,
      reference_cumulative: 10,
      difference: -5,
      differencePercent: -50,
      unit: "kWh"
    };

    const text = computeTextSummary(summary);

    expect(text.trend).toBe("lower");
    expect(text.heading).toContain("niższe");
  });

  it("handles missing reference data", () => {
    const summary = {
      current_cumulative: 5,
      reference_cumulative: undefined,
      difference: undefined,
      differencePercent: undefined,
      unit: "kWh"
    };

    const text = computeTextSummary(summary as any);

    expect(text.trend).toBe("unknown");
  });
});

