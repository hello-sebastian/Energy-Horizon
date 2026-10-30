# Bug Assessment: Y-axis label space not responsive — long labels clipped on the left

- **Slug**: y-axis-label-clipping
- **Created**: 2026-10-30
- **Source**: pasted text (+ screenshot: Zrzut ekranu 2026-10-30 o 20.51.29.png)
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

> Przstrzeń na opis osi pionowej wykresu nie jest responsywny i dłuższe wartości etykiet są ucinane z lewej strony, co sprawia, że nie wiadomo jaką wartość przedstawiają. Jako użytkownik chciałbym aby przestrzeń dostosowywała się do długości wartości, abym mógł się z nią zapoznać. Dodatkowo chciałbym aby przy wartościach dłuższych niż 3 znaki np. 10 000 Wh jednostka była przenoszona do wiersza poniżej (wyrównanie do prawej strony), aby ograniczyć ściskanie wykresu, aby nie tracił na czytelności.

Screenshot: cumulative year-over-year card, Y-axis top tick rendered as `0,000 kWh` (leading `1` clipped), mid tick `1,000`, bottom `0`.

## Symptom

The Y-axis tick label area is a fixed 56 px (`GRID_LEFT_PX`) regardless of the actual width of the formatted labels. When a label is wider than the reserved space (e.g. `10 000 Wh` with `force_prefix: none` / Wh units, or `1,927 kWh` at larger fonts), ECharts right-aligns the text against the axis and the overflow is clipped on the left — the user cannot read the value. Expected: the reserved space adapts to the widest label, and for long values the unit moves to a second, right-aligned line so the plot area is not squeezed.

## Reproduction

1. Use an energy entity whose unit renders long numbers on the Y axis — e.g. `Wh` with `force_prefix: none` (or `auto` when values stay below 1 k), locale `pl` (narrow no-break space thousands separator).
2. Render the card with cumulative values reaching ≥ 10 000 (e.g. year-to-date boiler meter).
3. Observe the top Y tick: the label is wider than the 56 px left margin and its leading characters are cut off (screenshot shows `0,000 kWh` instead of `10 000 kWh`).

