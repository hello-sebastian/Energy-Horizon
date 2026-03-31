# Feature Specification: Elastyczny silnik okien czasowych (Time Windows)

**Feature Branch**: `001-time-windows-engine`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: Zaktualizuj dokumentację i zaplanuj refaktoryzację silnika pobierania danych (Comparison Windows Engine): przejście ze sztywnych trybów opartych o pojedynczy preset (w YAML kanonicznie `comparison_preset`, legacy `comparison_mode`) na generyczny model okien czasowych z presetami, scalaniem konfiguracji z YAML, wieloma seriami na wykresie, tooltipami ograniczonymi do dwóch głównych okien oraz osią X dopasowaną do najdłuższego okna.

## Clarifications

### Session 2026-03-29

- Q: Gdy blok `time_window` jest niepoprawny (np. `step` ≤ 0 lub brak wymaganych pól), które zachowanie jest wymagane? → A: **Opcja A** — karta pokazuje wyraźny komunikat błędu konfiguracji i **nie** renderuje wykresu danych do czasu poprawy YAML (bez fallbacku do samego presetu ani cichego ignorowania bloku).
- Q: Gdy po scaleniu konfiguracji powstaje tylko jedno okno (`count: 1` lub równoważnie), co z metrykami porównawczymi, prognozami i tooltipem? → A: **Opcja A** — wykres pokazuje wyłącznie serię bieżącą; metryki porównawcze oraz prognozy wymagające okna referencyjnego są **ukryte lub wyłączone**; tooltip pokazuje **co najwyżej** wartość bieżącego okna (bez wartości referencyjnej).
- Q: Górny limit liczby okien z konfiguracji użytkownika? → A: **Bezpiecznik konfiguracji 24** (jak opcja B): po przekroczeniu — komunikat błędu i brak wykresu danych (jak FR-014). **Rdzeń silnika** ma być zdolny do operowania na **większej** liczbie okien w warstwie wewnętrznej (np. testy, przyszłe rozszerzenia); limit **24** dotyczy **wejścia z YAML / konfiguracji Lovelace**, a nie sztywnego zakresu algorytmu wyliczania okien.

### Hard limits / LTS (Long-Term Statistics)

Dane karty pochodzą z **rekordera / statystyk HA (LTS)**. Minimalna rozdzielczość statystyk w tym modelu to **1 godzina** — karta nie wspiera ziarnistości krótszej niż godzina.

- **Kotwice (`anchor`)**: dozwolone są wyłącznie wartości zgodne z silnikiem rozwiązywania okien: `start_of_year`, `start_of_month`, `start_of_week`, `start_of_day`, `start_of_hour`, `now`. `start_of_week` odpowiada **`startOf("week")` w Luxon** (tydzień ISO od poniedziałku). Kotwice „sub-godzinowe” (np. `start_of_minute`) są **niedozwolone**.
- **`duration`**: po sparsowaniu musi odpowiadać co najmniej **1 godzinie** rzeczywistego trwania (np. `30m` — odrzucenie; `1h`, `90m` — OK).
- **`aggregation` (efektywna po scaleniu z `time_window` i poziomem karty)**: musi być jednym z `hour`, `day`, `week`, `month` albo **brak** (wtedy dalsze domyślne `day` jest nadal brakiem jawnej wartości użytkownika, nie autokorektą błędnego tokena). Dowolna inna wartość z YAML (np. `5m`) jest **odrzucana**.
- **Bez autokorekty**: błędnych wartości nie zaokrąglamy w górę — tylko odrzucenie z błędem.
- **Fail-fast**: naruszenie powyższych reguł powoduje **standardowy błąd karty Lovelace** (`throw` w `setConfig`), a nie cichy fallback ani pusty wykres bez wyjaśnienia.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Presety zachowują znane zachowanie z możliwością nadpisania (Priority: P1)

Użytkownik ma istniejącą kartę z `comparison_preset: year_over_year` lub `month_over_year` (lub równoważnym legacy `comparison_mode`) i nie zmienia nic więcej. Wykres i porównanie działają tak jak dotychczas (bieżący okres vs jeden okres referencyjny w ustalonej logice kalendarzowej).

