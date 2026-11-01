# Bug Assessment: No working TypeScript type-check gate (broken tsconfig, no CI step, missing @types)

- **Slug**: broken-typecheck-gate
- **Created**: 2026-11-01
- **Source**: pasted text (evidence gathered during verification of `duplicate-concurrent-loads`)
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

Discovered while verifying the `duplicate-concurrent-loads` fix (issue #58). An ad-hoc
`tsc --noEmit` run found a real type error in the new test file (`CardEl` reduced to
`never`), but neither `npm test` nor `npm run lint` caught it. Investigation showed the
project has **no working type-check gate at all**:

1. `config/tsconfig.json` is broken — its `include` paths are relative to its own
   location, so it matches zero files.
2. There is no root `tsconfig.json`.
3. ESLint is not type-aware.
4. CI runs only `npm test` + `npm run lint` + a build/dist check — no type-check step.
5. Several dependencies lack type declarations (`luxon`, `js-yaml`, `jsdom`).

## Symptom

Type errors in `src/` and `tests/` are never detected by any automated gate. A real type
defect (a test-file type alias reducing to `never`) shipped undetected through `npm test`
and `npm run lint`, and would pass CI.

## Reproduction

1. `npx tsc --noEmit -p config/tsconfig.json` → `error TS18003: No inputs were found in
   config file 'config/tsconfig.json'. Specified 'include' paths were
   ["src/**/*","tests/**/*"]`.
2. Introduce a deliberate type error in any `src/**/*.ts` file.
3. Run `npm test` → passes. Run `npm run lint` → passes. The error is never reported.
4. (Evidence) Ad-hoc full type-check of `src` + `tests` (2026-11-01): **68 pre-existing
   errors across 35 files**, none of which any gate reports.

## Suspected Code Paths

- `config/tsconfig.json` — `include: ["src/**/*", "tests/**/*"]` is resolved relative to
  the config file's directory (`config/`), so it looks for `config/src/**` and
  `config/tests/**` — neither exists. `tsc -p` therefore finds no inputs (TS18003).
- `config/eslint.config.js` — `parserOptions` has no `project`/`projectService`, so
  `@typescript-eslint` runs in syntax-only mode; type-aware rules are unavailable.
- `.github/workflows/ci.yml` — jobs run `npm test`, `npm run lint`, `npm run build` +
  dist diff; no `tsc` step.
- `package.json` — no `typecheck` script; `devDependencies` lack `@types/luxon`,
  `@types/js-yaml`, `@types/jsdom`.
- `node_modules/luxon/package.json` (v3.7.2) — no `types`/`typings` field; `exports`
  point to `build/es6/luxon.mjs` / `build/node/luxon.js` with no type entry, so every
  `import … from "luxon"` is TS7016 under `strict`.

## Root Cause Hypothesis

**Confidence: high.** The tsconfig was placed in `config/` (alongside `vite.config.ts`
and `eslint.config.js`) without adjusting its `include` globs, which are always resolved
relative to the tsconfig's own location. The result is a config that type-checks nothing,
and because no other gate (CI, ESLint) performs type-checking, the defect is invisible.
The missing `@types/*` packages compound it: even a correctly-scoped `tsc` would fail on
TS7016 for `luxon`/`js-yaml`/`jsdom` before reaching the 68 real errors.

## Proposed Remediation

**Preferred**: restore a working, CI-enforced type-check in three steps:

1. **Fix the tsconfig scope.** Move `config/tsconfig.json` to the repo root as
   `tsconfig.json` (keeping the same `compilerOptions`), or keep it in `config/` and change
   `include` to `["../src/**/*", "../tests/**/*"]`. Root placement is the conventional
   choice and makes `tsc -p .` / editor tooling work out of the box.
2. **Add the missing type packages** to `devDependencies`: `@types/luxon`,
   `@types/js-yaml`, `@types/jsdom`. This clears the TS7016 wall.
3. **Add a `typecheck` script and CI step.** `package.json`:
   `"typecheck": "tsc --noEmit -p tsconfig.json"`. `ci.yml`: a `Type check` step running
   `npm run typecheck` in the `test-and-lint` job.

Then **triage the 68 pre-existing errors** (see below). Two viable strategies:

- **Fix-forward (recommended)**: fix all 68 errors now (most are small: missing
  `comparison_preset` in test fixtures, `NodeListOf` iteration needing
  `Array.from`, a few real `src/` type mismatches), then enable the CI gate. Cleanest
  end state; one-time cost.
- **Baseline-first**: enable the gate with the errors documented as a known baseline
  (e.g. `// @ts-expect-error` or a `tsc --noEmit` allowlist) and fix incrementally.
  Faster to land, but leaves a permanent debt marker and risks the baseline growing.

**Alternatives**:
- Make ESLint type-aware (`parserOptions.project`) instead of adding a `tsc` step.
  Heavier (ESLint becomes slower and coupled to the tsconfig), and it still doesn't catch
  all `tsc` diagnostics (e.g. TS2322 assignability without a rule for it). Not preferred
  as the primary gate; can complement it.

**Files likely to change**:
- `config/tsconfig.json` (moved to `tsconfig.json` or `include` corrected)
- `package.json` (new `typecheck` script; new `@types/*` devDependencies)
- `.github/workflows/ci.yml` (new `Type check` step)
- ~35 files under `src/` and `tests/` (the 68 pre-existing errors, if fix-forward)

**Tests to add or update**:
- No unit tests for the gate itself; the CI step is the verification. Optionally add a
  smoke test that `tsc --noEmit` exits 0 (redundant with CI, but pins the gate in the
  suite).

## Risks & Considerations

- **68 pre-existing errors**: enabling the gate will fail CI until they are fixed or
  baselined. This is the main cost and the reason a strategy decision (fix-forward vs.
  baseline) is needed before implementation.
- **`strict` mode**: the tsconfig already sets `strict: true`; some of the 68 errors are
  strict-mode findings (e.g. `number | undefined` not assignable to `number`). Fixing them
  may require small API/fixture adjustments, not just casts.
- **Editor behavior**: VS Code currently uses the broken `config/tsconfig.json` (or falls
  back to inferred settings), so editor type-checking is also unreliable. Moving the
  tsconfig to the root fixes the editor experience too.
- **No API breakage, no migrations, no security impact.** Pure tooling change.

## Open Questions

- [NEEDS CLARIFICATION: fix-forward (fix all 68 now) vs. baseline-first (gate with a
  documented baseline, fix incrementally)?]
- [NEEDS CLARIFICATION: should the tsconfig stay in `config/` (with corrected `include`)
  or move to the repo root (conventional)?]
- [NEEDS CLARIFICATION: is making ESLint type-aware also desired, or is a `tsc` CI step
  sufficient?]
