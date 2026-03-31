import { describe, it, expect } from "vitest";
import { formatTooltipHeader } from "../../src/card/axis/tooltip-format";

const zone = "UTC";

describe("formatTooltipHeader", () => {
  it("uses month-only for month aggregation", () => {
    const ms = Date.UTC(2026, 2, 15);
    const s = formatTooltipHeader({
      slotIndex: 0,
      fullTimeline: [ms],
      zone,
      labelLocale: "en-US",
      primaryAggregation: "month",
      mergedDurationMs: 86400000 * 90
    });
    expect(s).toMatch(/March/i);
    expect(s).not.toMatch(/2026/);
  });

  it("uses day + month without year for day aggregation", () => {
    const ms = Date.UTC(2026, 2, 15);
    const s = formatTooltipHeader({
      slotIndex: 0,
      fullTimeline: [ms],
      zone,
      labelLocale: "en-US",
      primaryAggregation: "day",
      mergedDurationMs: 86400000 * 30
    });
    expect(s).toMatch(/15/);
    expect(s).toMatch(/March/i);
    expect(s).not.toMatch(/2026/);
  });

  it("EC2: hour aggregation + duration > 1 day appends day disambiguation", () => {
    const ms = Date.UTC(2026, 2, 15, 14, 0, 0);
    const s = formatTooltipHeader({
      slotIndex: 0,
      fullTimeline: [ms],
      zone,
      labelLocale: "en-US",
      primaryAggregation: "hour",
      mergedDurationMs: 3 * 86400000
    });
    expect(s).toContain(",");
    expect(s).toMatch(/Mar/i);
  });

  it("hour aggregation within one day shows time only", () => {
    const ms = Date.UTC(2026, 2, 15, 14, 0, 0);
    const s = formatTooltipHeader({
      slotIndex: 0,
      fullTimeline: [ms],
      zone,
      labelLocale: "en-US",
      primaryAggregation: "hour",
      mergedDurationMs: 12 * 3600000
    });
    expect(s).not.toContain(",");
  });

  it("respects forced Luxon tooltip_format", () => {
    const ms = Date.UTC(2026, 2, 15, 14, 30, 0);
    const s = formatTooltipHeader({
      slotIndex: 0,
      fullTimeline: [ms],
      zone,
      labelLocale: "en-US",
      primaryAggregation: "day",
      mergedDurationMs: 86400000,
      tooltipFormatPattern: "yyyy-MM-dd"
    });
    expect(s).toBe("2026-03-15");
  });
});
