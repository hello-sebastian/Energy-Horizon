import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import type { TemplateResult } from "lit";
import type { HomeAssistant, HaFormSchema } from "../ha-types";
import type { ForcePrefix } from "../utils/unit-scaler";
import {
  resolveComparisonPreset,
  type CardConfig,
  type CardConfigInput,
  type ComparisonMode,
  type MergedTimeWindowConfig,
  type TimeAnchor,
  type TimeWindowYaml,
  type WindowAggregation
} from "./types";
import { createLocalize, SUPPORTED_LANGUAGES } from "./localize";
import {
  buildMergedTimeWindowConfig,
  validateMergedTimeWindowConfig,
  getPresetTemplate
} from "./time-windows";
import { validateXAxisFormat } from "./axis";

type EditorMode = "visual" | "yaml";

/** Flat `ha-form` data object (one per section). */
export type FormRecord = Record<string, unknown>;

/**
 * Data-driven descriptor of one form section (007). Each section owns a slice
 * of `CardConfig`; `toForm` applies the card's effective defaults so controls
 * always show a meaningful value, and `fromForm` maps form data back to a
 * config patch (empty/`auto` values are omitted so the card's defaults apply).
 */
export interface EditorSection {
  /** Stable section id (e.g. `time_window`). */
  id: string;
  /** Translation key for the section heading (e.g. `editor.section.time_window`). */
  labelKey: string;
  /** `true` → wrapped in `ha-expansion-panel`, collapsed by default. */
  advanced: boolean;
  /** Field descriptors (English fallback labels; localized at render time). */
  schema: ReadonlyArray<HaFormSchema>;
  /** config → flat form data, with card defaults applied. */
  toForm(config: CardConfig): FormRecord;
  /** form data → config patch (empty/`auto` values omitted). */
  fromForm(data: FormRecord, config?: Partial<CardConfig>): Partial<CardConfig>;
}

// ---------------------------------------------------------------------------
// Pure mapping helpers (unit-tested in tests/unit/editor-mapping.test.ts)
// ---------------------------------------------------------------------------

/**
 * Returns `true` when a form value should be treated as "unset" and therefore
 * omitted from the emitted config. Booleans are never empty (an unchecked
 * checkbox is an explicit `false`).
 */
function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/**
 * Maps the UI `auto` option to `undefined` (key omitted from the emitted
 * config) while preserving concrete values literally. Unknown values (a YAML
 * typo) are preserved verbatim so they survive a Visual edit + save (FR-013).
 */
function autoToUndefined(value: unknown): unknown {
  if (value === "auto") return undefined;
  return value;
}

/**
 * Builds the `time_window` object from the flat `time_window_*` form fields.
 * Sub-fields equal to the preset template are omitted (so the saved YAML stays
 * minimal and the preset fills them in); only values the user actually changed
 * are written. Returns `undefined` when nothing differs from the preset.
 */
