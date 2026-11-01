# Bug Verification: Reason-specific warning-bar messages for disabled forecast

- **Slug**: zero-reference-forecast
- **Tested**: 2026-11-01
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original symptom (generic "Forecast not available for this period." with no reason when the reference series is all-zero) no longer reproduces: the warning bar now shows the reason-specific message. The full reproduction chain (reference=0 → `computeForecast` → `disabledReason` → warning-bar text) is covered by an existing unit test plus the new integration test, and the full regression suite, type-check, and lint all pass.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | `tests/unit/ha-api.test.ts` "zero_reference_in_range when B = 0" + `tests/integration/card-render.test.ts` table-driven case `zero_reference_in_range` | pass | Unit test drives `computeForecast` with an all-zero reference (the assessment's repro precondition) and asserts `disabledReason === "zero_reference_in_range"`; the integration test renders the card in `ready` state and asserts the warning bar shows "no baseline to project from" and NOT the generic message. Together they exercise the full chain. |
| New / updated tests | `TZ=UTC npx vitest run tests/integration/card-render.test.ts` | pass | 21 passed (3 new table-driven cases: `zero_reference_in_range`, `no_reference`, `no_split`). |
| Regression suite | `npm test` | pass | 577 passed (55 files). |
| Lint / type-check | `npm run typecheck` ; `npm run lint` | pass | Both clean, no output. |

## Output Excerpts

Full suite:
```
Test Files  55 passed (55)
     Tests  577 passed (577)
```

Reproduction chain (unit, `ha-api.test.ts:254`):
```ts
it("zero_reference_in_range when B = 0", () => {
  const refRaws = Array.from({ length: n + 2 }, () => 0); // all-zero reference
  const s = comparisonFrom(
    makeCumulativeFromTimestamps(ts, 1),
    makeCumulativeFromTimestampsRaws(refTs, refRaws)
  );
  expect(computeForecast(s, 30).disabledReason).toBe("zero_reference_in_range");
});
```

Integration (new, `card-render.test.ts`):
```
ready: forecast disabled (zero_reference_in_range) — warning bar shows the reason-specific message  ✓
ready: forecast disabled (no_reference) — warning bar shows the reason-specific message  ✓
ready: forecast disabled (no_split) — warning bar shows the reason-specific message  ✓
```

## Residual Risks

- The assessment's reproduction was a real Home Assistant scenario (LTS reference window = 0). It was exercised via its **automated equivalent** (unit test through `computeForecast` + integration test rendering the warning bar), not a manual HA session. The fix is purely UI (a `reasonKey` mapping + translation keys, no change to forecast math), so the automated equivalent fully covers the changed path.
- `invalid_period` intentionally remains on the generic fallback (see fix.md Deviations); it is effectively unreachable in the `ready` state, so no test asserts a reason-specific message for it.

## Recommendation

Close the bug — verified. The reason-specific warning-bar messages render for all three data-driven disabled reasons, the all-zero-reference reproduction chain is covered end-to-end by tests, and there are no regressions (577 tests, type-check, and lint all green).
