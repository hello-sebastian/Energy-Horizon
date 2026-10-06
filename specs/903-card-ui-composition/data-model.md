# Data Model: Narrative Engine Refactor

**Date**: 2026-04-21  
**Domains**: `903-card-ui-composition`, `905-localization-formatting`, `900-time-model-windows`

## Types

### `StepKind`

`"day" | "week" | "month" | "year" | "reference"`

Derived only by `classifyComparisonStep(step: string | undefined)`:

| Input `step` | `StepKind` |
|---|---|
| `1d` | `day` |
| `1w` | `week` |
| `1M` | `month` |
| `1y` | `year` |
| any other string, empty, or `undefined` | `reference` |

**Normalization**: Trim whitespace before matching; treat unknown ISO-like strings as `reference`.

### `EntityKind`

`"consumption" | "production" | "generic"`

From `interpretationToEntityKind(interpretation: string | undefined)`:

| YAML `interpretation` (after 903 case-insensitive parse) | `EntityKind` |
|---|---|
| `"production"` | `production` |
| `"consumption"` or invalid / omitted | `consumption` |

`generic` is **not** returned by the mapper; it exists only as a **dictionary namespace** for i18n fallback.

### `NarrativeTrend` (outcome → template family)

For **non-band** outcomes mapped from `SemanticOutcome` / sign / `interpretation`:

| Condition | `NarrativeTrend` |
|---|---|
| Outside band, consumption, `diff > 0` (worse) | `higher` |
| Outside band, consumption, `diff < 0` (better) | `lower` |
| Outside band, production, `diff > 0` (better) | `higher` |
| Outside band, production, `diff < 0` (worse) | `lower` |
| Neutral "similar" (not percent-band) | `similar` |
| Neutral percent band (`neutralKind === "percent_band"`) | `neutral_band` (separate template family; see below) |

### Template variables

| Variable | Used in | Source |
|---|---|---|
| `{{deltaUnit}}` | higher / lower / neutral_band sentences | Existing narrative formatting |
| `{{deltaPercent}}` | neutral_band | Existing |
| `{{referencePeriod}}` | higher / lower / similar / neutral_band **full sentences** | `localize("text_summary.period." + stepKind)` — **no** variables inside period fragment |

**Rules**:

- `text_summary.insufficient_data` and `text_summary.no_reference`: **no** `{{referencePeriod}}`.
- Period keys `text_summary.period.*`: **zero** variables (plain fragment for insertion after comparative).

## Key resolution algorithm

```
entityKind := interpretationToEntityKind(config.interpretation)
stepKind := classifyComparisonStep(mergedTimeWindow.step)
referencePeriod := localize("text_summary.period." + stepKind)  // no vars

function sentenceKey(entityKind, trendOrBand):
  primary := "text_summary." + entityKind + "." + trendOrBand
  if hasTranslationKey(lang, primary): return primary
  fallback := "text_summary.generic." + trendOrBand
  if hasTranslationKey(lang, fallback): return fallback
  error state (existing MISSING_TRANSLATION_KEY path)
```

For **similar** and **higher**/**lower**/**neutral_band** full sentences, interpolate `{{referencePeriod}}` plus existing delta variables.

## Translation key migration (authoritative)

### Remove (all languages)

| Old key | Notes |
|---|---|
| `text_summary.higher_mom` | Replaced by composition |
| `text_summary.lower_mom` | |
| `text_summary.similar_mom` | |
| `text_summary.neutral_band_mom` | |
| `text_summary.production.higher_mom` | |
| `text_summary.production.lower_mom` | |

### Rename / consolidate

| Old key | New key |
|---|---|
| `text_summary.insufficient_comparison` | `text_summary.insufficient_data` |

### Replace flat consumption / production with nested (per language)

| Old key | New key(s) |
|---|---|
| `text_summary.higher` | `text_summary.consumption.higher` (+ `text_summary.generic.higher` mandatory) |
| `text_summary.lower` | `text_summary.consumption.lower` |
| `text_summary.similar` | `text_summary.consumption.similar` |
| `text_summary.neutral_band` | `text_summary.consumption.neutral_band` (+ generic fallback) |
| `text_summary.production.higher` | `text_summary.production.higher` |
| `text_summary.production.lower` | `text_summary.production.lower` |
| `text_summary.no_reference` | `text_summary.no_reference` (unchanged path; **shared**) |

### Add (all languages — mandatory set)

| New key | Purpose |
|---|---|
| `text_summary.generic.higher` | Minimal language bootstrap |
| `text_summary.generic.lower` | |
| `text_summary.generic.similar` | |
| `text_summary.generic.neutral_band` | If percent-band neutral uses generic copy in thin languages |
| `text_summary.period.day` | Fragment after comparative |
| `text_summary.period.week` | |
| `text_summary.period.month` | |
| `text_summary.period.year` | |
| `text_summary.period.reference` | |

### Optional per language (fallback to `generic`)

- `text_summary.consumption.higher` | `lower` | `similar` | `neutral_band`
- `text_summary.production.higher` | `lower` | `similar` | `neutral_band`

## Runtime inputs

| Field | Source | Consumer |
|---|---|---|
| `mergedTimeWindow.step` | `900-time-model-windows` merge output (string, e.g. `P1M` → normalize to `1M` if that is current internal convention) | `classifyComparisonStep` |
| `interpretation` | `CardConfig` | `interpretationToEntityKind` |

**Action item**: Audit how `step` is stored today (`P1M` vs `1M`) in merged config; `classifyComparisonStep` MUST accept the actual runtime string shape (document normalization in implementation).

## State / persistence

No new persisted state. Pure functions + dictionary lookup.
