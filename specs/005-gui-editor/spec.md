# Feature Specification: Visual Configuration Editor (GUI Editor)

**Feature Branch**: `005-gui-editor`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: Implementacja wizualnego edytora konfiguracji (GUI Editor) dla karty HA Energy Horizon

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Open Card Editor and See Fields (Priority: P1)

A Home Assistant user who has added the Energy Horizon card to their dashboard wants to configure it without editing YAML directly. They click the three-dot menu on the card and select "Edit". A side panel opens with a form containing labeled input fields for the card's key parameters.

**Why this priority**: This is the entry point for all configuration editing. Without the editor panel opening correctly, no other editing story is possible. Delivers immediate value: user can access visual configuration on first install.

**Independent Test**: Can be fully tested by adding the card to a dashboard, clicking "Edit" in the card's context menu, and verifying that a form panel opens with visible, labeled fields — without touching YAML.

**Acceptance Scenarios**:

1. **Given** the Energy Horizon card is on the dashboard, **When** the user clicks "Edit" in the card menu, **Then** a side panel opens with labeled fields for: entity selector, title, comparison mode, and force prefix.
2. **Given** the editor panel is open, **When** the current config has values, **Then** each field shows the current value pre-filled (reads from existing YAML config).
3. **Given** the editor panel is open, **When** the current config has no title or force_prefix set, **Then** the optional fields appear empty (not showing placeholder errors).

---

### User Story 2 — Edit Entity with Live Preview (Priority: P1)

A user wants to switch the card to a different energy sensor. They open the editor, use the entity selector to pick a new sensor (filtered to `sensor` domain), and immediately see the card update on the dashboard without saving or reloading.

**Why this priority**: Live preview is the core UX value proposition of a GUI editor. A user who changes the entity and sees no update will think the editor is broken.

**Independent Test**: Can be tested by changing the entity in the editor and confirming the card re-renders with data from the new entity within the same dashboard view.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the user selects a different `sensor` entity, **Then** the card's chart and summary update immediately to reflect the new entity's data.
2. **Given** the editor is open, **When** the user types a new title value, **Then** the card title updates in real time as the user types.
3. **Given** the editor is open, **When** the user changes `comparison_preset`, **Then** the card immediately re-renders with the appropriate comparison period data.
4. **Given** the editor is open, **When** the user changes `force_prefix`, **Then** the chart's Y-axis unit notation updates immediately.

---

### User Story 3 — Validate and Save Configuration (Priority: P2)

A user completes editing, closes the editor panel, and confirms that the configuration is correctly persisted. On next load of the dashboard, the card renders with the values that were set in the editor.

**Why this priority**: Persistence is essential for the feature to be useful beyond a single session. However, saving is handled by HA's Lovelace infrastructure automatically — so the editor only needs to emit the correct event.

**Independent Test**: Can be tested by editing a field in the editor, closing the editor (saving via HA UI), reloading the dashboard, and verifying the card shows the configured values.

**Acceptance Scenarios**:

1. **Given** the user changed any field in the editor, **When** they close the editor panel via HA's "Save" button, **Then** the YAML configuration is updated with the new values.
2. **Given** the config was saved with a specific entity and title, **When** the page is reloaded, **Then** the card displays with the saved entity and title.

---

### User Story 4 — Localized Field Labels (Priority: P3)

A user with a Polish-language HA instance opens the editor. All field labels and dropdown options are displayed in Polish.

**Why this priority**: The card already supports PL/EN/DE localization. The editor must be consistent with the card's existing i18n approach. Lower priority because English labels are functional; Polish labels are a quality improvement.

**Independent Test**: Can be tested by setting HA UI language to Polish, opening the editor, and verifying all visible labels are in Polish.

**Acceptance Scenarios**:

1. **Given** the HA frontend language is Polish, **When** the editor panel is opened, **Then** all field labels (entity, title, comparison mode, force prefix) are displayed in Polish.
2. **Given** the HA frontend language is English, **When** the editor panel is opened, **Then** all field labels are displayed in English.

---

### User Story 5 — Switch Between Visual and YAML Text Mode Without Data Loss (Priority: P1)

An advanced user has configured the card via YAML with custom options not available in the visual form (e.g. custom colors). They open the editor, make a change via the visual form, then switch to the YAML text area to add another advanced option. On switching back to the visual form and saving, all settings — both form-controlled and custom YAML — are preserved.

**Why this priority**: Data loss of advanced YAML-only settings would be a regression. This is the minimum viable safety guarantee for any hybrid editor pattern.

**Independent Test**: Set a non-editor field (e.g. a color value) in YAML, open editor, change `title` via the form, close and save — verify the color field is still present in the saved YAML.

**Acceptance Scenarios**:

1. **Given** the editor is in Visual mode with a full `_config` containing YAML-only fields, **When** the user changes a form field and saves, **Then** the saved config contains both the updated form field and all original YAML-only fields unchanged.
2. **Given** the editor is in Visual mode, **When** the user clicks the "YAML" toggle, **Then** the text area shows the complete current config as valid YAML.
3. **Given** the editor is in YAML text mode with valid YAML, **When** the user clicks back to "Visual" mode, **Then** the form fields update to reflect the parsed values and no config data is lost.
4. **Given** the editor is in YAML text mode with **invalid** YAML, **When** the user clicks back to "Visual" mode, **Then** the switch is blocked, an inline error is shown ("Invalid YAML"), and the user stays in YAML text mode.
5. **Given** the editor has been switched to YAML text mode and the user edits raw YAML, **When** they switch back to Visual mode and then save, **Then** the complete parsed config (including form and YAML-only fields) is written to the card.

---

### Edge Cases

- What happens when the user clears the `entity` field (selects no entity)? → The editor emits `config-changed` immediately with `entity: ""` (HA standard behavior — no suppression, no revert). The card is responsible for handling the empty-entity state by showing its existing "no data" / "loading" UI. The editor must not crash or block the event.
- What happens when the user opens the editor on a card config that was hand-written in YAML with an unknown `force_prefix` value (e.g. a typo)? → The field should show an empty/default selection without throwing an error.
- What happens when the `comparison_preset` value in YAML is unknown or legacy-only? → The field should degrade gracefully (show empty selection); the editor must not prevent saving. Deprecated `comparison_mode` alone should still pre-fill the select via card normalization when possible.
- What happens when HA does not provide a `hass` object to the editor (e.g. during card initialization)? → The editor must render the form in a degraded state without crashing.
- What happens when the user edits YAML text that removes a field that was previously set via the visual form? → The removal is intentional; the updated parsed config (without that field) is treated as the new `_config` and emitted.
- What happens when the YAML text area contains YAML keys that conflict with form-controlled fields (e.g. user types a different `entity` in YAML text mode)? → The YAML text mode is authoritative; on switch back to Visual mode, the form fields reflect the YAML-parsed values (YAML wins).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The card MUST expose a static `getConfigElement()` method that returns a custom element registered as an editor component, compliant with the Home Assistant Lovelace card editor API.
- **FR-002**: The editor MUST render using the `<ha-form>` component from Home Assistant, driven by a static JSON schema definition.
- **FR-003**: The editor schema MUST include the following fields:
  - `entity` — entity selector, filtered to `sensor` domain only.
  - `title` — free-text input field (optional).
  - `comparison_preset` — dropdown with valid options: `year_over_year`, `month_over_year`, `month_over_month`.
  - `force_prefix` — dropdown with valid options: `auto`, `none`, `G`, `M`, `k`, `` (empty = no prefix), `m`, `µ`.
- **FR-004**: The editor MUST emit a `config-changed` CustomEvent with the updated config object as `detail.config` whenever any field value changes.
- **FR-005**: The editor MUST read the initial values from the card's current `config` object and pre-populate all fields accordingly.
- **FR-006**: Field labels displayed in the editor MUST be sourced from the existing translation dictionaries (EN, PL, DE) using the card's `localize` module pattern. New translation keys MUST be added to all three language files. Localization MUST be wired to `<ha-form>` via a `computeLabel` arrow function passed as a property on the element — mapping `schema.name` to `localize("editor.<name>")` — rather than embedding translated strings in the schema array or relying on HA's internal `hass.localize` pipeline.
- **FR-007**: The editor component MUST be registered as a custom element with a name following the pattern `<card-element-name>-editor` (e.g. `energy-horizon-card-editor`). The editor module MUST be imported via a static `import` at the top of the main card module (`energy-horizon-card.ts`), ensuring the custom element is registered synchronously when the card bundle loads — before HA can call `getConfigElement()`.
- **FR-008**: The main card class MUST be updated so that `getConfigElement()` and `getStubConfig()` static methods are present and functional.
- **FR-009**: The `getStubConfig()` static method MUST return a minimal valid default config that enables the card to render without errors when added fresh from the card picker.
- **FR-010**: The `README.md` MUST be updated to inform users that visual configuration is available via the card editor UI, listing the fields that can be configured.
- **FR-011**: The editor MUST provide a toggle to switch between **Visual mode** (the `<ha-form>` form) and **YAML text mode** (a raw text area showing the full current YAML config). Both modes MUST be accessible from within the same editor panel without closing it.
- **FR-012**: When switching from Visual mode to YAML text mode, the text area MUST be pre-populated with the full current config as valid YAML (including fields not controlled by the form).
- **FR-013**: When switching from YAML text mode back to Visual mode, the editor MUST parse the YAML, update the form fields it controls, and preserve all other keys unchanged. If the YAML is invalid (parse error), the switch MUST be blocked and an inline error message shown; the user remains in YAML text mode until the YAML is corrected.
- **FR-014**: The editor component MUST store the full `CardConfig` object internally (private `_config` property). On every `<ha-form>` value-changed event, the changed fields MUST be shallow-merged into `_config` and the full merged object emitted via `config-changed`. This ensures YAML-only fields (colors, opacities, aggregation, debug, etc.) are never silently dropped when the user saves through the visual form.
- **FR-015**: When the card is opened with a pre-existing YAML config that contains fields not exposed in the visual form, the editor MUST pass those fields through unchanged in every `config-changed` event — regardless of whether the user edits through the visual form or the YAML text area.

