import { describe, it, expect } from "vitest";
import { forecastDisabledReasonKey } from "../../src/card/narrative/forecast-disabled-reason-key";

describe("forecastDisabledReasonKey (FR-008, 911/TD-8)", () => {
  it("maps the two early-in-period reasons to the shared too_early copy", () => {
    expect(forecastDisabledReasonKey("insufficient_buckets")).toBe(
      "forecast.disabled.too_early"
    );
    expect(forecastDisabledReasonKey("below_percent_threshold")).toBe(
      "forecast.disabled.too_early"
    );
  });

  it("maps the individual reasons to their dedicated keys", () => {
    expect(forecastDisabledReasonKey("zero_reference_in_range")).toBe(
      "forecast.disabled.zero_reference"
    );
    // Edge: no reference at all.
    expect(forecastDisabledReasonKey("no_reference")).toBe(
      "forecast.disabled.no_reference"
    );
    expect(forecastDisabledReasonKey("no_split")).toBe(
      "forecast.disabled.no_split"
    );
  });

  it("maps invalid_period and an absent reason to the generic unavailable key", () => {
    expect(forecastDisabledReasonKey("invalid_period")).toBe(
      "forecast.disabled.unavailable"
    );
    expect(forecastDisabledReasonKey(undefined)).toBe(
      "forecast.disabled.unavailable"
    );
  });
});
