---
description: "Task list — Figma-aligned Energy Horizon Card UI v0.5.0"
---

# Tasks: Figma-aligned Energy Horizon Card UI (v0.5.0)

**Input**: Design documents from `/Users/admin/Projekty Local/Energy-Horizon/specs/001-figma-ui-rollout/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)  
**Design reference (Figma mapping)**: [figma-ui-project-source.md](./figma-ui-project-source.md) — file `AbPnTcmRe6WhVGpJt8U6Xj`, node `113:437` (optional MCP verify; do not edit Figma)

**Tests**: **Included** — US-9 / FR-010 require automated coverage (`npm test`, Vitest).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency on incomplete sibling tasks)
- **[USn]**: User story from [spec.md](./spec.md)
- Paths below are relative to repository root `Energy-Horizon/`

---

## Phase 1: Setup (shared)

**Purpose**: Confirm baseline and design references before code changes.

- [x] T001 Verify baseline passes `npm test` and `npm run lint` per `package.json` scripts at repository root
- [x] T002 [P] Skim `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2–§4 and `specs/001-figma-ui-rollout/figma-ui-project-source.md` for layer names (Card Header, Data series info, Surface, Chart, Warning) — no Figma file edits

---

## Phase 2: Foundational (blocking)

**Purpose**: Tokens, semantic layout shell, and shared **trend → visual** mapping required by US-4, US-5, and US-6.

**⚠️ CRITICAL**: Complete before user-story UI work.

- [x] T003 Add HA-themed CSS custom properties (e.g. `--eh-series-current`, surface/spacing aligned to `specs/001-figma-ui-rollout/figma-ui-project-source.md` §4) in `src/card/energy-horizon-card-styles.ts`
- [x] T004 Refactor `render` structure in `src/card/cumulative-comparison-chart.ts` to wrap future sections in `.ebc-section--header`, `.ebc-section--comparison`, `.ebc-section--forecast-total`, `.ebc-chart` container parent, `.ebc-section--comment`, `.ebc-section--warning` (preserve existing data bindings temporarily inside wrappers)
- [x] T005 [P] Create `src/card/trend-visual.ts` exporting MDI icon id and semantic color tokens for `Trend` from `src/card/types.ts` (`higher` \| `lower` \| `similar` \| `unknown`) for chart + comment reuse
- [x] T006 [P] Add `role="region"` and localized `aria-label` attributes for each `.ebc-section--*` in `src/card/cumulative-comparison-chart.ts` per `specs/001-figma-ui-rollout/contracts/lovelace-card-contract.md`

**Checkpoint**: Foundation ready — P1 story implementation can proceed in sequence below.

---

## Phase 3: User Story 1 — Nagłówek (Priority: P1)

**Goal**: Tytuł + podtytuł `entity_id` + ikona 42×42 / 24px; przy `show_title: false` brak linii tekstowych nagłówka (spec Clarifications).

**Independent Test**: Inspekcja DOM: włączony tytuł → druga linia to wyłącznie `entity_id`; ikona w kontenerze 42px; wyłączony tytuł → brak obu linii; ikona wg `show_icon`.

### Implementation

- [x] T007 [US1] Implement Card Header markup in `src/card/cumulative-comparison-chart.ts`: 42×24 icon wrapper with `ha-icon` / `ha-state-icon`; `entity_id` subtitle only when `show_title !== false`
- [x] T008 [P] [US1] Add header typography and icon circle styles in `src/card/energy-horizon-card-styles.ts` per `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2 Card Header and §4.3

---

## Phase 4: User Story 2 — Panel porównania + chip delty (Priority: P1)

**Goal**: Dwukolumnowy układ z captionami; jeden chip delty; zawsze widoczny; zero / `---` + jednostka per Clarifications.

**Independent Test**: Dwa okna + dane: układ grid; chip z separatorem `|`; scenariusz różnicy 0; scenariusz braku `difference` → `---` + unit + `-- %`.

### Implementation

- [x] T009 [US2] Replace list-style `.summary` rows in `src/card/cumulative-comparison-chart.ts` with two-column comparison grid + period captions (current vs reference) per `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2 Data series info
- [x] T010 [US2] Implement single delta chip in `src/card/cumulative-comparison-chart.ts` (absolute + percent, theme semantic colors); enforce always-visible chip and placeholder rules from spec Clarifications
- [x] T011 [P] [US2] Add comparison panel, divider, and delta chip styles in `src/card/energy-horizon-card-styles.ts`

