# Decision: Tymczasowe przesuwanie okna czasowego (transient time-window preview)

- **Slug**: timewindow-preview
- **Decided**: 2026-11-05
- **Verdict**: go
- **Artifacts reviewed**: intake.md ✓ | research.md ✓ | problem.md ✓ | concept.md ✓

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | strong | The problem is real and clearly defined: users cannot inspect past periods without a persisted config change (affects all viewers) or leaving the card for the less-visual HA statistics page. The cost of inaction is concrete and recurring. |
| Evidence strength | adequate | Technical feasibility is high-confidence (prior art: `time_window.offset`, stateless `resolveTimeWindows`, generation-based load lifecycle, `periodLabel`, no-data state, `buildLtsQueriesForWindows` — all in production). Demand breadth is medium-confidence (second-hand owner report, no tickets or usage data). Overall medium-high per research.md. |
| Value vs. inaction | adequate | Solving it removes a real, recurring friction (edit persisted config → revert, or switch pages). The value is clear for the owner and reported user interest, but demand breadth beyond the owner is unverified. |
| Feasibility / appetite | strong | Option A is small (days), reuses machinery already in production (window algebra, generation-based load lifecycle, period label, no-data state), introduces no new HA APIs, no new dependencies, and no config model changes. |
| Strategic fit | strong | Aligns with the constitution: uses existing HA patterns and native APIs (Principle I), defensive data handling with graceful degradation to the existing no-data state (Principle II), TypeScript strict + testable (Principle III), simple solution preferred over "magic" (Principle V), no new NPM dependencies. Tension: Principle IV (accessibility is a requirement) — Option A defers full a11y/i18n polish to a follow-up; the interim buttons must still be keyboard-accessible and labeled. |
| Risk posture | adequate | The main risk (state-lifetime mechanism: holding the shift outside the card element so it survives SPA view navigation but clears on full reload) is identified and flagged as the top rabbit hole. It is a known unknown, not an unmitigated risk — it must be validated early during specification. Secondary risks (stale loads, card identity derivation) are understood and bounded. |

## Verdict & Rationale

**Go.** The problem is real and well-defined (strong validity). The technical evidence is high-confidence — the feature reuses machinery already in production, and no new HA APIs or dependencies are needed. The demand signal is adequate but not strong (second-hand, no usage data), which is acknowledged and carried forward as an open question rather than a blocker. Option A is the smallest credible path that meets all stated goals, including the two that are easy to miss: the preview must be clearly recognizable, and the state must survive in-session view navigation while being discarded on a full reload. The main risk (state-lifetime mechanism) is identified and bounded — it is a validation task for specification, not a reason to stop.

The user has confirmed Option A as the chosen approach.

## If go — Handoff to `/speckit-specify`

- **Problem**: Users cannot inspect past periods on the card without a persisted config change (affects all viewers) or leaving the card for the less-visual HA statistics page. A transient, in-card shift is needed.
- **Chosen approach**: Option A — Minimal in-card shift. Two arrow buttons (left/right) in the top-right corner of the chart; each click shifts the entire resolved window set by the window's nominal width (calendar-aware for month/year, exact days for day-based). A minimal text indicator (built on the existing `periodLabel`) makes the preview recognizable. The shift state is held outside the card element so it survives SPA view navigation within a session and is discarded on full page reload. No-data periods fall through to the existing no-data state.
- **In scope**: transient shift by nominal window width; minimal preview indicator; state surviving in-session view navigation; standard no-data handling; uniform behavior across all presets (including legacy, no exceptions).
- **Out of scope**: window-size change (month → year) — deferred; persistence to config/storage/URL; arbitrary period picker/calendar; new HA APIs or LTS query changes; Figma-driven visual polish (styled badge, full a11y/i18n pass) — deferred to a follow-up; legacy preset special-casing.
- **Success metrics**: (1) effort to inspect the previous period reduced to a single in-card interaction; (2) configuration byte-identical after reload (testable); (3) preview awareness at a glance (qualitative); (4) no-data consistency with existing behavior (testable); (5) adoption signal — open, no usage analytics exist.
- **Carried-forward open questions**:
  - [NEEDS CLARIFICATION: adoption signal — no usage analytics exist for the card; define a proxy (e.g., HACS issue/PR feedback) or accept qualitative owner assessment. Non-blocking.]
  - Validate: HA's SPA navigation preserves the page/window so an out-of-element in-memory store survives view-to-view navigation while a full reload clears it.
  - Validate: a stable card identity can be derived to key the transient state per-card.
  - Validate: the generation-based load lifecycle can be extended to re-load on shift without modifying `_config`, without stale loads or races with `hass` updates.
