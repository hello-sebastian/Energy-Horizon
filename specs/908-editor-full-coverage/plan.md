# Implementation Plan: Full-Coverage Visual Editor (v1.2.0)

**Branch**: `1.2.0` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/908-editor-full-coverage/spec.md` (v1.2.0 full-coverage visual editor for `energy-horizon-card`)

## Summary

Expand the `energy-horizon-card-editor` from a 6-field `<ha-form>` subset to **100% coverage** of the v1.1.0 YAML surface, organized into **six progressive-disclosure sections** driven by a **schema-driven field registry** (data, not template). The central engineering problem is the **lifecycle**: every field change emits `config-changed` → HA re-invokes `setConfig()` → the whole editor re-renders, which today would collapse expanded panels and steal focus mid-typing. The plan introduces a config-independent `EditorUiState` (expanded flags, focus, scroll) re-applied on every render, a **preservative deep merge** that never drops unmodeled keys, and a **debounced emit** pipeline (immediate display, debounced `config-changed`). It adds the **`custom`** comparison preset (type-level addition to `ComparisonMode` + a generic preset template in domain 900), normalizes the legacy `forecast` alias and deprecated `comparison_mode` on save, and localizes all new labels via the card's `localize()` under `editor.*` in all four shipped dictionaries. The YAML mode is a **first-class input path** (FR-908-Y): edits update the preview live (debounced) and the last valid YAML **values** are the saved config (HA re-serializes the config object, so values persist but text formatting is canonicalized); `setConfig()` preserves the editor mode. No new npm dependencies; the editor stays a static import.

## Technical Context

**Language/Version**: TypeScript 5.6+ (`strict`), ES modules, Lit 3 decorators

**Primary Dependencies**: Lit 3 (existing), ECharts 5, Luxon 3, date-fns 4 (existing); HA frontend runtime components (`ha-expansion-panel`, `ha-select`, `ha-textfield`, `ha-switch`, `ha-slider`, `ha-entity-picker`, `ha-icon-picker`, `ha-color-picker`); `window.jsyaml` (HA global, zero bundle cost). **No new npm packages.**

**Storage**: N/A (in-browser Lovelace card; config round-trips through HA's `config-changed` / `setConfig` contract; translations in `src/translations/*.json`)

**Testing**: Vitest 2 (`TZ=UTC npm test`), jsdom 25, ESLint 9 (`npm run lint`)

**Target Platform**: Modern evergreen browsers running Home Assistant Lovelace (HA 2024+ for the HA components used)

**Project Type**: Single frontend package (HACS-distributed custom card)

**Performance Goals**: Re-render after `setConfig` must be cheap enough to be invisible (no flash) — measured as zero spurious `config-changed` on a passive re-render (SC-908-3) and no visible reset (SC-908-2); discrete changes (select/switch/slider) reflected in the card preview within 500 ms (SC-908-4); YAML textarea edits produce a live preview within the emit debounce window with no-op suppression (SC-908-9); editor bundle growth bounded (no lazy chunk, no new deps)

**Constraints**: No new npm dependencies (Constitution: avoid new deps / vendor lock-in); no new Vite entry point or lazy-loaded editor module (domain 904 FR-904-F); no inline semantic validation in the editor (FR-908-S — the card owns error surfacing); no new translations beyond `en`/`pl`/`de`/`fr`; no `any` (Constitution III); every key in the incoming config must survive the round-trip (FR-908-P)

**Scale/Scope**: ~30 fields across 6 sections; 4 translation dictionaries; one custom element (`energy-horizon-card-editor`) + one small pure module set (registry, merge, normalization, UI state); one minimal cross-domain touch in domain 900 (`ComparisonMode` + `custom` preset template)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. HA / HACS compatibility | PASS | Uses standard HA runtime components (`ha-expansion-panel`, `ha-select`, …) and the standard `config-changed`/`setConfig` card contract; editor stays a static import; no new HA APIs; `custom` preset is a backward-compatible, opt-in config value |
| II. Safety / resilience | PASS | Config values are treated as untrusted data: invalid values are passed through (never crash the editor, FR-908-T), no HTML injection (labels via `localize()` text), graceful degradation when `hass` is absent or a select value is unknown; no sensitive data in UI/logs |
| III. TypeScript strict + tests | PASS | `strict` mode, no `any`; registry/merge/normalization are pure, unit-testable functions; Vitest coverage for merge, normalization, registry, and the re-render lifecycle contract |
| IV. UX / accessibility | PASS | HA look & feel via native HA components; progressive disclosure (S1 expanded, S2–S6 collapsed); keyboard-operable native controls; localized labels in all four languages; focus/caret/scroll preserved (FR-908-J/K/L/M) |
| V. Performance / simplicity | PASS | Debounced text emit avoids a full card re-query per keystroke; re-render emits nothing (no feedback loop, FR-908-N); declarative registry keeps the render path simple and predictable; no heavy computation on the main thread |

**Gate result**: PASS — no Complexity Tracking table required.

## Project Structure

### Documentation (this feature)

```text
specs/908-editor-full-coverage/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── editor-public-api.md
│   ├── field-registry.md
│   └── editor-i18n.md
├── spec.md              # Feature source of truth
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/card/
├── energy-horizon-card-editor.ts   # REWRITTEN: registry-driven render loop, EditorUiState,
│                                   #   debounce pipeline, preset↔custom cleanup, alias normalization
├── types.ts                        # ComparisonMode += "custom"; (forecast alias stays, normalized by editor)
├── localize.ts                     # unchanged API; consumed for all editor.* labels
├── time-windows/
│   └── presets.ts                  # getPresetTemplate: add "custom" branch → generic shape (no legacy flags)
├── editor/                         # NEW: pure, unit-testable editor modules
│   ├── field-registry.ts           # FieldDescriptor type + the full registry (33 fields, 6 sections; time_window.* are declarative fields)
│   ├── editor-ui-state.ts          # EditorUiState type + expand/collapse/focus/scroll helpers
│   ├── config-merge.ts             # preservative deep merge (field-path aware; time_window key-by-key)
│   └── config-normalize.ts         # load/save normalization: comparison_mode→comparison_preset, forecast→show_forecast
└── translations/
    ├── en.json                     # + editor.* section/field/option keys
    ├── pl.json                     # + editor.* keys
    ├── de.json                     # + editor.* keys
    └── fr.json                     # + editor.* keys

tests/unit/
├── editor-field-registry.test.ts   # coverage: every FR-908-D key present exactly once; section membership (FR-908-F); relocation = data change (FR-908-B/SC-908-8)
├── editor-config-merge.test.ts     # preservative merge: unmodeled keys survive; time_window key-by-key; delta check
├── editor-normalize.test.ts        # comparison_mode + forecast alias load/save normalization
├── editor-ui-state.test.ts         # expanded/focus/scroll survive a setConfig re-render
├── editor-debounce.test.ts         # text emit debounced; flush on blur/commit/close; no emit on re-render
├── editor-i18n.test.ts             # dictionary guard: every editor.* key resolves in en/pl/de/fr (SC-908-7)
└── editor-preset-switch.test.ts    # standard↔custom cleanup both directions (SC-908-5)

tests/integration/
└── editor-lifecycle.test.ts        # setConfig re-render: no spurious config-changed; focus/scroll/expanded preserved; ≥20-edit stability (SC-908-2)
```

> **Note (test files):** the tree above lists the *core* test files. The user-story phases in `tasks.md` create **additional** test files: `editor-coverage.test.ts` (T012), `editor-preset-switch-integration.test.ts` (T016), `editor-sections.test.ts` (T018), `editor-cascade.test.ts` (T020), `editor-degradation.test.ts` (T022), `editor-accessibility.test.ts` (T028), `editor-yaml-mode.test.ts` (T029), plus the T008 smoke test and the T011 language-chain test. The full set is defined by `tasks.md`; this tree is not exhaustive.

**Structure Decision**: Single-package layout (unchanged). New pure editor logic is isolated under `src/card/editor/` so the merge/normalization/registry/state rules are unit-testable without the Lit element (Constitution III). The Lit element itself (`energy-horizon-card-editor.ts`) becomes a thin shell: it owns `EditorUiState`, the debounce timer, and the registry-driven render loop. Domain 900 receives exactly one minimal, backward-compatible change (`ComparisonMode` + `custom` template branch). Documentation files (README/wiki/changelog) are **not** authored here — they are owned by domain `907` per the spec's Documentation Plan.

## Phase 0: Research — **COMPLETE**

All clarifications were resolved in the spec's `## Clarifications` (Session 2026-10-06); the only open implementation detail (debounce constant) is decided in [research.md](./research.md). No unresolved NEEDS CLARIFICATION items remain.

## Phase 1: Design & Contracts — **COMPLETE**

| Artifact | Path |
|---|---|
| Entity / key model (FieldDescriptor, FieldRegistry, EditorUiState, config pipeline, field→section map) | [data-model.md](./data-model.md) |
| Editor public API + `config-changed` contract | [contracts/editor-public-api.md](./contracts/editor-public-api.md) |
| Field registry schema contract | [contracts/field-registry.md](./contracts/field-registry.md) |
| Editor i18n key contract (`editor.*`, 4 dictionaries) | [contracts/editor-i18n.md](./contracts/editor-i18n.md) |
| Contributor quickstart / validation guide | [quickstart.md](./quickstart.md) |

### Constitution Check (post-design)

Re-evaluated after Phase 1: still **PASS**. The design adds no dependencies, no new HA APIs, no `any`, and keeps all new logic in pure, testable modules; the `custom` preset is a backward-compatible opt-in value; the i18n contract adds keys to all four shipped dictionaries only. No Complexity Tracking table required.

### Cross-domain sync

- **`900-time-model-windows`**: `ComparisonMode` gains `"custom"`; `getPresetTemplate` gains a `custom` branch returning the generic shape (`anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`, **no** `currentEndIsNow`/`referenceFullPeriod`/`periodOffsetYears` flags) so `resolveTimeWindows` takes the `resolveGeneric` path. The editor's preset↔custom cleanup (FR-908-Q) stays consistent with this.
- **`905-localization-formatting`**: new `editor.*` keys consumed via the existing `localize()`; label language follows the FR-908-X chain (card `language` → `hass.locale.language` → fallback).
- **`907-docs-product-knowledge`**: the spec's Documentation Plan (README / README.advanced / wiki / changelog `[1.2.0]`) is owned by domain 907 and is **not** authored in this feature's code tasks.

## Phase 2 — **OUT OF SCOPE for `/speckit-plan`**

Implementation task breakdown lives in `tasks.md` via `/speckit-tasks` (include explicit tasks for the domain-900 `custom` touch, the `editor.*` i18n keys, and the domain-907 documentation plan when cutting the 1.2.0 release).

## Complexity Tracking

*No constitution violations — table not used.*
