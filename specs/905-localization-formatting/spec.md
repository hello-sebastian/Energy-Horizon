# 905-localization-formatting
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Localization & Formatting  
**Replaces**: `002-i18n-localization`  
**Primary code**: `src/card/localize.ts`, `src/translations/`  
**Last updated**: 2026-11-22  

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

- Separate JSON file per language in `src/translations/` (e.g., `en.json`, `pl.json`, `de.json`, `fr.json`, `nl.json`).
- Keys use descriptive dot-notation (e.g., `"card.summary.no_data"`).
- Mandatory languages: `en` and `pl`. German (`de`), French (`fr`), and Dutch (`nl`) are present.
- Fallback chain: active language → `en`. If a key is missing from both, the card enters an error state (rendering blocked, error message shown in UI; key and language logged to console when `debug: true`).

### Forecast confidence level labels

The forecast panel displays the confidence level (`low` / `medium` / `high` from `ForecastStats`) through per-language label keys `forecast.confidence.low`, `forecast.confidence.medium`, and `forecast.confidence.high`. The rendering layer resolves the level key for the active language before interpolating it into the `forecast.confidence` sentence template, so the displayed level is always localized (e.g. German `niedrig` / `mittel` / `hoch`). The raw enum values remain the internal data model and are never rendered directly.

### Period labels (period header, renderer config, preview indication)

The card's period label — the current-period header, the `periodLabel` field of the renderer config, and the transient time-window preview indication — is produced by exactly one pure function: `formatPeriodLabel(instant, locale, zone)` in `src/card/labels/period-label.ts` (added 2026-11-16, 911/TD-10; FR-905-N). A period starting on **January 1** — evaluated in `zone`, the HA time zone — is labeled with the **year alone** (`"2025"`); any other start is labeled with the **localized long month name plus year** via `Intl.DateTimeFormat` (`"October 2024"`, `"październik 2024"` — Polish month names are lowercase in ICU). No other code path formats the period label.

The chart's tooltip and legend row names (902 FR-902-AE) are produced by a second pure function in the same module: `rowPeriodLabel(window, index, isPreview, locale, zone, localize)`. It returns the concrete `formatPeriodLabel()` name when `isNameablePeriod()` says the window is calendar-nameable, and otherwise a role-aware generic form: `period.current` for the actual current row, `period.generic` for the rolled-back (preview) current row — never "Current period" — and `period.reference` (with a trailing index for context rows) for reference rows.

> **Known quirk (preserved, 911 FR-019):** the January 1 edge check runs in the HA time zone, but the month name is formatted by `Intl.DateTimeFormat` **without** a `timeZone` option — i.e., in the host (browser) zone. This is pre-existing behavior, intentionally preserved for byte-for-byte parity; the two halves only diverge near month boundaries around zone offsets. Correcting it would be a user-visible change outside the scope of the tech-debt program.

### `localize()` function

`localize(key: string, variables?: Record<string, unknown>): string` — returns the translated string with optional variable interpolation (e.g., `localize("summary.higher", { percent: 15 })`). All calls in rendering code use descriptive key names; no raw string literals for UI text exist outside translation files.

### Configuration error copy (`time_window.offset`)

Invalid `time_window.offset` values (domain `900` FR-900-Q / US-900-8) use the **same** existing `localize()` keys / user-visible card error path as other invalid merged `time_window` configuration — **no** new translation keys introduced solely for `offset` (clarified 2026-04-22 in `900-time-model-windows` spec). Stack traces and internal parser labels are not user-facing.

### Interpretation copy (consumption vs production)

User-visible strings that depend on **`interpretation`** (`consumption` \| `production` from card YAML; default consumption) — including **production-specific** narrative lines and **editor** labels for the interpretation control — MUST have parallel keys in **`en`**, **`pl`**, **`de`**, **`fr`**, and **`nl`**. When `interpretation` is omitted, runtime behavior uses **consumption** strings per `903-card-ui-composition`.

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
- `902-chart-rendering-interaction`: resolved locale string and HA time zone for `Intl.DateTimeFormat` axis/tooltip label formatting; the period label consumed by the renderer config comes from `formatPeriodLabel()` in `src/card/labels/period-label.ts` (FR-905-N).
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

- **Translations Dictionary**: Per-language JSON files in `src/translations/` (e.g., `en.json`, `pl.json`, `de.json`, `fr.json`, `nl.json`). Keys use descriptive dot-notation. `en` and `pl` are mandatory; additional files can be added independently.
- **`ResolvedLocale`**: Internal object holding resolved `language`, `numberFormat`, and `timeZone` after applying the cascade. Consumed by all rendering and formatting logic.
- **`localize(key, variables?, languageOverride?)`**: Function in `src/card/localize.ts` returning the translated string with optional variable interpolation and `en` fallback.
- **`formatPeriodLabel()`**: Pure period-label function in `src/card/labels/period-label.ts` (911/TD-10, FR-905-N): Jan 1 (in the HA time zone) → year only; otherwise localized long month + year.
- **`isNameablePeriod()`**: Pure calendar-nameability predicate in `src/card/labels/period-label.ts` (FR-905-O): full calendar year or full calendar month → nameable (any role); actual current series starting in January or on the first day of a month → nameable.
- **`rowPeriodLabel()`**: Pure row-label function in `src/card/labels/period-label.ts` (FR-905-P): calendar-nameable windows → the concrete `formatPeriodLabel()` name; otherwise the role-aware generic i18n form (`period.current`, `period.generic` for the preview current row, `period.reference` / `period.reference (n)`).
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

---