function buildTimeWindow(
  data: FormRecord,
  config: Partial<CardConfig>
): TimeWindowYaml | undefined {
  const anchor =
    typeof data.time_window_anchor === "string" && data.time_window_anchor.trim() !== ""
      ? (data.time_window_anchor as TimeAnchor)
      : undefined;
  const offset =
    typeof data.time_window_offset === "string" && data.time_window_offset.trim() !== ""
      ? data.time_window_offset
      : undefined;
  const duration =
    typeof data.time_window_duration === "string" && data.time_window_duration.trim() !== ""
      ? data.time_window_duration
      : undefined;
  const step =
    typeof data.time_window_step === "string" && data.time_window_step.trim() !== ""
      ? data.time_window_step
      : undefined;
  const count =
    typeof data.time_window_count === "number" &&
    Number.isFinite(data.time_window_count)
      ? data.time_window_count
      : undefined;
  const aggregation =
    typeof data.time_window_aggregation === "string" && data.time_window_aggregation !== ""
      ? (autoToUndefined(data.time_window_aggregation) as
          | WindowAggregation
          | undefined)
      : undefined;

  // All sub-fields empty → the user left the window untouched; the preset
  // template fills everything, so emit no `time_window` key at all.
  if (
    anchor === undefined &&
    offset === undefined &&
    duration === undefined &&
    step === undefined &&
    count === undefined &&
    aggregation === undefined
  ) {
    return undefined;
  }

  // Determine the preset template to diff against. When the caller passes the
  // real config we use its `comparison_preset`; otherwise (e.g. a unit test
  // feeding back exactly what `toForm` produced) we infer the preset from the
  // form values so untouched sub-fields are still omitted.
  const preset = resolveTimeWindowPreset(config, {
    anchor,
    offset,
    duration,
    step,
    count,
    aggregation
  });

  const tw: TimeWindowYaml = {};
  if (anchor !== undefined && anchor !== preset.anchor) {
    tw.anchor = anchor;
  }
  if (offset !== undefined && offset !== preset.offset) {
    tw.offset = offset;
  }
  if (duration !== undefined && duration !== preset.duration) {
    tw.duration = duration;
  }
  if (step !== undefined && step !== preset.step) {
    tw.step = step;
  }
  if (count !== undefined && count !== preset.count) {
    tw.count = count;
  }
  if (aggregation !== undefined && aggregation !== preset.aggregation) {
    tw.aggregation = aggregation;
  }
  return Object.keys(tw).length > 0 ? tw : undefined;
}

/**
 * Resolves the preset template to diff the `time_window` sub-fields against.
 *
 * Prefers the card's `comparison_preset` (resolved via the card's own
 * `resolveComparisonPreset`, so an unset preset defaults to `year_over_year`).
 * When `comparison_preset` is absent from the passed config, the form values
 * themselves are inspected: if they exactly match a known preset template the
 * matching preset is used (so untouched sub-fields are omitted); otherwise the
 * default preset is used as the baseline.
 */
function resolveTimeWindowPreset(
  config: Partial<CardConfig>,
  values: TimeWindowYaml
): MergedTimeWindowConfig {
  const preset = resolveComparisonPreset(config);
  if (config.comparison_preset !== undefined) {
    return getPresetTemplate(preset, config.period_offset);
  }
  const candidates: ComparisonMode[] = [
    "year_over_year",
    "month_over_year",
    "month_over_month"
  ];
  for (const mode of candidates) {
    const template = getPresetTemplate(mode, config.period_offset);
    if (
      values.anchor === template.anchor &&
      values.offset === template.offset &&
      values.duration === template.duration &&
      values.step === template.step &&
      values.count === template.count &&
      values.aggregation === template.aggregation
    ) {
      return template;
    }
  }
  return getPresetTemplate(preset, config.period_offset);
}

// ---------------------------------------------------------------------------
// Section descriptors (8 sections; basic/header/forecast always visible)
// ---------------------------------------------------------------------------

