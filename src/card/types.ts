export type ComparisonMode = "year_over_year" | "month_over_year";

export interface CardConfig {
  type: string;
  entity: string;
  title?: string;
  show_title?: boolean;
  icon?: string;
  show_icon?: boolean;
  comparison_mode: ComparisonMode;
  aggregation?: "day" | "week" | "month";
  period_offset?: number;
  show_forecast?: boolean;
  precision?: number;
  debug?: boolean;
  language?: string;
  number_format?: "comma" | "decimal" | "language" | "system";
  fill_current?: boolean;
  fill_reference?: boolean;
  fill_current_opacity?: number;
  fill_reference_opacity?: number;
  primary_color?: string;
  /**
   * If true, missing (null) slots are "visually connected" using an interpolated dashed
   * overlay series. If false, the chart keeps actual gaps for null slots.
   */
  connect_nulls?: boolean;
  /** When omitted or false, the chart legend is hidden. Set to true to show it. */
  show_legend?: boolean;
}

export interface ComparisonPeriod {
  current_start: Date;
  current_end: Date;
  reference_start: Date;
  reference_end: Date;
  aggregation: "day" | "week" | "month";
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
  aggregation: "day" | "week" | "month";
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
  reference_total?: number;
  confidence: "low" | "medium" | "high";
  /** True when rawTrend is strictly below 0.3 or strictly above 3.3 (anomalous reference year). */
  anomalousReference?: boolean;
  unit: string;
}

export interface CardState {
  status: "loading" | "error" | "no-data" | "ready";
  errorMessage?: string;
  comparisonSeries?: ComparisonSeries;
  summary?: SummaryStats;
  forecast?: ForecastStats;
  textSummary?: TextSummary;
  period?: ComparisonPeriod;
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
  forecastTotal?: number;
  unit: string;
  periodLabel: string;
  /** Timestamp of reference period start (for aligning reference series on timeline). */
  referencePeriodStart?: number;
}

