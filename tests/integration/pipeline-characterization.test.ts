/**
 * T009 (TD-2) R1 — characterization baseline for the ready-state pipeline.
 *
 * Pins the **exact** current output of the three pipeline paths in
 * `cumulative-comparison-chart.ts` (`_loadData`, `_buildDemoState`,
 * `_firePickerRealDataQuery`) before the TD-2 refactor:
 *
 *  - A — production load → ready state (two windows, auto-aggregation)
 *  - B — production load, empty LTS result → no-data
 *  - C — production load, point cap exceeded → error state
 *  - D — picker demo state (deterministic series, query never resolves)
 *  - E — picker real-data swap (demo upgraded in place once data arrives)
 *  - F — production preview snapshot (shift −1, in-place preview load)
 *
 * FR-019 (zero user-visible change): the expected values below were captured
 * from the pre-refactor code with a fixed clock (`2026-11-16T12:00:00Z`, UTC)
 * and a deterministic LTS mock (one daily bucket per day, `change: 2`, kWh).
 * **Do not edit the expected values** while refactoring — a red test here
 * means the refactor changed behavior and must stop (spec R1 / plan W2 gate).
 *
 * Key-presence semantics are pinned via the sorted `keys` array: the
 * production ready state carries the four `preview*` keys (present with
 * `undefined` values at shift 0), while the demo and picker states do not.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import "../helpers/setup-dom";
import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardState, ResolvedWindow } from "../../src/card/types";

// The ready state creates a real EChartsRenderer; zrender cannot paint in
// jsdom — stub it (same pattern as load-coalescing.test.ts).
vi.mock("../../src/card/echarts-renderer", () => ({
  EChartsRenderer: class {
    update = vi.fn();
  }
}));

type CardEl = import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  preview: boolean;
  updateComplete: Promise<boolean>;
};

const FIXED_NOW = new Date("2026-11-16T12:00:00Z");

/**
 * LTS `statistics_during_period` mock: one daily bucket per day from
 * `start_time` (inclusive) to `end_time` (exclusive), each with `change: 2`
 * and unit `kWh`. Deterministic for a fixed system clock.
 */
function makeSend(): (msg: Record<string, unknown>) => Promise<unknown> {
  return (msg) => {
    const start = new Date(msg.start_time as string).getTime();
    const end = new Date(msg.end_time as string).getTime();
    const points = [];
    for (let t = start; t < end; t += 86_400_000) {
      points.push({
        start: new Date(t).toISOString(),
        end: new Date(t + 86_400_000).toISOString(),
        sum: null,
        state: null,
        mean: null,
        min: null,
        max: null,
        change: 2,
        unit_of_measurement: "kWh"
      });
    }
    return Promise.resolve({ results: { "sensor.energy": points } });
  };
}

type Send = (msg: Record<string, unknown>) => Promise<unknown>;

function makeHass(send: Send): HomeAssistant {
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
    connection: { sendMessagePromise: send }
  } as unknown as HomeAssistant;
}

function makeCard(opts: {
  send: Send;
  preview?: boolean;
  config?: Record<string, unknown>;
}): CardEl {
  const el = document.createElement("energy-horizon-card") as CardEl;
  document.body.appendChild(el);
  el.hass = makeHass(opts.send);
  if (opts.preview) el.preview = true;
  el.setConfig(
    opts.config ?? {
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    }
  );
  return el;
}

async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
  await vi.advanceTimersByTimeAsync(0);
  const el = document.querySelector("energy-horizon-card") as CardEl;
  await el.updateComplete;
  await vi.advanceTimersByTimeAsync(0);
  await el.updateComplete;
}

const iso = (d: Date | undefined | null) => d?.toISOString() ?? null;

/**
 * Project a CardState onto the pinned, JSON-serializable shape captured in
 * the baseline (summary / forecast / units / timeline / key presence).
 * The ready member is projected in full; the other members contribute only
 * their status + error fields and key presence (toEqual ignores the
 * absent/undefined fields).
 */