/** `comparison` base section (id `basic` in the section model). */
export const basicSection: EditorSection = {
  id: "basic",
  labelKey: "editor.section.comparison",
  advanced: false,
  schema: [
    { name: "entity", selector: { entity: { domain: "sensor" } } },
    { name: "title", selector: { text: {} } },
    {
      name: "comparison_preset",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "year_over_year", label: "Year over year" },
            { value: "month_over_year", label: "Month over year" },
            { value: "month_over_month", label: "Month over month (consecutive)" }
          ]
        }
      }
    },
    {
      name: "force_prefix",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "auto", label: "Auto" },
            { value: "none", label: "None (raw)" },
            { value: "G", label: "G (Giga)" },
            { value: "M", label: "M (Mega)" },
            { value: "k", label: "k (Kilo)" },
            { value: "m", label: "m (milli)" },
            { value: "u", label: "µ (micro)" }
          ]
        }
      }
    },
    { name: "show_comparison_summary", selector: { boolean: {} } },
    { name: "show_forecast_total_panel", selector: { boolean: {} } },
    { name: "show_narrative_comment", selector: { boolean: {} } }
  ],
  toForm(config: CardConfig): FormRecord {
    return {
      entity: config.entity ?? "",
      title: config.title,
      comparison_preset: resolveComparisonPreset(config as CardConfigInput),
      // `auto` is a UI option: an unset prefix displays as `auto`.
      force_prefix: config.force_prefix ?? "auto",
      // Card uses `!== false` semantics → default checked.
      show_comparison_summary: config.show_comparison_summary !== false,
      show_forecast_total_panel: config.show_forecast_total_panel !== false,
      show_narrative_comment: config.show_narrative_comment !== false
    };
  },
  fromForm(data: FormRecord): Partial<CardConfig> {
    const patch: Partial<CardConfig> = {};
    if (!isEmpty(data.entity)) {
      patch.entity = data.entity as string;
    }
    if (!isEmpty(data.title)) {
      patch.title = data.title as string;
    }
    if (!isEmpty(data.comparison_preset)) {
      patch.comparison_preset = data.comparison_preset as CardConfig["comparison_preset"];
    }
    // `auto` → omitted (card auto-selects); a concrete prefix is stored literally.
    const forcePrefix = autoToUndefined(data.force_prefix);
    if (forcePrefix !== undefined && !isEmpty(forcePrefix)) {
      patch.force_prefix = forcePrefix as ForcePrefix;
    }
    patch.show_comparison_summary = data.show_comparison_summary === true;
    patch.show_forecast_total_panel = data.show_forecast_total_panel === true;
    patch.show_narrative_comment = data.show_narrative_comment === true;
    return patch;
  }
};

/** Header section: title / icon visibility. */
export const headerSection: EditorSection = {
  id: "header",
  labelKey: "editor.section.header",
  advanced: false,
  schema: [
    { name: "show_title", selector: { boolean: {} } },
    {
      name: "icon",
      selector: {
        select: {
          mode: "dropdown",
          custom_value: true,
          options: [
            { value: "auto", label: "Entity icon (auto)" },
            { value: "mdi:flash", label: "mdi:flash" },
            { value: "mdi:lightning-bolt", label: "mdi:lightning-bolt" },
            { value: "mdi:solar-power", label: "mdi:solar-power" },
            { value: "mdi:battery", label: "mdi:battery" },
            { value: "mdi:home", label: "mdi:home" },
            { value: "mdi:thermometer", label: "mdi:thermometer" }
          ]
        }
      }
    },
    { name: "show_icon", selector: { boolean: {} } }
  ],
  toForm(config: CardConfig): FormRecord {
    return {
      show_title: config.show_title !== false,
      // `auto` = "Entity icon (auto)" — the card inherits the entity's icon.
      icon: config.icon ?? "auto",
      show_icon: config.show_icon !== false
    };
  },
  fromForm(data: FormRecord): Partial<CardConfig> {
    const patch: Partial<CardConfig> = {
      show_title: data.show_title === true,
      show_icon: data.show_icon === true
    };
    // `auto` → omitted (card inherits the entity's icon); a concrete icon is
    // stored literally.
    const icon = autoToUndefined(data.icon);
    if (icon !== undefined && !isEmpty(icon)) {
      patch.icon = icon as string;
    }
    return patch;
  }
};

/** Forecast section: forecast line toggle. */
export const forecastSection: EditorSection = {
  id: "forecast",
  labelKey: "editor.section.forecast",
  advanced: false,
  schema: [{ name: "show_forecast", selector: { boolean: {} } }],
  toForm(config: CardConfig): FormRecord {
    return {
      show_forecast: config.show_forecast !== false
    };
  },
  fromForm(data: FormRecord): Partial<CardConfig> {
    return {
      show_forecast: data.show_forecast === true
    };
  }
};

/**
 * Time window section: top-level `aggregation` + `period_offset` plus the six
 * flat `time_window_*` fields mapped into the nested `CardConfig.time_window`.
 */
