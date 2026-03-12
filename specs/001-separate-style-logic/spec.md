# Feature Specification: Odseparowanie warstwy wizualnej od logiki karty

**Feature Branch**: `001-separate-style-logic`  
**Created**: 2026-03-10  
**Status**: Draft  
**Input**: User description: "Dodaj do obecnej specyfikacji nowy wymóg architektoniczny: odseparowanie warstwy wizualnej (stylów) od logiki aplikacji. Z perspektywy programisty chcę mieć możliwość edycji wyglądu i kolorystyki karty w dedykowanym pliku ze stylami, aby móc łatwo modyfikować motywy wizualne bez ryzyka uszkodzenia logiki pobierającej i obliczającej dane. Kryteria akceptacji: 1. Style (CSS) karty są wydzielone do osobnego pliku (np. styles.ts). 2. Główny plik karty importuje te style. 3. Struktura HTML (layout) w głównym pliku jest czytelna i używa logicznych klas CSS tak aby również można było ją łatwo zedytować ręcznie. 4. Logika działania karty pozostaje nienaruszona."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Programista chce łatwo zmieniać wygląd karty (Priority: P1)

Jako **programista/autor motywu** chcę móc zmieniać wygląd i kolorystykę karty (`Energy Burndown Card`) w jednym, dedykowanym pliku ze stylami (np. `styles.ts`), tak aby nie musieć dotykać logiki pobierającej oraz przetwarzającej dane.

**Why this priority**: To najważniejszy scenariusz – pozwala wprowadzać zmiany wizualne bez ryzyka zepsucia logiki biznesowej oraz ułatwia tworzenie/utrzymanie motywów.

**Independent Test**: Tester edytuje tylko plik stylów (np. kolory, marginesy, rozmiary czcionek), uruchamia kartę i potwierdza, że:
- wygląd karty się zmienił zgodnie ze zmianami w stylach,
- logika działania (pobieranie danych, obliczenia, wykres, statystyki) działa bez zmian.

**Acceptance Scenarios**:

1. **Given** działająca karta z domyślnym wyglądem, **When** tester zmienia kolorystykę w dedykowanym pliku stylów, **Then** karta renderuje się z nowymi kolorami bez błędów w konsoli i bez zmian w logice obliczeń.
2. **Given** programista usuwa/komentuje wybrane reguły stylów, **When** karta jest odświeżana, **Then** zmienia się jedynie layout/typografia/kolory, a wszystkie dane, wykres i tekstowe podsumowania nadal są poprawnie wyświetlane.

---

### User Story 2 - Programista chce łatwo zrozumieć strukturę HTML (Priority: P2)

Jako **programista/kontrybutor** chcę widzieć w głównym pliku karty czytelny, logiczny layout HTML z klasami CSS o zrozumiałych nazwach, aby móc szybko odnaleźć fragmenty odpowiedzialne za nagłówek, statystyki i wykres oraz je modyfikować.

**Why this priority**: Czytelna struktura HTML i nazewnictwo klas przyspieszają pracę nad layoutem, ułatwiają code review i zmniejszają ryzyko wprowadzania błędów podczas modyfikacji wyglądu.

**Independent Test**: Tester otwiera główny plik karty, przegląda strukturę HTML oraz nazwy klas i w oparciu o samą strukturę (bez znajomości logiki) jest w stanie wskazać, które fragmenty odpowiadają za: nagłówek, sekcję statystyk, sekcję prognozy, obszar wykresu.

**Acceptance Scenarios**:

1. **Given** nowy programista, który nie zna projektu, **When** otwiera główny plik karty, **Then** na podstawie nazw klas (np. `.ebc-header`, `.ebc-stats`, `.ebc-chart`) jest w stanie wskazać, gdzie zaczyna się i kończy każda główna sekcja layoutu.
2. **Given** istniejąca karta, **When** programista chce przenieść sekcję prognozy nad wykres, **Then** może to zrobić, edytując tylko strukturę HTML (przenosząc odpowiedni blok) bez konieczności dotykania logiki obliczeń.

---

### User Story 3 - Utrzymanie logiki karty niezależnie od stylów (Priority: P3)

