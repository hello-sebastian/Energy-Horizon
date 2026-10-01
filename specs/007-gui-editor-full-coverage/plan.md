# Implementation Plan: Full GUI Editor Coverage

**Branch**: `007-gui-editor-full-coverage` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-gui-editor-full-coverage/spec.md`

## Summary

Extend the existing Lovelace card editor (`src/card/energy-horizon-card-editor.ts`, base domain `005-gui-editor`) from 7 visual fields to **full `CardConfig` coverage** — 32 controls for all 26 user-configurable fields (excluding the constant `type` and the `forecast` alias): header (`show_title`, `icon`, `show_icon`), comparison & time windows (`aggregation`, `period_offset`, nested `time_window`), forecast (`show_forecast`), chart style (`fill_*`, `primary_color`, `connect_nulls`, `show_legend`), localization & numbers (`language`, `number_format`, `precision`), date formats (`x_axis_format`, `tooltip_format`), diagnostics (`debug`). Fields are grouped into 8 readable sections with progressive disclosure (advanced sections collapsed by default in HA-native `ha-expansion-panel` accordions; open state not persisted). The editor reuses the card's existing validation functions (time windows, Luxon formats) for inline errors without ever blocking `config-changed` emission. Documentation (`README.md`, `README.advanced.md`, wiki `Configuration-and-Customization` + `Documentation-Maintenance`) is updated in the same feature. No new npm dependencies; HA-native components only.

## Technical Context

**Language/Version**: TypeScript 5.6 (ES2020+, `strict`)

**Primary Dependencies**: Lit 3.1 (existing), HA frontend globals (`ha-form`, `ha-expansion-panel`, `window.jsyaml`), Luxon 3 (via card validation imports) — **no new npm dependencies**

**Storage**: N/A — in-browser only; config persisted by HA Lovelace infrastructure

**Testing**: Vitest 2 + jsdom (existing devDependencies); new unit tests for pure editor mapping/validation helpers

**Target Platform**: HA Lovelace frontend (browser, Web Components)

**Project Type**: Lovelace card (web component, HACS distribution)

**Performance Goals**: `config-changed` emitted within 500 ms of any field edit (SC-007); editor renders all sections without JS errors (SC-006)

**Constraints**: Zero new npm dependencies; `window.jsyaml` absent → Visual-only mode; unknown/invalid values never crash the editor; YAML-only fields never dropped (SC-002); section open-state not persisted (FR-018)

**Scale/Scope**: 1 modified editor file, 1 modified `ha-types.ts`, 1 modified `localize.ts`, 4 modified translation files, 4 modified docs, 1 new test file; 32 visual controls covering all 26 user-configurable `CardConfig` fields

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. HA Ecosystem Compliance | ✅ PASS | Extends the existing `getConfigElement()` / `config-changed` protocol; no new communication channels |
| I. HA Native Components | ✅ PASS | `ha-form` + `ha-expansion-panel` (HA design system); no custom UI reimplementation |
| II. Security & Resilience | ✅ PASS | Unknown values → default selection, no throw; invalid `time_window`/formats → inline error + card error state; no crash on missing `hass` |
| II. Defensive Data Ops | ✅ PASS | Full `_config` shallow merge preserved (005); YAML-only fields never dropped (SC-002) |
| III. TypeScript Strict | ✅ PASS | `HaFormSchema` union extended (number/color/icon); no `any` |
| III. Tests | ✅ PASS | New unit tests for editor pure mapping/validation helpers |
| III. Documentation | ✅ PASS | README + README.advanced + wiki updated in the same feature (FR-015…FR-017) |
| IV. HA Look & Feel | ✅ PASS | HA-native form + expansion panels; consistent with 005 |
| IV. Accessibility | ✅ PASS | `ha-form` / `ha-expansion-panel` provide accessible rendering (HA-managed) |
| V. Simplicity | ✅ PASS | Reuses the 005 editor architecture; sections are data-driven schema slices |
| V. No Unnecessary Deps | ✅ PASS | Zero new npm dependencies |

**Gate result**: ALL PASS — implementation may proceed.

## Project Structure

### Documentation (this feature)

```text
specs/007-gui-editor-full-coverage/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── lovelace-editor-api.md   # Phase 1 output (updated editor contract)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── card/
│   ├── energy-horizon-card-editor.ts   ← MOD: sections, full schema, time_window subform, validation, accordion
│   ├── localize.ts                     ← MOD: export SUPPORTED_LANGUAGES (dictionary keys)
│   ├── types.ts                        ← NO CHANGE (CardConfig already complete)
│   ├── time-windows/                   ← NO CHANGE (validation reused via imports)
│   └── axis/                           ← NO CHANGE (validateXAxisFormat reused via imports)
├── ha-types.ts                         ← MOD: extend HaFormSchema (number, color, icon selectors)
└── translations/
    ├── en.json                         ← MOD: new editor.* keys (labels, sections, options, errors)
    ├── pl.json                         ← MOD: same
    ├── de.json                         ← MOD: same
    └── fr.json                         ← MOD: same

Test/tests/unit/
└── editor-mapping.test.ts              ← NEW: unit tests for pure editor helpers

