/**
 * T022 — User Story 6: Safe handling of deprecated and unknown values
 * (FR-908-I, FR-908-V, FR-908-T, SC-908-6).
 *
 * Asserts (spec US6 acceptance 1–4 + SC-908-6):
 * 1. A config with `comparison_mode: month_over_month` and no
 *    `comparison_preset` opens with `comparison_preset` pre-filled.
 * 2. Saving emits `comparison_preset` and replaces (not duplicates) the
 *    deprecated `comparison_mode` key.
 * 3. An unknown `force_prefix` value shows an empty selection, throws no
 *    error, and does not block saving.
 * 4. `hass` absent → the editor renders in a degraded state without a
 *    JavaScript error.
 * 5. (SC-908-6) A v1.1.0 config with `comparison_mode` + YAML-only fields
 *    opens, saves with `comparison_preset`, and loses no YAML-only fields.
 *
 * jsdom notes: `ha-select` is not defined, so selects render as native
 * `<select>`; a select is "empty" when no `<option>` carries the `selected`
 * attribute.
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

function mountEditor(
  config: CardConfigInput,
  hass?: HomeAssistant
): EditorEl {
  const el = new EnergyHorizonCardEditor() as EditorEl;
  el.hass = hass;
  el.__emitted = [];
  el.addEventListener("config-changed", (e) => {
    el.__emitted!.push((e as CustomEvent).detail.config);
  });
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

function selectFor(el: EditorEl, key: string): HTMLSelectElement {
  return el.shadowRoot!.querySelector<HTMLSelectElement>(
    `#eh-field-${key}`
  )!;
}

function checkbox(el: EditorEl, key: string): HTMLInputElement {
  return el.shadowRoot!.querySelector<HTMLInputElement>(
    `#eh-field-${key}`
  )!;
}

/** A discrete (boolean) edit that produces a config delta → immediate emit. */
function triggerEmit(el: EditorEl): void {
  const input = checkbox(el, "show_forecast");
  input.checked = !input.checked;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

const BASE: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy"
};

describe("deprecated & unknown value handling (T022, US6)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("pre-fills comparison_preset from the deprecated comparison_mode on open (acceptance 1)", async () => {
    const el = mountEditor({
      ...BASE,
      comparison_mode: "month_over_month"
    });
    await el.updateComplete;

    expect(selectFor(el, "comparison_preset").value).toBe("month_over_month");
  });

  it("saving emits comparison_preset and replaces (not duplicates) comparison_mode (acceptance 2)", async () => {
    const el = mountEditor({
      ...BASE,
      comparison_mode: "month_over_month"
    });
    await el.updateComplete;

    triggerEmit(el);
    await el.updateComplete;

    const emitted = el.__emitted![el.__emitted!.length - 1];
    expect(emitted.comparison_preset).toBe("month_over_month");
    expect("comparison_mode" in emitted).toBe(false);
  });

  it("an unknown force_prefix shows an empty selection, throws no error, and does not block saving (acceptance 3)", async () => {
    const el = mountEditor({
      ...BASE,
      force_prefix: "TYPO"
    });
    await el.updateComplete;

    // No option is selected for the unknown value.
    expect(selectFor(el, "force_prefix").querySelector("option[selected]")).toBeNull();

    // Saving is not blocked: a discrete edit still emits, and the unknown
    // value is preserved verbatim (not dropped, not coerced).
    triggerEmit(el);
    await el.updateComplete;

    const emitted = el.__emitted![el.__emitted!.length - 1];
    expect(emitted.force_prefix).toBe("TYPO");
  });

  it("renders in a degraded state without a JavaScript error when hass is absent (acceptance 4)", async () => {
    const el = mountEditor(BASE, undefined);
    await el.updateComplete;

    const sections = el.shadowRoot!.querySelectorAll(".editor-section");
    expect(sections.length).toBe(6);
  });

  it("a v1.1.0 config with comparison_mode + YAML-only fields saves with comparison_preset and loses no YAML-only fields (SC-908-6)", async () => {
    const el = mountEditor({
      ...BASE,
      comparison_mode: "month_over_month",
      some_yaml_only_field: "kept",
      another_future_key: 42
    } as CardConfigInput);
    await el.updateComplete;

    triggerEmit(el);
    await el.updateComplete;

    const emitted = el.__emitted![el.__emitted!.length - 1] as Record<
      string,
      unknown
    >;
    expect(emitted.comparison_preset).toBe("month_over_month");
    expect("comparison_mode" in emitted).toBe(false);
    expect(emitted.some_yaml_only_field).toBe("kept");
    expect(emitted.another_future_key).toBe(42);
  });
});