export const timeWindowSection: EditorSection = {
  id: "time_window",
  labelKey: "editor.section.time_window",
  advanced: true,
  schema: [
    {
      name: "aggregation",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "auto", label: "Auto" },
            { value: "hour", label: "Hour" },
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" }
          ]
        }
      }
    },
    {
      name: "period_offset",
      selector: { number: { mode: "box", step: 1 } }
    },
    {
      name: "time_window_anchor",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "start_of_year", label: "Start of year" },
            { value: "start_of_month", label: "Start of month" },
            { value: "start_of_week", label: "Start of week" },
            { value: "start_of_day", label: "Start of day" },
            { value: "start_of_hour", label: "Start of hour" },
            { value: "now", label: "Now" }
          ]
        }
      }
    },
    { name: "time_window_offset", selector: { text: {} } },
    { name: "time_window_duration", selector: { text: {} } },
    { name: "time_window_step", selector: { text: {} } },
    {
      name: "time_window_count",
      selector: { number: { min: 1, max: 24, mode: "box", step: 1 } }
    },
    {
      name: "time_window_aggregation",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "auto", label: "Auto" },
            { value: "hour", label: "Hour" },
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" }
          ]
        }
      }
    }
  ],
  toForm(config: CardConfig): FormRecord {
    const preset = getPresetTemplate(
      config.comparison_preset,
      config.period_offset
    );
    return {
      aggregation: config.aggregation ?? "auto",
      period_offset: config.period_offset ?? -1,
      time_window_anchor: config.time_window?.anchor ?? preset.anchor ?? "",
      time_window_offset: config.time_window?.offset ?? preset.offset ?? "",
      time_window_duration: config.time_window?.duration ?? preset.duration ?? "",
      time_window_step: config.time_window?.step ?? preset.step ?? "",
      time_window_count: config.time_window?.count ?? preset.count ?? 2,
      time_window_aggregation: config.time_window?.aggregation ?? "auto"
    };
  },
  fromForm(data: FormRecord, config: Partial<CardConfig> = {}): Partial<CardConfig> {
    const patch: Partial<CardConfig> = {};
    const aggregation = autoToUndefined(data.aggregation);
    if (aggregation !== undefined) {
      patch.aggregation = aggregation as WindowAggregation;
    }
    if (
      typeof data.period_offset === "number" &&
      Number.isFinite(data.period_offset)
    ) {
      patch.period_offset = data.period_offset;
    }
    const timeWindow = buildTimeWindow(data, config);
    if (timeWindow) {
      patch.time_window = timeWindow;
    }
    return patch;
  }
};

/** Chart style section: fills, opacity, color, nulls, legend. */
export const chartStyleSection: EditorSection = {
  id: "chart_style",
  labelKey: "editor.section.chart_style",
  advanced: true,
  schema: [
    { name: "fill_current", selector: { boolean: {} } },
    { name: "fill_reference", selector: { boolean: {} } },
    {
      name: "fill_current_opacity",
      selector: { number: { min: 0, max: 100, mode: "box", step: 1 } }
    },
    {
      name: "fill_reference_opacity",
      selector: { number: { min: 0, max: 100, mode: "box", step: 1 } }
    },
    { name: "primary_color", selector: { text: {} } },
    { name: "connect_nulls", selector: { boolean: {} } },
    { name: "show_legend", selector: { boolean: {} } }
  ],
  toForm(config: CardConfig): FormRecord {
    return {
      // Card: `fill_current ?? true` (default on) vs `fill_reference ?? false`
      // (default off) — so the two booleans use opposite "unset" defaults.
      fill_current: config.fill_current ?? true,
      fill_reference: config.fill_reference ?? false,
      fill_current_opacity: config.fill_current_opacity ?? 30,
      fill_reference_opacity: config.fill_reference_opacity ?? 30,
      primary_color: config.primary_color,
      connect_nulls: config.connect_nulls ?? true,
      // Card: `show_legend === true` (default off).
      show_legend: config.show_legend === true
    };
  },
  fromForm(data: FormRecord): Partial<CardConfig> {
    const patch: Partial<CardConfig> = {
      fill_current: data.fill_current === true,
      fill_reference: data.fill_reference === true,
      connect_nulls: data.connect_nulls === true,
      show_legend: data.show_legend === true
    };
    if (
      typeof data.fill_current_opacity === "number" &&
      Number.isFinite(data.fill_current_opacity)
    ) {
      patch.fill_current_opacity = data.fill_current_opacity;
    }
    if (
      typeof data.fill_reference_opacity === "number" &&
      Number.isFinite(data.fill_reference_opacity)
    ) {
      patch.fill_reference_opacity = data.fill_reference_opacity;
    }
    if (!isEmpty(data.primary_color)) {
      patch.primary_color = data.primary_color as string;
    }
    return patch;
  }
};

