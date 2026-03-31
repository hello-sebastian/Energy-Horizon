import { describe, it, expect } from "vitest";
import { pickAutoAggregation } from "../../src/card/axis/auto-aggregation";

const MS_HOUR = 3600000;
const MS_DAY = 86400000;

describe("pickAutoAggregation", () => {
  it("chooses week for ~one year span (readability band)", () => {
    const oneYearMs = 365.25 * MS_DAY;
    expect(pickAutoAggregation(oneYearMs)).toBe("week");
  });

  it("chooses day for ~two months when bucket count falls in band", () => {
    const ms = 60 * MS_DAY;
    expect(pickAutoAggregation(ms)).toBe("day");
  });

  it("chooses hour for very short spans when no band match", () => {
    const ms = 2 * MS_HOUR;
    expect(pickAutoAggregation(ms)).toBe("hour");
  });

  it("chooses hour for exactly one hour window (LTS minimum bucket)", () => {
    expect(pickAutoAggregation(MS_HOUR)).toBe("hour");
  });

  it("returns day for non-finite or non-positive duration", () => {
    expect(pickAutoAggregation(Number.NaN)).toBe("day");
    expect(pickAutoAggregation(-1)).toBe("day");
  });
});
