import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const translationsDir = join(__dirname, "../../src/translations");

/** FR-903-NG / FR-905-L — mandatory in every `*.json` under `src/translations/`. */
const MANDATORY_TEXT_SUMMARY_KEYS = [
  "text_summary.generic.higher",
  "text_summary.generic.lower",
  "text_summary.generic.similar",
  "text_summary.generic.neutral_band",
  "text_summary.period.day",
  "text_summary.period.week",
  "text_summary.period.month",
  "text_summary.period.year",
  "text_summary.period.reference",
  "text_summary.no_reference",
  "text_summary.insufficient_data"
] as const;

describe("narrative mandatory translation keys (FR-903-NG)", () => {
  it("every src/translations/*.json defines all 11 mandatory keys", () => {
    const files = readdirSync(translationsDir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const raw = readFileSync(join(translationsDir, file), "utf-8");
      const dict = JSON.parse(raw) as Record<string, string>;
      for (const key of MANDATORY_TEXT_SUMMARY_KEYS) {
        expect(
          typeof dict[key] === "string" && dict[key]!.length > 0,
          `${file} missing or empty: ${key}`
        ).toBe(true);
      }
    }
  });
});
