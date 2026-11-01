# Bug Fix: Reason-specific warning-bar messages for disabled forecast

- **Slug**: zero-reference-forecast
- **Fixed**: 2026-11-01
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The warning bar now explains *why* the forecast is disabled for the three data-driven reasons (`zero_reference_in_range`, `no_reference`, `no_split`) instead of showing the generic "Forecast not available for this period." Each reason resolves to its own short, understandable localized message. The `invalid_period` reason was intentionally left on the generic fallback (see Deviations).

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/cumulative-comparison-chart.ts` | modified | Extended the `reasonKey` mapping (~lines 966-977) so `zero_reference_in_range` → `forecast.disabled.zero_reference`, `no_reference` → `forecast.disabled.no_reference`, `no_split` → `forecast.disabled.no_split`. `invalid_period` and any unknown reason fall through to `forecast.disabled.unavailable`. |
| `src/translations/en.json` | added 3 keys | `forecast.disabled.zero_reference`, `forecast.disabled.no_reference`, `forecast.disabled.no_split` |
| `src/translations/pl.json` | added 3 keys | Polish translations |
| `src/translations/de.json` | added 3 keys | German translations |
| `src/translations/fr.json` | added 3 keys | French translations |
| `tests/integration/card-render.test.ts` | added test | Table-driven `it.each` over the 3 reasons asserting the reason-specific clause is present and the generic message is absent |

## Diff Highlights (optional)

`src/card/cumulative-comparison-chart.ts`:

```ts
const reasonKey =
  forecast.disabledReason === "insufficient_buckets" ||
  forecast.disabledReason === "below_percent_threshold"
    ? "forecast.disabled.too_early"
    : forecast.disabledReason === "zero_reference_in_range"
      ? "forecast.disabled.zero_reference"
      : forecast.disabledReason === "no_reference"
        ? "forecast.disabled.no_reference"
        : forecast.disabledReason === "no_split"
          ? "forecast.disabled.no_split"
          : "forecast.disabled.unavailable";
```

New English strings:
- `forecast.disabled.zero_reference`: "Forecast not available — the reference period is 0, no baseline to project from."
- `forecast.disabled.no_reference`: "Forecast not available — no reference data for this period."
- `forecast.disabled.no_split`: "Forecast not available — reference data does not cover the elapsed time."

## Tests Added or Updated

- `tests/integration/card-render.test.ts` — `ready: forecast disabled (%s) — warning bar shows the reason-specific message` (table-driven over `zero_reference_in_range`, `no_reference`, `no_split`). Pins that the warning bar shows the matching reason-specific clause and does NOT show the generic "Forecast not available for this period."

## Local Verification

- Commands run: `npm test` → 577 passed (55 files). `npm run typecheck` → clean. `TZ=UTC npx vitest run tests/integration/card-render.test.ts` → 21 passed (3 new).
- Manual checks: none (headless). The three new integration tests render the card in `ready` state with each `disabledReason` and assert the warning-bar text.

## Deviations from Assessment

- **`invalid_period` left on the generic fallback (not given its own message).** The assessment proposed a `forecast.disabled.invalid_period` key. Per the user's decision (point 4 of the fix request), this was dropped: `invalid_period` is produced by Guard 1 in `computeForecast` only when `forecastPeriodBuckets ≤ 0` or the current series is empty. The card reaches the `ready` state (where the warning bar renders) only when the current series exists and `forecastPeriodBuckets` (from `countBucketsForWindow(windows[0])`) is `> 0`, so `invalid_period` is effectively unreachable in `ready`. A genuinely invalid configuration instead drives the whole card into `error`/`no-data`, whose card-level message already explains the situation — a forecast-only warning bar would be redundant. No translation key was added for it.

## Follow-ups

- None required. The generic `forecast.disabled.unavailable` key remains as a defensive fallback for any future/unknown `disabledReason`.
