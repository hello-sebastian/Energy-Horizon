# Bug Assessment: CI red on main — refactor 3129866 regressed editor CSS, broke typecheck, left dist stale; one test is Node-version-dependent

- **Slug**: ci-tests-failing (auto-generated; user re-requested the analysis without a slug)
- **Created**: 2026-11-21
- **Source**: pasted text (in-session re-diagnosis of the user report "Testy na github nie przechodzą"); original evidence URL: https://github.com/hello-sebastian/Energy-Horizon/actions/runs/44925361445 (host: github.com — allowlisted, fetched; run list https://github.com/hello-sebastian/Energy-Horizon/actions also fetched)
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

User report: "Testy na github nie przechodzą – przeprowadź diagnostykę i wyjaśnij mi w czym problem"
linking GitHub Actions run 44925361445 (workflow `CI`, `test-and-lint` + `verify-dist`).
This is a re-run of the analysis at maximum thoroughness; all findings below were re-verified
against the working tree at HEAD (`main` @ `3129866`) and against the two most recent CI runs.

CI run #31 (commit `3129866`, pushed 2026-11-21) — 9 errors, 2 warnings:

1. `test-and-lint` → `npm test`: **6 test failures**
   - `tests/unit/editor-dialog-fill.test.ts:50` — `.editor` expected to contain `display: flex` (received `padding: 8px;`)
   - `tests/unit/editor-dialog-fill.test.ts:57` — `.toggle-row` expected to contain `flex: 0 0 auto` (missing)
   - `tests/unit/editor-dialog-fill.test.ts:63` — `.sections` expected to contain `min-height: 0` (missing; has `max-height: 60vh` instead)
   - `tests/unit/editor-dialog-fill.test.ts:72` — `.yaml-editor` expected to contain `flex: 1 1 auto` (missing)
   - `tests/unit/editor-sections.test.ts:509` — stylesheet expected to contain `ha-expansion-panel.editor-section:not([expanded])` (rule absent)
   - `tests/integration/picker-preview-render.test.ts:329` — `ReferenceError: Storage is not defined`
2. `verify-dist` — "dist/ is out of sync with source. Run npm run build and commit dist/ outputs."

CI run #30 (commit `d00f00b`, 2026-11-19, **before** the refactor) failed with **only** the
`Storage` test; `verify-dist` was green. Last green CI: run #29 (commit `255e13b`, 2026-11-08,
pre-1.3.0 code). So: the `Storage` failure predates the refactor; the CSS + dist failures are
newly introduced by `3129866`.

Re-verified locally at HEAD (`3129866`), Node v26.8.1:

- `npm test` → **5 failed | 834 passed (839)** — exactly the 5 CSS assertions above; the
  `Storage` test **passes locally** (Node 26 exposes a global `Storage`; CI's pinned Node 22
  does not).
- `npm run typecheck` → **3 errors** (never surfaced on GitHub because the Test step fails first):
  - `src/card/energy-horizon-card-editor.ts(74,44)` TS2564 — `hass` accessor has no initializer
  - `src/card/energy-horizon-card-editor.ts(74,48)` TS1276 — an `accessor` property cannot be declared optional
  - `src/card/energy-horizon-card-editor.ts(363,23)` TS2352 — `Event` → `HaValueDetailEvent` cast needs `unknown`
- `npm run lint` → 0 errors, **3 warnings** (`@typescript-eslint/no-non-null-assertion` at
  `energy-horizon-card-editor.ts:148`, `:929`, `:1349`) — the 911 program closed with an
  exit invariant of **0 `!` assertions in src**; `3129866` reintroduced 3.

## Symptom

