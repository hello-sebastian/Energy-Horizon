# Non-null assertion warnings — catalog

**Feature**: `911-tech-debt-reduction` | **Produced by**: T006 (TD-4, W1, 2026-11-16) | **Updated by**: T010 (TD-7, W2, 2026-11-17), T011 (TD-11, W2, 2026-11-17), T013 (TD-5, W3, 2026-11-17 — re-measured `echarts-renderer.ts` row after its typing reflow) | **Consumed by**: T014 (TD-6, W3)

This file is the **removal list for TD-6** (FR-006): every
`@typescript-eslint/no-non-null-assertion` warning reported by the gate on
2026-11-16, after T006 enabled the rule at `"warn"` level. When T014 enables
`noUncheckedIndexedAccess: true` and removes the assertions (replacing each
with an explicit guard, a typed helper, or a justified exception — at most 5
per SC-002, each with a `// justified: <reason>` comment), this list is the
complete inventory: the gate must report **0** such warnings afterwards, and
any new warning introduced in the meantime must be fixed in the same PR that
introduces it.

## How this list was generated

- Command: `npm run lint` (ESLint 9.39.4, flat config `config/eslint.config.js`), after T006 enabled `@typescript-eslint/no-non-null-assertion: "warn"`.
- Note: the rule is configured as `@typescript-eslint/no-non-null-assertion` (plugin rule). The core ESLint rule `no-non-null-assertion` named in FR-004 no longer exists in ESLint 9; the plugin rule is its direct replacement (it extends the core rule) and is what makes the spec's intent — warn-level detection of `!` assertions — enforceable.
- Total: **56 warnings across 13 files** (measured in the T011/TD-11 gate, 2026-11-17; the T010/TD-7 gate measured 57). The T009/TD-2 gate measured 73 (the T007/TD-10 gate measured 88; the T006 gate measured 89; T007's consolidation removed one assertion, old line 586 of the card element). T009's TD-2 extraction removed 15 assertions from the card element — the assertions moved with the pipeline code were dropped in the extraction (no `noUncheckedIndexedAccess` in the toolchain), not re-introduced in `ready-state-builder.ts` / `unit-scaler.ts`. T010's TD-7 extraction removed 16 more, all in `ha-api.ts` (22 → 6): the timeline functions moved to `src/card/timeline/` with all their assertions dropped, and the legacy `mapLtsResponseToSeries` / `buildComparisonPeriod` assertions went away with the functions (including the single-entity fallback's `keys[0]!`); the new `src/card/timeline/` and `src/card/time-windows/comparison-period.ts` files contain 0. The 6 remaining `ha-api.ts` warnings are all inside `computeForecast` (TD-6 territory). T011's TD-11 removed one more from the card element (5 → 4): the `previewChartTime!` state assertion at old line 495 — the preview gates now read the element field and the nested optional snapshot (`state.preview?.…`), so the assertion is unnecessary; the remaining four are at 124:21, 507:19, 508:19, 968:43. (FR-006's planning estimate was 65; this measured inventory supersedes it.)
- The gate stays green on these warnings (warnings do not fail `npm run lint`); they are tracked here, not suppressed.

## Inventory (file → `line:col`, as of 2026-11-17)

| File | Count | Locations |
|---|---|---|
| `src/card/ha-api.ts` | 6 | 284:5, 285:5, 286:20, 295:9, 295:39, 299:26 (all inside `computeForecast` — TD-6 territory) |
| `src/card/cumulative-comparison-chart.ts` | 4 | 124:21, 507:19, 508:19, 968:43 |
| `src/card/echarts-renderer.ts` | 11 | 417:11, 417:44, 419:27, 422:25, 427:38, 544:10, 580:23, 581:24, 731:20, 751:53, 1516:9 |
| `src/card/picker-preview.ts` | 10 | 71:24, 88:9, 95:14, 113:20, 114:32, 123:20, 125:32, 136:11, 143:35, 269:22 |
| `src/card/time-windows/resolve-windows.ts` | 8 | 41:16, 43:20, 113:18, 133:13, 148:20, 148:39, 149:16, 149:35 |
| `src/card/editor/config-merge.ts` | 5 | 56:18, 58:11, 65:24, 70:15, 76:7 |
| `src/card/energy-horizon-card-editor.ts` | 3 | 148:14, 929:25, 1355:50 |
| `src/card/axis/now-marker-slot.ts` | 3 | 12:14, 17:19, 18:43 |
| `src/card/time-windows/parse-time-window-offset.ts` | 2 | 38:18, 39:19 |
| `src/card/axis/auto-aggregation.ts` | 1 | 65:17 |
| `src/card/axis/axis-label-format.ts` | 1 | 59:29 |
| `src/card/axis/x-axis-format-validate.ts` | 1 | 105:15 |
| `src/card/time-windows/duration-parse.ts` | 1 | 28:16 |

Line numbers are stable as long as no PR touches the affected file; if a W2/W3 task edits one of these files, re-run `npm run lint` and update this table (or delete the entries fixed by that task) in the same commit.

## Out of scope for TD-6

- The scoped `/* eslint-disable @typescript-eslint/no-explicit-any */` at the top of `src/card/echarts-renderer.ts` (T006 decision D1) — that exception belongs to TD-5 (T013), not to this list.
