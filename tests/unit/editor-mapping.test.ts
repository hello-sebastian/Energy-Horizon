// @vitest-environment node
/**
 * Unit tests for the pure editor mapping/validation helpers (007-gui-editor-full-coverage).
 *
 * Covers:
 *  - US1 (T008): `toForm` defaults, `fromForm` ("auto" → omitted, concrete stored),
 *    unknown-select-value tolerance.
 *  - US2 (T016): `time_window` subform mapping (all-empty → key omitted; partial →
 *    only set sub-fields) and advisory validation wiring (invalid duration → error
 *    stored, config still emitted; valid → no error).
 *  - US4 (T024): every new `editor.*` key exists in all four dictionaries and
 *    `createLocalize` falls back to English (never the raw key).
 *
 * The editor module is imported for its exported pure helpers; the
 * `customElements.define` call inside the module is guarded so the import is
 * safe in a non-DOM (node) test environment.
 */
import { describe, it, expect } from "vitest";
import {
  basicSection,
  headerSection,
  forecastSection,
  timeWindowSection,
  chartStyleSection,
  localizationSection,
  dateFormatsSection,
  diagnosticsSection,
  SECTIONS,
  validateTimeWindowSection,
  validateDateFormatSection,
  type EditorSection
} from "../../src/card/energy-horizon-card-editor";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";
import { createLocalize, SUPPORTED_LANGUAGES } from "../../src/card/localize";
import type { CardConfig } from "../../src/card/types";

import enDict from "../../src/translations/en.json";
import plDict from "../../src/translations/pl.json";
import deDict from "../../src/translations/de.json";
import frDict from "../../src/translations/fr.json";

type Dict = Record<string, string>;

const ALL_SECTIONS: EditorSection[] = [
  basicSection,
  headerSection,
  forecastSection,
  timeWindowSection,
  chartStyleSection,
  localizationSection,
  dateFormatsSection,
  diagnosticsSection
];

function baseConfig(overrides: Partial<CardConfig> = {}): CardConfig {
  return {
    type: "custom:energy-horizon-card",
    entity: "sensor.power",
    comparison_preset: "year_over_year",
    ...overrides
  } as CardConfig;
}

function sectionById(id: string): EditorSection {
  const s = ALL_SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`no section ${id}`);
  return s;
}

// ---------------------------------------------------------------------------
// US1 — toForm defaults (T008)
// ---------------------------------------------------------------------------

