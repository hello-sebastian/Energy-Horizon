# Feature Specification: Localization & Internationalization (i18n / l10n)

**Feature Branch**: `002-i18n-localization`  
**Created**: 2026-03-10  
**Status**: Draft  

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Automatic locale from Home Assistant (Priority: P1)

A user opens the Energy Burndown Card on their Home Assistant dashboard. The card automatically reads the language and locale settings from the global HA object (`hass`) and displays all labels, numbers, and dates formatted according to those settings – without any manual configuration in the card YAML.

**Why this priority**: This is the baseline experience for all users. Any user who does not touch the card YAML should still see a correctly localized card. Failing this story means every user must manually configure the language.

**Independent Test**: Configure HA with Polish or English locale. Add the card without any extra YAML keys. Verify that labels appear in the correct language and that numbers/dates match the locale format.

**Acceptance Scenarios**:

1. **Given** HA is configured to `pl` locale, **When** the card renders, **Then** all visible text labels appear in Polish and numbers use Polish formatting (e.g., decimal comma).
2. **Given** HA is configured to `en` locale, **When** the card renders, **Then** all visible text labels appear in English and numbers use English formatting (e.g., decimal point).
3. **Given** HA locale is set to an unsupported language (e.g., `de`), **When** the card renders, **Then** all labels fall back to English (`en`) without any error or blank text.

---

### User Story 2 – YAML config overrides global locale (Priority: P2)

A user wants the Energy Burndown Card to display in Polish even though their HA dashboard language is English (or vice versa). They add `language: pl` (and/or `number_format: comma`) to the card's YAML configuration.

**Why this priority**: Power users often run multi-language households or want one specific card to use a different language from the rest of the dashboard. This override capability is explicitly required.

**Independent Test**: Set HA locale to `en`. Add `language: pl` in card YAML. Verify that the card shows Polish labels while other cards remain in English.

**Acceptance Scenarios**:

1. **Given** HA locale is `en` and card YAML has `language: pl`, **When** the card renders, **Then** labels appear in Polish.
2. **Given** card YAML has `number_format: comma`, **When** numeric values are displayed, **Then** they use decimal comma regardless of the HA global setting.
3. **Given** card YAML has no `language` key, **When** the card renders, **Then** it uses the HA global locale setting.
4. **Given** card YAML has an unrecognized `language` value (e.g., `language: xx`), **When** the card renders, **Then** it falls back to English without error.

---

### User Story 3 – Developer adds a new language (Priority: P3)

A developer wants to add support for a third language (e.g., German). They should be able to do this by editing only the translations dictionary file, without modifying any card rendering logic.

**Why this priority**: Extensibility by the open-source community is a stated goal. This story does not affect end-users directly, but enables the long-term growth of supported languages.

**Independent Test**: Add a new language entry to the dictionary file only. Switch the card to that language. Verify that labels appear in the new language, and that no changes were made to card rendering code.

**Acceptance Scenarios**:

1. **Given** a new language key has been added to the dictionary file, **When** card YAML specifies that language, **Then** labels appear in the new language without any code changes outside the dictionary.
2. **Given** only some keys are translated in the new language, **When** a missing key is requested, **Then** the card falls back to the English value for that key.

---

### User Story 4 – Readable code with localization keys (Priority: P3)

A developer reading the card rendering code can understand which text is displayed at every point without opening the dictionary file. Localization function calls use descriptive key names, and inline comments identify what each key represents.

**Why this priority**: Code maintainability. Without this, adding or debugging labels requires constant cross-referencing of two files.

**Independent Test**: Review the main card rendering file. Every place where a user-visible string was previously hard-coded must now use a `localize(...)` call with a self-describing key and a short inline comment.

**Acceptance Scenarios**:

1. **Given** any localization call in the rendering code, **When** a developer reads it, **Then** the key name alone (e.g., `"card.status.no_data"`) communicates the meaning of the string without needing to look it up.
2. **Given** the rendering code, **When** a developer performs a full-text search for user-visible strings, **Then** no raw string literals (that belong in the dictionary) are found outside the dictionary file.

---

### Edge Cases

- What happens when the `hass` object is not yet available (card initializing)? → Labels must not appear blank; use a safe empty/loading state.
- What happens when the dictionary file is missing or corrupted? → The card must not crash; fall back to English hard-coded safety strings.
- What happens when a translation key is absent from both the active language and English? → Card rendering is blocked; a configuration error message is shown in the card UI. If `debug: true`, the missing key and active language are logged to the browser console.
- What happens with date and number formatting when `hass.locale` contains partial information (e.g., language set but no `number_format`)? → Apply per-field fallback: use HA value for available fields, default for missing ones.
- What happens if the `language` YAML key is provided but `number_format` is not? → Language is overridden; `number_format` is taken from HA global.

