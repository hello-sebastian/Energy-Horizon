import type { TemplateResult } from "lit";
import type { CardConfig } from "../types";
import { AVAILABLE_LANGUAGES } from "../localize";

/**
 * Full-Coverage Visual Editor (v1.2.0) — declarative field registry.
 *
 * The registry is the single source of truth for what the editor renders and
 * where (data-model.md §1–§4, contracts/field-registry.md). Adding a field =
 * adding one descriptor; moving a field = changing its `section` (FR-908-A/B,
 * SC-908-8). The render loop groups by `section`, filters by `visibleWhen`,
 * applies `disabledWhen`, and renders each control from `control` metadata.
 */

/** Fixed section order (FR-908-E). The render loop iterates in this order. */
export type SectionId =
  | "general"
  | "time"
  | "panels"
  | "formatting"
  | "chart"
  | "style"
  | "diagnostics";

export const SECTION_ORDER: readonly SectionId[] = [
  "general",
  "time",
  "panels",
  "formatting",
  "chart",
  "style",
  "diagnostics"
];

/** MDI icon per section header (rendered in the panel's `leading-icon` slot). */
export const SECTION_ICONS: Readonly<Record<SectionId, string>> = {
  general: "mdi:application-cog-outline",
  time: "mdi:chart-gantt",
  panels: "mdi:view-day-outline",
  formatting: "mdi:counter",
  chart: "mdi:chart-timeline-variant-shimmer",
  style: "mdi:palette-outline",
  diagnostics: "mdi:bug-outline"
};

/**
 * Wiki documentation URL per section (FR-908-AA). Rendered as a link in the
 * section header's `icons` slot (or the fallback `.section-header`), pointing
 * to the wiki chapter that covers the section's keys.
 */
export const SECTION_DOCS_URLS: Readonly<Record<SectionId, string>> = {
  general:
    "https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization#core-configuration",
  time: "https://github.com/hello-sebastian/energy-horizon/wiki/Time-Window-Reference",
  panels:
    "https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization#layout-sections-figma-aligned",
  formatting:
    "https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization#localization-and-number-formatting",
  chart:
    "https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization#forecast",
  style:
    "https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization#chart-styling-fills-colors-gaps",
  diagnostics:
    "https://github.com/hello-sebastian/energy-horizon/wiki/Configuration-and-Customization#debug"
};

/** Declarative control metadata (data-model.md §2). */
export type ControlSpec =
  | { kind: "entity"; domain: string }
  | { kind: "icon" }
  | { kind: "text" }
  | { kind: "number"; min?: number; max?: number; suffix?: string }
  | {
      kind: "select";
      options: { value: string; labelKey: string }[];
      /**
       * Maps a selected option value to the value stored in the config.
       * Used for `aggregation`, where the `auto` option maps to an omitted
       * (undefined) `aggregation` — never a literal `"auto"` string.
       */
      valueToConfig?: (value: string) => unknown;
    }
  | { kind: "boolean" }
  | { kind: "slider"; min: number; max: number; step?: number }
  | { kind: "color" }
  | { kind: "custom"; render: (ctx: FieldRenderContext) => TemplateResult };

/** Context handed to a `custom` renderer (FR-908-C escape hatch). */
export interface FieldRenderContext {
  config: CardConfig;
  value: unknown;
  localize: (key: string) => string;
  onChange: (value: unknown) => void;
}

