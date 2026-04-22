# 900-time-model-windows
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Time Model & Windows
**Replaces**: `001-time-windows-engine`, `006-time-windows-unify`
**Primary code**: `src/card/time-windows/`, `src/card/ha-api.ts` 
**Last updated**: 2026-04-21

---

<!-- NORMATIVE -->

## Current Behavior (normative)

The card models time comparisons as an ordered list of **comparison windows**. Each window is a bounded time range with a role (current = index 0, reference = index 1, contextual = index ≥ 2). Windows are derived by merging a named **comparison preset** (`comparison_preset` in YAML, legacy `comparison_mode`) with an optional `time_window` override block. The merged result is the sole behavioral source for data fetching, chart axis geometry, summary metrics, tooltips, and forecast computation.

### Built-in presets

| Preset | Window 0 (current) | Window 1 (reference) |
|---|---|---|
| `year_over_year` | Start of current calendar year → now | Same span, one year prior |
| `month_over_year` | Start of current calendar month → now | Same span, one year prior |
| `month_over_month` | Start of current calendar month → now | Previous calendar month, same duration |

### Merge semantics

Every field present in `time_window` unconditionally overrides the corresponding preset default. Fields absent from `time_window` retain preset values. The effective merged configuration is the **only** behavioral truth; the preset marketing name is irrelevant when it disagrees with the merged result.

### Axis geometry — Longest-window axis span

When two or more windows exist, the chart horizontal axis spans exactly as many aligned comparison steps as the longest window's **nominal** configured length (not clipped to "now"). Shorter windows' series end at their nominal step count; they never fill tail slots. Tail slots beyond the current window's nominal length use ordinal-continuation labeling at the chart aggregation grain.

### "Now" marker and carry-forward

The "now" marker is anchored to the bucket that contains the current instant within window 0, using the HA instance time zone. For the open bucket that contains "now", the current series carries forward the latest known cumulative value. Carry-forward applies at daily, weekly, and monthly aggregation grains by default.

### LTS data assignment

- **`sum` rows (monotonic total)**: each increment is assigned the timestamp of the **previous** row's `start` (start of the period the increment represents).
- **`change` / `state` rows**: assigned the current row's `start`.
- **`min`/`max` fallback (FR-DATA-2)**: when no `sum`, `change`, or `state` is available but `min` and `max` are finite, increment = `max − min`; rows where `max − min < 0` are skipped; timestamp follows the current row's `start`.

### Hard limits (LTS)

- Minimum aggregation granularity: **1 hour** (sub-hour windows rejected).
- Valid `anchor` values: `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`.
- Valid `aggregation` values: `hour`, `day`, `week`, `month`, or absent (defaults to `day`).
- `duration` must resolve to ≥ 1 hour.
- Maximum windows from YAML/Lovelace config: **24**. Exceeding this triggers fail-fast error (same as invalid config).
- No auto-correction of invalid values; every violation throws in `setConfig`.

---

## Public Contract

```yaml
# Top-level card YAML (relevant fields)
comparison_preset: year_over_year  # | month_over_year | month_over_month
time_window:
  anchor: start_of_month           # optional override
  duration: P1M                    # optional override, ISO 8601 duration
  offset: P0D                      # optional, shift anchor forward/backward
  step: P1M                        # distance between consecutive windows
  count: 2                         # number of windows (max 24 from YAML)
  aggregation: day                 # hour | day | week | month
```

Resolved windows are passed downstream as `ComparisonWindow[]`:
```typescript
interface ComparisonWindow {
  index: number;           // 0 = current, 1 = reference, ≥2 = contextual
  start: Date;
  end: Date;
  aggregation: 'hour' | 'day' | 'week' | 'month';
  role: 'current' | 'reference' | 'contextual';
}
```

---

## Cross-domain Contracts

**Publishes to**:
- `902-chart-rendering-interaction`: `ComparisonWindow[]`, `timeline[]` (slot timestamps anchored to window 0 for the prefix + ordinal continuation for tail), axis step count (Longest-window axis span), "now" marker index.
- `901-data-pipeline-forecasting`: `ComparisonWindow[0]` boundaries and slot count as the **sole forecast denominator** (`periodTotalBuckets`).
- `903-card-ui-composition`: resolved window labels, period names, effective preset name; `mergedTimeWindow.step` string consumed by `classifyComparisonStep` (Narrative Engine Refactor — v1.2.0) to determine `StepKind` for narrative period copy.

