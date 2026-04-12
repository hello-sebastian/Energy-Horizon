# Tasks: Card UI Enhancements (001-card-ui-enhancements)

**Input**: Design documents from `specs/001-card-ui-enhancements/`  
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `research.md`  
**Branch**: `001-card-ui-enhancements`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1–US5 — maps the task to a specific user story from `spec.md`

---

## Phase 1: Setup

**Purpose**: Verify working baseline before any changes are made.

- [x] T001 Verify `git checkout 001-card-ui-enhancements` (or create branch from main)
- [x] T002 [P] Confirm `npm install` passes without errors in the repository root
- [x] T003 [P] Confirm `npm test` passes (green baseline) before any edits
- [x] T004 [P] Confirm `npm run build` produces `dist/energy-horizon-card.js` without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared type extensions needed by US1, US2, and US5 before implementing any rendering logic.

**⚠️ CRITICAL**: Complete fully before starting Phases 3–7.

- [x] T005 Add typed `states` field to `HomeAssistant` interface in `src/ha-types.ts`. Field signature: `states?: Record<string, { state: string; attributes: Record<string, unknown> }>`. This eliminates the existing `as` casts that access entity attributes.
- [x] T006 [P] Add three optional fields to `CardConfig` in `src/card/types.ts`: `show_title?: boolean` (default `true`), `icon?: string` (e.g. `"mdi:solar-power"`), `show_icon?: boolean` (default `true`). Keep all existing fields unchanged.
- [x] T007 [P] Add one optional field to `CardState` in `src/card/types.ts`: `period?: ComparisonPeriod`. Set alongside `comparisonSeries` in the `_loadData()` success path; `undefined` in all other states.

**Checkpoint**: Both `src/ha-types.ts` and `src/card/types.ts` compile under `tsc --strict` with zero new errors. ✅ VERIFIED

---

## Phase 3: User Story 1 – Card Title Header (Priority: P1) 🎯 MVP

**Goal**: The card displays a title at the top. Falls back automatically to entity `friendly_name`, then entity ID. Hideable via `show_title: false`.

**Independent Test**: Render the card with (a) no `title` config, (b) `title: "My Solar"`, (c) `show_title: false`, (d) `title: ""` — verify correct text or absence in each case.

### Implementation for User Story 1

- [x] T008 [US1] Add `.ebc-title-row` and `.ebc-title` CSS rules to `src/card/energy-horizon-card-styles.ts`. `.ebc-title-row` is a flex row container (`display: flex; align-items: center; gap: 8px`); `.ebc-title` sets font weight and color via `var(--primary-text-color)`.
- [x] T009 [US1] In `src/card/cumulative-comparison-chart.ts`, inside `render()`, compute:
  - `const showTitle = this._config.show_title !== false;`
  - `const entityState = this.hass?.states?.[this._config.entity];`
  - `const effectiveTitle = (this._config.title?.trim() || entityState?.attributes.friendly_name as string | undefined || this._config.entity) as string;`
  - Render a `<div class="ebc-title-row">` containing `<span class="ebc-title">${effectiveTitle}</span>` only when `showTitle && !!effectiveTitle`. Wrap the whole header in a guard: if neither title nor icon should show, omit the `.ebc-title-row` container entirely (FR-009).
- [x] T010 [US1] Write unit tests for title resolution logic in `tests/unit/card-header-resolution.test.ts` (new file). Cover: no `title` config → `friendly_name` is used; `title: "My Solar"` → `"My Solar"` returned; `title: ""` → `friendly_name` fallback; entity has no `friendly_name` → entity ID fallback; `show_title: false` → `showTitle` flag is `false`.

**Checkpoint**: `npm test` passes; card shows entity `friendly_name` by default, custom title when configured, and nothing when `show_title: false`.

---

## Phase 4: User Story 2 – Card Pictogram (Priority: P2)

**Goal**: The card displays an icon (`<ha-icon>`) to the left of the title. Falls back to the entity's icon attribute. Hideable via `show_icon: false`. Omitted gracefully if no icon is available.

**Independent Test**: Render the card with (a) no `icon` config but entity has icon, (b) `icon: "mdi:flash"`, (c) `show_icon: false`, (d) no `icon` and entity has no icon — verify correct icon or absence.

### Implementation for User Story 2