describe("toForm defaults (US1)", () => {
  it("booleans use the card's `!== false` / explicit-false semantics", () => {
    const cfg = baseConfig(); // nothing set
    const header = sectionById("header").toForm(cfg);
    expect(header.show_title).toBe(true);
    expect(header.show_icon).toBe(true);

    const forecast = sectionById("forecast").toForm(cfg);
    expect(forecast.show_forecast).toBe(true);

    const chart = sectionById("chart_style").toForm(cfg);
    expect(chart.fill_current).toBe(true);
    expect(chart.fill_reference).toBe(false);
    expect(chart.connect_nulls).toBe(true);
    expect(chart.show_legend).toBe(false);

    const diag = sectionById("diagnostics").toForm(cfg);
    expect(diag.debug).toBe(false);

    const basic = sectionById("basic").toForm(cfg);
    expect(basic.show_comparison_summary).toBe(true);
    expect(basic.show_forecast_total_panel).toBe(true);
    expect(basic.show_narrative_comment).toBe(true);
  });

  it("explicit `false` in config is preserved (not re-defaulted to true)", () => {
    const cfg = baseConfig({ show_title: false, show_forecast: false });
    expect(sectionById("header").toForm(cfg).show_title).toBe(false);
    expect(sectionById("forecast").toForm(cfg).show_forecast).toBe(false);
  });

  it("numeric defaults: precision → 2, fill_*_opacity → 30, period_offset → -1", () => {
    const cfg = baseConfig();
    const loc = sectionById("localization").toForm(cfg);
    expect(loc.precision).toBe(2);

    const chart = sectionById("chart_style").toForm(cfg);
    expect(chart.fill_current_opacity).toBe(30);
    expect(chart.fill_reference_opacity).toBe(30);

    const tw = sectionById("time_window").toForm(cfg);
    expect(tw.period_offset).toBe(-1);
  });

  it("aggregation / language / number_format default to their UI defaults", () => {
    const cfg = baseConfig();
    const tw = sectionById("time_window").toForm(cfg);
    expect(tw.aggregation).toBe("auto");

    const loc = sectionById("localization").toForm(cfg);
    expect(loc.language).toBe("auto");
    expect(loc.number_format).toBe("system");
  });

  it("concrete config values are shown literally", () => {
    const cfg = baseConfig({
      aggregation: "week",
      language: "pl",
      number_format: "comma",
      precision: 3,
      primary_color: "var(--accent-color)"
    });
    expect(sectionById("time_window").toForm(cfg).aggregation).toBe("week");
    const loc = sectionById("localization").toForm(cfg);
    expect(loc.language).toBe("pl");
    expect(loc.number_format).toBe("comma");
    expect(loc.precision).toBe(3);
    expect(sectionById("chart_style").toForm(cfg).primary_color).toBe(
      "var(--accent-color)"
    );
  });

  it("time_window sub-fields prefill from the preset template when unset", () => {
    const cfg = baseConfig(); // year_over_year preset
    const tw = sectionById("time_window").toForm(cfg);
    expect(tw.time_window_anchor).toBe("start_of_year");
    expect(tw.time_window_duration).toBe("1y");
    expect(tw.time_window_step).toBe("1y");
    expect(tw.time_window_count).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// US1 — fromForm (T008)
// ---------------------------------------------------------------------------

describe("fromForm (US1)", () => {
  it("`auto` aggregation → key omitted (undefined); concrete stored literally", () => {
    const tw = sectionById("time_window");
    const autoPatch = tw.fromForm({ aggregation: "auto" });
    expect(autoPatch.aggregation).toBeUndefined();

    const weekPatch = tw.fromForm({ aggregation: "week" });
    expect(weekPatch.aggregation).toBe("week");
  });

  it("`auto` language → omitted; concrete stored; number_format stored", () => {
    const loc = sectionById("localization");
    expect(loc.fromForm({ language: "auto" }).language).toBeUndefined();
    expect(loc.fromForm({ language: "de" }).language).toBe("de");
    expect(loc.fromForm({ number_format: "comma" }).number_format).toBe("comma");
    expect(loc.fromForm({ precision: 4 }).precision).toBe(4);
  });

  it("empty text fields are omitted (not stored as empty strings)", () => {
    const chart = sectionById("chart_style");
    expect(chart.fromForm({ primary_color: "" }).primary_color).toBeUndefined();

    const df = sectionById("date_formats");
    expect(df.fromForm({ x_axis_format: "" }).x_axis_format).toBeUndefined();
    expect(df.fromForm({ tooltip_format: "" }).tooltip_format).toBeUndefined();
  });

  it("booleans are stored literally (including explicit false)", () => {
    const header = sectionById("header");
    expect(header.fromForm({ show_title: false }).show_title).toBe(false);
    expect(header.fromForm({ show_title: true }).show_title).toBe(true);
  });

  it("unknown select value is preserved in the emitted config (display-only mapping)", () => {
    // A typo/unknown value in YAML must survive a Visual edit + save (FR-013).
    const tw = sectionById("time_window");
    const patch = tw.fromForm({ aggregation: "not_a_real_value" });
    expect(patch.aggregation).toBe("not_a_real_value");
  });
});

// ---------------------------------------------------------------------------
// US2 — time_window subform (T016)
// ---------------------------------------------------------------------------

describe("time_window subform (US2)", () => {
  it("all-empty sub-fields → `time_window` key omitted entirely (preset applies)", () => {
    const tw = sectionById("time_window");
    const patch = tw.fromForm({
      time_window_anchor: "",
      time_window_offset: "",
      time_window_duration: "",
      time_window_step: "",
      time_window_count: undefined,
      time_window_aggregation: "auto"
    });
    expect(patch.time_window).toBeUndefined();
  });

  it("partial override → only the set sub-fields appear in the object", () => {
    const tw = sectionById("time_window");
    const patch = tw.fromForm({
      time_window_anchor: "start_of_month",
      time_window_offset: "",
      time_window_duration: "1M",
      time_window_step: "",
      time_window_count: 3,
      time_window_aggregation: "auto"
    });
    expect(patch.time_window).toEqual({
      anchor: "start_of_month",
      duration: "1M",
      count: 3
    });
  });

  it("untouched sub-fields (equal to preset) are omitted to keep YAML minimal", () => {
    const cfg = baseConfig(); // year_over_year preset: anchor start_of_year, 1y/1y, count 2
    const tw = sectionById("time_window");
    // Feed back exactly what toForm produced (i.e. the user changed nothing).
    const form = tw.toForm(cfg);
    const patch = tw.fromForm(form);
    expect(patch.time_window).toBeUndefined();
  });

  it("advisory validation: invalid duration → error stored, config still emitted", () => {
    const editor = new EnergyHorizonCardEditor();
    editor.setConfig(
      baseConfig({
        time_window: { anchor: "start_of_year", duration: "abc", step: "1y", count: 2 }
      }) as never
    );

    let emitted: unknown = null;
    editor.addEventListener("config-changed", (e) => {
      emitted = (e as CustomEvent).detail.config;
    });

    // Simulate the section change handler path: merge + validate + emit.
    const tw = sectionById("time_window");
    const form = tw.toForm(editor["_config"] as CardConfig);
    form.time_window_duration = "abc";
    const patch = tw.fromForm(form);
    (editor["_config"] as CardConfig) = {
      ...((editor["_config"] as CardConfig) ?? {}),
      ...patch
    } as CardConfig;
    validateTimeWindowSection(editor);
    editor["_emitConfigChanged"]();

    // Inline error recorded …
    expect(editor["_fieldErrors"].time_window).toBeTruthy();
    // … but the config was still emitted (never blocked).
    expect(emitted).toBeTruthy();
    expect((emitted as CardConfig).time_window?.duration).toBe("abc");
  });

  it("advisory validation: valid merged window → no error", () => {
    const editor = new EnergyHorizonCardEditor();
    editor.setConfig(
      baseConfig({
        time_window: { anchor: "start_of_year", duration: "1y", step: "1y", count: 2 }
      }) as never
    );
    validateTimeWindowSection(editor);
    expect(editor["_fieldErrors"].time_window).toBeNull();
  });

  it("date-format validation: invalid Luxon pattern → inline error; valid → none", () => {
    const editor = new EnergyHorizonCardEditor();
    editor.setConfig(baseConfig() as never);

    (editor["_config"] as CardConfig).x_axis_format = "not a luxon pattern!!";
    validateDateFormatSection(editor);
    expect(editor["_fieldErrors"].x_axis_format).toBeTruthy();

    (editor["_config"] as CardConfig).x_axis_format = "LLL yyyy";
    validateDateFormatSection(editor);
    expect(editor["_fieldErrors"].x_axis_format).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// US1 — setConfig resets ephemeral state (T013)
// ---------------------------------------------------------------------------

describe("setConfig resets ephemeral state (US1)", () => {
  it("resets _openSections and _fieldErrors", () => {
    const editor = new EnergyHorizonCardEditor();
    editor["_openSections"].add("time_window");
    editor["_fieldErrors"].time_window = "boom";

    editor.setConfig(baseConfig() as never);

    expect(editor["_openSections"].size).toBe(0);
    expect(Object.keys(editor["_fieldErrors"])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Section model sanity (US1)
// ---------------------------------------------------------------------------

describe("section model (US1)", () => {
  it("defines exactly 8 sections with the expected advanced flags", () => {
    expect(SECTIONS).toHaveLength(8);
    const byId = Object.fromEntries(SECTIONS.map((s) => [s.id, s.advanced]));
    expect(byId).toEqual({
      basic: false,
      header: false,
      forecast: false,
      time_window: true,
      chart_style: true,
      localization: true,
      date_formats: true,
      diagnostics: true
    });
  });

  it("every section has a schema, a labelKey, and toForm/fromForm", () => {
    for (const s of SECTIONS) {
      expect(s.id).toBeTruthy();
      expect(s.labelKey).toMatch(/^editor\.section\./);
      expect(Array.isArray(s.schema)).toBe(true);
      expect(s.schema.length).toBeGreaterThan(0);
      expect(typeof s.toForm).toBe("function");
      expect(typeof s.fromForm).toBe("function");
    }
  });
});

// ---------------------------------------------------------------------------
// US4 — i18n coverage + fallback (T024)
// ---------------------------------------------------------------------------

describe("editor i18n (US4)", () => {
  const NEW_EDITOR_KEYS = [
    // field labels
    "editor.show_title",
    "editor.icon",
    "editor.show_icon",
    "editor.aggregation",
    "editor.period_offset",
    "editor.show_forecast",
    "editor.fill_current",
    "editor.fill_reference",
    "editor.fill_current_opacity",
    "editor.fill_reference_opacity",
    "editor.primary_color",
    "editor.connect_nulls",
    "editor.show_legend",
    "editor.language",
    "editor.number_format",
    "editor.precision",
    "editor.x_axis_format",
    "editor.tooltip_format",
    "editor.debug",
    "editor.time_window_anchor",
    "editor.time_window_offset",
    "editor.time_window_duration",
    "editor.time_window_step",
    "editor.time_window_count",
    "editor.time_window_aggregation",
    // section titles
    "editor.section.header",
    "editor.section.comparison",
    "editor.section.time_window",
    "editor.section.forecast",
    "editor.section.chart_style",
    "editor.section.localization",
    "editor.section.date_formats",
    "editor.section.diagnostics",
    // options
    "editor.aggregation.auto",
    "editor.aggregation.hour",
    "editor.aggregation.day",
    "editor.aggregation.week",
    "editor.aggregation.month",
    "editor.number_format.comma",
    "editor.number_format.decimal",
    "editor.number_format.language",
    "editor.number_format.system",
    "editor.language.auto",
    "editor.language.en",
    "editor.language.pl",
    "editor.language.de",
    "editor.language.fr",
    "editor.anchor.start_of_year",
    "editor.anchor.start_of_month",
    "editor.anchor.start_of_week",
    "editor.anchor.start_of_day",
    "editor.anchor.start_of_hour",
    "editor.anchor.now",
    // errors
    "editor.error.time_window",
    "editor.error.format"
  ];

  const dicts: Array<[string, Dict]> = [
    ["en", enDict as Dict],
    ["pl", plDict as Dict],
    ["de", deDict as Dict],
    ["fr", frDict as Dict]
  ];

  it("SUPPORTED_LANGUAGES lists the four loaded dictionaries", () => {
    expect([...SUPPORTED_LANGUAGES].sort()).toEqual(["de", "en", "fr", "pl"]);
  });

  it("every new editor.* key exists in all four dictionaries", () => {
    for (const [lang, dict] of dicts) {
      const missing = NEW_EDITOR_KEYS.filter((k) => !dict[k]);
      expect(missing, `missing in ${lang}`).toEqual([]);
    }
  });

  it("all four dictionaries share the same editor.* key set (no drift)", () => {
    const keySets = dicts.map(
      ([, d]) => new Set(Object.keys(d).filter((k) => k.startsWith("editor.")))
    );
    const [en] = keySets;
    for (const set of keySets) {
      expect(set).toEqual(en);
    }
  });

  it("createLocalize falls back to English (never the raw key) for a missing key", () => {
    // Pick a key that exists in en but is absent from a non-English dict, if any.
    const enKeys = Object.keys(enDict as Dict);
    const missingInPl = enKeys.filter((k) => !(k in (plDict as Dict)));
    if (missingInPl.length > 0) {
      const key = missingInPl[0]!;
      const localize = createLocalize("pl");
      const out = localize(key);
      expect(out).toBe((enDict as Dict)[key]); // English fallback, not the raw key
      expect(out).not.toBe(key);
    } else {
      // Dictionaries are in lockstep (enforced by the "no drift" test above),
      // so no real key is missing from pl. Simulate the fallback by requesting
      // a language with no loaded dictionary: it must resolve through the
      // English fallback (never the raw key) for a key that exists in English.
      const out = createLocalize("xx")("editor.show_title");
      expect(out).toBe(createLocalize("en")("editor.show_title"));
      expect(out).not.toBe("editor.show_title");
    }
  });
});
