# Bug Verification: Hour labels inconsistency — X-axis vs top panel, 12h/24h

- **Slug**: hour-label-format-inconsistency
- **Tested**: 2026-10-31
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The automated equivalents of all four reproduction scenarios from the assessment pass (axis, tooltip, and captions now agree under every `locale` × `time_format` combination), the full regression suite is green (552/552), lint is clean, and the reporter confirmed the live-UI behavior in Home Assistant (see Manual Verification below). The bug is resolved.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Automated equivalents: `npx vitest run tests/unit/axis-label-format.test.ts tests/unit/tooltip-format.test.ts tests/unit/period-label.test.ts` | pass | All 4 assessment repro scenarios encoded as unit tests: (2) `en` + unset → axis **and** caption both am/pm; (3) `pl` + `"12"` → axis 12h; (4) `en` + `"24"` → axis 24h; plus `pl` + unset → both 24h. |
| Reproduction (live HA UI) | Manual, by the reporter, in Home Assistant | pass | With HA profile `time_format` forced to 24h → 24h everywhere; with `time_format` on auto → am/pm under `en`. Consistent across X-axis, tooltip, and top panel. |
| New / updated tests | same command as above | pass | 45/45 in the 3 touched files, incl. the 10 new `hour12` matrix tests |
| Regression suite | `npm test` (`TZ=UTC vitest run`) | pass | 53 files, 552/552 |
| Lint | `npm run lint` | pass | clean |
| Type-check | `npx tsc --noEmit …` (ad-hoc; project has no type-check script — build is Vite/esbuild) | pass (with caveat) | Only pre-existing errors in **unmodified** files (`comparison-label-hints.ts`, `localize.ts`, `duration-parse.ts`, `parse-time-window-offset.ts`, `resolve-windows.ts`, `unit-scaler.ts` — luxon typings + 2 older issues). Zero errors in the 6 files changed by the fix. |

## Output Excerpts

```
Test Files  3 passed (3)
     Tests  45 passed (45)          # axis-label-format + tooltip-format + period-label

Test Files  53 passed (53)
     Tests  552 passed (552)        # full suite
```

Lint: no output (clean).

## Manual Verification

- Reporter (issue #52 author) confirmed in live Home Assistant: with the profile setting forced to 24h the card shows 24h consistently; with the setting on auto, `en` shows am/pm consistently. No inconsistency remains between the X-axis, tooltip, and top-panel captions.

## Residual Risks

- `en`-locale users without `time_format` will now see am/pm in top-panel captions (previously always 24h) — intended behavior change, should be noted in the changelog.
- `time_format: "language"` maps to locale default (pinned by `hour12FromHaTimeFormat` test) — assumed correct per the assessment's open question; no explicit user confirmation was obtained.
- Ad-hoc `tsc` surfaced pre-existing type errors unrelated to this fix (no project type-check gate exists); worth a separate cleanup task.

## Recommendation

**Close the bug — verified end-to-end** (automated matrix + live HA confirmation by the reporter). Remaining housekeeping: add a changelog note about the `en`-locale caption behavior change (am/pm when `time_format` is on auto) and close issue #52 on GitHub.
