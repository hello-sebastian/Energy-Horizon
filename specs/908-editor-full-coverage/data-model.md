# Data Model: Full-Coverage Visual Editor (v1.2.0)

Entities and validation rules for the v1.2.0 editor. The editor is the UI *for* the YAML — it reads the full `CardConfig`, mutates it via a preservative deep merge, and emits it back. The new entities below are **editor-internal**; the only cross-domain type change is `ComparisonMode += "custom"` (domain 900).

---

## 1. `SectionId`

```ts
type SectionId =
  | "general"      // S1 General — expanded by default
  | "time"         // S2 Time windows — expanded by default
  | "panels"       // S3 Panels
  | "formatting"   // S4 Formatting & Localization
  | "chart"        // S5 Chart settings
  | "style"        // S6 Style
  | "diagnostics"; // S7 Diagnostics
```

Fixed order: `general → time → panels → formatting → chart → style → diagnostics` (FR-908-E). The render loop iterates in this order; the order is a constant, not data. Sections may contain non-collapsible **subsections** (see §3 `FieldDescriptor.subsection`); a subsection is a visual grouping within a section, not a `SectionId`.

`SECTION_ICONS` is a constant `Record<SectionId, string>` mapping each section to the MDI icon id rendered in its header (decorative; see contracts/field-registry.md "Section icons").

`SECTION_DOCS_URLS` is a constant `Record<SectionId, string>` mapping each section to the wiki URL of the chapter covering its keys. It is rendered as the section header's documentation link (FR-908-AA); the link's accessible name is the localized `editor.docs_link` key (see contracts/field-registry.md "Section documentation links").

## 2. `ControlSpec` (declarative control metadata)

```ts
type ControlSpec =
  | { kind: "entity"; domain: string }                       // ha-entity-picker (FR-908-W: "sensor")
  | { kind: "icon" }                                        // ha-icon-picker
  | { kind: "text" }                                        // ha-textfield (free text)
  | { kind: "number"; min?: number; max?: number }          // ha-textfield type=number
  | { kind: "select"; options: { value: string; labelKey: string }[] }  // ha-select
  | { kind: "boolean" }                                     // ha-switch
  | { kind: "slider"; min: number; max: number; step?: number }         // ha-slider
  | { kind: "color" }                                       // ha-color-picker (free text fallback)
  | { kind: "custom"; render: (ctx: FieldRenderContext) => TemplateResult }; // escape hatch (FR-908-C)
```

Standard controls (`entity`…`color`) render from declarative metadata. `custom` is the escape hatch — it MUST read/write through the same config-merge + event pipeline as declarative fields (FR-908-C). In v1.2.0 no field uses `custom`; the hook exists for a future rich `time_window` control.

## 3. `FieldDescriptor` (registry entry)

```ts
interface FieldDescriptor {
  key: string;                          // YAML path, e.g. "fill_current_opacity" | "time_window.count"
  section: SectionId;                   // owning section (FR-908-B: relocation = change this)
  control: ControlSpec;                 // declarative spec or custom-renderer ref
  labelKey: string;                     // i18n key, "editor.<name>" (FR-908-U)
  default?: unknown;                    // documented default (rendered when value absent)
  required?: boolean;                   // true only for `entity` (FR-908-R)
  visibleWhen?: (cfg: CardConfig) => boolean;   // e.g. preset === "custom" (FR-908-G)
  disabledWhen?: (cfg: CardConfig) => boolean;  // optional predicate (no v1.2.0 field uses it)
  /** Emit policy: "debounced" (text/number) or "immediate" (discrete). Default by control kind. */
  emit?: "debounced" | "immediate";
  /** Renders in the same horizontal row as the field with this key (FR-908-Z). */
  inlineWith?: string;
  /** i18n key for a non-collapsible subsection header emitted before this field (e.g. "editor.subsection.unit"). */
  subsection?: string;
  /** UX-only field: rendered as a permanently ON + disabled control, never written to the config. */
  dummy?: boolean;
  /** 1-based column (1 or 2) in a two-column section grid; set on the Style fields. */
  column?: number;
}
```