`main` CI is red: the refactor commit `3129866` ("refactor: streamline YAML handling and
improve editor state management") silently rolled the editor stylesheet back to the
pre-1.3.0 version (removing the shipped 908 dialog-height-fill rules and the collapsed-panel
padding rule), broke `tsc`, and did not rebuild the committed `dist/`; independently, one
integration test depends on a Node builtin global (`Storage`) that exists on the developer's
Node 26 but not on CI's Node 22.

## Reproduction

1. `git checkout 3129866` (current `main` / `origin/main`).
2. `npm ci && npm test` → 5 CSS assertion failures (`editor-dialog-fill.test.ts`, `editor-sections.test.ts`). On Node 22 additionally `picker-preview-render.test.ts` fails with `ReferenceError: Storage is not defined`.
3. `npm run typecheck` → 3 errors in `src/card/energy-horizon-card-editor.ts`.
4. `npm run build && git diff --exit-code -- dist/` → non-zero (dist/ is the pre-refactor build; HACS serves `dist/energy-horizon-card.js` per `hacs.json`).

No `[NEEDS CLARIFICATION]` items — every failure mode was reproduced or directly evidenced.

## Suspected Code Paths

- `src/card/energy-horizon-card-editor.ts:1112-1310` (post-refactor `static styles` block) — the regressed stylesheet. Byte-for-byte identical to the 255e13b (2026-11-08) stylesheet **minus** the `ha-expansion-panel.editor-section:not([expanded])` rule from `a226f31`; vs. the pre-refactor `d00f00b` stylesheet it drops: `.editor { display:flex; flex-direction:column; max-height: calc(100vh - 284px) }`, `.toggle-row { flex: 0 0 auto }`, `.sections { flex: 1 1 auto; min-height: 0 }` (reverted to `max-height: 60vh`), `.yaml-editor { flex: 1 1 auto }`, and the collapsed-panel rule (plus the R14 derivation comment).
- `src/card/energy-horizon-card-editor.ts:74` — `@property({ attribute: false }) accessor hass?: HomeAssistant;` (was `accessor hass: HomeAssistant | undefined = undefined;`) — TS1276/TS2564.
- `src/card/energy-horizon-card-editor.ts:363` — `(e as HaValueDetailEvent)` (was `(e as unknown as HaValueDetailEvent)`) — TS2352.
- `src/card/energy-horizon-card-editor.ts:148,929,1349` — `window.jsyaml!`, `colCounts.get(f.column)!`, `this._config!` — the 3 new non-null assertions (911 invariant violation; lint warnings).
- `src/card/energy-horizon-card-editor.ts` — the refactor inlines the 911/TD-12 YAML state machine (`yaml-mode.ts`) and the `control-render.ts` renderer back into the element (+400 lines, 966 → 1369): `src/card/editor/control-render.ts` is now imported by **nothing** (orphaned); `src/card/editor/yaml-mode.ts` is imported only by its own test; `restoreTargets`/`applyRestoreTargets` in `editor-ui-state.ts` are now unused exports.
- `tests/integration/picker-preview-render.test.ts:329` — `vi.spyOn(Storage.prototype, "setItem")` uses the bare Node global `Storage`.
- `tests/helpers/setup-dom.ts` — the manual DOM shim (vitest runs in `node` env) aliases `document`, `HTMLElement`, events, etc., but **not** `Storage`/`localStorage`; bare `Storage` therefore resolves only from Node builtins (present in Node 26, absent in Node 22).
- `.github/workflows/ci.yml` — pins `node-version: "22"`; job order Test → Type check → Lint means the 3 typecheck errors are masked while the test step is red; `verify-dist` job builds and diffs `dist/`.
- `docs/archive/release-notes-1.3.0.md` — `3129866` also deleted 4 "Maintenance" bullets (changelog-canonicalization, repo hygiene, and the constitution v1.3.0 + v1.4.0 amendment notes).

## Root Cause Hypothesis

Three independent causes, all confirmed (confidence: **high** for each):

1. **Stale-base refactor (CI failures 1+2, latent typecheck failure).** `3129866` rewrote
   `energy-horizon-card-editor.ts` from an outdated baseline whose CSS matches the
   2026-11-08 version: it reverted the shipped 1.3.0 editor layout (908 FR-908-AC/AD,
   SC-908-10) and dropped the `a226f31` collapsed-panel fix, while inlining previously
   extracted modules (against the 911 program's and constitution v1.3.0 principle VII's
   direction). The same commit changed `hass` to an optional accessor (illegal for TS
   auto-accessors) and an `as unknown as` cast to a direct cast — 3 hard type errors — and
   skipped the repo's "rebuild + commit dist/" convention.
2. **Node-version-dependent test (CI failure 3, pre-existing since 2026-11-19).** The test
   spies on the bare global `Storage`; the project's DOM shim does not provide it, so the
   test passes only on Node versions with the native Web Storage global (local Node 26) and
   fails on CI's Node 22. The local gate therefore cannot catch it.
3. **Process gap.** `3129866` was committed without a green local gate (5 tests fail at
   HEAD locally), without `typecheck`, and without `npm run build` + dist commit.

## Proposed Remediation

**Preferred (Option A): revert `3129866`, then make the `Storage` test environment-proof.**

1. `git revert 3129866` (or reset `main`, since the commit is the tip and unmerged into any
   release). This restores: the 1.3.0 stylesheet (fixes the 5 CSS tests), typecheck
   cleanliness, the `!`-free source (911 invariant), the release-notes bullets, and
   `verify-dist` green (dist/ was in sync at `d00f00b` and has not changed since).
2. Fix the `Storage` dependency systemically in `tests/helpers/setup-dom.ts`: alias
   `g.Storage = win.Storage; g.localStorage = win.localStorage;` (jsdom's `window.Storage`
   exists — verified) so tests never depend on Node builtins for DOM APIs. The existing
   assertion at `picker-preview-render.test.ts:329` then spies on the jsdom Storage
   prototype — strictly stronger (it currently spies on Node's unrelated Storage locally)
   and identical on CI. Alternatively, change the test line to
   `vi.spyOn(window.localStorage, "setItem")` (one-liner, test-local).
3. Optional hardening: pin the local toolchain to CI's Node 22 (`.nvmrc` / `engines`) so the
   local gate exercises the same globals.

If the refactor is to be **kept** (Option B), all of the following are mandatory in addition
to step 2/3: restore the 5 CSS rules + R14 comment; fix the two type errors
(`hass: HomeAssistant | undefined = undefined`, `as unknown as HaValueDetailEvent`); remove
the 3 non-null assertions (restore the old defensive `if (count === undefined) continue;`
pattern and the captured-`config` pattern per 911/TD-6); either re-wire the editor back to
`yaml-mode.ts`/`control-render.ts` or delete those modules with their tests (governance
decision — inlining contradicts the closed 911 program and constitution VII); restore the 4
release-notes bullets; `npm run build` + commit `dist/`. Option B is a large change whose
net value is questionable (it undoes reviewed extractions and grows the element by 400 lines).

**Files likely to change**:
- `src/card/energy-horizon-card-editor.ts` (reverted in Option A; restored rules + type fixes in Option B)
- `tests/helpers/setup-dom.ts` (Storage/localStorage aliases)
- `tests/integration/picker-preview-render.test.ts` (only if the test-local fix variant is chosen)
- `docs/archive/release-notes-1.3.0.md` (restored in Option A)
- `dist/energy-horizon-card.js` (rebuilt + committed in Option B only)

**Tests to add or update**:
- The 5 existing CSS tests (`editor-dialog-fill.test.ts`, `editor-sections.test.ts`) are the
  correct canaries — keep them unchanged; they are what caught the regression.
- After the `setup-dom.ts` shim change, `picker-preview-render.test.ts` should pass on both
  Node 22 and Node 26; optionally add a tiny unit test in the shim's own spirit asserting
  `globalThis.Storage === window.Storage` (locks the systemic fix in).
- If Option B: keep `tests/unit/editor-yaml-mode.test.ts` (T025, element-level YAML
  round-trip) green; delete or re-point `tests/unit/yaml-mode.test.ts` per the module decision.

## Risks & Considerations

- **HACS live artifact is unaffected today**: `hacs.json` serves the committed
  `dist/energy-horizon-card.js`, which is still the pre-refactor build (with the 908 fix).
  The CSS regression is latent — but any future "fix CI by rebuilding dist/" that does not
  also restore the CSS would push the regression to live users.
- **Main currently cannot typecheck** — any tooling that runs `tsc` on `main` fails; the
  typecheck errors are masked in CI only because the Test step fails first.
- Revert (Option A) is low-risk: it restores a known-good state (`d00f00b` was verify-dist
  green and CSS/test-consistent; only the `Storage` test failed there).
- The `setup-dom.ts` shim change must not alias `ShadowRoot`/`Document`/`CSSStyleSheet`
  (the file documents why the Lit `adoptedStyleSheets` gate must short-circuit) — the
  `Storage`/`localStorage` aliases are orthogonal to that gate.
- Governance: keeping the refactor without addressing the 911 invariant (0 `!`) and the
  direction of the extractions would reopen closed program scope.
- CI cosmetic warnings (actions/checkout@v4 + setup-node@v4 on Node 24 runners, Node 20
  deprecation) are not failure causes.

## Open Questions

- [NEEDS CLARIFICATION: Is the `3129866` refactor intended work worth rescuing (Option B), or acceptable to revert and redo properly (Option A)?]
- [NEEDS CLARIFICATION: Should a Node version pin (`.nvmrc`/`engines`) be added so local gates match CI's Node 22?]
