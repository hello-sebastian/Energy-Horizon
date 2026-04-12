# Tasks: ECharts Migration (003-echarts-migration)

**Input**: Design documents from `/specs/003-echarts-migration/`
**Tech Stack**: TypeScript 5.6 (strict) + Lit 3.1, Apache ECharts 5.6.0 (modularny), Vite 6, Vitest 2  
**Scope**: 1 nowy plik (`src/card/echarts-renderer.ts` ~200–300 LOC) + minimalna zmiana w `cumulative-comparison-chart.ts` (2–4 linie) + testy jednostkowe

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Można uruchomić równolegle (różne fragmenty pliku / niezależne zadania)
- **[Story]**: Przynależność do user story (US1–US4)

---

## Phase 1: Setup (Instalacja zależności)

**Purpose**: Aktualizacja `package.json` — dodanie ECharts, usunięcie Chart.js

- [x] T001 Install `echarts@^5.6.0` via `npm install echarts@^5.6.0`
- [x] T002 Remove `chart.js` and `chartjs-adapter-date-fns` via `npm uninstall chart.js chartjs-adapter-date-fns`

**Checkpoint**: `package.json` zawiera `echarts ^5.6.0`; `chart.js` i `chartjs-adapter-date-fns` nie figurują w żadnej sekcji zależności

---

## Phase 2: Foundational (Szkielet renderera)

**Purpose**: Kluczowe bloki budowlane `EChartsRenderer` — muszą istnieć przed implementacją jakiegokolwiek user story

⚠️ **CRITICAL**: Żadne user story nie może być implementowane przed ukończeniem tej fazy

- [x] T003 Create `src/card/echarts-renderer.ts` with modular ECharts imports (`echarts/core`, `echarts/charts`, `echarts/components`, `echarts/renderers`), `echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, MarkPointComponent, CanvasRenderer])` call at module level, and class skeleton with private fields (`container: HTMLElement`, `instance: ECharts | undefined`, `resizeObserver: ResizeObserver`, `lastHash: string | undefined`) and stub public methods `update()` and `destroy()`
- [x] T004 [P] Port `alignSeriesOnTimeline()` private method 1:1 from `src/card/chart-renderer.ts` to `src/card/echarts-renderer.ts`
- [x] T005 [P] Implement `resolveColor(primaryColorConfig: string): string` and `getHaThemeTokens()` (tokeny HA: `referenceLine`, `grid`, `primaryText`, tooltip) w `src/card/echarts-renderer.ts` — `getComputedStyle(getThemeHost())` jak w migracji z Chart.js, rozszerzone o tekst osi i tooltip
- [x] T006 [P] Implement `niceMax(dataMax: number, splitCount: number): number` helper in `src/card/echarts-renderer.ts` using algorithm: if `dataMax <= 0` return `splitCount`; compute `step = 10^floor(log10(dataMax/splitCount))`; round `dataMax/splitCount/step` up to nearest `[1, 2, 2.5, 5, 10]`; return `ceil(dataMax / niceStep) * niceStep`

**Checkpoint**: `src/card/echarts-renderer.ts` kompiluje się bez błędów TypeScript; klasa istnieje z poprawnymi prywatnymi polami i metodami-stubami

---

## Phase 3: User Story 1 – Poprawna wizualizacja danych (Priority: P1) 🎯 MVP

**Goal**: `EChartsRenderer` renderuje wykres identycznie jak poprzednia implementacja Chart.js — pełna oś czasu, null gaps, marker dziś, wypełnienia, prognoza, 5 ticków Y, kolory, legenda, tooltip w Shadow DOM

**Independent Test**: Karta z pełną konfiguracją (`fill_current: true`, `fill_reference: true`, `show_forecast: true`, `primary_color: "#E53935"`) musi wyglądać identycznie jak przed migracją — oś z 365 pozycjami, gapy w linii, marker dziś z pionową linią przerywaną i kropkami, wypełnienia z odpowiednim kryciem, prognoza przerywana, 5 ticków na Y z jednostką przy najwyższym

### Implementation for User Story 1

