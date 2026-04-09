# Data model: Figma UI rollout (v0.5.0)

Logical entities derived from `spec.md` and current `src/card/types.ts`. This is a **view/state** model (browser-only); persistence is Home Assistant Lovelace YAML/Storage.

## 1. Card configuration (`CardConfig`)

| Field | Type | Notes |
|-------|------|--------|
| `type` | string | Must remain `custom:energy-horizon-card` (FR-001). |
| `entity` | string | Energy statistics entity. |
| `title`, `show_title` | optional | `show_title === false` → no friendly title **and** no `entity_id` subtitle (clarifications). |
| `icon`, `show_icon` | optional | Icon in 42×42 wrapper, 24px MDI via `ha-icon` / `ha-state-icon`. |
| `comparison_preset`, `time_window`, … | existing | Unchanged contract unless plan adds optional keys (editor/types sync). |

**Validation**: Existing `setConfig` / `assertMergedTimeWindowConfig`; no untrusted HTML in strings (constitution II).

## 2. Resolved time windows (`ResolvedWindow[]`)

| Field | Role |
|-------|------|
| `role` | `current` \| `reference` \| `context` |
| `start`, `end` | Inclusive/exclusive per existing resolver semantics |
| `aggregation` | `day` \| `week` \| `month` \| `hour` |

Used for period captions, LTS queries, and chart timeline.

## 3. Comparison series (`ComparisonSeries`)

| Field | Description |
|-------|-------------|
| `current` | `CumulativeSeries` — points, `periodLabel`, `total` |
| `reference` | Optional — same shape |
| `context` | Optional extra windows (visual) |
| `aggregation`, `time_zone` | Drive bucketing and labels |

**CumulativeSeries**: `points[]` with `timestamp`, `value`; `unit`; `total` for series-level rollups where used.

## 4. Summary (`SummaryStats`)

| Field | Type | UI use (v0.5.0) |
|-------|------|-----------------|
| `current_cumulative` | number | First panel — current column “to today”. |
| `reference_cumulative` | number \| undefined | First panel — reference column; **`null`/missing** triggers incomplete-reference handling. |
| `difference` | number \| undefined | Delta chip (absolute segment). |
| `differencePercent` | number \| undefined | Delta chip (percent segment). |
| `unit` | string | Formatter alignment for values + delta placeholders. |

**Rules**: Delta chip always visible (FR-003); format zeros and placeholders per clarifications.

## 5. Forecast block (`ForecastStats`)

| Field | Type | Semantics (target) |
|-------|------|---------------------|
| `enabled` | boolean | Part of gating the forecast **data** block; **UI:** second panel is shown only when forecast is enabled in config (`show_forecast` / `forecast` not `false`, see `isForecastLineVisible`) **and** this path is active — spec: entire panel hidden if forecast off (**Clarifications**). |
| `forecast_total` | number \| undefined | **Forecast** — full **current** window end projection (§1.3). |
| `reference_total` | number \| undefined | Must represent **Total** = full **reference** window cumulative (US-3). *If current code uses this field differently, align implementation with §1.3 and update this doc.* |
| `confidence` | enum | Existing confidence note (may stay in forecast panel or be restyled). |
| `anomalousReference` | boolean \| undefined | Existing logic. |
| `unit` | string | Display unit for forecast block. |

## 6. Text summary (`TextSummary`)

| Field | Type | UI |
|-------|------|-----|
| `trend` | `higher` \| `lower` \| `similar` \| `unknown` | Maps to comment icon + delta colors. |
| `diffValue` | number \| undefined | Narrative magnitude. |
| `unit` | string | Unit for narrative. |

**Mapping**: `higher` → “negative” visual for consumption-over-reference; `lower` → “positive”; `similar` → neutral; `unknown` → neutral (assumptions).

## 7. Incomplete reference (quality)

Not necessarily a separate DB field today.

| Signal | Source | Presentation (v0.5.0) |
|--------|--------|------------------------|
| Incomplete reference | e.g. `summary.reference_cumulative == null` + `referenceFullPeriod` logic in `ha-api` / chart path | **Full** message only in **Warning** strip (bottom), not duplicated in summary grid (FR-006). |

## 8. Card runtime state (`CardState`)

| Field | Purpose |
|-------|---------|
| `status` | `loading` \| `error` \| `no-data` \| `ready` |
| `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period` | Feed all sections |
| `mergedTimeWindow`, `resolvedWindows` | Labels, incomplete reference, editor parity |

**Transitions**: `loading` → `ready` | `error` | `no-data` (unchanged pattern).

## 9. Chart renderer input (`ChartRendererConfig`)

Existing fields plus behavior implied by spec:

- Trend-based colors for **DeltaLineToday**.
- `showReferenceComparison` / series visibility → drives **X-axis label strategy** (three labels vs v0.4.0 baseline).
- Theme-resolved colors for series, grid, labels (`getComputedStyle` / CSS vars).

## 10. Relationships (conceptual)

```text
CardConfig
  └── resolves to → ResolvedWindow[] + MergedTimeWindowConfig
         └── LTS queries → ComparisonSeries
                └── computeSummary → SummaryStats
                └── computeForecast → ForecastStats
                └── computeTextSummary → TextSummary
CardState aggregates above for Lit render (header, panels, chart, comment, warning).
```
