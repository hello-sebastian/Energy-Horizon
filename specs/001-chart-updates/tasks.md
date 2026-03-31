# Tasks: Chart Updates – Wizualizacja i UX wykresu

**Branch**: `001-chart-updates`  
**Date**: 2026-03-17  
**Input**: `/specs/001-chart-updates/` (plan.md, spec.md, data-model.md, research.md, contracts/card-config-schema.md)

---

## Format: `[ID] [P?] [Story] Opis z ścieżką pliku`

- **[P]**: Można uruchomić równolegle (różne pliki, brak wzajemnych zależności)
- **[Story]**: Przynależność do user story (US1–US7)
- Każde zadanie obejmuje maksymalnie 1–2 pliki
- Dla każdej funkcji: argumenty wejściowe i typ zwracanej wartości podane jawnie

---

## Phase 2: Foundational – Typy i sygnatura ChartRenderer (BLOKUJE wszystkie US)

**Cel**: Rozszerzenie typów konfiguracyjnych i aktualizacja sygnatury `ChartRenderer.update()`. Bez tej fazy żaden user story nie może być zaimplementowany.

**⚠️ KRYTYCZNE**: Żadna praca nad US nie może się zacząć przed zakończeniem tej fazy. Może być wymagane tymczasowe zaślepienie callsite w `cumulative-comparison-chart.ts` aby build przechodził.

- [x] T001 Extend `CardConfig` interface in `src/card/types.ts`: add the following optional fields after existing `show_forecast?: boolean` line — `fill_current?: boolean` (default true), `fill_reference?: boolean` (default false), `fill_current_opacity?: number` (0–100, default 30), `fill_reference_opacity?: number` (0–100, default 30), `primary_color?: string` (CSS color value, default undefined)
- [x] T002 [P] Add exported interface `ChartRendererConfig` in `src/card/types.ts` with fields: `primaryColor: string` (already resolved, never undefined after resolution), `fillCurrent: boolean`, `fillReference: boolean`, `fillCurrentOpacity: number` (0–100), `fillReferenceOpacity: number` (0–100), `showForecast: boolean`, `forecastTotal?: number` (undefined if unavailable), `unit: string` (empty string if unknown), `periodLabel: string` (e.g. "2025" or "Marzec")
- [x] T003 Update `ChartRenderer.update()` signature in `src/card/chart-renderer.ts`: change signature from `update(series, labels)` to `update(series: ComparisonSeries, fullTimeline: number[], rendererConfig: ChartRendererConfig, labels: { current: string; reference: string }): void`; add internal (non-exported) type `type ChartPoint = { x: number; y: number | null }` at module scope; keep existing method body as stub (add `// TODO: implement in Phase 3` comment), import `ChartRendererConfig` from `./types`
- [x] T004 Update data hash computation in `ChartRenderer.update()` body in `src/card/chart-renderer.ts`: locate the existing `JSON.stringify({ c: currentData, r: referenceData })` hash line; replace with `JSON.stringify({ c: currentData, r: referenceData, cfg: rendererConfig })` so that changes to fill/color/forecast options trigger a re-render

**Checkpoint**: `npm run build` przechodzi. Sygnatura `update()` zaktualizowana; typy dostępne dla wszystkich plików.

---

## Phase 3: US1 – Pełna oś czasu niezależnie od dostępności danych (Priority: P1) 🎯 MVP

**Cel**: Oś X zawsze obejmuje kompletny badany okres; linia wykresu przerywa się (`null`) w miejscach bez danych.

**Independent Test**: Skonfigurować kartę z `comparison_preset: year_over_year`, `aggregation: day` na encji z lukami. Oś musi zawierać 365 lub 366 pozycji; linia musi być przerwana przy brakujących dniach.

