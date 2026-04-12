# Feature Specification: Card UI Enhancements

**Feature Branch**: `001-card-ui-enhancements`  
**Created**: 2026-03-17  
**Status**: Draft  
**Input**: User description: "Card UI enhancements: title header, pictogram, +/- difference sign, remove duplicate historical value, add time period labels to stats"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Card Title Header (Priority: P1)

A user viewing the energy card wants to immediately understand what entity or data source the card represents. The card displays a title at the top. If the user has not configured a custom title, the card automatically uses the entity's friendly name (or the entity ID if no friendly name is available). The user can also disable the title entirely via a configuration flag.

**Why this priority**: The title is the most fundamental orientation element — without it, users cannot distinguish cards monitoring different entities in a multi-card dashboard. It is the highest-impact change and has zero dependency on other stories.

**Independent Test**: Can be fully tested by rendering the card with various configuration combinations (no title config, custom title string, title disabled) and verifying what text appears at the top of the card.

**Acceptance Scenarios**:

1. **Given** a card with no `title` configured, **When** the card renders, **Then** it displays the entity's friendly name as the title (or the entity ID if no friendly name exists).
2. **Given** a card with `title: "My Solar"` configured, **When** the card renders, **Then** it displays "My Solar" as the title regardless of the entity's friendly name.
3. **Given** a card with `show_title: false` configured, **When** the card renders, **Then** no title element is visible on the card.
4. **Given** a card with `title: ""` (empty string) configured, **When** the card renders, **Then** the card falls back to the entity's friendly name (empty title is treated as unconfigured).

---

### User Story 2 - Card Pictogram (Priority: P2)

A user viewing the energy card wants to see a recognizable icon next to the title to quickly identify the type of data being shown. The card displays an icon to the left of the title text. If no icon is configured, it automatically uses the icon defined on the monitored entity. The user can also disable the icon entirely via a configuration flag.

**Why this priority**: The icon reinforces the card's identity and aligns with Home Assistant's standard card visual language. It depends on having a title area (P1), but is independently testable and adds clear visual value.

**Independent Test**: Can be fully tested by rendering the card with various icon configuration combinations (no icon config, custom icon string from HA icon collection, icon disabled) and verifying what icon appears next to the title.

**Acceptance Scenarios**:

1. **Given** a card with no `icon` configured, **When** the card renders, **Then** it displays the icon defined on the monitored entity next to the title.
2. **Given** a card with `icon: "mdi:flash"` configured, **When** the card renders, **Then** it displays the `mdi:flash` icon next to the title.
3. **Given** a card with `show_icon: false` configured, **When** the card renders, **Then** no icon element is visible on the card.
4. **Given** a card where the entity has no icon defined and no `icon` is configured, **When** the card renders, **Then** no icon is shown (icon area is omitted gracefully).

---

### User Story 3 - Explicit +/- Sign on Difference Values (Priority: P3)

A user reading the energy statistics wants to know at a glance whether their current consumption is higher or lower than the reference period — without needing to compare numbers mentally. Both the absolute difference (Wh) and the percentage difference always display an explicit `+` or `−` sign prefix, making the direction of the comparison immediately obvious.

**Why this priority**: This is a data clarity fix that makes existing statistics unambiguous. It is the simplest change (display formatting only) and independently testable without affecting other stories.

**Independent Test**: Can be fully tested by rendering the card when consumption is higher than reference, lower than reference, and equal, then verifying the sign prefix on both the Wh and % difference values.

**Acceptance Scenarios**:

1. **Given** current consumption is higher than reference period, **When** the difference statistics are displayed, **Then** both the Wh difference and % difference show a `+` prefix (e.g., `+12.5 kWh`, `+8.3 %`).
2. **Given** current consumption is lower than reference period, **When** the difference statistics are displayed, **Then** both the Wh difference and % difference show a `−` prefix (e.g., `−12.5 kWh`, `−8.3 %`).
3. **Given** current consumption equals the reference period exactly, **When** the difference statistics are displayed, **Then** the value is shown without a sign prefix (e.g., `0 kWh`, `0 %`).

---

### User Story 4 - Remove Duplicate "Historical Value" Statistic (Priority: P4)

A user reviewing the forecast section of the card notices two statistics labelled differently but showing the identical numeric value: "Consumption in reference period" and "Historical value". This duplication is confusing. The "Historical value" row is removed; only "Consumption in reference period" is retained. The removal is reflected in translation files, tests, and documentation.

