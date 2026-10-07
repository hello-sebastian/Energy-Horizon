# Contract: Editor Public API

The public surface of the `energy-horizon-card-editor` custom element and the main card's editor hooks. This is the contract other code (and Home Assistant) relies on. It is **unchanged in shape** from v1.1.0 — v1.2.0 extends *behavior* (coverage, lifecycle, merge) behind the same API.

## Main card class (unchanged surface)

```typescript
static getConfigElement(): HTMLElement;   // returns <energy-horizon-card-editor>
static getStubConfig(): Partial<CardConfig>;  // minimal valid config, at least { entity: "" }
```

- `getConfigElement()` returns the editor element; the editor is registered via a **static import** (no lazy chunk — domain 904 FR-904-F).
- `getStubConfig()` returns `{ entity: "" }` (plus `type`); all sections render with defaults on a fresh card (spec edge case).

## Editor custom element

```typescript
customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);

class EnergyHorizonCardEditor extends LitElement {
  hass?: HomeAssistant;          // set by HA
  setConfig(config: CardConfigInput): void;   // called by HA on every config change
}
```

### `setConfig(config: CardConfigInput)`

- Accepts the raw Lovelace config (may contain deprecated `comparison_mode`, legacy `forecast`, unknown keys).
- Normalizes for load (FR-908-I/V), stores the full object as `_config`, re-renders.
- **Preserves `_editorMode`** (does not reset to Visual; FR-908-Y). If the incoming config is a self-echo (structurally equal to the last-emitted config), the YAML textarea is not re-serialized. If it is an external change, the YAML textarea is re-serialized (caret best-effort). The self-echo / external classification MUST be robust to the known normalizations HA applies on the round-trip (key order, scalar type coercion) so a self-echo is never misclassified as external (which would re-serialize the textarea and steal the caret).
- **Re-applies `EditorUiState`** (expanded/focus/scroll) and **emits nothing** (FR-908-N). A passive re-render produces zero `config-changed` (SC-908-3).

### `config-changed` event

Emitted on every **genuine** config change (gated on a value delta; debounced for text/number, immediate for discrete controls):

```typescript
dispatchEvent(new CustomEvent("config-changed", {
  detail: { config: CardConfig },   // full preservative-merged object
  bubbles: true,
  composed: true
}));
```

**Invariants**:
- The emitted `config` is the **full** `CardConfig` — every key present before the session plus the edited values (FR-908-P, SC-908-1). No key is dropped.
- The emitted config uses canonical keys: `comparison_preset` (not `comparison_mode`) and `show_forecast` (not `forecast`) (FR-908-I/V).
- Emission is driven only by genuine user intent, never by the act of rendering (FR-908-N).

## Editor preset options (v1.2.0)

The `comparison_preset` select offers exactly: `year_over_year`, `month_over_year`, `month_over_month`, **`custom`**.

## Editor invariants (behavioral contract)

- Renders **six** sections (FR-908-E) from the `FieldRegistry`; S1 expanded, S2–S6 collapsed by default.
- Keeps `EditorUiState` independent of `config` (FR-908-J); expanded/focus/scroll survive re-renders (FR-908-K/L/M).
- Emits the full `CardConfig` on change; never drops unmodeled keys (FR-908-P).
- Performs **no** blocking semantic validation (FR-908-S); invalid values pass through to the card's error state.
- Opens without a JS error when `hass` is absent, a select value is unknown, or the config is the minimal stub (FR-908-T).
- Visual/YAML toggle: shown when `window.jsyaml` is present (hidden when absent). In YAML mode, the textarea is a **first-class input path** (FR-908-Y): edits emit live (debounced) and the last valid YAML **values** are the saved config (HA re-serializes the config object, so values persist but text formatting is canonicalized). The YAML parser runs in **safe mode** (no code execution from hostile tags). `setConfig()` preserves the editor mode (does not reset to Visual).
- All labels/options localized via the card's `localize()` under `editor.*` (FR-908-U); label language per FR-908-X.
