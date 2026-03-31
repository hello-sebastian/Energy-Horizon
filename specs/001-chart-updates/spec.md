# Feature Specification: Chart Updates – Wizualizacja i UX wykresu

**Feature Branch**: `001-chart-updates`  
**Created**: 2026-03-17  
**Status**: Draft  

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Pełna oś czasu niezależnie od dostępności danych (Priority: P1)

Użytkownik konfiguruje kartę w trybie porównania rok do roku z agregacją dzienną. Aktualnie wykres wyświetla jedynie dni, dla których istnieją dane — np. 200 zamiast 365 dni. Użytkownik chce, by oś pozioma zawsze obejmowała kompletny badany okres (np. wszystkie 365/366 dni roku, wszystkie dni miesiąca). W miejscach brakujących danych linia wykresu powinna się przerywać (nie łączyć odległych punktów), co jasno informuje użytkownika, kiedy dane nie były zbierane.

**Why this priority**: Bez pełnej osi czasu wykres jest mylący — użytkownik nie może ocenić, czy brakuje danych czy okres jest krótszy. To podstawowe wymaganie poprawności wizualizacji.

**Independent Test**: Można przetestować niezależnie przez skonfigurowanie karty z `comparison_preset: year_over_year` i `aggregation: day` na encji z lukami w danych. Oś pozioma musi pokazywać 365 (lub 366) pozycji; linia musi być przerwana w miejscach bez danych.

**Acceptance Scenarios**:

1. **Given** karta z `comparison_preset: year_over_year` i `aggregation: day`, **When** część dni roku nie ma danych, **Then** oś pozioma wyświetla wszystkie 365 lub 366 dni, a linia wykresu jest przerwana w dniach bez danych.
2. **Given** karta z `comparison_preset: month_over_month` i `aggregation: day`, **When** część dni miesiąca nie ma danych, **Then** oś pozioma wyświetla wszystkie dni badanego miesiąca, a linia jest przerwana tam gdzie brak danych.
3. **Given** agregacja `hour` (godzinowa), **When** brakuje danych dla niektórych godzin, **Then** oś pozioma zawiera wszystkie godziny badanego okresu, a linia przerywa się w miejscach bez danych.
4. **Given** agregacja `week` lub `month`, **When** brakuje danych, **Then** oś pozioma zawiera wszystkie tygodnie/miesiące okresu, a linia przerywa się odpowiednio.
5. **Given** seria referencyjna (poprzedni rok/miesiąc) ma luki w danych, **When** wykres jest renderowany, **Then** seria referencyjna również wykazuje przerwy, a oś pozostaje kompletna.

---

### User Story 2 – Podkreślenie aktualnego dnia na wykresie (Priority: P2)

Użytkownik patrzy na wykres i chce natychmiast rozpoznać, który punkt odpowiada dzisiejszemu dniu. Na wykresie powinny pojawić się: kropka na serii bieżącego okresu w miejscu dzisiejszego dnia, kropka na serii referencyjnej w miejscu analogicznego dnia (rok/miesiąc wcześniej), oraz pionowa linia przerywana od osi poziomej (wartość 0) do wyższej z dwóch kropek, w kolorze linii serii bieżącego okresu.

**Why this priority**: Użytkownik codziennie sprawdza kartę — szybkie wizualne zlokalizowanie dzisiejszej wartości jest kluczowe dla intuicyjnego odczytu postępu.

**Independent Test**: Można przetestować niezależnie — wykres z datą bieżącą musi mieć widoczne kropki i pionową linię przerywaną, niezależnie od innych opcji wizualizacji.

**Acceptance Scenarios**:

1. **Given** karta z danymi dla bieżącego i referencyjnego okresu, **When** wykres jest renderowany, **Then** na serii bieżącego okresu widoczna jest wyraźna kropka w punkcie odpowiadającym dzisiejszemu dniu, w kolorze przypisanym do serii okresu biezacego.
2. **Given** j.w., **When** wykres jest renderowany, **Then** na serii referencyjnej widoczna jest wyraźna kropka w punkcie odpowiadającym analogicznemu dniu okresu referencyjnego, w kolorze przypisanym do serii okresu referencyjnego.
3. **Given** obie serie mają kropki, **When** wykres jest renderowany, **Then** pionowa linia przerywana jest rysowana od wartości 0 na osi pionowej do wyższej z dwóch wartości (punkt bieżący lub referencyjny), w kolorze linii serii bieżącego okresu.
4. **Given** brak danych dla dzisiejszego dnia w jednej z serii, **When** wykres jest renderowany, **Then** kropka tej serii nie jest wyświetlana, a linia przerywana wyznacza pozycję dzisiejszego dnia na osi poziomej opierając się na dostępnej serii. Jeśli zadna seria nie jest dostępna linia pionowa biegnie do samej góry wykresu. 

---

### User Story 3 – Półprzezroczyste wypełnienie pod liniami wykresu (Priority: P3)

Użytkownik chce, by kumulatywny charakter danych był wizualnie podkreślony przez wypełnienie obszaru pod liniami wykresu. Wypełnienie ma kolor odpowiedniej serii. Użytkownik może niezależnie dla każdej serii (bieżącej i referencyjnej) włączyć/wyłączyć wypełnienie oraz ustawić jego krycie w YAML. Jeśli krycie nie jest zdefiniowane, przyjmuje domyślną wartość 30%. Domyślnie: wypełnienie dla serii bieżącego okresu jest włączone, dla serii referencyjnej wyłączone.

**Why this priority**: Wypełnienie jest elementem estetycznym i pomocniczym. Ma niższy priorytet niż poprawność osi i nawigacja po dacie bieżącej.

**Independent Test**: Można przetestować niezależnie — skonfigurowanie karty z jawnie ustawionymi flagami `fill_current` i `fill_reference` i weryfikacja wizualna obecności/braku wypełnienia.

**Acceptance Scenarios**:

1. **Given** brak jawnej konfiguracji flag wypełnienia i wartości krycia wypełnienia, **When** wykres jest renderowany, **Then** wypełnienie pod serią bieżącego okresu jest widoczne z kryciem 30%, wypełnienie pod serią referencyjną jest niewidoczne.
2. **Given** `fill_reference: true` w YAML, **When** wykres jest renderowany, **Then** wypełnienie pod serią referencyjną jest widoczne z kryciem 30% w kolorze serii referencyjnej.
3. **Given** `fill_current: false` w YAML, **When** wykres jest renderowany, **Then** wypełnienie pod serią bieżącego okresu jest niewidoczne.
4. **Given** dowolna kombinacja flag, **When** kolor serii zostanie zmieniony (US4), **Then** wypełnienie zachowuje kolor powiązanej serii.
5. **Given** `fill_current_opacity: 10` w YAML, **When** wykres jest renderowany, **Then** wypełnienie pod serią bieżącego okresu ma krycie 10% i nie wpływa na krycie samej linii serii.
6. **Given** `fill_reference: true` oraz `fill_reference_opacity: 60` w YAML, **When** wykres jest renderowany, **Then** wypełnienie pod serią referencyjną ma krycie 60%.
7. **Given** niepoprawna wartość krycia (np. ujemna lub powyżej 100), **When** wykres jest renderowany, **Then** karta stosuje wartość domyślną 30% dla tej serii i nie przerywa renderowania karty.

---

### User Story 4 – Konfigurowalny kolor głównej serii danych (Priority: P4)

Użytkownik chce dostosować kolor linii wykresu serii bieżącego okresu. Kolor jest konfigurowany w YAML jako wartość w notacji webowej (np. `#ABABAB`, `rgba(...)`, nazwy CSS). Jeśli wartość nie jest podana, karta automatycznie stosuje kolor akcentu zdefiniowany w ustawieniach motywu Home Assistant.

