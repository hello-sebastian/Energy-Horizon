/**
 * Chart renderer-config construction (911/TD-14, 903 FR-903-AB).
 *
 * The element's `_buildRendererConfig` / `_resolveChartTheme` absorbed 1:1 as
 * module functions over a host. The host supplies only the element concerns —
 * the missing-translation-key → error escalation (FR-903-NE), the
 * interpretation semantics of the ready state, the merged window duration, and
 * the host DOM node for the CSS theme tokens; everything else (locale
 * resolution, the axis-format gates, the ready-state read) is local and
 * testable without an element.
 */

import type { HomeAssistant } from "../ha-types";
import type {
  CardConfig,
  CardState,
  ChartRendererConfig,
  ChartThemeResolved
} from "./types";
import { numberFormatToLocale, resolveLocale } from "./localize";
import { resolveLabelLocale } from "./axis";
import { resolveSeriesCurrentColor } from "./series-color";
import { hour12FromHaTimeFormat } from "./labels/compact-period-caption";
import { resolveComparisonAxisLabelHints } from "./labels/comparison-label-hints";
import { formatPeriodLabel } from "./labels/period-label";
import type { InterpretationSemanticsResult } from "./interpretation-semantics";

/**
 * The element surface {@link buildRendererConfig} reads. The host is the
 * element itself: `localizeOrError` keeps the missing-key → error escalation
 * an element concern (FR-903-NE), and `interpretationSemantics` /
 * `mergedDurationMs` read the live card state.
 */
export interface RendererConfigHost {
  readonly hass: HomeAssistant | undefined;
  readonly cardConfig: CardConfig;
  readonly state: CardState;
  /** The host DOM node (`:host`) for the CSS theme-token reads. */
  readonly hostNode: HTMLElement;
  localizeOrError(key: string, vars?: Record<string, string | number>): string;
  interpretationSemantics(): InterpretationSemanticsResult;
  mergedDurationMs(): number;
}

/** Chart forecast line: on unless explicitly `show_forecast: false` (alias `forecast` merged in setConfig). */
export function isForecastLineVisible(config: CardConfig): boolean {
  return config.show_forecast !== false;
}

/**
 * Clamps a YAML opacity (0–100) to the valid range, falling back to `40` for
 * absent/non-numeric/out-of-range values (the previous inline behavior).
 */
export function clampOpacity(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    return 40;
  }
  return n;
}

/**
 * Theme tokens for ECharts — read from `:host` CSS variables (US-7 / T020).
 * When `getComputedStyle` is absent (plain-node tests) every token takes its
 * documented fallback.
 */
export function resolveChartTheme(
  node: HTMLElement,
  primaryColor?: string
): ChartThemeResolved {
  const readVar = (prop: string): string =>
    typeof globalThis.getComputedStyle === "function"
      ? globalThis.getComputedStyle(node).getPropertyValue(prop).trim()
      : "";
  const seriesCurrent = resolveSeriesCurrentColor(node, primaryColor);
  const seriesReference =
    readVar("--secondary-text-color") || "rgba(127, 127, 127, 0.4)";
  const grid = readVar("--divider-color") || "rgba(127, 127, 127, 0.3)";
  const primaryText = readVar("--primary-text-color") || "rgba(0, 0, 0, 0.87)";
  const secondaryText = readVar("--secondary-text-color") || primaryText;
  const tooltipBackground =
    readVar("--ha-card-background") ||
    readVar("--card-background-color") ||
    "#ffffff";
  const trendHigher = readVar("--error-color") || "#f44336";
  const trendLower = readVar("--success-color") || "#4caf50";
  const trendSimilar =
    readVar("--secondary-text-color") || "rgba(127, 127, 127, 0.55)";
  const trendUnknown = readVar("--disabled-text-color") || trendSimilar;
  const trendMuted = readVar("--disabled-text-color") || trendSimilar;
  const todayFullHeightLine = grid || "rgba(127, 127, 127, 0.35)";
  const referenceDotBorder = tooltipBackground || "#ffffff";
  // FR-018 tone scale: the shifted current takes the theme's strongest text
  // tone (dominant preview line; bright in dark, dark in light), the shifted
  // reference keeps the disabled-text tone (its fixed lineStyle.opacity
  // de-emphasis lives in the renderer).
  const previewCurrent = primaryText;
  const previewReference =
    readVar("--disabled-text-color") || "rgba(127, 127, 127, 0.55)";

  return {
    seriesCurrent,
    seriesReference,
    referenceDotBorder,
    grid,
    primaryText,
    secondaryText,
    tooltipBackground,
    tooltipBorder: grid,
    todayFullHeightLine,
    trendHigher,
    trendLower,
    trendSimilar,
    trendUnknown,
    trendMuted,
    previewCurrent,
    previewReference
  };
}

/**
 * Builds the ECharts renderer config for the current card state (911/TD-14):
 * a verbatim move of the element's `_buildRendererConfig`, reading only the
 * host surface. Ready guard (911/TD-11): a ready state always carries
 * `period` and `comparisonSeries`, so the placeholder config is reachable only
 * from a non-ready state (non-ready states never carry a forecast).
 */
