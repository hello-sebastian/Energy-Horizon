/**
 * T009 — Debounce pipeline + emit gate (FR-908-N/O, research R1/R5).
 *
 * Asserts:
 * 1. A text-field keystroke updates the displayed value immediately but the
 *    `config-changed` emit is **debounced** (300 ms) — no emit before the
 *    debounce window.
 * 2. Blurring the field **force-flushes** the pending emit.
 * 3. A `setConfig()`-driven re-render emits **nothing** (SC-908-3).
 * 4. Discrete controls (select/switch) emit **immediately**.
 * 5. The emit gate suppresses a no-op re-emit (equal config → no second emit).
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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

function emittedConfigs(el: EditorEl): CardConfig[] {
  const events = (el as unknown as { __emitted?: CardConfig[] }).__emitted ?? [];
  return events;
}

function trackEmits(el: EditorEl): void {
  (el as unknown as { __emitted?: CardConfig[] }).__emitted = [];
  el.addEventListener("config-changed", (e) => {
    const detail = (e as CustomEvent).detail as { config: CardConfig };
    (el as unknown as { __emitted: CardConfig[] }).__emitted!.push(detail.config);
  });
}

const BASE: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  title: "Energy"
};

describe("editor debounce pipeline (T009)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("debounces a text-field emit (no emit before the 300 ms window)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);

    const title = el.shadowRoot!.querySelector<HTMLInputElement>("#eh-field-title")!;
    title.value = "Renamed";
    title.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    // Displayed value updates immediately.
    expect(title.value).toBe("Renamed");
    // But no emit yet (debounced).
    expect(emittedConfigs(el).length).toBe(0);

    // Advance past the debounce window → emit fires.
    vi.advanceTimersByTime(300);
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(1);
    expect(emittedConfigs(el)[0]!.title).toBe("Renamed");
  });

  it("force-flushes the pending emit on blur (no need to wait 300 ms)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);

    const title = el.shadowRoot!.querySelector<HTMLInputElement>("#eh-field-title")!;
    title.value = "Renamed";
    title.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(0);

    // Blur flushes immediately. `focusout` is the composed event the editor
    // listens for (it crosses the ha-input shadow boundary; `blur` does not).
    title.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(1);
    expect(emittedConfigs(el)[0]!.title).toBe("Renamed");
  });

  it("a setConfig() re-render emits nothing (SC-908-3)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);

    // A passive re-render with an equivalent config must not emit.
    el.setConfig({ ...BASE });
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(0);
  });

  it("emits immediately for a discrete control (select)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);

    const preset = el.shadowRoot!.querySelector<HTMLSelectElement>("#eh-field-comparison_preset")!;
    preset.value = "month_over_month";
    preset.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;

    // Immediate — no timer advance needed.
    expect(emittedConfigs(el).length).toBe(1);
    expect(emittedConfigs(el)[0]!.comparison_preset).toBe("month_over_month");
  });

  it("the emit gate suppresses a no-op re-emit (equal config)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);

    const title = el.shadowRoot!.querySelector<HTMLInputElement>("#eh-field-title")!;
    title.value = "Renamed";
    title.dispatchEvent(new Event("input", { bubbles: true }));
    vi.advanceTimersByTime(300);
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(1);

    // Re-apply the same value → no structural delta → no second emit.
    title.value = "Renamed";
    title.dispatchEvent(new Event("input", { bubbles: true }));
    vi.advanceTimersByTime(300);
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(1);
  });

  it("emits the full config with unmodeled keys preserved (FR-908-P)", async () => {
    const el = mountEditor({ ...BASE, someUnknownKey: "keep-me" });
    await el.updateComplete;
    trackEmits(el);

    const title = el.shadowRoot!.querySelector<HTMLInputElement>("#eh-field-title")!;
    title.value = "Renamed";
    title.dispatchEvent(new Event("input", { bubbles: true }));
    vi.advanceTimersByTime(300);
    await el.updateComplete;

    const emitted = emittedConfigs(el)[0]!;
    expect(emitted.title).toBe("Renamed");
    expect((emitted as Record<string, unknown>).someUnknownKey).toBe("keep-me");
  });
});
