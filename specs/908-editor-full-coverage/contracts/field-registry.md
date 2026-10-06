# Contract: Field Registry Schema

The `FieldRegistry` is the single source of truth for what the editor renders and where. This contract defines the descriptor schema, the render-loop contract, and the full v1.2.0 field inventory. See [data-model.md](../data-model.md) §2–§4 for the types.

## Descriptor schema

```ts
interface FieldDescriptor {
  key: string;                          // YAML path ("fill_current_opacity" | "time_window.count")
  section: SectionId;                   // "basic"|"time"|"layout"|"visuals"|"formatting"|"system"
  control: ControlSpec;                 // declarative spec or { kind: "custom", render }
  labelKey: string;                     // "editor.<name>"
  default?: unknown;
  required?: boolean;                   // true only for `entity`
  visibleWhen?: (cfg: CardConfig) => boolean;
  disabledWhen?: (cfg: CardConfig) => boolean;
  emit?: "debounced" | "immediate";     // default derived from control kind
}
```

## Render-loop contract

The render loop MUST:
1. Iterate sections in the fixed order `basic → time → layout → visuals → formatting → system`.
2. For each section, group descriptors by `section`, filter by `visibleWhen(cfg)`, and apply `disabledWhen(cfg)`.
3. Render each visible control from its declarative `control` metadata, or invoke the `custom` renderer (which MUST read/write through the same merge + event pipeline).
4. Bind each control's value from `_config` (resolved by `key` path) and its label from `localize(labelKey)`.
5. On a control change, route through `preservativeMerge` → emit gate (debounced/immediate per `emit`).

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

| key | section | control | default | required | visibleWhen | disabledWhen |
|---|---|---|---|---|---|---|
| `entity` | basic | entity(sensor) | `""` | **yes** | — | — |
| `title` | basic | text | — | no | — | — |
| `show_title` | basic | boolean | `true` | no | — | — |
| `icon` | basic | icon | — | no | — | — |
| `show_icon` | basic | boolean | `true` | no | — | — |
| `comparison_preset` | basic | select(4) | `year_over_year` | no | — | — |
| `interpretation` | basic | select(2) | `consumption` | no | — | — |
| `neutral_interpretation` | basic | number | `2` | no | — | — |
| `aggregation` | time | select(5) | `auto` (⇒ omitted in config) | no | — | — |
| `period_offset` | time | number | `-1` | no | preset ≠ `custom` | — |
| `time_window.anchor` | time | select(6) | `start_of_year` | no | preset = `custom` | — |
| `time_window.duration` | time | text | `1y` | no | preset = `custom` | — |
| `time_window.step` | time | text | `1y` | no | preset = `custom` | — |
| `time_window.count` | time | number | `2` | no | preset = `custom` | — |
| `time_window.offset` | time | text | — | no | preset = `custom` | — |
| `show_comparison_summary` | layout | boolean | `true` | no | — | — |
| `show_forecast` | layout | boolean | `true` | no | — | — |
| `show_forecast_total_panel` | layout | boolean | `true` | no | — | `show_forecast === false` |
| `show_narrative_comment` | layout | boolean | `true` | no | — | — |
| `primary_color` | visuals | color | — | no | — | — |
| `fill_current` | visuals | boolean | `true` | no | — | — |
| `fill_current_opacity` | visuals | slider(0–100) | `30` | no | — | — |
| `fill_reference` | visuals | boolean | `false` | no | — | — |
| `fill_reference_opacity` | visuals | slider(0–100) | `30` | no | — | — |
| `connect_nulls` | visuals | boolean | `true` | no | — | — |
| `show_legend` | visuals | boolean | `false` | no | — | — |
| `precision` | formatting | number | `2` | no | — | — |
| `force_prefix` | formatting | select(8) | `auto` | no | — | — |
| `number_format` | formatting | select(4) | `system` | no | — | — |
| `language` | formatting | text | — | no | — | — |
| `x_axis_format` | formatting | text | — | no | — | — |
| `tooltip_format` | formatting | text | — | no | — | — |
| `debug` | system | boolean | `false` | no | — | — |

**Excluded from the registry** (not standalone fields):
- `type` — fixed, never editable.
- `comparison_mode` — deprecated; normalized to `comparison_preset` (FR-908-I).
- `forecast` — legacy alias; normalized to `show_forecast` (FR-908-V).

**Coverage check**: every user-configurable v1.1.0 YAML parameter appears exactly once (SC-908-1). Defaults match the v1.1.0 card (spec Assumptions).
