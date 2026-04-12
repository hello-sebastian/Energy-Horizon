# Quickstart: Card UI Enhancements (001-card-ui-enhancements)

## Prerequisites

```bash
npm install
```

## Running Tests

```bash
npm test
```

Runs Vitest in single-pass mode. All unit and integration tests must pass before any PR is merged.

## Running the Dev Build

```bash
npm run dev
```

Starts the Vite dev server. Open `http://localhost:5173` to load the card in the `index.html` test harness.

## Building for Production

```bash
npm run build
```

Outputs `dist/energy-horizon-card.js`. Copy to your HA `www/` directory and register via HACS or manually.

---

## New Configuration Fields (after this feature)

All new fields are **optional**. Existing card configurations continue to work unchanged.

```yaml
type: custom:energy-horizon-card
entity: sensor.energy_today
comparison_mode: year_over_year

# --- NEW: Title & Icon Header ---
show_title: true           # optional; default true. Set false to hide the title entirely.
title: "My Solar Panels"   # optional; if absent or empty, falls back to entity friendly_name,
                           # then to the entity ID.
show_icon: true            # optional; default true. Set false to hide the icon entirely.
icon: mdi:solar-power      # optional; if absent or empty, falls back to the icon defined on
                           # the monitored entity. If neither is defined, no icon is shown.
```

Setting both `show_title: false` and `show_icon: false` omits the entire header row.

---

## Verified Behaviours After Implementation

### 1. Title header (FR-001 – FR-004)

| Config | Rendered title |
|--------|---------------|
| No `title` field | Entity's `friendly_name` (or entity ID if no friendly name) |
| `title: "My Solar"` | `"My Solar"` |
| `title: ""` (empty) | Falls back to entity `friendly_name` / entity ID |
| `show_title: false` | No title rendered |

### 2. Icon (FR-005 – FR-008)

| Config | Rendered icon |
|--------|--------------|
| No `icon` field | Icon from `hass.states[entity].attributes.icon` |
| `icon: "mdi:flash"` | `mdi:flash` (via `<ha-icon>`) |
| `show_icon: false` | No icon rendered |
| No `icon` field AND entity has no icon | No icon element rendered |

### 3. Signed difference values (FR-010 – FR-011)

| Situation | Difference display | Percent display |
|-----------|--------------------|----------------|
| Current > reference | `+12.5 kWh` | `+8.3 %` |
| Current < reference | `−12.5 kWh` | `−8.3 %` |
| Current = reference | `0.0 kWh` | `0.0 %` |

### 4. No duplicate historical value (FR-012 – FR-014)

The forecast section shows **only** "Consumption in reference period". The "Historical value" row is gone from all languages.

### 5. Period date labels (FR-015 – FR-018)

| Mode | `period_offset` | Current period label | Reference period label |
|------|----------------|---------------------|----------------------|
| `year_over_year` | `-1` (default) | `Current period (2026)` | `Reference period (2025)` |
| `year_over_year` | `-2` | `Current period (2026)` | `Reference period (2024)` |
| `month_over_year` | `-1` | `Current period (March 2026)` | `Reference period (March 2025)` |
| `month_over_year`, locale `pl` | `-1` | `Current period (marzec 2026)` | `Reference period (marzec 2025)` |

---

## Key Files Modified

| File | Change |
|------|--------|
| `src/ha-types.ts` | Add typed `states` field to `HomeAssistant` |
| `src/card/types.ts` | Add `show_title`, `icon`, `show_icon` to `CardConfig`; add `period` to `CardState` |
| `src/card/cumulative-comparison-chart.ts` | Header rendering; signed diffs; remove historical_value block; period labels |
| `src/card/energy-horizon-card-styles.ts` | Add `.ebc-title-row`, `.ebc-title`, `.ebc-icon` styles |
| `src/translations/en.json` | Remove `forecast.historical_value` |
| `src/translations/de.json` | Remove `forecast.historical_value` |
| `src/translations/pl.json` | Remove `forecast.historical_value` |
| `tests/unit/card-header-resolution.test.ts` | NEW: unit tests for title/icon resolution logic |
| `tests/unit/period-label.test.ts` | Unit tests for `formatCompactPeriodCaption` (`src/card/labels/compact-period-caption.ts`) |
| `tests/integration/card-render.test.ts` | Update: assert header present; assert no historical_value row |
