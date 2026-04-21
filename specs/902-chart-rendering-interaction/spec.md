# 902-chart-rendering-interaction
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Chart Rendering & Interaction  
**Replaces**: `001-chart-updates`, `003-echarts-migration`, `001-aggregation-axis-labels`  
**Primary code**: `src/card/echarts-renderer.ts`, `src/card/axis/`  
**Last updated**: 2026-04-21  

---

<!-- NORMATIVE -->

## Current Behavior (normative)

The card renders a line-based comparison chart using **Apache ECharts 5.x** (modular import, Canvas renderer). The renderer class (`EChartsRenderer`) takes `ComparisonSeries[]`, `timeline[]`, and a `ChartRendererConfig` and produces an `ECOption` passed to ECharts `setOption`.

### Chart elements

| Element | Implementation |
|---|---|
| Full timeline axis | All `timeline[]` slots shown as X-axis categories regardless of data availability |
| Line gaps | `connectNulls: false` on solid series; `null` slots cause visible breaks |
| "Today" marker | `markLine` (dashed vertical) + `markPoint` (dots) via ECharts API only; no direct Canvas calls |
| Area fill | `areaStyle` per series, configurable opacity, does not affect line opacity |
| Forecast line | Separate dashed series from "now" slot to last slot; no fill |
| Y-axis ticks | Exactly 5 ticks including 0 (`splitNumber: 4`, `min: 0`) |
| Series draw order | Oldest (highest index) first; forecast on top |
| Legend | Shown only when `show_legend: true`; height synced with `grid.top` after `finished` event |
| Tooltip | Axis-pointer mode, appended to card container inside Shadow DOM |
| HA theme tokens | Mapped from `getComputedStyle` on host element at update time |

### X-axis labeling

When no `x_axis_format` override is set, labels adapt to the effective aggregation grain:

| Grain | Default label rule |
|---|---|
| `hour` | Clock time; day context added at day boundaries |
| `day` | Day + month; year only when year changes along axis |
| `week` | Day + month of week start; year on year boundary |
| `month` | Short month name (via `Intl`); year on year boundary |

When two comparison windows share the same year, labels omit redundant year tokens. When they share the same year but start in different months (day aggregation), labels use day-of-month only, with month/year disambiguation in the tooltip header.

### "Now" tick typography

When the adaptive axis is active and the current series is visible, the "now" tick always uses a **two-line rich-text stack**:
- Line 1: invisible placeholder using the same `edge` typography (reserves vertical space matching other ticks)
- Line 2: substantive adaptive date/time string in `today` style (not a standalone "Now"/"Teraz" caption)

Non-"now" ticks use single-line `edge` labels. The full two-line vertical budget is always reserved in `grid.bottom` and container `min-height` whenever "now" is within range.

### Grid layout constants

- `containLabel: false` — `grid.bottom` is the exact distance from the canvas edge to the axis line; labels fill that space downward.
- `grid.bottom` — fixed constant derived from: `AXIS_TICK_LABEL_GAP_PX + edge lineHeight + today lineHeight + descender buffer`. Does not change dynamically based on whether "now" is in range.
- `AXIS_TICK_LABEL_GAP_PX` — gap between axis tick mark and the top of the label block; reducing it tightens visible bottom margin without touching typography.
- `GRID_LEFT_PX` — explicit px constant sized for the widest realistic Y label (e.g. "1,927 kWh").
- `CHART_MIN_HEIGHT_BASE_PX` — minimum chart container height (274 px); adjusted upward to compensate for removal of the dynamic `xAxisLabelMinHeightExtraPx` contribution.

### Tooltip slot resolution

The chart maps the pointer column to `fullTimeline[i]` using `axisValue` (rounded) and/or the current/reference series' explicit X coordinate — **not** `dataIndex` from an arbitrary first series (sparse forecast line).

### Automatic aggregation

When no manual `aggregation` is configured, the card derives a step from the window's `duration` using a threshold table targeting 20–100 buckets. The maximum per-series point count is **5000**; configurations exceeding this trigger a config error (same class as invalid `time_window`). Sub-hour auto-selection is excluded until LTS supports it.

