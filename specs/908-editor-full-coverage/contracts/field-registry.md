# Contract: Field Registry Schema

The `FieldRegistry` is the single source of truth for what the editor renders and where. This contract defines the descriptor schema, the render-loop contract, and the full v1.2.0 field inventory. See [data-model.md](../data-model.md) §2–§4 for the types.

## Descriptor schema

```ts
interface FieldDescriptor {
  key: string;                          // YAML path ("fill_current_opacity" | "time_window.count") or a UX-only dummy key
  section: SectionId;                   // "general"|"time"|"panels"|"formatting"|"chart"|"style"|"diagnostics"
  control: ControlSpec;                 // declarative spec or { kind: "custom", render }
  labelKey: string;                     // "editor.<name>"
  default?: unknown;
  required?: boolean;                   // true only for `entity`
  visibleWhen?: (cfg: CardConfig) => boolean;
  disabledWhen?: (cfg: CardConfig) => boolean;
  emit?: "debounced" | "immediate";     // default derived from control kind
  inlineWith?: string;                  // same-row pairing (FR-908-Z)
  subsection?: string;                  // i18n key for a non-collapsible subsection header
  dummy?: boolean;                      // UX-only: always ON + disabled, never written to config
}
```

## Render-loop contract

The render loop MUST:
1. Iterate sections in the fixed order `general → time → panels → formatting → chart → style → diagnostics`.
2. For each section, group descriptors by `section`, filter by `visibleWhen(cfg)`, and apply `disabledWhen(cfg)`.
3. Render each visible control from its declarative `control` metadata, or invoke the `custom` renderer (which MUST read/write through the same merge + event pipeline).
4. Bind each control's value from `_config` (resolved by `key` path) and its label from `localize(labelKey)`.
5. On a control change, route through `preservativeMerge` → emit gate (debounced/immediate per `emit`). A `dummy` field has no change handler and `_applyFieldChange` returns early for it, so it is never written to the config.
6. Group fields into rows: a field with `inlineWith` renders in the same horizontal row as the field it references (to its right), not as its own row (FR-908-Z). The primary field takes the available width; the inline field is compact.
7. Emit subsection headers: in a single pass over the section's visible fields, track the current `subsection` value; when it changes to a defined value, emit a non-collapsible subsection header (`localize(subsection)`) before the field. A subsection with no visible fields emits no header.

**Consequences** (FR-908-A/B, SC-908-8):
- **Adding a field** = adding one descriptor. No template change.
- **Moving a field** = changing its `section`. No template change.
- **Relocating/adding** never requires editing the Lit render template.

## Emit policy by control kind (default)

| Control kind | `emit` | Reason |
|---|---|---|
| `text`, `number` | `debounced` (300 ms; flush on blur/commit/close) | rapid typing must not fire a full re-query per keystroke (FR-908-O) |
| `select`, `boolean`, `slider`, `color`, `entity`, `icon` | `immediate` | discrete values; live preview within 500 ms (SC-908-4) |

A descriptor may override `emit` explicitly.

## Full v1.2.0 field inventory (FR-908-D coverage)

32 config-backed fields + 1 UX-only dummy (`show_chart`).

| key | section | subsection | control | default | required | visibleWhen | notes |
|---|---|---|---|---|---|---|---|
| `entity` | general | — | entity(sensor) | `""` | **yes** | — | — |
| `show_title` | general | — | boolean | `true` | no | — | inline with `title` |
| `title` | general | — | text | — | no | — | — |
| `show_icon` | general | — | boolean | `true` | no | — | inline with `icon` |
| `icon` | general | — | icon | — | no | — | — |
| `interpretation` | general | — | select(2) | `consumption` | no | — | inline with `neutral_interpretation` |
| `neutral_interpretation` | general | — | number | `2` | no | — | — |
| `aggregation` | general | — | select(5) | `auto` (⇒ omitted in config) | no | — | — |
| `comparison_preset` | time | — | select(4) | `year_over_year` | no | — | — |
| `time_window.anchor` | time | Custom settings | select(6) | `start_of_year` | no | preset = `custom` | — |
| `time_window.duration` | time | Custom settings | text | `1y` | no | preset = `custom` | — |
| `time_window.step` | time | Custom settings | text | `1y` | no | preset = `custom` | — |
| `time_window.count` | time | Custom settings | number | `2` | no | preset = `custom` | — |
| `time_window.offset` | time | Custom settings | text | — | no | preset = `custom` | — |
| `show_comparison_summary` | panels | — | boolean | `true` | no | — | — |
| `show_chart` | panels | — | boolean | `true` | no | — | **dummy** (always ON + disabled) |
| `show_forecast_total_panel` | panels | — | boolean | `true` | no | — | — |
| `show_narrative_comment` | panels | — | boolean | `true` | no | — | — |
| `language` | formatting | — | select(5) | — (auto) | no | — | — |
| `force_prefix` | formatting | Unit | select(8) | `auto` | no | — | — |
| `number_format` | formatting | Unit | select(4) | `system` | no | — | — |
| `precision` | formatting | Unit | number | `2` | no | — | — |
| `x_axis_format` | formatting | Dates | text | — | no | — | — |
| `tooltip_format` | formatting | Dates | text | — | no | — | — |
| `show_forecast` | chart | — | boolean | `true` | no | — | — |
| `connect_nulls` | chart | — | boolean | `true` | no | — | — |
| `show_legend` | chart | — | boolean | `false` | no | — | — |
| `primary_color` | style | Current series | color | — | no | — | — |
| `fill_current` | style | Current series | boolean | `true` | no | — | — |
| `fill_current_opacity` | style | Current series | slider(0–100) | `30` | no | — | — |
| `fill_reference` | style | Reference series | boolean | `false` | no | — | — |
| `fill_reference_opacity` | style | Reference series | slider(0–100) | `30` | no | — | — |
| `debug` | diagnostics | — | boolean | `false` | no | — | — |

**Excluded from the registry** (not standalone fields):
- `type` — fixed, never editable.
- `comparison_mode` — deprecated; normalized to `comparison_preset` (FR-908-I).
- `forecast` — legacy alias; normalized to `show_forecast` (FR-908-V).
- `period_offset` — YAML-only legacy value; managed at the config level by the preset switch (standard→`custom` removes it; `custom`→standard restores `period_offset: -1`) but never rendered as a control.

**Coverage check**: every user-configurable v1.1.0 YAML parameter appears exactly once (SC-908-1), except `period_offset`, which is intentionally YAML-only. Defaults match the v1.1.0 card (spec Assumptions).
