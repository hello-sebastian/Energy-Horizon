import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup-dom";
import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";
import type {
  CardState,
  ComparisonPeriod,
  ComparisonSeries,
  ResolvedWindow
} from "../../src/card/types";

// Mock ECharts init() so the ready-state renderer path can be exercised in jsdom
// (no canvas) and the ECOption passed to setOption can be captured (909 US3, T012).
const setOptionMock = vi.fn();
const resizeMock = vi.fn();
const disposeMock = vi.fn();
const onMock = vi.fn();
const offMock = vi.fn();
const getModelMock = vi.fn(() => ({ getComponent: vi.fn(() => undefined) }));
const getViewOfComponentModelMock = vi.fn(() => ({
  group: { getBoundingRect: vi.fn(() => ({ height: 48 })) }
}));

vi.mock("echarts/core", () => ({
  init: vi.fn(() => ({
    setOption: setOptionMock,
    resize: resizeMock,
    dispose: disposeMock,
    on: onMock,
    off: offMock,
    getModel: getModelMock,
    getViewOfComponentModel: getViewOfComponentModelMock
  })),
  use: vi.fn()
}));

beforeEach(() => {
  setOptionMock.mockClear();
  resizeMock.mockClear();
  disposeMock.mockClear();
  onMock.mockClear();
  offMock.mockClear();
});

type EnergyHorizonCardEl = import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  _state: unknown;
  updateComplete: Promise<boolean>;
};

function energyCardHass(): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states: {
      "sensor.energy": {
        state: "10",
        attributes: { friendly_name: "Energy", unit_of_measurement: "kWh" }
      }
    },
    connection: {
      sendMessagePromise: async () => ({})
    }
  } as HomeAssistant;
}

function baseYoYReadyState(): CardState {
  const period: ComparisonPeriod = {
    current_start: new Date(Date.UTC(2024, 0, 1)),
    current_end: new Date(Date.UTC(2024, 11, 31)),
    reference_start: new Date(Date.UTC(2023, 0, 1)),
    reference_end: new Date(Date.UTC(2023, 11, 31)),
    aggregation: "day",
    time_zone: "UTC"
  };
  const comparisonSeries: ComparisonSeries = {
    current: {
      points: [{ timestamp: Date.UTC(2024, 0, 1), value: 100 }],
      unit: "kWh",
      periodLabel: "2024",
      total: 100
    },
    reference: {
      points: [{ timestamp: Date.UTC(2023, 0, 1), value: 90 }],
      unit: "kWh",
      periodLabel: "2023",
      total: 90
    },
    aggregation: "day",
    time_zone: "UTC"
  };
  return {
    status: "ready",
    period,
    comparisonSeries,
    resolvedWindows: [
      {
        index: 0,
        id: "a",
        role: "current",
        start: new Date(Date.UTC(2024, 0, 1)),
        end: new Date(Date.UTC(2024, 11, 31)),
        aggregation: "day"
      },
      {
        index: 1,
        id: "b",
        role: "reference",
        start: new Date(Date.UTC(2023, 0, 1)),
        end: new Date(Date.UTC(2023, 11, 31)),
        aggregation: "day"
      }
    ],
    mergedTimeWindow: {
      duration: "1y",
      currentEndIsNow: true,
      referenceFullPeriod: true
    },
    summary: {
      current_cumulative: 100,
      reference_cumulative: 90,
      difference: 10,
      differencePercent: 11.11,
      unit: "kWh"
    },
    textSummary: { trend: "higher", diffValue: 10, unit: "kWh" },
    forecast: {
      enabled: true,
      forecast_total: 120,
      reference_total: 95,
      confidence: "high",
      unit: "kWh"
    }
  };
}

/**
 * Ready state with the forecast disabled (too early in the period) — the
 * month-start scenario. The reference series carries `rawValue` increments so
 * the panel's Total column can compute the full reference-window total.
 */
