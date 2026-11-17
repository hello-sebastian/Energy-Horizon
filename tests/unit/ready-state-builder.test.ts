/**
 * Unit tests for the ready-state pipeline (911/TD-2, FR-002):
 * `src/card/pipeline/ready-state-builder.ts`.
 *
 * Covers every state variant the three element paths can produce (FR-002
 * acceptance): no-data, ready multi-window / single-window, forecast
 * guards, unit scaling, unit patching, preview key semantics, plus the
 * exported helpers `resolveChartBase`, `chartTimeContext`, and
 * `assembleComparisonSeries`.
 *
 * Behavior preservation (FR-019) is pinned end-to-end by
 * `tests/integration/pipeline-characterization.test.ts`; these tests pin the
 * pipeline's numeric behavior in isolation, with hand-computed expectations.
 */
import { describe, expect, it } from "vitest";
import {
  assembleComparisonSeries,
  buildReadyState,
  chartTimeContext,
  resolveChartBase,
  type ChartTimeline,
  type ReadyStateOptions
} from "../../src/card/pipeline/ready-state-builder";
import { firstTailAxisLabelIndex } from "../../src/card/timeline";
import type {
  CardState,
  ChartTimeContext,
  ComparisonSeries,
  CumulativeSeries,
  MergedTimeWindowConfig,
  ReadyState,
  ResolvedWindow,
  TimeSeriesPoint
} from "../../src/card/types";
import type { LocalizeFunction, ResolvedLocale } from "../../src/card/localize";

const CUR_START = Date.UTC(2026, 0, 1);
const REF_START = Date.UTC(2025, 0, 1);
const DAY = 86_400_000;

/** Daily cumulative series: `count` buckets of `rawPerBucket` starting at `startMs`. */
function dailySeries(
  startMs: number,
  rawPerBucket: number,
  count: number,
  unit: string
): CumulativeSeries {
  let cumulative = 0;
  const points: TimeSeriesPoint[] = [];
  for (let i = 0; i < count; i++) {
    cumulative += rawPerBucket;
    points.push({
      timestamp: startMs + i * DAY,
      value: cumulative,
      rawValue: rawPerBucket
    });
  }
  return { points, unit, periodLabel: "period", total: cumulative };
}

const CURRENT_WINDOW: ResolvedWindow = {
  index: 0,
  id: "current",
  role: "current",
  start: new Date(CUR_START),
  end: new Date(CUR_START + 10 * DAY),
  aggregation: "day"
};

const REFERENCE_WINDOW: ResolvedWindow = {
  index: 1,
  id: "reference",
  role: "reference",
  start: new Date(REF_START),
  end: new Date(REF_START + 10 * DAY),
  aggregation: "day"
};

const CHART_TIME: ChartTimeline = {
  timeline: Array.from({ length: 10 }, (_, i) => CUR_START + i * DAY),
  alignStartsMs: [CUR_START, REF_START],
  forecastPeriodBuckets: 10
};

const BASE_WINDOWS: ResolvedWindow[] = [CURRENT_WINDOW, REFERENCE_WINDOW];

const RESOLVED: ResolvedLocale = {
  language: "en",
  numberFormat: "language",
  timeZone: "UTC"
};

// The numeric pipeline is language-neutral; the stub keeps the FR-002
// signature honest without pulling the translation dictionaries in.
const localize: LocalizeFunction = (key) => key;

/** Default fixture: 10 daily buckets (raw 10, cumulative 100) vs 10 (raw 20, cumulative 200). */
function baseSeries(): ComparisonSeries {
  return {
    current: dailySeries(CUR_START, 10, 10, "kWh"),
    reference: dailySeries(REF_START, 20, 10, "kWh"),
    aggregation: "day",
    time_zone: "UTC"
  };
}

