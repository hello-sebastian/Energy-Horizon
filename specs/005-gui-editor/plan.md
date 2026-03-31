# Implementation Plan: Visual Configuration Editor (GUI Editor)

**Branch**: `005-gui-editor` | **Date**: 2026-03-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-gui-editor/spec.md`

---

## Summary

Implement a Lovelace card editor GUI for `EnergyHorizonCard` that exposes four configuration fields (`entity`, `title`, `comparison_preset`, `force_prefix`) via `<ha-form>`, with live preview, full YAML-only field preservation, a Visual/YAML toggle mode, and localized labels. Communication uses the standard HA `config-changed` CustomEvent (`bubbles: true, composed: true`). No HA-specific helper packages are added.

---

## Technical Context

**Language/Version**: TypeScript 5.6 (ES2020+, `strict` enabled)  
**Primary Dependencies**: Lit 3.1 (LitElement, `html`, `css`, `property` decorator), `window.jsyaml` (HA frontend global — no npm addition), Vite 6 (bundler), Vitest 2 (tests)  
**Storage**: N/A — in-browser only; config written by HA Lovelace infrastructure  
**Testing**: Vitest 2 (existing); no new test files required; manual HA testing per quickstart checklist  
**Target Platform**: HA Lovelace frontend (browser, Web Components)  
**Project Type**: Lovelace card (web component, HACS distribution)  
**Performance Goals**: Config-changed event emitted within 500 ms of any field edit (SC-002)  
**Constraints**: Zero npm dependencies added; `window.jsyaml` absent → graceful degradation (Visual-only mode)  
**Scale/Scope**: 1 new file, 6 modified files, 5 functional requirements groups

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. HA Ecosystem Compliance | ✅ PASS | Uses standard `getConfigElement()` / `getStubConfig()` / `config-changed` CustomEvent API |
| I. HA Native Components | ✅ PASS | Uses `<ha-form>`, `window.jsyaml` — no custom UI reimplementation |
| II. Security & Resilience | ✅ PASS | No crash on missing `hass`, unknown field values, invalid YAML; empty entity emitted as-is |
| II. Defensive Data Ops | ✅ PASS | Shallow merge preserves all YAML-only fields; YAML parse errors blocked at mode switch |
| III. TypeScript Strict | ✅ PASS | All new code under `strict` mode; `HaFormSchema` union type prevents `any` usage |
| III. Modular Code | ✅ PASS | Editor in its own file; imported statically from main card |
| IV. HA Look & Feel | ✅ PASS | `<ha-form>` uses HA design system natively |
| IV. Accessibility | ✅ PASS | `<ha-form>` provides accessible field rendering (HA-managed) |
| V. Simplicity | ✅ PASS | Single file, no dynamic imports, no extra bundler entry points |
| V. No Unnecessary Deps | ✅ PASS | Zero new npm deps; `window.jsyaml` is a HA global |

**Gate result**: ALL PASS — implementation may proceed.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-gui-editor/
├── plan.md                          ← This file
├── research.md                      ← Phase 0 output (10 research items)
├── data-model.md                    ← Phase 1 output (7 entities / types)
├── quickstart.md                    ← Phase 1 output
├── contracts/
│   └── lovelace-editor-api.md       ← Phase 1 output (HA editor contract)
└── tasks.md                         ← Phase 2 output (NOT created here — /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── card/
│   ├── cumulative-comparison-chart.ts   ← MOD: add import, getConfigElement, getStubConfig
│   ├── energy-horizon-card-editor.ts    ← NEW: editor LitElement component
│   ├── types.ts                         ← NO CHANGE (CardConfig already complete)
│   ├── localize.ts                      ← NO CHANGE (createLocalize reused as-is)
│   └── ...
├── ha-types.ts                          ← MOD: add HaFormSchema, LovelaceCardEditor, jsyaml global
├── translations/
│   ├── en.json                          ← MOD: add 7 editor.* keys
│   ├── pl.json                          ← MOD: add 7 editor.* keys
│   └── de.json                          ← MOD: add 7 editor.* keys
└── ...

README.md                                ← MOD: add Visual Editor section
```

**Structure Decision**: Single project (Option 1). Frontend-only, no backend. Editor is a new sibling file in `src/card/`.

---

## Complexity Tracking

No constitution violations. No complexity exceptions needed.

---

## Design Decisions

### D-001: `customElements.define` registration
The editor is registered via `customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor)` at the bottom of `energy-horizon-card-editor.ts`. The file is imported with a static `import "./energy-horizon-card-editor.js"` at the top of `cumulative-comparison-chart.ts`. This guarantees synchronous registration before HA calls `getConfigElement()`.

