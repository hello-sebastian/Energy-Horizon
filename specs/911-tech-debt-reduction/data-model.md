# Data Model: Tech-Debt Reduction Program

**Feature**: `911-tech-debt-reduction` | **Date**: 2026-11-16

There is no persistent data layer: the "data model" of this feature is the card's in-memory state and the pure-function contracts that produce/consume it. All entities are TypeScript type shapes under `src/` (existing: `src/card/types.ts`, `src/card/ha-api.ts`, `src/utils/unit-scaler.ts`, `src/card/editor/editor-ui-state.ts`).

## 1. CardState — discriminated union (TD-11, W2)

Today (`src/card/types.ts`): one flat `interface CardState` with `status: "loading" | "error" | "no-data" | "ready"` and 11 optional fields — the invariants ("ready implies series present", "preview fields only while `previewShift < 0` and `status === 'ready'`") live only in comments.

Target: discriminated union on the existing `status` discriminant:

```text
CardState = LoadingState | ErrorState | NoDataState | ReadyState
```

| Shape | Fields | Notes |
|---|---|---|
| `LoadingState` | `status: "loading"` | + any existing loading-only fields, carried over |
| `ErrorState` | `status: "error"`, `errorMessage: string` (required), `errorParams?: Record<string, string \| number>` | defensive error path (Article II) |
| `NoDataState` | `status: "no-data"` | + any existing no-data-only fields, carried over |
| `ReadyState` | `status: "ready"`, **required**: `comparisonSeries: ComparisonSeries`, `summary: SummaryStats`, `forecast: ForecastStats`, `textSummary`, `period: ComparisonPeriod`, `resolvedWindows: ResolvedWindow[]`, `mergedTimeWindow`, `chartTime: ChartTimeContext`; **optional**: `preview?: PreviewSnapshot` | the 8 required fields are the FR-011 invariant; `textSummary` and `mergedTimeWindow` (present in today's flat state) are **required**, not optional — finalized by the FR-017 assess (cardstate-union, 2026-11-16) |

**Invariants (compiler-enforced after TD-11, previously comment-only):**

1. `ready` ⇒ all eight required fields present — "ready without series" is un-writable (the class behind several past bugs).
2. `preview` exists only on `ReadyState` — the preview fields cannot accompany loading/error/no-data.
3. `previewShift` is removed from the top-level state: the element field remains the live source of the shift; the `PreviewSnapshot` in state exists to serve `render()` (FR-011).
4. Transient preview state lives in exactly one place in the data model (the snapshot) — the 909 "plain element field" research decision (R3) is superseded by the snapshot, per the audit W5.

**State transitions** (all transitions through the 3 load paths, which after TD-2 all route through `buildReadyState`):

```text
(initial/config change) → loading
loading → ready | error | no-data
ready → ready            (data update; preview shift / reset mutates `preview`)
error | no-data → loading (retry / config change)
```

## 2. PreviewSnapshot (TD-11, W2)

```text
PreviewSnapshot = {
  previewShift: number          // negative = earlier periods; never positive (909 FR-003)
  previewSeries?: ComparisonSeries    // shifted current + reference pair, unit-scaled
  previewWindows?: ResolvedWindow[]   // shifted window set (current + reference, max 2)
  previewChartTime?: ChartTimeContext // timeline built from previewWindows
}
```

The four 909 preview fields consolidated into one object; present on `ReadyState` only while a preview is active. Semantics of 909/910 unchanged (edge cases 7, 910 FR-010/013/014 preserved 1:1).

## 3. ReadyStateBuilder (TD-2, W2 — the core entity)

```text
buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState
```

- Pure function, zero Lit/DOM (`src/card/pipeline/ready-state-builder.ts`).
- Covers, in order: `tailLabelFromIndex` → `alignOffsetMs` → unit scaling (via unit-scaler) → `computeSummary` → `computeForecast` (+ unit patching) → `computeTextSummary` → assembly of the `CardState` (all shapes: ready, no-data, forecast-disabled, single-window, preview — edge case 10: no happy-path-only builder).
- `opts` carries the path-specific parameters (demo/picker flags, `force_prefix`, preview snapshot inputs).
- Sole consumers: `_loadData`, `_buildDemoState`, `_firePickerRealDataQuery` — each reduced to < 60 lines of "load series → `buildReadyState(…)`" (acceptance: 1 builder call per path, verified in review).
- ≥15 unit tests (SC-006).

## 4. LtsMessageResponse / extractLtsResults (TD-3, W1)

The typed model + adapter for LTS WebSocket responses. Both observed response shapes are supported (envelope `{ result: { results } }` and bare `{ results }`), the adapter never throws on malformed input (Article II). See [contracts/lts-websocket-response.md](contracts/lts-websocket-response.md) for the full contract. After TD-3, `mapLtsResponseToCumulativeSeries` accepts the typed input and the 3 `responses[i] as any` casts are gone.

## 5. CardViewModel (TD-9, W3)

```text
buildCardViewModel(state: CardState, config, hass, localize) → CardViewModel
```

Pure function (`src/card/view-model.ts`). Output fields:

| Field | Source |
|---|---|
| period captions | `formatCompactPeriodCaption` + `formatPeriodLabel` (TD-10) |
| formatted summary/forecast numbers | existing formatters over `ReadyState.summary/forecast` |
| `warningMessages` | existing warning logic |
| `narrativeBody` | TD-8 narrative functions (`resolveNarrativeSegment`) |
| Forecast\|Total panel gating | existing gate, moved here |
| `effectiveTitle` / `effectiveIcon` | existing effective-value logic, moved here |

`render()` becomes a pure template over the VM (< 200 lines, no `compute*`/`format*` domain calls except destructuring the VM). Unit-tested for ready / no-data / error / preview / single-window states.

## 6. Narrative functions (TD-8, W3)

In the existing `src/card/narrative/` module (already holds 3 pure functions):

- `forecastDisabledReasonKey(reason: ForecastDisabledReason) → i18nKey` — the 6-value mapping currently inline in `render()` (lines 1424–1436).
- `resolveNarrativeSegment(outcome, neutralKind, language, entityKind) → { key, vars }` — the 4-branch selection over `interpretationSemantics.outcome` (lines 1454–1518), per domain spec 903 (the narrative engine defined in the spec).

Unit-tested edges: no reference, `insufficient_data`, neutral band/similar.

## 7. formatPeriodLabel (TD-10, W1)

`src/card/labels/period-label.ts`: `formatPeriodLabel(instant, locale, zone) → string` — Jan 1 → year only; otherwise `Intl` month-long + year. Replaces the two literal duplicates (`updated()` preview branch, `_buildRendererConfig()`). Unit tests: Jan 1, Dec 31, time zones, 5 languages.

## 8. unit-scaler (TD-2, W2)

The existing pure module (`src/utils/unit-scaler.ts`: `scaleSeriesValues`, `formatScaledValue`, `SIPrefix`/`ForcePrefix`/`UnitScaleOptions`/`ScaleResult`) absorbs the element's `_applyUnitScalingToSeries` (~95 lines) — `force_prefix` becomes an explicit parameter of the pure function instead of a hidden element dependency.

## 9. yaml-mode controller (TD-12, W3)

`src/card/editor/yaml-mode.ts` — a small state machine, testable without a DOM:

```text
state: { text, parseError, lastEmitted, self-echo guard, debounce timers (parse/emit) }
API:   parse(config)  → { text?, error? }
       commit(text)   → { config?, error? }
```

Companion change: `EditorUiState` (existing model, `editor-ui-state.ts`) extended with `focusTarget` and `scrollTop` (focus/caret/scroll restoration moves out of the shell). The shell `energy-horizon-card-editor.ts` keeps render + event routing (< 1000 lines). The 908 `FIELD_REGISTRY` pattern is untouched (do-not-touch).

## 10. Picker module (TD-14, W4, optional — only after TD-2)

`src/card/picker/` — absorbs `_firePickerRealDataQuery`, `_buildDemoState`, `_pickerRealDataFired` + the glue with `picker-preview.ts`, exposed to the element through a single hook:

```text
attachPicker(element, config, onState)
```

The picker becomes the simplest consumer of `ReadyStateBuilder`. Element budget after TD-14: < 1200 lines. 910 semantics (FR-010/013/014) preserved 1:1.

## Do-not-touch (audit §5 — no model changes here)

- `FIELD_REGISTRY` (editor, 908) — extend the registry, never restructure.
- Load generation mechanism (`_loadGeneration` / `_inFlightGeneration`).
- Pure `src/card/time-windows/` core.
- Custom `src/ha-types.ts` (anti vendor-lock-in decision).
