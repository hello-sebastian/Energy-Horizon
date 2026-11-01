# Bug Verification: Forecast | Total panel vanishes at period start + no explanation for missing forecast

- **Slug**: month-start-forecast-panel-missing
- **Tested**: 2026-11-01
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The fix holds on every automated check and on the live HA instance: the automated equivalent of the assessment's reproduction (forecast disabled at period start, `show_forecast_total_panel: true`) renders the panel with a placeholder forecast value, the full reference-window Total, and a warning line explaining why the forecast is unavailable, and the user confirmed the same behavior after deploying to HA on day 1 of the month. Full regression suite, type check, and lint all pass.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix, automated equivalent) | `TZ=UTC npx vitest run tests/integration/card-render.test.ts` — test "ready: forecast disabled (too early) — panel still visible with placeholder + reference total + warning line" | pass | Pins the exact month-start state: `forecast.enabled = false` (`insufficient_buckets`), `show_forecast_total_panel: true` → panel present, muted placeholder, Total = 90, warning line "Forecast not yet available" |
| Reproduction (post-fix, live HA) | Manual: deploy to HA (`npm run deploy`), open card on day 1 of the month with `start_of_month` / `1M` / `step: 1y` / `count: 2` | pass | User-confirmed 2026-11-01: panel visible with placeholder + Total + warning line ("Po wgraniu do HA działa") |
| New / updated tests | `TZ=UTC npx vitest run tests/integration/card-render.test.ts tests/unit/ha-api.test.ts` | pass | 70/70 — includes 4 new integration tests + 6 new `disabledReason` unit tests |
| Regression suite | `npm test` | pass | 574/574 across 55 files (564 pre-existing + 10 new) |
| Type check | `npm run typecheck` | pass | 0 errors |
| Lint | `npm run lint` | pass | 0 errors |
| Fix presence in source | grep for `showForecastTotalPanel` gate, `panelReferenceTotal`, `warningMessages`, `disabledReason` in `src/card/cumulative-comparison-chart.ts` and `src/card/ha-api.ts` | pass | All changes recorded in fix.md are present in the working tree |

## Output Excerpts

Targeted tests:

```
Test Files  2 passed (2)
     Tests  70 passed (70)
```

Full suite:

```
Test Files  55 passed (55)
     Tests  574 passed (574)
```

Type check and lint produced no output (clean).

## Residual Risks

- **`no_split` disabledReason** has no dedicated unit test (hard to trigger with realistic data); it is covered by the generic `forecast.disabled.unavailable` warning path (noted in fix.md).
- **Single-window deviation**: the forecast-disabled warning line is intentionally not shown in single-window mode (no reference window → forecast not applicable). This is a small extension of the user's answer, flagged in fix.md for review.

## Recommendation

Close the bug — verified end-to-end. All automated checks pass and the live HA reproduction (day 1 of the month) was confirmed by the user after deployment.