### D-002: `config-changed` as generic CustomEvent
No HA helper packages (`@ha/core`, `ha-card-editor` etc.) are required. The event is dispatched with `new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })`. `composed: true` is critical — it crosses the shadow DOM boundary so HA's Lovelace layer (which listens outside the shadow root) receives it.

### D-003: Full `_config` shallow merge
`_config` holds the complete `CardConfig` at all times. `ha-form` emits only its 4 controlled fields. Merge: `{ ...this._config, ...e.detail.value }`. This guarantees YAML-only fields (colors, opacities, debug, etc.) are never dropped when the user saves through the visual form (SC-006).

### D-004: `window.jsyaml` for YAML mode
No npm dependency. HA frontend ships `js-yaml` as `window.jsyaml`. If absent at runtime, the toggle button is hidden and the editor operates in Visual-only mode. This keeps bundle size identical to pre-feature.

### D-005: `computeLabel` via `createLocalize`
Labels are NOT embedded in the schema array. A `computeLabel` arrow function is passed as a property to `<ha-form>`: `(s) => createLocalize(lang)("editor." + s.name)`. The language is resolved from `this.hass?.locale?.language ?? this.hass?.language ?? "en"` each render cycle.

### D-006: `_editorMode` resets on `setConfig`
Each time HA opens the editor (calling `setConfig`), `_editorMode` resets to `"visual"` and `_yamlError` resets to `null`. This ensures a clean state on every editor open, regardless of prior state.

---

## Phase 0 Research Summary

All 10 research items in `research.md` are resolved:

| Item | Status |
|------|--------|
| R-001: HA Lovelace Card Editor API | ✅ Resolved |
| R-002: `<ha-form>` Schema Format | ✅ Resolved |
| R-003: `window.jsyaml` Global | ✅ Resolved |
| R-004: Lit-based Editor Architecture | ✅ Resolved |
| R-005: Shallow Merge Strategy | ✅ Resolved |
| R-006: Translation Keys | ✅ Resolved |
| R-007: `ha-types.ts` Extension | ✅ Resolved |
| R-008: `getConfigElement` / `getStubConfig` | ✅ Resolved |
| R-009: `select` Options for `force_prefix` | ✅ Resolved |
| R-010: YAML Text Mode Toggle | ✅ Resolved |

---

## Phase 1 Design Summary

All design artifacts complete:

| Artifact | File |
|----------|------|
| Data Model | `specs/005-gui-editor/data-model.md` |
| Lovelace Editor API Contract | `specs/005-gui-editor/contracts/lovelace-editor-api.md` |
| Developer Quickstart | `specs/005-gui-editor/quickstart.md` |

---

## Implementation Sequence (for tasks.md)

Ordered by dependency. Each group is independently testable after completion.

### Group A — Type Infrastructure (no runtime)
1. Modify `src/ha-types.ts`: add `HaFormSchema` union type, `LovelaceCardEditor` interface, `window.jsyaml` global declaration.

### Group B — i18n Keys
2. Modify `src/translations/en.json`: add 7 `editor.*` keys.
3. Modify `src/translations/pl.json`: add 7 `editor.*` keys.
4. Modify `src/translations/de.json`: add 7 `editor.*` keys.

### Group C — Editor Component (depends on A, B)
5. Create `src/card/energy-horizon-card-editor.ts`:
   - Import `LitElement`, `html`, `css`, `property`
   - Import `HomeAssistant`, `HaFormSchema` from `../ha-types`
   - Import `CardConfig` from `./types`
   - Import `createLocalize` from `./localize`
   - Define `EDITOR_SCHEMA` const (4 fields)
   - Implement `EnergyHorizonCardEditor` class with all methods per data-model.md
   - `customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor)`

### Group D — Main Card Integration (depends on C)
6. Modify `src/card/cumulative-comparison-chart.ts`:
   - Add `import "./energy-horizon-card-editor.js"` (top of file, after existing imports)
   - Add `static getConfigElement(): HTMLElement` to `EnergyHorizonCard`
   - Add `static getStubConfig(): Partial<CardConfig>` to `EnergyHorizonCard`

### Group E — Documentation
7. Modify `README.md`: add "Visual Editor" section listing the 4 configurable fields and how to access the editor.

---

## Post-Design Constitution Re-Check

After Phase 1 design, all constitution gates still pass:

- No new npm dependencies introduced.
- All TypeScript types are strict; no `any` in new code.
- `<ha-form>` is an HA-native component (no custom UI reimplementation).
- YAML-only fields are structurally preserved by the shallow-merge pattern.
- Graceful degradation defined for: missing `hass`, absent `window.jsyaml`, unknown enum values, invalid YAML.
- `composed: true` on CustomEvent ensures proper HA integration without non-standard communication channels.
