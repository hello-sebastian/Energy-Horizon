import { describe, it, expect } from "vitest";
import {
  normalizeForLoad,
  normalizeForSave
} from "../../src/card/editor/config-normalize";
import type { CardConfig, CardConfigInput } from "../../src/card/types";

describe("normalizeForLoad (research R8, FR-908-I/V)", () => {
  it("pre-fills comparison_preset from deprecated comparison_mode when empty", () => {
    const out = normalizeForLoad({
      type: "custom:energy-horizon-card",
      entity: "sensor.power",
      comparison_mode: "month_over_month"
    } as CardConfigInput);
    expect(out.comparison_preset).toBe("month_over_month");
  });

  it("prefers an explicit comparison_preset over comparison_mode", () => {
    const out = normalizeForLoad({
      type: "custom:energy-horizon-card",
      entity: "sensor.power",
      comparison_preset: "year_over_year",
      comparison_mode: "month_over_month"
    } as CardConfigInput);
    expect(out.comparison_preset).toBe("year_over_year");
  });

  it("defaults comparison_preset to year_over_year when both are absent", () => {
    const out = normalizeForLoad({
      type: "custom:energy-horizon-card",
      entity: "sensor.power"
    } as CardConfigInput);
    expect(out.comparison_preset).toBe("year_over_year");
  });

  it("resolves show_forecast as show_forecast ?? forecast ?? true", () => {
    expect(
      normalizeForLoad({
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year",
        show_forecast: false
      } as CardConfigInput).show_forecast
    ).toBe(false);

    expect(
      normalizeForLoad({
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year",
        forecast: false
      } as CardConfigInput).show_forecast
    ).toBe(false);

    expect(
      normalizeForLoad({
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year"
      } as CardConfigInput).show_forecast
    ).toBe(true);

    // An explicit show_forecast wins over the forecast alias.
    expect(
      normalizeForLoad({
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year",
        show_forecast: true,
        forecast: false
      } as CardConfigInput).show_forecast
    ).toBe(true);
  });

  it("parses interpretation and neutral_interpretation to canonical values", () => {
    const out = normalizeForLoad({
      type: "x",
      entity: "e",
      comparison_preset: "year_over_year",
      interpretation: "production",
      neutral_interpretation: 5
    } as CardConfigInput);
    expect(out.interpretation).toBe("production");
    expect(out.neutral_interpretation).toBe(5);

    const invalid = normalizeForLoad({
      type: "x",
      entity: "e",
      comparison_preset: "year_over_year",
      interpretation: "bogus",
      neutral_interpretation: -3
    } as CardConfigInput);
    expect(invalid.interpretation).toBe("consumption");
    expect(invalid.neutral_interpretation).toBe(2);
  });

  it("preserves the legacy keys in the loaded object (for the preservative merge)", () => {
    const out = normalizeForLoad({
      type: "x",
      entity: "e",
      comparison_preset: "year_over_year",
      comparison_mode: "year_over_year",
      forecast: true,
      some_unknown_key: 42
    } as CardConfigInput);
    expect((out as CardConfig & { comparison_mode?: unknown }).comparison_mode).toBe(
      "year_over_year"
    );
    expect(out.forecast).toBe(true);
    expect((out as CardConfig & { some_unknown_key?: unknown }).some_unknown_key).toBe(
      42
    );
  });

  it("does not mutate its input", () => {
    const input = {
      type: "x",
      entity: "e",
      comparison_mode: "month_over_month"
    } as CardConfigInput;
    const snapshot = JSON.parse(JSON.stringify(input));
    normalizeForLoad(input);
    expect(input).toEqual(snapshot);
  });
});

describe("normalizeForSave (research R8, FR-908-I/V)", () => {
  it("emits comparison_preset and removes comparison_mode (replaces, not duplicates)", () => {
    const out = normalizeForSave(
      {
        type: "x",
        entity: "e",
        comparison_preset: "month_over_month",
        comparison_mode: "year_over_year"
      } as CardConfig & { comparison_mode?: string }
    );
    expect(out.comparison_preset).toBe("month_over_month");
    expect("comparison_mode" in out).toBe(false);
  });

  it("migrates a config that only has comparison_mode to comparison_preset", () => {
    const out = normalizeForSave(
      {
        type: "x",
        entity: "e",
        comparison_mode: "month_over_year"
      } as unknown as CardConfig
    );
    expect(out.comparison_preset).toBe("month_over_year");
    expect("comparison_mode" in out).toBe(false);
  });

  it("emits show_forecast and drops the forecast alias", () => {
    const out = normalizeForSave(
      {
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year",
        show_forecast: false,
        forecast: true
      } as CardConfig
    );
    expect(out.show_forecast).toBe(false);
    expect("forecast" in out).toBe(false);
  });

  it("resolves show_forecast from the forecast alias when show_forecast is absent", () => {
    const out = normalizeForSave(
      {
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year",
        forecast: false
      } as CardConfig
    );
    expect(out.show_forecast).toBe(false);
    expect("forecast" in out).toBe(false);
  });

  it("copies every other key through unchanged (no field lost)", () => {
    const out = normalizeForSave(
      {
        type: "x",
        entity: "e",
        title: "t",
        comparison_preset: "year_over_year",
        comparison_mode: "year_over_year",
        forecast: true,
        precision: 3,
        some_unknown_key: { a: 1 }
      } as CardConfig & { comparison_mode?: string }
    );
    expect(out.title).toBe("t");
    expect(out.precision).toBe(3);
    expect((out as CardConfig & { some_unknown_key?: unknown }).some_unknown_key).toEqual(
      { a: 1 }
    );
    expect("comparison_mode" in out).toBe(false);
    expect("forecast" in out).toBe(false);
  });

  it("does not mutate its input", () => {
    const input = {
      type: "x",
      entity: "e",
      comparison_preset: "year_over_year",
      comparison_mode: "year_over_year",
      forecast: true
    } as CardConfig & { comparison_mode?: string };
    const snapshot = JSON.parse(JSON.stringify(input));
    normalizeForSave(input);
    expect(input).toEqual(snapshot);
  });
});
