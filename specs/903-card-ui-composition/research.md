# Research: Narrative Engine Refactor (903)

**Date**: 2026-04-21  
**Related**: [spec.md](./spec.md) § Narrative Engine Refactor, [plan.md](./plan.md)

## R-1 — Step classification source

**Decision**: Classify narrative period copy using **only** the merged YAML `step` string (via `classifyComparisonStep`), not resolved window geometry.

**Rationale**: The spec (FR-903-NA) requires intent-driven classification so `offset: +15d` with `step: 1M` still yields `StepKind = "month"`. Current `resolvedWindowsAreConsecutiveCalendarMonths()` compares `startOf("month")` on window starts and fails for offset billing cycles.

**Alternatives considered**:

- **Hybrid** (geometry + step): Rejected — adds complexity and reintroduces edge-case bugs.
- **Luxon duration parsing** for arbitrary steps: Deferred — `1d`/`1w`/`1M`/`1y` are exact string matches per spec; everything else is `"reference"`.

## R-2 — Key-existence API for entity-kind fallback

**Decision**: Add `hasTranslationKey(language: string, key: string): boolean` (or equivalent) in `src/card/localize.ts`, implemented by checking `DICTIONARIES[language]` then `DICTIONARIES.en` without mutating `createLocalize` error behavior.

**Rationale**: `getRawTemplate` returns `undefined` for missing keys but does not distinguish "active missing, en present" from "both missing". For FR-903-NE / FR-905-K, narrative code must try `text_summary.{entityKind}.{trend}` then fall back to `text_summary.generic.{trend}` **without** entering the card error state on the first miss.

**Alternatives considered**:

- **Try `localize` and detect returned key string**: Rejected — conflates missing key with legitimate template content; fragile.
- **Duplicate dictionary read logic in chart**: Rejected — violates single source of truth; prefer one exported helper.

## R-3 — Neutral band and similar copy under new schema

**Decision**: Migrate `text_summary.neutral_band` / `neutral_band_mom` to the same **sentence + period phrase** composition as higher/lower: base key `text_summary.{entityKind}.neutral_band` (or `text_summary.generic.neutral_band` as mandatory) plus `text_summary.period.{stepKind}` for `{{referencePeriod}}`, with `generic` fallback chain identical to other trends.

**Rationale**: Neutral band strings currently embed "last year" vs "previous month" inline; they must follow the same step classifier as higher/lower/similar to fix offset bugs.

**Alternatives considered**:

- **Leave neutral_band as monolithic strings**: Rejected — duplicates period logic and reintroduces MoM vs YoY split (`*_mom`).

**Note**: Confirm final key name for neutral band (`neutral_band` vs `similar` wording) in `data-model.md`; spec groups "similar" outcome under `trend: similar` for non-band neutral; percent band may stay a distinct template family under `text_summary.{entityKind}.neutral_band` with `{{referencePeriod}}`.

## R-4 — `insufficient_data` vs current `insufficient_comparison` / wrong key in render

**Decision**: Align runtime with FR-903-W / FR-903-NH: use dedicated key `text_summary.insufficient_data` for the insufficient comparison path. Deprecate/remove `text_summary.insufficient_comparison` after migration. Fix bug where render path used `text_summary.no_reference` for insufficient-data outcome (see `cumulative-comparison-chart.ts`).

**Rationale**: Spec distinguishes no reference data vs insufficient comparison percent; shared messaging was incorrect.

**Alternatives considered**:

- **Keep `insufficient_comparison` name**: Rejected — 905 amendment standardizes on `insufficient_data`.

## R-5 — File placement for `classifyComparisonStep`

**Decision**: Implement `classifyComparisonStep` in a small pure module under `src/card/` (e.g. `src/card/narrative/classify-comparison-step.ts`) and import from `cumulative-comparison-chart.ts` to keep the chart file smaller and satisfy unit-test isolation.

**Rationale**: Constitution III asks for testable, modular logic; pure function is trivial to test without Lit harness.

**Alternatives considered**:

- **Inline in cumulative-comparison-chart.ts**: Acceptable for MVP but worse for diff noise and reuse.
