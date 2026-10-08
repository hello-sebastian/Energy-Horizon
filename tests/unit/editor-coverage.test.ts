/**
 * T012 — User Story 1: Configure the whole card without touching YAML.
 *
 * Asserts (spec US1 acceptance):
 * 1. A config exercising **every** FR-908-D parameter opens with every value
 *    pre-filled in the matching control of the correct section (acceptance 1).
 * 2. A minimal config (`entity` + `comparison_preset` only) renders every
 *    optional control at its documented default (or empty where the default is
 *    adaptive/inherit) with no spurious error (acceptance 3).
 * 3. A before/after diff of a full round-trip (open → edit one control →
 *    save) loses **zero** keys: every key present before the session is
 *    present after with an equal value, plus the edited value (acceptance 4,
 *    SC-908-1).
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import "../helpers/setup-dom";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";
import {
  FIELD_REGISTRY,
  resolveFieldValue
} from "../../src/card/editor/field-registry";
import { EMIT_DEBOUNCE_MS } from "../../src/card/editor/config-merge";
import { normalizeForLoad } from "../../src/card/editor/config-normalize";
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

/** The rendered control for a registry field (null when hidden). */
function controlFor(el: EditorEl, key: string): HTMLElement | null {
  const id = `eh-field-${key.replace(/\./g, "-")}`;
  return el.shadowRoot!.querySelector<HTMLElement>(`#${id}`);
}

/** The rendered value of a control, normalized to a string. */
function controlValue(el: EditorEl, key: string): string {
  const el2 = controlFor(el, key);
  if (!el2) {
    throw new Error(`control for ${key} not found (hidden?)`);
  }
  // Duck-typed: the jsdom shim does not expose `HTMLInputElement` globally.
  const input = el2 as HTMLInputElement;
  if (input.type === "checkbox") {
    return input.checked ? "true" : "false";
  }
  return input.value;
}

/** The section id that currently renders the field (null when hidden). */
function sectionOf(el: EditorEl, key: string): string | null {
  const el2 = controlFor(el, key);
  if (!el2) {
    return null;
  }
  const section = el2.closest<HTMLElement>(".editor-section");
  return section?.dataset.section ?? null;
}

/**
 * A config exercising **every** FR-908-D parameter (all 33 registry fields),
 * in `custom` mode so the `time_window.*` sub-fields are visible, plus an
 * unknown key (`custom_extra`) that must survive the round-trip.
 */
const FULL_CONFIG: CardConfigInput = {
  type: "custom:energy-horizon-card",
  // S1 — Basic
  entity: "sensor.energy",
  title: "Energy",
  show_title: true,
  icon: "mdi:flash",
  show_icon: true,
  comparison_preset: "custom",
  interpretation: "consumption",
  neutral_interpretation: 2,
  // S2 — Time & Aggregation
  aggregation: "day",
  time_window: {
    anchor: "start_of_month",
    duration: "1M",
    step: "1M",
    count: 3,
    offset: "-1M"
  },
  // S3 — Layout & Visibility
  show_comparison_summary: true,
  show_forecast: false,
  show_forecast_total_panel: true,
  show_narrative_comment: true,
  // S4 — Visuals
  primary_color: "#ff0000",
  fill_current: true,
  fill_current_opacity: 45,
  fill_reference: false,
  fill_reference_opacity: 20,
  connect_nulls: true,
  show_legend: true,
  // S5 — Formatting & Axis
  precision: 3,
  force_prefix: "k",
  number_format: "comma",
  language: "pl",
  x_axis_format: "dd LLL",
  tooltip_format: "dd LLL yyyy",
  // S6 — System & Debug
  debug: true,
  // Unknown / future key — must survive the round-trip (FR-908-P).
  custom_extra: "keep-me"
};

/** Minimal config: `entity` + `comparison_preset` only (spec US1 acceptance 3). */
const MINIMAL_CONFIG: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  comparison_preset: "year_over_year"
};

describe("editor coverage (T012, US1)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("pre-fills every FR-908-D parameter in its matching control and section (acceptance 1)", async () => {
    const el = mountEditor(FULL_CONFIG);
    await el.updateComplete;

    // Every field visible in `custom` mode renders (32 of 33: `period_offset`
    // is hidden in `custom` mode, the five `time_window.*` fields are shown).
    const loadedFull = normalizeForLoad(FULL_CONFIG);
    const expectedVisible = FIELD_REGISTRY.filter(
      (f) => !f.visibleWhen || f.visibleWhen(loadedFull)
    ).length;
    const fieldCount = el.shadowRoot!.querySelectorAll(".field").length;
    expect(fieldCount).toBe(expectedVisible);

    for (const field of FIELD_REGISTRY) {
      // `period_offset` is hidden in `custom` mode (FR-908-G) — nothing to assert.
      if (field.visibleWhen && !field.visibleWhen(loadedFull)) {
        expect(controlFor(el, field.key), `${field.key} should be hidden`).toBeNull();
        continue;
      }

      const expected = resolveFieldValue(field, loadedFull);
      const expectedStr =
        expected === undefined || expected === null
          ? ""
          : String(expected);

      // The control exists and lives in the field's declared section.
      expect(sectionOf(el, field.key), `section of ${field.key}`).toBe(
        field.section
      );
      // The control is pre-filled with the config value.
      expect(controlValue(el, field.key), `value of ${field.key}`).toBe(
        expectedStr
      );
    }
  });

  it("renders every optional control at its documented default on a minimal config, with no spurious error (acceptance 3)", async () => {
    const el = mountEditor(MINIMAL_CONFIG);
    await el.updateComplete;

    const loaded = normalizeForLoad(MINIMAL_CONFIG);
    for (const field of FIELD_REGISTRY) {
      // `time_window.*` is hidden in standard mode — nothing to assert.
      if (field.visibleWhen && !field.visibleWhen(loaded)) {
        expect(controlFor(el, field.key), `${field.key} should be hidden`).toBeNull();
        continue;
      }

      const expected = resolveFieldValue(field, loaded);
      const expectedStr =
        expected === undefined || expected === null
          ? ""
          : String(expected);

      expect(controlValue(el, field.key), `default of ${field.key}`).toBe(
        expectedStr
      );
    }

    // No spurious error anywhere in the form.
    expect(el.shadowRoot!.querySelector(".error")).toBeNull();
    // All six sections still render.
    expect(el.shadowRoot!.querySelectorAll(".editor-section").length).toBe(6);
  });

  it("round-trips a full config with zero keys lost (acceptance 4, SC-908-1)", async () => {
    const el = mountEditor(FULL_CONFIG);
    await el.updateComplete;
    trackEmits(el);

    // Edit one control (the `title` text field) and flush the debounced emit.
    const title = controlFor(el, "title") as HTMLInputElement;
    title.value = "Renamed Energy";
    title.dispatchEvent(new Event("input", { bubbles: true }));
    vi.advanceTimersByTime(EMIT_DEBOUNCE_MS);
    await el.updateComplete;

    expect(emittedConfigs(el).length).toBe(1);
    const emitted = emittedConfigs(el)[0]!;

    // Before/after diff: every key present before the session is present
    // after with an equal value (the edited `title` excepted).
    for (const [key, value] of Object.entries(FULL_CONFIG)) {
      if (key === "title") {
        continue;
      }
      expect(
        Object.prototype.hasOwnProperty.call(emitted, key),
        `key ${key} lost in round-trip`
      ).toBe(true);
      expect(emitted[key as keyof CardConfig], `value of ${key}`).toEqual(value);
    }

    // The edited value is reflected.
    expect(emitted.title).toBe("Renamed Energy");
  });
});
