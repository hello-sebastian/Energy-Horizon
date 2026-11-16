import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * User Story 4 (T033): Static guard to prevent hardcoded UI strings from creeping
 * back into card source. User-visible text must live only in src/translations/*.json.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "../..");
const cardSrcDir = join(projectRoot, "src", "card");

/** Known Polish UI phrases that must not appear in source (only in pl.json). */
const FORBIDDEN_PHRASES = [
  "Bieżący okres",
  "Okres referencyjny",
  "Ładowanie danych statystyk",
  "Nie udało się pobrać",
  "Wystąpił błąd podczas",
  "Brak danych do wyświetlenia",
  "Dane referencyjne dla tego dnia",
  "Poziom pewności prognozy",
  "Brak wystarczających danych",
  "Twoje zużycie jest",
  "Brak tłumaczenia dla klucza"
];

/** Source files that must not contain user-visible natural language. */
const CARD_SOURCE_FILES = [
  "cumulative-comparison-chart.ts",
  "ha-api.ts",
  "localize.ts",
  "types.ts",
  "energy-horizon-card-styles.ts"
];

describe("localize static text guard (US4)", () => {
  it("card source files do not contain forbidden hardcoded Polish UI phrases", () => {
    const found: { file: string; phrase: string; line: number }[] = [];

    for (const file of CARD_SOURCE_FILES) {
      const filePath = join(cardSrcDir, file);
      let content: string;
      try {
        content = readFileSync(filePath, "utf-8");
      } catch {
        continue; // skip if file removed or path wrong
      }

      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        for (const phrase of FORBIDDEN_PHRASES) {
          if (line.includes(phrase)) {
            found.push({ file, phrase, line: i + 1 });
          }
        }
      }
    }

    expect(
      found,
      found.length > 0
        ? `Found hardcoded UI phrases (use localize() and src/translations/*.json):\n${found
            .map((f) => `  ${f.file}:${f.line} "${f.phrase}"`)
            .join("\n")}`
        : undefined
    ).toHaveLength(0);
  });
});
