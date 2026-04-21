# Feature Specification: Figma-aligned Energy Horizon Card UI (v0.5.0)

**Feature Branch**: `001-figma-ui-rollout`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Zaplanuj wdrożenie nowego UI według projektu z Figmy." (rozszerzone wytycznymi `specs/001-figma-ui-rollout/figma-ui-project-source.md` oraz interpretacją `specs/001-figma-ui-rollout/figma-ui-project-source.md`)

## Design authority & scope

- **Wzorzec wizualny i semantyka pól** muszą być zgodne z dokumentem repozytorium **`specs/001-figma-ui-rollout/figma-ui-project-source.md`** (sekcje §1–§8: hierarchia warstw, reguły wykresu §2.1–2.2, komponenty §3, tokeny §4, backlog różnic §5, podział pracy §6, decyzje §7).  
- **Źródło w Figmie (referencja):** plik `AbPnTcmRe6WhVGpJt8U6Xj`, węzeł ramki `113:437` — *Energy Horizon Card v0.5.0* (URL w `specs/001-figma-ui-rollout/figma-ui-project-source.md`).  
- **Zakres produktu:** karta **Energy Horizon** w wariancie Lovelace `custom:energy-horizon-card` — **bez zmiany kontraktu** identyfikatora karty i **bez zmiany sposobu pobierania danych** z Home Assistant (Long-Term Statistics), o ile niniejsza specyfikacja nie uzasadni wyjątku (brak wyjątków w wersji v0.5.0 poza doprecyzowaniem pola **Total** wg §1.3).  
- **Poza zakresem:** rebranding innych kart dashboardu, edycja pliku Figma, obowiązkowy Code Connect (ew. przyszła praca procesowa).

## Clarifications

### Session 2026-04-09

- Q: Czy komunikat o niepełnej serii referencyjnej ma być tylko w sekcji Warning na dole, czy duplikowany w panelu podsumowań? → A: **Tylko** sekcja Warning na dole — **bez** powtórzenia pełnego tekstu w bloku podsumowań (opcja A).
- Q: Jak etykietować oś X wykresu, gdy seria bieżąca **nie** jest wyświetlana? → A (+ baseline): **Bez** nakazu reguły „3 etykiety” z US-6; etykiety osi X **jak w ostatnim wydaniu karty przed wdrożeniem UI v0.5.0** (brak regresji liczby i rozkładu względem tej wersji referencyjnej).
- Q: Czy przy wyłączonym tytule karty pokazywać nadal `entity_id`? → B: Przy wyłączonym tytule **ukryć** także podtytuł `entity_id` — brak linii tekstowych nagłówka (spójnie z typową kartą Lovelace; opcja B).
- Q: Zachowanie **chipa delty** przy zerze / braku danych? → **Zawsze widoczny**; wartość **zerowa** (bezwzględna + **0%**) to pełnoprawna informacja — prezentacja **w tej samej jednostce i formacie** co wartości panelu (formatter / konfiguracja).  
- Q: Jednostka w placeholderze **`---`** przy braku danych w chipie? → **B (+ fallback):** sufiks jednostki **zgodny z seriami danych i formatowaniem z konfiguracji** (ten sam mechanizm co wartości w panelu); wygląd: **`--- <jednostka> | -- %`**; jeśli jednostka jest **niedostępna** — **`---`** **bez** sufiksu jednostki, potem **`| -- %`** (separator jak w makiecie; i18n — w planie).
- Q: Gdy w konfiguracji wyłączona jest prognoza (`show_forecast: false` / alias `forecast: false`), jak zachować panel **Forecast \| Total**? → A: **Ukryć cały** drugi panel (brak bloku **Forecast \| Total** w UI); spójnie z dotychczasowym zachowaniem wersji 0.4.x — **bez** osobnego trybu „tylko Total”.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Nagłówek: tytuł, podtytuł encji, ikona (Priority: P1)

**Jako** użytkownik dashboardu Home Assistant  
**chcę** — gdy tytuł jest włączony — widzieć **drugi wiersz z kodową nazwą encji** (`entity_id`) obok **przyjaznej nazwy**, oraz **ikonę encji w kontenerze o stałym rozmiarze** zgodnie z konfiguracją  
**aby** odróżnić nazwę wyświetlaną od identyfikatora używanego w YAML i narzędziach diagnostycznych.

**Why this priority**: Tożsamość karty i zaufanie do danych — bez tego użytkownicy mylą encje przy wielu kartach.

