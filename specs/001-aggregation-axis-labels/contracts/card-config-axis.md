# Contract: Card configuration — aggregation & X-axis (`001-aggregation-axis-labels`)

**Version**: 1.0.0 (draft) | **Date**: 2026-03-31

## Purpose

Public-facing YAML / Storage behavior for **Energy Horizon Card** options introduced or formalized by the aggregation & axis labeling feature.

## Optional fields

### `x_axis_format`

- **Type**: string  
- **Default**: omitted (adaptive axis labels per spec User Story 3)  
- **Semantics**: When present and valid, every category tick on the shared X-axis is labeled using this **Luxon-compatible** format string and the **Home Assistant** time zone. Adaptive boundary logic is **disabled**.  
- **Validation**: Must use only tokens from the **documented supported subset** published in user docs. Invalid values MUST produce the same class of configuration error as other invalid card YAML (no silent fallback to adaptive). Validation MUST occur at **`setConfig`** (fail-fast before timeline build; [research.md](../research.md) R-009).  
- **Compatibility**: Adding this field is non-breaking; omitting it preserves pre-feature behavior modulo auto-interval when `aggregation` is also omitted (new behavior).

### `tooltip_format`

- **Type**: string  
- **Default**: omitted (tooltip header follows **aggregation** matrix per **FR-011**)  
- **Semantics**: When present and valid, the **tooltip header** (first line of the chart tooltip) uses this **Luxon-compatible** format string with **Home Assistant** time zone, overriding the default matrix. Adaptive aggregation-based rules do **not** apply to the header while this is set.  
- **Validation**: Same token subset and **fail-fast** rules as **`x_axis_format`** (**`setConfig`**).  
- **Compatibility**: Non-breaking; omitting preserves default tooltip header behavior.

### `aggregation` (unchanged name, extended semantics)

- **Existing** field; merge order: **preset** → **`time_window`** (deep merge) → **`merged.aggregation ?? config.aggregation`** per `buildMergedTimeWindowConfig` in `src/card/time-windows/merge-config.ts`.  
- **New**: When the merged configuration has **no** `aggregation` after that chain, the card computes **automatic interval** from merged `duration` before resolving windows.  
- **Implementation (v1)**: A **single** effective `aggregation` applies to **all** resolved windows; per-window distinct values require a future YAML schema extension (see [research.md](../research.md) R-008).

## Constants (implementation)

| Constant | Value | User-visible |
|----------|-------|--------------|
| Max points per series | `5000` | Yes — error message when exceeded |

## Locale and time zone (not YAML)

- **Time zone**: Taken from Home Assistant configuration, not from this contract.  
- **Label locale cascade**: Card `language` → `hass.locale.language` → `en`.

## Breaking changes

None for correctly configured existing cards; new rejection paths for invalid `x_axis_format` or excessive point counts.
