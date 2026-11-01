# Bug Assessment: Forecast | Total panel vanishes at period start + no explanation for missing forecast

- **Slug**: month-start-forecast-panel-missing
- **Created**: 2026-11-01
- **Source**: pasted text + screenshot (Nov 1 2026, `sensor.boiler_total_meter`, `start_of_month` / `1M` / `step: 1y` / `count: 2`, `show_forecast: true`, `show_forecast_total_panel: true`)
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

User reports (Polish, translated):

> "At the beginning of the month the panel with the reference-period total consumption and the current-month forecast disappears. Also, no information is displayed that there is not enough data to show, which would explain the missing forecast line on the chart."

Configuration:

```yaml
type: custom:energy-horizon-card
entity: sensor.boiler_total_meter
time_window:
  anchor: start_of_month
  duration: 1M
  step: 1y
  count: 2
title: '3b. Obecny preset: month_over_year (Ten miesiąc vs Ten sam miesiąc rok temu)'
comparison_preset: year_over_year
show_forecast: true
interpretation: consumption
neutral_threshold: 2
show_forecast_total_panel: true
```

Screenshot (Nov 1 2026): comparison panel shows "Nov 2026 TO THIS DAY 1.00 kWh" vs "Nov 2025 TO THIS DAY 2.32 kWh", delta chip "−1.33 kWh | −57.1 %", chart shows a single rising line (reference, Nov 2025) with no forecast line, and **no Forecast | Total panel** despite `show_forecast_total_panel: true`.

## Symptom

On the first day(s) of a new period (when `computeForecast` returns `enabled: false` because `completedBuckets < 3` or `pct < 0.05`), the entire Forecast | Total panel is removed from the DOM — even though `show_forecast_total_panel: true`. No message explains why the forecast line is missing from the chart and why the panel is absent. The user sees a silent disappearance of a panel they explicitly enabled.

## Reproduction

1. Configure the card with `time_window: { anchor: start_of_month, duration: 1M, step: 1y, count: 2 }`, `show_forecast: true`, `show_forecast_total_panel: true`.
2. Open the card on day 1–3 of the new month (before 3 completed daily buckets exist).
3. Observe:
   - The Forecast | Total panel is **absent from the DOM** (no placeholder, no Total value).
   - The forecast line is absent from the chart (expected — `forecast.enabled = false`).
   - **No warning bar or message** explains why the forecast is unavailable.
4. On day 4+ (once `completedBuckets ≥ 3` and `pct ≥ 0.05`), the panel reappears with forecast value and reference Total.

