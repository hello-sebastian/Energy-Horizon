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
  const firstCurrent = currentPoints[0];
  const firstRef = refPoints[0];
  if (!firstCurrent || !firstRef) return undefined; // dead path: non-emptiness checked above (911/TD-6)
  const periodAlignMs =
    typeof alignOffsetMs === "number" && Number.isFinite(alignOffsetMs)
      ? alignOffsetMs
      : firstCurrent.timestamp - firstRef.timestamp;
  const lastCurrent = currentPoints[currentPoints.length - 1];
  const lastTs = lastCurrent ? lastCurrent.timestamp : undefined;
  if (lastTs === undefined) return undefined; // dead path: same array as firstCurrent (911/TD-6)
  let bestIdx = -1;
  for (let i = refPoints.length - 1; i >= 0; i--) {
    const refPoint = refPoints[i];
    if (refPoint === undefined) break; // dead path: i < refPoints.length (911/TD-6)
    const alignedTs = refPoint.timestamp + periodAlignMs;
    if (alignedTs <= lastTs) {
      bestIdx = i;
      break;
    }
  }
  if (bestIdx === -1) {
    return undefined;
  }
  const best = refPoints[bestIdx];
  return best ? best.value : undefined;
}
