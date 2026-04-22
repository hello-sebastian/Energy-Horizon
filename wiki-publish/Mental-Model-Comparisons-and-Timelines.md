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

The card renders all series against a **shared timeline** whose length is the **largest nominal bucket count** among all windows at the chart’s aggregation grain (the same grain as window 0). That is **not** the same as picking the longest span by wall‑clock alone—two months with different numbers of days can differ in slot count even when wall‑clock ranges look similar.

**Slot timestamps on that axis:** the first part of the timeline is built from **window 0’s** calendar (its nominal `start`/`end`). If another window needs more slots, the axis **extends** with extra buckets by stepping forward at the same aggregation grain (ordinal continuation)—it does **not** switch to the reference window’s calendar for the whole axis.

That means:

- If one month is shorter (February) and the other is longer (March), the shorter series simply **ends earlier** (it does *not* stretch).
- “Same X position” means “same **elapsed position** in the respective window”, not “the same absolute timestamp across years”.

This is the key reason the card is useful for comparisons: it aligns by **window progress**.

### 3) Tooltip and “real dates”

There are two different “time” ideas in the UI:

- The **axis** is a shared index timeline (“slot 0…N”) representing the *comparison axis*.
- Each series still comes from real calendar timestamps in its own window.

**Tooltip header vs ticks:** The hover title uses **`fullTimeline[i]`** for the same column index *i* as the X-axis (including **tail** slots when the axis is longer than window 0 — e.g. April vs March at daily grain adds one ordinal day after April 30). It does **not** follow an arbitrary series’ internal `dataIndex`; sparse lines such as the **forecast** segment must not shift the date.

**Calendar wording:** Default axis and tooltip date parts are formatted in the **Home Assistant instance time zone** (same as window boundaries and LTS), not the browser’s local zone.

**Practical implication:** When you hover, you’re comparing values that correspond to the **same position in the window**, even if their absolute calendar dates differ (e.g., 2026 vs 2025).

**Chart “now” pointer (vertical guide, dots, delta segment, highlighted X tick):** The card maps **today** to the bucket that contains the current instant **inside window 0** (Home Assistant time zone, same aggregation as the chart), then uses that bucket’s index on the **shared** axis. It does **not** use “which slot in `fullTimeline` contains `Date.now()` on the raw tick timestamps” when the reference window’s calendar would dominate the tail—otherwise the marker could jump to the last day of the reference month/year. With **week** or **month** LTS aggregation there is no separate “today” day column on the axis—the pointer sits on the bucket that **covers today** in window 0. With **hour** aggregation over a single day, the pointer follows the **current hour**, not midnight.

On the **default adaptive** X-axis (current series visible), the **caption for that “now” tick** is always drawn on a **second line** below the row used by other tick labels: the emphasized line shows the **same kind of date/time text** as other adaptive ticks (e.g. month, day, time), not a standalone word like “Now”. A slim **placeholder** first line keeps vertical alignment with neighboring ticks.

**Default axis vs summary captions:** for two windows, adaptive labels may **omit the year** when the periods start in different years (YoY / MoY), or show **day-of-month only** when the year matches but the months differ (MoM). The comparison panel captions still carry month/year context. If you force `x_axis_format` / `tooltip_format`, your Luxon pattern applies to the tick/tooltip timestamps on that shared axis and overrides the adaptive matrix.

### Custom billing cycle start date (`time_window.offset`)

Some users need a **rolling 12‑month** (or other) period that **does not** start on 1 January or the first of a month. The card applies `offset` as an **ISO 8601 duration** after the anchor (`start_of_year`, etc.): components are applied in **Luxon’s** canonical order (**years → months → days → time**). If the day does not exist in the target month (e.g. 31 Jan + 1M), the result **clamps** to the last valid day of that month (deterministic).

**Example — “year” from 5 May:** with `anchor: start_of_year`, use **`offset: P4M4D`**: 1 Jan + 4M → 1 May, + 4D → **5 May** in your Home Assistant time zone. That is **not** the same as adding a single fixed number of **days** to 1 Jan, because months have different lengths and years differ in length.

**Why compound matters:** e.g. `+124d` from 1 Jan is a single wall-clock span; **`P4M4D`** is “four months *then* four *calendar* days”, which matches how people describe fiscal anchors.

**Negative example:** `offset: -P2M` on `start_of_year` can move the start to **1 November of the *previous* calendar year** (see How-To: Time Windows).

**Invalid values:** any offset shorter than one hour, or with fractional month/year, is **rejected** with a **configuration error** (you should not see a blank chart with no explanation). Legacy `+1d` / `+3M` forms are still **accepted** for now as aliases of `P1D` / `P3M`; prefer `P` strings for new configs.

For copy-paste YAML, see [How-To: Time Windows](How-To-Time-Windows) and [Time Window Reference](Time-Window-Reference).

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

**Chart axis (unified rule):** regardless of preset, the shared X-axis length is still the **maximum nominal slot count** across windows at the chart aggregation (see §2). YoY/MoY only change **how** `ResolvedWindow` bounds are computed, not a second axis formula.

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

