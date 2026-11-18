# Decision: CardState as a discriminated union (FR-011 / TD-11)

- **Slug**: cardstate-union
- **Decided**: 2026-11-16
- **Verdict**: go
- **Artifacts reviewed**: intake.md ✓ | research.md ✓ | problem.md ✓ | concept.md ✓
- **Companion assessment**: `ready-state-builder` (FR-002 / TD-2) — jointly decides the Wave 2 ordering (spec Edge Case 6)

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | strong | Verified: 9 assembly sites, comment-only invariants, non-null assertions and runtime re-guards at the consumer sites (research.md); the historical "ready without series" bug class is structurally writable today (audit §2, W5). |
| Evidence strength | high | All assembly sites enumerated and field-by-field verified on 2026-11-16; the required-field set (including `textSummary`, `mergedTimeWindow`, `errorMessage`) is proven present at every relevant site; the `previewShift` removal has a written behavioral-equivalence argument. |
| Value vs. inaction | strong | Compiler-enforced invariants (Constitution III); removes the defensive-copypasta pattern; TD-9 (view-model) consumes a proven `ReadyState`; SC-002 progress (0 assertions in render/updated). |
| Feasibility / appetite | adequate | M effort (~1 day, compiler-driven migration) within the W2 budget; the wide diff is mechanical — the type errors enumerate every site. |
| Strategic fit | strong | Constitution III (invariants in the type system), II (defensive error path preserved — `ErrorState` keeps its message + params); zero public surface added (FR-019); no new dependencies. |
| Risk posture | adequate | Top risks bounded: consumer-diff semantics drift (golden tests + "removal is a no-op" rule), preview-gate redirection (equivalence argued + golden picker/preview tests), test-literal churn (type errors, safe). The TD-11↔TD-2 coupling is resolved by explicit ordering below. |

## Verdict & Rationale

**Go** with Option A: `CardState = LoadingState | ErrorState | NoDataState | ReadyState` on the existing `status` discriminant; `ReadyState` requires `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime` and carries `preview?: PreviewSnapshot` (shift + series + windows + chartTime); `ErrorState` requires `errorMessage`; `previewShift` leaves the top-level state (element field stays the live source). No new public surface — FR-019 holds by construction.

## Ordering decision (Edge Case 6 — with `ready-state-builder`)

**TD-2 (builder) first, then TD-11 (this task), both in Wave 2; TD-11 must not start until TD-2 is merged.** Rationale: after TD-2 there is exactly one ready-state production site (the builder). The union reshape then touches one assembly site + consumers, instead of two hand-rolled assemblies (demo + production). The intermediate state after TD-2 is green and strictly better (same flat type, one producer). Doing TD-11 first would reshape the type at two assembly sites and then move them — pure extra work, and the spec forbids an intermediate state where the builder would emit an old shape. **This confirms plan.md decision D2.**

## Invariants (must hold at the TD-11 gate)

1. Discriminated union on `status`; no new `status` values, no renamed fields.
2. `ReadyState`: the 8 required fields un-writable-absent (compiler proves); `preview?: PreviewSnapshot` only on `ReadyState`.
3. `previewShift` gone from state; live shift read from the element field in `updated()`/`render()`; 909/910 observable behavior identical (edge cases 7, 9).
4. 0 non-null assertions in `render()`/`updated()` (SC-002 progress).
5. Golden integration tests green, expected values unchanged (FR-019); full gate green.

## Risks carried to tasks.md

- R1 (medium): consumer-diff semantics drift — rule: removing a `?? fallback` is allowed only where the compiler proves presence, and only as a no-op (same value).
- R2 (medium): preview-gate redirection — the golden picker/preview integration tests are the final word; if any flakes, revert the gate to read the snapshot's `previewShift` (still inside the union) and re-argue.
- R3 (low): test-literal churn — construction-only changes; no expected-value edits permitted (FR-019).
- R4 (low): `errorParams` readers — compiler flags any off-error-state read.

## Handoff to `/speckit.tasks` (Wave 2, PR #2 of W2)

- **Problem**: state invariants live in comments; every state read needs defensive fallbacks/assertions.
- **Chosen approach**: Option A per concept.md; shape finalized in problem.md (including the `textSummary`/`mergedTimeWindow`/`errorMessage` required-field verdicts).
- **In scope**: union in `src/card/types.ts`, `PreviewSnapshot` type, builder return-type alignment (single site — TD-2 done), consumer migration in render/updated/picker paths, test-literal updates, domain spec 903 update (FR-016).
- **Out of scope**: state construction (done in TD-2), assertions outside render/updated (TD-6), public surface changes (none allowed).
- **Ordering**: second task of Wave 2, strictly after TD-2 merge.
