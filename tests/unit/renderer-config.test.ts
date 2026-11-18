import { describe, expect, it, vi } from "vitest";
import type { HomeAssistant } from "../../src/ha-types";
import type {
  CardConfig,
  CardState,
  MergedTimeWindowConfig,
  ReadyState
} from "../../src/card/types";
import type { InterpretationSemanticsResult } from "../../src/card/interpretation-semantics";
import { buildMergedTimeWindowConfig } from "../../src/card/time-windows";
import { buildPickerDemoState } from "../../src/card/picker/attach-picker";
import {
  buildRendererConfig,
  clampOpacity,
  isForecastLineVisible,
  resolveChartTheme,
  type RendererConfigHost
} from "../../src/card/renderer-config";

const NOW = new Date("2025-06-15T12:00:00Z");
const YEAR_MS = 31_536_000_000;

const DEFAULT_MERGED: MergedTimeWindowConfig = buildMergedTimeWindowConfig({
  comparison_preset: "year_over_year"
});

function makeHass(): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" }
  } as unknown as HomeAssistant;
}

function makeConfig(overrides: Partial<CardConfig> = {}): CardConfig {
  return {
    type: "custom:energy-horizon-card",
    entity: "sensor.energy",
    comparison_preset: "year_over_year",
    interpretation: "consumption",
    neutral_threshold: 2,
    ...overrides
  } as CardConfig;
}

/**
 * Minimal `:host` double: plain node has no `getComputedStyle`, so every CSS
 * token takes its documented fallback; `style` only needs the three methods
 * `resolveSeriesCurrentColor` touches.
 */
function makeFakeNode(): HTMLElement {
  return {
    style: {
      getPropertyValue: () => "",
      setProperty: () => undefined,
      removeProperty: () => ""
    }
  } as unknown as HTMLElement;
}

function makeHost(
  state: CardState,
  overrides: Partial<RendererConfigHost> = {}
): RendererConfigHost {
  return {
    hass: makeHass(),
    cardConfig: makeConfig(),
    state,
    hostNode: makeFakeNode(),
    localizeOrError: vi.fn((key: string) => key),
    interpretationSemantics: vi.fn(
      (): InterpretationSemanticsResult => ({ outcome: "insufficient_data" })
    ),
    mergedDurationMs: vi.fn(() => YEAR_MS),
    ...overrides
  };
}

/** A ready state from the deterministic demo pipeline (unit "kWh"). */
function demoState(
  config = makeConfig(),
  merged = DEFAULT_MERGED
): ReadyState {
  return buildPickerDemoState(makeHass(), config, merged, NOW) as ReadyState;
}

describe("clampOpacity", () => {
  it("keeps in-range numeric values", () => {
    expect(clampOpacity(0)).toBe(0);
    expect(clampOpacity(30)).toBe(30);
    expect(clampOpacity(100)).toBe(100);
  });

  it("coerces numeric strings", () => {
    expect(clampOpacity("75")).toBe(75);
  });

  it("falls back to 30 for absent, non-numeric, or out-of-range values", () => {
    expect(clampOpacity(150)).toBe(30);
    expect(clampOpacity(-1)).toBe(30);
    expect(clampOpacity("abc")).toBe(30);
    expect(clampOpacity(undefined)).toBe(30);
    expect(clampOpacity(Number.NaN)).toBe(30);
    // Preserved original quirk: Number(null) === 0, an in-range value.
    expect(clampOpacity(null)).toBe(0);
  });
});

describe("isForecastLineVisible", () => {
  it("is on by default", () => {
    expect(isForecastLineVisible(makeConfig())).toBe(true);
    expect(isForecastLineVisible(makeConfig({ show_forecast: true }))).toBe(
      true
    );
  });

  it("is off only for an explicit show_forecast: false", () => {
    expect(isForecastLineVisible(makeConfig({ show_forecast: false }))).toBe(
      false
    );
  });
});

describe("resolveChartTheme", () => {
  it("resolves the documented fallbacks when getComputedStyle is absent (plain node)", () => {
    const theme = resolveChartTheme(makeFakeNode(), "#ff0000");
    expect(theme.seriesCurrent).toBe("#119894");
    expect(theme.seriesReference).toBe("rgba(127, 127, 127, 0.4)");
    expect(theme.grid).toBe("rgba(127, 127, 127, 0.3)");
    expect(theme.primaryText).toBe("rgba(0, 0, 0, 0.87)");
    expect(theme.secondaryText).toBe("rgba(0, 0, 0, 0.87)");
    expect(theme.tooltipBackground).toBe("#ffffff");
    expect(theme.referenceDotBorder).toBe("#ffffff");
    expect(theme.trendHigher).toBe("#f44336");
    expect(theme.trendLower).toBe("#4caf50");
  });
});

