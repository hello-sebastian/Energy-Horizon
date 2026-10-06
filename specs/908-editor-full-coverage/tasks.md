---
description: "Task list for the Full-Coverage Visual Editor (v1.2.0)"
---

# Tasks: Full-Coverage Visual Editor (v1.2.0)

**Input**: Design documents from `/specs/908-editor-full-coverage/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — the feature spec requires them (Constitution III: TypeScript strict + tests; plan.md lists the unit/integration test files; quickstart.md defines the automated verification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md Project Structure)
- Editor modules: `src/card/editor/` (new pure module set)
- Translations: `src/translations/{en,pl,de,fr}.json`
- Domain 900 touch: `src/card/types.ts`, `src/card/time-windows/presets.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the working environment before any implementation. The project (Lit 3, Vite 6, Vitest 2, ESLint 9) already exists — no scaffolding needed.

- [ ] T001 Verify branch `1.2.0` is checked out, run `npm install`, then `npm test` and `npm run lint` from the repo root to confirm a green baseline before changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. These are the pure, unit-testable modules plus the one cross-domain (900) type change and the i18n key set.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 Add `"custom"` to `ComparisonMode` in `src/card/types.ts` and add a `custom` branch to `getPresetTemplate()` in `src/card/time-windows/presets.ts` returning the generic shape `{ anchor: "start_of_year", duration: "1y", step: "1y", count: 2 }` with **no** `currentEndIsNow`/`referenceFullPeriod`/`periodOffsetYears` legacy flags (research R2); add a unit test in `tests/unit/` asserting `resolveTimeWindows` routes a `custom` preset to `resolveGeneric` (no legacy path)
- [ ] T003 [P] Create `src/card/editor/field-registry.ts` with the `SectionId`, `ControlSpec`, `FieldDescriptor`, `FieldRegistry` types (data-model.md §1–§4) and the **full 32-field registry** exactly per the inventory table in `contracts/field-registry.md` (S1 basic: entity/title/show_title/icon/show_icon/comparison_preset/interpretation/neutral_interpretation; S2 time: aggregation/period_offset/time_window.{anchor,duration,step,count,offset}; S3 layout: show_comparison_summary/show_forecast/show_forecast_total_panel/show_narrative_comment; S4 visuals: primary_color/fill_current/fill_current_opacity/fill_reference/fill_reference_opacity/connect_nulls/show_legend; S5 formatting: precision/force_prefix/number_format/language/x_axis_format/tooltip_format; S6 system: debug) with the documented defaults, `required: true` only for `entity`, and the `custom`-renderer escape-hatch member in `ControlSpec` (FR-908-C; no field uses it in v1.2.0). **Nuance**: the `aggregation` select offers `auto` as its default option, but the `WindowAggregation` type is `"day"|"week"|"month"|"hour"` — the `auto` option MUST map to an **omitted/undefined** `aggregation` in the config (adaptive), never a literal `"auto"` string. Add `tests/unit/editor-field-registry.test.ts` asserting (a) every FR-908-D key appears exactly once (SC-908-1), (b) section membership matches FR-908-F, (c) `type`/`comparison_mode`/`forecast` are NOT registry fields, (d) changing a descriptor's `section` re-groups it in the render output with no template edit (FR-908-B, SC-908-8)
- [ ] T004 [P] Create `src/card/editor/config-merge.ts` implementing the preservative deep merge `preservativeMerge(base, changes)` (research R3): top-level scalars set by path; `time_window` merged key-by-key; **every** unmodeled key in `base` copied through unchanged; plus the `EMIT_DEBOUNCE_MS = 300` constant (research R1) and the field-path deep-compare `hasConfigDelta(a, b)` used by the emit gate (research R5). Add `tests/unit/editor-config-merge.test.ts` covering: unmodeled/unknown keys survive, `time_window` key-by-key (editing `count` preserves `offset`), delta check (equal objects → no delta; reference-identity alone is NOT sufficient)
- [ ] T005 [P] Create `src/card/editor/config-normalize.ts` with pure `normalizeForLoad(config)` and `normalizeForSave(config)` (research R8): load pre-fills `comparison_preset` from deprecated `comparison_mode` when empty and resolves `show_forecast` as `config.show_forecast ?? config.forecast ?? true` for display; save emits `comparison_preset` (replacing, not duplicating, `comparison_mode`) and `show_forecast` (dropping the `forecast` alias) (FR-908-I, FR-908-V). Add `tests/unit/editor-normalize.test.ts` covering both directions and the no-duplication rule
- [ ] T006 [P] Create `src/card/editor/editor-ui-state.ts` with the `EditorUiState` type (`expanded: Record<SectionId, boolean>` with S1 default `true` / S2–S6 default `false`, `lastFocusedField?`, `lastCaret?`, `scrollAnchor?`) and pure helpers: `defaultUiState()`, `withExpanded(state, section, value)`, `withFocus(state, field, caret)`, `withScroll(state, anchor)` (data-model.md §5, research R4). Add `tests/unit/editor-ui-state.test.ts` asserting state survives a simulated `setConfig` re-render (state is never derived from config; only explicit gestures mutate it)
- [ ] T007 [P] Add all new `editor.*` keys to `src/translations/en.json`, `src/translations/pl.json`, `src/translations/de.json`, `src/translations/fr.json` exactly per `contracts/editor-i18n.md` (6 section titles, 26 new field labels, 24 new option labels; `en` is the reference, `pl`/`de`/`fr` translated, identical key set in all four files; the `force_prefix` empty option keeps an empty label). Add `tests/unit/editor-i18n.test.ts` (dictionary guard) asserting every `labelKey` in the `FieldRegistry` and every select `option.labelKey` resolves in all four dictionaries with no missing-key fallback (SC-908-7)
- [ ] T008 Rewrite `src/card/energy-horizon-card-editor.ts` as a thin Lit shell with the registry-driven render loop (contracts/field-registry.md render-loop contract): iterate the six sections in fixed order `basic → time → layout → visuals → formatting → system` as `ha-expansion-panel`s, group descriptors by `section`, filter by `visibleWhen(cfg)`, apply `disabledWhen(cfg)`, render each control from declarative `ControlSpec` metadata (HA components per research R6: `ha-entity-picker` sensor-domain per FR-908-W, `ha-icon-picker`, `ha-select`, `ha-textfield`, `ha-switch`, `ha-slider`, `ha-color-picker` with free-text fallback for `var(...)` colors), with graceful degradation to standard controls when a HA component is unavailable (FR-908-T). Implement the Visual/YAML toggle (shown when `window.jsyaml` present, hidden when absent). In YAML mode, the textarea is a **first-class input path** (FR-908-Y): text updates immediately; parse debounced (short interval) for fast error feedback; emit debounced (longer interval) for preview with no-op suppression (structural diff); flush on blur/switch/close. `setConfig()` preserves `_editorMode` (does not reset to Visual). Self-echo (config == lastEmitted) → textarea NOT re-serialized; external change (config ≠ lastEmitted) → textarea re-serialized (caret best-effort). Invalid YAML → inline error, keep last valid `_config`, no emit. Add a smoke test in `tests/unit/` asserting six sections render in order with S1 expanded and S2–S6 collapsed
- [ ] T009 Wire `EditorUiState` into `src/card/energy-horizon-card-editor.ts` as component-local Lit `@state` (never derived from config, FR-908-J): on every `setConfig()` re-render re-apply `expanded`, restore focus + caret to `lastFocusedField` in a post-render effect (`updateComplete`/rAF, FR-908-L), and restore `scrollAnchor` (FR-908-M); implement the debounce pipeline — text/number fields update the displayed value and `_config` immediately but the `config-changed` emit is debounced `EMIT_DEBOUNCE_MS = 300` and force-flushed on blur/commit/close (FR-908-O), discrete controls emit immediately; implement the emit gate — dispatch `config-changed` only when `hasConfigDelta(wouldBe, lastEmitted)` is true, and a `setConfig()`-driven re-render never calls the emit path (FR-908-N). Add `tests/unit/editor-debounce.test.ts` (text emit debounced; flush on blur/commit/close; re-render emits nothing)
- [ ] T010 Implement the preset↔custom state cleanup in `src/card/energy-horizon-card-editor.ts` (FR-908-Q, data-model.md §7): on standard→`custom` remove `period_offset` and initialize `time_window` with defaults (`anchor: start_of_year`, `duration: "1y"`, `step: "1y"`, `count: 2`); on `custom`→standard remove the `time_window` object and restore `period_offset: -1`; the section's expanded state is preserved across the switch. Add `tests/unit/editor-preset-switch.test.ts` covering both directions (SC-908-5)
- [ ] T011 Implement the FR-908-X label language chain in `src/card/energy-horizon-card-editor.ts`: recompute the label language from the **current** `_config` on each render — (1) card `language` field if set, (2) else `hass.locale.language`, (3) else the card's existing fallback — and re-label the whole form live when `language` changes (no cached language from editor open; HA `hass.localize` is NOT used, FR-908-U). Add a unit test asserting a live `language` edit re-labels the form