---

## Phase 5: User Story 3 — Forecast \| Total (Priority: P1)

**Goal**: Semantyka §1.3 przy włączonej prognozie; przy `show_forecast: false` cały panel ukryty (Clarifications).

**Independent Test**: `show_forecast` true → Total = pełne okno referencyjne, Forecast = pełny bieżący; `show_forecast` false → brak sekcji `.ebc-section--forecast-total` w DOM.

### Implementation

- [x] T012 [US3] Implement full **reference-window** cumulative for **Total** in `src/card/ha-api.ts`; align `ForecastStats` / comments in `src/card/types.ts` if `reference_total` semantics change
- [x] T013 [US3] Render Forecast \| Total panel in `src/card/cumulative-comparison-chart.ts` only when existing forecast visibility gate passes (`isForecastLineVisible` from `src/card/cumulative-comparison-chart.ts` + `forecast.enabled`); remove duplicate legacy rows from old forecast block as needed
- [x] T014 [P] [US3] Add second-panel (surface + grid) styles in `src/card/energy-horizon-card-styles.ts` per `specs/001-figma-ui-rollout/figma-ui-project-source.md` Surface Container

---

## Phase 6: User Story 6 — Wykres (Priority: P1)

**Goal**: Pion „dziś” pełna wysokość; DeltaLineToday; kropka referencji; 3 etykiety X (gdy seria bieżąca widoczna); baseline X gdy nie; 5 split + 3 etykiety Y.

**Independent Test**: Checklist wymagań szczegółowych 2–6 w [spec.md](./spec.md); oś X bez serii bieżącej — brak regresji względem zachowania 0.4.x (Clarifications).

### Implementation

- [x] T015 [US6] Implement full-grid-height today `markLine` in `src/card/echarts-renderer.ts` (wymaganie szczegółowe 2)
- [x] T016 [US6] Draw vertical delta segment at “today” between current and reference values using colors from `src/card/trend-visual.ts` in `src/card/echarts-renderer.ts` (wymaganie 3)
- [x] T017 [US6] Update reference series “today” dot (`markPoint` / `graphic`) styling in `src/card/echarts-renderer.ts` to match current Figma reference dot (wymaganie 4)
- [x] T018 [US6] Implement X-axis label strategy: three labels when current series shown; when current hidden match v0.4.0 baseline in `src/card/echarts-renderer.ts` and/or `src/card/axis/axis-label-format.ts` (wymaganie 5)
- [x] T019 [US6] Configure Y-axis: five horizontal split lines and three value labels (0, mid, max) with formatter in `src/card/echarts-renderer.ts` (wymaganie 6)
- [x] T020 [P] [US6] Thread theme colors via `getComputedStyle` from card host into `ChartRendererConfig` in `src/card/cumulative-comparison-chart.ts` and consumption in `src/card/echarts-renderer.ts`

---

## Phase 7: User Story 4 — Komentarz + ikona trendu (Priority: P2)

**Goal**: Ten sam tekst co `textSummary` + MDI ikona; spójność z deltą na wykresie.

**Independent Test**: Cztery stany trendu + unknown → poprawna ikona i klasy kolorów zgodne z `src/card/trend-visual.ts`.

### Implementation

- [x] T021 [US4] Replace heading-only narrative in `src/card/cumulative-comparison-chart.ts` with panel: `ha-icon` + existing localized strings from `textSummary` flow
- [x] T022 [P] [US4] Add intelligent-comment panel styles in `src/card/energy-horizon-card-styles.ts` per `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2 Inteligent comment

---

## Phase 8: User Story 5 — Warning strip (Priority: P2)

**Goal**: Pełny tekst `summary.incomplete_reference` tylko w `.ebc-section--warning` u dołu; brak duplikatu w panelu porównania (FR-006).

**Independent Test**: `reference_cumulative == null` → jedna pełna wiadomość w sekcji warning; brak `.summary-note` z tym samym tekstem wyżej.

### Implementation

- [x] T023 [US5] Move incomplete-reference messaging in `src/card/cumulative-comparison-chart.ts` from inner `.summary` / `.summary-note` to `.ebc-section--warning` only; remove duplicate full text from comparison panel
- [x] T024 [P] [US5] Add warning strip layout and `color-mix` with `var(--warning-color)` in `src/card/energy-horizon-card-styles.ts`

---

## Phase 9: User Story 7 — Motyw HA + typografia (Priority: P2)

**Goal**: Brak sztywnych `#` jako jedynego źródła; font z motywu; wagi/rozmiary jak §4.