- [x] T005 [US1] Add exported function `buildFullTimeline(period: ComparisonPeriod, fullEnd: Date): number[]` in `src/card/ha-api.ts`; args: `period.aggregation` ('day'|'week'|'month'), `period.current_start: Date`, `fullEnd: Date` (end of full period, inclusive); returns array of ms-epoch timestamps; for 'day': cursor starts at midnight of `period.current_start`, increments `setDate(+1)`, stops when `cursor > fullEnd`; for 'week': same but increments `setDate(+7)`; for 'month': cursor = `new Date(year, month, 1)`, increments `setMonth(+1)`, stops when year/month > fullEnd year/month; cursor uses local Date (not UTC)
- [x] T006 [P] [US1] Add unit tests for `buildFullTimeline` in `tests/unit/build-full-timeline.test.ts`; import `buildFullTimeline` from `../../src/card/ha-api`; 5 test cases: (1) non-leap year 2025, day aggregation → 365 slots; (2) leap year 2024, day aggregation → 366 slots; (3) April 2026 (30-day month), day aggregation → 30 slots; (4) January 2026, week aggregation → 5 slots; (5) year 2026, month aggregation → 12 slots; use `fullEnd` = last day of the relevant period in each test
- [x] T007 [US1] Add private method `alignSeriesOnTimeline(points: TimeSeriesPoint[], timeline: number[], referenceStart?: Date): (number | null)[]` in `src/card/chart-renderer.ts`; returns array of length `timeline.length`; WITHOUT `referenceStart` (current series): for slot `i`, find `points` entry where `entry.timestamp >= timeline[i]` and `entry.timestamp < timeline[i+1]` (slotDuration = `timeline[1]-timeline[0]` or 86400000 for single-slot), return `entry.value` or `null`; WITH `referenceStart` (reference series): for slot `i`, compute `expectedTs = referenceStart.getTime() + (timeline[i] - timeline[0])`, find matching reference point within one slot duration, return value or `null`
- [x] T008 [US1] Update `ChartRenderer.update()` body in `src/card/chart-renderer.ts`: call `alignSeriesOnTimeline(series.current.points, fullTimeline)` → `currentValues: (number|null)[]`; call `alignSeriesOnTimeline(series.reference.points, fullTimeline, referenceStart)` → `referenceValues: (number|null)[]` (referenceStart = `series.reference.periodStart`); build Chart.js datasets: `data: currentValues.map((y, i) => ({ x: i, y } as ChartPoint))` for current; same for reference; set `spanGaps: false` on both datasets
- [x] T009 [US1] Add private method `_computeFullEnd(period: ComparisonPeriod): Date` in `src/card/cumulative-comparison-chart.ts`; if `this._config.comparison_preset === 'year_over_year'` return `new Date(period.current_start.getFullYear(), 11, 31)`; else (month_over_year) return `new Date(period.current_start.getFullYear(), period.current_start.getMonth() + 1, 0)` (day 0 of next month = last day of current month)
- [x] T010 [US1] Add module-private (non-exported) helper function `clampOpacity(value: unknown): number` in `src/card/cumulative-comparison-chart.ts`; compute `n = Number(value)`; return 30 if `!Number.isFinite(n) || n < 0 || n > 100`; else return `n`
- [x] T011 [US1] Add private method `_buildRendererConfig(): ChartRendererConfig` in `src/card/cumulative-comparison-chart.ts`; reads `this._config` and `this._state`; computes `periodLabel`: for year_over_year → `String(period.current_start.getFullYear())`; for month_over_year → `new Intl.DateTimeFormat(lang, { month: 'long' }).format(period.current_start)` where `lang = this._config.language ?? this.hass?.language ?? 'en'`; reads `unit` from `(this.hass.states?.[this._config.entity]?.attributes as { unit_of_measurement?: string })?.unit_of_measurement ?? ''`; applies `clampOpacity` for opacity fields; uses defaults per data-model.md §4c; imports `ChartRendererConfig` from `./types`
- [x] T012 [US1] Update `ChartRenderer.update()` callsite in `src/card/cumulative-comparison-chart.ts`: in `updated()` method (where chart renderer is called), compute `const fullEnd = this._computeFullEnd(this._state.period)`; `const fullTimeline = buildFullTimeline(this._state.period, fullEnd)`; `const rendererConfig = this._buildRendererConfig()`; replace old `this._chartRenderer.update(series, labels)` with `this._chartRenderer.update(series, fullTimeline, rendererConfig, labels)`; add import of `buildFullTimeline` from `./ha-api`

**Checkpoint**: Oś X wykresu wyświetla kompletny badany okres; linia jest przerywana przy brakujących dniach. `npm test` przechodzi z T006.

---

## Phase 4: US2 – Podkreślenie aktualnego dnia na wykresie (Priority: P2)

**Cel**: Kropka na serii bieżącej, kropka na serii referencyjnej i pionowa linia przerywana wyznaczają pozycję dzisiejszego dnia.

**Independent Test**: Wykres z danymi bieżącego i referencyjnego okresu; bez żadnych flag YAML muszą być widoczne 2 kropki i pionowa linia przerywana. Przy braku danych dla dziś w jednej serii — tylko jedna kropka; przy braku obu — linia do `chartArea.top`.

