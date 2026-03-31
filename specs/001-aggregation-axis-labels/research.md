# Research: Intelligent aggregation and X-axis labeling

**Branch**: `001-aggregation-axis-labels` | **Date**: 2026-03-31

---

## R-001: Automatyczny wybór `WindowAggregation` z `duration`

**Decision**: Tabela progów mapuje **długość trwania okna w ms** (z `durationToMillis(parseDurationToken(merged.duration))` po merge) na jedną z wartości LTS: `hour` | `day` | `week` | `month`. Docelowy rozmiar próbki: **~50 slotów** (środek pasma 20–100); dla każdego pasma czasu wybierana jest największa „naturalna” jednostka, która utrzymuje liczbę slotów w [20, 100] jeśli to możliwe przy dozwolonych agregacjach.

**Rationale**: Spec FR-001/Assumptions; Home Assistant LTS nie obsługuje minut w tym karcie — tylko istniejące `WindowAggregation`.

**Alternatives considered**: Stały krok wyłącznie z górnej granicy 100 — odrzucone (za grube dla krótkich okien); sub-hour — poza zakresem LTS.

---

## R-002: Gdzie wpiąć auto-interval w potoku

**Decision**: Po `buildMergedTimeWindowConfig`, jeśli **`merged.aggregation === undefined`**, ustawić **`merged.aggregation = pickAutoAggregation(durationMs)`** (czysta funkcja) przed `resolveTimeWindows`. Nie zmieniać semantyki merge YAML/karta (FR-002): jawne `aggregation` w scalonym configu wyłącza auto-interval.

**Single place (implementation)**: Ustawienie efektywnego **`aggregation`** (auto-interval) oraz **fail-fast** walidacja **`x_axis_format`** (patrz **R-009**) są stosowane w **jednej** ścieżce inicjalizacji konfiguracji — praktycznie **`src/card/cumulative-comparison-chart.ts`** (`setConfig` / przygotowanie fetch), zanim wywołane zostanie `resolveTimeWindows`. **`src/card/ha-api.ts`** buduje timeline i zapytania przy **już ustalonym** `ResolvedWindow[].aggregation`; nie duplikować tej logiki w dwóch miejscach.

**Rationale**: Minimalna zmiana istniejącego `resolveTimeWindows(..., aggregationFallback)` — dziś fallback to `"day"`; zamiast tego wywołać auto-interval gdy brak pola, zamiast stałego `day`.

**Alternatives considered**: Osobne pole `effectiveAggregation` równolegle — redundantne; modyfikacja tylko w `resolve-windows` — mieszałaby parsing duration z rozwiązywaniem kotwic.

---

## R-003: Limit 5000 punktów na serię

**Decision**: Stała **`MAX_POINTS_PER_SERIES = 5000`**. Obliczyć `timeline.length` po `buildChartTimeline` (lub równoważnie liczba slotów dla głównej osi). Jeśli `length > MAX`, ustawić stan karty na błąd konfiguracji (ten sam mechanizm co inne błędy YAML), komunikat zrozumiały + szczegół w `debug` w konsoli.

**Rationale**: Spec FR-003; ochrona HA + przeglądarki.

**Alternatives considered**: Miękkie przycinanie osi — sprzeczne z „ufaj użytkownikowi” dla świadomej konfiguracji; spec wymaga twardego odmowy.

---

## R-004: Wymuszony format osi — `x_axis_format`

**Decision**: String interpretowany przez **Luxon** `DateTime.toFormat()` z **udokumentowanym podzbiorem** tokenów (np. `yyyy`, `LLL`, `dd`, `HH`, `mm`). Walidacja przy `setConfig`: dozwolone znaki/tokeny z listy; w przeciwnym razie błąd konfiguracji. Czas dla każdego slotu: `DateTime.fromMillis(tickMs, { zone: haTimeZone })`.

**Rationale**: Spec + spójność z resztą kodu (Luxon już używany); jedna dokumentacja dla użytkownika.

**Alternatives considered**: ICU wyłącznie — odrzucone przez spec; presety bez stringów — odrzucone.

---

## R-005: Adaptacyjne etykiety (bez słowników w repo)

