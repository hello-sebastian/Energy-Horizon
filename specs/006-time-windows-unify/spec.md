# Feature Specification: Unified Time Windows and Chart Axis Semantics

**Feature Branch**: `006-time-windows-unify`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: Ujednolicony silnik okien czasowych i osi wykresu (bez rozgałęzień legacy / generycznych); spójność serii bieżącej ze wskaźnikiem „teraz”; uspójnienie dokumentacji Speckit i wiki.

## Clarifications

### Session 2026-04-12

- Q: Which time zone is binding for window boundaries, aggregation buckets, and axis/tooltip labels? → A: Home Assistant instance time zone (same basis as entity statistics); encoded as FR-H.
- Q: Canonical name and rule for multi-window (FR-C) horizontal axis span? → A: Axis length MUST match the longest comparison window; product name **Longest-window axis span**; encoded in FR-C. (User: zakres osi X = długość najdłuższego okna.)
- Q: For **Longest-window axis span**, measure each window’s length using nominal configured bounds or clip open windows to “now”? → A: **Nominal bounds** (full configured start/end per window); partial open periods and “now” remain **FR-G**, not a shorter axis count.
- Q: Default **FR-G** carry-forward for weekly/monthly aggregation vs daily? → A: **Apply carry-forward** for week and month **analogous to daily** when feasible; if a case cannot be supported, fall under **FR-F** (documented semantics or reject/guide)—not silent disable.
- Q: When `comparison_preset` label disagrees with effective windows after overrides, default product stance? → A: **Explicit parameters unconditionally override** preset; effective merged windows are the behavioral truth; assume competent advanced users; **coherent unified rules** over preset-based exceptions; **FR-E** still for invalid merges. (User: preset bezwzględnie nadpisywany; spójność reguł ponad wyjątki.)

### Session 2026-04-13

- Q: Should horizontal axis **step count** for exactly **two** windows follow only the current window’s length, or the same **Longest-window axis span** rule as for more windows? → A: **Same rule for all** `windows.length >= 2`: axis step count = **max** nominal slot counts (**Longest-window axis span**); shorter window’s series ends earlier (no data / null past its nominal end); `count: 1` unchanged (single window = its own length).
- Q: How should **axis tick labels** behave for slot indices **beyond** the current window’s nominal slot count when another window is longer? → A: **Ordinal continuation** at the **chart aggregation grain** (same step width as the current window’s grid)—ticks MUST NOT assert misleading **calendar** dates that belong only to a longer reference/contextual period on the shared axis; tooltips and legend/summary MUST still identify which window a value belongs to (**FR-F** for exact copy rules).

### Session 2026-04-13 (implementation alignment)

- **Timeline slot timestamps (`timeline[]`)** for `N ≥ 2`: **prefix** = nominal slot starts for **window 0 (current)** only; if **Longest-window axis span** > that prefix length, **append tail** slots by stepping forward one aggregation bucket at a time from the last prefix start (ordinal continuation, FR-H). The implementation MUST NOT build `timeline[]` from the longest window’s calendar alone (that broke FR-B and the “now” marker).
- **“Now” marker index** and **FR-G carry-forward** slot: MUST be derived from the bucket that contains the current instant **within window 0** (same aggregation and HA time zone), then mapped to the shared axis index—NOT from `findTimelineSlotContainingInstant(fullTimeline, Date.now())` when `fullTimeline` mixes a current-calendar prefix with a tail.
- **Comparison axis label dimensions** (default adaptive axis + default tooltip header): when two windows start in **different calendar years**, omit the year on the axis/tooltip; when they share a year but start in **different months** (`day` aggregation), use **day-of-month only** on the axis/tooltip so the header captions carry month/year disambiguation. Forced `x_axis_format` / `tooltip_format` overrides this matrix.

### Session 2026-04-13 (tooltip slot + FR-H Intl)

