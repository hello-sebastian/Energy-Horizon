import { describe, it, expect } from "vitest";
import {
  preservativeMerge,
  hasConfigDelta,
  deepEqual,
  EMIT_DEBOUNCE_MS,
  YAML_PARSE_DEBOUNCE_MS,
  YAML_EMIT_DEBOUNCE_MS
} from "../../src/card/editor/config-merge";
import type { CardConfig } from "../../src/card/types";

function baseConfig(): CardConfig {
  return {
    type: "custom:energy-horizon-card",
    entity: "sensor.power",
    title: "My card",
    comparison_preset: "year_over_year",
    period_offset: -1,
    time_window: { anchor: "start_of_year", duration: "1y", count: 2 },
    // Unmodeled / legacy / unknown keys that must survive the round-trip.
    comparison_mode: "year_over_year",
    forecast: true,
    some_future_key: { nested: 1, list: [1, 2, 3] },
    unknown_scalar: "keep-me"
  } as CardConfig;
}

describe("preservativeMerge (research R3, FR-908-P)", () => {
  it("sets a top-level scalar by path", () => {
    const out = preservativeMerge(baseConfig(), { title: "New title" });
    expect(out.title).toBe("New title");
    expect(out.entity).toBe("sensor.power");
  });

  it("copies every unmodeled / unknown key through unchanged", () => {
    const out = preservativeMerge(baseConfig(), { title: "New title" });
    expect(out.comparison_mode).toBe("year_over_year");
    expect(out.forecast).toBe(true);
    expect(out.some_future_key).toEqual({ nested: 1, list: [1, 2, 3] });
    expect(out.unknown_scalar).toBe("keep-me");
  });

  it("merges time_window key-by-key (editing count preserves offset/duration)", () => {
    const base = {
      type: "custom:energy-horizon-card",
      entity: "sensor.power",
      comparison_preset: "custom",
      time_window: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 2,
        offset: "P1M"
      }
    } as CardConfig;
    const out = preservativeMerge(base, { "time_window.count": 3 });
    expect(out.time_window?.count).toBe(3);
    expect(out.time_window?.anchor).toBe("start_of_month");
    expect(out.time_window?.duration).toBe("1M");
    expect(out.time_window?.step).toBe("1M");
    expect(out.time_window?.offset).toBe("P1M");
  });

  it("creates the time_window object when absent", () => {
    const base = {
      type: "custom:energy-horizon-card",
      entity: "sensor.power",
      comparison_preset: "custom"
    } as CardConfig;
    const out = preservativeMerge(base, { "time_window.count": 3 });
    expect(out.time_window?.count).toBe(3);
  });

  it("deletes a key when the normalized value is empty (adaptive / cleared)", () => {
    const base = {
      type: "custom:energy-horizon-card",
      entity: "sensor.power",
      aggregation: "day",
      title: "x"
    } as CardConfig;
    const out = preservativeMerge(base, { aggregation: undefined });
    expect("aggregation" in out).toBe(false);
    // Empty string also clears.
    const out2 = preservativeMerge(base, { title: "" });
    expect("title" in out2).toBe(false);
  });

  it("does not mutate the base object", () => {
    const base = baseConfig();
    const snapshot = JSON.parse(JSON.stringify(base));
    preservativeMerge(base, { title: "changed", "time_window.count": 9 });
    expect(base).toEqual(snapshot);
  });

  it("applies multiple changes in one call", () => {
    const out = preservativeMerge(baseConfig(), {
      title: "A",
      "time_window.count": 5,
      precision: 3
    });
    expect(out.title).toBe("A");
    expect(out.time_window?.count).toBe(5);
    expect(out.precision).toBe(3);
  });
});

describe("hasConfigDelta / deepEqual (research R5, FR-908-N)", () => {
  it("equal objects → no delta", () => {
    const a = baseConfig();
    const b = { ...a, time_window: { ...a.time_window } } as CardConfig;
    expect(hasConfigDelta(a, b)).toBe(false);
  });

  it("reference identity alone is NOT sufficient (re-created equal object → no delta)", () => {
    const a = baseConfig();
    const b = JSON.parse(JSON.stringify(a)) as CardConfig;
    expect(a).not.toBe(b); // different references
    expect(hasConfigDelta(a, b)).toBe(false); // but structurally equal
  });

  it("a genuine value change → delta", () => {
    const a = baseConfig();
    const b = { ...a, title: "different" } as CardConfig;
    expect(hasConfigDelta(a, b)).toBe(true);
  });

  it("is robust to key order (HA round-trip normalization)", () => {
    const a = { type: "x", entity: "e", title: "t" } as CardConfig;
    const b = { title: "t", entity: "e", type: "x" } as CardConfig;
    expect(hasConfigDelta(a, b)).toBe(false);
  });

  it("is robust to scalar type coercion (numeric string ≡ number)", () => {
    const a = { type: "x", entity: "e", precision: 2 } as CardConfig;
    const b = { type: "x", entity: "e", precision: "2" } as CardConfig;
    expect(hasConfigDelta(a, b)).toBe(false);
  });

  it("treats undefined and empty string as equivalent (absent)", () => {
    const a = { type: "x", entity: "e" } as CardConfig;
    const b = { type: "x", entity: "e", title: "" } as CardConfig;
    expect(hasConfigDelta(a, b)).toBe(false);
  });

  it("detects a nested change", () => {
    const a = baseConfig();
    const b = { ...a, time_window: { ...a.time_window, count: 9 } } as CardConfig;
    expect(hasConfigDelta(a, b)).toBe(true);
  });

  it("deepEqual handles arrays and null distinctly", () => {
    expect(deepEqual({ a: [1, 2, 3] }, { a: [1, 2, 3] })).toBe(true);
    expect(deepEqual({ a: [1, 2] }, { a: [1, 2, 3] })).toBe(false);
    expect(deepEqual({ a: null }, { a: undefined })).toBe(true); // both absent
    expect(deepEqual({ a: null }, { a: 0 })).toBe(false);
  });
});

describe("debounce constants (research R1 / R13)", () => {
  it("exposes the documented constants", () => {
    expect(EMIT_DEBOUNCE_MS).toBe(300);
    expect(YAML_PARSE_DEBOUNCE_MS).toBe(150);
    expect(YAML_EMIT_DEBOUNCE_MS).toBe(1000);
  });
});
