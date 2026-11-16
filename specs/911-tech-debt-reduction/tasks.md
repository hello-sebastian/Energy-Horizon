---

description: "Task list for the 911 tech-debt reduction program (14 TD tasks, 4 waves)"
---

# Tasks: Tech-Debt Reduction Program (911)

**Input**: Design documents from `/specs/911-tech-debt-reduction/`

**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/ ✓ | quickstart.md ✓ | `.specify/memory/constitution.md` ✓ | `.specify/assessments/ready-state-builder/` ✓ (done 2026-11-16) | `.specify/assessments/cardstate-union/` ✓ (done 2026-11-16)

**Branch**: `911-tech-debt-reduction` (all work; plan decision D4)

## Organization Note — waves, not stories

The speckit default groups phases by user story; this program instead uses the plan's **4-wave structure** (plan decision D3, spec SC-009, FR-018 gates) as the phase axis, because the spec's user stories **cross waves**: TD-7 (US4) ships in Wave 2 next to the P1 story, and TD-5/TD-6 (US3) deliberately wait for Wave 3 until the W2 state changes land. Every task carries its `[USx]` label for traceability; wave gate and setup/polish tasks carry no story label. The story↔wave map is in *Dependencies & Execution Order*.

## Program Rules (apply to every TD task — FR-015 / FR-016 / FR-018 / FR-019)

1. **1 task = 1 PR**: own task branch from `911-tech-debt-reduction` → `main`, ≥ 1 review, **changelog entry** in the canonical `changelog.md` (established by TD-13), committed `dist/` rebuild (CI `verify-dist`).
2. **Per-PR gate (before merge)**: `npm test && npm run typecheck && npm run lint && npm run build` — green.
3. **FR-016 domain spec update in the same PR** (the domains 900–907 are the declared single source of truth):

   | TD | Domain spec(s) to update | | TD | Domain spec(s) |
   |---|---|---|---|---|
   | TD-1 | 902 | | TD-8 | 903 |
   | TD-2 | 901 + 903 | | TD-9 | 903 |
   | TD-3 | 901 | | TD-10 | 905 |
   | TD-4 | — (config only) | | TD-11 | 903 |
   | TD-5 | 902 | | TD-12 | 904 |
   | TD-6 | — (config only) | | TD-13 | 907 |
   | TD-7 | 900 + 901 | | TD-14 | 903 |

4. **FR-019 zero user-visible change**: `CardConfig` schema, i18n keys, rendering, UX unchanged; golden integration tests (load coalescing, picker preview, editor lifecycle, tooltip/panel consistency) green with **unchanged expected values**; `wiki-publish/` unchanged except TD-13.
5. **Tests are mandatory** (spec FR-015 + per-FR acceptance): new unit tests for every extracted pure function. Where an assessment says so (TD-2, TD-7, TD-11), tests/migrations are written **before** the refactor (characterization-first).
6. **Wave gate (FR-018)**: after each wave — full gate + committed `dist/` + `speckit.converge` drift check (code vs. spec/plan/tasks). The **last** converge (end of W4, or end of W3 if TD-14 is skipped) is the program's **exit gate** (SC-008: 0 remaining audit §3 violations).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks; the only shared file between [P] tasks is the one-line changelog addition — rebase if needed)
- **[Story]**: Which user story the task belongs to (US1–US5, from spec.md)
- Exact file paths in every description; acceptance from spec.md (verbatim FR) + quickstart.md wave checks

## Path Conventions

Single project: `src/`, `tests/`, `config/` at repository root; `specs/9xx-*/spec.md` for domain docs; `changelog.md` canonical; `dist/` committed.

---

## Phase 1: Setup (Program Bootstrap)

**Purpose**: verify the golden-standard baseline before any TD PR; confirm the FR-017 assess pre-flight is in place (it gates Wave 2).

- [x] T001 Verify baseline gate on `911-tech-debt-reduction`: — **done 2026-11-16** (62 test files / 678 tests passed, typecheck + lint + build green, committed `dist/` verified in sync) `npm ci && npm test && npm run typecheck && npm run lint && npm run build` all green and committed `dist/` in sync (CI `verify-dist` green) — this is the FR-019 golden-standard baseline the whole program must never regress (quickstart.md *Baseline*)
- [x] T002 FR-017 assess pre-flight for FR-002 (TD-2) and FR-011 (TD-11) in `.specify/assessments/` — **done 2026-11-16** (both verdicts *go*, Option A; ordering TD-2→TD-11 confirmed = plan decision D2; results summarized in research.md §7 and fed into plan.md)