README.md                               ← MOD: new "Visual editor" section (all fields by section)
README.advanced.md                      ← MOD: "Lovelace editor" section → full field → control → default table
wiki-publish/
├── Configuration-and-Customization.md  ← MOD: new "Visual editor coverage" subsection (full table)
└── Documentation-Maintenance.md        ← MOD: Spec anchors (005/007) + drift-check item
```

**Structure Decision**: Single project (Option 1). Frontend-only Lovelace card; all changes are in `src/card/`, `src/ha-types.ts`, `src/translations/`, docs, plus one new unit test file. No new source modules.

## Complexity Tracking

No constitution violations. No complexity exceptions needed.

---

## Design Decisions

### D-001: Sections as data-driven schema slices + `ha-expansion-panel`
The editor renders one `<ha-form>` per section. Basic sections (the existing 7 fields, header, forecast) are always visible; advanced sections (time window, chart style, localization/numbers, date formats, diagnostics) are wrapped in `<ha-expansion-panel>` (HA-native accordion), collapsed by default. Section open-state is component-local and resets on every `setConfig()` — not persisted (FR-018). Each form's `value-changed` shallow-merges only its own fields into `_config` — the 005 merge guarantee (SC-002) is preserved per section.

### D-002: Nested `time_window` via flat form fields
`ha-form` data is a flat object; the time window section uses flat field names (`time_window_anchor`, `time_window_offset`, `time_window_duration`, `time_window_step`, `time_window_count`, `time_window_aggregation`) mapped into `CardConfig.time_window` by a pure, unit-tested helper (deep-merge; `undefined`/empty values omitted so the preset template applies).

### D-003: "auto" is a UI option, not a stored value
`aggregation` and `language` selects include a leading `auto` option that maps to `undefined` (key omitted from the emitted YAML); the card then applies `pickAutoAggregation(duration)` / HA global language. Concrete values are stored literally. Prefill: missing/`undefined` → select shows `auto`.

### D-004: Validation reuses card functions (no duplication)
The editor imports `buildMergedTimeWindowConfig` + `validateMergedTimeWindowConfig` (from `./time-windows`, domain `001-time-windows-engine`) and `validateXAxisFormat` (from `./axis`) and shows inline errors (localized via existing `status.*` keys / validator messages). `config-changed` is **always** emitted (005 pattern); the card remains the validation authority and shows its error state until the value is fixed (FR-014).

### D-005: `primary_color` as text field
`primary_color` accepts hex, CSS `var(...)`, and aliases (`ha-accent`, `ha-primary-accent`, `ha-primary`) — a color picker (hex-only) would silently lose those on save (SC-002 data-loss risk). FR-006 allows "color picker / text field"; text is the safe choice.

### D-006: `HaFormSchema` union extended
`src/ha-types.ts` gains `number` (min/max/step/mode), `color`, and `icon` selector variants — all HA-native selectors, strict-mode safe (005 pattern R-007).

### D-007: `SUPPORTED_LANGUAGES` exported from `localize.ts`
The `language` select options are derived from the loaded translation dictionaries (en/pl/de/fr) + `auto` — single source of truth, no hardcoded drift.

### D-008: Documentation in the same feature
`README.md` gains a "Visual editor" section (**none exists today** — 005's FR-010 drift, fixed here); `README.advanced.md`'s "Lovelace editor" section becomes the full field → control → default table; wiki `Configuration-and-Customization.md` gains a "Visual editor coverage" subsection (Reference quadrant, no new page); `Documentation-Maintenance.md` gains Spec anchors + a drift-check item.

---

## Phase 0 Research Summary

All research items in `research.md` are resolved (R-001…R-010) — see that file for decisions, rationale, and alternatives. No NEEDS CLARIFICATION items remain.

---

## Phase 1 Design Summary

| Artifact | File |
|----------|------|
| Data Model | `data-model.md` |
| Editor API Contract (updated) | `contracts/lovelace-editor-api.md` |
| Developer Quickstart | `quickstart.md` |

---

## Implementation Sequence (for tasks.md)

Ordered by dependency. Each group is independently testable after completion.

### Group A — Type & i18n infrastructure (no runtime behavior)
1. `src/ha-types.ts` — extend `HaFormSchema` (number, color, icon selectors).
2. `src/card/localize.ts` — export `SUPPORTED_LANGUAGES`.
3. `src/translations/{en,pl,de,fr}.json` — new `editor.*` keys (field labels, section titles, option texts, validation errors).

### Group B — Editor component (depends on A)
4. `src/card/energy-horizon-card-editor.ts` — section model, full per-section schemas, `time_window_*` subform mapping, `auto` → `undefined` mapping, default prefill (incl. preset template for unset `time_window`), validation wiring with inline errors, accordion rendering, section-state reset in `setConfig`.

### Group C — Tests (depends on B)
5. `Test/tests/unit/editor-mapping.test.ts` — unit tests for the pure helpers (field mapping, `time_window` merge, `auto` → `undefined`, defaults, unknown-value tolerance, validation wiring).

### Group D — Documentation (depends on B for accuracy)
6. `README.md` — "Visual editor" section (all fields by section).
7. `README.advanced.md` — full editor table in "Lovelace editor".
8. `wiki-publish/Configuration-and-Customization.md` — "Visual editor coverage" table.
9. `wiki-publish/Documentation-Maintenance.md` — Spec anchors + drift-check item.

---

## Post-Design Constitution Re-Check

After Phase 1 design, all gates still pass:

- Zero new npm dependencies (`ha-expansion-panel` is an HA frontend element).
- Strict TypeScript; extended `HaFormSchema` union, no `any`.
- HA-native components only; HA look & feel preserved.
- YAML-only fields structurally preserved (full `_config` merge, per-section).
- Graceful degradation defined for: missing `hass`, absent `window.jsyaml`, unknown enum values, invalid `time_window`/formats, missing `ha-expansion-panel`.
- Documentation updated in the same feature (Constitution III).