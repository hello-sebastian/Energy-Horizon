# 905-localization-formatting
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Localization & Formatting  
**Replaces**: `002-i18n-localization`  
**Primary code**: `src/card/localize.ts`, `src/translations/`  
**Last updated**: 2026-04-21  

---

<!-- NORMATIVE -->

## Current Behavior (normative)

The card resolves all user-visible text, number formats, and time zone from a three-level cascade: YAML card config overrides → HA `hass.locale` global settings → built-in defaults (`en`, decimal point, UTC).

### Locale cascade

| Aspect | Priority 1 | Priority 2 | Priority 3 |
|---|---|---|---|
| Language | `language` YAML key | `hass.locale.language` | `en` |
| Number format | `number_format` YAML key | `hass.locale.number_format` | decimal point |
| Time zone | — | `hass.config.time_zone` | UTC |

### Translation dictionary

- Separate JSON file per language in `src/translations/` (e.g., `en.json`, `pl.json`, `de.json`).
- Keys use descriptive dot-notation (e.g., `"card.summary.no_data"`).
- Mandatory languages: `en` and `pl`. German (`de`) is present.
- Fallback chain: active language → `en`. If a key is missing from both, the card enters an error state (rendering blocked, error message shown in UI; key and language logged to console when `debug: true`).

### `localize()` function

`localize(key: string, variables?: Record<string, unknown>): string` — returns the translated string with optional variable interpolation (e.g., `localize("summary.higher", { percent: 15 })`). All calls in rendering code use descriptive key names; no raw string literals for UI text exist outside translation files.

### Interpretation copy (consumption vs production)

User-visible strings that depend on **`interpretation`** (`consumption` \| `production` from card YAML; default consumption) — including **production-specific** narrative lines and **editor** labels for the interpretation control — MUST have parallel keys in **`en`**, **`pl`**, and **`de`**. When `interpretation` is omitted, runtime behavior uses **consumption** strings per `903-card-ui-composition`.

### Re-render on locale change

The card re-renders automatically when `hass.locale` changes (e.g., the user changes HA language in Settings), without a page reload.

### Number format values

`number_format` accepts: `comma`, `decimal`, `language`, `system`. Any other value is a configuration error (same error state as a missing translation key).

### HA time zone authority

The HA instance IANA time zone (`hass.config.time_zone`) is the canonical time zone for all date/time display, period calculations, and axis/tooltip labels. The browser local time zone is never used for these purposes.

---

## Public Contract

```yaml
# Card-level YAML (localization relevant fields)
language: "pl"                 # optional; overrides hass.locale.language for this card
number_format: "comma"         # optional; comma|decimal|language|system
debug: true                    # optional; enables console logging for missing i18n keys
```

```typescript
// src/card/localize.ts
function localize(
  key: string,
  variables?: Record<string, unknown>,
  languageOverride?: string
): string;

// Resolved locale shape (internal)
interface ResolvedLocale {
  language: string;       // BCP-47 tag; resolved from cascade
  numberFormat: 'comma' | 'decimal' | 'language' | 'system';
  timeZone: string;       // IANA time zone from hass.config.time_zone
}
```

---

## Cross-domain Contracts

**Publishes to**:
- `900-time-model-windows`: HA IANA time zone for all calendar boundary calculations and "now" resolution.
- `901-data-pipeline-forecasting`: HA IANA time zone for timestamp interpretation in `buildChartTimeline`.
- `902-chart-rendering-interaction`: resolved locale string and HA time zone for `Intl.DateTimeFormat` axis/tooltip label formatting.
- `903-card-ui-composition`: resolved locale for `formatCompactPeriodCaption`; HA `locale.time_format` for clock portions of hourly-window captions; entity friendly name and icon from `hass.states`; localized strings for narrative interpretation **consumption vs production** wording.
- `904-configuration-surface`: `localize()` function for editor label translation.

**Consumes from**:
- `904-configuration-surface`: `language` and `number_format` YAML overrides; `debug` flag.

---

## Non-Goals

- Bundling month or weekday name dictionaries for the chart time axis (domain 902 uses `Intl.DateTimeFormat` for those).
- Machine translation or server-side translation.
- Changing the HA locale model or LTS data schema.
- Supporting `number_format` values outside the HA enum (`comma`, `decimal`, `language`, `system`).

