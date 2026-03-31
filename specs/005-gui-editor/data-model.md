# Data Model: 005-gui-editor

**Branch**: `005-gui-editor` | **Date**: 2026-03-22

---

## Entities

### 1. `CardConfig` *(existing — `src/card/types.ts`)*

No new fields. All existing fields preserved. Editor reads and writes this type.

```ts
interface CardConfig {
  type: string;
  entity: string;                        // FR-003: entity selector field
  title?: string;                        // FR-003: text input field
  comparison_preset: ComparisonMode;    // FR-003: select field (YAML key; ha-form name)
  force_prefix?: ForcePrefix;           // FR-003: select field
  // ... all other existing fields pass-through (YAML-only in editor)
}
```

**Validation rules**:
- `entity`: any string (including `""`). Empty string is valid and emitted as-is per spec.
- `comparison_preset`: `"year_over_year"` | `"month_over_year"` | `"month_over_month"`. Unknown values shown as empty selection (no error thrown). Legacy `comparison_mode` w surowym YAML jest wczytywany przez kartę i mapowany na to pole.
- `force_prefix`: `ForcePrefix` union. Unknown values shown as empty selection (no error thrown).
- `title`: any string or `undefined`. Optional.

---

### 2. `EditorSchema` *(new — defined in `src/card/energy-horizon-card-editor.ts`)*

A static `const` array of `HaFormSchema` descriptors. Not a runtime class; a plain typed constant.

```ts
const EDITOR_SCHEMA: ReadonlyArray<HaFormSchema> = [
  {
    name: "entity",
    selector: { entity: { domain: "sensor" } },
  },
  {
    name: "title",
    selector: { text: {} },
  },
  {
    name: "comparison_preset",
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

**Field-level constraints**:
- `entity.selector.entity.domain`: `"sensor"` — HA entity picker is filtered to sensor domain only.
- `comparison_preset` and `force_prefix` options: values must exactly match `ComparisonMode` and `ForcePrefix` TypeScript types.

---

### 3. `EditorMode` *(new — internal state in `EnergyHorizonCardEditor`)*

```ts
type EditorMode = "visual" | "yaml";
```

Not persisted. Resets to `"visual"` on each `setConfig()` call (i.e., each editor open).

**State transitions**:
```
"visual" ──[user clicks YAML toggle]──► "yaml"   (always allowed)
"yaml"   ──[user clicks Visual toggle, YAML valid]──► "visual"
"yaml"   ──[user clicks Visual toggle, YAML invalid]──► "yaml" + _yamlError set
```

---

### 4. `EnergyHorizonCardEditor` *(new class — `src/card/energy-horizon-card-editor.ts`)*

```ts
class EnergyHorizonCardEditor extends LitElement {
  // HA-injected
  @property({ attribute: false }) hass?: HomeAssistant;

  // Internal state
  private _config?: CardConfig;         // full config including YAML-only fields
  private _editorMode: EditorMode = "visual";
  private _yamlText = "";               // raw text in YAML textarea
  private _yamlError: string | null = null;  // parse error message or null

  // HA protocol
  setConfig(config: CardConfig): void;

  // Lit render
  protected render(): TemplateResult;

  // Event handlers
  private _handleValueChanged(e: CustomEvent): void;   // ha-form value-changed
  private _handleYamlInput(e: InputEvent): void;       // textarea input
  private _switchToYaml(): void;
  private _switchToVisual(): void;

  // Helpers
  private _computeLabel(schema: { name: string }): string;
  private _formData(): Partial<CardConfig>;             // slice of _config for ha-form
  private _emitConfigChanged(): void;
}
```

---

### 5. Translation Keys *(new — `src/translations/en.json`, `pl.json`, `de.json`)*

| Key                     | EN                  | PL                          | DE                    |
|-------------------------|---------------------|-----------------------------|-----------------------|
| `editor.entity`         | Entity              | Encja                       | Entität               |
| `editor.title`          | Title               | Tytuł                       | Titel                 |
| `editor.comparison_preset` | Comparison Preset   | Preset porównania           | Vergleichs-Preset     |
| `editor.force_prefix`   | Unit Prefix         | Prefiks jednostki           | Einheitenpräfix       |
| `editor.visual_mode`    | Visual              | Wizualny                    | Visuell               |
| `editor.yaml_mode`      | YAML                | YAML                        | YAML                  |
| `editor.yaml_error`     | Invalid YAML        | Nieprawidłowy YAML          | Ungültiges YAML       |

---

### 6. `HaFormSchema` Type *(new — `src/ha-types.ts`)*

Minimal TypeScript type for `ha-form` field descriptors. Strict-mode safe.

```ts
export type HaFormSchema =
  | { name: string; selector: { entity: { domain?: string } }; required?: boolean }
  | { name: string; selector: { text: Record<string, never> }; required?: boolean }
  | { name: string; selector: { select: { options: Array<{ value: string; label: string }> } }; required?: boolean };
```

---

### 7. `window.jsyaml` Global Declaration *(new — `src/ha-types.ts`)*

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

---

## File-to-Entity Mapping

| File | Entity / Change |
|------|-----------------|
| `src/card/energy-horizon-card-editor.ts` | **NEW** — `EnergyHorizonCardEditor`, `EDITOR_SCHEMA` |
| `src/card/cumulative-comparison-chart.ts` | **MOD** — add `static getConfigElement()`, `static getStubConfig()`; add `import "./energy-horizon-card-editor.js"` |
| `src/ha-types.ts` | **MOD** — add `HaFormSchema`, `LovelaceCardEditor`, `window.jsyaml` global |
| `src/translations/en.json` | **MOD** — add 7 `editor.*` keys |
| `src/translations/pl.json` | **MOD** — add 7 `editor.*` keys |
| `src/translations/de.json` | **MOD** — add 7 `editor.*` keys |
| `README.md` | **MOD** — document visual editor availability (FR-010) |
