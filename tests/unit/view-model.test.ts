import { describe, it, expect } from "vitest";
import {
  buildCardViewModel,
  type ReadyCardViewModel
} from "../../src/card/view-model";
import { createLocalize } from "../../src/card/localize";
import type { HomeAssistant } from "../../src/ha-types";
import type {
  CardConfig,
  CardState,
  ChartTimeContext,
  ComparisonPeriod,
  ComparisonSeries,
  ReadyState,
  ResolvedWindow
} from "../../src/card/types";

// 911/TD-9 (FR-903-AA): unit tests for the pure card view model.
// Deterministic formatting: `number_format: "decimal"` pins the number
// locale to "en" (in the node test environment `navigator` is undefined,
// so the "system" fallback would depend on the host language).

const ENTITY = "sensor.power";

const hass: HomeAssistant = {
  language: "en",
  locale: { language: "en", number_format: "decimal", time_format: "24" },
  config: { time_zone: "UTC" },
  states: {
    [ENTITY]: {
      state: "10.0",
      attributes: {
        friendly_name: "Power Meter",
        unit_of_measurement: "kWh"
      }
    }
  },
  connection: { sendMessagePromise: async () => ({}) }
};

const config: CardConfig = {
  type: "custom:energy-horizon-card",
  entity: ENTITY,
  comparison_preset: "year_over_year",
  number_format: "decimal"
};

const localize = createLocalize("en");

const w0: ResolvedWindow = {
  index: 0,
  id: "w0",
  role: "current",
  start: new Date("2025-01-01T00:00:00Z"),
  end: new Date("2025-01-15T00:00:00Z"),
  aggregation: "day"
};
const w1: ResolvedWindow = {
  index: 1,
  id: "w1",
  role: "reference",
  start: new Date("2024-01-01T00:00:00Z"),
  end: new Date("2024-01-15T00:00:00Z"),
  aggregation: "day"
};

const period: ComparisonPeriod = {
  current_start: w0.start,
  current_end: w0.end,
  reference_start: w1.start,
  reference_end: w1.end,
  aggregation: "day",
  time_zone: "UTC"
};

const chartTime: ChartTimeContext = {
  timeline: [],
  alignStartsMs: [],
  forecastPeriodBuckets: 0,
  tailLabelFromIndex: 0
};

function readyState(overrides: Partial<ReadyState> = {}): ReadyState {
  const base: ReadyState = {
    status: "ready",
    comparisonSeries: {
      current: {
        points: [
          { timestamp: 1735689600000, value: 5, rawValue: 5 },
          { timestamp: 1735776000000, value: 10, rawValue: 5 }
        ],
        unit: "kWh",
        periodLabel: "2025",
        total: 10
      },
      reference: {
        points: [
          { timestamp: 1704067200000, value: 5, rawValue: 5 },
          { timestamp: 1704153600000, value: 15, rawValue: 10 }
        ],
        unit: "kWh",
        periodLabel: "2024",
        total: 15
      },
      aggregation: "day",
      time_zone: "UTC"
    },
    summary: {
      current_cumulative: 100,
      reference_cumulative: 90,
      difference: 10,
      differencePercent: 11.11,
      unit: "kWh"
    },
    forecast: {
      enabled: true,
      forecast_total: 110,
      confidence: "medium",
      unit: "kWh"
    },
    textSummary: { trend: "higher", diffValue: 10, unit: "kWh" },
    period,
    resolvedWindows: [w0, w1],
    mergedTimeWindow: { comparisonMode: "year_over_year", step: "1d" },
    chartTime,
    preview: { shift: 0 }
  };
  return { ...base, ...overrides };
}

function ready(
  state: ReadyState = readyState(),
  cfg: CardConfig = config
): ReadyCardViewModel {
  const vm = buildCardViewModel(state, cfg, hass, localize);
  if (vm.status !== "ready") {
    throw new Error(`expected ready view model, got ${vm.status}`);
  }
  return vm;
}

