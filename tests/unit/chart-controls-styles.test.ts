/**
 * Preview step controls layout (909 T029).
 *
 * The step buttons (back/forward) must stay pinned to the right edge of the
 * controls bar with a fixed, small gap between them. The preview indication
 * (visible only while a preview is active) must not shift the buttons when it
 * appears or disappears — it is pushed to the left via `margin-right: auto`.
 */
import { describe, expect, it } from "vitest";
import { energyHorizonCardStyles } from "../../src/card/energy-horizon-card-styles";

function rule(selector: string): string {
  const text = energyHorizonCardStyles.cssText;
  const start = text.indexOf(`${selector} {`);
  expect(start, `${selector} rule not found in card styles`).toBeGreaterThanOrEqual(0);
  const end = text.indexOf("}", start);
  expect(end).toBeGreaterThan(start);
  return text.slice(start, end + 1);
}

describe("chart controls styles (.ebc-chart-controls / .ebc-preview-indication)", () => {
  it("pins the step buttons to the right edge (justify-content: flex-end)", () => {
    const controls = rule(".ebc-chart-controls");
    expect(controls).toContain("justify-content: flex-end");
    expect(controls).not.toContain("space-between");
  });

  it("keeps a fixed 4px gap between the step buttons", () => {
    const controls = rule(".ebc-chart-controls");
    const match = controls.match(/(?:^|[\s{;])gap:\s*(\d+(?:\.\d+)?)px/);
    expect(match, "gap not found in .ebc-chart-controls rule").not.toBeNull();
    expect(Number(match![1])).toBe(4);
  });

  it("pushes the preview indication to the left (margin-right: auto)", () => {
    const indication = rule(".ebc-preview-indication");
    expect(indication).toContain("margin-right: auto");
  });
});
