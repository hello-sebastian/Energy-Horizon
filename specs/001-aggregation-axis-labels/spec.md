# Feature Specification: Intelligent aggregation and X-axis labeling

**Feature Branch**: `001-aggregation-axis-labels`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: Intelligent aggregation (auto-interval from window duration), optional YAML overrides for step and axis format, adaptive Grafana-style X labels with locale cascade, no in-repo month/day dictionaries, mobile-first label density, hard cap on points per series for safety, documentation updates (README, wiki, changelog).

## Clarifications

### Session 2026-03-31

- Q: Configuration surface — where and under which key names? → A: **Option A** — **`x_axis_format`** is **card-level only** (canonical name **`x_axis_format`**). **`aggregation`** exists at card level and may also appear on windows after preset/`time_window` merge; **merge precedence for `aggregation` is clarified in Q4 below**.
- Q: Card-level `aggregation` vs per-window `aggregation` after merge? → A: **Option B** — Per-window **`aggregation`** wins when present on that window; card-level **`aggregation`** applies only as the default for windows that omit it (consistent with existing merge behavior).
- Q: What pattern family should **`x_axis_format`** use? → A: **Option A** — **Luxon-compatible** date/time format tokens (`yyyy`, `LLL`, `dd`, `HH`, `mm`, etc.); a **documented subset** lists which tokens are supported; invalid or unsupported patterns MUST yield a clear configuration error.
- Q: Time zone for X-axis and labels? → A: **Option A** — Always **Home Assistant’s configured time zone** (aligned with how windows and statistics are resolved), not the browser’s local time zone.
- Q: Fallback language when card and HA user language are unavailable? → A: **Option A** — **`en`** (generic English).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic aggregation step from window duration (Priority: P1)

As someone configuring the card, I only set how long the window lasts (`duration`). The card chooses a step size that keeps the chart readable, unless I explicitly set the step at **card level** or **on that window** (after merge), in which case manual aggregation applies per the merge rules.

**Why this priority**: Wrong granularity makes the chart empty, unreadable, or slow; this is the default path for most users.

**Independent Test**: Configure a window with only `duration` (no manual step). Observe that the resulting number of data buckets falls in a readability band and that the step aligns to natural time units (for example hourly for short spans, daily or weekly for longer spans), per the product threshold table.

**Acceptance Scenarios**:

1. **Given** a window whose length maps to the “up to 24 hours” band in the threshold policy, **When** no manual aggregation is set, **Then** the chosen step is a natural unit appropriate to that band (for example one hour, not an arbitrary odd interval).
2. **Given** longer windows (multi-day, multi-month, multi-year bands), **When** no manual aggregation is set, **Then** the chosen step matches the corresponding band in the threshold policy (for example daily or weekly for week-to-month-scale windows, monthly when the band calls for it).
3. **Given** the same `duration`, **When** the user later sets an explicit step at card level or on the window (per merge rules), **Then** automatic selection is skipped for that resolution path (see User Story 2).

---

### User Story 2 - Manual override of aggregation step (Priority: P1)

As an advanced user, I want to force the aggregation step using **`aggregation`** at **card level** and/or **per window** in merged YAML, with **per-window values taking precedence over the card default** when both are present.

**Why this priority**: Power users and migrations depend on predictable, explicit steps and consistency with existing `time_window` merge behavior.

**Independent Test**: Set an explicit step at card level only, per window only, or both; confirm resolved steps match FR-002. Confirm automatic interval logic does not run where a manual step applies. If the resulting number of points per series would exceed the maximum allowed (see safety rule below), the card refuses to render and shows a clear configuration error instead of loading an unsafe amount of data.

**Acceptance Scenarios**:

1. **Given** an explicit step in merged YAML (per window or card default per FR-002), **When** the card resolves configuration, **Then** that step is used for the affected window(s) and auto-interval is not applied there.
2. **Given** an explicit step that implies more points per series than the configured maximum, **When** the card prepares the chart, **Then** it does not render the chart and surfaces a user-visible configuration error; details for troubleshooting appear in developer/debug output when enabled.
3. **Given** an explicit step that is extreme but still at or under the maximum point count, **When** the user opens the dashboard, **Then** the card attempts to render (future soft performance warnings in the UI are optional and do not block this story).

