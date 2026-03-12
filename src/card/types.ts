export type ComparisonMode = "year_over_year" | "month_over_year";

export interface CardConfig {
  type: string;
  entity: string;
  title?: string;
  comparison_mode: ComparisonMode;
  aggregation?: "day" | "week" | "month";
  period_offset?: number;
  show_forecast?: boolean;
  precision?: number;
  debug?: boolean;
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
  heading: string;
  trend: Trend;
}

export interface ForecastStats {
  enabled: boolean;
  forecast_total?: number;
  reference_total?: number;
  confidence: "low" | "medium" | "high";
  unit: string;
}

export interface CardState {
  status: "loading" | "error" | "no-data" | "ready";
  errorMessage?: string;
  comparisonSeries?: ComparisonSeries;
  summary?: SummaryStats;
  forecast?: ForecastStats;
  textSummary?: TextSummary;
}

