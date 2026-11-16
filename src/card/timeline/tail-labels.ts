/**
 * First timeline index whose aligned slot start (for series 0) is strictly after `windowEnd`.
 * Used for FR-B tail labeling when another window extends the axis past the current window.
 */
export function firstTailAxisLabelIndex(
  timeline: number[],
  alignStartMs: number,
  windowEnd: Date
): number {
  if (timeline.length === 0) {
    return 0;
  }
  const t0 = timeline[0];
  const endMs = windowEnd.getTime();
  for (let j = 0; j < timeline.length; j++) {
    const alignedSlotStart = alignStartMs + (timeline[j] - t0);
    if (alignedSlotStart <= endMs) {
      continue;
    }
    return j;
  }
  return timeline.length;
}
