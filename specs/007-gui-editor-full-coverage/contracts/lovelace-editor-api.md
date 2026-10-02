# Contract: Lovelace Card Editor API (full coverage)

**Feature**: 007-gui-editor-full-coverage  
**Type**: UI Contract — Home Assistant Lovelace integration  
**Direction**: `EnergyHorizonCard` ↔ `EnergyHorizonCardEditor` ↔ HA Frontend

This contract **extends** the 005-gui-editor contract (`specs/005-gui-editor/contracts/lovelace-editor-api.md`). All 005 invariants remain in force; the deltas are marked **(007)**.

---

## 1. Card → HA: Static methods on `EnergyHorizonCard`

Unchanged from 005: `static getConfigElement(): HTMLElement` returns `document.createElement("energy-horizon-card-editor")`; `static getStubConfig(): Partial<CardConfig>` returns `{ entity: "", comparison_preset: "year_over_year" }`.

---

## 2. HA → Editor: Methods HA calls on the editor element

### `editor.setConfig(config: CardConfig): void`

005 contract unchanged (store full `_config`, reset `_editorMode` to `"visual"`, reset `_yamlError`).

**(007)** MUST additionally reset:
- `_openSections` to an empty set (all advanced sections collapsed — FR-018).
- `_fieldErrors` to empty (no stale inline errors).

### `editor.hass = hassObject` (property setter)

Unchanged from 005 (language resolution; `undefined` → degraded English labels).

---

## 3. Editor → HA: `config-changed` CustomEvent

Unchanged from 005: full `CardConfig` in `detail.config`, `bubbles: true`, `composed: true`, emitted on every form change and on valid YAML→Visual switch.

**(007)** MUST be emitted **even when inline validation fails** (invalid `time_window`, invalid Luxon format) — the card is the validation authority and shows its error state until the value is fixed (FR-014). The editor never blocks or suppresses emission.

---

## 4. `<ha-form>` Internal Contract

**(007)** The editor renders **one `<ha-form>` per section** (8 sections, see `data-model.md` §2) instead of a single form. Per form:

| Property | Type | Value |
|---|---|---|
| `.schema` | `ReadonlyArray<HaFormSchema>` | the section's field descriptors |
| `.data` | `Record<string, unknown>` | `section.toForm(_config)` — flat, with card defaults applied |
| `.hass` | `HomeAssistant \| undefined` | forwarded |
| `.computeLabel` | `(schema: {name:string}) => string` | `(s) => localize("editor." + s.name)` (005 pattern) |

`value-changed` handling: `section.fromForm(e.detail.value)` → shallow-merge into `_config` → re-validate affected fields → emit `config-changed`. The merge never removes keys not owned by the section (SC-002).

**(007)** Advanced sections are wrapped in `<ha-expansion-panel>` (HA-native accordion), collapsed by default; open-state is component-local and not persisted. If `ha-expansion-panel` is not defined at runtime, the section renders unwrapped (always visible) — no crash.

---

## 5. Field-level contracts (007)

| Field | Control | Value contract |
|---|---|---|
| `aggregation` | select (list) | options `auto`/`hour`/`day`/`week`/`month`; `auto` ⇔ `undefined` in config; unknown YAML value → shows `auto`, raw value preserved in `_config` |
| `period_offset` | number | integer years; unset → `-1` |
| `time_window.*` | select/text/number | flat `time_window_*` fields; empty → omitted from `time_window` (preset applies); validated via `buildMergedTimeWindowConfig` + `validateMergedTimeWindowConfig` |
| `language` | select | `auto` ⇔ `undefined`; concrete values from `SUPPORTED_LANGUAGES`; unknown → `auto` display, raw preserved |
| `number_format` | select (list) | `comma`/`decimal`/`language`/`system`; unset → `system` |
| `precision` | number | 0–6; unset → `2` |
| `fill_*_opacity` | number | 0–100; unset → `30` |
| `primary_color` | text | any string (hex / `var(...)` / aliases) preserved verbatim |
| `x_axis_format` / `tooltip_format` | text | validated with `validateXAxisFormat`; invalid → inline error, config still emitted |
| booleans (`show_*`, `fill_*`, `connect_nulls`, `debug`) | boolean | checkbox; card `!== false` fields default checked; unchecking writes explicit `false` |
| `icon` | select (list) | first option `""` = "Entity icon (auto)" (card inherits entity icon); concrete MDI icon values; `""` ⇔ `undefined` in config (FR-025) |
| `force_prefix` | select (list) | `auto`/`none`/`G`/`M`/`k`/`m`/`u`; `auto` ⇔ `undefined`; localized option labels (FR-021) |
| `comparison_preset` | select | `year_over_year`/`month_over_year`/`month_over_month`; localized option labels (FR-021) |

---

## 6. Invariants (must hold at all times)

005 invariants 1–5 remain in force (no YAML-only field loss; no crash on missing `hass`; no crash on unknown values; YAML mode blocked on invalid YAML; empty entity valid).

**(007) Additional invariants**:
6. **Full coverage**: every user-configurable `CardConfig` field except `type` and `forecast` has a visual control (SC-001).
7. **Defaults visible**: unset fields show the card's effective default in their control (FR-011).
8. **Validation is advisory in the editor**: inline errors never block `config-changed`; the card remains the validation authority (FR-014).
9. **Section state is ephemeral**: advanced sections start collapsed on every `setConfig()`; open-state is never persisted (FR-018).
10. **Localized everywhere**: all labels, section titles, option texts, and inline errors resolve via `createLocalize` with English fallback — no raw keys rendered (SC-003).
11. **Section toggle isolation**: clicks inside form content (dropdowns, radios, switches) do NOT collapse the section; only header/chevron clicks toggle (FR-024). Collapsed sections take no vertical space (SC-008).
