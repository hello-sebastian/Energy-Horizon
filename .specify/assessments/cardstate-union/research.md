# Research: CardState as a discriminated union (FR-011 / TD-11)

- **Slug**: cardstate-union
- **Created**: 2026-11-16
- **Evidence confidence (overall)**: high (all claims verified against on-disk source, 2026-11-16)

## Current state — one flat interface, comment-only invariants

`src/card/types.ts:289` — `interface CardState` with `status: "loading" | "error" | "no-data" | "ready"` plus optional fields: `errorMessage`, `errorParams`, `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime`, and the four 909 preview fields (`previewShift`, `previewSeries`, `previewWindows`, `previewChartTime`). The doc comments state the invariants ("present only while `previewShift < 0` and `status === 'ready'`") — the compiler does not enforce them. [source: types.ts:289+; doc comments] (confidence: high)

## All state assembly sites (complete enumeration)

| Shape | Sites | Fields set |
|---|---|---|
| `loading` | :155 (field init), :506 (`updated()` re-entry) | none |
| `error` | :251 (missing translation), :467 (invalid x-axis format), :480 (invalid tooltip format), :705 (point cap, +`errorParams: { max }`), :939 (API error) | `errorMessage` (i18n key) **at all 5 sites** |
| `no-data` | :761 (empty LTS result) | none |
| `ready` (demo) | :330 (`_buildDemoState` :329–344) | comparisonSeries, summary, forecast, textSummary (:327→:334), period, resolvedWindows, mergedTimeWindow (:337), chartTime — **no preview fields** |
| `ready` (production) | :915 (`_loadData` tail) | same as demo + `previewShift: this.previewShift` (:929) and, in the preview branch (:820–835), the preview series/windows/chartTime |

**Derived facts:**
1. `textSummary` and `mergedTimeWindow` are present in **every** ready assembly → `ReadyState` can require them (finalizes the open optionality in `data-model.md` §1). [source: :327/:334/:337, :818/:919/:922] (confidence: high)
2. `errorMessage` is present in **all 5** error assemblies → `ErrorState.errorMessage: string` can be required (i18n key; `errorParams` optional). [source: :251, :467, :480, :705, :939] (confidence: high)
3. `loading` and `no-data` are assembled with no payload fields → `LoadingState`/`NoDataState` are bare `{ status }`. [source: :155, :506, :761] (confidence: high)
4. After TD-2 (builder, this wave, runs first) the two ready assembly sites collapse into one (the builder) — the union's reshape of the ready shape happens at a single production point. [source: ready-state-builder assessment] (confidence: high)

## Consumer sites that the reshape touches

- `updated()` preview branch: gate `this._state.previewShift != null && this._state.previewShift < 0` (:563–564), then `this._state.previewChartTime!` (:569 — a non-null assertion), `this._state.previewWindows ?? []` (:570).
- Chart no-data fallback inside `updated()`: `this._state.comparisonSeries?.current.unit ?? ""` (:603, :608) — optional chaining against a ready-shaped read.
- `render()`: status branches; `this._state.textSummary?.trend ?? "unknown"` (:1234), `const textSummary = this._state.textSummary` (:1282), `this._state.mergedTimeWindow ?? this._mergedTimeWindow` (:1045) — defensive fallbacks that exist only because the flat type cannot prove presence.
- `_firePickerRealDataQuery`: runtime re-guard `demoState.status !== "ready" || !demoState.resolvedWindows || !demoState.chartTime` (:361–365) — a check the union makes redundant.
- Tests: unit tests construct `CardState` literals (picker/preview/localization suites) — literal construction remains valid against a union; no expected values change.

**Count**: roughly a dozen read sites + 9 write sites; the read sites are concentrated in `render()`/`updated()` of the one element file (plus the two picker paths). A mechanical, compiler-driven migration: the type errors enumerate exactly what to change.

## The `previewShift` removal — behavioral equivalence argument

`updated()` gates the preview branch on `this._state.previewShift` (state copy, refreshed only when a load completes) while the live shift is the element field `previewShift` (:207, written only by the picker action handler :218–223). Spec FR-011: remove `previewShift` from state; the element field remains the source; the snapshot in state serves `render()`.

Replacing the state-copy check with the element-field check is **behaviorally equivalent**: in every interleaving (field changes between loads, stale preview data in state), the branch's additional gates — presence of `previewSeries`/`previewChartTime` in state — are the effective enablers, and those arrive only from a load matching the current field. Concretely: (a) default→shift: state has no preview fields → branch off under either check until the load lands; (b) shift→further shift: stale preview fields + negative field → branch on under either check, drawing the stale preview during the load (today's behavior); (c) shift→default: field 0 → branch off. The golden picker/preview integration tests confirm. [source: :207, :218–223, :536–541, :559–635, :820–835] (confidence: high)

## Prior art & patterns

- The 909 research decision R3 ("plain element field for the shift") remains true for the **live** shift; the union's `PreviewSnapshot` is the in-state **render payload** — the two coexist, and the audit (W5) recommends exactly this consolidation of the four scattered preview fields. [source: audit §2 W5; specs/909-timewindow-preview data-model] (confidence: high)
- `PreviewSnapshot` consolidates `previewShift` (redundant with the element field — kept in the snapshot only if useful for tests; spec: the snapshot carries shift + series + windows + chartTime) + `previewSeries` + `previewWindows` + `previewChartTime` into one optional object on `ReadyState`. [source: spec FR-011] (confidence: high)
- Discriminated unions on an existing string discriminant are idiomatic TS; the `status` field name is unchanged, so `state.status === "ready"` checks compile without change.

## Evidence Against the Idea

- **Diff breadth**: the reshape touches every read site in the element (render/updated) plus picker paths and test literals — a wide but mechanical diff; the full gate + golden tests are the safety net. [source: consumer enumeration above] (confidence: high)
- **Migration ordering risk**: reshaping before TD-2 would mean doing the ready-shape change at two assembly sites by hand — hence the TD-2-first ordering (see decision.md). [source: Edge Case 6] (confidence: high)
- **No runtime behavior change is allowed** (FR-019) — the migration must not "improve" defensive fallbacks (e.g., :1045, :1234) into different semantics; removing a `?? fallback` inside the ready branch is fine only where the compiler proves presence.

## Gaps & Open Questions

None. The `textSummary`/`mergedTimeWindow` optionality question from `data-model.md` §1 is resolved here (both required on `ReadyState`); `previewShift` removal is shown behaviorally equivalent.
