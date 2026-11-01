# Bug Fix: Forecast | Total panel vanishes at period start + no explanation for missing forecast

- **Slug**: month-start-forecast-panel-missing
- **Fixed**: 2026-11-01
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The Forecast | Total panel is now gated by `show_forecast_total_panel` only (independent of `show_forecast` and of `forecast.enabled`, and shown in single-window mode too). When the forecast is not yet computable (first days of a period), the panel stays visible with a placeholder forecast value and the full reference-window total, and a warning-bar line explains why the forecast is unavailable. `computeForecast` now reports which guard disabled the forecast (`disabledReason`).

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/types.ts` | modified | `ForecastStats.disabledReason?` — new optional union field (`insufficient_buckets` \| `below_percent_threshold` \| `no_reference` \| `no_split` \| `zero_reference_in_range` \| `invalid_period`) |
| `src/card/ha-api.ts` | modified | `computeForecast()` — `disabled()` helper now takes a reason; all 5 guards + guard 1 return a specific `disabledReason` |
| `src/card/cumulative-comparison-chart.ts` | modified | `render()`: panel gate decoupled from `forecast.enabled` and `singleWindow`; `panelReferenceTotal` computed via `fullReferenceWindowRawTotal` (existing standalone helper — same pattern as `computeForecast`); warning bar now collects `warningMessages[]` (incomplete reference + forecast-disabled) and renders them as lines in a single bar; panel template shows placeholder `---` (muted) for the forecast value when disabled and uses `panelReferenceTotal` for the Total column |
| `src/card/energy-horizon-card-styles.ts` | modified | `.ebc-warning-lines` / `.ebc-warning-line` — multi-line layout inside the existing warning bar |
| `src/translations/en.json`, `pl.json`, `de.json`, `fr.json` | modified | 3 new keys: `forecast.disabled.hint` (inline panel hint), `forecast.disabled.too_early` (warning line for bucket/percent gates), `forecast.disabled.unavailable` (warning line for other gates) |
| `specs/903-card-ui-composition/spec.md` | modified | FR-903-J (panel gated by `show_forecast_total_panel` only, shown in single-window), Edge Case 8 (hidden only when `show_forecast_total_panel: false`), Edge Case 9 (placeholder + Total + warning line), US-903-3 acceptance 3/4 |
| `specs/908-editor-full-coverage/spec.md` | modified | FR-908-H — removed "not in single-window mode" and "forecast data is available" from panel visibility conditions |
| `changelog.md` | modified | `[Unreleased] → Fixed` entry |
| `tests/integration/card-render.test.ts` | added tests | 4 new tests + `disabledForecastReadyState()` helper |
| `tests/unit/ha-api.test.ts` | added tests | `disabledReason` describe block (6 tests) |

## Diff Highlights (optional)

Panel gate (before → after):

```ts
// before
const shouldShowForecast =
  !singleWindow && forecast != null && forecast.enabled;
const showForecastTotalPanel =
  shouldShowForecast && this._config.show_forecast_total_panel !== false;

// after
const showForecastTotalPanel =
  forecast != null && this._config.show_forecast_total_panel !== false;
```

Warning bar (combined, one line per issue):

```ts
const warningMessages: string[] = [];
if (!singleWindow && summary != null && summary.reference_cumulative == null) {
  warningMessages.push(this._localizeOrError(localize, "summary.incomplete_reference"));
}
if (!singleWindow && forecast != null && forecast.enabled === false) {
  const reasonKey =
    forecast.disabledReason === "insufficient_buckets" ||
    forecast.disabledReason === "below_percent_threshold"
      ? "forecast.disabled.too_early"
      : "forecast.disabled.unavailable";
  warningMessages.push(this._localizeOrError(localize, reasonKey));
}
const showWarningStrip = warningMessages.length > 0;
```

## Tests Added or Updated

- `tests/integration/card-render.test.ts` — "ready: forecast disabled (too early) — panel still visible with placeholder + reference total + warning line" — pins the core bug: panel present, muted placeholder, Total = 90 (full reference window), warning line "Forecast not yet available".
- `tests/integration/card-render.test.ts` — "ready: forecast disabled — warning bar combines incomplete reference + forecast messages into one bar" — pins the combined-bar decision (exactly 1 bar, 2 lines).
- `tests/integration/card-render.test.ts` — "ready: single-window mode — forecast panel visible with Total placeholder" — pins single-window panel visibility with both columns as placeholders and no forecast warning line.
- `tests/integration/card-render.test.ts` — "ready: forecast enabled — no forecast warning line" — pins absence of the warning when the forecast is computable.
- `tests/unit/ha-api.test.ts` — `disabledReason` block: `insufficient_buckets`, `below_percent_threshold`, `no_reference`, `invalid_period`, `zero_reference_in_range`, and absent-when-enabled.
- Existing tests "ready: show_forecast_total_panel false hides forecast panel only" and "ready: show_forecast false hides forecast line only, panel still visible" still pass unchanged.

## Local Verification

- Commands run:
  - `npm run typecheck` → 0 errors
  - `npm test` → 574/574 passed (55 files; 564 pre-existing + 10 new)
  - `npm run lint` → 0 errors
  - `node -e "JSON.parse(...)"` on all 4 translation files → valid JSON
- Manual checks: none (no live HA instance in this session); behavior pinned by the new integration tests.

## Deviations from Assessment

- **Open Question 1 (warning bar treatment)** — resolved per user: a **single** warning bar with one line per issue (`.ebc-warning-lines`), not stacked bars.
- **Open Question 2 (single-window content)** — resolved per user: same panel as always, with the reference Total as a placeholder consistent with the forecast placeholder. Additionally, the forecast-disabled warning line is **not** shown in single-window mode (no reference window → forecast not applicable); this is a small extension of the user's answer, flagged here for review.
- **Open Question 3 (`reference_total` population)** — resolved per user by following the existing project pattern: the standalone `fullReferenceWindowRawTotal(points)` helper in `ha-api.ts` (already used by `computeForecast`). The UI computes `panelReferenceTotal` from the unit-scaled reference series in `render()`; `ForecastStats.reference_total` is left as-is (populated only when enabled). No new API surface.
- The assessment's proposed "short inline hint (e.g. 'available after ~5% of period')" in the panel became the `forecast.disabled.hint` key rendered in the confidence row position when the forecast is disabled — consistent with the existing panel layout.

## Follow-ups

- Verify in a live HA instance on day 1–3 of a month that the panel, placeholder, Total value, and warning line render as pinned by the tests.
- Consider documenting the new `disabledReason` values in the wiki (Forecast-and-Data-Internals) if the field becomes part of a public contract.
- The `no_split` reason has no dedicated unit test (hard to trigger with realistic data); it is covered by the generic `forecast.disabled.unavailable` warning path.
