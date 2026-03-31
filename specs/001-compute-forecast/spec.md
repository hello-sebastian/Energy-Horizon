# Feature Specification: Ulepszone obliczanie prognozy (computeForecast)

**Feature Branch**: `001-compute-forecast`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "Ulepszone obliczanie prognozy (computeForecast)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Wiarygodna prognoza dla month_over_year i year_over_year (Priority: P1)

Użytkownik widzi prognozę zużycia energii na koniec okresu. Oczekuje, że próg aktywacji
prognozy będzie semantycznie spójny niezależnie od długości porównywanego okresu
(miesiąc vs rok). Prognoza powinna być włączona, gdy upłynął co najmniej sensowny
procent okresu, a nie stała liczba punktów danych.

**Why this priority**: Aktualny mechanizm oparty na bezwzględnej liczbie bucketów (5/7/14)
powoduje, że dla year_over_year prognoza włącza się po przebyciu zaledwie ~1,4% roku,
a dla month_over_year po ~17%. To niespójne zachowanie jest głównym błędem logicznym.

**Independent Test**: Można przetestować czysto jednostkowo: wywołać `computeForecast`
z danymi year_over_year (365 bucketów total) oraz month_over_year (30 bucketów total)
i sprawdzić, że progi aktywacji/confidence odpowiadają tym samym procentom okresu.

**Acceptance Scenarios**:

1. **Given** dane bieżące obejmują 2 buckety z 365 (pct ≈ 0.003), **When** wywołano `computeForecast`, **Then** wynik ma `enabled: false` (pct < 0.05 i completedBuckets < 3)
2. **Given** dane bieżące obejmują 4 buckety z 30 (pct ≈ 0.13), **When** wywołano `computeForecast`, **Then** wynik ma `enabled: true`, `confidence: "low"` (completedBuckets ≥ 3 i 0.05 ≤ pct < 0.20)
3. **Given** dane bieżące obejmują 7 buckety z 30 (pct ≈ 0.23), **When** wywołano `computeForecast`, **Then** wynik ma `enabled: true`, `confidence: "medium"`
4. **Given** dane bieżące obejmują 13 buckety z 30 (pct ≈ 0.43), **When** wywołano `computeForecast`, **Then** wynik ma `enabled: true`, `confidence: "high"`

---

### User Story 2 – Odporność na luki w danych (wyrównanie po czasie, nie indeksie) (Priority: P1)

Użytkownik, który miał przerwę w zbieraniu danych (restart HA, brak zasięgu), nie chce,
aby prognoza była cicho zaburzona przez błędne wyrównanie serii bieżącej z referencyjną
po pozycji w tablicy. Punkt podziału w serii referencyjnej powinien być wyznaczany
na podstawie odpowiadającego okresu czasu, a nie numeru indeksu.

**Why this priority**: Luka w danych powoduje, że indeks ostatniego punktu bieżącego
(np. 15) nie odpowiada temu samemu momentowi w serii referencyjnej (np. punkt 18),
bo brakuje 3 bucketów. Wyrównanie po czasie eliminuje ten błąd.

**Independent Test**: Test jednostkowy z serią bieżącą zawierającą lukę czasową
(brakujący punkt pośrodku) i sprawdzenie, że B/C są obliczone poprawnie.

**Acceptance Scenarios**:

1. **Given** seria bieżąca ma lukę (brakuje punktu w środku), a seria referencyjna jest ciągła, **When** wywołano `computeForecast`, **Then** `splitIdx` wyznaczony jest na podstawie zakresu ms, a B i C odpowiadają właściwej proporcji referencji
2. **Given** seria referencyjna ma lukę (brakuje punktu referencyjnego), **When** wywołano `computeForecast`, **Then** `splitIdx` wyznaczony na podstawie czasu (nie indeksu), wynik `enabled: true` jeśli warunki spełnione
3. **Given** wszystkie punkty referencji mają timestamp późniejszy niż zakres bieżący, **When** wywołano `computeForecast`, **Then** wynik ma `enabled: false`

---

### User Story 3 – Wykrywanie anomalnego roku referencyjnego (Priority: P2)

Użytkownik korzystający z year_over_year, gdzie rok referencyjny był anomalny (pandemia,
remont, awaria instalacji), chce być ostrzeżony, że prognoza może być zawodna.
System obniża poziom zaufania do "low" i oznacza flagą `anomalousReference`.

**Why this priority**: Bez tej detekcji prognoza oparta na anomalnym roku jest prezentowana
z wysokim zaufaniem, co wprowadza użytkownika w błąd.

**Independent Test**: Test jednostkowy: seria bieżąca z A/B > 3.3 lub A/B < 0.3,
sprawdzenie że `confidence = "low"` i `anomalousReference = true`, a wynik nadal zwrócony.

**Acceptance Scenarios**:

