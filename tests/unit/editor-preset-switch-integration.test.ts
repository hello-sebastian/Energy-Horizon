/**
 * T016 — User Story 3: Switch between standard presets and a custom time
 * window (element-level integration, SC-908-5, FR-908-G/Q/S).
 *
 * Asserts (spec US3 acceptance 1–4):
 * 1. standard → `custom`: `period_offset` removed, `time_window` initialized
 *    with the FR-908-Q defaults, the `time_window` sub-block shown and
 *    `period_offset` hidden (FR-908-G).
 * 2. `custom` → standard: `time_window` removed, `period_offset` restored to
 *    `-1`, the sub-block hidden and `period_offset` shown.
 * 3. In `custom` mode, editing `time_window.count` and saving emits
 *    `comparison_preset: custom` plus the full `time_window` block.
 * 4. The section's expanded state is preserved across the switch (the panel
 *    does not collapse as a side effect of the mode switch).
 *
 * Plus the FR-908-S edge: a `custom` config with an empty/absent
 * `time_window` opens with the documented defaults (the editor initializes
 * them; the **card** — not the editor — surfaces any invalid-window error).
 *
 * jsdom notes: `ha-select` is not defined, so the editor renders the native
 * `<select>` fallback; a preset switch is driven by setting `.value` and
 * dispatching `change`.
 */
import { describe, expect, it, beforeEach } from "vitest";
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

function trackEmits(el: EditorEl): void {
  (el as unknown as { __emitted?: CardConfig[] }).__emitted = [];
  el.addEventListener("config-changed", (e) => {
    const detail = (e as CustomEvent).detail as { config: CardConfig };
    (el as unknown as { __emitted: CardConfig[] }).__emitted!.push(detail.config);
  });
}

function emittedConfigs(el: EditorEl): CardConfig[] {
  return (el as unknown as { __emitted?: CardConfig[] }).__emitted ?? [];
}

/** Selects a `comparison_preset` value (drives the native `<select>` fallback). */
function selectPreset(el: EditorEl, value: string): void {
  const preset = el.shadowRoot!.querySelector<HTMLSelectElement>(
    "#eh-field-comparison_preset"
  )!;
  preset.value = value;
  preset.dispatchEvent(new Event("change", { bubbles: true }));
}

/** Sets `time_window.count` and commits it (drives the native `<input>` fallback). */
function setCount(el: EditorEl, value: number): void {
  const count = el.shadowRoot!.querySelector<HTMLInputElement>(
    "#eh-field-time_window-count"
  )!;
  count.value = String(value);
  count.dispatchEvent(new Event("input", { bubbles: true }));
  count.dispatchEvent(new Event("blur", { bubbles: true }));
}

function isExpanded(el: EditorEl, section: string): boolean {
  const s = el.shadowRoot!.querySelector<HTMLElement>(`[data-section="${section}"]`);
  return s?.dataset.expanded === "true";
}

const STANDARD: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  comparison_preset: "year_over_year",
  period_offset: -1
};

const CUSTOM: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  comparison_preset: "custom",
  time_window: { anchor: "start_of_month", duration: "1M", step: "1M", count: 3 }
};

describe("preset ↔ custom switch (T016, US3)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("standard → custom: removes period_offset, initializes time_window defaults (acceptance 1)", async () => {
    const el = mountEditor(STANDARD);
    await el.updateComplete;
    trackEmits(el);

    selectPreset(el, "custom");
    await el.updateComplete;

    expect(emittedConfigs(el).length).toBe(1);
    const cfg = emittedConfigs(el)[0]!;
    expect(cfg.comparison_preset).toBe("custom");
    expect(cfg.period_offset).toBeUndefined();
    expect(cfg.time_window).toEqual({
      anchor: "start_of_year",
      duration: "1y",
      step: "1y",
      count: 2
    });
  });

  it("standard → custom: shows the time_window sub-block, hides period_offset (FR-908-G)", async () => {
    const el = mountEditor(STANDARD);
    await el.updateComplete;

    selectPreset(el, "custom");
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('[data-field="time_window.anchor"]')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('[data-field="time_window.count"]')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('[data-field="period_offset"]')).toBeNull();
  });

  it("custom → standard: removes time_window, restores period_offset: -1 (acceptance 2)", async () => {
    const el = mountEditor(CUSTOM);
    await el.updateComplete;
    trackEmits(el);

    selectPreset(el, "month_over_month");
    await el.updateComplete;

    expect(emittedConfigs(el).length).toBe(1);
    const cfg = emittedConfigs(el)[0]!;
    expect(cfg.comparison_preset).toBe("month_over_month");
    expect(cfg.time_window).toBeUndefined();
    expect(cfg.period_offset).toBe(-1);
  });

  it("custom → standard: hides the time_window sub-block, shows period_offset (FR-908-G)", async () => {
    const el = mountEditor(CUSTOM);
    await el.updateComplete;

    selectPreset(el, "month_over_month");
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('[data-field="time_window.anchor"]')).toBeNull();
    expect(el.shadowRoot!.querySelector('[data-field="period_offset"]')).not.toBeNull();
  });

  it("custom mode: editing time_window.count and saving emits the full time_window block (acceptance 3)", async () => {
    const el = mountEditor(CUSTOM);
    await el.updateComplete;
    trackEmits(el);

    setCount(el, 5);
    await el.updateComplete;

    expect(emittedConfigs(el).length).toBe(1);
    const cfg = emittedConfigs(el)[0]!;
    expect(cfg.comparison_preset).toBe("custom");
    expect(cfg.time_window).toEqual({
      anchor: "start_of_month",
      duration: "1M",
      step: "1M",
      count: 5
    });
  });

  it("the section's expanded state is preserved across the switch (acceptance 4)", async () => {
    const el = mountEditor(STANDARD);
    await el.updateComplete;

    // Expand the time section via the header (the real user gesture).
    const header = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-section="time"] .section-header'
    )!;
    header.dispatchEvent(new Event("click", { bubbles: true }));
    await el.updateComplete;
    expect(isExpanded(el, "time")).toBe(true);

    selectPreset(el, "custom");
    await el.updateComplete;
    expect(isExpanded(el, "time")).toBe(true);

    selectPreset(el, "month_over_month");
    await el.updateComplete;
    expect(isExpanded(el, "time")).toBe(true);
  });

  it("custom with an empty/absent time_window opens with the documented defaults (FR-908-S)", async () => {
    const el = mountEditor({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "custom"
    });
    await el.updateComplete;

    // The editor initializes the time_window defaults on load (the card, not
    // the editor, surfaces any invalid-window error — FR-908-S).
    const anchor = el.shadowRoot!.querySelector<HTMLElement>(
      "#eh-field-time_window-anchor"
    );
    const count = el.shadowRoot!.querySelector<HTMLInputElement>(
      "#eh-field-time_window-count"
    );
    expect(anchor).not.toBeNull();
    expect(count).not.toBeNull();
    expect(count!.value).toBe("2");
  });
});
