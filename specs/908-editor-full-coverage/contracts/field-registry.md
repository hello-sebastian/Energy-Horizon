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
  column?: number;                      // 1-based column in a two-column section grid (Style)
}
```

## Section icons

`SECTION_ICONS` is a `Record<SectionId, string>` of MDI icon ids rendered in each section header (decorative; the accessible name of the section is its localized title):

| Section | Icon |
|---|---|
| `general` | `mdi:application-cog-outline` |
| `time` | `mdi:chart-gantt` |
| `panels` | `mdi:view-day-outline` |
| `formatting` | `mdi:counter` |
| `chart` | `mdi:chart-timeline-variant-shimmer` |
| `style` | `mdi:palette-outline` |
| `diagnostics` | `mdi:bug-outline` |

## Section documentation links

`SECTION_DOCS_URLS` is a `Record<SectionId, string>` of wiki URLs rendered as a documentation link in each section header (FR-908-AA). The link is a `mdi:help-circle-outline` icon with:

- `href` = `SECTION_DOCS_URLS[section]` (the wiki chapter covering the section's keys);
- `target="_blank"` and `rel="noopener noreferrer"` (opens in a new tab);
- `aria-label` / `title` = `localize("editor.docs_link")` (the localized accessible name);
- a `stopPropagation()` click handler — the section header is the toggle target, so the link MUST NOT collapse/expand the section when clicked.

It is rendered in the `ha-expansion-panel` `icons` slot (wrapped in a `.section-header-actions` container) or, in the fallback path, inside the `.section-header` after the section title.

| Section | Wiki chapter |
|---|---|
| `general` | `Configuration-and-Customization#core-configuration` |
| `time` | `Time-Window-Reference` |
| `panels` | `Configuration-and-Customization#layout-sections-figma-aligned` |
| `formatting` | `Configuration-and-Customization#localization-and-number-formatting` |
| `chart` | `Configuration-and-Customization#forecast` |
| `style` | `Configuration-and-Customization#chart-styling-fills-colors-gaps` |
| `diagnostics` | `Configuration-and-Customization#debug` |

## Render-loop contract

The render loop MUST:
1. Iterate sections in the fixed order `general → time → panels → formatting → chart → style → diagnostics`.
2. For each section, group descriptors by `section`, filter by `visibleWhen(cfg)`, and apply `disabledWhen(cfg)`. The section header renders the icon from `SECTION_ICONS[section]` — via the `ha-expansion-panel` `leading-icon` slot, or as a `.section-icon` element inside the fallback `.section-header` — and the documentation link from `SECTION_DOCS_URLS[section]` (FR-908-AA) — via the `ha-expansion-panel` `icons` slot, or inside the fallback `.section-header`.
3. Render each visible control from its declarative `control` metadata, or invoke the `custom` renderer (which MUST read/write through the same merge + event pipeline).
4. Bind each control's value from `_config` (resolved by `key` path) and its label from `localize(labelKey)`.
5. On a control change, route through `preservativeMerge` → emit gate (debounced/immediate per `emit`). A `dummy` field has no change handler and `_applyFieldChange` returns early for it, so it is never written to the config.
6. Group fields into rows: a field with `inlineWith` renders in the same horizontal row as the field it references (to its right), not as its own row (FR-908-Z). The primary field takes the available width; the inline field is compact.
7. Emit subsection headers: in a single pass over the section's visible fields, track the current `subsection` value; when it changes to a defined value, emit a non-collapsible subsection header (`localize(subsection)`) before the field. A subsection with no visible fields emits no header.
8. Two-column grid: when any visible field in a section declares `column`, the section body renders as a CSS grid (`.section-columns`, `1fr 1fr`); each field is placed in its declared column, columns are bottom-aligned so same-feature fields share a row, and a subsection header occupies row 1 of its column. Sections without `column` fields render unchanged.

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
| `interpretation` | general | — | select(2) | `consumption` | no | — | inline with `neutral_threshold` |
| `neutral_threshold` | general | — | number (suffix `%`) | `2` | no | — | — |
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
| `language` | formatting | — | select(5) | `auto` (sentinel ⇒ omitted in config) | no | — | Auto is always displayed when the key is absent |
| `force_prefix` | formatting | Unit | select(8) | `auto` | no | — | — |
| `number_format` | formatting | Unit | select(4) | `system` | no | — | — |
| `precision` | formatting | Unit | number | `2` | no | — | — |
| `x_axis_format` | formatting | Dates | text | — | no | — | — |
| `tooltip_format` | formatting | Dates | text | — | no | — | — |
| `show_forecast` | chart | — | boolean | `true` | no | — | — |
| `connect_nulls` | chart | — | boolean | `true` | no | — | — |
| `show_legend` | chart | — | boolean | `false` | no | — | — |
| `primary_color` | style | Current series | color | — | no | — | column 1 |
| `fill_current` | style | Current series | boolean | `true` | no | — | column 1 |
| `fill_current_opacity` | style | Current series | slider(0–100) | `30` | no | — | column 1 |
| `fill_reference` | style | Reference series | boolean | `false` | no | — | column 2 |
| `fill_reference_opacity` | style | Reference series | slider(0–100) | `30` | no | — | column 2 |
| `debug` | diagnostics | — | boolean | `false` | no | — | — |

**Excluded from the registry** (not standalone fields):
- `type` — fixed, never editable.
- `comparison_mode` — deprecated; normalized to `comparison_preset` (FR-908-I).
- `forecast` — legacy alias; normalized to `show_forecast` (FR-908-V).
- `period_offset` — YAML-only legacy value; managed at the config level by the preset switch (standard→`custom` removes it; `custom`→standard restores `period_offset: -1`) but never rendered as a control.

**Coverage check**: every user-configurable v1.1.0 YAML parameter appears exactly once (SC-908-1), except `period_offset`, which is intentionally YAML-only. Defaults match the v1.1.0 card (spec Assumptions).
