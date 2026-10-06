import { describe, it, expect } from "vitest";
import { classifyComparisonStep } from "../../src/card/narrative/classify-comparison-step";
import { interpretationToEntityKind } from "../../src/card/narrative/interpretation-to-entity-kind";

describe("classifyComparisonStep (FR-903-NA)", () => {
  it("maps canonical steps EC-N6–N9 / table", () => {
    expect(classifyComparisonStep("1d")).toBe("day");
    expect(classifyComparisonStep("1w")).toBe("week");
    expect(classifyComparisonStep("1M")).toBe("month");
    expect(classifyComparisonStep("1y")).toBe("year");
  });

  it("accepts uppercase year token (normalization)", () => {
    expect(classifyComparisonStep("1Y")).toBe("year");
  });

  it("maps EC-N10 / EC-N11 / unknown to reference", () => {
    expect(classifyComparisonStep("16d")).toBe("reference");
    expect(classifyComparisonStep("3M")).toBe("reference");
    expect(classifyComparisonStep("2w")).toBe("reference");
  });

  it("maps EC-N12 undefined, empty, whitespace-only to reference", () => {
    expect(classifyComparisonStep(undefined)).toBe("reference");
    expect(classifyComparisonStep("")).toBe("reference");
    expect(classifyComparisonStep("   ")).toBe("reference");
  });

  it("trims surrounding whitespace (EC-N1-style inputs)", () => {
    expect(classifyComparisonStep("  1M  ")).toBe("month");
  });

  it("strips leading P / p from ISO-style tokens (data-model audit)", () => {
    expect(classifyComparisonStep("P1M")).toBe("month");
    expect(classifyComparisonStep("p1y")).toBe("year");
  });
});

describe("interpretationToEntityKind (FR-903-NF)", () => {
  it("maps production and consumption", () => {
    expect(interpretationToEntityKind("production")).toBe("production");
    expect(interpretationToEntityKind("consumption")).toBe("consumption");
  });

  it("defaults invalid and undefined to consumption", () => {
    expect(interpretationToEntityKind(undefined)).toBe("consumption");
    expect(interpretationToEntityKind("")).toBe("consumption");
    expect(interpretationToEntityKind("export")).toBe("consumption");
  });
});
