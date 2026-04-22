import { describe, it, expect } from "vitest";
import { DateTime, Duration } from "luxon";
import { parseTimeWindowOffset } from "../../src/card/time-windows";

describe("parseTimeWindowOffset (FR-900-Q)", () => {
  it("treats undefined, empty, and whitespace as zero duration", () => {
    expect(parseTimeWindowOffset(undefined).as("milliseconds")).toBe(0);
    expect(parseTimeWindowOffset("").as("milliseconds")).toBe(0);
    expect(parseTimeWindowOffset("   ").as("milliseconds")).toBe(0);
  });

  it("accepts P0D as zero", () => {
    expect(parseTimeWindowOffset("P0D").as("milliseconds")).toBe(0);
  });

  it("rejects sub-hour offsets", () => {
    expect(() => parseTimeWindowOffset("PT30M")).toThrow();
    expect(() => parseTimeWindowOffset("PT59M")).toThrow();
  });

  it("rejects fractional calendar year/month in ISO form", () => {
    expect(() => parseTimeWindowOffset("P0.5M")).toThrow();
    expect(() => parseTimeWindowOffset("P1.5Y")).toThrow();
  });

  it("rejects malformed strings", () => {
    expect(() => parseTimeWindowOffset("not-a-duration")).toThrow();
    expect(() => parseTimeWindowOffset("P")).toThrow();
  });

  it("accepts legacy +3M and +1d with Luxon-equivalent semantics", () => {
    expect(parseTimeWindowOffset("+3M").toISO()).toBe(Duration.fromISO("P3M").toISO());
    expect(parseTimeWindowOffset("+1d").toISO()).toBe(Duration.fromISO("P1D").toISO());
  });

  it("US-900-7: -P2M from start_of_year matches Luxon calendar plus", () => {
    const d = parseTimeWindowOffset("-P2M");
    const anchor = DateTime.fromObject(
      { year: 2026, month: 1, day: 1 },
      { zone: "UTC" }
    );
    expect(anchor.plus(d).toISODate()).toBe("2025-11-01");
  });

  it("US-900-6 / edge 11: P4M4D from 1 Jan lands on 5 May", () => {
    const d = parseTimeWindowOffset("P4M4D");
    const start = DateTime.fromObject(
      { year: 2026, month: 1, day: 1 },
      { zone: "UTC" }
    );
    expect(start.plus(d).toISODate()).toBe("2026-05-05");
  });

  it("P1M28D from 1 Jan 2024: Luxon resolves to last day of added February (leap)", () => {
    const d = parseTimeWindowOffset("P1M28D");
    const start = DateTime.fromObject(
      { year: 2024, month: 1, day: 1 },
      { zone: "UTC" }
    );
    // US-900-6 narrative mentions 1 Mar; Luxon 3.x yields 2024-02-29 for this compound from 1 Jan.
    expect(start.plus(d).toISODate()).toBe("2024-02-29");
  });

  it("edge 13: 31 Jan + P1M clamps to last day of February", () => {
    const d = parseTimeWindowOffset("P1M");
    const start = DateTime.fromObject(
      { year: 2026, month: 1, day: 31 },
      { zone: "UTC" }
    );
    expect(start.plus(d).toISODate()).toBe("2026-02-28");
  });

  it("edge 12: P1M30D from 1 Jan → 3 Mar", () => {
    const d = parseTimeWindowOffset("P1M30D");
    const start = DateTime.fromObject(
      { year: 2026, month: 1, day: 1 },
      { zone: "UTC" }
    );
    expect(start.plus(d).toISODate()).toBe("2026-03-03");
  });
});
