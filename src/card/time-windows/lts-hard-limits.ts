import type { MergedTimeWindowConfig } from "../types";
import { durationToMillis, parseDurationToken } from "./duration-parse";

/** Home Assistant LTS minimum bucket / window granularity (1 hour). */
const MIN_DURATION_MS = 60 * 60 * 1000;

const LTS_ALLOWED_ANCHORS = new Set([
  "start_of_year",
  "start_of_month",
  "start_of_hour",
  "now"
]);

const LTS_ALLOWED_AGGREGATION = new Set(["hour", "day", "week", "month"]);

/**
 * Enforces LTS (long-term statistics) hard limits: hourly minimum resolution, allowed anchors,
 * and strict aggregation enum. Intended for `setConfig` so invalid YAML surfaces as a thrown
 * Error (standard Lovelace card error overlay).
 */
export function assertLtsHardLimits(merged: MergedTimeWindowConfig): void {
  const anchorRaw = merged.anchor?.trim();
  if (anchorRaw && !LTS_ALLOWED_ANCHORS.has(anchorRaw)) {
    throw new Error(
      `Energy Horizon: invalid time anchor for LTS (long-term statistics). Allowed: start_of_year, start_of_month, start_of_hour, now. Got: "${anchorRaw}".`
    );
  }

  const durStr = merged.duration?.trim();
  if (durStr) {
    const dur = parseDurationToken(durStr);
    if (dur && durationToMillis(dur) < MIN_DURATION_MS) {
      throw new Error(
        "Energy Horizon: duration must be at least 1 hour for LTS (long-term statistics). Sub-hour windows are not supported."
      );
    }
  }

  const agg = merged.aggregation;
  if (agg != null) {
    const s = String(agg).trim();
    if (s === "") {
      throw new Error(
        "Energy Horizon: aggregation must be one of hour, day, week, or month for LTS (long-term statistics)."
      );
    }
    if (!LTS_ALLOWED_AGGREGATION.has(s)) {
      throw new Error(
        `Energy Horizon: aggregation must be one of hour, day, week, or month for LTS (long-term statistics). Got: "${s}".`
      );
    }
  }
}
