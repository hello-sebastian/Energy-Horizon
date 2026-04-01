# Troubleshooting and FAQ

**How-to** — diagnose failures with clear “done” criteria and common failure branches.

For option names/defaults, use [Configuration and Customization](Configuration-and-Customization).

---

## Quick triage (90 seconds)

1. **Card doesn’t load at all** → see *Resource / custom element*.
2. **Card loads but chart is empty** → see *Entity has no LTS*.
3. **Card errors after adding YAML** → see *Config validation errors*.
4. **Forecast missing** → see *Forecast gating*.
5. **“Too many timeline slots”** → see *Point cap exceeded*.

---

## How-to: fix “Custom element doesn’t exist”

**Goal:** Card loads without the “custom element doesn’t exist” banner.

**Steps:**

1. Confirm you installed the JS file via HACS or manual copy.
2. Confirm the Lovelace **resource URL** is correct (HACS path vs `/local/`).
3. Reload the dashboard (or clear cache / restart HA frontend).

**Expected outcome:** The card renders a header and loads data (or shows a data-related message).

**When it fails:** Check browser console for resource load errors (404 / MIME type / cache).

Related: [Getting Started](Getting-Started).

---

## How-to: confirm the entity has long-term statistics (LTS)

**Goal:** The chart shows at least the current series, and in comparison mode shows current + reference.

**Steps:**

1. Open **Developer Tools → Statistics** (not **States**).
2. Search for your entity/statistic ID.
3. If it’s missing, pick an entity that has LTS (utility meters, dashboard-backed statistics, cumulative energy sensors).

**Expected outcome:** Your chosen `entity:` is visible under Statistics.

**When it fails:**

- If recorder/statistics are disabled or misconfigured, no statistics will exist.

---

## How-to: fix an empty chart (card loads, no data)

**Goal:** The chart shows non-empty series.

**Checklist (most common to least):**

1. **Wrong entity (no LTS)** — see above.
2. **Unit changed historically** — comparisons can be rejected or look wrong.
3. **Time window too narrow / too new** — there may be no buckets yet.
4. **Overly strict config** — e.g. invalid `time_window` causing error state.

**Pro move:** set `debug: true` and inspect the browser console for resolved windows and query diagnostics.

```yaml
debug: true
```

---

## How-to: use YAML-only options safely (editor vs YAML)

**Goal:** Add advanced keys (`time_window`, formats, styling) without breaking the card.

**Steps:**

1. Start from a known-working minimal config.
2. Add **one** advanced option at a time.
3. Reload the dashboard after each change.
4. If it breaks, remove the last change and compare key spelling to [Configuration and Customization](Configuration-and-Customization).

**Expected outcome:** The card loads; invalid keys produce visible errors (not silent ignores).

---

## How-to: diagnose “missing forecast”

**Goal:** Decide whether missing forecast is a bug or expected by rules.

**Checklist:**

1. Ensure you have a reference series (count ≥ 2).
2. Ensure `show_forecast` is not `false` (remember alias `forecast`).
3. Check gating rules: ≥ 3 completed buckets and ≥ 5% of the current period.
4. If data is sparse or inconsistent, forecast suppression can be normal.

**Expected outcome:** Either the forecast line appears, or you can explain why it is disabled.

Related: [Forecast and Data Internals](Forecast-and-Data-Internals).

---

## How-to: fix values “off by 1000×” (units / scaling)

**Goal:** Values look correct and unit labels match expectations.

**Checklist:**

1. Check the entity’s `unit_of_measurement` in HA.
2. If you want raw values, disable scaling:

```yaml
force_prefix: none
```

3. If unit history changed (Wh ↔ kWh), comparisons can be misleading; fix the entity or accept limitations.

---

## How-to: fix `status.point_cap_exceeded` (too many slots)

**Goal:** The card renders instead of showing the point cap error.

Fix steps: [How-To: Aggregation & Performance](How-To-Aggregation-and-Performance).

---

## Common config validation errors (fail-fast by design)

These errors are expected behavior: the card prefers visible configuration errors over silent fallbacks.

- Invalid `time_window` (bad token, `count > 24`, `duration < 1h`) → config error
- Invalid `x_axis_format` / `tooltip_format` → config error

References:

- [Time Window Reference](Time-Window-Reference)
- [Luxon Formats Reference](Luxon-Formats-Reference)

---

## FAQ

### Does the card require Energy Dashboard?

No. It requires an entity with long-term statistics.

### Is forecast guaranteed to show?

No. It’s gated by data coverage and requires a reference window.

### Can I use minute-level granularity?

No. The card is built on long-term statistics with a hard minimum of 1 hour.

---

## Known limitations (honest list)

- Depends on the quality/availability of HA long-term statistics.
- Forecast can be unavailable for sparse or inconsistent data.
- Historical unit changes can distort comparisons.
- Not designed for real-time instant power visualization.