- [x] T011 [US2] Add `.ebc-icon` CSS rule to `src/card/energy-horizon-card-styles.ts`. Style: `display: inline-flex; --mdc-icon-size: 24px;` to size the `<ha-icon>` element consistently.
- [x] T012 [US2] In `src/card/cumulative-comparison-chart.ts`, inside `render()`, compute:
  - `const showIcon = this._config.show_icon !== false;`
  - `const effectiveIcon = this._config.icon?.trim() || (entityState?.attributes.icon as string | undefined);`
  - Inside the `.ebc-title-row` container (from T009), prepend `html\`<ha-icon class="ebc-icon" icon=${effectiveIcon}></ha-icon>\`` only when `showIcon && !!effectiveIcon`. Update the header guard condition to: `(showTitle && !!effectiveTitle) || (showIcon && !!effectiveIcon)`.
- [x] T013 [US2] Add icon test cases to `tests/unit/card-header-resolution.test.ts`. Cover: no `icon` config, entity has `icon` attribute → entity icon used; `icon: "mdi:flash"` → `"mdi:flash"` as `effectiveIcon`; `show_icon: false` → `showIcon` flag is `false`; entity has no icon and no `icon` config → `effectiveIcon` is `undefined`; both `show_title: false` + `show_icon: false` → header guard evaluates to `false`.

**Checkpoint**: `npm test` passes; icon appears next to title, falls back to entity icon, disappears on `show_icon: false`, and entire header row is omitted when both flags are false.

---

## Phase 5: User Story 3 – Explicit +/- Sign on Difference Values (Priority: P3)

**Goal**: Difference statistics always show an explicit `+` or `−` (U+2212) sign prefix when non-zero. Zero values show no sign prefix.

**Independent Test**: Render with current > reference, current < reference, and current = reference — verify sign prefix on Wh and % difference rows in all three cases.

### Implementation for User Story 3

- [x] T014 [US3] Implement pure helper function `formatSigned` in `src/card/cumulative-comparison-chart.ts` (module-level, before `render()`). Signature: `function formatSigned(value: number, formatter: Intl.NumberFormat, unit: string): string`. Logic: `value > 0` → `` `+${formatter.format(value)} ${unit}` ``; `value < 0` → `` `\u2212${formatter.format(Math.abs(value))} ${unit}` ``; `value === 0` → `` `${formatter.format(0)} ${unit}` ``.
- [x] T015 [US3] In `src/card/cumulative-comparison-chart.ts`, replace the existing difference value rendering (Wh row) and percentage difference rendering (% row) in `render()` to call `formatSigned()` instead of the current plain `formatter.format(value) + " " + unit` pattern.
- [x] T016 [P] [US3] Write unit tests for `formatSigned` in `tests/unit/ha-api.test.ts` (extend existing file). Cover: positive value → `+` prefix; negative value → `−` (U+2212) prefix and `Math.abs(value)` formatted; zero → no sign prefix; check that the `unit` string is appended correctly.

**Checkpoint**: `npm test` passes; rendered difference stats show `+12.5 kWh`, `−12.5 kWh`, or `0.0 kWh` as appropriate.

---

## Phase 6: User Story 4 – Remove Duplicate "Historical Value" Statistic (Priority: P4)

**Goal**: The "Historical value" row is removed from the forecast section. Only "Consumption in reference period" remains. Translation keys removed from all three language files.

**Independent Test**: Enable the forecast feature with reference data — confirm `historical_value` row is absent from the rendered DOM; confirm "Consumption in reference period" is present.

### Implementation for User Story 4

- [x] T017 [P] [US4] Remove the `forecast.historical_value` key from `src/translations/en.json`
- [x] T018 [P] [US4] Remove the `forecast.historical_value` key from `src/translations/de.json`
- [x] T019 [P] [US4] Remove the `forecast.historical_value` key from `src/translations/pl.json`
- [x] T020 [US4] In `src/card/cumulative-comparison-chart.ts`, delete the rendering block for the "Historical value" row (the block that uses the `forecast.historical_value` translation key and renders `forecast.reference_total` a second time). Keep the "Consumption in reference period" block untouched.
- [x] T021 [US4] In `tests/integration/card-render.test.ts`, add assertion: forecast section contains no element with text matching `historical_value` translation; also assert "Consumption in reference period" row is present with correct value.

**Checkpoint**: `npm test` passes (no reference to removed translation key or DOM element); forecast section shows exactly one reference-period statistic row. ✅ VERIFIED

---

## Phase 7: User Story 5 – Time Period Context in Statistic Labels (Priority: P5)

**Goal**: Summary period labels include a parenthetical **compact** date qualifier derived from resolved windows and HA time zone (`formatCompactPeriodCaption`). Supersedes the original T023–T025 `buildPeriodSuffix` / `Intl` long-month approach (2026-04+).

