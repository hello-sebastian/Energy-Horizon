# How-To: Aggregation and Performance

**How-to** — fix “too many points”, choose a reasonable `aggregation`, and keep charts responsive.

For the underlying explanation of how auto-aggregation works, see [Aggregation and Axis Labels](Aggregation-and-Axis-Labels).

---

## How-to: fix `status.point_cap_exceeded` (too many timeline slots)

**Goal:** The card renders instead of showing “Too many timeline slots …”.

### Why it happens

The card builds a shared timeline; if its slot count exceeds the hard cap (**5000**), it stops and shows a localized error:

- `status.point_cap_exceeded` (with `max`)

### Fix options (pick one)

1) **Use a coarser aggregation**

```yaml
aggregation: month
```

or:

```yaml
aggregation: week
```

2) **Shorten the window**

Reduce `time_window.duration` or reduce `time_window.count`.

3) **Remove extra context windows**

If you set `count` ≥ 3, try dropping back to `count: 2` first.

**Expected outcome:** The chart loads; the slot count falls below the cap.

---

## How-to: let the card auto-pick aggregation (recommended starting point)

**Goal:** You don’t want to think about bucket sizes yet.

Simply omit `aggregation` (and don’t set `time_window.aggregation`).

The card will choose `hour/day/week/month` based on window duration, targeting a readable number of buckets.

**When it fails:** If you still hit point cap, force a coarser step explicitly (usually `week`/`month`).

---

## How-to: optimize for mobile/narrow dashboards

**Goal:** Avoid clutter and keep UI responsive on small screens.

- Prefer `aggregation: day` for month views and `aggregation: month` for year views.
- Avoid very high `count` values unless you need visual context.
- If labels look cramped, consider forcing `x_axis_format` (short) and keeping rich info in tooltip.

---

## Hard limits you cannot bypass

- **Minimum supported window duration is 1 hour** (LTS hard limit).
- Only `aggregation: hour | day | week | month` is supported.
- Time window `count` must be ≤ 24.

See [Time Window Reference](Time-Window-Reference) for the full validation list.

