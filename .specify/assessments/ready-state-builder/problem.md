# Problem Definition: Three duplicated ready-state construction paths (FR-002 / TD-2)

- **Slug**: ready-state-builder
- **Created**: 2026-11-16
- **Inputs used**: intake.md ✓ | research.md ✓

## Problem Statement

The card's ready state — the central data object consumed by `render()`, `updated()` and the ECharts renderer — is assembled independently in three methods of `cumulative-comparison-chart.ts`. The duplicated orchestration (merged-config fallback, timeline trio, `alignOffsetMs` formula, summary/forecast/text pipeline, unit scaling) means every pipeline fix or change must be applied in three places, and the god file (1856 lines) cannot shrink until this duplication is gone. Nine of the last ten bugs in this area were state-construction drift between paths (audit §2). The element's `_applyUnitScalingToSeries` (93 lines) is pure logic trapped in the element, reachable only through the element instance.

## Affected Users & Stakeholders

- **Maintainers**: three-way merge pain for any pipeline change; the god file blocks every readability goal in the program (TD-9, TD-14). [source: audit §2, W2]
- **Users (indirect)**: state-construction drift is the historical bug source for wrong numbers/units in the chart — unification reduces the class of future bugs. No behavior change is made by this task (FR-019). [source: audit §2]

## Goals

- One pure function `buildReadyState(…)` produces the ready state for all three paths — 1 builder call per path, zero duplicated orchestration.
- `_applyUnitScalingToSeries` extracted to `src/utils/unit-scaler.ts` with `force_prefix` as an explicit parameter (no element access).
- Each call site < 60 lines of orchestration (load series → `buildReadyState(…)` → assign `_state`).
- All state variants covered — ready, no-data, forecast-disabled, single-window, preview (edge case 10: no happy-path-only builder).
- ≥ 15 unit tests of the builder; golden integration tests green unchanged (FR-019).

## Non-Goals

- Reshaping `CardState` — that is FR-011/TD-11 (separate task, same wave, runs after this one).
- Moving imperative shell logic (generation guards, `hass` subscription, renderer lifecycle, stale-result discard) into the builder.
- Changing LTS query building, window resolution, or any do-not-touch mechanism (audit §5).
- Harmonizing per-path behavioral drift (demo has no point-cap assert, picker re-reads windows from demo state) — behavior stays path-specific via `opts`.

## Success Metrics

- `grep -c "computeSummary\|computeForecast\|computeTextSummary"` in `cumulative-comparison-chart.ts` → 0 (all calls live in the builder).
- `_loadData`, `_buildDemoState`, `_firePickerRealDataQuery` each < 60 lines (review-verified; SC-003).
- `applyUnitScalingToSeries` exported from `src/utils/unit-scaler.ts`; `force_prefix` a parameter; unit-scaler tests green (math unchanged).
- ≥ 15 new builder unit tests green (SC-006); full integration suite green with unchanged expected values (FR-019).

## Cost of Inaction

The god file stays 1856 lines; TD-9 (view-model) and TD-14 (picker extraction) lose their prerequisite; every future pipeline change is a 3-way edit with drift risk. The audit rates this the single highest-impact structural risk (W2, priority task).

## Clarifications

None needed — the spec (FR-002) fixes scope, acceptance and ordering constraints; the open coupling (order vs TD-11) is resolved in decision.md.
