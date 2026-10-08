/**
 * T020 — User Story 5: Cascading and dependent controls (FR-908-H).
 *
 * The `show_forecast_total_panel` descriptor carries
 * `disabledWhen: (cfg) => cfg.show_forecast === false`, applied uniformly by
 * the registry-driven render loop (research R11). Asserts (spec US5
 * acceptance 1–3):
 * 1. `show_forecast: true` → `show_forecast_total_panel` enabled; toggling
 *    `show_forecast` to `false` → the dependent control renders disabled.
 * 2. Toggling `show_forecast` back to `true` → the dependent control
 *    re-enables.
 * 3. Saving with `show_forecast: false` keeps the emitted config consistent
 *    with domain 903 gating (the editor emits the config as-is; the card
 *    omits the Forecast | Total panel when `show_forecast` is false).
 *
 * jsdom notes: `ha-switch` is not defined, so booleans render as native
 * `<input type="checkbox">`; the `disabled` attribute is the disabled state.
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
  __emitted?: CardConfigInput[];
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
  el.__emitted = [];
  el.addEventListener("config-changed", (e) => {
    el.__emitted!.push((e as CustomEvent).detail.config);
  });
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

function checkbox(el: EditorEl, key: string): HTMLInputElement {
  return el.shadowRoot!.querySelector<HTMLInputElement>(
    `#eh-field-${key}`
  )!;
}

/** Toggles a boolean control via the real user gesture (change event). */
function toggle(el: EditorEl, key: string, checked: boolean): void {
  const input = checkbox(el, key);
  input.checked = checked;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

const BASE: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy"
};

describe("forecast cascade (T020, US5)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("show_forecast true → total panel enabled; toggling show_forecast off disables it (acceptance 1)", async () => {
    const el = mountEditor({ ...BASE, show_forecast: true });
    await el.updateComplete;

    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(false);

    toggle(el, "show_forecast", false);
    await el.updateComplete;

    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(true);
  });

  it("toggling show_forecast back on re-enables the total panel (acceptance 2)", async () => {
    const el = mountEditor({ ...BASE, show_forecast: false });
    await el.updateComplete;
    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(true);

    toggle(el, "show_forecast", true);
    await el.updateComplete;

    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(false);
  });

  it("saving with show_forecast false emits a config consistent with domain 903 gating (acceptance 3)", async () => {
    const el = mountEditor({
      ...BASE,
      show_forecast: true,
      show_forecast_total_panel: true
    });
    await el.updateComplete;

    // A discrete (boolean) edit emits immediately.
    toggle(el, "show_forecast", false);
    await el.updateComplete;

    const emitted = el.__emitted![el.__emitted!.length - 1];
    expect(emitted.show_forecast).toBe(false);
    // The editor emits the config as-is; the card (domain 903) omits the
    // Forecast | Total panel when show_forecast is false.
    expect(emitted.show_forecast_total_panel).toBe(true);
  });
});
