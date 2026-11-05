# Problem Definition: Brak możliwości tymczasowego podglądu historycznych okresów na karcie

- **Slug**: timewindow-preview
- **Created**: 2026-11-05
- **Inputs used**: intake.md ✓ | research.md ✓

## Problem Statement

Users of the Energy Horizon card who want to inspect consumption in past periods (e.g., the previous month or year) have no way to do so without permanently changing the card's configuration — which is persisted, affects the dashboard for all viewers, and must be manually reverted — or by leaving the card for a less visual alternative (the HA statistics page). The card always shows the same configured window anchored to "now", so a quick "what did last month look like?" check is disproportionately expensive relative to its frequency.

## Affected Users & Stakeholders

- **Users**: Energy Horizon card users (Home Assistant dashboards) — they cannot quickly compare past periods against the current view; today they must reconfigure the card (persisted change), maintain multiple cards with different static configs, or switch to the HA statistics page. [source: research.md — Users & Demand, Market & Context]
- **Users**: Project owner — the primary user who raised the idea; wants to inspect past months/periods quickly on his own dashboard. [source: intake.md — quoted idea]
- **Stakeholders**: Project owner (maintainer) — decides scope and implementation; the card is distributed via HACS, so the feature (or its absence) affects all HACS users. [source: research.md — Market & Context]
- **Stakeholders**: HACS user community — reported interest in this capability (second-hand signal, no tickets cited). [source: research.md — Users & Demand, confidence: medium]

## Goals

- A user can inspect the same card's data for a previous period (one period back, then further back, repeatedly) without touching the card configuration.
- The inspection is clearly recognizable as a temporary preview — the user is never in doubt whether the chart shows the configured default or a shifted period.
- The temporary state is fully discarded on a full view/page reload — the card always returns to its configured default; no configuration is ever modified or persisted as a side effect.
- The preview state survives navigation between dashboard views within the same browser session — the user can step back multiple times, navigate away and back, and the preview is retained (held in transient in-memory state, not written to config or storage). [source: user clarification 2026-11-05]
- The period shift follows the window's nominal width as already defined by the card's time-window model (calendar-aware for month/year widths, exact day counts for day-based widths) — consistent with how the card already computes windows. [source: research.md — Data & Constraints, window model interaction]
- Periods with no or partial data are handled by the card's existing missing-data behavior — no special-casing. [source: intake.md — Clarification 2]

## Non-Goals

- Changing the window's size/width (e.g., month → year) — explicitly deferred to a later iteration. [source: intake.md — Clarification 7]
- Persisting the shifted state to the card configuration, HA storage, or URL — the preview never modifies or writes the saved config. (The state is held only in transient in-memory state that survives view navigation within a session, per the goal above.) [source: intake.md — Clarifications 4, 6; user clarification 2026-11-05]
- Modifying the existing time-window configuration model, presets, or validation rules.
- Introducing new Home Assistant data APIs or changing LTS query semantics. [source: research.md — Prior Art, buildLtsQueriesForWindows]
- Providing a mechanism to jump to an arbitrary named period (e.g., "March 2025") via a picker or calendar — only step-by-step backward and forward shifting is in scope. [source: user clarification 2026-11-05]
- Special-casing the legacy preset mechanism (backward compatibility) — the preview works through the unified path and gets no exceptions or additional support for the legacy mechanism. [source: user clarification 2026-11-05]

## Success Metrics

- **Effort to inspect the previous period**: from "edit card config (persisted) or switch to statistics page" to a single in-card interaction. (baseline: config edit / page switch — qualitative, no usage data recorded)
- **Configuration integrity**: after using the preview any number of times and reloading the view, the card's configuration is byte-identical to before and the chart shows the configured default. (baseline: n/a — new behavior; verifiable by test)
- **Preview awareness**: a user can tell at a glance that the chart shows a shifted period, not the configured default. (qualitative)
- **Data behavior consistency**: a shifted period with no data renders the card's standard no-data state, identical to today's missing-data handling. (baseline: existing `no-data` state — verifiable by test)
- **Adoption signal**: [see Open Questions — no usage analytics exist for the card; proxy or qualitative owner assessment to be defined]

## Cost of Inaction

Users who want to inspect past periods continue to rely on workarounds: (a) editing the card's persisted configuration and reverting it — error-prone, affects all dashboard viewers in the meantime; (b) maintaining multiple cards with different static configs — dashboard clutter; (c) switching to the HA statistics page — a different, less visual context. The card's value as a comparison tool stays limited to the single configured window anchored to "now", and the reported user interest goes unaddressed. [source: research.md — Market & Context]

## Clarifications (2026-11-05, user)

1. **Preset availability**: in the current version, presets function as variants of `custom` (overriding YAML settings), so the difference between `custom` and presets is cosmetic — the preview works uniformly across all of them. The legacy preset mechanism (backward compatibility) gets no exceptions and no additional support.
2. **Visual form**: two arrow buttons (left / right) in the top-right corner of the chart. (Interim/test form — a Figma design will be provided later.)
3. **State persistence across view navigation**: the user must be able to step back multiple times, so the card must remember the transient state across navigation between dashboard views within the same browser session. It is discarded only on a full view/page reload.
4. **Arbitrary period picker**: out of scope — only step-by-step backward and forward shifting; no picker/calendar for jumping to an arbitrary moment.

## Open Questions

- [NEEDS CLARIFICATION: adoption signal — no usage analytics exist for the card; define a proxy (e.g., HACS issue/PR feedback) or accept qualitative owner assessment. Non-blocking for shaping/deciding.]
