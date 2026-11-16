/**
 * 911/TD-3 — typed LTS WebSocket response adapter (W1).
 *
 * Contract: specs/911-tech-debt-reduction/contracts/lts-websocket-response.md
 * Golden rule (FR-019): the existing mapper tests in `ha-api.test.ts` keep
 * their unchanged expected values; this file pins the adapter's envelope
 * handling (Shape A / Shape B / legacy bare record) and its defensive
 * behavior on malformed input (never throws, degrades to `undefined`).
 */
import { describe, expect, it } from "vitest";
import {
  extractLtsResults,
  mapLtsResponseToCumulativeSeries,
  mapLtsResponseToSeries,
  type LtsMessageResponse
} from "../../src/card/ha-api";
import type {
  ComparisonPeriod,
  LtsStatisticsResponse
} from "../../src/card/types";

/**
 * Sum-based LTS points (older HA shape, no `change`): sums 2, 4, 9 →
 * first sum is the baseline, deltas 2 and 5 → 2 cumulative points (2, 7).
 */
const points = [
  { start: "2024-01-01T00:00:00+00:00", sum: 2, unit_of_measurement: "kWh" },
  { start: "2024-01-02T00:00:00+00:00", sum: 4, unit_of_measurement: "kWh" },
  { start: "2024-01-03T00:00:00+00:00", sum: 9, unit_of_measurement: "kWh" }
];

const bare: LtsStatisticsResponse = {
  results: { "sensor.energy": points }
};

/** Tests exercise malformed runtime values that HA can deliver over WS. */
const asMessage = (value: unknown): LtsMessageResponse =>
  value as LtsMessageResponse;

describe("extractLtsResults (911/TD-3 adapter)", () => {
  it("Shape A: unwraps the { success, result } envelope", () => {
    const envelope: LtsMessageResponse = { success: true, result: bare };
    expect(extractLtsResults(envelope)).toStrictEqual(bare);
  });

  it("Shape B: passes a bare { results } payload through", () => {
    expect(extractLtsResults(bare)).toStrictEqual(bare);
  });

  it("legacy shape: a bare statistic record without a `results` wrapper is preserved", () => {
    const legacy = { "sensor.energy": points };
    expect(extractLtsResults(asMessage(legacy))).toStrictEqual({
      results: legacy
    });
  });

  it("never throws and returns undefined for malformed input", () => {
    const malformed: unknown[] = [
      null,
      undefined,
      "string",
      42,
      0,
      true,
      { result: "x" }
    ];
    for (const value of malformed) {
      expect(() => extractLtsResults(asMessage(value))).not.toThrow();
      expect(extractLtsResults(asMessage(value))).toBeUndefined();
    }
  });
});

describe("mapLtsResponseToCumulativeSeries with LtsMessageResponse (911/TD-3)", () => {
  it("Shape A and Shape B produce identical mapped series (contract edge case 4)", () => {
    const fromA = mapLtsResponseToCumulativeSeries(
      { success: true, result: bare },
      "sensor.energy",
      "Current"
    );
    const fromB = mapLtsResponseToCumulativeSeries(bare, "sensor.energy", "Current");
    expect(fromA).toBeDefined();
    expect(fromB).toBeDefined();
    expect(fromA).toStrictEqual(fromB);
    expect(fromA!.points.length).toBe(2);
    expect(fromA!.total).toBe(7);
    expect(fromA!.unit).toBe("kWh");
  });

  it("maps the legacy bare-record shape (documented HA shape, fallback kept)", () => {
    const legacy = { "sensor.energy": points };
    const mapped = mapLtsResponseToCumulativeSeries(
      asMessage(legacy),
      "sensor.energy",
      "Current"
    );
    const viaWrapper = mapLtsResponseToCumulativeSeries(
      bare,
      "sensor.energy",
      "Current"
    );
    expect(mapped).toStrictEqual(viaWrapper);
  });

  it("falls back to the single record key when the entity id is absent (existing behavior)", () => {
    const single = { results: { "sensor.only": points } };
    const mapped = mapLtsResponseToCumulativeSeries(
      asMessage(single),
      "sensor.missing",
      "Current"
    );
    expect(mapped).toBeDefined();
    expect(mapped!.total).toBe(7);
  });

  it("first-key fallback also works through the legacy bare-record shape", () => {
    const legacy = { "sensor.only": points };
    const mapped = mapLtsResponseToCumulativeSeries(
      asMessage(legacy),
      "sensor.missing",
      "Current"
    );
    const viaWrapper = mapLtsResponseToCumulativeSeries(
      { results: { "sensor.only": points } },
      "sensor.missing",
      "Current"
    );
    expect(mapped).toStrictEqual(viaWrapper);
  });

  it("returns undefined (never throws) for malformed payloads — the existing no-data path", () => {
    const malformed: unknown[] = [
      null,
      undefined,
      "string",
      42,
      true,
      [],
      {},
      { result: null },
      { result: "x" },
      { result: 0 },
      { result: [] },
      { result: {} },
      { results: null },
      { results: "x" },
      { results: 0 },
      { results: 5 },
      { results: [] },
      { results: {} }
    ];
    for (const value of malformed) {
      expect(() =>
        mapLtsResponseToCumulativeSeries(asMessage(value), "sensor.energy", "Current")
      ).not.toThrow();
      expect(
        mapLtsResponseToCumulativeSeries(asMessage(value), "sensor.energy", "Current")
      ).toBeUndefined();
    }
  });
});

describe("mapLtsResponseToSeries wrapper (911/TD-3)", () => {
  const period: ComparisonPeriod = {
    current_start: new Date("2024-01-01T00:00:00Z"),
    current_end: new Date("2024-01-04T00:00:00Z"),
    reference_start: new Date("2023-01-01T00:00:00Z"),
    reference_end: new Date("2023-01-04T00:00:00Z"),
    aggregation: "day",
    time_zone: "UTC"
  };

  it("accepts the envelope shape and passes period metadata through", () => {
    const series = mapLtsResponseToSeries(
      { success: true, result: bare },
      "sensor.energy",
      period,
      "Current"
    );
    expect(series).toBeDefined();
    expect(series!.current.total).toBe(7);
    expect(series!.aggregation).toBe("day");
    expect(series!.time_zone).toBe("UTC");
  });
});
