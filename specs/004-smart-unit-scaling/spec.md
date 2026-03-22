# Feature Specification: Inteligentne skalowanie jednostek i formatowanie liczb

**Feature Branch**: `004-smart-unit-scaling`  
**Created**: 2026-03-21  
**Status**: Draft  
**Input**: Dodaj funkcję inteligentnego skalowania jednostek i formatowania liczb. Cel: Użytkownik musi mieć możliwość automatycznego lub ręcznego zmieniania skali jednostek (np. z Wh na kWh, z A na mA), aby wykresy i etykiety były czytelne (uniknięcie "ściany zer").

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Automatyczne skalowanie dla czytelności wykresu (Priority: P1)

Użytkownik ma encję HA z danymi energii w Wh (np. 1500 Wh dziennie). Otwiera kartę Energy Horizon i widzi wykres z wartościami w zakresie tysięcy (np. 1500, 1800, 2000), co powoduje „ścianę zer" — mało czytelne etykiety i trudne odczytanie różnic. Z włączonym trybem automatycznego skalowania karta sama przekształca wartości na odpowiednią skalę (1,5 kWh, 1,8 kWh, 2 kWh), a etykiety na osi Y i w podsumowaniu wyświetlają czytelne liczby z jednostką kWh.

**Why this priority**: Główna wartość funkcji — eliminacja nieczytelnych wykresów przy surowych danych z HA.

**Independent Test**: Konfiguracja karty z encją zwracającą wartości w Wh (np. 1200–5000 Wh), `force_prefix: auto` (lub pominięte) → wartości na wykresie i w podsumowaniu wyświetlają się w kWh (1,2–5 kWh) z zachowaniem spójności jednostek.

**Acceptance Scenarios**:

1. **Given** encja z `unit_of_measurement: "Wh"` i wartościami 1500–3000 Wh, **When** tryb skalowania jest `auto`, **Then** wykres i podsumowanie wyświetlają wartości 1,5–3 kWh z jednostką "kWh"
2. **Given** encja z `unit_of_measurement: "A"` i wartościami 0,05–0,15 A, **When** tryb skalowania jest `auto`, **Then** wartości wyświetlają się jako 50–150 mA z jednostką "mA"
3. **Given** encja z wartościami 500000–800000 Wh, **When** tryb skalowania jest `auto`, **Then** wartości wyświetlają się jako 500–800 kWh z jednostką "kWh"

---

### User Story 2 – Ręczne wymuszenie prefiksu (Priority: P2)

Użytkownik preferuje stałą skalę niezależnie od danych — np. zawsze kWh nawet przy małych wartościach (50 Wh), lub zawsze Wh przy dużych (5000 Wh). W konfiguracji YAML ustawia na poziomie karty `force_prefix: k` (lub `m`, `u`, `M`, `G`). Karta interpretuje konkretny prefiks jako tryb manual i wyświetla wartości w wymuszonej skali.

**Why this priority**: Zapewnia kontrolę użytkownika nad prezentacją; ważne dla spójności raportów i porównań.

**Independent Test**: `force_prefix: k` → encja 500 Wh wyświetla się jako 0,5 kWh; encja 2000 Wh jako 2 kWh.

**Acceptance Scenarios**:

1. **Given** `force_prefix: k`, encja w Wh z wartością 500, **When** karta jest renderowana, **Then** wyświetla się "0,5 kWh"
2. **Given** `force_prefix: m`, encja w A z wartością 1,5, **When** karta jest renderowana, **Then** wyświetla się "1500 mA"
3. **Given** `force_prefix: M`, encja w Wh z wartością 500000, **When** karta jest renderowana, **Then** wyświetla się "0,5 MWh"

---

### User Story 3 – Tryb surowych danych (bez skalowania) (Priority: P2)

Użytkownik chce widzieć dokładnie to, co zwraca Home Assistant — bez żadnej konwersji. Ustawia `force_prefix: none`. Karta wyświetla wartości i jednostki wprost z encji HA.