---

## Public Contract

```yaml
# Card-level YAML (chart-rendering relevant fields)
primary_color: "#119894"          # optional; default: --eh-series-current CSS token
fill_current: true                # optional; default true
fill_current_opacity: 30          # optional; 0–100; default 30
fill_reference: false             # optional; default false
fill_reference_opacity: 30        # optional; 0–100; default 30
connect_nulls: false              # optional; default false
show_forecast: true               # optional; default true (alias: forecast)
show_legend: false                # optional; default false (strict ===true to enable)
x_axis_format: "yyyy-MM-dd"      # optional; card-level only; Luxon-compatible subset
tooltip_format: "dd LLL"          # optional; card-level only; same validation as x_axis_format
aggregation: day                  # optional; card-level default; per-window value wins
```

Renderer public interface:
```typescript
interface ChartRenderer {
  update(series: ComparisonSeries[], fullTimeline: number[], config: ChartRendererConfig, labels: ChartLabels): void;
  destroy(): void;
}
```

---

## Cross-domain Contracts

**Consumes from**:
- `900-time-model-windows`: `ComparisonSeries[]`, `timeline[]` (slot timestamps), "now" marker index, window role assignments, `ComparisonWindow[].aggregation`.
- `903-card-ui-composition`: chart container element (Shadow DOM), HA theme CSS tokens from host element.
- `904-configuration-surface`: raw YAML fields listed in Public Contract above.
- `905-localization-formatting`: resolved locale string for `Intl`-based label formatting; HA instance IANA time zone.

**Publishes to**:
- `903-card-ui-composition`: rendered ECharts instance occupying the chart container; `min-height` adjustments.

---

## Non-Goals

- Direct Canvas API calls for any visual element (no `ctx.arc`, `ctx.stroke`, etc. outside ECharts internals).
- Shipping bundled month/weekday name dictionaries for the time axis.
- Sub-hour aggregation (awaits LTS data layer support).
- SVG renderer (Canvas renderer is sufficient).
- Rotated axis labels as the default mobile label strategy.
- ICU-only or preset-only format strings for `x_axis_format` / `tooltip_format`.

---

<!-- EXECUTION -->

## User Stories

### US-902-1 — Full timeline with gaps for missing data (P1)

As a user viewing a year-over-year comparison with daily aggregation and gaps in historical data, I need the X-axis to always show every day in the period and the line to visibly break at missing days, so I can distinguish "no data collected" from "no energy used."

**Independent test**: Configure `comparison_preset: year_over_year`, `aggregation: day`, entity with data gaps → axis shows 365/366 positions; line breaks at gap slots; reference series also breaks independently.

**Acceptance Scenarios**:

1. **Given** `comparison_preset: year_over_year` with `aggregation: day` and data gaps, **When** the chart renders, **Then** the X-axis shows all 365 or 366 day positions and the series line breaks (no straight interpolation) at missing days.
2. **Given** `comparison_preset: month_over_month` with `aggregation: day` and some days missing, **When** the chart renders, **Then** the axis shows all days of the month; lines break at missing slots.
3. **Given** `aggregation: hour` with hourly gaps, **When** the chart renders, **Then** all hours of the period appear on the axis; lines break appropriately.
4. **Given** `aggregation: week` or `aggregation: month` with missing buckets, **When** the chart renders, **Then** all weeks/months of the period appear; lines break at missing slots.
5. **Given** the reference series has data gaps, **When** the chart renders, **Then** the reference series also shows breaks independently of the current series; the X-axis remains complete.

---

### US-902-2 — "Today" marker clearly identifies current position (P2)

As a user who checks the card daily, I need a prominent "today" dot on the current series, a corresponding dot on the reference series, and a dashed vertical line connecting y=0 to the higher of the two values, so I can immediately locate today's cumulative progress without hovering.

**Independent test**: Current date must be within the window → dots visible on both series at the correct slot; dashed line from y=0 to the higher value.

**Acceptance Scenarios**:

1. **Given** data for both current and reference series at today's slot, **When** the chart renders, **Then** a distinct dot appears on the current series at the "now" slot in the current series' color.
2. **Given** both series have data at their today-equivalent slots, **When** the chart renders, **Then** a distinct dot appears on the reference series at the analogous slot in the reference series' color; the dashed vertical line reaches the higher of the two values.
3. **Given** exactly one series has `null` at the "now" slot, **When** the chart renders, **Then** the dashed line reaches the value of the non-null series; `null` is treated as absent, not zero.
4. **Given** both series have `null` at the "now" slot, **When** the chart renders, **Then** the dashed line extends to the top of the chart area.
5. **Given** the "now" slot index is beyond the chart's timeline bounds (card configured for a historical period), **When** the chart renders, **Then** no "today" marker is shown and no error occurs.

---

### US-902-3 — Configurable fill, color, and forecast line (P2)

As a user, I need control over area fill visibility and opacity for each series, the primary color of the current series, and whether a dashed forecast line is shown, so the chart matches my dashboard aesthetic and information needs.

**Independent test**: Setting each configuration flag independently and verifying only that element changes.

**Acceptance Scenarios**:

1. **Given** no fill configuration, **When** the chart renders, **Then** the current series has 30% opacity fill; the reference series has no fill.
2. **Given** `fill_reference: true` and `fill_reference_opacity: 60`, **When** the chart renders, **Then** the reference fill is visible at 60% opacity; line opacity is unaffected.
3. **Given** `fill_current: false`, **When** the chart renders, **Then** no fill appears under the current series.
4. **Given** `primary_color: "#E53935"`, **When** the chart renders, **Then** the current series line, fill, today dot, dashed vertical, and forecast line all use `#E53935`.
5. **Given** `primary_color` is absent, **When** the chart renders, **Then** the current series uses the `--eh-series-current` CSS token value (or HA `--accent-color` fallback).
6. **Given** `show_forecast: false`, **When** the chart renders, **Then** no forecast line is shown.
7. **Given** `show_forecast: true` and today is within the window with data at the "now" slot, **When** the chart renders, **Then** a dashed line runs from the "now" slot to the last slot at the projected end value, in the current series' color.
8. **Given** an invalid opacity value (e.g. -5 or 150), **When** the chart renders, **Then** the fallback 30% opacity is applied; no error breaks rendering.

---

### US-902-4 — Adaptive X-axis labels without bundled dictionaries (P2)

As a dashboard viewer, I need axis labels to show the correct date/time context for the aggregation grain (e.g. "15 Mar" for daily, "Mar" for monthly) in my Home Assistant language, without the card shipping its own month-name translation files.

**Independent test**: Verify label format changes with aggregation grain; verify month/weekday names come from the platform formatter (`Intl`), not bundled strings; verify cascade card lang → HA lang → `en`.

**Acceptance Scenarios**:

1. **Given** `aggregation: hour`, **When** viewing the axis, **Then** labels show clock times; at day boundaries, labels include broader date context.
2. **Given** `aggregation: day` and the axis spans two calendar years, **When** viewing the axis, **Then** the year appears at year boundaries; within the same year, shorter forms are used.
3. **Given** `aggregation: month`, **When** viewing the axis, **Then** abbreviated month names come from `Intl.DateTimeFormat` for the resolved locale — no hardcoded strings.
4. **Given** the card `language` field is set, **When** labels render, **Then** they use that locale for all date/time text.
5. **Given** no card `language` and HA user language is available, **When** labels render, **Then** they use the HA user language.
6. **Given** neither card nor HA language is resolvable, **When** labels render, **Then** `en` is used as the fallback.

---

### US-902-5 — Forced axis and tooltip format overrides (P2)

As an advanced user needing a fixed label style for screenshots or reports, I need optional `x_axis_format` and `tooltip_format` fields that accept Luxon-compatible token strings and completely override adaptive labeling.

**Independent test**: Set `x_axis_format: "yyyy-MM-dd"` → all ticks use that pattern regardless of grain; invalid pattern triggers config error at `setConfig`.

**Acceptance Scenarios**:

