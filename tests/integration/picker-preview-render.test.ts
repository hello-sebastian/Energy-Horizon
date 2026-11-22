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

    // 909 FR-022–FR-025 (refinement 2026-11-18; 910 R6 superseded): the 909
    // time-window preview controls are rendered in picker mode — visible with
    // their normal appearance (no `disabled` attribute) and non-interactive.
    // Back + forward are the always-rendered controls; reset is contextual
    // (FR-009/FR-010: only while a shift is active, which cannot occur in a
    // preview context).
    const controls = root.querySelector(".ebc-chart-controls");
    expect(controls).not.toBeNull();
    const pickerButtons = Array.from(
      root.querySelectorAll(".ebc-chart-control")
    );
    expect(pickerButtons.length).toBe(2);
    for (const btn of pickerButtons) {
      expect(btn.hasAttribute("disabled")).toBe(false);
      expect(btn.getAttribute("aria-disabled")).toBe("true");
      expect(btn.getAttribute("tabindex")).toBe("-1");
      expect(btn.getAttribute("aria-label")).not.toBeNull();
    }

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
      const yAxis = Array.isArray(opt.yAxis) ? opt.yAxis[0]! : opt.yAxis;
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

describe("preview controls in preview contexts (909 FR-022–FR-025, T032)", () => {
  function stateFields(el: EnergyHorizonCardEl): {
    previewShift: number;
    _previewLoading: boolean;
    _state: { status: string };
  } {
    return (el as unknown as {
      previewShift: number;
      _previewLoading: boolean;
      _state: { status: string };
    });
  }

  /**
   * A `preview === true` card (picker / edit mode / editor dialog) with a
   * controllable `sendMessagePromise`. Mirrors the `hui-card` order: hass +
   * preview first, then `setConfig` (which renders the demo series and fires
   * the real-data query).
   */
  function makePreviewCard(
    send: (msg: Record<string, unknown>) => Promise<unknown> =
      async () => ({})
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

  it("preview=true: the back/forward controls are rendered with their normal appearance and inert attributes (FR-022, FR-023, FR-025)", async () => {
    const el = makePreviewCard();
    await el.updateComplete;
    const root = el.shadowRoot!;

    // The controls block is rendered in the preview context (no longer hidden).
    expect(root.querySelector(".ebc-chart-controls")).not.toBeNull();

    const buttons = Array.from(root.querySelectorAll(".ebc-chart-control"));
    // Back + forward always render; reset is contextual (FR-009/FR-010: only
    // while a shift is active) and a shift cannot be activated in a preview
    // context, so it is not rendered here.
    expect(buttons.length).toBe(2);
    for (const btn of buttons) {
      // Normal appearance: no `disabled` attribute (it would dim the button
      // via `.ebc-chart-control:disabled`, which the user ruled out).
      expect(btn.hasAttribute("disabled")).toBe(false);
      // Inert to assistive technology and removed from the tab order (FR-025),
      // with the localized `aria-label` preserved.
      expect(btn.getAttribute("aria-disabled")).toBe("true");
      expect(btn.getAttribute("tabindex")).toBe("-1");
      expect(btn.getAttribute("aria-label")).not.toBeNull();
    }

    // No preview indication (the shift is 0 and cannot be activated here).
    expect(root.querySelector(".ebc-preview-indication")).toBeNull();

    document.body.removeChild(el);
  });

  it("preview=true: activating the controls is a no-op — no shift, no state change, no data load (FR-022, SC-008)", async () => {
    const send = vi.fn(async () => ({}));
    const el = makePreviewCard(send);
    await el.updateComplete;
    // Let the picker's real-data query (2 LTS calls for year_over_year) settle.
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    const baseline = send.mock.calls.length;

    const root = el.shadowRoot!;
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>(".ebc-chart-control")
    );
    expect(buttons.length).toBe(2);

    // A click is the single activation entry point for all three controls:
    // mouse, touch, and keyboard (Enter/Space on a native button dispatch the
    // same `click` event) all converge on it, so this covers every input
    // path (FR-022). The reset handler shares the same entry point and is
    // not rendered in a preview context (FR-010).
    for (const btn of buttons) {
      btn.click();
    }
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));

    // Nothing happened: no shift, no loading state, no data load.
    const fields = stateFields(el);
    expect(fields.previewShift).toBe(0);
    expect(fields._previewLoading).toBe(false);
    expect(send.mock.calls.length).toBe(baseline);
    // The controls remain mounted, inert, and the indication stays absent.
    expect(root.querySelectorAll(".ebc-chart-control").length).toBe(2);
    expect(root.querySelector(".ebc-preview-indication")).toBeNull();

    document.body.removeChild(el);
  });

  it("preview=false (dashboard view mode): the controls stay interactive, with no inert overrides (FR-022, FR-025, FR-026)", async () => {
    // A valid LTS response so the view-mode card reaches the ready state and
    // renders the controls bar (same pattern as the US3 real-data upgrade).
    const ltsResponse = {
      results: {
        "sensor.energy": [
          { start: "2026-01-01T00:00:00Z", change: 55, unit_of_measurement: "kWh" },
          { start: "2026-01-08T00:00:00Z", change: 66, unit_of_measurement: "kWh" }
        ]
      }
    };
    const send = vi.fn(async () => ltsResponse);
    const el = document.createElement(
      "energy-horizon-card"
    ) as EnergyHorizonCardEl;
    document.body.appendChild(el);
    el.hass = {
      ...pickerHass(),
      connection: { sendMessagePromise: send }
    } as HomeAssistant;
    // View mode: `preview` is never set (defaults to `false`).
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year",
      interpretation: "consumption",
      neutral_threshold: 2
    });
    await el.updateComplete;
    await vi.waitFor(() => {
      expect(stateFields(el)._state.status).toBe("ready");
    });

    const root = el.shadowRoot!;
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>(".ebc-chart-control")
    );
    expect(buttons.length).toBe(2); // back + forward; reset only while shifted
    for (const btn of buttons) {
      // View mode: no inert overrides (FR-023 applies to preview contexts).
      expect(btn.hasAttribute("aria-disabled")).toBe(false);
      expect(btn.hasAttribute("tabindex")).toBe(false);
    }
    // FR-026: at the default the forward control is in the disabled state
    // (visible, dimmed — the HA disabled-button standard); the backward
    // control stays enabled (no lower bound, FR-004).
    expect(buttons[0]!.hasAttribute("disabled")).toBe(false); // back
    expect(buttons[1]!.hasAttribute("disabled")).toBe(true); // forward

    const baseline = send.mock.calls.length;
    buttons[0]!.click(); // step back

    // The activation took effect synchronously in the handler.
    expect(stateFields(el).previewShift).toBe(-1);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    // The shifted-period load fired — view mode stays fully interactive.
    expect(send.mock.calls.length).toBeGreaterThan(baseline);

    // The contextual reset control now renders (FR-009), without any inert
    // overrides, and the preview indication is visible (FR-903-Y).
    const reset = root.querySelector(".ebc-chart-control--reset");
    expect(reset).not.toBeNull();
    expect(reset!.hasAttribute("aria-disabled")).toBe(false);
    expect(reset!.hasAttribute("tabindex")).toBe(false);
    expect(root.querySelector(".ebc-preview-indication")).not.toBeNull();

    document.body.removeChild(el);
  });
});
