# Tasks: Card Picker Preview

**Input**: Design documents from `/specs/910-card-picker-preview/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — the project constitution (Principle III: Code quality & tests) and the plan
require the key functions (suggestion check, entity search, demo series, time-limited query) to be
covered by tests. Test tasks are written per user story and should be made to fail before the
story's wiring is complete.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing
of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/`, `tests/` at repository root (existing layout — no new top-level dirs)
- New pure-logic module: `src/card/picker-preview.ts`
- Element: `src/card/cumulative-comparison-chart.ts`
- Registration: `src/index.ts`
- Hook typing: `src/ha-types.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the baseline is green before any feature work.

- [ ] T001 Verify baseline is green on branch `910-card-picker-preview`: `npm test` (564 passing), `npm run typecheck` (strict, 0 errors), `npm run lint` (0 errors)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared pure helpers, hook typing, and the element's picker-mode core that ALL user
stories depend on. These are story-agnostic (each serves ≥2 stories) and must be complete before
any user story wiring.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Add `getEntitySuggestion` to `CustomCardDeclaration` and add the `CustomCardSuggestion` interface (`{ label?: string; config: LovelaceCardConfig }`) in `src/ha-types.ts` (research R1)
- [ ] T003 Create `src/card/picker-preview.ts`; export `SUPPORTED_UNITS` as `readonly ["kWh", "Wh", "MWh", "m³", "l"]` and `isSupportedUnit(unit: string | undefined): boolean` using an exact, case-sensitive match (FR-003, research R3)
- [ ] T004 Implement `buildDemoComparisonSeries(unit: string, now: Date, timeZone: string): ComparisonSeries` in `src/card/picker-preview.ts` — deterministic (no `Math.random`), returns the existing `ComparisonSeries` shape, plausible magnitudes, current series partial (ends at `now`) + reference series complete, aligned to the default `year_over_year` windows (FR-009, research R4)
- [ ] T005 Implement `findSuitableEntity(hass: HomeAssistant, entities: string[], entitiesFallback: string[]): string` in `src/card/picker-preview.ts` — first entity in `entities` (unused) with a supported unit, else first in `entitiesFallback` (used) with a supported unit, else `""` (FR-007, research R5)
- [ ] T006 Implement `buildSamplePreviewConfig(entity: string)` in `src/card/picker-preview.ts` returning exactly `{ type: "energy-horizon-card", entity, comparison_preset: "year_over_year", interpretation: "consumption", neutral_threshold: 2 }` (FR-005/FR-009, research R5)
- [ ] T007 Implement `buildEntitySuggestion(hass: HomeAssistant, entityId: string): CustomCardSuggestion | null` in `src/card/picker-preview.ts` — returns `null` when the entity is missing from `hass.states` or its unit is not supported; otherwise `{ config: buildSamplePreviewConfig(entityId) }`; total and non-throwing (FR-001/FR-002/FR-004, research R1)
- [ ] T008 Implement `queryRealDataWithLimit(...)` in `src/card/picker-preview.ts` — a time-limited wrapper (~2–3 s `Promise.race` against a timeout) over the existing `buildLtsQueriesForWindows` + `sendMessagePromise` + `mapLtsResponseToCumulativeSeries` path; resolves to a `ComparisonSeries` on success, or a sentinel (e.g. `null`) on timeout/error/empty (FR-011, research R4)
- [ ] T009 Declare a `preview` property (`boolean`, default `false`) on `EnergyHorizonCard` in `src/card/cumulative-comparison-chart.ts` (set by `hui-card` in the picker; not part of `_config`, not persisted) (research R2)
- [ ] T010 Implement the demo-first picker-mode render path in `src/card/cumulative-comparison-chart.ts`: when `preview === true`, immediately render `buildDemoComparisonSeries` (no query on the critical path, no blank/loading/error state) through the existing `ComparisonSeries` render pipeline (FR-014/FR-011, research R4)
- [ ] T011 Hide the 909 time-window preview controls (back/forward/reset) when `preview === true` in `src/card/cumulative-comparison-chart.ts` so the preview is a clean, non-interactive surface (research R6)

**Checkpoint**: Foundation ready — the card renders a demo chart in picker mode and the shared
helpers are in place. User story wiring can now begin.

---

## Phase 3: User Story 1 — Discover the card from an entity (Priority: P1) 🎯 MVP

**Goal**: The card is suggested in the "By entity" view for every entity whose unit is supported
(and only those), carrying a sample configuration that references the selected entity.

**Independent Test**: In the card picker, select an entity with a supported unit (e.g. a `kWh`
energy sensor) and confirm the Energy Horizon card appears in the suggested cards with a preview
referencing that entity; select an entity with an unsupported unit (e.g. `°C`) and confirm the card
is not suggested.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before the hook is registered.**

- [ ] T012 [P] [US1] Unit tests in `tests/unit/picker-preview.test.ts`: `isSupportedUnit` (all five supported units `kWh`/`Wh`/`MWh`/`m³`/`l` → true; an unsupported unit and `undefined` → false), `buildEntitySuggestion` (supported entity → `{ config }` with `entity` = selected entity and the default preset/interpretation/threshold; unsupported unit → `null`; entity missing from `hass.states` → `null`; never throws), and `buildSamplePreviewConfig` shape (FR-001/FR-002/FR-004, SC-001/SC-002)

### Implementation for User Story 1

- [ ] T013 [US1] Register the `getEntitySuggestion` hook on the `window.customCards` entry in `src/index.ts`, delegating to `buildEntitySuggestion` (research R1)

**Checkpoint**: The card is discoverable from a supported entity in the "By entity" view (MVP).

---

## Phase 4: User Story 2 — Recognize the card in the card gallery (Priority: P1)

**Goal**: In the "By card" view, the card's preview renders the standard appearance (a chart with a
current and a reference series plus the standard panels) instead of the no-data message, and picks a
suitable user entity.

**Independent Test**: Open the card picker in the "By card" view and confirm the Energy Horizon
preview renders a chart with a current and a reference series in the card's standard appearance —
not the no-data message.

### Tests for User Story 2 ⚠️

- [ ] T014 [P] [US2] Unit tests in `tests/unit/picker-preview.test.ts`: `findSuitableEntity` (prefers an unused entity over a used one; falls back to `entitiesFallback`; returns `""` when no entity has a supported unit) (FR-007/FR-008)
- [ ] T015 [P] [US2] Integration test in `tests/integration/picker-preview-render.test.ts`: with `preview === true`, the card renders a chart (demo series) with the standard panels and does NOT show the no-data message (FR-005, SC-003)

### Implementation for User Story 2

- [ ] T016 [US2] Implement the full `getStubConfig(hass: HomeAssistant, entities: string[], entitiesFallback: string[])` static signature on `EnergyHorizonCard` in `src/card/cumulative-comparison-chart.ts`, using `findSuitableEntity` + `buildSamplePreviewConfig` (returns the sample config with the found entity, or `entity: ""` when none) (FR-007/FR-008, research R2/R5)

**Checkpoint**: The gallery preview is recognizable (standard appearance, no no-data message).

---

## Phase 5: User Story 3 — Preview content: real data first, fictional fallback (Priority: P2)

**Goal**: The preview shows the selected/found entity's real data when a time-limited query
succeeds, and otherwise the deterministic demo series — never a loading or error state.

**Independent Test**: In an instance with an energy entity that has statistics, confirm the preview
uses it; in an instance without any suitable entity, confirm the preview still renders the standard
appearance with the fictional series.

### Tests for User Story 3 ⚠️

- [ ] T017 [P] [US3] Unit tests in `tests/unit/picker-preview.test.ts`: `queryRealDataWithLimit` (resolves in time with a current series → returns the real `ComparisonSeries`; exceeds the time limit → returns the fallback sentinel; query rejects → returns the fallback sentinel; empty result → returns the fallback sentinel) (FR-007/FR-011)
- [ ] T018 [P] [US3] Integration test in `tests/integration/picker-preview-render.test.ts`: the preview renders the demo series first, then updates in place to real data when the query succeeds in time; on timeout/error the demo series stays; no loading or error state is ever shown (FR-014, SC-004)

### Implementation for User Story 3

- [ ] T019 [US3] Wire the time-limited real-data query into the picker-mode render path in `src/card/cumulative-comparison-chart.ts`: after the demo render, fire `queryRealDataWithLimit`; on success with a current series, update the preview in place to the real data; on failure/timeout/empty, keep the demo series; the query is fired at most once per picker session (FR-007/FR-008/FR-014, research R4)

**Checkpoint**: The preview prefers real data and falls back to the demo series safely.

---

## Phase 6: User Story 4 — The preview is fast, safe, and side-effect free (Priority: P3)

**Goal**: The preview renders quickly, never persists, does not interfere with other cards or the
dashboard, and respects the active theme and localization.

**Independent Test**: Open the card picker and confirm the preview renders without perceptible
waiting, confirm the dashboard's saved configuration is unchanged after browsing, and confirm other
cards' previews are unaffected.

### Tests for User Story 4 ⚠️

- [ ] T020 [P] [US4] Integration test in `tests/integration/picker-preview-render.test.ts`: browsing the preview persists no configuration (SC-006); the preview respects the active theme (light/dark) and the card's localization (FR-012); the preview does not interfere with other cards' previews or the picker (FR-013)

### Implementation for User Story 4

- [ ] T021 [US4] Verify and harden side-effect safety in `src/card/cumulative-comparison-chart.ts`: the preview never writes to `_config` or any storage (the sample config is only the picker's starting point, FR-010); the in-flight real-data query result is discarded on disconnect or config change via the existing generation mechanism (FR-013)

**Checkpoint**: The preview is fast, safe, and side-effect free.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cross-cutting checks across all stories.

- [ ] T022 [P] Run the `quickstart.md` validation scenarios end-to-end (both picker views, all 12 scenarios) against a dev HA dashboard
- [ ] T023 [P] Confirm no new translation keys are needed; if any are required, add them to all four locales (`en`, `pl`, `de`, `fr`) in `src/card/translations/`
- [ ] T024 Final regression: `npm test` (564 baseline + all new tests passing), `npm run typecheck` (strict, 0 errors), `npm run lint` (0 errors)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phases 3–6)**: All depend on Foundational (Phase 2) completion.
  - US1 (P1) and US2 (P1) can proceed in parallel once Phase 2 is done (different files: `src/index.ts` vs `src/card/cumulative-comparison-chart.ts`).
  - US3 (P2) depends on US2's `getStubConfig`/picker-mode render being in place (same element file) — sequence after US2.
  - US4 (P3) depends on US3's real-data wiring (same element file) — sequence after US3.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependency on other stories.
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — no dependency on US1 (different files).
- **User Story 3 (P2)**: Starts after US2 (shares the element file and the picker-mode render path).
- **User Story 4 (P3)**: Starts after US3 (shares the element file and the real-data wiring).

### Within Each User Story

- Tests MUST be written and made to FAIL before the story's wiring is complete.
- Story complete before moving to the next priority.

### Parallel Opportunities

- T002 (ha-types) is parallel with the `picker-preview.ts` helper work (different files).
- Within a story, the test tasks marked [P] (different test files) can run in parallel.
- US1 and US2 can be worked in parallel by different developers (different source files).
- T022 and T023 (Polish) are parallel (different concerns).

---

## Parallel Example: User Story 1

```text
# Launch the US1 test task first (it should fail before the hook is registered):
Task: "Unit tests in tests/unit/picker-preview.test.ts (T012)"

