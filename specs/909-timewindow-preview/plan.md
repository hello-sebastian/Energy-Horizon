# Implementation Plan: Transient Time-Window Preview

**Branch**: `909-timewindow-preview` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a **transient time-window preview** to the Energy Horizon card: in-card controls (backward/forward arrows + a reset control) that step the displayed time window by one nominal window width at a time, so the user can inspect past periods without touching the persisted configuration. The shift is purely temporary — it never modifies the saved config and is discarded whenever the card is re-instantiated (dashboard switch, view switch, page reload). While a preview is active, the chart shows only the shifted historical series — the shifted current period (light gray) and the shifted reference period (darker gray) — and hides the live current and reference series; all other panels (summary, delta/interpretation, narrative) remain visible and unchanged, reflecting the default configuration and the current data series.

**Technical approach**: The preview shift is implemented by re-running the existing pure window resolver `resolveTimeWindows(merged, now, timeZone, …)` with a **shifted `now`** — `now` moved backward by the window's nominal `duration`, applied once per step via the same `DateTime.minus(Duration)` algebra the card already uses (`minusStepRepeated`). This reuses the card's existing window arithmetic (calendar-aware for year/month/week, exact for day/hour/minute/second) with no width-specific special-casing. The preview state is a plain, non-persisted field on the card element (discarded on re-instantiation). In preview mode the card additionally queries the shifted current and reference periods and renders them as two gray-toned series (shifted current in light gray, shifted reference in a darker gray); the default analytical pipeline (summary, forecast, interpretation, narrative) is left untouched.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.6 (strict mode; `tsc --noEmit` typecheck gate)

**Primary Dependencies**: Lit 3.1 (Web Components), ECharts 5.6 (modular imports), Luxon 3.7 (date/time algebra), date-fns 4.1 (existing)

**Storage**: None — preview state is a transient in-memory field on the card element; no persistence, no new HA APIs

**Testing**: Vitest 2.1 (unit + integration), jsdom 25 for DOM; `TZ=UTC vitest run`

**Target Platform**: Home Assistant Lovelace (browser), distributed via HACS; must respect HA light/dark themes

**Project Type**: Browser-side custom card (Lit Web Component) for Home Assistant Lovelace

**Performance Goals**: Preview stepping must not block the main thread; the extra shifted-period queries are one LTS `statistics_during_period` call per series (current + reference), coalesced by the existing generation mechanism so rapid stepping does not fire redundant queries

**Constraints**: No new npm dependencies; no new HA APIs; no persisted state; must not re-render the whole card on every `hass` update (existing coalescing preserved); TypeScript strict (no `any`)

**Scale/Scope**: Single card component; ~3 new controls + 1 preview indication + 1 two-series preview render path; touches `cumulative-comparison-chart.ts`, `echarts-renderer.ts`, `types.ts`, `time-windows/`, and the four translation files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | HA/HACS ecosystem compliance | ✅ Pass | No new HA APIs; reuses existing LTS `statistics_during_period`; respects edit/view modes; no config-schema change (preview is view-mode only) |
| II | Security & fault tolerance | ✅ Pass | No new untrusted input surface (controls are internal); shifted-period no-data handled gracefully; defensive reuse of the existing window resolver |
| III | Code quality & tests | ✅ Pass | TypeScript strict; the shift algebra and preview state transitions are unit-testable pure logic; key functions covered by tests |
| IV | UX/UI, accessibility | ✅ Pass (design) | Three controls are keyboard-operable `<button>`s with ARIA labels; preview indication is visible + announced; contrast via existing theme tokens — detailed in research.md |
| V | Performance & simplicity | ✅ Pass (design) | Reuses the existing pure resolver (no new "magic"); a single extra LTS query coalesced by the generation mechanism; no whole-card re-render on `hass` updates |
| VI | Language care / UX writing | ✅ Pass (design) | New UI strings (control labels, preview indication) added to all four locales (en/pl/de/fr) with concise, consistent wording — detailed in research.md |

**Gate result**: PASS — no violations requiring justification. (Accessibility, performance, and localization items are design commitments tracked in research.md and verified in Phase 1 / tasks.)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── index.ts                            # Card registration (unchanged)
└── card/
    ├── cumulative-comparison-chart.ts  # EnergyHorizonCard: preview state field, shift/reset handlers, shifted-period load, render of controls + indication
    ├── echarts-renderer.ts             # Preview render path: two gray-toned shifted series (current light gray, reference darker gray), live series hidden
    ├── types.ts                        # CardState extension (preview fields), ChartRendererConfig extension (preview mode + shifted series pair)
    ├── time-windows/
    │   ├── resolve-windows.ts          # Existing pure resolver (reused; shifted `now` input)
    │   └── duration-parse.ts           # Existing duration parsing (reused for the nominal width)
    └── translations/
        ├── en.json / pl.json / de.json / fr.json   # New UI strings (controls, preview indication)

tests/
├── unit/
│   └── (new) preview-shift tests: shift algebra, state transitions, all-width coverage
└── integration/
    └── (new) card-render preview tests: two-series display, controls, no-data
```

**Structure Decision**: Single-project layout (existing). The feature is contained within the existing `src/card/` component tree — no new top-level directories. The preview is a view-mode capability of the existing `EnergyHorizonCard` Lit element, reusing the existing `time-windows/` resolver and `echarts-renderer.ts`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution Check violations — this section is not applicable.