**Why this priority**: Regresja wobec obecnych użytkowników jest niedopuszczalna; preset jest ścieżką domyślną.

**Independent Test**: Ta sama encja i preset co przed zmianą → widoczne dwa okresy na wykresie z oczekiwanym wyrównaniem (rok do roku / miesiąc względem tego samego miesiąca rok temu).

**Acceptance Scenarios**:

1. **Given** `comparison_preset: year_over_year` bez bloku `time_window`, **When** karta ładuje dane, **Then** wyświetlane są dokładnie dwa okna: bieżący rok kalendarzowy i poprzedni rok kalendarzowy (logika odpowiadająca dotychczasowemu presetowi).
2. **Given** `comparison_preset: month_over_year` bez bloku `time_window`, **When** karta ładuje dane, **Then** wyświetlane są dwa okna: bieżący miesiąc od początku miesiąca oraz ten sam zakres miesięczny w roku poprzednim (logika odpowiadająca dotychczasowemu presetowi).
3. **Given** `comparison_preset: year_over_year` oraz `time_window` zawierające wyłącznie `duration` (np. dwukrotność domyślnej szerokości okna w sensie biznesowym), **When** konfiguracja jest scalana, **Then** zmienia się wyłącznie szerokość trwania okna; pozostałe parametry pochodzą z presetu.

---

### User Story 2 – Wiele okien historycznych na jednym wykresie (Priority: P1)

Użytkownik chce zobaczyć bieżący miesiąc, poprzedni miesiąc i ewentualnie dalsze miesiące wstecz na jednym wykresie. W YAML ustawia parametry okna (kotwica, długość, krok, liczba okien) tak, aby powstało co najmniej trzy niezależne zakresy czasu; każdy zakres jest pobierany i rysowany.

**Why this priority**: To jest rdzeń wartości „analitycznej” — elastyczne okresy bez nowych trybów w kodzie.

**Independent Test**: Konfiguracja z `count: 3` (lub równoważna) i spójnym `step` → trzy serie widoczne na wykresie; oś X obejmuje pełny zakres najdłuższego okna.

**Acceptance Scenarios**:

1. **Given** konfiguracja definiująca trzy okna czasowe dla tej samej encji, **When** dane są załadowane, **Then** wykres przedstawia trzy serie zgodnie z wyliczonymi zakresami `start`/`end`.
2. **Given** okna mają różną liczbę dni (np. luty vs marzec), **When** wykres jest rysowany, **Then** oś czasu ma długość najdłuższego okna, a krótsze serie kończą się na ostatnim punkcie danych bez sztucznego rozciągania wartości w czasie.
3. **Given** co najmniej trzy okna, **When** użytkownik otwiera tooltip przy punkcie na wykresie, **Then** tooltip pokazuje wartości wyłącznie dla okna bieżącego (pierwsze) i okna referencyjnego (drugie); okna trzecie i dalsze nie pojawia się w tooltipie.

---

### User Story 3 – Niestandardowe cykle rozliczeniowe (Priority: P2)

Użytkownik rozlicza energię od ustalonego dnia w roku (np. cykl roczny od października). Konfiguruje kotwicę i przesunięcie tak, aby „start roku rozliczeniowego” nie pokrywał się z 1 stycznia, zachowując przy tym porównanie z poprzednim cyklem.

**Why this priority**: Typowy przypadek użycia poza kalendarzem gregoriańskim „od stycznia”.

**Independent Test**: Konfiguracja opisująca rok trwający 12 miesięcy z przesuniętym początkiem → dwa sąsiednie cykle na wykresie z poprawnymi datami granicznymi.

**Acceptance Scenarios**:

1. **Given** kotwica roczna z przesunięciem wynoszącym kilka miesięcy od nominalnego początku roku, **When** silnik wylicza okna, **Then** `start` i `end` pierwszego okna odpowiadają jednemu pełnemu cyklowi 12-miesięcznemu od tej daty, a drugie okno to poprzedni taki cykl.

---

### User Story 4 – Porównanie godzinowe (Priority: P3)

