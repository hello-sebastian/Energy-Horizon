# Implementation Plan: Time model — ISO `time_window.offset`

**Branch**: `1.1.0` (current; speckit `setup-plan.sh` expects `###-feature-name` — run from a feature branch to auto-copy this template next time) | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Domain spec `900-time-model-windows` (FR-900-Q, US-900-6–8, Edge Cases 11–20, Clarifications 2026-04-22)

## Summary

Implement **FR-900-Q**: a **single** parser/validator for `time_window.offset` that accepts full **ISO 8601** duration strings (including compound and signed forms), evaluates them with **Luxon** `DateTime.plus(Duration.fromISO(…))` semantics in the HA instance time zone, keeps **legacy** `+1d` / `+3M` / `+1Y`-style aliases in **one shim function**, rejects sub-hour totals, fractional calendar components, and malformed strings, and routes all failures through the **existing** invalid `time_window` card error key (`status.config_invalid_time_window`) with **no** new translation keys. **`ComparisonWindow[]` and `ha-api.ts` consumer contracts stay unchanged** — only merge validation and `computeStartOfWindow0` (and any shared duration helpers) consume the new offset `Duration`.

## Technical Context

**Language/Version**: TypeScript 5.6+ (`strict`), ES modules  
**Primary Dependencies**: Luxon 3.7 (`DateTime`, `Duration.fromISO`, calendar `plus` / clamping)  
**Storage**: N/A (in-browser Lovelace card)  
**Testing**: Vitest 2 (`npm test`), ESLint (`npm run lint`); extend `tests/unit/time-windows-*.test.ts`  
**Target Platform**: Evergreen browsers in Home Assistant Lovelace  
**Project Type**: Single HACS frontend package (`src/card/time-windows/`)  
**Performance Goals**: Parse/validate offset once per config merge / window resolution path; O(1) string work beyond Luxon  
**Constraints**: No new i18n keys for offset errors; no changes to `ComparisonWindow` shape or downstream pipeline types; fail-fast in `setConfig` aligned with existing `assertMergedTimeWindowConfig` / `assertLtsHardLimits` patterns  
**Scale/Scope**: One new small module (or tightly scoped additions to `duration-parse.ts`), updates to `validate.ts`, `resolve-windows.ts`, optional alignment in `lts-hard-limits.ts` if offset sub-hour must throw at same layer; Vitest golden cases from spec Edge Cases 11–20

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. HA / HACS compatibility | PASS | YAML surface already documented in spec; no new HA APIs |
| II. Safety / resilience | PASS | Invalid offset fails fast; same user-visible error class as other bad `time_window` |
| III. TypeScript strict + tests | PASS | Pure parse + Vitest tables for ISO, legacy, leap, rejections |
| IV. UX / accessibility | PASS | Clear card error via existing key; no silent fallback |
| V. Performance / simplicity | PASS | Single parser entry point; no new dependencies |

**Gate result**: PASS — no Complexity Tracking table required.

## Project Structure

### Documentation (this feature)

```text
specs/900-time-model-windows/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── time-window-offset.md
├── spec.md              # Domain source of truth
├── checklists/
│   └── requirements.md
└── tasks.md             # Filled by /speckit.tasks (not this command)
```

### Source Code (repository root)

```text
src/card/time-windows/
├── duration-parse.ts       # Token parser for step/duration (unchanged contract for non-offset fields unless deduped)
├── resolve-windows.ts      # computeStartOfWindow0: use canonical offset Duration from new parser
├── validate.ts             # validate/assert merged config: offset via FR-900-Q parser
├── merge-config.ts         # Preset merge (unchanged behavior except validated offset shape)
├── lts-hard-limits.ts      # LTS guards; confirm offset sub-hour consistency with validate path
└── index.ts                # Re-exports if needed

tests/unit/
├── time-windows-resolve.test.ts
├── time-windows-merge-validate.test.ts
└── time-windows-offset-iso.test.ts   # NEW (or merged into resolve/validate tests)
```

**Structure Decision**: Keep offset ISO logic in **one module** exported to `validate.ts` and `resolve-windows.ts` so FR-900-Q “one place” is enforceable in code review.

## Phase 0: Research — **COMPLETE**

Spec and codebase review resolved design choices; consolidated in [research.md](./research.md). No remaining NEEDS CLARIFICATION.

## Phase 1: Design & Contracts — **COMPLETE**

| Artifact | Path |
|---|---|
| Entity / validation model | [data-model.md](./data-model.md) |
| Offset parser public contract | [contracts/time-window-offset.md](./contracts/time-window-offset.md) |
| Contributor quickstart | [quickstart.md](./quickstart.md) |

### Constitution Check (post-design)

Re-evaluated: **PASS** — contracts stay in-browser, no new dependencies, errors reuse existing localization key.

## Phase 2 — **OUT OF SCOPE for `/speckit.plan`**

Implementation task breakdown lives in `tasks.md` via `/speckit.tasks`. Cross-domain release items (904 error surfacing, 907 docs, 901 forecast denominator verification) are noted in [spec.md](./spec.md) Assumptions — tasks should reference them when cutting release work.

## Agent context

Run from repo root after plan merge:

```bash
bash .specify/scripts/bash/update-agent-context.sh cursor-agent
```

---

## Complexity Tracking

*No constitution violations — table not used.*
