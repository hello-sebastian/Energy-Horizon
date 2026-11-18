# Research — `909-timewindow-preview` (Phase 0)

Resolves the technical unknowns from the plan's Technical Context and the spec's
behavioral decisions. Each entry: **Decision / Rationale / Alternatives considered**.

## R1. How to compute the shifted window set

**Decision**: Re-run the existing pure resolver `resolveTimeWindows(merged, now, timeZone, …)`
with a **shifted `now`** — `now` moved backward by the window's nominal `duration`, applied
once per step. The shift amount is `parseDurationToken(merged.duration)` (the window's nominal
width, **not** `step`), applied via the same `DateTime.minus(Duration)` algebra the card already
uses (`minusStepRepeated` in `resolve-windows.ts`). For a shift of `k` widths, apply
`minus(duration)` `k` times (mirroring `minusStepRepeated` exactly).

**Rationale**:
- The resolver is a pure function of `(merged, now, timeZone)`. Shifting `now` shifts the entire
  resolved window set by exactly one nominal width, preserving `duration`, `step`, `count`,
  `anchor`, and `aggregation` (FR-005) with **zero new window arithmetic**.
- Calendar-awareness for year/month/week and exactness for day/hour/minute/second come for free
  from Luxon's `DateTime.minus(Duration)` — the same code path the card already uses to build
  windows (FR-006, all-widths edge case). No width-specific special-casing.
- Works uniformly for the legacy (`currentEndIsNow && referenceFullPeriod && count === 2`) and
  generic paths, because both derive their geometry from `now` (FR-015).

**Alternatives considered**:
- *Post-hoc window shifting* (resolve at `now`, then subtract the duration from each window's
  `start`/`end`): rejected — duplicates the resolver's calendar logic, risks diverging from the
  canonical window geometry, and is more code for the same result (violates Principle V).
- *A new `shift` parameter on `resolveTimeWindows`*: rejected — changes the signature of a shared,
  tested pure function for a view-mode-only concern; the shifted-`now` approach keeps the resolver
  untouched.

## R2. Where the preview state lives

**Decision**: A plain, **non-persisted** field on the `EnergyHorizonCard` element
(`previewShift: number`, signed integer; `0` = default, negative = earlier periods). It is a
runtime field, not part of `_config`, and not written to any storage.

**Rationale**:
- The spec's transient contract (FR-008, US4) requires the preview to be discarded whenever the
  card is re-instantiated (dashboard switch, view switch, page reload). A plain element field is
  destroyed with the element, so the contract is satisfied by construction — no store, no
  `sessionStorage`, no cleanup code.
- Per-card independence (FR-016) falls out naturally: each element instance has its own field.
- Forward is bounded at the default (FR-003), so `previewShift ∈ {0, -1, -2, …}`; the forward
  control is a no-op at `0`.

**Alternatives considered**:
- *Module-level / `sessionStorage` store*: rejected — would retain the preview across
  re-instantiation, directly violating FR-008/US4, and adds a shared-state surface (violates
  FR-016 and Principle V simplicity).

## R3. What the chart shows in preview (two gray-toned historical series)

**Decision**: In preview mode the card **additionally queries the shifted current period**
(`shiftedWindows[0]`) **and the shifted reference period** (`shiftedWindows[1]`) and renders them
as **two series in gray tones**: the shifted current in **light gray** and the shifted reference in
a **darker gray**. The shifted current series **MUST NOT** use the current series' color (to avoid
association with the live period). Colors use the card's existing color tokens (HA theme tokens)
for consistency with the card's styling and HA color standards. The live current and reference
series are **not drawn** (FR-018/FR-019). Returning to the default restores the normal
presentation (FR-020).

**Rationale**:
- The shifted periods are different time ranges than the default windows, so they require their
  own LTS `statistics_during_period` queries (one extra call per series). They cannot be derived
  from the default series.
- Drawing both shifted series in gray tones (light gray for the shifted current, darker gray for
  the shifted reference) reuses the card's existing color tokens (HA theme tokens) and avoids any
  association with the live current series' color (FR-018). The gray tones make it unmistakable
  that the user is viewing historical data.
- Hiding the live series and drawing the shifted series in gray tones is the clearest "this is
  historical data" signal (US3, SC-007).

**Alternatives considered**:
- *Show the shifted series alongside the live series*: rejected — the spec explicitly requires
  only the shifted historical series in preview (FR-018/FR-019, US3) so the historical nature is
  unmistakable.

## R4. Isolating the shift from the analytical pipeline (FR-021)

**Decision**: The default analytical pipeline — summary, forecast, delta/interpretation, and
narrative — is computed from the **default** windows and is **left untouched** in preview. Only
the chart's series display changes. The extra shifted-period queries feed the chart's two preview
series only; they are not fed into `computeSummary` / `computeForecast` / `computeInterpretationSemantics`.

**Rationale**:
- FR-021 is explicit: "the preview shift does not recompute analytical data; … [panels] continue
  to reflect the default configuration and the current data series."
- This keeps the change surface minimal: the existing `_loadData` analytical path is unchanged;
  the preview only adds (a) the shifted query and (b) a preview render branch in the chart
  renderer. Lower risk, easier to test, and matches the "isolated to the chart's series display"
  scope the user confirmed.