**Checkpoint**: Foundation ready — the editor renders all six sections from the registry with a stable lifecycle; user story verification can now begin in parallel.

---

## Phase 3: User Story 1 — Configure the whole card without touching YAML (Priority: P1) 🎯 MVP

**Goal**: 100% of the v1.1.0 YAML surface is editable in the GUI; a config exercising every parameter round-trips with zero fields lost (SC-908-1).

**Independent Test**: Open the editor on a card whose YAML contains values for *all* parameters (including `primary_color`, `fill_*_opacity`, `x_axis_format`, `time_window.*`, `debug`). Every value is pre-filled in the matching control; changing any control updates the live preview; saving writes back the full config with no field lost (before/after diff).

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Add `tests/unit/editor-coverage.test.ts`: a config exercising every FR-908-D parameter opens with every value pre-filled in the matching control/section (spec US1 acceptance 1); a minimal config (`entity` + `comparison_preset` only) renders every optional control at its documented default with no spurious error (acceptance 3); a before/after diff of a full round-trip loses zero keys (acceptance 4, SC-908-1)

### Implementation for User Story 1

- [ ] T013 [US1] Verify and fix value resolution in `src/card/energy-horizon-card-editor.ts` so every registry field binds its value from `_config` by `key` path (including `time_window.*` sub-paths) with the documented default rendered when absent (FR-908-R: required `entity` visually distinguished; optional fields render empty/default without error)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — the MVP.

