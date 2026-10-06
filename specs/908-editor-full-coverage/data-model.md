# Data Model: Full-Coverage Visual Editor (v1.2.0)

Entities and validation rules for the v1.2.0 editor. The editor is the UI *for* the YAML — it reads the full `CardConfig`, mutates it via a preservative deep merge, and emits it back. The new entities below are **editor-internal**; the only cross-domain type change is `ComparisonMode += "custom"` (domain 900).

---

## 1. `SectionId`

```ts
type SectionId =
  | "basic"        // S1 — always expanded
  | "time"         // S2 Time & Aggregation
  | "layout"       // S3 Layout & Visibility
  | "visuals"      // S4 Visuals & Chart Styling
  | "formatting"   // S5 Formatting & Axis
  | "system";      // S6 System & Debug
```

Fixed order: `basic → time → layout → visuals → formatting → system` (FR-908-E). The render loop iterates in this order; the order is a constant, not data.

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
  disabledWhen?: (cfg: CardConfig) => boolean;  // e.g. !show_forecast (FR-908-H)
  /** Emit policy: "debounced" (text/number) or "immediate" (discrete). Default by control kind. */
  emit?: "debounced" | "immediate";
}
```

**Validation rules**:
- `key` MUST be a valid YAML path of a v1.1.0 `CardConfig` field (or a `time_window.*` sub-field). The fixed `type` key is NOT a field.
- `required` is `true` only for `entity`; all others optional (FR-908-R).
- `visibleWhen`/`disabledWhen` are pure predicates over `CardConfig` (no side effects, no I/O).
- `labelKey` MUST exist in all four shipped dictionaries (SC-908-7).

## 4. `FieldRegistry`

```ts
type FieldRegistry = readonly FieldDescriptor[];   // grouped by `section` at render time
```

The single source of truth for what the editor renders and where. The render loop groups descriptors by `section`, filters by `visibleWhen`, applies `disabledWhen`, and renders each control. **Adding a field = adding a descriptor; moving a field = changing `section`** (FR-908-A/B, SC-908-8).

### Field → Section map (FR-908-D coverage, FR-908-F membership)

| Section | Fields (YAML key → control) |
|---|---|
| **S1 Basic** (expanded) | `entity`→entity(sensor, required) · `title`→text · `show_title`→boolean · `icon`→icon · `show_icon`→boolean · `comparison_preset`→select(4) · `interpretation`→select(2) · `neutral_interpretation`→number |
| **S2 Time & Aggregation** | `aggregation`→select(5) · `period_offset`→number (visibleWhen: preset≠custom) · `time_window.anchor`→select(6) · `time_window.duration`→text · `time_window.step`→text · `time_window.count`→number · `time_window.offset`→text (all `time_window.*` visibleWhen: preset=custom) |
| **S3 Layout & Visibility** | `show_comparison_summary`→boolean · `show_forecast`→boolean · `show_forecast_total_panel`→boolean (disabledWhen: !show_forecast) · `show_narrative_comment`→boolean |
| **S4 Visuals** | `primary_color`→color · `fill_current`→boolean · `fill_current_opacity`→slider(0–100) · `fill_reference`→boolean · `fill_reference_opacity`→slider(0–100) · `connect_nulls`→boolean · `show_legend`→boolean |
| **S5 Formatting & Axis** | `precision`→number · `force_prefix`→select(8) · `number_format`→select(4) · `language`→text · `x_axis_format`→text · `tooltip_format`→text |
| **S6 System & Debug** | `debug`→boolean |

**Select option sets** (values are the YAML values; labels are `editor.*` keys):
- `comparison_preset`: `year_over_year`, `month_over_year`, `month_over_month`, **`custom`** (v1.2.0 adds `custom`).
- `aggregation`: `auto`, `hour`, `day`, `week`, `month` (`auto` = adaptive, the documented default). **Note**: the `WindowAggregation` type is `"day"|"week"|"month"|"hour"` (no `"auto"`); the `auto` option maps to an **omitted/undefined** `aggregation` in the config, never a literal `"auto"` string.
- `interpretation`: `consumption`, `production`.
- `force_prefix`: `auto`, `none`, `G`, `M`, `k`, `m`, `µ`, `` (empty = adaptive) — mirrors the v1.1.0 editor options.
- `number_format`: `system`, `comma`, `decimal`, `language`.
- `time_window.anchor`: `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`.

**NOT fields** (handled by normalization, FR-908-I/V): deprecated `comparison_mode`, legacy `forecast` alias. **Fixed** (never editable): `type`.

## 5. `EditorUiState` (config-independent presentation state)

```ts
interface EditorUiState {
  expanded: Record<SectionId, boolean>;   // S1 default true; S2–S6 default false
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
   user edits a field ─▶ preservativeMerge(_config, changes) ─▶ _config
                                                              │
                 delta vs lastEmitted? ─yes─▶ debounce/flush ─▶ dispatch config-changed
                 (re-render path: NO emit)
```

- **`normalizeForLoad`** (FR-908-I/V): pre-fill `comparison_preset` from `comparison_mode` when empty; resolve `show_forecast` as `config.show_forecast ?? config.forecast ?? true` for display. Pure.
- **`preservativeMerge(base, changes)`** (FR-908-P): field-path aware. Top-level scalars set; `time_window` merged key-by-key; **every** unmodeled key (deprecated/unknown/future) copied through. Pure. No key in `base` is dropped.
- **`normalizeForSave(config)`** (FR-908-I/V): emit `comparison_preset` (replace `comparison_mode`), emit `show_forecast` (drop `forecast` alias). Pure.
- **Emit gate** (FR-908-N): dispatch only when the would-be config differs (field-path deep compare) from the last-emitted config. Text/number emits are debounced (`EMIT_DEBOUNCE_MS = 300`, research R1) and force-flushed on blur/commit/close; discrete controls emit immediately.

## 7. `ComparisonPreset` (extended, domain 900)

```ts
type ComparisonMode = "year_over_year" | "month_over_year" | "month_over_month" | "custom";
```

- The editor's `comparison_preset` select offers the four values above.
- `custom` = "resolve windows generically from `time_window`". Domain 900 `getPresetTemplate("custom")` returns the generic shape (`anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`, **no** legacy flags) so `resolveTimeWindows` takes `resolveGeneric`. Backward compatible, opt-in.
- **Preset ↔ custom cleanup** (FR-908-Q): standard→`custom` removes `period_offset` and initializes `time_window` with the defaults above; `custom`→standard removes `time_window` and restores `period_offset: -1`.

## 8. `EditorMode` (unchanged)

```ts
type EditorMode = "visual" | "yaml";
```

Visual/YAML toggle and `window.jsyaml` behavior unchanged from v1.1.0 (toggle hidden when `jsyaml` absent). Switching YAML→Visual parses, normalizes, and emits; the preservative merge preserves all keys.

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
