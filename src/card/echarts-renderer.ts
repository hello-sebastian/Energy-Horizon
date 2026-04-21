// Modular ECharts imports (FR-014, FR-015)
import { init as echartsInit, use as echartsUse } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';
import type { EChartsOption } from 'echarts';

import type { ComparisonAxisLabelHints } from './labels/comparison-label-hints';
import type {
  ComparisonSeries,
  ChartRendererConfig,
  ChartThemeResolved,
  TimeSeriesPoint
} from './types';
import {
  formatAdaptiveTickLabel,
  formatForcedTickLabel
} from './axis/axis-label-format';
import {
  carryForwardCurrentCumulativeAtNow,
  findNowSlotIndexOnComparisonAxis
} from './ha-api';
import { semanticResolvedLineColor, trendResolvedLineColor } from './trend-visual';
import { formatTooltipHeader } from './axis/tooltip-format';
import { findTimelineSlotContainingInstant } from './axis/now-marker-slot';
import {
  AXIS_TICK_LABEL_GAP_PX,
  GRID_BOTTOM_PX,
  X_AXIS_RICH_EDGE_METRICS,
  X_AXIS_RICH_TODAY_METRICS
} from './axis/x-axis-rich-styles';
import { resolveSeriesCurrentColor } from './series-color';

// Register modular ECharts components at module level (FR-016)
echartsUse([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer
]);

/**
 * Minimum chart container height.
 * Set to accommodate a comfortable plot area even with the fixed `GRID_BOTTOM_PX` and a
 * single-row legend: 274 − 40 (legend+gap) − 38 (GRID_BOTTOM_PX) ≈ 196 px plot area.
 * Previously 240 px; increased when the dynamic `xAxisLabelMinHeightExtraPx` was removed.
 */
const CHART_MIN_HEIGHT_BASE_PX = 274;

/**
 * Legacy single-row legend vertical budget baked into the initial `grid.top` (32px).
 * Extra legend height beyond this adds to the container `min-height` so the plot area does not shrink.
 */
const LEGEND_BASELINE_PX = 32;

/** Space between the legend block and the grid (aligned with axis tick label gap). */
const LEGEND_BELOW_GAP_PX = 8;

/** When legend view is missing or hidden, keep the previous fixed top inset. */
const GRID_TOP_FALLBACK_PX = LEGEND_BASELINE_PX;

/**
 * Explicit left-side grid margin (px) that accommodates Y-axis tick labels.
 * With `containLabel: false` the margin must cover the widest formatted Y label
 * (e.g. "1,927 kWh" at ~12 px font ≈ 56 px). Increase if labels are clipped.
 */
export const GRID_LEFT_PX = 56;

/**
 * Escape `{`, `}`, `|` in user/locale strings embedded in ECharts `rich` `{style|text}` pieces
 * (fullwidth substitutes — stable across ECharts versions).
 */
export function escapeEchartsRichAxisPiece(text: string): string {
  return text
    .replace(/\|/g, '\uFF5C')
    .replace(/\{/g, '\uFF5B')
    .replace(/\}/g, '\uFF5D');
}

/**
 * Map ECharts `trigger: 'axis'` tooltip params to a `fullTimeline` slot index (006).
 * Do not trust `dataIndex` from the first series: e.g. forecast has only two points and
 * `dataIndex` is 0 or 1 for most pointer positions.
 */
export function resolveTimelineSlotIndexFromAxisParams(
  items: unknown[],
  timelineLength: number,
  opts: { currentName: string; referenceName?: string }
): number {
  const maxIdx = Math.max(0, timelineLength - 1);
  if (timelineLength <= 0) {
    return 0;
  }
  const clamp = (i: number): number =>
    Math.min(Math.max(0, Math.round(Number(i))), maxIdx);

  const arr = Array.isArray(items) ? items : [];

  for (const raw of arr) {
    const p = raw as { axisValue?: unknown };
    const av = p?.axisValue;
    if (typeof av === 'number' && Number.isFinite(av)) {
      return clamp(av);
    }
    if (typeof av === 'string' && av.trim() !== '') {
      const n = Number(av);
      if (Number.isFinite(n)) {
        return clamp(n);
      }
    }
  }

  const xFromSeries = (seriesName: string): number | undefined => {
    for (const raw of arr) {
      const p = raw as {
        seriesName?: string;
        data?: unknown;
        value?: unknown;
      };
      if (p.seriesName !== seriesName) {
        continue;
      }
      const cand = p.data ?? p.value;
      if (Array.isArray(cand) && cand.length >= 1) {
        const x0 = cand[0];
        const x = typeof x0 === 'number' ? x0 : Number(x0);
        if (Number.isFinite(x)) {
          return clamp(x);
        }
      }
    }
    return undefined;
  };

  const fromCurrent = xFromSeries(opts.currentName);
  if (fromCurrent !== undefined) {
    return fromCurrent;
  }
  if (opts.referenceName) {
    const fromRef = xFromSeries(opts.referenceName);
    if (fromRef !== undefined) {
      return fromRef;
    }
  }

  const dataIndexForNamedSeries = (seriesName: string): number | undefined => {
    for (const raw of arr) {
      const p = raw as { seriesName?: string; dataIndex?: unknown };
      if (p.seriesName !== seriesName) {
        continue;
      }
      const di = p.dataIndex;
      if (typeof di === 'number' && Number.isFinite(di)) {
        return clamp(di);
      }
    }
    return undefined;
  };

  const diCur = dataIndexForNamedSeries(opts.currentName);
  if (diCur !== undefined) {
    return diCur;
  }
  if (opts.referenceName) {
    const diRef = dataIndexForNamedSeries(opts.referenceName);
    if (diRef !== undefined) {
      return diRef;
    }
  }

  const first = arr[0] as { dataIndex?: unknown } | undefined;
  const fallbackDi = first?.dataIndex;
  if (typeof fallbackDi === 'number' && Number.isFinite(fallbackDi)) {
    return clamp(fallbackDi);
  }

  return 0;
}

