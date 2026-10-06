import { durationToMillis, parseDurationToken } from "./duration-parse";
import { parseTimeWindowOffset } from "./parse-time-window-offset";
import type { MergedTimeWindowConfig } from "../types";

export type ValidateMergedResult =
  | { ok: true; merged: MergedTimeWindowConfig }
  | {
      ok: false;
      errorKey: string;
      errorParams?: Record<string, string | number>;
    };

const MAX_WINDOWS_DEFAULT = 24;

export function validateMergedTimeWindowConfig(
  merged: MergedTimeWindowConfig,
  options?: { maxWindows?: number }
): ValidateMergedResult {
  const maxWindows = options?.maxWindows ?? MAX_WINDOWS_DEFAULT;

  const count = merged.count;
  if (count == null || !Number.isInteger(count) || count < 1) {
    return { ok: false, errorKey: "status.config_invalid_time_window" };
  }
  if (count > maxWindows) {
    return {
      ok: false,
      errorKey: "status.config_too_many_windows",
      errorParams: { max: maxWindows }
    };
  }

  const stepStr = merged.step;
  if (!stepStr?.trim()) {
    return { ok: false, errorKey: "status.config_invalid_time_window" };
  }
  const stepDur = parseDurationToken(stepStr);
  if (!stepDur || durationToMillis(stepDur) <= 0) {
    return { ok: false, errorKey: "status.config_invalid_time_window" };
  }

  const durStr = merged.duration;
  if (!durStr?.trim()) {
    return { ok: false, errorKey: "status.config_invalid_time_window" };
  }
  const dur = parseDurationToken(durStr);
  if (!dur || durationToMillis(dur) <= 0) {
    return { ok: false, errorKey: "status.config_invalid_time_window" };
  }

  if (!merged.anchor?.trim()) {
    return { ok: false, errorKey: "status.config_invalid_time_window" };
  }

  if (merged.offset !== undefined && merged.offset.trim() !== "") {
    try {
      parseTimeWindowOffset(merged.offset);
    } catch {
      return { ok: false, errorKey: "status.config_invalid_time_window" };
    }
  }

  return { ok: true, merged };
}

/**
 * Fail-fast for Lovelace: same rules as {@link validateMergedTimeWindowConfig}, but throws
 * with English messages instead of i18n keys.
 */
export function assertMergedTimeWindowConfig(
  merged: MergedTimeWindowConfig,
  options?: { maxWindows?: number }
): void {
  const result = validateMergedTimeWindowConfig(merged, options);
  if (result.ok) return;

  if (result.errorKey === "status.config_too_many_windows") {
    const max = result.errorParams?.max ?? 24;
    throw new Error(
      `Energy Horizon: too many time windows (maximum ${String(max)}).`
    );
  }

  throw new Error(
    "Energy Horizon: invalid time_window configuration. Check anchor, duration, step, count, and offset in YAML."
  );
}