Użytkownik chce zobaczyć bieżącą godzinę i kilka poprzednich godzin (np. 6 okien po 1 h). Konfiguruje kotwicę do początku godziny, `duration` i `step` na poziomie **co najmniej jednej godziny** oraz odpowiednią `count`. Przy **LTS** minimalny sensowny „krok” rozdzielczości to **godzina** — analiza sub-godzinna (np. minuty) nie jest obsługiwana przez źródło danych karty.

**Why this priority**: Rozszerza kartę do analizy krótkich horyzontów bez zmiany edytora wizualnego.

**Independent Test**: Konfiguracja godzinowa → serie odpowiadają kolejnym pełnym godzinom wstecz od bieżącej kotwicy.

**Acceptance Scenarios**:

1. **Given** kotwica „początek bieżącej godziny”, `duration` jednej godziny i `count` większe niż 1, **When** dane są agregowane zgodnie z ustawioną granularnością, **Then** każde okno obejmuje dokładnie jedną pełną godzinę w sensie lokalnego czasu użytkownika.

---

### User Story 5 – Dokumentacja dla użytkowników zaawansowanych (Priority: P2)

Zaawansowany użytkownik czyta wiki lub dokumentację projektu i rozumie znaczenie parametrów: kotwica, przesunięcie, krok, liczba okien, długość okna, agregacja oraz zasady scalania z presetem `comparison_preset`.

**Why this priority**: Bez dokumentacji elastyczna konfiguracja YAML jest trudna do utrzymania.

**Independent Test**: Obecność opisu parametrów oraz diagramu wyjaśniającego łańcuch: kotwica → przesunięcie → start bieżącego okna → długość; oraz rolę `step` przy generowaniu okien wstecz.

**Acceptance Scenarios**:

1. **Given** użytkownik czyta sekcję dokumentacji Time Windows, **When** porównuje z przykładami YAML, **Then** potrafi zbudować konfigurację „ten miesiąc vs poprzedni miesiąc” oraz „month_over_year” bez odwołania do kodu źródłowego.

---

### Edge Cases

