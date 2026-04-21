# Research: Interpretation mode & neutral band (903)

**Feature**: `specs/903-card-ui-composition/spec.md`  
**Date**: 2026-04-21

All **NEEDS CLARIFICATION** items from the planning template are resolved via the normative spec and clarifications session (2026-04-21). Below are implementation decisions consolidated for Phase 1.

---

## Decision: Central semantic helper

**Rationale**: One function (or small module) computes `SemanticOutcome` from `(current, reference, p, interpretation, T)` so the narrative row and ECharts delta styling cannot drift (**FR-903-R**).

**Alternatives considered**: Inline branching in chart vs card — rejected (duplicate logic, test burden).

---

## Decision: Use chip’s percent `p` for neutral band

**Rationale**: Spec defines **`p`** as the same signed percentage as the delta chip’s percent column. Reuse the **exact** numeric value already computed for display so **`|p| ≤ T`** matches user mental model vs the chip.

**Alternatives considered**: Recompute % from raw totals in the helper — rejected unless chip and helper share one implementation to avoid rounding drift.

---

## Decision: Insufficient data is a fourth outcome, not neutral-band

**Rationale**: Clarification **Option B** — placeholder chip (`---`) gets **dedicated** `localize()` keys and **muted** styling, distinct from **`|p| ≤ T`** “similar” (**FR-903-W**).

**Alternatives considered**: Treat as neutral-band — rejected (misleading).

---

## Decision: `neutral_interpretation` editor optional in v1

**Rationale**: Spec non-goal — YAML-only for `T` in first release; shallow-merge preserves key (**904**).

**Alternatives considered**: Add numeric field to `ha-form` immediately — deferred to reduce editor scope.

---

## Decision: Theme tokens for semantic colors

**Rationale**: Constitution **IV** — success/warning/neutral/muted states should map to existing HA CSS variables (`--success-color`, `--warning-color`, `--secondary-text-color`, etc.) as already used or extended in the card; no hardcoded hex for semantic meaning.

**Alternatives considered**: New custom palette — rejected.

---

## Decision: Vitest for semantic mapping

**Rationale**: Constitution **III** — pure functions for outcome mapping are fast to unit test with table-driven cases (consumption, production, `T`, edge reference=0, missing `p`).

**Alternatives considered**: E2E only — insufficient for branch coverage.
