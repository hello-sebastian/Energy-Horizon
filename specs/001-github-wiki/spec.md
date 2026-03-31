# Feature Specification: Kompletna dokumentacja GitHub Wiki (Diátaxis)

**Feature Branch**: `001-github-wiki`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: "Opracuj kompletne Github wiki, które będzie kompleksowym źródełm wiedzy na temat karty. Obecna wiki jest niespójna i niepełna. Wykorzystaj np. złoty standard: Diátaxis Framework tworzenia dokumentacji projektów. Dokumentacja powinna objaśniać wszystkie istotne z punktu widzenia zaawansowanego użytkownika HA szczegóły. Opracuj również plan w jak utrzymywać wiki aktualne."

## Clarifications

### Session 2026-03-31

- Q: Jaka jest wiążąca decyzja co do języka treści GitHub Wiki (dla tej specyfikacji)? → A: Tylko angielski (opcja A); jeden zestaw stron, spójność z README.
- Q: Jak twardo ustalić zakres wyłączony (czego wiki nie uczy)? → A: Wyłącznie tematy karty Energy Horizon oraz niezbędne odesłania do oficjalnej dokumentacji HA; bez ogólnych tutoriali „Home Assistant od zera”.
- Q: Czy obowiązkowy duplikat dokumentacji w repozytorium vs wyłącznie GitHub Wiki? → A (niestandardowa): Kanoniczne źródło treści stron znajduje się w repozytorium w katalogu `wiki-publish/`; treść jest rozwijana równolegle i wiązana z konkretną wersją karty; po wydaniu nowej wersji karty treść jest wgrywana na GitHub Wiki.
- Q: Jak czytelnik ma ustalić, której wersji karty dotyczy treść na GitHub Wiki i odpowiadający zestaw w `wiki-publish/`? → A: Jawna informacja o wersji (numer X.Y.Z lub uzgodniony zakres) na wiki (strona główna lub nagłówek wejścia) oraz spójnie w `wiki-publish/`; aktualizacja przy każdym wgraniu na wiki.
- Q: Gdy README i wiki podają różne znaczenie tego samego pojęcia, jaka reguła rozstrzygania? → A (niestandardowa): README i wiki muszą operować tą samą nomenklaturą; w razie konfliktu rozstrzygnięcie przez analizę kodu karty w repozytorium, a gdy to nie rozstrzyga niejednoznaczności — przez wiążącą decyzję właściciela produktu / maintainera; następnie harmonizacja README i `wiki-publish/` (oraz opublikowanej wiki).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Zrozumieć kartę i pojęcia (Priority: P1)

Zaawansowany użytkownik Home Assistant chce jednym spójnym miejscem zrozumieć *dlaczego* karta działa tak, a nie inaczej: porównania okresów, długoterminowe statystyki, prognoza, jednostki i ograniczenia danych — bez przechodzenia przez rozproszone strony o różnym poziomie szczegółowości.

**Why this priority**: Bez warstwy wyjaśnień pozostałe sekcje dokumentacji są trudniejsze do utrzymania i dla czytelnika mniej wartościowe.

**Independent Test**: Niezależny recenzent (osoba znająca HA, nieznająca projektu) potwierdza, że po przeczytaniu sekcji „wyjaśnień” rozumie relację między encją statystyk, oknem czasu a wykresem oraz typowymi komunikatami o braku danych.

**Acceptance Scenarios**:

1. **Given** czytelnik zna Home Assistant, ale nie tę kartę, **When** czyta sekcję wyjaśnień (Diátaxis: Explanation), **Then** rozumie model danych z perspektywy użytkownika (np. skąd bierze się seria, co oznacza „referencja”, jakie są założenia prognozy) bez odsyłania do kodu źródłowego.
2. **Given** ta sama sekcja, **When** porównuje ją z README w repozytorium, **Then** nie ma sprzecznych definicji terminów dla tych samych pojęć (np. tryby porównania, presety czasu).

---

### User Story 2 - Wykonać konkretne zadanie (Priority: P1)

Użytkownik chce instrukcji krok po kroku dla typowych zadań zaawansowanych: konfiguracja YAML, okna czasu, agregacja i etykiety osi, edytor wizualny vs YAML, rozwiązywanie problemów z encjami i statystykami.

