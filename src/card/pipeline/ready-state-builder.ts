/**
 * Ready-state pipeline (911/TD-2, FR-002): the single pure implementation of
 * the series → ready-`CardState` transform shared by the three element paths
 * (`_loadData`, `_buildDemoState`, `_firePickerRealDataQuery`).
 *
 * Zero Lit/DOM (pattern: `src/card/time-windows/`). The element keeps only
 * orchestration concerns — load generation, the preview-loading flag, entity
 * unit lookup, debug logging, the point-cap error state — and ends each path
 * with a single `buildReadyState(...)` call.
 *
 * Behavior preservation (FR-019): every transform here is a verbatim move of
 * pre-refactor element code; per-path differences ride on
 * {@link ReadyStateOptions} (assessment `.specify/assessments/ready-state-builder/`).
 * Pinned by `tests/integration/pipeline-characterization.test.ts` (R1 baseline)
 * and `tests/unit/ready-state-builder.test.ts`.
 */
import type {
  CardState,
  ChartTimeContext,
  ComparisonSeries,
  CumulativeSeries,
  MergedTimeWindowConfig,
  ReadyState,
  ResolvedWindow,
  WindowAggregation
} from "../types";
import type { LocalizeFunction, ResolvedLocale } from "../localize";
import {
  buildChartTimeline,
  firstTailAxisLabelIndex
} from "../timeline";
import {
  computeForecast,
  computeSummary,
  computeTextSummary
} from "../ha-api";
import { pickAutoAggregation } from "../axis";
import {
  comparisonPeriodFromResolvedWindows,
  durationToMillis,
  parseDurationToken,
  resolveTimeWindows
} from "../time-windows";
import {
  applyUnitScalingToSeries,
  type ForcePrefix
} from "../../utils/unit-scaler";

/**
 * The `buildChartTimeline` output (structural): the chart axis timeline plus
 * the window-start alignment and forecast-denominator inputs consumed by the
 * numeric pipeline.
 */
export interface ChartTimeline {
  timeline: number[];
  alignStartsMs: number[];
  forecastPeriodBuckets: number;
}

/**
 * Per-path parameters for {@link buildReadyState} (assessment decision.md R2).
 *
 * - `rawUnit` — the pre-scaling unit of the series; drives SI prefix selection.
 * - `patchUnit` — the unit patched onto empty summary/forecast units after the
 *   pipeline; defaults to `rawUnit` (production and demo paths). The picker
 *   path passes its (possibly empty) entity unit explicitly because its
 *   scaling unit can fall back to the series' own unit while the patch must
 *   stay the entity unit.
 * - `forcePrefix` — the card-config `force_prefix`; `undefined` = automatic.
 * - `preview` — when present, the returned state carries the `preview`
 *   snapshot (a `PreviewSnapshot` wrapping the four 909 preview fields).
 *   The production path always passes it (with `undefined` members at
 *   shift 0); the demo and picker paths omit it, so their states have no
 *   preview key at all (key-presence semantics pinned by the R1 baseline).
 */
export interface ReadyStateOptions {
  rawUnit: string;
  patchUnit?: string;
  forcePrefix?: ForcePrefix;
  preview?: {
    shift: number;
    series?: ComparisonSeries;
    windows?: ResolvedWindow[];
    chartTime?: ChartTimeContext;
  };
}

/**
 * Shared pipeline prelude (assessment duplication #1/#2): copy the merged
 * config, apply the auto-aggregation fallback (`aggregation === undefined` →
 * `pickAutoAggregation(duration)`), resolve the time windows (24 max) and
 * build the chart timeline.
 */
export function resolveChartBase(
  mergedInput: MergedTimeWindowConfig,
  now: Date,
  timeZone: string
): { merged: MergedTimeWindowConfig; windows: ResolvedWindow[]; chartTime: ChartTimeline } {
  const merged: MergedTimeWindowConfig = { ...mergedInput };
  if (merged.aggregation === undefined) {
    const dur = parseDurationToken(merged.duration ?? "1y");
    const durationMs = dur ? durationToMillis(dur) : 0;
    merged.aggregation = pickAutoAggregation(durationMs);
  }
  const windows = resolveTimeWindows(
    merged,
    now,
    timeZone,
    24,
    merged.aggregation ?? "day"
  );
  const chartTime = buildChartTimeline(windows, merged, timeZone);
  return { merged, windows, chartTime };
}

/**
 * Chart-time context: the `buildChartTimeline` output plus the tail-label
 * rule (assessment duplication #2). Single implementation — previously
 * duplicated in all three pipeline paths with the `windows.length >= 2` guard.
 */
