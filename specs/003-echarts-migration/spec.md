# Feature Specification: Migracja wizualizacji Chart.js → Apache ECharts

**Feature Branch**: `003-echarts-migration`  
**Created**: 2026-03-18  
**Status**: Draft  
**Input**: Migracja warstwy wizualizacji wykresu w karcie EnergyHorizonCard z Chart.js 4 na Apache ECharts (bez customowych obejść)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Poprawna wizualizacja danych po migracji (Priority: P1)

Użytkownik instaluje zaktualizowaną kartę EnergyHorizonCard i otwiera jej widok w Home Assistant. Wykres nadal wyświetla kompletną oś czasu (365/366 dni), przerwy dla brakujących danych, markerów dzisiejszego dnia, wypełnienia pod liniami, kolorów serii, prognozy i etykiet — identycznie jak przed migracją. Użytkownik nie widzi żadnej różnicy w zachowaniu ani wyglądzie karty.

**Why this priority**: Bez poprawnej wizualizacji karta traci swoje podstawowe przeznaczenie. Wszystkie wymagania funkcjonalne (FR z 001-chart-updates) muszą przejść weryfikację po migracji, co czyni ten scenariusz punktem wyjścia dla wszystkich pozostałych.

**Independent Test**: Karta z pełną konfiguracją (`fill_current: true`, `fill_reference: true`, `show_forecast: true`, `primary_color: "#E53935"`) musi wyglądać identycznie jak przed migracją: oś z 365 pozycjami, gapy, marker dziś z pionową linią, wypełnienia z opacity, prognoza przerywana, 5 ticków na Y.

**Acceptance Scenarios**:

1. **Given** karta z danymi dla bieżącego i referencyjnego roku, **When** wykres jest renderowany po migracji, **Then** oś pozioma wyświetla 365 lub 366 pozycji, linie serii wykazują przerwy dla brakujących danych, a marker aktualnego dnia (kropki + pionowa linia przerywana) jest widoczny.
2. **Given** konfiguracja `fill_current: true, fill_current_opacity: 50, fill_reference: true, fill_reference_opacity: 20`, **When** wykres jest renderowany, **Then** oba wypełnienia są widoczne z odpowiednim kryciem, linie serii mają pełne krycie (niezależne od krycia wypełnienia).
3. **Given** `show_forecast: true` z danymi dla dzisiejszego dnia, **When** wykres jest renderowany, **Then** przerywana linia prognozy biegnie od dzisiejszego dnia do końca okresu.
4. **Given** `primary_color: "#E53935"`, **When** wykres jest renderowany, **Then** linia serii bieżącej, jej wypełnienie, kropka dnia dzisiejszego, pionowa linia przerywana i linia prognozy mają kolor `#E53935`.

---

### User Story 2 – Brak custom hacków w kodzie renderera (Priority: P2)

Deweloper przeglądający kod nowego renderera nie znajduje żadnych ręcznych operacji na canvas (brak `afterDraw`, brak `ctx.arc`, brak `ctx.moveTo`, brak ręcznie tworzonych warstw HTML). Marker „dziś", wypełnienie, prognoza i wszystkie inne elementy wizualne są realizowane wyłącznie przez oficjalne API ECharts (serie, markLine, markPoint, areaStyle, graphic).

**Why this priority**: Brak custom hacków jest głównym uzasadnieniem migracji — upraszcza utrzymanie kodu, eliminuje ryzyko zepsucia po aktualizacjach biblioteki i redukuje złożoność.

**Independent Test**: Code review renderera: szukamy wywołań `CanvasRenderingContext2D` bezpośrednio z zewnątrz ECharts — żadne nie mogą istnieć.

**Acceptance Scenarios**:

1. **Given** kod `src/card/echarts-renderer.ts`, **When** deweloper przegląda plik, **Then** nie ma bezpośrednich wywołań metod Canvas API (`ctx.arc`, `ctx.stroke`, `ctx.fillRect` itp.) poza tym, co ECharts wywołuje wewnętrznie.
2. **Given** marker „dziś" (pionowa linia + kropki), **When** sprawdzamy implementację, **Then** jest realizowany przez `markLine` i/lub `markPoint` w opcjach ECharts — nie przez plugin z callbackiem rysującym.
3. **Given** wypełnienie pod serią, **When** sprawdzamy implementację, **Then** jest realizowane przez `areaStyle` w konfiguracji serii ECharts.

---

### User Story 3 – Zoptymalizowany rozmiar paczki (Priority: P3)

Deweloper sprawdza bundle karty po migracji i widzi, że ECharts jest importowany wyłącznie modularnie — tylko faktycznie używane komponenty. Chart.js i `chartjs-adapter-date-fns` zostały usunięte z zależności projektu.

**Why this priority**: Redukcja wagi paczki poprawia czas ładowania karty w HA. Modularny import jest ponadto wymogiem architektonicznym tej migracji.

**Independent Test**: Komenda `npm run build` generuje bundle. W bundle nie ma żadnych stringów identyfikujących Chart.js ani adaptera. Importy ECharts w kodzie źródłowym są wyłącznie z `echarts/core`, `echarts/charts`, `echarts/components`, `echarts/renderers` — nie ma `import * as echarts from 'echarts'`.

**Acceptance Scenarios**:

1. **Given** kod źródłowy renderera, **When** sprawdzamy import, **Then** nie ma `import * as echarts from 'echarts'`; wszystkie importy są modularnie z podścieżek ECharts.
2. **Given** `package.json` po migracji, **When** sprawdzamy zależności, **Then** `chart.js` i `chartjs-adapter-date-fns` nie figurują w `dependencies` ani `devDependencies`.
3. **Given** zbudowany bundle, **When** sprawdzamy rozmiar, **Then** rozmiar bundle nie wzrósł o więcej niż 50 kB gzip względem wersji z Chart.js.

---

### User Story 4 – Stabilny cykl życia renderera (bez wycieków pamięci) (Priority: P4)

Użytkownik wielokrotnie przebudowuje kartę (np. przez odświeżenie widoku w HA lub zmianę konfiguracji) — każda iteracja renderowania tworzy dokładnie jedną instancję ECharts i zwalnia poprzednią. Brak wycieków pamięci, brak sierocych elementów DOM.

**Why this priority**: Wycieki pamięci są trudne do wykrycia w codziennym użytkowaniu, ale degradują wydajność HA po długim czasie działania. Poprawny lifecycle jest wymogiem każdego webcomponentu Lit.

**Independent Test**: Można przetestować przez wielokrotne wywołanie `update()` i `destroy()` na tym samym kontenerze w testach jednostkowych oraz przez obserwację liczby instancji w DevTools.

**Acceptance Scenarios**:

1. **Given** kontener wykresu, **When** `update()` jest wywołane wielokrotnie z różnymi danymi, **Then** w kontenerze istnieje dokładnie jedna instancja ECharts (nie przybywa ich).
2. **Given** działająca karta, **When** `destroy()` jest wywołane (np. przy usuwaniu karty z Lovelace), **Then** instancja ECharts jest niszczona (`echartsInstance.dispose()`), a kontener jest czysty.
3. **Given** zmiana rozmiaru okna lub panelu HA, **When** kontener zmienia wymiary, **Then** wykres dostosowuje się do nowych wymiarów bez ręcznej interwencji i bez tworzenia nowej instancji.

---

### Edge Cases