- [x] T013 [US2] Add private state fields to `ChartRenderer` class in `src/card/chart-renderer.ts`: `private _todaySlotIndex: number = -1`, `private _todayCurrentY: number | undefined`, `private _todayReferenceY: number | undefined`, `private _primaryColorResolved: string = '#03a9f4'`
- [x] T014 [US2] Add today-slot computation in `ChartRenderer.update()` body in `src/card/chart-renderer.ts` (after computing `currentValues`/`referenceValues`): compute today's midnight timestamp (`const todayMs = new Date(); todayMs.setHours(0,0,0,0); const ts = todayMs.getTime()`); find `this._todaySlotIndex = fullTimeline.indexOf(ts)` (or -1 if not found); set `this._todayCurrentY = this._todaySlotIndex >= 0 ? (currentValues[this._todaySlotIndex] ?? undefined) : undefined`; set `this._todayReferenceY = this._todaySlotIndex >= 0 ? (referenceValues[this._todaySlotIndex] ?? undefined) : undefined`
- [x] T015 [US2] Add inline plugin object `todayMarkerPlugin` in `ChartRenderer` constructor in `src/card/chart-renderer.ts` and register it via `options.plugins.todayMarker`; `afterDraw(chart: Chart)` callback: if `self._todaySlotIndex < 0` return early; `xPixel = chart.scales['x'].getPixelForValue(self._todaySlotIndex)`; `y0 = chart.scales['y'].getPixelForValue(0)`; `yTop`: if `self._todayCurrentY !== undefined` and `self._todayReferenceY !== undefined` → min pixel of the two (higher value = lower Y pixel); if only one defined → that one's pixel; if neither → `chart.chartArea.top`; draw dashed vertical line: `ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = self._primaryColorResolved; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xPixel, y0); ctx.lineTo(xPixel, yTop); ctx.stroke(); ctx.restore()`; draw filled circles (radius 5) at `(xPixel, chart.scales['y'].getPixelForValue(self._todayCurrentY))` if defined and at `(xPixel, chart.scales['y'].getPixelForValue(self._todayReferenceY))` if defined; use series border colors for each circle

**Checkpoint**: Pionowa linia przerywana i dwie kropki widoczne w pozycji dzisiejszego dnia. Brak dodatkowej konfiguracji YAML wymagany.

---

## Phase 5: US3 – Półprzezroczyste wypełnienie pod liniami wykresu (Priority: P3)

**Cel**: `fill: 'origin'` pod każdą serią, kolor = kolor serii z zadanym kryciem. Domyślnie: bieżąca = włączone (30%), referencyjna = wyłączone.

**Independent Test**: Ustawić `fill_reference: true`; pod obydwiema seriami widoczne wypełnienie. Ustawić `fill_current: false`; brak wypełnienia pod serią bieżącą. Zmiana krycia (`fill_current_opacity: 10`) nie wpływa na krycie linii.

- [x] T016 [US3] Add private method `colorWithOpacity(cssColor: string, alpha: number): string` in `src/card/chart-renderer.ts`; create `document.createElement('canvas')` 1×1 px; get `ctx = canvas.getContext('2d')`; if ctx is null return `'transparent'`; `ctx.fillStyle = cssColor; ctx.fillRect(0,0,1,1)`; `const [r,g,b] = ctx.getImageData(0,0,1,1).data`; return `rgba(${r}, ${g}, ${b}, ${alpha})`; alpha is 0.0–1.0 float
- [x] T017 [US3] Update dataset configurations in `ChartRenderer.update()` body in `src/card/chart-renderer.ts`: for **current series dataset** set `fill: rendererConfig.fillCurrent ? 'origin' : false` and `backgroundColor: rendererConfig.fillCurrent ? this.colorWithOpacity(this._primaryColorResolved, rendererConfig.fillCurrentOpacity / 100) : 'transparent'`; for **reference series dataset** set `fill: rendererConfig.fillReference ? 'origin' : false` and `backgroundColor: rendererConfig.fillReference ? this.colorWithOpacity(referenceColor, rendererConfig.fillReferenceOpacity / 100) : 'transparent'` (referenceColor = existing reference series border color)

**Checkpoint**: `fill_current: false` usuwa wypełnienie. `fill_reference: true` + `fill_reference_opacity: 60` → 60% krycie pod serią referencyjną.

---

## Phase 6: US4 – Konfigurowalny kolor głównej serii danych (Priority: P4)

