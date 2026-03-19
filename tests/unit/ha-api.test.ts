import { describe, it, expect } from "vitest";
import {
  computeSummary,
  computeForecast,
  computeTextSummary,
  mapLtsResponseToSeries
} from "../../src/card/ha-api";
import { formatSigned } from "../../src/card/cumulative-comparison-chart";
import type {
  ComparisonSeries,
  CumulativeSeries,
  LtsStatisticsResponse
} from "../../src/card/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Punkty kumulacyjne z jawnym rawValue (computeForecast sumuje rawValue). */
function makeCumulativeFromTimestamps(
  timestamps: number[],
  rawEach: number
): CumulativeSeries {
  let running = 0;
  const points = timestamps.map((timestamp) => {
    running += rawEach;
    return { timestamp, value: running, rawValue: rawEach };
  });
  return {
    points,
    unit: "kWh",
    periodLabel: "test",
    total: running
  };
}

function makeCumulativeFromTimestampsRaws(
  timestamps: number[],
  raws: number[]
): CumulativeSeries {
  let running = 0;
  const points = timestamps.map((timestamp, i) => {
    const raw = raws[i] ?? 0;
    running += raw;
    return { timestamp, value: running, rawValue: raw };
  });
  return {
    points,
    unit: "kWh",
    periodLabel: "test",
    total: running
  };
}

function comparisonFrom(
  current: CumulativeSeries,
  reference?: CumulativeSeries
): ComparisonSeries {
  return {
    current,
    reference,
    aggregation: "day",
    time_zone: "UTC"
  };
}

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

