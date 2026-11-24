# Bug Assessment: HA color-picker preset tokens crash chart paint (gradient fill)

- **Slug**: color-picker-preset-crash
- **Created**: 2026-11-24
- **Source**: pasted text (HA system log) + owner confirmation ("presety z pickera wyboru kolorów są błędnie interpretowane lub powodują błędy. Wpisane manualnie wartości hex działają dobrze.") + related public issue https://github.com/hello-sebastian/Energy-Horizon/issues/78 ("Charts no longer displaying after update to 1.3.0")
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> The Energy horizon card no longer displays the graphs and display chart is ghosted in the panel options, causing errors in my HA log:
>
> Uncaught error from Chrome 157.0.8103.50 on Android 14 SyntaxError: Failed to execute 'addColorStop' on 'CanvasGradient': The value provided ('light-blue') could not be parsed as a color. xh (energy-horizon-card.js:18223:7) … r.refreshImmediately (energy-horizon-card.js:10347:94)
>
> (second entry: The value provided ('primary') could not be parsed as a color — identical stack)
>
> Logger: frontend.js.modern.202610286 — First occurred 10:40:42 (38 occurrences), last logged 10:59:44. The issue resolves when rolled back to previous version.

Owner follow-up: presets from the color picker are misinterpreted / cause errors; manually typed hex values work fine.

## Symptom

After updating to 1.3.0, the whole chart stops rendering (blank panel) for any card whose `primary_color` holds an HA color-picker **preset token** (e.g. `primary`, `light-blue`) instead of a parseable CSS color; HA log spams `addColorStop` SyntaxErrors on every paint. Expected: presets render the series in the theme's palette color (that is what the picker displays). Rollback to the previous version restores rendering.

Note: "display chart is ghosted in the panel options" is **not** a second bug — `show_chart` is a UX-only dummy field, permanently ON and disabled (greyed) by design (`src/card/editor/field-registry.ts:366`, `src/card/editor/control-render.ts:265`).

## Reproduction

