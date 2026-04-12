import type { ForcePrefix } from '../utils/unit-scaler';

export { MAX_POINTS_PER_SERIES } from "./axis/point-cap";

export type ComparisonMode =
  | "year_over_year"
  | "month_over_year"
  | "month_over_month";

export type TimeAnchor =
  | "start_of_year"
  | "start_of_month"
  | "start_of_week"
  | "start_of_day"
  | "start_of_hour"
  | "now";

export type WindowAggregation = "day" | "week" | "month" | "hour";

export type WindowRole = "current" | "reference" | "context";

export interface TimeWindowYaml {
  anchor?: TimeAnchor;
  offset?: string;
  duration?: string;
  step?: string;
  count?: number;
  aggregation?: WindowAggregation;
}

/** Merged preset + YAML before validation / resolution. */
export interface MergedTimeWindowConfig {
  anchor?: TimeAnchor;
  offset?: string;
  duration?: string;
  step?: string;
  count?: number;
  aggregation?: WindowAggregation;
  currentEndIsNow?: boolean;
  referenceFullPeriod?: boolean;
  periodOffsetYears?: number;
  comparisonMode?: ComparisonMode;
}

export interface ResolvedWindow {
  index: number;
  id: string;
  role: WindowRole;
  start: Date;
  end: Date;
  aggregation: WindowAggregation;
}

export interface CardConfig {
  type: string;
  entity: string;
  title?: string;
  show_title?: boolean;
  icon?: string;
  show_icon?: boolean;
  /** YAML key `comparison_preset`; set by card if omitted (defaults to `year_over_year`). */
  comparison_preset: ComparisonMode;
  aggregation?: WindowAggregation;
  period_offset?: number;
  time_window?: TimeWindowYaml;
  show_forecast?: boolean;
  /** Alias for `show_forecast` (same meaning). Prefer `show_forecast` in docs. */
  forecast?: boolean;
  precision?: number;
  debug?: boolean;
  language?: string;
  number_format?: "comma" | "decimal" | "language" | "system";
  fill_current?: boolean;
  fill_reference?: boolean;
  fill_current_opacity?: number;
  fill_reference_opacity?: number;
  /**
   * Current-series paint color (line, fill, swatch). Hex/rgb/names; `var(--accent-color)` etc.
   * (resolved on the card host); aliases `ha-accent`, `ha-primary-accent`, `ha-primary`.
   * When omitted: CSS `--eh-series-current` (default `#119894`, Figma brand) on `:host`.
   */
  primary_color?: string;
  /**
   * If true, missing (null) slots are "visually connected" using an interpolated dashed
   * overlay series. If false, the chart keeps actual gaps for null slots.
   */
  connect_nulls?: boolean;
  /** When omitted or false, the chart legend is hidden. Set to true to show it. */
  show_legend?: boolean;
  /**
   * Optional Luxon format string for X-axis tick labels (Home Assistant time zone).
   * When set, adaptive boundary labels are disabled.
   */
  x_axis_format?: string;
  /**
   * Optional Luxon format for the chart tooltip header (overrides aggregation-based matrix).
   */
  tooltip_format?: string;
  /**
   * SI unit scaling: `auto` (default when omitted), `none`, or a forced prefix (`k`, `M`, …).
   */
  force_prefix?: ForcePrefix;
}

/**
 * Raw Lovelace config before normalization in the card's `setConfig`.
 * Prefer `comparison_preset`; deprecated `comparison_mode` is still accepted.
 */
export type CardConfigInput = Omit<CardConfig, "comparison_preset"> & {
  comparison_preset?: ComparisonMode;
  /** @deprecated Use `comparison_preset`. */
  comparison_mode?: ComparisonMode;
};

/** Resolves YAML `comparison_preset` vs legacy `comparison_mode` (non-empty wins; else `year_over_year`). */
export function resolveComparisonPreset(
  raw: Pick<CardConfigInput, "comparison_preset" | "comparison_mode">
): ComparisonMode {
  const presetNew =
    raw.comparison_preset != null &&
    String(raw.comparison_preset).trim() !== ""
      ? raw.comparison_preset
      : undefined;
  const presetLegacy =
    raw.comparison_mode != null && String(raw.comparison_mode).trim() !== ""
      ? raw.comparison_mode
      : undefined;
  return presetNew ?? presetLegacy ?? "year_over_year";
}

export interface ComparisonPeriod {
  current_start: Date;
  current_end: Date;
  reference_start: Date;
  reference_end: Date;
  aggregation: WindowAggregation;
  time_zone: string;
}

export interface LtsStatisticsQuery {
  type: "recorder/statistics_during_period";
  start_time: string;
  end_time: string;
  statistic_ids: string[];
  period?: "5minute" | "hour" | "day" | "week" | "month";
  units?: string;
}

export interface LtsStatisticPoint {
  start: string;
  mean?: number;
  sum?: number;
  state?: number;
  change?: number;
  unit_of_measurement?: string;
}