function build(
  overrides: {
    series?: ComparisonSeries | null;
    windows?: ResolvedWindow[];
    merged?: MergedTimeWindowConfig;
    chartTime?: ChartTimeline;
    opts?: ReadyStateOptions;
  } = {}
): CardState {
  return buildReadyState(
    overrides.series === undefined ? baseSeries() : overrides.series,
    overrides.windows ?? BASE_WINDOWS,
    overrides.merged ?? {},
    overrides.chartTime ?? CHART_TIME,
    RESOLVED,
    localize,
    overrides.opts ?? { rawUnit: "kWh" }
  );
}

/** Narrows a pipeline result to its ready member (911/TD-11). */
function readyOf(state: CardState): ReadyState {
  if (state.status !== "ready") {
    throw new Error(`expected a ready state, got "${state.status}"`);
  }
  return state;
}

describe("buildReadyState", () => {
  describe("no-data", () => {
    it("returns the bare no-data state for a null series", () => {
      expect(build({ series: null })).toEqual({ status: "no-data" });
    });
  });

  describe("ready (multi-window)", () => {
    it("returns a ready state with the full key set", () => {
      const merged: MergedTimeWindowConfig = {};
      const state = readyOf(build({ merged }));
      expect(state.status).toBe("ready");
      expect(state).toHaveProperty("comparisonSeries");
      expect(state).toHaveProperty("summary");
      expect(state).toHaveProperty("forecast");
      expect(state).toHaveProperty("textSummary");
      expect(state).toHaveProperty("period");
      expect(state.resolvedWindows).toBe(BASE_WINDOWS);
      expect(state.mergedTimeWindow).toBe(merged);
      expect(state.chartTime).toBeDefined();
    });

    it("computes the summary at the aligned current end", () => {
      const state = readyOf(build());
      expect(state.summary).toEqual({
        current_cumulative: 100,
        reference_cumulative: 200,
        difference: -100,
        differencePercent: -50,
        unit: "kWh"
      });
    });

    it("forecasts the period with the reference trend (A + C * trend)", () => {
      const state = readyOf(build());
      expect(state.forecast).toMatchObject({
        enabled: true,
        forecast_total: 100,
        reference_total: 200,
        confidence: "high",
        unit: "kWh"
      });
      expect(state.forecast?.disabledReason).toBeUndefined();
      expect(state.forecast?.anomalousReference).toBeUndefined();
    });

    it("derives the text summary from the difference", () => {
      const state = readyOf(build());
      expect(state.textSummary).toEqual({
        trend: "lower",
        diffValue: 100,
        unit: "kWh"
      });
    });

    it("passes the comparison period from the windows", () => {
      const state = readyOf(build());
      expect(state.period).toEqual({
        current_start: new Date(CUR_START),
        current_end: new Date(CUR_START + 10 * DAY),
        reference_start: new Date(REF_START),
        reference_end: new Date(REF_START + 10 * DAY),
        aggregation: "day",
        time_zone: "UTC"
      });
    });

    it("applies the tail-label rule from the window start", () => {
      const state = readyOf(build());
      expect(state.chartTime).toMatchObject({
        timeline: CHART_TIME.timeline,
        alignStartsMs: CHART_TIME.alignStartsMs,
        forecastPeriodBuckets: 10
      });
      expect(state.chartTime?.tailLabelFromIndex).toBe(
        firstTailAxisLabelIndex(
          CHART_TIME.timeline,
          CHART_TIME.alignStartsMs[0]!,
          CURRENT_WINDOW.end
        )
      );
    });

    it("aligns a longer reference window to the current end (offset flows through)", () => {
      const series: ComparisonSeries = {
        current: dailySeries(CUR_START, 10, 10, "kWh"),
        // 12 buckets: two extend past the aligned current end.
        reference: dailySeries(REF_START, 20, 12, "kWh"),
        aggregation: "day",
        time_zone: "UTC"
      };
      const state = readyOf(build({ series }));
      // Aligned to the current end (CUR_START + 9d): reference point i=9,
      // cumulative 200 — the two trailing buckets (220, 240) stay excluded.
      // Without the window-start offset the raw 2025 timestamps would fall
      // entirely inside the cutoff and the split would land at i=11 instead.
      expect(state.summary).toMatchObject({
        current_cumulative: 100,
        reference_cumulative: 200,
        difference: -100
      });
      expect(state.summary?.differencePercent).toBeCloseTo(-50, 4);
      // The split sits at the last completed bucket boundary (start + 8d):
      // A = 9*10 = 90, B = 9*20 = 180 → trend 0.5; C = 3*20 = 60;
      // forecast_total = 90 + 60 * 0.5 = 120.
      expect(state.forecast).toMatchObject({
        enabled: true,
        forecast_total: 120,
        reference_total: 240,
        confidence: "high"
      });
      expect(state.textSummary).toEqual({
        trend: "lower",
        diffValue: 100,
        unit: "kWh"
      });
    });
  });

  describe("ready (single window, no reference)", () => {
    const single = (): { series: ComparisonSeries; windows: ResolvedWindow[]; chartTime: ChartTimeline } => ({
      series: {
        current: dailySeries(CUR_START, 10, 10, "kWh"),
        aggregation: "day",
        time_zone: "UTC"
      },
      windows: [CURRENT_WINDOW],
      chartTime: { ...CHART_TIME, alignStartsMs: [CUR_START] }
    });

    it("leaves summary reference fields empty and disables the forecast", () => {
      const state = readyOf(build(single()));
      expect(state.summary).toEqual({ current_cumulative: 100, unit: "kWh" });
      expect(state.textSummary).toEqual({ trend: "unknown", unit: "kWh" });
      expect(state.forecast).toMatchObject({
        enabled: false,
        confidence: "low",
        disabledReason: "no_reference",
        unit: "kWh"
      });
      // No reference window → the period falls back to the current window.
      expect(state.period?.reference_start).toEqual(new Date(CUR_START));
      expect(state.period?.reference_end).toEqual(new Date(CUR_START + 10 * DAY));
    });

    it("sets tailLabelFromIndex to the timeline length for a single window", () => {
      const state = readyOf(build(single()));
      expect(state.chartTime?.tailLabelFromIndex).toBe(CHART_TIME.timeline.length);
    });
  });

  describe("forecast guards", () => {
    it("disables with insufficient_buckets (completed buckets < 3)", () => {
      const series: ComparisonSeries = {
        current: dailySeries(CUR_START, 10, 3, "kWh"),
        reference: dailySeries(REF_START, 20, 3, "kWh"),
        aggregation: "day",
        time_zone: "UTC"
      };
      const state = readyOf(build({ series }));
      expect(state.forecast).toMatchObject({
        enabled: false,
        disabledReason: "insufficient_buckets",
        unit: "kWh"
      });
    });

    it("disables with invalid_period (zero forecast buckets)", () => {
      const state = readyOf(build({ chartTime: { ...CHART_TIME, forecastPeriodBuckets: 0 } }));
      expect(state.forecast).toMatchObject({
        enabled: false,
        disabledReason: "invalid_period",
        unit: "kWh"
      });
    });
  });

  describe("unit scaling", () => {
    it("scales Wh -> kWh across the pipeline (summary and forecast)", () => {
      const series: ComparisonSeries = {
        current: dailySeries(CUR_START, 1500, 4, "Wh"),
        reference: dailySeries(REF_START, 3000, 4, "Wh"),
        aggregation: "day",
        time_zone: "UTC"
      };
      const state = readyOf(build({ series, opts: { rawUnit: "Wh" } }));
      expect(state.comparisonSeries?.current.unit).toBe("kWh");
      expect(state.comparisonSeries?.current.points.map((p) => p.value)).toEqual([
        1.5,
        3,
        4.5,
        6
      ]);
      expect(state.summary).toEqual({
        current_cumulative: 6,
        reference_cumulative: 12,
        difference: -6,
        differencePercent: -50,
        unit: "kWh"
      });
      expect(state.forecast).toMatchObject({
        enabled: true,
        forecast_total: 6,
        reference_total: 12,
        confidence: "medium",
        unit: "kWh"
      });
    });

    it('keeps the raw unit when force_prefix is "k" (no auto jump to MWh)', () => {
      const single = (): ComparisonSeries => ({
        current: dailySeries(CUR_START, 5000, 1, "kWh"),
        aggregation: "day",
        time_zone: "UTC"
      });
      const forced = readyOf(build({ series: single(), opts: { rawUnit: "kWh", forcePrefix: "k" } }));
      expect(forced.comparisonSeries?.current.unit).toBe("kWh");
      expect(forced.comparisonSeries?.current.points[0]?.value).toBe(5000);

      const auto = readyOf(build({ series: single() }));
      expect(auto.comparisonSeries?.current.unit).toBe("MWh");
      expect(auto.comparisonSeries?.current.points[0]?.value).toBe(5);
    });

    it("patches empty units with the entity unit (patchUnit defaults to rawUnit)", () => {
      const series: ComparisonSeries = {
        current: dailySeries(CUR_START, 10, 2, ""),
        aggregation: "day",
        time_zone: "UTC"
      };
      // Production path shape: no entity unit -> patchUnit "" -> no patch.
      const unpatched = readyOf(build({ series, opts: { rawUnit: "" } }));
      expect(unpatched.summary?.unit).toBe("");

      // Picker path shape: scaling fell back to the series unit, but the
      // patch must stay the entity unit.
      const patched = readyOf(build({ series, opts: { rawUnit: "", patchUnit: "kWh" } }));
      expect(patched.summary?.unit).toBe("kWh");
      expect(patched.forecast?.unit).toBe("kWh");
    });
  });

  describe("preview snapshot", () => {
    it("omits the preview key when opts.preview is absent", () => {
      const state = build();
      expect("preview" in state).toBe(false);
    });

    it("carries the preview key (undefined members) at shift 0", () => {
      const state = readyOf(build({ opts: { rawUnit: "kWh", preview: { shift: 0 } } }));
      expect("preview" in state).toBe(true);
      expect(state.preview?.shift).toBe(0);
      expect(state.preview && "series" in state.preview).toBe(true);
      expect(state.preview?.series).toBeUndefined();
      expect(state.preview?.windows).toBeUndefined();
      expect(state.preview?.chartTime).toBeUndefined();
    });

    it("passes the preview snapshot through unchanged", () => {
      const snapshotSeries: ComparisonSeries = {
        current: dailySeries(CUR_START, 5, 2, "kWh"),
        aggregation: "day",
        time_zone: "UTC"
      };
      const snapshotWindows = [CURRENT_WINDOW];
      const snapshotChartTime: ChartTimeContext = {
        timeline: CHART_TIME.timeline,
        alignStartsMs: CHART_TIME.alignStartsMs,
        forecastPeriodBuckets: 10,
        tailLabelFromIndex: 0
      };
      const state = readyOf(build({
        opts: {
          rawUnit: "kWh",
          preview: {
            shift: -1,
            series: snapshotSeries,
            windows: snapshotWindows,
            chartTime: snapshotChartTime
          }
        }
      }));
      expect(state.preview?.shift).toBe(-1);
      expect(state.preview?.series).toBe(snapshotSeries);
      expect(state.preview?.windows).toBe(snapshotWindows);
      expect(state.preview?.chartTime).toBe(snapshotChartTime);
    });
  });
});

