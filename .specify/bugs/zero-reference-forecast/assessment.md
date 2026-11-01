# Bug Assessment: Warning bar does not explain why the forecast is disabled when the reference series is all-zero

- **Slug**: zero-reference-forecast
- **Created**: 2026-11-01
- **Source**: pasted text (+ screenshot of the card editor)
- **Verdict**: valid (scoped to the warning-bar observability gap; the forecast-disable itself is by-design)
- **Severity**: low

## Report (verbatim or summarized)

> Kiedy seria referencyjna w całym okresie = 0/null a bieżąca seria ma dane nie jest liczona prognoza dla bieżącego okresu, mam tylko informację, że forecast is not available for this period. Wyjaśnij dlaczego tak się dzieje przytocz instrukcje i zależności ze specyfikacji.

Configuration from the screenshot:

```yaml
type: custom:energy-horizon-card
entity: sensor.klimatyzator_plug_total_meter
time_window:
  anchor: start_of_week
  duration: 1w
  step: 1M
  count: 2
title: Klimatyzator tydzień do tygodnia
comparison_preset: custom
show_forecast: true
interpretation: consumption
neutral_threshold: 2
```

Observed: current window (26 Oct – 1 Nov) = **48.95 kWh**; reference window (26 Sep – 2 Oct) = **0.00 kWh**; the card shows the warning line **"Forecast not available for this period."** and the Forecast column is a placeholder.

## Symptom

When the reference series is entirely zero/null for the whole window while the current series has data, the forecast is not computed and the warning bar shows only the generic message "Forecast not available for this period." — it does not explain *why* (that the reference baseline is zero). The user expected either a forecast or a reason-specific explanation.

## Reproduction

1. Configure a 2-window comparison (`count: 2`) where the reference window's LTS data is entirely `0` (e.g. a device that was off for the whole reference period) and the current window has non-zero data.
2. Set `show_forecast: true` (and `show_forecast_total_panel` not `false`).
3. Observe: the Forecast column is a placeholder and the warning bar reads "Forecast not available for this period." with no reason.

[NEEDS CLARIFICATION: whether the user also wants the other collapsed reasons (`no_reference`, `no_split`, `invalid_period`) to get their own messages, or only the all-zero-reference case shown in the screenshot.]

## Suspected Code Paths

- `src/card/ha-api.ts:722-725` — **Guard 5** in `computeForecast`: `if (!Number.isFinite(B) || B <= 0) return disabled(unit, "zero_reference_in_range");`. This is the gate that disables the forecast when the reference baseline `B` is zero.
- `src/card/ha-api.ts:718-720` — `B = referencePoints.slice(0, splitIdx + 1).reduce((acc, p) => acc + (p.rawValue ?? 0), 0)` — the reference "past" sum that becomes `0` when the reference series is all-zero.
- `src/card/cumulative-comparison-chart.ts:966-971` — the `reasonKey` mapping that collapses `zero_reference_in_range` (and `no_reference`, `no_split`, `invalid_period`) into the single generic key `forecast.disabled.unavailable`.
- `src/translations/en.json:35` (and `pl.json:35`, `de.json:35`, `fr.json:34`) — `forecast.disabled.unavailable` = "Forecast not available for this period." — the generic message the user sees.
- `src/card/types.ts:266-273` — `ForecastStats.disabledReason` already carries 6 distinct values, so the reason is known at render time; it is simply not surfaced distinctly.

## Root Cause Hypothesis

**Confidence: high.** The forecast-disable is *correct and by-design*: `computeForecast` derives a trend factor `rawTrend = A / B` (FR-901-G) and projects `forecast_total = A + C * trend` (FR-901-I). When the reference series is all-zero, `B = 0`, so `rawTrend = A / 0 = Infinity` — the trend is mathematically undefined and the projection has no baseline to scale. The spec mandates disabling in exactly this case: **FR-901-F** ("When `B = 0` MUST return `enabled: false`") and **Edge Case 6** ("`B = 0` or `rawTrend === Infinity`: `enabled: false` — trend cannot be computed").

The *actual* gap is in the UI: `ForecastStats.disabledReason` distinguishes 6 reasons, but the warning-bar mapping at `cumulative-comparison-chart.ts:966-971` only differentiates the two "too early" reasons (`insufficient_buckets`, `below_percent_threshold`) and lumps the other four — including `zero_reference_in_range` — into one generic `forecast.disabled.unavailable` string. So the user is told the forecast is unavailable but not *why*.

## Proposed Remediation

**Preferred**: Give each of the four currently-collapsed `disabledReason` values its own short, understandable warning-bar message (the two "too early" reasons already share `forecast.disabled.too_early`). Add four new translation keys and extend the `reasonKey` mapping in `cumulative-comparison-chart.ts:966-971` so each reason resolves to its own key instead of the generic `forecast.disabled.unavailable`. Keep the change additive; do not touch `computeForecast` or the forecast math.

Proposed short strings (English; `pl`/`de`/`fr` to be translated in the fix):
- `forecast.disabled.zero_reference` (reason `zero_reference_in_range`): "Forecast not available — the reference period is 0, so there is no baseline to project from."
- `forecast.disabled.no_reference` (reason `no_reference`): "Forecast not available — no reference data for this period."
- `forecast.disabled.no_split` (reason `no_split`): "Forecast not available — reference data does not cover the elapsed time."
- `forecast.disabled.invalid_period` (reason `invalid_period`): "Forecast not available — invalid period configuration."

The generic `forecast.disabled.unavailable` key is kept as a defensive fallback for any unknown reason.

**Alternatives**:
- Keep a single generic message (status quo). Trade-off: simplest, but the user is never told *why* — the original complaint.

**Files likely to change**:
- `src/card/cumulative-comparison-chart.ts` (the `reasonKey` mapping, ~lines 966-971)
- `src/translations/en.json`
- `src/translations/pl.json`
- `src/translations/de.json`
- `src/translations/fr.json`

**Tests to add or update**:
- `tests/integration/card-render.test.ts`: add a case per reason (`zero_reference_in_range`, `no_reference`, `no_split`, `invalid_period`) asserting the warning bar shows the matching reason-specific text and NOT the generic "Forecast not available for this period." Reuse the `disabledForecastReadyState()` fixture pattern, overriding `disabledReason` per case (a table-driven loop is fine).

## Risks & Considerations

- Low risk: additive translation key + a narrow branch in the `reasonKey` mapping. No API breakage, no data risk, no change to `computeForecast` or the forecast math.
- All four locale files (`en`, `pl`, `de`, `fr`) must be updated together to avoid a missing-key fallback.
- The existing test "forecast disabled (too early)" asserts the "too early" wording; the new test must use a distinct `disabledReason` so it does not collide with that fixture.
- Do NOT change the forecast-disable behavior itself — it is spec-mandated (FR-901-F / Edge Case 6). This fix is observability only.

## Open Questions

- [RESOLVED: all four remaining reasons (`no_reference`, `no_split`, `zero_reference_in_range`, `invalid_period`) get distinct messages — confirmed by user.]
- [RESOLVED: wording is short but understandable — confirmed by user; exact `en` strings proposed above, to be finalized in the fix.]