**Why this priority**: Zapewnia tryb jawnego wyłączenia skalowania dla użytkowników preferujących surowe dane.

**Independent Test**: `force_prefix: none` → wartości i jednostki identyczne z `unit_of_measurement` encji; brak konwersji.

**Acceptance Scenarios**:

1. **Given** `force_prefix: none`, encja z `unit_of_measurement: "Wh"` i wartością 1500, **When** karta jest renderowana, **Then** wyświetla się "1500 Wh"
2. **Given** konfiguracja bez pola `force_prefix` (lub z `force_prefix: auto`), **When** karta jest renderowana, **Then** stosowane jest automatyczne skalowanie SI (`auto`)

---

### User Story 4 – Lokalizowane formatowanie liczb (Priority: P1)

Użytkownik ma ustawioną lokalizację w Home Assistant (np. `pl` z przecinkiem jako separatorem dziesiętnym). Wszystkie wartości liczbowe na karcie (wykres, podsumowanie, prognoza) muszą być sformatowane zgodnie z tą lokalizacją — separatory tysięcy i dziesiętne według preferencji użytkownika.

**Why this priority**: Spójność z resztą interfejsu HA i oczekiwaniami użytkownika co do czytelności liczb.

**Independent Test**: HA z `locale: pl-PL` → liczby z przecinkiem dziesiętnym i spacją jako separatorem tysięcy (np. "1 234,5"); `locale: en-US` → kropka i przecinek (np. "1,234.5").

**Acceptance Scenarios**:

1. **Given** `hass.locale` wskazuje na polską lokalizację, **When** wartość 1234.5 jest formatowana, **Then** wyświetla się zgodnie z konwencją pl (np. "1 234,5")
2. **Given** `hass.locale` wskazuje na lokalizację amerykańską, **When** wartość 1234.5 jest formatowana, **Then** wyświetla się zgodnie z konwencją en-US

---

### User Story 5 – Zachowanie jednostek czasu (Priority: P1)

Użytkownik ma encję z jednostką czasu (h, min, s) — np. sensor czasu pracy urządzenia. Jednostki czasu nie mogą być skalowane (1 h nie staje się 1000 mh). Karta rozpoznaje jednostki czasu i pomija dla nich skalowanie SI.

**Why this priority**: Kryterium akceptacji wymaga, aby jednostki czasu pozostały niezmienione.

**Independent Test**: Encja z `unit_of_measurement: "h"` lub `"min"` lub `"s"` → wartości wyświetlane bez skalowania, niezależnie od trybu.

**Acceptance Scenarios**:

1. **Given** encja z `unit_of_measurement: "h"` i wartością 2.5, **When** tryb skalowania jest `auto`, **Then** wyświetla się "2,5 h" (bez konwersji na min lub ms)
2. **Given** encja z `unit_of_measurement: "min"`, **When** `force_prefix` ma wartość prefiksu (np. k), **Then** jednostki czasu są ignorowane dla skalowania — wartości wyświetlane w oryginalnej jednostce

---

### Edge Cases