export interface LtsStatisticsResponse {
  results: Record<string, LtsStatisticPoint[]>;
}

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  rawValue?: number;
  label?: string;
}

export interface CumulativeSeries {
  points: TimeSeriesPoint[];
  unit: string;
  periodLabel: string;
  total: number;
}

export interface ComparisonSeries {
  current: CumulativeSeries;
  reference?: CumulativeSeries;
  /** Windows with index ≥ 2 — visual only (FR-008). */
  context?: CumulativeSeries[];
  aggregation: WindowAggregation;
  time_zone: string;
}

export interface SummaryStats {
  current_cumulative: number;
  reference_cumulative?: number;
  difference?: number;
  differencePercent?: number;
  unit: string;
}

export type Trend = "higher" | "lower" | "similar" | "unknown";

export interface TextSummary {
  trend: Trend;
  diffValue?: number;
  unit: string;
}

export interface ForecastStats {
  enabled: boolean;
  forecast_total?: number;
  /**
   * Total energy (or entity quantity) over the **entire** reference LTS window — sum of
   * per-bucket `rawValue` increments (Figma **Total** / §1.3). Not the aligned
   * “to today” value from the first comparison panel.
   */
  reference_total?: number;
  confidence: "low" | "medium" | "high";
  /** True when rawTrend is strictly below 0.3 or strictly above 3.3 (anomalous reference year). */
  anomalousReference?: boolean;
  unit: string;
}

export interface CardState {
  status: "loading" | "error" | "no-data" | "ready";
  errorMessage?: string;
  /** Variables for `errorMessage` translation (e.g. `max` for too-many-windows). */
  errorParams?: Record<string, string | number>;
  comparisonSeries?: ComparisonSeries;
  summary?: SummaryStats;
  forecast?: ForecastStats;
  textSummary?: TextSummary;
  period?: ComparisonPeriod;
  resolvedWindows?: ResolvedWindow[];
  mergedTimeWindow?: MergedTimeWindowConfig;
}

/** Theme colors read from the card host via `getComputedStyle` (US-7 / T020). */
export interface ChartThemeResolved {
  seriesCurrent: string;
  seriesReference: string;
  referenceDotBorder: string;
  grid: string;
  primaryText: string;
  /** Secondary axis / caption text (e.g. X-axis edge ticks per Figma). */
  secondaryText: string;
  tooltipBackground: string;
  tooltipBorder: string;
  /** Full-height “today” guide line (subtle; not the delta segment). */
  todayFullHeightLine: string;
  trendHigher: string;
  trendLower: string;
  trendSimilar: string;
  trendUnknown: string;
}

export interface ChartRendererConfig {
  primaryColor: string;
  fillCurrent: boolean;
  fillReference: boolean;
  fillCurrentOpacity: number;
  fillReferenceOpacity: number;
  /**
   * Controls whether we generate the dashed interpolation overlay across null gaps.
   * (Solid series always keeps null gaps as gaps.)
   */
  connectNulls: boolean;
  /** When false, the chart legend is not displayed (default YAML behavior). */
  showLegend: boolean;
  comparisonMode: ComparisonMode;
  language: string;
  numberLocale: string;
  precision: number;
  forecastLabel: string;
  showForecast: boolean;
  /**
   * When `false`, hides the reference comparison line. When omitted or `true`, the line is shown
   * if reference values exist (non-null slots).
   */
  showReferenceComparison?: boolean;
  forecastTotal?: number;
  unit: string;
  periodLabel: string;
  /** Timestamp of reference period start (for aligning reference series on timeline). */
  referencePeriodStart?: number;
  /**
   * Start timestamps for each plotted window (current, reference, …context), used to align
   * series on the shared timeline (same order as `ComparisonSeries` layers).
   */
  windowAlignStartsMs?: number[];
  /** True when only one logical window — hides reference-only UI (FR-015). */
  singleWindowMode?: boolean;
  /** X-axis tick label strategy. */
  xAxisMode?: "adaptive" | "forced";
  /** Luxon pattern when `xAxisMode === 'forced'`. */
  xAxisFormatPattern?: string;
  /** BCP-47 locale for axis `Intl` / Luxon. */
  xAxisLabelLocale?: string;
  /** Home Assistant `time_zone` (IANA) for tick timestamps. */
  haTimeZone?: string;
  /** Aggregation driving adaptive label density. */
  primaryAggregation?: WindowAggregation;
  /** Shared chart timeline (ms); tick index maps to this array. */
  fullTimeline?: number[];
  /** Merged `duration` in ms; used for tooltip hour + multi-day disambiguation. */
  mergedDurationMs?: number;
  /** Luxon pattern from `tooltip_format` when set. */
  tooltipFormatPattern?: string;
  /** When set, chart uses these instead of calling `getComputedStyle` on the container. */
  chartTheme?: ChartThemeResolved;
  /** Consumption trend vs reference — drives delta-at-today segment color (US-6). */
  chartTrend?: Trend;
}

