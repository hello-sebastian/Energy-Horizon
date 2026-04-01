# Time Window Reference

**Reference** — advanced `time_window` YAML and how it merges with `comparison_preset`.

If you want ready-to-use recipes, use [How-To: Time Windows](How-To-Time-Windows). If you want the big picture, start with [Mental Model: Comparisons and Timelines](Mental-Model-Comparisons-and-Timelines).

---

## What `time_window` is

`time_window` is an optional YAML object that **deep-merges** into the selected `comparison_preset` template.

- You only override the fields you specify.
- Unspecified fields stay from the preset.
- After merge, the result is validated; invalid configs **fail fast** (no silent fallback).

---

## Schema (YAML)

```yaml
time_window:
  anchor: start_of_year | start_of_month | start_of_week | start_of_day | start_of_hour | now
  offset: "+3M" | "-1w" | "0d"   # optional; duration token string
  duration: "1y" | "1M" | "1w" | "1d" | "1h" | "90m" | "30s"
  step: "1y" | "1M" | "1w" | "1d" | "1h"
  count: 1..24
  aggregation: hour | day | week | month
```

The card accepts duration tokens with units mapped to Luxon:

- `y` (year), `M` (month), `w` (week), `d` (day), `h` (hour), `m` (minute), `s` (second)

---

## Field-by-field semantics (mental model)

### `anchor`

Defines the base reference point for window 0 before applying `offset`.

Allowed values are restricted by LTS (long-term statistics) hard limits:

- `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`

**Note:** `start_of_week` follows ISO/Luxon semantics (week starts on Monday).

### `offset` (optional)

Shifts the anchor before computing the window start.

Use it for fiscal cycles (e.g., “year starts in October”) or “lookahead/back” from the anchor.

### `duration`

Length of each window from its computed start.

**Hard limit:** must be **at least 1 hour** (LTS restriction). Sub-hour windows are rejected.

### `step`

Spacing between consecutive windows going backward from window 0.

- Window 0 uses `0 × step` (no shift).
- Window 1 uses `1 × step` backward.
- Window 2 uses `2 × step` backward, etc.

Must parse to a **positive** duration.

### `count`

Number of windows to generate.

- `1` = only current series (single-window mode)
- `2` = current + reference (default comparison)
- `≥ 3` = adds context series (visual background only)

**Hard limit:** maximum is **24**. Values above 24 are rejected (config error).

### `aggregation` (window-level)

LTS bucket size used when fetching statistics.

Allowed: `hour`, `day`, `week`, `month`.

In the current card version, there is **one effective aggregation** used for the whole card (you cannot mix steps per window via YAML without a schema change).

---

## Merge rules (preset + YAML)

Effective window template is derived in this order:

1. Internal template for `comparison_preset`
2. Deep-merge with `time_window` (if present)
3. Resolve effective aggregation:
   - if aggregation is still unset after merges, auto-pick from duration (targets ~20–100 buckets when possible)

**Legacy vs generic:** If you meaningfully override certain fields (e.g., change `anchor`, `step`, `count`, or set a diverging non-empty `offset`), the card strips legacy flags and resolves windows using the generic engine.

---

## Validation (fail-fast)

These rules are enforced when the card loads. Violations result in a Lovelace configuration error and no chart.

### Allowed anchors

Only:

- `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`

### Duration must be ≥ 1 hour

Examples:

- ❌ `duration: 30m`
- ✅ `duration: 1h`
- ✅ `duration: 90m`

### Aggregation must be one of hour/day/week/month (or omitted)

- ❌ `aggregation: 5minute`
- ✅ `aggregation: hour`
- ✅ omit `aggregation` for auto-pick

### Count must be an integer in [1, 24]

- ❌ `count: 0`
- ❌ `count: 25`
- ✅ `count: 1`

### `step` and `duration` must be valid, non-empty, and > 0

Empty strings or non-parsable tokens are rejected.

---

## Single-window mode (`count: 1`)

With `count: 1`, the UI switches to “single-window mode”:

- only the current series is plotted
- reference-only UI (trend vs reference, comparison line) is hidden
- forecast is disabled (it requires a reference series)

---

## Examples (reference-focused)

### YoY with a third context year (3 windows)

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
time_window:
  anchor: start_of_year
  duration: 1y
  step: 1y
  count: 3
aggregation: month
```

### Fiscal year starting in October (YoY-like)

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_total
comparison_preset: year_over_year
time_window:
  anchor: start_of_year
  offset: "+9M"
  duration: 1y
  step: 1y
  count: 2
aggregation: month
```

---

## See also

- [How-To: Time Windows](How-To-Time-Windows)
- [Configuration and Customization](Configuration-and-Customization)
- Spec (repo): `specs/001-time-windows-engine/`