**Why this priority**: To główny powód odwiedzin wiki przez osoby już korzystające z HA w trybie zaawansowanym.

**Independent Test**: Każdy opisany przepływ „jak zrobić X” ma weryfikowalny rezultat w UI Home Assistant (widoczny efekt na dashboardzie lub w narzędziach deweloperskich) oraz jasno wskazane warunki wstępne i typowe niepowodzenia.

**Acceptance Scenarios**:

1. **Given** użytkownik ma działający HA i encję ze statystykami, **When** postępuje według wybranego przewodnika how-to, **Then** osiąga opisany efekt końcowy albo znajduje w tym samym dokumencie sekcję „co zrobić, gdy…” dla swojego przypadku.
2. **Given** funkcja karty wymaga ustawień poza edytorem wizualnym, **When** użytkownik szuka w how-to, **Then** znajduje jasny podział: co da się zrobić w edytorze, a co wymaga YAML (bez zgadywania).

---

### User Story 3 - Szybko sprawdzić prawdę o konfiguracji (Priority: P2)

Użytkownik chce kompletnej, przeszukiwalnej referencji opcji karty (nazwy, znaczenie, wartości domyślne, zależności, zachowanie przy braku danych) tak, aby móc skonfigurować kartę bez przekopywania się przez długie narracje.

**Why this priority**: Zaawansowani użytkownicy często zaczynają od referencji; jej brak powoduje duplikację pytań i błędów konfiguracji.

**Independent Test**: Dla każdej udokumentowanej opcji konfiguracyjnej można wskazać co najmniej jeden scenariusz testowy „ustaw X → oczekuj Y” zgodny z opisem.

**Acceptance Scenarios**:

1. **Given** użytkownik zna nazwę opcji (lub szuka po pojęciu), **When** otwiera referencję, **Then** znajduje jednoznaczny opis opcji oraz powiązane ograniczenia lub powiązane opcje.
2. **Given** wydana zostaje nowa wersja karty, **When** maintainer porównuje referencję z listą zmian w wydaniu, **Then** może wskazać brakujące lub przestarzałe wpisy (procedura utrzymania).

---

### User Story 4 - Nauczyć się ścieżką prowadzoną (Priority: P2)

Nowy użytkownik karty (już komfortowo czujący się w HA) chce krótkiego tutorialu prowadzącego od instalacji zasobu Lovelace do pierwszej sensownej konfiguracji z wyjaśnieniem typowych ustawień porównania.

**Why this priority**: Tutorial zwiększa adopcję i zmniejsza obciążenie wsparcia; uzupełnia README, nie konkurruje z nim co do zakresu, lecz porządkuje ścieżkę nauki.

**Independent Test**: Osoba testowa przechodzi tutorial bez wcześniejszej znajomości karty i kończy z działającą kartą lub jasno opisanym punktem kontrolnym „zatrzymaj się, jeśli…”.

**Acceptance Scenarios**:

1. **Given** świeża instalacja zgodna z wymaganiami karty, **When** użytkownik wykonuje kroki tutorialu, **Then** osiąga opisany stan końcowy (widok z danymi lub świadomie opisany brak danych z następnym krokiem diagnostycznym).

---

### User Story 5 - Utrzymanie dokumentacji w czasie (Priority: P1)

Zespół utrzymujący projekt chce jasnego, powtarzalnego planu: kiedy aktualizować wiki, kto decyduje o treści, jak wiązać zmiany produktu z zmianami dokumentacji oraz jak wykrywać niespójności.

**Why this priority**: Bez procesu wiki ponownie stanie się niepełna i niespójna — cel strategiczny użytkownika.

**Independent Test**: Nowy maintainer potrafi w jednym dokumencie przeczytać proces i wykonać przegląd spójności wiki z aktualnym zachowaniem karty według checklisty.

**Acceptance Scenarios**:

1. **Given** opublikowane zostaje nowe wydanie karty ze zmianą zachowania widoczną dla użytkownika, **When** stosuje się uzgodniony proces utrzymania, **Then** wiki jest zaktualizowana w uzgodnionym horyzoncie czasu lub jawnie oznaczona znana luka (tymczasowa nota) z planem uzupełnienia.
2. **Given** minął zaplanowany okres przeglądu, **When** wykonuje się przegląd okresowy, **Then** istnieje zapis (np. wpis w changelogu lub zadanie śledzące) potwierdzający wykonanie lub uzasadniający odstępstwo.

---

### Edge Cases

- Użytkownik korzysta ze starszej wersji Home Assistant lub karty — dokumentacja musi jasno wskazywać wersje minimalne lub różnice zachowań, gdy są znane.
- Funkcja jest eksperymentalna lub zmienia się często — dokumentacja musi komunikować stabilność lub datę ostatniej weryfikacji bez wprowadzania w błąd co do wsparcia długoterminowego.
- Rozbieżna nomenklatura lub znaczenie między README a wiki — niedopuszczalne w utrzymanym stanie; rozstrzygnięcie według FR-007 (weryfikacja w kodzie karty, potem decyzja właściciela produktu, harmonizacja obu źródeł).
- Użytkownik nie znajduje encji w statystykach — dokumentacja musi odsyłać do ścieżki diagnostycznej bez obiecywania rozwiązania poza kontrolą karty.
- Dostępność GitHub Wiki (np. awaria lub ograniczenia platformy) — README wskazuje, że aktualny zestaw stron jest dostępny w repozytorium w `wiki-publish/` na domyślnej gałęzi jako treść do edycji i jako zapas lektury; publikacja na wiki następuje przy wydaniu karty.
- Czytelnik oczekuje ogólnego kursu Home Assistant „od zera” — wiki nie zastępuje oficjalnej dokumentacji HA; wskazuje właściwe zewnętrzne źródła tam, gdzie potrzebna jest wiedza poza kartą.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dokumentacja w wiki musi być zorganizowana zgodnie z frameworkiem Diátaxis: wyraźnie wydzielone obszary Tutorial, How-to, Reference oraz Explanation (nawet jeśli niektóre strony łączą typ treści, typ musi być rozpoznawalny z nawigacji lub nagłówków).
- **FR-002**: Strona główna wiki musi wprowadzać strukturę Diátaxis i linkować do kluczowych stron w każdej ćwiartce, tak aby nowy czytelnik wiedział, od czego zacząć w zależności od celu (nauka / zadanie / fakty / zrozumienie).
- **FR-003**: Warstwa Explanation musi obejmować z punktu widzenia zaawansowanego użytkownika HA m.in.: rolę długoterminowych statystyk, wymagania co do encji, sens porównań okresów i prognozy, ograniczenia wynikające z danych — w języku pojęć użytkownika, nie implementacji.
- **FR-004**: Warstwa How-to musi obejmować typowe zadania zaawansowane, w tym konfigurację w YAML tam, gdzie edytor wizualny jest niewystarczający, oraz rozwiązywanie typowych problemów (brak danych, zła encja, niezgodność jednostek) z jasnymi warunkami wstępnymi i końcowymi.
- **FR-005**: Warstwa Reference musi stanowić kompletny opis publicznych opcji konfiguracji karty istotnych dla użytkownika końcowego, z relacjami typu „wymaga / sugeruje / wyklucza” tam, gdzie ma to znaczenie dla poprawnej konfiguracji.
- **FR-006**: Warstwa Tutorial musi prowadzić użytkownika od spełnienia wymagań wstępnych do pierwszej działającej konfiguracji z punktami kontrolnymi i odniesieniem do dalszej lektury w innych ćwiartkach.
- **FR-007**: README i GitHub Wiki (oraz zestaw w `wiki-publish/`) muszą używać **tej samej nomenklatury** dla tych samych pojęć użytkownika (nazwy opcji, tryby, presety itd.). Terminy kluczowe są zdefiniowane lub skonsolidowane (glossary lub spójne pierwsze użycie z definicją). **Rozbieżność** między README a wiki co do nazewnictwa lub znaczenia jest **niedopuszczalna** po zakończeniu przeglądu: maintainer najpierw rozstrzyga faktyczne zachowanie przez **analizę kodu źródłowego karty** w repozytorium; jeśli kod nie rozstrzyga niejednoznaczności, uzyskuje **wiążącą decyzję** od właściciela produktu / maintainera projektu; następnie **harmonizuje** README oraz `wiki-publish/` (a po publikacji — treść na GitHub Wiki) do wspólnej terminologii.
- **FR-008**: Musi istnieć udokumentowany plan utrzymania wiki obejmujący: wyzwalacze aktualizacji (np. wydanie, istotna zmiana zachowania), minimalny zakres przeglądu przy wydaniu, okresowość przeglądu całości lub priorytetowych obszarów, sposób śledzenia braków oraz odpowiedzialność (rola lub zespół, nawet jeśli jednoosobowy maintainer).
- **FR-009**: Plan utrzymania musi przewidywać mechanizm wykrywania niespójności między wiki a zachowaniem karty widocznym dla użytkownika (np. checklista przy wydaniu, porównanie z notatkami o wydaniu) oraz działanie naprawcze przed długotrwałym pozostawieniem błędnej treści.
- **FR-010**: Nawigacja między stronami wiki musi minimalizować duplikację treści: powtarzające się fakty powinny być scentralizowane w referencji lub wyjaśnieniach, a how-to/tutorial powinny do nich linkować zamiast kopiować bez synchronizacji.
- **FR-011**: Treść merytoryczna wiki (wszystkie strony publikowane w ramach tego zestawu, w tym strona główna, nawigacja i ewentualny glossary) musi być w języku angielskim; zlokalizowane stringi interfejsu karty w repozytorium nie są częścią zakresu językowego wiki.
- **FR-012**: Zakres treści wiki obejmuje wyłącznie kartę Energy Horizon oraz powiązane z nią pojęcia i procedury; wiki nie zawiera ogólnych samouczków Home Assistant „od zera”. Tam, gdzie potrzebna jest szersza wiedza o HA, dokumentacja musi odsyłać do oficjalnych źródeł Home Assistant zamiast powielać je w pełnej szerokości.
- **FR-013**: Kanoniczne źródło treści stron (edycja, przegląd wersji względem karty) znajduje się w repozytorium w katalogu `wiki-publish/`. Publikacja na GitHub Wiki następuje po wydaniu nowej wersji karty przez wgranie treści odpowiadającej tej wersji. Plan utrzymania musi opisać ten przepływ (w tym powiązanie zestawu stron z numerem wydania karty) tak, aby nowy maintainer mógł go powtórzyć bez zgadywania.
- **FR-014**: Opublikowana GitHub Wiki oraz zestaw stron w `wiki-publish/` muszą **jawnie i spójnie** wskazywać, której **wersji karty** (numer semantyczny `X.Y.Z` lub uzgodniony **zakres** wersji) dotyczy dokumentacja — tak, aby czytelnik nie musiał dedukować tego z historii git. Informacja musi być widoczna na stronie głównej wiki (lub równoważnym miejscu wejścia) oraz odzwierciedlona w `wiki-publish/`; przy każdym wgraniu treści na wiki informacja o wersji musi być zaktualizowana zgodnie z wydaniem.

