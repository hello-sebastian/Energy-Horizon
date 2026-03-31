# Research: 005-gui-editor

**Branch**: `005-gui-editor` | **Date**: 2026-03-22

---

## R-001: HA Lovelace Card Editor API

**Decision**: Use the standard Lovelace editor protocol: `static getConfigElement()` returning a registered custom element + `static getStubConfig()` for defaults.

**Rationale**:
- HA Lovelace detects `getConfigElement()` on the card class and opens the returned element in its side panel. This is the officially documented contract.
- The editor element MUST implement a `hass` setter and a `setConfig(config)` method. HA will call both.
- HA collects config changes by listening to the native `config-changed` CustomEvent on the editor element. Event `detail` MUST have the shape `{ config: CardConfig }`.
- No HA-specific helper package is needed; the communication is generic `CustomEvent` — fully compatible with the user's constraint.

**Alternatives considered**:
- `ha-entity-picker`, `ha-selector` individually — more granular but requires knowing internal HA element names. `ha-form` with a schema is simpler and covers all four fields.
- Dynamic `import()` for the editor — rejected per spec (FR-007); static import required for synchronous registration.

**References**: HA documentation "Defining your card editor" (2024 Lovelace dev docs).

---

## R-002: `<ha-form>` Schema Format

**Decision**: Use the `ha-form` custom element with a `schema` property (static array of descriptor objects) and a `computeLabel` function property.

**Schema field descriptor shape** (as of HA 2024+):
```ts
type HaFormSchema =
  | { name: string; selector: { entity: { domain?: string } }; required?: boolean }
  | { name: string; selector: { text: Record<string, never> }; required?: boolean }
  | { name: string; selector: { select: { options: Array<{ value: string; label: string }> } }; required?: boolean }
```

**Label wiring**: `computeLabel` is an arrow function `(schema) => localize("editor." + schema.name)`. It is passed as a property on the `<ha-form>` element via Lit's `.computeLabel=${...}` binding.

**Value binding**: `data` property on `<ha-form>` receives the current form-controlled subset of config. The `value-changed` event fires with `e.detail.value` containing the full updated form data object.

**Rationale**: `ha-form` handles all field rendering, validation display, and HA design-system consistency. It avoids manual `<input>` / `<select>` wiring.

**Alternatives considered**:
- Manual `<ha-entity-picker>` + custom `<select>` elements — more work, less consistent with HA UI, higher maintenance.

---

## R-003: `window.jsyaml` Global for YAML Serialization

**Decision**: Use `window.jsyaml` (the `js-yaml` global exposed by HA frontend) — no npm dependency.

**API surface used**:
```ts
declare global {
  interface Window {
    jsyaml?: {
      dump(obj: unknown, options?: Record<string, unknown>): string;
      load(str: string): unknown;
    };
  }
}
```

**Rationale**:
- HA frontend ships `js-yaml` as a global since early 2020. It is available in all supported HA versions (2024+).
- Using it as a global (zero bundle cost) respects the Constitution's principle of preferring HA-native libraries.
- If absent at runtime (e.g. test environment, very old HA), the YAML toggle is hidden and the editor works in Visual-only mode (graceful degradation per FR-013).

**Alternatives considered**:
- Adding `js-yaml` as an npm dependency — rejected; would duplicate a library already present in HA, adding bundle weight.
- Writing a minimal YAML serializer — rejected; fragile, high maintenance.

---

## R-004: Lit-based Editor Component Architecture

**Decision**: A single `LitElement` class (`EnergyHorizonCardEditor`) in `src/card/energy-horizon-card-editor.ts`.

**Pattern**:
```ts
class EnergyHorizonCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  private _config: CardConfig | undefined;
  private _editorMode: "visual" | "yaml" = "visual";
  private _yamlText = "";
  private _yamlError: string | null = null;

  setConfig(config: CardConfig): void { /* store _config */ }

  private _handleValueChanged(e: CustomEvent): void {
    const updated = { ...this._config, ...(e.detail.value as Partial<CardConfig>) };
    this._config = updated;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: updated }, bubbles: true, composed: true }));
  }
}
customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);
```

**Rationale**:
- Single file per FR-007. Registered synchronously.
- `bubbles: true, composed: true` on the CustomEvent ensures HA's Lovelace layer — which listens above the shadow DOM — can receive the event.
- `_config` always holds the FULL `CardConfig`, so YAML-only fields survive shallow-merge.

---

## R-005: Shallow Merge Strategy for YAML-Only Field Preservation

