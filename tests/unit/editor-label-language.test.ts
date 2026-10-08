/**
 * T011 — FR-908-X label language chain.
 *
 * The label language is recomputed from the **current** config on each render:
 *   (1) card `language` field if set (and a dictionary exists);
 *   (2) else `hass.locale.language`;
 *   (3) else the card's existing fallback (`en`).
 *
 * Asserts:
 * - a config with `language: "pl"` renders labels in Polish;
 * - a live edit of the `language` field re-labels the whole form (no cached
 *   language from editor open);
 * - with no `language` field, the chain falls back to `hass.locale.language`.
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

function makeHass(language = "en"): HomeAssistant {
  return {
    language,
    locale: { language, number_format: "language" },
    config: { time_zone: "UTC" },
    states: {},
    connection: { sendMessagePromise: async () => ({}) }
  } as HomeAssistant;
}

function mountEditor(config: CardConfigInput, hass?: HomeAssistant): EditorEl {
  const el = new EnergyHorizonCardEditor() as EditorEl;
  el.hass = hass ?? makeHass();
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

function basicSectionLabel(el: EditorEl): string {
  const section = el.shadowRoot!.querySelector<HTMLElement>('[data-section="basic"]')!;
  // The section title lives in the clickable header (`.section-header` in the
  // `<div>` fallback, `slot="title"` in `ha-expansion-panel`).
  const header =
    section.querySelector(".section-header") ??
    section.querySelector('[slot="title"]') ??
    section;
  return (header.textContent ?? "").trim();
}

const BASE: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy"
};

describe("label language chain (T011)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders labels in the card `language` when set", async () => {
    const el = mountEditor({ ...BASE, language: "pl" });
    await el.updateComplete;
    expect(basicSectionLabel(el)).toBe("Podstawowe");
  });

  it("falls back to hass.locale.language when the card language is unset", async () => {
    const el = mountEditor(BASE, makeHass("de"));
    await el.updateComplete;
    expect(basicSectionLabel(el)).toBe("Grundlegend");
  });

  it("re-labels the whole form live when the language field changes", async () => {
    const el = mountEditor({ ...BASE, language: "pl" });
    await el.updateComplete;
    expect(basicSectionLabel(el)).toBe("Podstawowe");

    // Edit the language field to German.
    const language = el.shadowRoot!.querySelector<HTMLInputElement>("#eh-field-language")!;
    language.value = "de";
    language.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    // The form re-labels live (no cached language from editor open).
    expect(basicSectionLabel(el)).toBe("Grundlegend");
  });

  it("re-labels back to English when the language field is cleared", async () => {
    const el = mountEditor({ ...BASE, language: "pl" });
    await el.updateComplete;
    expect(basicSectionLabel(el)).toBe("Podstawowe");

    const language = el.shadowRoot!.querySelector<HTMLInputElement>("#eh-field-language")!;
    language.value = "";
    language.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    // Cleared → falls back to hass.locale.language (en).
    expect(basicSectionLabel(el)).toBe("Basic");
  });
});