---

### User Story 3 - Adaptive X-axis labels by aggregation context (Priority: P2)

As a dashboard viewer, I want horizontal axis labels that match the grain of the data (hours vs days vs months vs years), so I can read the chart without repeated redundant text.

**Why this priority**: Readability and parity with common analytics dashboards.

**Independent Test**: For each supported aggregation grain, open the chart and verify label content rules in **Home Assistant’s time zone**: hour-level shows time; at day boundaries, labels gain extra context where required; day-level shows day and month, with year only when the year changes; month-level shows abbreviated month names; year-level shows year only. Labels should not repeat the same year or month on every tick when still inside the same period (except where a single forced format applies; see User Story 4).

**Acceptance Scenarios**:

1. **Given** hour-level aggregation, **When** viewing the axis, **Then** labels show clock times, and at a day boundary the label shows broader context (for example date or weekday per product rules).
2. **Given** day-level aggregation, **When** the year changes along the axis, **Then** the year appears where needed; within the same year, shorter forms are used.
3. **Given** month-level aggregation, **Then** labels use short month forms appropriate to the active locale (without shipping month names inside the card package).
4. **Given** year-level aggregation, **Then** axis shows year values.

---

### User Story 4 - Optional forced X-axis label format (Priority: P2)

As an advanced user, I want an optional **card-level** field **`x_axis_format`** that sets how dates and times are formatted on the X-axis, overriding adaptive labeling.

**Why this priority**: Reporting and screenshots often need a fixed format.

**Independent Test**: Set **`x_axis_format`** to a **Luxon-compatible** format string from the documented supported subset (for example `yyyy-MM-dd HH:mm`). Every tick uses that pattern consistently, even if it repeats (for example only the year on every tick). No adaptive “boundary” enrichment is applied while this override is active.

**Acceptance Scenarios**:

1. **Given** a forced format in YAML, **When** the chart renders, **Then** adaptive label rules from User Story 3 do not apply; each label follows the forced pattern.
2. **Given** a forced format that makes many ticks identical (for example year-only across hourly points), **When** the chart renders, **Then** the card still renders as specified; duplicate adjacent labels may be reduced by the display layer if that improves readability without contradicting the forced pattern per tick.

---

### User Story 5 - Locale and language cascade (Priority: P2)

As someone using Home Assistant, I want date and time labels to follow my language: first any override in the card YAML, otherwise my Home Assistant user profile language, otherwise a safe default.

**Why this priority**: Households can share one dashboard with different profile languages.

**Independent Test**: With YAML language set, labels follow that locale. With YAML unset, labels match the HA profile language. With neither available, behavior falls back to **`en`**.

**Acceptance Scenarios**:

1. **Given** `language` (or equivalent) set on the card, **When** labels render, **Then** they use that language for formatting.
2. **Given** no card-level language, **Given** a HA user context with a language, **When** labels render, **Then** they use that language.
3. **Given** no resolvable language, **When** labels render, **Then** they use **`en`** as the fallback locale for formatting.

---

### User Story 6 - No bundled month/day name dictionaries for the time axis (Priority: P3)

As a maintainer, I do not want JSON or code dictionaries for month or weekday names for the chart time axis, so translations stay maintenance-free.

**Why this priority**: Long-term cost control; aligns with User Story 5.

**Independent Test**: Inspect the shipped artifact: there must be no locale files whose sole purpose is month or weekday names for the chart axis. Month and weekday text for labels must come from the environment’s standard formatting for the resolved language.

**Acceptance Scenarios**:

1. **Given** a supported display language, **When** month-short labels are needed, **Then** the displayed strings match what the platform formatter produces for that language (not hardcoded per-language strings in the repo).

---

### User Story 7 - Mobile-friendly horizontal axis (Priority: P2)

As a phone user, I want X-axis labels to stay horizontal and avoid overlapping; the chart may hide some intermediate labels but should keep ends and important boundaries readable.

