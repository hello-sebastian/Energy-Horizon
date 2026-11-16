import { findTimelineSlotContainingInstant } from "../axis/now-marker-slot";
import type { WindowAggregation } from "../types";
import { buildTimelineSlots } from "./timeline-slots";

/**
 * FR-G: if “now” falls in a day/week/month bucket on the chart timeline and the aligned
 * current series has no LTS point there, repeat the last known cumulative value in-window.
 */
export function carryForwardCurrentCumulativeAtNow(
  alignedValues: (number | null)[],
  timeline: number[],
  nowMs: number,
  alignStartMs: number,
  windowStartMs: number,
  windowEndMs: number,
  aggregation: WindowAggregation,
  timeZone: string
): void {
  if (aggregation === "hour") {
    return;
  }
  if (timeline.length === 0 || alignedValues.length !== timeline.length) {
    return;
  }
  const prefix = buildTimelineSlots(
    new Date(windowStartMs),
    new Date(windowEndMs),
    aggregation,
    timeZone
  );
  const idx = findTimelineSlotContainingInstant(prefix, nowMs);
  if (idx < 0 || idx >= alignedValues.length) {
    return;
  }
  const t0 = timeline[0];
  const alignedSlotStart = alignStartMs + (timeline[idx] - t0);
  if (alignedSlotStart < windowStartMs || alignedSlotStart > windowEndMs) {
    return;
  }
  if (alignedValues[idx] != null) {
    return;
  }
  let last: number | null = null;
  for (let i = idx - 1; i >= 0; i--) {
    const v = alignedValues[i];
    if (v != null) {
      last = v;
      break;
    }
  }
  if (last == null) {
    return;
  }
  alignedValues[idx] = last;
}

/**
 * “Now” on the shared comparison axis: bucket within **window 0** that contains `nowMs`, mapped to
 * `fullTimeline` index (006 FR-B / FR-G). Does not use the reference/longest calendar on the axis.
 */
export function findNowSlotIndexOnComparisonAxis(
  fullTimeline: number[],
  windowStartMs: number,
  windowEndMs: number,
  aggregation: WindowAggregation,
  timeZone: string,
  nowMs: number
): number {
  const prefix = buildTimelineSlots(
    new Date(windowStartMs),
    new Date(windowEndMs),
    aggregation,
    timeZone
  );
  if (prefix.length === 0 || fullTimeline.length === 0) {
    return -1;
  }
  const idx = findTimelineSlotContainingInstant(prefix, nowMs);
  if (idx < 0) {
    return -1;
  }
  return Math.min(idx, fullTimeline.length - 1);
}