- `count: 1` (lub skutecznie jedno okno po wyliczeniu): **brak** serii referencyjnej — wykres pokazuje **tylko** serię bieżącą; metryki porównawcze i prognozy zależne od pary bieżąca–referencja są **ukryte lub wyłączone**; tooltip **co najwyżej** jedna wartość (bieżąca), **bez** błędu konfiguracji odróżniającego ten przypadek od nieważnego `time_window`.
- Niepoprawny lub sprzeczny blok `time_window` po scaleniu z presetem (np. ujemny lub zerowy `step`, brak wymaganych pól, niespójność uniemożliwiająca wyliczenie okien): **obowiązkowo** widoczny komunikat błędu na karcie; **brak** renderowania wykresu serii danych do czasu poprawy konfiguracji; bez cichego fallbacku do presetu i bez częściowego stosowania `time_window`.
- Rok przestępny: porównanie miesięcy o różnej liczbie dni (np. marzec −1 miesiąc od 31 marca) musi dawać kalendarzowo poprawny ostatni dzień lutego (w tym 29 lutego w roku przestępnym).
- Granica czasu lokalnego vs UTC: zakresy muszą być spójne z oczekiwaniem użytkownika HA (czas lokalny instalacji / encji zgodnie z obecną konwencją karty).
- Okna dodatkowe (indeks ≥ 2): nie wliczają się do prognoz ani podsumowań zależnych od „bieżącego vs referencyjnego” — tylko wizualne tło; musi być to konsekwentne w całej karcie.
- Różna długość okien: oś X może być dłuższa niż okno bieżące (FR-009 — najdłuższe okno); **mianownik prognozy** (ukończony ułamek okresu, progi procentowe w `computeForecast`) dotyczy wyłącznie **okna o indeksie 0**, a nie długości osi ani najdłuższego okna.
- Agregacja (`aggregation`) niespójna z bardzo krótkim oknem lub niedozwolona względem LTS: **hard limits** w sekcji „Hard limits / LTS” — odrzucenie w `setConfig` (fail-fast), bez autokorekty.
- Liczba okien z konfiguracji użytkownika **> 24** (po scaleniu i wyliczeniu `count` / równoważnika): **bezpiecznik** — ten sam rodzaj obsługi co przy FR-014 (komunikat na karcie, brak wykresu serii do czasu poprawy); brak cichego przycinania do 24.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUSI reprezentować porównanie czasowe jako uporządkowaną listę od zera do N−1 okien czasowych; każde okno ma stabilny identyfikator logiczny oraz indeks pozycji.
- **FR-002**: Każde okno MUSI być opisane parametrami konfiguracyjnymi: kotwica czasu (np. początek roku, miesiąca, godziny, „teraz”), opcjonalne przesunięcie względem kotwicy, odległość w czasie wstecz (dla okna bieżącego zero; dla kolejnych wyliczana z kroku i indeksu), długość trwania okna oraz granularność agregacji danych.
- **FR-003**: Wartość kroku (`step`) podana przez użytkownika jako dodatnia wielkość czasu MUSI być mapowana na wielokrotność przesunięcia wstecz proporcjonalną do indeksu okna (okno o indeksie k jest przesunięte o k jednostek kroku względem okna bazowego).
- **FR-004**: Parametr presetu w YAML (`comparison_preset`; legacy: `comparison_mode`) MUSI być traktowany jako preset: zestaw domyślnych wartości parametrów okien; pełna lista pól presetów musi być udokumentowana dla co najmniej `year_over_year`, `month_over_year` oraz `month_over_month` (porównanie dwóch kolejnych miesięcy kalendarzowych) zgodnie z semantyką biznesową opisaną w `data-model.md` i wiki.
- **FR-005**: Blok konfiguracji `time_window` w YAML MUSI być łączony z presetem przez scalanie pól: każda właściwość jawnie podana w `time_window` zastępuje wartość z presetu; brak jawnej właściwości zachowuje wartość z presetu.
- **FR-006**: System MUSI wyliczać dla każdego okna jawne granice `start` i `end` przed pobraniem danych; granice MUSZĄ uwzględniać kalendarz (lata przestępne, różna liczba dni w miesiącach) w sposób zgodny z zachowaniem znanych narzędzi analitycznych (kotwica + przesunięcie + długość + cofanie o krok).
- **FR-007**: Dla każdego wyliczonego okna system MUSI pobrać dane statystyczne osobno; pobrania dla wielu okien MOGĄ być wykonywane równolegle, aby skrócić czas oczekiwania, przy zachowaniu poprawności zakresów czasu.
- **FR-008**: Gdy wygenerowano **co najmniej dwa** okna, wykres MUSI przedstawiać okno o indeksie 0 jako serię bieżącą oraz okno o indeksie 1 jako serię referencyjną z dotychczasowymi regułami stylów i udziałem w metrykach porównawczych oraz prognozach; okna o indeksie 2 i wyższe MUSZĄ być rysowane wyłącznie jako warstwa kontekstu wizualnego (styl zbliżony do serii referencyjnej), bez wpływu na prognozy i bez udziału w tooltipie.
- **FR-015**: Gdy wygenerowano **dokładnie jedno** okno, wykres MUSI przedstawiać wyłącznie serię bieżącą; metryki porównawcze oraz elementy prognoz wymagające okna referencyjnego MUSZĄ być ukryte lub wyłączone; tooltip MUSI pokazywać co najwyżej wartość bieżącego okna i NIE MOŻE wyświetlać ani domyślnie uzupełniać wartości referencyjnej.
- **FR-009**: Oś pozioma wykresu MUSI mieć rozpiętość czasu równą długości najdłuższego okna wśród wygenerowanych; serie z krótszym zakresem MUSZĄ kończyć się na ostatnim dostępnym punkcie bez interpolacji ani rozciągania wartości wzdłuż osi poza ten zakres.
- **FR-010**: Notacja okresów w konfiguracji (np. lata, miesiące, dni, godziny) MUSI być jednoznacznie interpretowalna (wielkość litery dla jednostek ustalona w dokumentacji); użytkownik zaawansowany MUSI móc powielić przykłady z dokumentacji bez zgadywania składni.
- **FR-011**: Edytor wizualny (GUI) karty NIE MOŻE wymagać zmiany przepływu pracy dla użytkownika końcowego; nowe parametry (`anchor`, `step`, `count`, nadpisywanie `duration`, `offset` itd.) MUSZĄ być dostępne przez YAML (oraz istniejące mechanizmy rozszerzania konfiguracji, jeśli już wspierają surowy YAML).
- **FR-012**: Dokumentacja wewnętrzna projektu MUSI opisywać architekturę silnika okien (model konfiguracji, preset, scalanie, wyliczanie granic, rola indeksów okien względem wykresu i tooltipa).
- **FR-013**: Dokumentacja użytkownika (wiki) MUSI zawierać opis parametrów Time Windows oraz diagram wyjaśniający łańcuch czasu od kotwicy do końca okna i generowanie okien historycznych przez `step`.
- **FR-014**: Gdy walidacja wykryje **niepoprawny** blok `time_window` (po scaleniu z presetem `comparison_preset`), system MUSI wyświetlić na karcie **czytelny komunikat** skierowany do użytkownika oraz MUSI **pominąć** prezentację wykresu z danymi porównawczymi do czasu poprawy YAML; zabronione jest ciche zignorowanie błędu lub automatyczne zastąpienie całego bloku samym presetem bez informacji użytkownika.
- **FR-016**: Liczba okien żądana z konfiguracji użytkownika (po scaleniu preset + `time_window`, w tym `count` lub równoważnik) NIE MOŻE przekraczać **24**; wartość **> 24** MUSI być traktowana jak błąd konfiguracji z **tym samym** zachowaniem co w FR-014 (komunikat, brak wykresu danych). Rdzeń wyliczania listy okien (silnik) MUSI być zaprojektowany tak, by **nie** zakładał stałego limitu 24 w samej logice matematycznej okien — limit jest **warstwą walidacji wejścia** (bezpiecznik), umożliwiającą wewnętrznie lub w przyszłości obsługę większego N bez przepisywania algorytmu.
- **FR-017**: Mianownik prognozy (`periodTotalBuckets` w kontrakcie [001-compute-forecast](../001-compute-forecast/spec.md)) MUSI odpowiadać liczbie slotów agregacji **wyłącznie dla okna bieżącego (indeks 0)** — wyliczonej z `start`/`end`/`aggregation` tego okna — gdy użytkownik definiuje wiele okien o różnej rozpiętości; NIE WOLNO używać liczby slotów osi X z FR-009 (najdłuższe okno) jako tego mianownika. Dla domyślnych presetów `year_over_year` / `month_over_year` na ścieżce legacy (bieżące okno do końca roku lub miesiąca kalendarzowego) mianownik pozostaje zgodny z pełnym okresem kalendarzowym bieżącej serii, tak jak przed wprowadzeniem wielu okien. Preset `month_over_month` korzysta ze ścieżki generycznej (bez flag legacy); mianownik wynika z granic wyliczonego okna 0.
- **FR-018**: Warstwa wizualna wykresu (kolejność rysowania serii w rendererze ECharts) MUSI być taka, że **młodsze okna przykrywają starsze**: od **najstarszych** danych (najwyższy indeks okna / najwcześniejszy zakres przy generycznym `step`) do **najmłodszego** okna bieżącego (indeks 0), z prognozą (jeśli włączona) na wierzchu. Uzupełnia FR-008 (role serii i tooltip); nie zmienia semantyki danych w `ComparisonSeries`.

