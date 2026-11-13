import { describe, it, expect } from "vitest";
import "../helpers/setup-dom";
import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";

function makeHass(
  states: Record<
    string,
    { state: string; attributes: Record<string, unknown> }
  > = {}
): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states,
    connection: {
      sendMessagePromise: async () => ({})
    }
  } as unknown as HomeAssistant;
}

function findEntry() {
  return window.customCards?.find((c) => c.type === "energy-horizon-card");
}

describe("window.customCards registration (910 US1, T013)", () => {
  it("registers the energy-horizon-card entry with a getEntitySuggestion hook", () => {
    const entry = findEntry();
    expect(entry).toBeDefined();
    expect(entry?.getEntitySuggestion).toBeTypeOf("function");
  });

  it("suggests the card for a supported entity (kWh) with the sample config", () => {
    const entry = findEntry();
    const hass = makeHass({
      "sensor.energy": {
        state: "10",
        attributes: { unit_of_measurement: "kWh" }
      }
    });
    const suggestion = entry?.getEntitySuggestion?.(hass, "sensor.energy");
    expect(suggestion).not.toBeNull();
    expect(suggestion?.config).toEqual({
      type: "energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      interpretation: "consumption",
      neutral_threshold: 2
    });
  });

  it("does not suggest the card for an unsupported entity (°C)", () => {
    const entry = findEntry();
    const hass = makeHass({
      "sensor.temperature": {
        state: "21",
        attributes: { unit_of_measurement: "°C" }
      }
    });
    expect(entry?.getEntitySuggestion?.(hass, "sensor.temperature")).toBeNull();
  });

  it("does not suggest the card for an entity missing from hass.states", () => {
    const entry = findEntry();
    expect(entry?.getEntitySuggestion?.(makeHass(), "sensor.missing")).toBeNull();
  });
});
