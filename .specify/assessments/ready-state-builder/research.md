# Research: Single ready-state pipeline (FR-002 / TD-2)

- **Slug**: ready-state-builder
- **Created**: 2026-11-16
- **Evidence confidence (overall)**: high (all claims verified against on-disk source, 2026-11-16)

## Current state — the three paths

All three live in `src/card/cumulative-comparison-chart.ts` (1856 lines) and each re-implements the same pipeline skeleton: resolve locale → merge config + auto-aggregation fallback → `resolveTimeWindows` → `buildChartTimeline` → `firstTailAxisLabelIndex` → (load/demo real series) → unit scaling → `alignOffsetMs` → `computeSummary` → `computeForecast` → unit patching → `computeTextSummary` → state assembly.

| Path | Location | Notes |
|---|---|---|
| Production `_loadData` | lines ~650–750 | generation guard, point-cap assert with debug error path, LTS query loop with 3 `as any` casts, stale-generation discard |
| Demo picker `_buildDemoState` | lines 269–345 | builds the deterministic demo series; identical merged/aggregation fallback block (lines 271–277) |
| Picker real-data upgrade `_firePickerRealDataQuery` | lines 356–411+ | reads `resolvedWindows`/`chartTime` out of the demo state, re-derives `alignOffsetMs`, queries real data, keeps demo on empty result |

**Confirmed duplication (verbatim-level):**

1. **Merged config + auto-aggregation fallback** — `merged.aggregation === undefined → parseDurationToken → durationToMillis → pickAutoAggregation`: identical block in `_loadData` (664–669) and `_buildDemoState` (271–277). [source: cumulative-comparison-chart.ts] (confidence: high)
2. **Timeline trio** — `resolveTimeWindows` + `buildChartTimeline` + `firstTailAxisLabelIndex` (with the same `windows.length >= 2` guard): all three paths. [source: lines 278–293 / 671–691] (confidence: high)
3. **`alignOffsetMs` formula** — `chartTime.alignStartsMs[0]! - chartTime.alignStartsMs[1]!` with `length > 1` guard: three call sites (313–314, 376–379, production path). [source: cumulative-comparison-chart.ts] (confidence: high)
4. **Summary/forecast/text pipeline** — `computeSummary(scaled, alignOffsetMs)` + `computeForecast(scaled, forecastPeriodBuckets, alignOffsetMs)` + unit patching (`if (!summary.unit && unit) summary.unit = …`, same for forecast) + `computeTextSummary(summary)`: all three paths (6 `computeSummary`/`computeForecast` calls in the element). [source: codegraph blast radius; lines 315–327] (confidence: high)
5. **Unit scaling** — `_applyUnitScalingToSeries(series, rawUnit)` private element method (lines 949–1041, ~93 lines): concatenates current+reference+context values, one `scaleSeriesValues` call with `{ force_prefix: this._config.force_prefix }`, rescales points/`rawValue`/totals. The only element coupling is the `force_prefix` read. [source: cumulative-comparison-chart.ts:949–1041] (confidence: high)

## Prior art (in production, pure, already unit-tested)

- `computeSummary` (ha-api.ts:599), `computeForecast` (ha-api.ts:643), `computeTextSummary` (ha-api.ts:769), `referenceCumulativeAtAlignedCurrentEnd` (ha-api.ts:569) — exported pure functions, covered by `tests/unit/aggregation.test.ts` + `tests/unit/ha-api.test.ts`. The builder orchestrates these; it does not re-implement them. [source: ha-api.ts] (confidence: high)
- `scaleSeriesValues` / `UnitScaleOptions` / `ScaleResult` (src/utils/unit-scaler.ts:232, :33, :51) — pure, zero-dependency module; `force_prefix` is **already an explicit option** (`UnitScaleOptions.force_prefix`). The element's `_applyUnitScalingToSeries` is a thin (93-line) wrapper that reads `this._config.force_prefix` and re-applies the scale to `ComparisonSeries` points. Moving the wrapper into `unit-scaler.ts` as `applyUnitScalingToSeries(series, rawUnit, { force_prefix })` changes no math. [source: unit-scaler.ts; cumulative-comparison-chart.ts:949–1041] (confidence: high)
- The `time-windows/` core pattern — pure modules, zero Lit/DOM, the project's reference model (audit S1). The builder module follows the same pattern. [source: architecture-audit-2026-11-15.md §2 S1] (confidence: high)

## Data & Constraints

- **State assembly is the payload**: all three paths end in a literal `CardState` object (demo: lines 329–344). After TD-2 the builder owns that assembly for the ready shape; the error/no-data shapes (point-cap exceeded with `debug` message, empty LTS result → no-data) stay reachable through the builder or as thin element branches — see concept.md Option A details.
- **Imperative concerns stay in the element** (Functional Core / Imperative Shell): the load-generation guards (`_loadGeneration`/`_inFlightGeneration`), the `hass` subscription, the ECharts renderer lifecycle, and the stale-result discard (`gen !== this._loadGeneration`) are imperative shell logic — do NOT move into the builder. The do-not-touch list (audit §5) includes the generation mechanism. [source: cumulative-comparison-chart.ts:386–396; audit §5] (confidence: high)
- **`force_prefix` as parameter**: the spec requires it (FR-002). Verified that no other hidden element dependency exists in the scaling path — the wrapper uses only `series`, `rawUnit`, and `this._config.force_prefix`. [source: cumulative-comparison-chart.ts:949–966] (confidence: high)
- **FR-011 interaction**: the builder's return type is `CardState`. TD-11 will replace the flat interface with a discriminated union; the builder then becomes the single production point for `ReadyState` — which is exactly why TD-2 precedes TD-11 (see decision.md and the `cardstate-union` assessment). [source: spec FR-011, Edge Case 6] (confidence: high)
- **Test surface**: `tests/unit/unit-scaler.test.ts` exists (scaling math stays covered); new `tests/unit/ready-state-builder.test.ts` gets ≥ 15 tests (SC-006) over ready / no-data / forecast-disabled / single-window / preview; `tests/unit/cumulative-comparison-chart-multi-window.test.ts` + localization + picker integration tests stay green unchanged (golden standard). [source: tests/] (confidence: high)

## Evidence Against the Idea

- **Behavior-preservation risk**: three paths have drifted (e.g., the picker re-reads windows from the demo state; the demo has no point-cap assert). Unifying must preserve each path's *current* behavior, not silently harmonize it. Mitigation: path-specific `opts` flags + golden integration tests unchanged + per-path unit tests pinned to current output. [source: code diff of the three paths] (confidence: high)
- **The production error path** (point-cap `debug` message → error state with `errorParams`) is not present in the other two paths — the builder must not force it onto demo/picker. [source: _loadData catch block] (confidence: high)
- **Scope risk**: "unify the pipeline" can creep into re-designing state, queries, or the renderer. The spec bounds it: builder + unit-scaler extraction only; state union is a separate task (TD-11/FR-011). [source: spec FR-002] (confidence: high)

## Gaps & Open Questions

None — all unknowns resolved above; the only carried-forward coupling is the explicit TD-2→TD-11 ordering (Edge Case 6), decided in decision.md.