**Independent Test**: `tests/unit/period-label.test.ts` covers full year, full month, ranges, peer-year disambiguation, hourly captions; card render still shows parenthetical qualifiers on current/reference.

### Implementation for User Story 5

- [x] T022 [US5] In `src/card/cumulative-comparison-chart.ts`, in the `_loadData()` success path, set `this._state.period = comparisonPeriod` (the `ComparisonPeriod` returned from `buildComparisonPeriod()`). Use the `CardState.period` field added in T007.
- [x] T023 [US5] ~~`buildPeriodSuffix`~~ **Replaced**: implement `formatCompactPeriodCaption` (+ `resolvedWindowForCaption`, `hour12FromHaTimeFormat`) in `src/card/labels/compact-period-caption.ts` (Luxon, HA `time_zone`, label locale).
- [x] T024 [US5] In `render()`, when `_state.status === 'ready' && _state.period`, compute suffixes via `formatCompactPeriodCaption(wCurrent, wReference, opts)` and swapped peer for the reference column; append ` (${suffix})` to accessible labels / captions as before.
- [x] T025 [P] [US5] Unit tests in `tests/unit/period-label.test.ts` target `formatCompactPeriodCaption` (and `isForecastLineVisible`).

**Checkpoint**: `npm test` passes; qualifiers remain unambiguous and locale-aware; narrow layouts use short months and compressed ranges.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, lint, and build before PR.

- [x] T026 [P] Run `npm test` (full suite) and fix any failing tests introduced by the changes above
- [x] T027 [P] Run `npm run lint` and fix all TypeScript/ESLint errors in modified files
- [x] T028 Run `npm run build` and verify `dist/energy-horizon-card.js` builds without errors or type warnings
- [x] T029 Manually smoke-test the card in a Home Assistant instance (or `index.html` dev harness): verify title, icon, signed diffs, no "Historical value" row, and period labels are all present and correct

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 – Setup**: No dependencies. Run immediately.
- **Phase 2 – Foundational**: Depends on Phase 1. **Blocks all user story phases.**
- **Phase 3 – US1 (Title)**: Requires Phase 2 complete.
- **Phase 4 – US2 (Icon)**: Requires Phase 3 complete (shares `.ebc-title-row` container built in T009).
- **Phase 5 – US3 (Signed diffs)**: Requires Phase 2. Fully independent of US1/US2/US4/US5 — can run in parallel with Phase 3 or 4 if files don't conflict.
- **Phase 6 – US4 (Remove historical value)**: Requires Phase 2. Fully independent of all other user stories — can run in parallel with any other phase.
- **Phase 7 – US5 (Period labels)**: Requires Phase 2 (T007 — `CardState.period` type must exist first).
- **Phase 8 – Polish**: Requires all prior phases complete.

### Parallel Opportunities

- T002, T003, T004 (Phase 1): all parallel — no file conflicts.
- T006, T007 (Phase 2): parallel — both modify `src/card/types.ts` in the same block; complete atomically or in sequence within the same task.
- T017, T018, T019 (Phase 6): fully parallel — three independent JSON files.
- T016 (US3 tests in `ha-api.test.ts`) and T025 (US5 tests in `period-label.test.ts`): parallel — different test files.
- Phase 5 (US3) and Phase 6 (US4) can be executed concurrently if the developer works on different files (T014/T015 touch `cumulative-comparison-chart.ts`; T017–T019 touch only JSON files).

### MVP Scope

Minimum viable increment is **US1 (Phase 3)**: the title header is the highest-impact orientation element. US2–US5 are independently valuable but not blocking for a first deployable increment.

Recommended delivery order: **US1 → US2 → US3 → US4 → US5**, matching priority order P1–P5.

---

## Task Count Summary

| Phase | Tasks | User Story |
|-------|-------|------------|
| Phase 1 – Setup | T001–T004 | — |
| Phase 2 – Foundational | T005–T007 | — |
| Phase 3 – US1 Title | T008–T010 | US1 |
| Phase 4 – US2 Icon | T011–T013 | US2 |
| Phase 5 – US3 Signed Diffs | T014–T016 | US3 |
| Phase 6 – US4 Remove Historical | T017–T021 | US4 |
| Phase 7 – US5 Period Labels | T022–T025 | US5 |
| Phase 8 – Polish | T026–T029 | — |
| **Total** | **29 tasks** | **5 user stories** |
