# Data model — `910-card-picker-preview` (implementation-facing)

This feature adds **no persisted data and no new configuration keys**. It adds (a) two picker
hooks on the card registration, (b) a `preview` mode flag on the card element, and (c) a
deterministic in-memory demo series. Everything below is transient and destroyed with the
element.

## Supported units set (new constant)

| Item | Type | Description |
|---|---|---|
| `SUPPORTED_UNITS` | `readonly string[]` = `["kWh", "Wh", "MWh", "m³", "l"]` | The card's supported units of measurement (FR-003). Single source of truth, exported from `src/card/picker-preview.ts`. Used by the suggestion check, the gallery entity search, and the tests. |

**Validation rule**: membership is an **exact, case-sensitive string match** against
`attributes.unit_of_measurement` (research R3). `undefined`/missing attribute → not supported.

## Picker hooks (registration surface, `src/index.ts`)

| Hook | Signature (HA `CustomCardEntry`) | Returns | Behavior |
|---|---|---|---|
| `getEntitySuggestion` | `(hass: HomeAssistant, entityId: string) => CustomCardSuggestion \| null` | `null` when the entity is missing from `hass.states` or its unit is not in `SUPPORTED_UNITS`; otherwise `{ config: SamplePreviewConfig }` | Synchronous, total, non-throwing (the picker drops throwing cards — research R1). `config.entity` is the selected entity (FR-004). |
| `getStubConfig` (static, on the element) | `(hass: HomeAssistant, entities: string[], entitiesFallback: string[]) => Partial<CardConfig>` | Sample preview config with `entity` = first suitable entity (unused first, then used) by supported unit, or `""` when none exists (FR-008) | Called by the "By card" gallery via `getCardStubConfig` (research R2). The picker merges it over `{ type }`, so the returned object does not need `type`. |

`CustomCardSuggestion` (HA shape, mirrored in `src/ha-types.ts`):

```ts
interface CustomCardSuggestion {
  label?: string;          // optional; we do not set it (the picker shows the card name)
  config: LovelaceCardConfig;
}
```

## Sample preview configuration (returned by both hooks)

| Field | Value | Notes |
|---|---|---|
| `type` | `"energy-horizon-card"` | Required in the suggestion config (used as-is by the picker); omitted in the stub config (the picker supplies it). |
| `entity` | selected entity (suggestion) / found entity or `""` (stub) | FR-004 / FR-008. |
| `comparison_preset` | `"year_over_year"` | The card's default preset — the standard appearance (FR-005, FR-009). |
| `interpretation` | `"consumption"` | The card's default interpretation. |
| `neutral_threshold` | `2` | The card's default threshold (matches the current `getStubConfig`). |

No other fields — the preview uses the card's defaults for everything else (research R5). The
sample config is **never persisted** (FR-010): it is only the picker's starting point.

## `preview` mode flag (element, new)

| Field | Type | Description |
|---|---|---|
| `preview` | `boolean` (default `false`) | Set by `hui-card` when the card is rendered in the picker (`this._element.preview = this.preview`; `editMode` is set to the same value for backwards compatibility). Plain runtime property — not part of `_config`, not persisted. |

**Semantics** (research R4/R6):

- `preview === true` → picker mode:
  - render the demo series **immediately** (no query on the critical path, FR-014);
  - fire the real-data query with a short time limit; update in place on success (FR-007/FR-014);
  - never show a loading or error state (FR-011);
  - hide the 909 preview controls (back/forward/reset) — the preview is non-interactive.
- `preview === false` → normal dashboard mode: behavior unchanged (the demo path is never taken).

## Demo data series (new, deterministic, in-memory)

| Item | Type | Description |
|---|---|---|
| `buildDemoComparisonSeries(unit: string, now: Date, timeZone: string): ComparisonSeries` | pure function | Produces a fictional but plausible current + reference cumulative series pair in the **existing** `ComparisonSeries` shape (`src/card/types.ts`), so the normal render pipeline (chart, summary, period label) consumes it unchanged (research R4). |

**Determinism contract** (spec Assumptions):

- Same `(unit, now, timeZone)` → same output on every call (no `Math.random`, no unseeded
  state). A fixed seed / fixed shape function is used.
- The series align to the card's **default** windows (default preset `year_over_year`, default
  aggregation) so the period label and axis match what the card would show with real data.
- Magnitudes are plausible for the card's domain (e.g. daily kWh values in a realistic range);
  the unit is the one passed in (the configured entity's unit, or `kWh` when no entity is
  found — FR-009, Assumptions).
- The reference series is a full period; the current series ends at `now` (mirroring the real
  data shape: current partial, reference complete).

**Lifetime**: created on demand in picker mode, held only for the element's lifetime, never
persisted, never written to `_config` or `_state` as a "real" series (it is rendered through the
same `ComparisonSeries` channel, but only while `preview === true`).

## Real-data query in picker mode (reused, time-limited)

| Aspect | Value |
|---|---|
| Query path | The existing `buildLtsQueriesForWindows` + `sendMessagePromise` + `mapLtsResponseToCumulativeSeries` pipeline (research R4) — no new HA API. |
| Time limit | A short timeout (~2–3 s) via `Promise.race` against the query promise. The exact value is an implementation constant in `picker-preview.ts`. |
| Success | Query resolves in time **and** yields a current series → the preview updates in place to the real data (FR-014). |
| Failure / timeout / empty | The demo series stays; no loading or error state (FR-008, FR-011). |
| Cancellation | When the element is disconnected (picker closed) or the config changes, the in-flight query result is discarded (the existing generation mechanism applies). |

## State machine (picker-mode preview)

```
picker opens (preview = true, sample config set)
        │
        ▼
[DEMO]  demo series rendered immediately (no query yet)
        │
        ├── query succeeds in time + current series present ──▶ [REAL] real data rendered (in place)
        │
        ├── query fails / times out / empty ──────────────────▶ [DEMO] (unchanged)
        │
        └── element disconnected / config change ─────────────▶ (discarded; picker closed)
```

- `[DEMO]` and `[REAL]` are both "ready" renders — the picker never sees a loading or error
  state (FR-011, SC-004).
- The transition `[DEMO] → [REAL]` is at most once per picker session (the query is fired once).

## What is NOT in the data model

- No new `CardConfig` keys (the sample config uses existing keys only).
- No new `CardState` fields (picker mode reuses the existing `ready` render path).
- No storage of any kind (no `sessionStorage`, no module-level cache of preview results —
  every picker session regenerates the preview fresh, spec Edge Cases).
- No new translation keys expected (the demo series reuses the card's existing panel labels;
  if a key turns out to be needed during implementation, it is added to all four locales).
