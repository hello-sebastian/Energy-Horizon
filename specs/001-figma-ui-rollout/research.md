# Research: Figma-aligned UI v0.5.0 (001-figma-ui-rollout)

**Date**: 2026-04-09  
**Sources**: `spec.md`, `figma-design.md`, `figma-specify-prompt.md`, repo `package.json` / `src/card/*`, Figma MCP `get_design_context` (file `AbPnTcmRe6WhVGpJt8U6Xj`, node `113:437`).

## 1. Stack and tooling

**Decision**: Implement UI in existing **Lit 3.1 + TypeScript 5.6 (strict) + Vite 6 + Vitest 2 + ECharts 5.6** stack; no new runtime dependencies for this feature.

**Rationale**: Matches current `energy-horizon-card` package and constitution III/V.

**Alternatives considered**: Chart.js (rejected — project migrated to ECharts). Tailwind/React from Figma MCP output (rejected — reference only; card uses Lit + scoped CSS).

## 2. Design authority and Figma verification

**Decision**: Treat **`figma-design.md`** as the authoritative mapping document; use **Figma MCP** only to confirm structure, layer names, and spacing tokens against node `113:437`.

**Rationale**: Spec explicitly defers to `figma-design.md` §1–§8. MCP `get_design_context` (2026-04-09) confirms: Card Header (42 px icon, `entity_id` subtitle), Data series grid + Delta chip, Forecast | Total surface, Chart layers (`echarts__markLine--today`, `DeltaLineToday`, dots), Inteligent comment + Warning status — aligned with `figma-design.md`.

**Alternatives considered**: Pixel-perfect copy of MCP-generated React/Tailwind (rejected — must adapt to HA theming and Lit).

## 3. Theming and tokens

**Decision**: Prefer **Home Assistant CSS variables** (`--primary-text-color`, `--secondary-text-color`, `--error-color`, etc.) and **`color-mix()`** for translucent surfaces; use **minimal `--eh-*`** only for brand series accent where HA has no semantic match (`figma-design.md` §4.0).

**Rationale**: Constitution IV + spec FR-008 / US-7.

**Alternatives considered**: Hardcoding Figma hex from §4.1 (rejected for production paths; acceptable only as fallbacks after `var()`).

## 4. ECharts: today line, delta segment, axes

**Decision**: Configure **markLine / custom series / graphic** (existing `echarts-renderer.ts` patterns) so that:

- “Today” vertical runs **grid bottom → grid top** (spec detail 2).
- **DeltaLineToday** is a **vertical segment between** current and reference Y at the “today” bucket (spec detail 3); colors from shared **trend → semantic color** mapping (higher/lower/similar/unknown per spec assumptions).
- **X-axis**: when current series is shown — **three** labels (first, today, last); when current hidden — **no change vs v0.4.0 baseline** (spec clarifications).
- **Y-axis**: **five** horizontal split lines, **three** labels (0, mid, max) (spec detail 6).

**Rationale**: Spec US-6 and `figma-design.md` §2.2; ECharts requires explicit `axisLabel` formatter / interval logic.

**Alternatives considered**: Default ECharts tick density (rejected — violates SC-004 checklist).

## 5. Reference series dot appearance

**Decision**: Match **current Figma layer** “Refference series dot” (node `31:152` in MCP export under `Today pointer`); implement via ECharts `markPoint` / graphic with sizes and stroke/halo derived from theme tokens, not raster assets from Figma.

**Rationale**: Spec detail 4 + `figma-design.md` §2.1; constitution forbids importing Figma icon rasters for MDI-equivalent cases — dots are drawn primitives, not MDI.

**Alternatives considered**: Old screenshot-only reference (rejected).

## 6. Total (full reference window) vs Forecast

**Decision**: **Total** in the second panel = **cumulative consumption over the entire reference window** from LTS (§1.3). **Forecast** = end-of-current-window forecast already computed for the card. Extend **`ForecastStats`** (or adjacent computation in `ha-api`) so UI can show **reference period total** distinct from “to today” first panel — exact field wiring to be implemented per `tasks.md`; types may add an explicit `reference_period_total` if `reference_total` today is semantically ambiguous in code.

**Rationale**: US-3, FR-001 exception, `figma-design.md` §1.3; minimizes breaking YAML.

**Alternatives considered**: New top-level `CardState` field only (deferred unless cleaner than extending `ForecastStats` after code audit).

**Visibility (clarified in spec, Session 2026-04-09):** When **`show_forecast` is `false`** (or alias `forecast: false`), the **entire** second panel (**Forecast \| Total**) is **not rendered** — same as v0.4.x; there is **no** “Total-only” panel in that mode. **Total** semantics §1.3 apply only when the panel is shown.

## 7. Warning strip vs summary note

**Decision**: **Single** full `summary.incomplete_reference` message in **bottom Warning section** only; **remove duplicate** full message from inside the summary grid (spec clarifications, FR-006).

**Rationale**: US-5; current `cumulative-comparison-chart.ts` renders `.summary-note` inside `.summary` when `reference_cumulative == null`.

**Alternatives considered**: Duplicate in both places (rejected).

## 8. Delta chip: zero and missing data

**Decision**: Chip **always rendered**; zero → formatted `0` + unit + `0%`; missing → `---` + unit (if available) + `| -- %` else `--- | -- %` (spec clarifications).

**Rationale**: FR-003.

**Alternatives considered**: Hide chip when unknown (rejected).

## 9. Header when title off

**Decision**: If **`show_title === false`**, do **not** show `entity_id` line; icon row follows existing `show_icon` contract (spec clarifications B).

**Rationale**: FR-002.

## 10. Regression baseline for X-axis (current series hidden)

**Decision**: Lock automated or manual regression to **release `v0.4.0`** (npm `0.4.0` / git tag) as **baseline** for “labels behave as before v0.5.0” when current series is hidden.

**Rationale**: Spec assumption; gives implementers a concrete git ref.

**Alternatives considered**: “main at merge time” (less reproducible).

## 11. i18n

**Decision**: Add or adjust keys for **CAPS labels** (“TO THIS DAY”, panel labels) per layout; update **all** locale files under `src/translations/` that the card ships (SC-003).

**Rationale**: US-8, FR-009.

## 12. Accessibility

**Decision**: When refactoring markup into regions (header, panels, chart, comment, warning), add **landmarks / aria** where consistent with Lovelace patterns (constitution IV).

**Rationale**: Non-regressive a11y; optional enhancement called out in plan Phase F1.

---

## Open items for implementation (not spec blockers)

- Exact MDI icon set for trend variants (choose consistent trio + `unknown` neutral).
- Whether `forecast.confidence` note remains in new layout or moves (out of spec MVP if unchanged behavior acceptable).