**Independent Test**: Przełączenie jasny/ciemny w HA — karta i wykres czytelne; grep nie pokazuje nowych hardcoded kolorów produkcyjnych.

### Implementation

- [x] T025 [P] [US7] Audit and replace remaining primary-path hex/rgb in `src/card/energy-horizon-card-styles.ts` with HA CSS variables or `color-mix` per `specs/001-figma-ui-rollout/figma-ui-project-source.md` §4.0
- [x] T026 [US7] Audit `src/card/echarts-renderer.ts` for hardcoded colors; prefer computed theme tokens from host for series, grid, and labels

---

## Phase 10: User Story 8 — i18n + edytor (Priority: P2)

**Goal**: Wszystkie nowe stringi we **wszystkich** locale; edytor bez regresji typów.

**Independent Test**: Zmiana języka HA → brak `MISSING_TRANSLATION_KEY`; edytor zapisuje istniejące pola.

### Implementation

- [x] T027 [P] [US8] Add or update keys in `src/translations/en.json`, `src/translations/pl.json`, `src/translations/de.json` for new layout labels and section `aria-label` strings
- [x] T028 [US8] Sync `src/card/energy-horizon-card-editor.ts` with any new/changed `CardConfig` fields in `src/card/types.ts`

---

## Phase 11: User Story 9 — Testy regresji (Priority: P3)

**Goal**: Vitest pokrywa semantykę Total, trend→wizualizacja, formatowanie chipa, ostrzeżenie; `npm test` zielony.

**Independent Test**: `npm test` i `npm run lint` przechodzą po T033.

### Tests (US-9)

- [x] T029 [P] [US9] Add or extend tests for full-reference **Total** vs first-panel cumulative in `tests/unit/ha-api.test.ts` (or new `tests/unit/forecast-total-semantics.test.ts`)
- [x] T030 [P] [US9] Add `tests/unit/trend-visual.test.ts` for icon + token mapping from `src/card/trend-visual.ts`
- [x] T031 [P] [US9] Extend `tests/unit/echarts-renderer.test.ts` for axis label counts and today-line option when current series visible vs hidden
- [x] T032 [US9] Extend `tests/unit/cumulative-comparison-chart-renderer-state.test.ts` and/or `tests/integration/card-render.test.ts` for delta chip always present and warning-only incomplete reference (no duplicate in summary)
- [x] T033 [US9] Run full `npm test` and `npm run lint` at repository root; fix regressions

---

## Phase 12: Polish & cross-cutting

**Purpose**: Release hygiene and manual validation.

- [x] T034 [P] Bump version in `package.json` to `0.5.0` and update `changelog.md` and `README.md` if screenshots or behavior notes require refresh per project constitution
- [ ] T035 Run manual checklist in `specs/001-figma-ui-rollout/quickstart.md` (themes, header, panels, chart checklist SC-004, `show_forecast` on/off)

---

## Dependencies & execution order

### Phase dependencies

- **Phase 1** → **Phase 2** → **Phases 3–11** (user stories) → **Phase 12**
- **Phase 2** blocks all user-story phases

### User story dependencies (recommended)

| Story | Priority | Depends on |
|-------|----------|------------|
| US1 | P1 | Phase 2 |
| US2 | P1 | Phase 2, US1 (same file — sequential recommended) |
| US3 | P1 | Phase 2, US2 |
| US6 | P1 | Phase 2, US3 (chart uses stable layout); uses `src/card/trend-visual.ts` from Phase 2 |
| US4 | P2 | Phase 2, US6 optional for visual polish; needs `trend-visual.ts` |
| US5 | P2 | US2 (comparison markup stable) |
| US7 | P2 | US6 for chart color audit |
| US8 | P2 | US1–US6 strings mostly known |
| US9 | P3 | Core implementation through US6 minimum; full suite after US8 |

**Note**: Strict P1-before-P2: complete Phases 3–6 (US1, US2, US3, US6) before Phases 7–10.

### Parallel opportunities

