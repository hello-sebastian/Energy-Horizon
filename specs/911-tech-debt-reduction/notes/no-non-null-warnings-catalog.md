# Non-null assertion warnings — catalog

**Feature**: `911-tech-debt-reduction` | **Produced by**: T006 (TD-4, W1, 2026-11-16) | **Updated by**: T010 (TD-7, W2, 2026-11-17), T011 (TD-11, W2, 2026-11-17), T013 (TD-5, W3, 2026-11-17 — re-measured `echarts-renderer.ts` row after its typing reflow) | **Consumed by**: T014 (TD-6 + T023, W3, 2026-11-17) — **status: zero**

## Status: consumed (2026-11-17, T014/TD-6)

T014 enabled `noUncheckedIndexedAccess: true` in `tsconfig.json` and removed
**all 56 cataloged assertions** (and the T023 `previewWindows[0]!` /
`previewWindows[1]!` pair, which were the 507:19 / 508:19 row in this
catalog). No `justified:` exceptions were needed — the SC-002 cap is 5, the
count used is **0**. The gate re-measured after the change reports
**0** `@typescript-eslint/no-non-null-assertion` warnings (lint: 0 warnings
/ 0 errors total), 732/732 tests green with unchanged expected values,
typecheck clean, build 1,172.71 kB.

Removal patterns used per site:

- explicit guards and early returns / `throw` for impossible invalid config
  (`time-windows/resolve-windows.ts`, `comparison-period.ts`, `picker-preview.ts`)
- captured object references instead of `series[i]!` index round-trips
  (`echarts-renderer.ts` markLine/markPoint attach,
  `cumulative-comparison-chart.ts` preview destructuring — the latter also
  closes T023's FR-011)
- `?? 0` / `?.value ?? 0` dead-path fallbacks in demo-data code
- compiler-guard `if (!w0) throw`-style narrowing and undefined checks
  (`ha-api.ts` `computeForecast`, `config-merge.ts`, editor `render()`
  capture-into-local)
- `== null` null-vs-undefined guard fix in `buildDashedNullGapValues`
  (the old `=== undefined` check was wrong because `!` stripped null too)

The 108 new `noUncheckedIndexedAccess` type errors the flag surfaced were
fixed in the same commit: `src/` via guards, captured locals, optional
chaining, and throws for invalid config; test files via minimal `!`
assertions (tests are outside the lint scope `src/**`, so the measured
0-count for FR-006 is unaffected).

## How this list was generated

- Command: `npm run lint` (ESLint 9.39.4, flat config `config/eslint.config.js`), after T006 enabled `@typescript-eslint/no-non-null-assertion: "warn"`.
- Note: the rule is configured as `@typescript-eslint/no-non-null-assertion` (plugin rule). The core ESLint rule `no-non-null-assertion` named in FR-004 no longer exists in ESLint 9; the plugin rule is its direct replacement (it extends the core rule) and is what makes the spec's intent — warn-level detection of `!` assertions — enforceable.
- Original total: **56 warnings across 13 files** (measured in the T011/TD-11 gate, 2026-11-17). History: T006 gate 89 → T007/TD-10 88 (one consolidated away) → T009/TD-2 73 (15 removed in the pipeline extraction) → T010/TD-7 57 (16 removed from `ha-api.ts`) → T011/TD-11 56 (one more from the card element). The inventory below is the final state as consumed. (FR-006's planning estimate was 65; the measured inventory superseded it.)

## Inventory as consumed (file → locations, final state 2026-11-17)

| File | Count | Locations | Status |
|---|---|---|---|
| `src/card/ha-api.ts` | 6 | 284:5, 285:5, 286:20, 295:9, 295:39, 299:26 (all inside `computeForecast`) | removed (T014) |
| `src/card/cumulative-comparison-chart.ts` | 4 | 124:21, 507:19, 508:19, 968:43 (507/508 = T023 `previewWindows` pair) | removed (T014/T023) |
| `src/card/echarts-renderer.ts` | 11 | 417:11, 417:44, 419:27, 422:25, 427:38, 544:10, 580:23, 581:24, 731:20, 751:53, 1516:9 | removed (T014) |
| `src/card/picker-preview.ts` | 10 | 71:24, 88:9, 95:14, 113:20, 114:32, 123:20, 125:32, 136:11, 143:35, 269:22 | removed (T014) |
| `src/card/time-windows/resolve-windows.ts` | 8 | 41:16, 43:20, 113:18, 133:13, 148:20, 148:39, 149:16, 149:35 | removed (T014) |
| `src/card/editor/config-merge.ts` | 5 | 56:18, 58:11, 65:24, 70:15, 76:7 | removed (T014) |
| `src/card/energy-horizon-card-editor.ts` | 3 | 148:14, 929:25, 1355:50 | removed (T014) |
| `src/card/axis/now-marker-slot.ts` | 3 | 12:14, 17:19, 18:43 | removed (T014) |
| `src/card/time-windows/parse-time-window-offset.ts` | 2 | 38:18, 39:19 | removed (T014) |
| `src/card/axis/auto-aggregation.ts` | 1 | 65:17 | removed (T014) |
| `src/card/axis/axis-label-format.ts` | 1 | 59:29 | removed (T014) |
| `src/card/axis/x-axis-format-validate.ts` | 1 | 105:15 | removed (T014) |
| `src/card/time-windows/duration-parse.ts` | 1 | 28:16 | removed (T014) |

Line numbers are the final-state (T011-measured) positions, retained for
traceability; they no longer apply after the T014 edits.

## Standing rule (survives the zero state)

`@typescript-eslint/no-non-null-assertion` stays at `"warn"` in
`config/eslint.config.js` and `noUncheckedIndexedAccess` stays `true`. Any
new `!` assertion in `src/**` must be fixed in the same PR that introduces
it; the gate's measured count must stay **0**.

## Out of scope for TD-6 (resolved under TD-5)

- The scoped `/* eslint-disable @typescript-eslint/no-explicit-any */` at the top of `src/card/echarts-renderer.ts` (T006 decision D1) — that exception belonged to TD-5 (T013, commit `948538a`), not to this list. T013 removed it: the file now carries 0 `any` and 0 eslint-disable comments.