export function chartTimeContext(
  windows: ResolvedWindow[],
  chartTime: ChartTimeline
): ChartTimeContext {
  const firstAlignStart = chartTime.alignStartsMs[0];
  const firstWindow = windows[0];
  const tailLabelFromIndex =
    windows.length >= 2 && firstAlignStart != null && firstWindow
      ? firstTailAxisLabelIndex(
          chartTime.timeline,
          firstAlignStart,
          firstWindow.end
        )
      : chartTime.timeline.length;
  return {
    timeline: chartTime.timeline,
    alignStartsMs: chartTime.alignStartsMs,
    forecastPeriodBuckets: chartTime.forecastPeriodBuckets,
    tailLabelFromIndex
  };
}

/**
 * Assembles the comparison series from the per-window mapped series list:
 * entity-unit patching (`withUnit`), the reference series (window index 1),
 * context series (window index ≥ 2), and the series' aggregation / time zone.
 * Verbatim move of the `_loadData` assembly block.
 *
 * @throws {Error} when the current series (index 0) is missing. Callers must
 *   handle the no-data state before calling — the element does.
 */
export function assembleComparisonSeries(
  seriesList: (CumulativeSeries | undefined)[],
  windows: ResolvedWindow[],
  aggregation: WindowAggregation,
  timeZone: string,
  entityUnit: string
): ComparisonSeries {
  const withUnit = (c: CumulativeSeries): CumulativeSeries =>
    entityUnit ? { ...c, unit: c.unit || entityUnit } : c;

  const current = seriesList[0];
  if (!current) {
    throw new Error(
      "assembleComparisonSeries requires the current series (index 0)"
    );
  }

  const reference = windows.length > 1 ? seriesList[1] : undefined;
  const context =
    windows.length > 2
      ? seriesList
          .slice(2)
          .filter((c): c is CumulativeSeries => c != null)
          .map(withUnit)
      : undefined;

  return {
    current: withUnit(current),
    reference: reference != null ? withUnit(reference) : undefined,
    ...(context && context.length > 0 ? { context } : {}),
    aggregation,
    time_zone: timeZone
  };
}

/**
 * The single ready-state pipeline (TD-2 / FR-002): unit scaling →
 * `computeSummary` → `computeForecast` → unit patching → `computeTextSummary`
 * → comparison period → state assembly, for **every** state variant the paths
 * can produce — no happy-path-only builder:
 *
 * - `series === null` → the bare `{ status: "no-data" }` state
 * - ready with/without a reference series (single-window vs multi-window)
 * - ready with/without context series (window index ≥ 2)
 * - forecast enabled/disabled (the `computeForecast` guards)
 * - preview snapshots via `opts.preview` (shift 0 default vs shifted)
 *
 * Pure: no Lit/DOM, no `this`, no I/O. `localize` is part of the FR-002
 * signature; the numeric pipeline is language-neutral, so it is unused here.
 */
export function buildReadyState(
  series: ComparisonSeries | null,
  windows: ResolvedWindow[],
  merged: MergedTimeWindowConfig,
  chartTime: ChartTimeline,
  resolved: ResolvedLocale,
  localize: LocalizeFunction,
  opts: ReadyStateOptions
): CardState {
  if (!series) {
    return { status: "no-data" };
  }

  const ctx = chartTimeContext(windows, chartTime);

  // Window-start alignment offset (current − reference). Correct even when the
  // current series starts late (leading zero/missing buckets); the chart
  // already aligns by these window starts, so the numeric pipeline matches the
  // visual one.
  const alignStart0 = chartTime.alignStartsMs[0];
  const alignStart1 = chartTime.alignStartsMs[1];
  const alignOffsetMs =
    alignStart0 != null && alignStart1 != null
      ? alignStart0 - alignStart1
      : undefined;

  const scaledSeries = applyUnitScalingToSeries(series, opts.rawUnit, {
    force_prefix: opts.forcePrefix
  });

  const summary = computeSummary(scaledSeries, alignOffsetMs);
  const forecast = computeForecast(
    scaledSeries,
    chartTime.forecastPeriodBuckets,
    alignOffsetMs
  );

  const patchUnit = opts.patchUnit ?? opts.rawUnit;
  if (!summary.unit && patchUnit) {
    summary.unit = patchUnit;
  }
  if (forecast && !forecast.unit && patchUnit) {
    forecast.unit = patchUnit;
  }

  const textSummary = computeTextSummary(summary);

  const period = comparisonPeriodFromResolvedWindows(
    windows,
    resolved.timeZone,
    merged.aggregation ?? "day"
  );

  const state: ReadyState = {
    status: "ready",
    comparisonSeries: scaledSeries,
    summary,
    forecast,
    textSummary,
    period,
    resolvedWindows: windows,
    mergedTimeWindow: merged,
    chartTime: ctx
  };
  if (opts.preview) {
    state.preview = {
      shift: opts.preview.shift,
      series: opts.preview.series,
      windows: opts.preview.windows,
      chartTime: opts.preview.chartTime
    };
  }
  return state;
}
