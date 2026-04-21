# 903-card-ui-composition
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Card UI Composition  
**Replaces**: `001-card-ui-enhancements`, `001-figma-ui-rollout`, `001-separate-style-logic`, `001-ha-theming-classes`  
**Primary code**: `src/card/cumulative-comparison-chart.ts`, `src/card/energy-horizon-card-styles.ts`  
**Last updated**: 2026-04-21  

## Clarifications

### Session 2026-04-21

- Q: How should invalid or non-canonical `interpretation` YAML values be handled? → A: **Case-insensitive** match to `consumption` \| `production`; if still not recognized, effective mode is **`consumption`** (same as omitting the key); optional diagnostic **console** message when card `debug: true`.
- Q: Should `interpretation: production` change user-visible wording in the Forecast \| Total panel? → A: **No** — Forecast \| Total strings stay **unchanged**; `interpretation` applies to **comparison narrative + chart delta** only (Option A).
- Q: (User) Neutral semantic band — A: Optional YAML **`neutral_interpretation`** (non-negative **percent**). **Default `2`** when omitted (i.e. ±**2** percentage points relative to reference for deciding **neutral** vs better/worse). Narrative **icon** and **chart delta line** semantic colors follow this band; delta chip **numeric** values unchanged.
- Q: When the delta chip shows **missing data** (no reliable percent `p`), what semantic path for narrative + chart delta? → A: **Separate “no data” path** (Option B): dedicated **`localize()`** strings + styling **distinct** from neutral-band “similar” (and from success/warning).

---

<!-- NORMATIVE -->

## Current Behavior (normative)

The card renders as a Lovelace `custom:energy-horizon-card` web component built with Lit 3. Its visual layout is divided into distinct sections with semantic CSS class names. All card styles are defined in a dedicated styles module (`energy-horizon-card-styles.ts`) imported by the main card component; logic and styles are separated.

### Card sections and layout

| Section | CSS class | Description |
|---|---|---|
| Card container | `.ebc-card` | Root `ha-card` wrapper |
| Header | `.ebc-header` | Title, entity subtitle, icon container |
| Comparison panel | `.ebc-stats` | Two-column current/reference values + delta chip |
| Forecast panel | `.ebc-forecast` | Forecast end-of-period value and reference Total |
| Chart area | `.ebc-chart` | ECharts container |
| Warning bar | `.ebc-warning` | Bottom warning for incomplete reference series |

### Header behavior

- **Title**: displayed when not disabled via `show_title: false`. Defaults to entity's friendly name; falls back to `entity_id` if no friendly name; empty-string `title` is treated as absent (falls back to friendly name).
- **Entity subtitle**: second row below the title showing the raw `entity_id`; only visible when title is enabled.
- **Icon**: 42×42 px container with 24 px `ha-icon`/`ha-state-icon`. Displayed when not disabled via `show_icon: false`. Defaults to entity's icon attribute; if entity has no icon, no icon element is rendered.
- When both `show_title: false` and `show_icon: false`, the entire header area is omitted.

### Comparison panel

Two-column layout: **Current period** column (left) and **Reference period** column (right), each showing the cumulative value. A **delta chip** sits below or between the columns showing `+/−N.NN kWh | +/−N.N %` with a separator `|`.

- **Delta chip always visible**: even when the difference is zero (shows `0 kWh | 0 %`). When data is unavailable, shows placeholder `--- <unit> | -- %`; if unit is unavailable, shows `--- | -- %`.
- **Explicit sign**: absolute difference and percentage difference always carry `+` when positive and `−` (U+2212) when negative; zero values show no sign prefix.
- **Period qualifiers**: each column heading includes a compact caption from `formatCompactPeriodCaption` (abbreviated month names, HA time zone, `locale.time_format` for hourly-window clock portions). Locale follows: card `language` → HA user language → `en`.

### Narrative interpretation (summary row) and chart delta semantics

The card compares **current-period** cumulative total to **reference-period** cumulative total and surfaces the result in:

- A **narrative interpretation row** (text + trend icon) when enabled by visibility settings.
- The **delta segment** drawn on the chart between the two series at the relevant aggregation step.

**Interpretation mode** (`interpretation` in YAML; see Public Contract) selects whether the entity is treated as **consumption** or **production** for **semantic** evaluation only (what counts as “better” vs “worse”) in the **comparison narrative row** and **chart delta** affordances. It does **not** change user-visible text or labels in the **Forecast \| Total** panel (those remain governed by existing forecast / LTS copy per `901`). Numeric delta signs (`+/−` on the chip) remain mathematically correct in all modes; only **polarity of meaning** (positive vs negative vs **neutral** outcome), **semantic colors**, **trend icon choice**, and **wording** in the scoped areas follow the mode and the **neutral band** below.

