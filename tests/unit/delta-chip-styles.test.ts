/**
 * Delta chip wrapped-line spacing (post-implementation refinement).
 *
 * When the `.ebc-delta-chip` wraps onto a second line in a narrow column,
 * the vertical distance between its lines must be one third of the
 * horizontal gap (3 px vs 8 px).
 */
import { describe, expect, it } from "vitest";
import { energyHorizonCardStyles } from "../../src/card/energy-horizon-card-styles";

function chipRule(): string {
  const text = energyHorizonCardStyles.cssText;
  const start = text.indexOf(".ebc-delta-chip {");
  expect(
    start,
    ".ebc-delta-chip rule not found in card styles"
  ).toBeGreaterThanOrEqual(0);
  const end = text.indexOf("}", start);
  expect(end).toBeGreaterThan(start);
  return text.slice(start, end + 1);
}

function px(rule: string, prop: string): number {
  const match = rule.match(
    new RegExp(`(?:^|[\\s{;])${prop}:\\s*(\\d+(?:\\.\\d+)?)px`)
  );
  expect(match, `${prop} not found in .ebc-delta-chip rule`).not.toBeNull();
  return Number(match![1]);
}

describe("delta chip styles (.ebc-delta-chip)", () => {
  it("keeps the horizontal gap at 8 px", () => {
    expect(px(chipRule(), "gap")).toBe(8);
  });

  it("sets the wrapped-line row-gap to 3 px", () => {
    expect(px(chipRule(), "row-gap")).toBe(3);
  });

  it("row-gap is one third of the horizontal gap", () => {
    const rule = chipRule();
    const gap = px(rule, "gap");
    const rowGap = px(rule, "row-gap");
    // 8 / 3 ≈ 2.67 → 3 px (nearest whole pixel)
    expect(Math.abs(rowGap - gap / 3)).toBeLessThan(0.5);
  });
});