- [x] T007 [US1] Implement `constructor(container: HTMLElement)`: call `echarts.init(container)`, assign to `this.instance`; create `ResizeObserver(() => this.instance?.resize())` and call `.observe(container)`; implement `destroy()`: `resizeObserver.disconnect()`, `instance?.dispose()`, `instance = undefined` in `src/card/echarts-renderer.ts` (listener `finished` + `off` — T008a)
- [x] T008 [US1] Implement `buildOption()` skeleton with static chart-level settings in `src/card/echarts-renderer.ts`: `animation: false` (FR-012); `grid: { containLabel: true, top: GRID_TOP_FALLBACK_PX, … }`; `legend: { show: rendererConfig.showLegend === true, … }` (FR-011 — tylko przy `show_legend: true`); kolory tekstu/siatki/tooltip z `getHaThemeTokens()` (FR-013a); `tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendTo: this.container }` (FR-010 — Shadow DOM fix); `xAxis` / `yAxis` z kolorami `theme.primaryText` / `theme.grid` (FR-009, FR-007, FR-008)
- [x] T008a [US1] `constructor`: `instance.on('finished', syncLegendLayoutAfterPaint)`; `syncLegendLayoutAfterPaint()` mierzy legendę i ustawia `grid.top` + ewent. `min-height` kontenera + `resize()` (FR-013b); `destroy`: `off('finished', …)`; `update`: reset stanu sync + `theme` w hash (FR-013a)
- [x] T009 [US1] Implement current series object inside `buildOption()` in `src/card/echarts-renderer.ts`: `type: 'line'`, `name: labels.current`, `data: currentValues`, `lineStyle: { color: primaryColor, width: 1.5 }`, `areaStyle: { opacity: fillCurrent ? fillCurrentOpacity / 100 : 0 }` (FR-005), `connectNulls: false` (FR-002). When YAML `connect_nulls` is enabled (default: true), renderer may additionally add a dashed, interpolated overlay across null gaps (overlay, not the solid line).
- [x] T010 [US1] Implement today marker in `buildOption()` inside current series in `src/card/echarts-renderer.ts`: compute `todaySlotIndex` via `findTimelineSlotContainingInstant(fullTimeline, Date.now())` (FR-003a; moduł `src/card/axis/now-marker-slot.ts`); compute `yTop` per FR-004 (Variant A when at least one series has value: `yTop = currentY !== null && referenceY !== null ? Math.max(currentY, referenceY) : (currentY ?? referenceY)`; Variant B when both null: use `{ xAxis: todaySlotIndex }` form); add `markLine: { silent: true, symbol: ['none', 'none'], data: [...], lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 } }` (FR-003, FR-004); add `markPoint: { silent: true, data: todayCurrentY !== null ? [{ coord: [todaySlotIndex, todayCurrentY], symbol: 'circle', symbolSize: 6, itemStyle: { color: primaryColor } }] : [] }` (FR-003, FR-013)
- [x] T011 [US1] Implement optional reference series in `buildOption()` in `src/card/echarts-renderer.ts`: conditionally push series when `series.reference` is defined; `lineStyle: { color: theme.referenceLine, width: 1.5 }`, `areaStyle: { opacity: fillReference ? fillReferenceOpacity / 100 : 0 }`, `connectNulls: false`, `markPoint` for today reference dot when `todayReferenceY !== null`
- [x] T012 [US1] Implement optional forecast series in `buildOption()` in `src/card/echarts-renderer.ts`: conditionally push when `rendererConfig.showForecast && todaySlotIndex >= 0 && todayCurrentY !== null && forecastTotal !== undefined`; `data: [[todaySlotIndex, todayCurrentY], [fullTimeline.length - 1, forecastTotal]]`; `lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 }`, `areaStyle: { opacity: 0 }`, `showSymbol: false`, `connectNulls: false` (FR-006)
- [x] T013 [US1] Implement `update()` method in `src/card/echarts-renderer.ts`: guard `if (!this.instance) return`; call `alignSeriesOnTimeline()` for both current and reference series; `getHaThemeTokens()`; hash `JSON.stringify({ c, r, cfg, theme })` — return early if `hash === this.lastHash`; reset stanu synchronizacji legendy; call `resolveColor()` + `buildOption()`; call `this.instance.setOption(option, { notMerge: true })`; update `this.lastHash`
- [x] T014 [US1] Update `src/card/cumulative-comparison-chart.ts`: replace `import { ChartRenderer }` with `import { EChartsRenderer }`; change field type `_chartRenderer?: ChartRenderer` to `_chartRenderer?: EChartsRenderer`; change canvas selector `querySelector("canvas")` to `querySelector(".chart-container")`; change constructor call `new ChartRenderer(canvas)` to `new EChartsRenderer(container)`; remove `<canvas></canvas>` from Lit template (ECharts creates its own canvas inside `.chart-container`); przekazuj `showLegend: this._config.show_legend === true` w `ChartRendererConfig`

**Checkpoint**: Karta wyświetla wykres w Home Assistant bez wizualnych regresji; `npm run build` kończy się bez błędów; istniejące testy Vitest nie łamią się

