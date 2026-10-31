# Bug Assessment: New period starts empty — first day lost, zero buckets dropped, "no data" instead of "0 so far"

- **Slug**: new-month-first-day-missing
- **Created**: 2026-10-31
- **Source**: https://github.com/hello-sebastian/Energy-Horizon/issues/56 (fetched, host `github.com` — allowlisted) + user pasted text + screenshot (Jul 2026 vs Jun 2026, `sensor.pv_monthly`)
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

**Issue #56 "New month problem"** (xoomas, Jul 1): "First day of the month there is no data from previous month."

**frido100 root-cause analysis (Sep 13)** — setup v1.1.0, `comparison_preset: month_over_year`, `aggregation: day`, gas meter `state_class: total_increasing`:

1. The first day of the period is never counted (the "new month problem").
2. Every daily value is drawn one bucket too early, so the current-period area ends one day before the last day that actually has data.
3. Buckets with zero consumption (including the still-running current day) produce no point, so the line ends even earlier.

Cause per the reporter: in the function that turns `recorder/statistics_during_period` rows into the time series, the `sum` branch is checked before `change`. The first row only becomes the baseline (first day lost), zero-delta buckets are skipped, and each delta is stamped with the **previous** bucket's start (one-bucket shift). Home Assistant already returns `change` per bucket for `total`/`total_increasing` statistics, so the `sum` differencing is not needed.

Reporter's follow-up: even with the `change`-first fix, the reference "to this day" value takes the **full** matching reference bucket, so a partial (still-running) current day is compared against a complete day last year (their example: −40 % instead of about −34 %). They added a pro-ration of the running bucket in the reference lookup.

Reporter's additional (unfixed) observation: reference alignment by first-data-point offset vs calendar offset — already addressed in this codebase by `alignOffsetMs` (window-start offset, commit `f0a7787`); see `late-start-forecast-miscalc` assessment.

**User's related observation (this session)**: when a new time-window period begins and there is no consumption yet in the current period, that fact is interpreted as "unknown consumption" (card shows `--- kWh | --- %`, "Not enough data to compare this period to the reference." and "Reference data for this period is incomplete…") instead of "0 so far".

**Screenshot** (Jul 2026 vs Jun 2026, `sensor.pv_monthly`, month-over-year, daily aggregation): current column "Jul 2026 TO THIS DAY **0,00 kWh**", reference column "Jun 2026 TO THIS DAY **— kWh**", delta chip `--- kWh | --- %`, narrative "Not enough data to compare this period to the reference.", warning strip "Reference data for this period is incomplete…". The chart shows a single rising line (0 → ~300 kWh) spanning the month — the reference (June) series — while the current (July) series contributes no visible points.

## Symptom

At the start of a new period (new month / new year), the current period's series is empty or starts one bucket late: the first bucket is consumed as a `sum` baseline, and buckets with zero consumption are dropped. With no current points, `computeSummary` yields `reference_cumulative = undefined`, so the card reports "unknown" (`---`, "Not enough data…") instead of the correct "0 so far, −100 % vs reference". Even when data does exist, the first day is missing and every value is shifted one bucket early.

## Reproduction

1. Configure the card with `comparison_preset: month_over_year` (or `year_over_year`), `aggregation: day`, on a `total_increasing` / `total` statistic (e.g. gas meter, PV production).
2. Open the card on the first day(s) of the new period, before any consumption has been recorded (or on a day with zero consumption).
3. Observe: current "TO THIS DAY" shows `0,00` or `---`, delta chip `--- kWh | --- %`, narrative "Not enough data to compare this period to the reference.", warning strip "Reference data for this period is incomplete…".
4. On subsequent days: the first day of the period is missing from the series and each daily value is plotted one bucket early; the current line ends before the last day that has data.