**Alternatives considered**:
- *Shift the whole pipeline* (recompute summary/interpretation from the shifted data): rejected —
  directly contradicts FR-021 and the user's correction; deferred to a possible future iteration
  (noted in the spec).

## R5. Axis labels and period label in preview (ambiguity resolution)

**Decision**: In preview, the **chart's x-axis and the chart's period label reflect the shifted
period** (so the chart is meaningful and the indication conveys which period is shown — US2
scenario 3). All **non-chart** panels (summary, delta/interpretation readout, narrative) remain
unchanged, reflecting the default current data. The "legend" in preview shows the two shifted
series.

**Rationale**:
- FR-021 lists "the axis labels" and "the legend" among the unchanged elements, but freezing the
  x-axis dates to the current period while the chart draws the shifted series would be
  contradictory and unusable. The only coherent reading of "the preview shift is isolated to the
  chart's series display" is that the chart's time axis follows the displayed (shifted) series,
  while the *formatting/style* of the axis labels is unchanged.
- US2 scenario 3 requires the indication to "convey which period is being shown, consistent with
  the period label the card already displays" — so the period label must reflect the shifted
  period.
- This interpretation is documented here so the plan/tasks are unambiguous; it does not change the
  spec's FR-021 intent (no analytical recomputation).

**Alternatives considered**:
- *Freeze the x-axis to the current period*: rejected — produces a chart whose axis does not match
  its series; unusable.

## R6. Load triggering, coalescing, and performance

**Decision**: A change to `previewShift` (step back / step forward / reset) triggers a load that
re-runs the existing `_loadData`, which — when `previewShift < 0` — additionally resolves the
shifted windows and queries the shifted current and reference periods. The existing generation mechanism
(`_loadGeneration` / `_inFlightGeneration`) is reused: bumping the generation on a preview change
coalesces rapid stepping so an in-flight load is not duplicated, and a stale load's result is
discarded if the shift changed mid-flight.

**Rationale**:
- Reusing the existing load path and generation coalescing keeps the change minimal and consistent
  with the card's established pattern (Principle V).
- The extra shifted queries are one LTS call per series (current + reference); HA's LTS layer
  caches, so repeated default queries on each step are cheap. The dominant cost is the shifted
  queries per distinct shift position.
- **In-place chart-only update (implemented)**: a preview step does NOT replace the card with the
  full-card loading state. Instead a separate reactive flag (`_previewLoading`) keeps the card
  intact with its current data: the chart is dimmed (`opacity: 0.5`) with a "loading" overlay
  (`preview.loading` string) on top, and the step controls are `disabled` until the shifted series
  arrive. The chart container therefore never leaves the DOM, so the ECharts renderer survives the
  step and only the chart is swapped on completion. This is the "in-place chart-only update (no
  full-card spinner)" polish noted in the spec's "interim form, refined design later" assumption,
  and it also fixes the bug where a full-card loading state tore down the chart container and left
  the renderer attached to a removed node. The initial (first) load still uses the standard
  full-card loading state.

**Alternatives considered**:
- *A separate lightweight preview-only load* (fetch only the shifted series, keep the default
  analytical data cached): more efficient but adds a second load path and state-synchronization
  complexity. Deferred — the simple re-run is correct and sufficient for this iteration; noted as
  a future optimization.

## R7. Accessibility (Constitution Principle IV)

**Decision**: The three controls (backward, forward, reset) are native `<button>` elements —
keyboard-operable by default (Enter/Space), focus-visible, with localized `aria-label`s. The
preview indication is a visible text element (the shifted period label) that is also announced to
screen readers (it is real text in the DOM, not a visual-only overlay). The reset control is
present in the DOM only while the preview is active (FR-009/FR-010), so it is not announced when
absent. Contrast is inherited from the existing theme tokens (no new colors).

**Rationale**: Satisfies Principle IV ("Dostępność jest wymogiem, nie opcją") with the least
possible new surface — native buttons + real text, no custom ARIA widgets.

## R8. Localization (Constitution Principle VI)

**Decision**: New user-facing strings are added to **all four locales** (`en`, `pl`, `de`, `fr`):
the three control `aria-label`s (backward / forward / reset) and the preview indication label.
Wording is short, concrete, and consistent with the existing `period.*` / `status.*` keys
(Principle VI). The preview indication reuses the existing period-label formatting so the shifted
period reads the same way the card already formats periods.

**Rationale**: The card ships translations for four languages; a new UI string missing in any
locale would surface the raw key (the card already warns on missing keys). All four must be added.

## R9. All-width coverage

**Decision**: Because the shift reuses the resolver via a shifted `now` (R1), **every supported
width** (year, month, week, day, hour, minute, second — the `UNIT_TO_LUXON` set in
`duration-parse.ts`) works with no special-casing. Calendar widths (y/M/w) shift by one calendar
unit; exact widths (d/h/m/s) shift by the exact unit count. This is verified by unit tests that
drive the shift for each width class.

**Rationale**: FR-006 and the "All supported widths" edge case require uniform behavior; the
shifted-`now` approach guarantees it by construction.

## Open items (non-blocking)

- None. All Technical Context unknowns are resolved above. The two design commitments (R7
  accessibility, R8 localization) are tracked into Phase 1 / tasks and verified there.
