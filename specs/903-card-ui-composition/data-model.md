# Data model: Interpretation & neutral band

**Source**: `specs/903-card-ui-composition/spec.md`  
**Date**: 2026-04-21

## CardConfig extensions

| Field | Type | Default | Validation / notes |
|-------|------|---------|-------------------|
| `interpretation` | `'consumption' \| 'production'` (parse **case-insensitive**) | `'consumption'` | Unknown string → `consumption` (**FR-903-P**) |
| `neutral_interpretation` | `number` (non-negative, percent **T**) | `2` | Invalid / negative → `2`; very large `T` (e.g. ≥100) → effectively always neutral (**FR-903-V**, Edge Case 14) |

Existing fields unchanged; shallow merge from editor preserves YAML-only keys.

## Semantic outcome (runtime)

Used by narrative row + chart delta styling (not by delta chip arithmetic).

| Value | Meaning |
|-------|---------|
| `positive` | Success semantics (green / trend-up orientation per mode) |
| `negative` | Warning semantics (red / trend-down per mode) |
| `neutral` | In-band: **`|p| ≤ T`** (“similar”) — distinct from insufficient data |
| `insufficient_data` | Placeholder chip / no reliable **`p`** — muted styling, dedicated copy (**FR-903-W**) |

## Interpretation mode

| Mode | Outside neutral band |
|------|----------------------|
| `consumption` | `current > ref` → **negative**; `current < ref` → **positive** |
| `production` | Inverted: `current > ref` → **positive**; `current < ref` → **negative** |

When **`|p| ≤ T`** (and `p` defined), outcome is **`neutral`** regardless of mode sign for “better/worse” labeling (still “similar” copy).

## Reference cumulative zero

Per Edge Case 15: **neutral** only when **current** is also zero (or both missing); else classify by sign of `(current − reference)` **without** percent band.

## Relationships

- **`p`**: Signed percent from same pipeline as delta chip; if missing → **`insufficient_data`**.
- **Forecast | Total**: No fields from this model; copy independent of `interpretation` (**FR-903-U**).