- Co jeśli kontener wykresu ma zerową szerokość/wysokość w momencie inicjalizacji? → Inicjalizacja ECharts powinna być opóźniona lub obsługiwana przez resize observer, aby uniknąć błędów renderowania.
- Co jeśli `primary_color` to wartość `rgba(...)` z własnym kanałem alpha? → Wypełnienie pod serią stosuje `fill_current_opacity` niezależnie od wartości alpha w kolorze bazowym.
- Co jeśli `show_forecast: true`, ale `forecastTotal` jest `undefined`? → Linia prognozy nie jest wyświetlana (brak danych wejściowych).
- Co jeśli dzisiejszy dzień nie istnieje w `fullTimeline` (np. karta skonfigurowana dla przeszłego okresu)? → Marker „dziś" nie jest wyświetlany; linia prognozy nie jest wyświetlana.
- Co jeśli `fullTimeline` jest pustą tablicą? → Wykres renderuje się jako pusty bez błędów JS.
- Co jeśli seria referencyjna jest `undefined`? → Wykres renderuje tylko serię bieżącą; legenda i tooltip wyświetlają jedną pozycję.
- Co jeśli dokładnie jedna seria ma `null` dla slotu dzisiejszego? → Pionowa linia przerywana biegnie do wartości serii niezerowej (`null` = nieobecny, nie zero).
- Co jeśli obie serie mają `null` dla slotu odpowiadającego dzisiejszemu dniowi? → Pionowa linia przerywana (marker dziś) biegnie do samej góry obszaru wykresu (od y=0 do górnej krawędzi).
- Co jeśli renderer jest inicjalizowany w Shadow DOM? → `tooltip.appendTo` MUSI być ustawione na kontener karty wewnątrz Shadow DOM — zapobiega błędom pozycjonowania tooltipów wynikającym z domyślnego renderowania ECharts do `document.body`.

---

## Requirements *(mandatory)*

### Functional Requirements

**Migracja renderowania – zachowanie 1:1 z 001-chart-updates:**

- **FR-001**: Renderer MUSI wyświetlać na osi poziomej wszystkie sloty `fullTimeline` (0..N-1), niezależnie od dostępności danych, zachowując pełną oś czasu okresu (FR-001 z 001-chart-updates).
- **FR-002**: Linie serii MUSZĄ przerywać się (gap) w slotach, gdzie wartość wynosi `null` — punkty po obu stronach luki NIE MOGĄ być połączone (FR-002 z 001-chart-updates, `connectNulls: false` lub ekwiwalent ECharts).
- **FR-003**: Marker „dziś" MUSI być zrealizowany wyłącznie przez wbudowane mechanizmy ECharts: pionowa linia przerywana przez `markLine`, kropki przez `markPoint` lub dane z efektem punktowym — bez żadnych bezpośrednich operacji Canvas API.
- **FR-004**: Pionowa linia przerywana markera „dziś" MUSI biec od y=0 do wyższej z dwóch wartości (bieżąca lub referencyjna). Wartości `null` są traktowane jako nieobecne (nie jako zero) — jeśli dokładnie jedna seria ma `null` w slocie dzisiejszym, linia biegnie do wartości serii niezerowej. Gdy obie serie mają `null` — do górnej krawędzi obszaru wykresu.
- **FR-005**: Wypełnienie (area) pod każdą serią MUSI być realizowane przez `areaStyle` ECharts z niezależnym kryciem (`opacity`) dla każdej serii, nie wpływając na krycie samej linii.
- **FR-006**: Prognoza MUSI być renderowana jako oddzielna seria liniowa z `lineStyle.type: 'dashed'`, bez wypełnienia, od indeksu slotu dzisiejszego dnia do ostatniego slotu `fullTimeline`.
- **FR-007**: Oś Y MUSI wyświetlać dokładnie 5 ticków (w tym 0), realizowane przez konfigurację ECharts (`splitNumber: 4`, `min: 0`) bez żadnej dodatkowej logiki poza konfiguracją.
- **FR-008**: Etykieta jednostki MUSI być wyświetlana przy najwyższym ticku osi Y, realizowana przez `axisLabel.formatter` ECharts wykrywający najwyższy tick — bez rysowania własnego tekstu na canvas.
- **FR-009**: Pionowe linie siatki MUSZĄ być wyłączone; poziome linie siatki i ticki/etykiety osi X MUSZĄ pozostać widoczne (odpowiednik FR-020 z 001-chart-updates).
- **FR-010**: Tooltip MUSI działać w trybie „po indeksie" (mode: 'axis', axisPointer) dla wszystkich serii jednocześnie. Opcja `tooltip.appendTo` MUSI być ustawiona na kontener karty (element wewnątrz Shadow DOM), aby tooltip był poprawnie pozycjonowany w środowisku Lit/HA — bez renderowania do `document.body`.
- **FR-011**: Legenda MUSI być włączona i wyświetlać etykiety serii (bieżąca i referencyjna).
- **FR-012**: Animacje MUSZĄ być wyłączone (`animation: false`).
- **FR-013**: Kolor z `primary_color` (lub fallback do CSS `--accent-color` / `--primary-color` HA) MUSI być stosowany do: linii serii bieżącej, wypełnienia pod nią, markera „dziś" (linia przerywana + kropka bieżąca), linii prognozy.

