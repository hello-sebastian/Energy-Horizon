import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup-dom";
import "../../src/card/cumulative-comparison-chart";
import type { HomeAssistant } from "../../src/ha-types";

// Mock ECharts so the ready-state renderer path can be exercised in jsdom
// (no canvas) and the ECOption passed to setOption can be captured — same
// pattern as card-render.test.ts.
const setOptionMock = vi.fn();
const resizeMock = vi.fn();
const disposeMock = vi.fn();
const onMock = vi.fn();
const offMock = vi.fn();
const getModelMock = vi.fn(() => ({ getComponent: vi.fn(() => undefined) }));
const getViewOfComponentModelMock = vi.fn(() => ({
  group: { getBoundingRect: vi.fn(() => ({ height: 48 })) }
}));

vi.mock("echarts/core", () => ({
  init: vi.fn(() => ({
    setOption: setOptionMock,
    resize: resizeMock,
    dispose: disposeMock,
    on: onMock,
    off: offMock,
    getModel: getModelMock,
    getViewOfComponentModel: getViewOfComponentModelMock
  })),
  use: vi.fn()
}));

beforeEach(() => {
  setOptionMock.mockClear();
  resizeMock.mockClear();
  disposeMock.mockClear();
  onMock.mockClear();
  offMock.mockClear();
});

type EnergyHorizonCardEl = import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  preview: boolean;
  updateComplete: Promise<boolean>;
};

function pickerHass(): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states: {
      "sensor.energy": {
        state: "10",
        attributes: { friendly_name: "Energy", unit_of_measurement: "kWh" }
      }
    },
    connection: {
      sendMessagePromise: async () => ({})
    }
  } as HomeAssistant;
}

describe("picker preview render (910 US2, T015)", () => {
  it("preview=true renders the demo chart with the standard panels and no no-data message (FR-005, SC-003)", async () => {
    const el = document.createElement(
      "energy-horizon-card"
    ) as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") return;

    // `hui-card` sets `element.preview = true` before `setConfig` in the
    // picker, so mirror that order: hass + preview first, then the config.
    el.hass = pickerHass();
    el.preview = true;
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      interpretation: "consumption",
      neutral_threshold: 2
    });
    await el.updateComplete;

    const root = el.shadowRoot!;

    // The chart container is present and the ECharts renderer drew the demo
    // series (ready state, not loading/error/no-data).
    expect(root.querySelector(".chart-container")).not.toBeNull();
    expect(setOptionMock).toHaveBeenCalled();
    const [option] = setOptionMock.mock.calls[0] as unknown[];
    const series = (option as { series: Array<{ data: unknown[] }> }).series;
    // Current + reference demo series, both with data points.
    expect(series.length).toBeGreaterThanOrEqual(2);
    for (const s of series) {
      expect(s.data.length).toBeGreaterThan(0);
    }

    // Standard panels: comparison summary + forecast/total + chart section.
    expect(root.querySelector(".ebc-section--comparison")).not.toBeNull();
    expect(root.querySelector(".ebc-section--forecast-total")).not.toBeNull();
    expect(root.querySelector(".ebc-section--chart")).not.toBeNull();

    // No no-data indication anywhere (full-card alert or chart overlay).
    expect(root.querySelector(".ebc-chart-nodata-overlay")).toBeNull();
    expect(root.querySelector("ha-alert")).toBeNull();
    expect(root.textContent ?? "").not.toContain("No data");

    // The 909 time-window preview controls are hidden in picker mode (R6).
    expect(root.querySelector(".ebc-chart-controls")).toBeNull();
    expect(root.querySelectorAll(".ebc-chart-control").length).toBe(0);

    document.body.removeChild(el);
  });

  it("getStubConfig prefers an unused entity over a used one (FR-007)", async () => {
    const { EnergyHorizonCard } = await import(
      "../../src/card/cumulative-comparison-chart"
    );
    const hass = pickerHass();
    const config = EnergyHorizonCard.getStubConfig(
      hass,
      ["sensor.energy"],
      ["sensor.other"]
    ) as Record<string, unknown>;
    expect(config.entity).toBe("sensor.energy");
    expect(config.type).toBe("custom:energy-horizon-card");
    expect(config.comparison_preset).toBe("year_over_year");
  });

  it("getStubConfig falls back to entitiesFallback when no unused entity fits (FR-008)", async () => {
    const { EnergyHorizonCard } = await import(
      "../../src/card/cumulative-comparison-chart"
    );
    const hass = pickerHass();
    const config = EnergyHorizonCard.getStubConfig(
      hass,
      ["sensor.other"],
      ["sensor.energy"]
    ) as Record<string, unknown>;
    expect(config.entity).toBe("sensor.energy");
  });

  it("getStubConfig returns entity '' when no entity has a supported unit (FR-008)", async () => {
    const { EnergyHorizonCard } = await import(
      "../../src/card/cumulative-comparison-chart"
    );
    const hass = pickerHass();
    const config = EnergyHorizonCard.getStubConfig(
      hass,
      ["sensor.other"],
      ["sensor.another"]
    ) as Record<string, unknown>;
    expect(config.entity).toBe("");
  });
});
