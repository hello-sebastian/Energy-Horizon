# Research: Time Windows Engine

**Feature**: 001-time-windows-engine | **Date**: 2026-03-29

## R1: Biblioteka kalendarza i notacja `1y` / `6M` / `30d`

**Decision**: Dodać zależność **Luxon** (`luxon`) i używać jej do:

- kotwic w strefie czasu HA (`hass.selectedTheme` / `Intl` — obecnie `resolveLocale(...).timeZone` z karty),
- arytmetyki kalendarza (koniec miesiąca, luty w roku przestępnym, „−1M” od 31 marca → ostatni dzień lutego),
- spójnego modelu `start`/`end` jako `DateTime` z `.toISO()` do zapytań LTS.

Osobny, mały moduł **parsowania tokenów czasu** (np. `1y`, `1M`, `7d`, `1h`) mapuje stringi YAML na `Duration` / operacje Luxon; wielkość liter i dozwolone jednostki — dokumentowane w wiki (FR-010).

**Rationale**: Obecny kod używa `Date` nativnego i `date-fns` nie jest jeszcze w ścieżce okresów w `ha-api.ts`. Luxon daje przewidywalne **timezone** i **calendar math** w jednym API; wymagania specu (kotwice, offsety, skoki) odpowiadają modelowi Luxon lepiej niż ręczne `setMonth` na `Date`.

**Alternatives considered**:

- **Tylko date-fns** — już w `package.json`, ale brak wbudowanego „timezone-first” jak w Luxon; wymagałoby `date-fns-tz` + własna gramatyka duration → dwa pakiety i więcej klejenia.
- **Natywny `Date` + ręczne reguły** — najmniej zależności, ale wysokie ryzyko błędów przy DST, przestępności i „ostatni dzień miesiąca”; sprzeczne z konstytucją (testowalność, mniej magii).
- **Temporal (polyfill)** — przyszłościowe, nadmierne dla karty przeglądarkowej dziś.

## R2: Zachowanie legacy `year_over_year` / `month_over_year`

**Decision**: Presety muszą odtworzyć **dokładnie** obecną semantykę z `buildComparisonPeriod` w `ha-api.ts`:

- **current**: `current_start` = początek roku lub miesiąca; `current_end` = **„teraz”** (`now`), nie koniec roku/miesiąca.
- **reference**: rok (lub miesiąc w roku `period_offset`) z **pełnym** zakresem kalendarzowym do końca roku/miesiąca (`reference_end` = 31.12 / ostatni dzień miesiąca).
- `period_offset` (domyślnie `-1`): przesuwa **rok referencyjny** względem bieżącego tak jak dziś.

Rozszerzony silnik reprezentuje to jako **dwa wyliczone okna** (indeks 0 i 1) z polami start/end zgodnymi z powyższym, a nie jako dwa symetryczne „pełne” okna tej samej długości — chyba że użytkownik nadpisze to przez `time_window`.

**Rationale**: SC-004 i regresja P1 w specu.

**Alternatives considered**: Wymuszenie symetrycznych okien dla presetów — **odrzucone** (zmiana produktu).

## R3: Deep merge `time_window` vs preset

**Decision**: Merge **rekurencyjny tylko dla zagnieżdżonych obiektów** zgodnych ze schematem; dla płaskich pól presetu (`anchor`, `duration`, `step`, `count`, `offset`, `aggregation`) wartość z YAML **zastępuje** pole presetu. Brak klucza w YAML = zachowanie wartości presetu. Po merge uruchamiana jest **jedna** walidacja schematu (nie „częściowe” stosowanie pól przy błędzie — zgodnie z FR-014 po clarify).

**Rationale**: FR-005, ustalenia sesji clarify (błąd = brak wykresu, nie fallback).

## R4: Walidacja a rdzeń silnika (limit 24)

**Decision**: Funkcja `resolveTimeWindows(...)` przyjmuje `maxWindows: number` z domyślną wartością **24** wywoływaną z karty; testy jednostkowe mogą przekazać wyższe N, by sprawdzić algorytm bez zmiany kodu produkcyjnego.

**Rationale**: FR-016.

## R5: Agregacja `hour` i API HA

**Decision**: Rozszerzyć typy zapytania LTS o okresy już obecne w typowaniu `LtsStatisticsQuery` (`hour`, ewentualnie `5minute`), ale **włączyć w produkcie** tylko te, które są przetestowane względem realnego HA. Minimalny zakres funkcji: **day / week / month** + **hour** dla user story godzinowego; `5minute` — opcjonalnie w typach na przyszłość.

**Rationale**: Spec P3 (godziny); unikanie nieobsługiwanych kombinacji bez testów integracyjnych.

## R6: Tooltip i serie pomocnicze

**Decision**: W `echarts-renderer.ts` formatter tooltipa **filtruje** parametry serii do maksymalnie dwóch nazw/serii odpowiadających oknom 0 i 1 (np. po `seriesIndex` lub metadanych w `encode`/`name`). Serie kontekstowe (≥2) pozostają w `series[]` dla wykresu, ale są **wykluczone** z pętli budującej `valueLines`.

**Rationale**: SC-001, FR-008.
