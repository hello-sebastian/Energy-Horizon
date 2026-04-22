import { hasTranslationKey } from "../localize";
import type { NarrativeEntityKind } from "./interpretation-to-entity-kind";

export type NarrativeTrend = "higher" | "lower" | "similar" | "neutral_band";

/**
 * `text_summary.{entityKind}.{trend}` with mandatory `text_summary.generic.{trend}` fallback (FR-903-NE).
 */
export function resolveTextSummarySentenceKey(
  language: string,
  entityKind: NarrativeEntityKind,
  trend: NarrativeTrend
): string {
  const primary = `text_summary.${entityKind}.${trend}`;
  if (hasTranslationKey(language, primary)) {
    return primary;
  }
  return `text_summary.generic.${trend}`;
}
