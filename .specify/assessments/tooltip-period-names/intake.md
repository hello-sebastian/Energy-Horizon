# Idea Intake: Actual period names in chart tooltip and legend

- **Slug**: tooltip-period-names
- **Created**: 2026-11-22
- **Source**: pasted text (user feedback report + owner notes); cross-referenced with GitHub issue [#74](https://github.com/hello-sebastian/Energy-Horizon/issues/74) (open, created 2026-11-20)
- **Type**: improvement

## Idea (as captured)

> **Reported feedback**
>
> When hovering over the chart, the tooltip shows "Current period" and "Reference period". It would be better to show the actual names of the periods, e.g. "October 2026" and "October 2025", or "2026" and "2025".
>
> Note: this applies to the basic two-window comparison as well, not only to the new multi-window (timewindow shifting, #69) feature.
>
> **Expected behavior**
>
> - The tooltip (and legend) should use the actual period names, localized to the HA language (e.g. "October 2026" / "October 2025", "2026" / "2025").
> - Fall back to "Current period" / "Reference period" only when a name cannot be computed.
>
> **Feasibility notes**
>
> The period names are already computed by existing label utilities:
> - `src/card/labels/compact-period-caption.ts` — `formatCompactPeriodCaption()` (used for summary captions).
> - `src/card/labels/period-label.ts` — `formatPeriodLabel()`.
> - Series names are built in `src/card/view-model.ts` — `buildReadyViewModel()` (from the `summary.current_period` / `summary.reference_period` strings plus the computed period suffixes); the names flow into the ECharts tooltip/legend from there.
>
> **Od właściciela:**
>
> 1. Należy przeanalizować jakie rodzaje okresów mogą wystąpić
> 2. Przeanalizować jakie mechanizmy nazywania okresów są już wbudowane w projekt – o tyle to możliwe ograniczyć się do korzystania w rozwiązaniu wyłącznie do tych już istniejących mechanizmów
> 3. Zwrócić uwagę na użyteczność, ux, ux-writting

All three referenced files/symbols were verified to exist in the repository at intake time.

## Restated

The card's chart tooltip and legend currently show the generic labels "Current period" / "Reference period"; the ask is that they display the actual period names (e.g. "October 2026" / "October 2025", "2026" / "2025") localized to the HA language, keeping the generic labels only as a fallback when a name cannot be computed. The change applies to the basic two-window comparison as well as the multi-window (timewindow shifting, #69) mode.

## Origin & Context

- **Raised by**: user feedback, pasted by the project owner; previously recorded as GitHub issue [#74](https://github.com/hello-sebastian/Energy-Horizon/issues/74) (part of a 1.3.0-beta feedback batch that also produced issues #73 and #75 on 2026-11-20). The owner appended three analysis notes (Polish) asking for: (1) an analysis of what period kinds can occur, (2) an analysis of the project's existing period-naming mechanisms — reusing only those where possible, (3) attention to usability, UX, and UX writing.
- **Trigger**: user feedback on the 1.3.0-beta release — generic tooltip/legend labels make it harder to tell which concrete periods are being compared.

## First-Glance Unknowns

- [NEEDS CLARIFICATION: What period kinds can the card actually present (month, week, day, year, rolling/arbitrary windows)? How should each kind be named in the tooltip/legend?]
- [NEEDS CLARIFICATION: Which existing naming mechanisms can be reused as-is — `formatCompactPeriodCaption()`, `formatPeriodLabel()`, series names in `buildReadyViewModel()`? Can the solution stay within these, or is a new/adjusted mechanism needed?]
- [NEEDS CLARIFICATION: For which period types can no name be computed at all (e.g. custom date ranges)? What exactly triggers the "Current period" / "Reference period" fallback?]
- [NEEDS CLARIFICATION: Exact scope of surfaces — tooltip and legend are named; are there other places showing the generic labels (summary captions, editor preview) that should change too?]
- [NEEDS CLARIFICATION: How should shifted windows in the multi-window (#69) preview be named — the bare period name, or something indicating it is a shifted/preview period?]
- [NEEDS CLARIFICATION: UX writing — exact wording, capitalization, and length constraints for localized names in the limited tooltip/legend space, across HA languages.]
