# Bug Verification: No working TypeScript type-check gate

- **Slug**: broken-typecheck-gate
- **Tested**: 2026-11-01
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The type-check gate is fully operational. `npm run typecheck` (`tsc --noEmit -p tsconfig.json`) now type-checks all of `src/` and `tests/` with 0 errors. A deliberate type error injected into `src/` is correctly caught (exit 2, TS2322), proving the original symptom (type errors undetected) no longer reproduces. No regressions: 564/564 tests pass, lint clean.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Injected `src/__gate_probe__.ts` with `const n: number = "not a number";` → `npm run typecheck` | pass | Gate correctly reports TS2322, exit 2. Probe removed after. |
| Type check (clean) | `npm run typecheck` | pass | 0 errors, exit 0 |
| Regression suite | `npm test` | pass | 564/564 passed (55 files) |
| Lint | `npm run lint` | pass | 0 errors, 0 warnings |
| tsconfig placement | `ls config/` + `ls tsconfig.json` | pass | Root tsconfig present; `config/tsconfig.json` removed |
| CI step present | Read `.github/workflows/ci.yml` | pass | `Type check` step between Test and Lint |

## Output Excerpts

- `npm run typecheck` → exit 0 (no output = no errors)
- `npm test` → `Test Files  55 passed (55)` / `Tests  564 passed (564)`
- `npm run lint` → exit 0 (no output = no errors)
- Negative test: `src/__gate_probe__.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.` → exit 2

## Residual Risks

- None identified. The gate is enforced in CI (`Type check` step) and locally (`npm run typecheck`).
- `@types/js-yaml` is intentionally NOT used (UMD global conflict); `tests/js-yaml.d.ts` provides a minimal ambient module. If the project ever needs full js-yaml types in `src/`, a different approach would be needed.

## Recommendation

Close the bug — verified end-to-end. The type-check gate is live in CI and locally, all pre-existing errors are fixed, and the negative test confirms the gate catches new errors.
