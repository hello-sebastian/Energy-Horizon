---

description: "Tasks for implementing Energy Burndown Cumulative Comparison Card"
---

# Tasks: Energy Burndown Cumulative Comparison Card

**Input**: Design documents from `/specs/001-energy-burndown-card/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`

**Tests**: Dodajemy podstawowe zadania testowe dla krytycznej logiki (agregacje, prognoza, mapowanie LTS), zgodnie z konstytucją jakości.

**Organization**: Zadania są pogrupowane wg user stories, aby każdą historię dało się niezależnie zaimplementować i przetestować.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Może być realizowane równolegle (inne pliki, brak zależności)
- **[Story]**: User story (US1, US2, US3)
- Opisy zawierają konkretne ścieżki do plików

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicjalizacja projektu i bazowej struktury pod kartę Lovelace.

 - [x] T001 Utwórz strukturę projektu zgodnie z `plan.md` (`src/card`, `tests`, `config`)
 - [x] T002 Zainicjalizuj projekt TypeScript z Vite (`package.json`, `vite.config.ts`, `tsconfig.json` w `config/`)
 - [x] T003 [P] Dodaj i skonfiguruj zależności: `lit`, `chart.js`, typy HA/kart, narzędzia build (`package.json`)
 - [x] T004 [P] Skonfiguruj linting i formatowanie (ESLint + Prettier) (`config/eslint.config.js`, `package.json` skrypty)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wspólne fundamenty, bez których nie można realizować żadnej user story.

**⚠️ CRITICAL**: Wszystkie zadania z tej fazy muszą zostać ukończone przed rozpoczęciem prac nad US1–US3.

 - [x] T005 Utwórz bazowe typy konfiguracji i modeli w `src/card/types.ts` (`CardConfig`, `ComparisonPeriod`, modele LTS, `CardState`)
 - [x] T006 [P] Przygotuj szkic `cumulative-comparison-chart.ts` z pustym szkieletem klasy `LitElement` implementującej `LovelaceCard` (bez logiki) w `src/card/cumulative-comparison-chart.ts`
 - [x] T007 [P] Dodaj punkt wejścia bundla karty i rejestrację custom elementu w `src/index.ts`
 - [x] T008 [P] Skonfiguruj podstawowe testy jednostkowe (Vitest) i integracyjne (`tests/unit/`, `tests/integration/`, konfiguracja w `package.json`)

**Checkpoint**: Po ukończeniu fazy 2 projekt ma minimalny szkielet karty, typy i środowisko testowe – można implementować user stories.

---

## Phase 3: User Story 1 – Dodanie karty do dashboardu (Priority: P1) 🎯 MVP

**Goal**: Użytkownik może dodać kartę do dashboardu i zobaczyć na jednym wykresie dwie skumulowane serie zużycia energii (bieżący okres vs okres historyczny), dla wariantów rok‑do‑roku i miesiąc‑do‑roku.

**Independent Test**: Przy skonfigurowanej encji energii i odpowiednim zakresie danych użytkownik dodaje kartę, wybiera `comparison_mode` i widzi dwie poprawnie wyrównane w czasie serie skumulowane, rozróżnialne wizualnie, bez błędów renderowania.

### Tests for User Story 1

- [x] T009 [P] [US1] Dodaj testy jednostkowe mapowania odpowiedzi LTS na `ComparisonSeries` w `tests/unit/ha-api.test.ts`
- [x] T010 [P] [US1] Dodaj testy integracyjne podstawowego renderowania karty (loading/no-data/ready) w `tests/integration/card-render.test.ts`

### Implementation for User Story 1