/** Localization & numbers section: language, number format, precision. */
export const localizationSection: EditorSection = {
  id: "localization",
  labelKey: "editor.section.localization",
  advanced: true,
  schema: [
    {
      name: "language",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "auto", label: "Auto (Home Assistant language)" },
            ...SUPPORTED_LANGUAGES.map((lang) => ({ value: lang, label: lang }))
          ]
        }
      }
    },
    {
      name: "number_format",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "system", label: "System" },
            { value: "comma", label: "Comma (1,234.56)" },
            { value: "decimal", label: "Decimal (1.234,56)" },
            { value: "language", label: "Language" }
          ]
        }
      }
    },
    {
      name: "precision",
      selector: { number: { min: 0, max: 6, mode: "box", step: 1 } }
    }
  ],
  toForm(config: CardConfig): FormRecord {
    return {
      language: config.language ?? "auto",
      number_format: config.number_format ?? "system",
      precision: config.precision ?? 2
    };
  },
  fromForm(data: FormRecord): Partial<CardConfig> {
    const patch: Partial<CardConfig> = {};
    const language = autoToUndefined(data.language);
    if (language !== undefined && !isEmpty(language)) {
      patch.language = language as string;
    }
    if (!isEmpty(data.number_format)) {
      patch.number_format = data.number_format as CardConfig["number_format"];
    }
    if (typeof data.precision === "number" && Number.isFinite(data.precision)) {
      patch.precision = data.precision;
    }
    return patch;
  }
};

/** Date formats section: Luxon patterns for the X axis and tooltip. */
export const dateFormatsSection: EditorSection = {
  id: "date_formats",
  labelKey: "editor.section.date_formats",
  advanced: true,
  schema: [
    { name: "x_axis_format", selector: { text: {} } },
    { name: "tooltip_format", selector: { text: {} } }
  ],
  toForm(config: CardConfig): FormRecord {
    return {
      x_axis_format: config.x_axis_format ?? "",
      tooltip_format: config.tooltip_format ?? ""
    };
  },
  fromForm(data: FormRecord): Partial<CardConfig> {
    const patch: Partial<CardConfig> = {};
    if (!isEmpty(data.x_axis_format)) {
      patch.x_axis_format = data.x_axis_format as string;
    }
    if (!isEmpty(data.tooltip_format)) {
      patch.tooltip_format = data.tooltip_format as string;
    }
    return patch;
  }
};

/** Diagnostics section: debug mode. */
export const diagnosticsSection: EditorSection = {
  id: "diagnostics",
  labelKey: "editor.section.diagnostics",
  advanced: true,
  schema: [{ name: "debug", selector: { boolean: {} } }],
  toForm(config: CardConfig): FormRecord {
    return {
      debug: config.debug === true
    };
  },
  fromForm(data: FormRecord): Partial<CardConfig> {
    return {
      debug: data.debug === true
    };
  }
};

/** All sections, in render order (basic, header, forecast, then advanced). */
export const SECTIONS: readonly EditorSection[] = [
  basicSection,
  headerSection,
  forecastSection,
  timeWindowSection,
  chartStyleSection,
  localizationSection,
  dateFormatsSection,
  diagnosticsSection
];

// ---------------------------------------------------------------------------
// Advisory validation (reuses the card's validators; never blocks emission)
// ---------------------------------------------------------------------------