**Consumes from**:
- `904-configuration-surface`: raw YAML `comparison_preset` + `time_window` block.
- `905-localization-formatting`: HA instance time zone (IANA string) for all calendar boundary calculations.

---

## Non-Goals

- Changing the Home Assistant core data model or LTS storage schema.
- Sub-hourly aggregation support.
- Saving multiple window configurations server-side in HA.
- Auto-correcting or silently normalizing invalid configuration values.
- Changing the GUI editor to expose every `time_window` field (YAML is the surface for advanced params).

---

<!-- EXECUTION -->

## User Stories

### US-900-1 — Preset users retain trusted behavior with optional override (P1)

As a user with an existing `comparison_preset: year_over_year` or `month_over_year` card, I need the chart and comparison to work exactly as before when I add no `time_window` block, and to change only the field I explicitly override when I do add one, so upgrades never silently change my dashboard.

**Independent test**: Same entity and preset as before migration → same two periods visible with the same window alignment; adding only `time_window.duration` changes only the window width.

**Acceptance Scenarios**:

1. **Given** `comparison_preset: year_over_year` without a `time_window` block, **When** the card loads data, **Then** exactly two windows are shown: current calendar year and previous calendar year, matching pre-migration preset semantics.
2. **Given** `comparison_preset: month_over_year` without a `time_window` block, **When** the card loads data, **Then** two windows are shown: current month from its start and the same calendar-month range one year prior.
3. **Given** `comparison_preset: year_over_year` plus `time_window: { duration: P2Y }`, **When** configuration is merged, **Then** only the window duration changes; anchor, step, and count retain preset defaults.
4. **Given** `comparison_preset: month_over_month` (generic path), **When** the card loads, **Then** window 0 covers the current calendar month and window 1 covers the preceding calendar month with the same duration.

---

### US-900-2 — Multiple historical windows on one chart (P1)

As a user wanting to compare this month, last month, and two months ago on a single chart, I need the card to render three series with the correct date ranges and a shared axis spanning the longest window, so I can see all periods without mode switching.

**Independent test**: Config with `count: 3` and consistent `step` → three visible series; axis spans the longest window; tooltip shows values only for windows 0 and 1.

**Acceptance Scenarios**:

1. **Given** a config defining three windows, **When** data loads, **Then** the chart shows three series at the wyliczone `start`/`end` ranges.
2. **Given** windows with different day counts (e.g. February vs March), **When** the chart renders, **Then** the axis length equals the longest nominal window; shorter series end at their last data point without artificial extension.
3. **Given** at least three windows, **When** the user opens a tooltip, **Then** the tooltip shows values only for window 0 (current) and window 1 (reference); windows ≥ 2 are not listed.
4. **Given** `count: 2` and two windows of **unequal** nominal length, **When** the chart renders, **Then** the axis still uses Longest-window axis span (same rule as N > 2); the shorter window's series ends at its nominal step count.

---

### US-900-3 — "Now" marker matches current series endpoint (P2)

As a user viewing a partially-elapsed current window, I need the vertical "now" marker on the chart to align with where the current series visually ends and to show the latest known cumulative value, so the marker and the summary headline number tell the same story.

**Independent test**: Scenario with a partially closed last bucket → current series reaches the "now" position using the latest known cumulative value for that window; carry-forward does not break reference or contextual series.

**Acceptance Scenarios**:

1. **Given** a partial current bucket (e.g. today inside daily aggregation), **When** the "now" marker is shown, **Then** the current series extends to that marker with the latest known cumulative value, or any intentional difference is explicitly documented.
2. **Given** weekly or monthly aggregation with an open current bucket, **When** the "now" marker falls inside that bucket, **Then** carry-forward applies analogously to the daily case; if a grain-specific limitation exists, it is explicitly documented under FR-900-G, not silently omitted.
3. **Given** the adaptive X-axis with the current series visible and a "now" tick at any axis index, **When** the chart renders, **Then** the "now" tick always uses the two-line rich-text stack: an invisible placeholder edge row on line 1, the substantive adaptive date/time in "today" style on line 2; no standalone "Now" / "Teraz" caption is used as the only label.

