# Intake: CardState as a discriminated union (FR-011 / TD-11)

- **Slug**: cardstate-union
- **Created**: 2026-11-16
- **Source**: `specs/911-tech-debt-reduction/spec.md` (FR-011), `architecture-audit-2026-11-15.md` (W5, TD-11)
- **Type**: refactoring — zero user-visible change (FR-019)

## Idea (as captured)

> The card state is one flat `interface CardState` with a `status` field and a dozen optional fields. The invariants ("ready implies series/summary/forecast/period/windows/chartTime present", "preview fields only while a preview is active") live only in comments and in runtime guards. Model state as a discriminated union on `status`: `CardState = LoadingState | ErrorState | NoDataState | ReadyState`, with `ReadyState` requiring its fields and carrying an optional `preview?: PreviewSnapshot`; remove `previewShift` from the state fields (the element field remains the source of the shift; the snapshot in state serves `render()`).

## Restated

Move the card's state invariants from comments and runtime null-guards into the TypeScript type system, so that a "ready" state without its data is un-writable, preview fields cannot accompany non-ready states, and the 909 preview fields consolidate into a single `PreviewSnapshot` object.

## Constraints (from spec)

- **FR-011 acceptance**: invariants enforced by the compiler; 0 non-null assertions in `render()`/`updated()`; card tests green.
- **FR-017**: this assessment is a pre-flight before Wave 2; its results feed `plan.md`.
- **FR-019**: zero user-visible change; golden integration tests unchanged.
- **Edge case 6**: coupled with FR-002 (TD-2, builder) — same wave (W2), explicit order.
- **909/910 semantics preserved 1:1**: transient preview shift behavior, demo-first picker, real-data upgrade (edge cases 7, 9).
- **Constitution**: III (compiler-enforced invariants over comment invariants), II (defensive error path preserved).

## First-Glance Unknowns

Resolved during research (see research.md): all state assembly sites enumerated (9 sites, 4 shapes); `textSummary`/`mergedTimeWindow` always present in ready assemblies; every error site sets `errorMessage`; the preview-field check in `updated()` can be redirected to the element field with behavioral equivalence.