function disabledForecastReadyState(): CardState {
  const base = baseYoYReadyState();
  return {
    ...base,
    comparisonSeries: {
      ...base.comparisonSeries!,
      reference: {
        ...base.comparisonSeries!.reference!,
        points: [
          { timestamp: Date.UTC(2023, 0, 1), value: 30, rawValue: 30 },
          { timestamp: Date.UTC(2023, 0, 2), value: 60, rawValue: 30 },
          { timestamp: Date.UTC(2023, 0, 3), value: 90, rawValue: 30 }
        ]
      }
    },
    forecast: {
      enabled: false,
      confidence: "low",
      unit: "kWh",
      disabledReason: "insufficient_buckets"
    }
  };
}

describe("energy-horizon-card integration", () => {
  it("can be instantiated without crashing", () => {
    const el = document.createElement("energy-horizon-card");
    document.body.appendChild(el);
    expect(el.shadowRoot).toBeDefined();
  });

  it("renders loading state when state is loading", async () => {
    const el = document.createElement("energy-horizon-card") as import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & { setConfig: (c: unknown) => void; hass: HomeAssistant; _state: unknown };
    document.body.appendChild(el);
    if (typeof (el as { setConfig?: unknown }).setConfig !== "function") {
      // Custom element not defined in this env (e.g. JSDOM); skip assertion
      return;
    }
    // Legacy YAML key (deprecated): must still normalize to comparison_preset internally.
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_mode: "year_over_year"
    });
    expect(
      (el as { _config?: { comparison_preset?: string } })._config?.comparison_preset
    ).toBe("year_over_year");
    el.hass = {
      language: "pl",
      connection: {
        // nigdy nie jest wywołane, bo ręcznie podmieniamy stan
        sendMessagePromise: async () => ({} as unknown)
      }
    } as HomeAssistant;

    // wymuszenie stanu loading
    (el as any)._state = { status: "loading" };
    await el.updateComplete;

    const card = el.shadowRoot!.querySelector("ha-card");
    expect(card).not.toBeNull();
    expect(card!.textContent).toContain("Ładowanie danych statystyk długoterminowych");
  });

  it("renders error state with message", async () => {
    const el = document.createElement("energy-horizon-card") as import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & { setConfig: (c: unknown) => void; hass: HomeAssistant; _state: unknown };
    document.body.appendChild(el);
    if (typeof (el as { setConfig?: unknown }).setConfig !== "function") return;
    el.setConfig({ type: "custom:energy-horizon-card", entity: "sensor.energy", comparison_preset: "year_over_year" });
    el.hass = {
      language: "pl",
      connection: {
        sendMessagePromise: async () => ({} as unknown)
      }
    } as HomeAssistant;

    (el as any)._state = {
      status: "error",
      errorMessage: "Testowy błąd"
    };
    await el.updateComplete;

    const alert = el.shadowRoot!.querySelector("ha-alert");
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toContain("Testowy błąd");
  });

  it("renders no-data state with info alert", async () => {
    const el = document.createElement("energy-horizon-card") as import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & { setConfig: (c: unknown) => void; hass: HomeAssistant; _state: unknown };
    document.body.appendChild(el);
    if (typeof (el as { setConfig?: unknown }).setConfig !== "function") return;
    el.setConfig({ type: "custom:energy-horizon-card", entity: "sensor.energy", comparison_preset: "year_over_year" });
    el.hass = {
      language: "pl",
      connection: {
        sendMessagePromise: async () => ({} as unknown)
      }
    } as HomeAssistant;

    (el as any)._state = {
      status: "no-data"
    };
    await el.updateComplete;

    const alert = el.shadowRoot!.querySelector("ha-alert");
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toContain("Brak danych do wyświetlenia");
  });

  it("forecast section does not contain historical_value row", async () => {
    const el = document.createElement("energy-horizon-card") as import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & { setConfig: (c: unknown) => void; hass: HomeAssistant; _state: unknown };
    document.body.appendChild(el);
    if (typeof (el as { setConfig?: unknown }).setConfig !== "function") return;
    el.setConfig({ type: "custom:energy-horizon-card", entity: "sensor.energy", comparison_preset: "year_over_year" });
    el.hass = {
      language: "en",
      connection: {
        sendMessagePromise: async () => ({} as unknown)
      }
    } as HomeAssistant;

    // A valid ready state (two windows + enabled forecast) so the forecast
    // section actually renders. (The previous inline fake state was malformed
    // and only passed vacuously before the card element upgraded under jsdom.)
    (el as any)._state = baseYoYReadyState();
    await el.updateComplete;

    const shadowText = el.shadowRoot!.textContent || "";
    // Assert that "Historical value" translation key is NOT present
    expect(shadowText).not.toContain("historical_value");
    expect(shadowText).toContain("Forecast");
    expect(shadowText).toContain("Total");
  });

  it("forecast confidence level is rendered in the card language (de)", async () => {
    const el = document.createElement("energy-horizon-card") as import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & { setConfig: (c: unknown) => void; hass: HomeAssistant; _state: unknown };
    document.body.appendChild(el);
    if (typeof (el as { setConfig?: unknown }).setConfig !== "function") return;
    el.setConfig({ type: "custom:energy-horizon-card", entity: "sensor.energy", comparison_preset: "year_over_year", language: "de" });
    el.hass = {
      language: "de",
      locale: { language: "de", number_format: "language" },
      config: { time_zone: "UTC" },
      connection: {
        sendMessagePromise: async () => ({} as unknown)
      }
    } as HomeAssistant;

    // baseYoYReadyState() has forecast.confidence = "high"
    (el as any)._state = baseYoYReadyState();
    await el.updateComplete;

    const shadowText = el.shadowRoot!.textContent || "";
    expect(shadowText).toContain("hoch");
    expect(shadowText).not.toContain("Forecast confidence level");
    document.body.removeChild(el);
  });

  it("ready: delta chip shows placeholders when difference is missing", async () => {
    const el = document.createElement("energy-horizon-card") as import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      _state: unknown;
      updateComplete: Promise<boolean>;
    };
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    const period: ComparisonPeriod = {
      current_start: new Date(Date.UTC(2024, 0, 1)),
      current_end: new Date(Date.UTC(2024, 11, 31)),
      reference_start: new Date(Date.UTC(2023, 0, 1)),
      reference_end: new Date(Date.UTC(2023, 11, 31)),
      aggregation: "day",
      time_zone: "UTC"
    };

    const comparisonSeries: ComparisonSeries = {
      current: {
        points: [{ timestamp: Date.UTC(2024, 0, 1), value: 100 }],
        unit: "kWh",
        periodLabel: "2024",
        total: 100
      },
      reference: {
        points: [{ timestamp: Date.UTC(2023, 0, 1), value: 90 }],
        unit: "kWh",
        periodLabel: "2023",
        total: 90
      },
      aggregation: "day",
      time_zone: "UTC"
    };

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = {
      language: "en",
      locale: { language: "en", number_format: "language" },
      config: { time_zone: "UTC" },
      states: {
        "sensor.energy": {
          state: "10",
          attributes: { friendly_name: "Energy", unit_of_measurement: "kWh" }
        }
      },
      connection: {
        sendMessagePromise: async () => ({})
      }
    } as HomeAssistant;

    const ready: CardState = {
      status: "ready",
      period,
      comparisonSeries,
      resolvedWindows: [
        {
          index: 0,
          id: "a",
          role: "current",
          start: new Date(Date.UTC(2024, 0, 1)),
          end: new Date(Date.UTC(2024, 11, 31)),
          aggregation: "day"
        },
        {
          index: 1,
          id: "b",
          role: "reference",
          start: new Date(Date.UTC(2023, 0, 1)),
          end: new Date(Date.UTC(2023, 11, 31)),
          aggregation: "day"
        }
      ],
      mergedTimeWindow: {
        duration: "1y",
        currentEndIsNow: true,
        referenceFullPeriod: true
      },
      summary: {
        current_cumulative: 100,
        reference_cumulative: 90,
        difference: undefined,
        differencePercent: undefined,
        unit: "kWh"
      },
      textSummary: { trend: "unknown", unit: "kWh" },
      forecast: { enabled: false, confidence: "low", unit: "kWh" }
    };

    (el as { _state: CardState })._state = ready;
    await el.updateComplete;

    const chip = el.shadowRoot?.querySelector(".ebc-delta-chip");
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain("---");
    expect(chip!.textContent).toContain("kWh");
    document.body.removeChild(el);
  });

  it("ready: incomplete reference text only in warning section", async () => {
    const el = document.createElement("energy-horizon-card") as import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      _state: unknown;
      updateComplete: Promise<boolean>;
    };
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    const period: ComparisonPeriod = {
      current_start: new Date(Date.UTC(2024, 0, 1)),
      current_end: new Date(Date.UTC(2024, 11, 31)),
      reference_start: new Date(Date.UTC(2023, 0, 1)),
      reference_end: new Date(Date.UTC(2023, 11, 31)),
      aggregation: "day",
      time_zone: "UTC"
    };

    const comparisonSeries: ComparisonSeries = {
      current: {
        points: [{ timestamp: Date.UTC(2024, 0, 1), value: 100 }],
        unit: "kWh",
        periodLabel: "2024",
        total: 100
      },
      reference: {
        points: [{ timestamp: Date.UTC(2023, 0, 1), value: 90 }],
        unit: "kWh",
        periodLabel: "2023",
        total: 90
      },
      aggregation: "day",
      time_zone: "UTC"
    };

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = {
      language: "en",
      locale: { language: "en", number_format: "language" },
      config: { time_zone: "UTC" },
      states: {
        "sensor.energy": {
          state: "10",
          attributes: { friendly_name: "Energy", unit_of_measurement: "kWh" }
        }
      },
      connection: {
        sendMessagePromise: async () => ({})
      }
    } as HomeAssistant;

    const ready: CardState = {
      status: "ready",
      period,
      comparisonSeries,
      resolvedWindows: [
        {
          index: 0,
          id: "a",
          role: "current",
          start: new Date(Date.UTC(2024, 0, 1)),
          end: new Date(Date.UTC(2024, 11, 31)),
          aggregation: "day"
        },
        {
          index: 1,
          id: "b",
          role: "reference",
          start: new Date(Date.UTC(2023, 0, 1)),
          end: new Date(Date.UTC(2023, 11, 31)),
          aggregation: "day"
        }
      ],
      mergedTimeWindow: {
        duration: "1y",
        currentEndIsNow: true,
        referenceFullPeriod: true
      },
      summary: {
        current_cumulative: 100,
        difference: undefined,
        differencePercent: undefined,
        unit: "kWh"
      },
      textSummary: { trend: "unknown", unit: "kWh" },
      forecast: { enabled: false, confidence: "low", unit: "kWh" }
    };

    (el as { _state: CardState })._state = ready;
    await el.updateComplete;

    const root = el.shadowRoot!;
    const warn = root.querySelector(".ebc-section--warning");
    expect(warn).not.toBeNull();
    expect(warn!.textContent).toContain("Reference data for this period is incomplete");

    const comp = root.querySelector(".ebc-section--comparison");
    expect(comp!.textContent).not.toContain(
      "Reference data for this period is incomplete"
    );
    document.body.removeChild(el);
  });

  it("ready: comparison, forecast panel, and comment sections render by default", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = energyCardHass();
    el._state = baseYoYReadyState();
    await el.updateComplete;

    const root = el.shadowRoot!;
    expect(root.querySelector(".ebc-section--comparison")).not.toBeNull();
    expect(root.querySelector(".ebc-section--forecast-total")).not.toBeNull();
    expect(root.querySelector(".ebc-section--comment")).not.toBeNull();
    document.body.removeChild(el);
  });

  it("ready: interpretation production flips delta chip to success tone when current > ref", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      interpretation: "production"
    });
    el.hass = energyCardHass();
    el._state = baseYoYReadyState();
    await el.updateComplete;

    const chip = el.shadowRoot?.querySelector(".ebc-delta-chip");
    expect(chip?.className).toContain("ebc-trend--positive");
    document.body.removeChild(el);
  });

  it("ready: show_comparison_summary false hides comparison panel", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      show_comparison_summary: false
    });
    el.hass = energyCardHass();
    el._state = baseYoYReadyState();
    await el.updateComplete;

    const root = el.shadowRoot!;
    expect(root.querySelector(".ebc-section--comparison")).toBeNull();
    expect(root.querySelector(".ebc-section--forecast-total")).not.toBeNull();
    document.body.removeChild(el);
  });

  it("ready: show_forecast_total_panel false hides forecast panel only", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      show_forecast_total_panel: false
    });
    el.hass = energyCardHass();
    el._state = baseYoYReadyState();
    await el.updateComplete;

    const root = el.shadowRoot!;
    expect(root.querySelector(".ebc-section--comparison")).not.toBeNull();
    expect(root.querySelector(".ebc-section--forecast-total")).toBeNull();
    expect(root.querySelector(".ebc-section--comment")).not.toBeNull();
    document.body.removeChild(el);
  });

  it("ready: show_narrative_comment false hides comment section", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      show_narrative_comment: false
    });
    el.hass = energyCardHass();
    el._state = baseYoYReadyState();
    await el.updateComplete;

    const root = el.shadowRoot!;
    expect(root.querySelector(".ebc-section--comment")).toBeNull();
    document.body.removeChild(el);
  });

  it("ready: show_forecast false hides forecast line only, panel still visible when show_forecast_total_panel is true", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      show_forecast: false,
      show_forecast_total_panel: true
    });
    el.hass = energyCardHass();
    el._state = baseYoYReadyState();
    await el.updateComplete;

    const root = el.shadowRoot!;
    // The Forecast | Total panel is independent of show_forecast.
    expect(root.querySelector(".ebc-section--forecast-total")).not.toBeNull();
    document.body.removeChild(el);
  });

  it("ready: forecast disabled (too early) — panel still visible with placeholder + reference total + warning line", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      show_forecast: true,
      show_forecast_total_panel: true
    });
    el.hass = energyCardHass();
    el._state = disabledForecastReadyState();
    await el.updateComplete;

    const root = el.shadowRoot!;
    // Panel is NOT removed when the forecast is disabled.
    const panel = root.querySelector(".ebc-section--forecast-total");
    expect(panel).not.toBeNull();
    // Forecast column shows the placeholder (muted), not a fabricated value.
    const muted = panel!.querySelectorAll(".ebc-surface-value-num--muted");
    expect(muted.length).toBeGreaterThanOrEqual(1);
    // Total column shows the full reference-window total (30+30+30 = 90).
    expect(panel!.textContent).toContain("90");
    // Warning bar explains why the forecast is unavailable.
    const warn = root.querySelector(".ebc-section--warning");
    expect(warn).not.toBeNull();
    expect(warn!.textContent).toContain(
      "Forecast not yet available"
    );
    document.body.removeChild(el);
  });

  it.each([
    ["zero_reference_in_range", "no baseline to project from"],
    ["no_reference", "no reference data for this period"],
    ["no_split", "does not cover the elapsed time"]
  ] as const)(
    "ready: forecast disabled (%s) — warning bar shows the reason-specific message",
    async (reason, expectedClause) => {
      const el = document.createElement(
        "energy-horizon-card"
      ) as EnergyHorizonCardEl;
      document.body.appendChild(el);
      if (typeof el.setConfig !== "function") return;

      el.setConfig({
        type: "custom:energy-horizon-card",
        entity: "sensor.energy",
        comparison_preset: "year_over_year",
        show_forecast: true,
        show_forecast_total_panel: true
      });
      el.hass = energyCardHass();
      const state = disabledForecastReadyState();
      state.forecast = {
        enabled: false,
        confidence: "low",
        unit: "kWh",
        disabledReason: reason
      };
      el._state = state;
      await el.updateComplete;

      const root = el.shadowRoot!;
      const warn = root.querySelector(".ebc-section--warning");
      expect(warn).not.toBeNull();
      const text = warn!.textContent ?? "";
      // The reason-specific clause is present...
      expect(text).toContain(expectedClause);
      // ...and the generic fallback message is NOT used.
      expect(text).not.toContain("Forecast not available for this period.");
      document.body.removeChild(el);
    }
  );

  it("ready: forecast disabled — warning bar combines incomplete reference + forecast messages into one bar", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = energyCardHass();
    const state = disabledForecastReadyState();
    // Also make the reference cumulative missing so both warnings apply.
    state.summary = {
      current_cumulative: 100,
      difference: undefined,
      differencePercent: undefined,
      unit: "kWh"
    };
    el._state = state;
    await el.updateComplete;

    const root = el.shadowRoot!;
    // Exactly ONE warning bar (combined), not two stacked bars.
    const bars = root.querySelectorAll(".ebc-section--warning");
    expect(bars.length).toBe(1);
    const text = bars[0]!.textContent ?? "";
    expect(text).toContain("Reference data for this period is incomplete");
    expect(text).toContain("Forecast not yet available");
    // Two lines inside the single bar.
    expect(bars[0]!.querySelectorAll(".ebc-warning-line").length).toBe(2);
    document.body.removeChild(el);
  });

  it("ready: single-window mode — forecast panel visible with Total placeholder", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      show_forecast_total_panel: true
    });
    el.hass = energyCardHass();
    const state = disabledForecastReadyState();
    // Single window: only the current window is resolved, no reference window.
    state.resolvedWindows = [state.resolvedWindows![0]!];
    state.comparisonSeries = {
      ...state.comparisonSeries!,
      reference: undefined
    };
    el._state = state;
    await el.updateComplete;

    const root = el.shadowRoot!;
    // Panel is visible even in single-window mode.
    const panel = root.querySelector(".ebc-section--forecast-total");
    expect(panel).not.toBeNull();
    // Both columns are placeholders (no forecast value, no reference window).
    const muted = panel!.querySelectorAll(".ebc-surface-value-num--muted");
    expect(muted.length).toBe(2);
    // No forecast warning line in single-window mode (forecast is not
    // applicable without a reference window).
    const warn = root.querySelector(".ebc-section--warning");
    expect(warn).toBeNull();
    document.body.removeChild(el);
  });

  it("ready: forecast enabled — no forecast warning line", async () => {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = energyCardHass();
    el._state = baseYoYReadyState();
    await el.updateComplete;

    const root = el.shadowRoot!;
    // baseYoYReadyState has a complete reference cumulative and an enabled
    // forecast, so no warning bar at all.
    expect(root.querySelector(".ebc-section--warning")).toBeNull();
    document.body.removeChild(el);
  });
});