describe("resolveChartBase", () => {
  // Fixed clock: 2026-11-16T12:00:00Z (matches the R1 characterization baseline).
  const NOW = new Date(Date.UTC(2026, 10, 16, 12, 0, 0));
  const yoyMerged: MergedTimeWindowConfig = {
    anchor: "start_of_year",
    duration: "1y",
    step: "1y",
    count: 2,
    currentEndIsNow: true,
    referenceFullPeriod: true,
    periodOffsetYears: -1,
    comparisonMode: "year_over_year"
  };

  it("applies the auto-aggregation fallback without mutating the input", () => {
    const input: MergedTimeWindowConfig = { ...yoyMerged };
    const { merged, windows, chartTime } = resolveChartBase(input, NOW, "UTC");
    expect(input.aggregation).toBeUndefined();
    expect(merged.aggregation).toBe("week");
    expect(windows).toHaveLength(2);
    expect(chartTime.timeline).toHaveLength(53);
    expect(chartTime.alignStartsMs).toHaveLength(2);
  });

  it("keeps an explicit aggregation", () => {
    const { merged, windows } = resolveChartBase(
      { ...yoyMerged, aggregation: "day" },
      NOW,
      "UTC"
    );
    expect(merged.aggregation).toBe("day");
    expect(windows).toHaveLength(2);
  });
});