[NEEDS CLARIFICATION: exact day on which the panel reappears in the user's instance — depends on `periodTotalBuckets` (30/31 for a month) and the 5% threshold (≈ day 2 for a 30-day month, but the 3-bucket floor dominates on day 1–3).]

## Suspected Code Paths

- `src/card/cumulative-comparison-chart.ts:931` — `shouldShowForecast = !singleWindow && forecast != null && forecast.enabled` — gates the **entire panel** on `forecast.enabled`. When `enabled: false` (too early in period), `shouldShowForecast = false` → panel removed from DOM. **This is the direct cause of the panel disappearing.**
- `src/card/cumulative-comparison-chart.ts:936-937` — `showForecastTotalPanel = shouldShowForecast && this._config.show_forecast_total_panel !== false` — inherits the `forecast.enabled` gate.
- `src/card/cumulative-comparison-chart.ts:1137` — `${showForecastTotalPanel && forecast ? html`...` : null}` — panel render is conditional on the above.
- `src/card/cumulative-comparison-chart.ts:1034` — `showWarningStrip = !singleWindow && summary != null && summary.reference_cumulative == null` — the **only** warning bar condition; it fires for incomplete *reference* data, not for disabled forecast. No warning exists for "forecast not yet available".
- `src/card/ha-api.ts:667-671` — `computeForecast()` Guard 2: `if (completedBuckets < 3 || pct < 0.05) return disabled(unit)` — the gate that produces `enabled: false` at period start.
- `src/card/echarts-renderer.ts:999-1004` — forecast series render condition: `rendererConfig.showForecast && todaySlotIndex >= 0 && todayCurrentY !== null && rendererConfig.forecastTotal !== undefined` — no forecast line when `forecastTotal` is undefined (i.e. `enabled: false`). Correct behavior, but no user-facing explanation.
- `specs/903-card-ui-composition/spec.md` — **FR-903-J** states panel is rendered "only when `show_forecast: true`" and **Edge Case 8** states panel is absent when `show_forecast: false`. Both are **stale** — they contradict FR-908-H and the README, which correctly state the panel is controlled by `show_forecast_total_panel` independently.
- `specs/908-editor-full-coverage/spec.md` — **FR-908-H** states panel is shown "when forecast data is available, not in single-window mode, and `show_forecast_total_panel` is not `false`". The "not in single-window mode" clause is **incorrect** per user confirmation (panel should show in single-window too, with Total as placeholder).
- `README.advanced.md:76` — correctly documents: "Explicit `false` turns off the forecast **line on the chart** only. The **Forecast | Total** panel is independent (see `show_forecast_total_panel`)."

## Root Cause Hypothesis

**Confidence: high.** The `shouldShowForecast` variable in `render()` conflates two independent concerns: (1) whether the user wants the panel (`show_forecast_total_panel`) and (2) whether forecast data is currently computable (`forecast.enabled`). By AND-ing them, the panel vanishes entirely when the forecast is not yet available (first days of a period), instead of showing a placeholder for the forecast value and the reference Total (which is always computable from LTS data). Additionally, no warning bar or inline message explains *why* the forecast is unavailable, leaving the user with a silent disappearance. The spec (903 Edge Case 9 / US-903-3/4) explicitly requires the placeholder behavior, and the implementation does not honor it.

## Proposed Remediation

**Preferred**:

1. **Decouple panel visibility from `forecast.enabled`** in `cumulative-comparison-chart.ts` → `render()`:
   - Panel is rendered when `this._config.show_forecast_total_panel !== false` (regardless of `forecast.enabled`, regardless of single-window mode).
   - When `forecast.enabled === true`: show `forecast_total` and `reference_total` as today.
   - When `forecast.enabled === false`: show a **placeholder** (e.g. `—`) in the Forecast column with a short inline hint (e.g. "available after ~5% of period"), and show `reference_total` (full reference window total, always computable via `fullReferenceWindowRawTotal`) in the Total column.
   - In **single-window mode**: panel still renders; Forecast column shows the forecast value (if available) or placeholder; Total column shows `—` (no reference window exists).

2. **Add a warning bar message for disabled forecast**:
   - When `forecast != null && forecast.enabled === false` and the panel is visible, show a warning bar (or inline hint in the panel) explaining why: "Forecast not yet available — minimum 3 completed days / 5% of period required."
   - This reuses the existing `.ebc-section--warning` pattern.

3. **Extend `ForecastStats` (or add a sibling field)** to carry the *reason* for `enabled: false` (which guard failed), so the UI can display a specific message:
   - `disabledReason?: "insufficient_buckets" | "below_percent_threshold" | "no_reference" | "no_split" | "zero_reference_in_range"`
   - This is additive (optional field), no breaking change.

4. **Fix spec 903** (stale rules):
   - **FR-903-J**: change to "The Forecast | Total panel MUST be rendered when `show_forecast_total_panel` is not `false`. When `show_forecast_total_panel: false`, the entire panel block MUST be absent from the DOM."
   - **Edge Case 8**: change to "Forecast | Total panel hidden (`show_forecast_total_panel: false`): the panel block is completely absent from the DOM — no empty container."
   - **Edge Case 9 / US-903-3/4**: confirm + add "a warning bar with an adequate message explaining why the forecast is unavailable MUST be shown".

5. **Fix spec 908** (FR-908-H):
   - Remove "not in single-window mode" from the panel visibility conditions. Panel is shown when `show_forecast_total_panel` is not `false` (regardless of window count).

**Alternatives**:
- Keep the panel hidden when `forecast.enabled = false` but add a persistent info strip in its place ("Forecast will appear after day 3"). Rejected: the user explicitly wants the Total value visible (it's always computable), and the spec (Edge Case 9) requires the panel to remain.
- Show the panel only after day 3 with no explanation. Rejected: the user's core complaint is the *silent* disappearance.

**Files likely to change**:
- `src/card/cumulative-comparison-chart.ts` — `render()`: `shouldShowForecast` / `showForecastTotalPanel` logic, warning bar condition, panel template (placeholder for forecast value).
- `src/card/ha-api.ts` — `computeForecast()`: add `disabledReason` to `ForecastStats` return.
- `src/card/types.ts` — `ForecastStats` interface: add `disabledReason?` field.
- `src/translations/en.json`, `pl.json`, `de.json`, `fr.json` — new keys for the warning message and placeholder hint.
- `specs/903-card-ui-composition/spec.md` — FR-903-J, Edge Case 8, Edge Case 9, US-903-3/4.
- `specs/908-editor-full-coverage/spec.md` — FR-908-H.
- `tests/integration/card-render.test.ts` — update/add tests for panel visibility with `forecast.enabled = false`.
- `tests/unit/ha-api.test.ts` — add `disabledReason` assertions.

**Tests to add or update**:
- Panel is **visible** (with placeholder forecast + real Total) when `forecast.enabled = false` and `show_forecast_total_panel !== false`.
- Panel is **visible** in single-window mode (Total = placeholder `—`).
- Panel is **absent** when `show_forecast_total_panel: false`.
- `show_forecast: false` does **not** hide the panel (only the chart line).
- Warning bar is **visible** when `forecast.enabled = false` and panel is shown.
- Warning bar is **absent** when `forecast.enabled = true`.
- `computeForecast` returns `disabledReason: "insufficient_buckets"` when `completedBuckets < 3`.
- `computeForecast` returns `disabledReason: "below_percent_threshold"` when `pct < 0.05`.
- Existing test "ready: show_forecast_total_panel false hides forecast panel only" still passes.
- Existing test "ready: show_forecast false hides forecast line only, panel still visible" still passes.

## Risks & Considerations

- **`ForecastStats` type change**: adding `disabledReason?` is additive and non-breaking, but all existing tests that construct `ForecastStats` literals may need the field (or it stays optional — preferred).
- **Single-window mode**: currently the panel is hidden in single-window mode. Showing it there is a behavior change — the Total column will show `—` (no reference). This is a UX improvement but changes the DOM for single-window cards; verify no layout breakage.
- **Warning bar proliferation**: the card already has a warning bar for incomplete reference data. Adding a second condition (forecast disabled) means the warning bar may need to show **two** messages or a combined message. Decide: separate bars, or one bar with multiple lines.
- **Spec 903 correction**: FR-903-J and Edge Case 8 are referenced in other specs (908) and in the changelog. The correction must be consistent across all referencing documents.
- **Changelog**: the behavior change (panel now visible at period start with placeholder) should be documented as a fix, not a breaking change.
- **`fullReferenceWindowRawTotal`**: already exists in `ha-api.ts` and is used by `computeForecast` for `reference_total`. When `forecast.enabled = false`, `reference_total` is not in the `ForecastStats` object — the UI will need to compute it independently from the reference series points (or `computeForecast` should always populate `reference_total` even when disabled).

## Open Questions

- [NEEDS CLARIFICATION: should the warning bar for "forecast not yet available" be a separate bar from the "incomplete reference" bar, or a combined message? What is the preferred visual treatment — same `.ebc-section--warning` style, or a lighter "info" hint inside the panel itself?]
- [NEEDS CLARIFICATION: in single-window mode, should the Forecast column show the forecast value (if `enabled: true`) or is the panel purely informational? User confirmed panel should show, but the exact content in single-window mode needs a design decision.]
- [NEEDS CLARIFICATION: should `reference_total` always be populated in `ForecastStats` (even when `enabled: false`), or should the UI compute it separately from the reference series?]
