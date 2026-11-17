# Changelog

All notable changes to the Energy Horizon card are recorded in this file.
`changelog.md` is the single canonical changelog: the `[Unreleased]` section collects pending changes, and versioned sections are finalized at release (governance: domain 907, FR-907-H).

## [Unreleased]

### Changed

- Internal: typed the long-term statistics WebSocket response path — new `LtsMessageResponse` model and `extractLtsResults()` adapter in `ha-api.ts`, replacing three `as any` casts in the card element with typed boundary assertions. No behavioral change: both observed response shapes (envelope and bare payload) plus the documented legacy shape are handled exactly as before.
- Internal: consolidated the duplicated period-label logic into a single pure function, `formatPeriodLabel()` (`src/card/labels/period-label.ts`), used by the period header, the renderer config, and the time-window preview indication. No visible change.
- Internal: extracted the card's three ready-state paths (`_loadData`, `_buildDemoState`, `_firePickerRealDataQuery`) into a single pure pipeline, `buildReadyState()` in the new `src/card/pipeline/ready-state-builder.ts`, and moved unit scaling out of the element into `applyUnitScalingToSeries()` in `src/utils/unit-scaler.ts`. The element paths are now thin orchestration (< 60 lines each) ending in one pipeline call. No visible change: outputs are pinned by the R1 characterization baseline and unit tests with unchanged expected values (911/TD-2).
- Internal: slimmed `src/card/ha-api.ts` to a single responsibility (843 → 397 lines) — LTS query building, the typed LTS response mapping, and the summary/forecast compute cluster. The chart timeline geometry (`buildChartTimeline`, `buildFullTimeline*`, `buildTimelineSlots`, the "now" marker helpers, tail-label index, reference alignment) moved to a new `src/card/timeline/` module, and the window → comparison-period bridge (`comparisonPeriodFromResolvedWindows`) moved to `src/card/time-windows/`; the legacy single-window API (`buildLtsQuery`, `mapLtsResponseToSeries`, `buildComparisonPeriod`) was removed. The preset golden tests now pin the window boundaries as frozen values against `resolveTimeWindows` output. No visible change: all outputs are pinned by golden and characterization tests with unchanged expected values (911/TD-7).
- Internal: reshaped the card's state model into a compiler-enforced discriminated union, `CardState = LoadingState | ErrorState | NoDataState | ReadyState` — `ReadyState` now requires the full chart data (`comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime`), the four flat `preview*` state fields were consolidated into a single optional `preview?: PreviewSnapshot` snapshot, and the live preview shift was moved out of the state into an element field. All state read sites in `render()`/`updated()` migrated to union access with zero non-null assertions on state. No visible change: golden and characterization expected values unchanged (911/TD-11).
- Internal: removed the temporary scoped `no-explicit-any` exception from the ECharts renderer — the series array and its markLine/markPoint payloads are now typed with the official ECharts option types (`LineSeriesOption`, `MarkLineOption`, `MarkPointOption`), completing the program-wide 0× `any` milestone. Three inert config keys that ECharts never reads on line-series emphasis (`emphasis.showSymbol`, `emphasis.symbolSize`) and the series (`showInLegend`) were dropped; they had no effect on rendering. No visible change (911/TD-5).
- Internal: enabled `noUncheckedIndexedAccess` and eliminated all 56 non-null assertions cataloged under the tech-debt program (0 remaining in `src/`, 0 justified exceptions) — index accesses are now compiler-checked and replaced with explicit guards, captured references, and typed fallbacks, and the preview window access in the cumulative comparison chart now uses an explicit guard instead of `!`. No visible change: all 732 tests pass with unchanged expected values (911/TD-6).
- Internal: moved the card's comparison-narrative logic out of `render()` into two pure, unit-tested functions in `src/card/narrative/` — `resolveNarrativeSegment()` (the 4-branch selection over the comparison outcome) and `forecastDisabledReasonKey()` (the forecast-disabled-reason → warning copy mapping). No visible change: all golden and characterization tests pass with unchanged expected values (911/TD-8).