## Clarifications

### Session 2026-03-10

- Q: Does localization scope include dynamic text with variable substitution, or only static labels? → A: Both static labels and dynamic phrases with variable substitution (e.g., `localize("summary.higher", { percent: 15 })`).
- Q: How should the translations dictionary be structured? → A: Separate JSON file per language in a `translations/` folder (e.g., `translations/pl.json`, `translations/en.json`).
- Q: Should the card react to a locale change while already displayed, without page reload? → A: Yes – the card re-renders automatically whenever `hass.locale` changes.
- Q: What should happen when a translation key is missing from both the active language and English? → A: Block card render, display an error configuration message in the card UI, and – if `debug: true` is set in YAML – log full error details (missing key, active language) to the browser JS console.
- Q: What are the accepted values for the `number_format` YAML override key? → A: The same enum values as HA: `comma`, `decimal`, `language`, `system`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The card MUST automatically read the active language from the `hass` object and apply it to all user-visible text labels when no override is present in YAML.
- **FR-002**: The card MUST automatically read number formatting preferences (decimal separator, thousands separator) from the `hass` locale object and apply them to all numeric values.
- **FR-003**: The card MUST automatically read the time zone from the `hass` object and use it for date/time display and period calculations.
- **FR-003a**: The card MUST re-render automatically whenever `hass.locale` changes (e.g., when the user changes the HA language in Settings), without requiring a page reload. All labels and formatted values must reflect the new locale on the very next render cycle.
- **FR-004**: The card MUST support an optional `language` key in YAML configuration that, when present, overrides the HA global language for this card only.
- **FR-005**: The card MUST support an optional `number_format` key in YAML configuration that, when present, overrides the HA global number formatting for this card only. Accepted values mirror the HA `number_format` enum: `comma` (decimal comma), `decimal` (decimal point), `language` (derived from active language), `system` (browser/OS default). Any other value MUST be treated as a configuration error (same error state as FR-008a).
- **FR-006**: All user-visible text strings – both static labels (e.g., section titles, error messages) and dynamic phrases containing runtime values (e.g., percentage difference, period names) – MUST be stored in a dedicated translations dictionary, not inline in rendering code. Dynamic strings MUST support variable interpolation (e.g., `localize("summary.higher", { percent: 15 })`) so that word order can differ between languages.
- **FR-007**: The dictionary MUST include complete translations for Polish (`pl`) and English (`en`) as the two mandatory supported languages.
- **FR-008**: The card MUST implement an `en` fallback: if a translation key is missing in the active language, the English value MUST be used instead.
- **FR-008a**: If a translation key is missing from both the active language **and** the English fallback, the card MUST enter an error state: card rendering is blocked and a configuration error message is displayed in the card UI. If `debug: true` is set in YAML, the card MUST additionally log the missing key name and active language code to the browser JS console.
- **FR-009**: Every call to the localization function in the rendering code MUST use a descriptive key name (e.g., `"card.summary.no_data"`) and MUST be accompanied by a short inline comment stating what string is displayed.
- **FR-010**: Adding a new language MUST require changes only in the dictionary file; no changes to card rendering or logic code are permitted.

### Key Entities

- **Translations Dictionary**: A set of JSON files, one per language, stored in a `translations/` folder (e.g., `translations/pl.json`, `translations/en.json`). Each file is keyed by descriptive dot-notation keys. Files for `pl` and `en` are mandatory; additional language files can be added independently without touching any other file.
- **Locale Settings**: The resolved combination of language, number format, and time zone, derived from: (1) YAML card config overrides, then (2) `hass.locale` global settings, then (3) built-in defaults (`en`, dot decimal, UTC).
- **Localize Function**: A callable available in the rendering code that accepts a key string and optionally a language code, and returns the translated string (with `en` fallback).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a Polish-locale HA instance, 100% of visible card labels appear in Polish without any YAML configuration.
- **SC-002**: On an English-locale HA instance, 100% of visible card labels appear in English without any YAML configuration.
- **SC-003**: When the active language has no translation for a given key, the card displays the English fallback in 100% of such cases – no blank or undefined text is ever shown.
- **SC-004**: Adding a new language to the dictionary file requires zero changes outside that file, verifiable by a diff showing only dictionary file modifications.
- **SC-005**: Every localization call in the rendering code uses a key with a human-readable name; zero raw string literals for UI text remain in the rendering code (verifiable by code review).
- **SC-006**: Overriding `language` or `number_format` via YAML takes effect without a page reload (on next render), and applies only to this card instance.
- **SC-007**: When the HA language is changed in Settings while the card is displayed, the card updates all labels and formatted values on the next render cycle – no page reload required.
