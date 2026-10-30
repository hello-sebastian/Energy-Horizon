# Bug Verification: Y-axis label clipping + dead space at the left edge

- **Slug**: y-axis-label-clipping
- **Tested**: 2026-10-31
- **Assessment**: ./assessment.md (Round 1 + Round 2)
- **Fix**: ./fix.md (Round 1 + Round 2)
- **Result**: verified

## Summary

Both symptoms are resolved: long Y-axis labels are no longer clipped (unit wraps to a second right-aligned line, `grid.left` grows to fit the widest label), and the dead space between the label and the card's left edge is gone (`grid.left` has no floor — the label sits flush at the left edge and the plot fills the full card width). All automated checks pass and the user confirmed the fix in a real HA instance after deploying to the server.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Manual — deployed to a real HA server, rendered the card with the reporter's entity/unit configuration | pass | User confirmation (2026-10-31): "Wgrałem na serwer, potwierdzam, że działa." Covers both rounds: long-label wrapping without clipping and the label flush at the left edge. |
| New / updated tests | `npx vitest run tests/unit/echarts-renderer.test.ts -t "y-axis-label-clipping"` | pass | 4/4 — unit wrapping (short inline / long two-line rich), non-rendered ticks empty, `grid.left` fits the widest label exactly (no floor) for long and short labels. |
| Regression suite | `npm run test` | pass | 53 files, 538/538 tests. |
| Lint / type-check | `npm run lint` | pass | Clean. (No dedicated typecheck script in the project; ad-hoc `tsc` on the changed file was clean in the fix phase.) |

## Output Excerpts

```
Test Files  53 passed (53)
     Tests  538 passed (538)
```

```
# targeted: -t "y-axis-label-clipping"
Test Files  1 passed (1)
     Tests  4 passed | 37 skipped (41)
```

```
# npm run lint
> eslint --config config/eslint.config.js "src/**/*.{ts,tsx,js,jsx}"
(clean — no output)
```

## Residual Risks

- The jsdom test environment has no canvas 2D context, so the unit tests exercise the deterministic `0.6em/char` fallback of `measureYAxisLabelWidth()`; the real `measureText` path is only exercised in the browser (covered by the user's manual verification).
- The exact reporter entity/unit combination (`force_prefix: none` + Wh, values ≥ 10 000) was confirmed by the user, but no screenshot was archived with this report.

## Recommendation

Close the bug — verified end-to-end: automated checks (targeted tests, full regression, lint) all pass and the user confirmed the fixed behavior in a real HA instance after deploying to the server. Both rounds (label clipping + left-edge dead space) are resolved.