### Removed

- Removed unused runtime dependency: the dead Chart.js renderer module (`src/card/chart-renderer.ts`, never bundled since the ECharts migration) and its leftover `date-fns` package — `luxon` remains the sole date library.

### Documentation

- Wiki: added a "Known simplifications: number format → locale mapping" section to the Troubleshooting & FAQ page, documenting how the `number_format` option maps to the locale used for number rendering.

### Maintenance

- Lint: enabled strict typing rules — `@typescript-eslint/no-explicit-any` (error, with a temporary scoped exception in the ECharts renderer tracked to the Wave 3 typing work) and `@typescript-eslint/consistent-type-imports` (error); non-null assertions are now reported as warnings and cataloged for a later cleanup. No runtime change.
- Introduced `changelog.md` as the single canonical changelog; previous release notes (`release-notes-1.2.0.md`, `release-notes/`) moved to `docs/archive/`.
- The production build no longer emits a source map: `dist/energy-horizon-card.js.map` is no longer part of the committed/published artifact (the card bundle itself is unchanged).
- Repository hygiene: removed the working "SYNC IMPACT REPORT" comment block from the project constitution, removed the tracked `temp/` scratch directory, and dropped the unused `jsx: "react-jsx"` TypeScript compiler option.

## [1.2.0] - 2026-11-07

### What's new – Highlights

#### 1\. The Complete Visual Editor — No YAML Required

The most requested feature is finally here: the Lovelace editor now covers **every** parameter the card understands. Time windows, panels, colors, number formatting, date patterns, forecast, style, and diagnostics are all first-class controls — organized into seven sections:

*   **General** — entity, interpretation, neutral threshold, language
*   **Time windows** — anchor, duration, step, count, offset
*   **Panels** — which summary panels to show
*   **Formatting & Localization** — precision, unit prefix, number format, language
*   **Chart settings** — axis and tooltip date patterns, forecast line
*   **Style** — colors and opacities for the current and reference series
*   **Diagnostics** — debug and advanced options

Each section header carries an icon and a link to the wiki chapter covering that section, and the less obvious fields (time-window syntax, Luxon date formats, aggregation, precision, neutral threshold) now show a short helper text right below the control. **General** and **Time windows** are expanded by default. If you have been living in YAML, you can now configure the entire card without writing a single line of it.

#### 2\. YAML Mode Is Now a First-Class Citizen

If you prefer YAML, this release makes it a first-class input path rather than a fallback:

*   Edits update the **preview live** (debounced).
*   The **last valid YAML values** are what gets saved — you no longer need to switch to Visual first.
*   Syntax errors are shown **inline**.
*   Switching between Visual and YAML is **lossless in both directions**.

One note: Home Assistant re-serializes the config on save, so your values persist but the text formatting (comments, key order, indentation) is canonicalized.

#### 3\. New `custom` Comparison Preset

`comparison_preset: custom` resolves the comparison windows **generically** from the `time_window` block — no preset template, no `period_offset`. In the editor, selecting **Custom** reveals the full `time_window` sub-block (anchor, duration, step, count, offset) under the **Custom settings** subsection. Switching back to a standard preset removes `time_window` and restores `period_offset: -1`.

**Example:** a fiscal year starting on 15 May, compared month by month:

```yaml
comparison_preset: custom
time_window:
  anchor: start_of_year
  duration: 1y
  step: 1M
  offset: P4M14D
```

#### 4\. A Forecast That Behaves

The **Forecast | Total** panel no longer vanishes at the start of a new period. When the forecast is not yet computable (for example, fewer than three completed days), the panel stays visible: the Forecast column shows a placeholder and the Total column shows the full reference-window total. A warning bar now explains **why** the forecast is unavailable — "at least 3 completed days / 5% of the period required", "the reference period is 0", "no reference data", and so on — instead of a generic "Forecast not available."