**Why this priority**: This is a de-duplication bug fix. It removes existing misleading content and simplifies the interface. It has no visual dependencies on other stories.

**Independent Test**: Can be fully tested by enabling the forecast feature and verifying that only "Consumption in reference period" is shown, and "Historical value" does not appear anywhere in the forecast section.

**Acceptance Scenarios**:

1. **Given** the forecast section is visible and reference data is available, **When** the forecast statistics render, **Then** "Historical value" is not present in the list.
2. **Given** the forecast section is visible and reference data is available, **When** the forecast statistics render, **Then** "Consumption in reference period" is present and shows the correct reference total value.
3. **Given** the translation files for all supported languages, **When** they are inspected, **Then** the `forecast.historical_value` translation key no longer exists.

---

### User Story 5 - Time Period Context in Statistic Labels (Priority: P5)

A user reading the summary statistics ("Current period", "Reference period") on the card cannot tell which specific year or month the statistics correspond to without cross-referencing external information. Each period label is enriched with a parenthetical **compact** date qualifier derived from the resolved time window in **Home Assistant’s time zone** (see `formatCompactPeriodCaption` in `src/card/labels/compact-period-caption.ts`): abbreviated month names, compressed ranges (e.g. full calendar month → `Mar 2026`), and year disambiguation when the paired reference/current window falls in a different calendar year. Examples for typical presets:

- Year-over-year, full reference calendar year: `Reference period (2025)`; **current** caption uses the **nominal calendar year** `2026` when the preset ends the LTS window at “now” (`expandCurrentWindowForCaption` + `currentEndIsNow`), not a day-range to today.
- Month-over-year, full calendar month: `Current period (Mar 2026)`, `Reference period (Mar 2025)` (locale-specific short month) — same nominal-month rule for the current side when data are month-to-date.

Clock times in hourly windows respect HA `locale.time_format` when present (`12` / `24` / `language`). Qualifiers still follow the card label locale (`language` YAML → `hass.locale.language` → `en`).

**Why this priority**: This is a readability enhancement that requires knowledge of the time window currently in view. It is independently implementable and testable but relies on the existing comparison period logic.

**Independent Test**: Can be fully tested by rendering the card in both `year_over_year` and `month_over_year` modes and verifying the parenthetical date suffix on both current and reference period labels.

**Acceptance Scenarios**:

1. **Given** the card is in `year_over_year` mode for 2026, **When** the summary statistics render, **Then** parenthetical qualifiers include the correct calendar years for current vs reference (e.g. `2026` and `2025` where the windows are full calendar years or year-to-date as resolved).
2. **Given** the card is in `month_over_year` mode for March 2026, **When** the summary statistics render, **Then** qualifiers include the correct short month and year for each window (e.g. English `Mar 2026` / `Mar 2025`).
3. **Given** the card's locale is set to Polish, **When** the month name is displayed, **Then** the month uses Polish abbreviations from Luxon/ICU for that locale (e.g. `mar` / `mar.` variants — exact glyph depends on environment).
4. **Given** `period_offset` is set to `-2` (comparing against two years ago), **When** the summary statistics render, **Then** the years in the qualifiers correctly reflect the offset (e.g. reference year two years below current).

---

### Edge Cases