- Co gdy `unit_of_measurement` encji jest puste lub nieznane? → Zachowanie jak `force_prefix: none` — wyświetlanie wartości bez skalowania, jednostka pusta lub z encji.
- Co gdy jednostka bazowa nie obsługuje prefiksów SI (np. "%", "°C")? → Brak skalowania; traktowane jak jednostki czasu — wartości wyświetlane w oryginale.
- Co gdy `force_prefix` ma niepoprawną lub nieobsługiwaną wartość? → Fallback do `auto`; zachowanie obronne.
- Co gdy wartość = 0? → Wyświetlanie "0" z wybraną jednostką; skala zgodna z kontekstem serii.
- Co gdy max serii = 0 lub seria pusta (brak wartości)? → Jednostka bazowa z encji (bez prefiksu); wyświetl 0 w oryginalnej jednostce.
- Granice skalowania (1000, 1): ≥1000 → skala w górę (1000 Wh → 1 kWh); <1 → skala w dół (0,5 A → 500 mA). Zgodne ze standardem SI.
- Co gdy wartości w serii mieszają się w zakresach (np. 0,5 Wh i 5000 Wh)? → Skala wybierana na podstawie maksimum serii — zapewnia czytelność osi (max mieści się w zakresie).
- Co gdy `precision` jest ustawione w konfiguracji karty? → Używane do formatowania liczb (wykres, podsumowanie, tooltip); brak pola → sensowna wartość domyślna w implementacji (np. 2 miejsca dziesiętne).
- Co gdy `unit_of_measurement` ma już prefiks (kWh, mA, MWh)? → System parsuje na bazę + prefiks; dopuszcza dalsze skalowanie (np. 5000 kWh → 5 MWh).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUSI obsługiwać prefiksy SI: µ (jako 'u' w konfiguracji), m, k, M, G z mnożnikiem 1000 między kolejnymi poziomami.
- **FR-002**: System MUSI udostępniać tryb `auto` (domyślny): automatyczny wybór prefiksu na podstawie maksimum serii. Granice zgodne ze standardową konwencją SI: wartość ≥ 1000 → przesunięcie w górę (k, M, G); wartość < 1 → przesunięcie w dół (m, µ). Gdy max = 0 lub seria pusta — jednostka bazowa bez prefiksu.
- **FR-003**: Gdy `force_prefix` ma wartość prefiksu (u, m, k, M, G), system MUSI traktować to jako tryb manual — wartość konwertowana do wskazanej skali.
- **FR-004**: Gdy `force_prefix: none`, system MUSI wyświetlać surowe wartości z encji HA bez skalowania.
- **FR-005**: Jednostka bazowa MUSI być pobierana z atrybutu encji `unit_of_measurement`.
- **FR-006**: Nowa etykieta jednostki po skalowaniu MUSI być złączeniem prefiksu i jednostki bazowej (np. 'k' + 'Wh' = 'kWh').
- **FR-007**: Formatowanie liczb (separatory dziesiętne i tysięcy) MUSI używać standardu zależnego od lokalizacji użytkownika, zasilanego przez lokalizację z obiektu HA (`hass.locale` lub równoważne), z zachowaniem zgodności z istniejącą opcją `number_format` karty.
- **FR-008**: Konfiguracja YAML karty MUSI udostępniać **płaskie** pola na poziomie głównym: opcjonalne `force_prefix`: `"auto"` | `"none"` | `"u"` | `"m"` | `"k"` | `"M"` | `"G"` oraz opcjonalne `precision` (liczba miejsc dziesiętnych). Wartość `auto` lub brak `force_prefix` = automatyczny wybór prefiksu; `none` = surowe dane; konkretny prefiks = wymuszenie skali (tryb manual). Brak pola `mode` — `force_prefix` steruje zachowaniem skalowania.
- **FR-009**: Jednostki czasu (h, min, s) NIE MOGĄ być skalowane — muszą być wyświetlane w oryginalnej formie niezależnie od trybu.
- **FR-010**: Etykiety na osiach wykresu MUSZĄ być spójne ze skalą wybraną dla wartości głównej (ta sama jednostka na osi Y i w podsumowaniu).
- **FR-011**: Logika skalowania MUSI być wydzielona do czystej funkcji pomocniczej (utility), łatwej do testowania jednostkowego.
- **FR-012**: Gdy jednostka nie obsługuje prefiksów SI (np. %, °C, h, min, s), system MUSI pomijać skalowanie i wyświetlać wartości w oryginale.
- **FR-013**: Gdy `unit_of_measurement` zawiera już prefiks SI (np. kWh, mA, MWh), system MUSI parsować jednostkę na bazę + prefiks (np. "kWh" → baza "Wh", prefiks "k") i dopuszczać dalsze skalowanie (np. 5000 kWh → 5 MWh).

### Key Entities

