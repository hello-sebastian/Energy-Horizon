import { describe, it, expect } from "vitest";
import {
  FIELD_REGISTRY,
  SECTION_ORDER,
  SECTION_ICONS,
  groupBySection,
  visibleFields,
  resolveFieldValue,
  readPath,
  toConfigValue,
  type FieldDescriptor,
  type SectionId
} from "../../src/card/editor/field-registry";
import type { CardConfig } from "../../src/card/types";

/**
 * The FR-908-D YAML surface (32 user-configurable parameters). The registry
 * additionally carries one UX-only dummy (`show_chart`) that has no config
 * representation and is excluded from this surface.
 */
const FR_908_D_KEYS = [
  // S1 general
  "entity",
  "title",
  "show_title",
  "icon",
  "show_icon",
  "interpretation",
  "neutral_threshold",
  "aggregation",
  // S2 time
  "comparison_preset",
  "time_window.anchor",
  "time_window.duration",
  "time_window.step",
  "time_window.count",
  "time_window.offset",
  // S3 panels
  "show_comparison_summary",
  "show_forecast_total_panel",
  "show_narrative_comment",
  // S4 formatting
  "force_prefix",
  "number_format",
  "precision",
  "language",
  "x_axis_format",
  "tooltip_format",
  // S5 chart
  "show_forecast",
  "connect_nulls",
  "show_legend",
  // S6 style
  "primary_color",
  "fill_current",
  "fill_current_opacity",
  "fill_reference",
  "fill_reference_opacity",
  // S7 diagnostics
  "debug"
] as const;

/** FR-908-F section membership (includes the `show_chart` dummy in panels). */
const SECTION_MEMBERSHIP: Record<SectionId, string[]> = {
  general: [
    "entity",
    "title",
    "show_title",
    "icon",
    "show_icon",
    "interpretation",
    "neutral_threshold",
    "aggregation"
  ],
  time: [
    "comparison_preset",
    "time_window.anchor",
    "time_window.duration",
    "time_window.step",
    "time_window.count",
    "time_window.offset"
  ],
  panels: [
    "show_comparison_summary",
    "show_chart",
    "show_forecast_total_panel",
    "show_narrative_comment"
  ],
  formatting: [
    "language",
    "force_prefix",
    "number_format",
    "precision",
    "x_axis_format",
    "tooltip_format"
  ],
  chart: ["show_forecast", "connect_nulls", "show_legend"],
  style: [
    "primary_color",
    "fill_current",
    "fill_current_opacity",
    "fill_reference",
    "fill_reference_opacity"
  ],
  diagnostics: ["debug"]
};

function keysOfSection(section: SectionId): string[] {
  return groupBySection(FIELD_REGISTRY)[section].map((f) => f.key);
}