describe("chartTimeContext", () => {
  it("uses the tail-label index for multi-window charts", () => {
    const ctx = chartTimeContext([CURRENT_WINDOW, REFERENCE_WINDOW], CHART_TIME);
    expect(ctx).toEqual({
      timeline: CHART_TIME.timeline,
      alignStartsMs: CHART_TIME.alignStartsMs,
      forecastPeriodBuckets: 10,
      tailLabelFromIndex: firstTailAxisLabelIndex(
        CHART_TIME.timeline,
        CHART_TIME.alignStartsMs[0]!,
        CURRENT_WINDOW.end
      )
    });
  });

  it("falls back to the timeline length for a single window", () => {
    const ctx = chartTimeContext([CURRENT_WINDOW], CHART_TIME);
    expect(ctx.tailLabelFromIndex).toBe(CHART_TIME.timeline.length);
  });
});

describe("assembleComparisonSeries", () => {
  it("patches empty units from the entity unit and keeps existing units", () => {
    const series = assembleComparisonSeries(
      [dailySeries(CUR_START, 1, 1, ""), dailySeries(REF_START, 1, 1, "MWh")],
      [CURRENT_WINDOW, REFERENCE_WINDOW],
      "day",
      "UTC",
      "kWh"
    );
    expect(series.current.unit).toBe("kWh");
    expect(series.reference?.unit).toBe("MWh");
    expect(series.aggregation).toBe("day");
    expect(series.time_zone).toBe("UTC");
  });

  it("omits reference and context for a single window", () => {
    const series = assembleComparisonSeries(
      [dailySeries(CUR_START, 1, 1, "kWh")],
      [CURRENT_WINDOW],
      "day",
      "UTC",
      "kWh"
    );
    expect(series.reference).toBeUndefined();
    expect("context" in series).toBe(false);
  });

  it("collects context series from window index >= 2, skipping nulls", () => {
    const contextWindow: ResolvedWindow = {
      index: 2,
      id: "context",
      role: "context",
      start: new Date(REF_START - 365 * DAY),
      end: new Date(REF_START),
      aggregation: "day"
    };
    const series = assembleComparisonSeries(
      [
        dailySeries(CUR_START, 1, 1, "kWh"),
        dailySeries(REF_START, 1, 1, ""),
        undefined,
        dailySeries(REF_START - 365 * DAY, 1, 1, "")
      ],
      [CURRENT_WINDOW, REFERENCE_WINDOW, contextWindow],
      "day",
      "UTC",
      "kWh"
    );
    expect(series.reference?.unit).toBe("kWh");
    expect(series.context).toHaveLength(1);
    expect(series.context?.[0]?.unit).toBe("kWh");
  });

  it("throws when the current series (index 0) is missing", () => {
    expect(() =>
      assembleComparisonSeries([undefined], [CURRENT_WINDOW], "day", "UTC", "kWh")
    ).toThrow(/current series/);
  });
});