1. **Given** stosunek zużycia bieżącego do referencyjnego (rawTrend) = 4.0, **When** wywołano `computeForecast`, **Then** `anomalousReference: true`, `confidence: "low"`, `enabled: true`
2. **Given** rawTrend = 0.2 (bieżące zużycie drastycznie niższe niż referencyjne), **When** wywołano `computeForecast`, **Then** `anomalousReference: true`, `confidence: "low"`, `enabled: true`
3. **Given** rawTrend = 1.1 (normalny rok), **When** wywołano `computeForecast`, **Then** `anomalousReference: false` (lub pole nieobecne), confidence niezdegradowane przez anomalię

---

### User Story 4 – Obsługa brakującej "reszty" w referencji (C = 0) (Priority: P2)

Gdy seria referencyjna kończy się dokładnie w punkcie bieżącym (C = 0, brak danych
referencyjnych dla reszty okresu), prognoza jest technicznie niemożliwa do ekstrapolacji,
ale znany jest wynik A. System powinien zwrócić `forecast_total = A` bez wyłączania.

**Why this priority**: Edge case nieobsługiwany przez obecny kod, ale możliwy w danych
z HA (seria referencyjna krótsza niż bieżąca).

**Independent Test**: Test jednostkowy z pustą "resztą" referencji.

**Acceptance Scenarios**:

1. **Given** C = 0 (wszystkie punkty referencji mieszczą się w zakresie bieżącym), **When** wywołano `computeForecast`, **Then** `enabled: true`, `forecast_total = A`

---

### Edge Cases

- Co gdy `currentPoints` ma < 3 elementów (completedBuckets < 3) niezależnie od pct → `enabled: false`
- Co gdy `periodTotalBuckets = 0` → `enabled: false` (unikamy dzielenia przez zero)
- Co gdy brak serii referencyjnej (referencePoints jest puste lub null) → `enabled: false`
- Co gdy splitIdx = -1 (wszystkie punkty referencji mają timestamp > currentRangeMs) → `enabled: false`
- Co gdy completedBuckets = 0 (currentPoints ma 1 element, więc completedBuckets = n - 1 = 0) → `enabled: false`
- Co gdy rawTrend === Infinity (B = 0, brak danych referencyjnych w zakresie bieżącym) → `enabled: false`
- Co gdy B = 0 i C > 0 → `enabled: false` (nie można obliczyć trendu)
- Co gdy rawTrend jest dokładnie na granicy (np. 3.3 lub 0.3) → zachowanie wg `< 0.3 || > 3.3` (granica NIE jest anomalią)
- Co gdy C = 0 i rawTrend < 0.3 lub > 3.3 → `enabled: true`, `forecast_total = A`, `confidence: "low"`, `anomalousReference: true` (oba mechanizmy kumulują się)

## Clarifications

### Session 2026-03-19

- Q: Co dokładnie reprezentuje zmienna `A` używana w formułach prognozy? → A: `A = sum(currentPoints[0..completedBuckets-1].rawValue)` – suma rawValue wszystkich punktów bieżących od indeksu 0 do completedBuckets-1 włącznie (nie obejmuje ostatniego punktu, który jest jeszcze niepełny).
- Q: Czy `referencePoints` są gwarantowanie posortowane rosnąco po `timestamp`? → A: Tak — `normalizePoints()` jawnie sortuje tablicę (`.sort((a,b) => a.timestamp - b.timestamp)`) przed przekazaniem do `toCumulativeSeries`; funkcja `computeForecast` może polegać na posortowanym wejściu bez dodatkowego sortowania.
- Q: Co gdy C = 0 i jednocześnie rawTrend wskazuje anomalię (< 0.3 lub > 3.3)? → A: Oba mechanizmy kumulują się niezależnie — wynik: `enabled: true`, `forecast_total = A`, `confidence: "low"`, `anomalousReference: true`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Funkcja `computeForecast` MUSI przyjmować drugi argument `periodTotalBuckets: number` reprezentujący całkowitą liczbę bucketów w pełnym okresie.
- **FR-002**: System MUSI obliczać `completedBuckets = currentPoints.length - 1` oraz `pct = completedBuckets / periodTotalBuckets`.
- **FR-003**: System MUSI zwracać `enabled: false` gdy `completedBuckets < 3` LUB `pct < 0.05` LUB `periodTotalBuckets <= 0`.
- **FR-004**: System MUSI przypisywać `confidence: "high"` gdy `pct >= 0.40`, `"medium"` gdy `pct >= 0.20`, `"low"` w pozostałych przypadkach (gdy enabled).
- **FR-005**: System MUSI wyznaczać punkt podziału serii referencyjnej (`splitIdx`) na podstawie zakresu czasowego bieżących danych (`currentRangeMs = currentPoints[completedBuckets-1].timestamp - currentPoints[0].timestamp`), a nie po indeksie tablicy. `referencePoints` są gwarantowanie posortowane rosnąco po `timestamp` (przez `normalizePoints`) — funkcja NIE musi ich sortować.
- **FR-006**: System MUSI zwracać `enabled: false` gdy `splitIdx` nie istnieje (żaden punkt referencji nie mieści się w `currentRangeMs`).
- **FR-007**: Suma B MUSI obejmować `rawValue` punktów referencji od 0 do `splitIdx` włącznie; suma C – punkty od `splitIdx+1` do końca.
- **FR-008**: System MUSI obliczać `A = sum(currentPoints[0..completedBuckets-1].rawValue)` oraz `rawTrend = A / B` przed clampem.
- **FR-009**: System MUSI ustawiać `anomalousReference: true` gdy `rawTrend < 0.3` LUB `rawTrend > 3.3`, oraz obniżać `confidence` do `"low"` niezależnie od pct (prognoza nadal `enabled: true`).
- **FR-010**: System MUSI clampować trend: `trend = Math.min(5, Math.max(0.2, rawTrend))`.
- **FR-011**: System MUSI obliczać `forecast_total = A + C * trend`.
- **FR-012**: Gdy `C = 0`, system MUSI zwracać `enabled: true`, `forecast_total = A`. Detekcja anomalii (FR-009) nadal obowiązuje — jeśli równocześnie `rawTrend < 0.3 || > 3.3`, wynik zawiera również `confidence: "low"` i `anomalousReference: true`.
- **FR-013**: Gdy `B = 0` (lub rawTrend === Infinity), system MUSI zwracać `enabled: false`.
- **FR-014**: Typ `ForecastStats` MUSI zawierać opcjonalne pole `anomalousReference?: boolean`.
- **FR-015**: Call-site w `cumulative-comparison-chart.ts` MUSI przekazywać jako drugi argument `computeForecast` wartość **`forecastPeriodBuckets`** z `buildChartTimeline` w `ha-api.ts` (pełna liczba bucketów bieżącego okresu porównania). Dla wyłącznie presetów YoY/MoY na ścieżce legacy odpowiada ona długości timeline’u pełnego okresu kalendarzowego; przy wielu oknach czasowych z różnymi długościami — liczbie slotów **okna bieżącego (indeks 0)**, a nie długości osi wykresu (patrz [001-time-windows-engine FR-017](../001-time-windows-engine/spec.md)).
- **FR-016**: Stała `MIN_POINTS_FOR_FORECAST` (= 5) MUSI zostać usunięta lub zastąpiona wbudowanym floor = 3 (nie eksportowaną stałą).

