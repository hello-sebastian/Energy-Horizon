import type { ComparisonMode, MergedTimeWindowConfig } from "../types";

/**
 * Internal preset templates for `comparison_preset` (YAML; legacy `comparison_mode`) merged with optional YAML.
 */
export function getPresetTemplate(
  mode: ComparisonMode,
  periodOffsetYears: number | undefined
): MergedTimeWindowConfig {
  const off = periodOffsetYears ?? -1;
  if (mode === "year_over_year") {
    return {
      anchor: "start_of_year",
      duration: "1y",
      step: "1y",
      count: 2,
      currentEndIsNow: true,
      referenceFullPeriod: true,
      periodOffsetYears: off,
      comparisonMode: mode
    };
  }
  if (mode === "month_over_month") {
    return {
      anchor: "start_of_month",
      duration: "1M",
      step: "1M",
      count: 2,
      comparisonMode: mode
    };
  }
  return {
    anchor: "start_of_month",
    duration: "1M",
    step: "1y",
    count: 2,
    currentEndIsNow: true,
    referenceFullPeriod: true,
    periodOffsetYears: off,
    comparisonMode: mode
  };
}