/**
 * Re-validates the merged time window after a `time_window` section change and
 * stores a localized message in `_fieldErrors.time_window` on failure. The
 * card remains the validation authority; `config-changed` is still emitted.
 */
export function validateTimeWindowSection(
  editor: EnergyHorizonCardEditor
): void {
  const config = editor["_config"];
  if (!config) {
    return;
  }
  const merged = buildMergedTimeWindowConfig(config);
  const result = validateMergedTimeWindowConfig(merged);
  if (result.ok) {
    editor["_fieldErrors"].time_window = null;
    return;
  }
  const t = createLocalize(editor["_editorLang"]());
  const message = t(result.errorKey);
  editor["_fieldErrors"].time_window =
    message === result.errorKey ? t("editor.error.time_window") : message;
}

/**
 * Re-validates `x_axis_format` / `tooltip_format` after a `date_formats`
 * section change using the card's Luxon validator. Invalid patterns store an
 * inline error; `config-changed` is still emitted (the card shows its error
 * state until the value is fixed).
 */
export function validateDateFormatSection(
  editor: EnergyHorizonCardEditor
): void {
  const config = editor["_config"];
  if (!config) {
    return;
  }
  const t = createLocalize(editor["_editorLang"]());
  for (const field of ["x_axis_format", "tooltip_format"] as const) {
    const raw = config[field];
    if (raw === undefined || String(raw).trim() === "") {
      editor["_fieldErrors"][field] = null;
      continue;
    }
    try {
      validateXAxisFormat(String(raw).trim());
      editor["_fieldErrors"][field] = null;
    } catch {
      editor["_fieldErrors"][field] = t("editor.error.format");
    }
  }
}

// ---------------------------------------------------------------------------
// Editor component
// ---------------------------------------------------------------------------

export class EnergyHorizonCardEditor extends LitElement {
  /** Set by Lovelace; may be absent before the host wires it up. */
  @property({ attribute: false })
  accessor hass: HomeAssistant | undefined = undefined;

  private _config?: CardConfig;

  @state() private accessor _editorMode: EditorMode = "visual";

  @state() private accessor _yamlText = "";

  @state() private accessor _yamlError: string | null = null;

  /** Advanced section ids currently expanded (local only; not persisted). */
  @state() private accessor _openSections = new Set<string>();

  /** Inline validation errors keyed by field/section id. */
  @state() private accessor _fieldErrors: Record<string, string | null> = {};

  setConfig(config: CardConfigInput): void {
    // HA's `HuiElementEditor` re-invokes `setConfig` with the exact object we
    // last emitted via `config-changed` (a self-echo): it listens for
    // `config-changed`, sets its `value`, and calls `setConfig` again on this
    // same (reused) editor element. Detect that echo by object identity against
    // the config we currently hold. On a self-echo we must NOT reset the
    // ephemeral open-section state, otherwise every keystroke collapses all
    // advanced sections (FR-018). A genuinely new config object (fresh open or
    // an external change) still resets to the default collapsed state.
    const isSelfEcho = config === this._config;

    const raw = config;
    const comparison_preset = resolveComparisonPreset(raw);
    const { comparison_mode: _legacyComparisonMode, ...rest } = raw;
    void _legacyComparisonMode;
    this._config = {
      ...rest,
      comparison_preset
    } as CardConfig;
    this._editorMode = "visual";
    this._yamlError = null;
    if (!isSelfEcho) {
      // Ephemeral state resets on a fresh config (FR-018): advanced sections
      // start collapsed and no stale inline errors survive.
      this._openSections = new Set<string>();
      this._fieldErrors = {};
    }
    this.requestUpdate();
  }

  private _editorLang(): string {
    return (
      this.hass?.locale?.language ??
      (this.hass as unknown as { language?: string })?.language ??
      "en"
    );
  }

  private _computeLabel(schema: { name: string }): string {
    return createLocalize(this._editorLang())(`editor.${schema.name}`);
  }

  private _hasYamlSupport(): boolean {
    return typeof window.jsyaml !== "undefined";
  }

