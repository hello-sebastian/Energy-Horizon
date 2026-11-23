---

description: "Task list for the Transient Time-Window Preview feature"
---

# Tasks: Transient Time-Window Preview

**Input**: Design documents from `/specs/909-timewindow-preview/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — Constitution Principle III (TypeScript strict + tests) mandates test coverage for the shift algebra, preview state transitions, and the preview render path.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Source: `src/card/` (existing `EnergyHorizonCard` Lit element tree)
- Tests: `tests/unit/` and `tests/integration/` (existing Vitest + jsdom layout)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing project baseline is green before adding the feature (no new dependencies, no new top-level structure — the feature lives inside the existing `src/card/` tree).

- [X] T001 Verify the baseline is green before starting: run `npm test`, `npm run typecheck`, and `npm run lint` from the repo root and confirm all pass with no pre-existing failures (no code change; gate only)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared pieces that every user story depends on — the preview state/series types, the localized UI strings, and the pure shifted-window helper.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Extend `CardState` and `ChartRendererConfig` with the preview fields in `src/card/types.ts`: `CardState.previewShift` (number, `0`/absent = default), `CardState.previewSeries` (shifted current + shifted reference cumulative series pair, unit-scaled, present only when `status === "ready"`), `ChartRendererConfig.previewMode` (boolean, `true` while `previewShift < 0`), `ChartRendererConfig.previewSeries` (series pair), and `ChartRendererConfig.periodLabel` (string, reflects the shifted period in preview) — per `data-model.md`
- [X] T003 [P] Add the `preview.*` UI strings to all four locales in `src/card/translations/en.json`, `src/card/translations/pl.json`, `src/card/translations/de.json`, and `src/card/translations/fr.json`: `preview.step_back`, `preview.step_forward`, `preview.reset` (control `aria-label`s) and the preview indication label — short, concrete wording consistent with the existing `period.*` / `status.*` keys (research R8)
- [X] T004 [P] Implement the pure shifted-window helper in `src/card/time-windows/` (new file, e.g. `preview-shift.ts`): given `merged`, `now`, `timeZone`, and `previewShift`, compute the shifted `now` by applying `parseDurationToken(merged.duration)` (the window's nominal width, **not** `step`) `|previewShift|` times via the same `DateTime.minus(Duration)` algebra as `minusStepRepeated`, then return `resolveTimeWindows(merged, shiftedNow, timeZone, …)` — reusing the existing resolver unmodified (research R1); the helper MUST be a pure function with no side effects

**Checkpoint**: Foundation ready — types, strings, and the shift helper exist; user story implementation can now begin.

---

## Phase 3: User Story 1 — Step through past periods without touching the config (Priority: P1) 🎯 MVP

**Goal**: The user can step the displayed window backward (and forward, back toward the default) by one nominal width at a time, with the shifted period queried and the window's width/aggregation/settings preserved — without editing the saved configuration.

**Independent Test**: On a card with a one-month window, activate the backward control once and confirm the shifted (previous month) window set is resolved and queried and the saved configuration is unchanged; repeat for a day-based (`45d`), a one-year (`1y`), and a week/hour width and confirm each shifts by exactly one nominal width (the visual two-series presentation is finalized in US3).

### Tests for User Story 1 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T005 [P] [US1] Unit tests for the shifted-window helper in `tests/unit/preview-shift.test.ts`: for every supported width (year, month, week, day, hour, minute, second) one step back moves by exactly one nominal width — calendar-aware for y/M/w (respecting month-length and end-of-month) and exact for d/h/m/s — and the window's duration/step/count/anchor/aggregation are preserved (FR-005, FR-006, "All supported widths" edge case); include at least one case driving the shift through the legacy preset path (`currentEndIsNow && referenceFullPeriod && count === 2`) and one through the generic path, asserting identical one-width behavior on both (FR-015)
- [X] T006 [US1] Unit tests for the preview state transitions in `tests/unit/preview-shift.test.ts`: step back decrements (`previewShift -= 1`, no lower bound, FR-004); step forward increments clamped at `0` (no-op at the default, FR-003); reset sets `0` (FR-009); and `previewShift` is always an integer `≤ 0` — "any attempt to make it positive is clamped to `0`" (data-model validation rule 1)

### Implementation for User Story 1

- [X] T007 [US1] Add the `previewShift` element field (plain, non-persisted runtime field, **not** part of `_config`) and the step-back / step-forward handlers in `src/card/cumulative-comparison-chart.ts`: step back always allowed; step forward clamped at `0` (no-op at the default, FR-003); each change bumps the load generation so rapid stepping coalesces (research R6)
- [X] T008 [US1] Wire the preview branch into `_loadData` in `src/card/cumulative-comparison-chart.ts`: when `previewShift < 0`, resolve the shifted windows via the T004 helper and query the shifted current period (`shiftedWindows[0]`) and, when a reference window exists, the shifted reference period (`shiftedWindows[1]`) via the existing LTS `statistics_during_period` path; reuse the existing generation mechanism so "a stale load (generation changed mid-flight) is discarded" (data-model validation rule 2); the default analytical pipeline (summary/forecast/interpretation/narrative) is left untouched (FR-021, research R4)
- [X] T009 [US1] Render the backward and forward controls as native `<button>` elements in the top-right corner of the chart in `src/card/cumulative-comparison-chart.ts`, always present in view mode, with the localized `preview.step_back` / `preview.step_forward` `aria-label`s (FR-001, FR-002, contract "Controls")

**Checkpoint**: The user can step the window back/forward; the shifted period is resolved and queried; the saved configuration is unchanged. (The gray two-series visual is completed in US3.)

---

## Phase 4: User Story 2 — Know at a glance that the chart is a preview (Priority: P1)

**Goal**: A clear, always-visible indication tells the user the chart is showing a shifted (preview) period and which period, so a preview is never mistaken for the configured default.

**Independent Test**: Step the card back one period and confirm a clear indication appears showing the shifted period; return to the default and confirm the indication is gone.

### Tests for User Story 2 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T010 [US2] Integration test in `tests/integration/card-render.test.ts`: the preview indication is visible when `previewShift < 0` and absent at the default (FR-011, FR-012); its content conveys the shifted period, consistent with the period label the card already displays (US2 scenario 3)

### Implementation for User Story 2

- [X] T011 [US2] Render the preview indication as a visible text element in the DOM (announced to screen readers, not a visual-only overlay) in `src/card/cumulative-comparison-chart.ts`: shown only while `previewShift < 0`, reusing the existing period-label formatting so the shifted period reads the same way the card already formats periods (FR-011, FR-012, research R5/R7, contract "Preview indication")

**Checkpoint**: The user can tell at a glance that the chart is a preview and which period is shown.

---

## Phase 5: User Story 3 — See only the historical series while previewing (Priority: P1)

**Goal**: While previewing, the chart shows only the shifted historical series — the shifted current (light gray) and, when present, the shifted reference (darker gray) — and hides the live series, so it is unmistakable that the user is viewing historical data.

**Independent Test**: Step the card back one period and confirm the chart shows the shifted current in light gray and the shifted reference in a darker gray (two series when a reference window exists; a single light-gray series when it does not) and that the live current and reference series are not drawn; return to the default and confirm the live series reappear.

### Tests for User Story 3 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T012 [US3] Integration test in `tests/integration/card-render.test.ts`: in preview the chart draws exactly two gray-toned series — the shifted current in light gray and the shifted reference in a darker gray — with the live current and reference series not drawn (FR-018, FR-019); the shifted current series does not use the current series' color; for a single-window configuration (no reference window) exactly one light-gray series is drawn (US3 scenarios 1–2, 5; "Two windows in preview" and "Single window (no reference)" edge cases)

### Implementation for User Story 3

- [X] T013 [US3] Implement the preview render path in `src/card/echarts-renderer.ts`: when `previewMode` is true, draw the shifted current series in light gray and the shifted reference series in a darker gray using the card's existing HA theme color tokens (the shifted current MUST NOT use the current series' color), and do not draw the live current/reference series; when there is no reference window, draw only the single light-gray shifted current series (FR-018, FR-019, research R3)
- [X] T014 [US3] Wire `previewMode`, `previewSeries`, and the shifted `periodLabel` from the card into the renderer config in `src/card/cumulative-comparison-chart.ts` so the chart's x-axis, period label, and legend follow the shifted series being drawn, with the existing formatting and style unchanged (FR-021, research R5)

**Checkpoint**: The preview chart shows only the gray-toned shifted series (two, or one for single-window) with the live series hidden; returning to the default restores the normal presentation (FR-020).

---

## Phase 6: User Story 4 — The preview is always temporary (Priority: P1)

**Goal**: The preview is unmistakably temporary — it is discarded whenever the card is re-instantiated (dashboard switch, view switch, page reload) and each card keeps its own independent state.

**Independent Test**: Step the card back two periods, then (a) create a fresh card instance (simulating a view/dashboard switch or reload) and confirm it shows the configured default with no indication; confirm a second card on the same dashboard is unaffected by the first card's shift.

### Tests for User Story 4 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T015 [US4] Integration test in `tests/integration/card-render.test.ts`: a freshly instantiated card element shows the configured default with no preview indication (the preview state does not survive re-instantiation, FR-008); and two card instances on the same dashboard keep independent preview state — shifting one does not affect the other (FR-016, US4 scenarios 1–4)

### Implementation for User Story 4

- [X] T016 [US4] Confirm the transient contract holds by construction in `src/card/cumulative-comparison-chart.ts`: `previewShift` is a plain element field that is never written to `_config` or any storage ("The preview never writes to `_config` or any storage" — data-model validation rule 4), so it is destroyed with the element on re-instantiation; add an assertion that stepping the preview does not mutate the saved configuration (FR-007, FR-008, research R2)

**Checkpoint**: The preview never leaks across navigation and never persists; each card is independent.

---

## Phase 7: User Story 5 — Return to the current series in one click (Priority: P2)

**Goal**: A reset control takes the user straight back to the configured default (the current series) in a single activation, reinforcing that the default is the "home" position.

**Independent Test**: Step the card back two periods, confirm a reset control is visible, activate it, and confirm the chart immediately shows the configured default and the reset control and indication disappear.

### Tests for User Story 5 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T017 [US5] Integration test in `tests/integration/card-render.test.ts`: the reset control is present in the DOM only while `previewShift < 0` and absent at the default (FR-009, FR-010); activating it returns the chart to the configured default and removes the preview indication and the reset control (US5 scenarios 1–3)

### Implementation for User Story 5

- [X] T018 [US5] Add the reset control as a native `<button>` in the top-right corner of the chart in `src/card/cumulative-comparison-chart.ts`, present in the DOM only while `previewShift < 0` (removed as soon as the card is at the default — by stepping forward, by reset, or by re-instantiation), with the localized `preview.reset` `aria-label`; on activation set `previewShift = 0` (FR-009, FR-010, contract "Controls")

**Checkpoint**: The user can return to the configured default in a single activation from any shifted position.

---

## Phase 8: User Story 6 — Handle periods with no or partial data gracefully (Priority: P3)

**Goal**: When the user steps into a period with no or partial data, the card behaves exactly as it does today for missing data — no crash, no misleading output — and the preview controls remain usable so the user can step through data-less gaps.

**Independent Test**: On a card with limited history, step back until the shifted period has no data and confirm the standard no-data indication is shown (no crash) with the preview controls and indication still available; step to a period with only partial data and confirm it is handled by the existing partial-data behavior.

### Tests for User Story 6 (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T019 [US6] Integration test in `tests/integration/card-render.test.ts`: a shifted period with no data renders the card's standard no-data indication (identical to existing missing-data handling) AND the preview controls (back/forward/reset) and the preview indication remain visible and functional so the user can step forward, step further back, or reset (FR-013, US6 scenario 1); a shifted period with partial data is handled by the existing partial-data behavior (FR-014, US6 scenario 2)

### Implementation for User Story 6

- [X] T020 [US6] Ensure the no-data render path in `src/card/cumulative-comparison-chart.ts` keeps the preview controls and the preview indication mounted (not replaced by the bare no-data card) while `previewShift < 0`, so the user can step through data-less periods (e.g., seasonal gaps) or reset without leaving the preview (FR-013, FR-014, contract "Invariants" 5)

**Checkpoint**: Data-less and partial shifted periods are handled gracefully with the preview controls still available.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation.

- [X] T021 Accessibility pass in `src/card/cumulative-comparison-chart.ts`: confirm the three controls are keyboard-operable (Enter/Space), focus-visible, and carry the localized `aria-label`s; confirm the preview indication is real text announced to screen readers; confirm contrast is inherited from the existing theme tokens (FR-017, research R7, Constitution Principle IV)
- [X] T022 [P] Verify all four locales (`src/card/translations/en.json`, `pl.json`, `de.json`, `fr.json`) have complete `preview.*` keys with no missing-key warnings, and that the wording is consistent across locales (research R8, Constitution Principle VI)
- [X] T023 Run the full validation gate and the quickstart scenarios: `npm test`, `npm run typecheck`, and `npm run lint` all green, then walk the end-to-end scenarios in `specs/909-timewindow-preview/quickstart.md` (step back, config untouched, all widths, forward bound, reset, transient, per-card independence, no-data, panels unchanged, accessibility)
- [X] T024 Fix: snap shifted `now` to end of nominal period for legacy presets in `src/card/time-windows/preview-shift.ts` (full month/year, not partial); add unit tests in `tests/unit/preview-shift.test.ts`
- [X] T025 Fix: preview no-data — when the shifted period has no data, set `previewWindows`/`previewChartTime` unconditionally in `src/card/cumulative-comparison-chart.ts` and render the standard no-data alert (with preview controls and indication) instead of falling back to the default pipeline (FR-004, FR-013, SC-005, US6)
- [X] T026 Fix: preview no-data — keep the chart container and renderer in place (stable card height, x-axis with the period's start/end labels, empty plot) and overlay the standard no-data indication centered on the chart (FR-013, SC-005, US6)
- [X] T027 Fix: add the missing `preview.*` keys to `src/translations/nl.json` so the Dutch dictionary keeps full key parity with `en.json` (localize-dutch regression test)
- [X] T028 Fix: suppress the "today" x-axis marker in preview mode — `todaySlotIndex` is forced to -1 when `rendererConfig.previewMode === true`, so a shifted (past) window does not render a bold "today" tick clamped to its last bucket (FR-018, FR-021)
- [X] T029 Fix: preview step controls stay right-aligned with a fixed 4px gap — `.ebc-chart-controls` uses `justify-content: flex-end` and `.ebc-preview-indication` uses `margin-right: auto`, so the buttons do not shift when the indication appears/disappears (FR-017)
- [X] T030 Fix: preview X-axis consistency — in preview mode the X-axis always uses the data-present edge-label style (start/end labels only), so a shifted period with no data is labeled identically to one with data; introduce `xAxisUsesDataStyle = currentSeriesVisible || previewMode` in `src/card/echarts-renderer.ts` and use it for `xLabelStops`, `xAxisTickInterval`, and `xAxisRichAdaptive` (FR-021)
- [X] T031 Fix: symmetric vertical rhythm around the chart controls bar — remove the 8px `padding-bottom` from `.ebc-chart-controls` and reduce `GRID_TOP_FALLBACK_PX` from 32 to 16 in `src/card/echarts-renderer.ts`, so the distance from the bottom of the buttons to the topmost grid line equals the 16px `.content` gap above the bar

---

## Phase 10: Refinement — Controls visible in HA preview contexts (2026-11-18)

**Goal**: The 909 preview controls are visible in every card context — including all HA
contexts that set `preview = true` (picker, dashboard edit mode, editor dialog), where they
keep their normal appearance and are non-interactive (no response to any input) — while the
dashboard view mode stays fully interactive. Back/forward are the always-rendered controls;
the reset control stays contextual (FR-009/FR-010 — rendered only while a shift is active)
and is never rendered in a `preview = true` context (a shift cannot be activated there)
(FR-022–FR-025, research R10).
**Branch**: `1.3-dev` (user decision 2026-11-18).

**Independent Test**: In a dev HA install: (1) "Add card" picker (both "By entity" and "By
card" views), (2) dashboard edit mode, (3) card editor dialog — the card's preview shows the
back/forward controls with their normal appearance (the reset control is contextual —
FR-010 — and is not shown, since a shift cannot be activated in a preview context), and
clicking/tapping/keyboard-activating them changes nothing (no shift, no data load, no
preview indication); (4) dashboard view mode — the controls work exactly as before
(step back/forward/reset).

### Tests (write FIRST, ensure they FAIL before implementation) ⚠️

- [X] T032 In `tests/integration/picker-preview-render.test.ts`: update the existing "controls hidden" assertion (currently expects `.ebc-chart-controls` to be absent when `preview === true`) to assert the controls ARE present with `aria-disabled="true"` and `tabindex="-1"` and NO `disabled` attribute, and add inertness tests — clicking the back/forward buttons on a `preview === true` card (the reset control is not rendered in a preview context — FR-010 — and shares the same guarded entry point) leaves `previewShift` at `0`, keeps `_previewLoading` at `false`, and triggers no data load; and a dashboard view-mode card (`preview` false) is unchanged: controls interactive, no `aria-disabled`/`tabindex` overrides (FR-022, FR-023, FR-025)

### Implementation

- [X] T033 In `src/card/cumulative-comparison-chart.ts`: (a) in `_renderChartSection`, remove the `this.preview ? null :` guard so the `.ebc-chart-controls` block is always rendered (back/forward always; indication and reset stay contextual — FR-903-Y/FR-009/FR-010) (FR-022); (b) add an early `return` at the top of `_onPreviewStep` when `this.preview === true` — the single activation entry point for all three buttons, covering mouse, touch, and keyboard in every preview context (FR-022); (c) while `this.preview` is true, render the back/forward buttons with `aria-disabled="true"` and `tabindex="-1"` (omitted otherwise — NO `disabled` attribute, normal appearance; FR-023, FR-025) — the reset button is never rendered in a preview context (FR-010) and its handler is inert by the same guard; (d) update the `preview` property doc comment (and the `_renderChartSection` header) from "hides the 909 time-window preview controls" to "renders them visible but non-interactive" (research R10)

- [X] T034 [P] Cross-domain documentation consistency (no code change): 910 `spec.md` Assumptions ("non-interactive" reworded — visible, not hidden), 910 `research.md` (R2 wording; R6 SUPERSEDED banner; R7 wording), 910 `plan.md` (technical approach, constitution check, structure notes, test note), 910 `data-model.md` (`preview` semantics), 910 `quickstart.md` (where-to-edit, tests, scenario 12), 910 `contracts/picker-integration.md` (§4 Interactivity row), 903 `spec.md` FR-903-AA ("picker-mode control hiding" → non-interactivity wording), and `changelog.md` `[Unreleased]` entry (FR-022–FR-025). (910 `tasks.md` T011 and 911 T016 stay as completed history.)

**Checkpoint**: In all three preview contexts the controls are visible with normal appearance
and inert to any input; the dashboard view mode is unchanged; `npm test`, `npm run typecheck`,
and `npm run lint` are green.

---

## Phase 11: Refinement — Forward control disabled at the default (2026-11-22)

**Goal**: In dashboard view mode the forward (right) preview control is rendered in the
disabled state — visible, dimmed, per the Home Assistant disabled-button standard —
whenever the time window cannot be shifted forward, i.e. while the card is at the
configured default; while a preview shift is active the forward control is rendered
enabled. In `preview = true` contexts the controls keep their normal appearance per
FR-023 (no `disabled` attribute) and the backward and reset controls are rendered
disabled only during an in-place preview load (FR-003, FR-026, research R7).
**Branch**: `1.3-dev` (user decision 2026-11-22).

**Independent Test**: On a dashboard card at the default the forward arrow is visible
but dimmed and inert; step back one period and confirm the forward arrow becomes
enabled (and the reset control appears); step forward back to the default (or reset)
and confirm the forward arrow is disabled again. In the picker, dashboard edit mode,
and the editor dialog the forward control keeps its normal appearance with
`aria-disabled="true"` (FR-023, unchanged).

### Tests (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T035 In `tests/integration/card-render.test.ts`: in view mode (`preview === false`) the forward control is rendered with the `disabled` attribute at the default (`previewShift = 0`) while the backward control is not disabled, the reset control is absent, and neither control carries an `aria-disabled`/`tabindex` override; with an active shift (`previewShift = -1`) the forward control is enabled (and the reset control present); and after a back → forward round trip returns the card to the default the forward control is disabled again (FR-026, FR-003 bound)

- [x] T036 [P] In `tests/unit/chart-controls-styles.test.ts`: the `.ebc-chart-control:disabled` rule keeps `opacity: 0.45` and adds `pointer-events: none` so a disabled control shows no hover state and consumes no pointer events (FR-026)

### Implementation

- [x] T037 In `src/card/cumulative-comparison-chart.ts`: change the view-mode forward button binding from `?disabled=${this._previewLoading}` to `?disabled=${this._previewLoading || this.previewShift >= 0}` and extend the FR-023/FR-025 comment above the buttons with the FR-026 view-mode rule (the backward and reset controls keep `?disabled=${this._previewLoading}` only); in `src/card/energy-horizon-card-styles.ts`: add `pointer-events: none;` to the `.ebc-chart-control:disabled` rule

- [x] T038 [P] Cross-domain documentation consistency (no code change): 909 `spec.md` (FR-026, Clarifications "Session 2026-11-22" entry, Edge Case "Shifting forward past the default", US1 acceptance scenario 4), 909 `contracts/preview-controls.md` (Forward row + new Invariant 4), 909 `plan.md` (one sentence in the Summary), 909 `data-model.md` (derived-state line), 909 `quickstart.md` (scenario), 909 `research.md` (R7), and `changelog.md` `[Unreleased]` entry (FR-026 wording). README.md and `wiki-publish/` are out of scope per the user decision 2026-11-22 (the interaction is self-evident)

**Checkpoint**: In dashboard view mode the forward control is visible but disabled at the
default and enabled while a preview shift is active; the preview contexts are unchanged
(FR-023); `npm test`, `npm run typecheck`, and `npm run lint` are green.

---

## Phase 12: Refinement — Preview controls visibility toggle (`show_preview_controls`, 2026-11-23)

**Goal**: A "Preview controls" switch in the visual editor's **Chart settings** section
controls the visibility of the time-window preview controls bar (backward/forward/reset
plus the preview indication). The optional config key `show_preview_controls` (boolean,
default `true`) preserves the current behavior when absent; when `false` the bar is not
rendered in any card context — dashboard view mode and every `preview = true` context —
and no vertical space is reserved for it (FR-027). The toggle never affects the preview
state itself; it only controls whether the controls bar is mounted.
**Branch**: `main`.

**Independent Test**: Open the visual editor, switch "Preview controls" (Chart settings)
off → the saved YAML gains `show_preview_controls: false` and the card's chart section
renders without the controls bar (no buttons, no reserved space — the card is shorter
vertically). Switch it back on → the YAML gains `show_preview_controls: true` and the
bar reappears exactly as before. A card whose YAML omits the key behaves exactly as it
did before this refinement.

### Tests (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T039 In `tests/integration/preview-controls-visibility.test.ts` (new file): (a) view mode (`preview === false`) with `show_preview_controls: false` — the `.ebc-chart-controls` bar is absent from the shadow DOM (no `.ebc-preview-indication`, no back/forward/reset buttons) while the chart section still renders `.ebc-chart-wrap`; (b) view mode with the key absent and with `show_preview_controls: true` — the bar IS present (default-true regression); (c) `preview === true` (picker context) with `show_preview_controls: false` — the bar is absent in preview contexts too (FR-027 takes precedence over FR-022); (d) `setConfig` with `show_preview_controls: false` — the key is preserved in the element's config and a subsequent unrelated config change (e.g. `primary_color`) does not drop it (FR-027)

### Implementation

- [x] T040 In `src/card/types.ts`: add the optional `show_preview_controls?: boolean` key to `CardConfig` (next to `show_legend`, documented as on unless explicitly `false`, 909 FR-027); in `src/card/cumulative-comparison-chart.ts` `_renderChartSection`: compute `const showPreviewControls = this._config.show_preview_controls !== false;` and render the whole `<div class="ebc-chart-controls">` block only when true (back/forward/reset and the preview indication disappear together with the bar; no placeholder, no reserved space) in every context — update the method header comment with the FR-027 gate (FR-027; `setConfig` needs no special handling — the key passes through the `...rest` spread)

- [x] T041 [P] In `src/card/editor/field-registry.ts`: add the registry descriptor `{ key: "show_preview_controls", section: "chart", control: { kind: "boolean" }, labelKey: "editor.show_preview_controls", default: true }` after `show_legend` and bump the registry header comment (32 → 33 config-backed fields); add `editor.show_preview_controls` to all five translation files (`src/translations/en.json` "Preview controls", `pl.json` "Sterowanie podglądem", `de.json` "Vorschau-Steuerung", `fr.json` "Contrôles d'aperçu", `nl.json` "Voorbeeldbesturing"); in `tests/unit/editor-field-registry.test.ts`: add the key to the S5 chart key list, to the section-membership map (`chart`), add the default assertion (`toBe(true)`), and bump the config-backed field count (32 → 33)

- [x] T042 [P] Cross-domain documentation consistency (no code change): 909 `spec.md` (new FR-027; FR-022 "unless hidden by `show_preview_controls: false` (FR-027)" exception; Assumptions "no gating or opt-in" bullet reworded — controls are visible by default in every context and can be hidden per card), 909 `plan.md` (new "Refinement — Preview controls visibility toggle (FR-027)" section with the touch-point; Scale/Scope line and constitution check item I updated), 909 `contracts/preview-controls.md` (header "no new configuration keys" wording + a bar-level visibility rule), 904 `spec.md` (editor section table row 5), 908 `spec.md` (FR-908-D key list, S5 list, Defaults paragraph, Cross-domain Contracts "Publishes to" 909 entry), 908 `data-model.md` (§4 count + S5 row), 908 `contracts/field-registry.md` (inventory row), 908 `contracts/editor-i18n.md` (label row), 908 `quickstart.md` (full-coverage parameter list), and user docs: `README.md` (Transient Time-Window Preview section note), `README.advanced.md` (feature table, advanced chart-key table, section tables, editor field table), `wiki-publish/Configuration-and-Customization.md` (key table, section table, editor field table), `wiki-publish/How-To-Time-Windows.md` (transient preview note), and `changelog.md` `[Unreleased]` Added entry

**Checkpoint**: with `show_preview_controls: false` the card renders without the
controls bar in every context and reserves no space for it; the editor switch persists
the key in YAML; absent-key behavior is byte-identical to the pre-refinement behavior;
`npm test`, `npm run typecheck`, and `npm run lint` are green.

---

## Phase 13: Refinement — Preview series contrast (FR-018, 2026-11-23)

**Goal**: The two shifted preview series form a consistent lightness ramp from the
theme's neutral text tones: the shifted current in the theme's strongest text tone
(`--primary-text-color`) at full line strength (the dominant preview line — the brightest
gray in the dark scheme, the strongest dark tone in the light scheme), and the shifted
reference in the theme's disabled-text tone (`--disabled-text-color`) at a fixed, reduced
line opacity (de-emphasized toward the theme background in both schemes, clearly readable
above the grid lines (`--divider-color`)) (FR-018). The window/LTS arithmetic is untouched.
**Branch**: `main`.

**Independent Test**: With a preview active (a card with a reference window), the chart
shows the shifted current as the dominant (brightest) neutral line and the shifted
reference as a de-emphasized but clearly readable line — the two lines are clearly
distinguishable from each other, and the reference line stays clearly above the grid
lines; in the light HA theme the tones are the mirror image. No new YAML keys; the
preview state and all other card behavior are unchanged.

### Tests (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T043 (a) `tests/unit/renderer-config.test.ts` — `resolveChartTheme`: `previewCurrent` takes the `--primary-text-color` token value and `previewReference` the `--disabled-text-color` token value (mocked `getComputedStyle`), plus the documented fallbacks (`rgba(0, 0, 0, 0.87)` / `rgba(127, 127, 127, 0.55)`); (b) `tests/unit/echarts-renderer.test.ts` — in `previewMode` the leading series uses the `--primary-text-color` token with no line-opacity reduction and the reference series the `--disabled-text-color` token with `lineStyle.opacity === 0.85`; neither uses the config accent color (FR-018); (c) `tests/integration/card-render.test.ts` (T012) — the two-series preview draws the neutral fallbacks (`rgba(0, 0, 0, 0.87)` + `rgba(127, 127, 127, 0.55)`) with the reference series at `lineStyle.opacity === 0.85` and the leading series at full strength; the single-window preview draws a single dominant-tone series (FR-018)

### Implementation

- [x] T044 (a) `src/card/renderer-config.ts` — `resolveChartTheme()`: `previewCurrent` = the already-computed `primaryText` (the `--primary-text-color` token, fallback `rgba(0, 0, 0, 0.87)`); `previewReference` unchanged; (b) `src/card/echarts-renderer.ts` — the same change in the private `resolveChartTheme()`; the new constant `PREVIEW_REFERENCE_LINE_OPACITY = 0.85` (comment: FR-018 lightness ramp, kept clearly above the grid lines, no hardcoded colors); the preview reference series `lineStyle` gains `opacity: PREVIEW_REFERENCE_LINE_OPACITY`; the preview series comment block updated (FR-018); (c) `src/card/types.ts` — doc comments for `ChartThemeResolved.previewCurrent`/`previewReference` and `ChartRendererConfig.previewMode`/`previewSeries` (tone-scale wording)

- [x] T045 [P] Cross-domain documentation consistency (no code change): 909 `spec.md` (FR-018 rewritten to the tone scale; Clarifications Session 2026-11-23; US3 wording + distinguishability scenario; SC-007; Assumptions; edge cases), 909 `plan.md` (Summary / Technical approach / source-tree wording + the new "Refinement 2026-11-23 — Preview series contrast (FR-018)" section), 909 `research.md` (R3), 909 `data-model.md`, 909 `contracts/preview-controls.md`, 909 `checklists/requirements.md`, 909 `quickstart.md`, 902 `spec.md` (FR-902-M token mapping: `--primary-text-color` → preview shifted current; new `--disabled-text-color` row → preview shifted reference at reduced line opacity), `changelog.md` `[Unreleased]` Changed entry. (Owner decision 2026-11-23: the visual refinement is self-evident — no user-facing documentation (README/wiki) changes.)

**Checkpoint**: with a preview active, the chart shows the dominant shifted-current line
and the de-emphasized (but clearly readable above the grid) shifted-reference line in
both HA schemes; `npm test`, `npm run typecheck`, and `npm run lint` are green.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phases 3–8)**: All depend on Foundational (Phase 2) completion.
- **Polish (Phase 9)**: Depends on all desired user stories being complete.
- **Refinement (Phase 10)**: Depends on a green baseline on `1.3-dev`. T032 (tests, TDD) before T033 (implementation); T034 (docs) is parallel to T033 (different files).
- **Refinement (Phase 12)**: Depends on a green baseline. T039 (tests, TDD) before T040 (implementation); T041 (editor/translations) and T042 (docs) are parallel — different files; T043-equivalent final gate is the checkpoint itself.
- **Refinement (Phase 13)**: Depends on a green baseline. T043 (tests, TDD) before T044 (implementation); T045 (docs) is parallel — different files; the full-gate checkpoint is the final verification.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No dependencies on other stories.
- **User Story 2 (P1)**: Can start after Foundational. Builds on US1's `previewShift` state (the indication branches on it) but is independently testable.
- **User Story 3 (P1)**: Can start after Foundational. Builds on US1's shifted-period load (T008) to render the two gray series; **US1's full visual independent test (the chart showing the previous period) is completed by US3** — US1 + US3 together form the first shippable preview increment.
- **User Story 4 (P1)**: Can start after US1 (the transient contract is about the `previewShift` field US1 introduces). Largely "by construction"; the deliverable is the verification test.
- **User Story 5 (P2)**: Can start after US1 (reset acts on `previewShift`).
- **User Story 6 (P3)**: Can start after US1 + US3 (no-data rendering during a preview).

> **Coupling note**: US1 (stepping/load), US2 (indication), and US3 (two-series render) are tightly coupled in `src/card/cumulative-comparison-chart.ts` and `src/card/echarts-renderer.ts`. Treat **US1 + US3 (+ US2)** as the first complete, demoable increment; US4/US5/US6 are refinements layered on top.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution Principle III).
- Types (Phase 2) before any story implementation.
- State/handlers before load wiring before render.
- Core implementation before integration.
- Story complete before moving to the next priority.

### Parallel Opportunities

- All Foundational tasks marked [P] (T002, T003, T004) can run in parallel — different files, no dependencies.
- T005 (unit, `tests/unit/preview-shift.test.ts`) can run in parallel with the integration test tasks (different file).
- T022 (translations) can run in parallel with T021 (card element) — different files.
- Integration test tasks (T010, T012, T015, T017, T019) share `tests/integration/card-render.test.ts` and are therefore sequential, not parallel.
- Implementation tasks within a story share `src/card/cumulative-comparison-chart.ts` (or `echarts-renderer.ts`) and are sequential.

---

## Parallel Example: User Story 1

```text
# Launch the unit tests for User Story 1 (after Foundational T004):
Task: "Unit tests for the shifted-window helper in tests/unit/preview-shift.test.ts" (T005)