function pin(state: CardState): Record<string, unknown> {
  if (state.status !== "ready") {
    return {
      status: state.status,
      keys: Object.keys(state).sort(),
      errorMessage: state.status === "error" ? state.errorMessage : undefined,
      errorParams: state.status === "error" ? state.errorParams : undefined,
      resolvedWindows: []
    };
  }
  const cs = state.comparisonSeries;
  const ct = state.chartTime;
  const rw = state.resolvedWindows;
  const preview = state.preview;
  return {
    status: state.status,
    keys: Object.keys(state).sort(),
    summary: state.summary,
    forecast: state.forecast,
    textSummary: state.textSummary,
    period: state.period
      ? {
          current_start: iso(state.period.current_start),
          current_end: iso(state.period.current_end),
          reference_start: iso(state.period.reference_start),
          reference_end: iso(state.period.reference_end),
          aggregation: state.period.aggregation,
          time_zone: state.period.time_zone
        }
      : undefined,
    series: cs
      ? {
          current: {
            unit: cs.current.unit,
            total: cs.current.total,
            points: cs.current.points.length
          },
          reference: cs.reference
            ? { unit: cs.reference.unit, total: cs.reference.total, points: cs.reference.points.length }
            : undefined,
          context: cs.context
            ? cs.context.map((c) => ({ unit: c.unit, total: c.total, points: c.points.length }))
            : undefined,
          aggregation: cs.aggregation,
          time_zone: cs.time_zone
        }
      : undefined,
    chartTime: ct
      ? {
          timelineLength: ct.timeline.length,
          first: ct.timeline[0],
          last: ct.timeline[ct.timeline.length - 1],
          alignStartsMs: ct.alignStartsMs,
          forecastPeriodBuckets: ct.forecastPeriodBuckets,
          tailLabelFromIndex: ct.tailLabelFromIndex
        }
      : undefined,
    resolvedWindows: rw.map((w: ResolvedWindow) => ({
      index: w.index,
      role: w.role,
      start: iso(w.start),
      end: iso(w.end),
      aggregation: w.aggregation
    })),
    mergedTimeWindow: state.mergedTimeWindow,
    preview: preview
      ? {
          shift: preview.shift,
          series: preview.series
            ? {
                current: {
                  unit: preview.series.current.unit,
                  total: preview.series.current.total,
                  points: preview.series.current.points.length
                },
                reference: preview.series.reference
                  ? {
                      unit: preview.series.reference.unit,
                      total: preview.series.reference.total,
                      points: preview.series.reference.points.length
                    }
                  : undefined
              }
            : undefined,
          windows: preview.windows
            ? preview.windows.map((w) => ({ start: iso(w.start), end: iso(w.end) }))
            : undefined,
          chartTime: preview.chartTime
            ? {
                timelineLength: preview.chartTime.timeline.length,
                first: preview.chartTime.timeline[0],
                last: preview.chartTime.timeline[preview.chartTime.timeline.length - 1],
                tailLabelFromIndex: preview.chartTime.tailLabelFromIndex
              }
            : undefined
        }
      : undefined
  };
}

function readState(el: CardEl): CardState {
  return (el as unknown as { _state: CardState })._state;
}

// ---------------------------------------------------------------------------
// Pinned baselines — captured 2026-11-16 from the pre-refactor code.
// Shared fragments (identical across scenarios by construction of the fixture).
// ---------------------------------------------------------------------------

/** YoY windows resolved at FIXED_NOW (UTC, 24 max windows, auto-aggregation "week"). */
const WINDOWS_YOY = [
  {
    index: 0,
    role: "current",
    start: "2026-01-01T00:00:00.000Z",
    end: "2026-11-16T12:00:00.000Z",
    aggregation: "week"
  },
  {
    index: 1,
    role: "reference",
    start: "2025-01-01T00:00:00.000Z",
    end: "2025-12-31T23:59:59.999Z",
    aggregation: "week"
  }
];

