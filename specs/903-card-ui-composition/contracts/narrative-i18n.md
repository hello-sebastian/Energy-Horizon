# Contract: Narrative i18n keys (`text_summary`)

**Version**: 1.0.0 (draft)  
**Consumers**: `903-card-ui-composition` narrative render path via `localize` / `getRawTemplate` / `hasTranslationKey` (to be added).

## Namespace rules

1. Keys use flat dot notation in JSON: `text_summary.consumption.higher`, not nested JSON objects.
2. `text_summary.period.*` values are **fragments** (grammatically valid immediately after a comparative such as "higher than" / "niższe niż" in the host sentence).
3. Full-sentence keys (`text_summary.{entityKind}.*`) MUST include `{{referencePeriod}}` where the period phrase is composed dynamically — except `similar` / `neutral_band` copy MUST still include `{{referencePeriod}}` per product decision (all three trend families + neutral band use `{{referencePeriod}}`).

## Mandatory keys (every `src/translations/*.json`)

| Key | Variables |
|---|---|
| `text_summary.generic.higher` | `deltaUnit`, `deltaPercent`, `referencePeriod` |
| `text_summary.generic.lower` | same |
| `text_summary.generic.similar` | `referencePeriod` |
| `text_summary.generic.neutral_band` | `deltaUnit`, `deltaPercent`, `referencePeriod` |
| `text_summary.period.day` | none |
| `text_summary.period.week` | none |
| `text_summary.period.month` | none |
| `text_summary.period.year` | none |
| `text_summary.period.reference` | none |
| `text_summary.no_reference` | none |
| `text_summary.insufficient_data` | none |

## Optional keys (per language; fallback to `generic`)

Pattern: `text_summary.consumption.{higher|lower|similar|neutral_band}`, `text_summary.production.{...}`.

## `StepKind` → `text_summary.period.*` suffix

| `StepKind` | Key suffix |
|---|---|
| `day` | `period.day` |
| `week` | `period.week` |
| `month` | `period.month` |
| `year` | `period.year` |
| `reference` | `period.reference` |

## Error behavior

If after `entityKind` → `generic` fallback a required sentence key is still missing, the card follows existing `MISSING_TRANSLATION_KEY` / `_localizeOrError` behavior (FR-905-F).
