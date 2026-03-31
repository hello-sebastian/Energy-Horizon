import { describe, it, expect } from "vitest";
import {
  buildPeriodSuffix,
  formatWindowRangeSuffix,
  isForecastLineVisible
} from "../../src/card/cumulative-comparison-chart";
import type { ResolvedWindow } from "../../src/card/types";

describe("buildPeriodSuffix", () => {
  it("returns year string for year_over_year mode with 2026-01-01", () => {
    const date = new Date("2026-01-01");
    const result = buildPeriodSuffix(date, "year_over_year", "en");
    expect(result).toBe("2026");
  });

  it("returns month+year for month_over_year mode with 2026-03-01 in English", () => {
    const date = new Date("2026-03-01");
    const result = buildPeriodSuffix(date, "month_over_year", "en");
    expect(result).toBe("March 2026");
  });

  it("returns month+year for month_over_year mode with 2026-03-01 in Polish", () => {
    const date = new Date("2026-03-01");
    const result = buildPeriodSuffix(date, "month_over_year", "pl");
    expect(result).toMatch(/2026/);
  });

  it("returns month+year for month_over_month mode like month_over_year", () => {
    const date = new Date("2026-02-01");
    const result = buildPeriodSuffix(date, "month_over_month", "en");
    expect(result).toBe("February 2026");
  });

  it("returns month+year for month_over_month mode with 2026-02-01 in Polish", () => {
    const date = new Date("2026-02-01");
    const result = buildPeriodSuffix(date, "month_over_month", "pl");
    expect(result).toMatch(/2026/);
  });

  it("returns year string for year_over_year mode with period_offset -2 (2024-01-01)", () => {
    const date = new Date("2024-01-01");
    const result = buildPeriodSuffix(date, "year_over_year", "en");
    expect(result).toBe("2024");
  });

  it("returns empty string for unknown mode", () => {
    const date = new Date("2026-01-01");
    const result = buildPeriodSuffix(date, "unknown_mode", "en");
    expect(result).toBe("");
  });
});

describe("formatWindowRangeSuffix", () => {
  it("formats start–end for a resolved window", () => {
    const w: ResolvedWindow = {
      index: 0,
      id: "w0",
      role: "current",
      start: new Date("2026-03-01T00:00:00Z"),
      end: new Date("2026-03-31T23:59:59Z"),
      aggregation: "day"
    };
    const s = formatWindowRangeSuffix(w, "en");
    expect(s).toContain("2026");
    expect(s).toContain("–");
  });
});

describe("isForecastLineVisible", () => {
  it("is true when show_forecast is omitted", () => {
    expect(
      isForecastLineVisible({
        type: "custom:energy-horizon-card",
        entity: "sensor.e",
        comparison_preset: "year_over_year"
      })
    ).toBe(true);
  });

  it("is false when show_forecast is false", () => {
    expect(
      isForecastLineVisible({
        type: "custom:energy-horizon-card",
        entity: "sensor.e",
        comparison_preset: "year_over_year",
        show_forecast: false
      })
    ).toBe(false);
  });
});
