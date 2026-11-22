# Idea Research: Actual period names in chart tooltip and legend

- **Slug**: tooltip-period-names
- **Created**: 2026-11-22
- **Evidence confidence (overall)**: high

> **Correction to the intake's feasibility note.** The note says series names are "built in `src/card/view-model.ts` — `buildReadyViewModel()`". That is true only for the **summary captions**. The **tooltip/legend** series names come from a different place: the explicit `labels` argument passed to `_chartRenderer.update(...)` at `src/card/cumulative-comparison-chart.ts:457–467` (always `localize("period.current")` / `localize("period.reference")`), plus `labelForIndex()` at fetch time (`cumulative-comparison-chart.ts:608–612`) for context series (index ≥ 2), which the renderer consumes as `ctx.periodLabel` (`echarts-renderer.ts:1538`). `buildReadyViewModel` (`view-model.ts:218–255`) composes the summary-caption strings only.

## Users & Demand

- Direct user report, recorded as GitHub issue #74 (open, created 2026-11-20): hovering the chart shows "Current period" / "Reference period"; the user wants actual period names ("October 2026" / "October 2025", or "2026" / "2025") in the tooltip **and legend**, localized to the HA language, with the generic labels only as fallback. Applies to the basic two-window comparison, not only multi-window (#69). — [source: https://github.com/hello-sebastian/Energy-Horizon/issues/74] (confidence: high)
- The report is one of three issues (#73 line colors, #74 this, #75 comparison table) created on 2026-11-20 from a single 1.3.0-beta user-feedback batch — the same user was actively using the new multi-window feature and reporting chart-readability issues. — [source: git history / session record of issue creation 2026-11-20] (confidence: high)
- The tooltip is the user's primary comparison surface: with up to 24 windows (multi-window / custom `count`), a generic "Reference period (2)" row cannot be mapped back to a concrete period without leaving the chart. — [source: issue #74 body + `resolveTimeWindows` maxWindows=24, `src/card/time-windows/resolve-windows.ts:192–211`] (confidence: high)
- User count / adoption volume for 1.3.0-beta and multi-window usage — [ASSUMPTION: no usage telemetry exists; demand signal is a single concrete, specific report] (confidence: low) — see Gaps.

## Prior Art

Internal (strongest evidence):

- **The summary captions already show actual period names.** Next to each series swatch, the card renders a compact caption — `"2026"`, `"Oct 2026"` (abbreviated month), or a range like `"1 Apr – 12 Apr 2026"` — computed by `formatCompactPeriodCaption()` with `expandCurrentWindowForCaption()` (so an in-progress "month to date" window captions as the full month). The aria-label carries the fuller form `"Current period (Oct 2026)"`. — [source: `src/card/view-model.ts:218–255`, `src/card/labels/compact-period-caption.ts:59–222`, `src/card/cumulative-comparison-chart.ts:889–896`] (confidence: high)
- **`formatPeriodLabel()` is the designated single source for the period label** and produces *exactly* the format the user asked for: a window starting Jan 1 (in the HA time zone) → year alone (`"2025"`); any other start → localized long month + year (`"October 2024"`, `"październik 2024"`). Enforced by spec 905 FR-905-N / 911 TD-10: "no other code path may format the period label." Current use sites: `buildRendererConfig` (window-0 start) and the preview indication. — [source: `src/card/labels/period-label.ts:1–37`, `specs/905-localization-formatting/spec.md` FR-905-N (lines 38, 216, 306), `src/card/renderer-config.ts:186–187`] (confidence: high)
- **The long label for the current window is already computed on every render** — `ChartRendererConfig.periodLabel = formatPeriodLabel(w0.start, language, timeZone)` — but no renderer code reads the field today (writes only: `renderer-config.ts:156,215`; the single `periodLabel` read in the renderer is the context-series' own field, `echarts-renderer.ts:1538`). The value is already available for the tooltip/legend. — [source: grep over `src/`, `src/card/renderer-config.ts:187,215`] (confidence: high)
- **Preview (909) already established the "label follows the drawn series" contract**: the preview indication shows the shifted period (`"Preview: {{period}}"`, formatted via `formatPeriodLabel`), and FR-021 requires the chart's period label, X-axis and **legend** to reflect the shifted series. Today the preview tooltip/legend still show the generic names (same `labels` argument as the default mode). — [source: `specs/909-timewindow-preview/spec.md` FR-021 (line 184) + Q&A line 24, `src/card/cumulative-comparison-chart.ts:406–410, 457–460`, `src/translations/en.json` `preview.indication`] (confidence: high)
- **Spec 900 FR-900-F already steered toward naming that reflects actual windows**: when merged windows differ from the preset's story, "user-visible copy MUST NOT claim" the preset narrative — "neutral labeling or reflection of actual window dates is required." — [source: `specs/900-time-model-windows/spec.md` FR-900-F (lines 239, 271)] (confidence: high)

External:

- Naming comparison-chart series by their actual date range (rather than "current"/"previous") is the common ECharts/dashboard convention; this card's tooltip/legend print `series.name` verbatim (ECharts default). — [ASSUMPTION: general practice; no external citation gathered] (confidence: medium)

## Market & Context

- Deployment target is Home Assistant: the display locale comes from the HA instance (`config.language` override → `hass.locale.language` → `"en"`; `resolveLabelLocale`), the HA IANA time zone is canonical for all date display (905 FR-905-B), and month names come from ICU/`Intl.DateTimeFormat` — i.e. **period names are localized for free** in every HA language (Polish month names are lowercase by ICU design). The card ships 5 locale files (`en`, `pl`, `de`, `fr`, `nl`). — [source: `src/card/axis/axis-label-format.ts:9–22`, `specs/905-localization-formatting/spec.md` FR-905-B, `src/translations/*.json`] (confidence: high)
- Cost of doing nothing is low-to-moderate: the names are already visible in the summary captions on the same card, so a standard two-window user can cross-reference. The pain concentrates in (a) hover-to-compare workflows and (b) multi-window mode where generic names are the only row identifiers. — [source: `view-model.ts` captions, issue #74] (confidence: medium)
- The **legend is opt-in** (`show_legend` defaults to `false`); the tooltip is the primary affected surface, the legend secondary. — [source: `src/card/renderer-config.ts:151,209`] (confidence: high)

## Data & Constraints

**Owner note 1 — what period kinds can occur** (from `resolve-windows.ts` + spec 900):

| Kind | Geometry | Example name (Nov 2026) |
|---|---|---|
| `year_over_year` preset | Jan 1 → now vs Jan 1 → end of prev year (duration overridable) | `2026` / `2025` |
| `month_over_year` preset | 1st of month → now vs same month last year | `October 2026` / `October 2025` |
| `month_over_month` preset | 1st of month → now vs previous calendar month | `October 2026` / `September 2026` |
| Custom generic windows | any `anchor` (start_of_year/month/week/day/hour/`now`) + `offset` + `duration` + `step` + `count` ≤ 24 (e.g. 30d, 6M, week-based) | `22 Sep – 21 Oct 2026` (range) — start-month alone would be wrong |
| Preset + `time_window` overrides | merged windows may diverge from the preset story (FR-900-F) | depends on merge |
| Preview shift (909) | any of the above, shifted back by multiples of the window width (shift ≤ 0) | `October 2025` (shifted) |
| In-progress current window | `currentEndIsNow` (Jan 1 → Nov 22) | captions already expand to nominal end (`2026`) |
| Aggregation | `hour` / `day` / `week` / `month` — affects axis/tooltip precision, not the period name | — |

- Sources: `src/card/time-windows/resolve-windows.ts` (`resolveLegacy` 39–95, `resolveGeneric` 155–190, `resolveTimeWindows` 192–211), `src/card/types.ts` (`ComparisonMode`, `TimeAnchor`, `WindowAggregation`, `count` ≤ 24), `specs/900-time-model-windows/spec.md` (preset table lines 23–33, FR-900-E/F), `specs/909-timewindow-preview/spec.md` FR-003. (confidence: high)

**Owner note 2 — existing naming mechanisms** (all pure, all locale-aware):

1. `formatPeriodLabel(instant, locale, zone)` — long form, **start-date based**: `October 2026` / `2026`. Perfect for calendar-aligned windows; for custom windows it labels only the start month (a 30d window Sep 22–Oct 21 → `"September 2026"` — misleading). Deliberately preserved quirk: the Jan-1 edge check runs in the HA zone, the month name is formatted with the host default zone (no `timeZone` option) — do not "fix" without a user-visible-change decision (911 FR-019 byte parity). — [`period-label.ts:1–37`] (confidence: high)
2. `formatCompactPeriodCaption(window, peer, {zone, locale, hour12})` — **window-based** (start + end): full year → `2026`; full month → `Oct 2026` (abbreviated); else ranges (`1 Apr – 12 Apr 2026`) with peer-aware year suffixes; hour aggregation gets time ranges. Correct for arbitrary windows, but verbose and abbreviated. — [`compact-period-caption.ts:164–222`] (confidence: high)
3. Summary-caption composition in `buildReadyViewModel`: base `localize("summary.current_period")` + ` (suffix)` for aria, bare suffix for visible text — the existing "role + name" pattern. — [`view-model.ts:219–255`] (confidence: high)
4. The generic series names that actually reach the tooltip/legend today: `labels = { current: localize("period.current"), reference: localize("period.reference") }` at the `update()` call (both default and preview modes), context series `Reference period (2)…` via `labelForIndex`. — [`cumulative-comparison-chart.ts:457–467, 608–612`, `echarts-renderer.ts:1538`, `src/translations/en.json:2–3`] (confidence: high)
5. `formatTooltipHeader` — tooltip **header** (X-axis slot date), independent of series names; already localized, with comparison-hints year-omission policy (`resolveComparisonAxisLabelHints`). — [`src/card/axis/tooltip-format.ts:29–112`, `src/card/labels/comparison-label-hints.ts`] (confidence: high)

→ **The user's requested format is exactly mechanism 1's output** for the standard presets, and mechanism 2 is the only existing mechanism that is correct for arbitrary custom windows.

**Other constraints:**

- The tooltip→panel consistency logic matches tooltip rows **by `seriesName`** (`echarts-renderer.ts:922–949, 1332–1395`); names must stay stable per render and consistent between chart option and panel expectations. — [source: `src/card/echarts-renderer.ts`] (confidence: high)
- Tests pinning current behavior: `tests/integration/tooltip-panel-consistency.test.ts:200–202` (seriesName fixtures `"Current period"`/`"Reference period"`), `tests/unit/cumulative-comparison-chart-localization.test.ts:43,97`, `tests/unit/view-model.test.ts:173–174` (caption strings), `tests/unit/ha-api.test.ts:610,700` + `tests/unit/aggregation.test.ts:17` (`periodLabel` fixtures), `tests/integration/picker-preview-render.test.ts:424` (asserts aria does **not** contain "Current period"). — [source: grep over `tests/`] (confidence: high)
- The forecast line has its own name key `forecast.current_forecast` = `"Current period forecast"` (independent of `period.current`). — [source: `src/translations/en.json:32`] (confidence: high)
- No compliance/legal constraints identified; no data-volume impact (names are precomputed strings). — [ASSUMPTION] (confidence: medium)

## Evidence Against the Idea

- **Mislabeling risk for custom windows.** Mechanism 1 (`formatPeriodLabel`) is start-date-only: for non-calendar-aligned windows (30d, 6M, week-based, custom anchors) it would name a two-month window after its first month only. Reusing it unconditionally would *worse* than generic for `custom` cards; mechanism 2 is accurate but verbose (`22 Sep – 21 Oct 2026` in a tooltip row). A per-window-kind policy (or a fallback) is unavoidable. — [source: `period-label.ts` vs `compact-period-caption.ts` behavior] (confidence: high)
- **Role semantics are lost with pure date names.** "Current period" conveys which window is the live/configured primary; a bare `"October 2026"` does not say which one is "the" window when the current window is not the latest calendar period (custom anchors in the past, preview shift, YTD vs PY). UX writing must decide name-only vs "role · name" (owner note 3). — [source: `resolve-windows.ts` anchors, 909 FR-003] (confidence: medium)
- **Partial redundancy.** On a standard two-window card the names are already visible in the summary captions on the same card; the marginal visibility gain is real but modest. The strongest case is multi-window mode. — [source: `view-model.ts:244–255`] (confidence: medium)
- **Change surface.** Several unit/integration fixtures pin the generic names, and the tooltip→panel matching couples on `seriesName`; the rename touches `cumulative-comparison-chart.ts`, the `labels` plumbing, translations (keys may survive), and tests. — [source: test list above] (confidence: high)
- **Variable string length in a narrow tooltip** across HA languages (ICU month-name lengths differ; e.g. `październik 2026`). ECharts auto-sizes the tooltip, so this is cosmetic, not blocking. — [ASSUMPTION] (confidence: low)

## Gaps & Open Questions

- [NEEDS CLARIFICATION: Naming policy for custom (non-calendar-aligned) windows — long start-month name (mechanism 1), compact range (mechanism 2), or generic fallback? The owner asked to reuse existing mechanisms "where possible" — which windows count as "possible"?]
- [NEEDS CLARIFICATION: UX writing: name only (`October 2026`) vs role + name (`Current period · October 2026`)? The summary captions already use the "role (name)" pattern — consistency argument exists in both directions (tooltips should be terse vs. role must survive).]
- [NEEDS CLARIFICATION: How should context series (index ≥ 2, currently `Reference period (2)`) be named under the new scheme?]
- [NEEDS CLARIFICATION: Does the forecast series label (`forecast.current_forecast` = "Current period forecast") follow the new naming (e.g. "2026 forecast"), or stay as is?]
- [NEEDS CLARIFICATION: Is the summary caption in scope (feedback names "tooltip (and legend)"; captions already carry names, but their *form* — abbreviated vs long month — could be aligned)?]
- [NEEDS CLARIFICATION: Is the card picker preview (910, demo series with empty `periodLabel`) in scope?]
- [NEEDS CLARIFICATION: Adoption/usage data — how many users run 1.3.0-beta / multi-window? No telemetry available; demand evidence is a single (specific) report.]

## Sources

- https://github.com/hello-sebastian/Energy-Horizon/issues/74 (host: github.com, policy: allowlisted; read via `gh` CLI, title/state/createdAt verified this session)
- Repository files, cited inline above (all read this session): `src/card/labels/period-label.ts`, `src/card/labels/compact-period-caption.ts`, `src/card/labels/comparison-label-hints.ts`, `src/card/axis/tooltip-format.ts`, `src/card/axis/axis-label-format.ts`, `src/card/view-model.ts`, `src/card/renderer-config.ts`, `src/card/cumulative-comparison-chart.ts`, `src/card/echarts-renderer.ts`, `src/card/ha-api.ts`, `src/card/pipeline/ready-state-builder.ts`, `src/card/time-windows/resolve-windows.ts`, `src/card/types.ts`, `src/translations/{en,pl,de,fr,nl}.json`, `src/ha-types.ts`
- Specs: `specs/905-localization-formatting/spec.md` (FR-905-B, FR-905-N), `specs/900-time-model-windows/spec.md` (preset table, FR-900-E/F/R), `specs/909-timewindow-preview/spec.md` (FR-003, FR-013, FR-021, Q&A)
- No external hosts were fetched; no `confirmed-by-user` or `auto-refused` branches taken.
