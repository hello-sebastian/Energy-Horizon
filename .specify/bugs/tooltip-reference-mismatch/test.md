# Bug Verification: "TO THIS DAY" panel vs tooltip reference mismatch (YoY + MoM)

- **Slug**: tooltip-reference-mismatch
- **Tested**: 2026-11-02
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The fix was corrected after a live MoM report. The original bug (YoY, `boiler`)
was first fixed with a "previous slot" reference, but a live MoM report
(`biurko`, panel 2,285 Wh vs tooltip 1,679 Wh) showed the current series
**includes** today's point for MoM, so the panel reference aligns to the today
slot — the "previous slot" value was wrong there.

The corrected fix passes the panel's actual reference cumulative
(`summary.reference_cumulative`) into the renderer as `panelReferenceCumulative`
and uses it for the tooltip reference row and the delta segment at the today
slot. This makes the tooltip and the delta segment always match the "TO THIS
DAY" panel, regardless of preset.

Automated coverage now includes a dedicated MoM regression test (current series
includes today's point → tooltip reference = panel reference = today-slot value)
plus the original YoY integration test. The full regression suite (583 tests),
typecheck, and lint are all green. The **live-HA hover** on the user's real
dashboard was confirmed by the user on 2026-11-02 (MoM card `biurko`: tooltip
reference equals the "TO THIS DAY" panel reference, forecast row absent at the
today slot), so the result is `verified`.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) — YoY automated equivalent | `npx vitest run tests/integration/tooltip-panel-consistency.test.ts` | pass | Open-bucket YoY scenario; asserts panel `reference_cumulative` (15) == tooltip reference at today slot (15), and the today-slot reference value (25) does not leak. |
| Reproduction (post-fix) — MoM automated equivalent | `npx vitest run tests/unit/echarts-renderer.test.ts` (MoM regression test) | pass | Current series includes today's point; asserts tooltip reference = panel reference (today-slot value 35), not the previous slot (25). Mirrors the live `biurko` report (2,285 vs 1,679). |
| Reproduction (post-fix) — live HA hover | manual hover on the real dashboard (user) | pass | User confirmed on 2026-11-02: on the MoM card (`biurko`) the tooltip reference at the today slot equals the "TO THIS DAY" panel reference (2,285 Wh), the forecast row is absent at the today slot, and the delta segment matches the panel difference. |
| New / updated tests (unit) | `npx vitest run tests/unit/echarts-renderer.test.ts` | pass | 5 A+ tests pass: today-slot reference = panel reference + forecast omitted; future-slot forecast present / current absent; fallback when panel reference unavailable; delta segment uses panel reference while the dot stays on the line; MoM regression. |
| Regression suite | `npm test` | pass | 583 passed (56 files). No regressions in the changed module or elsewhere. |
| Lint / type-check | `npm run typecheck` ; `npm run lint` | pass | Both clean (no errors). |

## Output Excerpts

Targeted run (post-fix reproduction + new tests):

```
✓ tests/unit/echarts-renderer.test.ts > EChartsRenderer > T025: Tooltip formatter > A+: today-slot tooltip + delta segment (bug: tooltip-reference-mismatch) > tooltip at today slot: reference row = panel reference cumulative, forecast row omitted
✓ tests/unit/echarts-renderer.test.ts > ... > A+: today-slot tooltip + delta segment (bug: tooltip-reference-mismatch) > tooltip at a future slot: forecast row present, current row absent
✓ tests/unit/echarts-renderer.test.ts > ... > A+: today-slot tooltip + delta segment (bug: tooltip-reference-mismatch) > tooltip at today slot: falls back to the item value when the panel reference is unavailable
✓ tests/unit/echarts-renderer.test.ts > ... > A+: today-slot tooltip + delta segment (bug: tooltip-reference-mismatch) > delta segment at today slot uses the panel reference cumulative; reference dot stays on the line
✓ tests/unit/echarts-renderer.test.ts > ... > A+: today-slot tooltip + delta segment (bug: tooltip-reference-mismatch) > MoM: current includes today's point → tooltip reference = panel reference (today-slot value)
✓ tests/integration/tooltip-panel-consistency.test.ts > tooltip ↔ panel reference consistency (bug: tooltip-reference-mismatch) > panel reference cumulative equals the tooltip reference value at the today slot
 Test Files  2 passed (2)
      Tests  47 passed (47)
```

Full regression + gates:

```
 Test Files  56 passed (56)
      Tests  583 passed (583)
=== TYPECHECK ===  (tsc --noEmit — clean)
=== LINT ===       (eslint — clean)
```

## Residual Risks

- **Open question from the assessment remains (non-blocking).** The "TO THIS DAY" panel caption may still read as "up to today" rather than "up to the last full (closed) day"; this is a documentation/caption decision, not a code defect.

## Recommendation

Close the bug — verified end-to-end. The automated equivalents for both presets pass (YoY integration test + MoM regression unit test), the regression suite (583), typecheck, and lint are green, and the user's live dashboard check confirmed the tooltip reference equals the "TO THIS DAY" panel reference with the forecast row omitted at the today slot. No further code change is indicated.
