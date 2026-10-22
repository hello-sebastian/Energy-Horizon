import { describe, expect, it } from "vitest";
import en from "../../src/translations/en.json";
import nl from "../../src/translations/nl.json";
import { createLocalize, resolveLocale } from "../../src/card/localize";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";

describe("Dutch localization", () => {
  const config: CardConfig = {
    type: "custom:energy-horizon-card",
    entity: "sensor.energy"
  };

  it("covers every English key and preserves interpolation variables", () => {
    expect(Object.keys(nl).sort()).toEqual(Object.keys(en).sort());
    const placeholders = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)]
      .map((match) => match[1]).sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(nl[key].trim(), key).not.toBe("");
      expect(placeholders(nl[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it("loads Dutch labels without falling back to English", () => {
    const localize = createLocalize("nl");
    expect(localize("period.current")).toBe("Huidige periode");
    expect(localize("summary.to_this_day")).toBe("Tot deze dag");
    expect(localize("editor.month_over_year")).toBe("Maand met dezelfde maand vorig jaar");
  });

  it("accepts an explicit Dutch language override", () => {
    expect(resolveLocale(undefined, { ...config, language: "nl" }).language).toBe("nl");
  });

  it("inherits Dutch from Home Assistant", () => {
    const hass = { locale: { language: "nl" } } as unknown as HomeAssistant;
    const locale = resolveLocale(hass, config);
    expect(locale.language).toBe("nl");
    expect(createLocalize(locale.language)("summary.difference")).toBe("Verschil");
  });

  it.each(["consumption", "production"])("interpolates %s comparisons", (kind) => {
    const localize = createLocalize("nl");
    const subject = kind === "consumption" ? "energieverbruik" : "energieproductie";
    expect(localize(`text_summary.${kind}.lower`, {
      deltaUnit: "12,3 kWh",
      deltaPercent: "4,5%",
      referencePeriod: localize("text_summary.period.year")
    })).toBe(`Je ${subject} is 12,3 kWh (4,5%) lager dan in dezelfde periode vorig jaar.`);
  });
});
