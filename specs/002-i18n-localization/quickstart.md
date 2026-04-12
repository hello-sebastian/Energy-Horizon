# Quickstart: Adding or Modifying Translations

**Feature**: `002-i18n-localization`  
**Audience**: Translation contributors and card developers

---

## Rule: No user-visible strings outside translation files

**No user-visible text may appear in source code.** All strings shown to the user must come from `src/translations/*.json` and be accessed via `localize(key)` (or `localize(key, vars)` for templates). This keeps the card translatable and prevents regressions. When adding new UI copy, add a key to `en.json` (and other language files) and use `localize("your.key")` in the code.

---

## How translations work

All user-visible text lives in `src/translations/<lang>.json`.  
The card reads `hass.locale.language` to pick the right file, falling back to `en` if a key is missing.

---

## Translate the card into a new language

The card loads all JSON files from `src/translations/` at build time. To add a new language:

1. Copy `src/translations/en.json` to `src/translations/<lang>.json` (use a BCP 47 code, e.g., `de`, `fr`, `es`).
2. Translate every value. Do **not** change keys.
3. Preserve `{{variable}}` placeholders exactly as they appear – only the surrounding text changes.
4. Build the card to verify: `npm run build`.
5. Test by adding `language: <lang>` to the card YAML in HA.

**No code changes are required.** The card discovers the new file automatically via `src/card/localize.ts`; `createLocalize(language)` uses any `src/translations/<language>.json` present in the project. If a key is missing in the new file, the card falls back to the English string from `en.json`.

---

## Override language and number format for a single card

Card YAML keys `language` and `number_format` override the global Home Assistant locale for that card only. Priority: **card config (YAML) → `hass.locale` → safe defaults** (`language` → `"en"`, `number_format` → `"system"`).

Invalid or unsupported values fall back to those defaults. With `debug: true`, the card logs a console warning when a fallback is used.

### Override language

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: month_over_year
language: pl          # override: show this card in Polish
```

Use a language code that has a translation file in `src/translations/` (e.g. `en`, `pl`). Unsupported values fall back to English.

### Override number formatting

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_consumption_total
comparison_mode: month_over_year
number_format: comma  # override: use decimal comma (e.g. 1 234,5)
```

Valid values for `number_format`: `comma`, `decimal`, `language`, `system` (same as HA settings). Invalid values fall back to `system`.

---

## Add a new translation key (developer workflow)

1. Add the key to `src/translations/en.json` first (English is always the reference).
2. Add the same key to `src/translations/pl.json` (and any other language files).
3. In the rendering code, call `localize()` with the new key and an inline comment:

```typescript
// Displays the section title above the chart
localize("chart.section_title")
```

4. For dynamic strings with variables, use `{{variableName}}` (camelCase) in the JSON value and pass the variable at call time. Prefer **one complete sentence per key** — do not split a phrase into `*_before` / `*_after` keys around a variable.

```typescript
// Example: consumption summary (values are pre-formatted strings)
localize("text_summary.higher", {
  deltaUnit: "12 kWh",
  deltaPercent: "5.2%"
})
```

---

## Debug missing translations

Enable debug mode in the card YAML:

```yaml
debug: true
```

If a translation key is missing from both the active language and English, the card will:
- Show a configuration error message in the UI.
- Log to the browser console (F12): `[Energy Horizon] Missing translation key: "<key>" (language: "<lang>")`.

---

## File locations at a glance

| File | Purpose |
|------|---------|
| `src/translations/en.json` | English dictionary (reference, all keys required) |
| `src/translations/pl.json` | Polish dictionary |
| `src/translations/de.json` | German dictionary (sample; add more `<lang>.json` as needed) |
| `src/card/localize.ts` | `createLocalize()` factory, `resolveLocale()` helper; loads all `src/translations/*.json` at build time |
| `src/card/cumulative-comparison-chart.ts` | Calls `resolveLocale()` and `createLocalize()` on each render |