**Independent Test**: Karta z **włączonym** tytułem i ikoną; wizualnie i w inspekcji widać `entity_id` jako odrębny podtytuł oraz ikonę w kontenerze **42×42 px** z ikoną **24 px** (Material Design Icons przez mechanizm ikon Home Assistant), **bez** importu assetów rastrowych z Figmy. Gdy tytuł jest **wyłączony** — brak linii z `entity_id` (patrz **Clarifications**).

**Acceptance Scenarios**:

1. **Given** włączony tytuł oraz encja z przyjazną nazwą i `entity_id`, **When** karta wyświetla nagłówek, **Then** pierwszy wiersz pokazuje przyjazny tytuł (jak dotychczas), a drugi — **wyłącznie** kodową nazwę encji, stylistycznie jak podtytuł kontekstowy w makiecie (`specs/001-figma-ui-rollout/figma-ui-project-source.md` §2 Card Header, §4 kolory kontekstowe / motyw HA).  
2. **Given** konfiguracja z włączoną ikoną, **When** render nagłówka, **Then** ikona jest w **kółku 42×42 px** z ikoną **24 px** (`ha-icon` / `ha-state-icon`), zgodnie z §7 `specs/001-figma-ui-rollout/figma-ui-project-source.md`.  
3. **Given** włączony tytuł i wymaganie projektowe **1** (nagłówek), **When** weryfikacja, **Then** spełnione jest: tytuł + podtytuł `entity_id` + kontener ikony jak wyżej.  
4. **Given** tytuł karty **wyłączony** w konfiguracji (odpowiednik `show_title: false` / aktualnego przełącznika karty), **When** render nagłówka, **Then** **ani** przyjazny tytuł, **ani** podtytuł z `entity_id` **nie** są wyświetlane; zachowanie ikony — zgodnie z istniejącą opcją pokazywania ikony, **bez** narzucania zmiany tego kontraktu w ramach tej decyzji.

---

### User Story 2 — Panel porównania okresów: układ dwukolumnowy i jeden chip delty (Priority: P1)

**Jako** użytkownik  
**chcę** bieżący i referencyjny okres w **układzie dwukolumnowym** z podpisami (caption) oraz **jednym chipsem** różnicy (wartość bezwzględna i procent w jednym elemencie)  
**aby** szybciej czytać porównanie bez długiej listy wierszy podsumowania.

**Why this priority**: Główna wartość karty to porównanie okresów — layout bezpośrednio wpływa na czytelność.

