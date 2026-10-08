/**
 * T028 — Accessibility (Constitution IV).
 *
 * Asserts:
 *  1. Every rendered control carries an **accessible name** — a localized
 *     `<label>` associated via `for`/`id` (not a raw `editor.*` key fallback).
 *  2. Sections are **keyboard-operable**: the (fallback) section header is a
 *     focusable `role="button"` with `tabindex="0"` and `aria-expanded`, and
 *     Enter / Space toggle the section.
 *  3. A **disabled dependent control** (`show_forecast_total_panel` when
 *     `show_forecast` is off) exposes a `disabled` state to assistive tech.
 *
 * jsdom notes:
 *  - `ha-expansion-panel` / `ha-switch` / `ha-select` are not defined, so the
 *    editor renders the standard-control fallbacks (`<div>` panel, `<input>`,
 *    `<select>`). The accessibility contract is identical for both paths: the
 *    `<label for>` association, the `role`/`tabindex`/`aria-expanded` header,
 *    and the `disabled` attribute are all present in the fallback.
 *  - The section body stays in the DOM when collapsed (hidden), so every
 *    field control is queryable regardless of expansion state.
 */
import { describe, expect, it, afterEach } from "vitest";
import "../helpers/setup-dom";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig, CardConfigInput } from "../../src/card/types";

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

const BASE: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  title: "Energy"
};

describe("editor accessibility (T028, Constitution IV)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("every rendered control has an accessible name via <label> association", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;

    const fieldDivs = el.shadowRoot!.querySelectorAll(".field");
    const controls = el.shadowRoot!.querySelectorAll<HTMLElement>(
      "input[id^='eh-field-'], select[id^='eh-field-']"
    );

    // Every field renders exactly one control (and vice versa).
    expect(controls.length).toBe(fieldDivs.length);
    expect(controls.length).toBeGreaterThan(0);

    for (const control of Array.from(controls)) {
      const id = control.id;
      const label = el.shadowRoot!.querySelector<HTMLLabelElement>(
        `label[for="${id}"]`
      );
      expect(label, `control #${id} should have an associated <label>`).not.toBeNull();
      const text = label!.textContent?.trim() ?? "";
      expect(
        text.length,
        `the <label> for #${id} should be non-empty`
      ).toBeGreaterThan(0);
      // Localized, not a raw i18n key fallback.
      expect(
        text.startsWith("editor."),
        `the <label> for #${id} should be localized (got "${text}")`
      ).toBe(false);
    }
  });

  it("sections are keyboard-operable (role=button, tabindex=0, Enter/Space toggle)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;

    const header = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-section="time"] .section-header'
    )!;
    expect(header).not.toBeNull();
    expect(header.getAttribute("role")).toBe("button");
    expect(header.getAttribute("tabindex")).toBe("0");
    // "time" is collapsed by default.
    expect(header.getAttribute("aria-expanded")).toBe("false");

    // Keyboard: Enter toggles the section open.
    header.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
    await el.updateComplete;
    expect(header.getAttribute("aria-expanded")).toBe("true");

    // Keyboard: Space toggles it back closed.
    header.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true })
    );
    await el.updateComplete;
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it("a disabled dependent control exposes a disabled state to assistive tech", async () => {
    const el = mountEditor({ ...BASE, show_forecast: false });
    await el.updateComplete;

    const panel = el.shadowRoot!.querySelector<HTMLInputElement>(
      "#eh-field-show_forecast_total_panel"
    )!;
    expect(panel).not.toBeNull();
    // The `disabled` attribute is exposed to assistive tech.
    expect(panel.hasAttribute("disabled")).toBe(true);
    expect(panel.disabled).toBe(true);

    // The parent control (show_forecast) is enabled.
    const forecast = el.shadowRoot!.querySelector<HTMLInputElement>(
      "#eh-field-show_forecast"
    )!;
    expect(forecast.hasAttribute("disabled")).toBe(false);
  });

  it("re-enabling the parent re-enables the dependent control", async () => {
    const el = mountEditor({ ...BASE, show_forecast: false });
    await el.updateComplete;

    const panel = el.shadowRoot!.querySelector<HTMLInputElement>(
      "#eh-field-show_forecast_total_panel"
    )!;
    expect(panel.hasAttribute("disabled")).toBe(true);

    // Turn show_forecast back on.
    const forecast = el.shadowRoot!.querySelector<HTMLInputElement>(
      "#eh-field-show_forecast"
    )!;
    forecast.checked = true;
    forecast.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;

    expect(panel.hasAttribute("disabled")).toBe(false);
  });
});
