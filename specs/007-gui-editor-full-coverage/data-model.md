# Data Model: 007-gui-editor-full-coverage

**Branch**: `007-gui-editor-full-coverage` | **Date**: 2026-09-30

---

## Entities

### 1. `CardConfig` *(existing — `src/card/types.ts`)*

No new fields. All 27 user-configurable fields (29 `CardConfig` keys − constant `type` − `forecast` alias) are now editor-controlled. The table below lists all 27; the editor reads and writes this type unchanged.

| Field | Type | Card default (effective) | Editor control |
|---|---|---|---|
| `entity` | `string` | required | entity selector (`sensor` domain) — existing |
| `title` | `string?` | entity `friendly_name` | text — existing |
| `show_title` | `boolean?` | `true` (`!== false`) | boolean |
| `icon` | `string?` | from entity | select (list) — `""` = entity icon (auto) |
| `show_icon` | `boolean?` | `true` (`!== false`) | boolean |
| `comparison_preset` | `ComparisonMode` | `year_over_year` | select — existing |
| `aggregation` | `WindowAggregation?` | auto (`pickAutoAggregation`) | select (list) (`auto` → `undefined`) |
| `period_offset` | `number?` | `-1` | number |
| `time_window` | `TimeWindowYaml?` | preset template | nested section (6 fields) |
| `show_forecast` | `boolean?` | `true` (`!== false`) | boolean |
| `precision` | `number?` | `2` | number (0–6) |
| `debug` | `boolean?` | `false` | boolean |
| `language` | `string?` | HA language | select (`auto` → `undefined`) |
| `number_format` | `NumberFormat?` | HA/system | select (list) |
| `fill_current` | `boolean?` | `true` | boolean |
| `fill_reference` | `boolean?` | `false` | boolean |
| `fill_current_opacity` | `number?` | `30` (`clampOpacity`) | number (0–100) |
| `fill_reference_opacity` | `number?` | `30` (`clampOpacity`) | number (0–100) |
| `primary_color` | `string?` | `#119894` (`--eh-series-current`) | text |
| `connect_nulls` | `boolean?` | `true` | boolean |
| `show_legend` | `boolean?` | `false` | boolean |
| `show_comparison_summary` | `boolean?` | `true` (`!== false`) | boolean — existing |
| `show_forecast_total_panel` | `boolean?` | `true` (`!== false`) | boolean — existing |
| `show_narrative_comment` | `boolean?` | `true` (`!== false`) | boolean — existing |
| `x_axis_format` | `string?` | adaptive | text + inline validation |
| `tooltip_format` | `string?` | adaptive | text + inline validation |
| `force_prefix` | `ForcePrefix?` | `auto` | select (list) — existing |

**Not editor-controlled**: `type` (constant `custom:energy-horizon-card`), `forecast` (alias merged into `show_forecast` during `setConfig` normalization).

---

### 2. `EditorSection` *(new — `src/card/energy-horizon-card-editor.ts`)*

A data-driven descriptor of one form section:

```ts
interface EditorSection {
  id: string;                          // e.g. "time_window"
  labelKey: string;                    // e.g. "editor.section.time_window"
  advanced: boolean;                   // true → wrapped in ha-expansion-panel, collapsed by default
  schema: ReadonlyArray<HaFormSchema>; // fields of this section
  toForm(config: CardConfig): Record<string, unknown>;   // config → flat form data (with defaults)
  fromForm(data: Record<string, unknown>): Partial<CardConfig>; // form data → config patch
}
```

**Sections (8)**:

