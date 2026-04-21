# Contract: Energy Horizon Lovelace card (v0.5.0 UI)

## 1. Public card identity

| Requirement | Value |
|-------------|--------|
| Custom element | `energy-horizon-card` |
| Lovelace `type` | `custom:energy-horizon-card` |

**Breaking change policy**: No change to `type` or element name (FR-001, constitution III).

## 2. Configuration surface (YAML / Storage UI)

- **Stable keys**: All keys documented in `CardConfig` (`src/card/types.ts`) remain valid for existing dashboards.
- **New keys**: Only additive, optional keys allowed if introduced for v0.5.0; must be reflected in `energy-horizon-card-editor.ts` and docs.
- **Layout visibility (post v0.5.0)**: `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment` — optional booleans; default **visible** when omitted or not `false`. Exposed in the visual editor (`ha-form` boolean selectors). Technical editor contract: `specs/005-gui-editor/contracts/lovelace-editor-api.md`.
- **Deprecated keys**: Continue accepting `comparison_mode` alias per `resolveComparisonPreset`.

## 3. Data ingestion

- **Source**: Home Assistant **Long-Term Statistics** via `recorder/statistics_during_period` (existing `LtsStatisticsQuery`).
- **No new network channels** (constitution II).

## 4. UI composition contract (semantic regions)

The rendered card **SHOULD** expose stable, testable regions (class names or roles TBD at implementation; names below are logical):

| Region | Purpose |
|--------|---------|
| Card header | Title (optional), `entity_id` subtitle (only when title shown), icon |
| Comparison panel | Current vs reference + delta chip — **absent** when `show_comparison_summary === false` (optional). |
| Forecast / Total panel | Present only when forecast is **enabled** (`show_forecast` not `false`); then end-of-period forecast vs full reference total (§1.3), **and** `show_forecast_total_panel !== false`. When forecast is **disabled**, this region is **absent** (entire panel hidden) regardless of `show_forecast_total_panel`. |
| Chart | ECharts container |
| Narrative comment | `textSummary` + trend icon — **absent** when `show_narrative_comment === false` (optional). |
| Warning | Data-quality messages (e.g. incomplete reference) — **exclusive** full text for that case |

## 5. Behavioral contract (selected)

- **Incomplete reference**: Full `summary.incomplete_reference` text **only** in Warning region (FR-006).
- **Delta chip**: Always present; formatting rules per spec clarifications (FR-003).
- **Chart**: When current series shown — three X labels; when hidden — match **v0.4.0** behavior (spec clarifications).

## 6. Internationalization

- Every user-visible string **MUST** resolve via card locale files; no hardcoded natural language in production paths (US-8).

## 7. Theming

- Colors **SHOULD** resolve through HA theme CSS variables where semantically possible; brand accent may use `--eh-*` with fallback (US-7, `specs/001-figma-ui-rollout/figma-ui-project-source.md` §4).
