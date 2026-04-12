// DEPRECATED: This file is being replaced by echarts-renderer.ts during the 003-echarts-migration.
// Imports are commented out to prevent build errors during migration.
// Do not use ChartRenderer - use EChartsRenderer instead.

/* eslint-disable */
// import {
//   Chart,
//   LineController,
//   LineElement,
//   PointElement,
//   LinearScale,
//   TimeScale,
//   Tooltip,
//   Legend,
//   Filler
// } from "chart.js";
// import "chartjs-adapter-date-fns";
import type { ComparisonSeries, ChartRendererConfig, TimeSeriesPoint } from "./types";
import { findTimelineSlotContainingInstant } from "./axis/now-marker-slot";

/** Labels must be pre-localized by the card; this module does not use translation files. */

// Chart.register(
//   LineController,
//   LineElement,
//   PointElement,
//   LinearScale,
//   TimeScale,
//   Tooltip,
//   Legend,
//   Filler
// );

// Internal type used in Phase 3 for chart data points
type ChartPoint = { x: number; y: number | null };

export class ChartRenderer {
  private chart?: Chart;
  private lastHash?: string;
  private _todaySlotIndex: number = -1;
  private _todayCurrentY: number | undefined;
  private _todayReferenceY: number | undefined;
  private _primaryColorResolved: string = "#03a9f4";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }
  private readonly canvas: HTMLCanvasElement;

  private getThemeColors(): {
    currentLine: string;
    referenceLine: string;
    grid: string;
  } {
    const host =
      (this.canvas.closest(".ebc-card") as HTMLElement | null) ??
      (this.canvas.closest("ha-card") as HTMLElement | null) ??
      this.canvas;
    const styles = getComputedStyle(host);

    const primaryColor =
      styles.getPropertyValue("--accent-color").trim() ||
      styles.getPropertyValue("--primary-color").trim() ||
      "#03a9f4";
    const referenceColor =
      styles.getPropertyValue("--secondary-text-color").trim() || "#727272";
    const gridColor =
      styles.getPropertyValue("--divider-color").trim() ||
      "rgba(127, 127, 127, 0.3)";

    return {
      currentLine: primaryColor,
      referenceLine: referenceColor,
      grid: gridColor
    };
  }

  destroy(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }

  // T016: Convert CSS color to RGBA with specific opacity
  private colorWithOpacity(cssColor: string, alpha: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "transparent";
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const [r, g, b] = imageData.data;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Helper to resolve primary color (used in later phases)
  private resolveColor(primaryColorConfig: string): string {
    if (primaryColorConfig.trim()) return primaryColorConfig;
    const host =
      (this.canvas.closest(".ebc-card") as HTMLElement | null) ??
      (this.canvas.closest("ha-card") as HTMLElement | null) ??
      this.canvas;
    const styles = getComputedStyle(host);
    const accentColor = styles.getPropertyValue("--accent-color").trim();
    if (accentColor) return accentColor;
    const primaryColor = styles.getPropertyValue("--primary-color").trim();
    if (primaryColor) return primaryColor;
    return "#03a9f4";
  }

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

  /** @param labels - Pre-localized legend labels from the card (e.g. period.current / period.reference). */
  update(
    series: ComparisonSeries,
    fullTimeline: number[],
    rendererConfig: ChartRendererConfig,
    labels: { current: string; reference: string }
  ): void {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    const currentValues = this.alignSeriesOnTimeline(
      series.current.points,
      fullTimeline
    );

    const referenceValues = series.reference
      ? this.alignSeriesOnTimeline(
          series.reference.points,
          fullTimeline,
          rendererConfig.referencePeriodStart != null
            ? new Date(rendererConfig.referencePeriodStart)
            : undefined
        )
      : new Array(fullTimeline.length).fill(null);

    // Current-instant slot for today marker (same semantics as EChartsRenderer)
    this._todaySlotIndex = findTimelineSlotContainingInstant(
      fullTimeline,
      Date.now()
    );
    this._todayCurrentY =
      this._todaySlotIndex >= 0
        ? currentValues[this._todaySlotIndex] ?? undefined
        : undefined;
    this._todayReferenceY =
      this._todaySlotIndex >= 0
        ? referenceValues[this._todaySlotIndex] ?? undefined
        : undefined;

    const currentData = currentValues.map((y, i) => ({ x: i, y } as ChartPoint));

    const referenceData = referenceValues.map((y, i) => ({ x: i, y } as ChartPoint));

    const hash = JSON.stringify({
      c: currentData,
      r: referenceData,
      cfg: rendererConfig
    });

    if (this.lastHash === hash && this.chart) {
      return;
    }
    this.lastHash = hash;

    const theme = this.getThemeColors();

    // T019: Resolve primary color from config or theme (must come before datasets)
    this._primaryColorResolved = this.resolveColor(rendererConfig.primaryColor);

    // T015: Today marker plugin
    const self = this;
    const todayMarkerPlugin = {
      id: "todayMarker",
      afterDraw(chart: Chart) {
        if (self._todaySlotIndex < 0) return;

        const xPixel = chart.scales["x"].getPixelForValue(self._todaySlotIndex);
        const y0 = chart.scales["y"].getPixelForValue(0);
        const ctx = chart.ctx;

        // Determine the highest Y pixel to draw the dashed line
        let yTop: number;
        if (
          self._todayCurrentY !== undefined &&
          self._todayReferenceY !== undefined
        ) {
          const currentPixel = chart.scales["y"].getPixelForValue(
            self._todayCurrentY
          );
          const referencePixel = chart.scales["y"].getPixelForValue(
            self._todayReferenceY
          );
          yTop = Math.min(currentPixel, referencePixel);
        } else if (self._todayCurrentY !== undefined) {
          yTop = chart.scales["y"].getPixelForValue(self._todayCurrentY);
        } else if (self._todayReferenceY !== undefined) {
          yTop = chart.scales["y"].getPixelForValue(self._todayReferenceY);
        } else {
          yTop = chart.chartArea.top;
        }

        // Draw dashed vertical line
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = self._primaryColorResolved;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(xPixel, y0);
        ctx.lineTo(xPixel, yTop);
        ctx.stroke();
        ctx.restore();

        // Draw filled circles at today's values
        const circleRadius = 3;
        if (self._todayCurrentY !== undefined) {
          const yPixel = chart.scales["y"].getPixelForValue(
            self._todayCurrentY
          );
          ctx.fillStyle = self._primaryColorResolved;
          ctx.beginPath();
          ctx.arc(xPixel, yPixel, circleRadius, 0, 2 * Math.PI);
          ctx.fill();
        }
        if (self._todayReferenceY !== undefined) {
          const yPixel = chart.scales["y"].getPixelForValue(
            self._todayReferenceY
          );
          ctx.fillStyle = theme.referenceLine;
          ctx.beginPath();
          ctx.arc(xPixel, yPixel, circleRadius, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    };

    const data = {
      datasets: [
        {
          label: labels.current,
          data: currentData,
          borderColor: this._primaryColorResolved,
          borderWidth: 1.5,
          backgroundColor: rendererConfig.fillCurrent
            ? this.colorWithOpacity(
                this._primaryColorResolved,
                rendererConfig.fillCurrentOpacity / 100
              )
            : "transparent",
          fill: rendererConfig.fillCurrent ? "origin" : false,
          pointRadius: 0,
          tension: 0.3,
          spanGaps: false
        },
        ...(series.reference
          ? [
              {
                label: labels.reference,
                data: referenceData,
                borderColor: theme.referenceLine,
                borderWidth: 1.5,
                backgroundColor: rendererConfig.fillReference
                  ? this.colorWithOpacity(
                      theme.referenceLine,
                      rendererConfig.fillReferenceOpacity / 100
                    )
                  : "transparent",
                fill: rendererConfig.fillReference ? "origin" : false,
                pointRadius: 0,
                //borderDash: [4, 2],
                tension: 0.3,
                spanGaps: false
              }
            ]
          : []),
        // T020: Forecast dataset
        ...(rendererConfig.showForecast &&
        this._todaySlotIndex >= 0 &&
        this._todayCurrentY !== undefined &&
        rendererConfig.forecastTotal !== undefined
          ? [
              {
                label: "Forecast",
                data: [
                  { x: this._todaySlotIndex, y: this._todayCurrentY },
                  { x: fullTimeline.length - 1, y: rendererConfig.forecastTotal }
                ] as ChartPoint[],
                borderColor: this._primaryColorResolved,
                borderWidth: 1.5,
                borderDash: [3, 6],
                pointRadius: 0,
                fill: false,
                spanGaps: true,
                tension: 0
              }
            ]
          : [
              {
                label: "Forecast",
                data: [] as ChartPoint[]
              }
            ])
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        todayMarker: {} as never,
        legend: {
          display: rendererConfig.showLegend === true
        },
        tooltip: {
          mode: "index" as const,
          intersect: false
        }
      },
      scales: {
        x: {
          type: "linear" as const,
          min: 0,
          max: fullTimeline.length,
          ticks: {
            precision: 0,
            display: true
          },
          grid: {
            display: false,
            color: theme.grid
          },
          // T022: X-axis title showing period label
          title: {
            display: rendererConfig.periodLabel.length > 0,
            text: rendererConfig.periodLabel,
            align: "end" as const
          }
        },
        y: {
          beginAtZero: true,
          // T023: Y-axis grid and ticks configuration
          ticks: {
            count: 5,
            maxTicksLimit: 5,
            callback: (value: number, index: number, ticks: Array<{ value: number }>) => {
              if (
                index === ticks.length - 1 &&
                rendererConfig.unit.length > 0
              ) {
                return `${value} ${rendererConfig.unit}`;
              }
              return String(value);
            }
          },
          grid: {
            color: theme.grid
          }
        }
      }
    };

    if (this.chart) {
      this.chart.data = data as never;
      this.chart.options = options as never;
      this.chart.update();
    } else {
      this.chart = new Chart(ctx, {
        type: "line",
        data: data as never,
        options: options as never,
        plugins: [todayMarkerPlugin]
      });
    }
  }
}

