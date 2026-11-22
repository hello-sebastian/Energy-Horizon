# Concept: Concrete period names on chart rows

- **Slug**: tooltip-period-names
- **Created**: 2026-11-22
- **Recommended option**: A — "Name the rows that have a calendar identity"

## Options

### Option A — Name the rows that have a calendar identity (smallest thing that could work)
- **Sketch**: The current and reference rows in the tooltip and legend show the concrete localized period name — "October 2026" / "October 2025", "2026" / "2025" — instead of the generic "Current period" / "Reference period". A row gets a real name when its window *has a clean calendar identity* (a window that begins and spans a whole calendar unit: start-of-year → year name, start-of-month → month name, via the project's existing period-label mechanism). Rows that don't — arbitrary custom windows (30d, 6M, week-based) — keep today's generic label. In multi-window mode every row with a calendar identity is named (the per-row name plumbing already exists for context series); in preview, the names follow the shifted period, as the 909 FR-021 contract already requires. Labels are name-only (no role prefix). The fallback is **role-aware**, per the owner constraint (2026-11-22) that **"Current period" is reserved for the actual current (green) series**: the non-preview current row falls back to "Current period" (true there), reference/context rows to "Reference period" (a relational role that still holds in preview); but a preview current row — always a past window — never falls back to "Current period" and instead gets a neutral localized "Period" label (a single new i18n string).
- **Appetite**: `small` (days) — the values are already computed on every render; the work is wiring them into the row names, the nameability predicate, and updating the pinned test fixtures across 5 locales.
- **Trade-offs**: Wins — the literal issue #74 and its examples, the standard-preset case, and the common multi-window (calendar-aligned) case, with **zero mislabeling risk** (a window is never named after just its start month) and **maximal reuse** (no new formatter; existing strings except one neutral "Period" label for the preview fallback — owner notes 2). Sacrifices — non-calendar-aligned custom windows keep the generic label, so the "fallback only when a name cannot be computed" expectation is met in spirit (a *reliable* name cannot be computed with the long-form mechanism) rather than literally; the label-form question (name-only vs "role · name") is decided in one stroke in favor of name-only, which needs owner sign-off. Key risk: the nameability predicate must be exact (a single-day window must NOT be named "November 2026").
- **Rabbit holes**: (1) the tooltip→panel consistency logic matches rows by `seriesName` — renaming the main rows touches it and its integration fixtures (known, bounded surface); (2) the preserved zone quirk in the period-label mechanism (911 FR-019 byte parity) must not be "fixed" as a side effect; (3) per-window verification that the right window's start feeds each row name (config currently computes only window-0's).

### Option B — Name every row, one policy (full coverage)
- **Sketch**: Everything A does, plus: custom / non-calendar-aligned windows are named with the compact *range* mechanism ("22 Sep – 21 Oct 2026"), so no row ever falls back; the forecast line is re-named to match ("2026 forecast"); and the summary caption form is aligned with the new row naming for card-wide consistency. The label form (name-only vs "role · name", and how the role is expressed for context rows) is designed once as a single UX-writing policy applied everywhere, including new i18n string templates if a role prefix is chosen.
- **Appetite**: `medium` (weeks) — the per-window-kind naming policy is a genuine design + UX-writing exercise across 5 locales, with a larger fixture and translation surface.
- **Trade-offs**: Wins — one coherent naming policy card-wide; the multi-window and custom-window cases are fully solved; the issue's fallback expectation met literally. Sacrifices — it must solve the hardest open question (custom-window naming policy) and its mislabeling risk (start-month vs range vs generic per window kind); range strings are longer in a narrow tooltip (ICU lengths vary by locale); new i18n keys/templates are introduced (against owner note 2's reuse preference); forecast and caption alignment pull in surfaces the feedback never named.
- **Rabbit holes**: (1) the naming policy itself — "which windows count as nameable" is an owner decision that the research could not make; (2) string length and wrapping in tooltips across locales; (3) forecast naming ("X forecast" for arbitrary X) needs its own policy + keys; (4) caption alignment edges into the summary section, an explicit non-goal unless re-scoped; (5) if the role prefix is chosen, every named row grows and needs placeholder-based i18n templates.

