# Research — `910-card-picker-preview` (Phase 0)

Resolves the technical unknowns from the plan's Technical Context and the spec's
behavioral decisions. Each entry: **Decision / Rationale / Alternatives considered**.

Sources: `home-assistant/frontend` (dev branch) — `src/panels/lovelace/card-suggestions/index.ts`,
`src/panels/lovelace/card-suggestions/types.ts`, `src/data/lovelace_custom_cards.ts`,
`src/panels/lovelace/editor/card-editor/hui-card-picker.ts`,
`src/panels/lovelace/editor/card-editor/hui-suggestion-card.ts`,
`src/panels/lovelace/editor/get-card-stub-config.ts`, `src/panels/lovelace/cards/hui-card.ts`,
`src/panels/lovelace/types.ts`.

## R1. How the "By entity" view decides which cards to suggest

**Decision**: The card picker's "By entity" view calls
`generateCardSuggestions(hass, entityId)`, which (a) runs the built-in core suggestion providers
and (b) **flat-maps `window.customCards` and calls `card.getEntitySuggestion(hass, entityId)`**
on each entry. The returned value is `CustomCardSuggestion | CustomCardSuggestion[] | null`,
where `CustomCardSuggestion = { label?: string; config: LovelaceCardConfig }`. A `null` return
means "not suggested for this entity". The picker renders each suggestion as a
`hui-suggestion-card` with a live preview (`<hui-card .config preview>`).

**Rationale**:
- This is the **only** hook a custom card has to appear in the entity-suggestion list. Our
  current registration (`src/index.ts`) has no `getEntitySuggestion`, so the card is never
  suggested — exactly the reported bug (US1).
- The call is synchronous and must not throw (the picker wraps it in try/catch and logs
  "Custom card … getEntitySuggestion threw" — a throwing card is silently dropped from the
  suggestions). The implementation must therefore be a cheap, pure, total function of
  `(hass, entityId)`.
- The returned `config` is what the picker uses both for the suggestion's live preview and as
  the starting configuration when the user picks the suggestion (FR-004, US1 scenario 4: the
  added card starts from the selected entity).

**Alternatives considered**:
- *Rely on `getStubConfig` for the entity view*: rejected — `getStubConfig` is only consulted
  by the "By card" gallery (`getCardStubConfig` in `hui-card-picker.ts`); it is never called
  from the suggestion path.
- *Register a core-style `CardSuggestionProvider`*: not possible — the core registry
  (`CARD_SUGGESTION_PROVIDERS`) is compiled into the frontend; custom cards can only use the
  `getEntitySuggestion` hook on their `window.customCards` entry.

## R2. How the "By card" gallery renders a custom card's preview

**Decision**: In the "By card" view, `hui-card-picker._renderCardElement` calls
`getCardStubConfig(hass, type, unusedEntities, usedEntities)`, which resolves the card element
class and invokes its **static `getStubConfig(hass, entities, entitiesFallback)`** (signature
per `LovelaceCardConstructor` in `src/panels/lovelace/types.ts`). The resulting config is
rendered via `<hui-card .config preview>` — i.e. the **real card element** is instantiated in
the picker with `preview = true` (and `editMode = true` for backwards compatibility).

**Rationale**:
- Our current `static getStubConfig(): Partial<CardConfig>` ignores all three arguments and
  returns `entity: ""` — the card then loads with no entity and renders the no-data message
  (US2). The fix is to implement the full signature: pick a suitable entity from
  `entities` (unused, available) / `entitiesFallback` (used, available) by supported unit, and
  return a sample config referencing it.
- `hui-card` forwards `preview` to the inner element (`this._element.preview = this.preview`),
  so the card element **can detect picker mode** via a `preview` property. Our element does not
  currently declare one — `hui-card`'s assignment is a no-op today. Adding a plain
  `preview` property (plus `editMode` alias handling) is required for the demo-series fallback
  (R4) and for hiding the 909 preview controls in picker mode (spec Assumptions: the preview is
  non-interactive).
- The picker passes `unusedEntities` first and `usedEntities` as fallback — the same
  `findEntities`-style heuristic core cards use. We mirror it: prefer an unused entity with a
  supported unit, then a used one.

