import type { WindowAggregation } from "../types";

/**
 * Target ~50 buckets (readability band ~20–100). Only Home Assistant LTS steps:
 * `hour` | `day` | `week` | `month`.
 *
 * Merge / manual `aggregation` skips this — see `buildMergedTimeWindowConfig` and
 * `pickAutoAggregation` call site in `cumulative-comparison-chart` (`_loadData`).
 */
const MS_HOUR = 3600000;
const MS_DAY = 86400000;
const MS_WEEK = 7 * MS_DAY;
/** Mean Gregorian month (~365.25/12 days). */
const MS_MONTH = 30.4375 * MS_DAY;

const COARSE_TO_FINE: readonly WindowAggregation[] = [
  "month",
  "week",
  "day",
  "hour"
];

function slotCount(aggregation: WindowAggregation, durationMs: number): number {
  switch (aggregation) {
    case "hour":
      return Math.max(1, Math.ceil(durationMs / MS_HOUR));
    case "day":
      return Math.max(1, Math.ceil(durationMs / MS_DAY));
    case "week":
      return Math.max(1, Math.ceil(durationMs / MS_WEEK));
    case "month":
      return Math.max(1, Math.ceil(durationMs / MS_MONTH));
    default:
      return Math.max(1, Math.ceil(durationMs / MS_DAY));
  }
}

/**
 * Picks an LTS aggregation from window duration so bucket count is ~20–100 when possible;
 * otherwise chooses the step whose bucket count is closest to 50 (tie → finest: hour).
 */
export function pickAutoAggregation(durationMs: number): WindowAggregation {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "day";
  }

  // LTS minimum bucket is 1h; a window of ≤1h must map to hourly statistics (all coarser
  // slotCounts are 1 and would tie-break wrongly without this guard).
  if (durationMs <= MS_HOUR) {
    return "hour";
  }

  for (const agg of COARSE_TO_FINE) {
    const n = slotCount(agg, durationMs);
    if (n >= 20 && n <= 100) {
      return agg;
    }
  }

  let best: WindowAggregation = "day";
  let bestScore = Infinity;
  let bestRank = COARSE_TO_FINE.length;

  for (let rank = 0; rank < COARSE_TO_FINE.length; rank++) {
    const agg = COARSE_TO_FINE[rank]!;
    const n = slotCount(agg, durationMs);
    const score = Math.abs(n - 50);
    if (
      score < bestScore ||
      (score === bestScore && rank > bestRank)
    ) {
      bestScore = score;
      best = agg;
      bestRank = rank;
    }
  }

  return best;
}