**Neutral band (`neutral_interpretation`)**: Optional YAML (see Public Contract). Value is a non-negative **percentage** `T` (e.g. `2` means **2%**). **Default `T = 2`** when the key is omitted. Let `p` be the **same signed percentage** already used for the delta chip’s percent column (percent change of current vs reference, identical sign convention as today’s chip). **Semantic outcome is neutral** when **`|p| ≤ T`** — “similar” / flat trend, **neutral** styling on the interpretation icon and chart delta segment. When **`|p| > T`**, apply the consumption/production table using the **sign** of `(current − reference)` (or equivalently the sign of `p`) as usual.

When **reference cumulative is zero** (or undefined for division), **neutral** applies only when **current** is also zero (or both missing); otherwise use signed comparison without a percentage band (see Edge Cases).

**Insufficient comparison data (no `p`)**: When the delta chip is in the **placeholder** state (no reliable signed percent **`p`** — e.g. `--- <unit> | -- %` / `--- | -- %`), the card MUST **not** treat the situation as **neutral-band** “similar” (`|p| ≤ T`). Instead, use a **separate insufficient-data path**: **dedicated** `localize()` strings for “cannot compare” / missing-data messaging and **muted or non-judgment** icon and chart delta styling that is **visually and semantically distinct** from success, warning, and neutral-band outcomes (see **FR-903-W**).

| Mode | Outside neutral band: `current > reference` | Outside neutral band: `current < reference` |
|---|---|---|
| **Consumption** (default when key omitted) | **Negative** outcome: warning semantics (e.g. higher usage vs reference) | **Positive** outcome: success semantics (e.g. lower usage) |
| **Production** | **Positive** outcome: success semantics (e.g. higher production) | **Negative** outcome: warning semantics (e.g. lower production) |

**Consistency requirement**: For a given mode and `T`, when **`p`** is available (or the reference-zero rule applies), the narrative interpretation icon, its semantic coloring, and the chart delta line MUST use the **same** mapping from **neutral vs sign of `(current − reference)`** to neutral vs success vs warning styling. When **`p`** is unavailable, narrative and chart delta MUST follow the **insufficient-data** path consistently with each other (**FR-903-W**).

All user-visible phrases for these rows MUST go through `localize()` with keys maintained per `905-localization-formatting` (including `en`, `pl`, `de`).

### Forecast | Total panel

Shown only when `show_forecast: true` (or the alias `forecast: true`). Displays:
- **Forecast**: projected consumption for the full current period (end-of-period estimate from `computeForecast`).
- **Total**: total consumption for the **full** reference period (entire LTS window of the reference series, not "to-date").

**Independence from `interpretation`**: User-visible labels and copy in this panel do **not** switch to “production” wording when `interpretation: production`; panel text remains as specified above and in `FR-903-I`.

The panel is completely absent from the DOM when `show_forecast: false`.

### Theming

The card consumes HA CSS custom properties from the host element. It does not define hardcoded colors for text or backgrounds. Key tokens: `--primary-text-color`, `--secondary-text-color`, `--accent-color`, `--ha-card-background`, `--card-background-color`, `--divider-color`. Switching HA themes (light/dark) causes the card to re-render with updated token values.

### Style separation architecture

- All CSS rules live in `src/card/energy-horizon-card-styles.ts`.
- The main component (`cumulative-comparison-chart.ts`) imports styles and does not define inline styles that mix with computation logic.
- Computation logic (data fetching, statistics, forecast) has zero imports from the styles module.
- A missing or broken styles import degrades visual appearance only; all data logic continues to function.

### Warning bar

A warning message about incomplete reference series data is shown exclusively in the `.ebc-warning` bar at the bottom of the card. It is not duplicated in the comparison panel.

---

## Public Contract

```yaml
# Card-level YAML (UI-composition relevant fields)
title: "My Solar"              # optional; empty string = absent; default: entity friendly name
show_title: true               # optional; default true
icon: "mdi:flash"              # optional; default: entity icon attribute
show_icon: true                # optional; default true
show_forecast: true            # optional; default true (alias: forecast)
language: "pl"                 # optional; card-level locale override
interpretation: consumption    # optional; consumption | production (case-insensitive); omit or invalid → consumption
neutral_interpretation: 2      # optional; non-negative percent; neutral semantic band when |Δ%| ≤ this; omit → 2
```