1. **Given** a valid `x_axis_format` in YAML, **When** the chart renders, **Then** adaptive label rules do not apply; every tick uses the forced pattern consistently.
2. **Given** an invalid `x_axis_format` (unsupported tokens), **When** `setConfig` processes YAML, **Then** a user-visible configuration error is raised; the chart does not render with a broken format.
3. **Given** a valid `tooltip_format`, **When** the user hovers a slot, **Then** the tooltip header uses the forced format instead of the aggregation-based precision matrix.
4. **Given** a forced format makes adjacent ticks identical (e.g. year-only on hourly data), **When** the chart renders, **Then** it still renders as specified; the display layer may thin duplicate labels.

---

### US-902-6 — No canvas hacks; clean lifecycle (P1)

As a developer reviewing the renderer, I need all chart elements to be expressed through ECharts' official API, and the renderer to create exactly one ECharts instance per container and release it cleanly on destroy, so the codebase remains maintainable after library upgrades.

**Independent test**: Code review finds zero direct Canvas API calls outside ECharts internals; multiple `update()` calls maintain exactly one instance; `destroy()` disposes the instance and disconnects ResizeObserver.

**Acceptance Scenarios**:

1. **Given** the renderer source file, **When** reviewed, **Then** no direct `CanvasRenderingContext2D` method calls (`ctx.arc`, `ctx.stroke`, `ctx.fillRect`, etc.) exist outside ECharts internals.
2. **Given** `update()` called multiple times with different data, **When** the container is inspected, **Then** exactly one ECharts instance exists in the container.
3. **Given** `destroy()` is called, **When** the container is inspected, **Then** the ECharts instance is disposed and the ResizeObserver is disconnected.
4. **Given** the container resizes (window or panel resize), **When** the change occurs, **Then** the chart adapts to new dimensions automatically via the renderer's internal ResizeObserver, without creating a new instance.

---

## Edge Cases

1. **Zero-width/height container at init**: ECharts initialization must be deferred or guarded so a zero-size container does not cause errors; the ResizeObserver triggers a proper first render once dimensions are available.
2. **`fullTimeline` is empty**: Renderer produces an empty chart without JS errors; no markers, no series.
3. **Reference series is `undefined` or `null`**: Chart renders only the current series; legend (if shown) lists one entry; tooltip shows one value.
4. **Leap year** (366 days): Axis must show 366 positions for a year-level window; no off-by-one truncation.
5. **`primary_color` with `rgba(...)` and explicit alpha**: Fill opacity is controlled by `fill_current_opacity`, not by the alpha channel in `primary_color`; both apply independently.
6. **Shadow DOM tooltip positioning**: `tooltip.appendTo` MUST reference the card container inside Shadow DOM; default `document.body` target produces mispositioned tooltips in Lit/HA.
7. **"Now" tick at second-to-last slot (day aggregation)**: When the "now" slot index is `timeline.length - 2`, the "now" tick still uses the two-line rich stack; the last tick (`timeline.length - 1`) remains a normal single-line edge label so the period end date stays visible.
8. **"Now" tick at first or last slot**: Two-line stack applies regardless of position (first, interior, last); the full two-line vertical budget is always reserved in `grid.bottom` when "now" is within range.
9. **Dense series on narrow viewport**: Labels remain horizontal; intermediate labels are thinned with priority for ends and day/month/year boundaries; no label rotation.
10. **Tooltip slot from sparse forecast series**: Tooltip slot MUST be derived from `axisValue` (rounded) matched against `fullTimeline`, not from `dataIndex` of the forecast series (which is sparse and misaligned).
11. **DST transition in timeline**: Timestamps remain correct in HA time zone; duplicate or missing civil-time hours on DST boundary are reflected in labels using HA time zone — never browser-local offset.
12. **Safety limit exceeded**: If `aggregation` + window `duration` would produce more than 5000 points per series, the card must refuse to render and show a user-visible config error; no silent truncation.
13. **Legend height larger than base budget**: After `finished` event, renderer measures legend height and adjusts `grid.top` and container `min-height` so the plot area is not compressed by an unexpectedly tall legend.

---

## Functional Requirements

- **FR-902-A (Full timeline axis)**: The X-axis MUST display all `timeline[]` slots (indices 0..N-1) as categories regardless of data availability. Missing data slots MUST produce visible gaps in the line (`connectNulls: false` on solid series), not straight-line interpolation.