/** A single registry entry (data-model.md §3). */
export interface FieldDescriptor {
  /** YAML path, e.g. `fill_current_opacity` or `time_window.count`. */
  key: string;
  /** Owning section (FR-908-B: relocation = change this). */
  section: SectionId;
  /** Declarative control spec or custom-renderer reference. */
  control: ControlSpec;
  /** i18n key, `editor.<name>` (FR-908-U). */
  labelKey: string;
  /** i18n key of the helper text rendered below the control, `editor.<name>_helper` (FR-908-AB). */
  helperKey?: string;
  /** Documented default (rendered when the value is absent). */
  default?: unknown;
  /** `true` only for `entity` (FR-908-R). */
  required?: boolean;
  /** Pure predicate over the config (e.g. preset === "custom"). */
  visibleWhen?: (cfg: CardConfig) => boolean;
  /** Pure predicate over the config (e.g. !show_forecast). */
  disabledWhen?: (cfg: CardConfig) => boolean;
  /** Emit policy; defaults by control kind (text/number → debounced). */
  emit?: "debounced" | "immediate";
  /**
   * When set, this field renders in the same horizontal row as the field
   * with this key (to its right), instead of as its own row. Used for the
   * `show_title`/`title`, `show_icon`/`icon`, and
   * `neutral_threshold`/`interpretation` pairs (FR-908-Z).
   */
  inlineWith?: string;
  /**
   * i18n key of the non-collapsible subsection header this field belongs to
   * (e.g. `editor.subsection.custom_settings`). Fields without `subsection`
   * render at the top level of their section. The render loop emits a
   * subsection header whenever the `subsection` of consecutive visible fields
   * changes.
   */
  subsection?: string;
  /**
   * `true` for UX/UI-only fields that have **no** representation in the card
   * config (e.g. `show_chart`). Rendered as a permanently ON, disabled switch
   * that explains an always-true behavior; changes are ignored and never
   * written to the config.
   */
  dummy?: boolean;
  /**
   * 1-based column index (1 or 2) for sections rendered as a two-column
   * grid. When any visible field in a section declares `column`, the section
   * body renders as a CSS grid with two equal columns; fields without
   * `column` span both columns. Subsection headers span both columns and
   * appear at the first field that declares them. Used by the Style section
   * so that the Current series / Reference series fields align row by row.
   */
  column?: number;
}

/** The full registry (data-model.md §4). */
export type FieldRegistry = readonly FieldDescriptor[];

// ---------------------------------------------------------------------------
// Select option sets (values are the YAML values; labels are editor.* keys).
// ---------------------------------------------------------------------------

const COMPARISON_PRESET_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "year_over_year", labelKey: "editor.year_over_year" },
  { value: "month_over_year", labelKey: "editor.month_over_year" },
  { value: "month_over_month", labelKey: "editor.month_over_month" },
  { value: "custom", labelKey: "editor.custom" }
];

const AGGREGATION_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "auto", labelKey: "editor.aggregation.auto" },
  { value: "hour", labelKey: "editor.aggregation.hour" },
  { value: "day", labelKey: "editor.aggregation.day" },
  { value: "week", labelKey: "editor.aggregation.week" },
  { value: "month", labelKey: "editor.aggregation.month" }
];

const INTERPRETATION_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "consumption", labelKey: "editor.interpretation_consumption" },
  { value: "production", labelKey: "editor.interpretation_production" }
];

const FORCE_PREFIX_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "", labelKey: "" },
  { value: "auto", labelKey: "editor.force_prefix.auto" },
  { value: "none", labelKey: "editor.force_prefix.none" },
  { value: "G", labelKey: "editor.force_prefix.G" },
  { value: "M", labelKey: "editor.force_prefix.M" },
  { value: "k", labelKey: "editor.force_prefix.k" },
  { value: "m", labelKey: "editor.force_prefix.m" },
  { value: "µ", labelKey: "editor.force_prefix.µ" }
];

const NUMBER_FORMAT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "system", labelKey: "editor.number_format.system" },
  { value: "comma", labelKey: "editor.number_format.comma" },
  { value: "decimal", labelKey: "editor.number_format.decimal" },
  { value: "language", labelKey: "editor.number_format.language" }
];

