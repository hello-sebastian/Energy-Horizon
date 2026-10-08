import type { TemplateResult } from "lit";
import type { CardConfig } from "../types";

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
  | "basic"
  | "time"
  | "layout"
  | "visuals"
  | "formatting"
  | "system";

export const SECTION_ORDER: readonly SectionId[] = [
  "basic",
  "time",
  "layout",
  "visuals",
  "formatting",
  "system"
];

/** Declarative control metadata (data-model.md §2). */
export type ControlSpec =
  | { kind: "entity"; domain: string }
  | { kind: "icon" }
  | { kind: "text" }
  | { kind: "number"; min?: number; max?: number }
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

// ---------------------------------------------------------------------------
// Visibility / dependency predicates (research R11).
// ---------------------------------------------------------------------------

const IS_CUSTOM = (cfg: CardConfig): boolean =>
  cfg.comparison_preset === "custom";
const IS_STANDARD = (cfg: CardConfig): boolean =>
  cfg.comparison_preset !== "custom";

// ---------------------------------------------------------------------------
// The full 33-field registry (contracts/field-registry.md inventory).
// ---------------------------------------------------------------------------

export const FIELD_REGISTRY: FieldRegistry = [
  // S1 — Basic (always expanded)
  {
    key: "entity",
    section: "basic",
    control: { kind: "entity", domain: "sensor" },
    labelKey: "editor.entity",
    default: "",
    required: true
  },
  {
    key: "title",
    section: "basic",
    control: { kind: "text" },
    labelKey: "editor.title"
  },
  {
    key: "show_title",
    section: "basic",
    control: { kind: "boolean" },
    labelKey: "editor.show_title",
    default: true
  },
  {
    key: "icon",
    section: "basic",
    control: { kind: "icon" },
    labelKey: "editor.icon"
  },
  {
    key: "show_icon",
    section: "basic",
    control: { kind: "boolean" },
    labelKey: "editor.show_icon",
    default: true
  },
  {
    key: "comparison_preset",
    section: "basic",
    control: { kind: "select", options: COMPARISON_PRESET_OPTIONS },
    labelKey: "editor.comparison_preset",
    default: "year_over_year"
  },
  {
    key: "interpretation",
    section: "basic",
    control: { kind: "select", options: INTERPRETATION_OPTIONS },
    labelKey: "editor.interpretation",
    default: "consumption"
  },
  {
    key: "neutral_interpretation",
    section: "basic",
    control: { kind: "number", min: 0, max: 100 },
    labelKey: "editor.neutral_interpretation",
    default: 2
  },

  // S2 — Time & Aggregation
  {
    key: "aggregation",
    section: "time",
    control: {
      kind: "select",
      options: AGGREGATION_OPTIONS,
      // `auto` maps to an omitted (undefined) aggregation — adaptive.
      valueToConfig: (value) => (value === "auto" ? undefined : value)
    },
    labelKey: "editor.aggregation",
    default: "auto"
  },
  {
    key: "period_offset",
    section: "time",
    control: { kind: "number", min: -10, max: 10 },
    labelKey: "editor.period_offset",
    default: -1,
    visibleWhen: IS_STANDARD
  },
  {
    key: "time_window.anchor",
    section: "time",
    control: { kind: "select", options: ANCHOR_OPTIONS },
    labelKey: "editor.time_window.anchor",
    default: "start_of_year",
    visibleWhen: IS_CUSTOM
  },
  {
    key: "time_window.duration",
    section: "time",
    control: { kind: "text" },
    labelKey: "editor.time_window.duration",
    default: "1y",
    visibleWhen: IS_CUSTOM
  },
  {
    key: "time_window.step",
    section: "time",
    control: { kind: "text" },
    labelKey: "editor.time_window.step",
    default: "1y",
    visibleWhen: IS_CUSTOM
  },
  {
    key: "time_window.count",
    section: "time",
    control: { kind: "number", min: 1, max: 24 },
    labelKey: "editor.time_window.count",
    default: 2,
    visibleWhen: IS_CUSTOM
  },
  {
    key: "time_window.offset",
    section: "time",
    control: { kind: "text" },
    labelKey: "editor.time_window.offset",
    visibleWhen: IS_CUSTOM
  },

  // S3 — Layout & Visibility
  {
    key: "show_comparison_summary",
    section: "layout",
    control: { kind: "boolean" },
    labelKey: "editor.show_comparison_summary",
    default: true
  },
  {
    key: "show_forecast",
    section: "layout",
    control: { kind: "boolean" },
    labelKey: "editor.show_forecast",
    default: true
  },
  {
    key: "show_forecast_total_panel",
    section: "layout",
    control: { kind: "boolean" },
    labelKey: "editor.show_forecast_total_panel",
    default: true,
    disabledWhen: (cfg) => cfg.show_forecast === false
  },
  {
    key: "show_narrative_comment",
    section: "layout",
    control: { kind: "boolean" },
    labelKey: "editor.show_narrative_comment",
    default: true
  },

  // S4 — Visuals & Chart Styling
  {
    key: "primary_color",
    section: "visuals",
    control: { kind: "color" },
    labelKey: "editor.primary_color"
  },
  {
    key: "fill_current",
    section: "visuals",
    control: { kind: "boolean" },
    labelKey: "editor.fill_current",
    default: true
  },
  {
    key: "fill_current_opacity",
    section: "visuals",
    control: { kind: "slider", min: 0, max: 100, step: 1 },
    labelKey: "editor.fill_current_opacity",
    default: 30
  },
  {
    key: "fill_reference",
    section: "visuals",
    control: { kind: "boolean" },
    labelKey: "editor.fill_reference",
    default: false
  },
  {
    key: "fill_reference_opacity",
    section: "visuals",
    control: { kind: "slider", min: 0, max: 100, step: 1 },
    labelKey: "editor.fill_reference_opacity",
    default: 30
  },
  {
    key: "connect_nulls",
    section: "visuals",
    control: { kind: "boolean" },
    labelKey: "editor.connect_nulls",
    default: true
  },
  {
    key: "show_legend",
    section: "visuals",
    control: { kind: "boolean" },
    labelKey: "editor.show_legend",
    default: false
  },

  // S5 — Formatting & Axis
  {
    key: "precision",
    section: "formatting",
    control: { kind: "number", min: 0, max: 6 },
    labelKey: "editor.precision",
    default: 2
  },
  {
    key: "force_prefix",
    section: "formatting",
    control: { kind: "select", options: FORCE_PREFIX_OPTIONS },
    labelKey: "editor.force_prefix",
    default: "auto"
  },
  {
    key: "number_format",
    section: "formatting",
    control: { kind: "select", options: NUMBER_FORMAT_OPTIONS },
    labelKey: "editor.number_format",
    default: "system"
  },
  {
    key: "language",
    section: "formatting",
    control: { kind: "text" },
    labelKey: "editor.language"
  },
  {
    key: "x_axis_format",
    section: "formatting",
    control: { kind: "text" },
    labelKey: "editor.x_axis_format"
  },
  {
    key: "tooltip_format",
    section: "formatting",
    control: { kind: "text" },
    labelKey: "editor.tooltip_format"
  },

  // S6 — System & Debug
  {
    key: "debug",
    section: "system",
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
    basic: [],
    time: [],
    layout: [],
    visuals: [],
    formatting: [],
    system: []
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
