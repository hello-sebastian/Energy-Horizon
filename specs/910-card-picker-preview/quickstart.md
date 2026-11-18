# Quickstart — `910-card-picker-preview` (validation guide)

## Prerequisites

- Node.js matching project engines
- Repo root: `/Users/sebastian/Projekty local/Energy-Horizon` (or your clone)
- Feature branch: `910-card-picker-preview`
- A dev Home Assistant instance with the card loaded (for the end-to-end picker scenarios)

## Commands

```bash
cd "/Users/sebastian/Projekty local/Energy-Horizon"
npm test            # TZ=UTC vitest run
npm run typecheck   # tsc --noEmit (strict gate)
npm run lint
```

Focus tests while iterating:

```bash
npx vitest run tests/unit/picker-preview.test.ts
npx vitest run tests/integration/picker-preview-render.test.ts
```

## Where to edit

- **Registration hook** (`getEntitySuggestion`): `src/index.ts` — add the hook to the
  `window.customCards` entry (research R1/R3).
- **Hook typing**: `src/ha-types.ts` — extend `CustomCardDeclaration` with
  `getEntitySuggestion` and the `CustomCardSuggestion` shape (research R1).
- **Pure helpers** (new module): `src/card/picker-preview.ts` — `SUPPORTED_UNITS`,
  `isSupportedUnit`, `findSuitableEntity`, `buildEntitySuggestion`,
  `buildDemoComparisonSeries`, and the time-limited query wrapper (research R3/R4/R5/R7).
- **Element picker-mode behavior**: `src/card/cumulative-comparison-chart.ts` — the `preview`
  property, the full `getStubConfig(hass, entities, entitiesFallback)` signature, the
  demo-first render path with the time-limited real-data update, and hiding the 909 controls in
  picker mode (research R2/R4/R6).
- **Reused, unmodified**: `src/card/ha-api.ts` (LTS query/mapping), `src/card/types.ts`
  (`ComparisonSeries`/`CumulativeSeries`), `src/card/time-windows/` (window resolution).
- **Translations**: `src/card/translations/{en,pl,de,fr}.json` — only if a new string turns out
  to be needed (expected: none; the demo series reuses existing panel labels).
- **Tests**: `tests/unit/picker-preview.test.ts` (supported-units check, entity search,
  suggestion hook, demo-series determinism, time-limited query fallback) and
  `tests/integration/picker-preview-render.test.ts` (demo-first render, real-data update, no
  loading/error state, 909 controls hidden).

## Validation scenarios (end-to-end)

These map to the spec's acceptance scenarios; run them against a dev HA dashboard.

### "By entity" view (US1)

1. **Suggested for a supported unit (SC-001)**: Open the card picker, choose "By entity", and
   select an energy sensor with unit `kWh` → the Energy Horizon card appears in the suggested
   cards, rendered with a preview that references that entity.
2. **Not suggested for an unsupported unit (SC-002)**: Select an entity with an unsupported unit
   (e.g. a temperature sensor, `°C`) → the Energy Horizon card does **not** appear in the
   suggested cards.
3. **Added from the suggestion (US1 scenario 4)**: Pick the Energy Horizon suggestion for a
   `kWh` entity → the card is added and its configuration starts from that entity (the normal
   configuration flow), not from any preview-only content.

### "By card" view (US2)

4. **Recognizable preview (SC-003, SC-005)**: Open the card picker in the "By card" view → the
   Energy Horizon preview renders a chart with a current and a reference series plus the standard
   panels — **not** the no-data message. A user who has never seen the card can identify its
   purpose from the preview alone.
5. **Real data preferred (US3 scenario 3)**: In an instance with at least one suitable energy
   entity with statistics, the "By card" preview uses that entity's data (after the short
   time-limited query succeeds).
6. **Demo fallback (US3 scenario 4)**: In an instance with no suitable energy entity, the
   "By card" preview still renders the standard appearance using the fictional demo series.

### Preview content & safety (US3, US4)

7. **No loading/error state (SC-004)**: In both views, the preview shows a rendered chart
   immediately; a loading or error state is never shown, even when the data query is slow or
   fails.
8. **Real-data update (FR-014)**: When the real-data query succeeds within the time limit, the
   preview updates in place to the real data (demo series first, then real data).
9. **Nothing persisted (SC-006)**: Browse the picker (with or without adding the card), then
   close it → the dashboard's saved configuration is unchanged; no preview content is persisted.
10. **No interference (FR-013)**: Scroll through the gallery with many cards → the Energy
    Horizon preview does not affect other cards' previews or the picker's responsiveness.
11. **Theme & localization (FR-012)**: Toggle light/dark theme and change the HA language → the
    preview respects the active theme and the card's localization.
12. **Non-interactive (Assumptions)**: In the picker preview, the 909 time-window preview
    controls (back/forward/reset) are not shown.

## Regression checks

- `npm run typecheck` passes (strict gate, no `any`).
- `npm test` — the existing 564 tests still pass (the normal dashboard pipeline is untouched).
- On a dashboard (not the picker), the card behaves exactly as before: normal data load, 909
  preview controls present and functional, no demo series.
