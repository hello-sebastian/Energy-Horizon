# Feature Specification: Tech-Debt Reduction Program

**Feature Branch**: `911-tech-debt-reduction`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: self-contained specify prompt for feature `911-tech-debt-reduction` — a tech-debt reduction program for the Energy Horizon Card, modeled as ONE shared speckit feature (not 14 separate features, and not a bug triad). Requirements source: `architecture-audit-2026-11-15.md` (repo root). The prompt was pasted inline into the `/speckit.specify` command; its canonical, uncorrupted copy is `911-specify-prompt.md` in the repo root (the inline paste was partially corrupted by shell expansion, so the on-disk file is the reference).

## Overview

This feature is a **maintenance / tech-debt reduction program** for the Energy Horizon Lovelace card. It is a deliberate program of internal restructuring with **zero visible change** for the end user: the configuration schema (`CardConfig`), i18n keys, rendering, UX and the public API remain unchanged. The actor in every user story is the **Maintainer** (a developer or AI agent working on the card), not the end user.

The requirements are sourced from the architecture audit `architecture-audit-2026-11-15.md` (repo root) — a diagnosis based on the Codegraph graph (1401+ symbols, 2121 call edges, 0 import cycles), the graphify report, a review of the source (`src/` — 50 files, 11 195 lines of TypeScript; `tests/` — 64 files, 15 165 lines) and the Constitution v1.2.0. This spec **references** the audit and encodes its findings as functional requirements with acceptance criteria; it does not duplicate the audit. At the `plan` stage the audit is attached to this feature as `research.md`.

**Precedent in the repo:** feature folders outside the 900–907 domains (908, 909, 910) already exist under `specs/`; numbering is sequential (global max 910 + 1 = **911**) — directory `specs/911-tech-debt-reduction`, branch `911-tech-debt-reduction` (policy: `.cursor/rules/speckit-numbering.mdc`).

**Constitution compliance** (`.specify/memory/constitution.md` v1.2.0) is the compliance criterion for the whole program. The audit found existing violations (violation table in report §3: Article III — `any` escape hatches; Article V — simplicity/dependency justification; Article II — source disclosure in shipped artifacts; Governance — documentation quality). A purpose of this feature is to eliminate those violations; the program introduces **no new violations**.

**This is not a bug.** There is no user-visible defect and no reproduction — the bug triad (`.specify/bugs/`, assess→fix→test) is not applicable to this scope (project decision 2026-11-16).

**Prime invariant (FR-019): zero user-visible change.** The existing integration tests (load coalescing, picker preview, editor lifecycle, tooltip/panel consistency) are the **golden standard of behavior** — they must remain green with unchanged expected values throughout the program.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — A maintainer can fix and test the ready-state pipeline in one place (Priority: P1)

The card builds its "ready" state (the state after a successful data load, ready to render the chart) through three nearly identical code paths (`_loadData` / `_buildDemoState` / `_firePickerRealDataQuery` in `src/card/cumulative-comparison-chart.ts`) that together duplicate about 250 lines of orchestration (`resolveTimeWindows → buildChartTimeline → tailLabelFromIndex → alignOffsetMs → unit scaling → computeSummary → computeForecast (+ unit patching) → computeTextSummary → build CardState`). This duplication was the source of **9 out of the 10 bugs fixed** so far in this project.

**Why this priority**: the class of bugs that has struck 9 times (forecast late-start, month-start panel, new-month first day, tooltip/reference, y-axis clipping, zero-reference) gets a single place to fix and test; every new feature stops duplicating the orchestration.

**Independent Test**: ≥15 unit tests of the pure `ReadyStateBuilder` (states: ready, no-data, forecast-disabled, single-window + the preview path) plus the existing card/picker integration tests green with no UX change.

**Acceptance Scenarios**:

