# Feature Specification: Card Picker Preview

**Feature Branch**: `910-card-picker-preview`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description (Polish): "Kiedy dodaję kartę Energy Horizon do dashboardu w HA: 1) poprzez wybór encji, kiedy zaznaczę encję w obsługiwanych jednostkach przez kartę, karta Energy Horizon nie pojawia się w proponowanych kartach. Pożądane zachowanie: karta EH wyświetla się pokazując przykładową konfigurację dla zaznaczonej encji – o ile encja jest w jednostkach obsługiwanych przez kartę. 2) kiedy dodaję poprzez wybór karty, w galerii dostępnych kart karta Energy Horizon wyświetla się w formie informacji 'There is no data to display for the selected period' co uniemożliwia użytkownikowi wizualne rozpoznanie karty. Pożądane zachowanie: podczas wyboru karty EH poprzez wybór karty, karta wyświetla się z przykładową konfiguracją – schemat generowania podglądu zgodny ze standardami HA – jeśli takiego schematu brakuje przykładowe propozycje rozwiązań a) wyświetlić przykładową zgodną encję użytkownika w przykładowej konfiguracji karty lub b) jeśli brakuje takiej encji lub z innych powodów jest to nieoptymalne wyświetlić przykładową fikcyjną serię danych, która umożliwi wyświetlenie karty w swoim standardowym wyglądzie i ze standardowymi informacjami, co umożliwi użytkownikowi ocenę przydatności karty do jego scenariusza."

## Overview

When a user adds a card to a dashboard, Home Assistant offers two entry points: selecting an entity first (the card picker then suggests the cards that support that entity) or browsing the gallery of available cards. Today, Energy Horizon fails at both entry points:

1. **Entity picker**: even when the user selects an entity whose unit of measurement is in the card's supported units, the card does not appear in the suggested cards list at all — the user cannot discover the card from the entity.
2. **Card gallery**: the card appears, but its preview renders the no-data message ("There is no data to display for the selected period") instead of a chart — the user cannot visually recognize what the card looks like or what it does, and cannot judge its usefulness for their scenario.

This feature makes the card discoverable and recognizable in both entry points: the card is suggested for every entity with a supported unit (and only for those), and in both entry points the card's preview renders a sample configuration in the card's standard appearance — a chart with a current and a reference series plus the card's standard panels — so the user can evaluate the card before adding it.

The two entry points behave differently with respect to preview content:

- **"By entity" view**: the user selects an entity first; the picker then lists the cards that support that entity. When no entity is selected, the gallery is empty (there is nothing to preview). When an entity with a supported unit is selected, the card is suggested and its preview uses that entity's data (with the demo-series fallback if the query fails or times out).
- **"By card" view**: the user browses the gallery of available cards without selecting an entity. The card's preview searches for a suitable user entity with data and uses it; when no such entity exists (or the query fails or times out), the preview falls back to a fictional demo data series.

The preview follows the standard Home Assistant card preview scheme (a sample configuration rendered by the picker). For the preview content, the card prefers a real, suitable user entity with data, fetched via a data query with a short time limit; when no such entity exists, the query fails or times out, or using it is not optimal, the preview falls back to a fictional demo data series that renders the card in its standard appearance with standard information.

The preview is strictly a preview: it is never persisted as the card's configuration, it never blocks on data (any data query is subject to a short time limit with a demo-series fallback), and it does not affect other cards or the dashboard.

## Clarifications

### Session 2026-11-13

- Q: May the card preview in the picker send a data query (the same one the card uses in normal operation), with a time limit and automatic fallback to the fictional demo series on failure — or must the preview never send a query and always render the demo series? (FR-007, FR-008, FR-011) → A: The preview sends a data query with a short time limit; on error or timeout it falls back to the demo series (in both entry points: entity picker and gallery).
- Q: In the card gallery (no entity selected), should the preview search for a suitable user entity with data and use it, or always render the fictional demo series? (FR-007, FR-008) → A: The gallery ("By card" view) searches for a suitable user entity with data and uses it; when no such entity exists, it falls back to the demo series. Note: in the "By entity" view, when no entity is selected, the gallery is empty — the entity-search / demo mechanism only applies once the user is in the "By card" view.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Discover the card from an entity (Priority: P1)

