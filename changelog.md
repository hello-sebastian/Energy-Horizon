# Changelog

All notable changes to **Energy Horizon Card** (Home Assistant Lovelace — Marketplace / HACS) are documented in this file.

## [Unreleased]

### Added



### Changed



### Fixed



### Documentation

- **Marketplace compatibility (HA 2026.11):** installation docs now cover the built-in **Marketplace** integration (Settings → Marketplace; installs to `www/community/`, dashboard resource added automatically; YAML-managed resources use `/local/community/Energy-Horizon/energy-horizon-card.js`). HACS instructions are kept for HA versions before 2026.11; the old `/hacsfiles/` resource path keeps working.


---

## [1.2.0]

### Added

- **Full-coverage visual editor:** the Lovelace editor now exposes **every** user-configurable parameter, organized into seven sections — **General**, **Time windows**, **Panels**, **Formatting & Localization**, **Chart settings**, **Style**, **Diagnostics** (with subsections such as **Custom settings**, **Unit**, **Dates**, **Current series**, **Reference series**). **General** and **Time windows** are expanded by default. No YAML is required to configure the card.
- **`custom` comparison preset:** `comparison_preset: custom` resolves windows **generically** from the `time_window` block (no preset template, no `period_offset`). In the editor, selecting `custom` shows the `time_window` sub-block (`anchor`, `duration`, `step`, `count`, `offset`) under the **Custom settings** subsection; switching back to a standard preset removes `time_window` and restores `period_offset: -1` in the config. `period_offset` is YAML-only — it is never a control in the visual editor.
- **GUI controls** for `time_window.*`, colors/opacities (`primary_color`, `fill_*`, `fill_*_opacity`), formatting (`precision`, `force_prefix`, `number_format`, `language`), Luxon patterns (`x_axis_format`, `tooltip_format`), forecast (`show_forecast`), and `debug`.
- **`neutral_threshold`** (renamed from `neutral_interpretation`, which remains a deprecated alias) is now GUI-editable (General).
- **Card picker metadata:** the card now declares `preview: true` and a `documentationURL`, so it is offered with a live preview and a documentation link in the HA "Add card" picker.
- **Section pictograms in the visual editor:** each editor section header displays an MDI icon — General (cog), Time windows (Gantt), Panels (day view), Formatting & Localization (counter), Chart settings (timeline), Style (palette), Diagnostics (bug).
- **Per-section documentation links in the visual editor:** each editor section header now shows a documentation icon (help circle) linking to the wiki chapter covering that section's keys. The link opens in a new tab and does not collapse the section when clicked.
- **Field helper texts in the visual editor:** non-obvious fields (time window syntax, Luxon date formats, aggregation, precision, neutral threshold) now show a short helper text below the control.

### Changed

- **Editor lifecycle:** expanded panels, focus/caret, and scroll now persist across HA re-renders (UI state is independent of the config object); text-input emits are **debounced**; passive re-renders emit **no** spurious `config-changed` events.
- **YAML mode is a first-class input path:** edits update the preview live (debounced), the **last valid YAML values** are the saved config (no switch to Visual required), and syntax errors are shown inline. HA re-serializes the config on save, so values persist but text formatting (comments, key order, indentation) is canonicalized.
- **Visual ↔ YAML round-trip:** both modes show the complete config; switching is lossless in both directions.
- **`show_forecast` scope narrowed to the forecast line:** `show_forecast` now controls **only** the forecast **line on the chart**. The **Forecast | Total** panel is controlled independently by `show_forecast_total_panel` (shown when forecast data is available, not in single-window mode, and the flag is not `false`). The editor's `show_forecast_total_panel` control is therefore **always enabled** (no longer disabled when `show_forecast` is off). **Migration note:** if you relied on `show_forecast: false` to hide the Forecast | Total panel, also set `show_forecast_total_panel: false`.
- **`language` editor field is a dropdown:** the editor's `language` field is now a **picker over the available card dictionaries** (en, pl, de, fr) plus an **Auto (HA profile)** option, instead of a free-text input. Selecting **Auto** omits the `language` key so the card inherits the HA profile language.
- **`show_forecast` editor label renamed** to **"Show forecast on chart"** (en: "Show forecast on chart", pl: "Pokaż prognozę na wykresie", de: "Prognose auf dem Diagramm anzeigen", fr: "Afficher la prévision sur le graphique") to make clear it toggles the chart line, not the panel.
- **`neutral_interpretation` renamed to `neutral_threshold`:** the neutral-band key is now **`neutral_threshold`** (percent **T**). The old **`neutral_interpretation`** key is still accepted for backward compatibility (a deprecated alias; `neutral_threshold` wins when both are present) and will be removed in a future release. The visual editor label is **"Neutral threshold"** with a **%** suffix, and the field is widened so the label no longer overlaps the value.
- **Editor labels:** the **Neutral threshold** label no longer carries a "(%)" suffix (the control already shows the `%` suffix), and the **Unit prefix** label is lowercased.
- **Y-axis labels are no longer clipped:** the left chart margin now adapts exactly to the widest Y-axis tick label (measured per render, no fixed floor) so the label sits flush against the card's left edge and the plot area fills the full card width; when the number part of the top tick is longer than 3 characters (e.g. `10 000 Wh`) the unit moves to a second, right-aligned line so the plot area is not squeezed.