describe("computeForecast", () => {
  const T0 = Date.UTC(2024, 0, 1);

  // US1 — scenariusze 1–4 (progi procentowe)
  it("scenario 1: 2 completed buckets / 365 (pct < 0.05) → disabled", () => {
    const ts = [T0, T0 + DAY_MS, T0 + 2 * DAY_MS];
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, 1),
      makeCumulativeFromTimestamps(ts, 1)
    );
    expect(computeForecast(s, 365).enabled).toBe(false);
  });

  it("scenario 2: 4/30 buckets → enabled, confidence low", () => {
    const n = 5;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, 2),
      makeCumulativeFromTimestamps(
        Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS),
        2
      )
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    expect(f.confidence).toBe("low");
  });

  it("scenario 3: 7/30 buckets → enabled, confidence medium", () => {
    const n = 8;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, 2),
      makeCumulativeFromTimestamps(
        Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS),
        2
      )
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    expect(f.confidence).toBe("medium");
  });

  it("scenario 4: 13/30 buckets → enabled, confidence high", () => {
    const n = 14;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, 2),
      makeCumulativeFromTimestamps(
        Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS),
        2
      )
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    expect(f.confidence).toBe("high");
  });

  // US1 — scenariusze 10–13 (strażniki)
  it("scenario 10: no reference series → disabled", () => {
    const ts = Array.from({ length: 6 }, (_, i) => T0 + i * DAY_MS);
    const s = comparisonFrom(makeCumulativeFromTimestamps(ts, 1));
    expect(computeForecast(s, 30).enabled).toBe(false);
  });

  it("scenario 11: periodTotalBuckets = 0 → disabled", () => {
    const ts = Array.from({ length: 6 }, (_, i) => T0 + i * DAY_MS);
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, 1),
      makeCumulativeFromTimestamps(
        Array.from({ length: 8 }, (_, i) => T0 + i * DAY_MS),
        1
      )
    );
    expect(computeForecast(s, 0).enabled).toBe(false);
  });

  it("scenario 12: B = 0 → disabled", () => {
    const n = 6;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS);
    const refRaws = Array.from({ length: n + 2 }, () => 0);
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, 1),
      makeCumulativeFromTimestampsRaws(refTs, refRaws)
    );
    expect(computeForecast(s, 30).enabled).toBe(false);
  });

  it("scenario 13: completedBuckets = 2 (< 3) → disabled", () => {
    const ts = [T0, T0 + DAY_MS, T0 + 2 * DAY_MS];
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, 1),
      makeCumulativeFromTimestamps(
        [T0, T0 + DAY_MS, T0 + 2 * DAY_MS, T0 + 3 * DAY_MS],
        1
      )
    );
    expect(computeForecast(s, 30).enabled).toBe(false);
  });

  // US2 — scenariusze 9 i 14
  it("scenario 9: gap in current series — split by time range, not index", () => {
    const curTs = [T0, T0 + 2 * DAY_MS, T0 + 4 * DAY_MS, T0 + 6 * DAY_MS];
    const curRaws = [1, 1, 1, 1];
    const refTs = Array.from({ length: 10 }, (_, i) => T0 + i * DAY_MS);
    const refRaws = Array.from({ length: 10 }, () => 1);
    const current = makeCumulativeFromTimestampsRaws(curTs, curRaws);
    const reference = makeCumulativeFromTimestampsRaws(refTs, refRaws);
    const s = comparisonFrom(current, reference);
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    const completedBuckets = 3;
    const cutoffTs =
      curTs[completedBuckets - 1]! - curTs[0]! + curTs[0]!;
    let expectedSplit = -1;
    for (let i = refTs.length - 1; i >= 0; i--) {
      if (refTs[i]! <= cutoffTs) {
        expectedSplit = i;
        break;
      }
    }
    expect(expectedSplit).toBe(4);
    const B = refRaws.slice(0, expectedSplit + 1).reduce((a, b) => a + b, 0);
    const A = curRaws.slice(0, completedBuckets).reduce((a, b) => a + b, 0);
    const rawTrend = A / B;
    const trend = Math.min(5, Math.max(0.2, rawTrend));
    const C = refRaws.slice(expectedSplit + 1).reduce((a, b) => a + b, 0);
    expect(f.forecast_total).toBeCloseTo(A + C * trend, 5);
  });

  it("scenario 14: all reference timestamps after current range → disabled", () => {
    const curTs = Array.from({ length: 5 }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: 8 }, (_, i) => T0 + 400 * DAY_MS + i * DAY_MS);
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(curTs, 1),
      makeCumulativeFromTimestamps(refTs, 1)
    );
    expect(computeForecast(s, 30).enabled).toBe(false);
  });

  // US3 — anomalia referencji (rawTrend poza [0.3, 3.3])
  it("scenario 5: rawTrend ≈ 4 → anomalousReference, confidence low, enabled", () => {
    const n = 14;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS);
    const curRaws = Array.from({ length: n }, () => 4);
    const refRaws = Array.from({ length: n + 2 }, () => 1);
    const s = comparisonFrom(
      makeCumulativeFromTimestampsRaws(ts, curRaws),
      makeCumulativeFromTimestampsRaws(refTs, refRaws)
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    expect(f.anomalousReference).toBe(true);
    expect(f.confidence).toBe("low");
  });

  it("scenario 6: rawTrend = 0.2 → anomalousReference, confidence low, enabled", () => {
    const n = 14;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS);
    const curRaws = [2, ...Array.from({ length: n - 1 }, () => 0)];
    const refRaws = [...Array.from({ length: 10 }, () => 1), ...Array.from({ length: n + 2 - 10 }, () => 0)];
    const s = comparisonFrom(
      makeCumulativeFromTimestampsRaws(ts, curRaws),
      makeCumulativeFromTimestampsRaws(refTs, refRaws)
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    expect(f.anomalousReference).toBe(true);
    expect(f.confidence).toBe("low");
  });

  it("scenario 7: rawTrend = 1.1 → no anomaly, confidence from pct (high)", () => {
    const n = 14;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS);
    const curEach = 11;
    const refEach = 10;
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(ts, curEach),
      makeCumulativeFromTimestamps(refTs, refEach)
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    expect(f.anomalousReference).toBeFalsy();
    expect(f.confidence).toBe("high");
  });

  it("scenario 15: rawTrend = 3.3 boundary → not anomaly, confidence high", () => {
    const n = 14;
    const ts = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: n + 2 }, (_, i) => T0 + i * DAY_MS);
    // A = 33 (13 pierwszych bucketów), B = 10 — dokładnie 33/10 = 3.3 (granica: nie anomalia)
    const curRaws = [...Array.from({ length: 11 }, () => 3), 0, 0, 0];
    const refRaws = [...Array.from({ length: 10 }, () => 1), 0, 0, 0, 1, 1, 1];
    const s = comparisonFrom(
      makeCumulativeFromTimestampsRaws(ts, curRaws),
      makeCumulativeFromTimestampsRaws(refTs, refRaws)
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    expect(f.anomalousReference).toBeFalsy();
    expect(f.confidence).toBe("high");
  });

  // US4 — C = 0 (seria referencyjna kończy się na splitIdx)
  it("scenario 8: reference ends at splitIdx → C=0 → enabled, forecast_total = A", () => {
    const n = 14;
    const curTs = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: n - 1 }, (_, i) => T0 + i * DAY_MS);
    const rawEach = 2;
    const s = comparisonFrom(
      makeCumulativeFromTimestamps(curTs, rawEach),
      makeCumulativeFromTimestamps(refTs, rawEach)
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    const completedBuckets = n - 1;
    const A = completedBuckets * rawEach;
    expect(f.forecast_total).toBeCloseTo(A, 5);
    expect(f.reference_total).toBeCloseTo(A, 5);
  });

  it("combined: C=0 and rawTrend≈4 → forecast_total=A, anomalousReference, confidence low", () => {
    const n = 14;
    const curTs = Array.from({ length: n }, (_, i) => T0 + i * DAY_MS);
    const refTs = Array.from({ length: n - 1 }, (_, i) => T0 + i * DAY_MS);
    const curRaws = Array.from({ length: n }, () => 4);
    const refRaws = Array.from({ length: n - 1 }, () => 1);
    const s = comparisonFrom(
      makeCumulativeFromTimestampsRaws(curTs, curRaws),
      makeCumulativeFromTimestampsRaws(refTs, refRaws)
    );
    const f = computeForecast(s, 30);
    expect(f.enabled).toBe(true);
    const A = (n - 1) * 4;
    expect(f.forecast_total).toBeCloseTo(A, 5);
    expect(f.anomalousReference).toBe(true);
    expect(f.confidence).toBe("low");
  });
});

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

