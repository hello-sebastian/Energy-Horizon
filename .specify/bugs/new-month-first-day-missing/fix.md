# Bug Fix: New period starts empty — first day lost, zero buckets dropped, "no data" instead of "0 so far"

- **Slug**: new-month-first-day-missing
- **Fixed**: 2026-10-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

`normalizePoints()` in `src/card/ha-api.ts` now prefers the per-bucket `change` field over differencing `sum` for `total`/`total_increasing` statistics. This keeps the first bucket, preserves zero-consumption buckets as explicit 0 points, and stamps each value with its own bucket start — fixing the "new month problem" (issue #56) and the related "unknown instead of 0 so far" symptom.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/ha-api.ts` | modified | `normalizePoints()`: `change` branch moved before `sum`; `change >= 0` used directly (own-start timestamp), negative `change` skipped; `sum` differencing kept as fallback only |
| `tests/unit/ha-api.test.ts` | added tests | New `describe("normalizePoints — change-first (issue #56 …)")` block: 4 tests |
| `changelog.md` | modified | New entry under `[Unreleased] → Fixed` |

## Diff Highlights

`src/card/ha-api.ts` — branch order swapped, `change` first:

```ts
if (typeof p.change === "number") {
  // `total` / `total_increasing`: HA already returns the per-bucket increment.
  // Keeps the first bucket, preserves zero buckets, own-start timestamps.
  if (Number.isFinite(p.change) && p.change >= 0) {
    rawValue = p.change;
  }
  // Negative `change` = meter reset / inconsistent data — skip the bucket.
} else if (typeof p.sum === "number") {
  // Fallback for responses that carry `sum` without `change` (older HA / edge cases).
  if (previousSum === undefined) { /* baseline */ }
  else { /* delta = sum - previousSum, previous-bucket stamp */ }
} else if (typeof p.state === "number") { /* unchanged */ }
```

## Tests Added or Updated

- `tests/unit/ha-api.test.ts` → `normalizePoints — change-first … > prefers change over sum` — pins: first bucket kept (not baseline), own-start timestamps (no one-bucket shift), zero bucket preserved as explicit 0.
- `… > skips negative change (meter reset) but keeps zero` — pins: `change < 0` dropped, `change === 0` kept.
- `… > falls back to sum differencing when change is absent` — pins: legacy running-total path unchanged for `sum`-only responses.
- `… > fresh period (all-zero current) yields 0 / -100% in computeSummary, not undefined` — pins the user-reported symptom: an all-zero current series now produces `current_cumulative = 0`, `difference = −reference`, `differencePercent = −100` (not `undefined` → "Not enough data…").

Existing `mapLtsResponseToSeries` tests (sum-only, no `change`) pass unchanged — they exercise the fallback path.

## Local Verification

- Commands run: `TZ=UTC npx vitest run tests/unit/ha-api.test.ts` → 46 passed (46), incl. 4 new.
- Commands run: `npm test` → 558 passed (558) across 53 files — no regressions.
- `get_errors` on `src/card/ha-api.ts` and `tests/unit/ha-api.test.ts` → no errors.
- Manual checks: none (no live HA instance in this session). The screenshot scenario (Jul 2026 all-zero current vs Jun 2026 reference) is covered by the new `fresh period` test at the `computeSummary` level.

## Deviations from Assessment

- **Pro-ration of the running bucket** (`referenceCumulativeAtAlignedCurrentEnd()`) was **not** applied. The assessment lists it as an optional/secondary change, and it alters "TO THIS DAY" values for *all* in-progress periods (not just fresh ones). Per the "keep the change minimal" guardrail, it is deferred to a follow-up. The core fix already resolves the reported "unknown instead of 0" symptom and the three issue #56 symptoms.
- No other deviations. Scope stayed within the files named by the assessment.

## Follow-ups

- **Pro-ration of the still-running bucket** (reporter's second patch, issue #56 follow-up): interpolate the reference "to this day" value for the in-progress bucket so a partial day is compared against the same fraction of the reference day (their example: −34 % instead of −40 %). Candidate for a separate bug slug.
- **Genuinely empty current series** (entity with no statistics at all): still renders the `no-data` state. Decide desired UX — keep as-is, or render 0 with a distinct message. (Open question in the assessment.)
- **Verify on a live HA instance** with a real `total_increasing` sensor at the start of a new period, and confirm `sensor.pv_monthly` (screenshot entity) is a native statistic — if it is a template/derived sensor without statistics, the empty-current case above is what applies.
- Consider a regression test at the card-render level (not just `computeSummary`) asserting the warning strip no longer shows for an all-zero current series.
