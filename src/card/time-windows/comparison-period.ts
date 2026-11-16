import type {
  ComparisonPeriod,
  ResolvedWindow,
  WindowAggregation
} from "../types";

/**
 * `ComparisonPeriod` derived from resolved windows (window 0 = current, window 1 = reference) —
 * the only bridge from the multi-window model (FR-900-A) to the `ComparisonPeriod` shape
 * consumed by the compute/summary cluster (911/TD-7).
 */
export function comparisonPeriodFromResolvedWindows(
  windows: ResolvedWindow[],
  timeZone: string,
  aggregation: WindowAggregation
): ComparisonPeriod {
  const w0 = windows[0];
  const w1 = windows[1];
  return {
    current_start: w0.start,
    current_end: w0.end,
    reference_start: w1?.start ?? w0.start,
    reference_end: w1?.end ?? w0.end,
    aggregation,
    time_zone: timeZone
  };
}
