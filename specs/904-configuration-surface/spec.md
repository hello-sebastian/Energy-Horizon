# 904-configuration-surface
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Configuration Surface  
**Replaces**: `005-gui-editor`  
**Primary code**: `src/card/energy-horizon-card-editor.ts`  
**Last updated**: 2026-04-21  

---

<!-- NORMATIVE -->

## Current Behavior (normative)

The card exposes a Lovelace visual configuration editor via `getConfigElement()`, returning an `energy-horizon-card-editor` custom element. The editor renders using HA's `<ha-form>` component driven by a static schema. It also provides a Visual/YAML toggle for advanced users.

### Editor fields (Visual mode)

| Field | Type | YAML key |
|---|---|---|
| Entity | `entity` selector (sensor domain) | `entity` |
| Title | Free text | `title` |
| Comparison preset | Dropdown | `comparison_preset` |
| Force prefix | Dropdown | `force_prefix` |
| Interpretation | Two-option control (Consumption / Production) | `interpretation` |

Deprecated `comparison_mode` is still accepted by the card for backward compatibility but the editor always uses `comparison_preset`.

### Localization of labels

Labels are provided via a `computeLabel` arrow function passed as a property on `<ha-form>`, mapping `schema.name` → `localize("editor.<name>")`. Translation keys exist in `src/translations/en.json`, `pl.json`, and `de.json` under the `editor.*` namespace. HA's internal `hass.localize` pipeline is not used for editor labels.

### YAML text mode

A toggle switches between Visual form and a raw YAML text area showing the full current config. On switching Visual → YAML: text area is pre-populated with the full current config as valid YAML. On switching YAML → Visual: the editor parses the YAML, updates form-controlled fields, preserves all other keys unchanged; invalid YAML blocks the switch with an inline error. YAML mode uses `window.jsyaml` (HA frontend global, zero bundle cost). If `window.jsyaml` is absent, the YAML toggle is hidden and the editor operates in Visual-only mode.

### Config preservation

The editor stores the full `CardConfig` internally as `_config`. On every `<ha-form>` value-changed event, changed fields are shallow-merged into `_config` and the full merged object is emitted via `config-changed`. YAML-only fields (colors, opacities, aggregation, etc.) are never dropped when the user saves through the visual form.

### Module loading

The editor is registered as a custom element via a static `import` at the top of the main card module (`energy-horizon-card.ts`). This ensures the element is registered synchronously when the card bundle loads — before HA can call `getConfigElement()`.

### `getStubConfig()`

Returns a minimal valid default config (at minimum `entity: ""`) allowing the card to render without errors when added from the card picker.

---

## Public Contract

```typescript
// Static methods on the main card class
static getConfigElement(): HTMLElement;  // returns energy-horizon-card-editor
static getStubConfig(): Partial<CardConfig>;  // minimal valid config

// Editor custom element
customElements.define('energy-horizon-card-editor', EnergyHorizonCardEditor);

// Editor emits on every field change:
dispatchEvent(new CustomEvent('config-changed', { detail: { config: CardConfig } }));
```

Editor schema fields:
```typescript
const SCHEMA = [
  { name: 'entity',             selector: { entity: { domain: 'sensor' } } },
  { name: 'title',              selector: { text: {} } },
  { name: 'comparison_preset',  selector: { select: { options: ['year_over_year', 'month_over_year', 'month_over_month'] } } },
  { name: 'force_prefix',       selector: { select: { options: ['auto', 'none', 'G', 'M', 'k', '', 'm', 'µ'] } } },
  { name: 'interpretation',     selector: { select: { options: ['consumption', 'production'] } } },
];
```

Editor presentation: the `interpretation` field MUST be shown as **two radio-style mutually exclusive options** (labels localized), default **Consumption**, matching shallow-merge semantics in “Config preservation”.

---

## Cross-domain Contracts

**Publishes to**:
- `900-time-model-windows`: `comparison_preset` + `time_window` YAML block.
- `902-chart-rendering-interaction`: `primary_color`, `fill_*`, `show_forecast`, `x_axis_format`, `tooltip_format`, `aggregation`.
- `903-card-ui-composition`: `title`, `show_title`, `icon`, `show_icon`, `show_forecast`, `language`, `interpretation` (`consumption` \| `production`; omit → consumption per `903-card-ui-composition`), `neutral_interpretation` (optional; YAML-only in v1 per `903-card-ui-composition`).
- `906-units-numeric-scaling`: `force_prefix`.
- All domains: the full `CardConfig` object on every `config-changed` event.

