/**
 * T020 — User Story 5: Forecast line / panel independence (FR-908-H).
 *
 * `show_forecast` controls **only** the forecast line on the chart; the
 * `show_forecast_total_panel` control is **always enabled** (independent of
 * `show_forecast`). Asserts (spec US5 acceptance 1–3):
 * 1. `show_forecast: false` → `show_forecast_total_panel` is rendered in an
 *    **enabled** state (no cascade).
 * 2. Toggling `show_forecast` never disables or enables the control — it
 *    stays enabled in both directions.
 * 3. Saving with `show_forecast: false` emits the config as-is; the card
 *    (domain 903) hides the forecast line but keeps the Forecast | Total
 *    panel when `show_forecast_total_panel` is not `false`.
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

describe("forecast line / panel independence (T020, US5)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("show_forecast false → total panel control stays enabled (acceptance 1)", async () => {
    const el = mountEditor({ ...BASE, show_forecast: false });
    await el.updateComplete;

    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(false);
  });

  it("toggling show_forecast never disables the total panel control (acceptance 2)", async () => {
    const el = mountEditor({ ...BASE, show_forecast: true });
    await el.updateComplete;
    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(false);

    toggle(el, "show_forecast", false);
    await el.updateComplete;
    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(false);

    toggle(el, "show_forecast", true);
    await el.updateComplete;
    expect(checkbox(el, "show_forecast_total_panel").disabled).toBe(false);
  });

  it("saving with show_forecast false emits the config as-is (acceptance 3)", async () => {
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
    // The editor emits the config as-is; the card (domain 903) hides the
    // forecast line but keeps the Forecast | Total panel when
    // show_forecast_total_panel is not false.
    expect(emitted.show_forecast_total_panel).toBe(true);
  });
});
