# Research: 007-gui-editor-full-coverage

**Branch**: `007-gui-editor-full-coverage` | **Date**: 2026-09-30

All items below were resolved against the current codebase (`src/card/`, `src/translations/`, `README*.md`, `wiki-publish/`) and the base domain `005-gui-editor` artifacts. No NEEDS CLARIFICATION items remain.

---

## R-001: Sectioning & progressive disclosure mechanism

**Decision**: One `<ha-form>` per section; advanced sections wrapped in HA-native `<ha-expansion-panel>` (accordion), collapsed by default. Basic sections (entity/title/comparison, header, forecast) always visible. Open-state is component-local (`@state` set of section ids), reset in `setConfig()`.

**Rationale**:
- `ha-expansion-panel` is a standard HA frontend element (used by HA's own config UIs) — Constitution I (native components) and IV (look & feel, accessibility).
- One form per section keeps the 005 merge guarantee trivially: each form's `value-changed` carries only its own fields; shallow-merge into the full `_config` never drops keys (SC-002).
- A single giant `ha-form` cannot express collapsible groups (no `group`/`collapsible` schema support in the `HaFormSchema` surface we type), so per-section forms are the cleanest fit.

**Alternatives considered**:
- Native `<details>`/`<summary>` — rejected: not HA look & feel, weaker a11y semantics than `ha-expansion-panel`.
- Single `ha-form` with all 32 fields — rejected: no progressive disclosure (FR-018), overwhelming side panel.
- Custom accordion component — rejected: reimplementing HA UI violates Constitution I.
- Graceful degradation: if `ha-expansion-panel` is not defined at runtime (very old HA), render the section content without the wrapper (always visible) — no crash.

---

## R-002: Nested `time_window` representation in the form

**Decision**: Flat form fields with a `time_window_` prefix (`time_window_anchor`, `time_window_offset`, `time_window_duration`, `time_window_step`, `time_window_count`, `time_window_aggregation`), mapped into `CardConfig.time_window` by a pure helper. `undefined`/empty-string values are **omitted** from the emitted `time_window` object so the preset template (`getPresetTemplate`) fills them in.

**Rationale**:
- `ha-form` data is a flat object; nested objects are not part of the typed `HaFormSchema` surface. Flat prefixed names are unambiguous and unit-testable.
- Omitting empty values preserves the card's deep-merge semantics (`mergeTimeWindowConfig`): a user who clears `duration` gets the preset default back, not an invalid empty string.
- Spec FR-004 explicitly requires separate controls for all six sub-fields.

**Alternatives considered**:
- Raw YAML textarea for `time_window` — rejected by spec (Clarifications: "nie jako surowy YAML").
- Single `text` field with `anchor|duration|step|count` syntax — rejected: less discoverable, harder to validate per-field.

---

## R-003: "auto" as a UI option, not a stored value

**Decision**: `aggregation` and `language` selects include a leading `auto` option. On change: `auto` → field set to `undefined` (key omitted from emitted config); concrete values stored literally. Prefill: `undefined`/missing → select shows `auto`.

**Rationale**:
- Spec FR-004/FR-007: `auto` is a UI concept; the card applies `pickAutoAggregation(duration)` / HA global language when the key is absent. Storing the literal string `"auto"` would break the card (not a valid `WindowAggregation` / dictionary key).
- Omitting the key (not writing `aggregation: auto`) keeps saved YAML clean and matches the card's normalization.

**Alternatives considered**:
- Storing `"auto"` and normalizing in the editor's emit — rejected: the card does not accept `"auto"` for `aggregation`; would require card changes outside this feature's scope.
- No `auto` option (empty selection) — rejected: spec explicitly wants `auto` as the visible default.

---

## R-004: Validation reuse (no duplication)

**Decision**: The editor imports and calls the card's existing validators:
- `buildMergedTimeWindowConfig(config)` + `validateMergedTimeWindowConfig(merged)` from `./time-windows` (domain `001-time-windows-engine`) — validates the **merged** window (preset + user overrides), exactly like the card's `setConfig`.
- `validateXAxisFormat(pattern)` from `./axis` — for both `x_axis_format` and `tooltip_format` (the card uses the same validator for both).

Inline errors are shown under the offending field (localized via existing `status.*` keys where the validator returns an i18n key; Luxon validator throws English messages — surfaced as-is, acceptable for a power-user field). `config-changed` is **always** emitted regardless of validation outcome (005 pattern; FR-014).

**Rationale**:
- FR-014: "Walidacja MUSI wielokrotnie używać istniejących funkcji walidacyjnych karty … a nie duplikować ich logiki".
- Validating the **merged** config (not raw `time_window` fields) matches the card's actual behavior: a partial override that is invalid only after preset merge must produce the same error the card would show.

**Alternatives considered**:
- Re-implementing duration/step parsing in the editor — rejected (duplication, drift risk).
- Blocking `config-changed` on invalid values — rejected (violates 005 domain pattern and spec Clarifications).

---

## R-005: `primary_color` control type

**Decision**: `text` field (free-form string), not a color picker.

**Rationale**:
- FR-006 allows "dobieracz koloru / pole tekstowe". The card accepts hex, CSS `var(--accent-color)`, and aliases (`ha-accent`, `ha-primary-accent`, `ha-primary`) — a hex-only color picker would coerce or lose those values on save (SC-002 data-loss risk).
- Text field preserves any user value verbatim; the card's `resolveSeriesCurrentColor` already handles invalid/unresolved values gracefully.

**Alternatives considered**:
- `color` selector — rejected: hex-only round-trip breaks `var(...)`/alias configs.
- `select` of known aliases + free text — rejected: over-engineered; text covers all cases.

---

## R-006: `HaFormSchema` type extension

**Decision**: Extend the `HaFormSchema` union in `src/ha-types.ts` with three HA-native selector variants:
- `number` — `{ number: { min?: number; max?: number; step?: number; mode?: "box" | "slider" } }` (used by `period_offset`, `precision`, `fill_*_opacity`, `time_window_count`).
- `color` — `{ color: { markup?: boolean } }` (reserved; not used by current fields but keeps the union honest for future use — optional, may be omitted if unused).
- `icon` — `{ icon: { placeholder?: string } }` (used by `icon`).

**Rationale**:
- 005 pattern (R-007): minimal strict-mode-safe union, no external type package.
- All three selectors exist in the HA frontend (`ha-selector-number`, `ha-selector-icon`); typing them avoids `any` (Constitution III).

**Alternatives considered**:
- `any`-typed schema — rejected (strict mode, Constitution III).
- Importing HA's own types — rejected: not available as an npm dependency (Constitution: no new deps).

---

## R-007: `language` select options source

**Decision**: Options derived from `SUPPORTED_LANGUAGES` — a new exported constant in `src/card/localize.ts` listing the loaded dictionary keys (en, pl, de, fr), plus a leading `auto` option.

**Rationale**:
- `localize.ts` already builds `DICTIONARIES` from `import.meta.glob("../translations/*.json")` — the dictionary keys are the single source of truth for supported languages. Exporting them prevents drift between the editor's options and the card's `resolveLocale` fallback logic.
- Spec FR-007: list of available dictionaries + "auto".

**Alternatives considered**:
- Hardcoded `["en","pl","de","fr"]` in the editor — rejected: adding a 5th language file would silently not appear in the editor.

---

## R-008: Default prefill for unset fields

**Decision**: `_formData()`-style per-section mappers apply the card's effective defaults when a field is unset, so controls always show a meaningful value:

| Field | Prefill when unset |
|---|---|
| `show_title` / `show_icon` / `show_forecast` / `fill_current` / `connect_nulls` | `true` (card: `!== false` semantics) |
| `show_legend` / `fill_reference` / `debug` | `false` |
| `show_comparison_summary` / `show_forecast_total_panel` / `show_narrative_comment` | `true` (existing 005 behavior) |
| `precision` | `2` |
| `fill_current_opacity` / `fill_reference_opacity` | `30` (`clampOpacity` default) |
| `aggregation` | `auto` (→ `undefined`) |
| `language` | `auto` (→ `undefined`) |
| `number_format` | `system` (card falls back to HA/system) |
| `time_window.*` | values from `getPresetTemplate(comparison_preset, period_offset)` (the merged template the card actually uses); fields the user never overrode show preset values but are emitted as `undefined` (omitted) unless changed |

**Rationale**:
- FR-011: unset fields MUST show card defaults.
- For `time_window`, showing the preset template values (via `getPresetTemplate`) matches what the card renders; emitting `undefined` for untouched sub-fields keeps the saved YAML minimal (deep-merge fills them).
- Boolean "default on" fields (`!== false` semantics): the checkbox shows checked; unchecking writes explicit `false` (the card's only off-switch).

**Alternatives considered**:
- Showing empty controls for unset fields — rejected (FR-011 explicitly requires defaults).
- Writing explicit defaults into `_config` on open — rejected: would pollute saved YAML with keys the user never set (SC-002 diff cleanliness).

---

## R-009: Translation key structure

**Decision**: Extend the existing `editor.*` namespace (already present in all 4 dictionaries from 005) with:
- Field labels: `editor.show_title`, `editor.icon`, `editor.show_icon`, `editor.aggregation`, `editor.period_offset`, `editor.time_window` (section), `editor.time_window_anchor/offset/duration/step/count/aggregation`, `editor.show_forecast`, `editor.fill_current`, `editor.fill_reference`, `editor.fill_current_opacity`, `editor.fill_reference_opacity`, `editor.primary_color`, `editor.connect_nulls`, `editor.show_legend`, `editor.language`, `editor.number_format`, `editor.precision`, `editor.x_axis_format`, `editor.tooltip_format`, `editor.debug`.
- Section titles: `editor.section.header`, `editor.section.comparison`, `editor.section.time_window`, `editor.section.forecast`, `editor.section.chart_style`, `editor.section.localization`, `editor.section.date_formats`, `editor.section.diagnostics`.
- Option texts: `editor.aggregation.auto/hour/day/week/month`, `editor.number_format.comma/decimal/language/system`, `editor.language.auto/en/pl/de/fr`, `editor.anchor.*` (6 anchors).
- Validation errors: `editor.error.time_window`, `editor.error.format` (inline messages; Luxon validator's English message may be appended).

All keys added to **en, pl, de, fr** (FR-012). `computeLabel` maps `schema.name` → `editor.<name>`; option labels are resolved via `createLocalize` at schema-build time (005 pattern: labels embedded in schema, translated at build). Missing key → `createLocalize` falls back to English (existing `localize.ts` behavior) — never a raw key (SC-003).

**Rationale**:
- Keeps the 005 `computeLabel` contract intact (FR-002) while covering ~30 new labels + option texts.
- Cross-domain note: `src/translations/` is owned by `002-i18n-localization`; this feature is a consumer adding keys (spec FR-012).

**Alternatives considered**:
- HA's `hass.localize` pipeline — rejected (005 Clarifications: card's own dictionaries are the source of truth).

---

## R-010: Documentation placement

**Decision**:
- `README.md`: **new** "Visual editor" section (none exists today — 005's FR-010 was never landed in README; this feature fixes that drift) listing all fields grouped by section, with a pointer to `README.advanced.md` and the wiki.
- `README.advanced.md`: rewrite the "Lovelace editor" section as the full table: field → control type → default → short description (FR-016).
- `wiki-publish/Configuration-and-Customization.md`: new "Visual editor coverage" subsection with the full table (field → control → default → notes) (FR-017). No new wiki page (Diátaxis: avoid duplicate Reference).
- `wiki-publish/Documentation-Maintenance.md`: add `005-gui-editor` / `007-gui-editor-full-coverage` to **Spec anchors**; add drift-check item: "scan `src/card/energy-horizon-card-editor.ts` → update the editor table in `Configuration-and-Customization.md`".

**Rationale**:
- Spec FR-015…FR-017; Constitution III (functional changes require doc updates).
- The wiki page already carries per-section YAML tables; the editor table slots in as a subsection without restructuring.

**Alternatives considered**:
- New wiki page "GUI Editor" — rejected by spec (duplicate Reference quadrant, double maintenance).

---

## Resolution Summary

| Item | Status |
|------|--------|
| R-001: Sectioning / accordion | ✅ Resolved (`ha-expansion-panel`, per-section forms) |
| R-002: Nested `time_window` | ✅ Resolved (flat prefixed fields, omit-empty mapping) |
| R-003: `auto` UI option | ✅ Resolved (`auto` → `undefined`) |
| R-004: Validation reuse | ✅ Resolved (import card validators, never block emit) |
| R-005: `primary_color` control | ✅ Resolved (text field) |
| R-006: `HaFormSchema` extension | ✅ Resolved (number, color, icon variants) |
| R-007: `language` options source | ✅ Resolved (`SUPPORTED_LANGUAGES` from `localize.ts`) |
| R-008: Default prefill | ✅ Resolved (card defaults + preset template) |
| R-009: Translation keys | ✅ Resolved (extended `editor.*` in 4 dictionaries) |
| R-010: Documentation placement | ✅ Resolved (README new section, advanced table, wiki subsection + maintenance) |
