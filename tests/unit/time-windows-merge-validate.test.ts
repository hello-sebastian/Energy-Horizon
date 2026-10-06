import { describe, it, expect } from "vitest";
import {
  mergeTimeWindowConfig,
  validateMergedTimeWindowConfig
} from "../../src/card/time-windows";

describe("time-windows merge + validate", () => {
  it("merges YAML duration only and keeps preset fields (SC-004)", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: { duration: "2y" },
      periodOffset: -1
    });
    expect(merged.duration).toBe("2y");
    expect(merged.anchor).toBe("start_of_year");
    expect(merged.currentEndIsNow).toBe(true);
    expect(merged.referenceFullPeriod).toBe(true);
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(true);
  });

  it("rejects non-positive step", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: { step: "0d" },
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.errorKey).toBe("status.config_invalid_time_window");
    }
  });

  it("rejects count above maxWindows (25 > 24)", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 25
      },
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig(merged);
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.errorKey).toBe("status.config_too_many_windows");
    }
  });

  it("structural YAML override strips legacy flags; validate still runs (FR-F, no silent preset restore)", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 2
      },
      periodOffset: -1
    });
    expect(merged.currentEndIsNow).toBeUndefined();
    expect(merged.referenceFullPeriod).toBeUndefined();
    const v = validateMergedTimeWindowConfig({
      ...merged,
      aggregation: "day"
    });
    expect(v.ok).toBe(true);
  });

  it("rejects invalid ISO offset (sub-hour) with standard invalid time_window key", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 2,
        offset: "PT30M"
      },
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig({ ...merged, aggregation: "day" });
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.errorKey).toBe("status.config_invalid_time_window");
    }
  });

  it("rejects fractional-month offset with standard invalid time_window key", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 2,
        offset: "P0.5M"
      },
      periodOffset: -1
    });
    const v = validateMergedTimeWindowConfig({ ...merged, aggregation: "day" });
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.errorKey).toBe("status.config_invalid_time_window");
    }
  });

  it("US-900-5: count 25 still returns too-many-windows; invalid offset stays invalid time_window", () => {
    const tooMany = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 25,
        offset: "PT30M"
      },
      periodOffset: -1
    });
    const vMany = validateMergedTimeWindowConfig({
      ...tooMany,
      aggregation: "day"
    });
    expect(vMany.ok).toBe(false);
    if (!vMany.ok) {
      expect(vMany.errorKey).toBe("status.config_too_many_windows");
    }

    const badOffset = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 2,
        offset: "garbage-offset"
      },
      periodOffset: -1
    });
    const vOff = validateMergedTimeWindowConfig({
      ...badOffset,
      aggregation: "day"
    });
    expect(vOff.ok).toBe(false);
    if (!vOff.ok) {
      expect(vOff.errorKey).toBe("status.config_invalid_time_window");
    }
  });

  it("rejects empty required fields after destructive merge", () => {
    const merged = mergeTimeWindowConfig({
      mode: "year_over_year",
      timeWindowPartial: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 2
      },
      periodOffset: -1
    });
    const broken = { ...merged, duration: "" };
    const v = validateMergedTimeWindowConfig(broken);
    expect(v.ok).toBe(false);
  });
});