- **FR-902-B (Line gap overlay)**: When `connect_nulls: true` is set in YAML, the renderer MAY draw an additional dashed/interpolated overlay through null-valued slots to suggest continuity, but MUST NOT remove gaps from the primary solid series.

- **FR-902-C (Today marker — implementation)**: The "today" marker (dashed vertical line and series dots) MUST be realized exclusively through ECharts built-in mechanisms (`markLine`, `markPoint`). Zero direct Canvas API calls are permitted for marker rendering.

- **FR-902-D (Today marker — slot)**: The "now" slot index MUST be the `fullTimeline` slot that contains the current instant (`Date.now()`): for `i < N-1`, the interval `[timeline[i], timeline[i+1])`; for the last slot, `[timeline[N-1], +∞)`. Implementation: `findTimelineSlotContainingInstant` in `src/card/axis/now-marker-slot.ts`. MUST NOT be derived by simple `indexOf` on a midnight timestamp in the browser's local time zone.

- **FR-902-E (Today marker — line height)**: The dashed vertical line MUST reach from y=0 to the higher of current and reference series values at the "now" slot. `null` is absent (not zero): if one series is null, the line reaches the non-null value; if both are null, the line reaches the top of the chart area.

- **FR-902-F (Area fill)**: Area fill under each series MUST use `areaStyle` with an independently configurable opacity (0–100) that does not affect the series line opacity. Invalid opacity values MUST fall back to 30% and not break rendering.

- **FR-902-G (Forecast series)**: The forecast line MUST be a separate ECharts line series with `lineStyle.type: 'dashed'`, no fill, starting at the "now" slot index (FR-902-D) and ending at the last `timeline[]` slot. It MUST be drawn on top of all data series. If no "now" data is available or `show_forecast: false`, it is not rendered.

- **FR-902-H (Y-axis ticks)**: The Y-axis MUST display exactly 5 ticks including 0, achieved via `splitNumber: 4` and `min: 0` in ECharts config — no custom JS tick logic.

- **FR-902-I (Y-axis unit label)**: The unit label MUST appear at the highest Y-axis tick, implemented via `axisLabel.formatter` detecting the highest tick value. No direct Canvas text rendering.

- **FR-902-J (Grid lines)**: Vertical grid lines MUST be disabled. Horizontal grid lines, X-axis ticks, and X-axis labels MUST remain visible.

- **FR-902-K (Tooltip)**: Tooltip MUST operate in axis-pointer mode covering all series simultaneously. `tooltip.appendTo` MUST reference the card container element inside Shadow DOM (never `document.body`). Tooltip slot MUST be resolved from `axisValue` against `fullTimeline`, not from `dataIndex` of the forecast or any sparse series.

- **FR-902-L (Legend)**: Legend is enabled only when `show_legend === true` (strict equality). After the `finished` event, the renderer measures the legend's rendered height and sets `grid.top` and container `min-height` accordingly, then calls `resize()`, so the plot area is not compressed by a tall legend.

- **FR-902-M (HA theme tokens)**: The renderer MUST read HA CSS tokens from the host element (`getComputedStyle`) and map them to ECharts: `--secondary-text-color` → reference series / grid lines, `--divider-color` → Y-grid / tooltip border / axisPointer shadow, `--primary-text-color` → axis labels / legend / tooltip text, `--ha-card-background` or `--card-background-color` → tooltip background. A theme change that triggers `update()` MUST refresh these token snapshots.

- **FR-902-N (Modular ECharts import)**: ECharts MUST be imported modularly. Forbidden: `import * as echarts from 'echarts'`. Required: imports from `echarts/core`, `echarts/charts` (`LineChart` only), `echarts/components` (only `GridComponent`, `TooltipComponent`, `LegendComponent`, `MarkLineComponent`, `MarkPointComponent`), `echarts/renderers` (`CanvasRenderer` only). Target version: `^5.6.0`.

- **FR-902-O (No Chart.js dependency)**: After migration, `chart.js` and `chartjs-adapter-date-fns` MUST be absent from `package.json` `dependencies` and `devDependencies`.