**Independent Test**: Widok karty z danymi `summary.*`; układ odpowiada panelowi *Data series info* z `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2 (Current / Reference, Data status, Delta status); **sens biznesowy** skumulowanych „do dziś” bez zmiany względem obecnej logiki, o ile nie wymuszono doprecyzowania **Total**; **chip delty** — zgodnie z **Clarifications** (zawsze widoczny, zasady zera i braku danych). Teksty *Data series caption* są generowane przez `formatCompactPeriodCaption` (skrócone miesiące, strefa HA, opcjonalnie `time_format`) — patrz `src/card/labels/compact-period-caption.ts`.

**Acceptance Scenarios**:

1. **Given** aktywne okno bieżące i referencyjne, **When** użytkownik patrzy na pierwszy panel, **Then** widzi dwie kolumny z wartościami i podpisami okresów oraz **jeden** element delty z separatorem (np. kWh | %), kolory semantyczne z **motywu** Home Assistant (nie sztywne kolory z pikseli makiet — `specs/001-figma-ui-rollout/figma-ui-project-source.md` §4.0, §5 pkt 1).  
2. **Given** znana różnica **zerowa**, **When** render pierwszego panelu, **Then** chip delty **pozostaje widoczny** i pokazuje **zero** jako wartość merytoryczną w **jednostce i formacie** zgodnym z formatterem karty (oraz **0%**), bez ukrywania chipa.  
3. **Given** brak danych do wyświetlenia delty (niedostępne `summary.difference` / `summary.differencePercent` lub równoważnik), **When** render, **Then** chip delty **nadal widoczny**: lewy segment **`---`** plus **jednostka z formattera / konfiguracji** (jak wartości w panelu), separator, prawy segment **`-- %`**; **Given** jednostka niedostępna, **Then** lewy segment to wyłącznie **`---`** (bez sufiksu), potem **`| -- %`** (**Clarifications**).

---

### User Story 3 — Panel Forecast | Total z poprawną semantyką Total (Priority: P1)

**Jako** użytkownik  
**chcę** — gdy prognoza jest **włączona** w konfiguracji — widzieć **prognozę na cały bieżący okres** obok **całkowitego zużycia w całym okresie referencyjnym**  
**aby** nie mylić „koniec okresu” z „do dzisiaj” z pierwszego panelu.

**Why this priority**: Błędna semantyka Total podważa zaufanie do prognozy i porównań.

**Independent Test**: Przy **włączonej** prognozie i presecie typu „month over year” **Total** = suma zużycia za **cały** miesiąc referencyjny z danych statystyk długoterminowych; **Forecast** = prognoza na **cały** bieżący okres (`specs/001-figma-ui-rollout/figma-ui-project-source.md` §1.3, §5 pkt 2, §7). Przy **wyłączonej** prognozie drugi panel **nie** jest renderowany (**Clarifications**).

**Acceptance Scenarios**:

1. **Given** włączona prognoza (`show_forecast` nie jest `false`) oraz §1.3 (`specs/001-figma-ui-rollout/figma-ui-project-source.md`), **When** wyświetlany jest drugi panel, **Then** etykiety i liczby odpowiadają: **Forecast** → pełny bieżący okres; **Total** → pełny okres referencyjny (nie „do dziś” ani skrót z pierwszego panelu).  
2. **Given** brak pełnych danych referencyjnych, **When** Total nie może być wiarygodnie wyliczone, **Then** karta stosuje istniejące reguły braków / ostrzeżeń (spójnie z US-5).  
3. **Given** prognoza **wyłączona** (`show_forecast: false` lub równoważnik), **When** render karty, **Then** **cały** blok drugiego panelu (**Forecast \| Total**) **nie** występuje w UI (**Clarifications**).

---

### User Story 4 — Inteligentny komentarz: tekst i ikona trendu (Priority: P2)

**Jako** użytkownik  
**chcę** ten sam komunikat narracyjny co obecnie (`textSummary`), ale w **panelu z ikoną** odzwierciedlającą trend względem referencji (wyżej / niżej / podobnie)  
**aby** trend był czytelny wizualnie i spójny z deltą na wykresie (US-6).

**Why this priority**: Wzmocnienie komunikacji bez zmiany treści merytorycznej.

**Independent Test**: Trzy warianty ikony (Material Design Icons) mapowane z trendu: większe zużycie niż referencja → wariant „negatywny”; mniejsze → „pozytywny”; zbliżone → „neutralny”; przy braku referencji — **neutralna ikona** (spójnie z komunikatem „brak referencji”), zgodnie z ustaleniem domyślnym w **Założeniach**.

**Acceptance Scenarios**:

1. **Given** znany trend porównania, **When** render panelu komentarza, **Then** ikona i kolorystyka są spójne z **linią delty „dziś”** na wykresie (wymaganie szczegółowe **3** poniżej; `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2 Inteligent comment, §3 Comment icon, §7).  
2. **Given** wymaganie szczegółowe **3**, **When** weryfikacja, **Then** mapowanie kolorów/stanów: wyższe / niższe / podobne odpowiada trzem stanom wizualnym ikony i delty.

---

### User Story 5 — Ostrzeżenia w osobnej sekcji (Priority: P2)

**Jako** użytkownik  
**chcę** ostrzeżenia (np. niepełna seria referencyjna) w **osobnym pasku/sekcji** u dołu karty  
**aby** nie ginęły w bloku statystyk.

**Why this priority**: Widoczność problemów jakości danych.

**Independent Test**: Gdy `summary` sygnalizuje niepełną referencję, **pełny** komunikat pojawia się **wyłącznie** w sekcji **Warning status** u dołu karty (`specs/001-figma-ui-rollout/figma-ui-project-source.md` §2, §5 pkt 4) — **bez** duplikatu (tego samego pełnego tekstu) w panelu podsumowań.

**Acceptance Scenarios**:

1. **Given** niepełna seria referencyjna, **When** karta się renderuje, **Then** ostrzeżenie jest widoczne w dedykowanej sekcji na dole, z treścią zgodną z istniejącymi tłumaczeniami / kluczami (i18n), a **ten sam** pełny tekst **nie** występuje jednocześnie jako notatka / wiersz w bloku podsumowań powyżej.  
2. **Given** wiele komunikatów ostrzeżeń w przyszłości, **When** v0.5.0, **Then** zachowanie minimalne: **co najmniej** obecny przypadek niepełnej referencji jest obsłużony; dalsze priorytety wielu ostrzeżeń — poza minimalnym MVP (patrz Założenia).

---

### User Story 6 — Wykres: „dziś”, delta, kropki, osie (Priority: P1)

