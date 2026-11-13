# Implementation Plan: Card Picker Preview

**Branch**: `910-card-picker-preview` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/910-card-picker-preview/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Make the Energy Horizon card **discoverable and recognizable** in the Home Assistant card picker's two entry points:

1. **"By entity" view** — the card is suggested for every entity whose `unit_of_measurement` is in the card's supported units (`kWh`, `Wh`, `MWh`, `m³`, `l`) and only for those, via the `getEntitySuggestion(hass, entityId)` hook on the `window.customCards` registration (research R1/R3). The suggestion carries a sample configuration referencing the selected entity (FR-001–FR-004).
2. **"By card" view** — the card's gallery preview renders the card in its standard appearance (chart with current + reference series, standard panels) instead of the no-data message (FR-005). The static `getStubConfig(hass, entities, entitiesFallback)` is implemented with the full HA signature and picks a suitable user entity by supported unit (research R2/R5).

**Technical approach**: In picker mode (detected via the `preview` property that `hui-card` forwards to the card element), the card **immediately renders a deterministic fictional demo series** (no query, no loading state — FR-014), then fires the normal LTS data query with a **short time limit** (`Promise.race` against a timeout); if it succeeds in time with a current series, the preview updates in place to the real data, otherwise the demo series stays (FR-007/FR-008/FR-011). The demo series is a pure function producing the existing `ComparisonSeries` shape, so the preview reuses the card's normal render pipeline unchanged (research R4). The 909 preview controls are hidden in picker mode (research R6). No new npm dependencies, no new HA APIs, no persisted state (research R1–R7).

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.6 (strict mode; `tsc --noEmit` typecheck gate)

**Primary Dependencies**: Lit 3.1 (Web Components), ECharts 5.6 (modular imports), Luxon 3.7 (date/time algebra) — no new dependencies

**Storage**: None — the preview is transient (demo series generated in memory, real-data query result held only for the picker session); no persistence, no new HA APIs

**Testing**: Vitest 2.1 (unit + integration), jsdom for DOM; `TZ=UTC vitest run`; baseline 564 passing tests

**Target Platform**: Home Assistant Lovelace (browser), distributed via HACS; must respect HA light/dark themes

**Project Type**: Browser-side custom card (Lit Web Component) for Home Assistant Lovelace

**Performance Goals**: The picker preview renders a chart immediately (demo series, no query on the critical path); the optional real-data query is bounded by a short time limit (~2–3 s) and never blocks the picker; suggestion check (`getEntitySuggestion`) is a synchronous, allocation-light unit lookup

**Constraints**: No new npm dependencies; no new HA APIs (only the existing `window.customCards` hooks `getEntitySuggestion` + static `getStubConfig` and the existing LTS `statistics_during_period` query); no persisted state; no loading/error state in the picker (FR-011); TypeScript strict (no `any`); the preview must not interfere with other cards or the dashboard (FR-013)

**Scale/Scope**: Single card component; touches `src/index.ts` (registration hook), `src/card/cumulative-comparison-chart.ts` (picker-mode render path, `preview` property, `getStubConfig` signature), a new small module for the demo series + suggestion helpers, `src/ha-types.ts` (hook typing), and the four translation files only if new strings are needed (expected: none — the demo series reuses existing panel labels)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | HA/HACS ecosystem compliance | ✅ Pass | Uses only the documented `window.customCards` hooks (`getEntitySuggestion`, static `getStubConfig`) and the existing LTS `statistics_during_period` query; follows the standard HA card preview scheme (FR-006); no config-schema change |
| II | Security & fault tolerance | ✅ Pass | The suggestion hook is a total, non-throwing function (the picker drops throwing cards); the real-data query is time-limited with a demo-series fallback on error/timeout/empty (FR-008/FR-011); no new untrusted input surface |
| III | Code quality & tests | ✅ Pass | TypeScript strict; the new logic is split into pure, exported, unit-testable functions (research R7); key functions (suggestion check, entity search, demo series, time-limited query) covered by tests |
| IV | UX/UI, accessibility | ✅ Pass (design) | The preview renders the card's standard appearance with its existing localized panels (FR-012); no new UI strings expected; the 909 controls are hidden in picker mode so the preview is a clean, non-interactive surface (research R6) |
| V | Performance & simplicity | ✅ Pass (design) | Demo series renders synchronously on the critical path (no query); the optional real-data query reuses the existing LTS path and is bounded by a `Promise.race` timeout; no new render pipeline (research R4) |
| VI | Language care / UX writing | ✅ Pass (design) | No new user-facing strings expected (the demo series reuses the card's existing translations); if any are added, they go to all four locales (en/pl/de/fr) |

**Gate result**: PASS — no violations requiring justification. (Accessibility, performance, and localization items are design commitments tracked in research.md and verified in Phase 1 / tasks.)

## Project Structure

### Documentation (this feature)

```text
specs/910-card-picker-preview/
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
├── index.ts                            # Card registration: add getEntitySuggestion hook (R1/R3)
├── ha-types.ts                         # CustomCardDeclaration: add getEntitySuggestion typing (R1)
└── card/
    ├── cumulative-comparison-chart.ts  # EnergyHorizonCard: `preview` property, full getStubConfig signature (R2/R5), picker-mode render path (demo-first, time-limited real-data update, R4), 909 controls hidden in picker mode (R6)
    ├── picker-preview.ts               # (new) pure helpers: SUPPORTED_UNITS, isSupportedUnit, findSuitableEntity, buildEntitySuggestion, buildDemoComparisonSeries, time-limited query wrapper (R3/R4/R5/R7)
    ├── ha-api.ts                       # Existing LTS query/mapping path (reused, unmodified)
    └── types.ts                        # (possibly) no changes — demo series reuses ComparisonSeries/CumulativeSeries

tests/
├── unit/
│   └── (new) picker-preview tests: supported-units check, entity search, suggestion hook, demo-series determinism, time-limited query fallback
└── integration/
    └── (new) picker-mode render tests: demo-first render, real-data update, no loading/error state, 909 controls hidden
```

**Structure Decision**: Single-project layout (existing). The feature is contained within the
existing `src/card/` component tree — no new top-level directories. The new pure logic lives in
one small module (`src/card/picker-preview.ts`) so it is unit-testable in isolation (research
R7); the element-level picker-mode behavior stays in `cumulative-comparison-chart.ts`; the
registration hook is added in `src/index.ts`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution Check violations — this section is not applicable.
