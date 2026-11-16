# Implementation Plan: Tech-Debt Reduction Program

**Branch**: `911-tech-debt-reduction` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/911-tech-debt-reduction/spec.md`

## Summary

A 14-task maintenance program (TD-1…TD-14) delivered as one shared feature `911-tech-debt-reduction` in 4 waves, with **zero user-visible change** (FR-019): the `CardConfig` schema, i18n keys, rendering and UX stay identical, and the existing integration tests are the golden standard (unchanged expected values). Technical approach (from the architecture audit attached as [research.md](research.md)): unify the three duplicated ready-state paths into a single pure `ReadyStateBuilder`, reshape `CardState` into a discriminated union with compiler-enforced invariants, enforce strict typing by tooling (ESLint `no-explicit-any: error`, `noUncheckedIndexedAccess`), extract narrative / view-model / timeline / YAML-mode / picker into cohesive pure modules, and remove dead code and artifact hygiene debt. Every task = its own PR + ≥1 review + changelog entry + tests (FR-015); every wave ends with the full gate + `dist/` rebuild + `speckit.converge` drift check (FR-018).

## Technical Context

**Language/Version**: TypeScript 5.6, `strict: true`; `noUncheckedIndexedAccess` added in TD-6 (W3). Target ES2020, module ESNext.

**Primary Dependencies**: Lit 3 (Web Components), ECharts 5.6 (tree-shaken via `echarts/core`), luxon 3.7 (sole date library — 37 production uses). **Removed**: `date-fns` 4.1 (TD-1, W1 — verified unused, not in the bundle). **No new dependencies.**

**Storage**: N/A — browser-side Lovelace card; configuration is persisted by Home Assistant itself (Storage UI / YAML).

**Testing**: Vitest 2.1 (`npm test` = `TZ=UTC vitest run`), unit + integration. Integration tests (load coalescing, picker preview, editor lifecycle, tooltip/panel consistency) are the golden standard and are **not modified** (FR-019).

**Target Platform**: modern web browsers inside a Home Assistant dashboard; distribution via the built-in HA Marketplace (2026.11+) or HACS; `dist/` is committed and deployed to `www/community/`.

**Project Type**: Web Component (single-file artifact) — Functional Core / Imperative Shell.

**Performance Goals**: no regression — existing mechanisms stay untouched (`lastHash` render-skip, load coalescing/generations, point cap + auto-aggregation); production bundle ≈1.17 MB; `dist/` ~3.86 MB smaller after sourcemap removal (TD-13 — the committed `dist/energy-horizon-card.js.map`).

**Constraints**: zero user-visible change (FR-019); no new NPM dependencies; `dist/` rebuilt in every PR touching code (CI `verify-dist` rejects out-of-sync); 1 task = 1 PR (FR-015); all work on branch `911-tech-debt-reduction` (decision D4).

**Scale/Scope**: `src/` 50 files / ~11.2k LOC; `tests/` 64 files / ~15.2k LOC. End-state budgets: card element < 1200 lines (after optional TD-14), `render()` < 200, `ha-api.ts` < 400, each load path < 60 lines, editor shell < 1000.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v1.2.0 (`.specify/memory/constitution.md`). This feature exists to **remediate** the pre-existing violations catalogued in the audit (§3 table, SC-008 requires 0 remaining) — the gate evaluates whether the plan introduces **new** violations.

| Principle | Verdict | Notes |
|---|---|---|
| I — HA/Marketplace compatibility | ✅ PASS (no impact) | No changes to `hacs.json`, manifest, or HA patterns; changelog consolidation (TD-13) *strengthens* the "readable changelog" requirement |
| II — Safety & fault tolerance | ✅ PASS (remediates) | TD-13 removes the published production sourcemap (source-disclosure violation W10); TD-3 types untrusted WebSocket input; all defensive mechanisms are in the do-not-touch list |
| III — Code quality & typing | ✅ PASS (remediates) | Core of the program: TD-2/3/4/5/6/7/11 remove 15× `any`, 65× `!`, the legacy API and the flat state model; all new code is strictly typed and unit-tested |
| IV — UX/UI & accessibility | ✅ PASS (no impact) | zero user-visible change (FR-019) — rendering, theming, ARIA untouched |
| V — Performance & simplicity | ✅ PASS (remediates) | TD-1 removes the unjustified dependency; TD-2/7/8/9/12/14 restore SRP/cohesion; pure functions, no new runtime cost |
| VI — Language care & UX writing | ✅ PASS | changelog entries + the wiki "Known simplifications" note (TD-13) written to Article VI standards; domain specs updated in the same PR (FR-016) |
| Additional requirements | ✅ PASS (remediates) | TD-1 dependency justification; TD-14 keeps the advanced picker from complicating the base element |
| Workflow | ✅ PASS | FR-015 (14 × own PR + ≥1 review + changelog + tests) and FR-018 wave gates implement the "Workflow rozwojowy i jakość" pipeline requirements |
| Governance | ✅ PASS (remediates) | TD-13 removes the working comment from the committed constitution; the program is the periodic "constitution compliance" review itself (audit §3, SC-008) |

**Gate verdict: PASS — no new violations.** One temporary exception is tracked in the Complexity Tracking table below.

## Project Structure

### Documentation (this feature)

```text
specs/911-tech-debt-reduction/
├── spec.md              # specify output (19 FRs, 5 stories, 10 edge cases)
├── plan.md              # this file
├── research.md          # Phase 0: architecture audit (attached) + plan decisions (D1–D4)
├── data-model.md        # Phase 1: CardState union, PreviewSnapshot, CardViewModel, LTS types
├── quickstart.md        # Phase 1: validation guide (baseline, per-wave checks, exit criteria)
├── contracts/
│   ├── lts-websocket-response.md      # the one interface in scope of change (TD-3)
│   └── public-surface-invariance.md   # the zero-change contract (FR-019)
├── checklists/requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── card/
│   ├── cumulative-comparison-chart.ts   [changed] 1856 → < 1200 lines (W2–W4); render() < 200 (W3); load paths < 60 lines (W2)
│   ├── echarts-renderer.ts              [changed] 0× any — EChartsOption/LineSeriesOption (W3, TD-5)
│   ├── energy-horizon-card-editor.ts    [changed] shell < 1000 lines (W3, TD-12)
│   ├── ha-api.ts                        [changed] 805 → < 400 lines: legacy API removed, timeline moved out (W2, TD-7)
│   ├── chart-renderer.ts                [removed] W1 (TD-1)
│   ├── pipeline/
│   │   └── ready-state-builder.ts       [new] W2 (TD-2) — buildReadyState(…): the single ready-state pipeline
│   ├── timeline/                        [new] W2 (TD-7) — buildChartTimeline, buildFullTimeline*, buildTimelineSlots, firstTailAxisLabelIndex
│   ├── narrative/                       [extended] exists (3 pure fns) + W3 (TD-8): forecastDisabledReasonKey, resolveNarrativeSegment
│   ├── labels/
│   │   └── period-label.ts              [new] W1 (TD-10) — formatPeriodLabel
│   ├── view-model.ts                    [new] W3 (TD-9) — buildCardViewModel → CardViewModel
│   ├── picker/                          [new, optional] W4 (TD-14) — attachPicker(element, config, onState)
│   └── editor/
│       ├── yaml-mode.ts                 [new] W3 (TD-12) — YAML mode state machine
│       └── editor-ui-state.ts           [changed] W3 (TD-12) — + focusTarget, scrollTop
├── utils/
│   └── unit-scaler.ts                   [changed] W2 (TD-2) — absorbs _applyUnitScalingToSeries (force_prefix as parameter)
└── ha-types.ts                          [untouched] (do-not-touch, audit §5)