**Jako** użytkownik  
**chcę** wykresu zgodnego z makietą: pion „dziś” na **pełną wysokość** obszaru wykresu, **kolorowa delta** między seriami w bieżącym agregacie, zaktualizowana kropka serii referencyjnej oraz **ograniczone etykiety osi** przy zachowanej siatce  
**aby** odczyt był spójny z resztą karty i czytelny na wąskich układach.

**Why this priority**: Wykres jest centralnym miejscem eksploracji w czasie.

**Independent Test**: Wizualna i behawioralna zgodność z `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2.1–2.2 oraz wymaganiami szczegółowymi **2–6** poniżej; reguła **3 etykiet osi X** (wymaganie **5**) dotyczy wyłącznie sytuacji, gdy **seria bieżąca jest wyświetlana** na wykresie — w przeciwnym razie patrz **Clarifications** (baseline etykiet).

**Acceptance Scenarios**:

1. **Given** wyświetlany jest wykres z oznaczeniem dnia bieżącego, **When** użytkownik ocenia pion „dziś”, **Then** linia biegnie od **podstawy** wykresu (zero) do **górnej krawędzi** obszaru rysowania — **nie** kończy się na poziomie wyższego z punktów serii tego dnia (wymaganie **2**; `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2.1, warstwa pionu „dziś”).  
2. **Given** obie serie w bieżącym agregacie, **When** render delty, **Then** widoczny jest pionowy odcinek **między** wartością bieżącą a referencyjną w agregacie „dziś”, w **trzech stanach kolorystycznych** zgodnych z US-4 (wymaganie **3**; `DeltaLineToday`).  
3. **Given** seria referencyjna z punktem „dziś”, **When** render, **Then** kropka referencyjna jest **wizualnie zgodna z bieżącą makietą** w Figmie, nie ze starym zrzutem eksportu (wymaganie **4**).  
4. **Given** seria bieżąca **jest wyświetlana** na wykresie, **When** etykiety osi poziomej, **Then** widoczne są **tylko trzy** etykiety tekstowe: pierwszy agregat, bieżący agregat (dziś, możliwe wyróżnienie typograficzne), ostatni agregat; pozostałe bez etykiet (wymaganie **5**).  
5. **Given** seria bieżąca **nie jest wyświetlana** na wykresie (np. ukryta w konfiguracji), **When** etykiety osi poziomej, **Then** **brak regresji** względem **ostatniego wydania karty przed wdrożeniem UI v0.5.0** — liczba i rozkład etykiet jak w tej wersji referencyjnej (patrz **Clarifications**).  
6. **Given** standardowy widok wykresu, **When** siatka pionowa wartości, **Then** są **5** linii pomocniczych poziomych, a na osi wartości **tylko trzy** etykiety: **0**, wartość **środkowa**, **maksimum** — jednostka czytelna, spójnie z formatowaniem wartości (wymaganie **6**).

---

### User Story 7 — Motyw Home Assistant: kolory i typografia (Priority: P2)

**Jako** użytkownik motywów jasnego i ciemnego  
**chcę**, aby karta używała **zmiennych motywu** i **fontu dashboardu**  
**aby** wyglądała jak natywna karta Lovelace.

**Why this priority**: Spójność z resztą interfejsu i dostępność percepcyjna w różnych motywach.

**Independent Test**: Brak wymuszania sztywnych kolorów `#…` tam, gdzie motyw dostarcza semantyczny odpowiednik; typografia: wagi, rozmiary, kapitaliki jak w makiecie, **bez** wymuszania konkretnej nazwy kroju z Figmy (`specs/001-figma-ui-rollout/figma-ui-project-source.md` §4.0–4.4, §7).

**Acceptance Scenarios**:

1. **Given** zmiana motywu globalnego HA, **When** przełączenie jasny/ciemny, **Then** karta (łącznie z elementami wykresu wymagającymi odczytu kolorów z motywu) pozostaje czytelna i spójna z tokenami motywu.  
2. **Given** dokumentacja tokenów §4, **When** akcent marki karty (np. seria bieżąca) nie ma odpowiednika w motywie, **Then** dopuszczalna jest **pojedyncza** zmienna lokalna marki z sensownym fallbackiem (za `specs/001-figma-ui-rollout/figma-ui-project-source.md` §4.0).

---

### User Story 8 — Wielojęzyczność i edytor karty (Priority: P2)

**Jako** użytkownik wielojęzyczny lub konfigurujący kartę w edytorze graficznym  
**chcę** poprawnych tłumaczeń dla nowych etykiet layoutu oraz działającego edytora po zmianach  
**aby** nie regresować istniejących przepływów.