### Key Entities

- **Preset porównania (`comparison_preset` w YAML; legacy: `comparison_mode`)**: Nazwany zestaw domyślnych parametrów okien; w UI edytora Lovelace opisywany jako **Comparison Preset**. Obejmuje m.in. `year_over_year`, `month_over_year` oraz `month_over_month` (dwa kolejne miesiące kalendarzowe).
- **Konfiguracja okna czasu (`time_window`)**: Opcjonalny fragment YAML nadpisujący wybrane pola presetu; może definiować w pełni niestandardową listę okien poprzez parametry takie jak kotwica, przesunięcie, długość, krok, liczba okien, agregacja.
- **Okno czasowe (logiczne)**: Jednostka porównania z indeksem, identyfikatorem, wyliczonymi `start`/`end`, powiązaną granularnością agregacji oraz klasyfikacją „bieżące / referencyjne / kontekstowe (wyciszone)”.
- **Rozwiązana konfiguracja silnika**: Wynik scalenia presetu i nadpisań, gotowy do wyliczenia listy okien i żądań danych.

## Assumptions

- Home Assistant nadal dostarcza dane statystyczne w modelu zrozumiałym dla karty; zakresy `start`/`end` są przekazywane tak jak dziś, tylko częściej i dla większej liczby okien.
- Strefa czasowa i konwencja „lokalnego czasu” pozostają zgodne z obecną implementacją karty, chyba że osobna funkcja wprowadzi inaczej — wtedy należy ujednolicić w planie implementacji.
- Dla konfiguracji Lovelace obowiązuje **bezpiecznik 24 okien** (FR-016); scenariusze akceptacyjne wymagają co najmniej **trzech** serii na wykresie przy poprawnej konfiguracji. Wewnętrzna zdolność silnika do N > 24 jest dopuszczalna poza tą warstwą walidacji (np. testy jednostkowe).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: W konfiguracji z trzema oknami czasowymi użytkownik widzi trzy serie na wykresie, a interaktywny tooltip przy dowolnym punkcie prezentuje co najwyżej dwie wartości liczbowe (bieżąca i referencyjna) — bez wartości dla serii trzeciej i dalszych.
- **SC-002**: Dla scenariusza kalendarzowego „jeden miesiąc wstecz od końcówki marca” końcowa data krótszego miesiąca (luty) jest poprawna w roku przestępnym i nieprzestępnym — weryfikowalne przez zestawienie wyświetlanych zakresów dat lub punktów końcowych serii z oczekiwanym kalendarzem.
- **SC-003**: Przy dwóch oknach o różnej liczbie dni w zakresie oś pozioma obejmuje pełny zakres dłuższego okna; krótsza seria nie wypełnia sztucznie prawej strony wykresu danymi poza swoim rzeczywistym zakresem (100% punktów krótszej serii mieści się w jej `start`–`end`).
- **SC-004**: Konfiguracja zawierająca wyłącznie `comparison_preset: year_over_year` (lub legacy `comparison_mode: year_over_year`) zachowuje semantykę zgodną z wersją karty sprzed wprowadzenia `time_window`; dodanie samego `time_window.duration` (nadpisanie szerokości) zmienia wyłącznie szerokość okna, nie resetując pozostałych parametrów do wartości „pustych” zamiast presetu.
- **SC-005**: Co najmniej jeden recenzent lub tester zewnętrzny względem implementacji potwierdza na podstawie dokumentacji wiki, że potrafi odtworzyć dwa przykłady z specyfikacji (np. „dwa kolejne miesiące” i „month_over_year”) bez wsparcia autora kodu.
- **SC-006**: Przy celowo błędnym `time_window` (np. `step: 0`) użytkownik widzi komunikat błędu na karcie i **nie** widzi wykresu z seriami danych (stan utrzymuje się do poprawy konfiguracji).
- **SC-007**: Przy poprawnej konfiguracji z `count: 1` użytkownik widzi **jedną** serię danych na wykresie, **brak** komunikatu błędu z FR-014, brak metryk porównawczych wymagających drugiego okna oraz tooltip z **co najwyżej** jedną wartością liczbową dla punktu.
- **SC-008**: Przy `count: 25` (lub równoważnym żądaniu > 24 okien) użytkownik widzi komunikat błędu na karcie i **nie** widzi wykresu z seriami danych, zgodnie z FR-016 i FR-014.

## Out of Scope

- Zmiana modelu encji Home Assistant poza kartą.
- Nowe pola w edytorze wizualnym dla każdego parametru `time_window` (poza ewentualnym istniejącym edytorem YAML).
- Zapisywanie wielu konfiguracji okien po stronie serwera HA.
