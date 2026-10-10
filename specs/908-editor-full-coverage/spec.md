# Feature Specification: Full-Coverage Visual Editor (v1.2.0)

**Feature Branch**: `1.2.0`

**Created**: 2026-10-06

**Status**: Approved

**Leading Domain**: `904-configuration-surface` (this feature extends the configuration surface; it is the v1.2.0 evolution of the `energy-horizon-card-editor`)

**Input**: User description: "Rozpoczynamy wersję 1.2.0, która rozszerza dotychczasową funkcjonalność wizualnego konfiguratora karty. Przygotuj szczegółową specyfikację techniczną i funkcjonalną dla wizualnego edytora konfiguracji karty Home Assistant (`energy-horizon-card-editor`), zapewniającego 100% pokrycia parametrów dostępnych w konfiguracji YAML karty `custom:energy-horizon-card` (wersja 1.1.0)."

---

## Overview

The v1.1.0 visual editor exposes a small subset of the card's YAML surface (entity, title, `comparison_preset`, `interpretation`, `force_prefix`, and three `show_*` toggles). Everything else — time windows, aggregation, colors, opacities, formatting, Luxon patterns, forecast, debug — is **YAML-only**.

This feature (v1.2.0) expands the editor to **100% coverage** of the card's YAML configuration, organized into **six progressive-disclosure sections**, driven by a **schema-driven field registry** that decouples field metadata from rendering. It also solves the central **lifecycle problem**: because every field change emits `config-changed`, Home Assistant re-invokes `setConfig()` and re-renders the whole editor — which today would collapse expanded panels and steal focus mid-typing. The spec defines the state-persistence, focus, and merge rules that make a large form feel stable.

The editor remains a **faithful visual representation of the YAML**: it is the user interface *for* the YAML, never a second source of truth. Fields the editor does not model are preserved verbatim (preservative deep merge).

The YAML mode is a **first-class, independent input path** (FR-908-Y): editing YAML updates the card preview live and the last valid YAML **values** are the config that gets saved — no switch to Visual mode is required. (Home Assistant re-serializes the config object on save, so the *values* you typed are persisted, but the exact text formatting — comments, key order, indentation — is canonicalized by HA, not preserved verbatim.)

---

## Clarifications

### Session 2026-10-06

- Q: Does the new `custom` comparison preset require code changes in domain 900's `resolve-windows.ts` / `presets.ts` / `merge-config.ts`, or does the card already resolve windows generically from `time_window` when no standard preset matches? → A: **Option A** — The card's existing generic resolution path in `resolve-windows.ts` already handles `time_window`-driven windows. The `custom` preset is a type-level addition only (`ComparisonMode` gains `"custom"`); no new resolution logic is needed. Presets fill in `time_window` values on behalf of the user; `custom` lets the user set them manually. The mechanism is unchanged — v1.2.0 adds the visual GUI overlay.
- Q: How should the editor handle the `forecast` alias (a YAML key that means the same as `show_forecast`)? → A: **Option A** — On load, the editor resolves `show_forecast` as `config.show_forecast ?? config.forecast ?? true` (alias fallback for display). On save, the emitted config uses `show_forecast` as the canonical key and **drops** the `forecast` alias. The `forecast` alias is a temporary legacy key scheduled for future removal; the editor normalizes it away on save (same pattern as `comparison_mode` → `comparison_preset`).
- Q: Should the `entity` picker remain restricted to the `sensor` domain, or be broadened to other domains? → A: **Option A** — Keep the `sensor` domain restriction (unchanged from v1.1.0). The card's data pipeline is built around sensor entities; the picker restriction is a UX guard, not a coverage gap. YAML remains the escape hatch for unusual entity types.
- Q: For the `time_window` sub-block in `custom` mode, should v1.2.0 ship with five declarative fields or with a custom renderer? → A: **Option A** — Five declarative fields in v1.2.0: `anchor` → select (6 options), `offset`/`duration`/`step` → text (ISO 8601 free text), `count` → number. The custom-renderer *hook* is required by FR-908-C (the architecture must support it), but the rich control itself is deferred (Non-Goal).
- Q: Which language should the editor's labels use — the HA instance language or the card's `language` config field? → A: **Card `language` field takes precedence.** Resolution chain: (1) if `language` is set in the card YAML config → use it (forces that language for both card and editor labels); (2) if `language` is not set → inherit the HA profile language (`hass.locale.language`); (3) if the resolved language is not covered by the card's shipped dictionaries → use the card's existing fallback (unchanged from v1.1.0). Changing the `language` field in the editor re-labels the entire form live.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Configure the whole card without touching YAML (Priority: P1)

As a user who has never edited YAML, I need the visual editor to expose **every** configurable parameter of the card — identity, time windows, aggregation, module visibility, chart styling, units/formatting, and debug — so I can fully configure the card through the GUI and see the effect live.

**Why this priority**: This is the core value of v1.2.0. Without full coverage the editor is a partial tool and advanced users must still hand-edit YAML.

**Independent Test**: Open the editor on a card whose YAML contains values for *all* parameters (including `primary_color`, `fill_*_opacity`, `x_axis_format`, `time_window.*`, `debug`). Every value is pre-filled in the matching control; changing any control updates the live preview; saving writes back the full config with no field lost.

**Acceptance Scenarios**:

1. **Given** a card whose YAML sets `primary_color`, `fill_current_opacity`, `x_axis_format`, `tooltip_format`, `aggregation`, `precision`, `number_format`, `language`, `force_prefix`, `connect_nulls`, `show_legend`, `debug`, **When** the user opens the editor, **Then** each of those values is pre-filled in its corresponding control in the correct section.
2. **Given** the editor is open, **When** the user changes any single control, **Then** the card preview updates within 500 ms and the saved config reflects the change.
3. **Given** a card with a minimal config (`entity` + `comparison_preset` only), **When** the editor renders, **Then** every optional control shows its documented default (or empty, where the default is "adaptive/inherit") and no control shows a spurious error.
4. **Given** the editor is open, **When** the user saves, **Then** the emitted `config` object contains every YAML key that was present before the session, plus the edited values — verified by a before/after diff.