**Why this priority**: Personalizacja kolorów jest ważna dla użytkowników zarządzających wieloma kartami, ale nie blokuje podstawowej funkcjonalności.

**Independent Test**: Można przetestować niezależnie — podanie dowolnej wartości koloru w YAML i weryfikacja, że linia wykresu, kropka i linia przerywana mają ten kolor.

**Acceptance Scenarios**:

1. **Given** brak opcji koloru w YAML, **When** wykres jest renderowany, **Then** linia serii bieżącego okresu ma kolor akcentu z ustawień motywu HA.
2. **Given** `primary_color: "#E53935"` w YAML, **When** wykres jest renderowany, **Then** linia serii bieżącego okresu, jej wypełnienie, kropka aktualnego dnia oraz pionowa linia przerywana mają kolor `#E53935`.
3. **Given** niepoprawna wartość koloru (np. `primary_color: "invalid-color"`), **When** wykres jest renderowany, **Then** karta stosuje kolor akcentu HA jako fallback i nie zgłasza błędu powodującego niewyświetlenie karty.

---

### User Story 5 – Wizualizacja prognozy zużycia (Priority: P5)

Użytkownik chce zobaczyć prognozę zużycia energii na wykresie jako prostą linię przerywaną. Linia zaczyna się w punkcie odpowiadającym dzisiejszemu dniu i aktualnej wartości kumulatywnej, a kończy w ostatnim dniu badanego okresu z prognozowaną wartością końcową. Linia ma kolor serii bieżącego okresu. Widoczność prognozy jest kontrolowana flagą logiczną `show_forecast` w YAML (domyślnie włączona — brak klucza lub wartość inna niż `false` pokazuje linię, o ile prognoza jest dostępna; jawne `show_forecast: false` ukrywa linię).

**Why this priority**: Prognoza jest zaawansowaną funkcją analityczną. Zależy od poprawności osi (US1) i dostępu do wartości bieżącej (US2), dlatego jest niżej priorytetowa.

**Independent Test**: Można przetestować niezależnie — domyślnie linia prognozy jest rysowana (gdy prognoza jest dostępna); `show_forecast: false` ukrywa linię.

**Acceptance Scenarios**:

1. **Given** `show_forecast: false`, **When** wykres jest renderowany, **Then** linia prognozy nie jest wyświetlana.
2. **Given** `show_forecast` pominięte lub `true` oraz dostępna prognoza i dane dla dzisiejszego dnia, **When** wykres jest renderowany dla trybu rok-do-roku, **Then** widoczna jest przerywana linia od punktu (dzisiejszy dzień, aktualna wartość kumulatywna) do punktu (ostatni dzień roku, prognozowana wartość roczna), w kolorze serii bieżącego okresu.
3. **Given** prognoza włączona wizualnie i brak danych dla dzisiejszego dnia, **When** wykres jest renderowany, **Then** linia prognozy nie jest wyświetlana (brak punktu startowego).
4. **Given** prognoza włączona wizualnie i dzisiejszy dzień jest ostatnim dniem okresu, **When** wykres jest renderowany, **Then** linia prognozy jest punktem lub bardzo krótkim odcinkiem.

---

### User Story 6 – Etykiety jednostek na osiach wykresu (Priority: P6)

Użytkownik chce widzieć jasne opisy jednostek dla obu osi wykresu. Oś pionowa wyświetla jednostkę energii zgodną z jednostką encji (np. kWh), umieszczoną przy najwyższej wartości osi. Oś pozioma wyświetla opis prezentowanego okresu (np. „Marzec" dla miesiąca, „2025" dla roku), jako etykietę osi.

**Why this priority**: Etykiety osi są czytelnie-pomocnicze i nie blokują głównej funkcjonalności wizualizacji danych.

**Independent Test**: Można przetestować niezależnie — weryfikacja obecności etykiety jednostki na osi pionowej i etykiety okresu na osi poziomej.