**Validation rules**:
- `key` MUST be a valid YAML path of a v1.1.0 `CardConfig` field (or a `time_window.*` sub-field), **or** a UX-only dummy key (see `dummy`). The fixed `type` key is NOT a field.
- `required` is `true` only for `entity`; all others optional (FR-908-R).
- `visibleWhen`/`disabledWhen` are pure predicates over `CardConfig` (no side effects, no I/O).
- `labelKey` MUST exist in all four shipped dictionaries (SC-908-7).
- `inlineWith` MUST reference a field in the same section; in v1.2.0 it is set for `show_title` (`title`), `show_icon` (`icon`), and `interpretation` (`neutral_threshold`) (FR-908-Z).
- `subsection` (when set) MUST be an i18n key present in all four dictionaries (SC-908-7). The render loop emits a subsection header the first time a visible field with that `subsection` value appears, and again whenever the value changes; a subsection with no visible fields emits no header.
- `dummy` fields are rendered as a permanently ON + disabled control with no change handler; `_applyFieldChange` returns early for them, so they are never written to the config. In v1.2.0 the only dummy is `show_chart` (the chart is always shown; the control documents that there is no per-card toggle).
- `column` (when set) places the field in the given column of a two-column section grid. When any visible field in a section declares `column`, the section body renders as a CSS grid (`1fr 1fr`); columns are bottom-aligned so same-feature fields share a row, and a subsection header occupies row 1 of its column. In v1.2.0 only the Style section uses it: `primary_color`, `fill_current`, `fill_current_opacity` → column 1; `fill_reference`, `fill_reference_opacity` → column 2.

## 4. `FieldRegistry`

```ts
type FieldRegistry = readonly FieldDescriptor[];   // grouped by `section` at render time
```

The single source of truth for what the editor renders and where. The render loop groups descriptors by `section`, filters by `visibleWhen`, applies `disabledWhen`, and renders each control. **Adding a field = adding a descriptor; moving a field = changing `section`** (FR-908-A/B, SC-908-8).

### Field → Section map (FR-908-D coverage, FR-908-F membership)

32 config-backed fields + 1 UX-only dummy (`show_chart`). Subsections are marked with `▸`.

| Section | Fields (YAML key → control) |
|---|---|
| **S1 General** (expanded) | `entity`→entity(sensor, required) · `show_title`→boolean (inline with `title`) · `title`→text · `show_icon`→boolean (inline with `icon`) · `icon`→icon · `interpretation`→select(2) (inline with `neutral_threshold`) · `neutral_threshold`→number (suffix `%`) · `aggregation`→select(5) |
| **S2 Time windows** (expanded) | `comparison_preset`→select(4) · ▸ *Custom settings*: `time_window.anchor`→select(6) · `time_window.duration`→text · `time_window.step`→text · `time_window.count`→number · `time_window.offset`→text (all `time_window.*` visibleWhen: preset=custom) |
| **S3 Panels** | `show_comparison_summary`→boolean · `show_chart`→boolean (**dummy**, always ON + disabled) · `show_forecast_total_panel`→boolean · `show_narrative_comment`→boolean |
| **S4 Formatting & Localization** | `language`→select(5) · ▸ *Unit*: `force_prefix`→select(8) · `number_format`→select(4) · `precision`→number · ▸ *Dates*: `x_axis_format`→text · `tooltip_format`→text |
| **S5 Chart settings** | `show_forecast`→boolean · `connect_nulls`→boolean · `show_legend`→boolean |
| **S6 Style** (two-column grid) | ▸ *Current series* (column 1): `primary_color`→color · `fill_current`→boolean · `fill_current_opacity`→slider(0–100) · ▸ *Reference series* (column 2): `fill_reference`→boolean · `fill_reference_opacity`→slider(0–100) |
| **S7 Diagnostics** | `debug`→boolean |

