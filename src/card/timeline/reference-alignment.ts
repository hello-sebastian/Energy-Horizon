import type { TimeSeriesPoint } from "../types";

/**
 * Cumulative reference value at the same aligned time as the last current point
 * (same periodAlignMs logic as {@link computeForecast} / chart).
 */
export function referenceCumulativeAtAlignedCurrentEnd(
  currentPoints: TimeSeriesPoint[],
  refPoints: TimeSeriesPoint[],
  alignOffsetMs?: number
): number | undefined {
  if (currentPoints.length === 0 || refPoints.length === 0) {
    return undefined;
  }
  // Prefer the window-start offset when provided: it is correct even when the current
  // series starts late (leading zero/missing buckets), whereas the first-point offset
  // drifts by the number of leading empty buckets.
  const periodAlignMs =
    typeof alignOffsetMs === "number" && Number.isFinite(alignOffsetMs)
      ? alignOffsetMs
      : currentPoints[0].timestamp - refPoints[0].timestamp;
  const lastTs = currentPoints[currentPoints.length - 1].timestamp;
  let bestIdx = -1;
  for (let i = refPoints.length - 1; i >= 0; i--) {
    const alignedTs = refPoints[i].timestamp + periodAlignMs;
    if (alignedTs <= lastTs) {
      bestIdx = i;
      break;
    }
  }
  if (bestIdx === -1) {
    return undefined;
  }
  return refPoints[bestIdx].value;
}