**Why this priority**: Regresje konfiguracji i języka blokują adopcję.

**Independent Test**: Zaktualizowane pliki locale dla wszystkich obsługiwanych języków karty; edytor pozwala konfigurować istniejące opcje i ewentualne **nowe** opcje wynikające z tej specyfikacji (jeśli pojawią się).

**Acceptance Scenarios**:

1. **Given** nowe lub zmienione stringi UI, **When** zmiana języka interfejsu HA, **Then** karta pokazuje przetłumaczone etykiety bez brakujących kluczy.  
2. **Given** edytor Lovelace, **When** użytkownik edytuje kartę, **Then** zachowanie edytora jest zgodne z kontraktem karty (typy, walidacja) po zmianach layoutu.

---

### User Story 9 — Regresja i pokrycie testami (Priority: P3)

**Jako** osoba utrzymująca projekt  
**chcę** automatycznych testów dla logiki danych i krytycznych ścieżek prezentacji  
**aby** refaktor UI nie wprowadzał regresji.

**Why this priority**: Długoterminowa stabilność przy gęstym układzie warunków brzegowych (LTS, okna czasu).

**Independent Test**: Testy jednostkowe pokrywają m.in. semantykę **Total**, mapowanie trendu → stany wizualne, formatowanie podsumowań; smoke renderu tam, gdzie ma sens.

**Acceptance Scenarios**:

1. **Given** zmiana w module danych lub podsumowania, **When** uruchomienie zestawu testów w repozytorium, **Then** regresje wykrywane są przed scaleniem (proces zespołu).

---

### User Story 10 — Opcjonalna widoczność sekcji UI (Priority: P2)

**Jako** użytkownik konfigurujący kartę  
**chcę** móc **osobno** włączać i wyłączać widoczność panelu porównania (*Data series info*), panelu Forecast \| Total (*Surface Container*) oraz bloku komentarza narracyjnego (*Inteligent comment*) — w YAML i w edytorze wizualnym  
**aby** uprościć układ dashboardu bez tracenia danych na wykresie tam, gdzie to ma sens (np. ukryty panel Forecast \| Total przy widocznej linii prognozy).

**Why this priority**: Elastyczność layoutu przy zachowaniu istniejącej semantyki danych i regresji `show_forecast`.

**Independent Test**: Przy pełnym stanie `ready` i danych dla wszystkich sekcji: każda flaga `show_* === false` usuwa odpowiedni region z DOM; `show_forecast: false` usuwa panel Forecast \| Total **niezależnie** od `show_forecast_total_panel`.

**Acceptance Scenarios**:

1. **Given** `show_comparison_summary: false`, **When** render przy dostępnym `summary`, **Then** brak `.ebc-section--comparison`.  
2. **Given** `show_forecast_total_panel: false` oraz prognoza włączona i dane prognozy aktywne, **When** render, **Then** brak `.ebc-section--forecast-total`; linia prognozy na wykresie zgodna z `show_forecast` (bez zmiany istniejącej logiki linii).  
3. **Given** `show_narrative_comment: false`, **When** render przy zbudowanym narracyjnym tekście, **Then** brak `.ebc-section--comment`.  
4. **Given** `show_forecast: false` i `show_forecast_total_panel: true`, **When** render, **Then** panel Forecast \| Total **nie** występuje (**Clarifications** — bez zmiany wstecznej).

---

### Edge Cases