## Narrative Key Schema (Amendment — v1.1.0)

> **Required by `903-card-ui-composition` Narrative Engine Refactor.** Replaces flat `text_summary.*_mom` / `text_summary.*` keys with a three-layer hierarchy.

### Key structure

```
text_summary.{entityKind}.{trend}   ← full sentences; supports {{referencePeriod}} variable
text_summary.period.{stepKind}       ← period phrases placed after a comparative; 0 variables
text_summary.no_reference            ← shared; no reference data available
text_summary.insufficient_data       ← shared; no reliable comparison percent (FR-903-W path)
```

| Dimension | Values |
|---|---|
| `entityKind` | `consumption`, `production`, `generic` |
| `trend` | `higher`, `lower`, `similar`, `neutral_band` (percent-band neutral; same fallback chain) |
| `stepKind` | `day`, `week`, `month`, `year`, `reference` |

### Mandatory keys (every language file)

Every language JSON in `src/translations/` MUST contain:

- `text_summary.generic.higher`
- `text_summary.generic.lower`
- `text_summary.generic.similar`
- `text_summary.generic.neutral_band`
- `text_summary.period.day`
- `text_summary.period.week`
- `text_summary.period.month`
- `text_summary.period.year`
- `text_summary.period.reference`
- `text_summary.no_reference`
- `text_summary.insufficient_data`

`consumption.*` and `production.*` are optional per language; the fallback chain (see FR-905-K) handles their absence.

### Fallback chain

```
text_summary.{entityKind}.{trend}
    ↓ key absent
text_summary.generic.{trend}
    ↓ key absent (must not occur — generic is mandatory)
error state per FR-905-F
```

### Migration from flat keys

Keys removed: `text_summary.*_mom`, `text_summary.higher`, `text_summary.lower`, `text_summary.similar` (flat, non-entity-kind forms). All are superseded by the three-layer structure. Full before/after mapping is documented in `specs/903-card-ui-composition/data-model.md`.

### Grammar context

`text_summary.period.{stepKind}` phrases are placed **after a comparative** in the rendered sentence (e.g. "higher than **in the previous month**"). Translators MUST produce phrases that are grammatically correct in this position, with correct case and prepositions for the target language. This positional contract MUST be documented in a `CONTEXT.md` file in `src/translations/` or as inline comments in each JSON file.

### New functional requirements

- **FR-905-J (Three-layer narrative key schema)**: All language JSON files MUST implement the `text_summary` key hierarchy defined above. Keys matching `text_summary.*_mom` MUST be removed.

- **FR-905-K (Entity-kind fallback chain)**: The `localize()` system MUST support key-existence checking (`hasTranslationKey()` or equivalent guard in `getRawTemplate`) so the caller at the narrative rendering layer can attempt `text_summary.{entityKind}.{trend}` before falling back to `text_summary.generic.{trend}` without triggering an error state on the first attempt.

- **FR-905-L (Mandatory key validation)**: An automated test or build-time check MUST assert that the 11 mandatory keys listed above are present in every language JSON file at `npm test` time. The same check MUST assert that the three forecast confidence level keys (`forecast.confidence.low`, `forecast.confidence.medium`, `forecast.confidence.high`) are present in every language JSON file.

- **FR-905-M (Grammar context documentation)**: A `CONTEXT.md` file MUST exist in `src/translations/` (or equivalent inline JSON comments) documenting the positional context for `text_summary.period.*` phrases before any new language file is merged.

- **FR-905-N (Single source for the period label)**: The period label MUST be produced by exactly one pure function — `formatPeriodLabel(instant: Date, locale: string, zone: string): string` in `src/card/labels/period-label.ts` — and no other code path may format it (satisfied 2026-11-16, 911/TD-10: the duplicated inline implementations in the card element were removed). The function MUST label a period starting on January 1 (evaluated in `zone`) with the year alone, and any other start with the localized long month name plus year. It MUST be unit-tested for the January 1 edge, December 31, non-UTC zones, and all five card languages (`en`, `pl`, `de`, `fr`, `nl`).

- **FR-905-O (Calendar-nameability predicate)**: The decision of whether a comparison window is calendar-nameable MUST be made by exactly one pure function — `isNameablePeriod(start: Date, end: Date, role: WindowRole, zone: string): boolean` in `src/card/labels/period-label.ts`. A window is nameable when (evaluated in `zone`, the HA time zone, with the window end treated as an exclusive upper bound): it covers a full calendar year (starts January 1 and ends at the year's end), or it covers a full calendar month (starts on the 1st and ends at the month's end), or it is the actual current series and its start falls in January or on the first day of a month. The full-unit rules apply to any window role; the start-position rule applies only to the current role. The predicate MUST be unit-tested for full year, full month, partial window, window role, and non-UTC zones.

- **FR-905-P (Role-aware row labels)**: The row names shown in the chart's tooltip and legend MUST be produced by exactly one pure function — `rowPeriodLabel(window, index, isPreview, locale, zone, localize)` in `src/card/labels/period-label.ts` — which returns the concrete `formatPeriodLabel()` name for calendar-nameable windows (FR-905-O) and otherwise the generic i18n form: `period.current` for the non-preview current row, `period.generic` for the preview (rolled-back) current row, `period.reference` for the reference row, and `period.reference` plus the row index for context rows. The key `period.generic` (en "Period", pl "Okres", de "Zeitraum", fr "Période", nl "Periode") MUST be present in every language JSON file, asserted at `npm test` time like the other mandatory keys. A rolled-back (preview) window MUST NEVER be labeled with the `period.current` string.
