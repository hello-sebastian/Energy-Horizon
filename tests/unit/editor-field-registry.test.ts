import { describe, it, expect } from "vitest";
import {
  FIELD_REGISTRY,
  SECTION_ORDER,
  groupBySection,
  visibleFields,
  resolveFieldValue,
  readPath,
  toConfigValue,
  type FieldDescriptor,
  type SectionId
} from "../../src/card/editor/field-registry";
import type { CardConfig } from "../../src/card/types";

/** The full FR-908-D v1.1.0 YAML surface (33 user-configurable parameters). */
const FR_908_D_KEYS = [
  // S1 basic
  "entity",
  "title",
  "show_title",
  "icon",
  "show_icon",
  "comparison_preset",
  "interpretation",
  "neutral_interpretation",
  // S2 time
  "aggregation",
  "period_offset",
  "time_window.anchor",
  "time_window.duration",
  "time_window.step",
  "time_window.count",
  "time_window.offset",
  // S3 layout
  "show_comparison_summary",
  "show_forecast",
  "show_forecast_total_panel",
  "show_narrative_comment",
  // S4 visuals
  "primary_color",
  "fill_current",
  "fill_current_opacity",
  "fill_reference",
  "fill_reference_opacity",
  "connect_nulls",
  "show_legend",
  // S5 formatting
  "precision",
  "force_prefix",
  "number_format",
  "language",
  "x_axis_format",
  "tooltip_format",
  // S6 system
  "debug"
] as const;

/** FR-908-F section membership. */
const SECTION_MEMBERSHIP: Record<SectionId, string[]> = {
  basic: [
    "entity",
    "title",
    "show_title",
    "icon",
    "show_icon",
    "comparison_preset",
    "interpretation",
    "neutral_interpretation"
  ],
  time: [
    "aggregation",
    "period_offset",
    "time_window.anchor",
    "time_window.duration",
    "time_window.step",
    "time_window.count",
    "time_window.offset"
  ],
  layout: [
    "show_comparison_summary",
    "show_forecast",
    "show_forecast_total_panel",
    "show_narrative_comment"
  ],
  visuals: [
    "primary_color",
    "fill_current",
    "fill_current_opacity",
    "fill_reference",
    "fill_reference_opacity",
    "connect_nulls",
    "show_legend"
  ],
  formatting: [
    "precision",
    "force_prefix",
    "number_format",
    "language",
    "x_axis_format",
    "tooltip_format"
  ],
  system: ["debug"]
};

function keysOfSection(section: SectionId): string[] {
  return groupBySection(FIELD_REGISTRY)[section].map((f) => f.key);
}

describe("editor field registry (SC-908-1, FR-908-D/F/B)", () => {
  it("covers every FR-908-D key exactly once (SC-908-1)", () => {
    const registryKeys = FIELD_REGISTRY.map((f) => f.key);
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
    // Simulate a data-only relocation: move `debug` from system → basic.
    const relocated = FIELD_REGISTRY.map((f) =>
      f.key === "debug" ? { ...f, section: "basic" as SectionId } : f
    );
    const grouped = groupBySection(relocated);
    expect(grouped.basic.map((f) => f.key)).toContain("debug");
    expect(grouped.system.map((f) => f.key)).not.toContain("debug");
    // The grouping helper is the only consumer — no template change needed.
    expect(grouped.basic).toHaveLength(9);
    expect(grouped.system).toHaveLength(0);
  });

  it("required is true only for entity (FR-908-R)", () => {
    const required = FIELD_REGISTRY.filter((f) => f.required === true);
    expect(required.map((f) => f.key)).toEqual(["entity"]);
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

  it("visibleWhen: period_offset only for standard, time_window.* only for custom", () => {
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
    expect(timeStandard).toContain("aggregation");
    expect(timeStandard).toContain("period_offset");
    expect(timeStandard).not.toContain("time_window.anchor");

    const timeCustom = visibleFields("time", custom).map((f) => f.key);
    expect(timeCustom).toContain("aggregation");
    expect(timeCustom).not.toContain("period_offset");
    expect(timeCustom).toContain("time_window.anchor");
    expect(timeCustom).toContain("time_window.count");
  });

  it("disabledWhen: show_forecast_total_panel disabled when show_forecast is false (FR-908-H)", () => {
    const field = FIELD_REGISTRY.find(
      (f) => f.key === "show_forecast_total_panel"
    )!;
    expect(field.disabledWhen).toBeDefined();
    expect(
      field.disabledWhen!({
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year",
        show_forecast: false
      } as CardConfig)
    ).toBe(true);
    expect(
      field.disabledWhen!({
        type: "x",
        entity: "e",
        comparison_preset: "year_over_year",
        show_forecast: true
      } as CardConfig)
    ).toBe(false);
  });

  it("every descriptor has a non-empty labelKey and a valid section", () => {
    for (const field of FIELD_REGISTRY) {
      expect(field.labelKey.length).toBeGreaterThan(0);
      expect(SECTION_ORDER).toContain(field.section);
    }
  });

  it("defaults match the documented v1.1.0 card defaults", () => {
    const byKey = new Map<string, FieldDescriptor>(
      FIELD_REGISTRY.map((f) => [f.key, f])
    );
    expect(byKey.get("show_title")!.default).toBe(true);
    expect(byKey.get("show_icon")!.default).toBe(true);
    expect(byKey.get("comparison_preset")!.default).toBe("year_over_year");
    expect(byKey.get("interpretation")!.default).toBe("consumption");
    expect(byKey.get("neutral_interpretation")!.default).toBe(2);
    expect(byKey.get("period_offset")!.default).toBe(-1);
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
    expect(byKey.get("debug")!.default).toBe(false);
  });
});