Also: `show_forecast` now controls **only the forecast line on the chart**. The panel is controlled independently by `show_forecast_total_panel`. **Migration note:** if you relied on `show_forecast: false` to hide the panel, also set `show_forecast_total_panel: false`.

#### 5\. Data You Can Trust

A set of accuracy fixes that matter most at the start of a month or year:

*   **The "new month problem" is fixed:** the first day of a period is no longer missing, values are no longer shifted one bucket early, and zero-consumption days are preserved. A freshly started period now shows **0 so far / −100 % vs reference** instead of `---` and "Not enough data to compare."
*   **`m³` / `m²` units fixed:** gas and water meters were parsed with the leading `m` as a *milli* prefix, so `1500 m³` displayed as `1.5 ³` — off by a factor of 1000. These units now pass through unchanged.
*   **Consistent 12h/24h:** the X-axis, the tooltip, and the top-panel captions now all follow the Home Assistant `time_format` setting — no more am/pm on the axis while the panel shows 24h.

---

### Technical changelog

#### Added

*   **Full-coverage visual editor:** the Lovelace editor now exposes **every** user-configurable parameter, organized into seven sections — **General**, **Time windows**, **Panels**, **Formatting & Localization**, **Chart settings**, **Style**, **Diagnostics** (with subsections such as **Custom settings**, **Unit**, **Dates**, **Current series**, **Reference series**). **General** and **Time windows** are expanded by default. No YAML is required to configure the card.
*   **`custom` comparison preset:** `comparison_preset: custom` resolves windows **generically** from the `time_window` block (no preset template, no `period_offset`). In the editor, selecting `custom` shows the `time_window` sub-block (`anchor`, `duration`, `step`, `count`, `offset`) under the **Custom settings** subsection; switching back to a standard preset removes `time_window` and restores `period_offset: -1` in the config. `period_offset` is YAML-only — it is never a control in the visual editor.
*   **GUI controls** for `time_window.*`, colors/opacities (`primary_color`, `fill_*`, `fill_*_opacity`), formatting (`precision`, `force_prefix`, `number_format`, `language`), Luxon patterns (`x_axis_format`, `tooltip_format`), forecast (`show_forecast`), and `debug`.
*   **`neutral_threshold`** (renamed from `neutral_interpretation`, which remains a deprecated alias) is now GUI-editable (General).
*   **Card picker metadata:** the card now declares `preview: true` and a `documentationURL`, so it is offered with a live preview and a documentation link in the HA "Add card" picker.
*   **Section pictograms in the visual editor:** each editor section header displays an MDI icon — General (cog), Time windows (Gantt), Panels (day view), Formatting & Localization (counter), Chart settings (timeline), Style (palette), Diagnostics (bug).
*   **Per-section documentation links in the visual editor:** each editor section header now shows a documentation icon (help circle) linking to the wiki chapter covering that section's keys. The link opens in a new tab and does not collapse the section when clicked.
*   **Field helper texts in the visual editor:** non-obvious fields (time window syntax, Luxon date formats, aggregation, precision, neutral threshold) now show a short helper text below the control.

#### Changed

