# Tasks: Theming HA i semantyczne klasy karty

**Input**: Design documents from `specs/001-ha-theming-classes/`  
**Prerequisites**: `plan.md`, `spec.md` (user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3 – mapuje zadanie do konkretnej user story

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Przygotowanie środowiska developerskiego i bazowej struktury dla pracy nad themingiem i klasami.

- [X] T001 Upewnić się, że branch `001-ha-theming-classes` jest aktywny (git checkout 001-ha-theming-classes)
- [X] T002 [P] Zweryfikować, że `npm install` przechodzi bez błędów w katalogu głównym projektu
- [X] T003 [P] Uruchomić `npm run build` w celu potwierdzenia, że obecny kod karty buduje się poprawnie

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ustalenie wspólnej bazy stylów i klasyfikacji elementów karty, z której korzystają wszystkie user stories.

**⚠️ CRITICAL**: Zakończ przed rozpoczęciem prac nad US1–US3.

- [X] T004 Zaprojektować listę docelowych klas CSS dla głównych sekcji karty (nagłówek, statystyki, prognoza, wykres, kontener) i udokumentować ją w `specs/001-ha-theming-classes/data-model.md`
- [X] T005 [P] Zidentyfikować istniejące elementy DOM i klasy w `src/card/cumulative-comparison-chart.ts` oraz `src/card/chart-renderer.ts` (mapa: obecne → docelowe klasy)
- [X] T006 [P] Zidentyfikować zestaw zmiennych themingu HA (CSS custom properties) wykorzystywanych przez inne karty/HA, które będą bazą kolorystyki (spisać w `specs/001-ha-theming-classes/research.md`)

**Checkpoint**: Wiadomo, jakie klasy i zmienne themingu będą używane w dalszych fazach.

---

## Phase 3: User Story 1 – Karta automatycznie dopasowuje się do motywu HA (Priority: P1) 🎯 MVP

**Goal**: Karta automatycznie przejmuje kolory z motywów HA (jasny/ciemny) z zachowaniem czytelności tekstu i wykresu.

**Independent Test**: Przełączanie motywu HA (jasny/ciemny) powoduje poprawną zmianę kolorów tła, tekstu i wykresu bez utraty kontrastu, bez potrzeby dodatkowej konfiguracji karty.

### Implementation for User Story 1

- [X] T007 [P] [US1] Zdefiniować mapę używanych zmiennych HA (np. `--primary-text-color`, `--primary-background-color`) w `specs/001-ha-theming-classes/research.md`
- [X] T008 [P] [US1] Dodać/rozszerzyć moduł stylów karty w `src/card` tak, aby główne kolory (tło, tekst, akcenty) były powiązane z CSS variables HA
- [X] T009 [US1] Zastosować nowe style themingowe w `src/card/cumulative-comparison-chart.ts` (kontener karty, nagłówek, sekcje), tak aby korzystały z CSS variables zamiast stałych kolorów
- [X] T010 [US1] Zaktualizować kolory linii i tła wykresu w `src/card/chart-renderer.ts`, aby były spójne z motywem i zapewniały czytelność w trybie jasnym/ciemnym
- [X] T011 [US1] Ręcznie przetestować kartę w co najmniej 5 motywach HA (w tym domyślny jasny/ciemny) i udokumentować obserwacje w `specs/001-ha-theming-classes/quickstart.md` (sekcja testowania themingu)

**Checkpoint**: Karta wygląda poprawnie i jest czytelna w jasnym oraz ciemnym motywie HA.

---

## Phase 4: User Story 2 – Użytkownik zaawansowany łatwo modyfikuje wygląd przez zewnętrzne dodatki (Priority: P2)

**Goal**: Użytkownicy mogą wygodnie ukrywać/przeskalować sekcje karty za pomocą zewnętrznych narzędzi (np. Card‑Mod) dzięki prostym, semantycznym klasom CSS.

**Independent Test**: Użytkownik, znając jedynie nazwy klas z dokumentacji/inspektora DOM, jest w stanie ukryć lub zmienić rozmiar sekcji karty bez modyfikowania kodu karty.

### Implementation for User Story 2

- [X] T012 [P] [US2] Nadać/prozaktualizować klasy CSS głównych sekcji w `src/card/cumulative-comparison-chart.ts` (np. `.ebc-card`, `.ebc-header`, `.ebc-stats`, `.ebc-forecast`, `.ebc-chart`) zgodnie z ustaloną mapą
- [X] T013 [P] [US2] Upewnić się, że element `<canvas>`/kontener wykresu w `src/card/chart-renderer.ts` posiada stabilną, semantyczną klasę pozwalającą na manipulację wysokością/marginesami
- [X] T014 [US2] Utworzyć przykładowe fragmenty konfiguracji zewnętrznych stylów (np. Card‑Mod) w `specs/001-ha-theming-classes/contracts/classes-contract.md`, pokazując, jak ukryć sekcję prognozy i zmienić wysokość wykresu
- [X] T015 [US2] Zweryfikować w przeglądarce (inspektor DOM), że struktura klas i hierarchia są czytelne oraz stabilne przy odświeżeniu karty i zmianie motywu

**Checkpoint**: Zaawansowany użytkownik, dysponując klasami, może modyfikować layout sekcji bez dotykania logiki TypeScript.

---

## Phase 5: User Story 3 – Spójne semantyczne nazewnictwo ułatwia rozwój i wsparcie (Priority: P3)

**Goal**: Klasy CSS są spójne, semantyczne i zrozumiałe dla nowych kontrybutorów projektu.

**Independent Test**: Nowy kontrybutor, patrząc jedynie na listę klas oraz DOM, jest w stanie poprawnie wskazać, do jakich sekcji karty należą poszczególne klasy.

### Implementation for User Story 3

- [X] T016 [P] [US3] Przejrzeć wszystkie istniejące klasy CSS w strukturze karty (DOM + moduł stylów) i zidentyfikować nazwy nie‑semantyczne lub mylące (lista w `specs/001-ha-theming-classes/research.md`)
- [X] T017 [US3] Wprowadzić spójny schemat nazewnictwa klas (prefiks, np. `.ebc-`, plus rola sekcji) w `src/card/cumulative-comparison-chart.ts` i powiązanych stylach
- [X] T018 [US3] Zaktualizować dokumentację w `specs/001-ha-theming-classes/quickstart.md`, dodając tabelę „Mapa sekcji karty → klasy CSS → zastosowanie”
- [X] T019 [US3] Przeprowadzić szybki code review samych klas i mapy w zespole (lub wewnętrznie), nanosząc ewentualne poprawki wynikające z feedbacku

**Checkpoint**: Nazewnictwo klas jest spójne, opisane i gotowe na wsparcie społeczności oraz dalszy rozwój.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Dopracowanie dokumentacji, testów i dostępności związanej z themingiem i klasami.

- [X] T020 [P] Zaktualizować `README.md` o sekcję „Theming i klasy CSS” z krótkimi przykładami użycia
- [X] T021 [P] Dodać lub zaktualizować testy regresyjne (jeśli istnieją) sprawdzające poprawność klas/nazw sekcji w `tests/` (np. snapshot DOM lub prosty test struktury)
- [X] T022 Zweryfikować kontrast kolorów dla jasnego/ciemnego motywu przy pomocy wybranego narzędzia (ręcznie lub automatycznie) i zanotować wynik w `specs/001-ha-theming-classes/research.md`
- [X] T023 Wykonać finalny build (`npm run build`) i krótkie manualne smoke‑testy karty w HA z zastosowanymi zmianami themingu i klas

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 – Setup**: Brak zależności – może być wykonana od razu.  
- **Phase 2 – Foundational**: Zależy na Phase 1 – blokuje wszystkie user stories.  
- **Phase 3–5 – User Stories (US1–US3)**: Wymagają zakończenia Phase 2; US2 i US3 mogą być realizowane równolegle po ukończeniu US1 (lub niezależnie, jeśli zespół jest większy).  
- **Phase 6 – Polish**: Zależy od ukończenia wszystkich istotnych dla MVP user stories (co najmniej US1, opcjonalnie US2–US3).

### Parallel Opportunities

- Zadania oznaczone `[P]` w Phase 1–2 mogą być wykonywane równolegle (różne pliki, brak bezpośrednich zależności).  
- W ramach US2 i US3 zadania `[P]` mogą być rozdzielone pomiędzy różnych kontrybutorów (np. praca nad klasami w DOM i dokumentacją równolegle).  
- US2 i US3 mogą być realizowane w tym samym czasie po zakończeniu fundamentów (Phase 2) i podstawowego themingu (US1), o ile nie modyfikują tych samych fragmentów plików.

### MVP Scope

- Minimalne **MVP** dla tej funkcji to zakończenie **US1** (Phase 3): karta automatycznie i poprawnie reaguje na motyw HA (jasny/ciemny) z zachowaniem czytelności.  
- US2 i US3 rozszerzają ergonomię dla zaawansowanych użytkowników i kontrybutorów, ale nie są wymagane, aby karta była użyteczna z punktu widzenia podstawowego themingu.