**Alternatives considered**:
- *Always return a config with an empty entity and let the card render a demo series*: rejected
  — the spec (FR-007, Q2 clarification) requires the "By card" preview to **prefer a real,
  suitable user entity** so the preview reflects the user's own data; the demo series is the
  fallback, not the default.
- *Use `getDefaultConfig` instead*: rejected — `getDefaultConfig` is only used by the editor's
  "reset to defaults" flow, not by the picker preview.

## R3. What "supported unit" means for the suggestion check

**Decision**: `getEntitySuggestion` returns a suggestion **iff** the entity exists in
`hass.states` and its `attributes.unit_of_measurement` is one of the card's supported units:
`kWh`, `Wh`, `MWh`, `m³`, `l` (FR-003). The check is an exact, case-sensitive string match
against the documented set. The returned config is the sample preview configuration with
`entity: entityId` and the card's default preset/interpretation (FR-004).

**Rationale**:
- The card already reads the unit from
  `hass.states[entity].attributes.unit_of_measurement` in its data pipeline
  (`cumulative-comparison-chart.ts`), so the suggestion check uses the same source of truth —
  no new HA API, no new assumptions.
- Exact matching (not fuzzy/derived, e.g. not inferring from `device_class: energy`) keeps the
  contract precise and testable (SC-001/SC-002: 100% of supported-unit entities suggested, 0%
  of unsupported ones). Entities without a `unit_of_measurement` attribute are not suggested
  (the unit is unknown, not supported).
- The supported-units set is a single exported constant (one source of truth) shared by the
  suggestion check, the gallery entity search, and the tests.

**Alternatives considered**:
- *Suggest on `device_class` (e.g. `energy`, `gas`, `volume`)*: rejected — broader than the
  spec (FR-001/FR-002 are unit-based), and `device_class` is not always present; it would also
  suggest for units the card does not document (e.g. `kWh` is fine, but `device_class: energy`
  can carry other units).
- *Suggest for every entity*: rejected — directly violates FR-002/SC-002.

## R4. Demo-series fallback: where and when it renders

**Decision**: The card element gains a **demo-series render path** used **only in picker mode**
(`preview === true`). In picker mode the card:

1. **Immediately** renders the standard appearance with a **deterministic fictional demo series**
   (current + reference cumulative series, plausible magnitudes, unit taken from the configured
   entity's `unit_of_measurement` or a default energy unit `kWh`) — no query, no loading state
   (FR-014, FR-011, SC-004).
2. **Then** fires the normal data query (the same LTS `statistics_during_period` path) with a
   **short time limit** (a `Promise.race` against a timeout, ~2–3 s). If the query succeeds in
   time **and** yields a current series, the preview updates in place to the real data
   (FR-007, FR-014). On failure, timeout, or empty result, the demo series stays (FR-008,
   FR-011) — no loading or error state is ever shown in the picker.

The demo series is generated by a **pure function** (deterministic: same input → same output on
every render; spec Assumptions) that produces a `ComparisonSeries`-shaped object (current +
reference `CumulativeSeries` with `TimeSeriesPoint[]`), so the existing chart renderer, summary,
and period-label pipeline can consume it unchanged.

**Rationale**:
- Rendering the demo series **first** (before any query resolves) is what FR-014 requires: the
  picker must show a rendered chart immediately, with no blank/loading state. A query-first
  approach would show a loading state or a blank card until the query resolves — forbidden by
  FR-011/SC-004.
- Reusing the existing `ComparisonSeries`/`CumulativeSeries` types means the demo path feeds the
  **same** render pipeline as real data — the preview is visually on par with the card's normal
  appearance (FR-005, US2 scenario 2) with zero new rendering code.
- The time-limited query reuses the existing `buildLtsQueriesForWindows` +
  `mapLtsResponseToCumulativeSeries` path (no new HA API, no new query shape). The timeout is a
  plain `Promise.race` — no new dependency.
- Picker mode is detected via the `preview` property forwarded by `hui-card` (R2). In normal
  (dashboard) mode the demo path is never taken — the card behaves exactly as today.

**Alternatives considered**:
- *Always render the demo series in the picker, never query*: rejected — the spec (Q1
  clarification) explicitly chose "query with a short time limit + demo fallback" so the preview
  reflects the user's real data when available (US3).
- *Show a loading state until the query resolves*: rejected — FR-011/SC-004 forbid any loading
  or error state in the picker.
- *A separate lightweight "preview renderer"*: rejected — duplicates the render pipeline and
  risks the preview diverging from the card's real appearance (violates FR-005 and Principle V).

## R5. The sample preview configuration (what `getStubConfig` / `getEntitySuggestion` return)

**Decision**: Both hooks return the same **sample preview configuration** shape:

```ts
{
  entity: <selected or found entity id>,   // "" only if no suitable entity exists
  comparison_preset: "year_over_year",     // the card's default preset
  interpretation: "consumption",           // the card's default interpretation
  neutral_threshold: 2                     // the card's default threshold
}
```

- **Entity picker** (`getEntitySuggestion`): `entity` is always the selected entity (the hook
  only fires for supported-unit entities, so it is never empty).
- **Gallery** (`getStubConfig`): `entity` is the first suitable entity found in
  `entities` (unused) then `entitiesFallback` (used) by supported unit; `""` when none exists —
  in which case the card's picker-mode demo path renders with the default unit (FR-008,
  Assumptions).