**Decision**: Dla trybu bez `x_axis_format`, dla każdego indeksu ticka budować etykietę przez **`Intl.DateTimeFormat`** (lub kilka instancji z różnymi `options`) z **`locale`** z kaskady spec FR-006, strefa z HA. Logika „boundary” (szerszy kontekst przy zmianie dnia/roku): porównanie `DateTime` sąsiednich slotów w strefie HA — jeśli zmiana dnia → dodać segment daty; jeśli zmiana roku → rok; indeks **0** zawsze traktowany jako boundary (spec Edge Case 4). Miesiące skrócone — przez `month: 'short'` w Intl, nie pliki JSON.

**Rationale**: FR-007; zerowy koszt tłumaczeń nazw miesięcy w repozytorium.

**Alternatives considered**: Wyłącznie Luxon `toFormat` z lokalizacją — możliwe, ale Intl jest natywnie zsynchronizowany z oczekiwaniem „silnik przeglądarki”.

---

## R-006: ECharts — oś X typu `value` i etykiety

**Decision**: Zachować **`xAxis.type: 'value'`** z indeksami 0…n-1 (jak dziś). `axisLabel.formatter(value)` mapuje indeks → string: `fullTimeline[tick]` → formatowanie daty. **`hideOverlap: true`**, **`rotate: 0`**. Opcjonalnie doprecyzować `interval` vs pozostawienie domyślnego zachowania przy `hideOverlap` — dopiero po testach wizualnych (spec Edge Case 3).

**Rationale**: Minimalna zmiana architektury wykresu; pełna tablica timestampów już jest w `fullTimeline`.

**Alternatives considered**: Oś `time` w ECharts — większy refactor i ryzyko regresji.

---

## R-007: Wielojęzyczność błędów konfiguracji

**Decision**: Nowe komunikaty przez istniejący mechanizm **i18n karty** (`localize.ts`), klucze jak przy innych błędach konfiguracji; treść techniczna (np. liczba punktów) tylko w `debug` / konsola.

**Rationale**: Konstytucja IV/V; spójność z `time-windows` errors.

---

## R-008: Uwaga — pojedyncze pole `aggregation` w merge (spójnie z `spec.md` / `tasks.md`)

**Decision**: Obecny model ma **jedno** pole opcjonalne **`aggregation`** na **`MergedTimeWindowConfig`** po deep merge **preset → `time_window` → `?? config.aggregation`** (`buildMergedTimeWindowConfig`). **Wszystkie** wpisy w **`ResolvedWindow[]`** używają tej samej wartości — **FR-002** w produkcie jest spełnione przez kolejność merge (pole z YAML/`time_window` wygrywa nad kartą, potem auto-interval). Osobne **`aggregation` per rozwiązane okno** wymaga przyszłego rozszerzenia schematu YAML (np. tablica okien); **v1** nie dodaje tego pola poza **`x_axis_format`**.

**Rationale**: Zgodność z `src/card/time-windows/merge-config.ts` i `src/card/types.ts`.

---

## R-009: Kiedy walidować `x_axis_format`

**Decision**: **`validateXAxisFormat`** wywoływane przy **`setConfig`** (lub równoważnej normalizacji konfiguracji), gdy **`x_axis_format`** jest ustawione — **przed** `resolveTimeWindows` i **`buildChartTimeline`** (fail-fast, **FR-005**). Brak cichego przejścia do etykiet adaptacyjnych przy niepoprawnym wzorcu.

**Rationale**: Remediacja `/speckit.analyze` (kolejność zadań); spójnie z `tasks.md` **T006**.

**Alternatives considered**: Walidacja dopiero przy pierwszym renderze — odrzucone (późniejszy błąd, zbędna praca).

---

## R-010: Nagłówek tooltipa — macierz + `fullTimeline` (primary)

**Decision**: Logika nagłówka w module czystym **`src/card/axis/tooltip-format.ts`**: domyślnie **`formatTooltipHeader`** używa wyłącznie **`fullTimeline[slotIndex]`** w strefie HA (Edge Case: „oś główna”), **`Intl`** wg **`primaryAggregation`** (bez roku w domyślnych porównaniach — **FR-011**). Opcjonalnie **`tooltip_format`** → Luxon **`toFormat`** (ta sama walidacja co **`x_axis_format`**).

**Rationale**: Spójność z US8–US11; brak duplikacji roku z legendą; testowalność.

---

## R-011: Godzina + okno wielodniowe (EC2)

**Decision**: Dla **`primaryAggregation === 'hour'`**, jeśli **`mergedDurationMs` > 1 doba**, dodać do nagłówka krótką datę (dzień + miesiąc), aby rozróżnić ten sam zegar na różnych dniach.

**Rationale**: Spec Edge Case „sub-daily + duration > 1 day”.
