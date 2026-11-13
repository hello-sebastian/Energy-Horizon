import { describe, it, expect, vi } from "vitest";
import type { HomeAssistant } from "../../src/ha-types";
import type { ResolvedWindow } from "../../src/card/types";
import {
  SUPPORTED_UNITS,
  isSupportedUnit,
  buildDemoComparisonSeries,
  findSuitableEntity,
  buildSamplePreviewConfig,
  buildEntitySuggestion,
  queryRealDataWithLimit
} from "../../src/card/picker-preview";

function makeHass(
  states: Record<
    string,
    { state: string; attributes: Record<string, unknown> }
  > = {},
  send?: (msg: Record<string, unknown>) => Promise<unknown>
): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states,
    connection: {
      sendMessagePromise: send ?? (async () => ({}))
    }
  } as unknown as HomeAssistant;
}

describe("SUPPORTED_UNITS / isSupportedUnit", () => {
  it("exposes exactly the five supported units", () => {
    expect([...SUPPORTED_UNITS]).toEqual(["kWh", "Wh", "MWh", "m³", "l"]);
  });

  it("returns true for each supported unit (exact, case-sensitive)", () => {
    for (const unit of SUPPORTED_UNITS) {
      expect(isSupportedUnit(unit)).toBe(true);
    }
  });

  it("returns false for unsupported units and undefined", () => {
    expect(isSupportedUnit("°C")).toBe(false);
    expect(isSupportedUnit("kwh")).toBe(false);
    expect(isSupportedUnit("KWH")).toBe(false);
    expect(isSupportedUnit("")).toBe(false);
    expect(isSupportedUnit(undefined)).toBe(false);
  });
});

describe("buildSamplePreviewConfig", () => {
  it("returns exactly the sample preview config shape", () => {
    expect(buildSamplePreviewConfig("sensor.energy")).toEqual({
      type: "energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      interpretation: "consumption",
      neutral_threshold: 2
    });
  });
});

describe("buildEntitySuggestion", () => {
  it("returns a suggestion with the selected entity for a supported unit", () => {
    const hass = makeHass({
      "sensor.energy": {
        state: "10",
        attributes: { unit_of_measurement: "kWh" }
      }
    });
    const suggestion = buildEntitySuggestion(hass, "sensor.energy");
    expect(suggestion).not.toBeNull();
    expect(suggestion?.config).toEqual({
      type: "energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      interpretation: "consumption",
      neutral_threshold: 2
    });
  });

  it("returns null for an unsupported unit", () => {
    const hass = makeHass({
      "sensor.temperature": {
        state: "21",
        attributes: { unit_of_measurement: "°C" }
      }
    });
    expect(buildEntitySuggestion(hass, "sensor.temperature")).toBeNull();
  });

  it("returns null when the entity is missing from hass.states", () => {
    const hass = makeHass({});
    expect(buildEntitySuggestion(hass, "sensor.missing")).toBeNull();
  });

  it("returns null when the entity has no unit attribute", () => {
    const hass = makeHass({
      "sensor.bare": { state: "1", attributes: {} }
    });
    expect(buildEntitySuggestion(hass, "sensor.bare")).toBeNull();
  });

  it("never throws on malformed input", () => {
    const hass = makeHass({});
    expect(() => buildEntitySuggestion(hass, "sensor.x")).not.toThrow();
    // states entirely absent
    const bare = {
      language: "en",
      connection: { sendMessagePromise: async () => ({}) }
    } as unknown as HomeAssistant;
    expect(() => buildEntitySuggestion(bare, "sensor.x")).not.toThrow();
  });
});

describe("findSuitableEntity", () => {
  it("prefers an unused entity over a used one", () => {
    const hass = makeHass({
      "sensor.used": {
        state: "1",
        attributes: { unit_of_measurement: "kWh" }
      },
      "sensor.unused": {
        state: "1",
        attributes: { unit_of_measurement: "MWh" }
      }
    });
    expect(
      findSuitableEntity(hass, ["sensor.unused"], ["sensor.used"])
    ).toBe("sensor.unused");
  });

  it("falls back to entitiesFallback when no unused entity is suitable", () => {
    const hass = makeHass({
      "sensor.unused_bad": {
        state: "1",
        attributes: { unit_of_measurement: "°C" }
      },
      "sensor.used": {
        state: "1",
        attributes: { unit_of_measurement: "l" }
      }
    });
    expect(
      findSuitableEntity(hass, ["sensor.unused_bad"], ["sensor.used"])
    ).toBe("sensor.used");
  });

  it("returns the first suitable entity in order", () => {
    const hass = makeHass({
      "sensor.a": { state: "1", attributes: { unit_of_measurement: "Wh" } },
      "sensor.b": { state: "1", attributes: { unit_of_measurement: "kWh" } }
    });
    expect(findSuitableEntity(hass, ["sensor.b", "sensor.a"], [])).toBe(
      "sensor.b"
    );
  });

  it('returns "" when no entity has a supported unit', () => {
    const hass = makeHass({
      "sensor.bad": { state: "1", attributes: { unit_of_measurement: "°C" } }
    });
    expect(
      findSuitableEntity(hass, ["sensor.bad"], ["sensor.bad"])
    ).toBe("");
  });

  it('returns "" for empty lists', () => {
    const hass = makeHass({});
    expect(findSuitableEntity(hass, [], [])).toBe("");
  });
});