---

### User Story 2 — Edit without losing UI state across re-renders (Priority: P1)

As a user configuring the card, I need the editor to **keep my place**: expanded sections stay expanded, the field I am typing in keeps focus and cursor position, and the form does not visibly reset — even though every change triggers a full editor re-render from Home Assistant.

**Why this priority**: This is the key UX/lifecycle risk called out in the brief. If re-renders collapse panels or steal focus, a 30-field form is unusable. It is a hard requirement for the feature to feel reliable.

**Independent Test**: Expand two sections, type into a text field, toggle a switch, then observe: the two sections remain expanded, the text field retains focus and cursor, and no visible "flash"/reset occurs.

**Acceptance Scenarios**:

1. **Given** the user has expanded the "Time & Aggregation" and "Visuals" panels, **When** they change any field (which triggers `setConfig` + re-render), **Then** both panels remain expanded exactly as before.
2. **Given** the user is typing in the `title` text field, **When** a re-render occurs, **Then** the field retains focus and the caret stays at the typed position; the user can continue typing without re-clicking.
3. **Given** the user has scrolled the editor to a lower section, **When** a re-render occurs, **Then** the scroll position is preserved (no jump to top).
4. **Given** the editor re-renders, **When** the new render is produced, **Then** no control emits a spurious `config-changed` as a side effect of the re-render itself (no feedback loop / no config churn).

---

### User Story 3 — Switch between standard presets and a custom time window (Priority: P1)

As a user, I need to move between the standard comparison presets and a fully custom time window, with the editor cleaning up the config correctly in each direction, so the saved YAML always matches the selected mode.

**Why this priority**: The `comparison_preset` ↔ `time_window` relationship is the most stateful part of the form and the most likely source of a corrupted config if handled naively.

**Independent Test**: Start on `year_over_year` (has `period_offset`), switch to `custom` (verify `period_offset` removed and `time_window` initialized with defaults), then switch back to `month_over_month` (verify `time_window` removed and `period_offset` restored to `-1`).

**Acceptance Scenarios**:

1. **Given** `comparison_preset` is a standard preset and the config has `period_offset`, **When** the user selects `custom`, **Then** `period_offset` is removed from the config, a `time_window` object is initialized with defaults (`anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`), and the `time_window` sub-section becomes visible while `period_offset` is hidden.
2. **Given** `comparison_preset` is `custom` with a populated `time_window`, **When** the user selects a standard preset, **Then** the entire `time_window` object is removed, `period_offset` is restored to `-1`, and the `time_window` sub-section is hidden while `period_offset` is shown.
3. **Given** the user is in `custom` mode and edits `time_window.count` to `3`, **When** they save, **Then** the config contains `comparison_preset: custom` and the full `time_window` block; the card resolves windows generically per domain `900`.
4. **Given** the user switches preset, **When** the re-render occurs, **Then** the section's expanded state is preserved (the panel does not collapse as a side effect of the mode switch).

---

### User Story 4 — Progressive disclosure through sections (Priority: P2)

As a user, I need the form grouped into six clearly-labeled sections — with the essentials always visible and advanced groups collapsed by default — so I can find what I need without wading through 30 fields.

**Why this priority**: Improves discoverability and reduces cognitive load; it is the structural backbone of the form but is lower-risk than the lifecycle and state-cleanup stories.

**Independent Test**: Open the editor → Section 1 (Basic) is expanded and visible; Sections 2–6 are collapsed. Expand each and confirm the correct fields appear in the correct section.

**Acceptance Scenarios**:

1. **Given** the editor opens, **When** it renders, **Then** Section 1 (Basic Settings) is expanded and Sections 2–6 are collapsed.
2. **Given** the user expands "Formatting & Axis", **When** it renders, **Then** it shows exactly `precision`, `force_prefix`, `number_format`, `language`, `x_axis_format`, `tooltip_format`.
3. **Given** the user expands "System & Debug", **When** it renders, **Then** it shows `debug`.
4. **Given** a section is expanded, **When** the user collapses it and re-opens the editor, **Then** it reopens collapsed (default), unless the user's in-session expansion state is still alive for the current editor instance.

---

### User Story 5 — Cascading and dependent controls (Priority: P2)

As a user, I need dependent controls to reflect their parent's state — e.g. the forecast-total panel toggle is disabled when the forecast itself is off — so I cannot configure an impossible combination.

**Why this priority**: Prevents invalid/contradictory configs and communicates the dependency model; it is a correctness/UX refinement.

**Independent Test**: Turn `show_forecast` off → `show_forecast_total_panel` becomes disabled (greyed). Turn it back on → the dependent control re-enables.

**Acceptance Scenarios**:

1. **Given** `show_forecast` is `true`, **When** the user toggles it to `false`, **Then** `show_forecast_total_panel` is rendered in a disabled state.
2. **Given** `show_forecast` is `false` (dependent disabled), **When** the user toggles `show_forecast` back to `true`, **Then** `show_forecast_total_panel` becomes enabled again.
3. **Given** `show_forecast` is `false`, **When** the user saves, **Then** the card omits the Forecast | Total panel regardless of the `show_forecast_total_panel` value (consistent with domain `903` gating).

---

### User Story 6 — Safe handling of deprecated and unknown values (Priority: P3)

As a user with an existing config that uses deprecated or out-of-range values, I need the editor to open without crashing, degrade gracefully, and migrate deprecated keys on save — so upgrading to v1.2.0 never breaks my dashboard.

**Why this priority**: Backward compatibility is important but is a safety net rather than a primary user journey.

**Independent Test**: Open the editor on a config containing `comparison_mode` (deprecated) and an unknown `force_prefix` value → editor opens, `comparison_preset` is pre-filled from the legacy key, the unknown `force_prefix` shows an empty selection, and saving rewrites `comparison_mode` → `comparison_preset`.

**Acceptance Scenarios**:

