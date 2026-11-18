import type { SemanticOutcome } from "../types";
import type { NeutralKind } from "../interpretation-semantics";
import type { NarrativeEntityKind } from "./interpretation-to-entity-kind";
import {
  resolveTextSummarySentenceKey,
  type NarrativeTrend
} from "./resolve-text-summary-sentence-key";
import { getRawTemplate } from "../localize";

/**
 * Pre-formatted values the narrative sentence templates interpolate
 * (`{{deltaUnit}}`, `{{deltaPercent}}`, `{{referencePeriod}}`).
 */
export interface NarrativeSegmentValues {
  deltaUnit: string;
  deltaPercent: string;
  referencePeriod: string;
}

/**
 * One narrative sentence resolved from the comparison semantics
 * (FR-903-NH, 911/TD-8): the localization key, the interpolation vars to
 * pass to `localize()` (or the emphasis renderer when `template` is present),
 * the raw template when the language files provide one, and whether the row
 * is muted.
 */
export interface NarrativeSegment {
  key: string;
  vars: Record<string, string>;
  /**
   * Raw template with `{{placeholders}}` — present only on the emphasis
   * paths (neutral band / higher / lower) and only when the key exists in
   * the active language or the `en` fallback (FR-903-NE).
   */
  template?: string;
  /**
   * Muted (non-judgment) styling — the `insufficient_data` (FR-903-W) and
   * "similar" paths.
   */
  muted: boolean;
}

/**
 * FR-903-Q polarity as a trend word (FR-903-NH): in consumption mode
 * `current > reference` (a positive difference) is the *negative* outcome and
 * reads "higher"; production inverts the polarity.
 *
 * | entityKind | outcome  | trend  |
 * |------------|----------|--------|
 * | consumption| negative | higher |
 * | consumption| positive | lower  |
 * | production | positive | higher |
 * | production | negative | lower  |
 */
function outcomeTrend(
  outcome: "positive" | "negative",
  entityKind: NarrativeEntityKind
): NarrativeTrend {
  if (entityKind === "consumption") {
    return outcome === "negative" ? "higher" : "lower";
  }
  return outcome === "positive" ? "higher" : "lower";
}

/**
 * The 4-branch narrative selection over `interpretationSemantics.outcome` —
 * the domain-903 narrative engine (911/TD-8). Pure: no DOM, no element
 * access; `render()` only formats the result and wraps it in Lit.
 */
export function resolveNarrativeSegment(input: {
  outcome: SemanticOutcome;
  neutralKind: NeutralKind | undefined;
  language: string;
  entityKind: NarrativeEntityKind;
  values: NarrativeSegmentValues;
}): NarrativeSegment {
  const { outcome, neutralKind, language, entityKind, values } = input;
  const { deltaUnit, deltaPercent, referencePeriod } = values;

  // FR-903-W / FR-903-NH: dedicated, muted, non-judgment path — no vars.
  if (outcome === "insufficient_data") {
    return {
      key: "text_summary.insufficient_data",
      vars: {},
      muted: true
    };
  }

  if (outcome === "neutral") {
    if (neutralKind === "percent_band") {
      const key = resolveTextSummarySentenceKey(
        language,
        entityKind,
        "neutral_band"
      );
      const template = getRawTemplate(language, key);
      return {
        key,
        // The key-only fallback (missing template) renders without
        // interpolation, so no vars are passed there.
        vars:
          template !== undefined
            ? { deltaUnit, deltaPercent, referencePeriod }
            : {},
        template,
        muted: false
      };
    }
    // `flat_or_zero` (and any future neutral kind) — muted "similar" path.
    const key = resolveTextSummarySentenceKey(language, entityKind, "similar");
    return {
      key,
      vars: { referencePeriod },
      muted: true
    };
  }

  // `positive` / `negative` (FR-903-Q + FR-903-NH).
  const trend = outcomeTrend(outcome, entityKind);
  const key = resolveTextSummarySentenceKey(language, entityKind, trend);
  const template = getRawTemplate(language, key);
  return {
    key,
    vars:
      template !== undefined
        ? { deltaUnit, deltaPercent, referencePeriod }
        : {},
    template,
    muted: false
  };
}