- Encja bez przyjaznej nazwy lub bez ikony — przy **włączonym** tytule nadal pokazuj `entity_id` w drugiej linii; ikona zachowuje się jak w standardzie HA dla braków. Przy **wyłączonym** tytule — brak linii z `entity_id` (**Clarifications**, opcja B).  
- Brak danych referencyjnych — trend „nieznany”; komentarz i ikona wg **Założeń**; delta i kolory bez wprowadzania w błąd.  
- Bardzo wąska karta — layout zachowuje czytelność (zawijanie, minimalne odstępy zgodne z makietą §3 Auto Layout); etykiety osi jak w US-6 (3 etykiety X przy widocznej serii bieżącej; inaczej baseline z **Clarifications**).  
- Niepełna seria referencyjna — **pełne** ostrzeżenie tylko w sekcji Warning na dole (US-5; brak duplikatu w panelu podsumowań); wartości zależne od referencji gracefully degradują.  
- Różne presety okien czasu — semantyka Forecast/Total skalowana jak w §1.3 **o ile** drugi panel jest widoczny (patrz **Clarifications**: przy `show_forecast: false` panelu nie ma).  
- Prognoza wyłączona — **brak** drugiego panelu (**Forecast \| Total**); użytkownik polega na pierwszym panelu i wykresie jak w 0.4.x (**Clarifications**).  
- Delta zerowa — chip **widoczny**, wartości sformatowane jak przy danych (jednostka z formattera + **0%**; **Clarifications**). Brak danych do delty — chip **widoczny**: **`--- <jednostka z formattera> | -- %`**, a przy niedostępnej jednostce **`--- | -- %`**.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Karta **MUSI** zachować identyfikator Lovelace `custom:energy-horizon-card` i istniejący sposób pobierania **statystyk długoterminowych** encji, z wyjątkiem doprecyzowania wyliczenia/wystawienia **Total** dla pełnego okna referencyjnego zgodnie z US-3. **Wystawienie** wartości **Total** w UI dotyczy wyłącznie przypadku, gdy drugi panel jest widoczny (prognoza **włączona**; **Clarifications**).  
- **FR-002**: Nagłówek **MUSI** spełniać US-1 oraz wymaganie szczegółowe **1** (sekcja poniżej), w tym: przy wyłączonym tytule **brak** podtytułu `entity_id` (**Clarifications**).  
- **FR-003**: Pierwszy panel podsumowania **MUSI** spełniać US-2 (layout, jeden chip delty, dane `summary.*`); chip delty **MUSI** być **zawsze** widoczny — **zero** bezwzględne i **0%** jako pełna informacja, w **jednostce i formacie** z formattera; przy braku danych — **`---` + jednostka z formattera** + **`| -- %`**, a gdy jednostka niedostępna — **`---` bez sufiksu** + **`| -- %`** (**Clarifications**).  
- **FR-004**: Gdy prognoza jest **włączona** (`show_forecast` nie jest `false`), drugi panel **MUSI** spełniać US-3 (Forecast | Total wg §1.3 `specs/001-figma-ui-rollout/figma-ui-project-source.md`). Gdy prognoza jest **wyłączona**, **cały** drugi panel **MUSI** być **ukryty** (**Clarifications**).  
- **FR-005**: Sekcja komentarza narracyjnego **MUSI** spełniać US-4 (tekst + ikona trendu, spójność z deltą).  
- **FR-006**: Ostrzeżenia **MUSY** być prezentowane zgodnie z US-5; komunikat o niepełnej serii referencyjnej — **jedno** miejsce prezentacji pełnego tekstu (strip na dole), **bez** równoległego pełnego komunikatu w panelu podsumowań.  
- **FR-007**: Wykres **MUSI** spełniać US-6 oraz wymagania szczegółowe **2–6**.  
- **FR-008**: Kolorystyka i typografia **MUSZĄ** respektować US-7 i mapowanie tokenów z `specs/001-figma-ui-rollout/figma-ui-project-source.md` §4.  
- **FR-009**: Tłumaczenia i edytor **MUSZĄ** spełniać US-8.  
- **FR-010**: Pokrycie testami **MUSI** spełniać US-9 na poziomie uzgodnionym w planie implementacji.
- **FR-011**: Karta **MUSI** akceptować opcjonalne pola `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment` w `CardConfig`; domyślnie sekcje są **widoczne**, gdy klucz jest pominięty lub wartość nie jest `false` (spójnie z `show_title` / `show_icon`).  
- **FR-012**: Edytor Lovelace **MUSI** eksponować te trzy pola w trybie wizualnym (`ha-form`, selektory boolean), z etykietami z tłumaczeń karty; tryb YAML pozostaje nadrzędny zgodnie z kontraktem 005-gui-editor.  
- **FR-013**: Gdy `show_forecast` jest `false` (lub alias `forecast: false`), **cały** panel Forecast \| Total **MUSI** pozostać ukryty (**Clarifications**), niezależnie od `show_forecast_total_panel`.

### Wymagania szczegółowe — nagłówek i wykres (kryteria akceptacji)

Te punkty **MUSZĄ** być zweryfikowane przy odbiorze; odniesienie projektowe: `specs/001-figma-ui-rollout/figma-ui-project-source.md` §2.1–2.2, §7.

