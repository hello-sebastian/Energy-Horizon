/**
 * Maps YAML `interpretation` to the `text_summary.{entityKind}.*` namespace (FR-903-NF).
 *
 * **Extending with a new entity kind (e.g. `export`)** — per US-903-N5:
 * 1. Add `"export"` to the {@link NarrativeEntityKind} union and handle it in
 *    {@link interpretationToEntityKind} (invalid / unknown values still default to
 *    `"consumption"` until you intentionally recognize the new mode).
 * 2. For each language under `src/translations/`, add optional keys
 *    `text_summary.export.{higher|lower|similar|neutral_band}` (full sentences with
 *    `{{referencePeriod}}` and delta placeholders per `contracts/narrative-i18n.md`).
 * 3. Keep mandatory `text_summary.generic.*` as the fallback — no changes to the
 *    narrative render path are required beyond the mapper branch above.
 */
export type NarrativeEntityKind = "consumption" | "production";

export function interpretationToEntityKind(
  interpretation: string | undefined
): NarrativeEntityKind {
  if (interpretation === "production") {
    return "production";
  }
  return "consumption";
}
