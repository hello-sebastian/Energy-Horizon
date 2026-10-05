# Tasks: Full GUI Editor Coverage

**Input**: Design documents from `/specs/007-gui-editor-full-coverage/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — the feature spec (FR-014, quickstart) and plan (Group C) explicitly request unit tests for the editor's pure mapping/validation helpers.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` and `tests/` at repository root (Vite + Vitest + jsdom).
- **NOTE**: Unit tests live in `tests/unit/` (lowercase, repo root) — NOT `Test/tests/unit/` as written in plan.md/quickstart.md. Use `tests/unit/`.
- Editor source: `src/card/energy-horizon-card-editor.ts`. Types: `src/ha-types.ts`. i18n: `src/card/localize.ts` + `src/translations/{en,pl,de,fr}.json`.
- Validation imports (no new modules): `./time-windows` (`buildMergedTimeWindowConfig`, `validateMergedTimeWindowConfig`, `getPresetTemplate`) and `./axis` (`validateXAxisFormat`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm a green baseline before any change (project already exists; no scaffolding needed).

- [X] T001 Confirm baseline is green: run `npm run test`, `npm run lint`, and `npm run build` from repo root and record results before making changes (no file change) — 2026-09-30: test 319/319 passed (30 files), lint clean, build OK (dist/energy-horizon-card.js 1,059 kB / 280 kB gzip)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type + i18n infrastructure that the editor component (US1) depends on. No runtime behavior change yet.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Extend the `HaFormSchema` union in `src/ha-types.ts` with three HA-native selector variants: `number` (`{ number: { min?: number; max?: number; step?: number; mode?: "box" | "slider" } }`), `color` (`{ color: { markup?: boolean } }`), and `icon` (`{ icon: { placeholder?: string } }`) — all strict-mode safe, no `any`
- [X] T003 [P] Export `SUPPORTED_LANGUAGES: readonly string[]` from `src/card/localize.ts`, derived from the existing `DICTIONARIES` keys (en, pl, de, fr) — single source of truth for the `language` select options
- [X] T004 [P] Add new `editor.*` keys to `src/translations/en.json`: field labels (`show_title`, `icon`, `show_icon`, `aggregation`, `period_offset`, `show_forecast`, `fill_current`, `fill_reference`, `fill_current_opacity`, `fill_reference_opacity`, `primary_color`, `connect_nulls`, `show_legend`, `language`, `number_format`, `precision`, `x_axis_format`, `tooltip_format`, `debug`, `time_window_anchor/offset/duration/step/count/aggregation`), section titles (`section.header/comparison/time_window/forecast/chart_style/localization/date_formats/diagnostics`), option texts (`aggregation.{auto,hour,day,week,month}`, `number_format.{comma,decimal,language,system}`, `language.{auto,en,pl,de,fr}`, `anchor.{start_of_year,start_of_month,start_of_week,start_of_day,start_of_hour,now}`), and errors (`error.time_window`, `error.format`) — keep existing 005 keys intact
- [X] T005 [P] Add the same new `editor.*` keys (translated) to `src/translations/pl.json`
- [X] T006 [P] Add the same new `editor.*` keys (translated) to `src/translations/de.json`
- [X] T007 [P] Add the same new `editor.*` keys (translated) to `src/translations/fr.json`

**Checkpoint**: Foundation ready — `HaFormSchema` extended, `SUPPORTED_LANGUAGES` exported, all 4 dictionaries complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - Configure the card fully visually, no YAML (Priority: P1) 🎯 MVP

**Goal**: Every user-configurable `CardConfig` field (except constant `type` and `forecast` alias) has a visual control, grouped into 8 readable sections with progressive disclosure (advanced sections collapsed by default in `ha-expansion-panel`), correct default prefill, and zero data loss on save.

**Independent Test**: Open the editor on a card with an existing config — every field shows its control with the current value (or card default when unset); basic sections visible, advanced collapsed; changing any field updates the preview; a YAML-only field added in YAML mode survives a Visual edit + save.

### Tests for User Story 1 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T008 [P] [US1] Unit tests in `tests/unit/editor-mapping.test.ts` for the pure mapping helpers: `toForm` defaults (unset booleans → `true`/`false` per card `!== false` semantics; `precision`→2; `fill_*_opacity`→30; `aggregation`/`language`→`"auto"`; `number_format`→`system`), `fromForm` (`"auto"`→`undefined`/key omitted; concrete values stored literally), and unknown-select-value tolerance (form shows `auto`/empty, raw value preserved in emitted config) — 2026-10-01: written in `tests/unit/editor-mapping.test.ts` (blocks: toForm defaults, fromForm, section model); red state confirmed (21 failed / 3 passed — exports missing, as expected pre-implementation)

### Implementation for User Story 1

- [X] T009 [US1] Extract the pure, exported mapping helpers in `src/card/energy-horizon-card-editor.ts`: `sectionToForm(section, config)` and `sectionFromForm(section, data)` (plus per-section `toForm`/`fromForm` closures) so they are unit-testable without instantiating the LitElement
- [X] T010 [US1] Define the `EditorSection` model and the 8 section descriptors (id, labelKey, advanced, schema, toForm, fromForm) in `src/card/energy-horizon-card-editor.ts`: `comparison` (no), `header` (no), `forecast` (no), `time_window` (yes), `chart_style` (yes), `localization` (yes), `date_formats` (yes), `diagnostics` (yes)
- [X] T011 [US1] Implement `toForm` default prefill in `src/card/energy-horizon-card-editor.ts` per research R-008: `show_title`/`show_icon`/`show_forecast`/`fill_current`/`connect_nulls`→`true`; `show_legend`/`fill_reference`/`debug`→`false`; `show_comparison_summary`/`show_forecast_total_panel`/`show_narrative_comment`→`true`; `precision`→2; `fill_*_opacity`→30; `aggregation`/`language`→`"auto"`; `number_format`→`system`; `period_offset`→-1
- [X] T012 [US1] Implement `fromForm` in `src/card/energy-horizon-card-editor.ts`: `"auto"`→`undefined` (key omitted); concrete values stored literally; unknown select value → raw value preserved in `_config` (mapping only affects display, never storage)
- [X] T013 [US1] Add `@state() _openSections: Set<string>` and `@state() _fieldErrors: Record<string, string | null>` to `src/card/energy-horizon-card-editor.ts`; reset both to empty in `setConfig()` (advanced sections start collapsed, no stale errors)
- [X] T014 [US1] Render one `<ha-form>` per section in `src/card/energy-horizon-card-editor.ts` (`.schema`, `.data=section.toForm(_config)`, `.hass`, `.computeLabel`); wrap `advanced` sections in `<ha-expansion-panel>` (`.label`, `.expanded`, `@click` toggle) with a guard that renders the section unwrapped (always visible) if `ha-expansion-panel` is not defined at runtime
- [X] T015 [US1] Wire per-section `value-changed` in `src/card/energy-horizon-card-editor.ts`: `section.fromForm(e.detail.value)` → shallow-merge into `_config` (never drops keys not owned by the section) → re-validate affected fields → `_emitConfigChanged()` (always emitted, never blocked)

**Checkpoint**: US1 fully functional — all 27 fields have controls, progressive disclosure works, defaults visible, no data loss. This is the MVP.

---

## Phase 4: User Story 2 - Configure custom time windows visually (Priority: P2)

**Goal**: The nested `time_window` object is editable via 6 flat `time_window_*` controls with advisory validation that reuses the card's validators (never blocking `config-changed`).

**Independent Test**: In the time window section, set `count: 3` → card renders a third context window; set `duration: "abc"` → inline error under the section + card error state, config still emitted; fix → chart returns.

### Tests for User Story 2 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T016 [P] [US2] Unit tests in `tests/unit/editor-mapping.test.ts` for the `time_window` subform: all-empty sub-fields → `time_window` key omitted entirely (preset applies); partial override → only set sub-fields in the object; validation wiring — invalid `duration` (`"abc"`) → `_fieldErrors.time_window` set while config is still emitted, valid merged window → no error — 2026-10-01: written in `tests/unit/editor-mapping.test.ts` (block: time_window subform); red state confirmed

### Implementation for User Story 2

- [X] T017 [US2] Implement the `time_window` section's 6 flat fields (`time_window_anchor` select of 6 `TimeAnchor` values, `time_window_offset`/`time_window_duration`/`time_window_step` text duration tokens, `time_window_count` number 1–24, `time_window_aggregation` select `auto`/hour/day/week/month) and their mapping into `CardConfig.time_window` in `src/card/energy-horizon-card-editor.ts` (empty → omitted; untouched → `time_window` key omitted so `getPresetTemplate` fills it)
- [X] T018 [US2] Wire time window validation in `src/card/energy-horizon-card-editor.ts`: on any change in the section, call `buildMergedTimeWindowConfig(this._config)` then `validateMergedTimeWindowConfig(merged)` (imported from `./time-windows`); on failure store the localized `status.*` key/message in `_fieldErrors.time_window`; **never block** `_emitConfigChanged()`
- [X] T019 [US2] Wire date-format validation in `src/card/energy-horizon-card-editor.ts`: on `x_axis_format`/`tooltip_format` change, call `validateXAxisFormat(value)` (imported from `./axis`) in a try/catch; on throw store the message in `_fieldErrors` for that field; **never block** `_emitConfigChanged()`

**Checkpoint**: US2 complete — nested time window editable with advisory inline validation; card remains the validation authority.

---

## Phase 5: User Story 3 - Documentation reflects the full editor (Priority: P2)

**Goal**: README, README.advanced, and wiki document the full editor (field → control → default) with no drift against the implementation.

**Independent Test**: README "Visual editor" lists all 27 fields grouped in 8 sections; README.advanced "Lovelace editor" has the full table; wiki `Configuration-and-Customization` has the coverage table and `Documentation-Maintenance` has the Spec anchors + drift-check item; no field described as "YAML-only" that actually has a control (and vice versa).

### Implementation for User Story 3

- [X] T020 [P] [US3] Add a new "Visual editor" section to `README.md` listing all 27 user-configurable fields grouped by the 8 sections, with a pointer to `README.advanced.md` and the wiki — 2026-10-01: added "Visual editor" section (27 fields / 8 sections table) between "Advanced configuration" and "Documentation map"
- [X] T021 [P] [US3] Rewrite the "Lovelace editor" section in `README.advanced.md` as the full table: field → control type → default → short description (must match `data-model.md` §1 exactly) — 2026-10-01: rewrote as full 27-field table (field → control → default → description) + mapping rules; heading kept as "Lovelace editor" per FR-016
- [X] T022 [P] [US3] Add a "Visual editor coverage" subsection to `wiki-publish/Configuration-and-Customization.md` with the full table (field → control → default → notes); do NOT create a new wiki page — 2026-10-01: added "Visual editor coverage" subsection (27-field table) after "Layout sections"; no new page
- [X] T023 [P] [US3] Update `wiki-publish/Documentation-Maintenance.md`: add `005-gui-editor`/`007-gui-editor-full-coverage` to the **Spec anchors** section and add a drift-check item ("scan `src/card/energy-horizon-card-editor.ts` → update the editor table in `Configuration-and-Customization.md`") to the release checklist — 2026-10-01: added both spec anchors + editor drift-check item to release checklist

**Checkpoint**: US3 complete — all four docs consistent with the implemented sections/fields.

---

## Phase 6: User Story 4 - Editor labels localized in all languages (Priority: P3)

**Goal**: Every new field label, section title, and select option text is localized in en/pl/de/fr with English fallback (never a raw key).

**Independent Test**: Set HA UI language to `de`/`fr`, open the editor — all labels and option texts are localized; a deliberately missing key degrades to English, never showing the raw key.

### Tests for User Story 4 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T024 [P] [US4] Unit test in `tests/unit/editor-mapping.test.ts` (or `tests/unit/localize.test.ts`): assert every new `editor.*` key from T004–T007 exists in all four dictionaries (en, pl, de, fr) and that `createLocalize` falls back to English (not the raw key) for a key missing in a non-English language — 2026-10-01: written in `tests/unit/editor-mapping.test.ts` (block: editor i18n); red state confirmed

### Implementation for User Story 4

- [X] T025 [US4] Ensure all select option texts (`aggregation`, `number_format`, `language`, `anchor`) and section titles resolve via `createLocalize` at schema-build time in `src/card/energy-horizon-card-editor.ts` (005 pattern: labels embedded in schema, translated at build), so no raw key is ever rendered

**Checkpoint**: US4 complete — editor fully localized across all 4 languages with safe fallback.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Whole-feature quality gate.

- [X] T026 Run `npm run test` (unit), `npm run lint`, and `npm run build` from repo root; fix any failures introduced by this feature — 2026-10-01: all green (343/343 tests pass, lint clean, build succeeds)
- [ ] T027 [P] Manual HA verification per `quickstart.md`: deploy `dist/` (or `npm run dev`), open the card editor, expand each advanced section, verify values match YAML/defaults, exercise `primary_color`/`aggregation`/`time_window`/`x_axis_format` live updates, confirm YAML-only field preservation (SC-002), and confirm de/fr localization with no raw keys (SC-003) — **requires a human** (live Home Assistant instance); all automated work for this feature is complete

---

## Phase 8: Editor UX Fixes (2026-10-01)

**Purpose**: Fix visual form issues reported after initial 007 implementation — localized option labels, dropdowns, section titles, section collapse bug, and icon UX.

- [X] T028 [P] Add `mode?: "list" | "dropdown"` to the `select` variant of `HaFormSchema` in `src/ha-types.ts` (FR-022)
- [X] T029 [P] Add new `editor.*` keys to all four translation dictionaries: `editor.comparison_preset.{year_over_year,month_over_year,month_over_month}`, `editor.force_prefix.{auto,none,G,M,k,m,u}`, `editor.icon.entity` (FR-021, FR-025)
- [X] T030 Set `mode: "list"` on `aggregation`, `time_window_aggregation`, `number_format`, `force_prefix`, and `icon` selects in `src/card/energy-horizon-card-editor.ts` (FR-022)
- [X] T031 Change `icon` from `ha-selector-icon` to `select` with `mode: "list"`; first option `""` = "Entity icon (auto)"; `toForm`: `icon: config.icon ?? ""`; `fromForm`: `""` → `undefined` (FR-025)
- [X] T032 Add visible `<h3 class="eh-section__title">` to basic sections in `_renderSection` (FR-023)
- [X] T033 Fix `_toggleSection` to ignore clicks originating inside `ha-form` (only header/chevron toggles); add CSS `ha-expansion-panel:not(.expanded) ha-form { display: none }` (FR-024) — **superseded by T037**
- [X] T034 Extend `tests/unit/editor-mapping.test.ts`: icon mapping (`""` ⇔ omitted), force_prefix round-trip, comparison_preset round-trip, `mode: "list"` assertions, i18n key presence for all new keys
- [X] T035 Update speckit artifacts: spec.md (FR-021…FR-025, SC-008, SC-009, Clarifications 2026-10-01), data-model.md (§1, §2, §5, §7), plan.md (D-009…D-012), contracts/lovelace-editor-api.md (§5, invariant 11), research.md (R-011…R-014), tasks.md (this phase)
- [X] T036 Update user documentation: `README.md` (all eight selects → "select (dropdown)"; icon → "select (dropdown, searchable)"), `README.advanced.md` (same + mapping rules), `wiki-publish/Configuration-and-Customization.md` (same), `wiki-publish/Documentation-Maintenance.md` (drift-check precision), `changelog.md` (new Unreleased/1.0.3 section) — 2026-10-03: all five docs updated (commit `880d5f9` + `ec57733`); changelog section is `[Unreleased]` (1.0.3 not yet released)
- [X] T037 Fix `ha-expansion-panel` usage: `.label` → `.header` (the property HA's component actually accepts); remove `@click` handler (panel's internal `#summary` is the sole toggle); add `@expanded-changed` to sync `_openSections`; fix CSS `:not(.expanded)` → `:not([expanded])` (attribute, not class — `reflect: true`). Root cause of "sections not visible" bug.

---

## Phase 9: Dropdowns + Searchable Icon (2026-10-02)

**Purpose**: Fix the radio-button rendering of all eight select fields (root cause: `mode: "list"` renders `<ha-radio-group>` in HA's `ha-selector-select`) and make the icon field a searchable combo box so any MDI icon is reachable.

- [X] T038 Set `mode: "dropdown"` on all eight select fields in `src/card/energy-horizon-card-editor.ts`: `comparison_preset`, `force_prefix`, `icon`, `aggregation`, `time_window_anchor`, `time_window_aggregation`, `language`, `number_format` (FR-022)
- [X] T039 Make `icon` a searchable combo box: `custom_value: true`; first option `auto` = "Entity icon (auto)" (the combo box value handler swallows `""`); `toForm`: `icon: config.icon ?? "auto"`; `fromForm`: `autoToUndefined(data.icon)` (FR-025)
- [X] T040 Special-case icon option labels in `_buildSectionSchema`: icon names shown verbatim (not translatable); only `auto` localized via `editor.icon.entity`; fix the stale `mode` comment (FR-025)
- [X] T041 Extend the `select` variant of `HaFormSchema` in `src/ha-types.ts` with `custom_value?: boolean`; correct the `mode` doc comment (`list` = radio, `dropdown` = dropdown) (FR-022, FR-025)
- [X] T042 Update `tests/unit/editor-mapping.test.ts`: all-eight `mode: "dropdown"` assertions, icon `auto` sentinel mapping, `custom_value: true` assertion (FR-022, FR-025)
- [X] T043 Update speckit artifacts: spec.md (FR-022, FR-025, Clarifications 2026-10-02), data-model.md (§1, §2, §5, §7), plan.md (D-010), contracts/lovelace-editor-api.md (§5), research.md (R-012, R-015), tasks.md (this phase)
- [X] T044 Update user documentation: `README.md`, `README.advanced.md`, `wiki-publish/Configuration-and-Customization.md`, `wiki-publish/Documentation-Maintenance.md`, `changelog.md` — all eight selects as dropdowns; icon as searchable dropdown with Auto (FR-022, FR-025) — 2026-10-03: all five docs updated in commit `ec57733` (all eight `select (dropdown)`, icon `select (dropdown, searchable)`, mapping rules with `auto` sentinel, drift-check with `custom_value`, changelog searchable-icon entry)

---

## Phase 10: Section Body Isolation (2026-10-05)

**Purpose**: Fix the reported behavior where interacting with a section's own controls (selecting a dropdown option, typing into an input, toggling a switch) collapsed the whole section. Only the section header (title + chevron) must expand/collapse a section (FR-018).

- [X] T045 [US1] In `src/card/energy-horizon-card-editor.ts` `_renderSection`, wrap the advanced section's form + error in an `eh-section__body` container that stops `click`/`pointerdown`/`keydown` propagation, so interactions with the section's own controls never reach the `ha-expansion-panel` header toggle; update the `_handleExpandedChanged` doc comment and add the `.eh-section__body` style (FR-018)
- [X] T046 [US1] Extend `tests/unit/editor-mapping.test.ts` with a structural guard: an advanced section renders the `eh-section__body` isolation container with the three `stopPropagation` handlers, while a basic section renders the form directly (FR-018)
- [X] T047 Update speckit artifacts (spec.md FR-018 + Clarifications 2026-10-05, plan.md D-001, data-model.md §4 state transitions, tasks.md this phase) and user documentation (`README.md`, `README.advanced.md`, `wiki-publish/Configuration-and-Customization.md`) — all in the present tense, no change-history sections (FR-018)

---

## Phase 11: setConfig Self-Echo Guard (2026-10-05)

**Purpose**: The Phase 10 body isolation alone did not stop the collapse. Root cause: entering a value emits `config-changed`, and HA's `HuiElementEditor` wrapper re-invokes `setConfig` on the **same** (reused) editor element with the exact object the editor just emitted; `setConfig` reset `_openSections` to empty, collapsing every section. `setConfig` now detects that self-echo by object identity and skips the reset (FR-018).

- [X] T048 [US1] In `src/card/energy-horizon-card-editor.ts` `setConfig`, detect the HA self-echo (`config === this._config`) and reset `_openSections`/`_fieldErrors` only for a genuinely new config object; document the mechanism in the method comment (FR-018)
- [X] T049 [US1] Extend `tests/unit/editor-mapping.test.ts` with a `setConfig self-echo preserves open sections` suite: same-object echo keeps sections open, a real value change + echo round-trip keeps them open, a genuinely new object resets to collapsed (FR-018)
- [X] T050 Update speckit artifacts (spec.md FR-018 + Clarifications 2026-10-05, plan.md D-001, data-model.md §4 state transitions, tasks.md this phase); user documentation wording (behavior-level) is unchanged and remains accurate (FR-018)

---

## Dependencies & Execution Order

### Task Dependency Graph

```text
Phase 1 (Setup)
  └── Phase 2 (Foundational)
        T002 HaFormSchema ─┐
        T003 SUPPORTED_LANGUAGES ─┤
        T004–T007 translations ─┤
                                 ▼
        Phase 3 (US1, P1) 🎯 MVP   ← depends on all of Phase 2
          T008 (tests) → T009 → T010 → T011/T012 → T013 → T014 → T015
                                 ▼
        Phase 4 (US2, P2)   ← depends on US1 section model (T010)
          T016 (tests) → T017 → T018/T019
                                 ▼
        Phase 5 (US3, P2)   ← depends on US1+US2 for accurate tables (independent of US4)
          T020 / T021 / T022 / T023  (all parallel)
                                 ▼
        Phase 6 (US4, P3)   ← depends on Phase 2 translations + US1 schema
          T024 (tests) → T025
                                 ▼
        Phase 7 (Polish)    ← depends on all stories
          T026 → T027
```

### Parallel Opportunities

- **Phase 2**: T002, T003, T004, T005, T006, T007 are all independent (different files) — run in parallel.
- **Phase 3**: T008 (tests) can start as soon as the helper signatures in T009 are known; T011 and T012 are independent of each other (both depend on T009/T010).
- **Phase 4**: T018 and T019 are independent (different validation paths) once T017 lands.
- **Phase 5**: T020, T021, T022, T023 are fully parallel (four different doc files).
- **Phase 6**: T024 (test) and T025 (implementation) — test first, then implementation.
- **Cross-story**: US3 (docs) and US4 (i18n) are independent of each other and can run in parallel once US1+US2 are done.

### Suggested MVP Scope

**User Story 1 only** (Phase 1 → 2 → 3). This delivers the core promise: every field has a visual control with progressive disclosure, defaults, and no data loss. US2 (time windows), US3 (docs), and US4 (i18n) are incremental.

---

## Implementation Strategy

1. **MVP first**: Land Phase 1 → 2 → 3 (US1) to get full field coverage with progressive disclosure. This is independently testable and shippable.
2. **Incremental delivery**: Add US2 (time windows + validation), then US3 (docs) and US4 (i18n) in parallel, then the Phase 7 quality gate.
3. **Test-driven for pure helpers**: Write the mapping/validation unit tests (T008, T016, T024) before their implementation and confirm they fail first.
4. **No new npm dependencies**: All UI uses HA-native `ha-form` + `ha-expansion-panel`; validation reuses existing card functions.

---

## Task Summary

| Phase | User Story | Priority | Tasks |
|-------|-----------|----------|-------|
| 1 | Setup | — | T001 (1) |
| 2 | Foundational | — | T002–T007 (6) |
| 3 | US1 — full visual coverage | P1 🎯 | T008–T015 (8) |
| 4 | US2 — time windows | P2 | T016–T019 (4) |
| 5 | US3 — documentation | P2 | T020–T023 (4) |
| 6 | US4 — i18n | P3 | T024–T025 (2) |
| 7 | Polish | — | T026–T027 (2) |
| 8 | Editor UX fixes | — | T028–T037 (10) |
| 9 | Dropdowns + searchable icon | — | T038–T044 (7) |
| **Total** | | | **44 tasks** |