CSS class contract (stable for Card-Mod and external style overrides):
```
.ebc-card         Root card container
.ebc-header       Header area (title + subtitle + icon)
.ebc-stats        Comparison panel (current | reference | delta chip)
.ebc-forecast     Forecast | Total panel
.ebc-chart        Chart area
.ebc-warning      Bottom warning bar
```

Period caption helper:
```typescript
// src/card/labels/compact-period-caption.ts
function formatCompactPeriodCaption(window: ComparisonWindow, options: CaptionOptions): string;
```

---

## Cross-domain Contracts

**Consumes from**:
- `900-time-model-windows`: `ComparisonWindow[]` for period qualifiers and window role labels.
- `901-data-pipeline-forecasting`: `ForecastStats` (`enabled`, `confidence`, `forecast_total`), reference series total for the **full** reference period.
- `902-chart-rendering-interaction`: chart container element ownership; `min-height` adjustments from renderer; delta segment styling aligned with interpretation semantics (see `902-chart-rendering-interaction`).
- `904-configuration-surface`: raw YAML fields listed in Public Contract, including `interpretation` and `neutral_interpretation`; visual editor for `interpretation` (see `904-configuration-surface`); `neutral_interpretation` may remain **YAML-only** (still preserved on merge).
- `905-localization-formatting`: resolved locale string, HA `time_format`, entity friendly name and icon from `hass` state; `localize()` keys for consumption- vs production-oriented narrative strings.

**Publishes to**:
- `902-chart-rendering-interaction`: chart container DOM element (Shadow DOM); HA theme CSS tokens from host element; semantic expectations for delta-line success/warning coloring tied to `interpretation`.
- `907-docs-product-knowledge`: user-facing documentation updates for the new option (README, README-advanced, wiki) and changelog entry targeting release **1.1.0**.

---

## Non-Goals

- Changing the HA data model or LTS API.
- Inverting or altering the **numeric** sign rules on the delta chip (`+/−` absolute and percent): those remain pure arithmetic comparisons; only semantic labeling, colors, icons, and narrative copy follow `interpretation`.
- Rebranding other Lovelace cards or dashboard elements.
- Mandatory Code Connect / Figma file editing.
- Providing hardcoded light/dark color palettes independent of HA theme tokens.
- Introducing additional chart element types beyond the current ECharts implementation (covered by domain 902).
- Rewording the **Forecast \| Total** panel (headings, labels, or forecast-related translation keys) based on `interpretation: production` — interpretation affects **comparison narrative + chart delta** only.
- Requiring a **visual editor** control for `neutral_interpretation` in the first release (YAML is sufficient; editor may follow later).

---

<!-- EXECUTION -->

## User Stories

### US-903-1 — Clear card header with title, subtitle, and icon (P1)

As a user with multiple energy cards on my dashboard, I need each card to display the entity's friendly name as the title, its raw `entity_id` as a subtitle, and its icon in a consistent container, so I can immediately tell which entity each card monitors without guessing.

**Independent test**: Render card with various combinations: no title config, custom title, `show_title: false`, `show_icon: false`, entity with no icon → verify visible elements and omission of header area when both are disabled.

**Acceptance Scenarios**:

1. **Given** no `title` configured and entity has a friendly name, **When** the card renders, **Then** the friendly name appears as the title; the raw `entity_id` appears as a secondary subtitle below it.
2. **Given** `title: "My Solar"` configured, **When** the card renders, **Then** "My Solar" is the title; `entity_id` still appears as subtitle.
3. **Given** `show_title: false`, **When** the card renders, **Then** neither the title nor the `entity_id` subtitle is visible; the icon behavior follows the `show_icon` flag independently.
4. **Given** `title: ""` (empty string), **When** the card renders, **Then** the entity's friendly name is used (empty string treated as absent).
5. **Given** entity has no friendly name (or it is an empty string), **When** the card renders, **Then** the `entity_id` string is used as the title fallback.
6. **Given** `show_icon: false`, **When** the card renders, **Then** no icon element is rendered.
7. **Given** both `show_title: false` and `show_icon: false`, **When** the card renders, **Then** the entire header area is omitted from the DOM.
8. **Given** entity has no icon attribute and no `icon` is configured, **When** the card renders, **Then** no icon element is rendered; the title area still appears normally.

---

### US-903-2 — Two-column comparison panel with always-visible delta chip (P1)

As a user comparing this month to last month, I need the comparison panel to show both periods in a two-column layout with a single delta chip that always tells me the direction and magnitude of the difference — even when the difference is zero or data is unavailable — so I never have to look at two numbers and subtract them mentally.

**Independent test**: Render card with current > reference, current < reference, current = reference, and no data for delta — verify delta chip content and sign in all cases.

**Acceptance Scenarios**:

1. **Given** current > reference, **When** the comparison panel renders, **Then** the absolute difference shows `+` prefix and the percentage shows `+` prefix (e.g. `+12.5 kWh | +8.3 %`).
2. **Given** current < reference, **When** the comparison panel renders, **Then** both values show `−` prefix (e.g. `−12.5 kWh | −8.3 %`).
3. **Given** current = reference exactly, **When** the comparison panel renders, **Then** the delta chip shows `0 kWh | 0 %` without any sign prefix.
4. **Given** delta data is unavailable, **When** the comparison panel renders, **Then** the delta chip is still visible and shows `--- <unit> | -- %`; if unit is unavailable, shows `--- | -- %`.
5. **Given** two windows are configured, **When** the panel renders, **Then** each column heading includes a compact period caption (e.g. `Mar 2026` / `Mar 2025`) derived from `formatCompactPeriodCaption` in the HA time zone.
6. **Given** card locale is set to Polish, **When** month names render in captions, **Then** Polish-locale abbreviated month names are used (from Luxon/ICU, not hardcoded strings).

---

### US-903-3 — Forecast | Total panel with correct semantics (P1)

As a user seeing the forecast, I need the "Total" value to represent the complete consumption of the reference period (not just "to-date"), so I can make a meaningful apples-to-apples comparison between this period's forecast and what I actually consumed last year/month in full.

**Independent test**: With `show_forecast: true` and month-over-year preset, verify that "Total" shows the full prior-month consumption from LTS, not the partial "to-date" value; verify the panel is absent when `show_forecast: false`.

**Acceptance Scenarios**:

1. **Given** `show_forecast: true` and a forecast is available, **When** the panel renders, **Then** "Forecast" shows the projected full-period consumption and "Total" shows the full reference period's historical total.
2. **Given** incomplete reference data, **When** Total cannot be reliably computed, **Then** the card applies existing missing-data rules (warning bar); no fabricated value is shown.
3. **Given** `show_forecast: false`, **When** the card renders, **Then** the entire Forecast | Total panel block is absent from the DOM.
4. **Given** forecast is enabled but `computeForecast` returns `enabled: false` (too early in the period), **When** the card renders, **Then** the forecast value is shown as a placeholder; the Total column remains visible.

---

### US-903-4 — HA theming and automatic light/dark adaptation (P1)

As a user who switches between HA's light and dark themes, I need the card to automatically adapt its colors for text, background, and accent elements to the active theme's CSS tokens, so the card always remains readable without any manual YAML changes.

**Independent test**: Switch HA theme between light/dark while the dashboard is open — card updates colors without page reload; no critical contrast failures on either theme with standard HA token values.

**Acceptance Scenarios**:

1. **Given** the light HA theme is active, **When** the card renders, **Then** text, background, and chart lines have sufficient contrast and no elements are invisible.
2. **Given** the dark HA theme is active, **When** the card renders, **Then** the card adapts colors from HA CSS tokens; no text or line elements become invisible.
3. **Given** the HA theme is changed dynamically (e.g. auto day/night), **When** the next card render cycle occurs, **Then** the card reflects the new theme without a manual page reload.

---

### US-903-5 — Semantic CSS classes for Card-Mod and external overrides (P2)

As an advanced user using Card-Mod, I need the card's main sections to have stable, semantic CSS class names reflecting their function (not visual details), so I can hide, resize, or restyle individual sections with a CSS rule without touching the card's logic files.

**Independent test**: Using only CSS rules targeting `.ebc-forecast`, hide the forecast section; confirm the section disappears and the rest of the card functions correctly.

**Acceptance Scenarios**:

1. **Given** a CSS rule targeting `.ebc-forecast`, **When** the rule sets `display: none`, **Then** the forecast section disappears and no other section is affected.
2. **Given** a CSS rule targeting `.ebc-chart`, **When** the rule changes `height`, **Then** only the chart area height changes; all data logic and statistics continue to function.
3. **Given** the list of CSS classes used on the card, **When** a new contributor reads the class names, **Then** they can identify without additional context which class corresponds to header, statistics, chart, forecast, and warning sections.

---

### US-903-6 — Style/logic separation (P2)

As a developer making visual changes, I need all CSS rules to live in `energy-horizon-card-styles.ts` and the main card component to import them without defining business-logic-adjacent styles inline, so I can change the color palette without ever opening the computation files.

**Independent test**: Edit only `energy-horizon-card-styles.ts` to change colors → visual output changes; computation, statistics, and forecast outputs are unaffected. Delete the styles import → card still fetches data and renders statistics correctly.

**Acceptance Scenarios**:

1. **Given** a color change applied only in `energy-horizon-card-styles.ts`, **When** the card is re-rendered, **Then** only visual properties change; no computation file is modified.
2. **Given** the styles import is removed (simulating a missing file), **When** the card runs, **Then** data fetching, statistics, forecast, and chart series remain fully functional; only visual degradation occurs.

---

### US-903-7 — Choose consumption vs production interpretation (P1)

As a user monitoring either energy use or on-site generation, I need to set whether the entity represents **consumption** or **production** so the card’s narrative, interpretation icon, and chart delta use the correct “better / worse” meaning for my context.

**Independent test**: Set `interpretation: production` in YAML (or choose Production in the editor), render with current > reference → success styling and production-oriented copy; set `interpretation: consumption` (or omit key) → legacy consumption semantics. Verify editor shallow-merge preserves other keys.

**Acceptance Scenarios**:

1. **Given** no `interpretation` key in YAML, **When** the card evaluates semantics for the narrative row and chart delta, **Then** behavior matches **consumption** mode (legacy: current > reference → negative outcome styling).
2. **Given** `interpretation: consumption`, **When** current cumulative is greater than reference, **Then** the narrative and delta use **negative-outcome** semantics (warning-style interpretation icon and delta styling); when current is less than reference, **positive-outcome** semantics apply.
3. **Given** `interpretation: production`, **When** current cumulative is greater than reference, **Then** the narrative and delta use **positive-outcome** semantics (success-style icon and delta styling); when current is less than reference, **negative-outcome** semantics apply.
4. **Given** the Lovelace editor is open, **When** the user selects **Consumption** or **Production** for interpretation, **Then** the value is shallow-merged into `_config` like other form fields and the card updates immediately (live preview).
5. **Given** YAML sets `interpretation: production` and the user edits another field in Visual mode, **When** config is saved, **Then** `interpretation` remains `production` unless explicitly changed.

---

### US-903-8 — Production mode: “more is better” copy and visuals (P1)

As a user analyzing **production**, I need higher current-period energy than the reference period to read as **positive**, with **trend-up** and **success** coloring on the interpretation icon and chart delta line, so the dashboard matches my mental model.

**Independent test**: `interpretation: production`, current > reference → localized strings describe greater production; icon is trend-up; interpretation icon and delta use success semantic colors. current < reference → localized strings describe lower production; trend-down; warning semantic colors.

**Acceptance Scenarios**:

1. **Given** `interpretation: production` and current > reference, **When** the narrative row renders, **Then** copy uses production-appropriate wording via `localize()` and the interpretation icon reflects an **up** trend with **success** semantic coloring.
2. **Given** `interpretation: production` and current < reference, **When** the narrative row renders, **Then** copy uses production-appropriate wording and the interpretation icon reflects a **down** trend with **warning** semantic coloring.
3. **Given** `interpretation: production`, **When** the chart draws the delta segment between series at the active step, **Then** its semantic color matches the same success vs warning mapping as the narrative row for that sign of `(current − reference)`.

---

### US-903-9 — Consumption mode preserves legacy behavior (P1)

As a user analyzing **consumption**, I need the card to behave **as today** when I use consumption mode or leave the default: higher current than reference should remain **negative** in meaning and **warning** in styling.

**Independent test**: `interpretation: consumption` or omitted key; compare to pre-feature baseline screenshots or golden expectations for current>ref vs current<ref narrative and delta colors.

**Acceptance Scenarios**:

1. **Given** `interpretation: consumption` (or omitted) and current > reference, **When** the narrative and delta render, **Then** the outcome is **negative** for meaning and uses **warning** styling for the interpretation icon and delta line (consistent with prior release behavior).
2. **Given** `interpretation: consumption` (or omitted) and current < reference, **When** the narrative and delta render, **Then** the outcome is **positive** for meaning and uses **success** styling for the interpretation icon and delta line.

---

## Edge Cases