---

## Phase 4: User Story 2 — Edit without losing UI state across re-renders (Priority: P1)

**Goal**: Expanded sections stay expanded, the actively-typed field keeps focus + caret, scroll is preserved, and a passive re-render emits nothing (SC-908-2, SC-908-3).

**Independent Test**: Expand two sections, type into a text field, toggle a switch, then observe: both sections remain expanded, the text field retains focus and cursor, no visible reset, and zero `config-changed` from the re-render itself.

### Tests for User Story 2 ⚠️

- [ ] T014 [P] [US2] Add `tests/integration/editor-lifecycle.test.ts`: a passive `setConfig` re-render dispatches **zero** `config-changed` (SC-908-3); after a re-render the expanded sections, focus + caret of the typed field, and scroll position are all preserved (SC-908-2, FR-908-J/K/L/M); and a **≥ 20 mixed-edit session** (text typing, switch toggles, select changes, section expand/collapse) produces zero unintended panel collapses, zero focus/caret losses in an actively-typed field, and zero scroll jumps (SC-908-2)

### Implementation for User Story 2

- [ ] T015 [US2] Verify and fix the post-render restore effect in `src/card/energy-horizon-card-editor.ts` against the integration test: focus/caret restoration targets the field by a stable `id`/`name`, a re-render during an in-flight debounce does not cancel the pending user-visible text value (spec edge case), and no flash/reset occurs

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 — Switch between standard presets and a custom time window (Priority: P1)