- [x] T011 [P] [US1] Zaimplementuj serwis WebSocket LTS w `src/card/ha-api.ts` (budowa zapytań `recorder/statistics_during_period`, defensywne parsowanie odpowiedzi)
- [x] T012 [P] [US1] Zaimplementuj funkcje przeliczania serii na skumulowane (`CumulativeSeries`) i budowę `ComparisonSeries` w `src/card/ha-api.ts`
- [x] T013 [P] [US1] Utwórz klasę `ChartRenderer` inicjalizującą i aktualizującą Chart.js w `src/card/chart-renderer.ts` (line chart, gradienty, markery, tooltip/legend)
- [x] T014 [P] [US1] Zaimplementuj `theme-utils` do odczytu zmiennych HA i mapowania na kolory/gradienty Chart.js w `src/card/theme-utils.ts`
- [x] T015 [US1] Rozszerz `cumulative-comparison-chart.ts` o pełny lifecycle: `setConfig`, `hass` setter, `getCardSize`, zarządzanie stanem `CardState` (loading/error/no-data/ready) i inicjalizację `ha-api` + `ChartRenderer`
- [x] T016 [US1] Zaimplementuj logikę wariantów okresu (rok‑do‑roku / miesiąc‑do‑roku) i wyznaczanie zakresów czasu w oparciu o `CardConfig` i `ComparisonPeriod` w `src/card/ha-api.ts`
- [x] T017 [US1] Zaimplementuj layout `render()` w `cumulative-comparison-chart.ts` (spinner podczas ładowania, `<ha-alert>` dla błędów/braku danych, `<canvas>` dla wykresu) w `src/card/cumulative-comparison-chart.ts`
- [ ] T018 [US1] Obsłuż przypadki braku danych dla jednego z okresów (pokazanie pojedynczej serii + komunikat) w `src/card/cumulative-comparison-chart.ts`

**Checkpoint**: User Story 1 gotowa – karta dodana na dashboardzie pokazuje dwie serie skumulowane zgodnie ze specyfikacją.

---

## Phase 4: User Story 2 – Odczyt bieżących i referencyjnych wartości skumulowanych (Priority: P2)

**Goal**: Użytkownik widzi w panelu tekstowym bieżące skumulowane zużycie do dziś oraz skumulowaną wartość w analogicznym dniu okresu referencyjnego, wraz z różnicą (wartościowo/procentowo), bez konieczności odczytywania z osi wykresu.

**Independent Test**: Przy poprawnie skonfigurowanej karcie użytkownik może z samej sekcji podsumowania odczytać dwie wartości (bieżącą i referencyjną) i powiedzieć, czy zużywa więcej czy mniej oraz o ile.

### Tests for User Story 2

- [x] T019 [P] [US2] Dodaj testy jednostkowe dla wyliczania `SummaryStats` (wartości skumulowane, różnice, procenty) w `tests/unit/aggregation.test.ts`

### Implementation for User Story 2

- [x] T020 [P] [US2] Rozszerz logikę przetwarzania danych o wyliczanie `SummaryStats` (bieżące i referencyjne skumulowane wartości, różnice) w `src/card/ha-api.ts` lub dedykowanym helperze
- [x] T021 [US2] Zaimplementuj sekcję podsumowania w `render()` (dwie wyraźnie opisane wartości + różnica, z jednostką) w `src/card/cumulative-comparison-chart.ts`
- [x] T022 [US2] Obsłuż niekompletne dane referencyjne (np. brak dnia w okresie referencyjnym) – komunikat o niekompletności / pominięcie porównania liczbowego bez błędów renderowania w `src/card/cumulative-comparison-chart.ts`
- [x] T023 [US2] Zaimplementuj generowanie nagłówka tekstowego `TextSummary.heading` na podstawie `SummaryStats` (logika „wyższe/niższe/podobne/nieznane” zgodnie z FR-009) i wyświetl go w górnej części karty w `src/card/cumulative-comparison-chart.ts`

**Checkpoint**: User Story 1 + 2 gotowe – karta prezentuje zarówno wykres, jak i czytelne wartości skumulowane dla obu okresów.

---

## Phase 5: User Story 3 – Odczyt prognozy końcowego zużycia (Priority: P3)

**Goal**: Użytkownik widzi przewidywane łączne zużycie energii dla bieżącego okresu oraz łączną wartość z okresu referencyjnego, z wyraźnym zakomunikowaniem poziomu pewności prognozy.

**Independent Test**: Przy reprezentatywnej liczbie dni z danymi użytkownik widzi prognozę końcowego zużycia oraz wartość historyczną, a przy krótkiej historii/danych niestabilnych UI zachowuje się ostrożnie (niska pewność lub brak prognozy).

### Tests for User Story 3

- [x] T024 [P] [US3] Dodaj testy jednostkowe dla wyliczania `ForecastStats` (średnie dzienne, ekstrapolacja, poziom pewności) w `tests/unit/aggregation.test.ts`

### Implementation for User Story 3

