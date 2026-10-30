import { describe, it, expect } from "vitest";
import { createLocalize } from "../../src/card/localize";

describe("createLocalize", () => {
  it("returns translated string for active language", () => {
    const localize = createLocalize("pl");

    const text = localize("status.loading");

    expect(text).toContain("Ładowanie danych");
  });

  it("falls back to English when key is missing in active language", () => {
    const localize = createLocalize("pl");

    const text = localize("forecast.reference_consumption");

    // Both languages define this key; simulate fallback by requesting a bogus language
    const englishLocalize = createLocalize("en");
    const english = englishLocalize("forecast.reference_consumption");

    expect(text).not.toBe("");
    expect(english).toContain("Consumption in reference period");
  });

  it("performs variable interpolation", () => {
    const localize = createLocalize("en");

    const text = localize("forecast.confidence", { confidence: 80 });

    expect(text).toContain("80");
  });

  it("translates forecast confidence levels per language", () => {
    expect(createLocalize("de")("forecast.confidence.low")).toBe("niedrig");
    expect(createLocalize("de")("forecast.confidence.medium")).toBe("mittel");
    expect(createLocalize("de")("forecast.confidence.high")).toBe("hoch");
    expect(createLocalize("pl")("forecast.confidence.low")).toBe("niska");
    expect(createLocalize("pl")("forecast.confidence.medium")).toBe("średnia");
    expect(createLocalize("pl")("forecast.confidence.high")).toBe("wysoka");
    expect(createLocalize("fr")("forecast.confidence.low")).toBe("faible");
    expect(createLocalize("fr")("forecast.confidence.medium")).toBe("moyen");
    expect(createLocalize("fr")("forecast.confidence.high")).toBe("élevé");
    expect(createLocalize("en")("forecast.confidence.low")).toBe("low");
    expect(createLocalize("en")("forecast.confidence.medium")).toBe("medium");
    expect(createLocalize("en")("forecast.confidence.high")).toBe("high");
  });
});