1. **Nagłówek:** Gdy **tytuł jest włączony** — oprócz **tytułu** wyświetlany jest **podtytuł** z **kodową nazwą encji** (`entity_id`), odrębnie od przyjaznej nazwy; styl podtytułu zgodny z semantyką „kontekst” w makiecie, przez zmienne motywu HA. Gdy tytuł **jest wyłączony** — **nie** wyświetlaj podtytułu `entity_id` (**Clarifications**, opcja B).  
2. **Pion „dziś”:** Od zera (podstawa wykresu) do **górnej krawędzi** obszaru wykresu; **nie** kończy się na poziomie wyższego z punktów serii w dniu bieżącym.  
3. **Linia delty (dziś):** Pionowy odcinek **między** wartością serii bieżącej i referencyjnej w **bieżącym agregacie**; **trzy stany kolorystyczne** spójne z ikoną komentarza / trendem (`wyżej` / `niżej` / `podobnie`; `nieznany` jak w Założeniach).  
4. **Kropka serii referencyjnej („dziś”):** Wizualnie zgodna z **aktualną** warstwą w projekcie Figma (nie ze starym eksportem).  
5. **Oś pozioma:** Gdy seria bieżąca **jest wyświetlana** na wykresie — **trzy** etykiety: pierwszy agregat, bieżący (dziś), ostatni; pozostałe bez etykiet. Gdy seria bieżąca **nie** jest wyświetlana — **bez** tego nakazu; etykiety osi X **jak w ostatnim wydaniu karty przed wdrożeniem UI v0.5.0** (brak regresji względem baseline; patrz **Clarifications**).  
6. **Oś wartości i siatka:** **Pięć** linii pomocniczych poziomych; **trzy** etykiety wartości: 0, środek, maksimum; jednostka czytelna.

### Non-functional requirements

- **NFR-001**: Karta **POWINNA** zachować czytelność przy typowych szerokościach kolumn dashboardu (w tym wąskich), bez poziomego przewijania treści merytorycznej.  
- **NFR-002**: Kontrast i rozmiary tekstu **POWINNY** być zgodne z oczekiwaniami dostępności w kontekście motywów HA (bez fixed low-contrast hex z makiet jako jedynego źródła).  
- **NFR-003**: Czas pierwszego sensownego wyświetlenia karty **POWINIEN** pozostać porównywalny z obecną wersją przy tym samym zakresie danych (brak regresji „zauważalnego zamrożenia” UI).

### Key Entities

- **Encja zużycia energii**: źródło Long-Term Statistics; atrybuty: `entity_id`, przyjazna nazwa, ikona stanu.  
- **Okno czasu bieżące / referencyjne**: zakres dat agregacji; powiązane skumulowane wartości „do dziś” w pierwszym panelu.  
- **Podsumowanie (`summary`)**: m.in. skumulowane bieżące/referencyjne, różnica bezwzględna i względna, flagi niekompletności referencji.  
- **Prognoza końca okresu (Forecast)**: wartość dla **pełnego** bieżącego okna.  
- **Total referencyjny**: **całkowite** zużycie w **pełnym** oknie referencyjnym (LTS).  
- **Komentarz tekstowy (`textSummary`)**: narracja + trend semantyczny dla ikony i kolorów delty.  
- **Ostrzeżenie jakości danych**: komunikat o niepełnej serii referencyjnej (minimum); ewentualne rozszerzenia poza MVP.

## Assumptions

- Przy `trend === "unknown"` (brak referencji) stosuje się **neutralną** ikonę trendu i neutralny kolor delty, spójnie z komunikatem „brak referencji” (`text_summary.no_reference` / równoważnik).  
- **Kanał ostrzeżenia o niepełnej referencji:** potwierdzone w **Clarifications** — pełny tekst **tylko** w sekcji Warning na dole (nie duplikować w `.summary` / panelu podsumowań).  
- W v0.5.0 **wielokrotne ostrzeżenia** — tylko jeśli już występują w logice; priorytety kolejności dla wielu komunikatów poza minimalnym przypadkiem niepełnej referencji są **poza** zakresem MVP i zostaną dopisane przy kolejnej iteracji produktowej.  
- Ikony: wyłącznie **MDI** przez standardowe komponenty ikon Home Assistant — bez assetów z Figmy.  
- Modyfikacja pliku Figma **nie** jest częścią dostawy — weryfikacja wizualna przez link i dokument `specs/001-figma-ui-rollout/figma-ui-project-source.md`.  
- **Oś X bez serii bieżącej:** potwierdzone w **Clarifications** — zachowanie etykiet jak przed v0.5.0; plan implementacji może wskazać konkretny tag/commit baseline do testów regresji.  
- **`entity_id` przy wyłączonym tytule:** potwierdzone w **Clarifications** — ukryty razem z blokiem tytułu (opcja B).  
- **Chip delty:** potwierdzone w **Clarifications** — zawsze widoczny; zero w jednostce z formattera + **0%**; brak danych → **`---` + jednostka z formattera** lub samo **`---`** jeśli jednostki brak, potem **`| -- %`**.  
- **Panel Forecast \| Total przy wyłączonej prognozie:** potwierdzone w **Clarifications** — **ukryty w całości** (`show_forecast: false` / alias); brak wymogu pokazywania samego **Total** w osobnym panelu.  
- **Panel Forecast \| Total przy włączonej prognozie:** opcjonalnie ukrywalny sam panel UI przez `show_forecast_total_panel: false` (US-10), bez zmiany reguły **Clarifications** dla `show_forecast: false`.

