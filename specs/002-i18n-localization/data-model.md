# Data Model: i18n / l10n

**Feature**: `002-i18n-localization`  
**Date**: 2026-03-10

---

## Entities

### 1. `TranslationDictionary`

A flat JSON object keyed by dot-notation translation keys. One file per language.

```
src/translations/
├── en.json   ← mandatory, used as final fallback
└── pl.json   ← mandatory, first supported language
```

**Schema** (each language file):
```json
{
  "period.current": "string",
  "period.reference": "string",
  "status.loading": "string",
  "status.error_api": "string",
  "status.error_generic": "string",
  "status.no_data": "string",
  "summary.current_period": "string",
  "summary.reference_period": "string",
  "summary.difference": "string",
  "summary.difference_percent": "string",
  "summary.incomplete_reference": "string",
  "forecast.current_forecast": "string",
  "forecast.reference_consumption": "string",
  "forecast.historical_value": "string",
  "forecast.confidence": "string (may contain {{confidence}})",
  "text_summary.no_reference": "string",
  "text_summary.similar": "string",
  "text_summary.similar_mom": "string",
  "text_summary.higher": "string (contains {{deltaUnit}} and {{deltaPercent}})",
  "text_summary.lower": "string (contains {{deltaUnit}} and {{deltaPercent}})",
  "text_summary.higher_mom": "string (contains {{deltaUnit}} and {{deltaPercent}})",
  "text_summary.lower_mom": "string (contains {{deltaUnit}} and {{deltaPercent}})",
  "error.missing_translation": "string (contains {{key}})"
}
```

**Rules**:
- All keys in `en.json` are authoritative. `pl.json` must contain the same set.
- Any key missing from `pl.json` is silently served from `en.json` (FR-008).
- Any key missing from both files triggers the error state (FR-008a).
- Variable placeholders use `{{variableName}}` syntax (Mustache-style).

---

### 2. `ResolvedLocale`

The resolved locale context used for a single render pass. Derived at render time, not stored permanently.

```typescript
interface ResolvedLocale {
  language: string;         // BCP 47 code, e.g. "pl", "en"
  numberFormat: NumberFormat; // HA enum: "comma" | "decimal" | "language" | "system"
  timeZone: string;         // IANA tz, e.g. "Europe/Warsaw"
}
```

**Resolution priority** (highest wins):
1. YAML `language` / `number_format` override (from `CardConfig`)
2. `hass.locale.language` / `hass.locale.number_format`
3. `hass.config.time_zone`
4. Defaults: `"en"`, `"system"`, `"UTC"`

---

### 3. `LocalizeFunction`

A bound callable produced by `createLocalize(language)`. Passed to or called within rendering code.

```typescript
type LocalizeFunction = (key: string, vars?: Record<string, string | number>) => string;
```

**Behaviour**:
- Looks up `key` in the active language dictionary.
- If missing, falls back to `en` dictionary value.
- If missing in `en` too: signals error state (see below); returns `key` as safe display value to prevent blank UI during error recovery render.
- Performs `{{var}}` substitution on the result string before returning.

---

### 4. Changes to existing types

#### `CardConfig` (in `src/card/types.ts`) – new optional fields:

```typescript
interface CardConfig {
  // ... existing fields ...
  language?: string;                                       // BCP 47 override
  number_format?: "comma" | "decimal" | "language" | "system"; // HA enum override
}
```

#### `HomeAssistant` (in `src/ha-types.ts`) – extend `locale` and add `config`:

```typescript
interface HomeAssistant {
  language: string;
  locale?: {
    language: string;
    number_format?: "comma" | "decimal" | "language" | "system";
  };
  config?: {
    time_zone?: string;
  };
  // ... existing fields ...
}
```

#### `TextSummary` (in `src/card/types.ts`) – remove `heading`, add numeric diff fields:

```typescript
interface TextSummary {
  trend: Trend;
  diffValue?: number;  // absolute difference value for interpolation
  unit: string;        // unit for interpolation
}
```

> `heading` is removed because the display string is now produced by the component using `localize()`. Logic (`ha-api.ts`) no longer generates UI strings.

---

## New source files

| File | Purpose |
|------|---------|
| `src/card/localize.ts` | `createLocalize(language)` factory + `resolveLocale(hass, config)` helper |
| `src/translations/en.json` | English translation dictionary (23 keys) |
| `src/translations/pl.json` | Polish translation dictionary (23 keys) |

## Modified source files

| File | Change summary |
|------|----------------|
| `src/card/types.ts` | Add `language?`, `number_format?` to `CardConfig`; refactor `TextSummary` |
| `src/ha-types.ts` | Extend `HomeAssistant.locale` with `number_format`; add `config.time_zone` |
| `src/card/ha-api.ts` | `computeTextSummary` returns `trend` + numeric diff instead of heading string |
| `src/card/cumulative-comparison-chart.ts` | Call `resolveLocale()` + `createLocalize()`; replace all hardcoded strings |
| `src/card/chart-renderer.ts` | Accept localized period labels as arguments instead of using hardcoded strings |
