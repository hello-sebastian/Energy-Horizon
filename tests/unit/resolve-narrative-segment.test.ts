import { describe, it, expect } from "vitest";
import {
  resolveNarrativeSegment,
  type NarrativeSegmentValues
} from "../../src/card/narrative/resolve-narrative-segment";

const values: NarrativeSegmentValues = {
  deltaUnit: "+12.5 kWh",
  deltaPercent: "8.3%",
  referencePeriod: "the previous month"
};

function segment(
  outcome: "positive" | "negative" | "neutral" | "insufficient_data",
  neutralKind: "percent_band" | "flat_or_zero" | undefined,
  entityKind: "consumption" | "production",
  language = "en"
) {
  return resolveNarrativeSegment({ outcome, neutralKind, language, entityKind, values });
}

describe("resolveNarrativeSegment (FR-008 / FR-903-NH, 911/TD-8)", () => {
  it("insufficient_data: dedicated muted path without vars (FR-903-W)", () => {
    const s = segment("insufficient_data", undefined, "consumption");
    expect(s.key).toBe("text_summary.insufficient_data");
    expect(s.vars).toEqual({});
    expect(s.muted).toBe(true);
    expect(s.template).toBeUndefined();
  });

  it("neutral percent_band: emphasis path with all three vars, not muted", () => {
    const s = segment("neutral", "percent_band", "consumption");
    expect(s.key).toBe("text_summary.consumption.neutral_band");
    expect(s.muted).toBe(false);
    expect(s.vars).toEqual(values);
    // The en template exists and carries the placeholders the emphasis
    // renderer splits on (FR-903-NE: key-existence lookup, not try/catch).
    expect(typeof s.template).toBe("string");
    expect(s.template).toContain("{{deltaPercent}}");
  });

  it("neutral percent_band: production entity kind selects production copy", () => {
    const s = segment("neutral", "percent_band", "production");
    expect(s.key).toBe("text_summary.production.neutral_band");
  });

  it("neutral flat_or_zero: muted 'similar' path with only referencePeriod", () => {
    const s = segment("neutral", "flat_or_zero", "consumption");
    expect(s.key).toBe("text_summary.consumption.similar");
    expect(s.vars).toEqual({ referencePeriod: values.referencePeriod });
    expect(s.muted).toBe(true);
    expect(s.template).toBeUndefined();
  });

  it("neutral with an unrecognized kind takes the 'similar' path (flat is the only other kind)", () => {
    const s = segment("neutral", undefined, "consumption");
    expect(s.key).toBe("text_summary.consumption.similar");
    expect(s.muted).toBe(true);
  });

  it("consumption polarity (FR-903-Q): positive → lower, negative → higher", () => {
    expect(segment("positive", undefined, "consumption").key).toBe(
      "text_summary.consumption.lower"
    );
    expect(segment("negative", undefined, "consumption").key).toBe(
      "text_summary.consumption.higher"
    );
  });

  it("production polarity (FR-903-Q): inverted — positive → higher, negative → lower", () => {
    expect(segment("positive", undefined, "production").key).toBe(
      "text_summary.production.higher"
    );
    expect(segment("negative", undefined, "production").key).toBe(
      "text_summary.production.lower"
    );
  });

  it("positive/negative emphasis paths carry all three vars and the raw template", () => {
    const s = segment("negative", undefined, "consumption");
    expect(s.muted).toBe(false);
    expect(s.vars).toEqual(values);
    expect(typeof s.template).toBe("string");
    expect(s.template).toContain("{{deltaUnit}}");
    expect(s.template).toContain("{{referencePeriod}}");
  });

  it("unknown language falls back to the en dictionary (FR-903-NE chain)", () => {
    const s = segment("negative", undefined, "consumption", "xx");
    expect(s.key).toBe("text_summary.consumption.higher");
    expect(typeof s.template).toBe("string");
    expect(s.vars).toEqual(values);
  });
});