**Architektura i import:**

- **FR-014**: Nowy renderer MUSI implementować ten sam publiczny interfejs co `ChartRenderer`: metody `update(series, fullTimeline, rendererConfig, labels)` i `destroy()`.
- **FR-015**: ECharts MUSI być importowany wyłącznie modularnie — bez `import * as echarts from 'echarts'`. Dozwolone importy: `echarts/core`, `echarts/charts` (tylko `LineChart`), `echarts/components` (tylko faktycznie używane: `GridComponent`, `TooltipComponent`, `LegendComponent`, `MarkLineComponent`, `MarkPointComponent`), `echarts/renderers` (tylko `CanvasRenderer`). Wersja zależności: `^5.6.0` (najnowsze stabilne ECharts 5.x).
- **FR-016**: `chart.js` i `chartjs-adapter-date-fns` MUSZĄ zostać usunięte z `package.json` po migracji.
- **FR-017**: Logika biznesowa w `cumulative-comparison-chart.ts` (metody `buildFullTimeline`, `_buildRendererConfig`, mechanizm odświeżania) MUSI pozostać niezmieniona — zmieniamy wyłącznie klasę renderera.
- **FR-018**: Renderer MUSI wewnętrznie tworzyć i zarządzać własnym `ResizeObserver` obserwującym element kontenera — po zmianie jego rozmiaru wywołuje `echartsInstance.resize()`. Rodzic (`cumulative-comparison-chart.ts`) nie zarządza obsługą resize. `ResizeObserver` jest odłączany (`disconnect()`) w metodzie `destroy()`.
- **FR-019**: Renderer MUSI wywoływać `echartsInstance.dispose()` w metodzie `destroy()`, zwalniając wszystkie zasoby.

### Key Entities

- **EChartsRenderer**: Nowa klasa renderera (`src/card/echarts-renderer.ts`) implementująca interfejs `ChartRenderer`. Odpowiada za: inicjalizację instancji ECharts, transformację danych wejściowych (`ComparisonSeries`, `fullTimeline`, `ChartRendererConfig`) do formatu `EChartsOption`, aktualizację wykresu (`setOption`) i zwalnianie zasobów (`dispose`).
- **EChartsOption (adapter)**: Wewnętrzna funkcja/metoda budująca obiekt konfiguracji ECharts na podstawie danych wejściowych. Wejście: `ComparisonSeries`, `fullTimeline: number[]`, `ChartRendererConfig`, `labels`. Wyjście: `ECOption` (typ z `echarts/core`).
- **ChartRendererConfig**: Istniejący typ — pozostaje bez zmian. Zawiera: `primaryColor`, `fillCurrent`, `fillCurrentOpacity`, `fillReference`, `fillReferenceOpacity`, `showForecast`, `forecastTotal`, `referencePeriodStart`, `periodLabel`, `unit`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Wszystkie 22 scenariusze akceptacyjne z `specs/001-chart-updates/spec.md` przechodzą przez ręczną inspekcję wizualną po migracji — 0 regresji w zachowaniu wykresu. Automatyczne testy Vitest obejmują wyłącznie zagadnienia specyficzne dla ECharts: poprawność cyklu życia instancji (US-4), brak bezpośrednich wywołań Canvas API (US-2) i strukturę opcji ECharts (weryfikacja `ECOption`).
- **SC-002**: Kod renderera nie zawiera żadnych bezpośrednich wywołań Canvas API (`ctx.arc`, `ctx.stroke`, `ctx.fillRect` itp.) — 0 custom hacków rysowania.
- **SC-003**: Importy ECharts w kodzie źródłowym są wyłącznie modularnie — 0 wystąpień `import * as echarts from 'echarts'`.
- **SC-004**: Bundle końcowy po migracji nie zawiera zależności Chart.js — rozmiar bundle nie wzrasta o więcej niż 50 kB gzip względem wersji przed migracją.
- **SC-005**: Wielokrotne wywołanie `update()` i `destroy()` nie powoduje wycieków instancji — liczba aktywnych instancji ECharts w kontenerze wynosi zawsze dokładnie 1 (lub 0 po `destroy()`).
- **SC-006**: Zmiana rozmiaru okna HA powoduje automatyczne dopasowanie wykresu bez przeładowania karty.