  private _hasExpansionPanel(): boolean {
    return (
      typeof customElements !== "undefined" &&
      customElements.get("ha-expansion-panel") !== undefined
    );
  }

  /**
   * Localizes a section's static schema (English fallback labels) for the
   * current language. Select option labels resolve via `createLocalize` at
   * build time so no raw key is ever rendered (005 pattern).
   */
  private _buildSectionSchema(
    section: EditorSection
  ): ReadonlyArray<HaFormSchema> {
    const t = createLocalize(this._editorLang());
    return section.schema.map((entry) => {
      if (entry.selector && "select" in entry.selector && entry.selector.select) {
        const isIcon = entry.name === "icon";
        const options = entry.selector.select.options.map((opt) => ({
          value: opt.value,
          // Icon names are not translatable: show the icon name verbatim and
          // localize only the `auto` sentinel. Other selects localize every
          // option via `editor.<field>.<value>` (005 pattern).
          label: isIcon
            ? opt.value === "auto"
              ? t("editor.icon.entity")
              : opt.value
            : opt.value === ""
              ? ""
              : t(`editor.${entry.name}.${opt.value}`)
        }));
        // `mode`/`custom_value` are preserved so selects render as dropdowns
        // (007); the icon field is a searchable combo box via `custom_value`.
        return {
          ...entry,
          selector: { select: { ...entry.selector.select, options } }
        };
      }
      return entry;
    });
  }

  private _sectionFormData(section: EditorSection): FormRecord {
    const cfg = this._config;
    if (!cfg) {
      return {};
    }
    return section.toForm(cfg);
  }

  /**
   * Syncs `_openSections` from the panel's `expanded-changed` event. Only the
   * panel's header (`#summary`) toggles a section: the form body stops
   * `click`/`pointerdown`/`keydown` propagation, so interactions with the
   * section's own controls (dropdowns, inputs, toggles) never reach the
   * panel's toggle mechanism (FR-018).
   */
  private _handleExpandedChanged(
    sectionId: string,
    e: CustomEvent<{ expanded: boolean }>
  ): void {
    const expanded = e.detail?.expanded ?? false;
    const next = new Set(this._openSections);
    if (expanded) {
      next.add(sectionId);
    } else {
      next.delete(sectionId);
    }
    this._openSections = next;
  }