**Acceptance Scenarios**:

1. **Given** encja z jednostką `kWh`, **When** wykres jest renderowany, **Then** etykieta „kWh" jest widoczna przy najwyższej wartości osi pionowej.
2. **Given** `comparison_preset: year_over_year` dla roku 2025, **When** wykres jest renderowany, **Then** etykieta osi poziomej wyświetla „2025".
3. **Given** `comparison_preset: month_over_month` dla marca 2026, **When** wykres jest renderowany, **Then** etykieta osi poziomej wyświetla „Marzec" (lub lokalizowaną nazwę miesiąca zgodną z ustawieniami języka HA).
4. **Given** encja bez określonej jednostki, **When** wykres jest renderowany, **Then** etykieta osi pionowej jest pusta lub nie jest wyświetlana.

---

### User Story 7 – Ulepszenia wyglądu wykresu (Priority: P7)

Użytkownik chce ogólnych ulepszeń wyglądu wykresu: ograniczenia liczby linii pomocniczych na osi pionowej do 5 (łącznie z linią dla 0), usunięcia pionowych linii pomocniczych (przy zachowaniu ticków i etykiet na osi poziomej) oraz powiększenia wykresu o 45% wysokości.

**Why this priority**: Estetyczne dopracowanie wykresu, niezależne od logiki danych.

**Independent Test**: Można przetestować niezależnie — weryfikacja liczby poziomych linii siatki, braku pionowych linii siatki oraz wysokości obszaru wykresu.

**Acceptance Scenarios**:

1. **Given** dowolna konfiguracja karty, **When** wykres jest renderowany, **Then** na osi pionowej widocznych jest dokładnie 5 wartości/ticków (w tym 0) i 5 poziomych linii pomocniczych.
2. **Given** dowolna konfiguracja karty, **When** wykres jest renderowany, **Then** pionowe linie pomocnicze (siatka pionowa) są niewidoczne, a ticki i etykiety na osi poziomej pozostają.
3. **Given** poprzednia wysokość obszaru wykresu wynosiła H, **When** wykres jest renderowany po tej zmianie, **Then** obszar wykresu jest o 45% wyższy (H × 1,45).

---

### Edge Cases

- Co jeśli badany okres to rok przestępny (366 dni)? → Oś pozioma musi mieć 366 pozycji.
- Co jeśli brakuje danych dla całego okresu jednej z serii? → Seria nie jest rysowana, oś pozioma pozostaje kompletna.
- Co jeśli dzisiejszy dzień wypada poza badanym okresem? → Kropki aktualnego dnia i pionowa linia przerywana nie są wyświetlane; linia prognozy nie jest wyświetlana.
- Co jeśli `primary_color` to wartość `rgba(...)` z własną przezroczystością? → Wypełnienie pod wykresem stosuje skonfigurowane krycie wypełnienia (domyślnie 30%) niezależnie od wartości `primary_color`.
- Co jeśli encja zmienia jednostkę w czasie? → Etykieta osi pionowej wyświetla aktualną jednostkę encji.
- Co jeśli okres to jeden dzień? → Oś pozioma wyświetla jedną pozycję; prognoza jest punktem.
- Co jeśli agregacja to `week` i okres to miesiąc (niepełne tygodnie)? → Oś pozioma wyświetla wszystkie tygodnie, w tym tygodnie częściowe z przełomu okresu.

---

## Requirements *(mandatory)*

### Functional Requirements

**US1 – Pełna oś czasu:**

- **FR-001**: Wykres MUSI wyświetlać na osi poziomej wszystkie jednostki czasu badanego okresu (dni/godziny/tygodnie/miesiące) niezależnie od dostępności danych.
- **FR-002**: Linia wykresu dla serii bieżącego i referencyjnego okresu MUSI przerywać się (gap) w miejscach, gdzie brakuje wartości danych — punkty po obu stronach luki NIE MOGĄ być połączone linią prostą.
- **FR-003**: Zachowanie z FR-001 i FR-002 MUSI działać dla wszystkich wartości agregacji: godzina (`hour`), dzień (`day`), tydzień (`week`), miesiąc (`month`).

