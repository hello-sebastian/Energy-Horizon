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
  if (t0 === undefined) {
    return 0;
  }
  const endMs = windowEnd.getTime();
  for (let j = 0; j < timeline.length; j++) {
    const slot = timeline[j];
    if (slot === undefined) continue; // dead path: j < timeline.length (911/TD-6)
    const alignedSlotStart = alignStartMs + (slot - t0);
    if (alignedSlotStart <= endMs) {
      continue;
    }
    return j;
  }
  return timeline.length;
}
