# Mental Model: Comparisons and Timelines

**Explanation** — this page is the “why it works like that” backbone for advanced users. Read it once; it will make the rest of the wiki predictable.

If you only need option names and defaults, use [Configuration and Customization](Configuration-and-Customization).

---

## What the card actually is (in one sentence)

Energy Horizon builds **one or more time windows**, fetches **long-term statistics** for each window, converts them into **cumulative series**, and plots them on a **shared X-axis** so you can compare “elapsed vs elapsed”.

---

## Core concepts (the model you should keep in your head)

### 1) A “window” is a real calendar range

Each window has a real calendar **start** and **end** in your Home Assistant time zone, derived from:

- `comparison_preset` (a template) and optionally
- `time_window` (your overrides, deep-merged)

Window 0 is the **current** window. Window 1 is the **reference** window. Windows ≥ 2 are **context** windows (visual background only).

### 2) The chart uses a shared X-axis (normalized by position in the window)

The card renders all series against a **shared timeline** whose length is the **longest resolved window**.

That means:

- If one month is shorter (February) and the other is longer (March), the shorter series simply **ends earlier** (it does *not* stretch).
- “Same X position” means “same **elapsed position** in the respective window”, not “the same absolute timestamp across years”.

This is the key reason the card is useful for comparisons: it aligns by **window progress**.

### 3) Tooltip and “real dates”

There are two different “time” ideas in the UI:

- The **axis** is a shared index timeline (“slot 0…N”) representing the *comparison axis*.
- Each series still comes from real calendar timestamps in its own window.

**Practical implication:** When you hover, you’re comparing values that correspond to the **same position in the window**, even if their absolute calendar dates differ (e.g., 2026 vs 2025).

> If you force `x_axis_format` / `tooltip_format`, you are formatting the shared timeline ticks/headers. That’s intentional: it keeps the mental model “same slot = same elapsed position”.

---

## Presets: legacy vs generic semantics (why YoY/MoY feel different than MoM)

The card supports three built-in presets:

- `year_over_year`
- `month_over_year`
- `month_over_month`

Internally, there are two resolution paths:

### Legacy path (YoY / MoY defaults)

For `year_over_year` and `month_over_year` **without customizations that break the legacy assumptions**, the engine keeps two legacy flags:

- current window is “from period start **to now**”
- reference window is a **full calendar period** (shifted by `period_offset`)

This gives “so far this year/month vs the full reference year/month”.

### Generic path (MoM + most custom time_window)

`month_over_month` is always generic: it resolves **full calendar months** (current month window and the previous full month window).

Also: if you meaningfully customize a preset via `time_window` (change `anchor`, `step`, `count`, or set a non-empty `offset` that diverges), legacy flags are stripped and the card uses the generic resolver.

---

## Multiple windows (context series) — what changes, what does not

If you set `time_window.count` ≥ 3:

- **Window 0** and **Window 1** keep full semantics (summary, comparison, forecast gating, tooltip rows).
- **Windows ≥ 2** become **context layers**:
  - drawn in the background,
  - excluded from tooltip rows,
  - excluded from forecast math and “current vs reference” summary.

This is intentional: the UI remains focused on the primary comparison pair, with extra history as visual context only.

---

## Forecast denominator (a subtle but important detail)

When forecast is computed, the progress fraction and thresholds are based on the bucket count of **window 0** (the current window), not on:

- the longest X-axis timeline, and not on
- any other window.

This matters if you plot windows of different lengths: the axis can be longer than the forecast period, but the forecast still refers to the current comparison period.

Details and gating rules: [Forecast and Data Internals](Forecast-and-Data-Internals).

---

## “Why does it not work?” — failure modes that follow from the model

### Empty chart

Most often: your `entity` does not have long-term statistics (LTS). Verify in **Developer Tools → Statistics**.

### The card errors after I add `time_window`

The engine is fail-fast by design: invalid window configs are rejected (no silent fallback to the preset).

See [Time Window Reference](Time-Window-Reference) for validation rules and limits.

### My series stops early (e.g., February vs March)

That’s expected: shared X-axis is the **longest** window; shorter windows end earlier.

### My forecast is missing even though `show_forecast: true`

Forecast is gated by data coverage (≥ 3 completed buckets and ≥ 5% of the period) and requires a reference series.

See [Troubleshooting and FAQ](Troubleshooting-and-FAQ) → “missing forecast”.