**Cel**: `primary_color` z YAML stosowany do: linii serii bieżącej, jej fill, kropki dziś, pionowej linii przerywanej i linii prognozy. Fallback → `--accent-color` HA → `--primary-color` HA → `#03a9f4`.

**Independent Test**: `primary_color: "#E53935"` — linia, fill, markery mają ten kolor. Brak `primary_color` → kolor akcentu HA. Niepoprawna wartość CSS → karta nie crashuje, stosuje fallback.

- [x] T018 [US4] Add private method `resolveColor(primaryColorConfig: string): string` in `src/card/chart-renderer.ts`; if `primaryColorConfig` is non-empty return `primaryColorConfig`; else: find host element via `this._canvas.closest('.ehc-card') ?? this._canvas.closest('ha-card') ?? this._canvas`; read `getComputedStyle(host).getPropertyValue('--accent-color').trim()`; if non-empty return it; read `'--primary-color'` same way; if non-empty return it; return `'#03a9f4'` as final hardcoded fallback
- [x] T019 [US4] In `ChartRenderer.update()` body in `src/card/chart-renderer.ts`: add call `this._primaryColorResolved = this.resolveColor(rendererConfig.primaryColor)` as the first statement before building datasets; apply `this._primaryColorResolved` as `borderColor` for the current series dataset (this unifies color for line, fill via `colorWithOpacity`, today dot, dashed vertical, forecast line)

**Checkpoint**: `primary_color: "#E53935"` zmienia kolor wszystkich elementów bieżącej serii. Brak pola → kolor akcentu HA. Niepoprawna wartość → fallback, brak błędu JS.

---

## Phase 7: US5 – Wizualizacja prognozy zużycia (Priority: P5)

**Cel**: Trzeci dataset (przerywana prosta linia) od aktualnego dnia do końca okresu, gdy `show_forecast: true` i dane dla dziś istnieją.

**Independent Test**: `show_forecast: true` → widoczna przerywana linia od dziś do ostatniego slotu. `show_forecast: false` lub brak danych dla dziś → brak linii.

- [x] T020 [US5] Add forecast dataset logic in `ChartRenderer.update()` body in `src/card/chart-renderer.ts`: condition: `rendererConfig.showForecast && this._todaySlotIndex >= 0 && this._todayCurrentY !== undefined && rendererConfig.forecastTotal !== undefined`; if condition true: add third dataset with `data: [{ x: this._todaySlotIndex, y: this._todayCurrentY }, { x: fullTimeline.length - 1, y: rendererConfig.forecastTotal }] as ChartPoint[]`, `borderColor: this._primaryColorResolved`, `borderDash: [6, 3]`, `pointRadius: 0`, `fill: false`, `spanGaps: true`, `tension: 0`; else: add third dataset with `data: []` (empty, prevents Chart.js index errors)

**Checkpoint**: `show_forecast: true` z danymi dla dziś → przerywana linia widoczna. `show_forecast: false` → brak linii prognozy.

---

## Phase 8: US6 – Etykiety jednostek na osiach wykresu (Priority: P6)

