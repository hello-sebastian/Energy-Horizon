import { DateTime, type DateTime as LuxonDateTime } from "luxon";
import type {
  MergedTimeWindowConfig,
  ResolvedWindow,
  WindowAggregation
} from "../types";
import { parseDurationToken } from "./duration-parse";
import { resolveTimeWindows } from "./resolve-windows";

/** A preview control action (909). */
export type PreviewShiftAction = "back" | "forward" | "reset";

/**
 * Pure preview state transition (909): given the current `previewShift` and a control
 * action, return the next shift.
 *
 * - **back**: `previewShift -= 1` — always allowed, no lower bound (FR-004).
 * - **forward**: `previewShift += 1`, clamped at `0` — a no-op at the default (FR-003).
 * - **reset**: `previewShift = 0` (FR-009).
 *
 * The result is always an integer `≤ 0` (data-model validation rule 1).
 */
export function nextPreviewShift(
  previewShift: number,
  action: PreviewShiftAction
): number {
  switch (action) {
    case "back":
      return previewShift - 1;
    case "forward":
      return Math.min(0, previewShift + 1);
    case "reset":
      return 0;
  }
}

/**
 * Transient time-window preview (909): compute the shifted window set for a preview shift.
 *
 * Pure function — no side effects. Given the merged window config, `now`, the time zone, and a
 * `previewShift` (signed integer, `0` = default, negative = earlier periods), it moves `now`
 * backward by `|previewShift|` nominal window widths — the window's `duration`, **not** `step` —
 * via the same `DateTime.minus(Duration)` algebra the resolver already uses (`minusStepRepeated`),
 * then re-runs the existing pure resolver `resolveTimeWindows` unmodified (research R1).
 *
 * Calendar-awareness for year/month/week and exactness for day/hour/minute/second come for free
 * from Luxon's `DateTime.minus(Duration)` (research R9). The shift is clamped to `≤ 0` so the
 * forward direction is bounded at the configured default (FR-003).
 */
export function resolvePreviewShiftedWindows(
  merged: MergedTimeWindowConfig,
  now: Date | LuxonDateTime,
  timeZone: string,
  previewShift: number,
  maxWindows = 24,
  aggregationFallback: WindowAggregation = "day"
): ResolvedWindow[] {
  const shift = Math.min(0, Math.trunc(previewShift));
  if (shift === 0) {
    return resolveTimeWindows(merged, now, timeZone, maxWindows, aggregationFallback);
  }

  const base =
    now instanceof Date
      ? DateTime.fromJSDate(now, { zone: timeZone })
      : now.setZone(timeZone);

  const width = parseDurationToken(merged.duration ?? "1y");
  let shiftedNow = base;
  if (width) {
    for (let k = 0; k < -shift; k++) {
      shiftedNow = shiftedNow.minus(width);
    }
  }

  return resolveTimeWindows(
    merged,
    shiftedNow,
    timeZone,
    maxWindows,
    aggregationFallback
  );
}