  private _handleSectionValueChanged(
    value: FormRecord,
    sectionId: string
  ): void {
    if (!this._config) {
      return;
    }
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section) {
      return;
    }
    const patch = section.fromForm(value, this._config);
    // Shallow-merge only the section's own fields; keys not owned by the
    // section (e.g. YAML-only fields) are never dropped (SC-002).
    this._config = { ...this._config, ...patch } as CardConfig;
    // Re-validate advisory fields owned by this section (never blocks emit).
    if (section.id === "time_window") {
      validateTimeWindowSection(this);
    } else if (section.id === "date_formats") {
      validateDateFormatSection(this);
    }
    this._emitConfigChanged();
  }

  private _emitConfigChanged(): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }

  private _switchToYaml(): void {
    this._yamlText = window.jsyaml!.dump(this._config ?? {});
    this._yamlError = null;
    this._editorMode = "yaml";
  }

  private _switchToVisual(): void {
    if (this._editorMode !== "yaml") {
      return;
    }
    try {
      const parsed = window.jsyaml!.load(this._yamlText);
      if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
        this._yamlError = createLocalize(this._editorLang())("editor.yaml_error");
        return;
      }
      this._config = parsed as CardConfig;
      this._yamlError = null;
      this._editorMode = "visual";
      this._fieldErrors = {};
      this._emitConfigChanged();
    } catch (err) {
      this._yamlError = (err as Error).message;
    }
  }

  private _handleYamlInput(e: { target: { value: string } }): void {
    this._yamlText = e.target.value;
  }

  private _renderSection(section: EditorSection): TemplateResult {
    const t = createLocalize(this._editorLang());
    const error = this._fieldErrors[section.id];
    const form = html`
      <ha-form
        .schema=${this._buildSectionSchema(section)}
        .data=${this._sectionFormData(section)}
        .hass=${this.hass}
        .computeLabel=${this._computeLabel.bind(this)}
        @value-changed=${(e: CustomEvent) => {
          const value = (e.detail?.value ?? {}) as FormRecord;
          this._handleSectionValueChanged(value, section.id);
        }}
      ></ha-form>
    `;

    if (!section.advanced) {
      // Basic sections render with a visible title (007 FR-023).
      return html`
        <section class="eh-section">
          <h3 class="eh-section__title">${t(section.labelKey)}</h3>
          ${form}
          ${error ? html`<p class="error">${error}</p>` : ""}
        </section>
      `;
    }

    if (!this._hasExpansionPanel()) {
      // Graceful degradation: very old HA without `ha-expansion-panel` — the
      // section renders unwrapped (always visible) rather than crashing.
      return html`
        <section class="eh-section">
          <h3 class="eh-section__title">${t(section.labelKey)}</h3>
          ${form}
          ${error ? html`<p class="error">${error}</p>` : ""}
        </section>
      `;
    }

    return html`
      <ha-expansion-panel
        id=${section.id}
        .header=${t(section.labelKey)}
        .expanded=${this._openSections.has(section.id)}
        @expanded-changed=${(e: CustomEvent<{ expanded: boolean }>) =>
          this._handleExpandedChanged(section.id, e)}
      >
        <div
          class="eh-section__body"
          @click=${(e: Event) => e.stopPropagation()}
          @pointerdown=${(e: Event) => e.stopPropagation()}
          @keydown=${(e: Event) => e.stopPropagation()}
        >
          ${form}
          ${error ? html`<p class="error">${error}</p>` : ""}
        </div>
      </ha-expansion-panel>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .editor {
      padding: 8px;
    }
    .toggle-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .toggle-row button {
      flex: 1;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
    }
    .toggle-row button.active {
      font-weight: 600;
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .eh-section {
      margin-bottom: 8px;
    }
    .eh-section__title {
      margin: 8px 0 4px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-text-color, #000);
    }
    /* Advanced sections: ensure the panel host participates in normal flow.
       The panel's internal .container (height: 0px + _showContent gating)
       already handles collapse — no external display:none needed.
       (Chromium miscalculates scrollHeight when display:none toggles on
       slotted content; Firefox tolerates it.) */
    ha-expansion-panel {
      display: block;
    }
    /* Form body inside an advanced section: isolates the controls from the
       panel's header toggle (see _renderSection). */
    .eh-section__body {
      display: block;
    }
    /* Consistent spacing between form fields inside a section. */
    .eh-section ha-form {
      margin: 0;
    }
    .yaml-editor {
      width: 100%;
      min-height: 200px;
      box-sizing: border-box;
      font-family: monospace;
    }
    .error {
      color: var(--error-color, #c62828);
      margin: 8px 0 0;
    }
  `;

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    const t = createLocalize(this._editorLang());
    const visualLabel = t("editor.visual_mode");
    const yamlLabel = t("editor.yaml_mode");

    return html`
      <div class="editor">
        ${this._hasYamlSupport()
          ? html`
              <div class="toggle-row">
                <button
                  type="button"
                  class=${this._editorMode === "visual" ? "active" : ""}
                  @click=${() => this._switchToVisual()}
                >
                  ${visualLabel}
                </button>
                <button
                  type="button"
                  class=${this._editorMode === "yaml" ? "active" : ""}
                  @click=${() => this._switchToYaml()}
                >
                  ${yamlLabel}
                </button>
              </div>
            `
          : ""}
        ${this._editorMode === "visual"
          ? html`${SECTIONS.map((section) => this._renderSection(section))}`
          : html`
              <textarea
                class="yaml-editor"
                .value=${this._yamlText}
                @input=${this._handleYamlInput}
              ></textarea>
              ${this._yamlError
                ? html`<p class="error">${this._yamlError}</p>`
                : ""}
            `}
      </div>
    `;
  }
}

customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);
