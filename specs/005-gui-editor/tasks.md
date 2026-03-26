# Tasks: Visual Configuration Editor (005-gui-editor)

**Input**: Design documents from `/specs/005-gui-editor/`  
**Prerequisites met**: plan.md ✅ spec.md ✅ data-model.md ✅ contracts/lovelace-editor-api.md ✅ research.md ✅ quickstart.md ✅

**Tests**: No automated test tasks — manual HA testing per `quickstart.md` checklist (spec states: "no new test files required").

**Organization**: Tasks are ordered by dependency group (A → B → C → D → E per plan.md). User story labels track which spec acceptance criteria each task satisfies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (no shared dependencies at that point)
- **[US#]**: Which user story from spec.md this task satisfies

---

## Phase 1: Foundational (Type Infrastructure + i18n)

**Purpose**: Type declarations and translation data that all subsequent tasks depend on.

**⚠️ CRITICAL**: All editor component tasks (T005–T010) depend on this phase being complete.

- [x] T001 Modify `src/ha-types.ts` — add the following three exports at the end of the file:
  1. `export type HaFormSchema = | { name: string; selector: { entity: { domain?: string } }; required?: boolean } | { name: string; selector: { text: Record<string, never> }; required?: boolean } | { name: string; selector: { select: { options: Array<{ value: string; label: string }> } }; required?: boolean }`
  2. `export interface LovelaceCardEditor extends HTMLElement { hass?: HomeAssistant; setConfig(_config: unknown): void; }`
  3. `declare global { interface Window { jsyaml?: { dump(obj: unknown, options?: Record<string, unknown>): string; load(str: string): unknown; } } }`

- [x] T002 [P] Modify `src/translations/en.json` — add the following 7 keys inside the root object under a new `"editor"` namespace:
  ```json
  "editor": {
    "entity": "Entity",
    "title": "Title",
    "comparison_mode": "Comparison Mode",
    "force_prefix": "Unit Prefix",
    "visual_mode": "Visual",
    "yaml_mode": "YAML",
    "yaml_error": "Invalid YAML"
  }
  ```

- [x] T003 [P] Modify `src/translations/pl.json` — add the following 7 keys inside the root object under a new `"editor"` namespace:
  ```json
  "editor": {
    "entity": "Encja",
    "title": "Tytuł",
    "comparison_mode": "Tryb porównania",
    "force_prefix": "Prefiks jednostki",
    "visual_mode": "Wizualny",
    "yaml_mode": "YAML",
    "yaml_error": "Nieprawidłowy YAML"
  }
  ```

- [x] T004 [P] Modify `src/translations/de.json` — add the following 7 keys inside the root object under a new `"editor"` namespace:
  ```json
  "editor": {
    "entity": "Entität",
    "title": "Titel",
    "comparison_mode": "Vergleichsmodus",
    "force_prefix": "Einheitenpräfix",
    "visual_mode": "Visuell",
    "yaml_mode": "YAML",
    "yaml_error": "Ungültiges YAML"
  }
  ```

**Checkpoint**: T001–T004 done → TypeScript types are valid, `createLocalize(lang)("editor.entity")` returns the correct string in all three languages.

---

## Phase 2: US1 — Open Card Editor and See Fields (Priority: P1) 🎯 MVP

**Goal**: HA opens the editor side panel with a labeled form showing 4 fields populated from the current config.

**Independent Test**: Add the Energy Horizon card to a dashboard → click 3-dot menu → Edit → side panel opens with labeled fields for entity, title, comparison mode, force prefix. No JavaScript errors. Fields are pre-filled from existing config.

### Implementation for User Story 1

- [x] T005 [US1] Create `src/card/energy-horizon-card-editor.ts` — new file with the following structure:

  **Imports** (top of file, in order):
  ```ts
  import { LitElement, html, css } from "lit";
  import { property, state } from "lit/decorators.js";
  import type { TemplateResult } from "lit";
  import type { HomeAssistant, HaFormSchema } from "../ha-types";
  import type { CardConfig } from "./types";
  import { createLocalize } from "./localize";
  ```

  **Schema constant** (after imports, before class):
  ```ts
  type EditorMode = "visual" | "yaml";

  const EDITOR_SCHEMA: ReadonlyArray<HaFormSchema> = [
    { name: "entity", selector: { entity: { domain: "sensor" } } },
    { name: "title", selector: { text: {} } },
    {
      name: "comparison_mode",
      selector: {
        select: {
          options: [
            { value: "year_over_year",  label: "Year over Year" },
            { value: "month_over_year", label: "Month over Year" },
          ],
        },
      },
    },
    {
      name: "force_prefix",
      selector: {
        select: {
          options: [
            { value: "auto", label: "Auto" },
            { value: "none", label: "None (raw)" },
            { value: "G",    label: "G (Giga)" },
            { value: "M",    label: "M (Mega)" },
            { value: "k",    label: "k (Kilo)" },
            { value: "",     label: "— (base unit)" },
            { value: "m",    label: "m (milli)" },
            { value: "µ",    label: "µ (micro)" },
          ],
        },
      },
    },
  ] as const;
  ```

  **Class definition** with the following members:
  - `@property({ attribute: false }) hass?: HomeAssistant;` — HA injects the live HA object
  - `private _config?: CardConfig;` — full config, including YAML-only fields
  - `@state() private _editorMode: EditorMode = "visual";` — use `@state()` for reactivity
  - `@state() private _yamlText = "";` — use `@state()` for reactivity
  - `@state() private _yamlError: string | null = null;` — use `@state()` for reactivity

  **`setConfig(config: CardConfig): void`** — contract: must not throw; args: `config: CardConfig`; returns: `void`; body: `this._config = { ...config }; this._editorMode = "visual"; this._yamlError = null;`

  **`private _formData(): Partial<CardConfig>`** — args: none; returns: `{ entity: this._config?.entity ?? "", title: this._config?.title, comparison_mode: this._config?.comparison_mode, force_prefix: this._config?.force_prefix }`

  **`private _computeLabel(schema: { name: string }): string`** — args: `schema: { name: string }`; returns: localized label string; body: `const lang = this.hass?.locale?.language ?? (this.hass as unknown as { language?: string })?.language ?? "en"; return createLocalize(lang)("editor." + schema.name);`

  **`private _hasYamlSupport(): boolean`** — returns `typeof window.jsyaml !== "undefined"`

  **`static styles`** getter — minimal CSS: host display block, textarea full width with monospace font, error class in red, toggle button styling

  **Registration** at bottom of file (outside class): `customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);`

- [x] T006 [US1] Implement `protected render(): TemplateResult` in `src/card/energy-horizon-card-editor.ts`:

  - Guard: if `!this._config` return `html\`\`` (empty)
  - Render container `<div class="editor">` containing:
    1. Toggle button row (only rendered when `this._hasYamlSupport()` is `true`): two buttons side-by-side — "Visual" (calls `_switchToYaml`/`_switchToVisual`, styled as active when `_editorMode === "visual"`) and "YAML" (styled as active when `_editorMode === "yaml"`); clicking Visual→YAML calls `_switchToYaml()`; clicking YAML→Visual calls `_switchToVisual()`
    2. Visual panel (rendered when `_editorMode === "visual"`):
       ```html
       <ha-form
         .schema=${EDITOR_SCHEMA}
         .data=${this._formData()}
         .hass=${this.hass}
         .computeLabel=${this._computeLabel.bind(this)}
         @value-changed=${this._handleValueChanged}
       ></ha-form>
       ```
    3. YAML panel (rendered when `_editorMode === "yaml"`): `<textarea>` and error display — implemented in T009

- [x] T007 [US1] Modify `src/card/cumulative-comparison-chart.ts`:

  - Add `import "./energy-horizon-card-editor.js";` as the **first** import line after all existing imports (must be at top, before any class definitions, to guarantee synchronous `customElements.define` before HA calls `getConfigElement()`)
  - Add two static methods to the `EnergyHorizonCard` class:
    ```ts
    static getConfigElement(): HTMLElement {
      return document.createElement("energy-horizon-card-editor");
    }

    static getStubConfig(): Partial<CardConfig> {
      return { entity: "", comparison_mode: "year_over_year" };
    }
    ```

**Checkpoint (US1 complete)**: After T005–T007, the card shows an editor panel with 4 labeled fields when the user clicks Edit. No crash when `hass` is undefined. Unknown `force_prefix`/`comparison_mode` values show as empty selection without error.

---

## Phase 3: US2 — Edit Entity with Live Preview (Priority: P1)

**Goal**: Any field change in the editor is reflected on the card immediately (within 500 ms per SC-002).

**Independent Test**: Open the editor → change the entity selector → the card chart updates live without closing the editor.

### Implementation for User Story 2

- [x] T008 [US2] Implement `private _handleValueChanged(e: CustomEvent): void` and `private _emitConfigChanged(): void` in `src/card/energy-horizon-card-editor.ts`:

  **`_handleValueChanged(e: CustomEvent): void`** — args: `e: CustomEvent` (from `ha-form` `value-changed` event); returns: `void`; body:
  ```ts
  if (!this._config) return;
  const updated: CardConfig = { ...this._config, ...(e.detail.value as Partial<CardConfig>) };
  this._config = updated;
  this._emitConfigChanged();
  ```
  Note: `e.detail.value` contains only the 4 form-controlled fields. Spreading `this._config` first ensures all YAML-only fields are preserved (shallow-merge pattern per D-003 and SC-006).

  **`_emitConfigChanged(): void`** — args: none; returns: `void`; body:
  ```ts
  this.dispatchEvent(new CustomEvent("config-changed", {
    detail: { config: this._config },
    bubbles: true,
    composed: true,
  }));
  ```
  Critical: `composed: true` is required — without it, the event does not cross the shadow DOM boundary and HA does not receive it (per D-002).

  Edge cases to handle in the same task:
  - `entity: ""` — emit immediately, no suppression (spec edge case)
  - Unknown enum values in `comparison_mode`/`force_prefix` — shown as empty, no throw (no extra code needed; `ha-form` handles this)

**Checkpoint (US2 complete)**: After T008, every form field change emits `config-changed` with the full `CardConfig` (including YAML-only fields). The card re-renders live. `npm run lint` passes.

---

## Phase 4: US5 — Switch Between Visual and YAML Text Mode Without Data Loss (Priority: P1)

**Goal**: User can toggle to YAML text view and back; YAML-only fields are never dropped; invalid YAML blocks the switch with an error.

**Independent Test**: Set `primary_color: "#ff0000"` in YAML → open editor → click YAML toggle → full config including `primary_color` visible in textarea → edit title → click Visual toggle → form shows new title → save → `primary_color` still in config.

### Implementation for User Story 5

- [x] T009 [US5] Implement YAML mode switch methods and extend `render()` in `src/card/energy-horizon-card-editor.ts`:

  **`private _switchToYaml(): void`** — args: none; returns: `void`; body:
  ```ts
  this._yamlText = window.jsyaml!.dump(this._config ?? {});
  this._yamlError = null;
  this._editorMode = "yaml";
  ```
  (LitElement re-renders automatically via `@state()` on `_editorMode` and `_yamlText`.)

  **`private _switchToVisual(): void`** — args: none; returns: `void`; body:
  ```ts
  try {
    const parsed = window.jsyaml!.load(this._yamlText);
    this._config = parsed as CardConfig;
    this._yamlError = null;
    this._editorMode = "visual";
    this._emitConfigChanged();
  } catch (err) {
    this._yamlError = (err as Error).message;
    // _editorMode stays "yaml" — switch is blocked
  }
  ```

  **`private _handleYamlInput(e: Event): void`** — args: `e: Event`; returns: `void`; body: `this._yamlText = (e.target as HTMLTextAreaElement).value;` — updates `_yamlText` only; does NOT parse or emit on each keystroke (per R-010: parse only on mode switch).

  **Extend `render()`** — YAML panel branch (when `_editorMode === "yaml"`):
  ```html
  <textarea
    class="yaml-editor"
    .value=${this._yamlText}
    @input=${this._handleYamlInput}
  ></textarea>
  ${this._yamlError
    ? html`<p class="error">${this._yamlError}</p>`
    : ""}
  ```

  **Update toggle buttons** in the render() toggle row (from T006):
  - "Visual" button: `@click=${this._switchToVisual}` (wires the correct handler now that the method exists)
  - "YAML" button: `@click=${this._switchToYaml}`

**Checkpoint (US5 complete)**: After T009, the YAML toggle shows full config; switching back to Visual works; invalid YAML shows inline error and blocks switch; YAML-only fields survive a full round-trip (Visual → YAML → edit → Visual → save). `npm run lint` passes.

---

## Phase 5: US3 — Validate and Save Configuration (Priority: P2)

**Goal**: Config changes are correctly persisted by HA when the user saves and closes the editor.

**Implementation note**: US3 requires no new tasks — it is satisfied structurally by:
- T007: `getStubConfig()` provides a valid default config (FR-009)
- T008: `_handleValueChanged` dispatches `config-changed` with full `CardConfig` on every change (FR-004, FR-014)
- T009: `_switchToVisual()` dispatches `config-changed` after successful YAML parse (FR-013)

HA's Lovelace infrastructure handles the actual persistence on "Save". Our contract is fulfilled.

---

## Phase 6: US4 — Localized Field Labels (Priority: P3)

**Goal**: Field labels shown in the user's HA frontend language (EN / PL / DE).

**Implementation note**: US4 requires no new tasks — it is satisfied by:
- T002–T004: All 7 `editor.*` keys added to EN, PL, DE translation files (FR-006)
- T005: `_computeLabel()` resolves language from `hass.locale.language` and calls `createLocalize(lang)("editor." + schema.name)` (FR-006, D-005)
- T006: `.computeLabel=${this._computeLabel.bind(this)}` property wired to `<ha-form>` (FR-006)

- [x] **Phase 6 / US4 verification**: Confirmed `editor.*` keys in `en.json` / `pl.json` / `de.json`, `_computeLabel` + `ha-form` `.computeLabel` in `energy-horizon-card-editor.ts`; `npm test` + `npm run lint` pass (no additional code changes required for this phase).

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T010 Modify `README.md` — add a "## Visual Editor" section (after the existing configuration section) with the following content:
  - One paragraph stating that the card supports a visual editor accessible via the card's 3-dot menu → Edit
  - Bullet list of the 4 configurable fields: **Entity** (sensor domain), **Title** (optional display name), **Comparison Mode** (`year_over_year` / `month_over_year`), **Unit Prefix** (`auto` / `none` / `G` / `M` / `k` / base unit / `m` / `µ`)
  - Note that a YAML text mode toggle is available in the editor for editing the full config including advanced options (colors, opacities, etc.)
  - Note that YAML-only fields are preserved when editing through the visual form

---

## Phase 8: Bugfixes (Post-MVP)

**Purpose**: Fix issues identified in the visual editor and chart behavior after initial release.

- [ ] T011 [P] Modify `src/ha-types.ts` — add `customCards?: Array<{ type: string; name: string; description?: string }>;` to `declare global { interface Window { ... } }` (for editor panel title "Energy Horizon").

- [ ] T012 [P] Modify `src/index.ts` — after `import "./card/cumulative-comparison-chart";` add registration:
  ```ts
  const win = window as Window & { customCards?: Array<{ type: string; name: string; description?: string }> };
  win.customCards = win.customCards ?? [];
  win.customCards.push({
    type: "energy-horizon-card",
    name: "Energy Horizon",
    description: "Visualize energy consumption by comparing current and reference period trends."
  });
  ```
  Fixes editor panel title showing "Konfiguracja karty """.

- [ ] T013 Modify `src/card/energy-horizon-card-editor.ts` — at end of `setConfig(config: CardConfig): void` add `this.requestUpdate();`. Fixes ~3 s delay before form appears.

- [ ] T014 Modify `src/card/energy-horizon-card-editor.ts` — in `force_prefix` options: remove `{ value: "", label: "— (base unit)" }`, add at **first** position `{ value: "", label: "" }`. Keep other options (auto, none, G, M, k, m, µ). Fixes misleading "— (base unit)" label.

- [ ] T015 Modify `src/translations/en.json`, `pl.json`, `de.json` — add keys `editor.year_over_year` and `editor.month_over_year` (EN: "Year over year" / "Month over year"; PL: "Rok do roku" / "Miesiąc do miesiąca rok temu"; DE: "Jahr zu Jahr" / "Monat zum Vorjahr"). Replace static `EDITOR_SCHEMA` with `_buildSchema(lang)` that uses `createLocalize(lang)` for comparison_mode option labels; call `_buildSchema(this._editorLang())` in render. Fixes hardcoded English labels in Polish UI.

- [ ] T016 Modify `src/card/echarts-renderer.ts` — in `buildOption`, replace:
  ```ts
  const dataMax = Math.max(..., 1);
  ```
  with:
  ```ts
  const allNonNull = [...(currentValues.filter((v) => v !== null) as number[]), ...(referenceValues.filter((v) => v !== null) as number[])];
  const dataMax = allNonNull.length > 0 ? Math.max(...allNonNull) : 0;
  ```
  Remove hardcoded `1` so Y-axis scales correctly when `force_prefix` is G/M/k (e.g. 300 kWh → 0.0003 GWh, axis max stays data-driven, chart readable).

**Checkpoint (Phase 8)**: Editor opens quickly; title shows "Energy Horizon"; Unit Prefix has empty option first; Comparison Mode labels localized; chart Y-axis does not flatten when changing prefix.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001–T004): No dependencies — start immediately. T002, T003, T004 are parallel.
Phase 2 (T005–T007): DEPENDS ON Phase 1 complete. T005 must complete before T006. T007 depends on T005.
Phase 3 (T008): DEPENDS ON T006 (render() must exist to wire @value-changed).
Phase 4 (T009): DEPENDS ON T008 (_emitConfigChanged must exist). T006 render() is extended.
Phase 5 (US3): No tasks — satisfied by T007+T008+T009.
Phase 6 (US4): No tasks — satisfied by T002–T004+T005+T006.
Phase 7 (T010): Independent of all phases — can run any time after Phase 1.
Phase 8 (T011–T016): Independent — bugfixes; T011+T012 parallel, T013–T016 parallel.
```

### Within-Phase Dependencies (Phase 2)

```
T001 → T002 [P]  (T002, T003, T004 can run concurrently once T001 structure is understood)
      → T003 [P]
      → T004 [P]