---

### US-900-4 — Custom billing cycles (P2)

As a user whose energy billing year starts in October, I need to configure the card to align windows to my billing cycle anchor so that the card compares this billing year against the previous one, not calendar years.

**Independent test**: Config with an annual anchor offset by several months → two adjacent 12-month billing cycles visible with correct boundary dates.

**Acceptance Scenarios**:

1. **Given** an anchor with a multi-month offset from the nominal year start, **When** the engine computes windows, **Then** `start` and `end` of window 0 correspond to one full 12-month billing cycle from that anchor, and window 1 covers the preceding cycle.

---

### US-900-5 — Clear errors for invalid configuration (P2)

As a user editing `time_window` YAML, I need invalid or contradictory values to fail immediately with a readable message, so I am never left guessing whether a silent fallback changed my intent.

**Independent test**: Set `step: 0` or `count: 25` → visible error on card, no chart rendered; error persists until config is corrected.

**Acceptance Scenarios**:

1. **Given** an invalid `time_window` (e.g. `step: 0`, negative `duration`, unrecognised `anchor`), **When** the card loads, **Then** a readable error is shown and no data chart is rendered; no silent fallback to preset-only.
2. **Given** `count: 25` (exceeds the 24-window safety limit), **When** the card loads, **Then** the same error behavior as FR-900-E applies; no silent truncation to 24.
3. **Given** `count: 1` (a valid single-window config), **When** the card loads, **Then** no error is shown; only the current series is rendered; comparison metrics and forecast requiring a reference window are hidden.

---

## Edge Cases

1. **`count: 1`**: No reference window — chart shows only the current series; comparison metrics and forecast requiring a reference are hidden or disabled; tooltip shows at most one value; no configuration error is raised.
2. **Invalid or contradictory `time_window` after merge** (e.g. zero or negative `step`, missing required fields, unsatisfiable combination): mandatory visible error on card; no chart rendered; no silent fallback to preset; no partial application of `time_window` fields.
3. **Leap year**: comparison of months with different day counts (e.g. March − 1 month from March 31) must produce the correct last day of February including Feb 29 in leap years; the engine MUST NOT truncate to an incorrect date.
4. **LTS sub-hour rejection**: `duration: 30m` or any sub-hourly `aggregation` token (e.g. `5m`) must be rejected with a fail-fast error in `setConfig`; no auto-rounding to 1 hour.
5. **`count: 25` safety limit**: exceeding 24 windows from YAML/Lovelace config triggers the same card error as an invalid `time_window`; the internal engine algorithm MUST NOT hard-code the limit in its mathematical layer.
6. **Preset label vs effective merged windows**: when `comparison_preset: year_over_year` but `time_window` overrides produce a different effective story, the card follows the merged windows only; user-visible copy MUST NOT claim "year over year" if the effective windows are different — use neutral labeling or reflect actual windows.
7. **Carry-forward beyond window end**: carry-forward MUST NOT extend the current series past the window's nominal `end` or beyond the defined `timeline[]` bounds.
8. **`sum` row timestamp assignment (FR-DATA-1)**: when LTS rows use `sum` (monotonic total), the first non-null cumulative sample for the current window MUST align with the first timeline slot; the series MUST NOT appear shifted by one bucket relative to axis ticks.
9. **`min`/`max` fallback (FR-DATA-2)**: when no `sum`, `change`, or `state` is available but `min` and `max` are finite, `max − min < 0` rows are silently skipped; the series MUST NOT be empty for entities that are true cumulative-style counters with `state_class: measurement`.
10. **Two windows, unequal nominal length**: `timeline.length` equals the max nominal step count; the shorter window's series ends at its own nominal step count with null/absent values for tail slots; the axis MUST NOT be shortened to match the shorter window.

---

## Functional Requirements

- **FR-900-A (Merged model)**: After merging preset and optional `time_window`, the effective configuration MUST be expressible as an explicit ordered list of comparison windows with unambiguous roles (current, reference, contextual) and boundaries — without reference to internal legacy or parallel engine paths.

