import { describe, it, expect } from "vitest";
import {
  createLocalize,
  getRawTemplate,
  hasTranslationKey
} from "../../src/card/localize";

describe("hasTranslationKey (FR-903-NE / FR-905-K)", () => {
  it("returns true when getRawTemplate resolves from English fallback", () => {
    const lang = "not_a_real_dictionary_language_xyz";
    const key = "text_summary.insufficient_data";
    expect(getRawTemplate(lang, key)).toBeDefined();
    expect(hasTranslationKey(lang, key)).toBe(true);
  });

  it("returns false when the key is missing in both active and English", () => {
    expect(hasTranslationKey("en", "text_summary.this_key_should_not_exist")).toBe(
      false
    );
  });

  it("matches createLocalize resolution for mandatory generic keys", () => {
    const localize = createLocalize("en");
    const key = "text_summary.generic.higher";
    expect(hasTranslationKey("en", key)).toBe(true);
    expect(localize(key, { deltaUnit: "1", deltaPercent: "2%", referencePeriod: "x" })).not.toBe(key);
  });
});