# In a different file, the integration tests for other stories can proceed in parallel:
Task: "Integration test for the preview indication in tests/integration/card-render.test.ts" (T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 3)

1. Complete Phase 1: Setup (baseline green).
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1 (state, handlers, shifted-period load, back/forward controls).
4. Complete Phase 5: User Story 3 (two gray-toned series render, live series hidden).
5. **STOP and VALIDATE**: step back one period → the chart shows the previous period as two gray-toned series with the live series hidden; the saved configuration is unchanged.
6. (Add Phase 4: User Story 2 for the preview indication to complete the "this is a preview" signal.)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add US1 + US3 (+ US2) → Test independently → Demo (MVP: the core preview loop).
3. Add US4 → Test independently (transient contract verified).
4. Add US5 → Test independently (reset).
5. Add US6 → Test independently (no/partial data).
6. Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together (T002/T003/T004 in parallel).
2. Once Foundational is done:
   - Developer A: US1 + US3 (the coupled core, in `cumulative-comparison-chart.ts` + `echarts-renderer.ts`).
   - Developer B: US2 + US5 (indication + reset, `cumulative-comparison-chart.ts` — coordinate file ownership with A).
   - Developer C: US4 + US6 (transient + no-data verification, `cumulative-comparison-chart.ts` + tests).
3. Because the implementation is concentrated in two files, coordinate to avoid same-file conflicts; the test files (`preview-shift.test.ts`, `card-render.test.ts`) are the main shared surfaces.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to a specific user story for traceability.
- Each user story should be independently completable and testable (US1+US3 form the first complete increment — see coupling note).
- Verify tests fail before implementing (Constitution Principle III).
- Commit after each task or logical group.
- Stop at any checkpoint to validate the story independently.
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence.
- No new npm dependencies, no new HA APIs, no persisted state (plan Constraints).
