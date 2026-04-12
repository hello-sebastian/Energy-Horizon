/**
 * Index of the timeline slot whose interval contains `nowMs`.
 * Slots are half-open: [timeline[i], timeline[i+1]) for i < n-1, and [timeline[n-1], +∞) for the last.
 */
export function findTimelineSlotContainingInstant(
  timeline: number[],
  nowMs: number
): number {
  if (timeline.length === 0) {
    return -1;
  }
  const t0 = timeline[0]!;
  if (nowMs < t0) {
    return -1;
  }
  for (let i = 0; i < timeline.length; i++) {
    const start = timeline[i]!;
    const end = i + 1 < timeline.length ? timeline[i + 1]! : Number.POSITIVE_INFINITY;
    if (nowMs >= start && nowMs < end) {
      return i;
    }
  }
  return -1;
}
