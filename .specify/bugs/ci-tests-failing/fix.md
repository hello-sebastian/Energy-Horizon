# Bug Fix: CI red on main — reverted refactor 3129866, made Storage test Node-version-proof

- **Slug**: ci-tests-failing
- **Fixed**: 2026-11-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Applied the assessment's preferred Option A: reverted the stale-base refactor
commit `3129866` (restoring the shipped 1.3.0 editor stylesheet, clean
`typecheck`, the 911 "0 `!`" invariant, the release notes, and dist/
sync), and made the `Storage`-spying test independent of Node builtins by
aliasing the jsdom `Storage` class in the manual DOM shim, with a new unit
test pinning the alias.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/energy-horizon-card-editor.ts` | reverted (commit `319ab19`, `git revert 3129866`) | Restores the 908 dialog-height-fill stylesheet (FR-908-AC/AD, SC-908-10), the `a226f31` collapsed-panel rule, the `hass` property and cast forms without the 3 type errors, and the defensive non-`!` patterns. File is now byte-identical to `d00f00b`. |
| `docs/archive/release-notes-1.3.0.md` | reverted (same commit `319ab19`) | Restores the 4 "Maintenance" bullets the refactor deleted (incl. constitution v1.3.0/v1.4.0 notes). |
| `tests/helpers/setup-dom.ts` | modified (commit `fd09852`) | Added `g.Storage = win.Storage;` with an explanatory comment, right after the `getComputedStyle` alias. `localStorage`/`sessionStorage` deliberately NOT aliased (see Deviations). |
| `tests/unit/setup-dom.test.ts` | added test (commit `fd09852`) | 2 tests pinning `globalThis.Storage` exists and is `=== window.Storage`. |

No other files changed. `dist/` did **not** need a rebuild: after the revert
the source is byte-identical to `d00f00b`, whose committed dist was verified
green (CI #30 `verify-dist` passed on `d00f00b`; `fec63dd`/T069 last rebuilt
dist and nothing touched dist/ since). Re-verified locally: fresh
`npm run build` produces a zero-diff `dist/`.

## Diff Highlights

```ts
// tests/helpers/setup-dom.ts
 g.getComputedStyle = win.getComputedStyle;
+// Alias the `Storage` class (not `localStorage`/`sessionStorage` — this JSDOM
+// instance has an opaque origin and THROWS `SecurityError` on either of those,
+// and no test touches them). Node versions differ in whether a global
+// `Storage` exists (Node 26 has the web-storage builtin; CI's Node 22 does
+// not), so tests that spy on `Storage.prototype` (picker-preview-render,
+// SC-006/FR-010) would otherwise pass locally and fail on CI. Aliasing the
+// jsdom class makes the spy deterministic on every Node version.
+g.Storage = win.Storage;
```

```ts
// tests/unit/setup-dom.test.ts (new)
describe("setup-dom shim: Storage global (bug ci-tests-failing)", () => {
  it("exposes a global Storage constructor", () => {
    expect(typeof g.Storage).toBe("function");
  });
  it("is the jsdom realm's Storage (same prototype window.Storage uses)", () => {
    const win = g.window as Record<string, unknown>;
    expect(g.Storage).toBe(win.Storage);
  });
});
```

## Tests Added or Updated

- `tests/unit/setup-dom.test.ts::exposes a global Storage constructor` — pins that
  the bare global `Storage` exists in the test environment regardless of Node
  version.
- `tests/unit/setup-dom.test.ts::is the jsdom realm's Storage` — pins identity with
  `window.Storage`, so `vi.spyOn(Storage.prototype, "setItem")` (and any future
  `window.localStorage.setItem` spy, which shares the same prototype) hits the
  jsdom realm's storage.
- The 5 existing CSS tests (`tests/unit/editor-dialog-fill.test.ts`,
  `tests/unit/editor-sections.test.ts`) are unchanged — they are the canaries
  that caught the regression, and they pass again after the revert.

## Local Verification

- Commands run (at `fd09852`, Node v26.8.1, macOS):
  - `npm test` → **841 passed (75 files), 0 failed** (pre-fix baseline: 5 failed /
    834 passed = 839; +2 new tests). The `Storage` test
    (`tests/integration/picker-preview-render.test.ts`, SC-006/FR-010) now
    spies on the jsdom `Storage.prototype` on every Node version.
  - `npm run typecheck` → **clean** (pre-fix: 3 errors at
    `energy-horizon-card-editor.ts:74` ×2, `:363`).
  - `npm run lint` → **0 errors, 0 warnings** (pre-fix: 3
    `no-non-null-assertion` warnings).
  - `npm run build && git diff --exit-code -- dist/` → **clean** (built
    `dist/energy-horizon-card.js` 1,177.24 kB, zero diff vs committed).
- Manual checks:
  - `git diff d00f00b HEAD --stat` → only the 2 test files differ from the
    last green-known state; `src/` and `dist/` are byte-identical.
  - `src/card/editor/control-render.ts` and `src/card/editor/yaml-mode.ts` are
    imported by the editor again (revert restored the 911/TD-12 wiring) — no
    dead code remains in `src/`.

## Deviations from Assessment

- **`localStorage`/`sessionStorage` not aliased.** The assessment's preferred
  step 2 proposed aliasing `g.Storage = win.Storage; g.localStorage =
  win.localStorage;`. During implementation it turned out this JSDOM instance
  (constructed in `setup-dom.ts` without a `url`, i.e. an **opaque origin**)
  throws `SecurityError: localStorage is not available for opaque origins` on
  any access to `window.localStorage` — so it cannot be aliased (and a bare
  `localStorage` global would throw in any test that touched it). Only the
  `Storage` **class** is aliased, which is exactly what the failing test
  needs: `vi.spyOn(Storage.prototype, "setItem")` intercepts
  `window.localStorage.setItem` too, since `window.localStorage` is an
  instance of that same class. Verified no other test or src file references
  bare `localStorage`/`sessionStorage`, so nothing else requires the change.

## Follow-ups

- **Push `main`** (user-side, per D4): local `main` is ahead of `origin/main`
  by `319ab19` (revert) + `fd09852` (shim fix); the next CI run should be fully
  green (tests, typecheck, lint, verify-dist).
- Optional hardening (non-blocking after the shim fix): pin the local
  toolchain to CI's Node 22 (`.nvmrc` + `engines` in `package.json`) so future
  environment-dependent tests are caught locally.
- Governance (non-blocking): the reverted work (`3129866`) is not lost — it is
  in history and could be redone as a proper change: restore it on a clean
  base with the 908 stylesheet, type-safe property/cast forms, the 911
  "0 `!`" pattern, and a rebuilt+committed `dist/` (assessment Option B). It
  also contradicted the closed 911 program by inlining `yaml-mode.ts` /
  `control-render.ts`; if the editor should stay single-file, that decision
  belongs in a separate, reviewable change.