**Decision**: On every `value-changed` event from `<ha-form>`, spread `_config` first, then spread the updated form data: `{ ...this._config, ...(e.detail.value) }`.

**Rationale**:
- `ha-form` only emits the fields it controls (entity, title, comparison_preset, force_prefix). Spreading it on top of `_config` ensures all other fields (colors, opacities, etc.) survive untouched.
- This satisfies SC-006 (zero YAML-only field loss).

**Edge case — YAML text mode**: When switching from YAML text mode back to Visual, the full parsed object replaces `_config` entirely (YAML is authoritative per spec). Form fields then reflect the parsed values.

---

## R-006: Translation Keys for Editor

**Decision**: Add `editor.*` namespace keys to all three translation files.

**New keys required**:
```
editor.entity          → "Entity" / "Encja" / "Entität"
editor.title           → "Title" / "Tytuł" / "Titel"
editor.comparison_preset → "Comparison Preset" / "Preset porównania" / "Vergleichs-Preset"
editor.force_prefix    → "Unit Prefix" / "Prefiks jednostki" / "Einheitenpräfix"
editor.visual_mode     → "Visual" / "Wizualny" / "Visuell"
editor.yaml_mode       → "YAML" / "YAML" / "YAML"
editor.yaml_error      → "Invalid YAML" / "Nieprawidłowy YAML" / "Ungültiges YAML"
```

**Rationale**: `computeLabel` maps `schema.name → localize("editor.<name>")`. Button labels and error message also need translation keys for consistency (FR-006).

---

## R-007: `ha-types.ts` Extension for Editor

**Decision**: Extend `src/ha-types.ts` with a minimal `LovelaceCardEditor` interface and the `window.jsyaml` global declaration.

**Shape**:
```ts
export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(_config: unknown): void;
}
```

This satisfies TypeScript strict mode without requiring any external type package.

---

## R-008: `getConfigElement()` and `getStubConfig()` on Main Card

**Decision**: Add both as static methods directly on `EnergyHorizonCard` (in `cumulative-comparison-chart.ts`).

```ts
static getConfigElement(): HTMLElement {
  return document.createElement("energy-horizon-card-editor");
}

static getStubConfig(): Partial<CardConfig> {
  return { entity: "", comparison_preset: "year_over_year" };
}
```

**Rationale**:
- `getConfigElement()` must return an `HTMLElement` instance; the custom element must already be registered. The static import of the editor module at the top of `cumulative-comparison-chart.ts` guarantees synchronous registration.
- `getStubConfig()` returns the minimum config needed to render without error; `entity: ""` is safe because the card already handles empty-entity state.

---

## R-009: `select` Options for `force_prefix`

**Decision**: The `force_prefix` field uses a `select` selector with the following options:

| value   | label (EN)              |
|---------|-------------------------|
| `auto`  | Auto                    |
| `none`  | None (raw)              |
| `G`     | G (Giga)                |
| `M`     | M (Mega)                |
| `k`     | k (Kilo)                |
| ``      | — (base unit)           |
| `m`     | m (milli)               |
| `µ`     | µ (micro)               |

**Rationale**: The `ForcePrefix` type supports `'auto' | 'none' | 'G' | 'M' | 'k' | '' | 'm' | 'u' | 'µ'`. In the editor we expose `µ` (the user-facing alias; the scaler normalizes it to `'u'` internally). Empty string `''` maps to "base unit" with an em-dash label to avoid a blank option. Labels are embedded in the schema (not translated), because prefix names are internationally standardized.

---

## R-010: YAML Text Mode Toggle Implementation

**Decision**: Implement as a single toggle button above the form/textarea area within the editor shadow DOM. State is `_editorMode: "visual" | "yaml"` (private, not persisted).

**Switch Visual → YAML**:
1. `jsyaml.dump(this._config)` → populates `_yamlText`.
2. Renders `<textarea>` with `_yamlText`.
3. `_yamlError` cleared.

**Switch YAML → Visual**:
1. Try `jsyaml.load(this._yamlText)`.
2. If parse error: set `_yamlError`, block mode switch (stay in YAML).
3. If success: `_config = parsed as CardConfig`, `_yamlError = null`, mode → `"visual"`.
4. Emit `config-changed` with the parsed config.

**YAML text changes**: On each `input` event on the textarea, update `_yamlText` only (do NOT parse or emit on each keystroke — only on mode switch).

**`window.jsyaml` absent**: Hide toggle button entirely; editor renders in Visual-only mode.