As a user adding a card by selecting an entity, I want the Energy Horizon card to appear in the suggested cards when I select an entity whose unit is supported by the card, with a sample configuration for that entity, so I can discover the card and see how it would look with my own data.

**Why this priority**: This is the primary discovery path for a data card — users start from the entity they want to visualize. If the card is not suggested, it is effectively invisible to this path.

**Independent Test**: In the card picker, select an entity with a supported unit (e.g., a kWh energy sensor) and confirm the Energy Horizon card appears in the suggested cards, rendered with a sample configuration referencing that entity. Select an entity with an unsupported unit and confirm the card is not suggested.

**Acceptance Scenarios**:

1. **Given** the card picker with entity selection, **When** the user selects an entity whose unit of measurement is in the card's supported units, **Then** the Energy Horizon card appears in the suggested cards list.
2. **Given** the Energy Horizon card is suggested for a selected entity, **When** the user views its preview, **Then** the preview shows a sample configuration referencing the selected entity, rendered in the card's standard appearance.
3. **Given** the card picker with entity selection, **When** the user selects an entity whose unit of measurement is not in the card's supported units, **Then** the Energy Horizon card does not appear in the suggested cards list.
4. **Given** the user selects the Energy Horizon card from the suggested list for an entity, **When** the card is added to the dashboard, **Then** the card's configuration starts from the selected entity (the normal configuration flow), not from the preview's sample content.

---

### User Story 2 — Recognize the card in the card gallery (Priority: P1)

As a user browsing the gallery of available cards (the "By card" view), I want the Energy Horizon card's preview to show the card in its standard appearance (a chart with a current and a reference series and the standard panels) instead of a no-data message, so I can visually recognize the card and judge its usefulness for my scenario.

**Why this priority**: A preview that shows only an error-like message makes the card indistinguishable from a broken card; the user cannot evaluate it. This is the second discovery path and is equally core.

**Independent Test**: Open the card picker in the "By card" view and confirm the Energy Horizon card's preview renders a chart with a current and a reference series in the card's standard appearance — not the no-data message.

**Acceptance Scenarios**:

1. **Given** the card picker in the "By card" view, **When** the user views the Energy Horizon card's preview, **Then** the preview renders the card in its standard appearance (chart with a current and a reference series, standard panels) and does not show the no-data message.
2. **Given** the card picker in the "By card" view, **When** the user compares the Energy Horizon preview with other cards' previews, **Then** the Energy Horizon preview is visually on par with them (a rendered chart, not a placeholder or error message).
3. **Given** the card picker in the "By entity" view with no entity selected, **When** the user views the gallery, **Then** the gallery is empty (no card previews are shown); the Energy Horizon preview mechanism (entity search / demo series) does not apply in this state.
4. **Given** the user adds the Energy Horizon card from the gallery, **When** the card is added to the dashboard, **Then** the card's configuration is the normal starting configuration (the preview's sample content is not persisted).

---

### User Story 3 — Preview content: real data first, fictional fallback (Priority: P2)

As a user evaluating the card, I want the preview to show realistic content: my own data when a suitable entity with data is available, and otherwise a plausible fictional series, so the preview reflects what the card would actually show in my setup.

**Why this priority**: Real data makes the preview more convincing, but the fictional fallback guarantees the preview always works — even in a fresh Home Assistant instance with no energy entities. The fallback is the safety net; the real-data preference is an enhancement on top of it.

**Independent Test**: In an instance with an energy entity that has statistics, confirm the preview uses it (in the entity picker, the selected entity). In an instance without any suitable entity, confirm the preview still renders the standard appearance with a fictional series.

**Acceptance Scenarios**:

1. **Given** the entity picker with a selected entity that has data, **When** the user views the card's preview, **Then** the preview shows the selected entity's data in the card's standard appearance.
2. **Given** the entity picker with a selected entity that has no data (e.g., no statistics yet), **When** the user views the card's preview, **Then** the preview falls back to a fictional demo series and renders the card's standard appearance (no no-data message).
3. **Given** the "By card" view in an instance that has at least one suitable entity with data, **When** the user views the card's preview, **Then** the preview uses that entity's data.
4. **Given** the "By card" view in an instance without any suitable entity with data, **When** the user views the card's preview, **Then** the preview uses a fictional demo series and renders the card's standard appearance.
5. **Given** the fictional demo series, **When** the user views the preview, **Then** the series is plausible (realistic magnitudes and units for the card's domain) and the card shows its standard information (title, period label, comparison summary, etc.).
6. **Given** the data query for real data fails or exceeds its time limit, **When** the user views the preview, **Then** the preview shows the fictional demo series without a loading or error state.

---

### User Story 4 — The preview is fast, safe, and side-effect free (Priority: P3)

As a user browsing the card picker, I want the preview to render quickly and never cause side effects (no persisted configuration, no failed or long-running queries, no interference with other cards), so browsing the picker stays smooth.

**Why this priority**: A preview that is slow, flaky, or leaks state degrades the picker experience for all cards; this is a quality bar on top of the core preview behavior.

**Independent Test**: Open the card picker and confirm the Energy Horizon preview renders quickly (no perceptible waiting), confirm the dashboard's saved configuration is unchanged after browsing, and confirm other cards' previews are unaffected.

**Acceptance Scenarios**:

1. **Given** the card picker, **When** the user opens it, **Then** the Energy Horizon preview renders without perceptible waiting; the data query for real data is subject to a short time limit and never blocks the preview (demo-series fallback on failure or timeout).
2. **Given** the user browses the card picker (with or without selecting the Energy Horizon card), **When** the user closes the picker, **Then** no preview content has been persisted as any card's configuration.
3. **Given** the card picker with many cards, **When** the user scrolls through the gallery, **Then** the Energy Horizon preview does not interfere with other cards' previews or the picker's responsiveness.
4. **Given** the card's preview under both light and dark themes, **When** the user views it, **Then** the preview respects the active theme and the card's localization.

### Edge Cases

- **No supported entities in the instance**: the "By card" view preview still renders the standard appearance using the fictional demo series; the "By entity" view simply never suggests the card (there is no supported entity to select).
- **"By entity" view with no entity selected**: the gallery is empty — no card previews are rendered; the preview mechanism (entity search / demo series) does not apply in this state.
- **Selected entity has no statistics / no data yet**: the entity picker preview falls back to the fictional demo series (the card is still suggested, since the unit is supported).
- **Selected entity has partial data** (e.g., current period has data but the reference period does not): the preview shows what the card would normally render for that entity with default settings (a chart with the available series) — it does not fall back to the demo series, because the card is not in a no-data state.
- **Entity with an unsupported unit**: the card is not suggested in the entity picker; the card gallery preview is unaffected (it does not depend on that entity).
- **Preview re-rendering**: every time the picker is opened, the preview is regenerated fresh; no preview state leaks between picker sessions or into the dashboard.
- **User cancels the picker**: nothing is persisted; the dashboard is unchanged.
- **Real data is slow or unavailable**: the data query is subject to a short time limit; the preview must not block on it and must not show a loading or error state — the fictional demo series is shown instead.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST suggest the Energy Horizon card in the entity picker for every entity whose unit of measurement is in the card's supported units.
- **FR-002**: The system MUST NOT suggest the Energy Horizon card in the entity picker for entities whose unit of measurement is not in the card's supported units.
- **FR-003**: The card's supported units are: `kWh`, `Wh`, `MWh`, `m³`, `l` (the units the card already documents as supported).
- **FR-004**: In the entity picker, the card's preview MUST use a sample configuration that references the selected entity.
- **FR-005**: In the card picker's "By card" view, the card's preview MUST render the card in its standard appearance — a chart with a current and a reference series plus the card's standard panels — and MUST NOT show the no-data message.
- **FR-006**: The preview MUST follow the standard Home Assistant card preview scheme (a sample configuration rendered by the picker), consistent with how other Home Assistant cards provide previews.
- **FR-007**: In the "By entity" view, when an entity with a supported unit is selected, the preview SHOULD use that entity's data, fetched via a data query with a short time limit. In the "By card" view, the preview SHOULD search for a suitable user entity with data and use it, fetched via a data query with a short time limit.
- **FR-008**: When no suitable real entity is available (no entity selected in the "By entity" view; no suitable entity found in the "By card" view), or the data query fails or exceeds its time limit, the preview MUST fall back to a fictional demo data series. In the "By entity" view with no entity selected, the gallery is empty and no preview is rendered.
- **FR-009**: The fictional demo series MUST be plausible for the card's domain (realistic magnitudes and units) and MUST render the card in its standard appearance with its standard information (e.g., title, period label, comparison summary).
- **FR-010**: The preview MUST NOT be persisted as the card's saved configuration; when the user adds the card, the normal configuration flow starts (with the selected entity pre-filled in the entity picker flow).
- **FR-011**: The preview MUST render quickly; the data query used for real data MUST be subject to a short time limit, and on failure or timeout the preview MUST fall back to the demo series (FR-008). The preview MUST NOT show a loading or error state in the picker.
- **FR-012**: The preview MUST respect the active theme (light/dark) and the card's localization.
- **FR-013**: The preview MUST NOT interfere with other cards, the picker, or the dashboard.
- **FR-014**: The preview MUST show a rendered chart (the demo series) as soon as the picker opens, without a blank or loading state; if the real data query succeeds within the time limit, the preview MUST update to show the real data.

### Key Entities

- **Sample preview configuration**: a minimal, valid card configuration used only to render the card's preview in the picker; in the entity picker it references the selected entity; it is never saved.
- **Demo data series**: a fictional, deterministic time series (a current period and a reference period) used to render the preview when real data is unavailable; plausible magnitudes and units for the card's domain.
- **Supported units set**: the set of units of measurement for which the card is suggested in the entity picker (`kWh`, `Wh`, `MWh`, `m³`, `l`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of entities with a supported unit cause the Energy Horizon card to appear in the suggested cards list in the entity picker.
- **SC-002**: 0% of entities with an unsupported unit cause the Energy Horizon card to appear in the suggested cards list.
- **SC-003**: The card's preview renders a recognizable chart (standard appearance, no no-data message) in 100% of picker sessions where a preview is shown (the "By card" view, or the "By entity" view with a supported entity selected), including in a fresh instance with no energy entities.
- **SC-004**: The preview renders without perceptible waiting; a loading or error state is never shown in the picker.
- **SC-005**: A user who has never seen the card can identify its purpose (comparing current vs. reference energy trends) from the gallery preview alone, without reading the description.
- **SC-006**: Browsing the picker (with or without adding the card) results in 0 persisted configuration changes originating from the preview.

## Assumptions

- The card's supported units are exactly the units documented in the project's README (`kWh`, `Wh`, `MWh`, `m³`, `l`); no new units are introduced by this feature.
- The card is already registered with preview enabled in the Home Assistant card registry (the current state); this feature changes what the preview shows and for which entities the card is suggested, not whether it is registered.
- The fictional demo series is deterministic (the same preview content on every render) and uses the card's default comparison preset and interpretation.
- The demo series' unit matches the selected entity's unit in the "By entity" view; in the "By card" view it matches the unit of the found user entity, or a default energy unit when no entity is found.
- The preview is non-interactive: it does not expose the card's interactive features (e.g., the transient time-window preview controls from feature 909).
- "Suitable real entity" means an entity with a supported unit that has data available for the card's default time window; the exact selection heuristic (which entity to pick in the "By card" view) is an implementation detail.
- The "By entity" view with no entity selected shows an empty gallery; the preview mechanism (entity search / demo series) only applies in the "By card" view or when an entity is selected in the "By entity" view.
- The preview content is not localized beyond the card's existing localization (the demo series has no entity name of its own; standard panel labels use the card's existing translations).
- The preview's initial render uses the demo series; when real data becomes available (the query succeeds within the time limit), the preview updates to show the real data. The exact timing of the update is an implementation detail.