- **FR-900-B (Window parameters)**: Each window MUST be described by: anchor (one of `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`), optional `offset`, `duration`, `step`, `count`, and `aggregation`. `step` for window at index k = k × step unit backward from window 0.

- **FR-900-C (Preset merge)**: `comparison_preset` supplies default values for all window parameters. Every field explicitly present in `time_window` unconditionally overrides the corresponding preset default. Missing `time_window` fields retain preset values. The effective merged windows are the sole behavioral source.

- **FR-900-D (Calendar-correct boundaries)**: For each window the engine MUST compute explicit `start` and `end` dates using calendar-aware arithmetic (leap years, variable month lengths) consistent with Luxon's `startOf` / `plus` semantics and the HA instance time zone.

- **FR-900-E (Fail-fast validation)**: Any invalid merged configuration (zero/negative `step`, sub-hourly `duration`, unrecognised `anchor`, `aggregation` token outside `hour|day|week|month`, `count > 24`) MUST cause `setConfig` to throw with a readable error message. No silent auto-correction, no fallback to preset-only, no partial application.

- **FR-900-F (Preset label override)**: When effective merged windows differ from the preset's implied story, the card follows the merged windows only. User-visible copy MUST NOT assert a period narrative contradicted by the effective windows (e.g. claiming year-over-year when the effective story is month-over-month). Neutral labeling or reflection of actual window dates is required.

- **FR-900-G ("Now" and carry-forward)**: When a "now" indicator is shown within the current window, the current series MUST reach that indicator using the latest known cumulative value for the open bucket (carry-forward within the window and timeline only). Carry-forward MUST apply at daily, weekly, and monthly aggregation grains by default. If a grain-specific limitation exists it MUST be explicitly documented (not silently absent). The series MUST NOT extend past the window's nominal `end` or defined `timeline[]` bounds.

- **FR-900-H (HA time zone authority)**: All calendar boundary calculations, aggregation bucket alignment, axis/tooltip labels, and the definition of "now" for markers and carry-forward MUST use the Home Assistant instance IANA time zone. The browser's local time zone MUST NOT override those boundaries.

- **FR-900-I (Axis step count — Longest-window axis span)**: When two or more windows exist, `timeline.length` MUST equal the maximum nominal step count across all participating windows at the chart aggregation grain, computed from nominal configured `start`/`end` (not clipped to "now"). Shorter windows' series end at their nominal step count. The axis MUST NOT be shortened to match a shorter window.

- **FR-900-J (Timeline slot construction)**: `timeline[]` for N ≥ 2 is constructed as follows: prefix = nominal slot starts for window 0 only; if Longest-window axis span exceeds the prefix length, tail slots are appended by stepping forward one aggregation bucket at a time from the last prefix start (ordinal continuation). `timeline[]` MUST NOT be built from the longest window's calendar alone.

- **FR-900-K (Axis label semantics)**: Axis tick labels for slots within the current window's nominal span follow the current window's calendar structure and aggregation grain (FR-900-H). Tail slot labels use ordinal continuation at the chart grain without asserting misleading calendar dates tied only to a longer reference/contextual window.

- **FR-900-L (Single-window mode)**: When exactly one window exists, the chart MUST show only the current series; comparison metrics and forecast elements requiring a reference window MUST be hidden or disabled; tooltip MUST show at most the current window value; no error is raised for this valid state.

- **FR-900-M (Safety limit — 24 windows)**: Window count requested from YAML/Lovelace config after merging MUST NOT exceed 24. Values > 24 trigger the same card error as FR-900-E. The internal engine algorithm MUST NOT hard-code 24 as a mathematical constraint; the limit is a validation layer only.

- **FR-900-N (Forecast denominator)**: The forecast period denominator (`periodTotalBuckets`) MUST be derived from window 0's `start`/`end`/`aggregation` only. The shared `timeline.length` (which may be longer via Longest-window axis span) MUST NOT be used as the forecast denominator.

