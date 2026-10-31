# Bug Verification: New period starts empty — first day lost, zero buckets dropped, "no data" instead of "0 so far"

- **Slug**: new-month-first-day-missing
- **Tested**: 2026-10-31
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

All automated checks pass — the 4 new change-first tests, the full 558-test regression suite, and lint are clean, and the changed file type-checks. However, the assessment's end-to-end reproduction (a live HA instance with a `total_increasing` sensor at the start of a new period) was **not** exercised in this session; only its automated equivalent (unit tests simulating the exact LTS response shape from issue #56) was run. Per the verification guardrail, the result is downgraded to **partial** rather than **verified**.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix, end-to-end) | Live HA card on a `total_increasing` sensor at the start of a new period | not-run | Requires a running HA instance + real sensor; not available in this session. The earlier `npm run deploy` in context predates this (uncommitted) fix, so it does not count. |
| Reproduction (post-fix, automated equivalent) | `TZ=UTC npx vitest run tests/unit/ha-api.test.ts -t "change-first"` | pass | 4 passed — simulates the issue #56 LTS shape (sum+change, zero buckets, fresh all-zero period → 0 / −100 %). |
| New / updated tests | `TZ=UTC npx vitest run tests/unit/ha-api.test.ts` | pass | 46 passed (46), incl. the 4 new change-first tests. |
| Regression suite | `npm test` | pass | 558 passed (558) across 53 files — no regressions. |
| Lint | `npm run lint` | pass | No warnings/errors on `src/**`. |
| Type-check | `npx tsc --noEmit …` (standalone) | not-run | Project has **no** type-check script (workflow is `vite` build + `vitest` + `eslint`). Standalone `tsc` surfaced a pre-existing error in `src/utils/unit-scaler.ts(239,40)` (file **not** touched by this fix) and a `luxon` declaration artifact of the standalone invocation — neither is a regression from this change. |

## Output Excerpts

Targeted new tests:
```
Test Files  1 passed (1)
     Tests  4 passed | 42 skipped (46)
```

Full regression suite:
```
Test Files  53 passed (53)
     Tests  558 passed (558)
```

Lint:
```
> eslint --config config/eslint.config.js "src/**/*.{ts,tsx,js,jsx}"
(no output — clean)
```

Standalone type-check (pre-existing, unrelated to this fix):
```
src/utils/unit-scaler.ts(239,40): error TS2367: This comparison appears to be
unintentional because the types 'SIPrefix | "auto" | "none"' and '"μ"' have no overlap.
```
`git diff --name-only` → `changelog.md`, `src/card/ha-api.ts`, `tests/unit/ha-api.test.ts` (unit-scaler.ts not in the set).

## Residual Risks

- **No live end-to-end confirmation.** The fix is proven at the `normalizePoints` / `computeSummary` unit level, but not against a real HA `recorder/statistics_during_period` response on a real `total_increasing` sensor at the start of a new period.
- **`sensor.pv_monthly` (screenshot entity) unconfirmed.** If it is a template/derived sensor with no statistics, the current series is empty for a different reason (no LTS rows) and the "0 so far" rendering would depend on the still-open "genuinely empty current series" UX question — not covered by this fix.
- **Pro-ration of the running bucket** was intentionally deferred (see fix.md); the "to this day" value for an in-progress period still compares a partial day against a full reference bucket.
- **Pre-existing type error** in `unit-scaler.ts` is unrelated but worth a separate look (project has no type-check gate, so it went unnoticed).

## Recommendation

**Hold — automated verification is green, but close only after a live check.** The unit-level evidence strongly indicates the bug is fixed (first day kept, zero buckets preserved, fresh period → 0 / −100 % instead of `---` / "Not enough data…"), and nothing regressed. To move to **verified**, run the card against a real `total_increasing` sensor at the start of a new period (e.g. `npm run deploy` this branch, then open the card on day 1 of the month and confirm the current column shows `0,00` with a real `−100 %` delta rather than `---` and the "incomplete reference" strip). Also confirm whether `sensor.pv_monthly` is a native statistic. If a live instance is not available, consider adding a card-render-level regression test (asserting the warning strip does not show for an all-zero current series) to raise confidence before closing.
