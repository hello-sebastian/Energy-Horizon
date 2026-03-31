import { describe, it, expect } from "vitest";
import type { HomeAssistant } from "../../src/ha-types";
import type {
  CardConfig,
  CardConfigInput,
  ComparisonMode,
  ComparisonPeriod,
  ComparisonSeries,
  CardState
} from "../../src/card/types";
import { resolveComparisonPreset } from "../../src/card/types";
import { EnergyHorizonCard } from "../../src/card/cumulative-comparison-chart";

function createBaseHass(language: string): HomeAssistant {
  return {
    language,
    locale: {
      language,
      number_format: "language"
    },
    config: {
      time_zone: "Europe/Warsaw"
    },
    connection: {
      sendMessagePromise: async <T>() => Promise.resolve({} as T)
    }
  };
}

function buildMinimalPeriod(): ComparisonPeriod {
  return {
    current_start: new Date(2024, 0, 1),
    current_end: new Date(2024, 11, 31),
    reference_start: new Date(2023, 0, 1),
    reference_end: new Date(2023, 11, 31),
    aggregation: "day",
    time_zone: "Europe/Warsaw"
  };
}

function buildMinimalComparisonSeries(): ComparisonSeries {
  return {
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
    time_zone: "Europe/Warsaw"
  };
}