config/
├── eslint.config.js                     [changed] W1 (TD-4) — no-explicit-any: error, no-non-null-assertion: warn, consistent-type-imports: error
└── vite.config.ts                       [changed] W1 (TD-13) — sourcemap: false (production artifact only; dev/preview unchanged)

tsconfig.json                            [changed] W1 (TD-13: remove jsx: "react-jsx") + W3 (TD-6: noUncheckedIndexedAccess: true)
package.json                             [changed] W1 (TD-1: − date-fns)
tests/unit/                              [extended] new unit tests: builder (≥15), view-model, narrative, period-label, yaml-mode, LTS adapter
```

**Structure Decision**: keep the existing single-project layout and layering (UI → renderer/pipeline → pure core; zero import cycles). New modules extend existing directories (`narrative/`, `labels/`, `editor/`, `utils/`) and add three new leaf directories (`pipeline/`, `timeline/`, `picker/`) — all pure, zero Lit/DOM, following the `time-windows/` core pattern (the project's reference model, audit S1). No new project, package or dependency. `view-model.ts` is placed next to the card element (it consumes `CardState` + `hass` — the UI-adjacent layer, like `labels/`).

## Wave Plan & Gates (SC-009 / FR-018)

| Wave | Tasks | Est. effort | Goal | Gate (end of wave) |
|---|---|---|---|---|
| **W1** | TD-1, TD-3, TD-4, TD-10, TD-13 | 1–2 days | dead weight, type enforcement, single label, hygiene | full gate + `dist/` + `speckit.converge` |
| **W2** | **TD-2 (priority)**, TD-7, TD-11 | ~1 week | pipeline unification, pure data modules, invariants in the types | full gate + `dist/` + `speckit.converge` |
| **W3** | TD-5, TD-6, TD-8, TD-9, TD-12 | ~1 week | zero `any`/`!`, narrative and render as pure functions | full gate + `dist/` + `speckit.converge` |
| **W4** | TD-14 (optional) | a few days | element < 1200 lines, picker as a module | full gate + `dist/` + `speckit.converge` (**= exit gate**; if TD-14 is skipped, T021 carries it) |

Full gate = `npm test && npm run typecheck && npm run lint && npm run build` + committed `dist/` rebuild (CI `verify-dist`) + `speckit.converge` drift check (code vs. spec/plan/tasks).

## Plan Decisions (delegated from the spec)

Full Decision / Rationale / Alternatives for each: [research.md §6](research.md#6-phase-0--open-unknowns-and-plan-decisions).

| # | Topic | Decision | Short rationale |
|---|---|---|---|
| **D1** | FR-004 ↔ FR-005 lint gating (edge case 5) | Option (a): temporary scoped `eslint-disable` for `no-explicit-any` on `echarts-renderer.ts` in TD-4 (W1), comment references TD-5, **removed in TD-5 (W3)** | W1 stays a 1–2-day quick-win wave; after TD-3 (W1) the only remaining `any`s are in that one file, so the disable scope is exactly one file, traceable and mechanically removed |
| **D2** | FR-002 / FR-011 ordering (edge case 6) | Within W2: **TD-2 first (builder), then TD-11 (state union)** — the builder initially emits the current flat `CardState` shape; TD-11 reshapes the type + the single production point + consumers | collapsing 3 paths into 1 production point *before* the reshape minimizes TD-11's diff and regression surface (exactly where 9/10 past bugs lived); intermediate state after TD-2 is green and no worse than today. **Gate (FR-017)**: the assess pre-flight for FR-002/FR-011 in `.specify/assessments/` (precedent 909) must confirm this order before the first W2 PR; if an assessment overturns it, plan.md is updated before that PR |
| **D3** | 4-wave milestones (SC-009) | W1: TD-1,3,4,10,13 · W2: TD-2 (priority), TD-7, TD-11 (order per D2, after the FR-017 assess) · W3: TD-5, TD-6, TD-8, TD-9 (after TD-8 + TD-10), TD-12 · W4: TD-14 (optional, only after W2); every wave ends with the FR-018 gate | risk-ascending order: cheap wins + tooling enforcement first (they gate the rest), highest-value structural unification in the middle, readability last, optional picker extraction last |
| **D4** | Working branch & PR workflow | All refactoring changes live on the dedicated branch **`911-tech-debt-reduction`** (created 2026-11-16 from `chore/spec-kit-opencode`, which contains the completed 910 that TD-14 depends on). Each TD = its own PR (own task branch → main) with ≥1 review + changelog entry (FR-015) | user directive 2026-11-16 ("wszystkie zmiany związane z refactoringiem zrób na osobnym branchu"); isolates the program from the in-flight work branch. Constraint: `gh` CLI unavailable in this environment — PR creation/review is done manually by the maintainer on GitHub; the agent pushes branches |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Temporary scoped `eslint-disable` for `no-explicit-any` on `echarts-renderer.ts` (TD-4, W1 → removed in TD-5, W3) — a transient exception to Article III ("unikanie `any`") | TD-4 must not leave the gate red (edge case 5) while TD-5 lands in W3 per the SC-009 milestone definition | Pulling TD-5 into W1 would bloat the quick-win wave and destabilize the milestones; leaving the gate red would violate the FR-018 wave gate |

**Constitution re-check (post Phase 1 design): PASS** — the Phase 1 data model (discriminated union with compiler-enforced invariants, typed LTS adapter, pure-function contracts) introduces no new violations; state invariants move from comments to the type system (Articles III/II *strengthened*). The single tracked exception above stands, with its scheduled removal (TD-5).
