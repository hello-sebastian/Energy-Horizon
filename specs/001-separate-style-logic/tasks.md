# Tasks: Separacja warstwy stylów od logiki karty

**Input**: Design documents from `specs/001-separate-style-logic/`  
**Prerequisites**: `spec.md` (user stories, FR-001–FR-005)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3 – mapuje zadanie do konkretnej user story

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Upewnienie się, że środowisko jest gotowe do refaktoryzacji struktury stylów karty.

- [X] T001 Zweryfikować, że aktywny jest branch `001-separate-style-logic` (np. `git checkout 001-separate-style-logic`)
- [X] T002 [P] Upewnić się, że `npm install` w katalogu głównym projektu kończy się bez błędów
- [X] T003 [P] Uruchomić `npm run build`, aby potwierdzić, że obecny kod karty buduje się poprawnie przed zmianami

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zdefiniowanie docelowej architektury podziału stylów i logiki, zgodnie z FR-001–FR-005.

**⚠️ CRITICAL**: Zakończ przed rozpoczęciem prac nad US1–US3.

- [X] T004 Przeanalizować aktualną strukturę karty w `src/card/cumulative-comparison-chart.ts` (w tym `static styles` i `render()`), identyfikując, które części dotyczą wyłącznie wyglądu
- [X] T005 [P] Zaprojektować docelowy moduł stylów karty (nazwa, eksporty) i udokumentować krótko założenia w `specs/001-separate-style-logic/spec.md` (sekcja „Requirements” / „Key Entities”)
- [X] T006 [P] Określić listę plików, które powinny zawierać wyłącznie logikę (np. `src/card/cumulative-comparison-chart.ts`, `src/card/ha-api.ts`, `src/card/chart-renderer.ts`) i potwierdzić, że nie będą one bezpośrednio implementować styli (tylko używać klas / struktur HTML)

**Checkpoint**: Wiadomo, które części kodu są odpowiedzialne za styl, a które za logikę, oraz jak będzie wyglądał docelowy moduł stylów.

---

## Phase 3: User Story 1 – Dedykowany plik stylów dla karty (Priority: P1) 🎯 MVP

**Goal**: Programista może zmieniać wygląd i kolorystykę karty w jednym, dedykowanym pliku stylów bez dotykania logiki.

**Independent Test**: Tester zmienia tylko plik stylów (np. kolory, marginesy) i potwierdza, że karta zmienia wygląd, podczas gdy logika pobierania danych, obliczeń i wykresu działa bez zmian.

### Implementation for User Story 1

- [X] T007 [P] [US1] Utworzyć nowy moduł stylów karty w `src/card/energy-burndown-card-styles.ts` z eksportem zawierającym dotychczasowe style karty
- [X] T008 [P] [US1] Przenieść wszystkie deklaracje stylów z `src/card/cumulative-comparison-chart.ts` (np. `static styles = css\`...\``) do `src/card/energy-burndown-card-styles.ts`, pozostawiając w głównym komponencie wyłącznie import stylów
- [X] T009 [US1] Zaktualizować `src/card/cumulative-comparison-chart.ts`, aby importował styl z `src/card/energy-burndown-card-styles.ts` i używał go jako `static styles`, bez dodatkowych inline‑styli
- [X] T010 [US1] Upewnić się, że nowy plik stylów zawiera wyłącznie odpowiedzialność wizualną (kolory, spacing, typografia, layout) i nie odnosi się do logiki danych (brak wywołań metod, brak zależności od `hass`, itp.)
- [X] T011 [US1] Ręcznie przetestować kartę w Home Assistant (co najmniej jeden motyw) zmieniając wybrane reguły w `src/card/energy-burndown-card-styles.ts` i potwierdzić, że:
  - zmienia się tylko wygląd (kolory/layout),
  - brak jest błędów w konsoli,
  - wszystkie dane, wykres i tekstowe podsumowania działają jak wcześniej.

**Checkpoint**: Karta korzysta z jednego, dedykowanego pliku stylów; zmiany wizualne nie wymagają dotykania logiki.

---

## Phase 4: User Story 2 – Czytelna struktura HTML z logicznymi klasami (Priority: P2)

**Goal**: Główny plik karty zawiera czytelną strukturę HTML z jasnym podziałem na sekcje (nagłówek, statystyki, prognoza, wykres) i semantycznymi klasami.

**Independent Test**: Nowy programista, patrząc tylko na `src/card/cumulative-comparison-chart.ts`, jest w stanie wskazać blok dla nagłówka, statystyk, prognozy i wykresu, a następnie zmodyfikować ich kolejność bez dotykania logiki obliczeń.

### Implementation for User Story 2