1. **Entity no longer exists in HA**: card must not crash; title falls back to entity ID string; icon is omitted gracefully.
2. **Friendly name is an empty string**: treated as absent; `entity_id` is used as title.
3. **`show_title: false` and `show_icon: false`**: entire header area is omitted from the DOM (no empty placeholder).
4. **Delta value exactly zero**: `0 kWh | 0 %` is shown without any sign prefix; the chip remains visible.
5. **`period_offset` with a large negative value** (e.g. `-5`): period qualifier captions must still compute correct years/months reflecting the offset.
6. **Month name missing for rare locale**: fall back first to Luxon/ICU for that locale, then to English.
7. **Icon attribute absent on entity and no `icon` YAML**: no icon element rendered; title area not disrupted.
8. **Forecast disabled (`show_forecast: false`)**: the Forecast | Total panel block is completely absent from the DOM — no empty container.
9. **Forecast enabled but not yet available** (`ForecastStats.enabled = false`): forecast value shown as placeholder; Total column still visible.
10. **Theme switch mid-session**: the card responds to the next Lit render cycle triggered by HA's `hass` update propagation; no manual intervention required.
11. **Custom HA theme with extreme low-contrast colors**: the card is not responsible for correcting the overall theme; it must not use hardcoded colors that contradict the HA token system.
12. **`interpretation` missing, invalid, or differently cased in YAML**: parse **case-insensitively** against `consumption` and `production`. If the value does not match either after normalization, effective mode is **`consumption`**; the card must not crash. When `debug: true`, the card MAY log a diagnostic for unrecognized values.
13. **Neutral band**: When the delta chip’s **percentage** magnitude **`|p|`** is **≤** effective **`neutral_interpretation`** (default **2**), semantic outcome is **neutral** for narrative icon and chart delta styling. When **`|p| > T`**, use consumption/production success vs warning per sign. **Delta chip text** still reflects actual values (no hiding of real +/−%).
14. **`neutral_interpretation` invalid or negative in YAML**: treat as **default `2`**; do not crash. Extremely large values (e.g. ≥ 100) effectively make **neutral** always (document in tests).
15. **Reference cumulative is zero** (or percent undefined): **neutral** only when **current** is also zero (or both missing); otherwise classify by sign of `(current − reference)` without applying the percent band.
16. **Narrative row hidden** (`show_narrative_comment: false` or equivalent): interpretation mode and **neutral band** MUST still apply to **chart delta** coloring and any other visible interpretation affordances.
17. **Delta chip placeholder (missing comparison / no `p`)**: Use the **insufficient-data** path (**dedicated** `localize()` copy + **muted / non-judgment** styling); MUST **not** reuse neutral-band “similar” styling. Chart delta segment follows the same non-judgment semantics.

---

## Functional Requirements

- **FR-903-A (Title behavior)**: The card MUST display the entity's friendly name as the title by default. When `title` is configured with a non-empty string, that string MUST be used. An empty-string `title` MUST be treated as absent (falls back to friendly name). When entity has no friendly name, the entity ID MUST be used.

- **FR-903-B (Entity subtitle)**: When the title is visible, the raw `entity_id` MUST appear as a secondary subtitle row below the title. The subtitle MUST be hidden when `show_title: false`.

- **FR-903-C (Icon)**: The card MUST display an icon to the left of the title in a 42×42 px container with a 24 px `ha-icon`/`ha-state-icon`. Default: entity's icon attribute. Configurable via `icon` YAML field. Hidden when `show_icon: false`. When entity has no icon and no `icon` is configured, no icon element is rendered.

- **FR-903-D (Header omission)**: When both `show_title: false` and `show_icon: false` are set, the entire header area MUST be omitted from the rendered DOM.

- **FR-903-E (Two-column comparison panel)**: The comparison panel MUST display current-period and reference-period cumulative values in a two-column layout. Each column heading MUST include a compact period qualifier generated by `formatCompactPeriodCaption` using the HA instance time zone and the card label locale.

- **FR-903-F (Delta chip — always visible)**: The delta chip MUST always be rendered. When data is available, it shows `+/−absolute | +/−percentage`. When difference is zero, it shows `0 kWh | 0 %` without sign prefix. When data is unavailable, it shows `--- <unit> | -- %`; if unit is also unavailable, shows `--- | -- %`.

- **FR-903-G (Explicit sign on differences)**: Absolute difference and percentage difference MUST carry an explicit `+` prefix when positive and `−` (U+2212) when negative. Zero values MUST have no sign prefix.

- **FR-903-H (Period qualifiers — locale and time zone)**: `formatCompactPeriodCaption` MUST use the HA instance time zone for all boundary computations. Locale cascade: card `language` → HA user language → `en`. Optional HA `locale.time_format` applies to clock portions of hourly-window captions. Abbreviated month names MUST come from Luxon/ICU — no hardcoded per-locale dictionaries.

- **FR-903-I (Forecast | Total panel — semantics)**: "Total" in the Forecast panel MUST represent the full LTS consumption of the reference period (entire configured reference window), not a partial "to-date" subset. "Forecast" MUST represent the projected full-period consumption from `computeForecast`.

- **FR-903-J (Forecast panel visibility)**: The Forecast | Total panel MUST be rendered only when `show_forecast: true` (or the `forecast` alias). When `show_forecast: false`, the entire panel block MUST be absent from the DOM.