**Consumes from**:
- `905-localization-formatting`: `localize()` function for editor label translation.

---

## Non-Goals

- Visual editor fields for advanced YAML-only options (colors, opacities, aggregation, debug flags, `time_window` block parameters).
- YAML validation beyond parse-error detection (no semantic validation of field values in YAML text mode).
- A separate Vite entry point or lazy-loaded editor module.
- German translations beyond what already exists in `de.json`.
- Per-field inline validation for `entity` clearing (no suppress, no revert; HA standard behavior).

---

<!-- EXECUTION -->

## User Stories

### US-904-1 — Open card editor and see pre-filled fields (P1)

As a HA user who has added the Energy Horizon card, I need to click "Edit" and see a side panel with labeled fields for entity, title, comparison preset, force prefix, and interpretation (consumption vs production) — pre-filled with the current values — so I can understand and change the configuration without editing YAML.

**Independent test**: Add card to dashboard, click "Edit" → panel opens with labeled fields; all current config values are pre-populated in their respective fields; optional fields show empty when not configured.

**Acceptance Scenarios**:

1. **Given** the Energy Horizon card is on the dashboard, **When** the user clicks "Edit", **Then** a side panel opens showing labeled fields for entity, title, comparison preset, force prefix, and interpretation.
2. **Given** the editor panel is open and the card has a current config, **When** the form renders, **Then** each field shows its current configured value.
3. **Given** the editor panel is open and optional fields (title, force_prefix) are not configured, **When** the form renders, **Then** those fields appear empty (no placeholder errors).
4. **Given** `interpretation` is omitted in YAML, **When** the form renders, **Then** interpretation shows **Consumption** as the effective selection (aligned with `903-card-ui-composition` default).

---

### US-904-2 — Edit fields with live preview (P1)

As a user configuring the card, I need every change I make in the editor form to immediately update the card's visual output without any save or reload step, so I can see the effect of each change as I make it.

**Independent test**: Change entity, title, comparison preset, force prefix, and interpretation in the editor — card updates within 500 ms for each change.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the user selects a different `sensor` entity, **Then** the card's chart and summary update immediately with the new entity's data.
2. **Given** the editor is open, **When** the user types a new title, **Then** the card title updates in real time as the user types.
3. **Given** the editor is open, **When** the user changes `comparison_preset`, **Then** the card re-renders with the appropriate comparison period.
4. **Given** the editor is open, **When** the user changes `force_prefix`, **Then** the Y-axis unit notation updates immediately.
5. **Given** the editor is open, **When** the user switches `interpretation` between Consumption and Production, **Then** the narrative interpretation semantics and chart delta styling update immediately per `903-card-ui-composition`.

---

### US-904-3 — Visual/YAML toggle preserves all config fields (P1)

As an advanced user with custom YAML options (e.g. custom colors) not exposed in the visual form, I need to be able to open the editor, change a form field, then switch to YAML text mode for additional edits, and save — without losing any of my YAML-only settings.

**Independent test**: Set a non-editor field (e.g. `primary_color`) in YAML, open editor, change `title` via form, close and save → `primary_color` is unchanged in saved YAML.

**Acceptance Scenarios**:

1. **Given** a card config with YAML-only fields (e.g. `primary_color`), **When** the user changes a form field and saves, **Then** the saved config contains the updated field AND all original YAML-only fields unchanged.
2. **Given** the editor is in Visual mode, **When** the user clicks the YAML toggle, **Then** the text area shows the full current config as valid YAML.
3. **Given** the editor is in YAML text mode with valid YAML, **When** the user clicks back to Visual mode, **Then** form fields update to reflect the parsed values and no config data is lost.
4. **Given** the editor is in YAML text mode with invalid YAML, **When** the user clicks back to Visual mode, **Then** the switch is blocked, an inline error "Invalid YAML" is shown, and the user stays in YAML text mode.
5. **Given** the user edits YAML in text mode and switches back to Visual mode, **When** they save, **Then** the complete parsed config (form fields + YAML-only fields from the text area) is written to the card.

---

