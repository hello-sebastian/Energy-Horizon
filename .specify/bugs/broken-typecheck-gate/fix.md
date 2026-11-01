# Bug Fix: No working TypeScript type-check gate (broken tsconfig, no CI step, missing @types)

- **Slug**: broken-typecheck-gate
- **Fixed**: 2026-11-01
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The project had no working type-check gate: `config/tsconfig.json` matched zero files
(`include` globs resolved relative to `config/`), there was no root tsconfig, ESLint was
not type-aware, CI had no `tsc` step, and several dependencies lacked type declarations.
As a result, **68 pre-existing type errors across 35 files** were invisible to every gate
(`npm test`, `npm run lint`, CI all passed).

The fix restores a real gate and clears the entire backlog (fix-forward, per the user's
decision): the tsconfig now lives at the project root and type-checks `src/**` +
`tests/**`, a `typecheck` script and a CI `Type check` step were added, the missing
`@types/*` packages were installed, and all 49 remaining errors (after `@types` cleared
the TS7016 cluster) were fixed.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `tsconfig.json` | moved from `config/` to root | `include: ["src/**/*", "tests/**/*"]` now resolves correctly; `strict`, `moduleResolution: bundler`, `lib: [DOM, ES2020]`, `types: [vite/client]`. |
| `package.json` | modified | Added `"typecheck": "tsc --noEmit -p tsconfig.json"`. Added devDeps `@types/luxon`, `@types/jsdom`. (`@types/js-yaml` was tried then **removed** — see below.) |
| `.github/workflows/ci.yml` | modified | Added a `Type check` step (`npm run typecheck`) between `Test` and `Lint`. |
| `tests/js-yaml.d.ts` | added | Minimal ambient `declare module "js-yaml"` (no UMD global). Replaces `@types/js-yaml`, whose `export as namespace jsyaml` leaked a global that turned `window.jsyaml` into a non-optional intersection type. |
| `src/ha-types.ts` | modified | `connection.sendMessagePromise` simplified to `(_msg: Record<string, unknown>): Promise<unknown>` — the generic `<T = unknown>` made test stubs `async () => ({})` infer `Promise<{}>`, which is not assignable to `Promise<T>`. |
| `src/card/chart-renderer.ts` | modified | Deprecated Chart.js file: added `declare const Chart: any; type Chart = any;` stand-ins so the file type-checks without the (removed) Chart.js imports. |
| `src/card/energy-horizon-card-editor.ts` | modified | `hass` property: `accessor hass: HomeAssistant \| undefined = undefined` (Lit `@property` requires an accessor under TC39 decorators; the initializer satisfies strict `useDefineForClassFields`). Event cast widened to `as unknown as HaValueDetailEvent`. |
| `src/card/editor/config-merge.ts` | modified | `preservativeMerge`: `CardConfig` ↔ `ConfigRecord` casts widened via `unknown` (the two types don't overlap). |
| `src/card/editor/preset-switch.ts` | modified | `applyPresetSwitch`: same `as unknown as` widening for the `CardConfig` ↔ `ConfigRecord` round-trip. |
| `src/card/localize.ts` | modified | `resolveLocale`: the IIFE fallback branch now returns `"system" as NumberFormat` so the ternary's type is `NumberFormat`, not `string`. |
| `src/utils/unit-scaler.ts` | modified | `scaleSeriesValues`: the `'µ'`/`'\u03BC'` normalization compares against a widened `string` copy (`forcePrefixRaw`) — the literal `'μ'` has no overlap with the `ForcePrefix` union, so the direct comparison was a TS2367. |
| `tests/integration/card-render.test.ts` | modified | Removed `reference_cumulative: null` from the `ready` fixture — the field is `number \| undefined`, not nullable. |
| `tests/unit/build-chart-timeline-forecast.test.ts` | modified | `day()` helper now accepts optional `h/min/s/ms` args (two tests pass 7 args). |
| `tests/unit/card-header-resolution.test.ts` | modified | 10× `sendMessagePromise: async () => ({})` stubs now type-check against the simplified `Promise<unknown>` signature (no per-site change needed). |
| `tests/unit/echarts-renderer.test.ts` | modified | Removed a now-unused `@ts-expect-error` directive (the `getComputedStyle` assignment no longer errors). |
| `tests/unit/editor-config-merge.test.ts` | modified | Unknown-key assertions read through `out as unknown as Record<string, unknown>`; the numeric-string coercion fixture cast widened to `as unknown as CardConfig`. |
| `tests/unit/editor-coverage.test.ts` | modified | `FULL_CONFIG` (carries the unknown `custom_extra` key) cast to `as unknown as CardConfigInput`. |
| `tests/unit/editor-debounce.test.ts` | modified | `someUnknownKey` fixture cast widened; emitted-config assertion reads through `as unknown as Record<string, unknown>`. |
| `tests/unit/editor-degradation.test.ts` | modified | `el.hass = hass!` (the degraded-state test passes `undefined`); `force_prefix: "TYPO"` cast to the `ForcePrefix` union. |
| `tests/unit/editor-field-registry.test.ts` | modified | `field.control.suffix` read through a narrowed `{ suffix?: string }` cast (only the `number` variant of `ControlSpec` has `suffix`). |
| `tests/unit/editor-normalize.test.ts` | modified | The `interpretation: "bogus"` fixture cast widened to `as unknown as CardConfigInput`. |
| `tests/unit/editor-sections.test.ts` | modified | `elementStyles` entries read through `as unknown as { cssText: string }` (jsdom's `CSSStyleSheet` has no `cssText`). |
| `tests/unit/editor-yaml-mode.test.ts` | modified | No per-site change needed — the `tests/js-yaml.d.ts` ambient module (no UMD global) restores the clean optional `window.jsyaml` type, fixing all 6 assignment/`delete` errors. |
| `tests/unit/ha-api.test.ts` | modified | `fBuggy.forecast_total!` non-null assertion (the field is `number \| undefined`). |
| `tests/unit/localize-dictionary-loading.test.ts` | modified | Two `CardConfig` fixtures gained the required `comparison_preset`. |
| `tests/unit/time-windows-hard-limits.test.ts` | modified | `baseCard()` no longer sets `entity` before `...overrides` (it was specified twice). |
| `tests/unit/unit-scaler.test.ts` | modified | The Greek-mu `force_prefix` literal cast to the `ForcePrefix` union. |

## Why `@types/js-yaml` was removed

`@types/js-yaml` declares `export as namespace jsyaml`, which creates a **global UMD
namespace** `jsyaml`. Because `window` is typed as `Window & typeof globalThis`, the
`window.jsyaml` access in `tests/unit/editor-yaml-mode.test.ts` resolved to the
*intersection* of the optional `ha-types.ts` declaration and the full (non-optional)
js-yaml module type. That broke the test's stand-in assignments (`dump: () => ""` is not
assignable to the full `dump` signature) and `delete window.jsyaml` (operand not
optional). A minimal local `declare module "js-yaml"` (no UMD global) avoids the leak
entirely and mirrors the `window.jsyaml` shape already declared in `src/ha-types.ts`.

## Verification

- `npm run typecheck` → **0 errors** (was 49 after `@types` install; 68 before).
- `npm test` → **564/564 passed** (55 files).
- `npm run lint` → **0 errors, 0 warnings**.

The gate is now live: `npm run typecheck` runs in CI between `Test` and `Lint`, so any
future type error in `src/` or `tests/` fails the build.