### Fixed

- Deprecated **`comparison_mode`** is migrated to **`comparison_preset`** in the GUI on save.
- **Editor HA-component fidelity:** the editor now uses the real Home Assistant component APIs — text/number fields use `ha-input` (with built-in labels) instead of a non-existent `ha-textfield`; `ha-select` / `ha-icon-picker` / `ha-color-picker` listen for their actual events (`selected` / `value-changed`) so those fields are no longer silently dead; `ha-switch` binds `.checked`; and sections use `ha-expansion-panel`'s `header` property + `expanded-changed` so **section names render** and clicking a field no longer collapses the section. Every control keeps an accessible label (built-in where the component supports it, external `<label>` otherwise).
- **`language` field always shows Auto:** the editor's `language` select now displays **Auto (HA profile)** whenever the `language` key is omitted (the Auto option is backed by an `auto` sentinel that maps back to an omitted key on save — the YAML behavior is unchanged).
- **Consistent section corner radius:** editor section borders now follow the HA card radius token (`--ha-card-border-radius`), matching the `ha-expansion-panel` header fill instead of a hard-coded 4px.
- **Bottom spacing of the last component:** the last control in an **expanded** editor section keeps a 12px bottom inset (matching the side insets) in both the `ha-expansion-panel` and fallback render paths; **collapsed** sections no longer show a dark content gap under the header (the panel's zero-height content container keeps its padding, so the bottom padding is zeroed when collapsed and the collapsed bar is vertically symmetric).
- **Style section is two-column:** the **Current series** and **Reference series** subsections now render side by side (two-column grid), with components of the same feature in the same row (`fill_current`/`fill_reference`, both opacity sliders).
- **Forecast | Total panel vanished at the start of a period (month-start-forecast-panel-missing):** on the first days of a new period the forecast is not yet computable (`computeForecast` returns `enabled: false`), and the card removed the entire Forecast | Total panel from the DOM — even with `show_forecast_total_panel: true` — with no explanation for the missing forecast line. The panel is now gated by `show_forecast_total_panel` only (independent of `show_forecast` and of forecast availability, and shown in single-window mode too): when the forecast is not yet available the Forecast column shows a placeholder (consistent with the Total placeholder) and the Total column shows the full reference-window total (placeholder in single-window mode). A warning-bar line now explains why the forecast is unavailable (e.g. "at least 3 completed days / 5% of the period required"); multiple data-quality notices are combined into a single warning bar. `computeForecast` now reports which guard disabled the forecast (`disabledReason`).
- **Warning bar did not explain why the forecast is disabled (zero-reference-forecast):** when the forecast is disabled the warning bar showed only the generic "Forecast not available for this period." without a reason — most visibly when the reference series is entirely 0 (e.g. a device that was off for the whole reference window) while the current series has data. The warning bar now shows a reason-specific message for each data-driven `disabledReason`: `zero_reference_in_range` ("the reference period is 0, no baseline to project from"), `no_reference` ("no reference data for this period"), and `no_split` ("reference data does not cover the elapsed time"). The two "too early" reasons keep their existing message, and the generic message remains as a defensive fallback. The forecast-disable behavior itself is unchanged (it is spec-mandated: `B = 0` → `enabled: false`).
- **Redundant LTS query batches during card load (issue #58):** while the card was in its loading state, every `hass` update (1–10×/s in a live HA install) re-triggered a full parallel batch of `recorder/statistics_during_period` requests. Loads are now coalesced per config generation — a single in-flight batch is reused, and stale results from a superseded config are discarded so a config change mid-load is never swallowed.
- **Cubic/square meter units mis-scaled as milli:** entities reporting `m³` (e.g. gas/water consumption) or `m²` were parsed with the leading `m` as a **milli** prefix, so `1500 m³` displayed as **1.5 ³** (value off by 1000× and the unit label mangled). `m³` and `m²` are now treated as non-scalable units and pass through unchanged in all `force_prefix` modes.
- **Hour label inconsistency (12h/24h) between the X-axis and the top panel:** clock labels were formatted by two independent paths — the X-axis and tooltip followed the **locale** default (e.g. `en` → am/pm, `pl` → 24h) and ignored the HA `time_format` profile setting, while the top-panel period captions always fell back to **24h** when `time_format` was unset. All three surfaces now share one resolution of the HA `time_format` setting: `"12"` → 12h, `"24"` → 24h, unset/`"language"` → the locale default — so the X-axis, tooltip, and top-panel captions always agree.
- **"New month problem" — first day of a period missing, values shifted one bucket early, zero-consumption days dropped (issue #56):** for `total`/`total_increasing` statistics the card differenced the `sum` field itself, which consumed the first bucket as a baseline (first day lost), skipped buckets with zero consumption, and stamped each value with the *previous* bucket's start. The per-bucket `change` field returned by Home Assistant is now used directly (with `sum` differencing kept only as a fallback for responses without `change`), so the first day is included, zero-consumption days are preserved as explicit 0 points, and each value sits on its own bucket. As a result, a freshly started period now shows **0 so far / −100 % vs reference** instead of `---` and "Not enough data to compare this period to the reference."
- **Delta chip line spacing:** when the comparison delta chip wraps onto a second line in a narrow column, the distance between its lines is now one third of the previous value (3 px instead of 8 px).
- **Tooltip reference mismatch at the today slot (tooltip-reference-mismatch):** the "TO THIS DAY" panel reference and the tooltip reference row at the today slot could disagree — for YoY the panel aligned to the previous slot (open today bucket) while the tooltip showed the reference series' real today-slot point; for MoM a previous "previous slot" fix showed the wrong value because the current series includes today's point. The panel's reference cumulative (`summary.reference_cumulative`) is now passed to the renderer as `panelReferenceCumulative`; at the today slot the tooltip reference row and the delta segment's reference endpoint use this value (falling back to the raw series value when unavailable), and the forecast row is omitted. Tooltip, delta segment, and panel now always agree regardless of preset.

### Documentation

- README / wiki updated for the new editor coverage (seven sections, `custom` preset, Visual ↔ YAML round-trip, YAML live-edit, lifecycle guarantees).
- Expanded the visual-editor documentation (README, README.advanced, wiki) with **per-section descriptions**, the **per-section documentation links**, the **field helper texts**, and a **Visual → YAML mapping** (control → key table, a worked example, and the preservative-merge / round-trip behavior).
- Documented the **build-from-source / deploy** path for forks and self-hosted instances (README Development section, wiki Getting Started): the build produces a single `dist/energy-horizon-card.js` file to copy into `config/www/`; the `npm run deploy` script is now parameterized via `DEPLOY_HOST` / `DEPLOY_PATH` (defaulting to the author's SSH alias `ha`).

---

## [1.1.0]

### Added

- **Compound ISO 8601 offset (`time_window.offset`):** the `offset` field now accepts a full **ISO 8601 duration** string (`P4M4D`, `-P2M`, `P1M15D`, etc.), so you can set precise custom window starts (e.g. a **billing / fiscal year from 5 May** with `offset: P4M4D` from `start_of_year`). Windows are built with **Luxon** `DateTime.plus(Duration)` — end-of-month **clamping** is deterministic. **Sub-hour** offsets are **rejected** with a **configuration error**. The legacy **`+1d` / `+3M`**-style form remains supported as a **shim** to the equivalent `P` form (deprecated; will be removed later). Implementation: single parser `src/card/time-windows/parse-time-window-offset.ts` (FR-900-Q); Vitest coverage in `tests/unit/time-windows-offset-iso.test.ts` and extended `time-windows-{merge-validate,presets-golden,resolve}.test.ts` (SC-900-6 / US-900 stories).
- **Narrative engine (step-based copy):** the comparison comment now picks the **period phrase** from merged YAML `time_window.step` (via `classifyComparisonStep`), not from resolved window geometry — so **billing offsets** and non-calendar steps (`1w`, `16d`, `3M`, …) match the configured intent. Translation layout is **`text_summary.{consumption|production|generic}.{higher|lower|similar|neutral_band}`** plus **`text_summary.period.{day|week|month|year|reference}`** and shared **`text_summary.insufficient_data`** / **`text_summary.no_reference`**; optional entity keys fall back to mandatory **`text_summary.generic.*`**. Contributor grammar notes: `src/translations/CONTEXT.md`.
- **`interpretation`** (`consumption` \| `production`, default consumption): aligns the **comparison narrative**, **trend icon**, and **chart delta** segment with whether the entity represents **usage** (less is better) or **generation** (more is better). Delta chip **numeric signs** stay arithmetic; Forecast \| Total copy is unchanged.
- **`neutral_interpretation`**: optional non-negative percent **T** (default **2**). When the chip’s signed percent **p** satisfies **|p| ≤ T**, narrative and chart delta use **neutral** “similar” styling. YAML-only in this release; the visual editor preserves the key via shallow merge.
- **Visual editor** control for **`interpretation`** (Consumption / Production).
- Translations (`en`, `pl`, `de`, `fr`) for production-oriented narrative, neutral-band text, and editor labels.


## [1.0.2]

### Added
- French language fr.json (by [joebar38](https://github.com/joebar38))

### Fixed

- **LTS measurement buckets (#45):** charts could stay **blank** when Home Assistant returned only **`mean` / `min` / `max`** (no `sum`, `change`, or `state`)—typical for `state_class: measurement` entities such as a **template sensor** summing cumulative sources without `state_class: total_increasing`. The card now derives a per-bucket increment from **`max - min`** when those three fields are absent, and skips buckets with a negative range. For true cumulative meters, prefer declaring **`total_increasing`** in HA so LTS exposes **`sum`**. (by [lukpep](https://github.com/lukpep))
- **Chart grid height consistency:** The chart plot area now maintains a stable, identical height across all axis modes (adaptive rich / standard) and “today” positions. `containLabel: false` with an always-fixed `grid.bottom = GRID_BOTTOM_PX` (38 px) eliminates the ~20 px height drift that occurred when `grid.bottom` switched between `0` and `42` depending on whether “today” was in range. The axis-tick-to-label gap (`AXIS_TICK_LABEL_GAP_PX`) is reduced from 8 → 4 px, tightening the visible bottom margin. Y-axis label space is now an explicit `GRID_LEFT_PX = 56 px` constant instead of relying on ECharts `containLabel` auto-expansion. All grid layout values are exported constants in `src/card/axis/x-axis-rich-styles.ts` and `src/card/echarts-renderer.ts`.
- **Adaptive X-axis — “now” tick label:** The highlighted tick for the current instant always uses a **two-line** layout so the substantive label (adaptive date/time) sits **below** other tick captions. The short localized **“Now”** line and collision-only branching are **removed**; spacing uses one **full** two-line budget whenever “now” is shown (`src/card/axis/x-axis-rich-styles.ts`, `src/card/echarts-renderer.ts`).


## [1.0.1-beta]

### Added

- **Figma-aligned card chrome:** When the card **title** is enabled, a **subtitle** shows the **`entity_id`** so the YAML-friendly id is visible next to the friendly name; when the title is **disabled**, both title lines are hidden (including `entity_id`). **Entity icon** sits in a **fixed-size** header container using Home Assistant’s **`ha-icon` / `ha-state-icon`** (no raster assets from the design file).
- **Figma-aligned comparison panel (*Data series info*):** **Two-column** layout (**Current** / **Reference**) with **period captions**, cumulative values for the comparison story (“to today”), and a **single delta chip** combining absolute difference and percent — colors follow the **HA theme**, not hard-coded Figma hex. The chip stays **visible** for zero and for missing data (**`---`** / **`-- %`**) with unit suffixes aligned to the card formatter.
- **Figma-aligned Forecast | Total panel (*Surface Container*):** With forecast **on**, **Forecast** describes the **full current period** and **Total** is the **full reference window** from long-term statistics (not the same as “to today” in the first panel). With **`show_forecast: false`**, the **entire** second panel is removed (unchanged from 0.4.x semantics).
- **Figma-aligned narrative & warnings:** **Narrative summary** (`textSummary`) in a row with a **trend icon** (higher / lower / similar vs reference) aligned with chart delta semantics. **Warnings** (e.g. incomplete reference) appear in a **dedicated bottom section** only — the full warning text is **not** duplicated inside the summary block.
- **Figma-aligned chart:** **Vertical “today”** line spans the full plot height; **delta segment** between current and reference at the **current aggregation** step; refreshed **reference-series** point styling. When the **current series is hidden**, X-axis tick **count and spacing** stay in line with the last release **before** the Figma UI (no forced “three labels” rule).
- **Layout visibility toggles** (YAML + Lovelace visual editor): **`show_comparison_summary`** (comparison panel), **`show_forecast_total_panel`** (Forecast | Total block), and **`show_narrative_comment`** (narrative row). Each defaults to **on** when omitted or any value other than **`false`**.
- With forecast **on**, **`show_forecast_total_panel: false`** hides only the Forecast | Total **panel** while keeping dashed **forecast line** behavior driven by **`show_forecast`**. **`show_forecast: false`** still removes the whole second panel.

### Changed

- **Period captions** in the comparison panel use a single **compact** formatter (`formatCompactPeriodCaption`): short month names, **Home Assistant time zone**, optional **`time_format`** for hourly windows, and compressed ranges (e.g. a full calendar month → `Mar 2026`).
- **Unified multi-window chart axis:** For **two or more** windows, **`buildChartTimeline`** uses **one** rule — axis length is the **maximum nominal bucket count** at window 0’s aggregation (**Longest-window axis span**), not a separate YoY/MoY legacy path. **Forecast** still uses **`forecastPeriodBuckets`** from **window 0** only when that differs from axis length.
- **`timeline[]` construction:** Built from **window 0’s** slot starts, then an **ordinal tail** to reach the longest span — **not** from the longest window’s calendar alone. Fixes wrong month/year on the X-axis and the **“now”** marker jumping to the **last day of the reference** period (MoM / YoY / MoY).
- **Tail axis labels:** X-axis ticks **past** the current window’s nominal end use **compact date-style** tail formatting. **FR-G carry-forward** fills the current cumulative at the **“today”** slot when LTS has not closed that bucket yet (**day** / **week** / **month** where supported), using **window 0** boundaries and HA **`time_zone`** consistently with the marker.
- **Default comparison labels:** Adaptive X-axis and tooltip headers **omit redundant years** when the two windows start in different years, and use **day-of-month only** for **daily** aggregation when the year matches but start **months** differ (MoM). **`x_axis_format`** / **`tooltip_format`** still override this matrix.
- **Intl time zone:** Default **Intl**-based axis and tooltip calendar strings use **`timeZone`** = **Home Assistant instance** zone instead of the browser default.

### Fixed

- **LTS `sum` vs chart slots:** Increments from consecutive **`sum`** values are timestamped at the **start of the bucket** they belong to (**previous row’s `start`**), so the first visible point aligns with the **first axis tick** for **`aggregation: day`** / **`hour`** (e.g. month-over-year no longer looks shifted by one day or hour). ECharts slot matching uses the **next timeline timestamp** as the slot end when available (same idea as the historical Chart.js path), improving **DST**-length days.
- **Chart tooltip vs X-axis:** Tooltip date headers resolve the **same timeline slot** as the axis (`axisValue` / current or reference series X), so sparse series such as the **two-point forecast line** no longer shift the header by one day or drop the tail column label.
- **FR-G carry-forward:** The “now” slot used to fill missing LTS buckets matches **window 0** bucket boundaries with HA **`time_zone`**, consistent with the **“now”** marker.
- **Comparison panel — current period caption:** For presets with **`currentEndIsNow`**, the **current** window caption shows the **full nominal** month/year again (`expandCurrentWindowForCaption`), not a partial range to today (e.g. **`Apr 2026`** vs **`1 Apr – 12 Apr 2026`**).

### Documentation

- Cross-linked specs and wiki mental model with the unified axis + forecast rules (`specs/006-time-windows-unify/`, `wiki-publish/Mental-Model-Comparisons-and-Timelines.md`).
- Updated **`README.md`**, **`README.advanced.md`**, **`wiki-publish/Luxon-Formats-Reference.md`**, and **`wiki-publish/Forecast-and-Data-Internals.md`** for timeline prefix/tail, **“now”**, label policy, **LTS `sum` → bucket** alignment, and **`max - min`** when only min/max are present.
- **`sum` → axis alignment:** `wiki-publish/Forecast-and-Data-Internals.md`, `README.advanced.md`, and `README.md` describe how LTS `sum` increments map to bucket starts; `specs/006-time-windows-unify/` adds **G9** / **FR-DATA-1** / **FR-DATA-2**.

## [0.4.0-beta]

### Added
- **Time Windows Engine**: advanced data engine enable new way that data can handle to dispaly: use `time_window` in YAML to customize (preset merge, validation, LTS constraints).
– **New `Month Over Month` comparison preset**. 
- **Luxon** dependency for resolving anchored time ranges and window calculations.
- **Inteligent Aggregation & X-axis**: optional card-level `x_axis_format` (Luxon subset, validated at config time); automatic `hour`/`day`/`week`/`month` selection from merged `duration` when `aggregation` is omitted (~20–100 slot target).
- **Inteligent X-axis labeling**: adaptive Intl-based X labels (HA time zone; first tick is always a boundary); label locale cascade (`language` → HA → `en`); horizontal X labels with overlap hiding.
- **Tooltip header**: aggregation-aligned default formatting (no redundant year in comparisons; hour + multi-day window gets date disambiguation); optional card-level `tooltip_format` (Luxon subset, same validation as `x_axis_format`).
– **README_advanced.md**: advanced documentation
– **changelog.md**: release log

### Changed
- **Clarified `comparison_preset`** semantics in docs (`year_over_year`, `month_over_year`, `month_over_month`, including “month over month” meaning two consecutive full calendar months).
- **Forecast default behavior** and configuration (`show_forecast`, alias `forecast`).
– **Github Wiki**: rewitten source of knowledge abour card dedicated more advanced users [https://github.com/hello-sebastian/Energy-Horizon/wiki](https://github.com/hello-sebastian/Energy-Horizon/wiki)

### Fixed
- **ECharts renderer refactors** (series layering and legend ordering).
–  **5000** max timeline slots per series with localized error and optional `debug` console details.
- **Auto-aggregation** for **one-hour** (or shorter) windows now selects **`hour`** for LTS instead of incorrectly preferring **`month`**, which could yield empty or wrong charts for hourly `time_window` configs.
- **Summary period labels** for **custom** `time_window` (non-legacy multi-window YAML) now show each window’s **date range** instead of only the calendar year from the default `year_over_year` preset.
- **LTS anchors**: `start_of_day` and `start_of_week` are **allowed** (`start_of_week` aligns to **Monday** / Luxon ISO week, same as `startOf("week")`).


## [0.3.1-beta] - First public beta release 
### Changed
  – Visual configuration form: lovelace visual editor (`getConfigElement` / `getStubConfig`) for common fields: entity, title, comparison preset, and `force_prefix`, with YAML mode preserving YAML-only keys.
  - Chartjs -> ECharts migration


## [0.2.0]
### Added
  - Localization / locale formatting
  - Smart unit scaling
  - Theming and style separation
### Fixed
  – Chart fixies


## [0.1.0]
### Added
  - Base functionality
  – Data visualizing
  - Base card/LTS support
  – Forecasting
  – Statistics


### Notes
The format is based on [Keep a Changelog](https://keepachangelog.com/).