**Why this priority**: Primary HA use includes phones; rotated labels waste vertical space.

**Independent Test**: On a narrow viewport, labels remain horizontal (no diagonal or vertical rotation). When space is insufficient, labels are thinned so bounding boxes do not overlap, prioritizing removal of middle ticks while keeping chart ends and, where applicable, boundary ticks from User Story 3.

**Acceptance Scenarios**:

1. **Given** a narrow screen width, **When** the chart displays, **Then** axis label text is not rotated for readability.
2. **Given** overlapping label boxes would occur, **When** the chart lays out the axis, **Then** some labels are omitted using a predictable priority (ends and key boundaries first preserved).

---

### User Story 8 - Tooltip precision matches aggregation (Priority: P2)

As a dashboard viewer, I want the chart **tooltip header** (time/date line) to show **only the precision implied by the effective aggregation** (for example month-only for monthly buckets, day+month without year for daily buckets), so I am not overwhelmed by irrelevant detail.

**Independent Test**: For each supported `WindowAggregation`, hover a point and verify the header matches the matrix in Requirements (no year in default comparison tooltips except where the matrix specifies year-only for a true yearly bucket—see Assumptions / LTS limits).

---

### User Story 9 - Tooltip without redundant year in comparison (Priority: P2)

As someone comparing periods (for example current year vs reference year), I do not want the **year repeated in the tooltip header** when the legend or series names already identify the periods; I want a **normalized date fragment** (for example “15 March”) and I read which calendar year applies from the series labels.

**Independent Test**: With two series visible, tooltip header does not include a year for default formatting; values still show under series names that carry period context.

---

### User Story 10 - Tooltip i18n aligned with axis (Priority: P2)

As a user, I expect month and day names in the **tooltip header** to use the **same resolved label locale** as the X-axis (`language` → HA → `en` cascade), not a different language source than the axis.

**Independent Test**: Change HA user language with card `language` unset; tooltip header month/day wording matches axis label locale behavior.

---

### User Story 11 - Optional forced tooltip format (Priority: P2)

As an advanced user, I want an optional card-level **`tooltip_format`** (Luxon-compatible subset) so I can **override** the default aggregation-based tooltip header when needed.

**Independent Test**: Set `tooltip_format` to a valid pattern; header follows it for every slot. Invalid pattern fails at `setConfig` like `x_axis_format`.

---

### Edge Cases