- **FR-903-K (Warning bar placement)**: Warnings about incomplete reference series data MUST appear exclusively in the `.ebc-warning` bar at the bottom. They MUST NOT be duplicated in the comparison panel body.

- **FR-903-L (Historical value removal)**: The "Historical value" statistic row MUST NOT appear in the forecast section. Only "Consumption in reference period" is retained for the reference total. The `forecast.historical_value` translation key MUST be removed from all translation files.

- **FR-903-M (HA theming via CSS tokens)**: The card MUST read HA theme colors exclusively from CSS custom properties on the host element. Hardcoded colors for text, backgrounds, or accents that contradict the HA token system are forbidden. Switching HA themes MUST cause the card to re-render with updated token values.

- **FR-903-N (Semantic CSS class names)**: Main card sections MUST use stable, function-named CSS classes: `.ebc-card`, `.ebc-header`, `.ebc-stats`, `.ebc-forecast`, `.ebc-chart`, `.ebc-warning`. Class names MUST NOT encode visual details (colors, sizes). Additional classes follow the same `ebc-*` semantic naming convention.

- **FR-903-O (Style/logic separation)**: All CSS rules MUST be defined in `src/card/energy-horizon-card-styles.ts`. The main component imports this module; it does not define computation-adjacent inline styles. Computation logic files MUST have zero imports from the styles module. Style absence MUST degrade only visual appearance, not data or logic.

- **FR-903-P (Interpretation YAML)**: The card MUST accept `interpretation` with allowed values **`consumption`** and **`production`**, matched **case-insensitively**. When the key is **omitted** or the value is **not** `consumption` or `production` after that parse, the effective mode MUST be **`consumption`**. When `debug: true`, an unrecognized value MAY produce a **console** diagnostic; the card MUST NOT enter a configuration-error render state solely due to an invalid `interpretation` string.

- **FR-903-V (Neutral band YAML)**: The card MUST accept optional **`neutral_interpretation`**: a **non-negative** number interpreted as **percent** `T` for the neutral semantic band. When **omitted**, **`T` MUST default to `2`**. When the value is **negative**, **non-numeric**, or otherwise invalid, **`T` MUST default to `2`**; the card MUST NOT crash. Semantic **neutral** (icon + chart delta styling) applies when **`|p| ≤ T`** per the normative definition in “Narrative interpretation…”, where `p` is the same chip percentage **when available**; **reference = 0** follows Edge Case 15. When **`p`** is **not** available, **FR-903-W** applies instead of this band.

- **FR-903-Q (Semantic mapping)**: **When `p` is available** (or the reference-zero rule applies without placeholder chip): **After** applying **FR-903-V** (including neutral when **`|p| ≤ T`** or the reference-zero rule): for **`consumption`**, when outside the neutral band, `current > reference` MUST map to **negative** semantic outcome (warning styling); `current < reference` MUST map to **positive** semantic outcome (success styling). For **`production`**, when outside the neutral band, the mapping MUST be **inverted**: `current > reference` → **positive** outcome; `current < reference` → **negative** outcome.

- **FR-903-R (Cross-UI consistency)**: The narrative interpretation row (when visible) and the chart delta segment MUST use the **same** semantic color and trend meaning for the same **neutral vs positive vs negative** outcome derived from **`interpretation`**, **`neutral_interpretation`**, and `(current − reference)` / `p`, **or** the **insufficient-data** outcome when **`p`** is unavailable (**FR-903-W**).

- **FR-903-W (Missing delta data — interpretation)**: When the comparison delta is in the **placeholder** state (no reliable signed percent **`p`** for semantics), the narrative row (when visible) MUST use **dedicated** `localize()` keys for **insufficient comparison data** — **not** success, warning, or neutral-band strings. Icon and chart delta styling MUST be **muted / non-judgment** and MUST **not** match neutral-band (“similar”) styling. Narrative and chart MUST remain **mutually consistent** on this path.

- **FR-903-S (Localization)**: All new or revised user-visible strings for interpretation (including production-specific copy, **neutral-band** copy, and **insufficient-data** copy for the **comparison narrative** and chart delta affordances) MUST be implemented via `localize()` with keys in **`en`**, **`pl`**, and **`de`** per `905-localization-formatting`.

- **FR-903-T (Editor parity)**: The visual editor MUST expose interpretation as **two options** (Consumption / Production), defaulting to **Consumption**, with shallow-merge behavior consistent with `904-configuration-surface`.

- **FR-903-U (Forecast panel — interpretation)**: The Forecast \| Total panel MUST **not** alter user-visible strings, headings, or translation keys based on `interpretation`; forecast and total presentation remain as in `FR-903-I` regardless of mode.