- **FR-902-P (Renderer interface)**: `EChartsRenderer` MUST implement `ChartRenderer`: `update(series, fullTimeline, config, labels)` and `destroy()`. Business logic in `cumulative-comparison-chart.ts` (`buildFullTimeline`, `_buildRendererConfig`) MUST remain unchanged.

- **FR-902-Q (Lifecycle)**: The renderer MUST create and manage its own `ResizeObserver` observing the container element; on resize it calls `echartsInstance.resize()`. `disconnect()` is called in `destroy()`. `destroy()` MUST also call `echartsInstance.dispose()`. Multiple `update()` calls MUST maintain exactly one ECharts instance per container.

- **FR-902-R (Series draw order)**: `option.series` entries MUST be ordered: oldest window (highest index) first, then newer windows, current series (index 0) last before forecast; forecast on top when enabled.

- **FR-902-S (Adaptive X-axis labels)**: When no `x_axis_format` is set, labels MUST adapt to the effective aggregation grain using `Intl.DateTimeFormat` in the HA instance time zone — no bundled month/weekday name dictionaries. Day boundaries on hourly charts MUST include date context. Year changes MUST be reflected where relevant.

- **FR-902-T (Adaptive label — comparison dimensions)**: When two windows differ by year, axis/tooltip headers MUST NOT repeat a misleading single year on every tick. When two windows share a year but start in different months (day aggregation), axis labels MUST default to day-of-month only; the tooltip header/series names carry month/year disambiguation. Forced `x_axis_format` / `tooltip_format` override this matrix.

- **FR-902-U (Forced format override)**: Optional card-level `x_axis_format` and `tooltip_format` MUST accept Luxon-compatible token strings from the card's documented subset. Invalid tokens MUST cause a fail-fast config error at `setConfig`. Valid overrides completely suppress adaptive label logic for their respective surfaces.

- **FR-902-V (Locale cascade)**: Label locale MUST resolve in order: card `language` field → HA user language → `en`. All date/time text on the axis and in tooltips MUST use the same resolved locale.

- **FR-902-W (Mobile-friendly labels)**: X-axis labels MUST remain horizontal on narrow viewports. When labels would overlap, intermediate ticks are hidden using a predictable priority: ends and key boundaries (day/month/year change) are preserved last; middle ticks are removed first.

- **FR-902-X (Tooltip precision matrix)**: Default tooltip header precision MUST follow the aggregation grain: `month` → month name only; `day`/`week` → day + month without year; `hour` → time (h:mm); `hour` + `duration > 1 day` → time + date disambiguation. Year MUST NOT appear in default comparison tooltip headers.

- **FR-902-Y (Auto-aggregation)**: When no manual `aggregation` applies, the card MUST derive a step from the window's `duration` using a documented threshold table targeting 20–100 buckets. Configuration that would produce more than 5000 points per series MUST trigger a fail-fast config error (same class as invalid `time_window`). Sub-hour auto-selection is excluded.

- **FR-902-Z (Grid layout constants — stable height)**: `grid.bottom` MUST be a fixed constant derived from the full two-line typography budget (`AXIS_TICK_LABEL_GAP_PX + edge lineHeight + today lineHeight + descender buffer`), regardless of whether "now" is currently in range or whether adaptive rich labels are active. `containLabel: false` is required. `GRID_LEFT_PX` is an explicit px constant for Y-axis label space. `CHART_MIN_HEIGHT_BASE_PX` (274 px) ensures an adequate plot area.

- **FR-902-AA ("Now" tick — two-line stack)**: When the adaptive axis is active and the current series is visible, the "now" tick at any axis index (first, last, interior, or second-to-last with a terminal bucket remaining) MUST use a two-line rich-text label: line 1 = invisible placeholder row using `edge` typography metrics (reserves the band occupied by other edge labels); line 2 = substantive adaptive date/time string using `today` typography style. A standalone "Now"/"Teraz" caption MUST NOT be used as the only label text. Non-"now" ticks keep their normal single-line `edge` label. The full two-line vertical budget (`grid.bottom`, container `min-height`) MUST be reserved whenever "now" is within range, using metrics from `src/card/axis/x-axis-rich-styles.ts`.

