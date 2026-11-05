# Feature Specification: Transient Time-Window Preview

**Feature Branch**: `909-timewindow-preview`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Wykorzystując powyższe podsumowanie i artefakty z assessments opracuj specyfikację" — based on the assessment pipeline artifacts for the `timewindow-preview` idea: a card-level feature to temporarily shift the configured time window forward/backward to inspect past periods, without modifying the card configuration.

## Overview

The card always displays its configured time window anchored to "now". A user who wants to see what a previous month or year looked like today has to either (a) edit the card's persisted configuration — a change that is saved, affects every viewer of the dashboard, and must be manually reverted — or (b) leave the card for the less visual Home Assistant statistics page. Both are disproportionately expensive for a frequent, quick "look back" check.

This feature adds a **transient time-window preview**: a pair of in-card controls that let the user step the displayed window backward (and forward, back toward the default) by one nominal window width at a time. The shift is purely temporary — it never touches the saved configuration, it is clearly indicated as a preview, and it is discarded whenever the card is re-instantiated: switching dashboards, switching views, or reloading the page all return the card to the configured default. While a preview is active, a reset control appears, letting the user return to the configured default (the current series) in a single activation. While a preview is active, the chart shows only the shifted historical series — the shifted current period and, when the card has a reference window, the shifted reference period — both drawn in gray tones (the shifted current in light gray, the shifted reference in a darker gray) — and hides the live current and reference series, so it is unmistakable that the user is looking at historical data rather than the live current period. In this iteration the preview shift is isolated to the chart's series display: all other panels and information on the card continue to reflect the default configuration and the current data series, unchanged.

Window-size changes (e.g., switching a month window to a year window) are explicitly out of scope for this iteration.

## Clarifications

### Session 2026-11-05