---

<!-- EXECUTION -->

## User Stories

### US-905-1 — Automatic locale from HA (P1)

As a user who has not added any locale settings to my card YAML, I need the card to automatically display all labels in my HA language and format numbers according to my HA locale, so the card integrates seamlessly with the rest of my dashboard.

**Independent test**: Configure HA to `pl` locale → card shows Polish labels and Polish number formatting with no YAML changes. Configure HA to `en` → English labels and formatting.

**Acceptance Scenarios**:

1. **Given** HA is configured to `pl` locale with no card-level `language` key, **When** the card renders, **Then** all visible text labels appear in Polish and numbers use decimal comma formatting.
2. **Given** HA is configured to `en` locale, **When** the card renders, **Then** all labels appear in English and numbers use decimal point formatting.
3. **Given** HA locale is set to an unsupported language (e.g., `de` when only partial translation exists), **When** the card renders, **Then** missing keys fall back to English without any blank text or error (assuming English key exists).

---

### US-905-2 — YAML override for language and number format (P2)

As a power user running a multi-language household, I need to configure `language: pl` (and/or `number_format: comma`) on a single card's YAML to have that card display in Polish while the rest of my HA dashboard remains in English.

**Independent test**: Set HA locale to `en`, add `language: pl` to card YAML → card shows Polish labels; other cards remain English.

**Acceptance Scenarios**:

1. **Given** HA locale is `en` and card has `language: pl`, **When** the card renders, **Then** labels appear in Polish.
2. **Given** card has `number_format: comma`, **When** numeric values render, **Then** they use decimal comma regardless of the HA global setting.
3. **Given** card YAML has no `language` key, **When** the card renders, **Then** it uses the HA global locale.
4. **Given** card YAML has `language: xx` (unrecognized), **When** the card renders, **Then** it falls back to English without error.

---

### US-905-3 — Re-render on locale change without page reload (P2)

As a user changing my HA language in Settings while my dashboard is open, I need the card to immediately update all labels and formatted values on the next render cycle, without requiring a page reload.

**Independent test**: Change HA language in Settings while card is visible → card updates labels on next Lit render cycle.

**Acceptance Scenarios**:

1. **Given** the card is displayed and HA language is changed in Settings, **When** `hass.locale` propagates to the card, **Then** all labels and formatted values reflect the new locale on the next render cycle.
2. **Given** card has a YAML `language` override, **When** HA global language changes, **Then** the card continues to use the YAML override; the global change does not affect this card.

---

### US-905-4 — Adding a new language requires only dictionary changes (P3)

As a community contributor, I need to add a new language by editing only the translation JSON file, without changing any card rendering or logic code, so the project can grow its language support without deep code reviews.

**Independent test**: Add `xx.json` to `src/translations/` with full key coverage → set `language: xx` in YAML → card shows new-language labels.

**Acceptance Scenarios**:

1. **Given** a new language JSON file added to `src/translations/`, **When** card YAML specifies that language, **Then** labels appear in the new language with no code changes outside the dictionary file.
2. **Given** only some keys are translated in the new language, **When** a missing key is requested, **Then** the card displays the English fallback for that key.

---

## Edge Cases

1. **`hass` not yet available (card initializing)**: Labels must not appear blank; use a safe empty/loading state; no crash.
2. **Dictionary file missing or corrupted**: Card must not crash; fall back to English safety strings.
3. **Translation key missing from both active language and `en`**: Card enters error state — rendering blocked, error message shown in UI; if `debug: true`, the missing key and active language are logged to the browser console.
4. **`hass.locale` contains partial information** (e.g., language set but no `number_format`): Apply per-field fallback — use HA value for available fields, default (`decimal`) for missing ones.
5. **`language` YAML set but `number_format` not**: Language is overridden; `number_format` falls back to `hass.locale.number_format` → default.
6. **`number_format` YAML set to an unrecognized value**: Configuration error (same error state as missing translation key — rendering blocked, message shown).
7. **Locale change mid-session (theme switch)**: The card reacts to the next `hass` update propagation; all labels and formatted values update without page reload.

