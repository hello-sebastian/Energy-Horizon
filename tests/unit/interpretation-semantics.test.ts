import { describe, it, expect, vi } from "vitest";
import {
  computeInterpretationSemantics,
  parseInterpretationMode,
  parseNeutralInterpretationT
} from "../../src/card/interpretation-semantics";
import { semanticToneClass } from "../../src/card/trend-visual";

describe("parseInterpretationMode", () => {
  it("defaults to consumption", () => {
    expect(parseInterpretationMode(undefined)).toBe("consumption");
    expect(parseInterpretationMode("")).toBe("consumption");
  });

  it("parses case-insensitively", () => {
    expect(parseInterpretationMode("PRODUCTION")).toBe("production");
    expect(parseInterpretationMode("Consumption")).toBe("consumption");
  });

  it("falls back to consumption for unknown values", () => {
    const log = vi.fn();
    expect(
      parseInterpretationMode("solar", { debug: true, log })
    ).toBe("consumption");
    expect(log).toHaveBeenCalled();
  });
});

describe("parseNeutralInterpretationT", () => {
  it("defaults invalid to 2", () => {
    expect(parseNeutralInterpretationT(undefined)).toBe(2);
    expect(parseNeutralInterpretationT("x")).toBe(2);
    expect(parseNeutralInterpretationT(-1)).toBe(2);
  });

  it("accepts non-negative numbers", () => {
    expect(parseNeutralInterpretationT(0)).toBe(0);
    expect(parseNeutralInterpretationT(5)).toBe(5);
    expect(parseNeutralInterpretationT(100)).toBe(100);
  });
});

describe("computeInterpretationSemantics", () => {
  const base = {
    current_cumulative: 110,
    reference_cumulative: 100 as number | undefined,
    difference: 10 as number | undefined,
    p: 10 as number | undefined,
    T: 2
  };

  it("consumption: current > ref outside band → negative", () => {
    expect(
      computeInterpretationSemantics({
        ...base,
        interpretation: "consumption"
      }).outcome
    ).toBe("negative");
  });

  it("consumption: current < ref outside band → positive", () => {
    expect(
      computeInterpretationSemantics({
        ...base,
        current_cumulative: 90,
        difference: -10,
        p: -10,
        interpretation: "consumption"
      }).outcome
    ).toBe("positive");
  });

  it("production: current > ref outside band → positive", () => {
    expect(
      computeInterpretationSemantics({
        ...base,
        interpretation: "production"
      }).outcome
    ).toBe("positive");
  });

  it("production: current < ref outside band → negative", () => {
    expect(
      computeInterpretationSemantics({
        ...base,
        current_cumulative: 90,
        difference: -10,
        p: -10,
        interpretation: "production"
      }).outcome
    ).toBe("negative");
  });

  it("neutral when |p| ≤ T", () => {
    const r = computeInterpretationSemantics({
        ...base,
        current_cumulative: 101,
        difference: 1,
        p: 1,
        interpretation: "consumption",
        T: 2
      });
    expect(r.outcome).toBe("neutral");
    expect(r.neutralKind).toBe("percent_band");
  });

  it("strict T=0 only neutral when |p| is exactly 0", () => {
    expect(
      computeInterpretationSemantics({
        current_cumulative: 100.5,
        reference_cumulative: 100,
        difference: 0.5,
        p: 0.5,
        interpretation: "consumption",
        T: 0
      }).outcome
    ).toBe("negative");
    const r = computeInterpretationSemantics({
      current_cumulative: 100,
      reference_cumulative: 100,
      difference: 0,
      p: 0,
      interpretation: "consumption",
      T: 0
    });
    expect(r.outcome).toBe("neutral");
    expect(r.neutralKind).toBe("percent_band");
  });

  it("very large T makes neutral from percent band", () => {
    expect(
      computeInterpretationSemantics({
        ...base,
        p: 50,
        interpretation: "consumption",
        T: 100
      }).outcome
    ).toBe("neutral");
  });

  it("reference zero: both zero → neutral flat", () => {
    const r = computeInterpretationSemantics({
      current_cumulative: 0,
      reference_cumulative: 0,
      difference: 0,
      p: undefined,
      interpretation: "consumption",
      T: 2
    });
    expect(r.outcome).toBe("neutral");
    expect(r.neutralKind).toBe("flat_or_zero");
  });

  it("reference zero: current non-zero → no percent band, consumption sign", () => {
    expect(
      computeInterpretationSemantics({
        current_cumulative: 50,
        reference_cumulative: 0,
        difference: 50,
        p: undefined,
        interpretation: "consumption",
        T: 2
      }).outcome
    ).toBe("negative");
    expect(
      computeInterpretationSemantics({
        current_cumulative: 50,
        reference_cumulative: 0,
        difference: 50,
        p: undefined,
        interpretation: "production",
        T: 2
      }).outcome
    ).toBe("positive");
  });

  it("SC-903-7 consumption legacy: higher use maps to same tone as pre-semantic higher trend", () => {
    const outcome = computeInterpretationSemantics({
      ...base,
      interpretation: "consumption"
    }).outcome;
    expect(outcome).toBe("negative");
    expect(semanticToneClass(outcome)).toBe("ebc-trend--negative");
  });

  it("insufficient when reference or difference missing", () => {
    expect(
      computeInterpretationSemantics({
        ...base,
        reference_cumulative: undefined,
        difference: undefined,
        p: undefined,
        interpretation: "consumption"
      }).outcome
    ).toBe("insufficient_data");
  });
});
