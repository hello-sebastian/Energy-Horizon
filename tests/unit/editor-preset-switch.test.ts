/**
 * T010 — Preset ↔ custom state cleanup (FR-908-Q, data-model.md §7).
 *
 * Asserts both directions of the `comparison_preset` family switch:
 * - standard → `custom`: removes `period_offset`, initializes `time_window`
 *   with the documented defaults, shows the `time_window` sub-block, hides
 *   `period_offset`.
 * - `custom` → standard: removes `time_window`, restores `period_offset: -1`,
 *   hides the sub-block.
 * - The section's expanded state is preserved across the switch.
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

function trackEmits(el: EditorEl): CardConfig[] {
  const out: CardConfig[] = [];
  (el as unknown as { __emitted?: CardConfig[] }).__emitted = out;
  el.addEventListener("config-changed", (e) => {
    out.push((e as CustomEvent).detail.config as CardConfig);
  });
  return out;
}

function selectPreset(el: EditorEl, value: string): void {
  const preset = el.shadowRoot!.querySelector<HTMLSelectElement>("#eh-field-comparison_preset")!;
  preset.value = value;
  preset.dispatchEvent(new Event("change", { bubbles: true }));
}

const STANDARD: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  comparison_preset: "year_over_year",
  period_offset: -1
};

describe("preset ↔ custom cleanup (T010)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("standard → custom: removes period_offset, initializes time_window defaults", async () => {
    const el = mountEditor(STANDARD);
    await el.updateComplete;
    const emitted = trackEmits(el);

    selectPreset(el, "custom");
    await el.updateComplete;

    expect(emitted.length).toBe(1);
    const cfg = emitted[0]!;
    expect(cfg.comparison_preset).toBe("custom");
    expect(cfg.period_offset).toBeUndefined();
    expect(cfg.time_window).toEqual({
      anchor: "start_of_year",
      duration: "1y",
      step: "1y",
      count: 2
    });
  });

  it("standard → custom: shows the time_window sub-block, hides period_offset", async () => {
    const el = mountEditor(STANDARD);
    await el.updateComplete;

    selectPreset(el, "custom");
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('[data-field="time_window.anchor"]')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('[data-field="time_window.count"]')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('[data-field="period_offset"]')).toBeNull();
  });

  it("custom → standard: removes time_window, restores period_offset: -1", async () => {
    const el = mountEditor({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "custom",
      time_window: { anchor: "start_of_month", duration: "1M", step: "1M", count: 3 }
    });
    await el.updateComplete;
    const emitted = trackEmits(el);

    selectPreset(el, "month_over_month");
    await el.updateComplete;

    expect(emitted.length).toBe(1);
    const cfg = emitted[0]!;
    expect(cfg.comparison_preset).toBe("month_over_month");
    expect(cfg.time_window).toBeUndefined();
    expect(cfg.period_offset).toBe(-1);
  });

  it("custom → standard: hides the time_window sub-block, shows period_offset", async () => {
    const el = mountEditor({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "custom",
      time_window: { anchor: "start_of_month", duration: "1M", step: "1M", count: 3 }
    });
    await el.updateComplete;

    selectPreset(el, "month_over_month");
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('[data-field="time_window.anchor"]')).toBeNull();
    expect(el.shadowRoot!.querySelector('[data-field="period_offset"]')).not.toBeNull();
  });

  it("preserves the section's expanded state across the switch", async () => {
    const el = mountEditor(STANDARD);
    await el.updateComplete;

    // Expand the time section.
    const timeSection = el.shadowRoot!.querySelector<HTMLElement>('[data-section="time"]')!;
    timeSection.dataset.expanded = "true";
    // Simulate the toggle handler recording the expanded state.
    (el as unknown as { _uiState: { expanded: Record<string, boolean> } })._uiState.expanded.time = true;
    await el.updateComplete;

    selectPreset(el, "custom");
    await el.updateComplete;

    const timeSectionAfter = el.shadowRoot!.querySelector<HTMLElement>('[data-section="time"]')!;
    expect(timeSectionAfter.dataset.expanded).toBe("true");
  });
});