export function buildRendererConfig(
  host: RendererConfigHost,
  fullTimeline: number[] = []
): ChartRendererConfig {
  const config = host.cardConfig;
  const resolved = resolveLocale(host.hass ?? null, config);
  const language = resolved.language;
  const numberLocale = numberFormatToLocale(resolved.numberFormat, resolved.language);
  const forecastLabel = host.localizeOrError("forecast.current_forecast");
  const xAxisLabelLocale = resolveLabelLocale(host.hass, config);
  const hour12 = hour12FromHaTimeFormat(host.hass?.locale?.time_format);
  const xf = config.x_axis_format?.trim();
  const xAxisMode = xf ? ("forced" as const) : ("adaptive" as const);
  const mergedDurationMs = host.mergedDurationMs();
  const tf = config.tooltip_format?.trim();

  const state = host.state;

  if (state.status !== "ready") {
    return {
      primaryColor: config.primary_color ?? "",
      fillCurrent: config.fill_current ?? true,
      fillReference: config.fill_reference ?? false,
      fillCurrentOpacity: clampOpacity(config.fill_current_opacity),
      fillReferenceOpacity: clampOpacity(config.fill_reference_opacity),
      fillCurrentGradient: config.fill_current_gradient ?? true,
      fillReferenceGradient: config.fill_reference_gradient ?? true,
      connectNulls: config.connect_nulls ?? true,
      showLegend: config.show_legend === true,
      showForecast: isForecastLineVisible(config),
      showReferenceComparison: false,
      forecastTotal: undefined,
      unit: "",
      periodLabel: "",
      comparisonMode: config.comparison_preset,
      language,
      numberLocale,
      precision: config.precision ?? 2,
      forecastLabel,
      singleWindowMode: true,
      xAxisMode,
      xAxisFormatPattern: xAxisMode === "forced" ? xf : undefined,
      xAxisLabelLocale,
      hour12,
      haTimeZone: resolved.timeZone,
      primaryAggregation: "day",
      fullTimeline,
      mergedDurationMs,
      tooltipFormatPattern: tf || undefined,
      chartTheme: resolveChartTheme(host.hostNode, config.primary_color),
      chartTrend: "unknown",
      chartSemanticOutcome: "insufficient_data"
    };
  }

  const period = state.period;
  const series = state.comparisonSeries;
  const windows = state.resolvedWindows;
  const singleWindow = windows.length < 2;
  const interpretationSemantics = host.interpretationSemantics();
  const ct = state.chartTime;
  const w0 = windows?.[0];
  const cs = w0?.start ?? period.current_start;
  // 911/TD-10: single period-label implementation (FR-010).
  const periodLabel = formatPeriodLabel(cs, language, resolved.timeZone);

  const displayUnit = series.current.unit;
  const precision = config.precision ?? 2;

  const [windowsFirst, windowsSecond] = windows ?? [];
  const axisHints =
    !singleWindow && windowsFirst && windowsSecond
      ? resolveComparisonAxisLabelHints(
          windowsFirst,
          windowsSecond,
          resolved.timeZone
        )
      : { omitYearOnAxis: false, dayOfMonthOnlyOnAxis: false };

  return {
    primaryColor: config.primary_color ?? "",
    fillCurrent: config.fill_current ?? true,
    fillReference: config.fill_reference ?? false,
    fillCurrentOpacity: clampOpacity(config.fill_current_opacity),
    fillReferenceOpacity: clampOpacity(config.fill_reference_opacity),
    fillCurrentGradient: config.fill_current_gradient ?? true,
    fillReferenceGradient: config.fill_reference_gradient ?? true,
    connectNulls: config.connect_nulls ?? true,
    showLegend: config.show_legend === true,
    showForecast: isForecastLineVisible(config) && !singleWindow,
    showReferenceComparison: !singleWindow && series.reference != null,
    forecastTotal: state.forecast.forecast_total,
    panelReferenceCumulative: state.summary.reference_cumulative,
    unit: displayUnit,
    periodLabel,
    referencePeriodStart: period.reference_start.getTime(),
    windowAlignStartsMs: windows?.map((w) => w.start.getTime()),
    tailLabelFromIndex: ct?.tailLabelFromIndex,
    currentWindowStartMs: w0?.start?.getTime(),
    currentWindowEndMs: w0?.end?.getTime(),
    comparisonMode: config.comparison_preset,
    language,
    numberLocale,
    precision,
    forecastLabel,
    singleWindowMode: singleWindow,
    xAxisMode,
    xAxisFormatPattern: xAxisMode === "forced" ? xf : undefined,
    xAxisLabelLocale,
    hour12,
    haTimeZone: resolved.timeZone,
    primaryAggregation: period.aggregation,
    fullTimeline,
    mergedDurationMs,
    tooltipFormatPattern: tf || undefined,
    chartTheme: resolveChartTheme(host.hostNode, config.primary_color),
    chartTrend: state.textSummary.trend,
    chartSemanticOutcome: singleWindow
      ? "neutral"
      : interpretationSemantics.outcome,
    comparisonAxisOmitYear: axisHints.omitYearOnAxis,
    comparisonAxisDayOfMonthOnly: axisHints.dayOfMonthOnlyOnAxis
  };
}