1. **Given** three loading paths with duplicated pipeline orchestration, **When** ready-state construction is unified in a single pure builder (`src/card/pipeline/ready-state-builder.ts`, zero Lit/DOM), **Then** each path is < 60 lines ("load series → `buildReadyState(…)`") and there is no duplicated pipeline logic.
2. **Given** a regression in pipeline logic (e.g., unit scaling, forecast unit patching), **When** it is fixed in the builder, **Then** all three paths (production / demo picker / real-data upgrade picker) behave identically, covered by one test suite.

---

### User Story 2 — A maintainer removes dead code and gets strict typing enforced by tooling (Priority: P2)

Quick wins: delete the dead Chart.js renderer and the unused `date-fns` dependency, type the LTS WebSocket responses, switch on the linter rules for strict typing, collapse the duplicated period-label logic into one pure function, and clean up shipped artifacts and documentation (TD-1, TD-3, TD-4, TD-10, TD-13).

**Why this priority**: immediate value at minimal risk; it turns on tooling-enforced strict typing, on which the later waves depend.

**Independent Test**: `npm ls date-fns` empty; 0 `as any` in the card; ESLint with the new rules green; one implementation of `formatPeriodLabel` with unit tests; the production build without `.map` files; 1 canonical changelog.

**Acceptance Scenarios**:

1. **Given** the dead `src/card/chart-renderer.ts` (428 lines, deprecated Chart.js renderer) and the unused production dependency `date-fns`, **When** both are removed (together with updating `CARD_SOURCE_FILES` in `tests/unit/localize-static-text-guard.test.ts` and the lockfile), **Then** typecheck/lint/tests are green, `dist/` contains zero trace of `ChartRenderer`, and the changelog has an entry for the removed dependency.
2. **Given** 15 uses of `any` in `src/` and an ESLint config without type rules (only `no-unused-vars`), **When** `@typescript-eslint/no-explicit-any: error`, `no-non-null-assertion: warn` and `consistent-type-imports: error` are enabled, **Then** the gate stays green (gating against TD-5 — see Edge Cases).
3. **Given** 3× `responses[i] as any` in the card (LTS WebSocket responses typed `unknown`) and ~12 `any` in `echarts-renderer.ts`, **When** the type `LtsMessageResponse` is added plus an adapter `extractLtsResults(response)` handling both observed response shapes (`{ results }` and "bare" `results`), **Then** there is zero `as any` in `cumulative-comparison-chart.ts`, the adapter has tests for both shapes, and the existing `ha-api.test.ts` tests are green with unchanged semantics.
4. **Given** duplicated period-label logic (Jan 1 → year only; otherwise `Intl` month-long + year) in `updated()` and `_buildRendererConfig()`, **When** it is replaced by one pure function `src/card/labels/period-label.ts` (`formatPeriodLabel(instant, locale, zone)`), **Then** there is 1 implementation + unit tests (Jan 1, Dec 31, time zones, 5 languages).
5. **Given** the production sourcemap (`dist/energy-horizon-card.js.map`, 3.86 MB) published to `www/community/`, a tracked dead `temp/` directory, a working comment "do usunięcia przed commit" in the committed `constitution.md`, `jsx: "react-jsx"` in tsconfig with no JSX in the project, and release notes in three places, **When** the hygiene work is done, **Then** the production build has no `.map` (dev/preview maps preserved), no tracked temp files, the constitution has no working comments, there is 1 canonical changelog (`changelog.md`), and the wiki Troubleshooting gets a "Known simplifications: number format → locale mapping" section.

---

### User Story 3 — A maintainer gets state invariants enforced by the compiler (Priority: P2)

Turn the card's state model into a discriminated union so an invalid state cannot be written, type the ECharts options with the official types, and enable `noUncheckedIndexedAccess` (TD-11, TD-5, TD-6).

**Why this priority**: eliminates a runtime error class — an incorrect state becomes un-writable (violation of Articles III/II).

**Independent Test**: the discriminated-union `CardState` compiles with its invariants; 0× `any` in `echarts-renderer.ts`; the `noUncheckedIndexedAccess` flag ON with a green gate.

**Acceptance Scenarios**:

1. **Given** four preview fields in the flat state model (`previewShift`, `previewSeries`, `previewWindows`, `previewChartTime`) + transient state living in three places (element field, state, `updated()` logic) and an uncorrected `CardState.status` union, **When** `CardState` becomes the discriminated union `LoadingState | ErrorState | NoDataState | ReadyState` (where `ReadyState` requires `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime` and optionally carries `preview?: PreviewSnapshot`), **Then** the invariants are enforced by the compiler, there are 0 non-null assertions in `render()`/`updated()`, and the "ready without series" state is impossible to write.
2. **Given** ~12 uses of `any` in building the ECharts options (`series: any[]`, `markLineData: any[]`, `(series[i] as any).markLine = …`) with the `EChartsOption` type imported on line 7 but unused, **When** the options are typed with `EChartsOption`/`LineSeriesOption` (series built as typed objects before `setOption`), **Then** there is 0× `any` in `echarts-renderer.ts` and the renderer tests are green.
3. **Given** 65 non-null assertions `]!` across the card sources (distribution: `ha-api.ts` 20, card element 16, picker 9; the rest fixed by typing), **When** the `noUncheckedIndexedAccess` flag is enabled and the assertions are replaced with explicit guards (error) or a helper (e.g., `firstDefined(arr)`) or correct typing, **Then** the flag is ON, there are 0 non-null assertions (exception: at most 5, each with a `// justified: <reason>` comment accepted in PR review), and the tests are green — catching any real off-by-one.

---

### User Story 4 — A maintainer reads and extends cohesive modules instead of a god file (Priority: P3)

Slim `ha-api.ts`, extract the narrative logic and the render view-model into pure functions, and extract the editor's YAML mode into a controller (TD-7, TD-8, TD-9, TD-12).

**Why this priority**: long-term readability and testability of the business logic; it depends on US1/US3 (ordering decided in the plan).

**Independent Test**: `ha-api.ts` < 400 lines; narrative and view-model as pure functions with unit tests; `render()` < 200 lines; `yaml-mode` tested without a DOM; the editor shell < 1000 lines.

**Acceptance Scenarios**:

1. **Given** the legacy single-window API (`buildLtsQuery`, `mapLtsResponseToSeries`, `buildComparisonPeriod`) used only by 2 tests, and the `ha-api.ts` module (805 lines) mixing 4 responsibilities, **When** the legacy API is removed (after the preset golden tests are first migrated to the multi-window API — `buildMergedTimeWindowConfig` + `resolveTimeWindows`) and the timeline (`buildChartTimeline`/`buildFullTimeline*`/`buildTimelineSlots`/`firstTailAxisLabelIndex`) is moved to `src/card/timeline/`, **Then** `ha-api.ts` is < 400 lines (query build + LTS mapping + `computeSummary`/`computeForecast`/`computeTextSummary`/`fullReferenceWindowRawTotal`), with 0 behavior change and no legacy imports from `src/`.
2. **Given** business logic inline in `render()` (~600 lines): the `forecast.disabledReason` → i18n key mapping (6 values) and the 4-branch narrative selection (`interpretationSemantics.outcome`) defined in domain spec 903, **When** it is extracted to pure functions in `src/card/narrative/` (`forecastDisabledReasonKey(reason)`, `resolveNarrativeSegment(outcome, neutralKind, language, entityKind)`), **Then** `render()` loses ~150 lines of logic and the functions are covered by unit tests (edges: no reference, `insufficient_data`, neutral band/similar).
3. **Given** `render()` computing captions, formatted numbers, `warningMessages`, the Forecast|Total panel gating, and `effectiveTitle`/`effectiveIcon` inline, **When** a pure `buildCardViewModel(state, config, hass, localize) → CardViewModel` is introduced, **Then** `render()` is a pure template over the VM (target < 200 lines), the VM is covered by unit tests (states: ready/no-data/error/preview/single-window), and `render()` makes no `compute*`/`format*` domain calls except destructuring the VM.
4. **Given** the editor's YAML mode (parse/emit/self-echo, 3 debounce timers) and focus/caret/scroll restoration mixed into the `energy-horizon-card-editor.ts` shell (1375 lines) over the exemplary `FIELD_REGISTRY`, **When** the YAML-mode controller is extracted as `src/card/editor/yaml-mode.ts` (a small state machine: text, parseError, lastEmitted, self-echo, debounce; API `parse(config) → {text?, error?}` / `commit(text) → {config?, error?}`) and focus/scroll moves to `editor-ui-state.ts` (extending the existing `EditorUiState` model with `focusTarget`/`scrollTop`), **Then** the shell is < 1000 lines (render + event routing), `yaml-mode` is tested without a DOM, and the editor lifecycle/coverage tests are green.

