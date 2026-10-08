/**
 * T008 — Editor smoke test.
 *
 * Asserts the registry-driven render loop produces six sections in the fixed
 * order `basic → time → layout → visuals → formatting → system`, with S1
 * (`basic`) expanded and S2–S6 collapsed by default (FR-908-E, User Story 4).
 */
import { describe, expect, it, beforeAll } from "vitest";
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
  // Construct directly: setup-dom aliases the jsdom `HTMLElement` global before
  // Lit loads, so the instance is a jsdom-realm node that `appendChild` accepts.
  const el = new EnergyHorizonCardEditor() as EditorEl;
  el.hass = makeHass();
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

const EXPECTED_ORDER = ["basic", "time", "layout", "visuals", "formatting", "system"];

describe("editor smoke (T008)", () => {
  beforeAll(() => {
    // Ensure the element is defined (importing the module registers it).
    void EnergyHorizonCardEditor;
  });

  it("renders six sections in the fixed order", async () => {
    const el = mountEditor({ type: "custom:energy-horizon-card", entity: "sensor.energy" });
    await el.updateComplete;

    const sections = [...el.shadowRoot!.querySelectorAll<HTMLElement>(".editor-section")];
    const ids = sections.map((s) => s.dataset.section);
    expect(ids).toEqual(EXPECTED_ORDER);
  });

  it("expands S1 (basic) and collapses S2–S6 by default", async () => {
    const el = mountEditor({ type: "custom:energy-horizon-card", entity: "sensor.energy" });
    await el.updateComplete;

    const sections = [...el.shadowRoot!.querySelectorAll<HTMLElement>(".editor-section")];
    for (const section of sections) {
      const id = section.dataset.section!;
      const expanded = section.dataset.expanded === "true";
      if (id === "basic") {
        expect(expanded, `basic should be expanded`).toBe(true);
      } else {
        expect(expanded, `${id} should be collapsed`).toBe(false);
      }
    }
  });

  it("renders the entity field as required in the basic section", async () => {
    const el = mountEditor({ type: "custom:energy-horizon-card", entity: "sensor.energy" });
    await el.updateComplete;

    const entityField = el.shadowRoot!.querySelector<HTMLElement>('[data-field="entity"]');
    expect(entityField).not.toBeNull();
    // The required marker is present for `entity`.
    expect(entityField!.querySelector(".req")).not.toBeNull();
  });

  it("renders a control for every visible field in each section", async () => {
    const el = mountEditor({ type: "custom:energy-horizon-card", entity: "sensor.energy" });
    await el.updateComplete;

    // basic section should contain its 8 fields (all visible by default).
    const basic = el.shadowRoot!.querySelector<HTMLElement>('[data-section="basic"]');
    const fields = basic!.querySelectorAll(".field");
    expect(fields.length).toBe(8);
  });

  it("opens without error on the minimal stub config", async () => {
    const el = mountEditor({ type: "custom:energy-horizon-card", entity: "" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll(".editor-section").length).toBe(6);
  });
});