[NEEDS CLARIFICATION: exact HA version and whether `sensor.pv_monthly` is a native `total_increasing` statistic or a template/derived sensor — the screenshot's entity name suggests a monthly sensor, which may also explain why the current (July) series is entirely empty while June renders.]

## Suspected Code Paths

- `src/card/ha-api.ts:459` — `normalizePoints()`: the `sum` branch is checked **before** `change` (line 475). First row with `sum` becomes the baseline and is skipped (lines 476–481); rows with `delta <= 0` are skipped (lines 485–489); deltas are stamped with `previousSumStartMs` (previous bucket start, line 491). This is exactly the behavior frido100 described.
- `src/card/ha-api.ts:494` — `change` branch exists but is only reached when `sum` is absent; for `total`/`total_increasing` HA returns **both**, so `change` is never used.
- `src/card/ha-api.ts:427` — `mapLtsResponseToCumulativeSeries()`: returns `undefined` when the normalized series is empty → current series missing → `no-data` / "unknown" path.
- `src/card/cumulative-comparison-chart.ts:379` — `status: "no-data"` when the current series cannot be built.
- `src/card/ha-api.ts:589` — `computeSummary()`: `reference_cumulative` stays `undefined` when `currentPoints` is empty → `difference`/`differencePercent` undefined.
- `src/card/interpretation-semantics.ts:98` — `reference_cumulative == null || difference == null` → `outcome: "insufficient_data"` → "Not enough data to compare this period to the reference."
- `src/card/cumulative-comparison-chart.ts:1005` — `showWarningStrip = !singleWindow && summary != null && summary.reference_cumulative == null` → "Reference data for this period is incomplete…" (misleading: the reference data is fine; the *current* series is empty).
- `src/card/ha-api.ts:560` — `referenceCumulativeAtAlignedCurrentEnd()`: takes the full reference bucket value at the aligned end (no pro-ration of the still-running bucket) — the reporter's follow-up issue.

## Root Cause Hypothesis

**Confidence: high.** `normalizePoints()` prefers `sum` over `change`. For `total`/`total_increasing` statistics HA returns both fields per bucket, and `change` is already the per-bucket increment — but the code instead differences `sum` itself, which (a) consumes the first row as a baseline (first day lost), (b) drops zero-consumption buckets (`delta <= 0` skip), and (c) stamps each delta with the previous bucket's start (one-bucket shift). At the very start of a new period, where all buckets so far are zero, the entire current series collapses to zero points, and the downstream pipeline (`computeSummary` → `insufficient_data` → warning strip) interprets "no points" as "unknown" rather than "0 so far". The screenshot is a direct consequence: July (current) has no points, June (reference) renders alone, and the summary shows `---`.

## Proposed Remediation

**Preferred**: in `normalizePoints()` (`src/card/ha-api.ts`), check `change` **before** `sum`:

- `typeof p.change === "number"` → use `p.change` directly as the bucket value (keep the bucket's own `start` as the timestamp — no previous-bucket stamping, no first-row loss, zero buckets preserved as explicit 0 points).
- `typeof p.sum === "number"` → keep the existing differencing logic **only as a fallback** for responses that carry `sum` without `change` (older HA / edge cases).
- Keep the `state` and `max - min` (measurement) branches as-is.

This single change fixes: first day missing, one-bucket shift, zero-bucket drops, and the "new period = unknown" symptom (a fresh period now yields explicit 0 points, so `computeSummary` produces `current_cumulative = 0`, `difference = −reference`, `differencePercent = −100 %` instead of `undefined`).

**Secondary (reporter's follow-up, optional in the same fix)**: pro-rate the reference value for the still-running bucket in `referenceCumulativeAtAlignedCurrentEnd()` — when the aligned current end falls inside a reference bucket, interpolate between the previous and current reference bucket values by elapsed fraction, so a partial day is compared against the same fraction of the reference day.

**Alternatives**:
- Keep `sum`-first and special-case the first row (emit it as a point instead of a baseline) — rejected: still drops zero buckets and keeps the one-bucket shift; more code, same class of bugs.
- Rebuild the series on the fixed timeline slots (`buildTimelineSlots`) and map buckets by timestamp — larger refactor, not needed once `change` is used.

**Files likely to change**:
- `src/card/ha-api.ts` — `normalizePoints()` (branch order), optionally `referenceCumulativeAtAlignedCurrentEnd()` (pro-ration).
- `tests/unit/ha-api.test.ts` — existing tests lock in the sum-delta behavior and must be updated/extended.

**Tests to add or update**:
- `change`-first: response rows with **both** `sum` and `change` → points use `change`, first bucket included, timestamps on the bucket's own start.
- Zero-consumption buckets preserved: rows with `change: 0` produce explicit 0 points (series not empty).
- Fresh period: all-zero current series → `computeSummary` yields `current_cumulative = 0`, `difference = −reference_cumulative`, `differencePercent = −100` (not `undefined`).
- Fallback: rows with `sum` only (no `change`) → existing differencing behavior unchanged.
- (If pro-ration is done) partial-day reference lookup interpolates between reference buckets.
- Update the existing "maps LTS response to ComparisonSeries" test (sums 2, 4, 9 → 2 points) — with `change`-first and `sum`-only fallback it still holds, but add a companion `change`-present case.

## Risks & Considerations

- **Behavior change for `sum`-only responses**: the fallback path must remain byte-compatible; existing tests (`ha-api.test.ts` lines ~518–575) pin the current semantics and need careful review, not blind deletion.
- **Negative `change` values**: a meter reset produces `change < 0`. Current `sum`-delta code skips `delta <= 0`; the `change` branch should decide explicitly (skip negative, keep zero) to avoid polluting the cumulative series.
- **`max - min` measurement branch** (issue #45) is unaffected but shares the same function — regression-test it.
- **Warning strip semantics**: with the fix, `reference_cumulative == null` will genuinely mean "reference has no data" — the current misleading "incomplete reference" message for an empty *current* series goes away naturally; verify the strip still shows for truly incomplete reference periods.
- **Pro-ration (if included)**: changes "to this day" numbers for all in-progress periods (small, but visible); document in changelog.
- **Milestone**: issue #56 is assigned to 1.2.0 (current branch) — fix should land here.

## Open Questions

- [NEEDS CLARIFICATION: is `sensor.pv_monthly` a native `total_increasing` statistic or a template/derived sensor? If it has no statistics at all, the current series is empty for a different reason (no LTS rows) and the `change`-first fix alone won't populate it — the "0 so far" rendering would still need the empty-series handling.]
- [NEEDS CLARIFICATION: should the pro-ration of the running bucket (reporter's second patch) be part of this fix or a separate issue?]
- [NEEDS CLARIFICATION: desired UX when the current series is genuinely empty (no statistics for the entity) — keep "no-data" state, or render 0 with a distinct message?]