[NEEDS CLARIFICATION: exact entity/unit/`force_prefix` combination from the reporter's install — not required for the fix, the clipping is deterministic for any label wider than 56 px.]

## Suspected Code Paths

- `src/card/echarts-renderer.ts:71` — `export const GRID_LEFT_PX = 56;` fixed left margin; comment already says "Increase if labels are clipped".
- `src/card/echarts-renderer.ts:973-978` — `grid: { containLabel: false, left: GRID_LEFT_PX, ... }` — with `containLabel: false` the 56 px is the *entire* label budget; anything wider is drawn outside the canvas edge and clipped.
- `src/card/echarts-renderer.ts:1110-1124` — `yAxis.axisLabel.formatter`: only the max tick gets the unit, inline on one line: `` `${formatted} ${yAxisUnit}` ``. No wrapping, no rich styles.
- `src/utils/unit-scaler.ts` (`scaleSeriesValues`, `formatScaledValue`) — produces the scaled value + unit; with `force_prefix: none` or small magnitudes the number part can be long (e.g. `10 000`), which is what makes the label wide.
- `src/card/axis/x-axis-rich-styles.ts` — precedent: X-axis already uses `axisLabel.rich` multi-line labels with explicit line metrics; the same mechanism is available for the Y axis.
- `tests/unit/echarts-renderer.test.ts:1785` — `expect(grid.left).toBe(GRID_LEFT_PX)` will need updating once the margin becomes dynamic.

## Root Cause Hypothesis

**Confidence: high.** The Y-axis label budget is a hardcoded constant (`GRID_LEFT_PX = 56`, sized for ~"1,927 kWh" at the default font) combined with `containLabel: false`, so ECharts never measures the actual label width. Any formatted label wider than 56 px (long numbers with thousands separators, long units, `force_prefix: none`) overflows past the left canvas edge and is clipped. The unit being glued to the number on a single line (`formatter` at `echarts-renderer.ts:1119-1121`) maximizes the width of exactly the one label that carries the unit.

## Proposed Remediation

**Preferred**: two coordinated changes in `src/card/echarts-renderer.ts` (no new config surface):

1. **Dynamic left margin.** In `buildOption`, compute the widest Y tick label string (the formatter already knows which ticks render: 0, mid, max — the max tick with unit is the widest candidate), measure it with a shared offscreen canvas `CanvasRenderingContext2D.measureText` using the same font ECharts uses for axis labels (default 12 px sans-serif, or the theme font if one is resolved), and set `grid.left = ceil(measuredWidth) + AXIS_TICK_LABEL_GAP_PX` (clamped to a sensible minimum, e.g. the current 56 px, so short labels don't shrink the plot). Keep `containLabel: false` — the margin stays an explicit pixel value, just computed instead of constant. This is a deliberate, documented deviation from FR-902-Z in `specs/902-chart-rendering-interaction/spec.md` ("`GRID_LEFT_PX` is an explicit px constant") — the spec line should be updated to "explicit px value, computed from the widest label".
2. **Unit on a second line for long values.** In the Y `axisLabel.formatter`, when the number part of the max tick is longer than 3 characters (e.g. `10 000`), return a rich-text label: number on line 1, unit on line 2, both right-aligned — using `axisLabel.rich` (e.g. `{num|10 000}\n{unit|Wh}` with `align: 'right'` on the rich styles), mirroring the existing X-axis rich-label pattern in `src/card/axis/x-axis-rich-styles.ts`. Short values (≤ 3 chars, e.g. `1.5 kWh`) keep the current single-line format. This caps the width of the unit-bearing label at the width of the number alone.

**Alternatives**:
- `containLabel: true` on the grid — ECharts auto-sizes the label area. Simpler, but it changes the meaning of *all* grid insets (top/bottom budgets in `x-axis-rich-styles.ts` were derived under `containLabel: false`), risks layout regressions on the X-axis two-line budget, and is explicitly forbidden by FR-902-Z. Rejected.
- Bump `GRID_LEFT_PX` to a larger constant (e.g. 72–80 px) — one-line fix, but still wrong for `force_prefix: none` with 7-digit values and permanently shrinks the plot for everyone. Rejected as the primary fix; could serve as a stopgap.

**Files likely to change**:
- `src/card/echarts-renderer.ts` (margin computation + Y `axisLabel` rich formatter; `GRID_LEFT_PX` becomes a minimum/fallback)
- `src/card/axis/x-axis-rich-styles.ts` or a new `src/card/axis/y-axis-label-styles.ts` (rich style metrics for the two-line Y label, so the line-height budget is documented in one place)
- `tests/unit/echarts-renderer.test.ts` (update `grid.left` assertion; add cases)
- `specs/902-chart-rendering-interaction/spec.md` (FR-902-Z wording: constant → computed value)

**Tests to add or update**:
- Y formatter: number part ≤ 3 chars → single-line `"1.5 kWh"`; number part > 3 chars (e.g. `10 000 Wh`, `1,927 kWh`) → rich label with unit on a second line, right-aligned.
- `grid.left` equals the measured width of the widest label + gap for a long-label config, and equals the minimum (56 px) for short labels.
- Regression: existing `grid.left === GRID_LEFT_PX` assertion updated to the new dynamic expectation.

## Risks & Considerations

- **Spec deviation**: FR-902-Z mandates `containLabel: false` + explicit px constant — the fix keeps `containLabel: false` but makes the px value computed; spec text must be updated in the same change to avoid drift.
- **Canvas measurement in tests**: `measureText` needs a canvas context; the vitest/jsdom setup (`tests/helpers/setup-dom.ts`) may need a stub for `CanvasRenderingContext2D.measureText` (deterministic width per string) so tests stay hermetic.
- **Layout shift**: the plot area width will change per data/locale — acceptable (that is the requested behavior), but the `finished`-handler legend sync and `min-height` logic must not assume a fixed left margin.
- **Rich-label vertical centering**: a two-line Y label is centered on the tick by default; verify the top tick's second line does not collide with the legend/grid top (it hangs *left* of the plot, so collision risk is low, but confirm visually).
- **Threshold semantics**: "longer than 3 characters" is interpreted as the *number part* (digits + separators) of the max tick; the unit itself is never counted. If the reporter meant total label length, the behavior for e.g. `1.5 kWh` (7 chars total) would differ — see Open Questions.

## Open Questions

- [NEEDS CLARIFICATION: does "dłuższe niż 3 znaki" refer to the number part only (my assumption) or the whole label including the unit?]
- [NEEDS CLARIFICATION: should the two-line wrapping also apply to the mid/zero ticks (they carry no unit today, so no change is expected) — assumed no.]