1. **Given** the YAML contains `comparison_mode: month_over_month` and no `comparison_preset`, **When** the editor opens, **Then** `comparison_preset` is pre-filled with `month_over_month`.
2. **Given** the same config, **When** the user saves, **Then** the emitted config uses `comparison_preset` and the deprecated `comparison_mode` key is replaced (not duplicated).
3. **Given** the YAML contains an unknown `force_prefix` (e.g. a typo), **When** the editor opens, **Then** the field shows an empty/default selection, no error is thrown, and saving is not blocked.
4. **Given** the `hass` object is absent during initialization, **When** the editor renders, **Then** it renders in a degraded state without a JavaScript error.

---

### Edge Cases

- **Rapid typing in a text field**: each keystroke must not collapse panels, steal focus, or jump the caret; the emitted config may be debounced (see FR-908-G) but the *displayed* value always tracks the input.
- **`comparison_preset` set to `custom` with an empty/invalid `time_window`**: the editor opens and shows the sub-section with defaults; the *card* (not the editor) surfaces the invalid-window error state per domain `900` — the editor does not block the save.
- **`time_window.count` out of the 1–24 range**: the editor allows the value to be entered; the card surfaces the standard "too many windows" / invalid-window error. The editor does not clamp silently.
- **`neutral_interpretation` negative or non-numeric**: the editor passes the raw value through; the card normalizes invalid → `2` (domain `903`). The editor does not reject the keystroke.
- **`primary_color` as a CSS variable** (`var(--accent-color)`): accepted as free text; no color-picker validation that would reject `var(...)` forms.
- **`x_axis_format` / `tooltip_format` with invalid Luxon tokens**: the editor allows entry; the card surfaces the `config_invalid_*` error state. Empty (after trim) = adaptive mode, no validation.
- **A YAML key the editor does not model** (e.g. a future field or a typo'd key): preserved verbatim through every `config-changed` (preservative merge); never dropped.
- **User deletes a field in YAML text mode**: removal is intentional; the parsed config (without that key) becomes the new `_config` and is emitted.
- **YAML text with a syntax error (mid-typing)**: the editor shows the parse error inline, keeps the last valid `_config` (the card preview is unchanged), and does not emit `config-changed`. Once the YAML becomes valid again (debounced parse succeeds), the config updates and the preview refreshes.
- **User edits YAML and clicks Save without switching to Visual**: the last valid YAML **values** are the config that gets saved (FR-908-Y); no switch to Visual mode is required for YAML edits to take effect. HA re-serializes the config object, so the *values* persist but the exact text formatting (comments, key order, indentation) is canonicalized by HA.
- **YAML with hostile / executable tags** (e.g. `!!python/object`, `!!binary` payloads): the parser runs in **safe mode** — it MUST NOT execute arbitrary code or instantiate objects. Hostile tags are rejected (inline error) or neutralized; the last valid `_config` is kept and no emit occurs (Constitution II: untrusted input).
- **External config change while the user is mid-edit in YAML** (e.g. a dashboard reload or another card re-sends the config): the textarea is re-serialized from the external config, which **overwrites the user's un-emitted (debounced) YAML edits**. This is the intended behavior (an external change is authoritative) but is a deliberate, documented UX trade-off — the user's in-flight, not-yet-emitted edits are lost.
- **`window.jsyaml` absent**: the Visual/YAML toggle is hidden; the editor operates Visual-only (unchanged from v1.1.0).
- **Editor opened on a fresh card**: `getStubConfig()` provides `{ entity: "" }`; all sections render with defaults; no crash.
- **Re-render during an in-flight debounce**: a re-render must not cancel a pending, user-visible text value; the field's displayed value is authoritative for the UI, the debounced emit is only for the config object.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Field Registry & Architecture

- **FR-908-A (Field Registry)**: The editor MUST define its fields through a **schema-driven field registry** — a data structure where each field descriptor carries: the YAML key (path), the control type, the owning **section**, default value, required/optional flag, and declarative **visibility** and **disabled** rules. Rendering MUST be generated from this registry, not from a hard-coded per-field template.
- **FR-908-B (Section relocation is a data change)**: Moving a field from one section to another MUST be achievable by changing only the field's `section` property in the registry — without editing the Lit render template. The render loop MUST group fields by their `section` value.
- **FR-908-C (Hybrid rendering)**: The registry MUST support a **custom-renderer escape hatch**: a field or sub-block may declare a custom renderer for complex controls (e.g. the `time_window` sub-section in `custom` mode). Standard controls (boolean, text, number, select, slider, color) MUST be rendered from the registry's declarative metadata. The custom renderer MUST still read/write through the same config-merge and event pipeline as declarative fields.
- **FR-908-D (100% YAML coverage)**: The registry MUST model every user-configurable YAML parameter of the v1.1.0 card: `entity`, `title`, `show_title`, `icon`, `show_icon`, `comparison_preset`, `interpretation`, `neutral_interpretation`, `aggregation`, `period_offset`, `time_window.{anchor,offset,duration,step,count}`, `show_comparison_summary`, `show_forecast`, `show_forecast_total_panel`, `show_narrative_comment`, `primary_color`, `fill_current`, `fill_current_opacity`, `fill_reference`, `fill_reference_opacity`, `connect_nulls`, `show_legend`, `precision`, `force_prefix`, `number_format`, `language`, `x_axis_format`, `tooltip_format`, `debug`. The fixed `type` key is NOT an editable field. The deprecated `comparison_mode` and the legacy `forecast` alias are NOT standalone fields (handled by FR-908-I and FR-908-V respectively).

#### Section Layout

- **FR-908-E (Six sections)**: The editor MUST present fields in exactly six sections, in this order: (1) **Basic Settings** — always expanded; (2) **Time & Aggregation** — collapsible; (3) **Layout & Visibility** — collapsible; (4) **Visuals & Chart Styling** — collapsible; (5) **Formatting & Axis** — collapsible; (6) **System & Debug** — collapsible.
- **FR-908-F (Section field membership)**: Section membership MUST be:
  - **S1 Basic**: `entity` (required), `title`, `show_title`, `icon`, `show_icon`, `comparison_preset`, `interpretation`, `neutral_interpretation`.
  - **S2 Time & Aggregation**: `aggregation`, `period_offset` (standard mode), and the `time_window` sub-block `anchor`, `duration`, `step`, `count`, `offset` (custom mode).
  - **S3 Layout & Visibility**: `show_comparison_summary`, `show_forecast`, `show_forecast_total_panel`, `show_narrative_comment`.
  - **S4 Visuals**: `primary_color`, `fill_current`, `fill_current_opacity`, `fill_reference`, `fill_reference_opacity`, `connect_nulls`, `show_legend`.
  - **S5 Formatting & Axis**: `precision`, `force_prefix`, `number_format`, `language`, `x_axis_format`, `tooltip_format`.
  - **S6 System & Debug**: `debug`.

#### Conditional Rendering & Cascading

- **FR-908-G (Preset ↔ time_window visibility)**: When `comparison_preset == "custom"`, the editor MUST hide `period_offset` and show the `time_window` sub-block. When `comparison_preset != "custom"`, it MUST show `period_offset` and hide the `time_window` sub-block.
- **FR-908-H (Forecast cascade)**: When `show_forecast == false`, the editor MUST render `show_forecast_total_panel` in a **disabled** state. When `show_forecast` is `true`/omitted, the control MUST be enabled.
- **FR-908-I (Deprecated `comparison_mode`)**: The editor MUST NOT render a `comparison_mode` field. On load, if `comparison_mode` is present and `comparison_preset` is empty, the editor MUST pre-fill `comparison_preset` from it. On save, the emitted config MUST use `comparison_preset` and replace (not duplicate) the deprecated key.
- **FR-908-V (Legacy `forecast` alias normalization)**: The editor MUST NOT render a `forecast` field. On load, the `show_forecast` control MUST resolve its value as `config.show_forecast ?? config.forecast ?? true` (alias fallback for display). On save, the emitted config MUST use `show_forecast` as the canonical key and MUST drop the `forecast` alias key (the alias is a temporary legacy key scheduled for future removal; the editor normalizes it away, same pattern as FR-908-I).

#### State Persistence Across Re-renders (lifecycle)

- **FR-908-J (UI state independent of config)**: The editor MUST keep **UI-only state** (expanded/collapsed state of each section, and any other presentation state) in component-local state that is **independent of the `config` object** passed from Home Assistant. A `setConfig()` re-render MUST NOT reset this UI state.
- **FR-908-K (Expanded-state survival)**: On every re-render triggered by `setConfig()`, the expanded/collapsed state of each section MUST be restored to its pre-render value. Only an explicit user toggle changes it.
- **FR-908-L (Focus & caret preservation)**: When a re-render occurs while a text/number field has focus, the editor MUST restore focus and caret position to that field after the render, so continuous typing is not interrupted.
- **FR-908-M (Scroll preservation)**: A re-render MUST preserve the editor's scroll position.
- **FR-908-N (No re-render feedback loop)**: A re-render MUST NOT cause any control to emit a `config-changed` event as a side effect of being re-created. Config emission MUST be driven only by genuine user intent (a real value change), never by the act of rendering.

#### Input Handling & Merge

- **FR-908-O (Text-input debounce)**: For free-text and number fields, the editor MUST debounce the emission of `config-changed` so that rapid typing does not fire a full config emit (and thus a full card re-query) on every keystroke. The debounce MUST flush on blur, on a short idle timeout, or on an explicit commit — whichever the implementation chooses — and MUST always flush before the editor is closed/saved. The **displayed** field value MUST update immediately (no debounce on the visible value). A **two-tier** debounce applies to the **YAML textarea** (FR-908-Y): the displayed text updates immediately on every keystroke, but the parse (for error detection) is debounced at a shorter interval and the `config-changed` emit (for preview) is debounced at a longer interval, with **no-op suppression** (emit only when the parsed config differs structurally from the last-emitted config). The pending parse/emit MUST be force-flushed on blur, on a mode switch, or on close.
- **FR-908-Y (YAML first-class input path)**: The YAML mode is a **first-class, independent input path**, not a draft/scratchpad. Editing the YAML textarea updates the card preview live (debounced) and the **last valid YAML values are the config that gets saved** — no switch to Visual mode is required. (HA re-serializes the config object on save, so the *values* persist but the exact text formatting — comments, key order, indentation — is canonicalized by HA, not preserved verbatim.) On a YAML syntax error, the editor MUST show the error inline, keep the last valid `_config` (preview unchanged), and MUST NOT emit `config-changed`. The YAML parser MUST run in **safe mode** (no execution of arbitrary code / object instantiation from hostile tags such as `!!python/object`); hostile tags are rejected or neutralized (Constitution II). The `setConfig()` method MUST **preserve the current editor mode** (it does not reset to Visual). The YAML textarea MUST NOT be re-serialized by a `setConfig()` self-echo (the config the editor just emitted); it is re-serialized only on an explicit mode switch or an external config change that differs from the last-emitted config. The self-echo / external classification MUST be robust to the known normalizations HA applies on the round-trip (key order, scalar type coercion) so that a self-echo is never misclassified as an external change (which would re-serialize the textarea and steal the caret). The two-tier debounce MUST flush **atomically and in order** on blur / mode switch / close: parse first, then emit the result if valid; if the parse fails on flush, the last valid `_config` is kept and no emit occurs.
- **FR-908-P (Preservative deep merge)**: On every change, the editor MUST merge changed fields into the full stored config using a **preservative deep merge**: changed/known fields are updated; the `time_window` object is merged field-by-field (not replaced wholesale) so unedited sub-fields survive; and **all** keys not modeled by the editor (including deprecated and unknown keys) are preserved verbatim. No key present in the incoming config may be silently dropped.
- **FR-908-Q (Preset ↔ Custom state cleanup)**: On switching standard → `custom`, the editor MUST remove `period_offset` and initialize `time_window` with defaults (`anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`). On switching `custom` → standard, it MUST remove the `time_window` object and restore `period_offset: -1`.
- **FR-908-R (Optional/required marking)**: The editor MUST visually distinguish **required** fields (at minimum `entity`) from **optional** ones, using a consistent, localized convention. Optional fields with no value MUST render empty (or their documented default) without an error.
- **FR-908-W (Entity picker domain)**: The `entity` picker MUST remain restricted to the `sensor` domain (unchanged from v1.1.0). The restriction is a UX guard, not a coverage gap — the card's data pipeline is built around sensor entities. YAML remains the escape hatch for unusual entity types.

#### Validation & Graceful Degradation

- **FR-908-S (No blocking semantic validation in editor)**: The editor MUST NOT block the save flow on semantic validity of `time_window`, `offset`, `x_axis_format`, `tooltip_format`, `neutral_interpretation`, or numeric ranges. Invalid values entered in the GUI are passed through; the **card** surfaces them via the standard card error state (domains `900`/`902`). Error *prevention* (inline validation) is explicitly out of scope for v1.2.0.
- **FR-908-T (Graceful degradation)**: The editor MUST open without a JavaScript error when (a) `hass` is absent, (b) a select field's configured value is unknown/out-of-range (show empty/default selection), or (c) the config is the minimal stub. Saving MUST remain possible in all these cases.

#### Localization

- **FR-908-U (Localized labels & options)**: All section titles, field labels, and select-option labels MUST be sourced from the card's translation dictionaries (`en`, `pl`, `de`, `fr`) under the `editor.*` namespace via the card's `localize` module (wired to the form through `computeLabel`), consistent with domain `905`. HA's internal `hass.localize` pipeline MUST NOT be used for editor labels. New keys added by this feature MUST be added to all four shipped dictionaries.
- **FR-908-X (Editor label language resolution)**: The language used for editor labels MUST follow this resolution chain: (1) if the card config's `language` field is set → use it (it forces that language for both the card and the editor labels); (2) if `language` is not set → inherit the HA profile language (`hass.locale.language`); (3) if the resolved language is not covered by the card's shipped dictionaries → use the card's existing fallback (unchanged from v1.1.0). Changing the `language` field in the editor MUST re-label the entire form live (the label language tracks the config value, not a cached value from editor open).

---

### Key Entities

- **`CardConfig` / `CardConfigInput`**: The full YAML configuration object (see `src/card/types.ts`). The editor reads from and emits back the full object on every change.
- **`FieldDescriptor`** (new): A registry entry describing one field — `key` (YAML path, e.g. `time_window.count`), `section`, `control` (declarative control spec or a custom-renderer reference), `default`, `required`, `visibleWhen` (predicate over config), `disabledWhen` (predicate over config), and `labelKey` (i18n key).
- **`FieldRegistry`** (new): The ordered collection of `FieldDescriptor`s, grouped by `section`. The single source of truth for what the editor renders and where.
- **`EditorUiState`** (new): Component-local, config-independent presentation state — per-section `expanded` flags (and any other UI-only state). Survives `setConfig()` re-renders.
- **`_config`**: The editor's internal full `CardConfig`. A **visual field edit** updates it by preservative deep merge (incremental); a **YAML parse** replaces it wholesale (`_config = parsedConfig`).
- **`EditorMode`**: `"visual" | "yaml"` — the current editor mode. `setConfig()` preserves the mode (does not reset to Visual). In YAML mode, the textarea is a first-class input path (FR-908-Y).
- **`ComparisonPreset`** (extended): The v1.2.0 editor offers `year_over_year`, `month_over_year`, `month_over_month`, and **`custom`** as the four preset choices. `custom` is a new value (see Cross-domain Contracts → `900`).
- **Translation keys** (`editor.*`): New i18n keys for the added sections/fields/options in `en.json`, `pl.json`, `de.json`, `fr.json`.

---

## Technical Architecture

### Layering

```
┌─────────────────────────────────────────────────────────────┐
│  energy-horizon-card-editor (Lit custom element)            │
│                                                             │
│  ┌──────────────┐   ┌──────────────────────────────────┐    │
│  │ FieldRegistry │──▶│  Section render loop            │    │
│  │ (data:        │   │  groups descriptors by section, │    │
│  │  descriptors) │   │  applies visibleWhen/disabledWhen│   │
│  └──────────────┘   │  renders declarative controls    │    │
│                      │  or a custom renderer           │    │
│  ┌──────────────┐   └──────────────────────────────────┘    │
│  │ EditorUiState │   (expanded flags, focus, scroll)        │
│  │ (config-      │        independent of _config            │
│  │  independent) │                                          │
│  └──────────────┘                                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Config pipeline: preservative deep merge → _config     │  │
│  │   → debounced config-changed (visual) / jsyaml (yaml)  │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Field Registry (declarative core)

Each standard field is a data object, e.g. conceptually:

```ts
// Illustrative shape — final types decided in /speckit-plan.
type FieldDescriptor = {
  key: string;                 // YAML path, e.g. "fill_current_opacity" or "time_window.count"
  section: SectionId;          // "basic" | "time" | "layout" | "visuals" | "formatting" | "system"
  control:
    | { kind: "entity"; domain: string }
    | { kind: "text" }
    | { kind: "number"; min?: number; max?: number }
    | { kind: "select"; options: { value: string; labelKey: string }[] }
    | { kind: "boolean" }
    | { kind: "slider"; min: number; max: number }
    | { kind: "color" }
    | { kind: "custom"; render: (ctx) => TemplateResult };  // escape hatch (FR-908-C)
  default?: unknown;
  required?: boolean;
  labelKey: string;            // "editor.<name>"
  visibleWhen?: (cfg: CardConfig) => boolean;   // e.g. preset === "custom"
  disabledWhen?: (cfg: CardConfig) => boolean;  // e.g. !show_forecast
};
```

The render loop iterates sections in fixed order, filters descriptors by `visibleWhen`, applies `disabledWhen`, and renders each control. **Relocating a field = changing `section`** (FR-908-B). **Adding a field = adding a descriptor** — no template surgery.

### Hybrid rendering

~90% of fields are declarative (booleans, text, numbers, selects, sliders, color). For v1.2.0 the `time_window` sub-block in `custom` mode is rendered as **five declarative fields**: `anchor` (select, 6 options), `offset` (text, ISO 8601 free text), `duration` (text), `step` (text), `count` (number). The registry's **custom-renderer escape hatch** (FR-908-C) MUST exist in the architecture so that a richer control (e.g. a structured ISO-8601 editor or a range preview) can be swapped in later as a localized change, not a rewrite — but the rich control itself is out of scope for v1.2.0 (see Non-Goals).

### State model & lifecycle

- **`_config`** (data): the full `CardConfig`. Updated by **two distinct semantics**: a **visual field edit** applies a *preservative deep merge* (FR-908-P, incremental — unmodeled keys survive); a **YAML parse** is a *full replacement* (`_config = parsedConfig` — the parsed YAML *is* the config, so it is not merged into the previous one).
- **`EditorUiState`** (presentation): per-section `expanded` booleans, last-focused field id, last caret offset, scroll anchor. **Never derived from `config`**; restored across `setConfig()` re-renders (FR-908-J/K/L/M).
- **Re-render contract**: `setConfig()` updates `_config` and re-renders, but MUST re-apply `EditorUiState` (expanded, focus, scroll) and MUST NOT emit `config-changed` (FR-908-N). Emission is gated on a genuine value delta.
- **Debounce**: text/number inputs update the displayed value immediately and update `_config` immediately, but the `config-changed` **emit** is debounced (idle timeout) and force-flushed on blur/commit/close (FR-908-O). Selects/switches/sliders emit immediately (discrete values).
- **YAML mode** (FR-908-Y): the YAML textarea is a live input path. Text updates immediately; parse is debounced (short interval) for fast error feedback; emit is debounced (longer interval) for preview with no-op suppression (structural diff). The textarea is re-serialized only on mode switch or external config change, never by a self-echo. On blur / mode switch / close the pending parse/emit flushes **atomically and in order** (parse first, then emit if valid; a failed parse keeps the last valid `_config` and emits nothing).
- **`setConfig()` mode preservation**: `setConfig()` updates `_config` and re-renders but **preserves `_editorMode`** (does not reset to Visual). If the incoming config is a self-echo (structurally equal to the last-emitted config), the YAML textarea is not re-serialized. If it is an external change (structurally different), the YAML textarea is re-serialized with the new config (caret preservation is best-effort). The self-echo / external classification MUST be robust to the known normalizations HA applies on the round-trip (key order, scalar type coercion) so a self-echo is never misclassified as external.

### Preservative deep merge

Merge is **field-path aware**: top-level scalar fields are set; the `time_window` object is merged key-by-key so that, e.g., editing `time_window.count` does not wipe `time_window.offset`. Any key in the incoming `config` that has no registry descriptor is copied through unchanged. This guarantees FR-908-P and the "no field lost" success criterion.

---

## Public Contract

```typescript
// Main card class (unchanged surface, extended behavior)
static getConfigElement(): HTMLElement;   // returns <energy-horizon-card-editor>
static getStubConfig(): Partial<CardConfig>;

// Editor custom element
customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);