---

## Phase 4: User Story 2 – Brak custom hacków (Priority: P2)

**Goal**: Weryfikacja przez testy jednostkowe, że renderer nie zawiera żadnych bezpośrednich wywołań Canvas API

**Independent Test**: Code review + Vitest: zero wywołań `CanvasRenderingContext2D` metod poza ECharts; marker „dziś" przez `markLine`/`markPoint`; wypełnienie przez `areaStyle`

### Implementation for User Story 2

- [x] T015 [P] [US2] Write unit test in `tests/unit/echarts-renderer.test.ts` verifying that calling `update()` does not invoke any method on `CanvasRenderingContext2D` directly (mock `getContext` and assert it is never called with canvas API methods like `arc`, `stroke`, `fillRect`)
- [x] T016 [P] [US2] Write unit test in `tests/unit/echarts-renderer.test.ts` verifying ECOption structure: after `update()`, the option passed to `setOption` contains `markLine` and `markPoint` for today marker (not a custom plugin callback), and current series uses `areaStyle.opacity` for fill (not a custom drawing function) — assert by spying on `instance.setOption` and inspecting the option argument

**Checkpoint**: `npm test` — T015 i T016 przechodzą; code review potwierdza brak wywołań `ctx.arc`, `ctx.stroke`, `ctx.fillRect` w `echarts-renderer.ts`

- [x] T026 [P] [US2] Testy regresji FR-003a: `tests/unit/now-marker-slot.test.ts` (`findTimelineSlotContainingInstant`); w `tests/unit/echarts-renderer.test.ts` — describe „Now marker: markLine uses slot containing current instant” (np. `vi.setSystemTime` + hourly timeline → `xAxis` ≠ 0).

---

## Phase 5: User Story 3 – Zoptymalizowany rozmiar paczki (Priority: P3)

**Goal**: Bundle nie zawiera Chart.js; ECharts importowany wyłącznie modularnie; rozmiar nie wzrósł o więcej niż 50 kB gzip

**Independent Test**: `npm run build` — grep na bundle nie zwraca `chart.js`; żaden import w `echarts-renderer.ts` nie jest `import * as echarts from 'echarts'`

### Implementation for User Story 3

- [x] T017 [US3] Verify `src/card/echarts-renderer.ts` has no `import * as echarts from 'echarts'` — only subpath imports: `echarts/core`, `echarts/charts`, `echarts/components`, `echarts/renderers` (FR-015, SC-003); fix if violation found
- [x] T018 [US3] Run `npm run build`; inspect generated bundle in `dist/` — verify no strings `chart.js` or `chartjs-adapter-date-fns` present in output; measure gzip size and confirm increase ≤ 50 kB vs pre-migration baseline (SC-004)

**Checkpoint**: Bundle clean — zero Chart.js references; gzip delta ≤ 50 kB

---

## Phase 6: User Story 4 – Stabilny cykl życia (Priority: P4)

**Goal**: Testy jednostkowe potwierdzają brak wycieków pamięci — dokładnie 1 instancja ECharts na kontener, poprawne zwalnianie zasobów, resize bez nowej instancji

**Independent Test**: Vitest: wielokrotny `update()` → 1 instancja; `destroy()` → `dispose()` wywołane, `instance = undefined`; resize → `resize()` wywołane bez nowej instancji

### Implementation for User Story 4

- [x] T019 [P] [US4] Write unit test in `tests/unit/echarts-renderer.test.ts` verifying lifecycle: calling `update()` three times on same renderer results in exactly 1 active ECharts instance — mock `echarts.init` and assert it is called once, `setOption` called three times (SC-005)
- [x] T020 [P] [US4] Write unit test in `tests/unit/echarts-renderer.test.ts` verifying `destroy()`: after `destroy()`, `instance.dispose()` is called, `this.instance` becomes `undefined`, and `resizeObserver.disconnect()` is called — mock both and assert (FR-019, SC-005)
- [x] T021 [P] [US4] Write unit test in `tests/unit/echarts-renderer.test.ts` verifying resize behavior: after triggering ResizeObserver callback, `instance.resize()` is called without `echarts.init` being called again (SC-006, FR-018)

**Checkpoint**: `npm test` — T019, T020, T021 przechodzą; brak wycieków instancji potwierdzony

---

## Phase 7: Polish & Weryfikacja końcowa

**Purpose**: Jakość kodu, TypeScript strict, walidacja całości

