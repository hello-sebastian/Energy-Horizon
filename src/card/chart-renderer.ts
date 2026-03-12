import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "chartjs-adapter-date-fns";
import type { ComparisonSeries } from "./types";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler
);

export class ChartRenderer {
  private chart?: Chart;
  private lastHash?: string;

  constructor(private readonly canvas: HTMLCanvasElement) {}

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

  update(series: ComparisonSeries): void {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    const currentData = series.current.points.map((p, index) => ({
      x: index + 1,
      y: p.value
    }));

    const referenceData = series.reference
      ? series.reference.points.map((p, index) => ({
          x: index + 1,
          y: p.value
        }))
      : [];

    const hash = JSON.stringify({
      c: currentData,
      r: referenceData
    });

    if (this.lastHash === hash && this.chart) {
      return;
    }
    this.lastHash = hash;

    const theme = this.getThemeColors();

    const data = {
      datasets: [
        {
          label: "Bieżący okres",
          data: currentData,
          borderColor: theme.currentLine,
          backgroundColor: "transparent",
          fill: false,
          pointRadius: 0,
          tension: 0.3
        },
        ...(series.reference
          ? [
              {
                label: "Okres referencyjny",
                data: referenceData,
                borderColor: theme.referenceLine,
                backgroundColor: "transparent",
                pointRadius: 0,
                borderDash: [4, 2],
                tension: 0.3
              }
            ]
          : [])
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          mode: "index" as const,
          intersect: false
        }
      },
      scales: {
        x: {
          type: "linear" as const,
          ticks: {
            precision: 0
          },
          grid: {
            color: theme.grid
          }
        },
        y: {
          beginAtZero: true,
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
        options: options as never
      });
    }
  }
}

