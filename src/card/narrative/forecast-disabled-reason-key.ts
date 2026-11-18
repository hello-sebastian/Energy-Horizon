import type { ForecastStats } from "../types";

/** The `disabledReason` a disabled forecast can carry (`ForecastStats`). */
export type ForecastDisabledReason = NonNullable<
  ForecastStats["disabledReason"]
>;

/**
 * Maps a forecast-disabled reason to its warning-bar i18n key (domain 903,
 * 911/TD-8). `insufficient_buckets` and `below_percent_threshold` share the
 * "too early in the period" copy; `invalid_period` and an absent reason fall
 * back to the generic "unavailable" key — the same table that used to be
 * inlined in `render()`.
 */
export function forecastDisabledReasonKey(
  reason: ForecastDisabledReason | undefined
): string {
  switch (reason) {
    case "insufficient_buckets":
    case "below_percent_threshold":
      return "forecast.disabled.too_early";
    case "zero_reference_in_range":
      return "forecast.disabled.zero_reference";
    case "no_reference":
      return "forecast.disabled.no_reference";
    case "no_split":
      return "forecast.disabled.no_split";
    case "invalid_period":
    default:
      return "forecast.disabled.unavailable";
  }
}
