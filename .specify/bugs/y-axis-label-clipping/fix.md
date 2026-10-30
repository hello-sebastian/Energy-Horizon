# Bug Fix: Y-axis label space not responsive — long labels clipped on the left

- **Slug**: y-axis-label-clipping
- **Fixed**: 2026-10-30
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The Y-axis left margin is now computed per render from the actual widest tick label (canvas `measureText`, floored at the old 56 px), and when the number part of the top tick is longer than 3 characters the unit moves to a second, right-aligned line — so long labels like `10 000 Wh` are never clipped and the plot area is not squeezed.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/echarts-renderer.ts` | modified | `GRID_LEFT_PX` is now a floor; added `measureYAxisLabelWidth()`, `formatYAxisTickLabel()`, `Y_AXIS_UNIT_WRAP_NUMBER_CHARS`; `buildOption` computes `gridLeftPx` from the widest of the 0/mid/max tick lines; `yAxis.axisLabel` uses the shared formatter + `rich` (`yNum`/`yUnit`, both `align: 'right'`) |
| `tests/unit/echarts-renderer.test.ts` | modified + added tests | new describe block "Y-axis label wrapping + dynamic grid.left" (4 tests); updated `grid.left` assertion in the now-label test to `>= GRID_LEFT_PX` |
| `specs/902-chart-rendering-interaction/spec.md` | modified | FR-902-Z: `grid.left` is a computed px value (floor `GRID_LEFT_PX`); new FR-902-AB (Y-axis unit wrapping); grid-constants section + Key Entities updated |
| `changelog.md` | modified | Unreleased → Changed entry |
| `config/eslint.config.js` | modified | added `CanvasRenderingContext2D` to browser globals (required by the new measurement code) |

## Diff Highlights (optional)

```ts
// grid.left: measured, floored at the old constant
const gridLeftPx = Math.max(
  GRID_LEFT_PX,
  Math.ceil(widestYLabelPx) + AXIS_TICK_LABEL_GAP_PX
);
// grid: { containLabel: false, left: gridLeftPx, ... }
```

```ts
// unit wrapping: number part > 3 chars → two right-aligned lines
if (formatted.length > Y_AXIS_UNIT_WRAP_NUMBER_CHARS) {
  return {
    label: `{yNum|${escapeEchartsRichAxisPiece(formatted)}}\n{yUnit|${escapeEchartsRichAxisPiece(unit)}}`,
    lines: [formatted, unit]
  };
}
```

```ts
// measurement with deterministic fallback (jsdom has no canvas 2d context)
export function measureYAxisLabelWidth(text: string): number {
  if (text === '') return 0;
  const ctx = getYAxisMeasureContext();
  if (ctx) return ctx.measureText(text).width;
  return text.length * 0.6 * Y_AXIS_LABEL_FONT_SIZE_PX;
}
```

## Tests Added or Updated

- `tests/unit/echarts-renderer.test.ts` → "keeps the unit inline when the number part is short (<= 3 chars)" — pins `1.5 kWh` single-line format.
- `tests/unit/echarts-renderer.test.ts` → "moves the unit to a second right-aligned line when the number part is long (> 3 chars)" — pins the rich two-line label for `10 000 Wh` (pl locale, U+00A0 separator).
- `tests/unit/echarts-renderer.test.ts` → "returns empty label for non-rendered ticks" — pins the 0/mid/max-only rendering contract.
- `tests/unit/echarts-renderer.test.ts` → "grid.left grows to fit a long Y label and stays floored at GRID_LEFT_PX for short ones" — end-to-end via `update()`: `1 000 000 Wh` grows the margin beyond 56 px; `1,5 Wh` keeps the floor.
- Updated: now-label test assertion `grid.left === GRID_LEFT_PX` → `grid.left >= GRID_LEFT_PX` (margin is now dynamic).

## Local Verification

- Commands run: `npm run test` → 53 files, 538 tests, all passed.
- Commands run: `npm run lint` → clean (after adding `CanvasRenderingContext2D` to ESLint browser globals).
- Type check: ad-hoc `tsc --noEmit` on the changed file shows no errors in `echarts-renderer.ts` (remaining errors are pre-existing luxon declaration / `unit-scaler.ts:235` issues, unrelated to this change).
- Manual checks: none (no browser session); behavior is pinned by the unit tests above.

## Deviations from Assessment

- The assessment suggested a possible new `src/card/axis/y-axis-label-styles.ts` for the rich-style metrics; the change stayed inside `src/card/echarts-renderer.ts` (the rich styles carry no line-height budget — Y labels hang left of the plot, so no `grid` constant depends on them). No scope expansion beyond the listed files, except `config/eslint.config.js` (one global) and `changelog.md` (project convention).
- The measurement fallback (0.6 em/char) is used in jsdom tests; in the browser the real `measureText` path is active. The dynamic-margin test asserts against `measureYAxisLabelWidth()` itself, so it is deterministic in both environments.

## Follow-ups

- Visual check in a real HA instance with `force_prefix: none` + Wh units (the reporter's scenario) — confirm the top tick shows `10 000` / `Wh` on two lines and the plot area is not squeezed.
- Consider whether the mid tick should ever carry the unit (currently only the max tick does — unchanged by this fix).
- `/speckit-bug-test slug=y-axis-label-clipping` to record the verification report.