/** YoY preset merged with auto-aggregation (pickAutoAggregation(1y) = "week"). */
const MERGED_YOY = {
  anchor: "start_of_year",
  duration: "1y",
  step: "1y",
  count: 2,
  currentEndIsNow: true,
  referenceFullPeriod: true,
  periodOffsetYears: -1,
  comparisonMode: "year_over_year",
  aggregation: "week"
};

/** Chart timeline for the YoY windows (53 weekly slots, forecast to 2026-12-31). */
const CHART_TIME_YOY = {
  timelineLength: 53,
  first: 1767225600000,
  last: 1798675200000,
  alignStartsMs: [1767225600000, 1735689600000],
  forecastPeriodBuckets: 46,
  tailLabelFromIndex: 46
};

const PERIOD_YOY = {
  current_start: "2026-01-01T00:00:00.000Z",
  current_end: "2026-11-16T12:00:00.000Z",
  reference_start: "2025-01-01T00:00:00.000Z",
  reference_end: "2025-12-31T23:59:59.999Z",
  aggregation: "week",
  time_zone: "UTC"
};

/** Real LTS data: 320 daily buckets (2 kWh each) current, 365 reference. */
const REAL_SERIES = {
  current: { unit: "kWh", total: 640, points: 320 },
  reference: { unit: "kWh", total: 730, points: 365 },
  aggregation: "week",
  time_zone: "UTC"
};

/** 10-key production ready state (`preview` key present, undefined members at shift 0). */
const READY_KEYS = [
  "chartTime",
  "comparisonSeries",
  "forecast",
  "mergedTimeWindow",
  "period",
  "preview",
  "resolvedWindows",
  "status",
  "summary",
  "textSummary"
];

/** 9-key demo / picker state (no preview key at all). */
const SIMPLE_READY_KEYS = [
  "chartTime",
  "comparisonSeries",
  "forecast",
  "mergedTimeWindow",
  "period",
  "resolvedWindows",
  "status",
  "summary",
  "textSummary"
];

const A = {
  status: "ready",
  keys: READY_KEYS,
  summary: {
    current_cumulative: 640,
    reference_cumulative: 640,
    difference: 0,
    differencePercent: 0,
    unit: "kWh"
  },
  forecast: {
    enabled: true,
    forecast_total: 730,
    reference_total: 730,
    confidence: "high",
    unit: "kWh"
  },
  textSummary: { trend: "similar", diffValue: 0, unit: "kWh" },
  period: PERIOD_YOY,
  series: REAL_SERIES,
  chartTime: CHART_TIME_YOY,
  resolvedWindows: WINDOWS_YOY,
  mergedTimeWindow: MERGED_YOY,
  preview: { shift: 0 }
};

const B = {
  status: "no-data",
  keys: ["status"],
  resolvedWindows: []
};

const C = {
  status: "error",
  keys: ["errorMessage", "errorParams", "status"],
  errorMessage: "status.point_cap_exceeded",
  errorParams: { max: 5000 },
  resolvedWindows: []
};

const D = {
  status: "ready",
  keys: SIMPLE_READY_KEYS,
  summary: {
    current_cumulative: 593.382,
    reference_cumulative: 652.7202,
    difference: -59.33820000000003,
    differencePercent: -9.090909090909095,
    unit: "kWh"
  },
  forecast: {
    enabled: true,
    forecast_total: 736.7940000000001,
    reference_total: 810.4734,
    confidence: "high",
    unit: "kWh"
  },
  textSummary: { trend: "lower", diffValue: 59.33820000000003, unit: "kWh" },
  period: PERIOD_YOY,
  series: {
    current: { unit: "kWh", total: 593.382, points: 46 },
    reference: { unit: "kWh", total: 810.4734, points: 53 },
    aggregation: "week",
    time_zone: "UTC"
  },
  chartTime: CHART_TIME_YOY,
  resolvedWindows: WINDOWS_YOY,
  mergedTimeWindow: MERGED_YOY
};