### US-904-4 — Localized field labels (P2)

As a user with a Polish-language HA instance, I need all editor field labels and dropdown options to be displayed in Polish, consistent with the rest of the card's i18n approach.

**Independent test**: Set HA frontend language to Polish, open editor → all labels are in Polish from the card's translation dictionaries.

**Acceptance Scenarios**:

1. **Given** HA frontend language is Polish, **When** the editor opens, **Then** all field labels (entity, title, comparison preset, force prefix, interpretation) are displayed in Polish.
2. **Given** HA frontend language is English, **When** the editor opens, **Then** all labels are in English.

---

### US-904-5 — Graceful degradation without `hass` and with unknown values (P2)

As a user opening the editor in edge conditions (missing `hass` object during initialization, or a typo in `force_prefix` from YAML), I need the editor to render in a degraded state without crashing or blocking the save flow.

**Independent test**: Open editor without `hass` → form renders without crash; open with unknown `force_prefix` value → field shows empty selection without error.

**Acceptance Scenarios**:

1. **Given** HA does not provide a `hass` object during editor initialization, **When** the editor renders, **Then** the form displays in a degraded state without a JavaScript error.
2. **Given** the YAML config contains an unknown `force_prefix` value (e.g. a typo), **When** the editor opens, **Then** the field shows an empty/default selection; no error is thrown; saving is not blocked.
3. **Given** the YAML config contains an unknown or legacy-only `comparison_preset` value, **When** the editor opens, **Then** the field shows an empty selection; deprecated `comparison_mode` is normalized to `comparison_preset` where possible.

---

## Edge Cases

1. **Entity field cleared**: editor emits `config-changed` immediately with `entity: ""` (HA standard behavior); no inline validation error or revert; the card is responsible for handling the empty-entity state.
2. **Unknown `force_prefix` value in YAML**: field shows empty/default selection; no error; save is not blocked.
3. **Unknown or legacy `comparison_preset`**: field degrades gracefully to empty selection; deprecated `comparison_mode` is pre-filled via card normalization when possible.
4. **`hass` object absent during initialization**: editor renders in degraded state; no crash.
5. **`window.jsyaml` absent**: YAML toggle button is hidden; editor operates in Visual-only mode without error.
6. **YAML text mode with keys conflicting with form-controlled fields**: YAML text mode is authoritative on switch back to Visual — form fields reflect YAML-parsed values (YAML wins).
7. **User removes a field in YAML text mode**: removal is intentional; the updated parsed config (without that field) is treated as the new `_config` and emitted normally.
8. **Editor opened on a fresh card with no existing config**: `getStubConfig()` provides `{ entity: "" }` as the minimal valid starting config; editor renders without errors.
9. **Config with many YAML-only fields**: shallow merge in `_config` preserves all unmapped keys on every `config-changed` event; none are silently dropped.

---

## Functional Requirements

- **FR-904-A (getConfigElement)**: The main card class MUST expose a static `getConfigElement()` method returning a custom element registered as `energy-horizon-card-editor`, compliant with the HA Lovelace card editor API.

- **FR-904-B (ha-form schema)**: The editor MUST render using `<ha-form>` driven by a static schema including: `entity` (entity selector, sensor domain), `title` (text), `comparison_preset` (select: `year_over_year`, `month_over_year`, `month_over_month`), `force_prefix` (select: `auto`, `none`, `G`, `M`, `k`, `""`, `m`, `µ`), `interpretation` (select: `consumption`, `production`; presented as two radio-style options, default `consumption`).

- **FR-904-C (config-changed event)**: The editor MUST emit a `config-changed` CustomEvent with `detail.config` equal to the full merged `CardConfig` object on every field change.

- **FR-904-D (pre-fill from config)**: The editor MUST read initial values from the card's current `config` object and pre-populate all form fields accordingly.

- **FR-904-E (localization via computeLabel)**: Field labels MUST be sourced from translation dictionaries (`en.json`, `pl.json`, `de.json`) under the `editor.*` namespace using the card's `localize` module. Labels MUST be wired to `<ha-form>` via a `computeLabel` property mapping `schema.name` → `localize("editor.<name>")`. HA's internal `hass.localize` pipeline MUST NOT be used for editor labels.

- **FR-904-F (module registration)**: The editor component MUST be registered as a custom element via a static `import` at the top of the main card module (`energy-horizon-card.ts`). No lazy loading or dynamic import.