describe("EnergyHorizonCard renderer config vs _state", () => {
  const baseConfig: CardConfig = {
    type: "custom:energy-horizon-card",
    entity: "sensor.energy",
    comparison_preset: "year_over_year"
  };

  it("setConfig maps forecast alias to show_forecast", () => {
    const card = new EnergyHorizonCard();
    card.setConfig({ ...baseConfig, forecast: true });
    expect(card._config.show_forecast).toBe(true);
  });

  it("setConfig prefers show_forecast over forecast when both are set", () => {
    const card = new EnergyHorizonCard();
    card.setConfig({
      ...baseConfig,
      show_forecast: false,
      forecast: true
    });
    expect(card._config.show_forecast).toBe(false);
  });

  it("setConfig defaults comparison_preset to year_over_year when missing", () => {
    const card = new EnergyHorizonCard();
    card.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy"
    } as CardConfigInput);
    expect(card._config.comparison_preset).toBe("year_over_year");
  });

  it("setConfig maps legacy comparison_mode to comparison_preset", () => {
    const card = new EnergyHorizonCard();
    card.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_mode: "year_over_year"
    } as CardConfigInput);
    expect(card._config.comparison_preset).toBe("year_over_year");
  });

  it("setConfig prefers comparison_preset when both keys are set", () => {
    const card = new EnergyHorizonCard();
    card.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "month_over_month",
      comparison_mode: "year_over_year"
    } as CardConfigInput);
    expect(card._config.comparison_preset).toBe("month_over_month");
  });

  it("setConfig treats whitespace-only comparison_preset as unset and uses legacy comparison_mode", () => {
    const card = new EnergyHorizonCard();
    card.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "   " as unknown as ComparisonMode,
      comparison_mode: "month_over_year"
    });
    expect(card._config.comparison_preset).toBe("month_over_year");
  });

  it("_buildRendererConfig sets showForecast true when show_forecast omitted (two windows)", () => {
    const card = new EnergyHorizonCard();
    card.hass = createBaseHass("en");
    card.setConfig(baseConfig);

    const ready: CardState = {
      status: "ready",
      period: buildMinimalPeriod(),
      comparisonSeries: buildMinimalComparisonSeries(),
      resolvedWindows: [
        {
          index: 0,
          id: "a",
          role: "current",
          start: new Date(2024, 0, 1),
          end: new Date(2024, 11, 31),
          aggregation: "day"
        },
        {
          index: 1,
          id: "b",
          role: "reference",
          start: new Date(2023, 0, 1),
          end: new Date(2023, 11, 31),
          aggregation: "day"
        }
      ],
      summary: {
        current_cumulative: 100,
        reference_cumulative: 90,
        difference: 10,
        differencePercent: 11.1,
        unit: "kWh"
      },
      forecast: {
        enabled: true,
        forecast_total: 120,
        reference_total: 90,
        confidence: "medium",
        unit: "kWh"
      }
    };

    card._state = ready;
    const cfg = (
      card as unknown as { _buildRendererConfig: () => { showForecast: boolean } }
    )._buildRendererConfig();
    expect(cfg.showForecast).toBe(true);
  });

  it("_buildRendererConfig sets showForecast false when show_forecast is false", () => {
    const card = new EnergyHorizonCard();
    card.hass = createBaseHass("en");
    card.setConfig({ ...baseConfig, show_forecast: false });

    const ready: CardState = {
      status: "ready",
      period: buildMinimalPeriod(),
      comparisonSeries: buildMinimalComparisonSeries(),
      resolvedWindows: [
        {
          index: 0,
          id: "a",
          role: "current",
          start: new Date(2024, 0, 1),
          end: new Date(2024, 11, 31),
          aggregation: "day"
        },
        {
          index: 1,
          id: "b",
          role: "reference",
          start: new Date(2023, 0, 1),
          end: new Date(2023, 11, 31),
          aggregation: "day"
        }
      ],
      summary: {
        current_cumulative: 100,
        reference_cumulative: 90,
        difference: 10,
        differencePercent: 11.1,
        unit: "kWh"
      },
      forecast: {
        enabled: true,
        forecast_total: 120,
        reference_total: 90,
        confidence: "medium",
        unit: "kWh"
      }
    };

    card._state = ready;
    const cfg = (
      card as unknown as { _buildRendererConfig: () => { showForecast: boolean } }
    )._buildRendererConfig();
    expect(cfg.showForecast).toBe(false);
  });

  /**
   * Regression: `_buildRendererConfig()` must not assign to `this._state` (or otherwise
   * mutate card state). Doing so from `updated()` caused an infinite Lit update loop and
   * a frozen tab. This test locks in read-only behavior for the renderer config path.
   */
  it("_buildRendererConfig does not mutate _state when series and period are present", () => {
    const card = new EnergyHorizonCard();
    card.hass = createBaseHass("en");
    card.setConfig(baseConfig);

    const ready: CardState = {
      status: "ready",
      period: buildMinimalPeriod(),
      comparisonSeries: buildMinimalComparisonSeries(),
      summary: {
        current_cumulative: 100,
        reference_cumulative: 90,
        difference: 10,
        differencePercent: 11.1,
        unit: "kWh"
      },
      forecast: {
        enabled: true,
        forecast_total: 120,
        reference_total: 90,
        confidence: "medium",
        unit: "kWh"
      }
    };

    card._state = ready;
    const before = structuredClone(card._state);

    (card as unknown as { _buildRendererConfig: () => unknown })._buildRendererConfig();

    expect(structuredClone(card._state)).toEqual(before);
  });

  it("_buildRendererConfig does not mutate _state in the early-return branch (missing period)", () => {
    const card = new EnergyHorizonCard();
    card.hass = createBaseHass("en");
    card.setConfig(baseConfig);

    const ready: CardState = {
      status: "ready",
      forecast: {
        enabled: false,
        confidence: "low",
        unit: "kWh"
      }
    };

    card._state = ready;
    const before = structuredClone(card._state);

    (card as unknown as { _buildRendererConfig: () => unknown })._buildRendererConfig();

    expect(structuredClone(card._state)).toEqual(before);
  });
});

describe("resolveComparisonPreset", () => {
  it("defaults to year_over_year when both keys are absent", () => {
    expect(resolveComparisonPreset({})).toBe("year_over_year");
  });

  it("ignores whitespace-only comparison_preset and uses comparison_mode", () => {
    expect(
      resolveComparisonPreset({
        comparison_preset: "  \t " as unknown as ComparisonMode,
        comparison_mode: "month_over_year"
      })
    ).toBe("month_over_year");
  });

  it("prefers nonempty comparison_preset over comparison_mode", () => {
    expect(
      resolveComparisonPreset({
        comparison_preset: "month_over_month",
        comparison_mode: "year_over_year"
      })
    ).toBe("month_over_month");
  });
});