### Key Entities

- **ComparisonSeries**: Struktura danych z polem `currentPoints` (tablica punktów z `timestamp` i `rawValue`) oraz `referencePoints` (analogiczna tablica dla roku referencyjnego).
- **ForecastStats**: Wynik funkcji `computeForecast` – zawiera: `enabled: boolean`, `confidence: "low" | "medium" | "high"`, `forecast_total: number`, opcjonalnie `anomalousReference?: boolean`.
- **periodTotalBuckets**: Całkowita liczba bucketów w pełnym **bieżącym** okresie porównania (seria `current`), przekazywana z karty jako `forecastPeriodBuckets` z `buildChartTimeline` — przy wielu oknach czasowych nie jest to automatycznie równe długości osi X wykresu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Prognoza month_over_year i year_over_year aktywuje się i przechodzi przez poziomy zaufania przy tych samych progach procentowych (5% / 20% / 40% okresu) – weryfikowalne przez testy jednostkowe.
- **SC-002**: Wszystkie wymagane przypadki testowe (min. 10 wymienionych w opisie funkcji) przechodzą bez błędów.
- **SC-003**: Dane z lukami czasowymi w serii bieżącej lub referencyjnej dają identyczny wynik prognozy co dane bez luk, o ile zakres czasu jest ten sam.
- **SC-004**: Prognoza oparta na anomalnym roku referencyjnym (rawTrend < 0.3 lub > 3.3) nie jest nigdy prezentowana z confidence wyższym niż "low".
- **SC-005**: Brak regresji: funkcje `computeSummary`, `computeTextSummary`, `buildComparisonPeriod`, chart renderer nie wymagają żadnych zmian.

## Assumptions

- Drugi argument wywołania jest uzgadniany z `buildChartTimeline` w `ha-api.ts` (`forecastPeriodBuckets`): ten sam kontrakt co wcześniej dla samych presetów (pełny okres bieżącej serii); przy konfiguracji wielookiennej — wyłącznie zakres **okna 0**, zgodnie z [001-time-windows-engine FR-017](../001-time-windows-engine/spec.md). Nie wymaga dodatkowych zapytań do HA.
- Punkty w `currentPoints` i `referencePoints` mają pole `timestamp` w milisekundach (Unix ms) oraz `rawValue: number` (niezsumowana wartość bucketu).
- Graniczne wartości `rawTrend === 0.3` i `rawTrend === 3.3` NIE są traktowane jako anomalia (warunek `< 0.3 || > 3.3`, nie `<=`/`>=`).
- `anomalousReference` jest polem opcjonalnym w typie – brak pola jest równoznaczny z `false` dla przyszłego kodu UI.
- Nie zmieniamy sygnatury `ComparisonSeries` – tylko `ForecastStats` i `computeForecast`.