### Key Entities

- **Zestaw dokumentacji wiki**: zbiór powiązanych stron publikowanych na GitHub Wiki, z treścią utrzymaną w repozytorium w `wiki-publish/` jako źródło do edycji i weryfikacji zgodności z wersją karty; obejmuje cztery intencje Diátaxis oraz stronę startową i ewentualnie słownik pojęć.
- **Profil czytelnika „zaawansowany użytkownik HA”**: osoba potrafiąca obsłużyć Lovelace, edytor YAML, narzędzia deweloperskie i statystyki; dokumentacja nie wyjaśnia podstaw HA od zera, lecz może wskazywać oficjalne źródła tam, gdzie to konieczne.
- **Proces utrzymania dokumentacji**: uzgodniona procedura cykliczna i zdarzeniowa wiążąca zmiany produktu z aktualizacją treści oraz dowodami wykonania (ślad audytowy w zrozumiałym dla zespołu formacie); obejmuje także rozstrzyganie konfliktów nomenklatury zgodnie z FR-007.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Co najmniej 90% publicznych opcji konfiguracji karty istotnych dla użytkownika końcowego ma wpis w warstwie Reference z opisem znaczenia i typowego wpływu na widok lub dane (weryfikacja przez checklistę pokrycia przy przeglądzie wydania).
- **SC-002**: Dla każdej ćwiartki Diátaxis istnieje co najmniej jedna dedykowana strona lub wyraźnie oznaczona sekcja osiągalna ze strony głównej wiki w nie więcej niż dwóch kliknięciach od strony głównej wiki.
- **SC-003**: Plan utrzymania wiki jest dostępny dla czytelników (strona na GitHub Wiki i/lub dokument w repozytorium powiązany z procesem `wiki-publish/` → wiki) i zawiera co najmniej: jeden wyzwalacz zdarzeniowy (np. wydanie karty i publikacja treści z `wiki-publish/`), jeden rytm okresowy (np. kwartalny przegląd priorytetów) oraz jednoznaczny opis kroku „co robić, gdy dokumentacja jest nieaktualna”.
- **SC-004**: Niezależny recenzent (niebędący autorem) potwierdza w pisemnym protokole przeglądu lub zadaniu śledzącym, że nie znalazł sprzecznych definicji tego samego pojęcia między README a wiki dla co najmniej pięciu terminów kluczowych wybranych z listy kontrolnej projektu.
- **SC-005**: Co najmniej trzy pełne przepływy how-to (różne intencje użytkownika, np. YAML, diagnostyka, zaawansowane okna czasu) mają zdefiniowane warunki końcowe weryfikowalne w UI Home Assistant oraz sekcję „gdy coś pójdzie nie tak”.
- **SC-006**: Czytelnik korzystający wyłącznie z GitHub Wiki (bez klonowania repozytorium) może zidentyfikować **wersję karty**, której dotyczy treść, w **nie więcej niż jednym kroku** od strony głównej wiki (np. widoczny numer wersji lub zakres na stronie głównej albo pojedyncze kliknięcie do krótkiej strony „About this documentation” z tym samym wyróżnieniem).