T002 + T003 + T004 → T005 → T006 → T007
                                  ↓
                             T008 (extends T005's class)
                                  ↓
                             T009 (extends T006's render + T008's _emitConfigChanged)
```

### Parallel Opportunities

- **T002, T003, T004**: Three JSON files, fully independent — run simultaneously
- **T010**: README update has no code dependency — can be done any time
- **T011, T012**: Phase 8 parallel — ha-types and index.ts independent

---

## Parallel Example: Phase 1

```bash
# Run simultaneously after T001:
Task: "Add editor.* keys to src/translations/en.json"    # T002
Task: "Add editor.* keys to src/translations/pl.json"    # T003
Task: "Add editor.* keys to src/translations/de.json"    # T004
```

---

## Implementation Strategy

### MVP First (US1 + US2 only)

1. Complete Phase 1: T001–T004 (foundational types + translations)
2. Complete Phase 2: T005–T007 (editor component + card integration) → **US1 done**
3. Complete Phase 3: T008 (live preview via `config-changed`) → **US2 done**
4. **STOP and VALIDATE**: Manual test per `quickstart.md` checklist items 1–8
5. The editor is functional for the majority of users at this point

### Full Delivery

6. Complete Phase 4: T009 (YAML toggle) → **US5 done**
7. Complete Phase 7: T010 (README) → **documentation done**
8. Final validation: Run full `quickstart.md` manual checklist + `npm test` + `npm run lint`

### Single-Developer Linear Order

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 [P] T012 [P] → T013 → T014 → T015 → T016

---

## Task Summary

| Task | Phase | Story | File | Parallel? |
|------|-------|-------|------|-----------|
| T001 | 1 – Foundational | — | `src/ha-types.ts` | No |
| T002 | 1 – Foundational | — | `src/translations/en.json` | Yes |
| T003 | 1 – Foundational | — | `src/translations/pl.json` | Yes |
| T004 | 1 – Foundational | — | `src/translations/de.json` | Yes |
| T005 | 2 – US1 MVP | US1 | `src/card/energy-horizon-card-editor.ts` (NEW) | No |
| T006 | 2 – US1 MVP | US1 | `src/card/energy-horizon-card-editor.ts` | No |
| T007 | 2 – US1 MVP | US1 | `src/card/cumulative-comparison-chart.ts` | No |
| T008 | 3 – US2 | US2 | `src/card/energy-horizon-card-editor.ts` | No |
| T009 | 4 – US5 | US5 | `src/card/energy-horizon-card-editor.ts` | No |
| T010 | 7 – Polish | — | `README.md` | Yes |
| T011 | 8 – Bugfixes | — | `src/ha-types.ts` | Yes |
| T012 | 8 – Bugfixes | — | `src/index.ts` | Yes |
| T013 | 8 – Bugfixes | — | `src/card/energy-horizon-card-editor.ts` | No |
| T014 | 8 – Bugfixes | — | `energy-horizon-card-editor.ts` | No |
| T015 | 8 – Bugfixes | — | `src/translations/*.json`, `energy-horizon-card-editor.ts` | No |
| T016 | 8 – Bugfixes | — | `src/card/echarts-renderer.ts` | No |

**Total**: 16 tasks  
**New files**: 1 (`src/card/energy-horizon-card-editor.ts`)  
**Modified files**: 6 base + Phase 8 (`ha-types.ts`, `index.ts`, `energy-horizon-card-editor.ts`, `echarts-renderer.ts`, `en.json`, `pl.json`, `de.json`, `cumulative-comparison-chart.ts`, `README.md`)  
**Parallel opportunities**: T002/T003/T004 (Phase 1), T010 (any time)  
**MVP scope**: T001–T008 (US1 + US2 fully functional)

---

## Notes

- **No automated tests required** — manual HA testing per `quickstart.md`. Optional: unit test for `_handleValueChanged` shallow-merge behavior.
- **TypeScript strict mode**: All code in the new file must compile under `strict`. No `any`. Use the `HaFormSchema` union type from `ha-types.ts` to avoid `any` in schema definitions.
- **`composed: true`** on the `config-changed` CustomEvent is non-negotiable — without it, HA's Lovelace layer cannot receive the event across the shadow DOM boundary.
- **`@state()` decorator** must be used for `_editorMode`, `_yamlText`, `_yamlError` — without it, changes to these private fields will not trigger LitElement re-renders.
- **`window.jsyaml` guard**: The toggle button MUST be hidden (not just disabled) when `_hasYamlSupport()` returns `false`. The editor must work in Visual-only mode if `jsyaml` is absent.
- Commit after each task or after each checkpoint to enable easy rollback.