describe("buildRendererConfig", () => {
  it("returns a placeholder config for a non-ready state", () => {
    const host = makeHost({ status: "loading" });
    const rc = buildRendererConfig(host, [1, 2, 3]);
    expect(rc.unit).toBe("");
    expect(rc.periodLabel).toBe("");
    expect(rc.chartTrend).toBe("unknown");
    expect(rc.chartSemanticOutcome).toBe("insufficient_data");
    expect(rc.forecastTotal).toBeUndefined();
    expect(rc.showReferenceComparison).toBe(false);
    expect(rc.singleWindowMode).toBe(true);
    expect(rc.showForecast).toBe(true);
    expect(rc.primaryAggregation).toBe("day");
    expect(rc.comparisonMode).toBe("year_over_year");
    expect(rc.language).toBe("en");
    expect(rc.haTimeZone).toBe("UTC");
    expect(rc.fullTimeline).toEqual([1, 2, 3]);
    expect(rc.mergedDurationMs).toBe(YEAR_MS);
    expect(host.localizeOrError).toHaveBeenCalledWith("forecast.current_forecast");
    expect(rc.forecastLabel).toBe("forecast.current_forecast");
  });

  it("builds the ready config from a ready state", () => {
    const state = demoState();
    const host = makeHost(state);
    const rc = buildRendererConfig(host);
    expect(rc.unit).toBe("kWh");
    expect(rc.periodLabel).not.toBe("");
    expect(rc.singleWindowMode).toBe(false);
    expect(rc.showForecast).toBe(true);
    expect(rc.showReferenceComparison).toBe(true);
    expect(rc.forecastTotal).toBeTypeOf("number");
    expect(rc.language).toBe("en");
    expect(rc.numberLocale).toBe("en");
    expect(rc.haTimeZone).toBe("UTC");
    expect(rc.chartTrend).toBe(state.textSummary.trend);
    expect(rc.chartSemanticOutcome).toBe("insufficient_data");
    expect(host.interpretationSemantics).toHaveBeenCalledTimes(1);
    expect(rc.currentWindowStartMs).toBe(Date.UTC(2025, 0, 1));
    expect(rc.windowAlignStartsMs?.length).toBe(2);
    expect(rc.panelReferenceCumulative).toBeTypeOf("number");
    expect(rc.mergedDurationMs).toBe(YEAR_MS);
  });

  it("hides the forecast line for show_forecast: false", () => {
    const config = makeConfig({ show_forecast: false });
    const host = makeHost(demoState(config), { cardConfig: config });
    expect(buildRendererConfig(host).showForecast).toBe(false);
  });

  it("clamps out-of-range fill opacities", () => {
    const config = makeConfig({
      fill_current_opacity: 250,
      fill_reference_opacity: 40
    });
    const host = makeHost(demoState(config), { cardConfig: config });
    const rc = buildRendererConfig(host);
    expect(rc.fillCurrentOpacity).toBe(30);
    expect(rc.fillReferenceOpacity).toBe(40);
  });

  it("honors a forced x-axis format over the adaptive mode", () => {
    const config = makeConfig({ x_axis_format: "HH:mm" });
    const host = makeHost(demoState(config), { cardConfig: config });
    const rc = buildRendererConfig(host);
    expect(rc.xAxisMode).toBe("forced");
    expect(rc.xAxisFormatPattern).toBe("HH:mm");
  });

  it("uses the adaptive x-axis mode when no format is forced", () => {
    const rc = buildRendererConfig(makeHost(demoState()));
    expect(rc.xAxisMode).toBe("adaptive");
    expect(rc.xAxisFormatPattern).toBeUndefined();
  });

  it("builds a single-window config from a single-window merged config", () => {
    const config = makeConfig();
    const merged: MergedTimeWindowConfig = { ...DEFAULT_MERGED, count: 1 };
    const host = makeHost(demoState(config, merged), { cardConfig: config });
    const rc = buildRendererConfig(host);
    expect(rc.singleWindowMode).toBe(true);
    expect(rc.showForecast).toBe(false);
    expect(rc.showReferenceComparison).toBe(false);
    // forecastTotal is not single-window-gated in the original (verbatim move):
    // the ready state's forecast stats ride through unchanged.
    expect(rc.forecastTotal).toBeTypeOf("number");
    expect(rc.chartSemanticOutcome).toBe("neutral");
    // The original called the semantics unconditionally (result unused in
    // single-window mode) — the verbatim move keeps the call.
    expect(host.interpretationSemantics).toHaveBeenCalledTimes(1);
  });
});