- [x] T025 [P] [US3] Zaimplementuj logikę prognozy (`ForecastStats`): ekstrapolacja na podstawie dotychczasowego trendu, próg minimalnej liczby punktów, wyliczanie `confidence` w `src/card/ha-api.ts` lub dedykowanym helperze
- [x] T026 [US3] Rozszerz sekcję podsumowania o prognozę końcowego zużycia bieżącego okresu i historyczną wartość referencyjną, z oznaczeniem poziomu pewności w `src/card/cumulative-comparison-chart.ts`
- [ ] T027 [US3] Zaimplementuj ostrożne zachowanie przy bardzo krótkiej historii / wysokiej niestabilności danych (np. ukrycie prognozy lub wyświetlenie komunikatu o niskiej pewności) w `src/card/cumulative-comparison-chart.ts`

**Checkpoint**: Wszystkie trzy user stories działają niezależnie – wykres, wartości skumulowane i prognoza są spójne z wymaganiami.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Usprawnienia oraz dopracowanie całości rozwiązania.

- [ ] T028 [P] Uzupełnij dokumentację w `specs/001-energy-burndown-card/quickstart.md` o finalne przykłady konfiguracji oraz zrzuty ekranu (jeśli dostępne)
- [ ] T029 [P] Dodaj dodatkowe testy jednostkowe dla edge case’ów (brak danych LTS, różne jednostki, rok przestępny) w `tests/unit/ha-api.test.ts`
- [ ] T030 Przejrzyj i uprość kod (refaktoryzacja, usunięcie duplikacji) w `src/card/*`
- [ ] T031 [P] Zweryfikuj wydajność renderowania karty przy typowych zakresach danych i popraw ewentualne wąskie gardła (np. konfiguracja Chart.js) w `src/card/chart-renderer.ts`
- [ ] T032 [P] Zweryfikuj zachowanie themingu i trybów dark/light na różnych motywach HA (dostosuj `theme-utils.ts` w razie potrzeby)
- [x] T033 [P] Zaimplementuj formatowanie dat i liczb zgodnie z sekcją „Locale & Formatting” w `plan.md` (wykorzystanie `hass.locale` / `hass.language` z `Intl.DateTimeFormat` / `Intl.NumberFormat`) w `src/card/cumulative-comparison-chart.ts`
- [ ] T034 [P] Zweryfikuj, że użycie `<ha-alert>` i `<ha-circular-progress>` w `src/card/cumulative-comparison-chart.ts` jest zgodne z kontraktem opisanym w `specs/001-energy-burndown-card/contracts/ui.md` i wprowadź ewentualne poprawki

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Brak zależności – można startować od razu.
- **Foundational (Phase 2)**: Zależy od ukończenia Setup – BLOKUJE wszystkie user stories.
- **User Stories (Phase 3–5)**: Wszystkie zależą od ukończenia Foundational.
  - US1 (P1) powinna zostać ukończona jako MVP przed US2 i US3.
  - US2 i US3 mogą być realizowane równolegle po ukończeniu US1, jeśli zachowana jest niezależność testowania.
- **Polish (Phase 6)**: Zależy od ukończenia wszystkich docelowych user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Start po Phase 2; brak zależności od innych stories.
- **User Story 2 (P2)**: Start po Phase 2; korzysta z fundamentów US1 (serii skumulowanych), ale pozostaje niezależnie testowalna (sekcja podsumowania).
- **User Story 3 (P3)**: Start po Phase 2; korzysta z danych z US1/US2, ale logika prognozy i prezentacja są testowalne niezależnie.

### Parallel Opportunities

- Wszystkie zadania oznaczone `[P]` mogą być realizowane równolegle (inne pliki, brak bezpośrednich zależności).
- Po ukończeniu Phase 2:
  - Można równolegle rozwijać:
    - `ha-api.ts`, `chart-renderer.ts`, `theme-utils.ts` oraz testy.
- Po ukończeniu US1:
  - US2 (sekcja podsumowania) i US3 (prognoza) mogą być rozwijane równolegle przez różnych developerów.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Ukończ Phase 1: Setup.
2. Ukończ Phase 2: Foundational (krytyczne – blokuje stories).
3. Zaimplementuj Phase 3: User Story 1.
4. **STOP & VALIDATE**: Przetestuj US1 niezależnie (wykres + stany UI).
5. W razie potrzeby wydaj/demo jako MVP.

### Incremental Delivery

1. Ukończ Setup + Foundational → fundament gotowy.
2. Dodaj US1 → test → potencjalne wydanie.
3. Dodaj US2 → test → potencjalne wydanie.
4. Dodaj US3 → test → potencjalne wydanie.
5. Po każdej historii upewnij się, że wcześniejsze stories nadal przechodzą testy.