const ANCHOR_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "start_of_year", labelKey: "editor.anchor.start_of_year" },
  { value: "start_of_month", labelKey: "editor.anchor.start_of_month" },
  { value: "start_of_week", labelKey: "editor.anchor.start_of_week" },
  { value: "start_of_day", labelKey: "editor.anchor.start_of_day" },
  { value: "start_of_hour", labelKey: "editor.anchor.start_of_hour" },
  { value: "now", labelKey: "editor.anchor.now" }
];

/**
 * Language picker options: an "Auto (HA profile)" sentinel option (maps to an
 * omitted `language` key — same pattern as `aggregation`) plus one option per
 * shipped translation dictionary (derived from `AVAILABLE_LANGUAGES` — adding
 * a dictionary file adds the option automatically, no registry edit needed).
 */
const LANGUAGE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "auto", labelKey: "editor.language.auto" },
  ...AVAILABLE_LANGUAGES.map((lang) => ({
    value: lang,
    labelKey: `editor.language.${lang}`
  }))
];

// ---------------------------------------------------------------------------
// Visibility / dependency predicates (research R11).
// ---------------------------------------------------------------------------

const IS_CUSTOM = (cfg: CardConfig): boolean =>
  cfg.comparison_preset === "custom";

// ---------------------------------------------------------------------------
// The full field registry (contracts/field-registry.md inventory): 32
// config-backed fields + 1 UX-only dummy (`show_chart`).
// ---------------------------------------------------------------------------