Jako **opiekun projektu** chcę, aby logika pobierania danych i obliczania statystyk/wykresu była utrzymywana w oddzielnych plikach od stylów, tak aby refaktoryzacja logiki nie wymagała zmian w warstwie wizualnej (i odwrotnie).

**Why this priority**: Rozdzielenie odpowiedzialności ułatwia rozwój zarówno logiki, jak i wyglądu, zmniejsza liczbę konfliktów przy pracy zespołowej oraz ogranicza ryzyko regresji.

**Independent Test**: Tester wprowadza zmianę w logice (np. zmiana sposobu formatowania danych wejściowych lub nowa metoda prognozy) i potwierdza, że nie trzeba modyfikować dedykowanego pliku stylów, a layout karty pozostaje niezmieniony.

**Acceptance Scenarios**:

1. **Given** zmiana w logice obliczania prognozy (np. nowy algorytm), **When** modyfikowany jest tylko kod logiki, **Then** plik stylów nie wymaga zmian, a karta dalej renderuje się poprawnie z dotychczasowym wyglądem.
2. **Given** potrzeba dodania nowej klasy wizualnej (np. wyróżnienie „oszczędny miesiąc”), **When** zmieniany jest tylko plik stylów i ewentualnie klasy w strukturze HTML, **Then** logika przetwarzania danych pozostaje nienaruszona.

---

### Edge Cases

- Co się dzieje, gdy plik stylów nie zostanie załadowany (błąd ścieżki, brak importu)?  
  - Karta powinna nadal poprawnie działać logicznie (dane, wykres, statystyki), mimo że wygląd może być zdegradowany do domyślnego.
- Jak zachowuje się karta, gdy programista doda lub usunie klasy CSS, ale nie zaktualizuje odpowiadających im reguł w pliku stylów?  
  - Karta nie powinna się wykrzaczyć – brakujące style nie mogą wpływać na poprawność logiki.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Specyfikacja karty MUSI definiować, że style (CSS) karty są wydzielone do dedykowanego pliku z warstwą wizualną (np. `styles.ts` lub równoważny plik stylów).
- **FR-002**: Główny plik karty MUSI importować dedykowany plik stylów zamiast definiować rozbudowane style inline lub mieszane z logiką.
- **FR-003**: Struktura HTML w głównym pliku karty MUSI być zorganizowana w logiczne sekcje (nagłówek, statystyki, prognoza, wykres) z czytelnymi, spójnymi klasami CSS.
- **FR-004**: Logika pobierania danych, przetwarzania statystyk i generowania serii do wykresu NIE MOŻE zależeć bezpośrednio od konkretnej implementacji stylów (np. brak odwołań do klas CSS w kodzie obliczeń).
- **FR-005**: Zmiany w pliku stylów (np. kolory, marginesy, typografia) NIE MOGĄ wymuszać zmian w logice pobierania i przetwarzania danych.

### Key Entities *(include if feature involves data)*

- **Warstwa stylów karty**: Zestaw reguł CSS/TS odpowiedzialnych wyłącznie za kolory, typografię, spacing, layout i stany wizualne elementów karty.
- **Główny komponent karty**: Struktura HTML (layout) i logika odpowiedzialna za pobieranie danych, obliczenia, generowanie wykresu i tekstowych podsumowań, korzystająca z klas CSS, ale nie implementująca samych stylów.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nowy programista jest w stanie w ciągu maksymalnie 15 minut zlokalizować i zmodyfikować podstawowe kolory karty, dotykając wyłącznie dedykowanego pliku stylów (bez otwierania plików z logiką).
- **SC-002**: Zmiana algorytmu obliczania prognozy lub statystyk wymaga modyfikacji jedynie w plikach logiki – bez zmian w pliku stylów – w co najmniej 95% typowych przypadków refaktoryzacji.
- **SC-003**: Code review dla zmian wyłącznie wizualnych (np. nowy motyw kolorystyczny) pokazuje, że wszystkie zmiany są ograniczone do pliku stylów oraz ewentualnie drobnych zmian w strukturze HTML (bez zmian w kodzie obliczeń).
- **SC-004**: W przypadku celowego usunięcia lub wyłączenia pliku stylów karta wciąż poprawnie pobiera dane, liczy statystyki i renderuje wykres, a wszelkie regresje mają charakter wyłącznie wizualny.
