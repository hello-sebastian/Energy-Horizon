# Non-null assertion warnings — catalog

**Feature**: `911-tech-debt-reduction` | **Produced by**: T006 (TD-4, W1, 2026-11-16) | **Consumed by**: T014 (TD-6, W3)

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
- Total: **89 warnings across 13 files**. (FR-006's planning estimate was 65; this measured inventory supersedes it.)
- The gate stays green on these warnings (warnings do not fail `npm run lint`); they are tracked here, not suppressed.

## Inventory (file → `line:col`, as of 2026-11-16)

| File | Count | Locations |
|---|---|---|
| `src/card/ha-api.ts` | 22 | 32:14, 35:46, 74:14, 75:44, 244:22, 245:14, 261:27, 292:55, 295:16, 315:14, 482:24, 621:9, 621:39, 622:18, 625:23, 634:10, 728:5, 729:5, 730:20, 740:9, 740:39, 744:26 |
| `src/card/cumulative-comparison-chart.ts` | 21 | 123:21, 291:13, 292:13, 314:11, 314:44, 379:11, 379:41, 570:36, 586:25, 592:19, 593:19, 689:13, 690:13, 804:13, 804:46, 870:19, 871:19, 997:34, 1009:44, 1029:40, 1200:43 |
| `src/card/echarts-renderer.ts` | 11 | 403:11, 403:44, 405:27, 408:25, 413:38, 530:10, 566:23, 567:24, 717:20, 737:53, 1510:9 |
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
