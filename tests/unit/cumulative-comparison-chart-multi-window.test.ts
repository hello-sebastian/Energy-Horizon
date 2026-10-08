import { describe, it, expect, vi } from "vitest";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig } from "../../src/card/types";
import { EnergyHorizonCard } from "../../src/card/cumulative-comparison-chart";

const emptyLts = {
  results: {
    "sensor.energy": [] as { start: string; sum?: number }[]
  }
};

describe("EnergyHorizonCard multi-window fetch", () => {
  it("issues N parallel LTS queries when time_window.count is N", async () => {
    const sendMock = vi.fn().mockResolvedValue(emptyLts);

    const hass = {
      language: "en",
      locale: { language: "en", number_format: "language" },
      config: { time_zone: "UTC" },
      states: {
        "sensor.energy": {
          entity_id: "sensor.energy",
          state: "0",
          attributes: { unit_of_measurement: "kWh", friendly_name: "E" }
        }
      },
      connection: {
        sendMessagePromise: sendMock
      }
    } as unknown as HomeAssistant;

    const card = new EnergyHorizonCard();
    card.hass = hass;
    card.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      aggregation: "day",
      time_window: {
        anchor: "start_of_month",
        duration: "1M",
        step: "1M",
        count: 3
      }
    } as CardConfig);

    await (card as unknown as { _loadData: () => Promise<void> })._loadData();

    expect(sendMock).toHaveBeenCalledTimes(3);
    for (const call of sendMock.mock.calls) {
      const msg = call[0] as { type?: string };
      expect(msg.type).toBe("recorder/statistics_during_period");
    }
  });

  it("coalesces concurrent load requests into one LTS request set", async () => {
    const pendingFetches: Array<(value: typeof emptyLts) => void> = [];
    const sendMock = vi.fn(
      () =>
        new Promise<typeof emptyLts>((resolve) => {
          pendingFetches.push(resolve);
        })
    );

    const hass = {
      language: "en",
      locale: { language: "en", number_format: "language" },
      config: { time_zone: "UTC" },
      states: {
        "sensor.energy": {
          entity_id: "sensor.energy",
          state: "0",
          attributes: { unit_of_measurement: "kWh", friendly_name: "E" }
        }
      },
      connection: {
        sendMessagePromise: sendMock
      }
    } as unknown as HomeAssistant;

    const card = new EnergyHorizonCard();
    card.hass = hass;
    card.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      aggregation: "day"
    } as CardConfig);

    const load = card as unknown as { _requestLoadData: () => Promise<void> };
    const first = load._requestLoadData();
    const second = load._requestLoadData();

    expect(sendMock).toHaveBeenCalledTimes(2);

    for (const resolve of pendingFetches) {
      resolve(emptyLts);
    }
    await Promise.all([first, second]);

    expect(sendMock).toHaveBeenCalledTimes(2);
  });
});