1. Open the card editor → Style → Current series → Color (`ha-color-picker`, `src/card/editor/control-render.ts:66`).
2. Pick a theme-color preset, e.g. "Primary" or "Light blue". The picker emits `value-changed` with the **token name** as the value (HA `THEME_COLORS` set, 25 names) → config gets `primary_color: primary` / `primary_color: light-blue`.
3. 1.3.0 defaults to gradient fill on (`fill_current_gradient: true`) → `verticalFillGradient()` builds a zrender gradient whose stops carry the raw token string.
4. ECharts paint calls `canvasGradient.addColorStop(offset, 'primary')` → `SyntaxError` inside the paint loop → chart renders nothing; error repeats on every refresh (38× in the reporter's log window).

Unknowns:

- [NEEDS CLARIFICATION: reporter's exact YAML — whether `fill_reference: true` is set. Both logged values are picker tokens; the simplest explanation is two preset picks within the 10:40–10:59 window, both hitting the current-series gradient (the only gradient fed by `primary_color`). The reference gradient reads `--secondary-text-color`, a theme variable, and would only be affected by an exotic theme.]

## Suspected Code Paths

- `src/card/series-color.ts:34` `resolveSeriesCurrentColor()` — maps only the card's own `ha-accent`/`ha-primary`/`ha-primary-accent` aliases; every other value passes through verbatim (the `--eh-color-resolve` computed-value trick returns the raw string for literals). HA `THEME_COLORS` names are unknown to it → literal `primary`/`light-blue` becomes the series color.
- `src/card/echarts-renderer.ts:319` `verticalFillGradient()` — new in commit `3ed25e0` (1.3.0); builds `colorStops` via `withAlpha()` (line 300), which passes non-hex/non-rgba strings through unchanged.
- `src/card/echarts-renderer.ts:1158` (current series) and `:1104` (reference series) — the two `areaStyle.color` gradient call sites; gradient is on by default (`fill_current_gradient`/`fill_reference_gradient` default `true`, `src/card/renderer-config.ts:153-154, 213-214`).
- `src/card/editor/field-registry.ts:476` — `primary_color` uses `control: { kind: "color" }` → `ha-color-picker` (`src/card/editor/control-render.ts:66`); `_readControlValue` stores `detail.value` (the token name) verbatim into the config (`src/card/energy-horizon-card-editor.ts:285-292`).
- HA frontend `src/components/ha-color-picker.ts` + `src/common/color/compute-color.ts` (external, verified): picker items are `THEME_COLORS` ids; `value-changed` carries the id, e.g. `primary`, `light-blue`. HA itself resolves such names at paint time via `computeCssColor()` → `var(--<name>-color)`.

## Root Cause Hypothesis

**High confidence.** The card's editor offers HA's `ha-color-picker`, whose presets are HA theme-color **token names** (`THEME_COLORS`: `primary`, `accent`, `light-blue`, … 25 names), not CSS colors. `resolveSeriesCurrentColor` doesn't know these tokens and passes them through as the series color. Before 1.3.0 that was latent: an invalid string assigned to canvas `fillStyle`/`strokeStyle` is a silent no-op, so the chart rendered (with a wrong/stale color, no crash). Commit `3ed25e0` (1.3.0) made the vertical **gradient fill the default**, routing the color through `addColorStop()`, which **throws** `SyntaxError` for unparseable values — inside ECharts' paint loop, so the entire chart fails to render. Dist `energy-horizon-card.js:18223` in the log is exactly that `addColorStop` call; the only gradient producers in the bundle are the two fill call sites above. Manual hex works because hex survives both `withAlpha()` and `addColorStop()`.

## Proposed Remediation (final)

**Root-cause fix — A (resolve presets to real colors; primary):** the editor offers HA's `ha-color-picker`, whose contract is HA theme-color token names; the card never honored that contract. `resolveSeriesCurrentColor()` (`src/card/series-color.ts:34`) will map the full HA set from `compute-color.ts` — the 25 `THEME_COLORS` (`primary`, `accent`, `light-blue`, …) plus the 3 YAML-only names (`primary-text`, `secondary-text`, `disabled`) — to their CSS variables: `--<name>-color` read from the host (for `disabled` also try `--disabled-text-color`, the variable HA actually defines). Empty variable → existing fallback chain (`--eh-series-current` → `#119894`). This is the root cause, fixed at its source: presets render in the theme's palette color (what the picker swatch shows), and manual values stay untouched — the picker's free-text entry keeps accepting `#aabbcc` hex (and `rgb()/rgba()`, `var(--…)`, `ha-*` aliases) via the unchanged pass-through.

**Boundary totality — B (input validation, NOT symptom suppression):** make the resolver total — it must never hand the canvas an unparseable color. Add exported `isPaintableColor(v)` to `series-color.ts`: browsers use `CSS.supports('color', v)`; non-browser environments (jsdom has no `window.CSS` — verified empirically) fall back to the shapes the card can legitimately produce (hex `#rgb/#rgba/#rrggbb/#rrggbbaa`, `rgb()/rgba()` regex). At the single exit of `resolveSeriesCurrentColor`, an unparseable final value (typo `primry`, unknown name, garbage) → `EH_SERIES_DEFAULT_FALLBACK` (`#119894`). Also sanitize `seriesReference` in `resolveChartTheme` (`src/card/renderer-config.ts:76-77`, and the renderer's internal fallback copy at `src/card/echarts-renderer.ts:525-526`) with the same helper (fallback `rgba(127, 127, 127, 0.4)`). The gradient is then guaranteed parseable input everywhere — **no renderer/gradient/`withAlpha` changes needed**.

Why B is not masking the cause: after A, every value the picker or docs produce (presets, hex, rgb/rgba, `var()`, `ha-*`) resolves to a real color and B never fires. B fires only for input that is invalid under every interpretation — there is no intended color to recover, so the only correct behavior is a visible series in the default color instead of a blank chart (validation at the config trust boundary).

**Rejected alternatives**:
- Editor-side token → `var(--<name>-color)` conversion at write time: does not fix existing YAMLs with token names, changes stored config semantics.
- Renderer-only gradient guard keeping the same invalid color as solid fill: crash goes away but the series paints in canvas' stale `fillStyle` (arbitrary color) — that is the symptomatic fix.
- `setConfig` validation error on invalid colors: would break the whole card for a typo — worse than graceful default.

**Files likely to change**:
- `src/card/series-color.ts` (token set + mapping, `isPaintableColor`, exit validation)
- `src/card/renderer-config.ts` (`seriesReference` sanitize, 1 line)
- `src/card/echarts-renderer.ts` (fallback-copy sanitize, 1 line)
- `tests/unit/series-color.test.ts`
- `tests/unit/renderer-config.test.ts`
- (docs) `README.md` — one line: color-picker presets follow the HA theme palette.

**Tests to add or update** (must catch invalid values):
- `series-color`: `primary` → host `--primary-color` value; `light-blue` → `--light-blue-color`; **loop over all 28 token names → `--<name>-color`** (catches set drift); token with empty variable → default teal; `disabled` → `--disabled-text-color` second candidate; hex `#aabbcc` and `#abc` pass through unchanged (pins the picker's free-text hex path); `rgb()/rgba()` pass through; `var(--accent-color)` resolution unchanged; garbage `primry` / `light-bluee` (unknown names) → `EH_SERIES_DEFAULT_FALLBACK` (invalid values caught at the resolver boundary); `isPaintableColor` environment-neutral cases: `'primary'`/`'not-a-color'` → false, `'#aabbcc'`/`'rgba(1, 2, 3, 0.4)'` → true.
- `renderer-config`: `resolveChartTheme` with `--secondary-text-color: primary` (broken-theme case) → `seriesReference` = `rgba(127, 127, 127, 0.4)` fallback.
- Existing gradient tests (`tests/unit/echarts-renderer.test.ts:1190-1250`) must stay green — hex input still yields the 2-stop gradient.

## Risks & Considerations

- Duplicating HA's token set (25+3) drifts silently if HA adds tokens — benign: unknown names are validated by B.
- jsdom has no `CSS.supports` (verified: `window.CSS` is undefined) → tests exercise the regex fallback, production browsers the `CSS.supports` path. Known environment divergence: valid CSS named colors (`lightblue`) pass in browsers but read as unpaintable in the test fallback — document in a comment; real users are always on the browser path (HA is a web app).
- Behavior change: presets now render in the theme's palette color (intended). Users who unknowingly lived with the stale-color fallback see a color change on upgrade.
- No API break, no migration: config schema unchanged; existing YAML with token names simply starts working.
- 1.3.0 shipped with the regression — a patch release is warranted.

## Open Questions

- [NEEDS CLARIFICATION: reporter's exact YAML — confirms whether the second logged color came from a second preset pick (most likely) or from `fill_reference: true` with a theme mapping `--secondary-text-color` to a token name.]
