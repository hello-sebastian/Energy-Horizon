# Bug Fix: HA color-picker preset tokens crash chart paint (gradient fill)

- **Slug**: color-picker-preset-crash
- **Fixed**: 2026-11-24
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The card's editor offers HA's `ha-color-picker`, whose presets emit HA theme-color **token names** (`primary`, `light-blue`, …), but the color resolver passed them through verbatim to the canvas — where the 1.3.0 default gradient fill (`addColorStop`) throws `SyntaxError` and blanks the whole chart. The resolver now (A) maps all 28 HA theme tokens to their `--<name>-color` theme variables, and (B) is total: a final exit validation (`isPaintableColor`) substitutes the brand default for any value unparseable as CSS, so `addColorStop` can never receive garbage. The reference series color gets the same sanitization at both theme-resolution sites.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/series-color.ts` | modified | A: `HA_THEME_TOKENS` (25 picker + 3 YAML-only) → `--<name>-color` (`disabled` also tries `--disabled-text-color`); B: exported `isPaintableColor` + validation at the single exit of `resolveSeriesCurrentColor` → `EH_SERIES_DEFAULT_FALLBACK` |
| `src/card/renderer-config.ts` | modified | `resolveChartTheme`: `seriesReference` sanitized via `isPaintableColor` (fallback `rgba(127, 127, 127, 0.4)`) |
| `src/card/echarts-renderer.ts` | modified | fallback copy of `resolveChartTheme` (no `chartTheme` injected): same `seriesReference` sanitization; import of `isPaintableColor` |
| `tests/unit/series-color.test.ts` | added tests | token loop over all 28 names, `disabled` fallback var, empty-var chain, free-text hex/rgb pins, unparseable → default, `isPaintableColor` unit cases |
| `tests/unit/renderer-config.test.ts` | added test | broken-theme `--secondary-text-color: primary` → reference fallback; extracted `restoreGetComputedStyle` helper (shared with the pre-existing FR-018 test) |
| `README.md` | modified | one line: color-picker presets follow the HA theme palette |

## Diff Highlights

```ts
// series-color.ts — root fix + total resolver
const HA_THEME_TOKENS = new Set(["primary", "accent", "light-blue", … /* 28 HA names */]);

export function isPaintableColor(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (typeof globalThis.CSS !== "undefined" && typeof globalThis.CSS.supports === "function") {
    return globalThis.CSS.supports("color", v);
  }
  return HEX_RE.test(v) || RGB_RE.test(v); // jsdom has no window.CSS
}

export function resolveSeriesCurrentColor(host, primaryColorFromConfig): string {
  const resolved = resolveRaw(host, primaryColorFromConfig);
  return isPaintableColor(resolved) ? resolved : EH_SERIES_DEFAULT_FALLBACK;
}
```

```ts
// renderer-config.ts / echarts-renderer.ts — reference series net
const seriesReferenceRaw = readVar("--secondary-text-color");
const seriesReference = isPaintableColor(seriesReferenceRaw)
  ? seriesReferenceRaw
  : "rgba(127, 127, 127, 0.4)";
```

## Tests Added or Updated

- `tests/unit/series-color.test.ts` — `resolves the color-picker preset %s …` (×28, catches token-set drift): each HA token resolves to its `--<name>-color` variable.
- `tests/unit/series-color.test.ts` — `disabled` → `--disabled-text-color` when `--disabled-color` is unset (the variable HA actually defines).
- `tests/unit/series-color.test.ts` — preset with unset variable → `--eh-series-current` → `#119894`.
- `tests/unit/series-color.test.ts` — free-text picker values `#aabbcc`, `#abc`, `rgb()`, `rgba()` pass through unchanged (pins the non-preset path).
- `tests/unit/series-color.test.ts` — unparseable `primry` / `light-bluee` / `not-a-color` → `EH_SERIES_DEFAULT_FALLBACK` (the regression net, end-to-end at the resolver boundary).
- `tests/unit/series-color.test.ts` — `isPaintableColor`: token names/garbage → false; hex/rgb/rgba → true.
- `tests/unit/renderer-config.test.ts` — `resolveChartTheme` with `--secondary-text-color: primary` (broken theme) → `seriesReference` = `rgba(127, 127, 127, 0.4)`.
- Pre-existing gradient tests (hex input → 2-stop gradient) stay green unchanged — no renderer/gradient code was touched.

## Local Verification

- Commands run: `npm run typecheck` → clean; `npm run lint` → clean (0 errors/warnings); `npm test` → **934/934 passed (77 files)**, including all pre-existing series-color/renderer-config/gradient tests.
- Manual checks: none beyond unit/integration suites (rendering is pinned by the option-capture tests).

## Deviations from Assessment

None — implemented exactly per the final remediation. Two cosmetic notes: the internal resolver helper is named `resolveRaw` (assessment described it as a "single exit" without naming), and the broken-theme test reused the existing FR-018 test's mock pattern via a small `restoreGetComputedStyle` helper to avoid duplication.

## Follow-ups

- Run `/speckit.bug.test slug=color-picker-preset-crash` to record the verification report.
- Patch release (1.3.1) — the regression shipped in 1.3.0; close public issue #78 after release.
- Optional: watch for HA `THEME_COLORS` drift (new tokens) — unknown names are caught by the resolver net, but the token loop test will keep the set honest.