export const FIELD_REGISTRY: FieldRegistry = [
  // S1 — General (expanded by default)
  {
    key: "entity",
    section: "general",
    control: { kind: "entity", domain: "sensor" },
    labelKey: "editor.entity",
    default: "",
    required: true
  },
  {
    key: "title",
    section: "general",
    control: { kind: "text" },
    labelKey: "editor.title"
  },
  {
    key: "show_title",
    section: "general",
    control: { kind: "boolean" },
    labelKey: "editor.show_title",
    default: true,
    inlineWith: "title"
  },
  {
    key: "icon",
    section: "general",
    control: { kind: "icon" },
    labelKey: "editor.icon"
  },
  {
    key: "show_icon",
    section: "general",
    control: { kind: "boolean" },
    labelKey: "editor.show_icon",
    default: true,
    inlineWith: "icon"
  },
  {
    key: "interpretation",
    section: "general",
    control: { kind: "select", options: INTERPRETATION_OPTIONS },
    labelKey: "editor.interpretation",
    default: "consumption"
  },
  {
    key: "neutral_threshold",
    section: "general",
    control: { kind: "number", min: 0, max: 100, suffix: "%" },
    labelKey: "editor.neutral_threshold",
    helperKey: "editor.neutral_threshold_helper",
    default: 2,
    inlineWith: "interpretation"
  },
  {
    key: "aggregation",
    section: "general",
    control: {
      kind: "select",
      options: AGGREGATION_OPTIONS,
      // `auto` maps to an omitted (undefined) aggregation — adaptive.
      valueToConfig: (value) => (value === "auto" ? undefined : value)
    },
    labelKey: "editor.aggregation",
    helperKey: "editor.aggregation_helper",
    default: "auto"
  },

  // S2 — Time windows (expanded by default)
  {
    key: "comparison_preset",
    section: "time",
    control: { kind: "select", options: COMPARISON_PRESET_OPTIONS },
    labelKey: "editor.comparison_preset",
    default: "year_over_year"
  },
  {
    key: "time_window.anchor",
    section: "time",
    control: { kind: "select", options: ANCHOR_OPTIONS },
    labelKey: "editor.time_window.anchor",
    helperKey: "editor.time_window.anchor_helper",
    default: "start_of_year",
    visibleWhen: IS_CUSTOM,
    subsection: "editor.subsection.custom_settings"
  },
  {
    key: "time_window.duration",
    section: "time",
    control: { kind: "text" },
    labelKey: "editor.time_window.duration",
    helperKey: "editor.time_window.duration_helper",
    default: "1y",
    visibleWhen: IS_CUSTOM,
    subsection: "editor.subsection.custom_settings"
  },
  {
    key: "time_window.step",
    section: "time",
    control: { kind: "text" },
    labelKey: "editor.time_window.step",
    helperKey: "editor.time_window.step_helper",
    default: "1y",
    visibleWhen: IS_CUSTOM,
    subsection: "editor.subsection.custom_settings"
  },
  {
    key: "time_window.count",
    section: "time",
    control: { kind: "number", min: 1, max: 24 },
    labelKey: "editor.time_window.count",
    helperKey: "editor.time_window.count_helper",
    default: 2,
    visibleWhen: IS_CUSTOM,
    subsection: "editor.subsection.custom_settings"
  },
  {
    key: "time_window.offset",
    section: "time",
    control: { kind: "text" },
    labelKey: "editor.time_window.offset",
    helperKey: "editor.time_window.offset_helper",
    visibleWhen: IS_CUSTOM,
    subsection: "editor.subsection.custom_settings"
  },

  // S3 — Panels
  {
    key: "show_comparison_summary",
    section: "panels",
    control: { kind: "boolean" },
    labelKey: "editor.show_comparison_summary",
    default: true
  },
  {
    key: "show_chart",
    section: "panels",
    control: { kind: "boolean" },
    labelKey: "editor.show_chart",
    default: true,
    dummy: true
  },
  {
    key: "show_forecast_total_panel",
    section: "panels",
    control: { kind: "boolean" },
    labelKey: "editor.show_forecast_total_panel",
    default: true
  },
  {
    key: "show_narrative_comment",
    section: "panels",
    control: { kind: "boolean" },
    labelKey: "editor.show_narrative_comment",
    default: true
  },

  // S4 — Formatting & Localization
  {
    key: "language",
    section: "formatting",
    control: {
      kind: "select",
      options: LANGUAGE_OPTIONS,
      // The "auto" sentinel maps to an omitted `language` key — the card then
      // inherits the HA profile language (FR-908-X chain step 2).
      valueToConfig: (value) => (value === "auto" ? undefined : value)
    },
    labelKey: "editor.language",
    default: "auto"
  },
  {
    key: "force_prefix",
    section: "formatting",
    control: { kind: "select", options: FORCE_PREFIX_OPTIONS },
    labelKey: "editor.force_prefix",
    default: "auto",
    subsection: "editor.subsection.unit"
  },
  {
    key: "number_format",
    section: "formatting",
    control: { kind: "select", options: NUMBER_FORMAT_OPTIONS },
    labelKey: "editor.number_format",
    default: "system",
    subsection: "editor.subsection.unit"
  },
  {
    key: "precision",
    section: "formatting",
    control: { kind: "number", min: 0, max: 6 },
    labelKey: "editor.precision",
    helperKey: "editor.precision_helper",
    default: 2,
    subsection: "editor.subsection.unit"
  },
  {
    key: "x_axis_format",
    section: "formatting",
    control: { kind: "text" },
    labelKey: "editor.x_axis_format",
    helperKey: "editor.x_axis_format_helper",
    subsection: "editor.subsection.dates"
  },
  {
    key: "tooltip_format",
    section: "formatting",
    control: { kind: "text" },
    labelKey: "editor.tooltip_format",
    helperKey: "editor.tooltip_format_helper",
    subsection: "editor.subsection.dates"
  },

  // S5 — Chart settings
  {
    key: "show_forecast",
    section: "chart",
    control: { kind: "boolean" },
    labelKey: "editor.show_forecast",
    default: true
  },
  {
    key: "connect_nulls",
    section: "chart",
    control: { kind: "boolean" },
    labelKey: "editor.connect_nulls",
    default: true
  },
  {
    key: "show_legend",
    section: "chart",
    control: { kind: "boolean" },
    labelKey: "editor.show_legend",
    default: false
  },

  // S6 — Style
  {
    key: "primary_color",
    section: "style",
    control: { kind: "color" },
    labelKey: "editor.primary_color",
    subsection: "editor.subsection.current_series",
    column: 1
  },
  {
    key: "fill_current",
    section: "style",
    control: { kind: "boolean" },
    labelKey: "editor.fill_current",
    default: true,
    subsection: "editor.subsection.current_series",
    column: 1
  },
  {
    key: "fill_current_opacity",
    section: "style",
    control: { kind: "slider", min: 0, max: 100, step: 1 },
    labelKey: "editor.fill_current_opacity",
    default: 30,
    subsection: "editor.subsection.current_series",
    column: 1
  },
  {
    key: "fill_reference",
    section: "style",
    control: { kind: "boolean" },
    labelKey: "editor.fill_reference",
    default: false,
    subsection: "editor.subsection.reference_series",
    column: 2
  },
  {
    key: "fill_reference_opacity",
    section: "style",
    control: { kind: "slider", min: 0, max: 100, step: 1 },
    labelKey: "editor.fill_reference_opacity",
    default: 30,
    subsection: "editor.subsection.reference_series",
    column: 2
  },

  // S7 — Diagnostics
  {
    key: "debug",
    section: "diagnostics",
    control: { kind: "boolean" },
    labelKey: "editor.debug",
    default: false
  }
];

