// Modular ECharts imports (FR-014, FR-015)
import { init as echartsInit, use as echartsUse } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';
import type { EChartsOption } from 'echarts';

import type { ComparisonSeries, ChartRendererConfig, TimeSeriesPoint } from './types';

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

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Initialize ECharts instance
    this.instance = echartsInit(container);
    
    // Set up resize observer to handle container size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.instance?.resize();
    });
    this.resizeObserver.observe(container);
  }

  destroy(): void {
    this.resizeObserver.disconnect();
    this.instance?.dispose();
    this.instance = undefined;
  }

  /**
   * Align series data points to the timeline.
   * Port of alignSeriesOnTimeline from chart-renderer.ts (T004).
   */
  private alignSeriesOnTimeline(
    points: TimeSeriesPoint[],
    timeline: number[],
    referenceStart?: Date
  ): (number | null)[] {
    const result: (number | null)[] = new Array(timeline.length).fill(null);

    if (timeline.length === 0) {
      return result;
    }

    const slotDuration = timeline.length > 1 ? timeline[1] - timeline[0] : 86400000;

    for (let i = 0; i < timeline.length; i++) {
      const slotStart = timeline[i];
      const slotEnd = timeline[i + 1] ?? slotStart + slotDuration;

      let matchedValue: number | null = null;

      if (referenceStart === undefined) {
        // Current series: match points within the current slot
        for (const point of points) {
          if (point.timestamp >= slotStart && point.timestamp < slotEnd) {
            matchedValue = point.value;
            break;
          }
        }
      } else {
        // Reference series: compute expected timestamp based on offset
        const expectedTs = referenceStart.getTime() + (slotStart - timeline[0]);
        for (const point of points) {
          if (
            point.timestamp >= expectedTs &&
            point.timestamp < expectedTs + slotDuration
          ) {
            matchedValue = point.value;
            break;
          }
        }
      }

      result[i] = matchedValue;
    }

    return result;
  }

  /**
   * Resolve primary color from config or theme CSS variables (T005).
   */
  private resolveColor(primaryColorConfig: string): string {
    if (primaryColorConfig.trim()) return primaryColorConfig;
    const host =
      (this.container.closest('.ehc-card') as HTMLElement | null) ??
      (this.container.closest('ha-card') as HTMLElement | null) ??
      this.container;
    const styles = getComputedStyle(host);
    const accentColor = styles.getPropertyValue('--accent-color').trim();
    if (accentColor) return accentColor;
    const primaryColor = styles.getPropertyValue('--primary-color').trim();
    if (primaryColor) return primaryColor;
    return '#03a9f4';
  }

  /**
   * Get theme colors from CSS variables (T005).
   */
  private getThemeColors(): { referenceLine: string; grid: string } {
    const host =
      (this.container.closest('.ehc-card') as HTMLElement | null) ??
      (this.container.closest('ha-card') as HTMLElement | null) ??
      this.container;
    const styles = getComputedStyle(host);

    const referenceColor =
      styles.getPropertyValue('--secondary-text-color').trim() || '#727272';
    const gridColor =
      styles.getPropertyValue('--divider-color').trim() ||
      'rgba(127, 127, 127, 0.3)';

    return {
      referenceLine: referenceColor,
      grid: gridColor
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
   * Build EChart option configuration (T008–T012).
   * Handles chart layout, axes, legend, tooltip, and series data.
   */
  private buildOption(
    currentValues: (number | null)[],
    referenceValues: (number | null)[],
    fullTimeline: number[],
    rendererConfig: ChartRendererConfig,
    labels: { current: string; reference: string },
    primaryColor: string,
    theme: { referenceLine: string; grid: string }
  ): EChartsOption {
    // Compute nice max Y value
    const dataMax = Math.max(
      ...currentValues.filter((v) => v !== null) as number[],
      ...referenceValues.filter((v) => v !== null) as number[],
      1
    );
    const yMax = this.niceMax(dataMax, 4);

    const xMax = Math.max(fullTimeline.length - 1, 0);
    const xLabelStops = new Set<number>([
      0,
      Math.round(xMax * 0.25),
      Math.round(xMax * 0.5),
      Math.round(xMax * 0.75),
      xMax
    ]);
    const formatXAxisLabel = (value: number): string => {
      const tick = Math.round(value);
      if (tick < 0 || tick > xMax) return '';
      return xLabelStops.has(tick) ? String(tick) : '';
    };

    const series: any[] = [];

    // Current series (T009)
    const fillCurrentOpacity = Math.min(
      Math.max(rendererConfig.fillCurrentOpacity, 0),
      100
    ) / 100;
    const fillReferenceOpacity = Math.min(
      Math.max(rendererConfig.fillReferenceOpacity, 0),
      100
    ) / 100;

    series.push({
      name: labels.current,
      type: 'line',
      // ECharts uses `series.color` (and/or itemStyle) for hover symbols and tooltip markers.
      color: primaryColor,
      data: currentValues.map((y, i) => (y !== null ? [i, y] : null)),
      lineStyle: { color: primaryColor, width: 1.5 },
      areaStyle: {
        // Ensure the filled area matches the line color, with separate opacity.
        color: primaryColor,
        opacity: rendererConfig.fillCurrent ? fillCurrentOpacity : 0
      },
      connectNulls: false,
      showSymbol: false,
      smooth: false,
      // Show a symbol on hover (with the same color as the line).
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

    // Reference series (T011) - optional
    if (rendererConfig.showForecast && referenceValues.some((v) => v !== null)) {
      series.push({
        name: labels.reference,
        type: 'line',
        color: theme.referenceLine,
        data: referenceValues.map((y, i) => (y !== null ? [i, y] : null)),
        lineStyle: { color: theme.referenceLine, width: 1.5 },
        areaStyle: {
          // Ensure the filled area matches the reference line color, with separate opacity.
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
    }

    // Today marker computation (T010)
    const todayMs = new Date();
    todayMs.setHours(0, 0, 0, 0);
    const todayTimestamp = todayMs.getTime();
    const todaySlotIndex = fullTimeline.indexOf(todayTimestamp);

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

      (series[0] as any).markLine = {
        silent: true,
        symbol: ['none', 'none'],
        data: markLineData,
        lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 }
      };

      (series[0] as any).markPoint = {
        silent: true,
        data: markPointData
      };

      // Add reference series today mark point (T011)
      if (series.length > 1 && todayReferenceY !== null) {
        (series[1] as any).markPoint = {
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
      (series[0] as any).markPoint = { silent: true, data: [] };
      (series[0] as any).markLine = { silent: true, symbol: ['none', 'none'], data: [], lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 } };
      if (series.length > 1) {
        (series[1] as any).markPoint = { silent: true, data: [] };
      }
    }

    const option: EChartsOption = {
      animation: false,
      // Explicit grid bounds to avoid ECharts default large paddings.
      // `containLabel: true` keeps axis labels inside the grid area.
      grid: {
        containLabel: true,
        left: 0,
        right: 0,
        top: 32,
        bottom: 0
      },
      legend: { show: true, top: 0, left: "center" },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
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

          const comparisonMode = rendererConfig.comparisonMode;
          const language = rendererConfig.language;
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

          const formatHeader = (): string => {
            if (!Number.isFinite(slotIndex)) return '';

            if (comparisonMode === 'year_over_year') {
              const dayNumber = Math.trunc(slotIndex) + 1;
              const lang = String(language).toLowerCase();

              let unitWord: string;
              if (lang.startsWith('pl')) {
                unitWord = dayNumber === 1 ? 'dzień' : 'dni';
              } else {
                unitWord = dayNumber === 1 ? 'day' : 'days';
              }

              return `${dayNumber} ${unitWord}`;
            }

            // month_over_year
            const ts = fullTimeline[slotIndex];
            if (ts == null) return '';

            return new Intl.DateTimeFormat(language, {
              day: 'numeric',
              month: 'long'
            }).format(new Date(ts));
          };

          const header = formatHeader();

          const valueLines: string[] = [];
          for (const p of items) {
            const item: any = p ?? {};

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

            const seriesName = typeof item?.seriesName === 'string' ? item.seriesName : '';
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
        interval: 1,
        // For `value` axis ECharts typings expect a tuple; [0,0] means "no gap".
        boundaryGap: [0, 0],
        splitLine: { show: false },
        // Show only a few readable labels (avoid overlapping text).
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          formatter: (value: number) => formatXAxisLabel(value),
          margin: 0,
          hideOverlap: true
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        splitNumber: 4,
        // Oś ma się składać tylko z ticków i wartości (bez pionowej linii osi).
        axisLine: { show: false },
        axisLabel: {
          formatter: (value: number) => {
            if (value === yMax) {
              return `${value} ${rendererConfig.unit}`;
            }
            return String(value);
          },
          margin: 0
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

    // Align series to timeline
    const currentValues = this.alignSeriesOnTimeline(
      comparisonSeries.current.points,
      fullTimeline
    );

    const referenceValues = comparisonSeries.reference
      ? this.alignSeriesOnTimeline(
          comparisonSeries.reference.points,
          fullTimeline,
          rendererConfig.referencePeriodStart != null
            ? new Date(rendererConfig.referencePeriodStart)
            : undefined
        )
      : new Array(fullTimeline.length).fill(null);

    // Compute hash for memoization (FR-012)
    const hash = JSON.stringify({
      c: currentValues,
      r: referenceValues,
      cfg: rendererConfig
    });

    if (this.lastHash === hash) {
      return;
    }
    this.lastHash = hash;

    // Resolve colors and build option
    const primaryColor = this.resolveColor(rendererConfig.primaryColor);
    const theme = this.getThemeColors();
    const option = this.buildOption(
      currentValues,
      referenceValues,
      fullTimeline,
      rendererConfig,
      labels,
      primaryColor,
      theme
    );

    // Update ECharts instance
    this.instance.setOption(option, { notMerge: true });
  }
}
