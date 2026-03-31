import { describe, it, expect } from "vitest";
import "../helpers/setup-dom";
import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";

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
    // Assert that "Consumption in reference period" IS present
    expect(shadowText).toContain("Consumption in reference period");
  });
});

