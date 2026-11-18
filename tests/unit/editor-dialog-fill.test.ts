/**
 * T068 — SC-908-10: the editor responsively fills the height of the HA card
 * editor dialog (FR-908-AC / FR-908-AD).
 *
 * jsdom has no layout, so the fill contract is verified declaratively: the
 * test reads the CSS text from the editor's `static styles` block and asserts
 * the flex chain that lets the scrollable area (visual-mode `.sections` /
 * YAML-mode textarea) fill the whole remaining height of the dialog pane,
 * bounded by a viewport-relative cap derived from the documented HA dialog
 * geometry (research R14) instead of the former fixed `max-height: 60vh`:
 *
 *  - `.editor` is a flex column capped at `calc(100vh - 284px)`;
 *  - `.toggle-row` (Visual/YAML header) never shrinks;
 *  - `.sections` (the visual-mode scroll container — the FR-908-M scroll
 *    anchor keeps targeting it) grows to fill the remaining height and
 *    scrolls internally;
 *  - the YAML-mode textarea (`.yaml-editor`) grows to fill the same space
 *    and keeps its `min-height: 200px` floor.
 */
import { describe, expect, it } from "vitest";
import "../helpers/setup-dom";
import { CSSResult } from "lit";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";

/** The editor's single `static styles` block as plain CSS text. */
function cssText(): string {
  return (EnergyHorizonCardEditor.styles as CSSResult).cssText;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The declaration block of the top-level rule for `selector`. The editor's
 * style block is flat CSS (no nesting), so the first `{...}` block that
 * directly follows the selector is its declarations.
 */
function ruleFor(selector: string): string {
  const m = cssText().match(
    new RegExp(`${escapeRe(selector)}\\s*\\{([^}]*)\\}`)
  );
  expect(m, `no rule for "${selector}" in the editor styles`).not.toBeNull();
  return m![1]!;
}

describe("T068 — editor dialog height fill (FR-908-AC/AD, SC-908-10)", () => {
  it(".editor is a flex column capped at calc(100vh - 284px) (R14 derivation)", () => {
    const rule = ruleFor(".editor");
    expect(rule).toContain("display: flex");
    expect(rule).toContain("flex-direction: column");
    expect(rule).toContain("max-height: calc(100vh - 284px)");
  });

  it(".toggle-row is a fixed-height header (flex: 0 0 auto)", () => {
    const rule = ruleFor(".toggle-row");
    expect(rule).toContain("flex: 0 0 auto");
  });

  it(".sections fills the remaining height and scrolls internally, with no vh fraction", () => {
    const rule = ruleFor(".sections");
    expect(rule).toContain("overflow-y: auto");
    expect(rule).toContain("min-height: 0");
    expect(rule).toContain("flex: 1 1 auto");
    // The fixed `max-height: 60vh` cap is gone — no viewport fraction at all.
    expect(rule).not.toContain("60vh");
    expect(rule).not.toContain("vh");
  });

  it(".yaml-editor (YAML-mode textarea) fills the remaining height and keeps its 200px floor", () => {
    const rule = ruleFor(".yaml-editor");
    expect(rule).toContain("flex: 1 1 auto");
    expect(rule).toContain("min-height: 200px");
  });
});
