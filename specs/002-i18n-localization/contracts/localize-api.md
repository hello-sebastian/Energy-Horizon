# Contract: Localization API

**Feature**: `002-i18n-localization`  
**Date**: 2026-03-10  
**Stability**: Stable (public contract for translation contributors and card maintainers)

---

## 1. `resolveLocale(hass, config): ResolvedLocale`

Builds the effective locale for one render pass.

**Inputs**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `hass` | `HomeAssistant` | The HA object provided to the card |
| `config` | `CardConfig` | The card YAML configuration |

**Priority order** (first defined value wins per field):

| Field | Source 1 (highest) | Source 2 | Source 3 (default) |
|-------|--------------------|----------|---------------------|
| `language` | `config.language` | `hass.locale.language` | `"en"` |
| `numberFormat` | `config.number_format` | `hass.locale.number_format` | `"system"` |
| `timeZone` | _(no YAML override)_ | `hass.config.time_zone` | `"UTC"` |

**Output**: `ResolvedLocale` – plain object, safe to pass around.

**Validation**: If `config.language` is set to an unrecognized value (not `pl` or `en` or any other key present in `src/translations/`), the function logs a warning (if `config.debug`) and falls back to `"en"`. Does not throw.

If `config.number_format` is set to a value outside `["comma", "decimal", "language", "system"]`, the function logs a warning (if `config.debug`) and falls back to `"system"`. Does not throw.

---

## 2. `createLocalize(language: string): LocalizeFunction`

Factory that loads the translation dictionary for `language` and returns a bound `localize` function.

```typescript
function createLocalize(language: string): LocalizeFunction
```

**Dictionary loading order**:
1. Try `translations/<language>.json`
2. If not found, use `translations/en.json` (silent fallback, no error)

**Returned function signature**:
```typescript
(key: string, vars?: Record<string, string | number>) => string
```

**Lookup resolution**:
1. Active language dictionary → key found → substitute `{{vars}}` → return
2. Not found → `en` dictionary → key found → substitute `{{vars}}` → return
3. Not found in `en` either → **ERROR STATE** (see §3 below)

---

## 2a. `getRawTemplate(language: string, key: string): string | undefined`

Returns the **uninterpolated** string for `key` using the same dictionary lookup as `createLocalize(language)` (active language, then `en` fallback per key).

Used when the UI must parse `{{variableName}}` segments before substitution — for example, wrapping formatted numbers in emphasis spans while keeping **one full sentence per translation key** (`text_summary.higher`, etc.).

---

## 3. Missing key error state

When a key is absent from both the active language and `en`:

| Behaviour | Details |
|-----------|---------|
| Card render | Blocked – card enters `"error"` state |
| UI message | `localize("error.missing_translation", { key })` is used; this key is a hardcoded safety string, never looked up dynamically |
| Console log | If `config.debug === true`: logs `[Energy Horizon] Missing translation key: "<key>" (language: "<lang>")` |
| Return value | The raw `key` string is returned so any partial render that occurs during transition to error state shows a readable placeholder |

**`error.missing_translation` is the only translation key that must never be absent**. It is hardcoded as a constant string in `localize.ts` and never looked up from JSON.

---

## 4. Variable interpolation

Syntax: `{{variableName}}` inside the translated string value.

**Example translation entries** (`pl.json`):
```json
"text_summary.higher": "Zużycie jest o {{deltaUnit}} ({{deltaPercent}}) wyższe niż w tym samym okresie w poprzednim roku.",
"text_summary.higher_mom": "Zużycie jest o {{deltaUnit}} ({{deltaPercent}}) wyższe niż w poprzednim miesiącu."
```

**Usage in code**:
```typescript
// Plain interpolation (no per-segment markup)
localize("text_summary.higher", {
  deltaUnit: formattedAbsWithUnit,
  deltaPercent: formattedPercent
})
```

For the consumption summary comment, the card uses `getRawTemplate` plus `textSummaryNarrativeWithEmphasis()` in `cumulative-comparison-chart.ts` so `{{deltaUnit}}` and `{{deltaPercent}}` render inside `ebc-comment-emphasis` spans.

**Rules**:
- Variables not provided in `vars` are left unchanged in the output (the `{{name}}` token remains visible).
- Variables provided in `vars` but not present in the string are silently ignored.
- No escaping mechanism is needed (variables are formatted values, not raw user input).

---

## 5. `numberFormatToLocale(numberFormat, language): string`

Helper that maps a `NumberFormat` enum value to a BCP 47 locale string for `Intl.NumberFormat`.

| Input `numberFormat` | Returns |
|----------------------|---------|
| `"comma"` | `"de"` (representative comma-decimal locale) |
| `"decimal"` | `"en"` (representative dot-decimal locale) |
| `"language"` | value of `language` parameter |
| `"system"` | `navigator.language` |

Used exclusively by `cumulative-comparison-chart.ts` when constructing `Intl.NumberFormat`.

---

## 6. Translation file schema (contributor contract)

Adding a new language requires creating `src/translations/<lang>.json` with **all keys present in `en.json`**.

### Required keys (must be present in every language file)

```
period.current
period.reference
status.loading
status.error_api
status.error_generic
status.no_data
summary.current_period
summary.reference_period
summary.difference
summary.difference_percent
summary.incomplete_reference
forecast.current_forecast
forecast.reference_consumption
forecast.historical_value
forecast.confidence            ← must contain {{confidence}}
text_summary.no_reference
text_summary.similar
text_summary.similar_mom
text_summary.higher             ← must contain {{deltaUnit}} and {{deltaPercent}}
text_summary.lower              ← must contain {{deltaUnit}} and {{deltaPercent}}
text_summary.higher_mom         ← month-over-month higher; same placeholders
text_summary.lower_mom          ← month-over-month lower; same placeholders
error.missing_translation      ← must contain {{key}}
```

### Key naming conventions

- Namespace dot-notation: `<section>.<identifier>`
- All lowercase, underscores for spaces
- `{{variableName}}` uses camelCase variable names
- Sections: `period`, `status`, `summary`, `forecast`, `text_summary`, `error`

### Constraint: zero keys outside this file

No user-visible string is permitted to exist as a raw string literal outside `src/translations/*.json`. Violations are detectable by code review (SC-005).