---

### User Story 5 — A maintainer extracts the picker (910) into a module (Priority: P3, optional — Wave 4, only after US1/TD-2)

Complete the decomposition of the god file: the time-window picker (feature 910) becomes the simplest consumer of the ready-state builder (TD-14).

**Why this priority**: optional completion of the god-file decomposition; the picker becomes the simplest consumer of the builder.

**Independent Test**: the card element < 1200 lines; the picker tests green; the 910 semantics (its FR-010/013/014) preserved.

**Acceptance Scenarios**:

1. **Given** the picker logic (`_firePickerRealDataQuery`, `_buildDemoState`, `_pickerRealDataFired` + the glue with `picker-preview.ts`) living in the card element, **When** it is extracted to a `src/card/picker/` module with a single hook mounted in the element (`attachPicker(element, config, onState)`), **Then** the element is < 1200 lines, the picker tests are green, and the `preview` flags preserve the 910 semantics.

---

### Edge Cases

1. `dist/` is **committed** — every PR touching code rebuilds `dist/` (CI `verify-dist` compares and rejects an out-of-sync `dist/`).
2. TD-1: removing the file requires updating `CARD_SOURCE_FILES` in `tests/unit/localize-static-text-guard.test.ts` (the list of files scanned by the static-text guard).
3. TD-7: the preset golden tests (`time-windows-presets-golden.test.ts`, `ha-api.test.ts`) must be migrated to the multi-window API (`buildMergedTimeWindowConfig` + `resolveTimeWindows`) **before** the legacy API is removed.
4. TD-3: the `extractLtsResults` adapter must handle both observed LTS response shapes (`{ results }` and "bare" `results`).
5. TD-4 ↔ TD-5 (gating): `no-explicit-any: error` must not leave the gate red — decision in the plan: (a) a temporary scoped `eslint-disable` for `echarts-renderer.ts` referencing TD-5 (removed in TD-5), or (b) pull TD-5 into Wave 1.
6. TD-2 ↔ TD-11 (interaction): the builder's output is `CardState` — the two tasks are coupled; they must sit in the same wave (W2) with a documented, explicit order (plan decision, after the FR-017 assess) to avoid an intermediate state in which the builder produces the old state shape.
7. TD-14: the 910 semantics (spec 910 FR-010/013/014, the `preview` flags) must be preserved 1:1.
8. TD-9 depends on the completion of TD-8 and TD-10 (the view-model consumes the narrative and the period label).
9. TD-13: the sourcemap is disabled for the **production** artifact only — dev/preview keep their maps; the wiki Troubleshooting gets a note on the `numberFormatToLocale` simplification (a user with `en-GB` and a comma gets the `de` format — known, documented).
10. Builder: every card state (ready / no-data / error / single-window / preview / forecast-disabled) must go through the single builder — including the "no data" and "forecast disabled" paths (not only the happy path).

## Requirements *(mandatory)*

### Functional Requirements

*(Numbering kept as FR-001…FR-019; `TD-x` references = task numbering of `architecture-audit-2026-11-15.md` §4 for traceability.)*