describe("909 US2/US3: transient time-window preview", () => {
  /**
   * Ready state carrying the transient preview fields (909): `previewShift < 0`,
   * the shifted series pair, the shifted window set, and the shifted chart
   * timeline. `singleWindow` drops the reference window/series (US3 scenario 5).
   */
  function previewReadyState(opts: { singleWindow?: boolean } = {}): CardState {
    const base = baseYoYReadyState();
    const single = opts.singleWindow ?? false;
    const previewWindows: ResolvedWindow[] = single
      ? [
          {
            index: 0,
            id: "p0",
            role: "current",
            start: new Date(Date.UTC(2023, 0, 1)),
            end: new Date(Date.UTC(2023, 11, 31)),
            aggregation: "day"
          }
        ]
      : [
          {
            index: 0,
            id: "p0",
            role: "current",
            start: new Date(Date.UTC(2023, 0, 1)),
            end: new Date(Date.UTC(2023, 11, 31)),
            aggregation: "day"
          },
          {
            index: 1,
            id: "p1",
            role: "reference",
            start: new Date(Date.UTC(2022, 0, 1)),
            end: new Date(Date.UTC(2022, 11, 31)),
            aggregation: "day"
          }
        ];
    const previewSeries: ComparisonSeries = {
      current: {
        points: [
          { timestamp: Date.UTC(2023, 0, 1), value: 10 },
          { timestamp: Date.UTC(2023, 0, 2), value: 20 }
        ],
        unit: "kWh",
        periodLabel: "2023",
        total: 30
      },
      reference: single
        ? undefined
        : {
            points: [
              { timestamp: Date.UTC(2022, 0, 1), value: 8 },
              { timestamp: Date.UTC(2022, 0, 2), value: 16 }
            ],
            unit: "kWh",
            periodLabel: "2022",
            total: 24
          },
      aggregation: "day",
      time_zone: "UTC"
    };
    const timeline = [
      Date.UTC(2023, 0, 1),
      Date.UTC(2023, 0, 2),
      Date.UTC(2023, 0, 3)
    ];
    return {
      ...base,
      previewShift: -1,
      previewSeries,
      previewWindows,
      previewChartTime: {
        timeline,
        alignStartsMs: single
          ? [Date.UTC(2023, 0, 1)]
          : [Date.UTC(2023, 0, 1), Date.UTC(2022, 0, 1)],
        forecastPeriodBuckets: 0,
        tailLabelFromIndex: timeline.length
      }
    };
  }

  function makeCard(config: Record<string, unknown> = {}): EnergyHorizonCardEl {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      primary_color: "#00ADEF",
      ...config
    });
    el.hass = energyCardHass();
    return el;
  }

  it("T010: preview indication is visible with the shifted period when previewShift < 0", async () => {
    const el = makeCard();
    el._state = previewReadyState();
    await el.updateComplete;
    const shadowText = el.shadowRoot!.textContent || "";
    // The indication reuses the card's period formatting: the shifted current
    // window starts 2023-01-01 → "2023" (US2 scenario 3).
    expect(shadowText).toContain("Preview: 2023");
    document.body.removeChild(el);
  });

  it("T010: preview indication is absent at the default (no preview)", async () => {
    const el = makeCard();
    el._state = baseYoYReadyState();
    await el.updateComplete;
    const shadowText = el.shadowRoot!.textContent || "";
    expect(shadowText).not.toContain("Preview:");
    document.body.removeChild(el);
  });

  it("T012: preview draws exactly two gray series (light + darker), not the current color", async () => {
    const el = makeCard();
    el._state = previewReadyState();
    await el.updateComplete;
    expect(setOptionMock).toHaveBeenCalled();
    const [option] = setOptionMock.mock.calls[0] as any[];
    const series = option.series as any[];
    // Exactly the shifted current (light gray) + shifted reference (darker gray).
    expect(series.length).toBe(2);
    const colors = series.map((s) => s.color).sort();
    // jsdom has no HA theme CSS, so the card's theme resolves to its gray
    // fallbacks: light gray current, darker gray reference.
    expect(colors).toEqual(["rgba(127, 127, 127, 0.4)", "rgba(127, 127, 127, 0.55)"]);
    // The shifted current must NOT reuse the current series' color (FR-018).
    expect(colors).not.toContain("#00ADEF");
    document.body.removeChild(el);
  });

  it("T012: single-window preview draws exactly one light-gray series", async () => {
    const el = makeCard();
    el._state = previewReadyState({ singleWindow: true });
    await el.updateComplete;
    expect(setOptionMock).toHaveBeenCalled();
    const [option] = setOptionMock.mock.calls[0] as any[];
    const series = option.series as any[];
    expect(series.length).toBe(1);
    expect(series[0].color).toBe("rgba(127, 127, 127, 0.4)");
    document.body.removeChild(el);
  });
});