---

## Key Entities

- **`EChartsRenderer`**: Implements `ChartRenderer`. Manages ECharts instance lifecycle, `ResizeObserver`, and `finished`-event legend sync. Source: `src/card/echarts-renderer.ts`.
- **`ChartRendererConfig`**: Input DTO containing `primaryColor`, `fillCurrent`, `fillCurrentOpacity`, `fillReference`, `fillReferenceOpacity`, `connectNulls`, `showForecast`, `forecastTotal`, `showLegend`, `unit`, `periodLabel`, `referencePeriodStart`, and aggregation/format overrides.
- **`ComparisonSeries`**: Array of `{ values: (number | null)[], role: 'current' | 'reference' | 'contextual', windowIndex: number }` aligned to `timeline[]`.
- **`ECOption` (adapter)**: Internal function producing an ECharts `ECBasicOption` from `ComparisonSeries`, `timeline[]`, `ChartRendererConfig`, and `labels`.
- **`findTimelineSlotContainingInstant`**: Function in `src/card/axis/now-marker-slot.ts` computing the "now" slot index from `Date.now()` against `timeline[]` in the HA time zone.
- **Axis label profile**: Either adaptive (grain + locale + HA time zone) or forced (`x_axis_format`).
- **Locale resolution**: Ordered: card `language` → HA user language → `en`.
- **Grid layout constants**: `AXIS_TICK_LABEL_GAP_PX`, `GRID_LEFT_PX`, `CHART_MIN_HEIGHT_BASE_PX`, `edge` and `today` rich-style metrics — all defined in `src/card/axis/x-axis-rich-styles.ts`.

---

## Success Criteria

- **SC-902-1**: All visual acceptance scenarios from the legacy `001-chart-updates` spec pass by manual inspection after the ECharts migration (0 regressions): full timeline, line gaps, today marker, area fill, forecast line, 5 Y-ticks, color propagation.
- **SC-902-2**: Code review of `echarts-renderer.ts` finds zero direct `CanvasRenderingContext2D` method calls (`ctx.arc`, `ctx.stroke`, `ctx.fillRect`, etc.) outside ECharts internals.
- **SC-902-3**: `import * as echarts from 'echarts'` does not appear anywhere in source; all ECharts imports are from named sub-paths.
- **SC-902-4**: Multiple `update()` calls on the same container always result in exactly one ECharts instance; `destroy()` leaves zero instances and a disconnected ResizeObserver.
- **SC-902-5**: Vitest tests for `echarts-renderer.ts` assert: (a) "now" tick at any index uses a two-line rich label with adaptive date/time on line 2; (b) `grid.bottom` is a fixed constant independent of "now" position; (c) tooltip slot is resolved from `axisValue` vs `fullTimeline`, not `dataIndex` of the forecast series.
- **SC-902-6**: On a 320px-wide viewport test case, axis labels remain horizontal and at least the first and last tick are visible without truncation or overlap.
- **SC-902-7**: Switching only the HA user language (YAML unchanged) changes month/weekday label wording without adding new translation files to the card for those strings.

---

## Assumptions

- ECharts Canvas renderer is sufficient for all visual requirements; SVG renderer is not needed.
- `ResizeObserver` is available in all target HA browser environments (modern browsers); no polyfill is required.
- HA CSS tokens (`--primary-text-color`, `--divider-color`, etc.) are accessible on the card host element at render time.
- The `CanvasRenderer` ECharts renderer and Lit Shadow DOM work correctly together when `tooltip.appendTo` is set to the card container.
- Axis X is a slot-index–based (`category`) axis; slot-to-timestamp mapping is handled by label formatters using `timeline[]` values.
- Automatic aggregation threshold table targets 20–100 buckets; exact numeric boundaries are finalized during implementation planning and documented in code.
- `x_axis_format` and `tooltip_format` use Luxon token alphabet; ICU-only or preset-only formats are out of scope.
- Documentation changes (README, wiki, changelog) referencing this domain's configuration options are covered by domain `907-docs-product-knowledge`.
