import { describe, it, expect } from "vitest";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";
import { EnergyHorizonCard } from "../../src/card/cumulative-comparison-chart";
import { resolveLocale, createLocalize } from "../../src/card/localize";
import { classifyComparisonStep } from "../../src/card/narrative/classify-comparison-step";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connection: {
      sendMessagePromise: async <T>() => Promise.resolve({} as T)
    }
  };
}

describe("EnergyHorizonCard localization", () => {
  const baseConfig: CardConfig = {
    type: "custom:energy-horizon-card",
    entity: "sensor.energy",
    comparison_preset: "year_over_year"
  };

  it("uses resolved locale language when localizing summary labels (en)", () => {
    const hass = createBaseHass("en");
    const card = new EnergyHorizonCard();
    card.hass = hass;
    card.setConfig(baseConfig);

    const resolved = resolveLocale(card.hass, card._config);
    const localize = createLocalize(resolved.language);

    const label = (card as any)._localizeOrError(localize, "summary.current_period");

    expect(label).toBe("Current period");
  });

  it("uses resolved locale language when localizing summary labels (pl)", () => {
    const hass = createBaseHass("pl");
    const card = new EnergyHorizonCard();
    card.hass = hass;
    card.setConfig(baseConfig);

    const resolved = resolveLocale(card.hass, card._config);
    const localize = createLocalize(resolved.language);

    const label = (card as any)._localizeOrError(localize, "summary.current_period");

    expect(label).toBe("Bieżący okres");
  });

  it("enters error state and uses error.missing_translation when key is missing", () => {
    const hass = createBaseHass("en");
    const card = new EnergyHorizonCard();
    card.hass = hass;
    card.setConfig({
      ...baseConfig,
      debug: true
    });

    const baseLocalize = (key: string, vars?: Record<string, string | number>) => {
      if (key === "error.missing_translation") {
        const k = vars?.key ?? "unknown";
        return `Missing translation key: ${k}`;
      }
      // simulate missing translation by returning the key unchanged
      return key;
    };

    const result = (card as any)._localizeOrError(baseLocalize, "missing.key");

    expect(result).toBe("Missing translation key: missing.key");
    expect((card as any)._state.status).toBe("error");
    expect((card as any)._state.errorMessage).toBe("error.missing_translation");
  });

  it("unsupported hass locale shows English labels via dictionary fallback", () => {
    const hass = createBaseHass("en");
    (hass as { language: string }).language = "xx";
    if (hass.locale) hass.locale.language = "xx";
    const card = new EnergyHorizonCard();
    card.hass = hass;
    card.setConfig(baseConfig);

    const resolved = resolveLocale(card.hass, card._config);
    const localize = createLocalize(resolved.language);

    // createLocalize("xx") falls back to en when xx has no dictionary
    expect((card as any)._localizeOrError(localize, "summary.current_period")).toBe("Current period");
  });

  it("YAML language override overrides hass locale", () => {
    const hass = createBaseHass("en");
    const card = new EnergyHorizonCard();
    card.hass = hass;
    card.setConfig({ ...baseConfig, language: "pl" });

    const resolved = resolveLocale(card.hass, card._config);
    const localize = createLocalize(resolved.language);

    expect(resolved.language).toBe("pl");
    expect((card as any)._localizeOrError(localize, "summary.current_period")).toBe("Bieżący okres");
  });

  it("renders nothing when hass is missing (safe empty state)", () => {
    const card = new EnergyHorizonCard();
    (card as { hass?: HomeAssistant }).hass = undefined as unknown as HomeAssistant;
    card.setConfig(baseConfig);

    const fragment = (card as any).render();
    // When hass is missing, render() returns empty template
    expect(fragment?.strings?.join("")).toBe("");
  });

  it("text_summary consumption higher composes referencePeriod from period.week (US-903-N2)", () => {
    const localize = createLocalize("en");
    expect(classifyComparisonStep("1w")).toBe("week");
    const referencePeriod = localize("text_summary.period.week");
    expect(referencePeriod).toContain("week");

    const higher = localize("text_summary.consumption.higher", {
      deltaUnit: "12 kWh",
      deltaPercent: "5%",
      referencePeriod
    });
    expect(higher).toContain("12 kWh");
    expect(higher).toContain("5%");
    expect(higher).toContain("higher");
    expect(higher).toContain(referencePeriod);
  });

  it("text_summary period.reference used for non-standard steps (US-903-N3)", () => {
    const localize = createLocalize("en");
    expect(classifyComparisonStep("16d")).toBe("reference");
    expect(classifyComparisonStep("3M")).toBe("reference");
    const refPhrase = localize("text_summary.period.reference");
    const higher = localize("text_summary.consumption.higher", {
      deltaUnit: "1 kWh",
      deltaPercent: "1%",
      referencePeriod: refPhrase
    });
    expect(higher).toContain(refPhrase);
  });
});


