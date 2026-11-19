# Energy Horizon 1.3.0

![Release](https://img.shields.io/badge/version-1.3.0•beta-informational?style=for-the-badge&color=%2300c29e)&ensp;
[![GitHub Repo stars](https://img.shields.io/github/stars/hello-sebastian/Energy-Horizon?style=for-the-badge&logo=github&label=Star%20this%20repo&color=gold&link=https%3A%2F%2Fgithub.com%2Fhello-sebastian%2FEnergy-Horizon)](https://github.com/hello-sebastian/Energy-Horizon)

## What's new – Highlights

### 1\. Official Marketplace Catalog 

Energy Horizon Card is now listed in the built-in **Marketplace** catalog (Home Assistant 2026.11+) and in the **default HACS** catalog. Installing is a plain catalog search — no custom repository needs to be added. On HA 2026.11+ the built-in Marketplace replaces HACS and migrates existing HACS installations automatically, so existing users need do nothing.

### 2\. A Real Preview in the "Add card" Picker

The card now works in **both** picker entry points instead of failing at both:

*   **"By entity" view:** the card is **suggested** whenever the selected entity's unit of measurement is one of the supported units (`kWh`, `Wh`, `MWh`, `m³`, `l` — exact, case-sensitive match), and **not** suggested for any other unit. The suggestion carries a sample configuration referencing the selected entity, so the preview renders the card in its standard appearance with *your* entity.

*   **"By card" view (gallery):** the "There is no data to display for the selected period" message is gone. The card searches for a suitable user entity with a supported unit and uses it; when none exists it falls back to a **demo series** so the card always renders in its standard appearance (a chart with a current and a reference series plus the standard panels).

The demo series renders **immediately** (no blocking, no loading or error state), and a short real-data query then upgrades the preview in place to the entity's real data when it succeeds in time. On timeout, or empty result the demo series stays. The preview is strictly a preview: the sample configuration is **never persisted** as the card's configuration, it **never blocks** on data, and it does not interfere with other cards' previews or the picker. It respects the active theme (light/dark) and the card's localization.

### 3\. Browse Past Periods Without Touching Your Configuration

A pair of buttons in the top-right of the chart area steps the displayed time window to an **earlier or a later period**, and a reset control returns to the current period — inspect past periods without changing a single line of configuration. The shifted series render in **gray** and the card shows a `Preview: <period>` indication. The preview is transient: it is never written to the configuration, and the summary panels and the narrative stay unchanged.


### 4\. Editor & Preview Refinements


### 5\. A Cleaner, Lighter Codebase (Selected Under-the-Hood Changes)

* **This release completes the tech-debt reduction program** — visible behavior is unchanged, but the internals are measurably healthier:

*   **Lighter artifact:** the production build no longer emits a source map — the published artifact is just the single card bundle.

---

## Technical changelog

### Added

*   **Official catalog listing:** Energy Horizon Card is now listed in the built-in **Marketplace** catalog (HA 2026.11+) and in the **default HACS** catalog — installing is a plain catalog search, no custom repository needs to be added.
*   **Card picker preview (discoverable & recognizable in the HA "Add card" picker):** the card now works in **both** picker entry points instead of failing at both.
    - **"By entity" view:** the card is now **suggested** whenever the selected entity's unit of measurement is one of the supported units (`kWh`, `Wh`, `MWh`, `m³`, `l` — exact, case-sensitive match), and **not** suggested for any other unit. The suggestion carries a sample configuration referencing the selected entity, so the preview renders the card in its standard appearance with that entity.
    - **"By card" view (gallery):** the preview no longer shows the "There is no data to display for the selected period" message. It searches for a suitable user entity with a supported unit and uses it; when none exists it falls back to a **deterministic demo series** so the card always renders in its standard appearance (a chart with a current and a reference series plus the standard panels).
    - **Real data first, fictional fallback:** after the demo series renders immediately (no blocking, no loading/error state), a **time-limited** real-data query (~2.5 s) upgrades the preview in place to the entity's real data when it succeeds in time; on failure, timeout, or empty result the demo series stays.
    - **Strictly a preview:** the sample configuration is only the picker's starting point — it is **never persisted** as the card's configuration, the preview **never blocks** on data, and it **does not interfere** with other cards' previews or the picker. The preview respects the active theme (light/dark) and the card's localization. The time-window preview controls are visible in the picker but do not respond to input there (see **Fixed** below).
*   **Transient time-window preview:** a pair of arrow controls in the top-right of the chart area steps the displayed time window to an earlier or a later period, and a reset control returns to the current period — inspect past periods without touching the card's configuration. The shifted series render in gray and the card shows a `Preview: <period>` indication. The preview is transient: it is never written to the configuration, and the summary panels and the narrative stay unchanged. The shift controls are visible but non-interactive in preview contexts (picker, dashboard edit mode, card editor) — the preview period can only be changed in the dashboard view mode (see **Fixed** below).

### Changed

*   Internal: typed the long-term statistics WebSocket response path — new `LtsMessageResponse` model and `extractLtsResults()` adapter in `ha-api.ts`, replacing three `as any` casts in the card element with typed boundary assertions. No behavioral change: both observed response shapes (envelope and bare payload) plus the documented legacy shape are handled exactly as before.
*   Internal: consolidated the duplicated period-label logic into a single pure function, `formatPeriodLabel()` (`src/card/labels/period-label.ts`), used by the period header, the renderer config, and the time-window preview indication. No visible change.
*   Internal: extracted the card's three ready-state paths (`_loadData`, `_buildDemoState`, `_firePickerRealDataQuery`) into a single pure pipeline, `buildReadyState()` in the new `src/card/pipeline/ready-state-builder.ts`, and moved unit scaling out of the element into `applyUnitScalingToSeries()` in `src/utils/unit-scaler.ts`. The element paths are now thin orchestration (< 60 lines each) ending in one pipeline call. No visible change: outputs are pinned by the R1 characterization baseline and unit tests with unchanged expected values (911/TD-2).
*   Internal: slimmed `src/card/ha-api.ts` to a single responsibility (843 → 397 lines) — LTS query building, the typed LTS response mapping, and the summary/forecast compute cluster. The chart timeline geometry (`buildChartTimeline`, `buildFullTimeline*`, `buildTimelineSlots`, the "now" marker helpers, tail-label index, reference alignment) moved to a new `src/card/timeline/` module, and the window → comparison-period bridge (`comparisonPeriodFromResolvedWindows`) moved to `src/card/time-windows/`; the legacy single-window API (`buildLtsQuery`, `mapLtsResponseToSeries`, `buildComparisonPeriod`) was removed. The preset golden tests now pin the window boundaries as frozen values against `resolveTimeWindows` output. No visible change: all outputs are pinned by golden and characterization tests with unchanged expected values (911/TD-7).
*   Internal: reshaped the card's state model into a compiler-enforced discriminated union, `CardState = LoadingState | ErrorState | NoDataState | ReadyState` — `ReadyState` now requires the full chart data (`comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime`), the four flat `preview*` state fields were consolidated into a single optional `preview?: PreviewSnapshot` snapshot, and the live preview shift was moved out of the state into an element field. All state read sites in `render()`/`updated()` migrated to union access with zero non-null assertions on state. No visible change: golden and characterization expected values unchanged (911/TD-11).
*   Internal: removed the temporary scoped `no-explicit-any` exception from the ECharts renderer — the series array and its markLine/markPoint payloads are now typed with the official ECharts option types (`LineSeriesOption`, `MarkLineOption`, `MarkPointOption`), completing the program-wide 0× `any` milestone. Three inert config keys that ECharts never reads on line-series emphasis (`emphasis.showSymbol`, `emphasis.symbolSize`) and the series (`showInLegend`) were dropped; they had no effect on rendering. No visible change (911/TD-5).
*   Internal: enabled `noUncheckedIndexedAccess` and eliminated all 56 non-null assertions cataloged under the tech-debt program (0 remaining in `src/`, 0 justified exceptions) — index accesses are now compiler-checked and replaced with explicit guards, captured references, and typed fallbacks, and the preview window access in the cumulative comparison chart now uses an explicit guard instead of `!`. No visible change: all 732 tests pass with unchanged expected values (911/TD-6).
*   Internal: moved the card's comparison-narrative logic out of `render()` into two pure, unit-tested functions in `src/card/narrative/` — `resolveNarrativeSegment()` (the 4-branch selection over the comparison outcome) and `forecastDisabledReasonKey()` (the forecast-disabled-reason → warning copy mapping). No visible change: all golden and characterization tests pass with unchanged expected values (911/TD-8).
*   Internal: extracted the card's display model into a pure, unit-tested view model — `buildCardViewModel()` in the new `src/card/view-model.ts` now computes every value the card prints (header, formatted comparison numbers + captions, Forecast | Total panel, semantics + narrative, warning strip, preview indication) as a status-discriminated `CardViewModel`, and `render()` became a thin template over it. The signed-number formatter and the narrative emphasis renderer moved out of the element file into `src/card/labels/signed-number.ts` and `src/card/narrative/narrative-emphasis.ts`. No visible change: all golden and characterization tests pass with unchanged expected values (911/TD-9).
*   Internal: extracted the editor's YAML mode into a DOM-free, unit-tested state machine — `src/card/editor/yaml-mode.ts` now owns the YAML text, the inline parse error, the self-echo guard, and all emit/parse debouncing, and the editor shell keeps only rendering + event routing (948 lines). No visible change: all editor lifecycle and coverage tests pass with unchanged expected values (911/TD-12).
*   Internal: trimmed `src/card/ha-api.ts` back under its 400-line budget (399) — the Wave 3 `noUncheckedIndexedAccess` guards had grown the module past it; the trim is comments and a direct return only. No visible change (911/T024).
*   Internal: extracted the picker preview session into a DOM-free module — `src/card/picker/attach-picker.ts` now owns the demo-first render (`buildPickerDemoState`, deterministic demo series, no query on the critical path) and the one-shot real-data upgrade, mounted by a single `attachPicker(element, config, onState)` hook that returns a per-element-instance session controller; the ECharts renderer-config construction moved to `src/card/renderer-config.ts` (a verbatim move of `_buildRendererConfig` / `_resolveChartTheme` behind a narrow host interface). Both producers consume the shared `buildReadyState` pipeline, the element shrank from 1373 to 1153 lines (under the 1200-line budget, SC-003), and both modules are covered by new unit tests. No visible change: all golden and characterization tests pass with unchanged expected values (911/TD-14).

### Fixed

*   **Editor did not fill the card editor dialog height (908 refinement, FR-908-AC/AD, SC-908-10):** in the HA card editor dialog the editor's scrollable area (visual mode and YAML mode) now responsively fills the whole allocated editor pane regardless of the browser window size — scrolling happens only inside the editor, and the Config/Visibility tab bar and the dialog chrome stay visible. Previously the visual-mode scroll area was capped at a fixed `60vh` unrelated to the dialog geometry (a gap under the scroller on tall windows, a double scrollbar on short ones).
*   **Time-window preview controls hidden in the HA card picker, dashboard edit mode, and the card editor (909 refinement, FR-022–FR-025):** the preview controls (back/forward) are now visible in every card context — including the "Add card" picker (both views), dashboard edit mode, and the editor's live preview — where they keep their normal appearance and do not respond to any input (no state change, no data load; the preview state can only be changed in the dashboard view mode; the reset control remains contextual — it appears only while a preview shift is active). Previously the controls were hidden in those contexts.

### Removed

*   Removed unused runtime dependency: the dead Chart.js renderer module (`src/card/chart-renderer.ts`, never bundled since the ECharts migration) and its leftover `date-fns` package — `luxon` remains the sole date library.

### Documentation

*   Installation docs (README quick start, Getting Started wiki page) now present the default **Marketplace** and **HACS** catalogs as the install path — searching for the card is the default method, the README **Marketplace / HACS** badge now reads **Default**, and the "Open this repository in the Marketplace" button opens the card's plugin page in the Marketplace instead of the custom-repository flow. The HACS section notes that the built-in Marketplace replaces HACS on HA 2026.11+ and migrates existing HACS installations automatically.
*   Wiki: added a "Known simplifications: number format → locale mapping" section to the Troubleshooting & FAQ page, documenting how the `number_format` option maps to the locale used for number rendering.
*   Wiki: added a "How-to: browse past periods with the transient preview (no config change)" section to the How-To: Time Windows page, with a pointer from the First Comparisons quick recipes. README and Getting Started now present the dashboard add-card picker + visual form as the default way to add the card, with the YAML snippet below for advanced users.

### Maintenance

*   Lint: enabled strict typing rules — `@typescript-eslint/no-explicit-any` (error, with a temporary scoped exception in the ECharts renderer tracked to the Wave 3 typing work) and `@typescript-eslint/consistent-type-imports` (error); non-null assertions are now reported as warnings and cataloged for a later cleanup. No runtime change.
*   Introduced `changelog.md` as the single canonical changelog; previous release notes (`release-notes-1.2.0.md`, `release-notes/`) moved to `docs/archive/`.
*   The production build no longer emits a source map: `dist/energy-horizon-card.js.map` is no longer part of the committed/published artifact (the card bundle itself is unchanged).
*   Repository hygiene: removed the working "SYNC IMPACT REPORT" comment block from the project constitution, removed the tracked `temp/` scratch directory, and dropped the unused `jsx: "react-jsx"` TypeScript compiler option.
*   Constitution amended to **v1.3.0** (MINOR): full Polish-to-English translation under the new Language Policy (no provision dropped, weakened, or redefined — no MAJOR), a new core principle **VII. Pragmatic Architecture & Anti-Over-Engineering (AI Guardrails)** (pure functions, unidirectional dependencies, three-tier state allocation, styling discipline), a TDD rule for domain logic with the grandfathered baseline (2026-11-16: 62 test files / 678 tests), and new clauses for domain isolation from the HA API, strict lifecycle management, prohibition of dynamic code execution, GPL v3 dependency license compatibility, custom element name persistence, PR test requirements, task-execution logical atomicity, and a Governance versioning policy with a mandatory constitution compliance review before every production release. Documentation-only change — no code or build artifact impact. See `docs/constitution-amendment-1.3.0.md`.
*   Constitution amended to **v1.4.0** (MINOR): the "Task Breakdown & Execution Rules (Logical Atomicity)" section gained two clauses — **No feature bundling** (a task covering several separate concerns MUST be split into separate tasks, one concern per task) and **Sequencing gate** (task N+1 MUST NOT start until task N is marked `[x]` in `tasks.md`) — and a mandatory `eh.task-protocol` hook was registered in `.specify/extensions.yml` (`before_implement`, `optional: false`) to inject the per-task protocol into every `/speckit-implement` run. Documentation-only change — no code or build artifact impact.

---

## Learn More

**Full Changelog**: [1.2.0...1.3.0](https://github.com/hello-sebastian/Energy-Horizon/compare/1.2.0...1.3.0)