| id | advanced | Fields |
|---|---|---|
| `comparison` | no | `entity`, `title`, `comparison_preset`, `force_prefix`, `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment` (existing 7) |
| `header` | no (always visible) | `show_title`, `icon`, `show_icon` |
| `forecast` | no (always visible) | `show_forecast` |
| `time_window` | yes | `aggregation`, `period_offset`, `time_window_anchor`, `time_window_offset`, `time_window_duration`, `time_window_step`, `time_window_count`, `time_window_aggregation` |
| `chart_style` | yes | `fill_current`, `fill_reference`, `fill_current_opacity`, `fill_reference_opacity`, `primary_color`, `connect_nulls`, `show_legend` |
| `localization` | yes | `language`, `number_format`, `precision` |
| `date_formats` | yes | `x_axis_format`, `tooltip_format` |
| `diagnostics` | yes | `debug` |

**Mapping rules** (pure, unit-tested):
- `toForm`: applies card defaults for unset fields (R-008); `aggregation`/`language` `undefined` → `"auto"`; `icon` `undefined` → `""` (entity icon auto); `time_window` unset → values from `getPresetTemplate(comparison_preset, period_offset)`.
- `fromForm`: `"auto"` → `undefined` (key omitted); `icon` `""` → `undefined` (key omitted); empty `time_window_*` → omitted from `time_window` object; untouched `time_window` sub-fields → `time_window` key omitted entirely (preset applies).
- Unknown values in select fields (typo in YAML) → form shows `auto`/empty; the **raw value is preserved in `_config`** and emitted unchanged (FR-013) — the mapping only affects what the control displays, never what is stored.

---

### 3. `TimeWindowSubForm` *(new — part of the `time_window` section)*

Flat fields mapped to `CardConfig.time_window` (`TimeWindowYaml`):

| Form field | Config path | Selector | Validation |
|---|---|---|---|
| `time_window_anchor` | `time_window.anchor` | select (6 `TimeAnchor` values) | via merged validation |
| `time_window_offset` | `time_window.offset` | text (duration token, e.g. `+9M`) | via merged validation |
| `time_window_duration` | `time_window.duration` | text (duration token, e.g. `1y`) | via merged validation |
| `time_window_step` | `time_window.step` | text (duration token) | via merged validation |
| `time_window_count` | `time_window.count` | number (1–24) | via merged validation |
| `time_window_aggregation` | `time_window.aggregation` | select (`auto`/hour/day/week/month) | precedence: `time_window.aggregation` > top-level `aggregation` > auto-pick |

**Validation**: after any change in this section, the editor builds `buildMergedTimeWindowConfig(config)` and runs `validateMergedTimeWindowConfig(merged)` (card functions, R-004). On failure: inline error under the section (localized `status.*` key / message); `config-changed` still emitted (FR-014).

---

### 4. `EnergyHorizonCardEditor` *(extended — `src/card/energy-horizon-card-editor.ts`)*

```ts
class EnergyHorizonCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  private _config?: CardConfig;                 // full config (005, unchanged)
  @state() private _editorMode: EditorMode;     // "visual" | "yaml" (005, unchanged)
  @state() private _yamlText = "";              // 005, unchanged
  @state() private _yamlError: string | null;   // 005, unchanged
  @state() private _openSections: Set<string>;  // NEW: advanced section ids currently expanded (not persisted)
  @state() private _fieldErrors: Record<string, string | null>; // NEW: inline validation errors per field/section

  setConfig(config: CardConfigInput): void;     // 005 behavior + reset _openSections/_fieldErrors
  protected render(): TemplateResult;           // toggle row + sections (forms / expansion panels) / yaml textarea
  // 005 handlers unchanged: _handleValueChanged, _switchToYaml, _switchToVisual, _handleYamlInput,
  // _emitConfigChanged, _computeLabel, _hasYamlSupport, _editorLang
}
```

**State transitions** (new):
```
setConfig() ──► _openSections = ∅, _fieldErrors = ∅   (advanced sections collapsed)
user toggles section ──► _openSections ± id           (local only, not persisted)
field change ──► merge into _config ──► re-validate affected fields ──► emit config-changed (always)
```

---

### 5. `HaFormSchema` *(extended — `src/ha-types.ts`)*

005 union (entity, text, select, boolean) plus:

```ts
| { name: string; selector: { number: { min?: number; max?: number; step?: number; mode?: "box" | "slider" } }; required?: boolean }
| { name: string; selector: { color: { markup?: boolean } }; required?: boolean }
| { name: string; selector: { icon: { placeholder?: string } }; required?: boolean }
```

The `select` variant is extended with `mode?: "list" | "dropdown"` (FR-022) so `ha-selector-select` renders a dropdown instead of radio buttons.

---

### 6. `SUPPORTED_LANGUAGES` *(new — `src/card/localize.ts`)*

```ts
export const SUPPORTED_LANGUAGES: readonly string[]; // keys of loaded dictionaries: ["en","pl","de","fr"]
```

Derived from the existing `DICTIONARIES` (built via `import.meta.glob`). Consumed by the editor's `language` select options (R-007).

---

### 7. Translation Keys *(new — `src/translations/{en,pl,de,fr}.json`)*

The `editor.*` namespace **exists since 005** (base keys in en/pl/de; missing from fr — a 005 drift). This feature **extends** it (R-009): the keys below are added to all four dictionaries, which also closes the fr gap. Complete set:

| Group | Keys |
|---|---|
| Field labels | `editor.show_title`, `editor.icon`, `editor.show_icon`, `editor.aggregation`, `editor.period_offset`, `editor.show_forecast`, `editor.fill_current`, `editor.fill_reference`, `editor.fill_current_opacity`, `editor.fill_reference_opacity`, `editor.primary_color`, `editor.connect_nulls`, `editor.show_legend`, `editor.language`, `editor.number_format`, `editor.precision`, `editor.x_axis_format`, `editor.tooltip_format`, `editor.debug`, `editor.time_window_anchor`, `editor.time_window_offset`, `editor.time_window_duration`, `editor.time_window_step`, `editor.time_window_count`, `editor.time_window_aggregation` |
| Section titles (8 — all sections render a visible title, FR-023) | `editor.section.comparison`, `editor.section.header`, `editor.section.time_window`, `editor.section.forecast`, `editor.section.chart_style`, `editor.section.localization`, `editor.section.date_formats`, `editor.section.diagnostics` |
| Options | `editor.aggregation.{auto,hour,day,week,month}`, `editor.number_format.{comma,decimal,language,system}`, `editor.language.{auto,en,pl,de,fr}`, `editor.anchor.{start_of_year,start_of_month,start_of_week,start_of_day,start_of_hour,now}`, `editor.comparison_preset.{year_over_year,month_over_year,month_over_month}`, `editor.force_prefix.{auto,none,G,M,k,m,u}`, `editor.icon.entity` |
| Errors | `editor.error.time_window`, `editor.error.format` |

Missing key in a language → `createLocalize` falls back to English (existing behavior); raw keys never rendered (SC-003).

---

## File-to-Entity Mapping

| File | Entity / Change |
|------|-----------------|
| `src/card/energy-horizon-card-editor.ts` | **MOD** — `EditorSection` model, 8 sections, `TimeWindowSubForm` mapping, `_openSections`, `_fieldErrors`, validation wiring, accordion render |
| `src/ha-types.ts` | **MOD** — `HaFormSchema` + number/color/icon variants |
| `src/card/localize.ts` | **MOD** — export `SUPPORTED_LANGUAGES` |
| `src/translations/{en,pl,de,fr}.json` | **MOD** — new `editor.*` keys |
| `src/card/types.ts` | NO CHANGE |
| `src/card/time-windows/*`, `src/card/axis/*` | NO CHANGE (imported for validation) |
| `Test/tests/unit/editor-mapping.test.ts` | **NEW** — unit tests for mapping/validation helpers |
| `README.md` | **MOD** — new "Visual editor" section |
| `README.advanced.md` | **MOD** — full editor table |
| `wiki-publish/Configuration-and-Customization.md` | **MOD** — "Visual editor coverage" subsection |
| `wiki-publish/Documentation-Maintenance.md` | **MOD** — Spec anchors + drift-check |