---

## Key Entities

- **`CardConfig`**: YAML configuration object. UI-relevant fields: `title`, `show_title`, `icon`, `show_icon`, `show_forecast` (alias `forecast`), `language`, `interpretation` (`consumption` | `production`; omit → `consumption`), `neutral_interpretation` (optional percent `T` for neutral band; omit → `2`).
- **`Interpretation` mode**: Selects consumption vs production **semantic** polarity for the **comparison narrative row** and **chart delta** (outside the neutral band); does not change arithmetic delta signs on the chip; does not change Forecast \| Total copy.
- **`neutral_interpretation`**: Percent threshold `T` such that **`|p| ≤ T`** yields **neutral** styling for narrative icon and chart delta; independent of delta chip numeric display.
- **Header section** (`.ebc-header`): Contains icon container (42×42 px), title line (friendly name or configured string), and entity subtitle line (`entity_id`).
- **Comparison panel** (`.ebc-stats`): Two-column current/reference cumulative values, compact period captions, single delta chip (`+/−absolute | +/−percentage`).
- **Forecast | Total panel** (`.ebc-forecast`): Shows `ForecastStats.forecast_total` (Forecast) and the full reference period total (Total). Absent when `show_forecast: false`.
- **Delta chip**: Always-visible inline element. Three states: data available (signed values), zero (unsigned zero), data unavailable (`--- <unit> | -- %`).
- **`formatCompactPeriodCaption`**: Function in `src/card/labels/compact-period-caption.ts` producing compact date qualifiers from `ComparisonWindow` bounds in the HA time zone and resolved label locale.
- **Warning bar** (`.ebc-warning`): Bottom-of-card element for incomplete-reference-series warnings; never duplicated in the stats panel.
- **`energy-horizon-card-styles.ts`**: The sole CSS definition module; imported by the main card component.

---

## Success Criteria

- **SC-903-1**: Every rendered card on a dashboard shows a meaningful title without additional manual configuration for entities that have friendly names defined in HA.
- **SC-903-2**: The delta chip is visible in 100% of test scenarios (including zero difference and missing data states); users confirm instant direction comprehension without comparing raw numbers.
- **SC-903-3**: An advanced user using only CSS rules targeting semantic `.ebc-*` class names can hide or resize any major card section within 10 minutes, without consulting implementation files.
- **SC-903-4**: Switching HA themes (light/dark) with at least 5 standard HA themes produces no critical contrast failures on key card elements.
- **SC-903-5**: Removing the styles import from the main component causes only visual degradation; all data fetching, statistics computation, and forecast remain functional.
- **SC-903-6**: With `interpretation: production`, users correctly identify “better” vs “worse” outcomes in **90%+** of moderated test cases where current and reference differ, without referring to raw numbers alone.
- **SC-903-7**: With default or explicit `interpretation: consumption`, side-by-side comparison with the prior release shows **no** unintended change to semantic colors or consumption-oriented wording for the same data.
- **SC-903-8**: Automated or manual test suites cover both interpretation modes for at least: current > reference, current < reference, and missing key / explicit consumption.
- **SC-903-9**: With default **`neutral_interpretation`** (or explicit `2`), cases where **`|p| ≤ 2`** show **neutral** narrative + chart delta styling; with **`neutral_interpretation: 0`**, neutral applies only when **`p`** is exactly zero (strict band).

---

## Assumptions

- Entity friendly names and icon attributes are available from the HA `hass.states` registry at render time; no additional API calls are required.
- HA icon collection is MDI (`mdi:*`) accessed via `ha-icon`/`ha-state-icon` web components.
- `period_offset` configuration correctly shifts the reference period's `start`/`end` dates; `formatCompactPeriodCaption` reuses the already-computed `ComparisonWindow` bounds.
- The `−` sign for negative differences is U+2212 (minus sign) or a regular hyphen-minus (`-`), following existing project formatting conventions.
- `anomalousReference` from `ForecastStats` may optionally be surfaced in the UI (e.g. a confidence indicator); the specific presentation is an implementation detail not normatively specified here.
- **Interpretation** generalizes “entity semantics” beyond electricity; wording may say “energy” or be generic per copy review, but behavior is the same for any cumulative statistic exposed by the card.
- **`neutral_interpretation`** defaults to **2** percent when omitted, matching a common “close enough” band; power users may set **`0`** for strict neutrality only at exact balance (per **SC-903-9**).
- Automated tests, changelog entry **1.1.0**, and README / README-advanced / wiki updates for this feature are tracked under `907-docs-product-knowledge` and `tasks.md` for this feature.