**`period_offset` is YAML-only.** It is a legacy value managed at the config level by the preset switch (standard→`custom` removes it; `custom`→standard restores `period_offset: -1`) but it is **not** a registry field and is never rendered as a control in the visual editor.

**Select option sets** (values are the YAML values; labels are `editor.*` keys):
- `comparison_preset`: `year_over_year`, `month_over_year`, `month_over_month`, **`custom`** (v1.2.0 adds `custom`).
- `aggregation`: `auto`, `hour`, `day`, `week`, `month` (`auto` = adaptive, the documented default). **Note**: the `WindowAggregation` type is `"day"|"week"|"month"|"hour"` (no `"auto"`); the `auto` option maps to an **omitted/undefined** `aggregation` in the config, never a literal `"auto"` string.
- `language`: `auto` (sentinel ⇒ omitted `language` key, inherits the HA profile language; the field's `default`), then one option per shipped dictionary (`en`, `pl`, `de`, `fr` — derived from `AVAILABLE_LANGUAGES`).
- `interpretation`: `consumption`, `production`.
- `force_prefix`: `auto`, `none`, `G`, `M`, `k`, `m`, `µ`, `` (empty = adaptive) — mirrors the v1.1.0 editor options.
- `number_format`: `system`, `comma`, `decimal`, `language`.
- `time_window.anchor`: `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`.

**NOT fields** (handled by normalization, FR-908-I/V): deprecated `comparison_mode`, legacy `forecast` alias. **Fixed** (never editable): `type`.

## 5. `EditorUiState` (config-independent presentation state)

```ts
interface EditorUiState {
  expanded: Record<SectionId, boolean>;   // general + time default true; panels, formatting, chart, style, diagnostics default false
  lastFocusedField?: string;              // registry `key` of the focused text/number field
  lastCaret?: number;                     // caret offset within that field
  scrollAnchor?: number;                  // scrollTop of the editor scroll container
}
```

**Rules** (FR-908-J/K/L/M):
- **Never derived from `config`**. Held as component-local Lit `@state`.
- On every `setConfig()` re-render: re-apply `expanded`, restore focus + caret to `lastFocusedField`, restore `scrollAnchor`.
- Only explicit user gestures mutate it (section toggle, focus change, scroll).
- A re-render MUST NOT emit `config-changed` as a side effect (FR-908-N).

## 6. `_config` + config pipeline

```
setConfig(incoming) ─▶ normalizeForLoad(incoming) ─▶ _config (full CardConfig)
                                                              │
   visual field edit ─▶ preservativeMerge(_config, changes) ─▶ _config   (incremental)
   YAML keystroke    ─▶ jsyaml.load (safe mode) ─▶ _config = parsedConfig (full replacement)
                                                              │
                 delta vs lastEmitted? ─yes─▶ debounce/flush ─▶ dispatch config-changed
                 (re-render path: NO emit)
```

- **`normalizeForLoad`** (FR-908-I/V): pre-fill `comparison_preset` from `comparison_mode` when empty; resolve `show_forecast` as `config.show_forecast ?? config.forecast ?? true` for display. Pure.
- **`preservativeMerge(base, changes)`** (FR-908-P): field-path aware. Top-level scalars set; `time_window` merged key-by-key; **every** unmodeled key (deprecated/unknown/future) copied through. Pure. No key in `base` is dropped. **Applies to visual field edits only.**
- **YAML parse** (FR-908-Y): `jsyaml.load` in **safe mode** (no code execution / object instantiation from hostile tags). On success, `_config` is **replaced wholesale** with the parsed config (the parsed YAML *is* the config — it is not merged into the previous one). On a syntax error: inline error, `_config` unchanged, no emit.
- **`normalizeForSave(config)`** (FR-908-I/V): emit `comparison_preset` (replace `comparison_mode`), emit `show_forecast` (drop `forecast` alias). Pure.
- **Emit gate** (FR-908-N): dispatch only when the would-be config differs (field-path deep compare) from the last-emitted config. Text/number emits are debounced (`EMIT_DEBOUNCE_MS = 300`, research R1) and force-flushed on blur/commit/close; discrete controls emit immediately. In YAML mode the same gate provides **no-op suppression** (reformatting / key reordering → no structural delta → no emit). The structural diff MUST be robust to the known normalizations HA applies on the round-trip (key order, scalar type coercion) so a self-echo is never misclassified as an external change.

## 7. `ComparisonPreset` (extended, domain 900)

```ts
type ComparisonMode = "year_over_year" | "month_over_year" | "month_over_month" | "custom";
```

- The editor's `comparison_preset` select offers the four values above.
- `custom` = "resolve windows generically from `time_window`". Domain 900 `getPresetTemplate("custom")` returns the generic shape (`anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`, **no** legacy flags) so `resolveTimeWindows` takes `resolveGeneric`. Backward compatible, opt-in.
- **Preset ↔ custom cleanup** (FR-908-Q): standard→`custom` removes `period_offset` and initializes `time_window` with the defaults above; `custom`→standard removes `time_window` and restores `period_offset: -1`.

## 8. `EditorMode` (v1.2.0: YAML is a first-class input path)

```ts
type EditorMode = "visual" | "yaml";
```

Visual/YAML toggle shown when `window.jsyaml` is present (hidden when absent, unchanged from v1.1.0). **v1.2.0 change**: `setConfig()` **preserves** `_editorMode` (v1.1.0 reset to `"visual"`). In YAML mode, the textarea is a **first-class input path** (FR-908-Y): text updates immediately; parse is debounced (short interval, **safe mode** — no code execution from hostile tags) for fast error feedback; emit is debounced (longer interval) for preview with no-op suppression (structural diff). The textarea is re-serialized only on mode switch or external config change, never by a self-echo. On blur / mode switch / close the pending parse/emit flushes **atomically and in order** (parse first, then emit if valid; a failed parse keeps the last valid `_config` and emits nothing). Switching YAML→Visual parses, normalizes, and emits (if changed). **Note**: a YAML parse **replaces** `_config` wholesale (it is not a preservative merge — the parsed YAML *is* the config); the preservative merge applies to *visual field edits*.

## 9. Translation keys (`editor.*`)

New keys for the added sections/fields/options, added to **all four** dictionaries (`en`, `pl`, `de`, `fr`) — see [contracts/editor-i18n.md](./contracts/editor-i18n.md). Consumed via the card's `localize()`; label language follows the FR-908-X chain.

## 10. State transitions

| Trigger | `_config` | `EditorUiState` | Emit? |
|---|---|---|---|
| `setConfig(incoming)` | `normalizeForLoad(incoming)` | **re-applied** (expanded/focus/scroll preserved) | **No** (FR-908-N) |
| Discrete control change (select/switch/slider/color/entity/icon) | `preservativeMerge` | unchanged | **Immediate** |
| Text/number keystroke | `preservativeMerge` (display immediate) | `lastFocusedField`/`lastCaret` updated | **Debounced** (300 ms) |
| Text/number blur / commit / close | — | — | **Flush** pending |
| Section expand/collapse | unchanged | `expanded[section]` toggled | No |
| Preset standard→custom | remove `period_offset`; init `time_window` defaults | `expanded` preserved | Immediate |
| Preset custom→standard | remove `time_window`; restore `period_offset: -1` | `expanded` preserved | Immediate |
| YAML→Visual switch | parse + `normalizeForLoad` | re-applied | Immediate (if changed) |
| YAML textarea keystroke | `_config = parsedConfig` (full replacement, if parse succeeds; safe mode) | unchanged | **Debounced** (long interval; no-op suppressed) |
| `setConfig` in YAML mode — self-echo (config == lastEmitted) | `normalizeForLoad` | re-applied | **No** (FR-908-N); textarea NOT re-serialized |
| `setConfig` in YAML mode — external (config ≠ lastEmitted) | `normalizeForLoad` | re-applied | **No** (FR-908-N); textarea re-serialized (caret best-effort) |
