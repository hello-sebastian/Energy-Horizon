---
description: "Technical plan for the chart rendering and interaction domain (902)"
---

# Plan: Chart Rendering & Interaction

**Input**: `specs/902-chart-rendering-interaction/spec.md` (FR-902-AE), sibling domains 905 (localization & formatting) and 909 (time-window preview), assessment handoff `.specify/assessments/tooltip-period-names/decision.md` (verdict GO, Option A, issue #74)

**Status**: Implemented — task list in `specs/902-chart-rendering-interaction/tasks.md` (Phase 1, T001–T009).

## Summary

The chart's tooltip and legend rows carry the **concrete localized period name** of the period each row represents ("2025", "listopad 2026") whenever the row's window is calendar-nameable. Rows whose window is not calendar-nameable fall back to a **role-aware** generic label. The `period.current` ("Current period") label is reserved for the actual current (green) series and never labels a rolled-back (preview) window; a preview current row falls back to the neutral `period.generic` ("Period").

## Technical Context

Existing stack — no new dependencies, no new HA APIs, no persisted state:

- **Language/framework**: TypeScript (strict), Lit custom element (`src/card/cumulative-comparison-chart.ts`), ECharts renderer (`src/card/echarts-renderer.ts`).
- **Date math**: Luxon (`DateTime`, IANA zones). `npm test` runs with `TZ=UTC`; zone behavior is exercised via explicit zone arguments.
- **Tests**: Vitest + jsdom, `tests/unit/` and `tests/integration/`; gate = `npm test && npm run typecheck && npm run lint && npm run build`.
- **i18n**: `src/translations/{en,pl,de,fr,nl}.json`, loaded by `src/card/localize.ts` (`resolveLocale`, `createLocalize`); `ResolvedLocale { language, numberFormat, timeZone }`.

## Architecture

### Label logic — `src/card/labels/period-label.ts`

The file is the single source for period labels (FR-905-N). It already exports `formatPeriodLabel(instant, locale, zone)` (January 1 start → year alone; otherwise localized long month + year; the documented host-zone quirk is preserved byte-for-byte — not altered here).

Two pure functions are added next to it:

- **`isNameablePeriod(start: Date, end: Date, role: WindowRole, zone: string): boolean`** — calendar-nameability predicate (FR-905-O). With `s = DateTime.fromJSDate(start, { zone })` and `e1 = DateTime.fromJSDate(end, { zone }).plus({ milliseconds: 1 })`, a window is nameable when any of:
  1. **Full year**: `s.month === 1 && s.day === 1 && e1.equals(s.startOf("year").plus({ years: 1 }))`;
  2. **Full month**: `s.day === 1 && e1.equals(s.startOf("month").plus({ months: 1 }))`;
  3. **In-progress current**: `role === "current" && (s.month === 1 || s.day === 1)` — the in-progress current window (unit-boundary start, `end = now`) represents its nominal unit, consistent with `expandCurrentWindowForCaption`. The exception applies only to `role === "current"`.

  Decidability from geometry: legacy presets resolve the current window to a unit-boundary start with `end = now` (in progress) and the reference to a unit-boundary start with `end = unit − 1 ms` (full unit); generic/custom/multi-window windows resolve to `start → start + duration − 1 ms`. Only calendar-unit-aligned geometries (or the in-progress current) are nameable — custom 30d/6M/2M/week-based windows are not.

- **`rowPeriodLabel(w: ResolvedWindow, index: number, isPreview: boolean, locale: string, zone: string, localize: LocalizeFunction): string`** — the row-label contract (FR-905-P, FR-902-AE):
  1. Nameable (`isNameablePeriod(w.start, w.end, w.role, zone)`) → `formatPeriodLabel(w.start, locale, zone)`;
  2. `index === 0 && !isPreview` → `localize("period.current")`;
  3. `index === 0 && isPreview` → `localize("period.generic")` — **never** `period.current` (owner constraint);
  4. `index === 1` → `localize("period.reference")`;
  5. `index >= 2` → `${localize("period.reference")} (${index})` (existing form kept).

  **Uniqueness invariant**: row labels are pairwise distinct per chart (calendar-stepped windows + the index suffix), which protects the renderer's tooltip `seriesName` matching.

### i18n — `src/translations/*.json`

`period.generic` is added in all 5 locales next to the existing `period.current` / `period.reference` keys: en "Period", pl "Okres", de "Zeitraum", fr "Période", nl "Periode". Its presence in all 5 files is an automated check (narrative mandatory-keys test), in the style of FR-905-L.

### Wiring — `src/card/cumulative-comparison-chart.ts` (the only element-level seams)

The renderer is **not** changed: row names flow through the existing `update(series, timeline, config, labels)` argument (main rows) and through each context row's `periodLabel` (`comparisonSeries.context[].periodLabel`, renderer `:1538`), both of which the element already supplies.

1. **`labelForIndex` closure in `_fetchLtsSeries`** (~:608–612): `_fetchLtsSeries` gains a `resolved: ResolvedLocale` parameter (sole caller `_loadData` ~:489 passes its `resolved`); the closure maps window index `i` through `rowPeriodLabel(windows[i], i, false, resolved.language, resolved.timeZone, localize)` (existing generic i18n form when the window is absent). This drives the context rows' `periodLabel` via `mapLtsResponseToCumulativeSeries` → `assembleComparisonSeries` and the main rows' stored `periodLabel`s.
2. **`updated()` default branch** (~:464–467): the `labels` argument is built from `state.resolvedWindows` with `isPreview = false` (guarded for absent windows, falling back to the existing i18n keys).
3. **`updated()` preview branch** (~:457–460): the `labels` argument is built from `state.preview?.windows` with `isPreview = true` (preview current → concrete name or `period.generic`; preview reference keeps its concrete name or `period.reference`). This fixes the pre-existing mislabel where a preview current row showed "Current period".
4. **Consistency**: `_buildPreviewSnapshot` (~:691, ~:703) builds the preview current/reference `periodLabel`s with the same mapping; the preview no-data `seriesForChart` `periodLabel` (~:430) uses the same mapping instead of the `period.current` i18n key.

### Explicitly out of scope

`src/card/echarts-renderer.ts` (consumes labels as-is), `src/card/time-windows/`, `ha-api.ts`, `renderer-config.ts` (its `periodLabel` field stays dead — 911's concern), axis ticks, tooltip headers, summary captions (`summary.current_period` is a different key), the picker 910 demo (v2), forecast (v2). The `Preview: <period>` badge already uses `formatPeriodLabel` and stays.

## File Structure

| File | Change |
|------|--------|
| `src/card/labels/period-label.ts` | add `isNameablePeriod`, `rowPeriodLabel` |
| `src/card/cumulative-comparison-chart.ts` | the 4 wiring seams above |
| `src/translations/{en,pl,de,fr,nl}.json` | add `period.generic` |
| `tests/unit/period-row-label.test.ts` | **new** — predicate matrix, fallback matrix, 5 locales, uniqueness, i18n guard |
| `tests/integration/tooltip-panel-consistency.test.ts` | pinned fixtures → new names; new preview/custom cases |
| `tests/unit/cumulative-comparison-chart-localization.test.ts` | pinned fixtures → new names |
| `tests/integration/pipeline-characterization.test.ts` | pinned fixtures → new names |
| `tests/unit/narrative-mandatory-keys.test.ts` | `period.generic` presence assertion (all 5 locales) |

## Test Strategy

TDD-first (Constitution III, narrative/labels domain): the predicate and row-label tests are written first and fail before the implementations (T001/T003 red → T002/T004 green). Wiring tasks (T005/T006) are verified by typecheck + lint + the test suite with the pinned fixtures (updated in T007) as the only allowed failures. Zone behavior is pinned via explicit zone arguments (`UTC`, `America/Chicago` across DST, `Asia/Kolkata`), not the process TZ. The full gate (T009) includes `npm run build` with dist parity.

## Constraints

- No new npm dependencies, no new HA APIs, no persisted state.
- `formatPeriodLabel`'s documented zone quirk is preserved (byte-for-byte parity, 911 FR-019) — not fixed here.
- Spec artifacts stay in the present tense; no change-history sections (refine-eh single-source-of-truth rule).
