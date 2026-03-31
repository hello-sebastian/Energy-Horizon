import { describe, it, expect, vi } from "vitest";
import { resolveLocale, numberFormatToLocale } from "../../src/card/localize";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";

describe("resolveLocale", () => {
  const baseHass: HomeAssistant = {
    language: "en",
    locale: {
      language: "en",
      number_format: "decimal"
    },
    config: {
      time_zone: "Europe/Warsaw"
    },
    connection: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sendMessagePromise: async <T>() => Promise.resolve({} as T)
    }
  };

  const baseConfig: CardConfig = {
    type: "custom:energy-horizon-card",
    entity: "sensor.energy",
    comparison_preset: "year_over_year"
  };

  it("uses hass.locale when no overrides are provided", () => {
    const resolved = resolveLocale(baseHass, baseConfig);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("decimal");
    expect(resolved.timeZone).toBe("Europe/Warsaw");
  });

  it("uses config overrides when provided", () => {
    const config: CardConfig = {
      ...baseConfig,
      language: "pl",
      number_format: "comma"
    };

    const resolved = resolveLocale(baseHass, config);

    expect(resolved.language).toBe("pl");
    expect(resolved.numberFormat).toBe("comma");
  });

  it("YAML language override takes precedence over hass.locale", () => {
    const hassPl: HomeAssistant = {
      ...baseHass,
      language: "pl",
      locale: { language: "pl", number_format: "comma" }
    };
    const configEn: CardConfig = {
      ...baseConfig,
      language: "en"
    };

    const resolved = resolveLocale(hassPl, configEn);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("comma");
  });

  it("YAML number_format override takes precedence over hass.locale", () => {
    const hassComma: HomeAssistant = {
      ...baseHass,
      locale: { language: "en", number_format: "comma" }
    };
    const config: CardConfig = {
      ...baseConfig,
      number_format: "decimal"
    };

    const resolved = resolveLocale(hassComma, config);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("decimal");
  });

  it("invalid config.language falls back to en", () => {
    const config: CardConfig = {
      ...baseConfig,
      language: "xx"
    };

    const resolved = resolveLocale(baseHass, config);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("decimal");
  });

  it("invalid config.number_format falls back to system", () => {
    const config: CardConfig = {
      ...baseConfig,
      number_format: "invalid" as "comma"
    };

    const resolved = resolveLocale(baseHass, config);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("system");
  });

  it("logs warning when config.debug is true and config.language is invalid", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config: CardConfig = {
      ...baseConfig,
      language: "unsupported",
      debug: true
    };

    const resolved = resolveLocale(baseHass, config);

    expect(resolved.language).toBe("en");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported config.language "unsupported"')
    );
    warnSpy.mockRestore();
  });

  it("logs warning when config.debug is true and config.number_format is invalid", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config: CardConfig = {
      ...baseConfig,
      number_format: "invalid" as "comma",
      debug: true
    };

    const resolved = resolveLocale(baseHass, config);

    expect(resolved.numberFormat).toBe("system");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid config.number_format")
    );
    warnSpy.mockRestore();
  });

  it("does not log when config.debug is false and values are invalid", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config: CardConfig = {
      ...baseConfig,
      language: "xx",
      number_format: "invalid" as "comma"
    };

    resolveLocale(baseHass, config);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("returns safe defaults when hass is undefined (card init)", () => {
    const resolved = resolveLocale(undefined, baseConfig);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("system");
    expect(resolved.timeZone).toBe("UTC");
  });

  it("returns safe defaults when hass is null", () => {
    const resolved = resolveLocale(null, baseConfig);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("system");
    expect(resolved.timeZone).toBe("UTC");
  });

  it("handles partial hass.locale (missing locale object)", () => {
    const hassNoLocale = { ...baseHass, locale: undefined };
    const resolved = resolveLocale(hassNoLocale, baseConfig);

    expect(resolved.language).toBe("en");
    expect(resolved.numberFormat).toBe("system");
    expect(resolved.timeZone).toBe("Europe/Warsaw");
  });

  it("handles partial hass.locale (language set, number_format missing)", () => {
    const hassPartial = {
      ...baseHass,
      locale: { language: "pl" }
    };
    const resolved = resolveLocale(hassPartial, baseConfig);

    expect(resolved.language).toBe("pl");
    expect(resolved.numberFormat).toBe("system");
  });

  it("handles missing hass.config (time zone fallback to UTC)", () => {
    const hassNoConfig = { ...baseHass, config: undefined };
    const resolved = resolveLocale(hassNoConfig, baseConfig);

    expect(resolved.timeZone).toBe("UTC");
  });
});

describe("numberFormatToLocale", () => {
  it("maps comma to a comma-decimal locale", () => {
    expect(numberFormatToLocale("comma", "pl")).toBe("de");
  });

  it("maps decimal to a dot-decimal locale", () => {
    expect(numberFormatToLocale("decimal", "pl")).toBe("en");
  });

  it("uses language when numberFormat is language", () => {
    expect(numberFormatToLocale("language", "pl")).toBe("pl");
  });
});