*   **`show_forecast` scope narrowed to the forecast line:** `show_forecast` now controls **only** the forecast **line on the chart**. The **Forecast | Total** panel is controlled independently by `show_forecast_total_panel` (shown when forecast data is available, not in single-window mode, and the flag is not `false`). The editor's `show_forecast_total_panel` control is therefore **always enabled** (no longer disabled when `show_forecast` is off). **Migration note:** if you relied on `show_forecast: false` to hide the Forecast | Total panel, also set `show_forecast_total_panel: false`.
*   **`neutral_interpretation` renamed to `neutral_threshold`:** the neutral-band key is now **`neutral_threshold`** (percent **T**). The old **`neutral_interpretation`** key is still accepted for backward compatibility (a deprecated alias; `neutral_threshold` wins when both are present) and will be removed in a future release. The visual editor label is **"Neutral threshold"** with a **%** suffix, and the field is widened so the label no longer overlaps the value.
*   **YAML mode is a first-class input path:** edits update the preview live (debounced), the **last valid YAML values** are the saved config (no switch to Visual required), and syntax errors are shown inline. HA re-serializes the config on save, so values persist but text formatting (comments, key order, indentation) is canonicalized.
*   **Visual ↔ YAML round-trip:** both modes show the complete config; switching is lossless in both directions.
*   **Editor lifecycle:** expanded panels, focus/caret, and scroll now persist across HA re-renders (UI state is independent of the config object); text-input emits are **debounced**; passive re-renders emit **no** spurious `config-changed` events.
*   **`language` editor field is a dropdown:** the editor's `language` field is now a **picker over the available card dictionaries** (en, pl, de, fr) plus an **Auto (HA profile)** option, instead of a free-text input. Selecting **Auto** omits the `language` key so the card inherits the HA profile language.
*   **`show_forecast` editor label renamed** to **"Show forecast on chart"** (en: "Show forecast on chart", pl: "Pokaż prognozę na wykresie", de: "Prognose auf dem Diagramm anzeigen", fr: "Afficher la prévision sur le graphique") to make clear it toggles the chart line, not the panel.
*   **Editor labels:** the **Neutral threshold** label no longer carries a "(%)" suffix (the control already shows the `%` suffix), and the **Unit prefix** label is lowercased.
*   **Y-axis labels are no longer clipped:** the left chart margin now adapts exactly to the widest Y-axis tick label (measured per render, no fixed floor) so the label sits flush against the card's left edge and the plot area fills the full card width; when the number part of the top tick is longer than 3 characters (e.g. `10 000 Wh`) the unit moves to a second, right-aligned line so the plot area is not squeezed.

#### Fixed

