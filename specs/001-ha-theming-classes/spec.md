# Feature Specification: Theming HA i semantyczne klasy karty

**Feature Branch**: `001-ha-theming-classes`  
**Created**: 2026-03-10  
**Status**: Draft  
**Input**: User description: "1. Karta powinna reagować na zmienne Home Assistanta (Theming) i dostosowywać się do podstawowych motywów HA (jasnego i ciemnego), tak aby wszystkie informacje i wykresy były czytelne dla użytkownika. W szczególności kolory stylistyki powinny dostosowywać się do aktualnego motywu HA.

2. Nazwy klas styli powinny być proste i semantyczne. Użytkownicy uwielbiają używać dodatku Card-Mod do ukrywania elementów lub zmiany ich wielkości. Dobre deskryptywne nazwy klas im to ułatwią."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Karta automatycznie dopasowuje się do motywu HA (Priority: P1)

Jako **użytkownik Home Assistanta** chcę, aby karta automatycznie dopasowywała kolory tła, tekstu i wykresu do aktualnego motywu (jasnego lub ciemnego), tak aby wszystkie informacje były zawsze czytelne.

**Why this priority**: Czytelność danych energetycznych w różnych motywach interfejsu jest kluczowa; niewłaściwy kontrast może całkowicie zniwelować użyteczność karty.

**Independent Test**: Tester przełącza interfejs HA między motywem jasnym i ciemnym, obserwuje kartę i sprawdza, czy tekst, ikony, wykres i wyróżnienia pozostają czytelne bez dodatkowej konfiguracji ze strony użytkownika.

**Acceptance Scenarios**:

1. **Given** aktywny motyw jasny w HA, **When** karta jest wyświetlana na dashboardzie, **Then** tekst, tło i linie wykresu mają wystarczający kontrast, a wszystkie kluczowe informacje są łatwo czytelne.
2. **Given** aktywny motyw ciemny w HA, **When** użytkownik przełącza dashboard na widok nocny, **Then** karta automatycznie zmienia kolory tak, aby nie oślepiać użytkownika i utrzymywać czytelność (brak „znikającego” tekstu lub linii wykresu).

---

### User Story 2 - Użytkownik zaawansowany łatwo modyfikuje wygląd przez zewnętrzne dodatki (Priority: P2)

Jako **zaawansowany użytkownik/autor motywów** chcę, aby elementy karty miały proste, semantyczne nazwy klas CSS, dzięki czemu mogę szybko ukrywać, skalować lub stylować wybrane części karty przy użyciu narzędzi takich jak dodatki do modyfikacji kart (np. Card-Mod).

**Why this priority**: Ułatwia zaawansowane dostosowanie karty bez modyfikacji kodu źródłowego – popularny sposób używania kart w społeczności HA.

**Independent Test**: Tester bez znajomości wnętrza implementacji używa zewnętrznych narzędzi do nadpisywania stylów, odwołując się wyłącznie do klas CSS karty, i jest w stanie ukryć lub przeskalować wybrane sekcje.

**Acceptance Scenarios**:

1. **Given** dokumentacja lub inspektor DOM pokazujący klasy elementów karty, **When** użytkownik stosuje regułę stylu odwołującą się do klasy odpowiadającej sekcji wykresu, **Then** może zmienić wysokość lub margines wykresu bez dotykania logiki karty.
2. **Given** użytkownik chce ukryć sekcję prognozy, **When** stosuje regułę stylu dla klasy odpowiadającej tej sekcji, **Then** sekcja ta znika z widoku, a pozostałe elementy nadal działają poprawnie.

---

### User Story 3 - Spójne semantyczne nazewnictwo ułatwia rozwój i wsparcie (Priority: P3)

Jako **opiekun projektu i recenzent PR** chcę, aby wszystkie główne elementy karty miały spójne i semantyczne nazwy klas (np. odwołujące się do pełnionej funkcji, a nie detali wizualnych), tak aby łatwiej było utrzymać kartę i dokumentować sposoby jej rozszerzania.

**Why this priority**: Dobre nazewnictwo zmniejsza koszt poznawczy współpracy, ułatwia wsparcie społeczności i zmniejsza ryzyko wprowadzenia łamiących zmian w wyglądzie.

