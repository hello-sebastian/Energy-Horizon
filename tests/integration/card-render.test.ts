import { describe, it, expect } from "vitest";
import "../helpers/setup-dom";
import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";
import type {
  CardState,
  ComparisonPeriod,
  ComparisonSeries
} from "../../src/card/types";

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

describe("energy-horizon-card integration", () => {
  it("can be instantiated without crashing", () => {
    const el = document.createElement("energy-horizon-card");
    document.body.appendChild(el);
    expect(el.shadowRoot).toBeDefined();
  });

  it("renders loading state when state is loading", () => {
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

    const card = el.shadowRoot!.querySelector("ha-card");
    expect(card).not.toBeNull();
    expect(card!.textContent).toContain("Ładowanie danych statystyk długoterminowych");
  });

  it("renders error state with message", () => {
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

    const alert = el.shadowRoot!.querySelector("ha-alert");
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toContain("Testowy błąd");
  });

  it("renders no-data state with info alert", () => {
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

    const alert = el.shadowRoot!.querySelector("ha-alert");
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toContain("Brak danych do wyświetlenia");
  });

  it("forecast section does not contain historical_value row", () => {
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

    (el as any)._state = {
      status: "ready",
      comparisonSeries: [
        { label: "Current", data: [10, 20] },
        { label: "Reference", data: [15, 18] }
      ],
      summary: {
        current_total: 30,
        reference_total: 33,
        difference: -3,
        difference_percent: -9.09,
        unit: "kWh"
      },
      forecast: {
        current_forecast: 50,
        reference_total: 33,
        confidence: 0.95,
        unit: "kWh"
      }
    };

    const shadowText = el.shadowRoot!.textContent || "";
    // Assert that "Historical value" translation key is NOT present
    expect(shadowText).not.toContain("historical_value");
    expect(shadowText).toContain("Forecast");
    expect(shadowText).toContain("Total");
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
        reference_cumulative: null,
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

  it("ready: show_forecast false hides forecast panel even when show_forecast_total_panel is true", async () => {
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
    expect(root.querySelector(".ebc-section--forecast-total")).toBeNull();
    document.body.removeChild(el);
  });
});

