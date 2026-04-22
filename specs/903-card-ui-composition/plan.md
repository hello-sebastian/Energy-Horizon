# Implementation Plan: Narrative Engine Refactor

**Branch**: `903-card-ui-composition` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md) (§ Narrative Engine Refactor)  
**Input**: Domain spec + cross-domain amendments in `905-localization-formatting`, `900-time-model-windows`

## Summary

Replace geometry-based month detection (`resolvedWindowsAreConsecutiveCalendarMonths`, `isMom`) with intent-based `classifyComparisonStep(mergedTimeWindow.step)` so narrative period copy matches declared `step` regardless of `offset`. Migrate flat / `*_mom` translation keys to a three-layer schema (`text_summary.{entityKind}.{trend}`, `text_summary.period.{stepKind}`, shared `no_reference` / `insufficient_data`) with `generic.*` mandatory fallback per language. Add `hasTranslationKey` for safe fallback without tripping global missing-key error state. Fix insufficient-comparison path to use `text_summary.insufficient_data` instead of `no_reference`.

## Technical Context

**Language/Version**: TypeScript 5.6+ (strict), ES modules  
**Primary Dependencies**: Lit 3, Luxon 3, Home Assistant Lovelace card APIs (`hass`, `hui-*`)  
**Storage**: N/A (in-browser card; translations in `src/translations/*.json`)  
**Testing**: Vitest 2 (`npm test`), ESLint (`npm run lint`)  
**Target Platform**: Modern evergreen browsers running Home Assistant Lovelace  
**Project Type**: Single frontend package (HACS-distributed custom card)  
**Performance Goals**: Narrative resolution O(1) string lookups per render; no additional network I/O  
**Constraints**: No new YAML fields; no changes to Forecast \| Total copy (FR-903-U); `computeTextSummary` / `computeInterpretationSemantics` unchanged beyond render/key layer  
**Scale/Scope**: ~5 translation files (`en`, `pl`, `de`, `fr`, …), one chart component, `localize.ts` extension, new small pure module + tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. HA / HACS compatibility | PASS | User-visible strings remain via `localize()`; no new HA APIs |
| II. Safety / resilience | PASS | Missing keys still fail gracefully; fallback reduces false error states |
| III. TypeScript strict + tests | PASS | Pure functions + Vitest; mandatory key scan in CI |
| IV. UX / accessibility | PASS | Copy correctness for billing cycles; no contrast/layout change |
| V. Performance / simplicity | PASS | Single classifier call per render; no heavy date geometry |

**Gate result**: PASS — no Complexity Tracking table required.

## Project Structure

### Documentation (this feature)

```text
specs/903-card-ui-composition/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── narrative-i18n.md
├── spec.md              # Domain source of truth (includes Narrative Engine Refactor)
├── tasks.md             # Filled by /speckit.tasks (not this command)
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/card/
├── cumulative-comparison-chart.ts   # Remove isMom; wire new narrative key resolution
├── localize.ts                      # hasTranslationKey (+ exports)
├── narrative/                       # NEW: classify-comparison-step.ts, interpretation-to-entity-kind.ts (or single file)
└── time-windows/                    # Unchanged logic; consumes merged.step string shape ("1M", "1w", …)

src/translations/
├── *.json                           # Migrated keys
└── CONTEXT.md                       # NEW: grammar context for period.*

tests/unit/
├── cumulative-comparison-chart-localization.test.ts
├── classify-comparison-step.test.ts # NEW
├── localize-has-translation-key.test.ts # NEW (or merged)
└── localize-dictionary-loading.test.ts
```

**Structure Decision**: Single package layout above; narrative pure logic extracted to `src/card/narrative/` for testability (Constitution III).

## Phase 0: Research — **COMPLETE**

All clarifications were pre-specified; no open NEEDS CLARIFICATION items. Findings: [research.md](./research.md).

## Phase 1: Design & Contracts — **COMPLETE**

| Artifact | Path |
|---|---|
| Entity / key model | [data-model.md](./data-model.md) |
| i18n contract | [contracts/narrative-i18n.md](./contracts/narrative-i18n.md) |
| Contributor quickstart | [quickstart.md](./quickstart.md) |

**Cross-domain sync**: `905-localization-formatting/spec.md` updated for `neutral_band` in `trend` set, mandatory `text_summary.generic.neutral_band`, FR-905-L count **11** keys.

### Constitution Check (post-design)

Re-evaluated: still PASS — contracts stay within HA localization patterns; no new dependencies.

## Documentation & release (`907-docs-product-knowledge`)

Per **FR-903-NJ** and **Documentation & release** in [spec.md](./spec.md):

- **User-visible changes** (narrative copy, i18n keys, semantics): require a **`CHANGELOG.md`** entry under **`[x.y.z]`** matching the **semver git tag** for that release (e.g. **`[1.1.0]`** if shipped in that line, or a new section for the next tag).
- **Configuration or documented behavior** (YAML, editor, guides): also update **`README.md`**, **`README-advanced.md`**, and **`wiki-publish/`** where prose would otherwise be wrong. This narrative refactor does **not** add YAML keys; still review those docs for narrative / `step` / offset / translator content.

## Phase 2 — **OUT OF SCOPE for `/speckit.plan`**

Implementation task breakdown lives in `tasks.md` via `/speckit.tasks` (include explicit tasks for **FR-903-NJ** / **SC-903-N6** when cutting a release).

## Agent context

Run from repo root after plan merge:

```bash
bash .specify/scripts/bash/update-agent-context.sh cursor-agent
```

---

## Complexity Tracking

*No constitution violations — table not used.*
