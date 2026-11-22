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
import type { ReadyState } from "../../src/card/types";

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
function openBucketYoYState(): ReadyState {
  const currentStart = Date.UTC(2026, 0, 1);
  const currentEnd = Date.UTC(2026, 0, 5);
  const refStart = Date.UTC(2025, 0, 1);
  // Full-unit geometry (end = unit − 1 ms, the resolver's pinned shape): the
  // closed reference year is calendar-nameable → the concrete name "2025"
  // (FR-902-AE, issue #74) — matching this fixture's own `periodLabel` data.
  const refEnd = Date.UTC(2025, 11, 31, 23, 59, 59, 999);

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
    // FR-902-AE (issue #74): the row names are the concrete period names —
    // the current window (Jan 1 start, role current) is calendar-nameable →
    // "2026"; the closed reference year (full-unit geometry) → "2025". The
    // forecast row keeps its own independent i18n name.
    const todaySlot = 2;
    const html = formatter([
      { axisValue: todaySlot, dataIndex: todaySlot, seriesName: "2026", data: [todaySlot, 20] },
      { axisValue: todaySlot, dataIndex: todaySlot, seriesName: "2025", data: [todaySlot, 25] },
      { axisValue: todaySlot, dataIndex: 0, seriesName: "Current period forecast", data: [todaySlot, 20] }
    ]);

    const fmt = (v: number) =>
      new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

    // Current row (concrete name "2026"; carry-forward into the open bucket) is present.
    expect(html).toContain(`${fmt(20)} kWh`);
    // Reference row (concrete name "2025") uses the panel's reference
    // cumulative (15) — the "TO THIS DAY" value.
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

/**
 * Preview snapshot of the open-bucket scenario (909 shift −1, FR-902-AE /
 * FR-905-P, issue #74): the shifted current window starts on Jan 1 →
 * calendar-nameable → the concrete name "2025"; the shifted reference is a
 * full-unit closed year → "2024". The preview current row must never be
 * rendered as "Current period" (owner constraint 2026-11-22).
 */
function previewShiftedYoYState(): ReadyState {
  const base = openBucketYoYState();
  const prevCurStart = Date.UTC(2025, 0, 1);
  const prevCurEnd = Date.UTC(2025, 0, 5);
  const prevRefStart = Date.UTC(2024, 0, 1);
  const prevRefEnd = Date.UTC(2024, 11, 31, 23, 59, 59, 999);

  // Shared axis = the full reference year: 365 daily slots from 2024-01-01.
  const timeline: number[] = [];
  for (let i = 0; i < 365; i++) timeline.push(prevRefStart + i * dayMs);

  return {
    ...base,
    preview: {
      shift: -1,
      series: {
        current: {
          points: [
            { timestamp: prevCurStart, value: 8 },
            { timestamp: prevCurStart + dayMs, value: 16 }
          ],
          unit: "kWh",
          periodLabel: "2025",
          total: 16
        },
        reference: {
          points: [
            { timestamp: prevRefStart, value: 4 },
            { timestamp: prevRefStart + dayMs, value: 8 }
          ],
          unit: "kWh",
          periodLabel: "2024",
          total: 8
        },
        aggregation: "day" as const,
        time_zone: "UTC"
      },
      windows: [
        {
          index: 0,
          id: "pcur",
          role: "current",
          start: new Date(prevCurStart),
          end: new Date(prevCurEnd),
          aggregation: "day"
        },
        {
          index: 1,
          id: "pref",
          role: "reference",
          start: new Date(prevRefStart),
          end: new Date(prevRefEnd),
          aggregation: "day"
        }
      ],
      chartTime: {
        timeline,
        alignStartsMs: [prevCurStart, prevRefStart],
        forecastPeriodBuckets: 5,
        tailLabelFromIndex: 365
      }
    }
  };
}

/**
 * Custom (non-nameable) windows, default path (FR-902-AE): both windows start
 * on the 15th of a non-January month — outside every calendar-nameable zone
 * (Jan 1 start, 1st of any month, closed full unit) — so neither is
 * calendar-nameable and the rows keep the generic i18n forms. The green
 * current series keeps "Current period" (reserved for the actual current
 * series, owner constraint 2026-11-22); the reference gets "Reference period".
 */
function customWindowState(): ReadyState {
  const currentStart = Date.UTC(2026, 1, 15);
  const currentEnd = Date.UTC(2026, 2, 14);
  const refStart = Date.UTC(2025, 1, 15);
  const refEnd = Date.UTC(2025, 2, 14);

  const timeline: number[] = [];
  for (let i = 0; i < 30; i++) timeline.push(currentStart + i * dayMs);

  return {
    status: "ready",
    period: {
      current_start: new Date(currentStart),
      current_end: new Date(currentEnd),
      reference_start: new Date(refStart),
      reference_end: new Date(refEnd),
      aggregation: "day" as const,
      time_zone: "UTC"
    },
    comparisonSeries: {
      current: {
        points: [
          { timestamp: currentStart, value: 10 },
          { timestamp: currentStart + dayMs, value: 20 }
        ],
        unit: "kWh",
        periodLabel: "Current period",
        total: 20
      },
      reference: {
        points: [
          { timestamp: refStart, value: 5 },
          { timestamp: refStart + dayMs, value: 15 }
        ],
        unit: "kWh",
        periodLabel: "Reference period",
        total: 15
      },
      aggregation: "day" as const,
      time_zone: "UTC"
    },
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
      duration: "30d",
      currentEndIsNow: false,
      referenceFullPeriod: false
    },
    chartTime: {
      timeline,
      alignStartsMs: [currentStart, refStart],
      forecastPeriodBuckets: 5,
      tailLabelFromIndex: 30
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

describe("tooltip/legend row labels — concrete period names (FR-902-AE, issue #74)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeCard(state: ReadyState, previewShift: number): EnergyHorizonCardEl {
    const el = document.createElement("energy-horizon-card") as EnergyHorizonCardEl;
    document.body.appendChild(el);
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
    if (previewShift !== 0) {
      (el as unknown as { previewShift: number }).previewShift = previewShift;
    }
    el._state = state;
    return el;
  }

  it("preview rows: the shifted windows carry their concrete names, never 'Current period'", async () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 0, 3, 12));
    const el = makeCard(previewShiftedYoYState(), -1);
    await el.updateComplete;

    expect(setOptionMock).toHaveBeenCalled();
    const option = setOptionMock.mock.calls[0]![0] as any;
    const names = (option.series as Array<{ name: string }>).map((s) => s.name);
    // The preview current row = the shifted window's concrete name (Jan 1 start);
    // the preview reference = the shifted closed year's concrete name.
    expect(names).toContain("2025");
    expect(names).toContain("2024");
    // Owner constraint: a rolled-back window is never "Current period".
    expect(names).not.toContain("Current period");

    // The preview tooltip renders the rows under those same names.
    const formatter = option.tooltip.formatter as (params: unknown) => string;
    const html = formatter([
      { axisValue: 1, dataIndex: 1, seriesName: "2025", data: [1, 16] },
      { axisValue: 1, dataIndex: 1, seriesName: "2024", data: [1, 8] }
    ]);
    expect(html).toContain("2025: 16.00 kWh");
    expect(html).toContain("2024: 8.00 kWh");

    // A parameter still named "Current period" matches no series → no row.
    const stale = formatter([
      { axisValue: 1, dataIndex: 1, seriesName: "Current period", data: [1, 16] }
    ]);
    expect(stale.match(/class="tooltip-row"/g)?.length ?? 0).toBe(0);

    document.body.removeChild(el);
  });

  it("custom windows (non-nameable): rows keep the generic labels, current stays 'Current period'", async () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 1, 16, 12));
    const el = makeCard(customWindowState(), 0);
    await el.updateComplete;

    expect(setOptionMock).toHaveBeenCalled();
    const option = setOptionMock.mock.calls[0]![0] as any;
    const names = (option.series as Array<{ name: string }>).map((s) => s.name);
    expect(names).toContain("Current period");
    expect(names).toContain("Reference period");
    // No calendar name leaks for mid-unit windows.
    expect(names).not.toContain("2026");
    expect(names).not.toContain("2025");

    const formatter = option.tooltip.formatter as (params: unknown) => string;
    const html = formatter([
      { axisValue: 0, dataIndex: 0, seriesName: "Current period", data: [0, 10] },
      { axisValue: 0, dataIndex: 0, seriesName: "Reference period", data: [0, 5] }
    ]);
    expect(html).toContain("Current period: 10.00 kWh");
    expect(html).toContain("Reference period: 5.00 kWh");
    expect(html.match(/class="tooltip-row"/g)?.length ?? 0).toBe(2);

    document.body.removeChild(el);
  });
});