- **FR-900-O (Parallel data fetching)**: For each resolved window the engine MUST fetch LTS data with the computed `start`/`end` boundaries. Fetches for multiple windows MAY be issued in parallel; correctness of time ranges MUST be maintained.

- **FR-900-P (Series draw order)**: Chart series MUST be drawn from oldest (highest window index) to youngest (index 0), with forecast on top when enabled. This ensures younger windows visually overlay older ones.

- **FR-DATA-1 (LTS sum row timestamp)**: For LTS rows using `sum` (monotonic total), each computed increment MUST be assigned the timestamp of the **previous** row's `start` so values map to the same nominal slot index as `timeline[]`. The first bucket of the window MUST NOT be skipped on the chart while the axis labels that bucket.

- **FR-DATA-2 (min/max fallback)**: When an LTS row has no usable `sum`, `change`, or `state`, but `min` and `max` are finite, the card MAY derive the per-bucket increment as `max − min`. Rows where `max − min < 0` MUST be skipped. The increment's timestamp MUST follow the current row's `start` (same as `change`/`state` rows). This heuristic applies only to `state_class: measurement` entities behaving as cumulative counters; it does not replace correct HA semantics.

---

## Key Entities

- **`ComparisonWindow`**: index, `start: Date`, `end: Date`, `aggregation`, `role: 'current' | 'reference' | 'contextual'`. Derived from merged config; the behavioral truth for all downstream consumers.
- **`ComparisonPreset`**: named set of default window parameters (`year_over_year`, `month_over_year`, `month_over_month`). Supplies defaults only; overridden field-by-field by `time_window`.
- **Merged card configuration**: result of combining preset with `time_window` overrides; explicit fields in `time_window` win. This object is validated (FR-900-E) and then used to compute `ComparisonWindow[]`.
- **`timeline[]`**: array of slot timestamps (Date or epoch ms) representing the shared chart X-axis. Anchored to window 0 for the prefix; ordinal continuation for tail slots (FR-900-J).
- **Longest-window axis span**: the named policy for `timeline.length` when N ≥ 2 — max nominal step count among all windows at the chart grain (FR-900-I).
- **Open bucket**: a time bucket that has started but is not yet closed in underlying LTS data; subject to FR-900-G carry-forward rules.
- **Authoritative time zone**: the HA instance IANA time zone used for all calendar arithmetic and "now" resolution (FR-900-H).

---

## Success Criteria

- **SC-900-1**: A documented set of golden acceptance scenarios (built-in presets plus representative merged overrides) defines expected window boundaries and expected axis step count for each case, stated relative to the HA instance time zone. Reviewers find no known mismatch between summary period copy and axis meaning in those scenarios.
- **SC-900-2**: All automated tests guarding time-window computation, axis slot construction, forecast denominator, and "now" marker index either still pass or are deliberately replaced with equivalent scenarios tied to the unified model; no unexplained loss of coverage.
- **SC-900-3**: For N ≥ 2, automated tests (Vitest) assert that `timeline[0…prefix-1]` begins with window 0's calendar slot starts and, when the axis is longer than window 0's nominal slot count, tail entries continue at the chart aggregation step — not the longest window's calendar in isolation.
- **SC-900-4**: In a scenario with a partially closed last bucket, the current series reaches the "now" position and the value at that marker matches the latest known cumulative value for window 0 per the summary logic, unless a documented intentional difference is stated.
- **SC-900-5**: Automated tests confirm that `periodTotalBuckets` (forecast denominator) equals window 0's slot count and is unaffected by `timeline.length` when Longest-window axis span exceeds window 0's nominal length.

---

## Assumptions

- Home Assistant continues to supply LTS data as today; `start`/`end` boundaries are passed as-is, more frequently and for more windows.
- The HA instance time zone remains the canonical authority for all calendar arithmetic; no separate "local vs UTC" ambiguity is introduced by this domain.
- The 24-window safety limit applies to YAML/Lovelace input only; the internal engine algorithm may handle N > 24 (e.g. in unit tests) without the validation layer.
- A full GUI editor for every `time_window` field is out of scope; YAML remains the surface for advanced parameters.
- Documentation changes (wiki, README, changelog) that reflect this domain's rules are covered by domain `907-docs-product-knowledge`.