**Checkpoint**: baseline green; assessments on file — Wave 1 may start.

---

## Phase 2: Wave 1 — Dead weight, strict typing on, hygiene (spec US2: TD-13, TD-1, TD-3, TD-4, TD-10)

**Goal**: quick wins at minimal risk (US2): remove dead code + unjustified dependency, type the LTS responses, switch on the strict-typing lint rules (which gate all later waves), one period-label source, clean artifacts and documentation governance. 1–2 days (plan D3).

**Independent Test** (quickstart.md *After Wave 1*): `npm ls date-fns` empty; `src/card/chart-renderer.ts` gone; 0 `as any` in `cumulative-comparison-chart.ts`; LTS adapter unit tests pass for both shapes; period-label unit tests pass (Jan 1 / Dec 31 / time zones / 5 languages); production build has no `.map`; `config/eslint.config.js` carries the three new rules; single scoped `eslint-disable` in `echarts-renderer.ts` referencing TD-5; full gate + `dist/` green.

### Tasks (each = own PR per Program Rules)

- [x] T003 [US2] **TD-13** (FR-013, first in W1 — establishes the canonical `changelog.md` all later PRs write into) — **done 2026-11-16**: remove the working header (lines 1–7, "SYNC IMPACT REPORT … do usunięcia przed commit") from `.specify/memory/constitution.md`; remove the tracked `temp/` directory from git; remove `jsx: "react-jsx"` from `tsconfig.json`; set `sourcemap: false` in `config/vite.config.ts` for the **production** artifact only (dev/preview maps preserved — edge case 9); make `changelog.md` the single canonical changelog by moving `release-notes-1.2.0.md` and `release-notes/` to `docs/archive/`; add a "Known simplifications: number format → locale mapping" section to the wiki Troubleshooting page `wiki-publish/Troubleshooting-and-FAQ.md` (documents the existing `numberFormatToLocale` behavior — the only `wiki-publish/` change in the program, allowed by FR-013/FR-019). *Acceptance:* no tracked temp files; `npm run build` produces no `.map` (dist ~3.86 MB smaller — the committed `dist/energy-horizon-card.js.map`); 1 canonical changelog; constitution without working comments. *Domain spec: 907.*
- [x] T004 [P] [US2] **TD-1** (FR-001) — **done 2026-11-16**: delete the dead Chart.js renderer `src/card/chart-renderer.ts` (428 lines, never bundled); remove `date-fns` from `dependencies` in `package.json` and regenerate the lockfile; update `CARD_SOURCE_FILES` in `tests/unit/localize-static-text-guard.test.ts` (edge case 2); rebuild `dist/`. *Acceptance:* typecheck/lint/tests green; `npm ls date-fns` empty; zero trace of `ChartRenderer` in `dist/`; changelog entry "Removed unused runtime dependency". *Domain spec: 902.*
- [ ] T005 [P] [US2] **TD-3** (FR-003, contract: [contracts/lts-websocket-response.md](contracts/lts-websocket-response.md)): add type `LtsMessageResponse` (envelope `{ result: { results } }` **and** bare `{ results }` forms) + adapter `extractLtsResults(response): LtsStatisticsResponse | undefined` in `src/card/ha-api.ts` (single normalization point; never throws on malformed input — Article II; entity-id lookup with first-key fallback stays in the mapper); make `mapLtsResponseToCumulativeSeries` accept the typed input and **delete the 3× `responses[i] as any`** in `src/card/cumulative-comparison-chart.ts` (the `_loadData` loop + the two preview-path call sites); add adapter unit tests for both shapes in `tests/unit/`. *Acceptance:* 0 `as any` in `cumulative-comparison-chart.ts`; `ha-api.test.ts` green with unchanged semantics; malformed input → existing no-data path, byte-for-byte. *Domain spec: 901.*
- [ ] T006 [US2] **TD-4** (FR-004, after T005 — plan decision D1): in `config/eslint.config.js` enable `@typescript-eslint/no-explicit-any: "error"`, `no-non-null-assertion: "warn"`, `consistent-type-imports: "error"`; add the **temporary scoped `eslint-disable`** for `no-explicit-any` on `src/card/echarts-renderer.ts` only, with a comment referencing TD-5 (removed in T013 of Wave 3 — edge case 5); catalog the resulting non-null warnings (they are TD-6's removal list). *Acceptance:* gate green; the disable scope is exactly one file, traceable to TD-5. *No domain spec (config only).*
- [ ] T007 [US2] **TD-10** (FR-010, after T005 — same element file): create `src/card/labels/period-label.ts` with the pure `formatPeriodLabel(instant, locale, zone)` (Jan 1 → year only; otherwise `Intl` month-long + year); replace the two literal duplicates in `src/card/cumulative-comparison-chart.ts` (`updated()` preview branch + `_buildRendererConfig()`); unit tests in `tests/unit/` (Jan 1, Dec 31, time zones, all 5 languages). *Acceptance:* exactly 1 implementation; card tests green. *Domain spec: 905.*
- [ ] T008 **W1 gate** (FR-018): full gate `npm test && npm run typecheck && npm run lint && npm run build` + committed `dist/` rebuild (CI `verify-dist`) + `speckit.converge` drift check (code vs. spec/plan/tasks)

**Checkpoint**: Wave 1 done — tooling enforcement is ON (catches any `any`/`!` regression in all later waves); dead weight gone. Wave 2 may start (assess pre-flight already satisfied, T002).

---

## Phase 3: Wave 2 — Pipeline unification + state invariants (spec US1: TD-2 · US4: TD-7 · US3: TD-11)

**Goal**: the program's core (~1 week, plan D3): the P1 story — one pure ready-state pipeline (US1/TD-2) — plus the timeline/ha-api slimming it pairs with (US4/TD-7) and the compiler-enforced state invariants (US3/TD-11). Order within the wave: **TD-2 → TD-7 → TD-11** (plan D2, confirmed by the FR-017 assessments — TD-11 strictly after TD-2 merges).

**Independent Test** (quickstart.md *After Wave 2*): assessments present (done, T002); `ready-state-builder` unit tests ≥ 15 green (ready / no-data / forecast-disabled / single-window / preview); 1 builder call per path, each < 60 lines; `ha-api.ts` < 400 lines; no legacy API imports from `src/`; `src/card/timeline/` exists with `buildChartTimeline`, `buildFullTimeline*`, `buildTimelineSlots`, `firstTailAxisLabelIndex`; typecheck shows the `CardState` union with `ReadyState` requiring its fields and `preview?: PreviewSnapshot`; 0 non-null assertions on state in `render()`/`updated()`; golden integration suite green, expected values unchanged.

### Tasks (each = own PR per Program Rules)

- [ ] T009 [US1] **TD-2 (PRIORITY)** (FR-002; design: [data-model.md §3](data-model.md) + assessment `.specify/assessments/ready-state-builder/`): **characterization first** (assessment R1): write per-path unit tests pinning today's exact output of `_loadData` / `_buildDemoState` / `_firePickerRealDataQuery` (summary/forecast/units/timeline) and make them pass; then create `src/card/pipeline/ready-state-builder.ts` — pure `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState` (zero Lit/DOM, `time-windows/` pattern) covering `tailLabelFromIndex` → `alignOffsetMs` → unit scaling → `computeSummary` → `computeForecast` (+ unit patching) → `computeTextSummary` → state assembly for **every** state variant (ready, no-data, error variants, forecast-disabled, single-window, preview — edge case 10, no happy-path-only builder); extract `_applyUnitScalingToSeries` (element :949–1041) into `src/utils/unit-scaler.ts` as `applyUnitScalingToSeries(series, rawUnit, { force_prefix })` (`force_prefix` a parameter — no element access); reduce `_loadData`, `_buildDemoState`, `_firePickerRealDataQuery` each to < 60 lines of orchestration ("load series → `buildReadyState(…)`"); keep the load-generation guards, `hass` subscription and stale-result discard in the element shell (do-not-touch); ≥ 15 builder unit tests in `tests/unit/ready-state-builder.test.ts` (SC-006). *Acceptance:* 1 builder call per path, zero duplicated orchestration (0 `computeSummary`/`computeForecast`/`computeTextSummary` calls left in `cumulative-comparison-chart.ts`); unit-scaler tests green (math unchanged); card/picker integration tests green with no UX change. *Domain specs: 901 + 903.*
- [ ] T010 [US4] **TD-7** (FR-007, after T009): **migrate the preset golden tests first** (`tests/unit/time-windows-presets-golden.test.ts`, `tests/unit/ha-api.test.ts`) to the multi-window API (`buildMergedTimeWindowConfig` + `resolveTimeWindows`) and make them green (edge case 3); then remove the legacy single-window API `buildLtsQuery` / `mapLtsResponseToSeries` / `buildComparisonPeriod` from `src/card/ha-api.ts`; move the timeline functions (`buildChartTimeline`, `buildFullTimeline*`, `buildTimelineSlots`, `firstTailAxisLabelIndex`) to a new `src/card/timeline/` module and update all imports (including the builder from T009); `ha-api.ts` keeps only: query build + LTS mapping + `computeSummary` / `computeForecast` / `computeTextSummary` / `fullReferenceWindowRawTotal`. *Acceptance:* `wc -l src/card/ha-api.ts` < 400; 0 behavior change (full test battery green); no legacy imports from `src/`. *Domain specs: 900 + 901.*
- [ ] T011 [US3] **TD-11** (FR-011, after T009 merges — D2 gate; design: [data-model.md §1–2](data-model.md) + assessment `.specify/assessments/cardstate-union/`): in `src/card/types.ts` reshape `CardState` into the discriminated union `LoadingState | ErrorState | NoDataState | ReadyState` on the existing `status` discriminant — `ReadyState` **requires** `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime` and carries optional `preview?: PreviewSnapshot` (`{ previewShift, previewSeries, previewWindows, previewChartTime }`); `ErrorState` **requires** `errorMessage: string` (all 5 sites verified to set it); `LoadingState`/`NoDataState` bare; **remove `previewShift` from the state** — the element field stays the live source of the shift, the `updated()` preview-branch gate reads the element field (behavioral equivalence argued in the assessment; golden picker/preview tests are the final word); migrate consumers (`render()`, `updated()`, `_firePickerRealDataQuery` re-guard :361–365 → type narrowing; remove `?? fallback`s only where the compiler proves presence, as no-ops); update test literals (construction-only — no expected-value edits, FR-019). *Acceptance:* invariants compiler-enforced ("ready without series" un-writable); 0 non-null assertions in `render()`/`updated()`; card tests green; 909/910 preview semantics 1:1 (edge cases 6, 7). *Domain spec: 903.*
- [ ] T012 **W2 gate** (FR-018): full gate + committed `dist/` rebuild + `speckit.converge` drift check

**Checkpoint**: the P1 story is delivered — one pipeline, one production point, invariants in the types. The 9-bug bug class has one place to be fixed. Wave 3 may start.

---

## Phase 4: Wave 3 — Zero `any`/`!`, pure narrative & view-model, editor (spec US3: TD-5, TD-6 · US4: TD-8, TD-9, TD-12)

**Goal** (~1 week, plan D3): finish the typing program (0× `any` program-wide, `noUncheckedIndexedAccess` ON), and make the business logic cohesive pure modules: narrative functions, the render view-model, and the editor's YAML-mode controller.

**Independent Test** (quickstart.md *After Wave 3*): `grep -rnE ":\s*any\b|\bas any\b" src/` → no matches and the TD-4 scoped disable in `echarts-renderer.ts` is **removed**; `tsconfig.json` has `noUncheckedIndexedAccess: true` with 0 (or a few justified, commented) `]!`; `render()` < 200 lines with no `compute*`/`format*` domain calls except destructuring the VM; narrative unit tests pass (no reference, `insufficient_data`, neutral band/similar); view-model unit tests pass (ready / no-data / error / preview / single-window); editor shell < 1000 lines; `yaml-mode` unit tests pass without a DOM; golden integration suite green.

### Tasks (each = own PR per Program Rules)

- [ ] T013 [US3] **TD-5** (FR-005, after T006 — closes plan decision D1 / edge case 5): in `src/card/echarts-renderer.ts` replace the local `any[]` types with the official `LineSeriesOption` / `EChartsOption` (the type is already imported on line 7); build the series as typed objects before `setOption` (eliminate the `(series[i] as any).markLine = …` mutation); **remove the scoped `eslint-disable`** left by T006. *Acceptance:* 0× `any` in `echarts-renderer.ts` (and 0× in all of `src/` — SC-001); renderer tests green. *Domain spec: 902.*
- [ ] T014 [US3] **TD-6** (FR-006, after T013): set `noUncheckedIndexedAccess: true` in `tsconfig.json` and fix the 65 `]!` non-null assertions (distribution: `src/card/ha-api.ts` 20, card element 16, picker 9; the rest resolved by typing) — where the contract guarantees non-emptiness use an explicit guard with an error, a helper (e.g. `firstDefined(arr)`), or correct typing; resolve the TD-4 warning catalog. *Acceptance:* flag ON; 0 non-null assertions (exception: at most 5, each with a `// justified: <reason>` comment accepted in PR review); tests green — any real off-by-one the flag surfaces must be fixed, not suppressed. *No domain spec (config + local fixes).*
- [ ] T015 [US4] **TD-8** (FR-008): in `src/card/narrative/` (existing module — 3 pure fns) add (a) `forecastDisabledReasonKey(reason: ForecastDisabledReason) → i18nKey` (the 6-value mapping currently inline in `render()`) and (b) `resolveNarrativeSegment(outcome, neutralKind, language, entityKind) → { key, vars }` (the 4-branch selection over `interpretationSemantics.outcome` — the narrative engine defined in domain 903); `render()` then only formats and wraps in Lit (loses ~150 lines of logic); unit tests in `tests/unit/` (edges: no reference, `insufficient_data`, neutral band/similar). *Acceptance:* both functions unit-tested; `render()` consistent with domain 903 (spec vs. code). *Domain spec: 903.*
- [ ] T016 [US4] **TD-9** (FR-009, after T015 **and** T007 — edge case 8): create `src/card/view-model.ts` with pure `buildCardViewModel(state: CardState, config, hass, localize) → CardViewModel` (period captions via `formatCompactPeriodCaption` + `formatPeriodLabel` (TD-10), formatted summary/forecast numbers, `warningMessages`, `narrativeBody` from the TD-8 functions, Forecast|Total panel gating, `effectiveTitle` / `effectiveIcon`); make `render()` a pure template over the VM (no `compute*`/`format*` domain calls except destructuring the VM). *Acceptance:* VM unit tests in `tests/unit/` (ready / no-data / error / preview / single-window); `render()` < 200 lines. *Domain spec: 903.*
- [ ] T017 [P] [US4] **TD-12** (FR-012 — editor file set is disjoint from the card element; parallel-safe with T013–T016): extract the editor's YAML mode into `src/card/editor/yaml-mode.ts` — a small DOM-free state machine (state: `text`, `parseError`, `lastEmitted`, self-echo guard, parse/emit debounce timers; API: `parse(config) → { text?, error? }`, `commit(text) → { config?, error? }`); move focus/caret/scroll restoration into `src/card/editor/editor-ui-state.ts` (extend the existing `EditorUiState` model with `focusTarget` + `scrollTop`); the shell `src/card/energy-horizon-card-editor.ts` keeps only render + event routing (the 908 `FIELD_REGISTRY` pattern untouched — do-not-touch). *Acceptance:* shell < 1000 lines; `yaml-mode` unit tests in `tests/unit/` pass without a DOM; editor lifecycle/coverage tests green. *Domain spec: 904.*
- [ ] T018 **W3 gate** (FR-018): full gate + committed `dist/` rebuild + `speckit.converge` drift check

**Checkpoint**: 0× `any` program-wide; state invariants + indexing strictness compiler-enforced; narrative, view-model and YAML mode are pure, unit-tested modules. Wave 4 (optional) may start.

---

## Phase 5: Wave 4 — Picker module (spec US5: TD-14, **optional**)

**Goal** (a few days, plan D3): optional completion of the god-file decomposition — the 910 time-window picker becomes the simplest consumer of the ready-state builder. **Only after US1/TD-2 is merged** (it is, by W2). If the maintainer skips this wave, the program closes at the Wave 3 gate + Phase 6 (the W3 `speckit.converge` then carries the exit-gate role).

**Independent Test** (quickstart.md *After Wave 4*): `src/card/picker/` exists and `attachPicker(element, config, onState)` is the single hook into the element; `wc -l src/card/cumulative-comparison-chart.ts` < 1200 (SC-003); picker test suite green; spec 910 FR-010/013/014 behavior identical (edge case 7).

### Tasks (each = own PR per Program Rules)

- [ ] T019 [US5] **TD-14 (optional)** (FR-014): create `src/card/picker/` absorbing `_firePickerRealDataQuery`, `_buildDemoState`, `_pickerRealDataFired` + the glue with `src/card/picker-preview.ts` — both become consumers of `buildReadyState` (the builder from T009); expose a single hook mounted in the element: `attachPicker(element, config, onState)`; the `preview` flags preserve the 910 semantics (spec 910 FR-010/013/014) 1:1. *Acceptance:* element < 1200 lines; picker tests green; demo-first / real-data-upgrade / preview behavior identical. *Domain spec: 903.*
- [ ] T020 **W4 gate** (FR-018) — **the program's exit gate** (if TD-14 executed): full gate + committed `dist/` rebuild + final `speckit.converge` (code vs. spec/plan/tasks)

**Checkpoint**: god file fully decomposed (or the optional step consciously skipped — SC-003's element budget then applies from W3).

---

## Phase 6: Polish & Cross-Cutting (Program Close)

**Purpose**: prove the program met its success criteria and close the loop on spec/plan/tasks drift.

- [ ] T021 [P] Final success-criteria sweep (quickstart.md *Program exit criteria*): verify SC-001 (0× `any` in `src/`; `no-explicit-any: error` passes) · SC-002 (`noUncheckedIndexedAccess: true`; justified `!` only) · SC-003 (`ha-api.ts` < 400; load paths < 60; element < 1200 after TD-14) · SC-004 (no `date-fns`, no `chart-renderer.ts`, no `.map`/`ChartRenderer` in `dist/`) · SC-005 (1 canonical changelog; no tracked `temp/`; constitution clean) · SC-006 (≥ 15 builder unit tests; VM/narrative/period-label/yaml-mode/LTS-adapter tests present) · SC-007 (full gate green after every PR + CI `verify-dist`) · SC-008 (**0 remaining audit §3 violations** — walk `research.md` §3 table row by row) · SC-009 (4 waves delivered with FR-018 gates). If TD-14 was skipped: run the full gate + `dist/` + final `speckit.converge` here — this converge is the program's exit gate (plan D3).
- [ ] T022 Program close: mark all completed tasks in this `tasks.md` and update `plan.md` wave status; verify the canonical `changelog.md` holds one entry per delivered PR (14 max); record the final `speckit.converge` result (drift = 0) as the program's closing evidence

**Checkpoint**: program complete — SC-001…SC-009 verified, converge clean, branch ready to merge to `main`.

---

## Dependencies & Execution Order

### Phase (wave) dependencies

- **Setup (Phase 1)**: no dependencies — T001 (baseline) before any TD PR; T002 (assess pre-flight) gates **Wave 2 only** (already satisfied).
- **Wave 1 (Phase 2)**: depends on Setup. No internal cross-story prerequisites beyond the order below.
- **Wave 2 (Phase 3)**: depends on Wave 1 (the TD-4 lint rules gate the new code) **and** on T002 (FR-017 assess — satisfied). Internal order: **T009 (TD-2) → T010 (TD-7) → T011 (TD-11)**; TD-11 strictly after TD-2 merges (plan D2).
- **Wave 3 (Phase 4)**: depends on Wave 2 (TD-5 removes the D1 disable only once W2's typing is settled; TD-6 builds on 0× `any`; TD-9 needs the TD-11 union + TD-8 + TD-10).
- **Wave 4 (Phase 5, optional)**: depends on TD-2 merged (it is, by end of W2); skippable — program still exits green via Phase 6.
- **Polish (Phase 6)**: depends on all executed waves.

### Story ↔ wave map (why phases are waves)

| Story | Priority | Tasks | Wave(s) |
|---|---|---|---|
| US1 — ready-state pipeline in one place | **P1** 🎯 | T009 (TD-2) | W2 |
| US2 — dead code + strict typing + hygiene | P2 | T003 (TD-13), T004 (TD-1), T005 (TD-3), T006 (TD-4), T007 (TD-10) | W1 |
| US3 — compiler-enforced state invariants | P2 | T011 (TD-11), T013 (TD-5), T014 (TD-6) | W2 / W3 |
| US4 — cohesive modules, no god file | P3 | T010 (TD-7), T015 (TD-8), T016 (TD-9), T017 (TD-12) | W2 / W3 |
| US5 — picker module | P3 (optional) | T019 (TD-14) | W4 |

US4 deliberately ships split (TD-7 in W2 pairs with the P1 builder; TD-8/9/12 in W3 wait for the typing program) and US3's TD-5/TD-6 wait for W2's state changes — that is why the plan's wave axis, not the story axis, structures the phases.

### Within-wave ordering (strict)

- W1: T003 → T004 ∥ T005 → { T006, T007 } → T008
- W2: T009 → T010 → T011 → T012
- W3: T013 → T014 → T015 → T016 (T017 parallel-safe) → T018
- W4: T019 → T020
- Close: T021 ∥ T022

### Parallel opportunities

- **W1**: T004 (TD-1: `chart-renderer.ts`, `package.json`, lockfile, guard test) ∥ T005 (TD-3: `ha-api.ts`, element casts, types, LTS tests) — disjoint files after T003.
- **W3**: T017 (TD-12: `editor/yaml-mode.ts`, `editor-ui-state.ts`, `energy-horizon-card-editor.ts`) ∥ T013–T016 (element/renderer/tsconfig files) — disjoint file sets.
- **Close**: T021 ∥ T022 (verification vs. bookkeeping).
- Everything else is sequential — same-file overlap (the element is the program's shared hot file) or explicit ordering gates (D1 disable removal, D2 builder→union, edge cases 3, 5, 8).

---

## Implementation Strategy

### Incremental wave delivery (the program's natural increments)

1. **Phase 1** (baseline + assess) → foundation ready.
2. **Wave 1 (US2)** → quick wins + tooling enforcement ON → **validate at the W1 gate** (this is the de-facto MVP: risk-reducing, fully gated, ~1–2 days).
3. **Wave 2 (US1 + TD-7 + TD-11)** → the P1 story + invariants → validate at the W2 gate.
4. **Wave 3 (US3 finish + US4)** → zero `any`/`!`, pure modules → validate at the W3 gate.
5. **Wave 4 (US5, optional)** → picker module → validate at the W4 gate (**exit gate**).
6. **Phase 6** → SC-001…SC-009 sweep + close.
7. Each wave merges to `main` only through its FR-015 PRs + FR-018 gate; a failed gate stops the program (no wave-skipping).

### Parallel team strategy

One maintainer + agent workflow (current setup): run the waves sequentially; within W1 and W3 use the [P] pairs above (separate task branches, rebase the one-line changelog addition if both land close together).

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks (the one-line `changelog.md` addition is the only shared edit between [P] tasks)
- 1 task = 1 PR (FR-015) — do not merge a TD without its gate, review, changelog entry and FR-016 domain spec update
- Characterization-first where the assessments say so: TD-2 (per-path output pins before the move), TD-7 (golden-test migration before the API removal), TD-11 (test literals updated construction-only)
- The FR-017 assess pre-flight (T002) is **already complete** — do not re-run it; its invariants are binding for TD-2 and TD-11 (see `.specify/assessments/*/decision.md`)
- Zero visible change (FR-019) is verified per PR by the golden integration tests with unchanged expected values — a red golden test is a program stop, never a "fix the test"
- Commit after each task (each task is one PR anyway); stop at any wave checkpoint to validate the increment
- Avoid: vague tasks, same-file conflicts between merged PRs, cross-wave dependencies that break the gate order, touching the do-not-touch list (audit §5: `FIELD_REGISTRY`, load generations, `time-windows/` core, `ha-types.ts`)
