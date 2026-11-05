# Data model — `909-timewindow-preview` (implementation-facing)

## Preview Shift State (new, transient)

| Field | Type | Description |
|---|---|---|
| `previewShift` | `number` (signed int) | How many nominal window widths the display is shifted from the configured default. `0` = default (no preview); negative = earlier periods (e.g. `-1` = one width back). Never positive (forward is bounded at the default, FR-003). |

**Scope & lifetime**

- Lives on the `EnergyHorizonCard` element instance (a plain runtime field, **not** part of
  `_config`, **not** persisted).
- Discarded whenever the element is re-instantiated (dashboard switch, view switch, page reload)
  — FR-008. No store, no `sessionStorage`.
- Independent per card instance (FR-016).

**State transitions**

```
            step back (previewShift < 0 allowed, no lower bound)
   ┌──────────────────────────────────────────────────────────┐
   ▼                                                          │
[0: default] ──step back──▶ [-1] ──step back──▶ [-2] ──…──▶ [-k]
   ▲                        │            │                 │
   │                        │            └────────┬────────┘
   │                        │                     │
   └──reset control─────────┴────reset control────┘   (single activation → 0)
   └──────────step forward (−1) when previewShift < 0──────────┘
   (step forward at 0 is a no-op — FR-003)
```

- **step back**: `previewShift -= 1` (always allowed; FR-004).
- **step forward**: `previewShift += 1`, clamped at `0` (no-op at `0`; FR-003).
- **reset**: `previewShift = 0` (FR-009).
- **re-instantiation**: state is gone (element destroyed) → `0` by construction (FR-008).

## Shifted window set (derived, not stored)

| Concept | Description |
|---|---|
| **Shifted `now`** | `now` moved backward by `|previewShift|` nominal widths: `parseDurationToken(merged.duration)` applied `|previewShift|` times via `DateTime.minus(Duration)` (same algebra as `minusStepRepeated`). |
| **Shifted windows** | `resolveTimeWindows(merged, shiftedNow, timeZone, …)` — the existing pure resolver, unmodified. Yields the shifted window set (FR-005: duration/step/count/anchor/aggregation preserved). |
| **Shifted current period** | `shiftedWindows[0]` — the period queried and drawn as the light-gray preview series (FR-018). |
| **Shifted reference period** | `shiftedWindows[1]` — the period queried and drawn as the darker-gray preview series (FR-018). Absent when the card has no reference window. |

**Relationships**

- **One** `previewShift` value + **one** `MergedTimeWindowConfig` + **one** `now` → **one**
  shifted window set (deterministic).
- The shifted set is **derived at load time**; it is not persisted and not part of the
  configuration.

## `CardState` extension (runtime)

Existing `CardState` (`src/card/types.ts`) gains preview-aware fields (all optional, present
only when `status === "ready"`):

| Field | Type | Description |
|---|---|---|
| `previewShift` | `number` | The active shift (mirrors the element field into state so `render()` can branch). `0`/absent = default. |
| `previewSeries` | `ComparisonSeries`-like (pair) | The shifted current period's cumulative series (light gray) and the shifted reference period's cumulative series (darker gray), unit-scaled, for the chart's two preview series. Absent at the default. |

The default analytical fields (`summary`, `forecast`, `textSummary`, `period`,
`resolvedWindows`, `mergedTimeWindow`, `chartTime`) are **unchanged** and always reflect the
default windows (FR-021).

## `ChartRendererConfig` extension (runtime)

| Field | Type | Description |
|---|---|---|
| `previewMode` | `boolean` | `true` while `previewShift < 0`. Tells the renderer to draw the two shifted preview series (light gray + darker gray) and hide the live series (FR-018/FR-019). |
| `previewSeries` | series pair | The shifted series to draw: current in light gray, reference in a darker gray (FR-018). |
| `periodLabel` | `string` | In preview, reflects the **shifted** period (R5) so the chart axis/label match the displayed series. |

## Validation rules

1. `previewShift` is always an integer `≤ 0`; any attempt to make it positive is clamped to `0`
   (FR-003).
2. A preview change re-runs the load; a stale load (generation changed mid-flight) is discarded —
   the existing generation mechanism is reused (R6).
3. A shifted period with no data → the card's standard `no-data` indication (FR-013); while the
   preview is active the preview controls and indication remain available in that state, so the
   user can step through data-less periods (e.g., seasonal gaps) or reset. Partial data → existing
   partial-data behavior (FR-014).
4. The preview never writes to `_config` or any storage (FR-007).

## State transitions (card-level)

- **default → preview**: step back sets `previewShift < 0`; a load runs; on success the chart
  shows the two shifted series (light gray + darker gray) + preview indication + reset control.
- **preview → preview**: step back/forward changes `previewShift`; a load runs; the chart updates.
- **preview → default**: reset (or stepping forward to `0`) sets `previewShift = 0`; the chart
  returns to the normal two-series presentation; the indication and reset control disappear
  (FR-020).
- **any → re-instantiation**: element destroyed → `previewShift` gone → default (FR-008).