**Rationale**:
- This is exactly the card's current `getStubConfig` content (minus the empty-entity problem),
  so the sample config is the card's **default configuration** — the preview shows the card in
  its standard, out-of-the-box appearance (FR-005, FR-009).
- The config is what the picker uses as the starting point when the user adds the card
  (FR-010: the normal configuration flow starts from it; in the entity flow the selected entity
  is pre-filled, in the gallery flow the user picks an entity in the editor).
- Keeping the sample config minimal (no `time_window`, no panel toggles) means the preview uses
  the card's defaults for everything else — the standard appearance (FR-009).

**Alternatives considered**:
- *Return a richer config (e.g. a short `time_window` for faster real-data queries)*: rejected —
  the preview's real-data query uses the card's default window (the same query the card would
  run); a special short window would make the preview's real-data view differ from what the user
  gets after adding the card, and adds config surface that is never persisted (FR-010).

## R6. Hiding the 909 preview controls in picker mode

**Decision**: The card's transient time-window preview controls (909: back/forward/reset,
rendered around `cumulative-comparison-chart.ts` L1516–1535) are **not rendered** when
`preview === true` (picker mode). The picker preview is non-interactive (spec Assumptions).

**Rationale**:
- The 909 controls are a view-mode feature of the card on a dashboard; in the picker the card is
  a static preview — interactive controls there would be confusing and could fire loads the
  picker does not expect (FR-013: the preview must not interfere with the picker).
- Hiding them is a single render guard (`this.preview`), no new state.

**Alternatives considered**:
- *Leave the controls visible but inert*: rejected — dead UI in a preview is worse than no UI
  (Principle IV), and "inert" still requires state.

## R7. Testability strategy

**Decision**: The new logic is split into **pure, exported functions** so it is unit-testable
without a live HA instance:

- `isSupportedUnit(unit: string | undefined): boolean` — the supported-units check (R3).
- `findSuitableEntity(hass, entities, entitiesFallback): string | undefined` — the gallery
  entity search (R2/R5).
- `buildEntitySuggestion(hass, entityId): CustomCardSuggestion | null` — the suggestion hook
  body (R1/R3).
- `buildDemoComparisonSeries(unit: string, now: Date, timeZone: string): ComparisonSeries` —
  the deterministic demo series (R4).
- The time-limited query wrapper (R4) — testable with a fake `sendMessagePromise` that resolves
  late / rejects.

The element-level behavior (picker-mode render, demo-first-then-real update, controls hidden)
is covered by integration tests with a stubbed `hass` (the existing `tests/integration/`
pattern).

**Rationale**:
- The constitution (Principle III) requires key functions to be covered by tests; pure functions
  are the cheapest, most reliable way to cover the suggestion logic (SC-001/SC-002) and the demo
  series determinism (FR-009, Assumptions).
- The existing test suite (564 tests) already stubs `hass` and `sendMessagePromise` in
  integration tests, so the new tests follow the established pattern — no new test
  infrastructure.

**Alternatives considered**:
- *Test only at the element level*: rejected — slower, more brittle, and would not isolate the
  suggestion/demo logic from the render pipeline.
