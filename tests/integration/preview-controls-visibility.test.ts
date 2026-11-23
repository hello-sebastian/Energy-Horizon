/**
 * T039 — Preview controls visibility toggle (909 FR-027, Phase 12).
 *
 * The optional `show_preview_controls` config key (boolean, default `true`)
 * controls whether the time-window preview controls bar (`.ebc-chart-controls`:
 * back/forward/reset + the preview indication) is rendered at all. When
 * `false` the bar is absent in every context — dashboard view mode and every
 * `preview = true` context (FR-027 takes precedence over FR-022) — and no
 * space is reserved for it. When absent or `true` the behavior is exactly the
 * pre-refinement behavior (bar always rendered).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup-dom";
import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";
import type {
  ComparisonPeriod,
  ComparisonSeries,
  ReadyState,
  ResolvedWindow
} from "../../src/card/types";

// Mock ECharts init() so the ready-state renderer path can be exercised in jsdom
// (no canvas) — same pattern as card-render.test.ts.
vi.mock("echarts/core", () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getModel: vi.fn(() => ({ getComponent: vi.fn(() => undefined) })),
    getViewOfComponentModel: vi.fn(() => ({
      group: { getBoundingRect: vi.fn(() => ({ height: 48 })) }
    }))
  })),
  use: vi.fn()
}));

type CardEl = import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  _state: unknown;
  _config: unknown;
  preview: boolean;
  updateComplete: Promise<boolean>;
};

function energyCardHass(): HomeAssistant {
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

/** Minimal ready state (two windows) — enough for the chart section to render. */
function readyState(): ReadyState {
  const period: ComparisonPeriod = {
    current_start: new Date(Date.UTC(2024, 0, 1)),
    current_end: new Date(Date.UTC(2024, 11, 31)),
    reference_start: new Date(Date.UTC(2023, 0, 1)),
    reference_end: new Date(Date.UTC(2023, 11, 31)),
    aggregation: "day",
    time_zone: "UTC"
  };
  const comparisonSeries: ComparisonSeries = {
    current: {
      points: [{ timestamp: Date.UTC(2024, 0, 1), value: 100 }],
      unit: "kWh",
      periodLabel: "2024",
      total: 100
    },
    reference: {
      points: [{ timestamp: Date.UTC(2023, 0, 1), value: 90 }],
      unit: "kWh",
      periodLabel: "2023",
      total: 90
    },
    aggregation: "day",
    time_zone: "UTC"
  };
  const window = (
    index: number,
    role: ResolvedWindow["role"],
    startYear: number
  ): ResolvedWindow => ({
    index,
    id: role,
    role,
    start: new Date(Date.UTC(startYear, 0, 1)),
    end: new Date(Date.UTC(startYear, 11, 31)),
    aggregation: "day"
  });
  return {
    status: "ready",
    period,
    comparisonSeries,
    resolvedWindows: [window(0, "current", 2024), window(1, "reference", 2023)],
    mergedTimeWindow: {
      duration: "1y",
      currentEndIsNow: true,
      referenceFullPeriod: true
    },
    chartTime: {
      timeline: [Date.UTC(2024, 0, 1)],
      alignStartsMs: [Date.UTC(2024, 0, 1), Date.UTC(2023, 0, 1)],
      forecastPeriodBuckets: 0,
      tailLabelFromIndex: 1
    },
    summary: {
      current_cumulative: 100,
      reference_cumulative: 90,
      difference: 10,
      differencePercent: 11.11,
      unit: "kWh"
    },
    textSummary: { trend: "higher", diffValue: 10, unit: "kWh" },
    forecast: {
      enabled: true,
      forecast_total: 120,
      reference_total: 95,
      confidence: "high",
      unit: "kWh"
    }
  };
}

/**
 * Mounts the card with `preview` set (mirroring `hui-card`: hass + preview
 * first, then the config), injects a ready state, and awaits one render.
 */
async function mountReadyCard(
  config: Record<string, unknown>,
  { preview = false }: { preview?: boolean } = {}
): Promise<CardEl> {
  const el = document.createElement("energy-horizon-card") as CardEl;
  document.body.appendChild(el);
  if (typeof el.setConfig !== "function") {
    throw new Error("custom element not defined in this env");
  }
  el.hass = energyCardHass();
  el.preview = preview;
  el.setConfig({ type: "custom:energy-horizon-card", entity: "sensor.energy", ...config });
  el._state = readyState();
  await el.updateComplete;
  return el;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("preview controls visibility toggle (909 FR-027, T039)", () => {
  it("view mode + show_preview_controls: false — the controls bar is absent and the chart still renders", async () => {
    const el = await mountReadyCard({ show_preview_controls: false });
    const root = el.shadowRoot!;
    // The whole bar (back/forward/reset + preview indication) is not mounted.
    expect(root.querySelector(".ebc-chart-controls")).toBeNull();
    expect(root.querySelector(".ebc-preview-indication")).toBeNull();
    const buttons = root.querySelectorAll(".ebc-chart-control");
    expect(buttons.length).toBe(0);
    // The chart section still renders the chart wrap (no reserved placeholder).
    expect(root.querySelector(".ebc-chart-wrap")).not.toBeNull();
    expect(root.querySelector(".ebc-section--chart")).not.toBeNull();
  });

  it("view mode + key absent — the bar IS rendered (default true, pre-refinement behavior)", async () => {
    const el = await mountReadyCard({});
    const root = el.shadowRoot!;
    expect(root.querySelector(".ebc-chart-controls")).not.toBeNull();
    // Back/forward are the always-rendered controls at the default.
    expect(root.querySelectorAll(".ebc-chart-control").length).toBe(2);
  });

  it("view mode + show_preview_controls: true — the bar IS rendered", async () => {
    const el = await mountReadyCard({ show_preview_controls: true });
    expect(el.shadowRoot!.querySelector(".ebc-chart-controls")).not.toBeNull();
  });

  it("preview context (preview === true) + show_preview_controls: false — the bar is absent there too (FR-027 takes precedence over FR-022)", async () => {
    const el = await mountReadyCard({ show_preview_controls: false }, { preview: true });
    const root = el.shadowRoot!;
    expect(root.querySelector(".ebc-chart-controls")).toBeNull();
    expect(root.querySelectorAll(".ebc-chart-control").length).toBe(0);
    expect(root.querySelector(".ebc-chart-wrap")).not.toBeNull();
  });

  it("show_preview_controls: false is preserved through setConfig and survives an unrelated config change", async () => {
    const el = await mountReadyCard({ show_preview_controls: false });
    expect((el._config as { show_preview_controls?: boolean }).show_preview_controls).toBe(false);
    // An unrelated config change must not drop the key (config preservation).
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      primary_color: "red",
      show_preview_controls: false
    });
    expect((el._config as { show_preview_controls?: boolean }).show_preview_controls).toBe(false);
    el._state = readyState();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".ebc-chart-controls")).toBeNull();
  });
});
