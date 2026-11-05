# Idea Research: Tymczasowe przesuwanie okna czasowego na karcie

- **Slug**: timewindow-preview
- **Created**: 2026-11-05
- **Updated**: 2026-11-05 (user supplement: demand signal + shift-step semantics)
- **Evidence confidence (overall)**: medium-high

## Users & Demand

- The idea originates from the project owner (single user, pasted text). — [source: intake.md, pasted text] (confidence: high)
- **Users have expressed interest in this feature** — the owner reports that users have shown interest in a transient time-window shift capability. — [source: user supplement, 2026-11-05] (confidence: medium — second-hand report, no tickets or usage data cited)
- The card's primary use case is energy consumption comparison (YoY, MoM, custom). A transient shift extends this to "what did last month / last year look like?" without reconfiguring the card. — [ASSUMPTION — inferred from the card's preset model in `presets.ts` and the idea's stated motivation] (confidence: medium)
- The owner's stated motivation: "użytkownik może szybko sprawdzić zużycie w poprzednich miesiącach/okresach" — a personal/operational need to inspect past periods quickly. — [source: intake.md, quoted idea] (confidence: high)

## Prior Art

- **`time_window.offset` (feature 900, implemented)**: a *config-level, persisted* ISO 8601 offset applied via `DateTime.plus(Duration.fromISO(offset))` in the HA time zone. It shifts the window anchor statically and is part of the saved card config. The transient shift idea is a *runtime, non-persisted* analogue of this concept — same algebra, different lifecycle. — [source: `specs/900-time-model-windows/spec.md` (FR-900-Q), `src/card/time-windows/parse-time-window-offset.ts`, `src/card/time-windows/resolve-windows.ts`] (confidence: high)
- **`period_offset` (legacy, YAML-only)**: a year-based offset for YoY/MoM presets, managed at the config level by the preset switch. It is a static, persisted value — not a transient runtime shift. — [source: `specs/904-configuration-surface/spec.md`, `src/card/time-windows/presets.ts`] (confidence: high)
- **`resolveTimeWindows(merged, now, timeZone, …)`**: a pure, deterministic function that produces `ResolvedWindow[]` for a given `(now, timeZone)`. The window model is stateless — a transient shift can be expressed as an in-memory modification of the merged config (e.g., an additional runtime offset) without touching the persisted `_config`. — [source: `src/card/time-windows/resolve-windows.ts`, `specs/900-time-model-windows/data-model.md` ("Configuration is stateless")] (confidence: high)
- **Card load lifecycle (`_loadGeneration` / `_inFlightGeneration`)**: `setConfig` bumps the generation; `updated()` starts a load only when the generation differs. A transient shift would need to trigger a re-load *without* modifying `_config` — the generation mechanism exists and is the natural integration point. — [source: `src/card/cumulative-comparison-chart.ts` (lines 128–330)] (confidence: high)
- **`no-data` state**: the card already renders an `ha-alert` with `status.no_data` when a query returns no data. This directly supports clarification #2 (standard behavior for missing data in a shifted window). — [source: `src/card/cumulative-comparison-chart.ts` (lines 819–825), `src/card/localize.ts`] (confidence: high)
- **`periodLabel`**: the chart already computes a period label (year or date range) from the current window and passes it to the renderer. This is a foundation for the "transient preview" visual indicator (clarification #5). — [source: `src/card/cumulative-comparison-chart.ts` (lines 721–755), `src/card/chart-renderer.ts` (line 386)] (confidence: high)
- **`buildLtsQueriesForWindows`**: queries are built from resolved windows (`statistics_during_period`). A shifted window simply queries a different past period — no new HA API is required. — [source: `src/card/ha-api.ts` (lines 337–350)] (confidence: high)
- **`minusStepRepeated` / `step` algebra**: the card already steps windows backward by a Luxon `Duration` using `DateTime.minus(step)` in a loop (`resolveGeneric`). The transient shift uses the **same algebra** but applied to the entire window set by the window's **nominal width** (`duration`), not by `step`. For `duration: 1M`, one click shifts by one calendar month (Luxon calendar-aware, including end-of-month clamping); for `duration: 45d`, one click shifts by exactly 45 days; for `duration: 1y`, one click shifts by one calendar year. This is the same `DateTime.minus(Duration)` mechanism already in production. — [source: `src/card/time-windows/resolve-windows.ts` (`minusStepRepeated`, `resolveGeneric`), `src/card/time-windows/duration-parse.ts` (`parseDurationToken`), `specs/900-time-model-windows/spec.md` (Edge Cases 3, 13, 20 — Luxon calendar rules, DST, clamping)] (confidence: high)

## Market & Context

- **HA built-in energy dashboard**: shows current month/year consumption but does not provide a built-in mechanism to step back through past months on a per-card basis. Users who want to compare past periods must either (a) reconfigure the card (persisted, affects the dashboard), (b) use the HA statistics page (different UI, less visual), or (c) maintain multiple cards with different static configs. — [ASSUMPTION — based on general knowledge of HA's energy dashboard; no specific source cited] (confidence: medium)
- **Cost of doing nothing**: users who want to inspect past months must either change the card config (which is persisted and affects the dashboard for all viewers) or switch to the statistics page. The transient shift removes this friction for the common "quick look back" use case. — [ASSUMPTION — inferred from the idea's stated motivation and the card's config model] (confidence: medium)
- **The card is distributed via HACS** (`hacs.json` present in the repo). The feature would be available to all HACS users of the card, but demand breadth beyond the owner is unverified. — [source: `hacs.json` in repo root] (confidence: high)

## Data & Constraints

- **LTS minimum granularity**: 1 hour (`MIN_DURATION_MS`). A shift does not change the window duration, so no new constraint is introduced. — [source: `src/card/time-windows/lts-hard-limits.ts`] (confidence: high)
- **LTS hard limits (anchors, aggregation enum)**: a shift does not change the anchor or aggregation, so the existing validation is unaffected. — [source: `src/card/time-windows/lts-hard-limits.ts`] (confidence: high)
- **Data availability**: the card queries `statistics_during_period` for the resolved window. How far back data is available depends on how long the user has been recording statistics in HA. There is no hard limit on the shift range — when data runs out, the card's existing `no-data` state handles it. — [source: `src/card/ha-api.ts`, clarification #1 in intake.md] (confidence: high)
- **Transient state lifecycle**: the shift state would be a private in-memory field on the card (not part of `_config`), so it is automatically discarded on view reload — aligning with clarifications #4 and #6. No persistence mechanism is needed. — [ASSUMPTION — inferred from the LitElement card model and the clarification that the shift is "tracone po przeładowaniu widoku"] (confidence: medium)
- **Window model interaction**: the shift moves the entire window set by the window's **nominal width** (`duration`), not by `step`. This is unambiguous across all presets and custom windows: `duration: 1M` → shift by one calendar month (Luxon calendar-aware); `duration: 45d` → shift by exactly 45 days; `duration: 1y` → shift by one calendar year. The mechanism is the same `DateTime.minus(Duration)` already used in `minusStepRepeated`. The shift does not change `anchor`, `step`, `count`, or `aggregation` — only the effective start/end of each window. — [source: `src/card/time-windows/resolve-windows.ts`, `src/card/time-windows/duration-parse.ts`, `specs/900-time-model-windows/spec.md` (Edge Cases 3, 13, 20), user supplement 2026-11-05] (confidence: high)

## Evidence Against the Idea

- **Overlap with `time_window.offset`**: a user could argue that a static config-level offset (`offset: -P1M`) already covers "show last month." However, the static offset is persisted and affects the dashboard permanently — it is not a transient preview. The two features are complementary, not redundant, but the overlap may reduce perceived value for users who are comfortable editing YAML. — [source: `specs/900-time-model-windows/spec.md`, `src/card/time-windows/parse-time-window-offset.ts`] (confidence: medium)
- **Demand breadth is still thin**: the owner reports user interest, but no specific tickets, forum threads, or usage metrics are cited. The signal is second-hand and anecdotal. — [source: user supplement 2026-11-05, intake.md] (confidence: medium)
- **Custom window ambiguity — RESOLVED**: the shift is by the window's nominal width (`duration`), not by `step`. For `duration: 45d`, `step: 1M`, one click shifts by 45 days (not 1 month). This is unambiguous and uses the same `DateTime.minus(Duration)` algebra already in production. — [source: user supplement 2026-11-05, `src/card/time-windows/resolve-windows.ts`] (confidence: high)
- **Integration complexity**: the card's load lifecycle is generation-based and tightly coupled to `setConfig`. Introducing a transient shift that triggers a re-load without modifying `_config` requires a new mechanism (or a careful extension of the existing generation logic). This is a non-trivial integration point that could introduce subtle bugs (e.g., stale loads, race conditions with `hass` updates). — [source: `src/card/cumulative-comparison-chart.ts` (lines 128–330)] (confidence: medium)
- **UI surface area**: the arrow buttons in the top-right corner of the chart are a new UI element that must coexist with the existing header, title, icon, and any future controls. The card's current UI is relatively minimal; adding interactive controls increases the surface area for styling, accessibility, and localization. — [ASSUMPTION — inferred from the card's current render structure] (confidence: low)

## Gaps & Open Questions

- [NEEDS CLARIFICATION: should the shift buttons be visible in all presets (YoY, MoM, custom) or only in specific ones?]
- [NEEDS CLARIFICATION: what is the exact visual form of the "transient preview" indicator — a badge, a modified title, a color change, a label like "previous month"?]
- [NEEDS CLARIFICATION: should the shift state survive navigation between dashboard views within the same HA session (i.e., is it per-card-instance or per-view)?]

## Sources

- `specs/900-time-model-windows/spec.md` (local file, feature 900 spec — FR-900-Q offset contract)
- `specs/900-time-model-windows/data-model.md` (local file, window model data model)
- `specs/904-configuration-surface/spec.md` (local file, config surface — `period_offset`, `time_window`)
- `src/card/time-windows/resolve-windows.ts` (local file, window resolution logic)
- `src/card/time-windows/parse-time-window-offset.ts` (local file, offset parser)
- `src/card/time-windows/presets.ts` (local file, preset templates)
- `src/card/time-windows/lts-hard-limits.ts` (local file, LTS hard limits)
- `src/card/cumulative-comparison-chart.ts` (local file, card lifecycle, load generation, no-data state)
- `src/card/ha-api.ts` (local file, LTS query building, data mapping)
- `src/card/chart-renderer.ts` (local file, chart renderer, period label)
- `hacs.json` (local file, HACS distribution)
- `.specify/assessments/timewindow-preview/intake.md` (local file, intake note with clarifications)
- User supplement, 2026-11-05 (conversation: user interest signal + shift-step = nominal `duration` semantics)
