import { describe, it, expect } from "vitest";
import {
  semanticMdiIcon,
  semanticResolvedLineColor,
  semanticToneClass,
  trendMdiIcon,
  trendResolvedLineColor,
  trendToneClass
} from "../../src/card/trend-visual";
import type { ChartThemeResolved, Trend } from "../../src/card/types";

const mockTheme: ChartThemeResolved = {
  seriesCurrent: "#1",
  seriesReference: "#2",
  referenceDotBorder: "#3",
  grid: "#4",
  primaryText: "#5",
  secondaryText: "#5b",
  tooltipBackground: "#6",
  tooltipBorder: "#7",
  todayFullHeightLine: "#8",
  trendHigher: "#e1",
  trendLower: "#e2",
  trendSimilar: "#e3",
  trendUnknown: "#e4",
  trendMuted: "#e5"
};

describe("trend-visual", () => {
  it("maps trend to resolved delta line color from theme", () => {
    expect(trendResolvedLineColor(mockTheme, "higher")).toBe("#e1");
    expect(trendResolvedLineColor(mockTheme, "lower")).toBe("#e2");
    expect(trendResolvedLineColor(mockTheme, "similar")).toBe("#e3");
    expect(trendResolvedLineColor(mockTheme, "unknown")).toBe("#e4");
    expect(trendResolvedLineColor(mockTheme, undefined)).toBe("#e4");
  });

  it("maps semantic outcomes to tone, icon, and line color", () => {
    expect(semanticToneClass("positive")).toBe("ebc-trend--positive");
    expect(semanticToneClass("insufficient_data")).toBe("ebc-trend--insufficient");
    expect(semanticResolvedLineColor(mockTheme, "positive")).toBe("#e2");
    expect(semanticResolvedLineColor(mockTheme, "insufficient_data")).toBe("#e5");
    expect(semanticMdiIcon("positive", 5)).toBe("mdi:trending-up");
    expect(semanticMdiIcon("positive", -5)).toBe("mdi:trending-down");
    expect(semanticMdiIcon("insufficient_data", 0)).toBe("mdi:help-circle-outline");
  });

  it("maps each trend to an MDI id and tone class", () => {
    const cases: Array<{ t: Trend; icon: string; cls: string }> = [
      { t: "higher", icon: "mdi:trending-up", cls: "ebc-trend--negative" },
      { t: "lower", icon: "mdi:trending-down", cls: "ebc-trend--positive" },
      { t: "similar", icon: "mdi:minus", cls: "ebc-trend--neutral" },
      { t: "unknown", icon: "mdi:help-circle-outline", cls: "ebc-trend--unknown" }
    ];
    for (const { t, icon, cls } of cases) {
      expect(trendMdiIcon(t)).toBe(icon);
      expect(trendToneClass(t)).toBe(cls);
    }
  });
});