- **FR-904-G (getStubConfig)**: The main card class MUST expose `getStubConfig()` returning a minimal valid default config (at minimum `{ entity: "" }`) enabling the card to render without errors when added from the card picker.

- **FR-904-H (Visual/YAML toggle)**: The editor MUST provide a toggle between Visual mode (`<ha-form>`) and YAML text mode (raw text area). Both modes MUST be accessible within the same panel without closing the editor.

- **FR-904-I (Visual → YAML)**: Switching to YAML text mode MUST pre-populate the text area with the full current config as valid YAML, including fields not controlled by the form.

- **FR-904-J (YAML → Visual)**: Switching back to Visual mode MUST parse the YAML, update form-controlled fields to reflect parsed values, and preserve all other keys. Invalid YAML MUST block the switch and show an inline error; the editor stays in YAML text mode.

- **FR-904-K (YAML serialization)**: YAML serialization/deserialization MUST use `window.jsyaml` (HA frontend global). No `js-yaml` npm dependency is added. If `window.jsyaml` is absent at runtime, the YAML toggle button MUST be hidden and the editor operates in Visual-only mode.

- **FR-904-L (config preservation — _config)**: The editor MUST store the full `CardConfig` internally as `_config`. On every `<ha-form>` value-changed event, changed fields MUST be shallow-merged into `_config` and the full merged object emitted via `config-changed`. YAML-only fields (colors, opacities, aggregation, etc.) MUST never be silently dropped.

- **FR-904-M (degraded-state rendering)**: When HA does not provide a `hass` object during initialization, the editor MUST render without a JavaScript error.

- **FR-904-N (unknown field values)**: When the existing YAML config contains an unknown or out-of-range `force_prefix` or `comparison_preset` value, the editor MUST show an empty/default selection without throwing an error or blocking the save flow.

---

## Key Entities

- **`CardConfig`**: Full YAML configuration object. The editor reads from and emits back the full `CardConfig` on every change.
- **`EditorSchema`**: Static array of `ha-form`-compatible field descriptors defining name, type, and selector for each exposed field.
- **`computeLabel`**: Arrow function passed as a property on `<ha-form>`, mapping `schema.name` → `localize("editor.<name>")`.
- **`EditorMode`**: Internal toggle state (`"visual" | "yaml"`). Resets to `"visual"` each time the editor is opened.
- **`_config`**: Private internal property holding the full `CardConfig`. Updated by shallow-merge on each `<ha-form>` value change and on YAML text parse.
- **`window.jsyaml`**: HA frontend global used for YAML serialization/deserialization in YAML text mode.
- **Translation keys** (`editor.*`): New i18n keys added to `en.json`, `pl.json`, `de.json` in `src/translations/`.

---

## Success Criteria

- **SC-904-1**: A user who has never edited YAML can fully configure all editor fields (entity, title, comparison preset, force prefix, interpretation) within 60 seconds of opening the editor for the first time.
- **SC-904-2**: Every change made in the editor is reflected in the card's visual output within 500 ms (live preview).
- **SC-904-3**: Zero YAML-only config fields are lost when the user opens the editor, changes any form field, and saves — verified by diff of the saved YAML before and after the edit session.
- **SC-904-4**: A user can switch from Visual mode to YAML text mode and back at least once without data loss or JavaScript error.
- **SC-904-5**: All editor fields (including interpretation) have localized labels in English and Polish; German labels are present in `de.json`.

---

## Assumptions

- Valid `comparison_preset` values: `"year_over_year"`, `"month_over_year"`, `"month_over_month"`. Deprecated `comparison_mode` is accepted by the card runtime for backward compatibility but the editor schema uses `comparison_preset`.
- `ha-form`, `ha-icon`, and `ha-state-icon` custom elements are available in the HA frontend environment at runtime (HA 2024+).
- The `force_prefix` empty string (`""`) represents "no SI prefix" (base unit); the editor dropdown shows a labeled option (e.g. "None / base unit") rather than a blank item.
- `getStubConfig()` returns `{ entity: "" }` as the minimum valid starting config; no specific entity ID can be assumed across HA instances.
- Documentation changes (README, changelog) describing the visual editor are covered by domain `907-docs-product-knowledge`.
