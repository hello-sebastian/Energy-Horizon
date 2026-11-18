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

describe("picker preview real-data upgrade (910 US3, T018)", () => {
  /**
   * Creates a card in picker mode (`preview === true`) with a controllable
   * `sendMessagePromise`, mirroring the `hui-card` order: hass + preview first,
   * then `setConfig` (which renders the demo series and fires the real-data query).
   */
  function makePreviewCard(
    send: (msg: Record<string, unknown>) => Promise<unknown>
  ): EnergyHorizonCardEl {
    const el = document.createElement(
      "energy-horizon-card"
    ) as EnergyHorizonCardEl;
    document.body.appendChild(el);
    el.hass = {
      ...pickerHass(),
      connection: { sendMessagePromise: send }
    } as HomeAssistant;
    el.preview = true;
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      interpretation: "consumption",
      neutral_threshold: 2
    });
    return el;
  }

  function stateOf(el: EnergyHorizonCardEl): {
    status: string;
    comparisonSeries?: { current: { points: { value: number }[] } };
  } {
    return (el as unknown as {
      _state: {
        status: string;
        comparisonSeries?: { current: { points: { value: number }[] } };
      };
    })._state;
  }

  it("renders the demo series first, then updates in place to real data when the query succeeds in time (FR-014, SC-004)", async () => {
    // A valid LTS response with two distinctive buckets (999 kWh each) so the
    // real series is distinguishable from the deterministic demo series.
    const ltsResponse = {
      results: {
        "sensor.energy": [
          { start: "2026-01-01T00:00:00Z", change: 999, unit_of_measurement: "kWh" },
          { start: "2026-01-08T00:00:00Z", change: 999, unit_of_measurement: "kWh" }
        ]
      }
    };
    const send = vi.fn().mockResolvedValue(ltsResponse);
    const el = makePreviewCard(send);
    await el.updateComplete;

    // The demo series is rendered first (one setOption with the demo data).
    expect(setOptionMock).toHaveBeenCalledTimes(1);

    // The time-limited query succeeds in time → the preview updates in place to
    // the real data (a second setOption), with no loading or error state.
    await vi.waitFor(() => {
      expect(setOptionMock).toHaveBeenCalledTimes(2);
    });

    // The state now carries the real series (2 LTS points), not the demo
    // (~46 weekly points), and the card is still in the ready state.
    const state = stateOf(el);
    expect(state.status).toBe("ready");
    expect(state.comparisonSeries).toBeDefined();
    expect(state.comparisonSeries!.current.points.length).toBe(2);

    document.body.removeChild(el);
  });

  it("keeps the demo series when the query rejects (no loading/error state) (FR-014)", async () => {
    const send = vi.fn().mockRejectedValue(new Error("boom"));
    const el = makePreviewCard(send);
    await el.updateComplete;
    expect(setOptionMock).toHaveBeenCalledTimes(1); // demo

    // Let the rejection propagate through queryRealDataWithLimit (→ null) and
    // the .then callback (no-op: the demo series stays).
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    // The demo series stays: no second setOption, still ready.
    expect(setOptionMock).toHaveBeenCalledTimes(1);
    expect(stateOf(el).status).toBe("ready");

    document.body.removeChild(el);
  });

  it("keeps the demo series when the query exceeds the time limit (FR-014)", async () => {
    vi.useFakeTimers();
    try {
      const send = vi.fn(() => new Promise<unknown>(() => {})); // never resolves
      const el = makePreviewCard(send);
      await el.updateComplete;
      expect(setOptionMock).toHaveBeenCalledTimes(1); // demo

      // Advance past the ~2.5 s time limit; the race resolves to null → demo stays.
      await vi.advanceTimersByTimeAsync(2500);

      expect(setOptionMock).toHaveBeenCalledTimes(1);
      expect(stateOf(el).status).toBe("ready");
      document.body.removeChild(el);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("picker preview safety (910 US4, T020)", () => {
  /**
   * Creates a card in picker mode (`preview === true`) with an optional
   * controllable `sendMessagePromise`, an optional HA language, and an optional
   * explicit config object (so a test can assert the picker's input object is
   * not mutated). Mirrors the `hui-card` order: hass + preview first, then
   * `setConfig`.
   */
  function makeCard(opts: {
    send?: (msg: Record<string, unknown>) => Promise<unknown>;
    language?: string;
    config?: Record<string, unknown>;
  }): EnergyHorizonCardEl {
    const el = document.createElement(
      "energy-horizon-card"
    ) as EnergyHorizonCardEl;
    document.body.appendChild(el);
    const hass = pickerHass();
    if (opts.language) {
      hass.language = opts.language;
      hass.locale = { language: opts.language, number_format: "language" };
    }
    el.hass = {
      ...hass,
      connection: { sendMessagePromise: opts.send ?? (async () => ({})) }
    } as HomeAssistant;
    el.preview = true;
    el.setConfig(
      opts.config ?? {
        type: "custom:energy-horizon-card",
        entity: "sensor.energy",
        comparison_preset: "year_over_year",
        interpretation: "consumption",
        neutral_threshold: 2
      }
    );
    return el;
  }

  function stateOf(el: EnergyHorizonCardEl): { status: string } {
    return (el as unknown as { _state: { status: string } })._state;
  }

  it("browsing the preview persists no configuration (SC-006, FR-010)", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    try {
      // The picker's starting config object — the preview must not mutate it or
      // persist it anywhere.
      const configInput = {
        type: "custom:energy-horizon-card",
        entity: "sensor.energy",
        comparison_preset: "year_over_year",
        interpretation: "consumption",
        neutral_threshold: 2
      };
      const el = makeCard({
        send: vi.fn().mockResolvedValue({}),
        config: configInput
      });
      await el.updateComplete;
      // Let any in-flight real-data query settle.
      await new Promise((r) => setTimeout(r, 0));

      // No storage writes happened while browsing the preview.
      expect(setItemSpy).not.toHaveBeenCalled();

      // The sample config is only the picker's starting point: the card's
      // internal `_config` is a fresh object (not the picker's input object),
      // and the picker's input object is left untouched.
      const internalConfig = (
        el as unknown as { _config: Record<string, unknown> }
      )._config;
      expect(internalConfig).not.toBe(configInput);
      expect(configInput).toEqual({
        type: "custom:energy-horizon-card",
        entity: "sensor.energy",
        comparison_preset: "year_over_year",
        interpretation: "consumption",
        neutral_threshold: 2
      });

      document.body.removeChild(el);
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it("preview respects the active theme via host CSS variables (FR-012)", async () => {
    // A dark theme: the host CSS variables carry dark values. The preview must
    // read them (via getComputedStyle on the host) and flow them into the
    // ECharts option — no hardcoded light colors.
    const darkVars: Record<string, string> = {
      "--primary-text-color": "rgb(255, 255, 255)",
      "--secondary-text-color": "rgba(255, 255, 255, 0.7)",
      "--divider-color": "rgba(255, 255, 255, 0.12)",
      "--ha-card-background": "rgb(30, 30, 30)",
      "--error-color": "#ff5252",
      "--success-color": "#69f0ae",
      "--disabled-text-color": "rgba(255, 255, 255, 0.5)"
    };
    vi.stubGlobal(
      "getComputedStyle",
      (_el: unknown) => ({
        getPropertyValue: (prop: string) => darkVars[prop] ?? ""
      })
    );
    try {
      const el = makeCard({});
      await el.updateComplete;
      const [option] = setOptionMock.mock.calls[0] as unknown[];
      const opt = option as {
        tooltip: { backgroundColor: string; textStyle: { color: string } };
        yAxis:
          | { axisLabel: { color: string } }
          | Array<{ axisLabel: { color: string } }>;
      };
      const yAxis = Array.isArray(opt.yAxis) ? opt.yAxis[0] : opt.yAxis;
      // The dark theme variables flow into the ECharts option.
      expect(opt.tooltip.backgroundColor).toBe("rgb(30, 30, 30)");
      expect(opt.tooltip.textStyle.color).toBe("rgb(255, 255, 255)");
      expect(yAxis.axisLabel.color).toBe("rgb(255, 255, 255)");
      document.body.removeChild(el);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("preview respects the card's localization (FR-012)", async () => {
    const el = makeCard({ language: "fr", send: vi.fn().mockResolvedValue({}) });
    await el.updateComplete;
    const root = el.shadowRoot!;
    const ariaLabels = Array.from(root.querySelectorAll("[aria-label]")).map(
      (e) => e.getAttribute("aria-label") ?? ""
    );
    // French panel labels are rendered (not English).
    expect(ariaLabels.some((l) => l.includes("Période actuelle"))).toBe(true);
    expect(ariaLabels.some((l) => l.includes("Période de référence"))).toBe(
      true
    );
    expect(ariaLabels.some((l) => l.includes("Current period"))).toBe(false);
    document.body.removeChild(el);
  });

  it("preview does not interfere with other cards' previews (FR-013)", async () => {
    const send1 = vi.fn().mockResolvedValue({});
    const send2 = vi.fn().mockResolvedValue({});
    const el1 = makeCard({ send: send1 });
    const el2 = makeCard({ send: send2 });
    await el1.updateComplete;
    await el2.updateComplete;

    // Both render independently, each with its own demo chart + panels.
    const root1 = el1.shadowRoot!;
    const root2 = el2.shadowRoot!;
    expect(root1.querySelector(".chart-container")).not.toBeNull();
    expect(root2.querySelector(".chart-container")).not.toBeNull();
    expect(root1.querySelector(".ebc-section--comparison")).not.toBeNull();
    expect(root2.querySelector(".ebc-section--comparison")).not.toBeNull();

    // Each card fires its own real-data query independently (no shared channel):
    // one LTS query per window (current + reference = 2 for year_over_year), on
    // its own connection.
    expect(send1).toHaveBeenCalledTimes(2);
    expect(send2).toHaveBeenCalledTimes(2);

    // Independent state objects — no shared mutable state between instances.
    const state1 = stateOf(el1);
    const state2 = stateOf(el2);
    expect(state1.status).toBe("ready");
    expect(state2.status).toBe("ready");
    expect(state1).not.toBe(state2);

    document.body.removeChild(el1);
    document.body.removeChild(el2);
  });
});