const E = {
  status: "ready",
  keys: SIMPLE_READY_KEYS,
  summary: {
    current_cumulative: 640,
    reference_cumulative: 640,
    difference: 0,
    differencePercent: 0,
    unit: "kWh"
  },
  forecast: {
    enabled: true,
    forecast_total: 730,
    reference_total: 730,
    confidence: "high",
    unit: "kWh"
  },
  textSummary: { trend: "similar", diffValue: 0, unit: "kWh" },
  period: PERIOD_YOY,
  series: REAL_SERIES,
  chartTime: CHART_TIME_YOY,
  resolvedWindows: WINDOWS_YOY,
  mergedTimeWindow: MERGED_YOY
};

const F = {
  status: "ready",
  keys: READY_KEYS,
  summary: {
    current_cumulative: 640,
    reference_cumulative: 640,
    difference: 0,
    differencePercent: 0,
    unit: "kWh"
  },
  forecast: {
    enabled: true,
    forecast_total: 730,
    reference_total: 730,
    confidence: "high",
    unit: "kWh"
  },
  textSummary: { trend: "similar", diffValue: 0, unit: "kWh" },
  period: PERIOD_YOY,
  series: REAL_SERIES,
  chartTime: CHART_TIME_YOY,
  resolvedWindows: WINDOWS_YOY,
  mergedTimeWindow: MERGED_YOY,
  preview: {
    shift: -1,
    series: {
      current: { unit: "kWh", total: 730, points: 365 },
      reference: { unit: "kWh", total: 732, points: 366 }
    },
    windows: [
      { start: "2025-01-01T00:00:00.000Z", end: "2025-12-31T23:59:59.999Z" },
      { start: "2024-01-01T00:00:00.000Z", end: "2024-12-31T23:59:59.999Z" }
    ],
    chartTime: {
      timelineLength: 53,
      first: 1735689600000,
      last: 1767139200000,
      tailLabelFromIndex: 53
    }
  }
};

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

describe("pipeline characterization — TD-2 R1 baseline (FR-019: expected values must not change)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("A: production load → ready state (two windows, auto-aggregation)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    const el = makeCard({ send: makeSend() });
    await settle();
    expect(pin(readState(el))).toEqual(A);
  });

  it("B: production load with empty LTS result → no-data", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    const send = () => Promise.resolve({ results: { "sensor.energy": [] } });
    const el = makeCard({ send });
    await settle();
    expect(pin(readState(el))).toEqual(B);
  });

  it("C: production load exceeding the point cap → error state with params", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    const send = () => new Promise<unknown>(() => {}); // never resolves
    const el = makeCard({
      send,
      config: {
        type: "custom:energy-horizon-card",
        entity: "sensor.energy",
        comparison_preset: "custom",
        time_window: {
          anchor: "start_of_year",
          duration: "1y",
          count: 1,
          aggregation: "hour"
        }
      }
    });
    await settle();
    expect(pin(readState(el))).toEqual(C);
  });

  it("D: picker demo state (deterministic series; query never resolves)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    const send = () => new Promise<unknown>(() => {});
    const el = makeCard({ send, preview: true });
    await settle();
    expect(pin(readState(el))).toEqual(D);
  });

  it("E: picker real-data swap (demo upgraded in place once data arrives)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    const el = makeCard({ send: makeSend(), preview: true });
    await settle();
    await vi.advanceTimersByTimeAsync(0);
    await el.updateComplete;
    await vi.advanceTimersByTimeAsync(0);
    await el.updateComplete;
    expect(pin(readState(el))).toEqual(E);
  });

  it("F: production preview snapshot (shift −1 via the real preview control)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    const el = makeCard({ send: makeSend() });
    await settle();
    expect(readState(el).status).toBe("ready");
    // Real trigger path: the preview "back" control steps the shift and
    // starts an in-place preview load (research R6).
    (el as unknown as { _onPreviewStep: (a: "back" | "forward" | "reset") => void })._onPreviewStep(
      "back"
    );
    await settle();
    expect(pin(readState(el))).toEqual(F);
  });
});