- **ECharts axis tooltip:** the chart maps the pointer column to `fullTimeline[i]` using **`axisValue`** (rounded) and/or the **current/reference** series’ explicit X coordinate — not `dataIndex` from an arbitrary first series (sparse forecast line). **FR-H:** default `Intl` formatting for axis/tooltip calendar fields passes **`timeZone`** = Home Assistant IANA zone. See [contracts/unified-time-windows-axis.md](./contracts/unified-time-windows-axis.md).

### Session 2026-04-13 (LTS sum → chart buckets)

- **FR-DATA-1:** For LTS rows using **`sum`** (monotonic total), each computed increment MUST be assigned the timestamp of the **previous row’s `start`** (start of the aggregation period that increment represents), so values map to the same nominal slot index as the shared `timeline[]` built in FR-H (first day/hour of the window is not skipped on the chart while the axis still labels that bucket). **`change`** / **`state`** rows keep the current row’s `start`. **G9** in [golden-scenarios.md](./golden-scenarios.md).

### Session 2026-04-19 (LTS measurement min/max — issue #45)

- **FR-DATA-2:** When a returned LTS row has **no** usable numeric **`sum`**, **`change`**, or **`state`**, but **`min`** and **`max`** are finite numbers, the card MAY derive the per-bucket increment as **`max - min`**. Rows where **`max - min < 0`** MUST be skipped (non-cumulative measurement behavior). The increment’s timestamp MUST be the **current row’s `start`** (same rule as **`change`** / **`state`**, not FR-DATA-1). This path is a compatibility heuristic for `state_class: measurement` entities that behave like monotonic cumulative counters (e.g. templates); it does **not** replace correct Home Assistant semantics—entities that are true cumulative meters SHOULD use **`state_class: total_increasing`** so LTS exposes **`sum`**. Covered by unit tests in `tests/unit/ha-api.test.ts` (issue #45 fixtures).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One story for time, axis, summary, and tooltip (Priority: P1)

As someone comparing energy use across periods on the Energy Horizon card, I need the period names in the summary, the chart’s horizontal time scale, tooltips, and any forecast callouts to describe the **same** comparison story, so I never see one part of the card referring to “this month” while the chart axis looks like a different calendar span.

**Why this priority**: Misaligned labels destroy trust and make the card unusable for decisions.

**Independent Test**: Configure a standard two-period comparison and verify visually and in copy that summary period text, axis tick meanings, and tooltip period labels agree for the current period.

**Acceptance Scenarios**:

1. **Given** a merged card configuration with a preset plus optional time window overrides, **When** the card renders, **Then** I can describe the result as an ordered list of windows with explicit start/end meaning without needing to know any internal “legacy vs generic” implementation path.
2. **Given** two or more comparison windows, **When** I read the chart axis, **Then** the **number of steps** follows **Longest-window axis span** (FR-C), shorter series end without values past their window’s nominal end, **date/step label meaning** for slots within the current window follows the **current** window’s calendar structure and aggregation grain (FR-B), and each non-current series is aligned by the single documented ordinal rule; **tail** slots beyond the current window’s length use ordinal-consistent labeling per the Session 2026-04-13 clarification.
3. **Given** LTS data with **`sum`** and daily (or hourly) aggregation, **When** the chart renders, **Then** the first non-null cumulative sample for the current window aligns with the **first** timeline slot for that window (**FR-DATA-1**, scenario **G9**)—the series does not appear shifted by one bucket relative to axis ticks.
4. **Given** LTS rows with only **`mean` / `min` / `max`** (no **`sum`**, **`change`**, or **`state`**) for a monotonic cumulative-style entity, **When** the chart renders, **Then** the series is **not empty** and per-bucket increments follow **FR-DATA-2** (see `tests/unit/ha-api.test.ts`, issue #45).

---

### User Story 2 - Preset users keep trusted behavior (Priority: P1)

As a user of built-in comparison presets (`year_over_year`, `month_over_year`, `month_over_month`), I need today’s behavior to remain correct where it was intentionally designed, so upgrades do not change what I already rely on.

**Why this priority**: Regressions on defaults affect the widest audience.

**Independent Test**: Run the documented golden acceptance scenarios for each preset (with and without representative time window overrides) and compare window boundaries and axis span expectations to the spec.

**Acceptance Scenarios**:

1. **Given** each default preset without overrides, **When** the card renders, **Then** period boundaries and axis expectations match the golden scenarios in this initiative’s acceptance set.
2. **Given** common overrides (e.g. only `duration`, or `anchor` / `step` changes), **When** the card renders, **Then** behavior matches the documented predictions for those scenarios—axis **length** always follows **Longest-window axis span** for multi-window charts (no special shorter-axis path for exactly two windows), and label semantics remain driven by the **current** window plus the documented tail-slot rule.

---

### User Story 3 - “Now” matches the end of the current series (Priority: P2)

As a user viewing a long current window (e.g. a shifted fiscal year), I need the vertical “now” marker on the chart to match where the **current** series visually ends when the summary already reflects the latest known cumulative value, so the chart does not look “short” compared to the headline numbers.

**Why this priority**: Visual mismatch between summary and line endpoint is a sharp credibility issue, especially for partial periods.

**Independent Test**: Use a scenario where the last bucket in the current window is still open in underlying history data; confirm the current series reaches the “now” position using the latest known cumulative value for that window (carry-forward **inside** the window only), and that updating data updates the value without changing the rule.

**Acceptance Scenarios**:

1. **Given** a partial current bucket (e.g. today inside a daily or coarser aggregation), **When** the “now” marker is shown, **Then** the current series extends to that marker with a value consistent with the summary’s cumulative logic, or any intentional difference is explicitly documented—not an unexplained gap.
2. **Given** aggregation coarser than a day (week, month), **When** the “now” marker falls inside an open bucket, **Then** carry-forward MUST apply **analogous to the daily case** (latest known cumulative value for the current window carried to the slot containing “now”), unless a grain-specific limitation makes that impossible—in which case **FR-F** applies (explicit documented semantics or reject/guide), not an undocumented gap.

---

### User Story 4 - Clear errors for bad configuration (Priority: P2)

As an advanced user editing time window settings, I need invalid combinations to **fail visibly** with a clear message, so I am never left guessing whether a silent fallback changed my intent.

**Why this priority**: Silent recovery caused past path confusion and UX regressions.

**Independent Test**: Apply invalid `time_window` values and confirm an immediate error with actionable wording; confirm no silent revert to preset-only behavior.

**Acceptance Scenarios**:

1. **Given** an invalid time window after merge, **When** the card loads, **Then** it shows a readable error and does not silently ignore overrides.
2. **Given** a `comparison_preset` label that no longer matches the **effective** windows after explicit overrides, **When** the merged configuration is **valid**, **Then** the card follows **only** the effective merged windows and unified rules (FR-B–FR-H)—no rejection or alternate engine path **solely** because the label disagrees; **Then** user-visible copy does not assert a different period story than the effective windows (same story everywhere, or neutral labeling per documentation).

---

### Edge Cases

- Partially finished current window (end anchored at “now”) compared to a full previous calendar period.
- Months with different day counts and leap years affecting ordinal alignment.
- `count: 1` (no reference period): metrics and tooltip behavior must not regress.
- **Two or more** comparison windows (including contextual series): draw order and tooltip emphasis (current + reference) remain aligned with product intent; horizontal axis **always** uses **Longest-window axis span** (FR-C)—`timeline.length` = max nominal step count among participating windows at the chart grain; shorter windows’ series end earlier; the axis MUST NOT be shortened to match a shorter window alone; axis step count uses **nominal** window ends (not clipped to “now”), while FR-G still governs how far the **current** series is drawn within the open window; tail-slot labeling follows Session 2026-04-13.
- Override only `duration` versus changing `anchor` or `step`: outcome must be predictable and documented.
- Explicit `time_window` (and related) fields override preset defaults field-by-field; the preset’s marketing name may disagree with effective windows—behavior MUST still follow the merged model only (see **FR-F**).
- Browser local time MUST NOT redefine bucket edges or calendar boundaries: window bounds, aggregation buckets, axis and tooltip calendar labels, and interpretation of “now” MUST follow the Home Assistant instance (reporting) time zone, consistent with entity statistics (see FR-H).
- Open bucket at “now” with missing raw point for that bucket in history data: carry-forward applies **only** up to the window end and timeline bounds—no artificial extension beyond.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-A (Merged model clarity)**: After preset and optional time window settings are merged, the effective configuration MUST be explainable as an explicit ordered list of comparison windows with unambiguous roles (current, reference, contextual where applicable) and clear boundaries—without reference to internal legacy or parallel engine paths.

- **FR-B (Axis labeling, grain, and ordinal alignment)**: Whenever **two or more** comparison windows are shown, **date/step label meaning** and **calendar framing** for axis slots MUST follow the **current** window’s aggregation grain and numbering for all slots that fall within the **current** window’s **nominal** step span at the chart grain, implemented by anchoring **`timeline[]` slot timestamps** to window 0 for the prefix and **ordinal continuation** for the tail (see Session 2026-04-13 implementation alignment). For **tail** slots (indices at or beyond that span) when **Longest-window axis span** is longer than the current window, tick labels MUST follow **ordinal continuation** at the chart grain without misleading calendar dates tied only to a longer reference/contextual window on the shared axis (Session 2026-04-13); exact user-visible copy for tooltips and legends falls under **FR-F**. Each series MUST map to the shared axis using **one** documented ordinal alignment rule (same ordinal step within each window’s period, e.g. same day-in-period index). **FR-B (label dimensions)**: default adaptive formatting MUST suppress redundant calendar fields on the shared axis when two windows differ by year and/or month as documented in Session 2026-04-13 (implementation alignment); summary captions emphasize differing dimensions (**FR-F** for edge copy).

- **FR-C (Axis step count — “Longest-window axis span”)**: Whenever **two or more** comparison windows are shown, the chart MUST use the **Longest-window axis span** policy: the horizontal axis shows exactly as many **aligned comparison steps** at the **chart aggregation grain** as the **longest** of the participating windows. Each window’s length for this comparison MUST be computed from its **nominal** configured start and end (after merge)—including windows that are still open in real time—**without** shortening an open window’s end to “now” for the purpose of axis length. The **maximum** of those nominal step counts determines the axis length. Shorter windows occupy only their respective steps (no series values past nominal end except as governed by **FR-G** for the current window); the axis MUST NOT be shortened to match a shorter window alone. Partial data and the “now” marker within an open window MUST still follow **FR-G**; they MUST NOT change the nominal axis step count. **FR-B** governs how those steps are **labeled**; **FR-C** governs **how many** steps exist. If a merged configuration cannot express all windows on a single grain without contradiction, behavior MUST fall under **FR-F** (explicit documented semantics or reject/guide—no silent heuristic). Documentation and tests MUST use the name **Longest-window axis span**.

- **FR-H (Time zone authority)**: Calendar-boundary calculations, aggregation bucket alignment, period labels on the axis and in tooltips, and the definition of “now” for markers and FR-G MUST use the Home Assistant instance time zone (the same basis used for entity statistics). The browser’s local time zone MUST NOT override those boundaries.

- **FR-D (Forecast and progress basis)**: Forecast and any “period completion” or progress-style metrics MUST treat the **current** window (first / index zero in the comparison story) as the denominator for progress, independent of whether the shared axis spans a wider range (**Longest-window axis span** may exceed the current window’s bucket count). Implementations MUST **not** assume equal bucket counts between the shared timeline and the current window; forecast/progress logic MUST remain correct when `timeline.length` is greater than the current window’s nominal slot count.

- **FR-E (Fail-fast validation)**: Invalid merged time window configuration MUST surface immediately with a clear, actionable error. The system MUST NOT silently fall back to preset defaults in a way that hides the mistake.

- **FR-F (Effective merge vs preset label; edge semantics)**: Any explicit **`time_window` (and related) parameter** the user sets MUST **override** the corresponding implied value from **`comparison_preset`**; the preset supplies **defaults only** for fields not overridden. The **effective merged windows** (after merge) are the **sole behavioral source** for geometry, axis policy, summaries, tooltips, and forecast—**not** the preset’s marketing label when the two differ. A mismatch between label and effective windows is **allowed**; the product assumes an **advanced user** who intends the merged result. The implementation MUST **not** branch on preset name alone to impose a different axis, window set, or narrative than the merged model (**no label-keyed “legacy” paths**). **Consistency and logical application** of the unified rules in this spec take precedence over carving preset-specific exceptions. For any **valid** merge that still requires an edge decision (including cross-references from **FR-C** or **FR-G**, e.g. incompatible grains or unsupported carry-forward), behavior MUST be **explicitly documented** or **rejected/guided** consistently—**never** a silent heuristic. **FR-E** still applies: **invalid** merged parameters MUST fail fast; “invalid” means self-contradictory or unparseable input, **not** merely “unexpected relative to the preset name.” User-visible strings MUST **not** contradict the effective windows (e.g. claiming YoY while plotting a different effective story) unless documentation defines a neutral display rule.

- **FR-G (“Now” and current series continuity)**: When a “now” indicator is shown on the time axis within the current window, the current series MUST visually meet that indicator using the latest known cumulative value for the still-open interval in that window (carry-forward within the window and timeline only). The same expectation applies at **daily, weekly, and monthly** chart aggregation grains: carry-forward MUST be used **by default** in the open bucket that contains “now,” analogous across grains unless a documented limitation makes it impossible—then **FR-F** governs (explicit semantics or reject/guide), not a silent omission. When newer data arrives, values MUST update without changing the documented rule. The system MUST NOT extend the series beyond the current window end or beyond the defined timeline.

### Key Entities

- **Comparison window**: A bounded time range with a role (current, reference, contextual), derived from merged configuration; used for summaries, series selection, and alignment.

- **Merged card configuration**: The effective settings after combining comparison preset and optional time window block (`anchor`, `duration`, `step`, `count`, `offset`, etc.); explicit fields in the merge **win** over preset defaults; this object is the behavioral truth (see **FR-F**).

- **Shared chart time axis**: The single horizontal scale used for all series on the main chart: **step count** from **FR-C** whenever two or more windows; **label semantics** and ordinal alignment from **FR-B**.

- **Longest-window axis span**: The named policy (**FR-C**) for `windows.length >= 2`: axis step count equals the **maximum** nominal slot count among participating windows at the chart aggregation grain; **FR-B** governs labels (including tail slots when the longest window exceeds the current window’s length).

- **Aligned comparison step**: An ordinal position along the comparison timeline (e.g. day index within the aligned periods) used to place current and reference values consistently.

- **Open bucket**: A time bucket that has started but is not yet closed in underlying data; subject to FR-G rules by aggregation grain.

- **Authoritative time zone**: The Home Assistant instance time zone used for statistics; governs boundaries, labels, and “now” per FR-H.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-1**: A documented set of golden acceptance scenarios (built-in presets plus representative merged overrides) defines expected window boundaries and expected axis span for each case—**stated relative to the Home Assistant instance time zone (FR-H)**; reviewers find **no** known mismatch between summary period copy and axis meaning in those scenarios.

- **SC-2**: All automated tests that guard time windows, axis behavior, forecast progress, and tooltip consistency either still pass or are deliberately replaced with equivalent scenarios tied to the unified model; no unexplained loss of coverage.

- **SC-3**: Speckit specifications (`001-time-windows-engine`, `001-aggregation-axis-labels`, `001-compute-forecast`, related contracts) and wiki source pages present **one** non-contradictory story for horizontal axis rules (**Longest-window axis span** for every chart with **two or more** windows; **FR-B** labeling), tooltip period naming, and forecast progress (current window as progress basis vs axis span, **FR-D**).

- **SC-4**: An external reviewer, using only published wiki guidance, can construct configurations for “this month vs previous,” month-over-year, and year-over-year comparisons without needing to guess internal engine paths.

- **SC-TODAY-1**: In a scenario with a partially closed last bucket in history data, the current series reaches the “now” position and the value at that marker matches the latest known cumulative value for the current window per the summary logic, unless a documented intentional difference is stated.

- **SC-TODAY-2**: Reference series, forecast, and tooltip behavior do not regress; automated tests cover the “now” slot when raw mapped data would otherwise be empty, proving carry-forward does not break other series.

- **SC-AXIS-MS-1**: For `N ≥ 2`, golden tests assert `timeline[0…]` begins with window 0’s calendar slot starts and, when the axis is longer than window 0’s nominal slot count, tail entries continue at the chart aggregation step—not the longest window’s calendar in isolation.

- **SC-NOW-1**: With a partial current window and a longer reference window (e.g. MoM / YoY / MoY presets), the “now” marker index matches the day (or bucket) of “today” inside window 0 in the HA time zone, not the last slot of the reference calendar.

- **SC-LABEL-1**: For two windows with different start years, default axis/tooltip headers do not show a misleading single year on every tick; for same-year different-month daily comparisons, default axis/tooltip use day-of-month unless the user forces Luxon formats.

### Phased deliverables *(planning hook)*

- **Phase 1 (minimal viable unification)**: Deliver unified **FR-B** / **FR-C** (single **Longest-window axis span** rule for all `N >= 2`), **FR-D**, **FR-E**, **FR-G**, and **FR-H** for the primary two-window cases; publish the single-source documentation corrections; establish the initial golden scenario set (including **N=2** with **unequal** nominal window lengths where applicable). Completion: SC-1 satisfied for two-window scenarios, SC-3 free of contradictions on axis vs forecast, SC-TODAY-1/2 met at minimum for **daily** aggregation and, where feasible, **weekly and monthly** per FR-G (any grain-specific exception documented under **FR-F**).

- **Phase 2 (full de-branching)**: Remove dependence on undocumented parallel calculation paths; fully satisfy **FR-A** and **FR-C** with complete golden coverage for **N≥2** and contextual series. Completion: SC-1–SC-4 fully met, including multi-window and contextual cases.

## Assumptions

- The refactor is evolutionary: Phase 1 may ship meaningful fixes before every internal legacy pathway is removed, provided the spec and plan keep both phases and exit criteria explicit.
- Changing Home Assistant’s core data model or Long-Term Statistics storage is out of scope; the card works with data as exposed today.
- A full redesign of the graphical editor for every `time_window` field is out of scope; documentation and validation improvements may still reference editor behavior.
- Automatic narrative generation for footer labels (e.g. inferring “last year” vs “prior month” only from dates) is optional future work; this initiative may only lay groundwork.
- Documentation work includes aligning Speckit specs, wiki sources under `wiki-publish/`, and user-facing README / advanced README / changelog entries so they reflect one policy.
- Dependencies for planning and implementation: `specs/001-time-windows-engine/`, `specs/001-aggregation-axis-labels/`, `specs/001-compute-forecast/`, and wiki sources such as `wiki-publish/Mental-Model-Comparisons-and-Timelines.md` and related configuration pages.
- Advanced configuration: users who override preset fields are assumed to understand the merged result; documentation emphasizes **effective windows** and unified rules rather than warning away every label mismatch (**FR-F**).
