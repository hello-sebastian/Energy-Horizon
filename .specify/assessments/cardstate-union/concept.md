# Concept: CardState union shape (FR-011 / TD-11)

- **Slug**: cardstate-union
- **Created**: 2026-11-16
- **Recommended option**: Option A — union on the existing `status` discriminant

## Options

### Option A — Union on the existing `status` discriminant
- **Sketch**: `CardState = LoadingState | ErrorState | NoDataState | ReadyState` where each shape keeps the literal `status` value as its discriminant and `ReadyState`/`ErrorState` carry their required fields. `ReadyState.preview?: PreviewSnapshot` consolidates the four 909 preview fields. Consumers narrow with `switch (state.status)` / `if` — existing `state.status === "ready"` checks compile unchanged. `previewShift` leaves the state; the element field is the live source (behavioral equivalence argued in research.md).
- **Appetite**: medium (M, ~1 day): the type change is small; the consumer migration (render/updated/picker/tests) is compiler-driven and mechanical.
- **Trade-offs**: Wins — zero new surface (no new field names, no new `status` values — public-surface invariance holds trivially); the compiler enumerates every site needing attention; the required-field set is exactly what the spec names. Sacrifices — the ready shape's required fields mean the demo/production assemblies must all be complete (they are — verified at all sites); `PreviewSnapshot` adds one nested type. Risk — the wide consumer diff must not silently change fallback semantics inside non-ready branches.
- **Rabbit holes**: (1) test literals constructing partial ready states — they must be updated to full shapes (a type error, safe); (2) the `updated()` preview-branch gate redirection (state copy → element field) — equivalence is argued, but the golden picker/preview tests must be the final word; (3) `errorParams` only makes sense on `ErrorState` — moving it there is clean, but verify no code reads `errorParams` off a non-error state.

### Option B — Separate `kind` tag alongside `status`
- **Sketch**: Keep `status` for the public/serialization shape, add an internal `kind` discriminant with richer per-kind payloads.
- **Appetite**: medium-large.
- **Trade-offs**: Wins — none material: `status` already carries exactly the four values needed. Sacrifices — two discriminants to keep in sync, double the narrowing boilerplate, a public-surface question (is `kind` part of the contract?). Rejected: strictly more surface for the same guarantee.

### Option C — State classes / objects with behavior
- **Sketch**: Per-status classes (`ReadyState` class with methods like `chartTime()`), or a state object owning transition methods.
- **Appetite**: large.
- **Trade-offs**: Wins — methods colocated with data. Sacrifices — breaks the plain-data idiom the codebase uses everywhere (state is constructed as literals, passed immutably); overlaps TD-2's scope (transitions belong to the builder); FR-019 risk from a larger rewrite. Rejected.

## Recommendation

**Option A.** It is the spec's own shape, adds zero public surface (FR-019-friendly), and the evidence shows the migration is mechanical and fully compiler-enumerated. The one semantic subtlety — redirecting the preview-branch gate to the element field — is behaviorally equivalent (research.md) and covered by the golden tests.

## Out of Scope (for Option A)

- State construction unification (TD-2 — done first in Wave 2).
- Removing non-null assertions outside `render()`/`updated()` (that is TD-6, W3, when `noUncheckedIndexedAccess` lands).
- Any change to `status` values, field names, or default behaviors.

## Assumptions to Validate (during implementation)

- No code reads `errorParams` (or any moved field) off a non-error state — the compiler will flag it.
- All test literals update to the full shapes with no expected-value change (only construction changes).
- After the migration, the `?? fallback` sites (:1045, :1234, :1282) inside ready branches are removable because the compiler proves presence — and their removal is a no-op (same values).
