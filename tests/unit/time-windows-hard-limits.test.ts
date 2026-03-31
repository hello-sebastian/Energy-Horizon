import { describe, it, expect } from "vitest";
import {
  assertLtsHardLimits,
  buildMergedTimeWindowConfig,
  mergeTimeWindowConfig
} from "../../src/card/time-windows";
import type { CardConfig } from "../../src/card/types";

function baseCard(
  overrides: Partial<CardConfig> & Pick<CardConfig, "entity">
): CardConfig {
  return {
    type: "custom:energy-horizon-card",
    entity: overrides.entity,
    comparison_preset: overrides.comparison_preset ?? "year_over_year",
    ...overrides
  };
}

describe("assertLtsHardLimits", () => {
  it("throws for disallowed anchor (e.g. start_of_minute)", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_minute" as unknown as "start_of_year",
        duration: "1h",
        step: "1h",
        count: 2
      },
      periodOffset: -1
    });
    expect(() => assertLtsHardLimits(merged)).toThrow(/invalid time anchor/);
  });

  it("throws for unknown anchor string", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_quarter" as unknown as "start_of_year",
        duration: "1h",
        step: "1h",
        count: 2
      },
      periodOffset: -1
    });
    expect(() => assertLtsHardLimits(merged)).toThrow(/invalid time anchor/);
  });

  it("allows start_of_day and start_of_week anchors", () => {
    const dayMerged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_day",
        duration: "1d",
        step: "1d",
        count: 2
      },
      periodOffset: -1
    });
    expect(() => assertLtsHardLimits(dayMerged)).not.toThrow();

    const weekMerged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_week",
        duration: "1w",
        step: "1w",
        count: 2
      },
      periodOffset: -1
    });
    expect(() => assertLtsHardLimits(weekMerged)).not.toThrow();
  });

  it("throws for duration below 1 hour (e.g. 30m)", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_hour",
        duration: "30m",
        step: "1h",
        count: 2
      },
      periodOffset: -1
    });
    expect(() => assertLtsHardLimits(merged)).toThrow(/at least 1 hour/);
  });

  it("throws for invalid aggregation at card level (e.g. 5m)", () => {
    const cfg = baseCard({
      entity: "sensor.x",
      aggregation: "5m" as unknown as "day"
    });
    const merged = buildMergedTimeWindowConfig(cfg);
    expect(() => assertLtsHardLimits(merged)).toThrow(/aggregation must be one of/);
  });

  it("throws for invalid aggregation in time_window YAML", () => {
    const cfg = baseCard({
      entity: "sensor.x",
      time_window: { aggregation: "5m" as unknown as "day" }
    });
    const merged = buildMergedTimeWindowConfig(cfg);
    expect(() => assertLtsHardLimits(merged)).toThrow(/aggregation must be one of/);
  });

  it("allows 1h duration, hour aggregation, start_of_hour anchor", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_hour",
        duration: "1h",
        step: "1h",
        count: 2,
        aggregation: "hour"
      },
      periodOffset: -1
    });
    expect(() => assertLtsHardLimits(merged)).not.toThrow();
  });

  it("allows 90m duration (>= 1h)", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_hour",
        duration: "90m",
        step: "1h",
        count: 2
      },
      periodOffset: -1
    });
    expect(() => assertLtsHardLimits(merged)).not.toThrow();
  });
});