**Goal**: Standard ↔ `custom` switching cleans up the config correctly in both directions, so the saved YAML always matches the selected mode (SC-908-5).

**Independent Test**: Start on `year_over_year` (has `period_offset`), switch to `custom` (verify `period_offset` removed and `time_window` initialized with defaults), then switch back to `month_over_month` (verify `time_window` removed and `period_offset` restored to `-1`).

### Tests for User Story 3 ⚠️

- [ ] T016 [P] [US3] Add `tests/unit/editor-preset-switch-integration.test.ts` (element-level): standard→`custom` removes `period_offset`, initializes `time_window` with the FR-908-Q defaults, shows the `time_window` sub-block and hides `period_offset` (FR-908-G); `custom`→standard removes `time_window`, restores `period_offset: -1`, hides the sub-block; the section's expanded state is preserved across the switch (spec US3 acceptance 1–4)

### Implementation for User Story 3

- [ ] T017 [US3] Verify and fix the preset↔custom cleanup and the `visibleWhen` predicates in `src/card/energy-horizon-card-editor.ts` against the integration test, including the `custom` mode with an empty/invalid `time_window` (editor opens with defaults; the **card** — not the editor — surfaces the invalid-window error, FR-908-S)

**Checkpoint**: All P1 user stories (1, 2, 3) should now be independently functional.

---

## Phase 6: User Story 4 — Progressive disclosure through sections (Priority: P2)

**Goal**: Six clearly-labeled sections with S1 always expanded and S2–S6 collapsed by default; each section shows exactly its FR-908-F members.

**Independent Test**: Open the editor → Section 1 (Basic) is expanded and visible; Sections 2–6 are collapsed. Expand each and confirm the correct fields appear in the correct section.

### Tests for User Story 4 ⚠️

- [ ] T018 [P] [US4] Add `tests/unit/editor-sections.test.ts`: the six sections render in the fixed order `basic → time → layout → visuals → formatting → system` with S1 expanded and S2–S6 collapsed (spec US4 acceptance 1); expanding "Formatting & Axis" shows exactly `precision`, `force_prefix`, `number_format`, `language`, `x_axis_format`, `tooltip_format` (acceptance 2); "System & Debug" shows exactly `debug` (acceptance 3); an in-session expansion survives re-renders but a fresh editor instance reopens collapsed (acceptance 4)

### Implementation for User Story 4

- [ ] T019 [US4] Verify and fix section rendering and the localized section titles in `src/card/energy-horizon-card-editor.ts` against the test (titles from `editor.section.*` keys, FR-908-E)

**Checkpoint**: At this point, User Stories 1–4 should all work independently.

---

## Phase 7: User Story 5 — Cascading and dependent controls (Priority: P2)

**Goal**: Dependent controls reflect their parent's state — `show_forecast_total_panel` is disabled when `show_forecast` is off (FR-908-H).

**Independent Test**: Turn `show_forecast` off → `show_forecast_total_panel` becomes disabled (greyed). Turn it back on → the dependent control re-enables.

### Tests for User Story 5 ⚠️

- [ ] T020 [P] [US5] Add `tests/unit/editor-cascade.test.ts`: `show_forecast: true` → `show_forecast_total_panel` enabled; toggling `show_forecast` to `false` → `show_forecast_total_panel` rendered disabled; toggling back to `true` → re-enabled (spec US5 acceptance 1–2); saving with `show_forecast: false` keeps the emitted config consistent with domain 903 gating (acceptance 3)

### Implementation for User Story 5