- What happens when the entity referenced in the card config no longer exists in Home Assistant? The card must handle missing entity state gracefully — default title falls back to the entity ID string; default icon is omitted.
- What happens when the entity has a friendly name that is an empty string? Treat as no friendly name — fall back to entity ID.
- What happens if `show_title: false` and `show_icon: false` are both set? Both the title and icon are hidden; the header area is omitted entirely.
- What if the difference value is exactly `0`? No sign prefix should be shown; display as `0 kWh` / `0 %`.
- What if `period_offset` is a large negative number (e.g., `-5`)? The period labels must still compute and display the correct years/months.
- What if the translation for a month name is missing? Fall back to the locale-formatted month name from the browser/system, then to the English month name.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The card MUST display a title at the top of the card header area.
- **FR-002**: When no `title` is configured (or `title` is an empty string), the card MUST use the entity's friendly name as the title; if the entity has no friendly name, the entity ID MUST be used.
- **FR-003**: When `title` is configured with a non-empty string, the card MUST display exactly that string as the title.
- **FR-004**: The card configuration MUST support a `show_title` boolean flag; when set to `false`, no title element is rendered.
- **FR-005**: The card MUST display a pictogram (icon) to the left of the title in the card header area.
- **FR-006**: When no `icon` is configured, the card MUST use the icon attribute defined on the monitored entity; if the entity has no icon, no icon element is rendered.
- **FR-007**: When `icon` is configured with a valid Home Assistant icon identifier, the card MUST display that icon.
- **FR-008**: The card configuration MUST support a `show_icon` boolean flag; when set to `false`, no icon element is rendered.
- **FR-009**: When both `show_title: false` and `show_icon: false` are set, the entire header area (title + icon container) MUST be omitted from the rendered card.
- **FR-010**: The absolute difference value (e.g., in Wh/kWh) MUST always display an explicit `+` prefix when positive and a `−` prefix when negative; zero values MUST be displayed without any sign prefix.
- **FR-011**: The percentage difference value MUST always display an explicit `+` prefix when positive and a `−` prefix when negative; zero values MUST be displayed without any sign prefix.
- **FR-012**: The `Historical value` row MUST be removed from the forecast statistics section.
- **FR-013**: The `Consumption in reference period` row MUST remain in the forecast statistics section and continue to display the reference total value.
- **FR-014**: The `forecast.historical_value` translation key MUST be removed from all translation files (all supported languages).
- **FR-015**: In `year_over_year` comparison mode, the "Current period" and "Reference period" summary labels MUST include a parenthetical qualifier that unambiguously identifies the resolved window (typically the calendar year or a compact in-year range); MUST NOT use browser-local `Date.getFullYear()` alone without HA time zone — computation uses `ResolvedWindow` bounds and `ComparisonPeriod.time_zone` / `hass.config.time_zone`.
- **FR-016**: In `month_over_year` (and analogous month-scoped) modes, qualifiers MUST include the correct month and year using **short** month forms (`LLL` / ICU abbreviated month) unless the window compresses to a full calendar month or year per compact rules.
- **FR-017**: Period qualifier formatting MUST follow the card’s label locale and HA time zone; optional HA `locale.time_format` applies to clock portions of hourly-window qualifiers.
- **FR-018**: The period qualifier MUST correctly reflect the `period_offset` configuration value (shifted reference window).

### Key Entities

- **CardConfig**: The user-defined configuration object for the card. Gains optional fields: `show_title` (boolean), `icon` (string), `show_icon` (boolean). Existing `title` field behaviour is clarified: empty string treated as absent.
- **SummaryStats / ComparisonSeries**: Existing data structures — no structural changes needed; qualifiers are derived from `resolvedWindows` (or `ComparisonPeriod` fallback) plus HA time zone (`formatCompactPeriodCaption`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every card on a dashboard displays a meaningful title without any additional manual configuration by the user.
- **SC-002**: Users can identify the entity and its icon at a glance for 100% of rendered cards that have entities with defined friendly names and icons.
- **SC-003**: Zero ambiguity in difference values — all difference statistics include a visible directional sign; user testing confirms instant comprehension without comparing raw numbers.
- **SC-004**: The forecast section contains exactly one reference-period statistic row (no duplicates), eliminating all user confusion caused by the repeated value.
- **SC-005**: Every summary statistic label on the card explicitly communicates its time window; users do not need to consult external sources to determine which year or month a value belongs to.
- **SC-006**: All existing automated tests continue to pass after the removal of `Historical value`; no test references the removed translation key or the removed DOM element.

## Assumptions

- The friendly name and icon for an entity are retrievable from the Home Assistant `hass` object (states registry) at card render time — no additional API calls are required.
- "Home Assistant icon collection" refers to the Material Design Icons (MDI) set (`mdi:*`) used natively by Home Assistant.
- The `period_offset` configuration already correctly shifts the reference period start/end dates; the label computation reuses the already-computed period dates.
- Locale for month name formatting is determined by the same mechanism already used for number formatting in the card (existing `language` / `number_format` config fields).
- "Removing `Historical value`" applies to the rendered card and translation files; no database or API schema is affected.
- The `−` sign used for negative differences is the minus sign character (U+2212) or a regular hyphen-minus (`-`) — the choice follows the existing formatting conventions already used in the project.
