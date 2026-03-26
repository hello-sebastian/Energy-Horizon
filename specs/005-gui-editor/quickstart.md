# Quickstart: 005-gui-editor

**Branch**: `005-gui-editor` | **Date**: 2026-03-22

Developer guide for implementing the Visual Configuration Editor feature.

---

## Prerequisites

- Node.js ≥ 18, `npm install` done.
- Working HA dev environment or HACS install for manual integration testing.
- Branch: `005-gui-editor`.

---

## Files to Create

| File | Description |
|------|-------------|
| `src/card/energy-horizon-card-editor.ts` | New editor LitElement component |

## Files to Modify

| File | Change |
|------|--------|
| `src/card/cumulative-comparison-chart.ts` | Add static import of editor, add `getConfigElement()` and `getStubConfig()` |
| `src/ha-types.ts` | Add `HaFormSchema`, `LovelaceCardEditor`, `window.jsyaml` declaration |
| `src/translations/en.json` | Add 7 `editor.*` keys |
| `src/translations/pl.json` | Add 7 `editor.*` keys |
| `src/translations/de.json` | Add 7 `editor.*` keys |
| `README.md` | Document visual editor (FR-010) |

---

## Implementation Order (linear, no skipping)

Follow exactly in this order — each step depends on the previous:

1. **`src/ha-types.ts`** — Add `HaFormSchema` union type + `LovelaceCardEditor` interface + `window.jsyaml` global declaration. (No runtime changes; TypeScript types only.)

2. **`src/translations/*.json`** — Add `editor.*` keys to all three files. (Ensures `localize("editor.entity")` works when the editor component is built.)

3. **`src/card/energy-horizon-card-editor.ts`** — Create the editor component. Full class with `setConfig`, `render`, `_handleValueChanged`, `_switchToYaml`, `_switchToVisual`, `_handleYamlInput`, plus `customElements.define(...)` at bottom.

4. **`src/card/cumulative-comparison-chart.ts`** — Add `import "./energy-horizon-card-editor.js"` at the top (after existing imports). Add `static getConfigElement()` and `static getStubConfig()` to the `EnergyHorizonCard` class.

5. **`README.md`** — Add a "Visual Editor" section describing the four configurable fields.

---

## Key Implementation Notes

### Editor component skeleton

```ts
// src/card/energy-horizon-card-editor.ts
import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import type { HomeAssistant, HaFormSchema } from "../ha-types";
import type { CardConfig } from "./types";
import { createLocalize } from "./localize";

const EDITOR_SCHEMA: ReadonlyArray<HaFormSchema> = [ /* see data-model.md */ ];

class EnergyHorizonCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  private _config?: CardConfig;
  private _editorMode: "visual" | "yaml" = "visual";
  private _yamlText = "";
  private _yamlError: string | null = null;

  setConfig(config: CardConfig): void {
    this._config = { ...config };
    this._editorMode = "visual";
    this._yamlError = null;
  }

  protected render() { /* visual or yaml panel */ }

  private _computeLabel(schema: { name: string }): string {
    const lang = this.hass?.locale?.language ?? this.hass?.language ?? "en";
    return createLocalize(lang)(`editor.${schema.name}`);
  }

  private _formData(): Partial<CardConfig> {
    return {
      entity: this._config?.entity ?? "",
      title: this._config?.title,
      comparison_mode: this._config?.comparison_mode,
      force_prefix: this._config?.force_prefix,
    };
  }

  private _handleValueChanged(e: CustomEvent): void {
    if (!this._config) return;
    const updated: CardConfig = { ...this._config, ...(e.detail.value as Partial<CardConfig>) };
    this._config = updated;
    this._emitConfigChanged();
  }

  private _emitConfigChanged(): void {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);
```

### YAML mode guard

```ts
private _hasYamlSupport(): boolean {
  return typeof window.jsyaml !== "undefined";
}
```

Only render the toggle button when `_hasYamlSupport()` is `true`.

### Switching from YAML → Visual

```ts
private _switchToVisual(): void {
  try {
    const parsed = window.jsyaml!.load(this._yamlText);
    this._config = parsed as CardConfig;
    this._yamlError = null;
    this._editorMode = "visual";
    this._emitConfigChanged();
  } catch (err) {
    this._yamlError = (err as Error).message;
    // stay in yaml mode
  }
  this.requestUpdate();
}
```

### Switching from Visual → YAML

```ts
private _switchToYaml(): void {
  this._yamlText = window.jsyaml!.dump(this._config ?? {});
  this._yamlError = null;
  this._editorMode = "yaml";
  this.requestUpdate();
}
```

---

## Manual Testing Checklist

- [ ] Open HA dashboard. Add card → pick "Energy Horizon". Card opens with stub config (no crash).
- [ ] Click card 3-dot menu → Edit. Side panel opens with 4 visible labeled fields.
- [ ] Pre-existing YAML config values are pre-filled in form fields.
- [ ] Change entity → card updates live.
- [ ] Change title → card title updates live.
- [ ] Change comparison_mode → chart re-renders.
- [ ] Change force_prefix → Y-axis unit updates.
- [ ] Clear entity (select nothing) → no crash, config-changed emitted with `entity: ""`.
- [ ] Close editor panel → re-open → form shows last saved values.
- [ ] Set a YAML-only field (e.g. `primary_color: "#ff0000"`) in YAML directly → open editor → change title → save → `primary_color` still present.
- [ ] Click YAML toggle → full YAML shown in textarea.
- [ ] Edit YAML (change title) → click Visual → form reflects new title.
- [ ] Type invalid YAML → click Visual → error shown, mode stays YAML.
- [ ] HA language Polish → editor labels in Polish.

---

## Run Tests

```bash
npm test
npm run lint
```

No new unit tests are required for this feature (editor is a pure UI component exercised via manual HA testing). If time permits, add a unit test for the shallow-merge behavior in `_handleValueChanged`.