**US2 – Podkreślenie aktualnego dnia:**

- **FR-004**: Na serii bieżącego okresu MUSI być wyświetlona wyraźna kropka w punkcie odpowiadającym aktualnemu dniu (o ile istnieją dane dla tego dnia).
- **FR-005**: Na serii referencyjnej MUSI być wyświetlona wyraźna kropka w punkcie odpowiadającym analogicznemu dniu okresu referencyjnego (o ile istnieją dane).
- **FR-006**: Od wartości 0 na osi pionowej do wyższej z dwóch wartości (bieżąca lub referencyjna) MUSI być rysowana pionowa linia przerywana w kolorze serii bieżącego okresu, wskazująca pozycję aktualnego dnia na osi poziomej.

**US3 – Wypełnienie pod wykresem:**

- **FR-007**: Pod linią każdej serii danych MUSI być dostępne półprzezroczyste wypełnienie w kolorze danej serii z konfigurowalnym kryciem; jeśli krycie nie jest skonfigurowane, MUSI wynosić 30%.
- **FR-008**: Widoczność wypełnienia dla serii bieżącego okresu MUSI być kontrolowana flagą logiczną `fill_current` w YAML (domyślnie: `true`).
- **FR-009**: Widoczność wypełnienia dla serii referencyjnej MUSI być kontrolowana flagą logiczną `fill_reference` w YAML (domyślnie: `false`).
- **FR-009a**: Krycie wypełnienia dla serii bieżącego okresu MUSI być konfigurowalne opcją `fill_current_opacity` w YAML (wartość w % w zakresie 0–100; domyślnie: 30).
- **FR-009b**: Krycie wypełnienia dla serii referencyjnej MUSI być konfigurowalne opcją `fill_reference_opacity` w YAML (wartość w % w zakresie 0–100; domyślnie: 30).
- **FR-009c**: Zmiana krycia wypełnienia MUSI wpływać wyłącznie na wypełnienie (nie na krycie linii serii ani innych elementów wykresu).
- **FR-009d**: W przypadku wartości krycia spoza zakresu 0–100 karta MUSI zastosować fallback 30% dla danej serii i kontynuować renderowanie.

**US4 – Kolor głównej serii:**

- **FR-010**: Kolor linii serii bieżącego okresu MUSI być konfigurowalny przez opcję `primary_color` w YAML, przyjmującą wartości w notacji webowej (hex, rgb, rgba, nazwy CSS).
- **FR-011**: Jeśli `primary_color` nie jest podany, kolor MUSI być pobierany z koloru akcentu aktywnego motywu HA.
- **FR-012**: Kolor z `primary_color` MUSI być stosowany do: linii serii, wypełnienia pod serią, kropki aktualnego dnia, pionowej linii przerywanej i linii prognozy.

**US5 – Prognoza zużycia:**

- **FR-013**: Widoczność linii prognozy MUSI być kontrolowana flagą logiczną `show_forecast` w YAML (domyślnie: włączona — brak wartości lub wartość inna niż `false`; jawne `false` ukrywa linię). Alias `forecast` MUSI być traktowany jak `show_forecast` po wczytaniu konfiguracji.
- **FR-014**: Gdy linia prognozy jest włączona zgodnie z FR-013 i prognoza jest dostępna, MUSI być wyświetlana przerywana prosta linia od punktu (aktualny dzień, aktualna wartość kumulatywna) do punktu (ostatni dzień okresu, prognozowana wartość końcowa).
- **FR-015**: Linia prognozy MUSI mieć kolor serii bieżącego okresu (z uwzględnieniem `primary_color`).
- **FR-016**: Linia prognozy NIE MUSI być wyświetlana, gdy brak danych dla aktualnego dnia lub gdy aktualny dzień jest poza badanym okresem.

