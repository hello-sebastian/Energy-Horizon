# 900-time-model-windows
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Time Model & Windows
**Replaces**: `001-time-windows-engine`, `006-time-windows-unify`
**Primary code**: `src/card/time-windows/`, `src/card/ha-api.ts` 
**Last updated**: 2026-04-22

## Clarifications

### Session 2026-04-22

- Q: For invalid `time_window.offset`, what localization bar at release? → A: **Option C** — reuse the same user-visible localized string as other invalid `time_window` errors; **no** new `localize()` keys introduced solely for `offset` validation failures.

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
- **`offset`**: full **ISO 8601 duration** strings (including compound forms such as `P4M4D`, `P1M15D`, and signed forms `-P2M`, `-P1Y`). Evaluation uses calendar-aware `DateTime.plus(Duration)` semantics (component order Y → M → D → H per Luxon); end-of-month **clamping** is deterministic, not an error. **Sub-hour** offsets (e.g. `PT30M`) and **fractional** month/year components (e.g. `P0.5M`) are **rejected** in `setConfig`. Omitted `offset` or `P0D` matches legacy “no offset” behavior (backward compatible). **Legacy** single-token shims `+1d` / `+3M` / `+1Y` remain accepted as aliases of the corresponding ISO forms (`P1D` / `P3M` / `P1Y`) in one isolated parser; deprecated for removal in a later release.
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
  offset: P0D                      # optional, ISO 8601 duration; compound e.g. P4M4D, -P2M; see Public Contract
  step: P1M                        # distance between consecutive windows
  count: 2                         # number of windows (max 24 from YAML)
  aggregation: day                 # hour | day | week | month