- **Invalid `x_axis_format`**: Tokens outside the documented supported subset or syntactically invalid patterns MUST result in a user-visible configuration error (same class as other invalid YAML), not a silent fallback to adaptive labels.
- **Forced format vs window length**: If the user forces a format that is too coarse for the window (for example only year on an hourly series), labels may repeat; the card still renders; the axis may be visually poor—acceptable if documented.
- **Daylight saving time**: Windows that cross DST transitions may show duplicate hours or skipped hours; timestamps remain correct; labels reflect **civil time in Home Assistant’s configured time zone** (not the browser’s offset).
- **Severe overlap on dense series**: With many ticks and wide label strings, the display layer may hide overlapping intermediate labels; behavior aligns with User Story 7.
- **Tooltip header vs aligned series (comparison)**: The tooltip header MUST be derived only from **`fullTimeline[slotIndex]`** (primary / shared X-axis). Do not show each series’ physical calendar date in the header; comparison uses the same slot index for all windows (User Story 9).
- **Sub-daily aggregation + multi-day window**: If aggregation is **hour** (or finer when supported) **and** merged window **duration > 1 day**, the tooltip header MUST add **day context** (for example time + short date) so identical clock times on different days are not ambiguous.
- **First tick not on a calendar boundary**: The first data point is always treated as a label “boundary” for context (so the start of the series gets an appropriate label even mid-month or mid-day), without requiring a separate manual boundary detector if the chosen implementation simplifies this rule.
- **Auto-interval vs data source limits**: Automatic step selection only uses aggregation sizes that the card can actually request for long-term statistics (for example hour and coarser while sub-hour LTS remains unsupported); “minute-level in the future” is out of scope until the data layer supports it.
- **Card vs window `aggregation`**: No separate “conflict error” is required when both are set—**per-window** value wins for that window (**FR-002**) *where the YAML model carries window-level **`aggregation`***; **v1** implements this via the single merge chain on `MergedTimeWindowConfig` (see Key Entities / Assumptions). Card-level serves as the default when the merged window config omits **`aggregation`**.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When **no** manual aggregation applies to a resolved window per **FR-002**, the product MUST derive a default aggregation step from that window’s **`duration`**, using a documented threshold table that targets a readable number of buckets (see Assumptions), then round to a natural time unit.
- **FR-002**: **Aggregation merge precedence**: After merging presets and `time_window`, if a window **explicitly** specifies **`aggregation`**, that value MUST be the manual step for that window and MUST take precedence over card-level **`aggregation`**. If a window does **not** specify **`aggregation`**, card-level **`aggregation`** MUST apply when set (default manual step for those windows). If neither applies for a window, **FR-001** automatic step selection runs. Automatic interval selection MUST NOT run for any window that has a resolved manual step from either source.
- **FR-003**: The product MUST define a hard maximum number of data points per series; if configuration (including manual step) would exceed it, the card MUST NOT render the chart and MUST show a clear configuration error, with additional detail available in debug-oriented logs.
- **FR-004**: X-axis labels MUST adapt to the effective aggregation grain (hour, day, week, month, year) when no user format override is set, including richer context on period boundaries (for example day change on hourly charts).
- **FR-005**: If the user sets optional card-level **`x_axis_format`**, that value MUST be a format string using **Luxon-compatible** tokens as defined in the card’s documented supported subset; invalid or unsupported patterns MUST surface a user-visible configuration error. When valid, that format MUST override adaptive labeling for ticks.
- **FR-006**: Label language MUST resolve in order: card configuration override first, then Home Assistant user language, then fallback **`en`** when neither yields a usable locale.
- **FR-006a**: X-axis tick times, bucket boundaries, and formatted labels MUST use **Home Assistant’s configured time zone** for interpretation and display, consistent with resolved windows and statistics—not the web client’s local time zone.
- **FR-007**: The card MUST NOT ship translation files whose only purpose is month or weekday names for the time axis; formatted month and weekday text MUST come from the platform’s date/time formatting for the resolved language.
- **FR-008**: On small viewports, axis labels MUST remain horizontal; the layout MUST reduce overlap by hiding labels with priority for middle ticks over ends and important boundaries.
- **FR-009**: The primary chart time axis MUST be driven from the main (current) window’s timeline; shorter comparison windows MUST align with that axis (including gaps where applicable) per existing comparison semantics.
- **FR-010**: Documentation MUST be updated for this feature: project README, published wiki sources under `wiki-publish/`, and `changelog.md` under Unreleased (or the next release section when released).
- **FR-011**: The chart tooltip **header** MUST default to a **precision matrix** driven by effective **`primaryAggregation`**: `month` → month name only; `day` / `week` → day + month **without year**; `hour` → time (hour+minute); if **hour** and merged **`duration` > 1 day**, append day disambiguation per Edge Cases. **Year** MUST NOT appear in default headers for comparison views except where a future **year bucket** exists in the statistics model (out of scope until LTS supports it—see Assumptions).
- **FR-012**: Optional card-level **`tooltip_format`** MUST use the **same Luxon token subset validation** as **`x_axis_format`**; invalid values MUST fail at **`setConfig`**. When set, it MUST override FR-011 for the tooltip header.
- **FR-013**: Tooltip header date/time formatting MUST use the **same label locale cascade** as X-axis labels (**FR-006** / `resolveLabelLocale`), not UI translation dictionary gating alone.
- **FR-014**: Tooltip header timestamps MUST be interpreted in **Home Assistant’s time zone** (**FR-006a**), consistent with **`fullTimeline`**.

### Key Entities

