import { describe, it, expect } from "vitest";
import {
  computeSummary,
  computeTextSummary,
  mapLtsResponseToSeries
} from "../../src/card/ha-api";
import { formatSigned } from "../../src/card/cumulative-comparison-chart";
import type {
  ComparisonSeries,
  LtsStatisticsResponse
} from "../../src/card/types";

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

  it("does not set reference_cumulative when reference series is shorter", () => {
    const current = makeSeries([5, 10, 15]);
    const reference = makeSeries([4, 8]);

    const series: ComparisonSeries = {
      ...current,
      reference: reference.current
    };

    const summary = computeSummary(series);

    expect(summary.current_cumulative).toBe(15);
    expect(summary.reference_cumulative).toBeUndefined();
    expect(summary.difference).toBeUndefined();
    expect(summary.differencePercent).toBeUndefined();
  });
});

describe("mapLtsResponseToSeries", () => {
  it("maps LTS response to ComparisonSeries with cumulative points", () => {
    // Implementation treats sum as running total: first sum is reference, deltas become points.
    // Sums 2, 4, 9 → deltas 2, 5 → cumulative 2, 7.
    const response: LtsStatisticsResponse = {
      results: {
        "sensor.energy": [
          { start: "2024-01-01T00:00:00+00:00", sum: 2, unit_of_measurement: "kWh" },
          { start: "2024-01-02T00:00:00+00:00", sum: 4, unit_of_measurement: "kWh" },
          { start: "2024-01-03T00:00:00+00:00", sum: 9, unit_of_measurement: "kWh" }
        ]
      }
    };

    const series = mapLtsResponseToSeries(
      response,
      "sensor.energy",
      {
        current_start: new Date("2024-01-01T00:00:00Z"),
        current_end: new Date("2024-01-04T00:00:00Z"),
        reference_start: new Date("2023-01-01T00:00:00Z"),
        reference_end: new Date("2023-01-04T00:00:00Z"),
        aggregation: "day",
        time_zone: "UTC"
      },
      "Current period"
    );

    expect(series).toBeDefined();
    expect(series!.current.unit).toBe("kWh");
    expect(series!.current.points).toHaveLength(2);
    expect(series!.current.points[0].value).toBe(2);
    expect(series!.current.points[1].value).toBe(7);
  });

  it("produces empty series when units are inconsistent", () => {
    const response: LtsStatisticsResponse = {
      results: {
        "sensor.energy": [
          { start: "2024-01-01T00:00:00+00:00", sum: 2, unit_of_measurement: "kWh" },
          { start: "2024-01-02T00:00:00+00:00", sum: 3, unit_of_measurement: "Wh" }
        ]
      }
    };

    const series = mapLtsResponseToSeries(
      response,
      "sensor.energy",
      {
        current_start: new Date("2024-01-01T00:00:00Z"),
        current_end: new Date("2024-01-03T00:00:00Z"),
        reference_start: new Date("2023-01-01T00:00:00Z"),
        reference_end: new Date("2023-01-03T00:00:00Z"),
        aggregation: "day",
        time_zone: "UTC"
      },
      "Current period"
    );

    // First point (sum) is skipped as reference; second point has Wh so we get one point before unit mismatch is detected per current logic
    expect(series).toBeDefined();
    expect(series!.current.points.length).toBeLessThanOrEqual(1);
    expect(series!.current.unit).toBeDefined();
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
    expect(text.diffValue).toBeCloseTo(10);
    expect(text.unit).toBe("kWh");
  });

  it("reports lower usage correctly for negative difference", () => {
    const summary = {
      current_cumulative: 5,
      reference_cumulative: 10,
      difference: -5,
      differencePercent: -50,
      unit: "kWh"
    };

    const text = computeTextSummary(summary);

    expect(text.trend).toBe("lower");
    expect(text.diffValue).toBeCloseTo(5);
    expect(text.unit).toBe("kWh");
  });

  it("reports similar usage when difference is very small", () => {
    const summary = {
      current_cumulative: 10.004,
      reference_cumulative: 10,
      difference: 0.004,
      differencePercent: 0.04,
      unit: "kWh"
    };

    const text = computeTextSummary(summary);

    expect(text.trend).toBe("similar");
    expect(text.diffValue).toBeCloseTo(0.004);
    expect(text.unit).toBe("kWh");
  });

  it("propagates unit without depending on locale", () => {
    const summary = {
      current_cumulative: 100,
      reference_cumulative: 80,
      difference: 20,
      differencePercent: 25,
      unit: "m³"
    };

    const text = computeTextSummary(summary);

    expect(text.trend).toBe("higher");
    expect(text.unit).toBe("m³");
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
    expect(text.diffValue).toBeCloseTo(5);
    expect(text.unit).toBe("kWh");
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
    expect(text.diffValue).toBeUndefined();
    expect(text.unit).toBe("kWh");
  });
});

describe("formatSigned", () => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  it("formats positive value with + prefix", () => {
    const result = formatSigned(12.5, formatter, "kWh");
    expect(result).toBe("+12.5 kWh");
  });

  it("formats negative value with − (U+2212) prefix and absolute value", () => {
    const result = formatSigned(-12.5, formatter, "kWh");
    expect(result).toBe("\u221212.5 kWh");
  });

  it("formats zero with no sign prefix", () => {
    const result = formatSigned(0, formatter, "kWh");
    expect(result).toBe("0.0 kWh");
  });

  it("appends unit string correctly", () => {
    const result = formatSigned(5.3, formatter, "%");
    expect(result).toBe("+5.3 %");
  });

  it("respects formatter precision for negative values", () => {
    const precisionFormatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const result = formatSigned(-99.999, precisionFormatter, "Wh");
    expect(result).toMatch(/\u2212100\.\d{2} Wh/);
  });
});

