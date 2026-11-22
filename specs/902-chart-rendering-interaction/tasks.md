---
description: "Task list for the chart rendering and interaction domain (902)"
---

# Tasks: Chart Rendering & Interaction

**Input**: Design documents from `/specs/902-chart-rendering-interaction/`

**Prerequisites**: spec.md (required); sibling domain specs 905 (localization & formatting) and 909 (time-window preview) for the label contract; assessment handoff `.specify/assessments/tooltip-period-names/decision.md` (2026-11-22, verdict GO, Option A, issue #74)

**Tests**: Included — Constitution Principle III (TDD-first, narrative/labels domain): failing tests written before the implementations they drive.

**Organization**: Single refinement phase (delivered via `refine-eh`; no new spec number).

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Source: `src/card/labels/period-label.ts`, `src/card/cumulative-comparison-chart.ts`, `src/translations/`
- Tests: `tests/unit/`, `tests/integration/` (existing Vitest + jsdom layout)

---

## Phase 1: Refinement — Concrete period names on tooltip/legend rows (2026-11-22)

**Goal**: Chart tooltip and legend rows show the concrete localized calendar period name of the period a row represents (e.g. "2025", "listopad 2026") whenever the row's window is calendar-nameable; otherwise a role-aware generic fallback is used. The `period.current` ("Current period") label is reserved for the actual current (green) series and must never label a rolled-back (preview) window (owner constraint 2026-11-22; issue #74).

**Scope (Option A)**: pure label logic in `src/card/labels/period-label.ts` + wiring seams in `src/card/cumulative-comparison-chart.ts` + the `period.generic` key in all 5 locale files. Explicitly NOT touched: `src/card/echarts-renderer.ts`, `src/card/time-windows/`, `ha-api.ts`, `renderer-config.ts` (its `periodLabel` field stays dead, 911's concern), axis ticks, tooltip headers, summary captions, picker 910 demo, forecast.

**Label contract** (the `rowPeriodLabel` rules): a nameable window → `formatPeriodLabel(w.start, locale, zone)`; otherwise `index === 0 && !isPreview` → `period.current`; otherwise `index === 0 && isPreview` → `period.generic` ("Period" — never "Current period"); otherwise `index === 1` → `period.reference`; otherwise `index >= 2` → `period.reference (n)` (existing form kept). Nameability predicate: `isNameablePeriod(start, end, role, zone)` — exact unit boundary (year: Jan 1 start, end = Jan 1 next year − 1 ms; month: day-1 start, end = next month day-1 − 1 ms) or the in-progress-current exception (`role === "current"` with a unit-boundary start; the in-progress current window represents its nominal unit, consistent with `expandCurrentWindowForCaption`).

### TDD: predicate + row-label unit tests (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T001 Failing unit tests for the `isNameablePeriod(start: Date, end: Date, role: WindowRole, zone: string)` predicate (implemented in T002 in `src/card/labels/period-label.ts`) in a NEW file `tests/unit/period-row-label.test.ts`: nameable year (start Jan 1, end Jan 1 next year minus 1 ms); nameable month (start day 1, end = start-of-month + 1 month minus 1 ms); in-progress current via the role exception — `role === "current"`, start Jan 1, end = now (any day) → nameable (nominal year), and `role === "current"`, start day 1 (not Jan 1), end = now → nameable (nominal month); the role exception applies ONLY to `role === "current"` (same in-progress geometry with `role === "reference"` or `"context"` → not nameable); non-nameable: custom 30d window anchored at now (arbitrary start day), 6M/2M durations, week-based window (start_of_week, arbitrary weekday), start not on a calendar boundary (e.g. offset `30d`); zone matrix: `UTC`, `America/Chicago` (across a DST transition), `Asia/Kolkata` (UTC+5:30) — calendar identity is evaluated in the passed zone. These tests MUST fail before T002 (import does not exist), not with a build error
- [x] T002 Implement `isNameablePeriod(start: Date, end: Date, role: WindowRole, zone: string): boolean` in `src/card/labels/period-label.ts` next to `formatPeriodLabel` (FR-905-N single source; preserve the file's documented zone handling — do not alter `formatPeriodLabel`): `s = DateTime.fromJSDate(start, {zone})`, `e1 = DateTime.fromJSDate(end, {zone}).plus({milliseconds: 1})`; nameable ⟺ (year: `s.month === 1 && s.day === 1 && e1.equals(s.startOf("year").plus({years: 1}))`) OR (month: `s.day === 1 && e1.equals(s.startOf("month").plus({months: 1}))`) OR (in-progress current: `role === "current" && (s.month === 1 || s.day === 1)`). Verify: T001 matrix green; full gate green

### TDD: row-label fallback tests (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T003 Failing unit tests for `rowPeriodLabel(w: ResolvedWindow, index: number, isPreview: boolean, locale: string, zone: string, localize: LocalizeFunction)` (implemented in T004 in `src/card/labels/period-label.ts`) in the same NEW file `tests/unit/period-row-label.test.ts`: concrete-name cases — YoY reference window (1 I 2025 → 1 I 2026 − 1 ms) → "2025"; in-progress YoY current (1 I 2026 → now, role exception) → "2026"; MoM current (day-1 start, in progress) → "listopad 2026" (pl) / "November 2026" (en); a nameable preview current row (shifted, day-1 start, completed) → its concrete name (never "Current period"); fallback cases — non-nameable default current (index 0, `isPreview=false`) → `localize("period.current")`; non-nameable preview current (index 0, `isPreview=true`) → `localize("period.generic")`; index 1 non-nameable → `localize("period.reference")`; index ≥ 2 non-nameable → `${localize("period.reference")} (${index})`; 5-locale matrix for the fallback strings (en capitalized; pl/de/fr/nl per ICU); uniqueness invariant: the labels of 24 consecutive monthly windows (2 years of month-based rows, index-suffixed where needed) are pairwise distinct per chart (protects the renderer's tooltip `seriesName` matching); i18n guard: `period.generic` exists in all 5 files `src/translations/{en,pl,de,fr,nl}.json` with the signed-off values (en "Period", pl "Okres", de "Zeitraum", fr "Période", nl "Periode"). These tests MUST fail before T004, not with a build error
- [x] T004 Implement `rowPeriodLabel` in `src/card/labels/period-label.ts` per the T003 contract (nameable → `formatPeriodLabel(w.start, locale, zone)`; otherwise the role-aware fallbacks above; a preview current row never resolves to `period.current`); add `period.generic` to all 5 translation files `src/translations/en.json`, `pl.json`, `de.json`, `fr.json`, `nl.json` next to the existing `period.current` / `period.reference` keys (en "Period", pl "Okres", de "Zeitraum", fr "Période", nl "Periode"). Verify: T003 matrix green; full gate green

### Wiring (no renderer changes — labels flow through the existing `update(series, timeline, config, labels)` argument and the context rows' `periodLabel`)

- [x] T005 Wire the default (non-preview) label path in `src/card/cumulative-comparison-chart.ts`: (a) `labelForIndex` closure inside `_fetchLtsSeries` (~:608–612) — `_fetchLtsSeries`'s signature gains `resolved: ResolvedLocale` (sole caller `_loadData` ~:489 passes its `resolved`); body: when `windows[i]` exists → `rowPeriodLabel(windows[i], i, false, resolved.language, resolved.timeZone, localize)`, else the existing generic i18n form (this drives the context rows' `periodLabel` via `mapLtsResponseToCumulativeSeries` → `assembleComparisonSeries`); (b) `updated()` default branch (~:464–467) — the `labels` argument is built from `state.resolvedWindows`: `labels.current = rowPeriodLabel(w0, 0, false, …)`, `labels.reference = rowPeriodLabel(w1, 1, false, …)` (guarded for absent windows, falling back to the existing i18n keys). Verify: `npm run typecheck && npm run lint` green; `npm test` — failures allowed ONLY in the T007 pinned fixture files (they pin the old generic row names), nothing else
- [x] T006 Wire the preview label path in `src/card/cumulative-comparison-chart.ts` (fixes the pre-existing mislabel — a preview current row currently shows "Current period"): (a) `updated()` preview branch (~:457–460) — the `labels` argument is built from `previewWindows` with `isPreview = true` (preview current → concrete name or `period.generic`; preview reference keeps its concrete name or `period.reference`); (b) `_buildPreviewSnapshot` (~:691, ~:703) — the preview current/reference `periodLabel`s built with the same `rowPeriodLabel` mapping (`isPreview = true` for the current row) so the state snapshot is consistent with the rendered rows; (c) the preview no-data `seriesForChart` `periodLabel` (~:430) — same mapping (replaces the `period.current` i18n key), so a no-data preview never shows "Current period". Verify: `npm run typecheck && npm run lint` green; `npm test` — failures allowed ONLY in the T007 pinned fixture files, nothing else

### Fixture updates

- [x] T007 Update the pinned row-label fixtures — `tests/integration/tooltip-panel-consistency.test.ts` (add the new preview and custom-window cases), `tests/unit/cumulative-comparison-chart-localization.test.ts`, `tests/integration/pipeline-characterization.test.ts` — asserting the new concrete period names and the role-aware preview fallbacks; verify-only (change ONLY if a file pins row names): `tests/integration/picker-preview-render.test.ts`, `tests/unit/ha-api.test.ts`, `tests/unit/view-model.test.ts`, `tests/unit/aggregation.test.ts`, `tests/unit/localize-dutch.test.ts`, `tests/unit/localize-static-text-guard.test.ts`, `tests/unit/narrative-mandatory-keys.test.ts` (this one gains the `period.generic` presence assertion for all 5 locales). Verify: full gate green

### Spec propagation (present tense; no change-history sections)

- [x] T008 Update the domain specs: (a) `specs/902-chart-rendering-interaction/spec.md` — new FR-902-AE (tooltip/legend rows show the concrete localized period name of the row's window when calendar-nameable, with the role-aware fallbacks; "Current period" reserved for the green current series), a chart-elements table row for the tooltip/legend row labels, and an edge case (preview current row shows the shifted period's name or "Period", never "Current period"); (b) `specs/905-localization-formatting/spec.md` — extend the "Period labels" section: new FR-905-O (`isNameablePeriod` predicate — the single source of calendar-nameability) and FR-905-P (role-aware row-label fallback contract; `period.generic` mandatory in all 5 locales with an automated presence check in the style of FR-905-L), plus the Key Entities rows; (c) `specs/909-timewindow-preview/spec.md` — strengthen FR-021: the row labels reflect the shifted series (concrete name where nameable) and the preview current row is never labeled "Current period"; (d) each touched spec's "Last updated" → 2026-11-22; (e) append the delivery-path line to `.specify/assessments/tooltip-period-names/decision.md` (delivered via `refine-eh` across 902/905/909, no new spec number, 2026-11-22). Verify: full gate green

### Final gate

- [x] T009 Run the full verification gate from the repo root: `npm test` (sets TZ=UTC), `npm run typecheck`, `npm run lint`, `npm run build` + dist parity check (zero diff against the committed `dist/` except the intended label logic). No code change beyond what T001–T008 made; report the result

---

## Notes

- TDD: T001 and T003 are red steps (failing tests written first — Constitution Principle III); the green step is the immediately following implementation task. Verifying a red step = the new tests fail for the intended reason (missing export), not a build/compile error.
- T005/T006 intentionally leave the pinned fixtures (T007) red until T007; their gate excludes exactly those fixture files.
- No new npm dependencies, no new HA APIs, no persisted state.
- Uniqueness invariant: row labels are pairwise distinct per chart (calendar-stepped windows + index suffix) — protects the renderer's tooltip `seriesName` matching.
- No commits in this session unless requested.
