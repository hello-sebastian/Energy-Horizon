# Contract: Lovelace Card Editor API

**Feature**: 005-gui-editor  
**Type**: UI Contract — Home Assistant Lovelace integration  
**Direction**: `EnergyHorizonCard` ↔ `EnergyHorizonCardEditor` ↔ HA Frontend

---

## 1. Card → HA: Static methods on `EnergyHorizonCard`

HA Lovelace calls these when the user opens the "Edit card" panel.

### `static getConfigElement(): HTMLElement`

```ts
static getConfigElement(): HTMLElement {
  return document.createElement("energy-horizon-card-editor");
}
```

**Contract**:
- MUST return an `HTMLElement` instance.
- The custom element `"energy-horizon-card-editor"` MUST already be registered via `customElements.define` **before** this method is called.
- Guarantee: the editor module (`energy-horizon-card-editor.ts`) is imported statically at the top of `cumulative-comparison-chart.ts`, ensuring synchronous registration on bundle load.

### `static getStubConfig(): Partial<CardConfig>`

```ts
static getStubConfig(): Partial<CardConfig> {
  return { entity: "", comparison_mode: "year_over_year" };
}
```

**Contract**:
- MUST return a plain object that, when passed to `setConfig()`, does not throw.
- Does NOT need to include every field.
- `entity: ""` is valid — card handles empty entity gracefully.

---

## 2. HA → Editor: Methods HA calls on the editor element

### `editor.setConfig(config: CardConfig): void`

Called by HA once when the editor panel opens, with the current card config.

**Contract**:
- MUST store `config` as the full internal `_config` object.
- MUST NOT throw for any valid `CardConfig` shape.
- MUST reset `_editorMode` to `"visual"`.
- MUST reset `_yamlError` to `null`.

### `editor.hass = hassObject` (property setter)

HA sets this property to pass the live HomeAssistant object.

**Contract**:
- Editor uses `hass` for: resolving the current language (to feed into `createLocalize`).
- MUST handle `undefined` / `null` gracefully (degraded mode: English labels).

---

## 3. Editor → HA: `config-changed` CustomEvent

The editor MUST dispatch this event every time the config changes (any field edit, or a valid YAML-mode save).

```ts
this.dispatchEvent(new CustomEvent("config-changed", {
  detail: { config: this._config },
  bubbles: true,
  composed: true,   // crosses shadow DOM boundary — required for HA to receive it
}));
```

**Contract**:
- Event type: `"config-changed"` (string, exact match).
- `detail.config`: the **full** current `CardConfig` object (never a partial — YAML-only fields included).
- `bubbles: true` — event bubbles up the DOM.
- `composed: true` — event crosses shadow DOM boundaries (required; HA listens on a parent node outside the shadow root).
- MUST be dispatched on every `ha-form` `value-changed` event.
- MUST be dispatched when switching from YAML text mode to Visual mode (after successful parse).
- MUST NOT be dispatched while the user is typing in the YAML textarea (only on mode-switch).
- MUST NOT suppress the event when `entity` is `""` (empty entity is valid and emitted immediately).

---

## 4. `<ha-form>` Internal Contract

The editor renders `<ha-form>` with these properties:

| Property       | Type                            | Value |
|----------------|---------------------------------|-------|
| `.schema`      | `ReadonlyArray<HaFormSchema>`   | `EDITOR_SCHEMA` constant |
| `.data`        | `Partial<CardConfig>`           | `{ entity, title, comparison_mode, force_prefix }` slice of `_config` |
| `.hass`        | `HomeAssistant \| undefined`    | forwarded from editor's `hass` property |
| `.computeLabel`| `(schema: {name:string}) => string` | `(s) => localize("editor." + s.name)` |

**Event listened**: `value-changed` on the `<ha-form>` element.  
`e.detail.value` contains the updated form-controlled fields as a plain object.

---

## 5. Invariants (must hold at all times)

1. **No YAML-only field loss**: `_config` always contains the complete card config as last set via `setConfig()` or YAML parse. Shallow-merge on `ha-form` changes never removes keys.
2. **No crash on missing `hass`**: Editor renders (degraded) if `hass` is `undefined`.
3. **No crash on unknown field values**: `comparison_mode` or `force_prefix` values outside the known union are shown as empty selection; no exception thrown.
4. **YAML mode blocked on invalid YAML**: Mode switch from yaml → visual blocked until YAML is valid; `_yamlError` drives inline error display.
5. **Empty entity is valid**: `entity: ""` emits `config-changed` immediately; no suppression.