- [ ] T021 [US5] Verify and fix the `disabledWhen` application in `src/card/energy-horizon-card-editor.ts` against the test (the `show_forecast_total_panel` descriptor's `disabledWhen: cfg => cfg.show_forecast === false` is applied uniformly by the render loop, research R11)

**Checkpoint**: At this point, User Stories 1–5 should all work independently.

---

## Phase 8: User Story 6 — Safe handling of deprecated and unknown values (Priority: P3)

**Goal**: Existing configs with deprecated or out-of-range values open without crashing, degrade gracefully, and migrate deprecated keys on save (SC-908-6).

**Independent Test**: Open the editor on a config containing `comparison_mode` (deprecated) and an unknown `force_prefix` value → editor opens, `comparison_preset` is pre-filled from the legacy key, the unknown `force_prefix` shows an empty selection, and saving rewrites `comparison_mode` → `comparison_preset`.

### Tests for User Story 6 ⚠️

- [ ] T022 [P] [US6] Add `tests/unit/editor-degradation.test.ts`: a config with `comparison_mode: month_over_month` and no `comparison_preset` opens with `comparison_preset` pre-filled (spec US6 acceptance 1); saving emits `comparison_preset` and replaces (not duplicates) `comparison_mode` (acceptance 2); an unknown `force_prefix` value shows an empty/default selection with no thrown error and no blocked save (acceptance 3); `hass` absent → the editor renders in a degraded state without a JavaScript error (acceptance 4, FR-908-T); a v1.1.0 config with `comparison_mode` + YAML-only fields opens, saves with `comparison_preset`, and loses no YAML-only fields (SC-908-6)

### Implementation for User Story 6

- [ ] T023 [US6] Verify and fix the load/save normalization wiring in `src/card/energy-horizon-card-editor.ts` against the test (`normalizeForLoad` on `setConfig`/YAML parse, `normalizeForSave` on every emit; unknown select values degrade to empty selection, FR-908-T)

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Whole-feature verification and release readiness.

- [ ] T024 Run the full automated suite `npm test` (TZ=UTC) and `npm run lint` from the repo root; fix any regressions in `src/card/` and `tests/`
- [ ] T025 [P] Run the quickstart.md validation: all seven automated checks (SC-908-1 coverage, SC-908-3 no churn, SC-908-2 stability, SC-908-7 i18n, SC-908-5 mode switching, SC-908-6 backward compat, SC-908-9 YAML live-edit) and the nine manual Home Assistant scenarios from `specs/908-editor-full-coverage/quickstart.md` §5
- [ ] T026 [P] Verify the spec's Documentation Plan is reflected in the v1.2.0 release docs owned by domain 907: `README.md` (full-coverage editor note, version 1.2.0), `README.advanced.md` (Lovelace editor rewrite: six sections, `custom` preset, lifecycle guarantees, GUI-editable markers, Visual ↔ YAML round-trip), `wiki-publish/` pages (`Configuration-and-Customization.md`, `Getting-Started.md`, `Releases-and-Migration.md`, `Troubleshooting-and-FAQ.md`), and `changelog.md` `[1.2.0]` — consistency rules: identical `custom` value, six section names, and field→section mapping across all docs; Visual ↔ YAML round-trip documented (both directions lossless) and the v1.1.0 "YAML is authoritative for the full config" framing retired; no promise of inline validation
- [ ] T027 [P] Final code cleanup in `src/card/energy-horizon-card-editor.ts` and `src/card/editor/`: no `any` (Constitution III), no dead code from the v1.1.0 editor, consistent naming with the contracts, and a bounded bundle (no new deps, no lazy chunk — Constitution V, domain 904 FR-904-F)
- [ ] T028 [P] Add `tests/unit/editor-accessibility.test.ts` (Constitution IV): every rendered control carries an accessible name (localized label via `aria-label`/`<label>` association), sections are keyboard-operable `ha-expansion-panel`s, and disabled dependent controls (e.g. `show_forecast_total_panel` when `show_forecast` is off) expose a disabled state to assistive tech
- [ ] T029 [P] Add `tests/unit/editor-yaml-mode.test.ts` (FR-908-Y, SC-908-9): YAML keystroke → debounced parse (short interval) → debounced emit (longer interval) with no-op suppression (reformatting / key reordering → 0 emits; value change → 1 emit); invalid YAML → inline error, `_config` unchanged, no emit; `setConfig` self-echo (config == lastEmitted) → textarea NOT re-serialized; `setConfig` external change (config ≠ lastEmitted) → textarea re-serialized; Save without switching to Visual → last valid YAML text is saved; `setConfig` preserves `_editorMode` (does not reset to Visual)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories. T002 (domain-900 `custom`) and T008 (editor shell) are the critical path; T003–T007 are parallelizable
- **User Stories (Phases 3–8)**: All depend on Foundational phase completion (T008–T011)
  - User stories can then proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3)
  - US1 (Phase 3) is the MVP and should land first
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — independently testable (its implementation T009/T010 already landed in Phase 2; the story adds the integration verification)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) — depends on T002 (domain-900 `custom`) and T010 (cleanup), both in Phase 2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) — depends on T008 (section rendering)
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) — depends on T003 (registry predicates)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) — depends on T005 (normalization)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Verification/fix tasks depend on the story's tests
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 2**: T003, T004, T005, T006, T007 all run in parallel (different files, no interdependencies); T002 first (types), then T008 → T009 → T010 → T011 are sequential (same file `src/card/energy-horizon-card-editor.ts`)
- **Phases 3–8**: all six stories can start in parallel once Phase 2 completes (different test files; their fix tasks touch the same editor file, so serialize the fix tasks if one developer)
- **Phase 9**: T025, T026, T027, T028 run in parallel with each other (different files); T024 first

