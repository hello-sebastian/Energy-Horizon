import { describe, it, expect } from "vitest";
import { createLocalize, resolveLocale } from "../../src/card/localize";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";
import en from "../../src/translations/en.json";
import pl from "../../src/translations/pl.json";
import de from "../../src/translations/de.json";
import fr from "../../src/translations/fr.json";
import nl from "../../src/translations/nl.json";

/**
 * User Story 3: Adding a new language requires only adding
 * src/translations/<lang>.json. No changes to localize.ts or rendering code.
 * These tests verify that the workflow works and that missing keys fall back to English.
 */
describe("localize dictionary loading (US3)", () => {
  describe("new language file is picked up without code changes", () => {
    it("createLocalize('de') returns German strings when de.json exists", () => {
      const localize = createLocalize("de");

      expect(localize("status.loading")).toContain("Langzeitstatistiken");
      expect(localize("summary.difference")).toBe("Differenz");
      expect(localize("text_summary.consumption.similar", { referencePeriod: "x" })).toContain(
        "Energieverbrauch"
      );
    });

    it("createLocalize('de') interpolates variables in German", () => {
      const localize = createLocalize("de");

      const text = localize("forecast.confidence", { confidence: 80 });

      expect(text).toContain("80");
      expect(text).toContain("Prognose");
    });

    it("createLocalize('de') resolves forecast confidence level keys", () => {
      const localize = createLocalize("de");

      expect(localize("forecast.confidence.low")).toBe("niedrig");
      expect(localize("forecast.confidence.medium")).toBe("mittel");
      expect(localize("forecast.confidence.high")).toBe("hoch");
    });
  });

  describe("fallback to English for missing keys", () => {
    it("when key is missing in active language, returns English string", () => {
      // de.json has all keys; use a language that might have gaps or unsupported code
      // Unsupported language falls back to en for the whole dictionary
      const localizeEn = createLocalize("en");
      const localizeUnknown = createLocalize("unknown_lang_xyz");

      const enText = localizeEn("status.loading");
      const unknownText = localizeUnknown("status.loading");

      expect(enText).toContain("Loading");
      expect(unknownText).toBe(enText);
    });

    it("when key is missing in both active and English, returns the key", () => {
      const localize = createLocalize("de");

      const result = localize("nonexistent.key.xyz");

      expect(result).toBe("nonexistent.key.xyz");
    });
  });

  describe("resolveLocale accepts new language from config", () => {
    it("config.language 'de' is used when de.json exists", () => {
      const hass = {
        locale: { language: "pl", number_format: "comma" },
        language: "pl",
        config: { time_zone: "Europe/Warsaw" }
      } as unknown as HomeAssistant;
      const config: CardConfig = { type: "custom:energy-horizon-card", entity: "sensor.x", comparison_preset: "year_over_year", language: "de" };

      const resolved = resolveLocale(hass, config);

      expect(resolved.language).toBe("de");
    });

    it("unsupported config.language falls back to en", () => {
      const hass = {
        locale: { language: "en" },
        language: "en",
        config: { time_zone: "UTC" }
      } as unknown as HomeAssistant;
      const config: CardConfig = { type: "custom:energy-horizon-card", entity: "sensor.x", comparison_preset: "year_over_year", language: "unsupported_xyz" };

      const resolved = resolveLocale(hass, config);

      expect(resolved.language).toBe("en");
    });
  });

  describe("T022: preview.* keys are complete in every locale", () => {
    const enDict = en as Record<string, string>;
    const previewKeys = Object.keys(enDict).filter((key) => key.startsWith("preview."));
    const dictionaries: Record<string, Record<string, string>> = {
      en: enDict,
      pl,
      de,
      fr,
      nl
    };

    it("en.json defines the full preview.* key set", () => {
      expect([...previewKeys].sort()).toEqual([
        "preview.indication",
        "preview.loading",
        "preview.reset",
        "preview.step_back",
        "preview.step_forward"
      ]);
    });

    it.each(Object.keys(dictionaries))("%s has every preview.* key, non-empty, with matching placeholders", (language) => {
      const dict = dictionaries[language]!;
      for (const key of previewKeys) {
        expect(dict[key], `${language}: missing key ${key}`).toBeTruthy();
        expect(dict[key]!.trim(), `${language}: empty value for ${key}`).not.toBe("");
        const placeholders = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)]
          .map((match) => match[1]).sort();
        expect(placeholders(dict[key]!), `${language}: placeholder mismatch for ${key}`).toEqual(
          placeholders(enDict[key]!)
        );
      }
    });
  });
});
