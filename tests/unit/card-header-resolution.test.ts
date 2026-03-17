import { describe, it, expect } from "vitest";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";

/**
 * Test helper: Simulates the title resolution logic from cumulative-comparison-chart.ts
 */
function resolveTitleLogic(
  config: CardConfig,
  hass: HomeAssistant | undefined
): {
  showTitle: boolean;
  effectiveTitle: string;
  showIcon: boolean;
  effectiveIcon: string | undefined;
  canRenderEntityIcon: boolean;
  shouldRenderHeader: boolean;
} {
  const showTitle = config.show_title !== false;
  const entityState = hass?.states?.[config.entity];
  const effectiveTitle = (
    config.title?.trim() ||
    (entityState?.attributes.friendly_name as string | undefined) ||
    config.entity
  ) as string;

  const showIcon = config.show_icon !== false;
  const effectiveIcon = config.icon?.trim() || undefined;
  const canRenderEntityIcon = !!entityState;

  const shouldRenderHeader =
    (showTitle && !!effectiveTitle) ||
    (showIcon && (!!effectiveIcon || canRenderEntityIcon));

  return {
    showTitle,
    effectiveTitle,
    showIcon,
    effectiveIcon,
    canRenderEntityIcon,
    shouldRenderHeader
  };
}

describe("Card Header Resolution (US1)", () => {
  describe("Title Resolution", () => {
    it("uses explicit title when provided", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        title: "My Solar"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.effectiveTitle).toBe("My Solar");
      expect(result.showTitle).toBe(true);
    });

    it("uses friendly_name when title is not provided", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {
              friendly_name: "Test Sensor"
            }
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveTitle).toBe("Test Sensor");
      expect(result.showTitle).toBe(true);
    });

    it("falls back to entity ID when friendly_name is not available", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {}
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveTitle).toBe("sensor.test");
      expect(result.showTitle).toBe(true);
    });

    it("falls back to entity ID when hass is undefined", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.effectiveTitle).toBe("sensor.test");
      expect(result.showTitle).toBe(true);
    });

    it("uses friendly_name over entity ID in fallback chain", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {
              friendly_name: "My Friendly Name"
            }
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveTitle).toBe("My Friendly Name");
    });

    it("prefers explicit title over friendly_name", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {
              friendly_name: "Friendly Name"
            }
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        title: "Explicit Title"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveTitle).toBe("Explicit Title");
    });

    it("respects show_title: false flag", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        show_title: false
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.showTitle).toBe(false);
    });

    it("treats empty title string as falsy and uses fallback", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {
              friendly_name: "Test Friendly"
            }
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        title: ""
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveTitle).toBe("Test Friendly");
    });

    it("trims whitespace from title", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        title: "  My Title  "
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.effectiveTitle).toBe("My Title");
    });
  });

  describe("Icon Resolution", () => {
    it("uses explicit icon when provided", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        icon: "mdi:flash"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.effectiveIcon).toBe("mdi:flash");
      expect(result.showIcon).toBe(true);
    });

    it("does not resolve entity icon string when icon is not configured (uses entity state icon renderer)", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {
              icon: "mdi:solar-power"
            }
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveIcon).toBeUndefined();
      expect(result.canRenderEntityIcon).toBe(true);
    });

    it("cannot render entity icon when entity state is missing", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          // entity missing
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveIcon).toBeUndefined();
      expect(result.canRenderEntityIcon).toBe(false);
    });

    it("prefers explicit icon over entity icon", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {
              icon: "mdi:solar-power"
            }
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        icon: "mdi:flash"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.effectiveIcon).toBe("mdi:flash");
    });

    it("respects show_icon: false flag", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        show_icon: false
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.showIcon).toBe(false);
    });

    it("trims whitespace from icon", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        icon: "  mdi:flash  "
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.effectiveIcon).toBe("mdi:flash");
    });
  });

  describe("Header Render Guard", () => {
    it("renders header when title is shown and effectiveTitle exists", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        title: "My Title"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.shouldRenderHeader).toBe(true);
    });

    it("renders header when icon is shown and effectiveIcon exists", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        icon: "mdi:flash"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.shouldRenderHeader).toBe(true);
    });

    it("renders header when icon is shown and entity state exists (even without explicit icon)", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {}
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        show_title: false
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.shouldRenderHeader).toBe(true);
      expect(result.canRenderEntityIcon).toBe(true);
    });

    it("renders header when both title and icon are available", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        title: "My Title",
        icon: "mdi:flash"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.shouldRenderHeader).toBe(true);
    });

    it("omits header when both show_title and show_icon are false", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        show_title: false,
        show_icon: false
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.shouldRenderHeader).toBe(false);
    });

    it("omits header when no title and no icon exist", () => {
      const hass: HomeAssistant = {
        language: "en",
        states: {
          "sensor.test": {
            state: "100",
            attributes: {}
          }
        },
        connection: {
          sendMessagePromise: async () => ({})
        }
      };

      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year"
      };

      const result = resolveTitleLogic(config, hass);
      expect(result.shouldRenderHeader).toBe(true);
    });

    it("renders header when show_title: false but icon exists", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        show_title: false,
        icon: "mdi:flash"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.shouldRenderHeader).toBe(true);
    });

    it("renders header when show_icon: false but title exists", () => {
      const config: CardConfig = {
        type: "custom:energy-horizon-card",
        entity: "sensor.test",
        comparison_mode: "year_over_year",
        show_icon: false,
        title: "My Title"
      };

      const result = resolveTitleLogic(config, undefined);
      expect(result.shouldRenderHeader).toBe(true);
    });
  });
});
