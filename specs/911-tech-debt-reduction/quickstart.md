# Quickstart: Validating the Tech-Debt Reduction Program

**Feature**: `911-tech-debt-reduction` | **Branch**: `911-tech-debt-reduction` | **Date**: 2026-11-16

A runnable validation guide proving each wave works and that the zero-visible-change invariant (FR-019) holds end to end. This is a **validation guide**, not an implementation guide — how each task is implemented belongs to `tasks.md` and the implementation phase.

## Prerequisites

- Node v26.x (developed on v26.8.1), npm
- A checkout on branch `911-tech-debt-reduction`
- `npm ci`

## Baseline — before any TD task

```bash
npm test && npm run typecheck && npm run lint && npm run build
```

All four green. This is the **golden-standard baseline**: the integration tests (load coalescing, picker preview, editor lifecycle, tooltip/panel consistency) must remain green with **unchanged expected values** for the whole program (FR-019, see [contracts/public-surface-invariance.md](contracts/public-surface-invariance.md)).

## After Wave 1 (TD-1, TD-3, TD-4, TD-10, TD-13)

| Check | How | Expected |
|---|---|---|
| `date-fns` removed | `npm ls date-fns` | empty output |
| dead renderer gone | `test ! -f src/card/chart-renderer.ts` | exit 0 |
| 0 `as any` in the card element | `grep -rn "as any" src/card/cumulative-comparison-chart.ts` | no matches |
| LTS adapter handles both shapes | run the new LTS adapter unit tests | Shape A (`{ result: { results } }`) and Shape B (bare `{ results }`) pass |
| single period-label source | run `period-label` unit tests | Jan 1 → year, Dec 31, time zones, 5 languages pass |
| production build without sourcemaps | `npm run build && ls dist/*.map` | no `.map` in the production artifact (dev/preview unaffected) |
| linter rules on | inspect `config/eslint.config.js` | `no-explicit-any: error`, `no-non-null-assertion: warn`, `consistent-type-imports: error` |
| scoped disable tracked | inspect `echarts-renderer.ts` | single `eslint-disable` for `no-explicit-any` referencing TD-5 (plan decision D1) |
| full gate + dist | `npm test && npm run typecheck && npm run lint && npm run build`, commit `dist/` | green; CI `verify-dist` green |
| wave drift check | `speckit.converge` | code ↔ spec/plan aligned |

## After Wave 2 (TD-2, TD-7, TD-11 — order per plan decision D2, after the FR-017 assess)

| Check | How | Expected |
|---|---|---|
| assessments done (FR-017) | inspect `.specify/assessments/` | FR-002 + FR-011 assessments present; results reflected in plan.md |
| builder unit-tested | run the `ready-state-builder` unit tests | ≥15 tests green covering ready / no-data / forecast-disabled / single-window / preview |
| 1 builder call per path | code review of `_loadData`, `_buildDemoState`, `_firePickerRealDataQuery` | each < 60 lines of orchestration; no duplicated pipeline logic |
| `ha-api.ts` slimmed | `wc -l src/card/ha-api.ts` | < 400 |
| legacy API gone | `grep -rn "buildLtsQuery\|mapLtsResponseToSeries\|buildComparisonPeriod" src/` | no production imports (preset golden tests migrated to the multi-window API first) |
| timeline module exists | inspect `src/card/timeline/` | `buildChartTimeline`, `buildFullTimeline*`, `buildTimelineSlots`, `firstTailAxisLabelIndex` present |
| state union compiles | `npm run typecheck` | `CardState = LoadingState \| ErrorState \| NoDataState \| ReadyState`; `ReadyState` requires its six fields; `preview?: PreviewSnapshot` |
| 0 non-null assertions in render/updated | `grep -n "!" src/card/cumulative-comparison-chart.ts` (render/updated region) | none on state fields |
| golden standard | full integration suite | green, expected values unchanged |
| full gate + dist + converge | as in W1 | green |

## After Wave 3 (TD-5, TD-6, TD-8, TD-9, TD-12)

| Check | How | Expected |
|---|---|---|
| SC-001: zero `any` | `grep -rnE ":\s*any\b|\bas any\b" src/` | no matches; ESLint `no-explicit-any: error` passes; the TD-5 scoped disable is **removed** |
| SC-002: `noUncheckedIndexedAccess` ON | inspect `tsconfig.json`; `grep -rn "\]!" src/` | flag `true`; 0 (or a handful of justified, commented) non-null assertions |
| SC-003: render budget | `render()` body line count | < 200 lines, no `compute*`/`format*` domain calls except destructuring the VM |
| narrative pure fns tested | run `src/card/narrative/` unit tests | `forecastDisabledReasonKey` + `resolveNarrativeSegment` edges pass (no reference, `insufficient_data`, neutral band/similar) |
| view-model tested | run the view-model unit tests | ready / no-data / error / preview / single-window pass |
| editor shell budget | `wc -l src/card/energy-horizon-card-editor.ts` | < 1000 |
| `yaml-mode` DOM-free | run its unit tests | pass without a DOM; editor lifecycle/coverage tests green |
| full gate + dist + converge | as in W1 | green |

## After Wave 4 (TD-14, optional — only after W2)

| Check | How | Expected |
|---|---|---|
| picker module extracted | inspect `src/card/picker/` | `attachPicker(element, config, onState)` is the single hook into the element |
| element budget (SC-003) | `wc -l src/card/cumulative-comparison-chart.ts` | < 1200 |
| 910 semantics preserved | run the picker test suite | green; spec 910 FR-010/013/014 behavior identical |
| full gate + dist + **final converge** | as in W1 | green — the last `speckit.converge` is the program's exit gate (FR-018) |

## Program exit criteria (SC-001…SC-009)

| SC | Criterion | Verified by |
|---|---|---|
| SC-001 | 0× `any` in `src/`; `no-explicit-any: error` passes | W3 check |
| SC-002 | `noUncheckedIndexedAccess: true`; 0 justified non-null assertions | W3 check |
| SC-003 | `ha-api.ts` < 400; load paths < 60; element < 1200 (after TD-14) | W2/W3/W4 checks |
| SC-004 | no `date-fns`; no `chart-renderer.ts`; `dist/` without `.map`/`ChartRenderer` | W1 check |
| SC-005 | 1 canonical changelog; no tracked `temp/`; constitution clean | W1 check |
| SC-006 | ≥15 builder unit tests; unit tests for VM, narrative, period-label, yaml-mode, LTS adapter | W1–W3 checks |
| SC-007 | full gate green after every PR and wave + CI `verify-dist` | every PR/wave |
| SC-008 | 0 remaining audit §3 violations | final converge |
| SC-009 | delivered in 4 waves with FR-018 gates | wave gates above |