- **Axis configuration**: **`x_axis_format`** is **card-level only**. **`tooltip_format`** is **card-level only** (optional; overrides default tooltip header matrix). **`aggregation`**: merge order is **preset → `time_window` (deep merge) → `?? config.aggregation`** (`buildMergedTimeWindowConfig`); if still unset, **FR-001** auto-interval applies. **FR-002** (product intent): where the YAML model allows a window-specific **`aggregation`**, it overrides card-level; **implementation v1** uses **one** merged **`aggregation`** on `MergedTimeWindowConfig`, shared by all resolved windows, until a future schema supports per-window fields (see Assumptions). Optional forced tick strings use **`x_axis_format`** only.
- **Threshold policy**: Maps window duration ranges to target bucket counts and allowed natural step sizes (hour, day, week, month, year, and future-supported sizes).
- **Resolved aggregation**: The effective step after merging user overrides and automatic selection, subject to the maximum point rule.
- **Axis label profile**: Either “adaptive” (derived from aggregation and boundaries) or “forced format” from **`x_axis_format`** (Luxon-compatible token string per documented subset).
- **Locale resolution**: Ordered language source (card → HA user → **`en`**) used for all date/time label formatting.
- **Display time zone**: **Home Assistant** configured time zone for the axis and labels (see FR-006a).

## Assumptions

- Readability targets for automatic selection follow common dashboard practice: roughly **20 to 100** visible buckets as the design band (exact thresholds in the policy table may tune within this band). The current codebase did not previously encode this band; this specification adopts it unless product owners change the policy later.
- Threshold examples from the brief (for example up to 24h → hourly; days to a week → daily or coarser; months → daily or weekly; beyond a year → monthly) inform the policy table; exact numeric boundaries will be finalized during planning so they stay consistent with Home Assistant long-term statistics capabilities.
- The maximum points per series default is **5000** unless changed by maintainers during implementation planning.
- Sub-hour automatic aggregation remains out of scope until long-term statistics support aligns with sub-hour steps for this card’s entities.
- **Year-only** and **minute** buckets in the product matrix are **not** represented as separate `WindowAggregation` values in v1; **year**-only tooltip headers require a future LTS **year** period; **minute**-level tooltip rules apply when/if sub-hour aggregation is added.
- **`x_axis_format`** is **card-level** only. **`aggregation`** remains available at **card level** and in merged **`time_window`** (single object); parallel keys such as `aggregation_step` are out of scope. **FR-002** precedence is implemented via that merge chain; **implementation v1** does **not** yet support an array of windows each with its own **`aggregation`**—all **`ResolvedWindow`** entries use the same effective **`aggregation`** after merge and auto-interval.
- **`x_axis_format`** uses the **Luxon-format** token alphabet; user-facing documentation MUST list the supported subset and examples. ICU-only or preset-only formats are out of scope for this feature.
- Axis and labels are interpreted in **Home Assistant’s time zone**; using only the browser’s local offset for the same chart is out of scope.
- Final fallback for date/time label formatting is the **`en`** locale when no language is resolved from the card or HA user context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In user testing or scripted checks across at least three duration bands (short, medium, long), automatic step selection yields between **20 and 100** buckets for representative presets, or the nearest feasible count allowed by data-source constraints.
- **SC-002**: With manual step set, **100%** of test cases show that auto-interval logic is bypassed (verified via configuration resolution tests or equivalent observable behavior).
- **SC-003**: When exceeding the maximum points per rule, **100%** of test cases show a user-visible error and **no** chart render, with no silent browser freeze on a mid-range phone for the tested oversized configurations.
- **SC-004**: On a **320px-wide** viewport, axis labels remain horizontal and **at least** the first and last tick remain visible in test scenarios where ticks would otherwise overlap.
- **SC-005**: Switching only the HA user language (card YAML unchanged) changes month and weekday label wording without adding new translation files to the card for those strings.
- **SC-006**: After release, README and wiki-publish docs describe the new options and behavior; changelog records the user-visible changes.

## Out of Scope

- Rotated axis labels as the default mobile strategy.
- Shipping per-locale JSON dictionaries for month or weekday names for the axis.
- Sub-minute aggregation for automatic interval until the statistics pipeline supports it for this card.
- **ICU-only** or **preset-only** X-axis formats (without Luxon-style token strings) for `x_axis_format`.