---

## Clarifications

### Session 2026-03-18

- Q: Czy 22 scenariusze akceptacyjne z SC-001 muszą być pokryte przez automatyczne testy Vitest? → A: Nie — SC-001 weryfikowany przez ręczną inspekcję wizualną; automatyczne testy Vitest obejmują wyłącznie zagadnienia ECharts-specyficzne (cykl życia, brak Canvas API, struktura ECOption).
- Q: Która wersja ECharts ma być użyta? → A: `^5.6.0` (najnowsze stabilne ECharts 5.x).
- Q: Kto zarządza ResizeObserver — renderer czy rodzic? → A: `EChartsRenderer` tworzy i zarządza własnym `ResizeObserver` wewnętrznie; `disconnect()` w `destroy()`.
- Q: Jak wyznaczana jest wysokość markLine „dziś", gdy dokładnie jedna seria ma `null` w slocie dzisiejszym? → A: Linia biegnie do wartości niezerowej serii; `null` traktowany jako nieobecny (nie jako zero).
- Q: Czy ECharts tooltip wymaga jawnej mitigacji dla Shadow DOM? → A: Tak — `tooltip.appendTo` musi wskazywać na kontener karty wewnątrz Shadow DOM (nie `document.body`).

---

## Assumptions

- Oś X jest oparta na modelu „slot index" (0..N-1) z formaterami etykiet i tooltipów — zgodnie z obecną strategią w `chart-renderer.ts`; ECharts używa osi `category` lub `value` z indeksami.
- Renderer Canvas jest wystarczający dla wszystkich wymagań wizualnych; SVG nie jest potrzebny.
- Marker „dziś" można w pełni zrealizować przez `markLine` (linia przerywana) i `markPoint` (kropki) bez potrzeby użycia `graphic` API.
- Wymuszenie dokładnie 5 ticków na osi Y jest deterministyczne przez `splitNumber: 4` + `min: 0` + kontrola `max` i `interval` w ECharts — bez dodatkowej logiki JS.
- Etykieta jednostki przy najwyższym ticku Y jest realizowana przez `axisLabel.formatter` rozpoznający najwyższą wartość ticka.
- ECharts w Shadow DOM (Lit/HA) działa poprawnie z `CanvasRenderer` dla renderowania i eventów myszy. Tooltip wymaga jawnego ustawienia `tooltip.appendTo` na kontener karty — nie można polegać na domyślnym `document.body`.
- Logika `alignSeriesOnTimeline` pozostaje w aktualnej formie lub jest przeniesiona 1:1 do nowego renderera — bez żadnych zmian algorytmu.
- `ResizeObserver` jest dostępny w środowisku HA (nowoczesna przeglądarka) — nie potrzeba polyfilla.
