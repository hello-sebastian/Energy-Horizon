import { describe, it, expect } from "vitest";
import { computeSummary, computeForecast } from "../../src/card/ha-api";
import type { ComparisonSeries } from "../../src/card/types";

function makeSeriesFromDaily(values: number[]): ComparisonSeries {
  const start = new Date("2024-01-01T00:00:00Z").getTime();
  const points = values.map((v, idx) => ({
    timestamp: start + idx * 24 * 60 * 60 * 1000,
    value: v,
    rawValue: v
  }));

  return {
    current: {
      points,
      unit: "kWh",
      periodLabel: "Current period",
      total: points[points.length - 1]?.value ?? 0
    },
    aggregation: "day",
    time_zone: "UTC"
  };
}

describe("computeSummary (edge cases)", () => {
  it("treats very small difference as similar in downstream text summary", () => {
    const base = makeSeriesFromDaily([10, 20]);
    const ref = makeSeriesFromDaily([10, 20.005]);

    const series: ComparisonSeries = {
      ...base,
      reference: ref.current
    };

    const summary = computeSummary(series);

    expect(summary.current_cumulative).toBeCloseTo(20, 3);
    expect(summary.reference_cumulative).toBeCloseTo(20.005, 3);
    expect(Math.abs(summary.difference ?? 0)).toBeLessThan(0.01);
  });
});

describe("computeForecast", () => {
  it("disables forecast when there are not enough completed buckets", () => {
    const series = makeSeriesFromDaily([1, 2, 3]); // completedBuckets = 2 < 3

    const forecast = computeForecast(series, 30);

    expect(forecast.enabled).toBe(false);
  });

  it("enables forecast and sets confidence from pct vs periodTotalBuckets", () => {
    const withRef = (s: ComparisonSeries, refValues: number[]) =>
      ({ ...s, reference: makeSeriesFromDaily(refValues).current });
    const periodBuckets = 30;
    const seriesLow = withRef(
      makeSeriesFromDaily([1, 2, 3, 4, 5, 6]),
      [1, 1, 1, 1, 1, 1, 1]
    );
    const forecastLow = computeForecast(seriesLow, periodBuckets);
    expect(forecastLow.enabled).toBe(true);
    expect(forecastLow.confidence).toBe("low");

    const seriesMedium = withRef(
      makeSeriesFromDaily(Array.from({ length: 9 }, () => 2)),
      Array.from({ length: 10 }, () => 2)
    );
    const forecastMedium = computeForecast(seriesMedium, periodBuckets);
    expect(forecastMedium.enabled).toBe(true);
    expect(forecastMedium.confidence).toBe("medium");

    const seriesHigh = withRef(
      makeSeriesFromDaily(Array.from({ length: 20 }, () => 2)),
      Array.from({ length: 21 }, () => 2)
    );
    const forecastHigh = computeForecast(seriesHigh, periodBuckets);
    expect(forecastHigh.enabled).toBe(true);
    expect(forecastHigh.confidence).toBe("high");
  });
});