**Cel**: Jednostka energii (np. „kWh") przy najwyższej wartości ticku osi Y; etykieta okresu (rok lub nazwa miesiąca) jako tytuł osi X.

**Independent Test**: Encja z `unit_of_measurement: "kWh"` → „kWh" widoczne przy najwyższym ticku. `comparison_preset: year_over_year` dla 2025 → „2025" jako etykieta osi X. `month_over_year` dla marca → „Marzec" (lub zlokalizowana nazwa miesiąca).

- [x] T021 [US6] Update Y-axis ticks config in `ChartRenderer.update()` scales options in `src/card/chart-renderer.ts`: set `scales.y.ticks.callback: (value: number, index: number, ticks: Tick[]) => index === ticks.length - 1 && rendererConfig.unit ? \`\${value} \${rendererConfig.unit}\` : String(value)`; if `rendererConfig.unit` is empty string, just `String(value)` for all ticks
- [x] T022 [US6] Update X-axis title config in `ChartRenderer.update()` scales options in `src/card/chart-renderer.ts`: set `scales.x.title.display: rendererConfig.periodLabel.length > 0`, `scales.x.title.text: rendererConfig.periodLabel`, `scales.x.title.align: 'end'`

**Checkpoint**: Etykieta „kWh" widoczna przy najwyższym ticku osi Y. Etykieta roku/miesiąca jako tytuł osi X.

---

## Phase 9: US7 – Ulepszenia wyglądu wykresu (Priority: P7)

**Cel**: Dokładnie 5 ticków na osi Y, brak pionowych linii siatki, wysokość obszaru wykresu 290px.

**Independent Test**: Dowolna konfiguracja — 5 wartości/ticków na osi Y; brak pionowych linii siatki (ticki i etykiety na osi X zachowane); kontener wykresu ma 290px wysokości.

- [x] T023 [US7] Update Y-axis and X-axis grid config in `ChartRenderer.update()` scales options in `src/card/chart-renderer.ts`: set `scales.y.ticks.count: 5`, `scales.y.ticks.maxTicksLimit: 5`, `scales.y.beginAtZero: true`; set `scales.x.grid.display: false` (hides vertical gridlines while preserving ticks and labels); keep `scales.x.ticks.display: true`
- [x] T024 [P] [US7] Update `.chart-container` height in `src/card/energy-horizon-card-styles.ts`: locate the CSS rule with `height: 200px`; change to `height: 290px` (200px × 1.45 = 290px per FR-021)

**Checkpoint**: Oś Y ma dokładnie 5 ticków. Pionowe linie siatki niewidoczne. Kontener wykresu 290px wysokości.

---

## Phase 10: Polish & Dokumentacja

**Cel**: Aktualizacja README z opisem nowych opcji YAML i weryfikacja poprawności buildu.

- [x] T025 Update `README.md`: add or extend the chart configuration options section with Markdown table listing all new YAML options: `primary_color` (string, default: accent color HA), `fill_current` (boolean, default: true), `fill_reference` (boolean, default: false), `fill_current_opacity` (number 0–100, default: 30), `fill_reference_opacity` (number 0–100, default: 30), `show_forecast` (boolean, default: false); include types, defaults, short descriptions; add two example configs (minimal and full) per `contracts/card-config-schema.md` (FR-022, FR-023)
- [x] T026 [P] Verify full build and tests: run `npm test && npm run lint` from repo root; fix any TypeScript errors in callsites introduced by `ChartRenderer.update()` signature change; ensure zero lint errors in modified files (`types.ts`, `ha-api.ts`, `chart-renderer.ts`, `cumulative-comparison-chart.ts`, `energy-horizon-card-styles.ts`)

**Checkpoint**: Build i testy przechodzą. README zawiera opis wszystkich nowych opcji.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: Brak zależności — start natychmiast.
- **Phase 3 (US1)**: Wymaga ukończenia Phase 2 (typy + sygnatura). T005–T008 mogą zacząć się od razu po Phase 2. T009–T012 zależą od T005 (buildFullTimeline).
- **Phase 4 (US2)**: Wymaga ukończenia Phase 2. T014 wymaga T008 (musi być dostępne `currentValues`/`referenceValues`).
- **Phase 5 (US3)**: Wymaga ukończenia Phase 2. Niezależne od US1/US2.
- **Phase 6 (US4)**: Wymaga ukończenia Phase 2. T019 zależy od T018.
- **Phase 7 (US5)**: Wymaga T014 (US2) dla `_todaySlotIndex` i `_todayCurrentY`. Wymaga Phase 2.
- **Phase 8 (US6)**: Wymaga T011–T012 (US1) — `rendererConfig.periodLabel` i `rendererConfig.unit` generowane w `_buildRendererConfig()`.
- **Phase 9 (US7)**: Wymaga ukończenia Phase 2. T024 w pełni równoległy.
- **Phase 10 (Polish)**: Wymaga wszystkich wcześniejszych faz.

### User Story Dependencies

| Story | Depends on | Can run in parallel with |
|-------|-----------|--------------------------|
| US1 (P1) | Phase 2 | US3, US4, US7 |
| US2 (P2) | Phase 2 + T008 (US1 body) | US3, US4, US6, US7 |
| US3 (P3) | Phase 2 | US1, US2, US4, US6, US7 |
| US4 (P4) | Phase 2 | US1, US2, US3, US6, US7 |
| US5 (P5) | T014 (US2) | — |
| US6 (P6) | T011+T012 (US1 wiring) | US2, US3, US4, US7 |
| US7 (P7) | Phase 2 | US1, US2, US3, US4 |

### Within Each Phase (parallelism)

- T001 i T002: ten sam plik `types.ts` — najlepiej sequentially, lub jeden commit z obydwoma zmianami
- T003 i T004: ten sam plik `chart-renderer.ts` — sequentially (T004 zależy od T003)
- T005 i T006: **TDD** — napisz T006 (testy, zakończą się niepowodzeniem), potem T005 (implementacja)
- T007, T009, T010: różne metody/pliki — można równolegle
- T023 i T024: różne pliki — można równolegle

---

## Parallel Example: Phase 3 (US1)

```bash
# Krok 1 (TDD): Najpierw testy — muszą zakończyć się NIEPOWODZENIEM
Task: T006 — unit tests for buildFullTimeline in tests/unit/build-full-timeline.test.ts

# Krok 2 (równolegle po T006):
Task: T005 — implement buildFullTimeline in src/card/ha-api.ts
Task: T007 — implement alignSeriesOnTimeline in src/card/chart-renderer.ts
Task: T009 — implement _computeFullEnd in src/card/cumulative-comparison-chart.ts
Task: T010 — implement clampOpacity in src/card/cumulative-comparison-chart.ts

# Krok 3 (po T005, T007, T009, T010):
Task: T008 — wire fullTimeline + alignment in ChartRenderer.update() body
Task: T011 — implement _buildRendererConfig in cumulative-comparison-chart.ts

# Krok 4 (po T008, T011):
Task: T012 — update ChartRenderer.update() callsite in cumulative-comparison-chart.ts
```

---

## Implementation Strategy

### MVP (tylko US1 — pełna oś czasu)

1. Ukończ Phase 2 (T001–T004)
2. Ukończ Phase 3 US1 (T005–T012)
3. **STOP i walidacja**: oś X zawiera kompletny okres, linia przerywa się przy brakach danych
4. Deploy/demo jako MVP — główna wartość: poprawność wizualizacji danych

### Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 (US1) → Kompletna oś + luki → **Demo 1** (MVP)
3. Phase 4 (US2) → Marker dzisiejszego dnia → **Demo 2**
4. Phase 5 + Phase 6 (US3 + US4) → Fill + kolory → **Demo 3**
5. Phase 7 (US5) → Prognoza → **Demo 4**
6. Phase 8 + Phase 9 (US6 + US7) → Etykiety + wygląd → **Demo 5**
7. Phase 10 → README + weryfikacja → **Release**

---

## Summary

| Faza | Story | Zadania | Pliki |
|------|-------|---------|-------|
| Phase 2 (Foundational) | — | T001–T004 | types.ts, chart-renderer.ts |
| Phase 3 | US1 (P1) | T005–T012 | ha-api.ts, chart-renderer.ts, cumulative-comparison-chart.ts |
| Phase 4 | US2 (P2) | T013–T015 | chart-renderer.ts |
| Phase 5 | US3 (P3) | T016–T017 | chart-renderer.ts |
| Phase 6 | US4 (P4) | T018–T019 | chart-renderer.ts |
| Phase 7 | US5 (P5) | T020 | chart-renderer.ts |
| Phase 8 | US6 (P6) | T021–T022 | chart-renderer.ts |
| Phase 9 | US7 (P7) | T023–T024 | chart-renderer.ts, energy-horizon-card-styles.ts |
| Phase 10 (Polish) | — | T025–T026 | README.md |

**Łącznie**: 26 zadań | **Plik z największą liczbą zmian**: `src/card/chart-renderer.ts` (US1–US7) | **MVP**: Phase 2 + Phase 3 (T001–T012)

---

## Notes

- Brak nowych zależności NPM — tylko Chart.js 4 built-in API (Filler już zarejestrowany)
- TypeScript `strict` — brak `any` w nowym kodzie; istniejące `as any` to dług techniczny, nie dotykać
- `clampOpacity` — lokalny helper w `cumulative-comparison-chart.ts`, nie eksportować
- `ChartPoint` — wewnętrzny typ w `chart-renderer.ts`, nie eksportować
- `todayMarkerPlugin` — rejestrowany per-instancja, **nie globalnie** (`Chart.register(...)`)
- `colorWithOpacity` — zawsze nadpisuje alpha niezależnie od formatu input (dotyczy edge case z `rgba(r,g,b,a)` jako `primary_color`)
- Edge case: rok przestępny → 366 slotów (pokryty testem T006 case 2)
- Edge case: dzisiejszy dzień poza badanym okresem → `_todaySlotIndex = -1` → brak markerów i prognozy
- Edge case: brak danych dla dziś w jednej serii → brak kropki tej serii, linia pionowa wyznacza pozycję na osi X
