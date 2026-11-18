# Contract — Preview controls & indication (view-mode UI)

The preview is a **view-mode-only** capability of the `EnergyHorizonCard` element. It exposes no
new configuration keys and no new HA APIs. This contract defines the user-facing behavior the
implementation must honor (the "public interface" of the feature).

## Controls

All three controls are native `<button>` elements, keyboard-operable (Enter/Space), with
focus-visible styling and localized `aria-label`s (Constitution Principle IV).

| Control | Visible when | Action on activation | `aria-label` (key) |
|---|---|---|---|
| **Backward** (step earlier) | Always (view mode) | `previewShift -= 1` (no lower bound) | `preview.step_back` |
| **Forward** (step later) | Always (view mode) | `previewShift += 1`, clamped at `0` (no-op at default) | `preview.step_forward` |
| **Reset** (return to default) | Only while `previewShift < 0` | `previewShift = 0` | `preview.reset` |

**Placement**: top-right corner of the chart (interim form; a refined visual design is expected
to follow and is out of scope — see spec Assumptions).

**Visibility rules**

- Backward and forward are always present in view mode.
- Reset is present in the DOM **only** while the preview is active (`previewShift < 0`); it is
  removed as soon as the card is at the default — by stepping forward, by reset, or by
  re-instantiation (FR-009/FR-010, "Reset control visibility" edge case).
- The controls and the preview indication remain present and functional while the card is in the
  no-data state during a preview (FR-013, Clarifications) — the user can step through data-less
  periods (e.g., seasonal gaps) or reset.

## Preview indication

| Aspect | Behavior |
|---|---|
| **Visible when** | `previewShift < 0` only (FR-011); absent at the default (FR-012). |
| **Content** | Conveys that the chart shows a shifted (preview) period **and which period** — consistent with the period label the card already displays (US2 scenario 3). Reuses the existing period-label formatting. |
| **Form** | A visible text element in the DOM (announced to screen readers), not a visual-only overlay. |

## Chart series display in preview

| Aspect | Behavior |
|---|---|
| **Series drawn** | The shifted current period (light gray) and, when the card has a reference window, the shifted reference period (darker gray) — exactly two series on a card with a reference window, a single light-gray series (the shifted current) when it has none — using the card's existing color tokens (FR-018). The shifted current series does not use the current series' color. |
| **Live series** | Not drawn (FR-019). |
| **X-axis / period label** | Reflect the **shifted** period (so the axis matches the displayed series; see research R5). Label formatting/style unchanged. |
| **Return to default** | The current series is shown again and the chart returns to its normal two-series presentation (FR-020). |

## Non-chart panels in preview (FR-021)

While the preview is active, all other panels and information — the summary, the
delta/interpretation readout, the narrative, and the legend of non-chart elements — remain
**visible and unchanged**, continuing to reflect the default configuration and the current data
series. The preview shift does **not** recompute analytical data in this iteration.

## Invariants

1. The preview never modifies or persists the card's configuration (FR-007).
2. The preview is discarded on any re-instantiation (FR-008).
3. Each card instance keeps its own independent preview state (FR-016).
4. The forward direction is bounded at the configured default (FR-003).
5. A shifted period with no data shows the standard no-data indication (FR-013); while the preview
   is active the controls and indication remain available in that state, so the user can step
   through data-less periods (e.g., seasonal gaps) or reset. Partial data uses the existing
   partial-data behavior (FR-014).
