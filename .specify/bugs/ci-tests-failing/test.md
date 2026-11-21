# Bug Verification: CI red on main — reverted refactor 3129866, Storage test Node-version-proof

- **Slug**: ci-tests-failing
- **Tested**: 2026-11-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The bug no longer reproduces: all six CI #31 failure modes (5 CSS assertions +
`Storage is not defined`) pass at the fixed HEAD, including a full-suite run in
a Node-22-equivalent environment (no `Storage`/`localStorage` globals — the
exact condition that broke CI #30/#31). No regressions: 841/841 tests, clean
typecheck and lint, zero-diff `dist/` rebuild. The final GitHub CI run is
user-side (push required) and is not part of this verification.

## Checks Performed

All commands run at HEAD `f4a84e9` (local `main`, 3 commits ahead of
`origin/main`: `319ab19` revert, `fd09852` shim fix, `f4a84e9` bug docs),
macOS, Node v26.8.1.

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix): the 3 files that failed in CI #31 | `npm test -- tests/unit/editor-dialog-fill.test.ts tests/unit/editor-sections.test.ts tests/integration/picker-preview-render.test.ts` | pass | 40/40 tests — includes the 5 regressed CSS assertions (SC-908-10 canaries) and the `Storage.prototype.setItem` spy test (SC-006/FR-010) |
| Reproduction (post-fix): the Node 22 `ReferenceError` condition | `TZ=UTC node --no-experimental-webstorage ./node_modules/vitest/vitest.mjs run` (full suite) | pass | Flag verified beforehand: it removes the native `Storage`/`localStorage` builtins (`typeof Storage === "undefined"`), reproducing CI's Node 22 global environment on Node 26. Full suite: 841/841 (75 files) |
| New tests from the fix | `npm test` (covers `tests/unit/setup-dom.test.ts`) | pass | 2/2 — global `Storage` exists and is `=== window.Storage` |
| Regression suite (standard environment) | `npm test` | pass | 841/841 (75 files), 0 failed — up from 5 failed/839 before the fix |
| Type check | `npm run typecheck` | pass | clean (pre-fix: 3 errors at `energy-horizon-card-editor.ts:74` ×2, `:363`) |
| Lint | `npm run lint` | pass | 0 errors, 0 warnings (pre-fix: 3 `no-non-null-assertion` warnings) |
| `verify-dist` equivalent | `npm run build && git diff --exit-code -- dist/` | pass | built `dist/energy-horizon-card.js` 1,177.24 kB — zero diff vs committed dist |
| Scope/consistency | `git diff d00f00b HEAD --stat` (read-only) | pass | only `tests/helpers/setup-dom.ts` (+8), `tests/unit/setup-dom.test.ts` (+26) and the two bug docs differ from the last green-known state `d00f00b`; `src/` and `dist/` byte-identical |
| GitHub CI run (post-push) | — | not-run | User-side step (direct push policy); local gate is byte-equivalent to the CI steps (same commands; Node global environment covered by the simulation above) |

## Output Excerpts

```
# Targeted: the 3 files that failed in CI #31
 ✓ tests/integration/picker-preview-render.test.ts (14 tests) 385ms
 Test Files  3 passed (3)
      Tests  40 passed (40)

# Full suite in Node-22-equivalent environment (--no-experimental-webstorage)
 ✓ tests/unit/setup-dom.test.ts (2 tests) 1ms
 Test Files  75 passed (75)
      Tests  841 passed (841)

# verify-dist
dist/energy-horizon-card.js  1,177.24 kB │ gzip: 307.81 kB
✓ built in 1.19s
DIST_DIFF_CLEAN
```

## Residual Risks

- **Final CI confirmation is pending push.** Local `main` is 3 commits ahead of
  `origin/main`; the next GitHub run (expected green) is the end-to-end
  confirmation and is user-side.
- **Node 22 environment was simulated, not real.** Node 22 is not installed
  locally (no nvm/fnm/mise/volta/asdf). The simulation removes exactly the
  globals whose absence caused the failure (verified: `typeof Storage ===
  "undefined"` before the shim ran), which is the direct failure mechanism.
  Other Node 22-vs-26 differences (V8 internals, ICU) are not exercised; the
  CI push closes that gap.
- **macOS vs ubuntu-latest runners.** The suite is environment-light (jsdom
  shim, no canvas, no network); the CI push also covers the OS axis.
- **Pre-existing, out of scope:** `editor.ts` carries the lint-clean but
  style-flagged definite-assignment `!` noted in the 911 closeout
  (`_mergedTimeWindow!`), and the cosmetic Node 20 deprecation warnings in CI —
  neither is a failure cause.

## Recommendation

Close the bug — verified. Every reproduction path from the assessment was
exercised post-fix (CSS canaries pass; the full suite passes in a
Node-22-equivalent global environment), with no regressions across the full
gate. Remaining action is user-side: push `main` (`319ab19`, `fd09852`,
`f4a84e9`) and confirm CI run #32 is green. The process recommendations from
the post-mortem (`npm run gate` script, Node 22 pin via `.nvmrc`/`engines`,
pre-commit hook, CI job split, branch protection) remain open follow-ups, not
blockers.
