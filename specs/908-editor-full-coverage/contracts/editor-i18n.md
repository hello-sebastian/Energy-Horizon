# Contract: Editor i18n (`editor.*`)

All section titles, field labels, and select-option labels are sourced from the card's `localize()` under the `editor.*` namespace (FR-908-U, domain 905). HA's internal `hass.localize` pipeline is **not** used for editor labels. New keys MUST be added to **all four** shipped dictionaries: `en`, `pl`, `de`, `fr` (SC-908-7 — no missing-key fallback to the raw key).

## Label language resolution (FR-908-X)

The language used for editor labels follows this chain, recomputed from the **current** `_config` on each render (so a live `language` edit re-labels the whole form):

1. Card config `language` field, if set → use it (forces that language for both card and editor labels).
2. Else `hass.locale.language` (HA profile language).
3. Else the card's existing fallback (unchanged from v1.1.0).

## Existing keys (v1.1.0, unchanged)

`editor.entity`, `editor.title`, `editor.comparison_preset`, `editor.year_over_year`, `editor.month_over_year`, `editor.month_over_month`, `editor.force_prefix`, `editor.visual_mode`, `editor.yaml_mode`, `editor.yaml_error`, `editor.show_comparison_summary`, `editor.show_forecast_total_panel`, `editor.show_narrative_comment`, `editor.interpretation`, `editor.interpretation_consumption`, `editor.interpretation_production`.

## New keys added by v1.2.0

### Section titles (7)

| Key | en |
|---|---|
| `editor.section.general` | General |
| `editor.section.time` | Time windows |
| `editor.section.panels` | Panels |
| `editor.section.formatting` | Formatting & Localization |
| `editor.section.chart` | Chart settings |
| `editor.section.style` | Style |
| `editor.section.diagnostics` | Diagnostics |

### Subsection titles (5)

Non-collapsible headers emitted within a section (see [field-registry.md](./field-registry.md) render-loop step 7).

| Key | en |
|---|---|
| `editor.subsection.custom_settings` | Custom settings |
| `editor.subsection.unit` | Unit |
| `editor.subsection.dates` | Dates |
| `editor.subsection.current_series` | Current series |
| `editor.subsection.reference_series` | Reference series |

### New field labels

| Key | en |
|---|---|
| `editor.show_title` | Show title |
| `editor.icon` | Icon |
| `editor.show_icon` | Show icon |
| `editor.neutral_threshold` | Neutral threshold (%) |
| `editor.aggregation` | Aggregation |
| `editor.show_chart` | Show chart |
| `editor.time_window` | Custom time window |
| `editor.time_window.anchor` | Anchor |
| `editor.time_window.duration` | Duration (ISO 8601) |
| `editor.time_window.step` | Step (ISO 8601) |
| `editor.time_window.count` | Window count |
| `editor.time_window.offset` | Offset (ISO 8601) |
| `editor.show_forecast` | Show forecast on chart |
| `editor.primary_color` | Color |
| `editor.fill_current` | Fill series |
| `editor.fill_current_opacity` | Fill opacity |
| `editor.fill_reference` | Reference series |
| `editor.fill_reference_opacity` | Reference opacity |
| `editor.connect_nulls` | Connect nulls |
| `editor.show_legend` | Show legend |
| `editor.precision` | Precision (decimals) |
| `editor.number_format` | Number format |
| `editor.language` | Language |
| `editor.language.auto` | Auto (HA profile) |
| `editor.language.en` | English |
| `editor.language.pl` | Polski |
| `editor.language.de` | Deutsch |
| `editor.language.fr` | Français |
| `editor.x_axis_format` | X-axis format (Luxon) |
| `editor.tooltip_format` | Tooltip format (Luxon) |
| `editor.debug` | Debug |

### New option labels

| Key | en |
|---|---|
| `editor.custom` | Custom |
| `editor.aggregation.auto` | Auto (adaptive) |
| `editor.aggregation.hour` | Hour |
| `editor.aggregation.day` | Day |
| `editor.aggregation.week` | Week |
| `editor.aggregation.month` | Month |
| `editor.number_format.system` | System |
| `editor.number_format.comma` | Comma |
| `editor.number_format.decimal` | Decimal |
| `editor.number_format.language` | Language |
| `editor.force_prefix.auto` | Auto |
| `editor.force_prefix.none` | None (raw) |
| `editor.force_prefix.G` | G (Giga) |
| `editor.force_prefix.M` | M (Mega) |
| `editor.force_prefix.k` | k (Kilo) |
| `editor.force_prefix.m` | m (milli) |
| `editor.force_prefix.µ` | µ (micro) |
| `editor.anchor.start_of_year` | Start of year |
| `editor.anchor.start_of_month` | Start of month |
| `editor.anchor.start_of_week` | Start of week |
| `editor.anchor.start_of_day` | Start of day |
| `editor.anchor.start_of_hour` | Start of hour |
| `editor.anchor.now` | Now |

## Rules

- Every `labelKey` in the `FieldRegistry` and every select `option.labelKey` MUST resolve in all four dictionaries (SC-908-7).
- `pl`, `de`, `fr` values are authored by the translators; `en` is the reference. The key **set** is identical across all four files.
- The `force_prefix` empty option (`` value ``) uses an empty label (adaptive) — mirrors v1.1.0.
- No new keys are introduced for error copy (the card reuses its existing standard error strings; FR-908-S).