---

## Functional Requirements

- **FR-905-A (Automatic HA locale)**: The card MUST automatically read language and number-format preferences from `hass.locale` and apply them to all user-visible text labels and numeric values when no YAML override is present.

- **FR-905-B (HA time zone authority)**: The card MUST read the HA instance IANA time zone from `hass.config.time_zone` and use it for all date/time display, period calculations, axis labels, tooltip labels, and "now" resolution. The browser's local time zone MUST NOT be used for these purposes.

- **FR-905-C (YAML language override)**: The card MUST support an optional `language` YAML key that overrides `hass.locale.language` for this card only. Unrecognized language codes MUST fall back to `en` without error.

- **FR-905-D (YAML number_format override)**: The card MUST support an optional `number_format` YAML key accepting `comma`, `decimal`, `language`, or `system`. Any other value MUST trigger a configuration error (card rendering blocked, error message shown in UI).

- **FR-905-E (Translation dictionary)**: All user-visible text strings — static labels and dynamic phrases with variable interpolation — MUST be stored in per-language JSON files in `src/translations/`. Dynamic strings MUST support variable interpolation (e.g., `localize("summary.higher", { percent: 15 })`). Mandatory languages: `en` and `pl`.

- **FR-905-F (Fallback chain)**: When a translation key is missing in the active language, the `en` value MUST be used. When the key is also missing from `en`, the card MUST enter an error state: rendering is blocked, an error message is shown in the card UI, and — if `debug: true` — the missing key and active language are logged to the browser console.

- **FR-905-G (Extensibility)**: Adding a new language MUST require changes only in the `src/translations/` dictionary files; no changes to card rendering or logic code are permitted.

- **FR-905-H (Descriptive localize keys)**: Every `localize()` call in rendering code MUST use a descriptive dot-notation key (e.g., `"card.summary.no_data"`) accompanied by a short inline comment. No raw string literals for UI text may exist in rendering code outside the dictionary files.

- **FR-905-I (Re-render on locale change)**: The card MUST re-render automatically whenever `hass.locale` changes, without requiring a page reload. All labels and formatted values MUST reflect the new locale on the next render cycle.

---

## Key Entities

- **Translations Dictionary**: Per-language JSON files in `src/translations/` (e.g., `en.json`, `pl.json`, `de.json`). Keys use descriptive dot-notation. `en` and `pl` are mandatory; additional files can be added independently.
- **`ResolvedLocale`**: Internal object holding resolved `language`, `numberFormat`, and `timeZone` after applying the cascade. Consumed by all rendering and formatting logic.
- **`localize(key, variables?, languageOverride?)`**: Function in `src/card/localize.ts` returning the translated string with optional variable interpolation and `en` fallback.
- **HA IANA time zone**: `hass.config.time_zone` — the canonical time zone used for all calendar and datetime operations across the card.

---

## Success Criteria

- **SC-905-1**: On a Polish-locale HA instance, 100% of visible card labels appear in Polish without any YAML configuration.
- **SC-905-2**: On an English-locale HA instance, 100% of visible card labels appear in English without any YAML configuration.
- **SC-905-3**: When the active language has no translation for a key, the card displays the English fallback in 100% of such cases — no blank or `undefined` text is ever shown.
- **SC-905-4**: Adding a new language to `src/translations/` requires zero changes outside that file — verified by a diff showing only dictionary file modifications.
- **SC-905-5**: Changing HA language in Settings while the card is displayed causes all labels and formatted values to update on the next Lit render cycle without a page reload.

---

## Assumptions

- `hass.locale` and `hass.config.time_zone` are available on the `hass` object at render time in all supported HA versions.
- Bundling month/weekday name dictionaries for the chart axis is explicitly NOT part of this domain; domain 902 uses `Intl.DateTimeFormat` for those.
- `number_format` values match the HA enum exactly (`comma`, `decimal`, `language`, `system`); no additional values are supported.
- The card uses Luxon for date/time arithmetic internally; Luxon's `setLocale` / `toLocaleString` follows the resolved `ResolvedLocale.language` for formatted output.
- Documentation changes (README, wiki, changelog) for localization options are covered by domain `907-docs-product-knowledge`.
