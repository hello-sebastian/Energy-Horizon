import { describe, it, expect } from "vitest";
import {
  formatAdaptiveTickLabel,
  formatForcedTickLabel,
  resolveLabelLocale
} from "../../src/card/axis/axis-label-format";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";

describe("resolveLabelLocale", () => {
  it("prefers card language when set", () => {
    const hass = {
      locale: { language: "de" }
    } as unknown as HomeAssistant;
    const config = { language: "pl" } as CardConfig;
    expect(resolveLabelLocale(hass, config)).toBe("pl");
  });

  it("falls back to hass locale then en", () => {
    const hass = {
      locale: { language: "de" }
    } as unknown as HomeAssistant;
    const config = {} as CardConfig;
    expect(resolveLabelLocale(hass, config)).toBe("de");

    expect(resolveLabelLocale(undefined, {} as CardConfig)).toBe("en");
  });
});

describe("formatForcedTickLabel", () => {
  it("formats with Luxon in the given zone", () => {
    const s = formatForcedTickLabel(
      Date.UTC(2024, 5, 15, 14, 30, 0),
      "UTC",
      "en",
      "yyyy-MM-dd HH:mm"
    );
    expect(s).toContain("2024");
    expect(s).toContain("14");
  });
});

describe("formatAdaptiveTickLabel", () => {
  const zone = "UTC";
  const locale = "en";
  const dayMs = 86400000;
  const t0 = Date.UTC(2024, 0, 1, 0, 0, 0, 0);
  const timeline = [t0, t0 + dayMs, t0 + 2 * dayMs];

  it("treats index 0 as a boundary (includes year when needed)", () => {
    const label = formatAdaptiveTickLabel(0, timeline, zone, locale, "day");
    expect(label.length).toBeGreaterThan(0);
    expect(label).toMatch(/2024/);
  });

  it("formats hour aggregation without redundant date when same day", () => {
    const hourMs = 3600000;
    const hTimeline = [t0, t0 + hourMs, t0 + 2 * hourMs];
    const label = formatAdaptiveTickLabel(2, hTimeline, zone, locale, "hour");
    expect(label.length).toBeGreaterThan(0);
  });

  it("comparison omitYearOnAxis: first day tick has no calendar year", () => {
    const label = formatAdaptiveTickLabel(0, timeline, zone, locale, "day", {
      comparisonHints: {
        omitYearOnAxis: true,
        dayOfMonthOnlyOnAxis: false
      }
    });
    expect(label).not.toMatch(/2024/);
    expect(label).toMatch(/Jan/);
  });

  it("comparison dayOfMonthOnlyOnAxis: numeric day only", () => {
    const label = formatAdaptiveTickLabel(1, timeline, zone, locale, "day", {
      comparisonHints: {
        omitYearOnAxis: false,
        dayOfMonthOnlyOnAxis: true
      }
    });
    expect(label).toBe("2");
  });

  describe("hour12 (HA time_format) for hour aggregation", () => {
    const hourMs = 3600000;
    const hTimeline = [t0, t0 + hourMs, t0 + 2 * hourMs]; // 00:00, 01:00, 02:00 UTC

    it("hour12: true forces 12h even under pl", () => {
      const label = formatAdaptiveTickLabel(2, hTimeline, zone, "pl", "hour", {
        hour12: true
      });
      expect(label).toMatch(/PM|AM/i);
    });

    it("hour12: false forces 24h even under en", () => {
      const label = formatAdaptiveTickLabel(2, hTimeline, zone, "en-US", "hour", {
        hour12: false
      });
      expect(label).not.toMatch(/PM|AM/i);
      expect(label).toMatch(/02:00/);
    });

    it("hour12: undefined follows the locale default", () => {
      const pl = formatAdaptiveTickLabel(2, hTimeline, zone, "pl", "hour");
      const en = formatAdaptiveTickLabel(2, hTimeline, zone, "en-US", "hour");
      expect(pl).not.toMatch(/PM|AM/i);
      expect(en).toMatch(/PM|AM/i);
    });

    it("applies to the first/day-changed hour tick as well", () => {
      const label = formatAdaptiveTickLabel(0, hTimeline, zone, "pl", "hour", {
        hour12: true
      });
      expect(label).toMatch(/PM|AM/i);
    });
  });

  it("FR-H: tick label uses HA zone for Intl calendar fields", () => {
    const ms = Date.UTC(2026, 3, 1, 2, 0, 0, 0);
    const tl = [ms];
    const utcLabel = formatAdaptiveTickLabel(0, tl, "UTC", "en-US", "day");
    const nyLabel = formatAdaptiveTickLabel(0, tl, "America/New_York", "en-US", "day");
    expect(utcLabel).toMatch(/2026/);
    expect(utcLabel).toMatch(/Apr/);
    expect(utcLabel).toMatch(/1/);
    expect(nyLabel).toMatch(/2026/);
    expect(nyLabel).toMatch(/Mar/);
    expect(nyLabel).toMatch(/31/);
    expect(utcLabel).not.toBe(nyLabel);
  });
});