describe("buildCardViewModel (911/TD-9, FR-903-AA)", () => {
  it("ready: header values from config and the entity state", () => {
    const vm = ready();
    expect(vm.showTitle).toBe(true);
    expect(vm.showIcon).toBe(true);
    expect(vm.shouldRenderHeader).toBe(true);
    expect(vm.effectiveTitle).toBe("Power Meter");
    expect(vm.effectiveIcon).toBeUndefined();
    expect(vm.entityState?.state).toBe("10.0");
  });

  it("ready: header gating — config title wins, show_title/show_icon hide the row", () => {
    expect(ready(readyState(), { ...config, title: "My Title" }).effectiveTitle).toBe("My Title");
    expect(ready(readyState(), { ...config, icon: "mdi:solar-panel" }).effectiveIcon).toBe("mdi:solar-panel");
    expect(
      ready(readyState(), { ...config, show_title: false, show_icon: false })
        .shouldRenderHeader
    ).toBe(false);
  });

  it("ready: comparison numbers, chip and captions (en locale, precision 2)", () => {
    const vm = ready();
    expect(vm.displayUnit).toBe("kWh");
    expect(vm.currentSummaryNumber).toBe("100.00");
    expect(vm.referenceSummaryNumber).toBe("90.00");
    expect(vm.deltaChipAbs).toBe("+10.00 kWh");
    expect(vm.deltaChipPct).toBe("+11.1 %");
    expect(vm.singleWindow).toBe(false);
    expect(vm.showComparisonSection).toBe(true);
    expect(vm.currentCaptionText).toBe("1 Jan – 15 Jan 2025");
    expect(vm.referenceCaptionText).toBe("1 Jan – 15 Jan 2024");
    expect(vm.currentPeriodLabelFull).toBe("Current period (1 Jan – 15 Jan 2025)");
    expect(vm.referencePeriodLabelFull).toBe("Reference period (1 Jan – 15 Jan 2024)");
  });

  it("ready: unit falls back to the entity's unit_of_measurement", () => {
    const vm = ready(
      readyState({
        summary: {
          current_cumulative: 100,
          reference_cumulative: 90,
          difference: 10,
          differencePercent: 11.11,
          unit: ""
        }
      })
    );
    expect(vm.displayUnit).toBe("kWh");
  });

  it("ready: forecast | total panel values", () => {
    const vm = ready();
    expect(vm.showForecastTotalPanel).toBe(true);
    expect(vm.forecastUnit).toBe("kWh");
    expect(vm.forecastValueText).toBe("110.00");
    expect(vm.forecastConfidenceText).toBe(
      localize("forecast.confidence", {
        confidence: localize("forecast.confidence.medium")
      })
    );
    expect(vm.forecastConfidenceText).toBe("Forecast confidence level: medium.");
    // Sum of the reference series' rawValue increments (5 + 10).
    expect(vm.panelTotalText).toBe("15.00");
  });

  it("ready: panel gated by show_forecast_total_panel only (independent of the forecast line)", () => {
    const vm = ready(
      readyState(),
      { ...config, show_forecast: false, show_forecast_total_panel: false }
    );
    expect(vm.showForecastTotalPanel).toBe(false);
    expect(ready(readyState(), { ...config, show_forecast: false }).showForecastTotalPanel).toBe(true);
  });

  it("ready: disabled forecast — placeholder value, hint text, warning line", () => {
    const vm = ready(
      readyState({
        forecast: {
          enabled: false,
          confidence: "low",
          unit: "kWh",
          disabledReason: "no_split"
        }
      })
    );
    expect(vm.forecastValueText).toBeNull();
    expect(vm.forecastConfidenceText).toBe(localize("forecast.disabled.hint"));
    expect(vm.showWarningStrip).toBe(true);
    expect(vm.warningMessages).toEqual([
      localize("forecast.disabled.no_split")
    ]);
  });

  it("ready: incomplete reference — warning line + placeholder reference value", () => {
    const vm = ready(
      readyState({
        summary: { current_cumulative: 100, unit: "kWh" },
        forecast: {
          enabled: false,
          confidence: "low",
          unit: "kWh",
          disabledReason: "no_reference"
        }
      })
    );
    expect(vm.referenceSummaryNumber).toBeNull();
    expect(vm.deltaChipAbs).toBe("--- kWh");
    expect(vm.deltaChipPct).toBe("--- %");
    expect(vm.showWarningStrip).toBe(true);
    expect(vm.warningMessages).toEqual([
      localize("summary.incomplete_reference"),
      localize("forecast.disabled.no_reference")
    ]);
  });

  it("ready: semantics — consumption with a positive difference is the negative outcome", () => {
    const vm = ready();
    expect(vm.semTone).toBe("ebc-trend--negative");
    expect(vm.semIcon).toBe("mdi:trending-up");
  });

  it("ready: narrative body is rendered for a computable comparison", () => {
    const vm = ready();
    expect(vm.narrativeBody).not.toBeNull();
    expect(vm.showNarrativeSection).toBe(true);
  });

  it("ready: show_narrative_comment hides the narrative section", () => {
    const vm = ready(readyState(), { ...config, show_narrative_comment: false });
    expect(vm.narrativeBody).not.toBeNull();
    expect(vm.showNarrativeSection).toBe(false);
  });

  it("ready: no preview at the default shift — empty indication, no no-data flag", () => {
    const vm = ready();
    expect(vm.previewIndicationText).toBe("");
    expect(vm.previewChartNoData).toBe(false);
  });

  it("ready: preview snapshot — localized indication from the shifted window", () => {
    const vm = ready(
      readyState({
        preview: {
          shift: -1,
          windows: [
            {
              index: 0,
              id: "w0",
              role: "current",
              start: new Date("2024-01-01T00:00:00Z"),
              end: new Date("2024-01-15T00:00:00Z"),
              aggregation: "day"
            }
          ],
          chartTime,
          series: {
            current: { points: [], unit: "kWh", periodLabel: "2024", total: 0 },
            aggregation: "day",
            time_zone: "UTC"
          }
        }
      })
    );
    // Jan-1 start → the year alone (FR-010 period label).
    expect(vm.previewIndicationText).toBe("Preview: 2024");
    expect(vm.previewChartNoData).toBe(false);
  });

  it("ready: preview snapshot without series — no-data overlay flag", () => {
    const vm = ready(
      readyState({
        preview: {
          shift: -1,
          windows: [
            {
              index: 0,
              id: "w0",
              role: "current",
              start: new Date("2024-01-01T00:00:00Z"),
              end: new Date("2024-01-15T00:00:00Z"),
              aggregation: "day"
            }
          ],
          chartTime
        }
      })
    );
    expect(vm.previewIndicationText).toBe("Preview: 2024");
    expect(vm.previewChartNoData).toBe(true);
  });

  it("ready: single-window mode — no reference values, chip, panel total or narrative", () => {
    const vm = ready(
      readyState({
        comparisonSeries: {
          current: {
            points: [{ timestamp: 1735689600000, value: 100, rawValue: 100 }],
            unit: "kWh",
            periodLabel: "2025",
            total: 100
          },
          aggregation: "day",
          time_zone: "UTC"
        },
        summary: { current_cumulative: 100, unit: "kWh" },
        forecast: { enabled: false, confidence: "low", unit: "kWh" },
        textSummary: { trend: "unknown", unit: "kWh" },
        resolvedWindows: [w0]
      })
    );
    expect(vm.singleWindow).toBe(true);
    expect(vm.referenceSummaryNumber).toBeNull();
    expect(vm.deltaChipAbs).toBe("");
    expect(vm.deltaChipPct).toBe("");
    expect(vm.panelTotalText).toBeNull();
    expect(vm.narrativeBody).toBeNull();
    expect(vm.showNarrativeSection).toBe(false);
    // No reference cumulative → the insufficient-data semantics (muted).
    expect(vm.semTone).toBe("ebc-trend--insufficient");
    expect(vm.semIcon).toBe("mdi:help-circle-outline");
    expect(vm.warningMessages).toEqual([]);
  });

  it("loading: pass-through", () => {
    const state: CardState = { status: "loading" };
    expect(buildCardViewModel(state, config, hass, localize)).toEqual({
      status: "loading"
    });
  });

  it("no-data: pass-through", () => {
    const state: CardState = { status: "no-data" };
    expect(buildCardViewModel(state, config, hass, localize)).toEqual({
      status: "no-data"
    });
  });

  it("error: message key + params pass-through (the element localizes)", () => {
    const state: CardState = {
      status: "error",
      errorMessage: "status.error_api",
      errorParams: { max: 3 }
    };
    expect(buildCardViewModel(state, config, hass, localize)).toEqual({
      status: "error",
      messageKey: "status.error_api",
      errorParams: { max: 3 }
    });
  });

  it("error without a message falls back to the generic key (defensive; the type makes it non-null)", () => {
    const state = { status: "error" } as CardState;
    const vm = buildCardViewModel(state, config, hass, localize);
    expect(vm).toEqual({
      status: "error",
      messageKey: "status.error_generic",
      errorParams: undefined
    });
  });
});