- **FR-001 (TD-1)**: System SHALL not contain dead code or unjustified production dependencies: remove `src/card/chart-renderer.ts` and `date-fns` from `dependencies` (`package.json`), update `CARD_SOURCE_FILES` in `tests/unit/localize-static-text-guard.test.ts`, update the lockfile, rebuild `dist/`. *Acceptance:* typecheck/lint/tests green; `npm ls date-fns` empty; zero trace of `ChartRenderer` in `dist/`; changelog entry "Removed unused runtime dependency". (Constitution: V, dependency justification, III.)
- **FR-002 (TD-2, PRIORITY)**: System SHALL build the ready state through a single pure pipeline: new module `src/card/pipeline/ready-state-builder.ts` (pure functions, zero Lit/DOM) `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState` covering `tailLabelFromIndex`, `alignOffsetMs`, unit scaling, `computeSummary`, `computeForecast`, unit patching, `computeTextSummary`; extract `_applyUnitScalingToSeries` to `src/utils/unit-scaler.ts` (pure function, `force_prefix` as a parameter); `_loadData`, `_buildDemoState`, `_firePickerRealDataQuery` → each < 60 lines of orchestration. *Acceptance:* 1 builder call per path (zero duplicated orchestration — verified in review); ≥15 unit tests of the builder (all states: ready, no-data, forecast-disabled, single-window + preview); card/picker integration tests green without UX changes. (Constitution: V, III. Requires the assess pre-flight — FR-017.)
- **FR-003 (TD-3)**: System SHALL type LTS WebSocket responses: add `LtsMessageResponse` (the `result` shape, covering both observed forms: `{ results }` and "bare" `results`) + adapter `extractLtsResults(response)`; `mapLtsResponseToCumulativeSeries` accepts the typed input; remove 3× `responses[i] as any`. *Acceptance:* 0 `as any` in `cumulative-comparison-chart.ts`; adapter test for both shapes; existing tests green without semantics change. (Constitution: II, III.)
- **FR-004 (TD-4)**: System SHALL enforce strict typing with the linter: in `config/eslint.config.js` set `@typescript-eslint/no-explicit-any: "error"`, `no-non-null-assertion: "warn"`, `consistent-type-imports: "error"`. *Acceptance:* 0 errors in `src/` with a green gate (gating against TD-5 — see Edge Cases); the non-null warnings cataloged (removed by TD-6). (Constitution: III — this time enforced by tooling.)
- **FR-005 (TD-5)**: System SHALL type ECharts options with the official types: in `echarts-renderer.ts` replace the local `any[]` types with `LineSeriesOption`/`EChartsOption` (the type is already imported on line 7); build the series as typed objects before `setOption` (eliminating `(series[i] as any).markLine = …`). *Acceptance:* 0× `any` in `echarts-renderer.ts`; renderer tests green. (Constitution: III.)
- **FR-006 (TD-6)**: System SHALL enable `noUncheckedIndexedAccess` in `tsconfig.json` and fix the 65 `]!` non-null assertions (distribution: `ha-api.ts` 20, card 16, picker 9; the rest via typing); where the contract guarantees non-emptiness — an explicit guard with an error or a helper (e.g., `firstDefined(arr)`). *Acceptance:* flag ON; 0 non-null assertions (exception: at most 5, each with a `// justified: <reason>` comment accepted in PR review); tests green. (Constitution: III.)
- **FR-007 (TD-7)**: System SHALL slim `ha-api.ts` to a single-responsibility module: remove the legacy `buildLtsQuery`/`mapLtsResponseToSeries`/`buildComparisonPeriod` (after the preset golden tests are first migrated to the multi-window API), move the timeline (`buildChartTimeline`/`buildFullTimeline*`/`buildTimelineSlots`/`firstTailAxisLabelIndex`) to `src/card/timeline/`; `ha-api.ts` keeps: query build + LTS mapping + `computeSummary`/`computeForecast`/`computeTextSummary`/`fullReferenceWindowRawTotal`. *Acceptance:* `ha-api.ts` < 400 lines; 0 behavior change (the whole test battery green); no legacy imports from `src/`. (Constitution: III, V.)
- **FR-008 (TD-8)**: System SHALL keep narrative logic as pure domain functions: `src/card/narrative/` with (a) `forecastDisabledReasonKey(reason)` (the 6-value mapping), (b) `resolveNarrativeSegment(outcome, neutralKind, language, entityKind)` (4-branch selection → key + variables); `render()` only formats and wraps in Lit. *Acceptance:* unit tests of both functions (edges: no reference, `insufficient_data`, neutral band/similar); `render()` loses ~150 lines of logic; consistency with domain 903 (the narrative engine in the spec vs. in code). (Constitution: V, III.)
- **FR-009 (TD-9, depends on TD-8 and TD-10)**: System SHALL compute the render view-model as a pure function: `buildCardViewModel(state, config, hass, localize) → CardViewModel` (captions, formatted summary/forecast numbers, `warningMessages`, `narrativeBody`, the Forecast|Total panel gating, `effectiveTitle`/`effectiveIcon`); `render()` = a pure template over the VM. *Acceptance:* the VM covered by unit tests (ready/no-data/error/preview/single-window); `render()` < 200 lines, with no `compute*`/`format*` domain calls except destructuring the VM. (Constitution: V, III.)
- **FR-010 (TD-10)**: System SHALL have a single source for the period label: a pure function in `src/card/labels/period-label.ts` (`formatPeriodLabel(instant, locale, zone)` — the Jan 1 → year edge; otherwise month-long+year); replace the duplicates in `updated()` and `_buildRendererConfig()`. *Acceptance:* 1 implementation; unit tests (Jan 1, Dec 31, time zones, 5 languages); card tests green. (Constitution: V.)
- **FR-011 (TD-11)**: System SHALL model card state as a discriminated union: `CardState = LoadingState | ErrorState | NoDataState | ReadyState`; `ReadyState` with required `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime` (field set finalized by the FR-017 assess, 2026-11-16) and optional `preview?: PreviewSnapshot` (`previewShift + previewSeries + previewWindows + previewChartTime`); remove `previewShift` from the state fields (the element remains the source of the shift; the snapshot in state serves `render()`). *Acceptance:* invariants enforced by the compiler; 0 non-null assertions in `render()`/`updated()`; card tests green. (Constitution: III, II. Requires the assess pre-flight — FR-017; interaction with FR-002 — see Edge Cases.)
- **FR-012 (TD-12)**: System SHALL extract the editor YAML mode into a controller: `src/card/editor/yaml-mode.ts` (state machine: text, parseError, lastEmitted, self-echo, debounce parse/emit; API `parse(config) → {text?, error?}` / `commit(text) → {config?, error?}`); focus/scroll restoration into `editor-ui-state.ts` (extending the existing `EditorUiState` model with `focusTarget`/`scrollTop`); the shell `energy-horizon-card-editor.ts` keeps: render + event routing. *Acceptance:* shell < 1000 lines; `yaml-mode` tested without a DOM; editor lifecycle/coverage tests green. (Constitution: III, V.)
- **FR-013 (TD-13)**: System SHALL ship clean artifacts and consistent documentation governance: remove the working header ("SYNC IMPACT REPORT … do usunięcia przed commit") from `constitution.md`; remove the tracked `temp/`; remove `jsx: "react-jsx"` from `tsconfig.json`; `sourcemap: false` in `config/vite.config.ts` for the production artifact (dev/preview — unchanged); `changelog.md` as the single canonical changelog (move `release-notes-1.2.0.md` and `release-notes/` to `docs/archive/`); add a "Known simplifications: number format → locale mapping" section to the wiki Troubleshooting (`wiki-publish/Troubleshooting-and-FAQ.md`, documenting the existing `numberFormatToLocale` simplification). *Acceptance:* no tracked temp files; build without `.map` (dist ~3.86 MB smaller — the committed `dist/energy-horizon-card.js.map`); 1 canonical changelog; constitution without working comments. (Constitution: II, Governance.)
- **FR-014 (TD-14, optional, Wave 4, only after FR-002)**: System SHALL extract the picker (910) into a module: `src/card/picker/` (`_firePickerRealDataQuery`, `_buildDemoState`, `_pickerRealDataFired` + the glue with `picker-preview.ts`) with a single hook `attachPicker(element, config, onState)` mounted in the element. *Acceptance:* element < 1200 lines; picker tests green; the `preview` flags preserve the 910 semantics (spec 910 FR-010/013/014). (Constitution: addendum — advanced features must not complicate the basic experience; in code: they must not complicate the element either.)
- **FR-015 (cross-cutting — PR discipline)**: Each of the 14 tasks SHALL be delivered as a **separate PR** + minimum 1 review + a changelog entry + tests (new unit tests for every extracted pure function — Waves 3–4 dramatically raise the unit-test coverage of the business logic, instead of DOM tests). (Constitution: development workflow and quality.)
- **FR-016 (cross-cutting — domain documentation)**: Tasks that change domain truth SHALL update in the same PR the corresponding domain `spec.md` (900–907) — the domains are the declared "single source of truth" (`specs/README.md`). Mapping: FR-002 → 901+903; FR-003 → 901; FR-007 → 900+901; FR-001/FR-005 → 902; FR-008/FR-009/FR-011/FR-014 → 903; FR-010 → 905; FR-012 → 904; FR-013 → 907. (FR-004/FR-006 — configuration only, no domain spec.)
- **FR-017 (cross-cutting — assess pre-flight)**: Before Wave 2 starts, short assessments (the assess pipeline: intake→research→define→shape→decide) for FR-002 and FR-011 SHALL be performed in `.specify/assessments/` — precedent: `timewindow-preview` before feature 909. The results (options, invariants, risks, ordering decisions) SHALL feed into `plan.md`.
- **FR-018 (cross-cutting — wave gates)**: After each of the 4 waves, the full gate `npm test && npm run typecheck && npm run lint && npm run build` SHALL pass + `dist/` update (CI `verify-dist`) + `speckit.converge` as a drift check (code vs. spec/plan/tasks; the last converge = the program's exit gate).
- **FR-019 (cross-cutting — the invariant)**: All tasks SHALL preserve zero user-visible change (the `CardConfig` schema, i18n keys, rendering and UX unchanged; the integration tests as the golden standard — expected values unchanged; `wiki-publish/` unchanged except for FR-013).

### Key Entities

- **ReadyStateBuilder** — the pure function `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState` (`src/card/pipeline/ready-state-builder.ts`); the single consumer contract: the 3 loading paths.
- **CardState** (new shape) — the discriminated union `LoadingState | ErrorState | NoDataState | ReadyState`; `ReadyState`: required `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime`; optional `preview?: PreviewSnapshot`.
- **PreviewSnapshot** — `{ previewShift, previewSeries, previewWindows, previewChartTime }` (the 909 transient state in a single object).
- **LtsMessageResponse / extractLtsResults** — the type + adapter for LTS WebSocket responses (both observed `result` shapes).
- **CardViewModel** — the result of `buildCardViewModel(state, config, hass, localize)`: captions, numbers, warnings, narrative, panel gates, title/icon.
- **formatPeriodLabel** — the pure period-label function (`src/card/labels/period-label.ts`).
- **timeline module** — `src/card/timeline/`: `buildChartTimeline`, `buildFullTimeline*`, `buildTimelineSlots`, `firstTailAxisLabelIndex`.
- **yaml-mode controller** — `src/card/editor/yaml-mode.ts`: the state machine of the editor's YAML mode.
- **unit-scaler** — `src/utils/unit-scaler.ts`: absorbs `_applyUnitScalingToSeries` (`force_prefix` as a parameter).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0× `any` in `src/`; ESLint `no-explicit-any: error` passes without exceptions (end-state after TD-5; the interim TD-4 scoped disable is tracked in plan.md Complexity Tracking).
- **SC-002**: `noUncheckedIndexedAccess: true`; 0 non-null assertions (exception: at most 5, each with a `// justified: <reason>` comment accepted in PR review).
- **SC-003**: `ha-api.ts` < 400 lines; each of the 3 loading paths < 60 lines of orchestration; after TD-14 the card element < 1200 lines.
- **SC-004**: `package.json` without `date-fns`; `chart-renderer.ts` does not exist; `dist/` without `.map` and without any `ChartRenderer` trace.
- **SC-005**: 1 canonical changelog; no tracked `temp/` files; the constitution without working comments.
- **SC-006**: ≥15 unit tests of the builder; unit tests for the VM, narrative, `period-label`, `yaml-mode` and the LTS adapter.
- **SC-007**: After every PR and after every wave: `npm test && npm run typecheck && npm run lint && npm run build` green + CI `verify-dist` green.
- **SC-008**: 0 remaining violations from the audit's violation table (report §3).
- **SC-009**: Delivery in 4 waves (milestones): **W1:** TD-1, TD-3, TD-4, TD-10, TD-13 (1–2 days) — dead weight, type enforcement, single label, hygiene; **W2:** TD-2 (priority), TD-7, TD-11 (~1 week) — pipeline unification, pure data modules, invariants in the types; **W3:** TD-5, TD-6, TD-8, TD-9, TD-12 (~1 week) — zero `any`/`!`, pure business modules (narrative, view-model), the testable editor controller; **W4:** TD-14 (optional, only after W2) — completing the god-file decomposition.

## Assumptions

1. `luxon` remains the only date library (37 production uses); `date-fns` has zero uses (verified: it does not reach the bundle).
2. The ECharts tree-shaking (`echarts/core` + only the used components: Line, Grid, Tooltip, Legend, MarkLine, MarkPoint, Canvas) remains unchanged.
3. The public `CardConfig` schema and the i18n keys are unchanged.
4. The integration tests (load coalescing, picker preview, editor lifecycle, tooltip/panel consistency) are the golden standard of behavior and are not modified.
5. No new NPM dependencies (the only dependency change: removing `date-fns`).
6. The "do not touch" mechanisms (audit §5) stay: the editor's Registry pattern (908), the load generation mechanism (`_loadGeneration`/`_inFlightGeneration`), the pure `src/card/time-windows/` core, the custom `src/ha-types.ts`.
7. Feature numbering: 911 = global max (910) + 1, sequential mode (`init-options.json`, `create-new-feature.sh`).

## Out of Scope

*(including the "do not touch" list)*

1. Any user-visible change: behavior, UX, configuration schema, i18n keys, card appearance.
2. New product features (including extending the 909 preview — e.g., changing the window size in preview).
3. Performance work — the existing mechanisms (`lastHash`, load coalescing, point cap, auto-aggregation) are sufficient.
4. Dependency upgrades other than removing `date-fns`.
5. The content of `wiki-publish/` — except the FR-013 note (Troubleshooting).
6. Rewriting specs 908–910 (the 910 semantics is preserved, not rewritten).
7. Refactoring: the Registry pattern, the load generation mechanism, the `time-windows/` core, `ha-types.ts`.
8. The bug triad workflow (`.specify/bugs/`) — this is a tech-debt program, not a defect; the assessment-as-fix-contract does not apply here.
9. Changes to the speckit process (scripts, templates, extensions) — the program uses the existing process.

## Glossary

- **LTS** — long-term statistics; the `long_term_statistics` HA WebSocket service, the source of the card's historical data.
- **Ready state** — the card state after a successful data load (ready to render the chart).
- **Builder** — the pure function unifying ready-state construction (`ReadyStateBuilder`).
- **Wave** — a delivery milestone of the plan: a group of tasks ending with the full gate and `speckit.converge`.
- **God file** — a file with many responsibilities; here: `src/card/cumulative-comparison-chart.ts` (1856 lines).
- **Golden test** — a test encoding the expected behavior, not modifiable within the program (the baseline standard for "zero change").
- **Domain (900–907)** — the topical areas in `specs/` whose `spec.md` is the "single source of truth" for that area.