```

**`time_window.offset` (normative)**  
- **Syntax:** ISO 8601 duration string. **Additive** examples: `P4M4D`, `P1Y`, `P1M15D`. **Negative** examples: `-P2M`, `-P1Y`. **Default / none:** omitted key or `P0D` — behavior identical to the pre-change product (compatibility with US-900-1).  
- **Evaluation:** `anchor` is resolved first, then the offset is applied as `DateTime.plus(Duration.fromISO(offset))` in the HA instance time zone, with Luxon’s calendar rules (including clamping when day-of-month overflows a shorter month). This is **not** equivalent to adding a single fixed day count when months or leap years differ. **DST:** day-level steps follow calendar days, not fixed 24-hour wall intervals.  
- **Legacy compatibility:** strings matching the legacy single-unit pattern (`+1d`, `+3M`, `+1Y`, etc.) are accepted via a **shim** that maps to the equivalent ISO form; shim is confined to one parser function.  
- **Rejected in `setConfig`:** any offset whose duration is **sub-hour** (e.g. `PT30M`, `PT59M`); any **fractional** calendar component (e.g. `P0.5M`); any string that is not a valid ISO duration and not a recognized legacy alias; any format that would leave window boundaries incoherent after the above rules.

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
- `905-localization-formatting`: HA instance time zone (IANA string) for all calendar boundary calculations. Invalid `offset` values surface as the **same** user-visible card error copy as other invalid merged `time_window` results (no new translation keys solely for offset — see Clarifications 2026-04-22).

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

### US-900-6 — Niestandardowy dzień startowy roku rozliczeniowego (P1)

As a user whose billing year starts on 5 May, I need to set `offset: P4M4D` with `anchor: start_of_year` so the card compares my current 12 months from 5 May with the previous year from 5 May — not from 1 January.

**Independent test**: With `anchor: start_of_year`, `offset: P4M4D`, `duration: P1Y`, window 0 starts on 5 May and ends on 5 May the following year in the HA time zone; window 1 steps backward by `step`.

**Acceptance Scenarios**:

1. **Given** `anchor: start_of_year`, `offset: P4M4D`, `duration: P1Y`, **When** the card resolves windows, **Then** `window[0].start` is 5 May of the current year, `window[0].end` is 5 May of the next year, and `window[1]` shifts by `step` from that anchor (backward).
2. **Given** a leap year (e.g. 2024), `anchor: start_of_year`, `offset: P1M28D`, **When** the card resolves the anchor+offset, **Then** the result is 1 March 2024 (not 29 February), consistent with Luxon month-end clamping.
3. **Given** `offset: P0D` or **no** `offset` key, **When** the card resolves windows, **Then** behavior is identical to the previous product version (backward compatible with US-900-1).

---

### US-900-7 — Rok rozliczeniowy zaczynający się przed końcem roku kalendarzowego (P2)

As a user, I need to set `offset: -P2M` with `anchor: start_of_year` so the window start falls on 1 November of the **previous** calendar year instead of 1 January.

**Independent test**: On `2026-04-22` with the above, window 0’s `start` is `2025-11-01` in the HA time zone.

**Acceptance Scenarios**:

1. **Given** `anchor: start_of_year`, `offset: -P2M`, **When** windows are computed for “today” `2026-04-22`, **Then** `window[0].start` = `2025-11-01` (in the instance time zone).
2. **Given** a negative offset that moves the anchor into the **previous** calendar year, **When** windows are computed, **Then** `start` and `end` are valid dates in that year — no error solely because the year rolled backward.

---

### US-900-8 — Czytelny błąd dla błędnego formatu offsetu (P1)

As a user who typed an invalid `offset` (e.g. `PT30M`, `P0.5M`, or a malformed string), I need a clear card error message when configuration loads, not a blank chart with no explanation.

**Independent test**: Invalid `offset` → `setConfig` throws; card shows error state; legacy `+3M` / `+1d` still parse and render.

**Acceptance Scenarios**:

1. **Given** `offset: PT30M` (or any sub-hour offset), **When** the card loads config, **Then** `setConfig` fails and the card shows the **standard invalid `time_window` error** (same localized string as other merged `time_window` failures; not a blank chart without explanation; per Clarifications 2026-04-22, no offset-specific copy required).
2. **Given** `offset: P0.5M` (fractional month), **When** the card loads config, **Then** the same **standard invalid `time_window` error** state as scenario 1 (fail-fast; not a blank chart without explanation).
3. **Given** legacy `+3M` or `+1d`, **When** the card loads config, **Then** the value is accepted as a compatibility alias of `P3M` / `P1D` and windows resolve correctly.

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
11. **`P4M4D` from `start_of_year` in a leap year**: 1 Jan + 4M = 1 May; + 4D = 5 May — unchanged from non–leap-year arithmetic for this pattern.
12. **`P1M30D` from 1 January**: 1 Jan + 1M = 1 Feb; + 30D = 3 Mar (not “31 February”).
13. **`P1M` from 31 January**: Luxon clamp to last day of February (28 or 29).
14. **`-P2M` from 1 January 2026**: → 1 November 2025.
15. **`PT30M` or other sub-hour `offset`**: fail-fast in `setConfig`; same class of rejection as sub-hour aggregation (user-visible error, not silent).
16. **`P0.5M` (fractional month)**: fail-fast in `setConfig`.
17. **`P1Y` from `start_of_year` on 2024-01-01**: → 2025-01-01; leap years handled by Luxon calendar rules.
18. **Legacy `+4M` in one field and ISO `P1Y` in another**: legacy shim applies only where legacy strings appear; both may coexist in one config.
19. **Omitted `offset` or `P0D`**: identical behavior to prior version (no regression vs US-900-1).
20. **DST boundary, `P1D`**: day addition follows calendar day in the zone (Luxon), not a fixed 24-hour wall delta.

---

## Functional Requirements

- **FR-900-A (Merged model)**: After merging preset and optional `time_window`, the effective configuration MUST be expressible as an explicit ordered list of comparison windows with unambiguous roles (current, reference, contextual) and boundaries — without reference to internal legacy or parallel engine paths.

- **FR-900-B (Window parameters)**: Each window MUST be described by: anchor (one of `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`), optional `offset`, `duration`, `step`, `count`, and `aggregation`. `step` for window at index k = k × step unit backward from window 0. When present, `offset` MUST be a full **ISO 8601 duration** accepted by the isolated parser (including optional legacy alias mapping), evaluated with calendar-aware `plus` semantics as in the Public Contract; `P0D` and omission MUST be equivalent.

- **FR-900-C (Preset merge)**: `comparison_preset` supplies default values for all window parameters. Every field explicitly present in `time_window` unconditionally overrides the corresponding preset default. Missing `time_window` fields retain preset values. The effective merged windows are the sole behavioral source.

- **FR-900-D (Calendar-correct boundaries)**: For each window the engine MUST compute explicit `start` and `end` dates using calendar-aware arithmetic (leap years, variable month lengths) consistent with Luxon's `startOf` / `plus` semantics and the HA instance time zone.

- **FR-900-E (Fail-fast validation)**: Any invalid merged configuration (zero/negative `step`, sub-hourly `duration`, unrecognised `anchor`, `aggregation` token outside `hour|day|week|month`, `count > 24`, invalid or forbidden `offset` per **FR-900-Q**) MUST cause `setConfig` to throw with a readable error message. No silent auto-correction, no fallback to preset-only, no partial application.

- **FR-900-Q (Compound `offset` validation)**: The card MUST parse `time_window.offset` in one place. It MUST accept full ISO 8601 duration strings (including compound and signed forms) that Luxon can apply via `DateTime.plus(Duration.fromISO(…))`. It MUST reject: sub-hour offsets; fractional year/month components; unrecognised strings (after legacy shim for single-token `+/-` **unit** forms only). It MUST treat legacy `+1d` / `+3M` / `+1Y` (and the same family) as aliases to `P1D` / `P3M` / `P1Y` for this release, with deprecation for removal. **User-visible error state** for any rejected `offset` MUST use the **same** localized card message as other invalid merged `time_window` configuration (Clarifications 2026-04-22); no new `localize()` keys only for `offset`. **`ComparisonWindow` and downstream APIs remain unchanged** — no changes to `ha-api.ts` consumer contracts.

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
- **SC-900-6**: Automated tests (Vitest) cover the compound-offset edge cases in the Edge Cases list (items 11–20), including backward compatibility for omitted/`P0D` offset, legacy shims, leap-year and clamping scenarios, and fail-fast for forbidden offset forms; `setConfig` errors for bad offsets use the same card error path as other invalid `time_window` config (user-visible; not a blank chart with no message). Tests need not assert offset-specific user-facing copy.

---

## Assumptions

- Home Assistant continues to supply LTS data as today; `start`/`end` boundaries are passed as-is, more frequently and for more windows.
- The HA instance time zone remains the canonical authority for all calendar arithmetic; no separate "local vs UTC" ambiguity is introduced by this domain.
- The 24-window safety limit applies to YAML/Lovelace input only; the internal engine algorithm may handle N > 24 (e.g. in unit tests) without the validation layer.
- A full GUI editor for every `time_window` field is out of scope; YAML remains the surface for advanced parameters.
- Documentation changes (wiki, README, changelog) that reflect this domain's rules are covered by domain `907-docs-product-knowledge`.
- The legacy offset shim is **temporary**; product documentation and changelog MUST mark it as deprecated. Removal of the shim is a one-function change in the parser when scheduled.
- Domains **904** (card error surfacing for YAML that fails at `setConfig`), **907** (end-user documentation for ISO offset and examples), and **901** (verification that forecast denominator and LTS query contracts stay tied to `ComparisonWindow[]` only) participate in the release for this feature as specified by the program team. **903** / **905** are **not** required to add new translation keys for offset errors when using the **standard invalid `time_window` message** (Clarifications 2026-04-22).