- [x] T022 [P] Run `npm test` and confirm all Vitest tests pass (0 failures)
- [x] T023 [P] Run `npm run lint` and fix any TypeScript strict-mode or ESLint errors introduced in `src/card/echarts-renderer.ts` or `src/card/cumulative-comparison-chart.ts`
- [x] T024 Validate checklist at bottom of `specs/003-echarts-migration/quickstart.md` — mark each item as confirmed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Brak zależności — zaczynamy natychmiast
- **Foundational (Phase 2)**: Wymaga ukończenia Phase 1 — **BLOKUJE** wszystkie user stories
- **US1 (Phase 3)**: Wymaga Phase 2 — najważniejszy MVP, musi być gotowy jako pierwszy
- **US2 (Phase 4)**: Wymaga Phase 3 — testy bazują na kompletnej implementacji `buildOption()`
- **US3 (Phase 5)**: Wymaga Phase 1 (usunięcia zależności) — weryfikacja może być równoległa z US2
- **US4 (Phase 6)**: Wymaga Phase 3 — testy cyklu życia bazują na `constructor` + `destroy` z T007
- **Polish (Phase 7)**: Wymaga ukończenia wszystkich user stories

### User Story Dependencies

- **US1 (P1)**: Zaczyna się po Phase 2 — BRAK zależności od innych US; to MVP
- **US2 (P2)**: Zaczyna się po US1 — testy weryfikują strukturę `buildOption()`
- **US3 (P3)**: Zaczyna się po Phase 1 — weryfikacja bundle niezależna od US1/US2
- **US4 (P4)**: Zaczyna się po US1 — testy lifecycle po gotowym `constructor`/`destroy`

### Within Each Phase

- T003 (szkielet klasy) → T004, T005, T006 (metody pomocnicze — [P], różne fragmenty pliku)
- T007 (constructor/destroy) → T008 (buildOption szkielet) + T008a (motyw HA, legenda, sync layout) → T009, T010, T011, T012 ([P] — różne serie) → T013 (update()) → T014 (integracja w cumulative-comparison-chart.ts)

---

## Parallel Example: Phase 2

```bash
# Po T003 (szkielet) — uruchom równolegle:
Task: "Port alignSeriesOnTimeline() to echarts-renderer.ts"         # T004
Task: "Implement resolveColor() + getThemeColors() helpers"         # T005
Task: "Implement niceMax() helper"                                   # T006
```

## Parallel Example: User Story 1 (Phase 3, series building)

```bash
# Po T008 (buildOption szkielet) — uruchom równolegle:
Task: "Current series + areaStyle + connectNulls"                   # T009
Task: "Today marker markLine/markPoint (Variant A/B)"               # T010
Task: "Reference series + markPoint"                                 # T011
Task: "Forecast series (conditional)"                                # T012
```

## Parallel Example: User Story 4 (Phase 6)

```bash
# Wszystkie testy lifecycle są niezależne — uruchom równolegle:
Task: "Unit test: multiple update() = 1 ECharts instance"           # T019
Task: "Unit test: destroy() disposes + disconnects"                  # T020
Task: "Unit test: resize triggers instance.resize()"                 # T021
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (deps)
2. Complete Phase 2: Foundational (szkielet + helpers)
3. Complete Phase 3: User Story 1 (full rendering)
4. **STOP and VALIDATE**: Ręczna inspekcja wizualna w HA z pełną konfiguracją
5. Deploy jeśli wygląd identyczny z Chart.js

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Wykres działa → **MVP: deploy do HA i weryfikuj wizualnie**
3. Phase 4 (US2) → Testy potwierdzają brak Canvas API → commit
4. Phase 5 (US3) → Bundle clean → commit
5. Phase 6 (US4) → Lifecycle testy → commit
6. Phase 7 (Polish) → Finalne czyszczenie → release

### Total Task Count: 25 tasks

| Phase | Tasks | Count |
|-------|-------|-------|
| Phase 1: Setup | T001–T002 | 2 |
| Phase 2: Foundational | T003–T006 | 4 |
| Phase 3: US1 (P1) | T007–T014, T008a | 9 |
| Phase 4: US2 (P2) | T015–T016 | 2 |
| Phase 5: US3 (P3) | T017–T018 | 2 |
| Phase 6: US4 (P4) | T019–T021 | 3 |
| Phase 7: Polish | T022–T024 | 3 |
| **Total** | | **25** |

### Parallel Opportunities

- T004, T005, T006 równolegle (po T003)
- T009, T010, T011, T012 równolegle (po T008)
- T015, T016 równolegle (Phase 4)
- T019, T020, T021 równolegle (Phase 6)
- T022, T023 równolegle (Phase 7)
