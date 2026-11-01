# Bug Verification: Duplicate concurrent data loads on hass updates while card is loading

- **Slug**: duplicate-concurrent-loads
- **Tested**: 2026-10-31
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

The fix holds under every automated check: the coalescing and stale-load-discard
regression tests pass, the full suite is green (564/564), lint passes, and both changed
files are type-clean. The result is **partial** — not `verified` — because the original
reproduction requires a live Home Assistant install (rapid `hass` updates observed in
devtools), which could not be exercised here; only its automated equivalent was run.

A type error found in the new test file during the first verification pass
(`CardEl` reduced to `never`) was fixed on 2026-11-01 and re-verified — see
"Follow-up Applied".

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix, live HA) | manual: open dashboard, trigger rapid entity changes, observe LTS batches in devtools | not-run | Requires a live HA install; not available in this environment. See automated equivalent below. |
| Reproduction (post-fix, automated equivalent) | `npx vitest run tests/integration/load-coalescing.test.ts` | pass | 3/3. Coalescing test proves `hass` updates during an in-flight load issue **no** extra `sendMessagePromise` batch; stale-load test proves a config change mid-load is not swallowed (final data reflects the new config). |
| New / updated tests | `npx vitest run tests/integration/load-coalescing.test.ts` | pass | 3/3 (coalescing, stale-discard, stale-rejection). |
| Regression suite | `npm test` | pass | 55 files, 564 tests, 0 failures. |
| Lint | `npm run lint` | pass | exit 0. |
| Type-check | `npx tsc --noEmit --strict … src/card/cumulative-comparison-chart.ts tests/integration/load-coalescing.test.ts` (ad-hoc) | pass | Both files type-clean (re-run 2026-11-01 after the `CardEl` fix). The only remaining diagnostic in the import graph is a pre-existing missing `@types/luxon` declaration (TS7016), unrelated to this fix. |

## Output Excerpts

New regression tests:
```
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

Full suite:
```
 Test Files  55 passed (55)
      Tests  564 passed (564)
```

Lint:
```
> eslint --config config/eslint.config.js "src/**/*.{ts,tsx,js,jsx}"
LINT_EXIT=0
```

Type-check (ad-hoc `tsc`, re-run 2026-11-01 after the `CardEl` fix): no diagnostics in
`src/card/cumulative-comparison-chart.ts` or `tests/integration/load-coalescing.test.ts`
(only the pre-existing missing `@types/luxon` declaration, TS7016, in the import graph).

Earlier run (2026-10-31) had failed on the new test file:
```
tests/integration/load-coalescing.test.ts: error TS2339: Property 'updateComplete' does not
exist on type 'never'.
  The intersection 'CardEl' was reduced to 'never' because property '_loadGeneration'
  exists in multiple constituents and is private in some.
```

Control (same ad-hoc `tsc` on the pre-existing `card-render.test.ts`) reports errors
(missing `@types/jsdom`, `@types/luxon`, and a real `TS2322` at `card-render.test.ts:428`),
confirming the project has **no working type-check gate** — tracked separately as
`broken-typecheck-gate`.

## Residual Risks

- **Live reproduction not exercised.** The bug's observable symptom (redundant LTS batches
  in a real HA install at 1–10×/s `hass` updates) was not directly observed. The automated
  coalescing test exercises the same code path (`updated()` → `_loadData()` guard) with a
  mocked `hass`, so the mechanism is proven, but end-to-end confirmation on a real install
  (ideally a Raspberry Pi, where the impact was reported) has not been done.
- **No working type-check gate (pre-existing).** `config/tsconfig.json` uses
  `include: ["src/**/*", "tests/**/*"]` relative to its own location (`config/`), so it
  matches zero files (`tsc -p` reports TS18003 "No inputs were found"), and the ESLint
  config is not type-aware (no `project` in `parserOptions`). This is why latent type
  errors slip through `npm test` and `npm run lint`. Unrelated to this fix; tracked
  separately as `broken-typecheck-gate`.

## Follow-up Applied (2026-11-01)

- `tests/integration/load-coalescing.test.ts`: `CardEl` no longer redeclares the private
  `_loadGeneration`/`_inFlightGeneration`; they are accessed through an `internals()` cast.
  Re-verified: 3/3 regression tests, 564/564 full suite, lint pass, ad-hoc `tsc` clean for
  both changed files.

## Recommendation

**Hold — functionally verified; one follow-up before closing.** The fix is correct and all
automated checks pass (tests, lint, type-check); the coalescing + stale-load-discard tests
directly encode the issue's required regression ("load in flight → config change → final
data reflects the new config").

To move to `verified`:
1. Exercise the live reproduction on a real HA install (or explicitly accept the automated
   equivalent as sufficient and note that decision).

Resolved during verification (2026-11-01): the `CardEl` type error in the new test file was
fixed and re-verified (see "Follow-up Applied").

Separately (not blocking this bug): the broken type-check gate is tracked as its own bug
assessment (`broken-typecheck-gate`).
