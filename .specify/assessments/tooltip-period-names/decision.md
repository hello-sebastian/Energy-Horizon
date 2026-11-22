# Decision: Concrete period names on chart tooltip and legend rows

- **Slug**: tooltip-period-names
- **Decided**: 2026-11-22
- **Verdict**: go
- **Artifacts reviewed**: intake.md, research.md, problem.md, concept.md

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | strong | Reproducible user pain recorded as open issue #74; affects all two-window users and most severely multi-window users, where the generic names are the *only* row identifiers; the pain grows structurally toward 24 windows; owner actively engaged (three analysis notes). (problem.md; research §Users & Demand) |
| Evidence strength | strong | The entire label path is code-verified end-to-end (the `labels` argument → `series.name` → tooltip/legend; the per-row context plumbing already exists); the designated single-source mechanism (905 FR-905-N) already produces exactly the requested format and its value is computed every render; preview (909 FR-021) and no-false-claims (900 FR-900-F) contracts corroborate the direction. Stated limitation: demand breadth rests on a single specific report — no telemetry exists in this project, so breadth is unmeasurable, not merely unmeasured. (research.md, confidence: high) |
| Value vs. inaction | adequate | Multi-window period identification is unfixable without this change and degrades as the feature matures; the basic two-window case is partially mitigated today by summary captions, so the gain there is polish rather than unblock. The fix cost is low (values already computed per render), so value-to-cost clearly favors building. (problem.md §Cost of Inaction) |
| Feasibility / appetite | strong | Recommended Option A is `small` (days): wire already-computed names into row names, implement the well-understood nameability predicate, update pinned fixtures; no new formatter and one new i18n string. (concept.md) |
| Strategic fit | strong | Implements the project's own spec contracts — 905 FR-905-N (single period-label source), 900 FR-900-F (labels must reflect actual windows, not a preset story), 909 FR-021 (labels follow the drawn series in preview) — and the constitution: Principle I (reuse existing HA/project mechanisms), Principle III (labels are explicitly named domain logic → test-first development applies). Owner notes (reuse-only, UX/UX-writing care) are honored by design. |
| Risk posture | strong | Major risks identified and mitigated by design: mislabeling (nameability predicate — a row is named only if its window begins at and spans a whole calendar unit, with in-progress current windows counted as the nominal unit, matching the existing caption behavior); tooltip→panel `seriesName` matching (updated in the same change, integration tests kept green); the preserved zone quirk (911 FR-019 byte parity) is explicitly not touched; fixture churn is mechanical. The owner constraint ("Current period" reserved for the current/green series) is baked into the role-aware fallback, which also fixes a pre-existing mislabel (today's preview shows "Current period" for a past window). Residual: demand breadth unknown — a value risk, not a delivery risk. |

## Verdict & Rationale

**Go.** Problem validity is strong (a real, reproducible, owner-tracked problem growing with the product) and evidence strength is strong (every load-bearing claim is code- or spec-verified; the one acknowledged gap — demand breadth — is unmeasurable by construction, not an oversight). A recommended `small`-appetite option exists (Option A), and the change aligns with the project's own spec contracts and constitution rather than against them. The weakest scorecard cell (value vs. inaction: adequate) does not block a `small` fix whose marginal cost is days of work and which additionally repairs a latent preview mislabel. Option A is confirmed as the delivery approach; Option B's remaining surface (custom-window range naming, forecast renaming, caption alignment) stays deferred to v2, gated on the owner's naming-policy decision and on real usage after A ships.

## If go — Handoff to `/speckit.specify`

- **Problem**: Chart tooltip/legend rows do not identify the concrete periods being compared — in multi-window mode the generic "Current period" / "Reference period" names are the only row identifiers, making rows unmappable to periods in place (issue #74).
- **Chosen approach**: concept Option A — name every row whose window has a clean calendar identity (begins at and spans a whole calendar unit in the HA time zone; in-progress current windows count as the nominal unit) using the existing single-source period-label mechanism (905 FR-905-N); labels are name-only; the fallback is role-aware — "Current period" is reserved for the actual current (green) series, a non-nameable preview current row gets a new neutral "Period" label, other rows keep "Reference period".
- **In scope / out of scope**: In — tooltip + legend row names for current/reference/context rows in default and preview modes; 5 locales (en/pl/de/fr/nl); the single new neutral "Period" i18n string + translations; test fixture updates. Out — window model/data fetching/config, axis ticks and tooltip header formatters, new user-facing options, range naming for custom windows (v2), forecast renaming (v2), summary caption alignment (non-goal), picker preview 910 demo series (v2), any i18n beyond the one neutral string.
- **Success metrics**: standard-preset rows show concrete localized names (e.g. "October 2026" / "October 2025", "2026" / "2025"); no new formatter introduced; fallback path test-covered with zero empty rows; tooltip→panel consistency stays green; all 5 locales verified (ICU casing included); qualitative confirmation by the issue #74 reporter.
- **Carried-forward open questions** (to resolve during specification):
  1. Owner sign-off on the name-only label form (no role prefix) — concept assumption 3.
  2. Exact wording of the neutral "Period" fallback string + 4 locale translations (UX-writing decision).
  3. Validation that the nameability predicate is decidable from resolved window geometry (start + end + in-progress flag) without new data — concept assumption 2.
  4. Validation of the wiring shape: each row named from its *own* window's start (the shared config field today carries only window-0's label) — concept assumptions 1 and 4.

## Delivery path (resolved 2026-11-22)

Delivered via `refine-eh` as in-place refinements of the existing domain specs — no new spec number: `902-chart-rendering-interaction` (FR-902-AE), `905-localization-formatting` (FR-905-O, FR-905-P, the `period.generic` key), `909-timewindow-preview` (FR-021 strengthened). The four open questions above were resolved during shaping/implementation: (1) name-only label form signed off by the owner; (2) `period.generic` = "Period" / "Okres" / "Zeitraum" / "Période" / "Periode"; (3) the predicate is decidable from resolved window geometry alone (`isNameablePeriod`, 22 unit tests); (4) the wiring shape is validated — every row is named from its own window via the shared `_rowLabel` helper. The owner constraint is honored throughout: "Current period" is reserved for the actual current (green) series, and a rolled-back (preview) window is never labeled "Current period".