describe("editor field registry (SC-908-1, FR-908-D/F/B)", () => {
  it("covers every FR-908-D key exactly once (SC-908-1)", () => {
    // The registry carries one UX-only dummy (`show_chart`) with no config
    // representation; the FR-908-D surface covers the config-backed fields.
    const registryKeys = FIELD_REGISTRY.filter((f) => !f.dummy).map(
      (f) => f.key
    );
    expect(registryKeys).toHaveLength(FR_908_D_KEYS.length);
    // Every FR-908-D key appears.
    for (const key of FR_908_D_KEYS) {
      expect(registryKeys.filter((k) => k === key)).toHaveLength(1);
    }
    // No extra keys beyond the FR-908-D surface.
    for (const key of registryKeys) {
      expect((FR_908_D_KEYS as readonly string[])).toContain(key);
    }
  });

  it("carries exactly one UX-only dummy (show_chart) with no config role", () => {
    const dummies = FIELD_REGISTRY.filter((f) => f.dummy);
    expect(dummies.map((f) => f.key)).toEqual(["show_chart"]);
    // The dummy lives in the panels section and is a boolean control.
    const dummy = dummies[0];
    expect(dummy.section).toBe("panels");
    expect(dummy.control.kind).toBe("boolean");
  });

  it("section membership matches FR-908-F", () => {
    for (const section of SECTION_ORDER) {
      expect(keysOfSection(section).sort()).toEqual(
        [...SECTION_MEMBERSHIP[section]].sort()
      );
    }
  });

  it("type / comparison_mode / forecast are NOT registry fields", () => {
    const registryKeys = FIELD_REGISTRY.map((f) => f.key);
    expect(registryKeys).not.toContain("type");
    expect(registryKeys).not.toContain("comparison_mode");
    expect(registryKeys).not.toContain("forecast");
  });

  it("changing a descriptor's section re-groups it with no template edit (FR-908-B, SC-908-8)", () => {
    // Simulate a data-only relocation: move `debug` from diagnostics → general.
    const relocated = FIELD_REGISTRY.map((f) =>
      f.key === "debug" ? { ...f, section: "general" as SectionId } : f
    );
    const grouped = groupBySection(relocated);
    expect(grouped.general.map((f) => f.key)).toContain("debug");
    expect(grouped.diagnostics.map((f) => f.key)).not.toContain("debug");
    // The grouping helper is the only consumer — no template change needed.
    expect(grouped.general).toHaveLength(9);
    expect(grouped.diagnostics).toHaveLength(0);
  });

  it("required is true only for entity (FR-908-R)", () => {
    const required = FIELD_REGISTRY.filter((f) => f.required === true);
    expect(required.map((f) => f.key)).toEqual(["entity"]);
  });

  it("SECTION_ICONS covers every section with an MDI icon", () => {
    for (const section of SECTION_ORDER) {
      const icon = SECTION_ICONS[section];
      expect(icon, `icon of ${section}`).toBeTruthy();
      expect(icon.startsWith("mdi:"), `icon of ${section} must be an MDI id`).toBe(true);
    }
    expect(Object.keys(SECTION_ICONS).sort()).toEqual(
      [...SECTION_ORDER].sort()
    );
  });

  it("aggregation `auto` maps to an omitted (undefined) config value", () => {
    const agg = FIELD_REGISTRY.find((f) => f.key === "aggregation")!;
    expect(toConfigValue(agg, "auto")).toBeUndefined();
    expect(toConfigValue(agg, "day")).toBe("day");
    expect(toConfigValue(agg, "week")).toBe("week");
  });

  it("aggregation renders `auto` as its default when the config omits it", () => {
    const agg = FIELD_REGISTRY.find((f) => f.key === "aggregation")!;
    const cfg = { type: "custom:energy-horizon-card", entity: "sensor.e" } as CardConfig;
    expect(resolveFieldValue(agg, cfg)).toBe("auto");
    // A concrete value wins over the default.
    const cfg2 = {
      type: "custom:energy-horizon-card",
      entity: "sensor.e",
      aggregation: "day"
    } as CardConfig;
    expect(resolveFieldValue(agg, cfg2)).toBe("day");
  });

  it("resolves time_window.* sub-paths from the config", () => {
    const cfg = {
      type: "custom:energy-horizon-card",
      entity: "sensor.e",
      comparison_preset: "custom",
      time_window: { anchor: "start_of_month", count: 3 }
    } as CardConfig;
    const anchor = FIELD_REGISTRY.find((f) => f.key === "time_window.anchor")!;
    const count = FIELD_REGISTRY.find((f) => f.key === "time_window.count")!;
    expect(readPath(cfg, "time_window.anchor")).toBe("start_of_month");
    expect(resolveFieldValue(anchor, cfg)).toBe("start_of_month");
    expect(resolveFieldValue(count, cfg)).toBe(3);
    // Absent sub-field falls back to the documented default.
    const duration = FIELD_REGISTRY.find((f) => f.key === "time_window.duration")!;
    expect(resolveFieldValue(duration, cfg)).toBe("1y");
  });

  it("visibleWhen: time_window.* only for custom (period_offset is YAML-only)", () => {
    const standard = {
      type: "custom:energy-horizon-card",
      entity: "sensor.e",
      comparison_preset: "year_over_year"
    } as CardConfig;
    const custom = {
      type: "custom:energy-horizon-card",
      entity: "sensor.e",
      comparison_preset: "custom"
    } as CardConfig;

    const timeStandard = visibleFields("time", standard).map((f) => f.key);
    expect(timeStandard).toContain("comparison_preset");
    expect(timeStandard).not.toContain("time_window.anchor");
    expect(timeStandard).not.toContain("time_window.count");

    const timeCustom = visibleFields("time", custom).map((f) => f.key);
    expect(timeCustom).toContain("comparison_preset");
    expect(timeCustom).toContain("time_window.anchor");
    expect(timeCustom).toContain("time_window.count");
  });

  it("show_forecast_total_panel has no disabledWhen (independent of show_forecast, FR-908-H)", () => {
    const field = FIELD_REGISTRY.find(
      (f) => f.key === "show_forecast_total_panel"
    )!;
    expect(field.disabledWhen).toBeUndefined();
  });

  it("language is a select with an auto option plus one option per available dictionary", () => {
    const field = FIELD_REGISTRY.find((f) => f.key === "language")!;
    expect(field.control.kind).toBe("select");
    if (field.control.kind !== "select") return;
    const values = field.control.options.map((o) => o.value);
    // First option is the "auto" sentinel ("Auto (HA profile)").
    expect(values[0]).toBe("auto");
    // Every available dictionary is offered as an option.
    for (const lang of ["en", "pl", "de", "fr"]) {
      expect(values).toContain(lang);
    }
    // The sentinel maps to an omitted (undefined) config value.
    expect(toConfigValue(field, "auto")).toBeUndefined();
    expect(toConfigValue(field, "pl")).toBe("pl");
    // The field defaults to the sentinel so "Auto" is always displayed.
    expect(field.default).toBe("auto");
  });

  it("every descriptor has a non-empty labelKey and a valid section", () => {
    for (const field of FIELD_REGISTRY) {
      expect(field.labelKey.length).toBeGreaterThan(0);
      expect(SECTION_ORDER).toContain(field.section);
    }
  });

  it("neutral_threshold is a number field with a % suffix, inline with interpretation", () => {
    const byKey = new Map<string, FieldDescriptor>(
      FIELD_REGISTRY.map((f) => [f.key, f])
    );
    const field = byKey.get("neutral_threshold")!;
    expect(field.control.kind).toBe("number");
    expect(field.control.suffix).toBe("%");
    expect(field.inlineWith).toBe("interpretation");
    expect(field.labelKey).toBe("editor.neutral_threshold");
  });

  it("defaults match the documented v1.1.0 card defaults", () => {
    const byKey = new Map<string, FieldDescriptor>(
      FIELD_REGISTRY.map((f) => [f.key, f])
    );
    expect(byKey.get("show_title")!.default).toBe(true);
    expect(byKey.get("show_icon")!.default).toBe(true);
    expect(byKey.get("comparison_preset")!.default).toBe("year_over_year");
    expect(byKey.get("interpretation")!.default).toBe("consumption");
    expect(byKey.get("neutral_threshold")!.default).toBe(2);
    expect(byKey.get("time_window.anchor")!.default).toBe("start_of_year");
    expect(byKey.get("time_window.duration")!.default).toBe("1y");
    expect(byKey.get("time_window.step")!.default).toBe("1y");
    expect(byKey.get("time_window.count")!.default).toBe(2);
    expect(byKey.get("show_comparison_summary")!.default).toBe(true);
    expect(byKey.get("show_forecast")!.default).toBe(true);
    expect(byKey.get("show_forecast_total_panel")!.default).toBe(true);
    expect(byKey.get("show_narrative_comment")!.default).toBe(true);
    expect(byKey.get("fill_current")!.default).toBe(true);
    expect(byKey.get("fill_current_opacity")!.default).toBe(30);
    expect(byKey.get("fill_reference")!.default).toBe(false);
    expect(byKey.get("fill_reference_opacity")!.default).toBe(30);
    expect(byKey.get("connect_nulls")!.default).toBe(true);
    expect(byKey.get("show_legend")!.default).toBe(false);
    expect(byKey.get("precision")!.default).toBe(2);
    expect(byKey.get("force_prefix")!.default).toBe("auto");
    expect(byKey.get("number_format")!.default).toBe("system");
    expect(byKey.get("language")!.default).toBe("auto");
    expect(byKey.get("debug")!.default).toBe(false);
  });
});
