/**
 * Preview step controls styles (909): layout (T029) — the step buttons
 * (back/forward) must stay pinned to the right edge of the controls bar with
 * a fixed, small gap between them, and the preview indication (visible only
 * while a preview is active) must not shift the buttons when it appears or
 * disappears — it is pushed to the left via `margin-right: auto` — plus the
 * disabled state (T036): dimmed, no hover, per the Home Assistant
 * disabled-button standard.
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

describe("chart controls disabled state (.ebc-chart-control:disabled)", () => {
  it("keeps the dimmed look (opacity: 0.45) of the Home Assistant disabled-button standard", () => {
    const disabled = rule(".ebc-chart-control:disabled");
    expect(disabled).toContain("opacity: 0.45");
  });

  it("blocks pointer events so a disabled control shows no hover state (FR-026)", () => {
    const disabled = rule(".ebc-chart-control:disabled");
    expect(disabled).toContain("pointer-events: none");
  });
});