/**
 * Runtime-only ECharts APIs for legend layout sync (declared private on `ECharts` in typings, so we avoid intersecting with `ECharts`).
 */
type EChartsLayoutSyncApi = {
  getModel(): {
    getComponent(mainType: string, index?: number): { option?: { show?: boolean } } | undefined;
  };
  getViewOfComponentModel(componentModel: object):
    | { group?: { getBoundingRect(): { height: number } } }
    | undefined;
};

/** Internal type used for chart data points (currently unused, kept for reference) */
type _ChartPoint = { x: number; y: number | null };

/**
 * EChartsRenderer: High-fidelity chart visualization using Apache ECharts.
 * Implements the same public interface as ChartRenderer (update/destroy).
 * Replaces chart.js with native ECharts features: markLine, markPoint, areaStyle.
 */
export class EChartsRenderer {
  private readonly container: HTMLElement;
  private instance: ECharts | undefined;
  private readonly resizeObserver: ResizeObserver;
  private lastHash: string | undefined;
  /** Last applied values to avoid `finished` ↔ `setOption` feedback loops. */
  private lastSyncedGridTop: number | undefined;
  private lastSyncedMinHeightTotalPx: number | undefined;
  private readonly onLegendLayoutFinished: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    this.onLegendLayoutFinished = () => {
      this.syncLegendLayoutAfterPaint();
    };

    // Initialize ECharts instance
    this.instance = echartsInit(container);
    this.instance.on('finished', this.onLegendLayoutFinished);