## Dependencies & Risks

- **Zależności**: dostępność Long-Term Statistics encji w HA; spójność z istniejącym silnikiem okien czasu i agregacji karty.  
- **Ryzyka**: rozbieżność wyliczenia **Total** z oczekiwaniami użytkowników przy rzadkich lukach LTS — mitygacja przez ostrzeżenia (US-5) i testy regresji (US-9).  
- **Ryzyka**: złożoność konfiguracji osi wykresu przy „3 etykietach / 5 liniach siatki” — wymaga starannej walidacji wizualnej na kilku presetych okien.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: W testach akceptacyjnych z **co najmniej trzema** presetyami okien czasu (np. miesiąc do roku, tydzień, rok), przy **włączonej** prognozie, **100%** przypadków spełnia semantykę **Forecast** i **Total** zgodnie z §1.3 (`specs/001-figma-ui-rollout/figma-ui-project-source.md`) — bez zgłoszeń „Total to nie pełny referencyjny okres”. Przy wyłączonej prognozie drugi panel nie występuje (**Clarifications**).  
- **SC-002**: W recenzji wizualnej (jasny + ciemny motyw) **wszystkie** sekcje z US-1–US-7 są obecne i czytelne; **zero** krytycznych kontrastów poniżej subiektywnej progi „nie do zaakceptowania” przez recenzenta produktu.  
- **SC-003**: **100%** nowych lub zmienionych stringów UI posiada tłumaczenia we **wszystkich** językach, które karta deklaruje w repozytorium (US-8).  
- **SC-004**: Checklista wykresu (wymagania szczegółowe **2–6**) jest **w pełni** odhaczona w protokole testów przed oznaczeniem feature jako gotowej do wydania v0.5.0.  
- **SC-005**: Przed oznaczeniem wersji 0.5.0 jako gotowej do wydania **wszystkie** zautomatyzowane testy regresji zatwierdzone w planie implementacji przechodzą; brak znanych regresji w edytorze karty dla zdefiniowanych scenariuszy (US-8–US-9).

## Rollout phases & implementation backlog

Kolejność dla `/speckit.plan` / `/speckit.implement` (atomowe kawałki; dostosować do planu technicznego):

| Faza | Cel | Zadania (skrót) |
|------|-----|-----------------|
| **F1** | Fundament wizualny | Zmienne motywu Home Assistant i minimalny zestaw zmiennych marki karty wg §4; refaktor markupu na sekcje semantyczne (nagłówek, panele, wykres, komentarz, ostrzeżenie) z `specs/001-figma-ui-rollout/figma-ui-project-source.md` §6 pkt 1–2. |
| **F2** | Nagłówek i panele danych | US-1, US-2; typografia etykiet CAPS / caption wg §4.3; chip delty i Data status. |
| **F3** | Forecast / Total | US-3; warstwa danych: pełne LTS dla okna referencyjnego; spójność z edytorem jeśli potrzebne nowe pola. |
| **F4** | Komentarz i ostrzeżenia | US-4, US-5; mapowanie trend → ikona MDI; sekcja Warning na dole. |
| **F5** | Wykres | US-6; pion „dziś”, DeltaLineToday, kropki, 3 etykiety X / 5 split + 3 Y; kolory z motywu. |
| **F6** | i18n, testy, regresja | US-8, US-9; aktualizacja locale i edytora; testy jednostkowe i smoke. |

**Lista zadań do rozbicia w `tasks.md` (szkielet):** (1) style/tokeny §4, (2) markup sekcji, (3) nagłówek 42/24 + `entity_id`, (4) grid porównania + delta chip, (5) dane Total LTS + UI Forecast\|Total, (6) komentarz + ikony trendu, (7) warning strip, (8) opcje wykresu: today line, delta, dots, osie, (9) locale + editor, (10) testy.
