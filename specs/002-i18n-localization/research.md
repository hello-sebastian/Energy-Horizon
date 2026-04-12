# Research: i18n / l10n – Energy Horizon Card

**Feature**: `002-i18n-localization`  
**Date**: 2026-03-10

---

## 1. Locale data available in `hass`

**Decision**: Read `hass.locale.language`, `hass.locale.number_format`, and `hass.config.time_zone`.

**Findings**:
- The HA frontend exposes `hass.locale` as an object with at minimum `{ language: string; number_format: NumberFormat; time_zone: string }`.
- `NumberFormat` is a HA-defined enum: `"comma" | "decimal" | "language" | "system"`.
- `hass.config.time_zone` is the authoritative IANA time zone string set in HA configuration.
- The existing `src/ha-types.ts` only models `hass.locale.language`; it must be extended to include `number_format` and `hass.config.time_zone`.

**Rationale**: Using HA-native objects avoids any extra API calls and guarantees that the card inherits the user's dashboard preference automatically.

**Alternatives considered**: Reading `navigator.language` – rejected because it reflects the OS/browser locale, not the HA user preference.

---

## 2. Variable interpolation syntax in JSON translations

**Decision**: Use double-brace Mustache-style syntax: `{{variableName}}`.

**Findings**:
- Mustache (`{{var}}`) is the de-facto standard in i18n libraries (vue-i18n, i18next, Home Assistant's own frontend).
- It is unambiguous in JSON strings and requires a trivially simple regex replacement.
- No third-party library is needed: `str.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? k)` is sufficient.

**Rationale**: Keeps the implementation dependency-free (Constitution §5: prefer simple solutions; §extra: avoid unjustified NPM dependencies), while being immediately readable to translators.

**Alternatives considered**:
- `%{var}` (Ruby/Rails style) – less familiar to JS/TS developers.
- `{var}` (single brace) – conflicts with JSON template contexts and is error-prone.
- Full i18next library – introduces a heavy dependency for a feature achievable in ~30 lines.

---

## 3. Dictionary file structure

**Decision**: One JSON file per language in `src/translations/` (e.g., `src/translations/en.json`, `src/translations/pl.json`), imported statically at build time.

**Findings**:
- Vite (the project bundler) bundles statically imported JSON files into the output `.js` as part of the module graph.
- Since the card is a single-file Lovelace resource, all translations must be bundled into `dist/energy-horizon-card.js`.
- Dynamic `import()` or `fetch()` for JSON files would require network access after card load, which is unreliable in all HA deployment scenarios (local, container, HACS).
- Static imports mean the bundle size grows by approximately 1–5 KB per language – acceptable given there are only ~25 translation keys currently.

**Rationale**: Simplest approach that works in all HA environments without additional configuration.

**Alternatives considered**:
- Single multi-language `.ts` file – works, but forces contributors to edit the same file for all languages (merge conflicts).
- Dynamic `fetch()` – rejected due to deployment complexity and offline/localhost HA setups.

---

## 4. `number_format` YAML override – mapping to `Intl.NumberFormat`

**Decision**: Map HA enum values to `Intl.NumberFormat` locale strings:

| HA value   | `Intl.NumberFormat` locale argument |
|------------|-------------------------------------|
| `comma`    | `"de"` (representative locale using decimal comma) |
| `decimal`  | `"en"` (representative locale using decimal point) |
| `language` | Active language code (e.g., `"pl"`) |
| `system`   | `navigator.language` |

**Findings**:
- `Intl.NumberFormat` accepts a BCP 47 locale string, not a separator character directly.
- Using `"de"` for `comma` and `"en"` for `decimal` replicates what the HA frontend itself does internally.
- The `language` value defers to whichever language is active (from YAML override or `hass.locale`).

**Rationale**: Consistent with HA's own behavior; no custom number-formatting logic required.

---

## 5. Architecture of `localize()` function and dependency flow

**Decision**: `localize()` is a pure function created by a factory that binds the active language. It is instantiated once per render in `cumulative-comparison-chart.ts` and passed (or called directly) wherever needed.

**Key architectural change**: `computeTextSummary` in `ha-api.ts` currently produces hardcoded Polish heading strings. To keep logic code free of UI strings:
- `computeTextSummary` is refactored to return only `{ trend: Trend; diffValue?: number; unit: string }` (no `heading` string).
- The component (`cumulative-comparison-chart.ts`) builds the summary line from keys `text_summary.higher` / `text_summary.lower` (and `*_mom` for month-over-month), each a **single sentence** with `{{deltaUnit}}` and `{{deltaPercent}}`. It uses `getRawTemplate` and `textSummaryNarrativeWithEmphasis()` so those segments keep `ebc-comment-emphasis` styling.
- `TextSummary.heading` is removed from the type; the component computes it at render time.

**Rationale**: Logic modules should remain free of UI strings (Constitution §III; feature FR-010). This also makes `ha-api.ts` fully testable without locale concerns.

**Alternatives considered**:
- Pass a `localize` function into `computeTextSummary` – keeps the interface intact but violates the principle that logic should not depend on presentation utilities.
- Keep heading in `ha-api.ts` and just externalize strings – still couples logic to string keys, which is confusing.

---

## 6. Hardcoded strings inventory (current codebase)

All strings to be migrated to the dictionary:

| File | Current string | Proposed key |
|------|----------------|--------------|
| `cumulative-comparison-chart.ts` | `"Bieżący okres"` (period label) | `period.current` |
| `cumulative-comparison-chart.ts` | `"Okres referencyjny"` | `period.reference` |
| `cumulative-comparison-chart.ts` | `"Ładowanie danych statystyk długoterminowych..."` | `status.loading` |
| `cumulative-comparison-chart.ts` | `"Nie udało się pobrać danych statystyk długoterminowych."` | `status.error_api` |
| `cumulative-comparison-chart.ts` | `"Wystąpił błąd podczas wczytywania danych."` | `status.error_generic` |
| `cumulative-comparison-chart.ts` | `"Brak danych do wyświetlenia dla wybranego okresu."` | `status.no_data` |
| `cumulative-comparison-chart.ts` | `"Bieżący okres"` (summary label) | `summary.current_period` |
| `cumulative-comparison-chart.ts` | `"Okres referencyjny"` (summary label) | `summary.reference_period` |
| `cumulative-comparison-chart.ts` | `"Różnica"` | `summary.difference` |
| `cumulative-comparison-chart.ts` | `"Różnica [%]"` | `summary.difference_percent` |
| `cumulative-comparison-chart.ts` | `"Dane referencyjne dla tego dnia są niepełne…"` | `summary.incomplete_reference` |
| `cumulative-comparison-chart.ts` | `"Prognoza bieżącego okresu"` | `forecast.current_forecast` |
| `cumulative-comparison-chart.ts` | `"Zużycie w okresie referencyjnym"` | `forecast.reference_consumption` |
| `cumulative-comparison-chart.ts` | `"Wartość historyczna"` | `forecast.historical_value` |
| `cumulative-comparison-chart.ts` | `"Poziom pewności prognozy: ${confidence}."` | `forecast.confidence` (with `{{confidence}}`) |
| `ha-api.ts` | `"Bieżący okres"` (periodLabel arg) | `period.current` |
| `ha-api.ts` | `"Brak wystarczających danych…"` | `text_summary.no_reference` |
| `ha-api.ts` | `"Twoje zużycie jest na podobnym poziomie…"` | `text_summary.similar` |
| `ha-api.ts` | `"Twoje zużycie jest o ${diffText} wyższe…"` | `text_summary.higher` (with `{{deltaUnit}}`, `{{deltaPercent}}`; MoM: `text_summary.higher_mom`) |
| `ha-api.ts` | `"Twoje zużycie jest o ${diffText} niższe…"` | `text_summary.lower` (same placeholders; MoM: `text_summary.lower_mom`) |
| `chart-renderer.ts` | `"Bieżący okres"` (dataset label) | `period.current` |
| `chart-renderer.ts` | `"Okres referencyjny"` (dataset label) | `period.reference` |

**Additional key needed** (for FR-008a error state):
| Key | Description |
|-----|-------------|
| `error.missing_translation` | Shown in card UI when a key is missing from both languages |