    // Set up resize observer to handle container size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.instance?.resize();
    });
    this.resizeObserver.observe(container);
  }

  destroy(): void {
    this.resizeObserver.disconnect();
    this.instance?.off('finished', this.onLegendLayoutFinished);
    this.instance?.dispose();
    this.instance = undefined;
  }

  /**
   * After each full paint, measure the legend bounding box and align `grid.top` + container `min-height`
   * so multi-line legends do not overlap the series (see plan: legend layout sync).
   */
  private syncLegendLayoutAfterPaint(): void {
    const inst = this.instance;
    if (!inst) return;

    const ec = inst as unknown as EChartsLayoutSyncApi;
    let legendHeightPx = 0;
    let hasLegendLayout = false;

    try {
      const legendModel = ec.getModel().getComponent('legend', 0);
      if (legendModel?.option?.show !== false) {
        const legendView = ec.getViewOfComponentModel(legendModel as object);
        const h = legendView?.group?.getBoundingRect()?.height;
        if (typeof h === 'number' && Number.isFinite(h) && h > 0) {
          legendHeightPx = h;
          hasLegendLayout = true;
        }
      }
    } catch {
      hasLegendLayout = false;
    }

    const gridTopPx = hasLegendLayout
      ? Math.ceil(legendHeightPx) + LEGEND_BELOW_GAP_PX
      : GRID_TOP_FALLBACK_PX;

    const extraMinHeightPx = hasLegendLayout
      ? Math.max(0, legendHeightPx - LEGEND_BASELINE_PX)
      : 0;
    const minHeightTotalPx = CHART_MIN_HEIGHT_BASE_PX + extraMinHeightPx;

    const topDelta =
      this.lastSyncedGridTop === undefined
        ? Infinity
        : Math.abs(gridTopPx - this.lastSyncedGridTop);
    const heightDelta =
      this.lastSyncedMinHeightTotalPx === undefined
        ? Infinity
        : Math.abs(minHeightTotalPx - this.lastSyncedMinHeightTotalPx);

    if (topDelta <= 1 && heightDelta <= 1) {
      return;
    }

    if (hasLegendLayout && extraMinHeightPx > 0) {
      this.container.style.minHeight = `${minHeightTotalPx}px`;
    } else {
      this.container.style.minHeight = '';
    }

    inst.setOption(
      {
        grid: {
          top: gridTopPx,
          bottom: GRID_BOTTOM_PX
        }
      },
      { notMerge: false, lazyUpdate: false }
    );
    inst.resize();

    this.lastSyncedGridTop = gridTopPx;
    this.lastSyncedMinHeightTotalPx = minHeightTotalPx;
  }

  /**
   * Align series data points to the timeline.
   * Port of alignSeriesOnTimeline from chart-renderer.ts (T004).
   */
  /**
   * Map LTS points onto shared timeline slots. `alignStartMs` is window start for this series
   * (same instant as `timeline[0]` for the primary window, or offset for other windows).
   */
  private alignSeriesOnTimeline(
    points: TimeSeriesPoint[],
    timeline: number[],
    alignStartMs: number
  ): (number | null)[] {
    const result: (number | null)[] = new Array(timeline.length).fill(null);

    if (timeline.length === 0) {
      return result;
    }

    const slotDuration =
      timeline.length > 1
        ? timeline[timeline.length - 1]! - timeline[timeline.length - 2]!
        : 86400000;
    const timelineStart = timeline[0]!;

    for (let i = 0; i < timeline.length; i++) {
      const slotStart = timeline[i]!;
      const expectedTs = alignStartMs + (slotStart - timelineStart);

      let slotEndAbs: number;
      if (i + 1 < timeline.length) {
        slotEndAbs = alignStartMs + (timeline[i + 1]! - timelineStart);
      } else {
        slotEndAbs = expectedTs + slotDuration;
      }

      let matchedValue: number | null = null;
      for (const point of points) {
        if (point.timestamp >= expectedTs && point.timestamp < slotEndAbs) {
          matchedValue = point.value;
          break;
        }
      }

      result[i] = matchedValue;
    }

    return result;
  }

  /** `ha-card` (or card root) used for Home Assistant theme CSS variables. */
  private getThemeHost(): HTMLElement {
    return (
      (this.container.closest('.ebc-card') as HTMLElement | null) ??
      (this.container.closest('ha-card') as HTMLElement | null) ??
      this.container
    );
  }

  /**
   * Resolve primary color from config, Figma token `--eh-series-current`, or HA aliases (`ha-accent`, …).
   */
  private resolveColor(primaryColorConfig: string): string {
    return resolveSeriesCurrentColor(this.getThemeHost(), primaryColorConfig);
  }

  /**
   * Resolve chart colors from injected `chartTheme` or the card host (`getComputedStyle`).
   */
  private resolveChartTheme(rendererConfig: ChartRendererConfig): ChartThemeResolved {
    if (rendererConfig.chartTheme) {
      return rendererConfig.chartTheme;
    }

    const styles = getComputedStyle(this.getThemeHost());
    const seriesCurrent = this.resolveColor(rendererConfig.primaryColor);
    const seriesReference =
      styles.getPropertyValue('--secondary-text-color').trim() || 'rgba(127, 127, 127, 0.4)';
    const grid =
      styles.getPropertyValue('--divider-color').trim() || 'rgba(127, 127, 127, 0.3)';
    const primaryText =
      styles.getPropertyValue('--primary-text-color').trim() || 'rgba(0, 0, 0, 0.87)';
    const secondaryText =
      styles.getPropertyValue('--secondary-text-color').trim() || primaryText;

    const tooltipBackground =
      styles.getPropertyValue('--ha-card-background').trim() ||
      styles.getPropertyValue('--card-background-color').trim() ||
      '#ffffff';

    const tooltipBorder = grid;

    const trendHigher =
      styles.getPropertyValue('--error-color').trim() || '#f44336';
    const trendLower =
      styles.getPropertyValue('--success-color').trim() || '#4caf50';
    const trendSimilar =
      styles.getPropertyValue('--secondary-text-color').trim() || 'rgba(127, 127, 127, 0.55)';
    const trendUnknown =
      styles.getPropertyValue('--disabled-text-color').trim() || trendSimilar;
    const trendMuted =
      styles.getPropertyValue('--disabled-text-color').trim() || trendSimilar;

    const todayFullHeightLine = grid || 'rgba(127, 127, 127, 0.35)';
    const referenceDotBorder = tooltipBackground || '#ffffff';

    return {
      seriesCurrent,
      seriesReference,
      referenceDotBorder,
      grid,
      primaryText,
      secondaryText,
      tooltipBackground,
      tooltipBorder,
      todayFullHeightLine,
      trendHigher,
      trendLower,
      trendSimilar,
      trendUnknown,
      trendMuted
    };
  }

  /**
   * Compute nice max value for Y-axis (T006).
   * Rounds up dataMax to nearest "nice" step value (1, 2, 2.5, 5, 10).
   */
  private niceMax(dataMax: number, splitCount: number): number {
    if (dataMax <= 0) return splitCount;

    const step = Math.pow(10, Math.floor(Math.log10(dataMax / splitCount)));
    const niceSteps = [1, 2, 2.5, 5, 10];
    const normalized = dataMax / step / splitCount;

    let selectedStep: number;
    for (let i = 0; i < niceSteps.length; i++) {
      if (normalized <= niceSteps[i]) {
        selectedStep = niceSteps[i];
        break;
      }
    }
    if (!selectedStep!) selectedStep = 10;

    const niceStep = selectedStep * step;
    return Math.ceil(dataMax / niceStep) * niceStep;
  }

  /**
   * Build values for a "null-gap dashed" series.
   * For every contiguous run of `null` values with a non-null value on both sides,
   * it linearly interpolates values across the whole span between the surrounding points
   * (including those non-null endpoints). Outside such spans it returns `null`.
   */
  private buildDashedNullGapValues(
    values: (number | null)[]
  ): (number | null)[] {
    const result: (number | null)[] = new Array(values.length).fill(null);

    let lastNonNullIndex: number | undefined;

    let i = 0;
    while (i < values.length) {
      if (values[i] !== null) {
        lastNonNullIndex = i;
        i++;
        continue;
      }

      // i is at the start of a contiguous null block.
      while (i < values.length && values[i] === null) i++;

      const rightIndex = i < values.length ? i : undefined;
      if (lastNonNullIndex === undefined || rightIndex === undefined) {
        continue;
      }

      const leftIndex = lastNonNullIndex;
      const leftVal = values[leftIndex]!;
      const rightVal = values[rightIndex]!;
      const span = rightIndex - leftIndex;

      for (let k = leftIndex; k <= rightIndex; k++) {
        const t = (k - leftIndex) / span;
        result[k] = leftVal + (rightVal - leftVal) * t;
      }

      lastNonNullIndex = rightIndex;
      i = rightIndex + 1; // skip the right endpoint (already included)
    }

    return result;
  }

  /**
   * Build EChart option configuration (T008–T012).
   * Handles chart layout, axes, legend, tooltip, and series data.
   */
  private buildOption(
    currentValues: (number | null)[],
    referenceValues: (number | null)[],
    contextSeries: Array<{ name: string; values: (number | null)[] }>,
    fullTimeline: number[],
    rendererConfig: ChartRendererConfig,
    labels: { current: string; reference: string },
    theme: ChartThemeResolved
  ): EChartsOption {
    // Compute nice max Y value (no hardcoded minimum — niceMax handles dataMax <= 0)
    const allNonNull = [
      ...(currentValues.filter((v) => v !== null) as number[]),
      ...(referenceValues.filter((v) => v !== null) as number[]),
      ...contextSeries.flatMap((c) => c.values.filter((v) => v !== null) as number[])
    ];
    const dataMax = allNonNull.length > 0 ? Math.max(...allNonNull) : 0;
    const yMax = this.niceMax(dataMax, 4);
    const yAxisNumberLocale = rendererConfig.numberLocale;
    const yAxisPrecision = rendererConfig.precision;
    const yAxisUnit = rendererConfig.unit;
    const yAxisNumberFormatter = new Intl.NumberFormat(yAxisNumberLocale, {
      maximumFractionDigits: yAxisPrecision,
      minimumFractionDigits: 0
    });
    // ECharts tick values for `G`/`M` can drift slightly from `yMax` due to float precision.
    // UX expectation: the "max tick" should get the unit label reliably.
    const yMaxEps = Math.max(1e-12, Math.abs(yMax) * 1e-9);

    const xMax = Math.max(fullTimeline.length - 1, 0);
    const xIntervalLegacy = xMax > 0 ? Math.max(1, Math.round(xMax / 4)) : 1;
    const currentSeriesVisible = currentValues.some((v) => v !== null);
    const mode = rendererConfig.xAxisMode ?? "adaptive";

    // “Today” pointer = bucket within **current window** on the shared axis (006 FR-B), not the longest window’s calendar.
    const w0s = rendererConfig.currentWindowStartMs;
    const w0e = rendererConfig.currentWindowEndMs;
    const tz = rendererConfig.haTimeZone ?? 'UTC';
    const agg = rendererConfig.primaryAggregation ?? 'day';
    const todaySlotIndex =
      w0s != null && w0e != null
        ? findNowSlotIndexOnComparisonAxis(
            fullTimeline,
            w0s,
            w0e,
            agg,
            tz,
            Date.now()
          )
        : findTimelineSlotContainingInstant(fullTimeline, Date.now());

    const comparisonAxisHints: ComparisonAxisLabelHints | undefined =
      rendererConfig.singleWindowMode !== true
        ? {
            omitYearOnAxis: rendererConfig.comparisonAxisOmitYear === true,
            dayOfMonthOnlyOnAxis:
              rendererConfig.comparisonAxisDayOfMonthOnly === true
          }
        : undefined;

    const xLabelStops = (() => {
      if (mode === "forced") {
        return new Set<number>([
          0,
          xIntervalLegacy,
          xIntervalLegacy * 2,
          xIntervalLegacy * 3,
          xMax
        ]);
      }
      if (currentSeriesVisible) {
        const stops = new Set<number>([0, xMax]);
        if (todaySlotIndex >= 0) {
          stops.add(todaySlotIndex);
        }
        return stops;
      }
      return new Set<number>([
        0,
        xIntervalLegacy,
        xIntervalLegacy * 2,
        xIntervalLegacy * 3,
        xMax
      ]);
    })();

    const xAxisTickInterval =
      mode === "forced"
        ? xIntervalLegacy
        : currentSeriesVisible
          ? 1
          : xIntervalLegacy;

    const formatXAxisLabel = (value: number): string => {
      const tick = Math.round(value);
      if (tick < 0 || tick > xMax) return '';
      if (!xLabelStops.has(tick)) return '';
      if (tick >= fullTimeline.length) return '';

      const modeInner = rendererConfig.xAxisMode ?? "adaptive";
      const zone = rendererConfig.haTimeZone ?? "UTC";
      const labelLocale =
        rendererConfig.xAxisLabelLocale ?? rendererConfig.language ?? "en";

      if (modeInner === "forced" && rendererConfig.xAxisFormatPattern) {
        const ms = fullTimeline[tick]!;
        return formatForcedTickLabel(
          ms,
          zone,
          labelLocale,
          rendererConfig.xAxisFormatPattern
        );
      }

      const agg = rendererConfig.primaryAggregation ?? "day";
      const tailFrom = rendererConfig.tailLabelFromIndex;
      const hasTailContext =
        tailFrom != null &&
        tailFrom < fullTimeline.length &&
        fullTimeline.length > 0;
      const tickOpts =
        hasTailContext || comparisonAxisHints != null
          ? {
              ...(hasTailContext ? { tailFromIndex: tailFrom! } : {}),
              ...(comparisonAxisHints != null
                ? { comparisonHints: comparisonAxisHints }
                : {})
            }
          : undefined;
      return formatAdaptiveTickLabel(
        tick,
        fullTimeline,
        zone,
        labelLocale,
        agg,
        tickOpts
      );
    };

    /** Figma: edge ticks 11px secondary; “today” tick 14px bold primary (when in range). */
    const xAxisRichAdaptive = mode === 'adaptive' && currentSeriesVisible;


    const xAxisAxisLabel = xAxisRichAdaptive
      ? {
          formatter: (value: number) => {
            const text = formatXAxisLabel(value);
            if (!text) return '';
            const tick = Math.round(value);
            if (todaySlotIndex >= 0 && tick === todaySlotIndex) {
              return `{edge|\u00A0}\n{today|${escapeEchartsRichAxisPiece(text)}}`;
            }
            return `{edge|${escapeEchartsRichAxisPiece(text)}}`;
          },
          margin: AXIS_TICK_LABEL_GAP_PX,
          rotate: 0,
          hideOverlap: false,
          alignMinLabel: 'left' as const,
          alignMaxLabel: 'right' as const,
          rich: {
            edge: {
              color: theme.secondaryText,
              ...X_AXIS_RICH_EDGE_METRICS
            },
            today: {
              color: theme.primaryText,
              ...X_AXIS_RICH_TODAY_METRICS
            }
          }
        }
      : {
          color: theme.primaryText,
          formatter: (value: number) => formatXAxisLabel(value),
          margin: AXIS_TICK_LABEL_GAP_PX,
          rotate: 0,
          hideOverlap: true,
          alignMinLabel: 'left' as const,
          alignMaxLabel: 'right' as const
        };

    const fillCurrentOpacity = Math.min(
      Math.max(rendererConfig.fillCurrentOpacity, 0),
      100
    ) / 100;
    const fillReferenceOpacity = Math.min(
      Math.max(rendererConfig.fillReferenceOpacity, 0),
      100
    ) / 100;

    const showReferenceLine =
      rendererConfig.showReferenceComparison !== false &&
      referenceValues.some((v) => v !== null);

    const series: any[] = [];

    // Paint order (ECharts: later series draw on top): oldest windows first, current last before forecast.
    // context[] is ordered by rising window index (2,3,…); higher index = further back = older — reverse for bottom→top.
    for (const ctx of [...contextSeries].reverse()) {
      series.push({
        name: ctx.name,
        type: 'line',
        color: theme.seriesReference,
        data: ctx.values.map((y, i) => (y !== null ? [i, y] : null)),
        lineStyle: { color: theme.seriesReference, width: 1, opacity: 0.42 },
        areaStyle: { opacity: 0 },
        connectNulls: false,
        showSymbol: false,
        smooth: false,
        silent: true,
        tooltip: { show: false },
        emphasis: { focus: 'none' },
        showInLegend: false
      });
    }

    let solidReferenceSeriesIndex: number | undefined;
    if (showReferenceLine) {
      solidReferenceSeriesIndex = series.length;
      series.push({
        name: labels.reference,
        type: 'line',
        color: theme.seriesReference,
        data: referenceValues.map((y, i) => (y !== null ? [i, y] : null)),
        lineStyle: { color: theme.seriesReference, width: 1.5 },
        areaStyle: {
          color: theme.seriesReference,
          opacity: rendererConfig.fillReference ? fillReferenceOpacity : 0
        },
        connectNulls: false,
        showSymbol: false,
        smooth: false,
        symbol: 'circle',
        symbolSize: 6,
        emphasis: {
          focus: 'series',
          showSymbol: true,
          symbolSize: 6,
          itemStyle: { color: theme.seriesReference },
          lineStyle: { color: theme.seriesReference }
        },
        itemStyle: { color: theme.seriesReference }
      });

      const dashedReferenceValues = this.buildDashedNullGapValues(referenceValues);
      if (rendererConfig.connectNulls && dashedReferenceValues.some((v) => v !== null)) {
        series.push({
          name: `${labels.reference} (dashed)`,
          type: 'line',
          color: theme.seriesReference,
          data: dashedReferenceValues.map((y, i) => (y !== null ? [i, y] : null)),
          lineStyle: { type: 'dashed', color: theme.seriesReference, width: 1.5 },
          areaStyle: {
            opacity: 0
          },
          connectNulls: false,
          showSymbol: false,
          smooth: false,
          itemStyle: { color: theme.seriesReference },
          showInLegend: false,
          silent: true,
          tooltip: { show: false },
          emphasis: { focus: 'none' }
        });
      }
    }

    const solidCurrentSeriesIndex = series.length;
    const primaryColor = theme.seriesCurrent;
    series.push({
      name: labels.current,
      type: 'line',
      color: primaryColor,
      data: currentValues.map((y, i) => (y !== null ? [i, y] : null)),
      lineStyle: { color: primaryColor, width: 1.5 },
      areaStyle: {
        color: primaryColor,
        opacity: rendererConfig.fillCurrent ? fillCurrentOpacity : 0
      },
      connectNulls: false,
      showSymbol: false,
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      emphasis: {
        focus: 'series',
        showSymbol: true,
        symbolSize: 6,
        itemStyle: { color: primaryColor },
        lineStyle: { color: primaryColor }
      },
      itemStyle: { color: primaryColor }
    });

    if (rendererConfig.connectNulls) {
      const dashedCurrentValues = this.buildDashedNullGapValues(currentValues);
      if (dashedCurrentValues.some((v) => v !== null)) {
        series.push({
          name: `${labels.current} (dashed)`,
          type: 'line',
          color: primaryColor,
          data: dashedCurrentValues.map((y, i) => (y !== null ? [i, y] : null)),
          lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 },
          areaStyle: {
            opacity: 0
          },
          connectNulls: false,
          showSymbol: false,
          smooth: false,
          itemStyle: { color: primaryColor },
          showInLegend: false,
          silent: true,
          tooltip: { show: false },
          emphasis: { focus: 'none' }
        });
      }
    }

    // Today: full-height guide line + optional delta segment between series (Figma §2.1)

    if (todaySlotIndex >= 0) {
      const todayCurrentY = currentValues[todaySlotIndex] ?? null;
      const todayReferenceY = referenceValues[todaySlotIndex] ?? null;

      const deltaColor =
        rendererConfig.chartSemanticOutcome != null
          ? semanticResolvedLineColor(theme, rendererConfig.chartSemanticOutcome)
          : trendResolvedLineColor(theme, rendererConfig.chartTrend);

      const markLineData: any[] = [
        {
          xAxis: todaySlotIndex,
          lineStyle: {
            color: theme.todayFullHeightLine,
            type: 'dashed',
            width: 1
          }
        }
      ];

      if (
        todayCurrentY !== null &&
        todayReferenceY !== null &&
        Math.abs(todayCurrentY - todayReferenceY) > yMaxEps
      ) {
        const yLo = Math.min(todayCurrentY, todayReferenceY);
        const yHi = Math.max(todayCurrentY, todayReferenceY);
        markLineData.push([
          {
            coord: [todaySlotIndex, yLo],
            lineStyle: { color: deltaColor, width: 3, type: 'solid' }
          },
          {
            coord: [todaySlotIndex, yHi],
            lineStyle: { color: deltaColor, width: 3, type: 'solid' }
          }
        ]);
      }

      const markPointData: any[] = [];
      if (todayCurrentY !== null) {
        markPointData.push({
          coord: [todaySlotIndex, todayCurrentY],
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: primaryColor,
            borderColor: theme.referenceDotBorder,
            borderWidth: 2
          }
        });
      }

      (series[solidCurrentSeriesIndex] as any).markLine = {
        silent: true,
        symbol: ['none', 'none'],
        label: { show: false },
        data: markLineData,
        lineStyle: { type: 'dashed', color: theme.todayFullHeightLine, width: 1 }
      };

      (series[solidCurrentSeriesIndex] as any).markPoint = {
        silent: true,
        data: markPointData
      };

      if (solidReferenceSeriesIndex !== undefined && todayReferenceY !== null) {
        (series[solidReferenceSeriesIndex] as any).markPoint = {
          silent: true,
          data: [
            {
              coord: [todaySlotIndex, todayReferenceY],
              symbol: 'circle',
              symbolSize: 7,
              itemStyle: {
                color: theme.seriesReference,
                borderColor: theme.referenceDotBorder,
                borderWidth: 2
              }
            }
          ]
        };
      }

      // Forecast series (T012)
      if (
        rendererConfig.showForecast &&
        todaySlotIndex >= 0 &&
        todayCurrentY !== null &&
        rendererConfig.forecastTotal !== undefined
      ) {
        series.push({
          name: rendererConfig.forecastLabel,
          type: 'line',
          color: primaryColor,
          data: [[todaySlotIndex, todayCurrentY], [fullTimeline.length - 1, rendererConfig.forecastTotal]],
          lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 },
          areaStyle: { opacity: 0 },
          showSymbol: false,
          connectNulls: false,
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            focus: 'series',
            showSymbol: true,
            symbolSize: 6,
            itemStyle: { color: primaryColor },
            lineStyle: { color: primaryColor }
          },
          itemStyle: { color: primaryColor }
        });
      }
    } else {
      // No today marker - add empty mark point arrays
      (series[solidCurrentSeriesIndex] as any).markPoint = { silent: true, data: [] };
      (series[solidCurrentSeriesIndex] as any).markLine = {
        silent: true,
        symbol: ['none', 'none'],
        label: { show: false },
        data: [],
        lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 }
      };
      if (solidReferenceSeriesIndex !== undefined) {
        (series[solidReferenceSeriesIndex] as any).markPoint = { silent: true, data: [] };
      }
    }

    const todayCurrentForLegend =
      todaySlotIndex >= 0 ? (currentValues[todaySlotIndex] ?? null) : null;
    const willShowForecast =
      todaySlotIndex >= 0 &&
      rendererConfig.showForecast &&
      todayCurrentForLegend !== null &&
      rendererConfig.forecastTotal !== undefined;

    const legendData: string[] = [labels.current];
    if (showReferenceLine) {
      legendData.push(labels.reference);
    }
    if (willShowForecast) {
      legendData.push(rendererConfig.forecastLabel);
    }

    const option: EChartsOption = {
      animation: false,
      // Explicit grid bounds — `containLabel: false` so each side means the exact pixel distance
      // from the chart canvas edge to the axis line. Labels hang outside the plot area into the
      // reserved space. GRID_BOTTOM_PX is always the full two-line budget so chart height is
      // stable regardless of whether "today" is in range. GRID_LEFT_PX accommodates Y-axis labels.
      grid: {
        containLabel: false,
        left: GRID_LEFT_PX,
        right: AXIS_TICK_LABEL_GAP_PX,
        top: GRID_TOP_FALLBACK_PX,
        bottom: GRID_BOTTOM_PX
      },
      legend: {
        show: rendererConfig.showLegend === true,
        ...(rendererConfig.showLegend === true ? { data: legendData } : {}),
        top: 0,
        left: 'center',
        textStyle: { color: theme.primaryText },
        pageTextStyle: { color: theme.primaryText }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltipBackground,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.primaryText },
        axisPointer: {
          type: 'shadow',
          // Tint from `--divider-color` (same as split lines); opacity keeps the overlay subtle.
          shadowStyle: { color: theme.grid, opacity: 0.2 }
        },
        appendTo: this.container,
        formatter: (params: unknown) => {
          const items = Array.isArray(params) ? params : [params];
          const slotIndex = resolveTimelineSlotIndexFromAxisParams(
            items,
            fullTimeline.length,
            {
              currentName: labels.current,
              referenceName: labels.reference
            }
          );

          const numberLocale = rendererConfig.numberLocale;
          const precision = rendererConfig.precision;
          const unit = rendererConfig.unit;

          const numberFormatter = new Intl.NumberFormat(numberLocale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
          });

          const escapeHtml = (value: string): string =>
            value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');

          const labelLocale =
            rendererConfig.xAxisLabelLocale ?? rendererConfig.language ?? 'en';
          const header = formatTooltipHeader({
            slotIndex,
            fullTimeline,
            zone: rendererConfig.haTimeZone ?? 'UTC',
            labelLocale,
            primaryAggregation: rendererConfig.primaryAggregation ?? 'day',
            mergedDurationMs: rendererConfig.mergedDurationMs ?? 0,
            tooltipFormatPattern: rendererConfig.tooltipFormatPattern,
            comparisonHints: comparisonAxisHints
          });

          const valueLines: string[] = [];
          for (const p of items) {
            const item: any = p ?? {};

            const seriesName = typeof item?.seriesName === 'string' ? item.seriesName : '';
            if (
              seriesName !== labels.current &&
              seriesName !== labels.reference &&
              seriesName !== rendererConfig.forecastLabel
            ) {
              continue;
            }

            const candidate = item?.data ?? item?.value;

            let y: unknown;
            if (Array.isArray(candidate)) {
              y = candidate.length > 1 ? candidate[1] : candidate[0];
            } else {
              y = candidate;
            }

            if (y === null || y === undefined) continue;

            const yNum = typeof y === 'number' ? y : Number(y);
            if (!Number.isFinite(yNum)) continue;
            const formatted = numberFormatter.format(yNum);
            const escapedSeries = escapeHtml(seriesName);
            const escapedUnit = escapeHtml(unit);

            valueLines.push(
              `<div class="tooltip-row">${escapedSeries ? `${escapedSeries}: ` : ''}${formatted} ${escapedUnit}</div>`
            );
          }

          const valuesHtml = valueLines.join('');
          return `<div class="tooltip-container"><div class="tooltip-header">${escapeHtml(
            header
          )}</div>${valuesHtml}</div>`;
        }
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: xMax,
        interval: xAxisTickInterval,
        // For `value` axis ECharts typings expect a tuple; [0,0] means "no gap".
        boundaryGap: [0, 0],
        splitLine: { show: false },
        // Show only a few readable labels (avoid overlapping text).
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: xAxisAxisLabel
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        splitNumber: 4,
        splitLine: {
          show: true,
          lineStyle: { color: theme.grid, width: 1 }
        },
        // Oś ma się składać tylko z ticków i wartości (bez pionowej linii osi).
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: theme.primaryText,
          formatter: (value: number) => {
            const vMid = yMax / 2;
            const tolMid = Math.max(yMax * 0.02, 1e-9);
            const isZero = Math.abs(value - 0) <= yMaxEps;
            const isMid = Math.abs(value - vMid) <= tolMid;
            const isMaxTick = Math.abs(value - yMax) <= yMaxEps;
            if (!isZero && !isMid && !isMaxTick) {
              return '';
            }

            const formatted = yAxisNumberFormatter.format(value);
            if (isMaxTick && yAxisUnit) {
              return `${formatted} ${yAxisUnit}`;
            }
            return formatted;
          },
          margin: AXIS_TICK_LABEL_GAP_PX,
          // Ensures the margin translates to spacing on the right side.
          align: 'right'
        }
      },
      series
    };

    return option;
  }

  /**
   * Update chart with new data (T013).
   * Aligns series to timeline, checks hash for perf, builds option, updates instance.
   */
  update(
    comparisonSeries: ComparisonSeries,
    fullTimeline: number[],
    rendererConfig: ChartRendererConfig,
    labels: { current: string; reference: string }
  ): void {
    if (!this.instance) return;

    const t0 = fullTimeline[0] ?? 0;
    const aligns = rendererConfig.windowAlignStartsMs ?? [];
    const align0 = aligns[0] ?? t0;
    const align1 =
      aligns[1] ??
      (rendererConfig.referencePeriodStart != null
        ? rendererConfig.referencePeriodStart
        : t0);

    const currentValues = this.alignSeriesOnTimeline(
      comparisonSeries.current.points,
      fullTimeline,
      align0
    );

    const referenceValues = comparisonSeries.reference
      ? this.alignSeriesOnTimeline(
          comparisonSeries.reference.points,
          fullTimeline,
          align1
        )
      : new Array(fullTimeline.length).fill(null);

    const w0Start = rendererConfig.currentWindowStartMs;
    const w0End = rendererConfig.currentWindowEndMs;
    const alignsAll = rendererConfig.windowAlignStartsMs;
    if (
      w0Start != null &&
      w0End != null &&
      alignsAll != null &&
      alignsAll.length > 0
    ) {
      carryForwardCurrentCumulativeAtNow(
        currentValues,
        fullTimeline,
        Date.now(),
        alignsAll[0]!,
        w0Start,
        w0End,
        comparisonSeries.aggregation ?? "day",
        rendererConfig.haTimeZone ?? "UTC"
      );
    }

    const contextSeries =
      comparisonSeries.context?.map((ctx, idx) => ({
        name: ctx.periodLabel,
        values: this.alignSeriesOnTimeline(
          ctx.points,
          fullTimeline,
          aligns[idx + 2] ?? t0
        )
      })) ?? [];

    const theme = this.resolveChartTheme(rendererConfig);

    const hash = JSON.stringify({
      c: currentValues,
      r: referenceValues,
      x: contextSeries,
      cfg: rendererConfig,
      theme
    });

    if (this.lastHash === hash) {
      return;
    }
    this.lastHash = hash;

    this.lastSyncedGridTop = undefined;
    this.lastSyncedMinHeightTotalPx = undefined;
    this.container.style.minHeight = '';

    const option = this.buildOption(
      currentValues,
      referenceValues,
      contextSeries,
      fullTimeline,
      rendererConfig,
      labels,
      theme
    );

    this.instance.setOption(option, { notMerge: true });
  }
}
