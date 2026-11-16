# Intake: Single ready-state pipeline (FR-002 / TD-2)

- **Slug**: ready-state-builder
- **Created**: 2026-11-16
- **Source**: `specs/911-tech-debt-reduction/spec.md` (FR-002), `architecture-audit-2026-11-15.md` (W2, TD-2 — PRIORITY)
- **Type**: refactoring — zero user-visible change (FR-019)

## Idea (as captured)

> The card assembles the "ready" state three times — production load (`_loadData`), demo picker (`_buildDemoState`), picker real-data upgrade (`_firePickerRealDataQuery`) — with near-identical pipeline logic inlined in each. Unify into one pure module `src/card/pipeline/ready-state-builder.ts`: `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState`, covering `tailLabelFromIndex`, `alignOffsetMs`, unit scaling, `computeSummary`, `computeForecast`, unit patching, `computeTextSummary`. Extract `_applyUnitScalingToSeries` into `src/utils/unit-scaler.ts` with `force_prefix` as an explicit parameter. Each call site shrinks to < 60 lines of orchestration.

## Restated

A structural unification of the three duplicated ready-state construction paths in `cumulative-comparison-chart.ts` (1856 lines, the god file) into a single, pure, unit-testable pipeline. The behavior must not change at all — the existing integration tests are the golden standard (FR-019).

## Constraints (from spec)

- **FR-002**: 1 builder call per path, zero duplicated orchestration (verified in review); ≥ 15 unit tests covering all states (ready, no-data, forecast-disabled, single-window + preview); card/picker integration tests green without UX changes.
- **FR-017**: this assessment (pipeline: intake→research→define→shape→decide) is a pre-flight before Wave 2; its results feed `plan.md`.
- **FR-019**: zero user-visible change; integration tests unchanged.
- **Edge case 6**: coupled with FR-011 (TD-11, state union) — same wave (W2), explicit order, no intermediate state where the builder emits an old shape.
- **Constitution**: V (simplicity/SRP), III (strict typing, testable pure functions).

## First-Glance Unknowns

Resolved during research (see research.md): the three paths are confirmed to share the same pipeline skeleton; all heavy computations (`computeSummary`/`computeForecast`/`computeTextSummary`/`scaleSeriesValues`) are already exported pure functions in `ha-api.ts` / `unit-scaler.ts` — only the orchestration is duplicated.
