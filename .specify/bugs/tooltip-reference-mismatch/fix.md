# Bug Fix: YoY "DO DZIŚ" panel vs tooltip reference mismatch

- **Slug**: tooltip-reference-mismatch
- **Fixed**: 2026-11-02
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

In a comparison window with an open "today" bucket, the panel's reference
cumulative is aligned to the last current point, but the tooltip at the today
slot showed the reference series' real point at that slot (which can be one day
further) and also rendered a forecast row that duplicated the current value.

The first attempt ("previous slot") only matched the panel for YoY, where the
current series has no point at the today slot. For MoM the current series
**does** include today's point, so the panel reference aligns to the today slot
and the "previous slot" value was wrong (e.g. panel 2,285 Wh vs tooltip 1,679 Wh).

The corrected fix passes the panel's actual reference cumulative
(`summary.reference_cumulative`) into the renderer as `panelReferenceCumulative`
and uses it for the tooltip reference row and the delta segment at the today
slot. This makes the tooltip and the delta segment always match the "TO THIS
DAY" panel, regardless of preset, without touching the data pipeline, the panel,
the forecast line, or the reference line.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/types.ts` | modified | Added optional `panelReferenceCumulative?: number` to `ChartRendererConfig` — the reference cumulative shown in the "TO THIS DAY" panel. |
| `src/card/cumulative-comparison-chart.ts` | modified | `_buildRendererConfig` now passes `panelReferenceCumulative: this._state.summary?.reference_cumulative` into the renderer config. |
| `src/card/echarts-renderer.ts` | modified | Delta segment compares the current cumulative against `panelReferenceCumulative` (falls back to the today-slot reference value); the reference dot (markPoint) stays on the line at `todayReferenceY`. |
| `src/card/echarts-renderer.ts` | modified | Tooltip formatter: at the today slot the reference row uses `panelReferenceCumulative`, falling back to the item's own value when the panel value is unavailable. |
| `src/card/echarts-renderer.ts` | modified | Tooltip formatter: the forecast row is omitted at the today slot (it duplicated the current cumulative there). |
| `tests/unit/echarts-renderer.test.ts` | added tests | 5 unit tests in the `A+: today-slot tooltip + delta segment` describe block, including a MoM regression test. |
| `tests/integration/tooltip-panel-consistency.test.ts` | added test | Integration test: the panel's reference cumulative equals the tooltip's reference value at the today slot for a YoY window with an open current bucket. |

## Diff Highlights

Delta segment — compare against the panel reference, keep the dot on the line:

```ts
const todayReferenceY = referenceValues[todaySlotIndex] ?? null;
// A+ (bug: tooltip-reference-mismatch): the delta segment compares the current
// cumulative against the reference value shown in the "TO THIS DAY" panel
// (`panelReferenceCumulative`), so the segment always matches the panel. Falls
// back to the today-slot reference value when the panel value is unavailable.
// The reference dot (markPoint) stays on the line at `todayReferenceY`.
const deltaReferenceY =
  rendererConfig.panelReferenceCumulative != null &&
  Number.isFinite(rendererConfig.panelReferenceCumulative)
    ? rendererConfig.panelReferenceCumulative
    : todayReferenceY;
```

Tooltip formatter — reference row uses the panel reference; forecast row omitted:

```ts
// A+ (bug: tooltip-reference-mismatch): at the open "today" slot the
// forecast row duplicates the current cumulative — omit it there.
if (seriesName === rendererConfig.forecastLabel && slotIndex === todaySlotIndex) {
  continue;
}

// A+ (bug: tooltip-reference-mismatch): at the open "today" slot the
// reference row uses the panel's reference cumulative
// (`panelReferenceCumulative`) so it always matches the "TO THIS DAY"
// panel; fall back to the item's own value when unavailable.
let y: unknown;
if (
  seriesName === labels.reference &&
  slotIndex === todaySlotIndex &&
  rendererConfig.panelReferenceCumulative != null &&
  Number.isFinite(rendererConfig.panelReferenceCumulative)
) {
  y = rendererConfig.panelReferenceCumulative;
}
if (y === undefined) {
  const candidate = item?.data ?? item?.value;
  if (Array.isArray(candidate)) {
    y = candidate.length > 1 ? candidate[1] : candidate[0];
  } else {
    y = candidate;
  }
}
```

## Tests Added or Updated

- `tests/unit/echarts-renderer.test.ts` › `A+: today-slot tooltip + delta segment` › "tooltip at today slot: reference row = panel reference cumulative, forecast row omitted" — pins the reference row to the panel reference and the omission of the forecast row at the today slot.
- `tests/unit/echarts-renderer.test.ts` › `A+: today-slot tooltip + delta segment` › "tooltip at a future slot: forecast row present, current row absent" — confirms the forecast row is still shown beyond the today slot (no over-suppression).
- `tests/unit/echarts-renderer.test.ts` › `A+: today-slot tooltip + delta segment` › "tooltip at today slot: falls back to the item value when the panel reference is unavailable" — pins the fallback when `panelReferenceCumulative` is not set.
- `tests/unit/echarts-renderer.test.ts` › `A+: today-slot tooltip + delta segment` › "delta segment at today slot uses the panel reference cumulative; reference dot stays on the line" — pins the delta segment endpoints to the panel reference and the reference dot to the line value.
- `tests/unit/echarts-renderer.test.ts` › `A+: today-slot tooltip + delta segment` › "MoM: current includes today's point → tooltip reference = panel reference (today-slot value)" — regression for the MoM case where the current series includes today's point, so the panel reference aligns to the today slot (not the previous slot).
- `tests/integration/tooltip-panel-consistency.test.ts` › "panel reference cumulative equals the tooltip reference value at the today slot" — end-to-end: renders the card in a ready state with an open current bucket and asserts the tooltip reference at the today slot equals `summary.reference_cumulative`.

## Local Verification

- Commands run:
  - `npm run typecheck` → clean (tsc --noEmit, no errors)
  - `npm test` → 583 passed (56 files), including the 5 new unit tests and the new integration test
  - `npm run lint` → clean (no ESLint errors)
- Manual checks: none beyond the automated gates.

## Deviations from Assessment

- The assessment's "Files likely to change" listed `src/card/echarts-renderer.ts` only. The corrected fix also touches `src/card/types.ts` (new `panelReferenceCumulative` field) and `src/card/cumulative-comparison-chart.ts` (passing the panel value into the renderer config), because the robust fix is to reuse the panel's already-computed reference cumulative rather than re-derive it in the renderer.
- The required tests were added to `tests/unit/echarts-renderer.test.ts` (5 unit tests) and a **new** integration file `tests/integration/tooltip-panel-consistency.test.ts` (1 test). A separate file was used so the `echarts/core` mock (needed to capture the `setOption` option) does not leak into the other integration tests in `card-render.test.ts`.
- **Follow-up correction (2026-11-02):** the initial "previous slot" approach only matched the panel for YoY. A live MoM report (panel 2,285 Wh vs tooltip 1,679 Wh) showed the current series includes today's point for MoM, so the panel reference aligns to the today slot. The fix was corrected to use the panel's actual reference cumulative, which is correct for both presets.

## Follow-ups

- Open question from the assessment (non-blocking): consider clarifying the "DO DZIŚ" panel caption to make the "up to the last full (closed) day" semantics explicit to the user.
- Consider a short note in the docs/wiki (Forecast-and-Data-Internals / Troubleshooting) explaining why the today-slot tooltip reference equals the panel value rather than the reference line's point at that slot.
