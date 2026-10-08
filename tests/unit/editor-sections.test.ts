/**
 * T018 — User Story 4: Progressive disclosure through sections (FR-908-E/F).
 *
 * Asserts (spec US4 acceptance 1–4):
 * 1. The six sections render in the fixed order
 *    `basic → time → layout → visuals → formatting → system`, with S1
 *    (`basic`) expanded and S2–S6 collapsed by default.
 * 2. Expanding "Formatting & Axis" shows exactly `precision`, `force_prefix`,
 *    `number_format`, `language`, `x_axis_format`, `tooltip_format`.
 * 3. Expanding "System & Debug" shows exactly `debug`.
 * 4. An in-session expansion survives re-renders, but a fresh editor instance
 *    reopens collapsed (default).
 *
 * jsdom notes: `ha-expansion-panel` is not defined, so the editor renders the
 * `<div>` fallback; a section is expanded by clicking its `.section-header`.
 */
import { describe, expect, it, beforeEach } from "vitest";
import "../helpers/setup-dom";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfigInput } from "../../src/card/types";

type EditorEl = EnergyHorizonCardEditor & {
  setConfig: (c: CardConfigInput) => void;
  hass: HomeAssistant;
  updateComplete: Promise<boolean>;
};

function makeHass(): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states: {},
    connection: { sendMessagePromise: async () => ({}) }
  } as HomeAssistant;
}

function mountEditor(config: CardConfigInput): EditorEl {
  const el = new EnergyHorizonCardEditor() as EditorEl;
  el.hass = makeHass();
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

const EXPECTED_ORDER = [
  "basic",
  "time",
  "layout",
  "visuals",
  "formatting",
  "system"
];

/** The `data-field` keys rendered inside a section's body. */
function fieldKeys(el: EditorEl, section: string): string[] {
  const body = el.shadowRoot!.querySelector<HTMLElement>(
    `[data-section="${section}"] .section-body`
  );
  return [...body!.querySelectorAll<HTMLElement>(".field")].map(
    (f) => f.dataset.field!
  );
}

function isExpanded(el: EditorEl, section: string): boolean {
  const s = el.shadowRoot!.querySelector<HTMLElement>(`[data-section="${section}"]`);
  return s?.dataset.expanded === "true";
}

/** Expands a section via the real user gesture (header click). */
function expandSection(el: EditorEl, section: string): void {
  const header = el.shadowRoot!.querySelector<HTMLElement>(
    `[data-section="${section}"] .section-header`
  )!;
  header.dispatchEvent(new Event("click", { bubbles: true }));
}

const MINIMAL: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy"
};

describe("editor sections (T018, US4)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the six sections in the fixed order, S1 expanded and S2–S6 collapsed (acceptance 1)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    const ids = [...el.shadowRoot!.querySelectorAll<HTMLElement>(".editor-section")].map(
      (s) => s.dataset.section
    );
    expect(ids).toEqual(EXPECTED_ORDER);

    expect(isExpanded(el, "basic")).toBe(true);
    for (const section of EXPECTED_ORDER.slice(1)) {
      expect(isExpanded(el, section), `${section} should be collapsed`).toBe(false);
    }
  });

  it("expanding Formatting & Axis shows exactly its six fields (acceptance 2)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    expandSection(el, "formatting");
    await el.updateComplete;

    expect(isExpanded(el, "formatting")).toBe(true);
    expect(fieldKeys(el, "formatting")).toEqual([
      "precision",
      "force_prefix",
      "number_format",
      "language",
      "x_axis_format",
      "tooltip_format"
    ]);
  });

  it("expanding System & Debug shows exactly `debug` (acceptance 3)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    expandSection(el, "system");
    await el.updateComplete;

    expect(isExpanded(el, "system")).toBe(true);
    expect(fieldKeys(el, "system")).toEqual(["debug"]);
  });

  it("renders each section title from its `editor.section.*` key (FR-908-E)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    // The en dictionary is the reference (FR-908-E titles).
    const expectedTitles: Record<string, string> = {
      basic: "Basic",
      time: "Time & Comparison",
      layout: "Layout",
      visuals: "Visuals",
      formatting: "Formatting",
      system: "System"
    };
    for (const section of EXPECTED_ORDER) {
      const header = el.shadowRoot!.querySelector<HTMLElement>(
        `[data-section="${section}"] .section-header`
      )!;
      expect((header.textContent ?? "").trim(), `title of ${section}`).toBe(
        expectedTitles[section]
      );
    }
  });

  it("an in-session expansion survives re-renders, but a fresh instance reopens collapsed (acceptance 4)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    // Expand a section in-session.
    expandSection(el, "visuals");
    await el.updateComplete;
    expect(isExpanded(el, "visuals")).toBe(true);

    // A passive re-render (setConfig with the same config) must preserve it.
    el.setConfig(MINIMAL);
    await el.updateComplete;
    expect(isExpanded(el, "visuals"), "in-session expansion must survive re-render").toBe(true);

    // A fresh editor instance reopens collapsed (default).
    const fresh = mountEditor(MINIMAL);
    await fresh.updateComplete;
    expect(isExpanded(fresh, "visuals"), "fresh instance must reopen collapsed").toBe(false);
  });
});