- **unit_of_measurement**: Atrybut encji HA określający jednostkę bazową (np. Wh, A, V, h).
- **CardConfig (fragment)**: `force_prefix` (auto | none | u | m | k | M | G) steruje skalowaniem; opcjonalne `precision` formatuje liczby — oba pola na poziomie głównym karty YAML.
- **ScaledValue**: Wynik skalowania — wartość liczbową w nowej skali oraz etykieta jednostki (prefiks + jednostka bazowa).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Użytkownik widzi czytelne wykresy — wartości w zakresie 0,1–1000 (lub odpowiednik) zamiast „ściany zer" — weryfikowalne przez porównanie przed/po na encjach z Wh, mA itd.
- **SC-002**: Jednostki czasu (h, min, s) są wyświetlane bez zmian; brak błędów formatowania — weryfikowalne przez testy jednostkowe i manualne.
- **SC-003**: Etykiety osi Y i wartości w podsumowaniu używają tej samej jednostki dla danej serii — weryfikowalne przez przegląd UI.
- **SC-004**: Logika skalowania jest w pełni zweryfikowalna — każdy scenariusz akceptacji ma odpowiadający powtarzalny przypadek weryfikacyjny.
- **SC-005**: Formatowanie liczb jest zgodne z lokalizacją HA — użytkownik z locale pl widzi przecinek dziesiętny, z en-US — kropkę.
- **SC-006**: Pominięcie opcjonalnego `force_prefix` w YAML nie powoduje błędów — stosowany jest tryb `auto` (automatyczne skalowanie).

## Assumptions

- Atrybut `unit_of_measurement` encji HA jest dostępny synchronicznie w `hass.states[entity].attributes`.
- Istniejąca opcja `number_format` i mechanizm `resolveLocale` / `numberFormatToLocale` pozostają źródłem locale dla formatowania liczb (zgodne z HA); nowa funkcja skalowania korzysta z tego samego mechanizmu. HA nie definiuje jawnie progów skalowania jednostek — stosujemy standardową konwencję SI (≥1000, <1).
- Jednostki energii (Wh, kWh, MWh itd.) i prądu (A, mA) są priorytetowe; jednostki czasu (h, min, s) są wyłączone z skalowania.
- Domyślne zachowanie odpowiada `force_prefix: auto` — brak pola `force_prefix` w YAML oznacza automatyczny wybór prefiksu. Użytkownik może ustawić `force_prefix: none`, aby wyłączyć skalowanie i pokazać surowe dane z encji.
- Reprezentatywna wartość dla wyboru skali w trybie auto: maksimum serii (gwarantuje czytelność osi i brak przepełnienia).

## Clarifications

### Session 2026-03-21

- Q: Encja ma już prefiks w jednostce (kWh, mA) — jak traktować? → A: Parsuj prefiks: "kWh" → baza "Wh" + prefiks "k"; możliwe dalsze skalowanie (np. 5000 kWh → 5 MWh).
- Q: Tryb manual bez force_prefix / fallback? → A: Uproszczenie konfiguracji — `force_prefix` przyjmuje wartości `auto`, `none` lub konkretny prefiks (u, m, k, M, G); prefiks = tryb manual. Rezygnujemy z pola `mode` — jedno pole steruje zachowaniem.
- Q: Przy mieszanych wartościach w serii — którą wartość reprezentatywną użyć do wyboru prefiksu? → A: Maksimum serii.
- Q: Wartości na granicy (1000, 1) — skalować czy nie? → A: Zastosować standardową konwencję SI, zgodną z praktyką inżynierską (HA nie definiuje tego jawnie): ≥1000 → skala w górę, <1 → skala w dół. Formatowanie liczb — Intl.NumberFormat z locale z HA (`hass.locale` / `number_format`).
- Q: Seria z max=0 lub pusta — jaką skalę/jednostkę? → A: Jednostka bazowa z encji (bez prefiksu); wyświetl 0 w oryginalnej jednostce.
