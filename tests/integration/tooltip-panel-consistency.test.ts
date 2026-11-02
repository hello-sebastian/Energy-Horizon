import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../helpers/setup-dom";

// Capture the ECharts option the card's renderer pushes via setOption.
// `vi.hoisted` runs before the (hoisted) imports, so the mock factory can
// reference these without hitting the temporal-dead-zone.
const { setOptionMock, onMock, offMock, resizeMock, disposeMock } = vi.hoisted(() => ({
  setOptionMock: vi.fn(),
  onMock: vi.fn(),
  offMock: vi.fn(),
  resizeMock: vi.fn(),
  disposeMock: vi.fn()
}));

vi.mock("echarts/core", () => ({
  init: vi.fn(() => ({
    setOption: setOptionMock,
    resize: resizeMock,
    dispose: disposeMock,
    on: onMock,
    off: offMock
  })),
  use: vi.fn()
}));

import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardState } from "../../src/card/types";

type EnergyHorizonCardEl = import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  _state: unknown;
  updateComplete: Promise<boolean>;
};

const dayMs = 86400000;

/**
 * YoY ready state with an OPEN current bucket (the bug scenario):
 *  - current window 2026-01-01 → 2026-01-05, "now" = 2026-01-03 12:00 UTC (slot 2, open)
 *  - current LTS has points only for the closed days (Jan 1, Jan 2); Jan 3 is open,
 *    so the renderer carry-forwards the last known cumulative into slot 2.
 *  - reference window 2025-01-01 → 2025-12-31 (closed year) HAS a real point at the
 *    today slot (2025-01-03 = 25) — the asymmetry behind the bug.
 *
 * Panel reference = referenceCumulativeAtAlignedCurrentEnd = the reference value aligned
 * to the last current point (2026-01-02 → 2025-01-02) = 15.
 */
function openBucketYoYState(): CardState {
  const currentStart = Date.UTC(2026, 0, 1);
  const currentEnd = Date.UTC(2026, 0, 5);
  const refStart = Date.UTC(2025, 0, 1);
  const refEnd = Date.UTC(2025, 11, 31);

  const period = {
    current_start: new Date(currentStart),
    current_end: new Date(currentEnd),
    reference_start: new Date(refStart),
    reference_end: new Date(refEnd),
    aggregation: "day" as const,
    time_zone: "UTC"
  };

  const comparisonSeries = {
    current: {
      points: [
        { timestamp: currentStart, value: 10 },
        { timestamp: currentStart + dayMs, value: 20 }
      ],
      unit: "kWh",
      periodLabel: "2026",
      total: 20
    },
    reference: {
      points: [
        { timestamp: refStart, value: 5 },
        { timestamp: refStart + dayMs, value: 15 },
        { timestamp: refStart + 2 * dayMs, value: 25 },
        { timestamp: refStart + 3 * dayMs, value: 35 }
      ],
      unit: "kWh",
      periodLabel: "2025",
      total: 35
    },
    aggregation: "day" as const,
    time_zone: "UTC"
  };

  // Shared axis = longest window (the full reference year): 365 daily slots from 2026-01-01.
  const timeline: number[] = [];
  for (let i = 0; i < 365; i++) timeline.push(currentStart + i * dayMs);

  return {
    status: "ready",
    period,
    comparisonSeries,
    resolvedWindows: [
      {
        index: 0,
        id: "cur",
        role: "current",
        start: new Date(currentStart),
        end: new Date(currentEnd),
        aggregation: "day"
      },
      {
        index: 1,
        id: "ref",
        role: "reference",
        start: new Date(refStart),
        end: new Date(refEnd),
        aggregation: "day"
      }
    ],
    mergedTimeWindow: {
      duration: "1y",
      currentEndIsNow: true,
      referenceFullPeriod: true
    },
    chartTime: {
      timeline,
      alignStartsMs: [currentStart, refStart],
      forecastPeriodBuckets: 5,
      tailLabelFromIndex: 365
    },
    summary: {
      current_cumulative: 20,
      reference_cumulative: 15,
      difference: 5,
      differencePercent: 33.33,
      unit: "kWh"
    },
    textSummary: { trend: "higher", diffValue: 5, unit: "kWh" },
    forecast: {
      enabled: true,
      forecast_total: 40,
      reference_total: 35,
      confidence: "medium",
      unit: "kWh"
    }
  };
}

describe("tooltip ↔ panel reference consistency (bug: tooltip-reference-mismatch)", () => {
  beforeEach(() => {
    setOptionMock.mockClear();
    onMock.mockClear();
    offMock.mockClear();
    resizeMock.mockClear();
    disposeMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("panel reference cumulative equals the tooltip reference value at the today slot", async () => {
    // "now" = 2026-01-03 12:00 UTC → todaySlotIndex = 2 (the open day).
    const fakeNow = Date.UTC(2026, 0, 3, 12);
    vi.spyOn(Date, "now").mockReturnValue(fakeNow);

    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
    if (typeof el.setConfig !== "function") {
      return;
    }

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = {
      language: "en",
      locale: { language: "en", number_format: "language" },
      config: { time_zone: "UTC" },
      states: {
        "sensor.energy": {
          state: "20",
          attributes: { friendly_name: "Energy", unit_of_measurement: "kWh" }
        }
      },
      connection: { sendMessagePromise: async () => ({}) }
    } as HomeAssistant;

    const state = openBucketYoYState();
    (el as any)._state = state;
    await el.updateComplete;

    // The renderer pushed the ECharts option through the mocked setOption.
    expect(setOptionMock).toHaveBeenCalled();
    const option = setOptionMock.mock.calls[0]![0] as any;
    const formatter = option.tooltip.formatter as (params: unknown) => string;
    expect(typeof formatter).toBe("function");

    // Simulate the axis tooltip params at the today slot (slot 2).
    const todaySlot = 2;
    const html = formatter([
      { axisValue: todaySlot, dataIndex: todaySlot, seriesName: "Current period", data: [todaySlot, 20] },
      { axisValue: todaySlot, dataIndex: todaySlot, seriesName: "Reference period", data: [todaySlot, 25] },
      { axisValue: todaySlot, dataIndex: 0, seriesName: "Current period forecast", data: [todaySlot, 20] }
    ]);

    const fmt = (v: number) =>
      new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

    // Current row (carry-forward into the open bucket) is present.
    expect(html).toContain(`${fmt(20)} kWh`);
    // Reference row uses the panel's reference cumulative (15) — the "TO THIS DAY" value.
    expect(html).toContain(`${fmt(15)} kWh`);
    // The today-slot reference value (25) must NOT leak into the tooltip.
    expect(html).not.toContain(`${fmt(25)} kWh`);
    // Consistency: the tooltip reference equals the panel's reference cumulative.
    expect(state.summary?.reference_cumulative).toBe(15);
    // Forecast row is omitted at the today slot → exactly two rows.
    const rows = html.match(/class="tooltip-row"/g);
    expect(rows?.length ?? 0).toBe(2);

    document.body.removeChild(el);
  });
});