- Q: For a card displaying multiple windows (count > 1), which window does the single preview series represent? (FR-018, US3) → A: The preview series is the shifted **current (first) window** — the period the user is stepping through — drawn with the card's existing **reference-series styling** so it reads as historical data. *(Superseded by the later Q in this session: the preview shows two shifted series — current in light gray, reference in a darker gray.)*
- Q: In preview mode, do the card's period label and the chart's X-axis reflect the shifted period, or stay on the current period? (FR-021, US2) → A: The period label and X-axis reflect the **shifted** period (consistent with the drawn series); "unchanged" in FR-021 means the formatting/style is unchanged, not that the dates are frozen.
- Q: When the shifted period has no data (no-data state), do the preview controls (back/forward/reset) and the preview indication remain visible and functional, or does the card show the standard no-data state "as-is" (without controls)? (FR-013, US6) → A: In preview the controls and the indication remain visible and functional in the no-data state; the no-data indication is shown, but the user can keep stepping forward or reset. Rationale: data can be seasonal (e.g., heating electricity use only in winter months), so the user must be able to step the window through multi-month data-less gaps.
- Q: In preview mode, which series does the chart show, and in what colors? (FR-018, US3) → A: The chart shows two shifted series — the shifted current (first) window and the shifted reference (second) window — both in gray tones: the shifted current in light gray (MUST NOT use the current series' color, to avoid association with the live period) and the shifted reference in a darker gray. Colors use the card's existing color tokens (HA theme tokens) for consistency with the card's styling and HA color standards.
- Q: When the card has no reference window (a single-window configuration), what does the chart show in preview? (FR-018, US3) → A: A single series — the shifted current (first) window in light gray (the same light gray as the shifted current in the two-window case); no reference series is drawn because there is no reference window to shift. Consistent with the card's existing single-window behavior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Step through past periods without touching the config (Priority: P1)

As a user of the card, I want to step the displayed period backward one window at a time (and forward again) so I can quickly see what the previous month, the one before, and so on looked like — without editing the card's configuration or leaving the card.

**Why this priority**: This is the core value of the feature. Without it, the "quick look back" requires a persisted config change or a context switch, which is the exact friction the feature removes.

**Independent Test**: On a card configured with a one-month window, activate the backward control once and confirm the chart now shows the previous month's data; activate it again and confirm it shows the month before that. Confirm the card's saved configuration is unchanged. This delivers the full core value on its own.

**Acceptance Scenarios**:

1. **Given** a card configured with a one-month window showing the current month, **When** the user activates the backward control once, **Then** the chart displays the previous calendar month's data and the window's width, aggregation, and other settings are unchanged.
2. **Given** the card is showing the previous month (one step back), **When** the user activates the backward control again, **Then** the chart displays the month before that.
3. **Given** the card is showing a shifted (earlier) period, **When** the user activates the forward control, **Then** the chart steps one window width later, back toward the configured default.
4. **Given** the card is at the configured default (no shift), **When** the user attempts to activate the forward control, **Then** the chart does not move into a period later than the configured default.
5. **Given** the user has stepped back several periods, **When** the user checks the card's saved configuration, **Then** it is identical to before the preview was used.
6. **Given** a card configured with a day-based window (e.g., 45 days), **When** the user activates the backward control once, **Then** the chart displays the period exactly 45 days earlier — no calendar-month snapping — and the window's width is unchanged.
7. **Given** a card configured with a one-year window, **When** the user activates the backward control once, **Then** the chart displays the previous calendar year.
8. **Given** a card configured with any other supported window width (week, hour, minute, second), **When** the user activates the backward control once, **Then** the chart displays the period shifted by exactly one nominal width, following the same window arithmetic the card already uses for that width.

---

### User Story 2 — Know at a glance that the chart is a preview (Priority: P1)

As a user, I need to be able to tell immediately that the chart is showing a shifted period rather than the card's configured default, so I am never in doubt about what I'm looking at.

**Why this priority**: A preview that looks identical to the default is misleading — the user might mistake a shifted period for the configured one. Clear indication is essential for the feature to be trustworthy.

**Independent Test**: Step the card back one period and confirm a clear indication appears showing the chart is in preview mode (and reflects the shifted period). Return to the default and confirm the indication is gone.

**Acceptance Scenarios**:

1. **Given** the card is at the configured default, **When** the user steps back one period, **Then** a clear indication appears showing the chart is displaying a shifted (preview) period.
2. **Given** the card is showing a shifted period, **When** the user steps forward back to the configured default, **Then** the preview indication is removed and the chart presents the configured default.
3. **Given** the card is showing a shifted period, **When** the user views the indication, **Then** it conveys which period is being shown, consistent with the period label the card already displays.

---

### User Story 3 — See only the historical series while previewing (Priority: P1)

As a user inspecting a past period, I want the chart to show only the historical (shifted) series — the shifted current period and the shifted reference period, both in gray tones — and to hide the live current and reference series, so it is unmistakable that I am looking at historical data rather than the live current period.

**Why this priority**: Hiding the live series and drawing the shifted series in gray tones is the clearest visual signal that the chart is in preview mode. Without it, a shifted series could be mistaken for the live current data. It is P1 because it is central to the "this is a preview" communication, alongside the text indication in Story 2.

**Independent Test**: Step the card back one period and confirm the chart shows two series (the shifted current period in light gray and the shifted reference period in a darker gray) and that the live current and reference series are not drawn. Return to the default and confirm the live series reappear.

**Acceptance Scenarios**:

1. **Given** the card is at the configured default, **When** the user steps back one period, **Then** the chart shows only the shifted historical series — the shifted current period (light gray) and the shifted reference period (darker gray) — and the live current and reference series are not shown.
2. **Given** the card is showing a shifted period and has a reference window, **When** the user views the chart, **Then** exactly two series are drawn (the shifted current period in light gray and the shifted reference period in a darker gray), styled consistently with the card's color tokens; the shifted current series does not use the current series' color.
3. **Given** the card is showing a shifted period, **When** the user returns to the configured default, **Then** the live current and reference series are shown again and the chart returns to its normal presentation.
4. **Given** the card is showing a shifted period (live series hidden), **When** the user views the rest of the card, **Then** all other panels and information (e.g., the summary, the delta/interpretation readout) remain visible and unchanged, still reflecting the default configuration and the current data series; the chart's period label, X-axis, and legend reflect the shifted series being drawn.
5. **Given** the card is configured with a single window (no reference window) and is showing a shifted period, **When** the user views the chart, **Then** a single series is drawn — the shifted current period in light gray — and no reference series is drawn; the live current series is not shown.

---

### User Story 4 — The preview is always temporary (Priority: P1)

As a user, I need the preview to be unmistakably temporary: whenever I switch dashboards, switch views, or reload the page, the card returns to the view defined by its configuration. I must never come back to a card that silently shows a shifted period I had set up earlier.

**Why this priority**: This is the core "transient" contract that distinguishes the preview from a persisted configuration change. If the preview leaked across navigation, the feature would mislead the user about what the card is configured to show.

**Independent Test**: Step the card back two periods, switch to a different dashboard and back, and confirm the card shows the configured default. Repeat with a view switch within the same dashboard and with a full page reload.

**Acceptance Scenarios**:

1. **Given** the card is showing a shifted period, **When** the user switches to a different dashboard and then returns, **Then** the card shows the configured default and the preview indication is gone.
2. **Given** the card is showing a shifted period, **When** the user switches to a different view within the same dashboard and then returns, **Then** the card shows the configured default and the preview indication is gone.
3. **Given** the card is showing a shifted period, **When** the user reloads the browser page, **Then** the card shows the configured default and the preview indication is gone.
4. **Given** two different cards on the same dashboard, **When** the user shifts one card's preview, **Then** the other card's preview is unaffected.

---

### User Story 5 — Return to the current series in one click (Priority: P2)

As a user who has stepped back several periods, I want a control that takes me straight back to the card's configured default (the current series), so I don't have to tap the forward control repeatedly to get back.

**Why this priority**: It is a convenience on top of the core stepping (Story 1) — the user can always step forward manually — but it makes the preview easier to use and reinforces that the configured default is the "home" position.

**Independent Test**: Step the card back two periods, confirm a reset control is visible, activate it, and confirm the chart immediately shows the configured default and the reset control disappears.

**Acceptance Scenarios**:

1. **Given** the card is showing a shifted period, **When** the user views the card, **Then** a reset control is visible alongside the forward/backward controls.
2. **Given** the card is showing a shifted period, **When** the user activates the reset control, **Then** the chart immediately shows the configured default (the current series) and the preview indication is removed.
3. **Given** the card is at the configured default, **When** the user views the card, **Then** the reset control is not shown.

---

### User Story 6 — Handle periods with no or partial data gracefully (Priority: P3)

As a user, when I step into a period that has no recorded data (because I shift back further than my data goes), I want the card to behave the same way it does today for any missing data — not crash or show something misleading.

**Why this priority**: This is a correctness/robustness concern that reuses existing behavior. It is P3 because it only manifests when the user shifts beyond the available data, and it relies on behavior the card already has.

**Independent Test**: On a card with a limited history, step back until the shifted period has no data and confirm the card shows its standard no-data state. Step to a period with only partial data and confirm it is handled by the existing partial-data behavior.

**Acceptance Scenarios**:

1. **Given** the user steps back into a period with no recorded data, **When** the card renders, **Then** it shows the card's standard no-data indication, and the preview controls (back/forward/reset) and the preview indication remain visible and functional so the user can continue stepping or reset.
2. **Given** the user steps into a period with only partial data, **When** the card renders, **Then** it is handled by the card's existing partial-data behavior.
3. **Given** the user's data has seasonal gaps (e.g., heating electricity use only in winter months), **When** the user steps back through the gap one window at a time, **Then** each data-less period shows the no-data indication with the preview controls still available, and the chart shows data again once the stepped period has data.

---

### Edge Cases

- **Shifting forward past the default**: The forward control is bounded at the configured default — the user cannot step into a period later than "now". At the default, the forward control has no effect.
- **Shifting back beyond available data**: There is no lower bound; the user can keep stepping back. When the shifted period has no data, the standard no-data indication is shown; in preview the preview controls remain available in that state, so the user can step through data-less periods (e.g., seasonal gaps) and back.
- **All supported widths**: The preview works for every window width the card supports (year, month, week, day, hour, minute, second). For calendar-based widths (year, month, week), one step moves by one calendar year / month / week (respecting month-length and end-of-month behavior); for day, hour, minute, and second widths, one step moves by the exact number of that unit. In all cases the arithmetic is the same the card already uses to compute windows.
- **Multiple windows displayed**: When the card displays more than one window (a count greater than one), the entire window set shifts together by one nominal width. In preview, the shifted current (first) window (light gray) and the shifted reference (second) window (darker gray) are drawn; the other shifted windows are not drawn.
- **Single window (no reference)**: When the card is configured with a single window (no reference window), the preview draws a single series — the shifted current (first) window in light gray — and no reference series; the live current series is hidden. This mirrors the card's existing single-window behavior, where reference-only UI is hidden.
- **A configured offset already present**: If the card's configuration already includes a time-window offset, the preview shift is applied on top of the already-resolved windows.
- **Multiple cards on one dashboard**: Each card keeps its own independent preview state.
- **A custom (non-preset) window**: The preview works the same way for custom windows as for presets, using the window's nominal width.
- **Reset control visibility**: The reset control is shown only while the preview is active; it disappears as soon as the card is at the configured default — whether by stepping forward, by the reset control, or by navigation.
- **Two windows in preview**: While the preview is active on a card with a reference window, only the shifted historical series are drawn — the shifted current (first) window in light gray and the shifted reference (second) window in a darker gray — and the live current and reference series are hidden; returning to the default restores the normal presentation. The chart's period label, X-axis, and legend follow the shifted series (formatting and style unchanged); all other panels and information on the card are unaffected by the preview shift and continue to reflect the default configuration and the current data series.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The card MUST provide a control that, on each activation, shifts the displayed time window backward by one nominal window width.
- **FR-002**: The card MUST provide a control that, on each activation, shifts the displayed time window forward by one nominal window width.
- **FR-003**: The forward shift MUST be bounded at the configured default position; the user MUST NOT be able to shift into a period later than the configured default.
- **FR-004**: The backward shift MUST have no lower bound; the user MUST be able to shift back repeatedly, with the standard no-data state shown when the shifted period has no data.
- **FR-005**: A shift MUST move the entire resolved window set by the window's nominal width, preserving the window's duration, step, count, anchor, and aggregation.
- **FR-006**: A shift MUST follow the same window arithmetic the card already uses for the configured width: calendar-aware for calendar-based widths (year, month, week) and exact for day, hour, minute, and second widths. The preview MUST work for every window width the card supports, with no width-specific special-casing.
- **FR-007**: A shift MUST NOT modify or persist the card's configuration.
- **FR-008**: The preview state MUST be discarded whenever the card is re-instantiated — including when switching dashboards, switching views within a dashboard, or reloading the page — and the card MUST return to the configured default.
- **FR-009**: While the card is in a shifted (preview) state, the card MUST display a reset control that, on a single activation, returns the display to the configured default (the current series).
- **FR-010**: While the card is at the configured default (no shift), the reset control MUST NOT be shown.
- **FR-011**: While the card is in a shifted (preview) state, the card MUST display a clear indication that the chart is showing a shifted period rather than the configured default.
- **FR-012**: While the card is at the configured default (no shift), the preview indication MUST NOT be shown.
- **FR-013**: A shifted period with no data MUST render the card's standard no-data indication, identical to the existing missing-data handling. While the preview is active, the preview controls and the preview indication MUST remain visible and functional in the no-data state, so the user can step forward, step further back, or reset without leaving the preview.
- **FR-014**: A shifted period with partial data MUST be handled by the card's existing partial-data behavior.
- **FR-015**: The preview MUST work uniformly across all comparison presets, including the legacy preset mechanism, with no special-casing.
- **FR-016**: Each card instance MUST maintain its own independent preview state; distinct cards on the same dashboard MUST NOT share preview state.
- **FR-017**: The shift and reset controls MUST be operable by keyboard and carry appropriate accessible labels, in line with the project's accessibility requirements.
- **FR-018**: While the card is in a shifted (preview) state, the chart MUST show only the shifted historical series — the data of the shifted current (first) window and the shifted reference (second) window — both drawn in gray tones: the shifted current in light gray and the shifted reference in a darker gray. When the card has no reference window (a single-window configuration), the chart MUST show only the shifted current (first) window in light gray; no reference series is drawn. The shifted current series MUST NOT use the current series' color (to avoid association with the live current period). Colors MUST use the card's existing color tokens (HA theme tokens) for consistency with the card's styling and HA color standards.
- **FR-019**: While the card is in a shifted (preview) state, the live current and reference series MUST NOT be shown.
- **FR-020**: When the card returns to the configured default, the live current and reference series MUST be shown again and the chart MUST return to its normal presentation.
- **FR-021**: While the card is in a shifted (preview) state, all other panels and information on the card (e.g., the summary, the delta/interpretation readout, the narrative) MUST remain visible and unchanged, continuing to reflect the default configuration and the current data series. The chart's period label, X-axis, and legend MUST reflect the shifted series that are being drawn, with the existing formatting and style unchanged. (In this iteration the preview shift does not recompute analytical data; a future iteration may extend the preview to do so.)

### Key Entities

- **Preview Shift State**: The transient, per-card state representing how many nominal window widths the display is shifted from the configured default (a signed offset: negative for earlier periods, zero for the default). It is scoped to a specific card instance, is not persisted, and is discarded whenever the card is re-instantiated (view switch, dashboard switch, page reload).
- **Resolved Time Window Set**: The set of time windows the card currently displays, derived from the configured window (including any configured offset) plus the preview shift. (Existing concept; the preview shift is a runtime input to it.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can inspect the previous period with a single interaction (one activation of the backward control), without editing the card configuration or leaving the card.
- **SC-002**: After using the preview any number of times and performing a full view/page reload, the card's configuration is unchanged and the chart displays the configured default.
- **SC-003**: A user can determine at a glance, without reading fine print, that the chart is showing a shifted period rather than the configured default.
- **SC-004**: After switching dashboards, switching views, or reloading the page, the card displays the configured default — the preview is never retained across navigation.
- **SC-005**: A shifted period with no data displays the same no-data indication the card uses today for missing data.
- **SC-006**: While in a preview, a user can return to the configured default (the current series) with a single interaction.
- **SC-007**: While in a preview, the chart shows only the shifted historical series (in gray tones), making it unmistakable that the user is viewing historical data rather than the live current period.

## Assumptions

- The preview state is tied to the card instance's lifetime: it is not persisted and is not retained across navigation that re-instantiates the card (view switch, dashboard switch, page reload).
- The forward direction is bounded at the configured default; the feature is for inspecting past periods, so shifting into a period later than "now" is not supported.
- The preview shift is applied on top of the card's already-resolved windows, including any configured time-window offset.
- When the card displays multiple windows, the whole window set shifts together by one nominal width.
- The interim control form (two arrow controls plus a reset control in the top-right corner of the chart) and a minimal text-based preview indication are acceptable for this iteration; a refined visual design is expected to follow and is out of scope here.
- In preview, the shifted historical series are drawn in gray tones using the card's existing color tokens (HA theme tokens): the shifted current in light gray and the shifted reference in a darker gray. The shifted current series does not use the current series' color. The exact token mapping follows the card's existing styling and HA color standards.
- In this iteration the preview shift is isolated to the chart's series display: it does not recompute the card's analytical data (summary, delta/interpretation, narrative), which continue to reflect the default configuration and the current data series. Extending the preview to recompute analytical data is a possible future iteration.
- The card's existing no-data and partial-data behaviors are unchanged and are sufficient for shifted periods; in preview the no-data indication is shown while the preview controls remain available (see Clarifications).
- The feature is available to all users of the card (no gating or opt-in); it is a normal part of the card's view-mode UI.
