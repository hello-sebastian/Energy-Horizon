# Concept: Tymczasowe przesuwanie okna czasowego (transient time-window preview)

- **Slug**: timewindow-preview
- **Created**: 2026-11-05
- **Recommended option**: Option A — Minimal in-card shift

## Options

### Option A — Minimal in-card shift (smallest viable)
- **Sketch**: Two arrow buttons (left / right) appear in the top-right corner of the chart. Each click shifts the entire resolved window set by the window's nominal width (calendar-aware for month/year widths, exact day counts for day-based widths), reusing the card's existing window algebra. A compact indicator — built on the period label the card already computes — makes clear the chart is showing a shifted preview rather than the configured default. The shift state is held outside the card element so it survives navigation between dashboard views within the same browser session, and is discarded on a full page reload. Periods with no or partial data fall through to the card's existing no-data state.
- **Appetite**: small (days) — with the caveat that the state-lifetime mechanism (see Rabbit holes) is the main risk that could push it toward medium.
- **Trade-offs**: Wins — meets every stated goal with the lightest footprint; reuses machinery already in production (window algebra, generation-based load lifecycle, period label, no-data state); no new HA APIs; no config changes. Sacrifices — the visual indicator is minimal (text-based, not a polished badge); the buttons use the interim form, not the Figma design; no accessibility/localization polish beyond the minimum. Risk — the state must live outside the card element to survive view navigation, which is a non-trivial integration point.
- **Rabbit holes**: (1) Deriving a stable card identity to key the transient state, so distinct cards don't share state and the same card keeps its state across navigation; (2) extending the generation-based load lifecycle to re-load on shift without modifying `_config`, without introducing stale loads or races with `hass` updates; (3) confirming HA's SPA view navigation actually preserves the page/window (so an out-of-element store survives) — if HA destroys and rebuilds more aggressively than assumed, the mechanism must change.

### Option B — Full preview experience
- **Sketch**: Everything in Option A, plus a polished visual indicator (a styled badge or modified header rather than plain text), refined left/right affordances, a full accessibility and localization pass, and the Figma-driven button design once it is provided.
- **Appetite**: medium (weeks).
- **Trade-offs**: Wins — a more discoverable, accessible, and visually clear preview; aligns with the eventual Figma design. Sacrifices — more UI surface (styling, a11y, i18n), and part of the work is blocked or speculative because the Figma design has not arrived yet. Risk — scope creep in the UI layer; the core shift logic is identical to Option A, so the extra cost is almost entirely presentation.
- **Rabbit holes**: The Figma design may imply more UI structure than the current minimal card header can absorb cleanly; localizing the indicator across all supported locales; keeping the interactive controls accessible and non-conflicting with the existing header/title/icon.

### Option C — Do nothing / rely on the existing offset
- **Sketch**: Do not build the transient preview. Instead, document that users who want a different period can set the persisted `time_window.offset` (e.g., `-P1M`) or use the HA statistics page.
- **Appetite**: none (a small docs-only effort at most).
- **Trade-offs**: Wins — zero build cost, zero new integration risk. Sacrifices — the core problem stays unsolved: the persisted offset is not transient (it changes the saved config, affects all dashboard viewers, and must be manually reverted), and the statistics page is a different, less visual context. The reported user interest goes unaddressed.
- **Rabbit holes**: None to build, but the workaround friction — and the risk of a user leaving a persisted offset set — remains.

## Recommendation

**Option A — Minimal in-card shift.** It is the only option that meets all stated goals — including the two that are easy to miss: the preview must be clearly recognizable, and the state must survive in-session view navigation while being discarded on a full reload. It does so with the smallest footprint, reusing machinery that is already in production (window algebra, generation-based load lifecycle, period label, no-data state) and introducing no new HA APIs or config changes.

Option B's additional value is almost entirely presentational and is partly blocked on a Figma design that has not arrived; that polish is better deferred to a follow-up iteration now that the interim button form is explicitly a placeholder. Option C leaves the central problem — a quick, non-persisted, in-card look back — unsolved, because the existing `time_window.offset` is persisted and affects every viewer.

The one genuine risk in Option A is the state-lifetime mechanism (holding the shift outside the card element so it survives SPA view navigation but clears on reload). That is flagged as the top rabbit hole and should be validated early during specification.

## Out of Scope (for the recommended option)

- Changing the window's size/width (e.g., month → year) — deferred to a later iteration.
- Persisting the shifted state to card configuration, HA storage, or URL — the preview never writes the saved config.
- Jumping to an arbitrary named period via a picker or calendar — only step-by-step forward/backward shifting.
- Special-casing the legacy preset mechanism — the preview works through the unified path with no exceptions.
- New Home Assistant data APIs or changes to LTS query semantics.
- The Figma-driven visual polish (styled badge, refined affordances, full a11y/i18n pass) — deferred; the interim arrow buttons and a minimal text indicator are sufficient for this iteration.

## Assumptions to Validate

- HA's SPA navigation between dashboard views preserves the page/window (so an out-of-element, in-memory store survives view-to-view navigation) while a full page reload clears it. If HA's view lifecycle is more aggressive than assumed, the state mechanism must change.
- A stable identity can be derived for a card so the transient state is keyed per-card (distinct cards don't share state; the same card keeps its state across navigation).
- The existing generation-based load lifecycle can be extended to trigger a re-load on shift without modifying `_config`, without introducing stale loads or races with `hass` updates.
- The interim arrow-button form and a minimal text indicator are acceptable for this iteration, with the Figma design arriving later as a follow-up.
- The second-hand demand signal is sufficient to justify building (the adoption-signal metric in problem.md is still open — no usage analytics exist).
