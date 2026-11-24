# Bug Verification: HA color-picker preset tokens crash chart paint (gradient fill)

- **Slug**: color-picker-preset-crash
- **Tested**: 2026-11-24
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original crash mechanism is verifiably gone: an automated reproduction of the assessment's exact failure path — picker tokens `primary`/`light-blue` as `primary_color` with the 1.3.0 default gradient fill — run **through the real ECharts renderer** fails on the pre-fix code with the raw tokens in the paint values and passes on the fixed code with fully parseable colors. No regressions (934/934 suite green, typecheck and lint clean). The outstanding live-HA check was performed by the owner on 2026-11-24 on the deployed 1.3.1 build (fix confirmed working in HA); result upgraded `partial` → `verified`.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Temporary e2e test `tests/unit/verify-color-picker-preset-crash.test.ts` (deleted after run): real `EChartsRenderer` + mocked `setOption`, no `chartTheme` injected (production fallback path), 4 scenarios: token `primary` w/ theme var, token `light-blue` (2nd log value), broken theme (token, empty var), broken `--secondary-text-color: primary` reference path. Asserts series color + every gradient `colorStop` is a parseable CSS color and no raw token survives | pass | Pre-fix (via `git stash` of the 3 `src/` files): **4/4 failed** with `expected 'primary' to be '#03a9f4'`, `expected 'light-blue' to be '#29b6f6'` — the exact logged values reaching the paint; post-fix: 4/4 pass |
| Reproduction (live HA) | Manual steps from assessment: editor → pick preset → observe chart + HA log | pass | Executed by the owner on 2026-11-24 on the deployed 1.3.1 build — fix confirmed working; chart renders, log quiet |
| New / updated tests | `npx vitest run tests/unit/series-color.test.ts tests/unit/renderer-config.test.ts` | pass | 61 tests across the three files incl. the 28-token loop, free-text hex/rgb pins, unparseable→default, broken-theme reference |
| Regression suite | `npm test` | pass | **938/938 (77 files)** — 934 suite + 4 temporary reproduction tests; all pre-existing gradient/series-color/renderer-config tests green |
| Lint / type-check | `npm run typecheck` · `npm run lint` | pass | both clean |

## Output Excerpts

Pre-fix reproduction run (fix stashed):

```
× primary_color: 'primary' (picker token) … → expected 'primary' to be '#03a9f4' // Object.is equality
× primary_color: 'light-blue' (second token from the HA log) … → expected 'light-blue' to be '#29b6f6'
× broken theme (preset token, empty variable) … → expected 'primary' to be '#119894'
× broken theme mapping --secondary-text-color to a token … → expected 'primary' to be 'rgba(127, 127, 127, 0.4)'
Test Files  1 failed (1)   Tests  4 failed (4)
```

Post-fix (same run with fix applied): `✓ tests/unit/verify-color-picker-preset-crash.test.ts (4 tests)`; full suite: `Test Files 77 passed (77) · Tests 938 passed (938)`; `tsc --noEmit` and `eslint` clean.

## Residual Risks

- **Live-HA confirmation outstanding**: the fix is proven up to the real `setOption` boundary in the unit environment; the final "no more `addColorStop` SyntaxErrors in the HA log + preset swatch color renders" check needs one manual pass in HA with the 1.3.1 build (editor → pick a preset → watch log + chart). This is the only unexercised gap.
- jsdom has no `CSS.supports` — the `isPaintableColor` browser branch (`CSS.supports`) is covered by the same logic shape but not by the test env; the regex fallback diverges for CSS named colors (`lightblue`), documented in code and benign for HA users (always the browser path).
- Token-set drift vs HA `THEME_COLORS`: unknown new tokens would fall to the default color (visible, no crash); the 28-entry loop test keeps the set honest.

## Recommendation

Closed — the bug's mechanism is dead (reproduction fails pre-fix with the exact logged values, passes post-fix) and the owner confirmed the fix live in HA on the deployed 1.3.1 build (2026-11-24). Close public issue #78. No re-assessment needed.