- After **T004**: **T005** and **T006** in parallel (different concerns: new file vs same file as T004 — if T006 touches same file as T004, run T006 after T004 completes; **T005** still parallel to T004 once types are stable)
- **T008** ∥ **T007** after T007’s structure is sketched (if same PR, sequential safer)
- **T011** ∥ **T009–T010** after grid structure agreed
- **T014** ∥ **T012–T013**
- **T020** ∥ **T015–T019** once config shape for colors is defined (or run T020 last in US6)
- **T022** ∥ **T021**
- **T024** ∥ **T023**
- **T025** ∥ **T026** (different files)
- **T027** (three JSON files): three parallel workers for `en` / `pl` / `de` — mark as single [P] task or split (here one task covers all paths)
- **T029–T031** in parallel before **T032**

---

## Parallel example: User Story 6

```bash
# After T015–T019 spec is clear, parallel docs:
# T020 threads colors in cumulative-comparison-chart.ts + echarts-renderer.ts
# Can run T025 (US7 styles audit) in parallel with T019 if US6 chart file stable
```

---

## Parallel example: User Story 9

```bash
# Launch together:
tests/unit/ha-api.test.ts  # T029
tests/unit/trend-visual.test.ts  # T030
tests/unit/echarts-renderer.test.ts  # T031
# Then integration/state tests T032, then T033 gate
```

---

## Phase 13: Layout section visibility (US-10, FR-011–FR-013)

**Goal**: Optional YAML + visual editor toggles for comparison panel, Forecast \| Total panel, and narrative comment; regressions: `show_forecast: false` still hides entire second panel.

- [x] T036 [US10] Add `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment` to `CardConfig` in `src/card/types.ts` with Figma-oriented comments
- [x] T037 [US10] Gate `.ebc-section--comparison`, `.ebc-section--forecast-total`, `.ebc-section--comment` in `src/card/cumulative-comparison-chart.ts` (forecast panel: `showForecastTotalPanel` after `shouldShowForecast`)
- [x] T038 [US10] [P] Extend `HaFormSchema` boolean variant in `src/ha-types.ts`; add fields to `_formData` / `_buildSchema` in `src/card/energy-horizon-card-editor.ts`
- [x] T039 [P] [US10] Add `editor.show_*` strings to `src/translations/en.json`, `pl.json`, `de.json`
- [x] T040 [US10] Vitest: `tests/integration/card-render.test.ts` — sections present by default; each `show_*: false`; `show_forecast: false` + `show_forecast_total_panel: true` → no forecast panel
- [x] T041 [P] [US10] Docs: `changelog.md`, `README.md`, `README.advanced.md`, `wiki-publish/Configuration-and-Customization.md`, `wiki-publish/Documentation-Maintenance.md`, `specs/001-figma-ui-rollout/figma-ui-project-source.md`; update `specs/001-figma-ui-rollout/*` (this rollout spec)

---

## Implementation strategy

### MVP (minimal vertical slice)

1. Phase 1 + Phase 2  
2. Phase 3 (US1) only → **STOP**: validate header + Clarifications B  
3. Continue US2 → US3 → US6 for P1 release candidate

### Incremental delivery

1. Foundation → US1 → US2 → US3 → **US6** (chart) = core P1 UX  
2. US4 → US5 → US7 → US8 = polish + a11y/theme/i18n  
3. US9 + Phase 12 = ship gate

### Format validation

- All tasks use `- [ ] Tnnn` with sequential IDs T001–T041 (T036–T041 = layout visibility)  
- `[USn]` only on user-story phase tasks (Phases 3–11)  
- `[P]` only where parallel-safe  
- Each task references at least one concrete path (`src/…`, `tests/…`, `specs/…`, or `package.json` / `CHANGELOG.md` / `README.md`)

---

## Task counts

| Scope | Count |
|-------|------:|
| Setup | 2 |
| Foundational | 4 |
| US1 | 2 |
| US2 | 3 |
| US3 | 3 |
| US6 | 6 |
| US4 | 2 |
| US5 | 2 |
| US7 | 2 |
| US8 | 2 |
| US9 | 5 |
| Polish | 2 |
| US10 layout visibility | 6 |
| **Total** | **41** |

**Suggested MVP scope**: Phase 1–2 + Phase 3 (US1) — then validate before US2.

**Suggested next commands**: `/speckit.analyze` (consistency) or `/speckit.implement` phased against this file.
