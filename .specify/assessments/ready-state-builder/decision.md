# Decision: Single ready-state pipeline (FR-002 / TD-2)

- **Slug**: ready-state-builder
- **Decided**: 2026-11-16
- **Verdict**: go
- **Artifacts reviewed**: intake.md ✓ | research.md ✓ | problem.md ✓ | concept.md ✓
- **Companion assessment**: `cardstate-union` (FR-011 / TD-11) — jointly decides the Wave 2 ordering (spec Edge Case 6)

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | strong | Verified verbatim duplication across all three paths (5 duplicated blocks, research.md); the god file and 9-of-10 historical bug class both trace to it; it is the audit's priority task (W2). |
| Evidence strength | high | Every claim pinned to on-disk source lines (2026-11-16); all heavy computations are already pure, exported, unit-tested — the builder only re-orchestrates, no math changes. |
| Value vs. inaction | strong | Unblocks TD-9 (view-model) and TD-14 (picker); removes the main drift bug class; prerequisite for the element line-budget (SC-003). |
| Feasibility / appetite | adequate | L effort (2–3 days) within the W2 budget; risk is behavior preservation, not design — managed by characterization tests + golden integration suite. |
| Strategic fit | strong | Constitution III (pure, strictly typed, unit-tested) and V (SRP, simpler core); zero user-visible change (FR-019); no new dependencies; follows the `time-windows/` reference pattern (audit S1). |
| Risk posture | adequate | Top rabbit holes identified and bounded: behavioral drift (mitigate with before-tests), `opts` flag explosion (> 4 → revisit), shell-logic creep (guards stay in element). The TD-2↔TD-11 coupling is resolved by explicit ordering below. |

## Verdict & Rationale

**Go** with Option A (pure `src/card/pipeline/ready-state-builder.ts` + `applyUnitScalingToSeries` extracted to `src/utils/unit-scaler.ts` with `force_prefix` as a parameter). The design is the spec's own; the evidence shows it is safe because no computation moves — only orchestration does.

## Ordering decision (Edge Case 6 — with `cardstate-union`)

**TD-2 (this task) first, then TD-11 (state union), both in Wave 2.** Rationale: the builder collapses the three inline state assemblies into a single production point *before* the type reshapes `CardState`. TD-11 then touches one production site (the builder) plus consumers, instead of three hand-rolled assemblies. The intermediate state after TD-2 is green and strictly better than today (same flat `CardState`, one producer). The reverse order (TD-11 first) would reshape the type at three assembly sites and then move them — pure extra work and risk. **This confirms plan.md decision D2.**

## Invariants (must hold at the TD-2 gate)

1. One `buildReadyState` call per path; zero duplicated orchestration in the element (review check + grep for `compute*` in the element = 0).
2. Builder is pure: no Lit, no DOM, no `this`, no element access; `force_prefix` is a parameter.
3. Each of `_loadData` / `_buildDemoState` / `_firePickerRealDataQuery` < 60 lines of orchestration.
4. All state variants produced (ready, no-data, forecast-disabled, single-window, preview) — no happy-path-only builder.
5. Golden integration tests green, expected values unchanged (FR-019); ≥ 15 new builder unit tests (SC-006).
6. Imperative shell (generations, `hass`, renderer, stale discard) untouched.

## Risks carried to tasks.md

- R1 (high): behavior drift between paths — write per-path characterization tests before moving logic.
- R2 (medium): `opts` design — cap at ~4 path flags; revisit if exceeded.
- R3 (medium): point-cap error path must keep its exact user-visible error state (debug message, `errorParams`).
- R4 (low): unit-patching per-path unit source (demo vs entity vs real-series unit) — covered by characterization tests.

## Handoff to `/speckit.tasks` (Wave 2, PR #1 of W2)

- **Problem**: three duplicated ready-state assemblies in the god file; pure logic trapped in the element.
- **Chosen approach**: Option A per concept.md; signature `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState`; unit-scaler gains `applyUnitScalingToSeries(series, rawUnit, { force_prefix })`.
- **In scope**: builder module, unit-scaler extraction, three call sites reduced, characterization + ≥ 15 unit tests, domain spec 901+903 update (FR-016).
- **Out of scope**: `CardState` reshape (TD-11), query/window/renderer changes, path behavior harmonization.
- **Ordering**: first task of Wave 2; TD-11 (state union) follows in Wave 2 and must not start until TD-2 is merged.
