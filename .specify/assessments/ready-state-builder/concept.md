# Concept: Ready-state pipeline shape (FR-002 / TD-2)

- **Slug**: ready-state-builder
- **Created**: 2026-11-16
- **Recommended option**: Option A — pure `pipeline/ready-state-builder.ts` module

## Options

### Option A — Pure builder module (spec shape)
- **Sketch**: New `src/card/pipeline/ready-state-builder.ts` (pure, zero Lit/DOM, `time-windows/` pattern): `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState`. Internally: `tailLabelFromIndex` (from `chartTime` inputs), `alignOffsetMs` (single formula), unit scaling via `applyUnitScalingToSeries` (extracted into `src/utils/unit-scaler.ts` with `force_prefix` parameter), `computeSummary` → `computeForecast` → unit patching → `computeTextSummary` → state assembly. `opts` carries path-specific parameters (demo flag, preview snapshot inputs, no-point-cap for demo, force-prefix source). The element's three methods become: guard + load/demo series → `this._state = buildReadyState(…)` — each < 60 lines.
- **Appetite**: large (L, ~2–3 days including ≥15 unit tests) — the effort already budgeted in the audit.
- **Trade-offs**: Wins — satisfies every acceptance criterion; unit-testable without DOM; the single production point that TD-11 (state union) depends on; unlocks TD-14 (picker becomes the builder's simplest consumer). Sacrifices — one more module to document (FR-016: 901+903 domain specs updated in the same PR); `opts` must be designed to encode three path behaviors without implicit magic. Risk — the production error path (point-cap `debug` message → error state with `errorParams`) must stay reachable without dragging try/catch machinery into the pure core: keep the point-cap assert in the element's shell, let the builder take a pre-built error/no-data variant or receive the already-capped inputs.
- **Rabbit holes**: (1) encoding the three paths' current behavioral drift in `opts` without harmonizing it — pin each path's output with unit tests before refactoring (characterization tests); (2) the unit-patching nuance (`if (!summary.unit && unit) summary.unit = …`) — must be byte-identical per path (demo uses `demoUnit`, production uses the entity unit, picker uses `entityUnit || realSeries.current.unit`); (3) the stale-generation guard and `hass` reads must stay in the shell — temptation to "clean up" the guards into the builder.

### Option B — Private element method (no module)
- **Sketch**: Keep the logic in `cumulative-comparison-chart.ts` but consolidate the three methods into one private `_buildReadyState(…)` method.
- **Appetite**: medium.
- **Trade-offs**: Wins — smaller diff, no new module. Sacrifices — still not unit-testable without instantiating the element (DOM/Lit); the god file does not shrink structurally (only by ~150 lines); violates the Functional Core / Imperative Shell layering the audit recommends; FR-002 explicitly names the module path `src/card/pipeline/ready-state-builder.ts`. Rejected.

### Option C — Full data-layer rewrite (state engine)
- **Sketch**: Replace `CardState` construction with a small reducer/state machine module owning all state transitions.
- **Appetite**: very large (weeks).
- **Trade-offs**: Wins — maximal testability. Sacrifices — rewrites the state model *and* the pipeline at once, doubling the risk surface against FR-019 (zero visible change); overlaps TD-11's scope; no spec requirement for it. Rejected — the program is explicitly incremental (14 small PRs).

## Recommendation

**Option A.** It is the spec's own shape (FR-002 names the module and the signature), the only option that makes the builder independently unit-testable, and the only one that creates the single production point TD-11 needs. The two real risks (behavioral drift, shell-logic creep) are managed by characterization tests before the move and by the explicit Non-Goals list.

## Out of Scope (for Option A)

- Any `CardState` type change (TD-11).
- Query building, window resolution, point-cap limit values, renderer behavior (do-not-touch).
- Merging the three paths' observable behavior differences.

## Assumptions to Validate (during implementation)

- Characterization: per-path unit tests capturing today's exact output (summary/forecast/units/timeline) are written and green *before* the logic moves.
- `opts` covers all three paths' current differences without a flag explosion (> 4 distinct flags → revisit the design).
- The point-cap error path remains an element-shell concern with an identical user-visible error state.
