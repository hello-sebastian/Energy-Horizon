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