describe("buildDemoComparisonSeries", () => {
  const now = new Date("2025-06-15T12:00:00Z");

  it("is deterministic (no Math.random)", () => {
    const a = buildDemoComparisonSeries("kWh", now, "UTC");
    const b = buildDemoComparisonSeries("kWh", now, "UTC");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("returns the ComparisonSeries shape with the given unit and zone", () => {
    const series = buildDemoComparisonSeries("kWh", now, "UTC");
    expect(series.current.unit).toBe("kWh");
    expect(series.reference?.unit).toBe("kWh");
    expect(series.time_zone).toBe("UTC");
    expect(series.aggregation).toBe("week");
  });

  it("produces a partial current series and a complete reference series", () => {
    const series = buildDemoComparisonSeries("kWh", now, "UTC");
    expect(series.current.points.length).toBeGreaterThan(0);
    expect(series.reference?.points.length).toBeGreaterThan(0);
    // Current ends at `now` (mid-year) → fewer points than the full reference year.
    expect(series.current.points.length).toBeLessThan(
      series.reference!.points.length
    );
  });

  it("stamps current points on the timeline up to `now`", () => {
    const series = buildDemoComparisonSeries("kWh", now, "UTC");
    const lastCurrent = series.current.points[series.current.points.length - 1]!;
    expect(lastCurrent.timestamp).toBeLessThanOrEqual(now.getTime());
    // First current point is the start of the current window (Jan 1, current year).
    expect(series.current.points[0]!.timestamp).toBe(
      Date.UTC(2025, 0, 1)
    );
  });

  it("stamps reference points on the previous-year window", () => {
    const series = buildDemoComparisonSeries("kWh", now, "UTC");
    // First reference point is Jan 1 of the previous year.
    expect(series.reference!.points[0]!.timestamp).toBe(Date.UTC(2024, 0, 1));
  });

  it("produces monotonically increasing cumulative values", () => {
    const series = buildDemoComparisonSeries("kWh", now, "UTC");
    for (const cs of [series.current, series.reference!]) {
      for (let i = 1; i < cs.points.length; i++) {
        expect(cs.points[i]!.value).toBeGreaterThan(cs.points[i - 1]!.value);
      }
      expect(cs.total).toBe(cs.points[cs.points.length - 1]!.value);
    }
  });

  it("uses plausible positive magnitudes", () => {
    const series = buildDemoComparisonSeries("kWh", now, "UTC");
    expect(series.current.total).toBeGreaterThan(0);
    expect(series.reference!.total).toBeGreaterThan(series.current.total);
  });
});

describe("queryRealDataWithLimit", () => {
  const windows: ResolvedWindow[] = [
    {
      index: 0,
      id: "current",
      role: "current",
      start: new Date("2025-01-01T00:00:00Z"),
      end: new Date("2025-06-15T12:00:00Z"),
      aggregation: "week"
    },
    {
      index: 1,
      id: "reference",
      role: "reference",
      start: new Date("2024-01-01T00:00:00Z"),
      end: new Date("2024-12-31T23:59:59.999Z"),
      aggregation: "week"
    }
  ];

  const ltsResponse = {
    results: {
      "sensor.energy": [
        { start: "2025-01-01T00:00:00Z", change: 10, unit_of_measurement: "kWh" },
        { start: "2025-01-08T00:00:00Z", change: 12, unit_of_measurement: "kWh" }
      ]
    }
  };

  it("resolves a ComparisonSeries on success", async () => {
    const send = vi.fn().mockResolvedValue(ltsResponse);
    const hass = makeHass({}, send);
    const result = await queryRealDataWithLimit(
      hass,
      windows,
      "sensor.energy",
      "UTC",
      1000
    );
    expect(result).not.toBeNull();
    expect(result!.current.points.length).toBeGreaterThan(0);
    expect(result!.current.unit).toBe("kWh");
    expect(result!.time_zone).toBe("UTC");
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("resolves null on timeout", async () => {
    const send = vi.fn(
      () => new Promise<unknown>(() => {}) // never resolves
    );
    const hass = makeHass({}, send);
    const result = await queryRealDataWithLimit(
      hass,
      windows,
      "sensor.energy",
      "UTC",
      20
    );
    expect(result).toBeNull();
  });

  it("resolves null on error", async () => {
    const send = vi.fn().mockRejectedValue(new Error("boom"));
    const hass = makeHass({}, send);
    const result = await queryRealDataWithLimit(
      hass,
      windows,
      "sensor.energy",
      "UTC",
      1000
    );
    expect(result).toBeNull();
  });

  it("resolves null when the response has no usable points", async () => {
    const send = vi.fn().mockResolvedValue({ results: { "sensor.energy": [] } });
    const hass = makeHass({}, send);
    const result = await queryRealDataWithLimit(
      hass,
      windows,
      "sensor.energy",
      "UTC",
      1000
    );
    expect(result).toBeNull();
  });

  it("resolves null for an empty window list", async () => {
    const send = vi.fn().mockResolvedValue(ltsResponse);
    const hass = makeHass({}, send);
    const result = await queryRealDataWithLimit(
      hass,
      [],
      "sensor.energy",
      "UTC",
      1000
    );
    expect(result).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });
});