### Key Entities

- **CardConfig**: The configuration object (`src/card/types.ts`). The editor reads from and writes back a partial or full `CardConfig`. Fields not present in the editor schema must be preserved unchanged when the editor emits `config-changed`.
- **EditorSchema**: A static array of field descriptor objects (compatible with `ha-form` schema format) defined in the editor component. Each object describes a field: name, type, selector, and label key.
- **Translation Keys**: New i18n keys in the `editor.*` namespace added to `en.json`, `pl.json`, and `de.json` under `src/translations/`.
- **EditorMode**: An internal toggle state (`"visual" | "yaml"`) controlling which panel is shown. Not persisted; resets to `"visual"` each time the editor is opened.
- **YAML Serialization**: The YAML text mode uses `window.jsyaml` (HA frontend global — zero bundle cost) for both `dump` (config → YAML string) and `load` (YAML string → config). No `js-yaml` npm dependency is added. If `window.jsyaml` is not present at runtime, the YAML mode toggle button MUST be hidden entirely and the editor operates in Visual-only mode.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user who has never edited YAML can fully configure the four editor fields (entity, title, comparison mode, force prefix) within 60 seconds of opening the editor panel for the first time.
- **SC-002**: Every change made in the editor panel is reflected in the card's visual output within 500 ms (live preview).
- **SC-003**: 100% of fields configured via the GUI editor are correctly written to and read back from the card's YAML configuration (no data loss, no extra fields added, no existing non-editor fields removed).
- **SC-004**: The editor panel opens and displays all fields without a JavaScript error in 100% of cases where the card has a valid existing config.
- **SC-005**: All four editor fields have localized labels in English and Polish (the two primary supported languages).
- **SC-006**: Zero YAML-only config fields are lost when the user opens the editor, changes any form field, and saves — verified by diff of the saved YAML before and after the edit session (only the changed field differs).
- **SC-007**: A user can switch from Visual mode to YAML text mode and back at least once per session without data loss or JavaScript error.

---

## Assumptions

- The valid `comparison_preset` values per the current codebase are `"year_over_year"`, `"month_over_year"`, and `"month_over_month"`. YAML key is `comparison_preset` (canonical); deprecated `comparison_mode` is still accepted by the card for backward compatibility. The editor schema uses the values that exist in `ComparisonMode` in `types.ts`.
- The `ha-form` component and its selector types (`entity`, `text`, `select`) are assumed to be available in the HA frontend environment at runtime, consistent with HA's documented card editor API (as of HA 2024+).
- The `force_prefix` empty string value (`""`) represents "no SI prefix" (base unit). In the editor dropdown it will be shown as a labeled option (e.g. "None / base unit") rather than a blank item.
- The editor will only expose the four fields listed in FR-003. Advanced config options (colors, opacities, aggregation, debug, etc.) remain YAML-only for this feature.
- The `getStubConfig()` method will provide a hardcoded default entity ID of `""` (empty string) as a placeholder, since no specific default entity can be assumed across all HA instances.
- German (`de`) translations for editor labels will be provided alongside EN and PL, as `de.json` already exists in the project.

---

## Clarifications

### Session 2026-03-22

- Q: How should `<ha-form>` field labels be localized in the editor? → A: Via a `computeLabel` arrow function passed as a property on `<ha-form>`, mapping `schema.name` → `localize("editor.<name>")`. Translated strings are NOT embedded in the schema array and HA's `hass.localize` pipeline is NOT used.
- Q: How should the editor handle config fields not covered by the visual form (YAML-only fields)? → A: The editor stores the full `CardConfig` as private `_config`, shallow-merges form changes into it, and emits the full merged config. Additionally, a Visual/YAML text toggle mode is required: switching to YAML shows the full current config; switching back to Visual parses the YAML (YAML wins on conflict); invalid YAML blocks the switch with an inline error. YAML-only fields are NEVER dropped.
- Q: How should YAML serialization/deserialization be provided for the YAML text mode? → A: Use `window.jsyaml` (HA frontend global). No npm dependency added. If `window.jsyaml` is absent at runtime, the YAML mode toggle is hidden and the editor works in Visual-only mode.
- Q: How should the editor component module be loaded and registered? → A: Static `import "./energy-horizon-card-editor.js"` at the top of the main card module. Editor custom element is registered synchronously on bundle load. No lazy loading, no dynamic import, no separate Vite entry point.
- Q: Should the editor suppress `config-changed` when the entity field is cleared to empty? → A: No — emit immediately with `entity: ""` (HA standard behavior). No inline validation error, no revert. The card handles empty-entity rendering on its own.
