// Modular ECharts imports (FR-014, FR-015)
import { init as echartsInit, use as echartsUse } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';
import type { EChartsOption } from 'echarts';

import type { ComparisonSeries, ChartRendererConfig, TimeSeriesPoint } from './types';
import {
  formatAdaptiveTickLabel,
  formatForcedTickLabel
} from './axis/axis-label-format';
import { formatTooltipHeader } from './axis/tooltip-format';

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

/** Matches `min-height` on the chart container in `energy-horizon-card-styles.ts`. */
const CHART_MIN_HEIGHT_BASE_PX = 240;

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
          top: gridTopPx
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

    const slotDuration = timeline.length > 1 ? timeline[1]! - timeline[0]! : 86400000;
    const timelineStart = timeline[0]!;

    for (let i = 0; i < timeline.length; i++) {
      const slotStart = timeline[i]!;
      const expectedTs = alignStartMs + (slotStart - timelineStart);

      let matchedValue: number | null = null;
      for (const point of points) {
        const slotEnd = expectedTs + slotDuration;
        if (point.timestamp >= expectedTs && point.timestamp < slotEnd) {
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
   * Resolve primary color from config or theme CSS variables (T005).
   */
  private resolveColor(primaryColorConfig: string): string {
    if (primaryColorConfig.trim()) return primaryColorConfig;
    const styles = getComputedStyle(this.getThemeHost());
    const accentColor = styles.getPropertyValue('--accent-color').trim();
    if (accentColor) return accentColor;
    const primaryColor = styles.getPropertyValue('--primary-color').trim();
    if (primaryColor) return primaryColor;
    return '#03a9f4';
  }

  /**
   * Read Home Assistant theme tokens from the card host (`getComputedStyle`).
   */
  private getHaThemeTokens(): {
    referenceLine: string;
    /** Horizontal grid lines (`yAxis.splitLine`); also used for tooltip border and axis-pointer shadow tint. */
    grid: string;
    primaryText: string;
    tooltipBackground: string;
    tooltipBorder: string;
  } {
    const styles = getComputedStyle(this.getThemeHost());

    const referenceLine =
      styles.getPropertyValue('--secondary-text-color').trim() || 'rgba(127, 127, 127, 0.4)';
    const grid =
      styles.getPropertyValue('--divider-color').trim() || 'rgba(127, 127, 127, 0.3)';
    const primaryText =
      styles.getPropertyValue('--primary-text-color').trim() || 'rgba(0, 0, 0, 0.87)';

    const tooltipBackground =
      styles.getPropertyValue('--ha-card-background').trim() ||
      styles.getPropertyValue('--card-background-color').trim() ||
      '#ffffff';

    const tooltipBorder = grid;

    return {
      referenceLine,
      grid,
      primaryText,
      tooltipBackground,
      tooltipBorder
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
    primaryColor: string,
    theme: {
      referenceLine: string;
      grid: string;
      primaryText: string;
      tooltipBackground: string;
      tooltipBorder: string;
    }
  ): EChartsOption {
    // Keep a fixed visual gap between axis ticks and tick labels.
    // For yAxis labels this manifests as spacing on the right side of the label;
    // for xAxis labels as spacing above the label.
    const tickLabelGapPx = 8;

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
    // Use an interval that places ticks at exactly 0, 25%, 50%, 75% and max.
    // With interval=1 and 365 ticks ECharts' hideOverlap misdetects collisions
    // between empty-string labels and hides edge (0 / max) labels entirely.
    const xInterval = xMax > 0 ? Math.max(1, Math.round(xMax / 4)) : 1;
    const xLabelStops = new Set<number>([
      0,
      xInterval,
      xInterval * 2,
      xInterval * 3,
      xMax
    ]);
    const formatXAxisLabel = (value: number): string => {
      const tick = Math.round(value);
      if (tick < 0 || tick > xMax) return '';
      if (!xLabelStops.has(tick)) return '';
      if (tick >= fullTimeline.length) return '';

      const mode = rendererConfig.xAxisMode ?? "adaptive";
      const zone = rendererConfig.haTimeZone ?? "UTC";
      const labelLocale =
        rendererConfig.xAxisLabelLocale ?? rendererConfig.language ?? "en";

      if (mode === "forced" && rendererConfig.xAxisFormatPattern) {
        const ms = fullTimeline[tick]!;
        return formatForcedTickLabel(
          ms,
          zone,
          labelLocale,
          rendererConfig.xAxisFormatPattern
        );
      }

      const agg = rendererConfig.primaryAggregation ?? "day";
      return formatAdaptiveTickLabel(
        tick,
        fullTimeline,
        zone,
        labelLocale,
        agg
      );
    };

    // Today slot (needed for forecast + legend order; same semantics as previous block order)
    const todayMs = new Date();
    todayMs.setHours(0, 0, 0, 0);
    const todayTimestamp = todayMs.getTime();
    const todaySlotIndex = fullTimeline.indexOf(todayTimestamp);

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
        color: theme.referenceLine,
        data: ctx.values.map((y, i) => (y !== null ? [i, y] : null)),
        lineStyle: { color: theme.referenceLine, width: 1, opacity: 0.42 },
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
        color: theme.referenceLine,
        data: referenceValues.map((y, i) => (y !== null ? [i, y] : null)),
        lineStyle: { color: theme.referenceLine, width: 1.5 },
        areaStyle: {
          color: theme.referenceLine,
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
          itemStyle: { color: theme.referenceLine },
          lineStyle: { color: theme.referenceLine }
        },
        itemStyle: { color: theme.referenceLine }
      });

      const dashedReferenceValues = this.buildDashedNullGapValues(referenceValues);
      if (rendererConfig.connectNulls && dashedReferenceValues.some((v) => v !== null)) {
        series.push({
          name: `${labels.reference} (dashed)`,
          type: 'line',
          color: theme.referenceLine,
          data: dashedReferenceValues.map((y, i) => (y !== null ? [i, y] : null)),
          lineStyle: { type: 'dashed', color: theme.referenceLine, width: 1.5 },
          areaStyle: {
            opacity: 0
          },
          connectNulls: false,
          showSymbol: false,
          smooth: false,
          itemStyle: { color: theme.referenceLine },
          showInLegend: false,
          silent: true,
          tooltip: { show: false },
          emphasis: { focus: 'none' }
        });
      }
    }

    const solidCurrentSeriesIndex = series.length;
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

    // Today marker computation (T010)

    if (todaySlotIndex >= 0) {
      const todayCurrentY = currentValues[todaySlotIndex] ?? null;
      const todayReferenceY = referenceValues[todaySlotIndex] ?? null;

      // Compute yTop for vertical marker line (Variant A/B from FR-004)
      let markLineY: number | undefined;
      if (todayCurrentY !== null && todayReferenceY !== null) {
        markLineY = Math.max(todayCurrentY, todayReferenceY);
      } else if (todayCurrentY !== null) {
        markLineY = todayCurrentY;
      } else if (todayReferenceY !== null) {
        markLineY = todayReferenceY;
      }

      // Add today marker line and points to current series
      const markLineData: any[] = [];
      if (markLineY !== undefined) {
        markLineData.push([{ coord: [todaySlotIndex, markLineY] }, { coord: [todaySlotIndex, 0] }]);
      } else {
        markLineData.push([{ xAxis: todaySlotIndex }, { xAxis: todaySlotIndex }]);
      }

      const markPointData: any[] = [];
      if (todayCurrentY !== null) {
        markPointData.push({
          coord: [todaySlotIndex, todayCurrentY],
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: primaryColor }
        });
      }

      (series[solidCurrentSeriesIndex] as any).markLine = {
        silent: true,
        symbol: ['none', 'none'],
        data: markLineData,
        lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 }
      };

      (series[solidCurrentSeriesIndex] as any).markPoint = {
        silent: true,
        data: markPointData
      };

      // Add reference series today mark point (T011)
      if (solidReferenceSeriesIndex !== undefined && todayReferenceY !== null) {
        (series[solidReferenceSeriesIndex] as any).markPoint = {
          silent: true,
          data: [{
            coord: [todaySlotIndex, todayReferenceY],
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: { color: theme.referenceLine }
          }]
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
      (series[solidCurrentSeriesIndex] as any).markLine = { silent: true, symbol: ['none', 'none'], data: [], lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 } };
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
      // Explicit grid bounds to avoid ECharts default large paddings.
      // `containLabel: true` keeps axis labels inside the grid area.
      grid: {
        containLabel: true,
        // Give the X-axis edge labels some breathing room on responsive layouts.
        left: tickLabelGapPx,
        right: tickLabelGapPx,
        top: GRID_TOP_FALLBACK_PX,
        bottom: 0
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
          const first: any = items[0] ?? {};

          const rawIndex =
            first?.dataIndex ??
            first?.axisValue ??
            first?.data?.[0] ??
            first?.value?.[0];
          const slotIndex =
            typeof rawIndex === 'number' ? rawIndex : Number(rawIndex);

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
            tooltipFormatPattern: rendererConfig.tooltipFormatPattern
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
        interval: xInterval,
        // For `value` axis ECharts typings expect a tuple; [0,0] means "no gap".
        boundaryGap: [0, 0],
        splitLine: { show: false },
        // Show only a few readable labels (avoid overlapping text).
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: theme.primaryText,
          formatter: (value: number) => formatXAxisLabel(value),
          margin: tickLabelGapPx,
          rotate: 0,
          hideOverlap: true,
          // Keep both edge labels inside the grid area.
          alignMinLabel: 'left',
          // Keeps the last (max) label within the grid by aligning its right edge to the right-side tick.
          // This prevents cases where the last label gets clipped/shifted (e.g. `30` vs `3` / `365` not visible).
          alignMaxLabel: 'right'
        }
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
            const formatted = yAxisNumberFormatter.format(value);
            const isMaxTick = Math.abs(value - yMax) <= yMaxEps;

            // unit is pre-scaled by scaleSeriesValues() in cumulative-comparison-chart.ts
            return isMaxTick && yAxisUnit ? `${formatted} ${yAxisUnit}` : formatted;
          },
          margin: tickLabelGapPx,
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

    const contextSeries =
      comparisonSeries.context?.map((ctx, idx) => ({
        name: ctx.periodLabel,
        values: this.alignSeriesOnTimeline(
          ctx.points,
          fullTimeline,
          aligns[idx + 2] ?? t0
        )
      })) ?? [];

    const theme = this.getHaThemeTokens();

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

    const primaryColor = this.resolveColor(rendererConfig.primaryColor);
    const option = this.buildOption(
      currentValues,
      referenceValues,
      contextSeries,
      fullTimeline,
      rendererConfig,
      labels,
      primaryColor,
      theme
    );

    this.instance.setOption(option, { notMerge: true });
  }
}