**US6 – Etykiety osi:**

- **FR-017**: Oś pionowa MUSI wyświetlać etykietę jednostki (np. „kWh") pobraną z jednostki encji HA, umieszczoną przy najwyższej wartości osi.
- **FR-018**: Oś pozioma MUSI wyświetlać etykietę opisującą badany okres — nazwę miesiąca (lokalizowaną) dla trybów miesięcznych lub rok (liczbowo) dla trybów rocznych.

**US7 – Wygląd wykresu:**

- **FR-019**: Oś pionowa MUSI wyświetlać dokładnie 5 ticków/wartości (w tym wartość 0) i dokładnie 5 poziomych linii pomocniczych.
- **FR-020**: Pionowe linie pomocnicze siatki MUSZĄ być wyłączone; ticki i etykiety na osi poziomej MUSZĄ pozostać widoczne.
- **FR-021**: Obszar renderowania wykresu MUSI być o 45% wyższy względem dotychczasowej domyślnej wysokości.

**Aktualizacja dokumentacji:**

- **FR-022**: Plik README MUSI zostać zaktualizowany o opisy wszystkich nowych opcji konfiguracyjnych (`fill_current`, `fill_reference`, `fill_current_opacity`, `fill_reference_opacity`, `primary_color`, `show_forecast`) wraz z ich domyślnymi wartościami.
- **FR-023**: Istniejące sekcje dokumentacji dotyczące wyglądu wykresu MUSZĄ zostać zaktualizowane, by odzwierciedlać nowe zachowania (pełna oś, wypełnienia, linie siatki, wysokość).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Oś pozioma wykresu zawsze wyświetla kompletny zestaw jednostek czasu dla badanego okresu — 0 brakujących pozycji na osi niezależnie od dostępności danych.
- **SC-002**: Użytkownik jest w stanie zlokalizować aktualny dzień na wykresie w czasie poniżej 3 sekund bez konieczności najechania kursorem ani interakcji z legendą.
- **SC-003**: Zmiana koloru serii bieżącego okresu przez opcję `primary_color` jest natychmiast widoczna po przeładowaniu karty — wszystkie powiązane elementy wizualne (linia, wypełnienie, kropka, linia przerywana, prognoza) stosują podany kolor.
- **SC-004**: Każda z opcji konfiguracyjnych związanych z wypełnieniem (`fill_current`, `fill_reference`, `fill_current_opacity`, `fill_reference_opacity`) działa niezależnie — zmiana jednej nie wpływa na stan pozostałych.
- **SC-005**: Wykres renderuje się poprawnie (bez błędów JS, bez pustej karty) dla wszystkich kombinacji nowych opcji konfiguracyjnych.
- **SC-006**: Dokumentacja README zawiera opis wszystkich nowych opcji YAML z przykładowymi wartościami i wyjaśnieniem domyślnych zachowań.

---

## Assumptions

- Kolor akcentu HA jest dostępny jako zmienna CSS motywu w środowisku renderowania karty.
- Prognozowana wartość końcowa jest obliczana przez istniejący mechanizm prognozy karty (liniowe extrapolowanie na podstawie aktualnego tempa zużycia) — niniejsza specyfikacja dotyczy wyłącznie wizualizacji tej wartości, nie algorytmu jej wyznaczania.
- Agregacja `week` dla okresu miesięcznego może generować tygodnie częściowe — oś pozioma wyświetla je zgodnie z bieżącą logiką agregacji.
- Etykieta jednostki na osi pionowej pochodzi z atrybutu `unit_of_measurement` encji HA.
- Lokalizacja nazw miesięcy na osi poziomej jest zgodna z ustawieniami językowym Home Assistant użytkownika.
- Wysokość wykresu jest zwiększana przez modyfikację stylu obszaru canvas/kontenera wykresu, a nie przez zmianę rozmiaru całej karty Lovelace.