## Assumptions

- **Audience (this document)**: Specyfikacja jest przeznaczona dla właścicieli produktu i osób odpowiedzialnych za dokumentację (definicja zakresu i kryteriów); treść docelowej wiki jest dla zaawansowanych użytkowników Home Assistant zgodnie z historiami użytkownika powyżej.
- **Język wiki (wiążąco)**: Treść GitHub Wiki jest wyłącznie w języku angielskim, w jednym zestawie stron spójnym z angielskim README; brak równoległych wersji językowych wiki w zakresie tej specyfikacji.
- **Zakres wyłączony (wiążąco)**: Wiki nie pełni roli ogólnego przewodnika po Home Assistant; skupia się na karcie i niezbędnych odesłaniach do oficjalnej dokumentacji HA (bez samouczków „HA od zera” w treści wiki).
- „Kompletność” dotyczy wszystkich funkcji karty dostępnych użytkownikowi końcowemu w stabilnym wydaniu; funkcje eksperymentalne mogą być oznaczone jako takie do czasu ustabilizowania zachowania.
- **Źródło vs publikacja (wiążąco)**: Pełna treść stron jest utrzymywana w repozytorium w katalogu `wiki-publish/` (praca równoległa, zestaw zgodny z wersją karty). GitHub Wiki jest kanałem publikacji dla odbiorców końcowych; po wydaniu nowej wersji karty treść z `wiki-publish/` jest wgrywana na wiki. README pozostaje punktem wejścia i kieruje do wiki oraz wskazuje `wiki-publish/` tam, gdzie to potrzebne do śledzenia wersji lub zapasu lektury.
- **Wersjonowanie dokumentacji (wiążąco)**: Treść na wiki i w `wiki-publish/` jest **jawnie oznaczona** wersją wydania karty (`X.Y.Z` lub uzgodniony zakres) i **aktualizowana przy każdym wgraniu** na GitHub Wiki, tak aby była zgodna z ustaleniami FR-014 i SC-006.
- **Nomenklatura README ↔ wiki (wiążąco)**: README i wiki dzielą **wspólną nomenklaturę**; konflikty rozstrzyga się zgodnie z **FR-007** (kod karty, potem decyzja właściciela produktu / maintainera).