*   **"New month problem" — first day of a period missing, values shifted one bucket early, zero-consumption days dropped (issue #56):** for `total`/`total_increasing` statistics the card differenced the `sum` field itself, which consumed the first bucket as a baseline (first day lost), skipped buckets with zero consumption, and stamped each value with the *previous* bucket's start. The per-bucket `change` field returned by Home Assistant is now used directly (with `sum` differencing kept only as a fallback for responses without `change`), so the first day is included, zero-consumption days are preserved as explicit 0 points, and each value sits on its own bucket. As a result, a freshly started period now shows **0 so far / −100 % vs reference** instead of `---` and "Not enough data to compare this period to the reference."
*   **Cubic/square meter units mis-scaled as milli:** entities reporting `m³` (e.g. gas/water consumption) or `m²` were parsed with the leading `m` as a **milli** prefix, so `1500 m³` displayed as **1.5 ³** (value off by 1000× and the unit label mangled). `m³` and `m²` are now treated as non-scalable units and pass through unchanged in all `force_prefix` modes.
*   **Forecast | Total panel vanished at the start of a period (month-start-forecast-panel-missing):** on the first days of a new period the forecast is not yet computable (`computeForecast` returns `enabled: false`), and the card removed the entire Forecast | Total panel from the DOM — even with `show_forecast_total_panel: true` — with no explanation for the missing forecast line. The panel is now gated by `show_forecast_total_panel` only (independent of `show_forecast` and of forecast availability, and shown in single-window mode too): when the forecast is not yet available the Forecast column shows a placeholder (consistent with the Total placeholder) and the Total column shows the full reference-window total (placeholder in single-window mode). A warning-bar line now explains why the forecast is unavailable (e.g. "at least 3 completed days / 5% of the period required"); multiple data-quality notices are combined into a single warning bar.
*   **Warning bar did not explain why the forecast is disabled (zero-reference-forecast):** when the forecast is disabled the warning bar showed only the generic "Forecast not available for this period." without a reason — most visibly when the reference series is entirely 0 (e.g. a device that was off for the whole reference window) while the current series has data. The warning bar now shows a reason-specific message for each data-driven `disabledReason`: `zero_reference_in_range` ("the reference period is 0, no baseline to project from"), `no_reference` ("no reference data for this period"), and `no_split` ("reference data does not cover the elapsed time"). The two "too early" reasons keep their existing message, and the generic message remains as a defensive fallback. The forecast-disable behavior itself is unchanged (it is spec-mandated: `B = 0` → `enabled: false`).
*   **Tooltip reference mismatch at the today slot (tooltip-reference-mismatch):** the "TO THIS DAY" panel reference and the tooltip reference row at the today slot could disagree — for YoY the panel aligned to the previous slot (open today bucket) while the tooltip showed the reference series' real today-slot point; for MoM a previous "previous slot" fix showed the wrong value because the current series includes today's point. The panel's reference cumulative (`summary.reference_cumulative`) is now passed to the renderer as `panelReferenceCumulative`; at the today slot the tooltip reference row and the delta segment's reference endpoint use this value (falling back to the raw series value when unavailable), and the forecast row is omitted. Tooltip, delta segment, and panel now always agree regardless of preset.
*   **Redundant LTS query batches during card load (issue #58):** while the card was in its loading state, every `hass` update (1–10×/s in a live HA install) re-triggered a full parallel batch of `recorder/statistics_during_period` requests. Loads are now coalesced per config generation — a single in-flight batch is reused, and stale results from a superseded config are discarded so a config change mid-load is never swallowed.
*   **Editor HA-component fidelity:** the editor now uses the real Home Assistant component APIs — text/number fields use `ha-input` (with built-in labels) instead of a non-existent `ha-textfield`; `ha-select` / `ha-icon-picker` / `ha-color-picker` listen for their actual events (`selected` / `value-changed`) so those fields are no longer silently dead; `ha-switch` binds `.checked`; and sections use `ha-expansion-panel`'s `header` property + `expanded-changed` so **section names render** and clicking a field no longer collapses the section. Every control keeps an accessible label (built-in where the component supports it, external `<label>` otherwise).
*   **Deprecated `comparison_mode` is migrated to `comparison_preset`** in the GUI on save.
*   **`language` field always shows Auto:** the editor's `language` select now displays **Auto (HA profile)** whenever the `language` key is omitted (the Auto option is backed by an `auto` sentinel that maps back to an omitted key on save — the YAML behavior is unchanged).
*   **Consistent section corner radius:** editor section borders now follow the HA card radius token (`--ha-card-border-radius`), matching the `ha-expansion-panel` header fill instead of a hard-coded 4px.
*   **Bottom spacing of the last component:** the last control in an editor section now keeps a 12px bottom inset (matching the side insets) in both the `ha-expansion-panel` and fallback render paths.
*   **Style section is two-column:** the **Current series** and **Reference series** subsections now render side by side (two-column grid), with components of the same feature in the same row (`fill_current`/`fill_reference`, both opacity sliders).
*   **Delta chip line spacing:** when the comparison delta chip wraps onto a second line in a narrow column, the distance between its lines is now one third of the previous value (3 px instead of 8 px).

#### Documentation

*   README / wiki updated for the new editor coverage (seven sections, `custom` preset, Visual ↔ YAML round-trip, YAML live-edit, lifecycle guarantees).
*   Expanded the visual-editor documentation (README, README.advanced, wiki) with **per-section descriptions**, the **per-section documentation links**, the **field helper texts**, and a **Visual → YAML mapping** (control → key table, a worked example, and the preservative-merge / round-trip behavior).
*   Documented the **build-from-source / deploy** path for forks and self-hosted instances (README Development section, wiki Getting Started): the build produces a single `dist/energy-horizon-card.js` file to copy into `config/www/`; the `npm run deploy` script is now parameterized via `DEPLOY_HOST` / `DEPLOY_PATH` (defaulting to the author's SSH alias `ha`).

---

### Learn More

**Full Changelog**: [1.1.1...1.2.0](https://github.com/hello-sebastian/Energy-Horizon/compare/1.1.1...1.2.0)