### Option C — Do nothing / defer
- **Sketch**: Leave the generic labels as is. Close or keep issue #74 open with a note that the names are visible in the summary captions; revisit when multi-window adoption data exists.
- **Appetite**: none (no build).
- **Trade-offs**: Wins — zero change risk, zero maintenance of a naming policy; the cost of inaction is documented as low-to-moderate for standard two-window users. Sacrifices — the multi-window identification problem (the strongest complaint, growing toward 24 windows) stays unresolved; the open 1.3.0-beta feedback item stays open; no telemetry exists to inform the revisit, so "wait for adoption data" has no trigger.
- **Rabbit holes**: none in build; the risk is drift — the multi-window feature maturing makes the generic labels progressively more inadequate.

## Recommendation

**Option A.** It clears the bar on every problem goal without taking on the riskiest unknown:

- The problem statement's core — rows must identify concrete periods — is met for the standard presets (issue #74's literal examples) and for calendar-aligned multi-window rows, which is where the "only row identifiers" pain lives.
- It is the only option with **zero mislabeling exposure**: a row is either named by the mechanism the spec designates as the single source for period labels, or it keeps a generic label that is at least never wrong. Option B's range naming is correct but verbose and forces the per-window-kind policy that the owner's notes did not resolve.
- It best satisfies owner note 2 (reuse existing mechanisms only): the values already exist per render; A adds no formatter and — apart from one neutral "Period" fallback label — no i18n key.
- Success metrics: A satisfies all five measurable ones (standard-preset names, no new formatter, fallback path tested, tooltip→panel consistency kept green, 5 locales) plus the qualitative reporter confirmation. The only metric A does not fully meet — "100% of windows for which a name *can* be computed" — fails only for custom windows, where "can" is precisely the disputed, policy-gated part; B spends a `medium` appetite to buy that last slice now.
- B remains the natural v2: after A ships, real usage (and the owner's decision on the naming policy and label form) tells us whether custom-window range naming is worth the policy work. C is not defensible while issue #74 is open and the pain grows with the feature.

## Out of Scope (for the recommended option)

- Window model, data fetching, card configuration (YAML surface) — inherited non-goal.
- X-axis tick labels and the tooltip header date/time formatter — inherited non-goal (separate, already-localized mechanism).
- New user-facing option/config for controlling label style — inherited non-goal.
- Range naming for custom / non-calendar-aligned windows — deferred to v2 (Option B territory), pending the owner's naming-policy decision.
- Forecast series renaming ("2026 forecast") — v2.
- Summary caption form alignment and any summary/comparison section layout change — inherited non-goal.
- Card picker preview (910) demo series — v2 / separate.
- Any new i18n keys or string templates, **except** a single neutral localized "Period" label used when a preview current window cannot be named (owner constraint: "Current period" is reserved for the current/green series).

## Assumptions to Validate

1. **The wiring shape**: the fix is to feed the already-computed period names into the row-name argument of the chart update (and the per-row context names already flowing for index ≥ 2), not to change what the label mechanism produces. Research indicates yes (value computed per render but never read for main rows); confirm during specification.
2. **The nameability predicate is decidable from window geometry**: a window gets a long-form name iff it begins at, and spans exactly, a calendar unit boundary (start-of-year/year-span, start-of-month/month-span) in the HA time zone — so a 30d or single-day window is *not* named after its start month. Must be checkable from the resolved windows' start/end without new data.
3. **Name-only is acceptable UX**: the role (current vs reference vs context) remains legible via series color/swatch, row order, and the summary captions — owner sign-off needed (open question 2). If "role · name" is required, A's sketch grows (new i18n template) and its appetite may slip toward `medium`.
4. **The reference/context rows are named from their own windows' starts** (the shared config field today carries only window-0's label) — i.e. calling the existing mechanism per window, still without a new formatter.
5. **Fixture churn is mechanical**: the pinned generic-name fixtures (6+ test files, listed in research) are string updates, not behavioral rewrites; tooltip→panel consistency tests keep passing with renamed rows.
6. **Demand basis**: no adoption telemetry exists; the case rests on one specific, actionable report (issue #74) plus the documented structural growth of the problem toward 24 windows. `decide` should weigh this explicitly.
7. **Preview fallback wording**: a single neutral string (e.g. "Period" + 4 locale translations) suffices for a non-nameable preview current row; exact wording is a UX-writing decision for specification. Note: today's preview already shows "Current period" for the shifted (past) row — a pre-existing mislabel adjacent to #74 that A fixes as a side effect.
