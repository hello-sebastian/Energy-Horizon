# Quickstart — `909-timewindow-preview` (validation guide)

## Prerequisites

- Node.js matching project engines
- Repo root: `/Users/sebastian/Projekty local/Energy-Horizon` (or your clone)
- Feature branch: `909-timewindow-preview`

## Commands

```bash
cd "/Users/sebastian/Projekty local/Energy-Horizon"
npm test            # TZ=UTC vitest run
npm run typecheck   # tsc --noEmit (strict gate)
npm run lint
```

Focus tests while iterating:

```bash
npx vitest run tests/unit/preview-shift.test.ts
npx vitest run tests/integration/card-render.test.ts
```

## Where to edit

- **Preview state + shift handlers + shifted-period load**: `src/card/cumulative-comparison-chart.ts`
  (element field `previewShift`, step/reset handlers, `_loadData` preview branch).
- **Two-series preview render**: `src/card/echarts-renderer.ts` (preview mode: draw the shifted
  current in light gray and the shifted reference in a darker gray, hide the live series).
- **Types**: `src/card/types.ts` — `CardState` and `ChartRendererConfig` preview fields.
- **Window arithmetic**: reused, not modified — `src/card/time-windows/resolve-windows.ts`
  (shifted `now` input) and `duration-parse.ts` (nominal width).
- **UI strings**: `src/card/translations/{en,pl,de,fr}.json` — `preview.*` keys (controls +
  indication).
- **Tests**: `tests/unit/preview-shift.test.ts` (shift algebra, state transitions, all-width
  coverage) and `tests/integration/card-render.test.ts` (two-series display, controls,
  no-data).

## Validation scenarios (end-to-end)

These map to the spec's acceptance scenarios; run them against a dev HA dashboard with a card that
has at least ~3 months of history.

1. **Step back (US1)**: On a card with a one-month window, activate the backward control once →
   the chart shows the previous calendar month as two gray-toned series (shifted current in light
   gray, shifted reference in a darker gray); the live series are hidden; a preview indication
   shows the shifted period; the reset control appears.
   Activate again → the month before that.
2. **Config untouched (US1/FR-007)**: After stepping, open the card editor → the saved
   configuration is identical to before.
3. **All widths (US1 scenarios 6–8 / FR-006)**: Repeat step-back on cards configured with `45d`
   (exact 45-day shift), `1y` (previous calendar year), and a week/hour width — each shifts by one
   nominal width with the window's width unchanged.
4. **Forward + bound (US1/FR-003)**: From a shifted position, activate forward → one width later;
   at the default, forward is a no-op (never later than "now").
5. **Reset (US5/FR-009)**: From any shifted position, activate reset → the chart immediately shows
   the configured default (current series back, normal two-series presentation); the indication and
   reset control disappear.
6. **Transient (US4/FR-008)**: Step back two periods, then (a) switch dashboards and return,
   (b) switch views within the dashboard and return, (c) reload the page → in all cases the card
   shows the configured default with no indication.
7. **Per-card independence (FR-016)**: With two cards on one dashboard, shift one → the other is
   unaffected.
8. **No data (US6/FR-013)**: On a card with limited history, step back until the shifted period has
   no data → the standard no-data indication is shown (no crash) and the preview controls +
   indication remain available — step forward (or through a seasonal gap) and the chart shows data
   again; reset returns to the default.
9. **Panels unchanged (FR-021)**: While in preview, the summary, delta/interpretation readout, and
   narrative remain visible and unchanged, reflecting the default configuration and current data.
10. **Accessibility (FR-017)**: Tab to each control → focus-visible; activate with Enter/Space;
    screen reader announces the localized labels and the preview indication.

## Manual sanity (optional)

Configure a dev HA dashboard card (e.g., a one-month window) and exercise the controls in the
browser. With `debug: true`, the console logs the resolved windows and LTS queries — confirm the
shifted query targets the shifted period (no PII in logs).

## Speckit branch reminder

`setup-plan.sh` requires a feature branch name like `909-timewindow-preview`. On other branches,
paths still resolve via `.specify/feature.json` → `feature_directory`.