// Emitted on every genuine config change (debounced for text inputs):
dispatchEvent(new CustomEvent("config-changed", {
  detail: { config: CardConfig },   // full preservative-merged object
  bubbles: true, composed: true
}));
```

**Editor preset options (v1.2.0)**: `comparison_preset` select offers `year_over_year`, `month_over_year`, `month_over_month`, `custom`.

**Editor invariants**:
- Renders six sections (FR-908-E) from the `FieldRegistry`.
- Keeps `EditorUiState` independent of `config` (FR-908-J).
- Emits the full `CardConfig` on change; never drops unmodeled keys (FR-908-P).
- Visual/YAML toggle: shown when `window.jsyaml` is present (hidden when absent, unchanged). In YAML mode, the textarea is a **first-class input path** (FR-908-Y): edits emit live (debounced) and the last valid YAML **values** are the saved config (HA re-serializes the config, so values persist but text formatting is canonicalized). `setConfig()` preserves the editor mode (does not reset to Visual).

---

## Cross-domain Contracts

**Publishes to**:
- `900-time-model-windows`: the new **`custom`** `comparison_preset` value and the full `time_window` block (`anchor`, `offset`, `duration`, `step`, `count`). The card MUST accept `custom` as a valid preset that resolves windows **generically** from `time_window` (no legacy YoY/MoY flags). The editor does not validate window semantics (FR-908-S); the card owns validation and error surfacing.
- `902-chart-rendering-interaction`: `primary_color`, `fill_*`, `fill_*_opacity`, `connect_nulls`, `show_legend`, `show_forecast`, `x_axis_format`, `tooltip_format`, `aggregation`.
- `903-card-ui-composition`: `title`, `show_title`, `icon`, `show_icon`, `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment`, `interpretation`, `neutral_interpretation` (now GUI-editable, no longer YAML-only).
- `905-localization-formatting`: `language`, `number_format`, `precision`; and the new `editor.*` label/option keys.
- `906-units-numeric-scaling`: `force_prefix`.
- `907-docs-product-knowledge`: the visual editor's new coverage, sections, and lifecycle behavior MUST be reflected in `README.md`, `README.advanced.md`, the `wiki-publish/` pages, and `changelog.md` (see Non-Goals — documentation is planned here but authored under domain 907).
- All domains: the full `CardConfig` on every `config-changed`.

**Consumes from**:
- `905-localization-formatting`: `localize()` for all editor labels/options.
- `900-time-model-windows`: preset templates and the `custom`/generic resolution semantics that the editor's preset↔custom cleanup (FR-908-Q) must stay consistent with.

---

## Non-Goals

- **Inline field validation / error prevention** in the editor (FR-908-S). Invalid values are passed through and surfaced by the card. Explicit validation UX is deferred to a later version.
- **A new Vite entry point or lazy-loaded editor module** (the editor stays a static import, per domain `904` FR-904-F).
- **New translations beyond the four shipped** (`en`, `pl`, `de`, `fr`).
- **Authoring the documentation updates** (README/wiki/changelog) *in this feature's code tasks*. They are **planned** as part of v1.2.0 and owned by domain `907-docs-product-knowledge`; this spec defines *what* must be documented, not the doc files themselves.
- **Per-window aggregation in the editor** (the card currently uses one effective `aggregation` for all windows; no per-window step UI).
- **A graphical ISO-8601 duration builder or range-preview chart** for `time_window` (the custom-renderer *hook* is required; the rich control itself is optional/deferred).
- **Changes to the card's data pipeline, forecast, or chart rendering** beyond accepting the `custom` preset value.

---

## Documentation Plan (v1.2.0)

The documentation updates below are **planned** as part of v1.2.0 and are **owned by domain `907-docs-product-knowledge`** (wiki/README/changelog governance). This section defines *what* must be documented and *where*, so the feature is complete; the actual doc files are authored under domain 907's conventions (code is the naming authority, `README.advanced.md` is the behavior authority, wiki expands but must not contradict).

### `README.md` (project overview)

- Update the **feature list / highlights** to state that the visual editor now covers the **full** configuration surface (all six sections), not a subset.
- Add a short **"Visual editor"** note: the editor exposes every parameter; advanced users can still use YAML mode.
- Bump the documented version reference to **1.2.0**.

### `README.advanced.md` (authoritative reference)

- **Rewrite the "Lovelace editor" section** (currently lists only the v1.1.0 subset) to describe the **six sections**, the **conditional rendering** (`custom` ↔ `time_window`), the **forecast cascade**, and the **lifecycle guarantees** (expanded panels persist, focus/caret preserved, no spurious re-emit).
- **Visual ↔ YAML round-trip**: document that Visual and YAML modes are two views of the same config — switching to YAML dumps the full current config (every field, including those set in the form), and switching back re-populates every field from the YAML (lossless; the YAML is authoritative). Replace the v1.1.0 framing ("YAML mode: all other fields are set in YAML") — with 100% coverage, both modes expose the full surface.
- **YAML live-edit (FR-908-Y)**: document that YAML mode is a **first-class input path** — edits update the preview live (debounced) and the last valid YAML **values** are the saved config, with no switch to Visual required; a YAML syntax error is shown inline without changing the preview. Note that HA re-serializes the config on save, so the *values* persist but the exact text formatting (comments, key order, indentation) is canonicalized — do not promise verbatim text preservation.
- **YAML parameters table**: add a column or note marking which fields are **GUI-editable** (now all of them) vs. the deprecated `comparison_mode` / `forecast` alias (not standalone fields).
- **`comparison_preset` section**: document the new **`custom`** value (resolve windows generically from `time_window`; no legacy flags) alongside the three standard presets.
- **`neutral_interpretation`**: change the "YAML-only in v1" note to "GUI-editable in v1.2.0".
- Keep the existing YAML examples; add one **`custom` preset** example.

### `wiki-publish/` (Diátaxis quadrants)

- **`Configuration-and-Customization.md`** (Reference): update the `comparison_preset` row to include `custom`; update `neutral_interpretation` gotcha from "YAML-only in v1" to "GUI-editable in v1.2.0"; add a short "Visual editor" reference block listing the six sections and which keys map to which.
- **`Getting-Started.md`** (Tutorial): add a brief "Configure with the visual editor" step (open Edit → six sections → live preview) so first-time users know they need not touch YAML.
- **`Releases-and-Migration.md`**: add a **1.2.0** entry — editor full coverage, new `custom` preset, lifecycle stability; note the `comparison_mode` → `comparison_preset` migration is now also handled in the GUI.
- **`Troubleshooting-and-FAQ.md`**: add an entry — "My expanded sections collapse / focus jumps while editing" → explain the v1.2.0 lifecycle fix (UI state independent of config).
- **`Home.md` / `_Sidebar.md`**: no structural change expected (no new pages); verify links still resolve.

### `changelog.md`

- Add a **`[1.2.0]`** section with:
  - **Added**: full-coverage visual editor (six sections); `custom` comparison preset; GUI controls for `time_window.*`, colors/opacities, formatting, Luxon patterns, forecast, debug.
  - **Changed**: editor lifecycle — expanded panels, focus, and scroll now persist across re-renders; text-input emits are debounced; YAML mode is now a first-class input path (live preview, last valid YAML values are saved, no switch to Visual required).
  - **Fixed**: deprecated `comparison_mode` is migrated to `comparison_preset` in the GUI on save.
  - **Documentation**: README/wiki updated for the new editor coverage.

### Consistency rules (must hold across all docs)

- The **`custom`** preset value, the **six section names**, and the **field→section mapping** must be identical in `README.advanced.md`, the wiki, and the changelog.
- The **Visual ↔ YAML round-trip** (both modes show the full config; switching is lossless in both directions) must be stated consistently, and the v1.1.0 "YAML is authoritative for the full config / switch to YAML for advanced fields" framing MUST be retired wherever it appears (`README.advanced.md`, `First-Comparisons-Quick-Recipes.md`, `Configuration-and-Customization.md`).
- Any field described as "YAML-only" in v1.1.0 docs MUST be updated to reflect v1.2.0 GUI coverage.
- Docs MUST not promise inline validation (Non-Goal); they should state that invalid values surface as the standard card error.

---

## Success Criteria

- **SC-908-1 (Coverage)**: 100% of the v1.1.0 user-configurable YAML parameters are editable in the visual editor; a config exercising every parameter round-trips through the editor with zero fields lost (verified by before/after YAML diff).
- **SC-908-2 (Stability)**: Across a session of ≥ 20 mixed edits (text typing, switch toggles, select changes, section expands/collapses), the user experiences **zero** unintended panel collapses, **zero** focus/caret losses in an actively-typed field, and **zero** scroll jumps.
- **SC-908-3 (No churn)**: A `setConfig()` re-render produces **zero** spurious `config-changed` emissions (no config-object identity churn, no redundant card re-queries) — verified by counting emitted events during a passive re-render.
- **SC-908-4 (Live preview)**: Every discrete change (select/switch/slider) is reflected in the card preview within 500 ms; text-input changes are reflected within the debounce window and always on blur.
- **SC-908-5 (Mode switching)**: Standard ↔ `custom` switching produces a correct config in both directions (period_offset / time_window added and removed as specified) with the section's expanded state preserved.
- **SC-908-6 (Backward compatibility)**: A v1.1.0 config containing `comparison_mode` and any YAML-only fields opens in the v1.2.0 editor without error, saves with `comparison_preset` populated, and loses no YAML-only fields.
- **SC-908-7 (Localization)**: All new section titles, field labels, and option labels resolve in `en`, `pl`, `de`, and `fr` (no missing-key fallback to the raw key).
- **SC-908-8 (Extensibility)**: Moving any single field to a different section, or adding one new field, requires editing only the `FieldRegistry` data (no Lit template structural change).
- **SC-908-9 (YAML live-edit)**: Editing the YAML textarea produces a live preview update within the emit debounce window and on blur; a YAML syntax error is shown inline within the parse debounce window without changing the preview; saving without switching to Visual saves the last valid YAML **values** (HA re-serializes the config, so values persist but text formatting is canonicalized); a `setConfig()` self-echo does not re-serialize the textarea (no caret disruption).

---

## Assumptions

- **`custom` is a new preset value (type-level only).** The v1.1.0 `ComparisonMode` type is `year_over_year | month_over_year | month_over_month`. v1.2.0 adds `custom`, meaning "resolve windows generically from the `time_window` block." The card's existing generic resolution path in `resolve-windows.ts` already handles `time_window`-driven windows — no new resolution logic is needed. The change is a small, backward-compatible extension in domain `900` (add `"custom"` to `ComparisonMode`; it maps to the existing generic resolution). Existing configs are unaffected because `custom` is opt-in. Presets fill in `time_window` values on behalf of the user; `custom` lets the user set them manually via the GUI.
- **HA runtime components are available.** `ha-expansion-panel`, `ha-entity-picker`, `ha-icon-picker`, `ha-select`, `ha-input`, `ha-switch`, `ha-slider`, and `ha-color-picker` are present in the HA frontend at runtime (HA 2024+). Where a specific HA control is unavailable, the editor degrades to an equivalent standard control rather than failing. The editor uses **HA-native patterns** (not a full `<ha-form>` migration): each control is rendered directly with its HA component, and the field-registry drives which control maps to which config key.
  - **Labels**: `ha-input`, `ha-select`, `ha-entity-picker`, `ha-icon-picker`, and `ha-color-picker` render their own accessible label via the built-in `label` property (inside their shadow DOM). For those, the editor MUST NOT also render an external `<label for>` (it cannot cross the shadow boundary and would duplicate the label). `ha-switch` and `ha-slider` have **no** built-in label, so they keep an external `<label for>`. Fallback standard controls always keep the external label.
  - **Events / value access** (verified against `home-assistant/frontend`): `ha-select` fires `selected` (value in `detail.value`, **not** `change`); `ha-icon-picker` and `ha-color-picker` fire `value-changed` (value in `detail.value`, **not** `change`); `ha-entity-picker` fires both `change` and `value-changed`; `ha-switch` uses the `.checked` property (not `.value`) and fires native `change`; `ha-slider` uses `.value` and fires native `change`; `ha-input` re-dispatches composed `input`/`change` and uses `delegatesFocus` (so `focus`/`blur` do **not** cross the shadow boundary — the editor listens for composed `focusin`/`focusout` and reads the caret via `composedPath()`).
  - **Sections**: `ha-expansion-panel` takes its title via the `header` property (or `slot="header"`), **not** `slot="title"`. Its own summary (`role="button"`, `tabindex=0`) handles click/keyboard toggling internally and fires `expanded-changed` with `{ expanded }`; the editor syncs `EditorUiState` from that event and MUST NOT attach `@click` to the whole panel (which would also toggle the section when clicking any field inside it).
- **`window.jsyaml`** is the YAML serializer (unchanged); if absent, the Visual/YAML toggle is hidden (Visual-only), per domain `904`. The parser MUST run in **safe mode** (no execution of arbitrary code / object instantiation from hostile tags) — YAML is untrusted input (Constitution II).
- **Defaults** follow the v1.1.0 card: `show_*` default `true` (visible when not `false`); `fill_current` `true` / `fill_reference` `false`; opacities `30`; `connect_nulls` `true`; `show_legend` `false`; `precision` `2`; `neutral_interpretation` `2`; `force_prefix` `auto`; `number_format` `system`; `aggregation` `auto`; `period_offset` `-1`; `time_window` defaults `anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`; `debug` `false`.
- **Debounce windows** are implementation details chosen in `/speckit-plan`: visual text/number fields use a short idle timeout (a few hundred ms); the YAML textarea uses a **two-tier** debounce — a short interval for parse (fast error feedback) and a longer interval for emit (preview) with no-op suppression. The spec fixes the *behavior* (immediate display, debounced emit, flush on blur/commit/close, no-op suppression), not the exact constants. The two-tier flush MUST be **atomic and ordered** (parse first, then emit if valid; a failed parse on flush keeps the last valid `_config` and emits nothing).
- **Documentation** (README, wiki, changelog) describing the v1.2.0 editor is owned by domain `907-docs-product-knowledge` and is planned alongside this feature but authored under that domain's governance.
- **The editor is the UI for the YAML** — for the *config*, there is exactly one source of truth (Home Assistant / the Storage UI / the file), and the editor's job is faithful, lossless round-tripping plus convenience. The editor additionally holds a **second, config-independent source of truth** — `EditorUiState` (expanded/focus/caret/scroll) — which HA does not know about. The entire lifecycle machinery (FR-908-J/K/L/M, post-render restore, emit gate) exists to **reconcile these two sources of truth** across HA's re-renders. This is a deliberate architectural choice, not an accident.