**Independent Test**: Tester przegląda strukturę DOM karty, oceniając, czy nazwy klas odzwierciedlają funkcję sekcji (np. nagłówek, statystyki, wykres, stopka) i nie są powiązane z przypadkowymi szczegółami wyglądu (np. konkretnym kolorem).

**Acceptance Scenarios**:

1. **Given** lista klas CSS użytych w karcie, **When** nowy kontrybutor czyta ich nazwy, **Then** potrafi bez dodatkowego kontekstu powiedzieć, które odpowiadają za nagłówek, które za sekcję statystyk, a które za wykres.
2. **Given** potrzeba dodania nowego elementu (np. wskaźnik trendu), **When** tworzona jest nowa klasa, **Then** jej nazwa jest spójna z istniejącym schematem (semantyczna, niepowiązana z konkretnym kolorem czy rozmiarem).

---

### Edge Cases

- Co się dzieje, gdy motyw HA zostanie zmieniony dynamicznie (np. automatyczne przejście dzień/noc) w trakcie otwartego dashboardu?  
  - Karta powinna w rozsądnym czasie odświeżyć swoje kolory tak, aby zachować czytelność bez konieczności ręcznego przeładowania strony.
- Jak zachowuje się karta, gdy niestandardowy motyw HA używa bardzo nietypowych kolorów (np. skrajnie niski kontrast)?  
  - Karta nie powinna być odpowiedzialna za korektę całego motywu, ale powinna minimalizować ryzyko nieczytelności (np. nie opierać się na jednym kolorze dla tekstu i linii wykresu).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Specyfikacja karty MUSI wymagać, aby karta reagowała na systemowy mechanizm motywów (co najmniej jasny/ciemny), tak aby kolory tła, tekstu i wykresu dostosowywały się do aktywnego motywu.
- **FR-002**: Wszystkie kluczowe elementy informacyjne karty (nagłówki, wartości liczbowe, linie wykresu) MUSZĄ zachowywać wystarczający kontrast wizualny zarówno w motywie jasnym, jak i ciemnym.
- **FR-003**: Główne sekcje karty (np. kontener karty, nagłówek, sekcja statystyk, sekcja prognozy, obszar wykresu) MUSZĄ posiadać proste, semantyczne nazwy klas CSS odzwierciedlające ich funkcję.
- **FR-004**: Nazwy klas stylów NIE MOGĄ być uzależnione od szczegółów stylistycznych (np. konkretnego koloru czy rozmiaru), aby umożliwić ich stabilne użycie przez zewnętrzne narzędzia do nadpisywania stylów.
- **FR-005**: Użytkownik zaawansowany powinien móc ukryć lub przeskalować główne sekcje karty, odwołując się jedynie do nazw klas CSS, bez konieczności modyfikowania kodu logiki.

### Key Entities *(include if feature involves data)*

- **Motyw interfejsu**: Zestaw globalnych ustawień kolorystycznych i typograficznych, z którego karta korzysta, aby dobrać odpowiednie kolory tła, tekstu i wizualizacji.
- **Semantyczne klasy karty**: Nazwane grupy elementów wizualnych w strukturze DOM karty, pozwalające identyfikować sekcje według ich roli (np. nagłówek, statystyki, wykres), a nie według szczegółów wyglądu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: W testach użytkownik przełączający motyw HA (jasny/ciemny) w co najmniej 5 różnych motywach nie zgłasza problemów z czytelnością kluczowych informacji na karcie (0 krytycznych zgłoszeń dotyczących braku kontrastu).
- **SC-002**: Nowy zaawansowany użytkownik jest w stanie w ciągu maksymalnie 10 minut, przy użyciu wyłącznie zewnętrznych reguł stylów, ukryć jedną z głównych sekcji karty (np. prognozę) bazując na jej klasie CSS.
- **SC-003**: Co najmniej 90% nazw klas głównych elementów karty, ocenianych w przeglądzie projektu, jest rozumiana jako „oczywista” (semantyczna) przez dwóch niezależnych recenzentów bez dodatkowych wyjaśnień.
- **SC-004**: Zmiana motywu HA (jasny/ciemny) nie wymaga żadnych zmian konfiguracyjnych w samej karcie – użytkownik otrzymuje poprawnie wystylizowaną kartę po przeładowaniu widoku lub automatycznym odświeżeniu.
