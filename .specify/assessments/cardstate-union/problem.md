# Problem Definition: Comment-only state invariants (FR-011 / TD-11)

- **Slug**: cardstate-union
- **Created**: 2026-11-16
- **Inputs used**: intake.md ✓ | research.md ✓

## Problem Statement

`CardState` is a flat interface whose critical invariants — "ready implies the chart's data is present", "preview fields exist only during an active preview" — are documented in comments and defended at runtime with null-guards and non-null assertions (`this._state.previewChartTime!`, `this._state.comparisonSeries?.current.unit ?? ""`, the re-guard in `_firePickerRealDataQuery`). The compiler cannot prove any of it. This is the structural enabler for the historical bug class "ready without series" and the reason the picker path re-validates what should be impossible. The 909 preview fields are scattered across four top-level optionals, each re-guarded individually.

## Affected Users & Stakeholders

- **Maintainers**: every state read needs a defensive fallback or assertion; new state consumers must learn the comment-level contract. [source: consumer enumeration, research.md]
- **Users (indirect)**: state-shape drift is the historical source of blank charts / wrong data (audit §2); compiler enforcement removes the class. No behavior change by this task (FR-019).

## Goals

- `CardState = LoadingState | ErrorState | NoDataState | ReadyState`, discriminated on the existing `status` field.
- `ReadyState` requires `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime` and carries optional `preview?: PreviewSnapshot` (`previewShift` + `previewSeries` + `previewWindows` + `previewChartTime` consolidated).
- `ErrorState` requires `errorMessage: string` (all 5 sites verified to set it); `errorParams` optional.
- `previewShift` removed from top-level state; the element field remains the live source; `updated()`/`render()` read the element field + the snapshot.
- Invariants enforced by the compiler; 0 non-null assertions in `render()`/`updated()`.

## Non-Goals

- Unifying the state *construction* — that is FR-002/TD-2 (runs first, same wave).
- Changing any state's observable fields, names, or the `status` values (public-surface invariance, FR-019).
- State persistence, serialization, or cross-card sharing.
- Touching the do-not-touch mechanisms (audit §5).

## Success Metrics

- `npm run typecheck` green with the union; the 6+2 required fields un-writable-absent on `ReadyState` (a missing-field literal fails compilation).
- `grep` of `render()`/`updated()` for `!` on state fields → 0 (SC-002 progress; the remaining assertions elsewhere are TD-6's job).
- The `_firePickerRealDataQuery` runtime re-guard (:361–365) replaced by a type-level check (status narrow) — the defensive path keeps working identically.
- Golden integration tests (picker preview, load coalescing, tooltip/panel consistency) green with unchanged expected values; 909/910 semantics 1:1 (edge cases 7, 9).

## Cost of Inaction

Every new state consumer copies the defensive pattern; the "ready without data" bug class stays writable; TD-9 (view-model) must defensively destructure a flat type instead of consuming a proven `ReadyState`; the element keeps non-null assertions (SC-002 cannot reach 0).

## Clarifications

- `textSummary` and `mergedTimeWindow`: **required** on `ReadyState` (verified present at all ready assembly sites — research.md, derived fact 1). Finalizes `data-model.md` §1.
- `PreviewSnapshot.previewShift`: retained inside the snapshot (spec FR-011 lists it in the snapshot shape) but the top-level field is removed; live reads use the element field.