// ---------------------------------------------------------------------------
// Render-loop helpers (contracts/field-registry.md).
// ---------------------------------------------------------------------------

/** Groups the registry by section, preserving registry order within each. */
export function groupBySection(
  registry: FieldRegistry = FIELD_REGISTRY
): Record<SectionId, FieldDescriptor[]> {
  const out: Record<SectionId, FieldDescriptor[]> = {
    general: [],
    time: [],
    panels: [],
    formatting: [],
    chart: [],
    style: [],
    diagnostics: []
  };
  for (const field of registry) {
    out[field.section].push(field);
  }
  return out;
}

/** Returns the fields of a section that pass `visibleWhen` for the config. */
export function visibleFields(
  section: SectionId,
  cfg: CardConfig,
  registry: FieldRegistry = FIELD_REGISTRY
): FieldDescriptor[] {
  return groupBySection(registry)[section].filter(
    (f) => f.visibleWhen === undefined || f.visibleWhen(cfg)
  );
}

/**
 * Resolves the value to render for a field: the config value at `key` path,
 * falling back to the documented default when absent.
 */
export function resolveFieldValue(
  field: FieldDescriptor,
  cfg: CardConfig
): unknown {
  const value = readPath(cfg, field.key);
  if (value !== undefined) {
    return value;
  }
  return field.default;
}

/** Reads a (possibly dotted) path from a config object. */
export function readPath(cfg: CardConfig, key: string): unknown {
  const parts = key.split(".");
  let cur: unknown = cfg;
  for (const part of parts) {
    if (cur === null || typeof cur !== "object") {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/**
 * Maps a raw control value to the value stored in the config for a field.
 * Applies the select's `valueToConfig` (e.g. `aggregation` `auto` → undefined)
 * and drops `undefined` so adaptive/omitted fields are not written literally.
 */
export function toConfigValue(
  field: FieldDescriptor,
  rawValue: unknown
): unknown {
  if (field.control.kind === "select" && field.control.valueToConfig) {
    return field.control.valueToConfig(String(rawValue ?? ""));
  }
  // Number fields must store a real number, not the control's raw string.
  // The card validates `time_window.count` with `Number.isInteger` (domain 900),
  // so a string like `"5"` would be rejected as an invalid window. An empty or
  // non-numeric value maps to `undefined` (the key is dropped — adaptive /
  // cleared), consistent with the text-field semantics.
  if (field.control.kind === "number") {
    if (rawValue === undefined || rawValue === null) {
      return undefined;
    }
    const trimmed = String(rawValue).trim();
    if (trimmed === "" || Number.isNaN(Number(trimmed))) {
      return undefined;
    }
    return Number(trimmed);
  }
  return rawValue;
}
