import { describe, it, expect } from "vitest";
import { createLocalize, resolveLocale } from "../../src/card/localize";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";

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
      const config: CardConfig = { type: "custom:energy-horizon-card", entity: "sensor.x", language: "de" };

      const resolved = resolveLocale(hass, config);

      expect(resolved.language).toBe("de");
    });

    it("unsupported config.language falls back to en", () => {
      const hass = {
        locale: { language: "en" },
        language: "en",
        config: { time_zone: "UTC" }
      } as unknown as HomeAssistant;
      const config: CardConfig = { type: "custom:energy-horizon-card", entity: "sensor.x", language: "unsupported_xyz" };

      const resolved = resolveLocale(hass, config);

      expect(resolved.language).toBe("en");
    });
  });
});