---

## Parallel Example: User Story 1

```bash
# Launch the US1 test first (must FAIL before implementation):
Task: "Add tests/unit/editor-coverage.test.ts (T012)"

# Then the implementation verification:
Task: "Verify and fix value resolution in src/card/energy-horizon-card-editor.ts (T013)"
```

## Parallel Example: Phase 2 (Foundational)

```bash
# After T002 (domain-900 custom preset):
Task: "Create src/card/editor/field-registry.ts (T003)"   ─┐
Task: "Create src/card/editor/config-merge.ts (T004)"      ─┤ all in parallel
Task: "Create src/card/editor/config-normalize.ts (T005)"  ─┤ (different files)
Task: "Create src/card/editor/editor-ui-state.ts (T006)"   ─┤
Task: "Add editor.* keys to src/translations/*.json (T007)"─┘

# Then sequentially (same file):
Task: "Rewrite src/card/energy-horizon-card-editor.ts render loop (T008)"
Task: "Wire EditorUiState + debounce + emit gate (T009)"
Task: "Preset↔custom cleanup (T010)"
Task: "FR-908-X language chain (T011)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (green baseline)
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (full coverage round-trip)
4. **STOP and VALIDATE**: Test User Story 1 independently (quickstart.md §5 scenario 1)
5. Deploy/demo if ready — the editor now covers 100% of the YAML surface

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (stable lifecycle)
4. Add User Story 3 → Test independently → Deploy/Demo (custom preset)
5. Add User Stories 4, 5, 6 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T003–T007 in parallel; one developer owns the T008–T011 editor-shell sequence)
2. Once Foundational is done:
   - Developer A: User Story 1 (coverage)
   - Developer B: User Story 2 (lifecycle integration)
   - Developer C: User Stories 3–6 (preset switching, sections, cascade, degradation)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Documentation authoring (README/wiki/changelog) is owned by domain 907 — T026 verifies, it does not author under this feature's code tasks
- The `aggregation` select's `auto` option maps to an **omitted** `aggregation` in the config (adaptive) — never a literal `"auto"` string (`WindowAggregation` has no `"auto"`)
- All tasks reference the normative requirements in `spec.md` (FR-908-*) and the design in `data-model.md` / `contracts/` / `research.md`
