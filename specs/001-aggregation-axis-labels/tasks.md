# Tasks: Intelligent aggregation and X-axis labeling

**Input**: Design documents from `/Users/admin/Projekty Local/Energy-Horizon/specs/001-aggregation-axis-labels/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/card-config-axis.md](./contracts/card-config-axis.md), [quickstart.md](./quickstart.md)

**Tests**: Unit tests for pure modules per [plan.md](./plan.md) (Vitest); no separate TDD section unless noted.

**Organization**: Phases follow user-story priorities from [spec.md](./spec.md); tasks use strict checklist format.

**Remediation (post-`/speckit.analyze`)**: Fail-fast `x_axis_format` validation moved to Phase 2 (**T006**). FR-002 v1 scope noted under **T014**. i18n and SC-003 called out in **T016** / **T015**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: `US1`…`US7` — only on user-story phase tasks
- Paths are relative to repository root: `src/`, `tests/`

## Phase 1: Setup (shared infrastructure)

**Purpose**: Add axis module entry point for the feature.

- [x] T001 Add `src/card/axis/index.ts` exporting the public symbols implemented in Phase 2 (update exports when modules are added)

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Types, pure axis logic, unit tests, pipeline hook for effective aggregation, and **fail-fast** validation of `x_axis_format` — **must complete before user-story integration**.

**Checkpoint**: `npm test` passes for new unit files; `pickAutoAggregation` + validators + locale helpers available for import; invalid `x_axis_format` rejected in `setConfig` before timeline resolution (**T006**).

- [x] T002 Add optional `x_axis_format?: string`, exported `MAX_POINTS_PER_SERIES`, and extended `ChartRendererConfig` fields for X-axis display in `src/card/types.ts`
- [x] T003 [P] Implement `pickAutoAggregation(durationMs: number)` and threshold table in `src/card/axis/auto-aggregation.ts` per `specs/001-aggregation-axis-labels/research.md`
- [x] T004 [P] Implement `assertPointCountWithinCap` in `src/card/axis/point-cap.ts`
- [x] T005 [P] Implement `validateXAxisFormat` (Luxon token subset) in `src/card/axis/x-axis-format-validate.ts`
- [x] T006 Call `validateXAxisFormat` during `setConfig` when `x_axis_format` is present in `src/card/cumulative-comparison-chart.ts` (fail-fast per **FR-005** before `resolveTimeWindows` / `buildChartTimeline`; use helper from `src/card/axis/x-axis-format-validate.ts`)
- [x] T007 Implement `resolveLabelLocale`, adaptive and forced tick label helpers in `src/card/axis/axis-label-format.ts` (use `Intl` / Luxon per research; no month JSON in repo)
- [x] T008 Update `src/card/axis/index.ts` to re-export `src/card/axis/auto-aggregation.ts`, `src/card/axis/point-cap.ts`, `src/card/axis/x-axis-format-validate.ts`, `src/card/axis/axis-label-format.ts`
- [x] T009 [P] Add `tests/unit/auto-aggregation.test.ts` covering representative duration bands
- [x] T010 [P] Add `tests/unit/point-cap.test.ts`
- [x] T011 [P] Add `tests/unit/x-axis-format-validate.test.ts`
- [x] T012 Add `tests/unit/axis-label-format.test.ts` for locale cascade and sample tick formatting
- [x] T013 Apply auto-interval when merged `aggregation` is undefined: compute duration from merged config and set effective aggregation before `resolveTimeWindows` in `src/card/cumulative-comparison-chart.ts` (and/or `src/card/ha-api.ts` — **single source of truth** per [plan.md](./plan.md) remediation)

---

## Phase 3: User Story 1 — Automatic aggregation step from duration (Priority: P1) — MVP

**Goal**: Default aggregation from window `duration` when no manual `aggregation` remains after merge — readable bucket count (~20–100 target).

**Independent Test**: YAML with only `duration` (no `aggregation`) yields expected `WindowAggregation` from threshold table; explicit `aggregation` skips auto-interval.

**FR-002 (v1)**: Obecny model ma **jedno** pole `aggregation` po merge (`MergedTimeWindowConfig`). Per-window różne wartości wymagają rozszerzenia schematu YAML — do czasu tego **T013** realizuje precedencję przez deep merge + `config.aggregation` jak w `src/card/time-windows/merge-config.ts`.

- [x] T014 [US1] End-to-end verification: merged config without `aggregation` uses `pickAutoAggregation` path; with `aggregation` from YAML or card unchanged — confirm in `src/card/cumulative-comparison-chart.ts` and add short maintainer notes in `src/card/axis/auto-aggregation.ts` (opcjonalnie test integracyjny pod **SC-001**)

---

## Phase 4: User Story 2 — Manual override and point cap (Priority: P1)

**Goal**: Respect merged manual `aggregation` (FR-002); refuse render when timeline slots exceed `MAX_POINTS_PER_SERIES` with `ha-alert` and localized message; debug details when `debug: true`.

**Independent Test**: Config forcing >5000 points shows error state; under cap renders. Invalid `x_axis_format` already rejected by **T006** (fail-fast).

**Manual (SC-003)**: Przed release zweryfikować na telefonie / wąskim viewportcie: przy przekroczeniu limitu — stan błędu, brak „białego ekranu” (dopisać w `wiki-publish` lub release checklist jeśli potrzeba).

- [x] T015 [US2] After `buildChartTimeline` (or equivalent), call `assertPointCountWithinCap(timeline.length)` and set card error state in `src/card/cumulative-comparison-chart.ts`
- [x] T016 [US2] Add translation keys for point-cap / axis config errors in `src/translations/en.json`; **dla każdego istniejącego języka** w `src/translations/*.json` dodać te same klucze (lub jawnie udokumentować fallback do `en` w opisie PR) — wire through `src/card/localize.ts` / `createLocalize` w `src/card/cumulative-comparison-chart.ts`
- [x] T017 [US2] Emit detailed cap message to console when `config.debug` in `src/card/cumulative-comparison-chart.ts`

---

## Phase 5: User Story 3 — Adaptive X-axis labels (Priority: P2)

**Goal**: Axis labels reflect aggregation grain and calendar boundaries in HA time zone; **US6** satisfied via `Intl` (no new month/day JSON).

**Independent Test**: Without `x_axis_format`, labels show dates/times from `fullTimeline` ms, not raw indices; **first tick is a boundary** for contextual label (spec edge case).

**FR-009**: Zachować istniejące semantyki osi z `buildChartTimeline` / wyrównania serii — **T018** tylko podmienia treść etykiet, nie długość osi ani gapy.

- [x] T018 [US3] Pass `fullTimeline`, HA time zone, resolved label locale, `primaryAggregation`, and `x_axis_mode: 'adaptive'` via `ChartRendererConfig` from `src/card/cumulative-comparison-chart.ts` into `src/card/echarts-renderer.ts`
- [x] T019 [US3] In `src/card/echarts-renderer.ts` `buildOption`, replace index-only `formatXAxisLabel` with adaptive formatting from `src/card/axis/axis-label-format.ts` when `x_axis_mode` is adaptive; **indeks 0 zawsze traktowany jako granica kontekstu** (spec: pierwszy punkt poza granicą kalendarza)

---

## Phase 6: User Story 4 — Optional forced `x_axis_format` (Priority: P2)

**Goal**: Optional card-level `x_axis_format` overrides adaptive labeling (**walidacja wejścia w T006**).

**Independent Test**: Valid Luxon subset string formats every tick; invalid string fails at `setConfig` (**T006**).

- [x] T020 [US4] When forced mode, use Luxon `toFormat` in `src/card/echarts-renderer.ts` (via `src/card/axis/axis-label-format.ts`) for each tick index mapped to `fullTimeline`

---

## Phase 7: User Story 5 — Locale cascade (Priority: P2)

**Goal**: Label language: card `language` → `hass.locale.language` → `en`.

**Independent Test**: Changing HA user language changes `Intl`/format output when card language unset.

- [x] T021 [US5] Resolve label locale string in `_buildRendererConfig` (or shared helper) consistent with `src/card/localize.ts` / spec cascade in `src/card/cumulative-comparison-chart.ts`

---

## Phase 8: User Story 7 — Mobile-friendly horizontal axis (Priority: P2)

**Goal**: No rotated X labels; reduce overlap (`hideOverlap`); keep ends readable.

**Independent Test**: `axisLabel.rotate === 0`; at narrow viewport first/last tick still visible where possible (**SC-004** — uzupełnić ręcznie jeśli brak testu automatycznego).

- [x] T022 [US7] Explicitly set `axisLabel.rotate: 0` and validate `hideOverlap: true` / tick `interval` strategy in `src/card/echarts-renderer.ts` for X axis

---

## Phase 9: Polish & cross-cutting (FR-010)

**Purpose**: Documentation and release notes.

- [x] T023 [P] Update `README.md` and `wiki-publish/Aggregation-and-Axis-Labels.md` with `x_axis_format`, auto-interval, point cap, locale behavior, and **manual smoke** (over-cap error, wąski viewport — SC-003 / SC-004)
- [x] T024 [P] Update `changelog.md` Unreleased section with user-visible changes

---

## Phase 10: Tooltip matrix & `tooltip_format` (FR-011–FR-014)

**Purpose**: Aggregation-aligned tooltip headers; optional `tooltip_format`; Speckit docs + README/wiki.

- [x] T025 [P] Update Speckit docs (`spec.md`, `plan.md`, `data-model.md`, `research.md`, `contracts/card-config-axis.md`, `quickstart.md`) for tooltip US8–US11, FR-011–FR-014, EC tooltip
- [x] T026 Implement `src/card/axis/tooltip-format.ts` + `tests/unit/tooltip-format.test.ts`
- [x] T027 Add `tooltip_format` to `CardConfig`, `ChartRendererConfig` (`mergedDurationMs`, `tooltipFormatPattern`); validate in `setConfig`; wire `_buildRendererConfig` in `cumulative-comparison-chart.ts`
- [x] T028 Replace inline tooltip `formatHeader` in `echarts-renderer.ts` with `formatTooltipHeader` (`xAxisLabelLocale`)
- [x] T029 [P] i18n `status.config_invalid_tooltip_format` in `src/translations/*.json`; adjust `echarts-renderer.test.ts` tooltip expectations
- [x] T030 [P] README, `wiki-publish/Aggregation-and-Axis-Labels.md`, `changelog.md` tooltip matrix + `tooltip_format`

---

## Dependencies & execution order

### Phase dependencies

- **Phase 1** → **Phase 2** (foundational modules depend on axis entry plan)
- **Phase 2** → **Phases 3–9** (all user stories depend on foundational types + pure modules + **T006** fail-fast + **T013** pipeline hook)
- **Phase 3 (US1)** → **Phase 4 (US2)** (point cap needs final timeline length from aggregation resolution)
- **Phase 5–8** can follow Phase 4 after `ChartRendererConfig` is extended (**T002**, **T018**): **US3/US4/US5/US7** share `src/card/echarts-renderer.ts` — recommended sequence: **T018–T022**

### User story dependencies

| Story | Depends on |
|-------|------------|
| US1 | Phase 2 (**T003**, **T013**, **T014**) |
| US2 | Phase 2, US1 pipeline (timeline length); **T006** already blocks invalid `x_axis_format` |
| US3–US7 | Phase 2, renderer **T018–T022** |

### Parallel opportunities

- **T003, T004, T005** — different files after **T002**
- **T009, T010, T011** — after respective modules **T003–T007** (and **T006** needs **T002** + **T005**)
- **T023, T024** — documentation files in parallel after implementation complete

---

## Parallel example: User Story 2 (errors)

```text
# After T015 is specified, localization can proceed in parallel:
T016 [US2] src/translations/*.json + cumulative-comparison-chart.ts
T017 [US2] src/card/cumulative-comparison-chart.ts (debug logging)
```

---

## Implementation strategy

### MVP first (User Story 1)

1. Complete Phase 1–2 (through **T013**), including **T006** (fail-fast format)
2. Complete Phase 3 (**T014**)
3. **Stop and validate**: auto-interval without manual `aggregation`

### Incremental delivery

1. Add Phase 4 (US2) — safe cap and errors
2. Add Phases 5–8 — chart labels and locale
3. Add Phase 9 — docs/changelog

### Suggested MVP scope

**User Story 1 only** (Phases 1–3): automatic `WindowAggregation` from `duration` when aggregation omitted — delivers core “auto-interval” value; US2+ should follow before release to meet production safety (FR-003).

---

## Task summary

| Metric | Value |
|--------|-------|
| **Total tasks** | **30** (T001–T030) |
| **Per user story (approx.)** | US1: **T014** + **T013**; US2: **T015–T017**; US3: **T018–T019**; US4: **T020** (validation **T006**); US5: **T021**; US6: **T007/T019**; US7: **T022**; Tooltip follow-up: **T025–T030** |
| **Foundational + setup** | **13** tasks (T001–T013) |
| **Polish** | **2** (T023–T024) |
| **Tooltip (FR-011–FR-014)** | **6** (T025–T030) |

**Format validation**: Tasks **T001–T030** use checklist lines; Phase 10 adds tooltip work items **T025–T030**.