- [X] T012 [P] [US2] Przejrzeć metodę `render()` w `src/card/cumulative-comparison-chart.ts` i upewnić się, że główne sekcje layoutu są jasno wydzielone (kontener karty, nagłówek, statystyki, prognoza, wykres)
- [X] T013 [P] [US2] Zweryfikować, że każda z głównych sekcji ma spójną, semantyczną klasę CSS (np. `.ebc-card`, `.ebc-header`, `.ebc-stats`, `.ebc-forecast`, `.ebc-chart`) oraz że nazwy te są używane wyłącznie do celów layoutu/stylów
- [X] T014 [US2] Wprowadzić ewentualne drobne korekty w strukturze HTML w `src/card/cumulative-comparison-chart.ts` (np. grupowanie elementów, kolejność bloków), tak aby przeniesienie całej sekcji (np. prognozy nad wykres) wymagało jedynie przestawienia bloku w HTML
- [X] T015 [US2] Zaktualizować opis struktury i klas (jeśli potrzeba) w `specs/001-separate-style-logic/spec.md`, tak aby odzwierciedlał aktualny, czytelny layout

**Checkpoint**: Struktura HTML jest przejrzysta, a klasy sekcji są logiczne i spójne z wymaganiami.

---

## Phase 5: User Story 3 – Niezależność logiki od stylów (Priority: P3)

**Goal**: Logika pobierania danych i obliczeń jest całkowicie oddzielona od implementacji stylów; zmiany w logice nie wymagają ingerencji w plik stylów i odwrotnie.

**Independent Test**: Tester wprowadza modyfikację w logice (np. w `src/card/ha-api.ts` lub algorytmie prognozy) i potwierdza, że nie trzeba dotykać `src/card/energy-burndown-card-styles.ts`, a wygląd karty pozostaje niezmieniony.

### Implementation for User Story 3

- [X] T016 [P] [US3] Zidentyfikować wszystkie miejsca, w których logika karty potencjalnie odnosi się do konkretnych klas CSS lub szczegółów stylów (np. w `src/card/cumulative-comparison-chart.ts`, `src/card/chart-renderer.ts`, `src/card/ha-api.ts`)
- [X] T017 [US3] Usunąć lub zrefaktoryzować takie zależności tak, aby logika operowała wyłącznie na danych i strukturze (np. elementach DOM, danych wejściowych/wyjściowych), a nie na nazwach klas lub konkretnych implementacjach stylów
- [X] T018 [US3] Zweryfikować, że zmiany w pliku `src/card/energy-burndown-card-styles.ts` (np. dodanie nowej klasy wizualnej, zmiana kolorów) nie wymagają zmian w `src/card/ha-api.ts` ani w kodzie generującym serie do wykresu
- [X] T019 [US3] Dodać krótką notatkę do `specs/001-separate-style-logic/spec.md` (np. w „Success Criteria” lub „Key Entities”), opisując granicę odpowiedzialności między modułem stylów a modułami logiki

**Checkpoint**: Logika danych i stylizacja są luźno powiązane (przez klasy/strukturę HTML), ale nie współdzielą implementacji; refaktoryzacja jednej warstwy nie wymusza zmian w drugiej.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Dopracowanie dokumentacji i upewnienie się, że separacja stylów/logiki jest zrozumiała dla przyszłych kontrybutorów.

- [X] T020 [P] Zaktualizować `README.md`, dodając krótką wzmiankę o dedykowanym pliku stylów oraz o tym, że zmiany wizualne mogą być wprowadzane bez dotykania logiki
- [X] T021 [P] Upewnić się, że inne specyfikacje powiązane z kartą (np. `specs/001-energy-horizon-card/spec.md`) są spójne z nową architekturą stylów/logiki (ewentualne dopisanie odniesienia do FR dotyczących separacji)
- [X] T022 Przejrzeć całość zmian pod kątem regresji (krótki smoke‑test karty w HA: różne motywy, różne konfiguracje karty) i w razie potrzeby zanotować uwagi do dalszych usprawnień

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 – Setup**: Brak zależności – może być wykonana od razu.  
- **Phase 2 – Foundational**: Zależy na Phase 1 – blokuje wszystkie user stories.  
- **Phase 3 – US1 (P1)**: Wymaga zakończenia Phase 2 – dostarcza MVP (dedykowany plik stylów).  
- **Phase 4 – US2 (P2)**: Zależy od Phase 3 (korzysta z ustalonej struktury klas i layoutu).  
- **Phase 5 – US3 (P3)**: Zależy od Phase 3 (dedykowany moduł stylów) i częściowo od Phase 4 (stabilna struktura HTML).  
- **Phase 6 – Polish**: Zależy od ukończenia co najmniej US1 (MVP) oraz zalecenie – po ukończeniu US2/US3.

### Parallel Opportunities

- Zadania oznaczone `[P]` w Phase 1–2 mogą być wykonywane równolegle (różne pliki, brak bezpośrednich zależności).  
- W ramach US1 część pracy (tworzenie modułu stylów vs. aktualizacja importów) może być rozdzielona na osobne osoby (T007/T008 równolegle, następnie T009).  
- W ramach US2 i US3 zadania `[P]` mogą być wykonywane niezależnie (np. praca nad renderem HTML vs. analiza zależności logiki).  
- Phase 6 może częściowo zachodzić równolegle z końcowymi poprawkami US2/US3, o ile nie zmieniają tych samych fragmentów dokumentacji.

