# Problem Definition: Chart rows do not identify the concrete periods being compared

- **Slug**: tooltip-period-names
- **Created**: 2026-11-22
- **Inputs used**: intake.md + research.md

## Problem Statement

Users comparing energy periods with the Energy-Horizon card cannot read off the chart's tooltip or legend which concrete period each row represents — every row is labeled with the generic "Current period" / "Reference period" (in multi-window mode: "Reference period (2)"…), so the user must leave the chart and cross-reference the summary captions. In multi-window mode the generic names are the *only* row identifiers, making rows unmappable to concrete periods in place. The problem is live now: it is recorded as open issue #74 from the 1.3.0-beta feedback batch and it worsens as window counts grow (up to 24).

## Affected Users & Stakeholders

- **Users (all)**: Energy-Horizon card users on any two-window comparison — on hover, the tooltip rows do not say *which* periods are being compared; the names are only visible in the summary captions, off the hover surface. (research §Users & Demand; issue #74)
- **Users (most affected)**: multi-window / custom-window users of 1.3.0-beta — with up to 24 windows, "Reference period (N)" rows carry no period identity at all; distinguishing rows requires counting or leaving the chart. (research §Users & Demand, §Data & Constraints)
- **Stakeholders**: project owner — received the feedback, appended three analysis notes (period-kinds analysis, reuse of existing naming mechanisms, UX/UX-writing care), and tracks issue #74. (intake, Origin & Context)
- **Stakeholders**: the 1.3.0-beta feedback cohort — the reporter also filed #73 (line colors) and #75 (comparison table) the same day, so chart-readability friction is an active, not one-off, concern for at least one power user. (research §Users & Demand)

## Goals

- Hover/legend rows convey which concrete period they represent, in the user's HA language, without leaving the chart. (issue #74; research §Prior Art — the requested format is exactly what the project's own period-labeling mechanism already produces)
- The user can still tell which window is the *current* (primary) one versus reference/context windows — role semantics must survive, not just dates. (research §Evidence Against: "Role semantics are lost with pure date names") Owner constraint (2026-11-22): "Current period" is reserved for the actual current (green) series and must not label a rolled-back (preview) window.
- Where no name can be computed for a window, the row keeps the current generic label — no empty or placeholder rows, and no invented names. (issue #74 expected behavior)
- Behavior covers the basic two-window comparison **and** multi-window mode, including shifted (preview) periods — the label follows the drawn series, consistent with the 909 FR-021 contract. (issue #74; research §Prior Art: 909 preview)
- Wording, length, and role expression are treated as a UX-writing decision across all shipped HA languages (ICU month-name lengths differ; Polish names are lowercase). (owner note 3; research §Market & Context)
- The solution stays within the project's existing period-naming mechanisms wherever possible — no parallel new formatter. (owner note 2; research §Data & Constraints: mechanism inventory)

## Non-Goals

- No changes to the window model, data fetching, or card configuration (YAML surface). (research §Data & Constraints — names are precomputed strings, zero data impact)
- No changes to X-axis tick labels or the tooltip *header* (the X-axis slot date/time formatter) — a separate, already-localized mechanism. (research §Data & Constraints: mechanism 5)
- No new user-facing option/config for controlling label style.
- No redesign of the summary/comparison section layout (whether caption *form* is aligned with the new naming is an open question, not an established goal).

## Success Metrics

- On every standard preset (YoY / MoY / MoM), tooltip and legend rows show the concrete localized period name (e.g. "October 2026" / "October 2025", "2026" / "2025"). **Qualitative** — no telemetry exists; baseline: 100% of rows generic. (issue #74; research §Gaps: no adoption data)
- 100% of windows for which a name *can* be computed are named via an existing project mechanism (no new formatter introduced). **Measurable** by code review; baseline: 0 rows named. (owner note 2)
- The generic label appears only on rows where no name is computable — zero empty rows; fallback path exercised and test-covered. **Measurable** (unit/integration tests). Baseline: generic on all rows by construction.
- Tooltip→panel consistency logic keeps passing — rows remain matchable by name. **Measurable** (existing integration tests, currently pinned to the generic names and will be updated as part of the change). (research §Data & Constraints: seriesName matching)
- All 5 shipped locales (en, pl, de, fr, nl) render names correctly, including ICU casing (lowercase Polish month names). **Measurable** (locale tests). Baseline: locale resolution already in place.
- Qualitative: the issue #74 reporter confirms the tooltip/legend now identifies the periods. Single-report basis — confidence: medium.

## Cost of Inaction

The primary comparison surface (hover) stays ambiguous. For standard two-window users the cost is **low-to-moderate**: the names are already visible in the summary captions on the same card, so cross-referencing is possible (research §Market & Context). For multi-window users the cost is **higher**: generic "Reference period (N)" rows are the only row identifiers — with many windows, in-place period identification is effectively impossible. Issue #74 stays open and the 1.3.0-beta readability friction (same batch as #73/#75) persists. No compliance, legal, or performance cost exists either way (research §Data & Constraints). Doing nothing is defensible for the basic case but leaves the strongest user complaint — multi-window identification — unaddressed as the feature matures toward 24 windows.

## Open Questions

- [NEEDS CLARIFICATION: Naming policy for custom (non-calendar-aligned) windows — long start-month name, compact range, or generic fallback? Which windows count as "nameable" under the owner's reuse-only directive? (research §Gaps, Evidence Against: mislabeling risk)]
- [NEEDS CLARIFICATION: UX writing: name-only ("October 2026") vs role + name ("Current period · October 2026")? Summary captions already use the "role (name)" pattern — consistency cuts both ways. (research §Gaps)]
- [NEEDS CLARIFICATION: How should context series (index ≥ 2, currently "Reference period (2)") be named under the new scheme? (research §Gaps)]
- [NEEDS CLARIFICATION: Does the forecast series label ("Current period forecast") follow the new naming (e.g. "2026 forecast") or stay as is? (research §Gaps)]
- [NEEDS CLARIFICATION: Is the summary caption in scope for alignment (abbreviated vs long month form)? (research §Gaps)]
- [NEEDS CLARIFICATION: Is the card picker preview (910, demo series with empty periodLabel) in scope? (research §Gaps)]
- [NEEDS CLARIFICATION: Adoption/usage data for 1.3.0-beta / multi-window — no telemetry; demand evidence is a single specific report. *(Decide-stage input rather than a specification blocker.)* (research §Gaps)]