# Then the wiring (different file, independent of the test file):
Task: "Register getEntitySuggestion hook in src/index.ts (T013)"
```

## Parallel Example: User Story 2

```text
# Launch both US2 test tasks together (different files):
Task: "Unit tests for findSuitableEntity in tests/unit/picker-preview.test.ts (T014)"
Task: "Integration test for picker-mode render in tests/integration/picker-preview-render.test.ts (T015)"

# Then the wiring:
Task: "Implement full getStubConfig signature in src/card/cumulative-comparison-chart.ts (T016)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline green).
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1 (suggestion hook).
4. **STOP and VALIDATE**: In the "By entity" view, a supported entity suggests the card; an
   unsupported entity does not.
5. Deploy/demo if ready.

### Incremental Delivery

1. Complete Setup + Foundational → foundation ready (demo chart renders in picker mode).
2. Add User Story 1 → test independently → the card is discoverable from an entity (MVP!).
3. Add User Story 2 → test independently → the gallery preview is recognizable.
4. Add User Story 3 → test independently → real data first, demo fallback.
5. Add User Story 4 → test independently → fast, safe, side-effect free.
6. Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together.
2. Once Foundational is done:
   - Developer A: User Story 1 (`src/index.ts`)
   - Developer B: User Story 2 (`src/card/cumulative-comparison-chart.ts`)
3. US3 and US4 follow sequentially on the element file (shared with US2).

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps each task to a specific user story for traceability.
- Each user story should be independently completable and testable.
- Verify tests fail before implementing the story's wiring.
- Commit after each task or logical group.
- Stop at any checkpoint to validate the story independently.
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence.
- No new npm dependencies, no new HA APIs, no persisted state, no loading/error state in the picker
  (constitution + plan constraints).
