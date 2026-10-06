import type { ChartThemeResolved, SemanticOutcome, Trend } from "./types";

/**
 * MDI icon id for Home Assistant `ha-icon` / `ha-state-icon`.
 * Maps semantic consumption trend to Figma "Comment icon" variants (§3).
 */
export function trendMdiIcon(trend: Trend): string {
  switch (trend) {
    case "higher":
      return "mdi:trending-up";
    case "lower":
      return "mdi:trending-down";
    case "similar":
      return "mdi:minus";
    case "unknown":
    default:
      return "mdi:help-circle-outline";
  }
}

/**
 * BEM modifier on containers that pick up `.ebc-trend--*` color rules in card CSS.
 */
/** Resolved RGB/CSS color for the vertical delta segment at “today” (US-6). */
export function trendResolvedLineColor(
  theme: ChartThemeResolved,
  trend: Trend | undefined
): string {
  switch (trend) {
    case "higher":
      return theme.trendHigher;
    case "lower":
      return theme.trendLower;
    case "similar":
      return theme.trendSimilar;
    case "unknown":
    default:
      return theme.trendUnknown;
  }
}

export function trendToneClass(trend: Trend): string {
  switch (trend) {
    case "higher":
      return "ebc-trend--negative";
    case "lower":
      return "ebc-trend--positive";
    case "similar":
      return "ebc-trend--neutral";
    case "unknown":
    default:
      return "ebc-trend--unknown";
  }
}

export function semanticToneClass(outcome: SemanticOutcome): string {
  switch (outcome) {
    case "positive":
      return "ebc-trend--positive";
    case "negative":
      return "ebc-trend--negative";
    case "neutral":
      return "ebc-trend--neutral";
    case "insufficient_data":
      return "ebc-trend--insufficient";
    default:
      return "ebc-trend--unknown";
  }
}

export function semanticMdiIcon(
  outcome: SemanticOutcome,
  difference: number | null | undefined
): string {
  if (outcome === "insufficient_data") {
    return "mdi:help-circle-outline";
  }
  if (outcome === "neutral") {
    return "mdi:minus";
  }
  if (difference != null && Number.isFinite(difference)) {
    if (difference > 0.01) {
      return "mdi:trending-up";
    }
    if (difference < -0.01) {
      return "mdi:trending-down";
    }
  }
  return "mdi:minus";
}

export function semanticResolvedLineColor(
  theme: ChartThemeResolved,
  outcome: SemanticOutcome
): string {
  switch (outcome) {
    case "positive":
      return theme.trendLower;
    case "negative":
      return theme.trendHigher;
    case "neutral":
      return theme.trendSimilar;
    case "insufficient_data":
      return theme.trendMuted;
    default:
      return theme.trendUnknown;
  }
}
