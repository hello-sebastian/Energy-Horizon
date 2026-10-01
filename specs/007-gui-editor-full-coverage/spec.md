# Feature Specification: Pełne pokrycie konfiguracji w edytorze GUI

**Feature Branch**: `007-gui-editor-full-coverage`
**Created**: 2026-09-30
**Status**: Draft
**Input**: Tylko część funkcji i atrybutów konfiguracyjnych karty ma swoje odpowiedniki w postaci wizualnych kontrolek w wizualnym konfiguratorze karty. Chciałbym dodać wszystkie pozostałe funkcje i atrybuty do graficznego konfiguratora karty. Utrzymaj formułę domenową specyfikacji, podstawową domeną jest 005-gui-editor. Zaplanuj również modyfikację README, README.advanced oraz wiki.

**Domena bazowa**: `005-gui-editor` (wizualny edytor konfiguracji). Niniejsza funkcja jest **rozszerzeniem** tej domeny — nie zmienia jej istniejących gwarancji (pełne przechowywanie `CardConfig`, tryb Visual/YAML, zdarzenie `config-changed`, lokalizacja etykiet), lecz rozszerza zbiór pól kontrolowanych wizualnie z 7 do **wszystkich** pól konfigurowalnych przez użytkownika.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Konfiguruję kartę w pełni wizualnie, bez YAML (Priority: P1)

Użytkownik, który nie chce edytować YAML, otwiera edytor karty i widzi **wszystkie** opcje konfiguracyjne pogrupowane w czytelne sekcje: nagłówek (tytuł, ikona), porównanie i okna czasowe, prognoza, styl wykresu (kolory, wypełnienia, legenda, luki) oraz lokalizacja i liczby. Każda opcja ma odpowiednią kontrolkę (przełącznik, suwak/pole liczbowe, lista rozwijana, pole tekstowe, dobieracz koloru/ikony).

**Why this priority**: To jest główna obietnica wartości funkcji — użytkownik kończy z edycją YAML dla typowych ustawień. Bez pełnego pokrycia pól użytkownik nadal musi sięgać po YAML, co unieważnia sens edytora.

**Independent Test**: Otwórz edytor karty i zweryfikuj, że każde pole konfigurowalne (z wyłączeniem stałego `type` i aliasu `forecast`) ma wizualną kontrolkę, że wartości istniejącej konfiguracji są wczytane, a zmiana dowolnego pola natychmiast aktualizuje podgląd karty.

**Acceptance Scenarios**:

1. **Given** karta ma istniejącą konfigurację YAML z ustawionymi polami (np. `primary_color`, `precision`, `show_legend`), **When** użytkownik otwiera edytor, **Then** każde z tych pól pokazuje swoją bieżącą wartość w odpowiedniej kontrolce.
2. **Given** edytor jest otwarty, **When** użytkownik zmienia `primary_color` na inny kolor, **Then** linia i wypełnienie bieżącej serii na wykresie aktualizują się natychmiast.
3. **Given** edytor jest otwarty, **When** użytkownik zmienia `precision` z 2 na 0, **Then** wartości w podsumowaniu i tooltipie wyświetlają się bez miejsc dziesiętnych.
4. **Given** edytor jest otwarty, **When** użytkownik włącza `show_legend`, **Then** legenda wykresu pojawia się natychmiast.
5. **Given** edytor jest otwarty, **When** użytkownik zmienia `aggregation` na `week`, **Then** wykres przelicza się na tygodniowe buckety i aktualizuje podgląd.
6. **Given** edytor jest otwarty, **When** użytkownik zmienia `number_format` na `comma`, **Then** liczby w UI używają przecinka jako separatora dziesiętnego.
7. **Given** edytor jest otwarty, **When** formularz renderuje się po raz pierwszy, **Then** sekcje podstawowe (`comparison` — encja/tytuł/porównanie, `header`, `forecast`) są widoczne, a sekcje zaawansowane (`time_window`, `chart_style`, `localization`, `date_formats`, `diagnostics`) są zwinięte (FR-018); rozwinięcie sekcji zaawansowanej pokazuje jej pola bez utraty wartości pozostałych pól.

---

### User Story 2 — Konfiguruję niestandardowe okna czasowe wizualnie (Priority: P2)

Zaawansowany użytkownik chce nadpisać domyślne okno czasowe presetu (np. zmienić zakotwiczenie, czas trwania, liczbę okien) bez pisania YAML. W edytorze widzi sekcję „Okno czasowe" z kontrolkami dla pól `time_window` (`anchor`, `offset`, `duration`, `step`, `count`, `aggregation`).

**Why this priority**: `time_window` to najbogatsze pole konfiguracyjne (obiekt zagnieżdżony). Jego wizualna edycja zamyka ostatnią dużą lukę w edytorze. Jest P2, bo mniej użytkowników niż P1, ale dla zaawansowanych użytkowników jest kluczowe.

**Independent Test**: Otwórz edytor, zmień w sekcji okna czasowego `duration` i `count`, zweryfikuj że karta przelicza okna i aktualizuje wykres, oraz że nieprawidłowa wartość (np. `duration: "abc"`) daje czytelny błąd inline.

**Acceptance Scenarios**:

1. **Given** karta używa presetu `year_over_year`, **When** użytkownik w sekcji okna czasowego ustawia `count: 3`, **Then** karta renderuje trzecie (kontekstowe) okno w tle wykresu.
2. **Given** edytor jest otwarty, **When** użytkownik wpisze nieprawidłowy `duration` (np. `"abc"`), **Then** edytor pokazuje czytelny błąd inline przy polu, a karta przechodzi w czytelny stan błędu (komunikat + brak wykresu) do czasu poprawy — konfiguracja jest emitowana normalnie (wzorzec domeny 005: emit przy każdej zmianie).
3. **Given** karta ma `time_window` w YAML, **When** użytkownik otwiera edytor, **Then** sekcja okna czasowego pokazuje bieżące wartości (lub wartości domyślne presetu, gdy pole nie jest ustawione).
4. **Given** użytkownik zmienił pola okna czasowego, **When** zapisze konfigurację, **Then** zapisany YAML zawiera pełny obiekt `time_window` z nadpisanymi polami, a pozostałe pola karty są nietknięte.

---

### User Story 3 — Dokumentacja odzwierciedla pełny edytor (Priority: P2)

Użytkownik czytający dokumentację (README, README.advanced, wiki) dowiaduje się, które pola są konfigurowalne wizualnie, a które wymagają YAML, oraz jak użyć edytora. Dokumentacja jest spójna z implementacją.

**Why this priority**: Bez aktualizacji dokumentacji użytkownicy nie wiedzą, że edytor obsługuje wszystkie pola — funkcja nie zostaje odkryta. Jest P2, bo nie blokuje działania edytora, ale jest wymagana przez konstytucję (zmiany funkcjonalne wymagają aktualizacji dokumentacji).

**Independent Test**: Po wdrożeniu zweryfikuj, że README, README.advanced i wiki zawierają pełną tabelę pól edytora (pole → typ kontrolki → domyślna wartość) i że nie ma sprzeczności z implementacją.

**Acceptance Scenarios**:

1. **Given** funkcja jest wdrożona, **When** użytkownik czyta sekcję edytora w `README.md`, **Then** widzi listę wszystkich pól konfigurowalnych wizualnie, pogrupowanych w sekcje.
2. **Given** funkcja jest wdrożona, **When** użytkownik czyta sekcję „Lovelace editor" w `README.advanced.md`, **Then** widzi pełną tabelę mapującą każde pole na typ kontrolki i domyślną wartość.
3. **Given** funkcja jest wdrożona, **When** użytkownik otwiera wiki, **Then** strona `Configuration-and-Customization` zawiera pełną tabelę pól edytora (pole → kontrolka → domyślna wartość → uwagi), a `Documentation-Maintenance` odnosi się do edytora w Spec anchors i drift-checku.
4. **Given** dokumentacja jest zaktualizowana, **When** porówna się ją z implementacją, **Then** nie ma pól opisanych jako „YAML-only", które w rzeczywistości mają kontrolkę wizualną (i odwrotnie).

---

### User Story 4 — Etykiety edytora są zlokalizowane we wszystkich językach (Priority: P3)

Użytkownik z niemieckim lub francuskim interfejsem HA otwiera edytor. Wszystkie etykiety pól i teksty opcji (np. nazwy `aggregation`, `number_format`, `force_prefix`) są wyświetlane w jego języku.

**Why this priority**: Karta wspiera lokalizację (en/pl/de/fr). Edytor musi być spójny z istniejącym podejściem i18n. Jest P3, bo angielskie etykiety są funkcjonalne; pełna lokalizacja to usprawnienie jakości.

**Independent Test**: Ustaw język UI HA na niemiecki/francuski, otwórz edytor i zweryfikuj, że wszystkie etykiety i opcje są przetłumaczone.

**Acceptance Scenarios**:

1. **Given** język frontendu HA to niemiecki, **When** użytkownik otwiera edytor, **Then** wszystkie etykiety pól i teksty opcji są po niemiecku.
2. **Given** język frontendu HA to francuski, **When** użytkownik otwiera edytor, **Then** wszystkie etykiety pól i teksty opcji są po francusku.
3. **Given** brak jest tłumaczenia dla danego klucza w danym języku, **When** edytor renderuje pole, **Then** etykieta degraduje się do angielskiego (nie pokazuje surowego klucza).

---

### Edge Cases

- Co się dzieje, gdy użytkownik wyczyści pole `entity` (wybierze brak encji)? → Edytor emituje `config-changed` natychmiast z `entity: ""` (standardowe zachowanie HA — bez tłumienia, bez cofania). Karta obsługuje stan pustej encji istniejącym UI „brak danych"/„ładowanie". Edytor nie może crashnąć ani blokować zdarzenia.
- Co się dzieje, gdy bieżąca konfiguracja YAML zawiera nieznane wartości (np. literówka w `force_prefix`, `aggregation`, `number_format`)? → Kontrolka pokazuje pusty/domyślny wybór bez rzucania błędu; wartość jest przechowywana nietknięta w pełnym `CardConfig` i emitowana bez zmian.
- Co się dzieje, gdy `time_window` w YAML ma nieprawidłowe pola (np. `duration: "abc"`)? → Edytor pokazuje czytelny błąd inline przy polu; konfiguracja (wraz z nieprawidłową wartością) jest emitowana normalnie, a karta przechodzi w czytelny stan błędu (komunikat + brak wykresu) do czasu poprawy — wzorzec domeny 005/001-time-windows-engine.
- Co się dzieje, gdy `x_axis_format`/`tooltip_format` to nieprawidłowy wzorzec? → Edytor pokazuje czytelny błąd inline (spójny z walidacją karty) i emituje konfigurację normalnie; karta nie przechodzi w stan błędu przez sam fakt otwarcia edytora, lecz reaguje na nieprawidłowy wzorzec swoim istniejącym zachowaniem walidacji.
- Co się dzieje, gdy `hass` nie jest dostępne (np. podczas inicjalizacji)? → Edytor renderuje formularz w trybie zdegradowanym bez crashu (etykiety po angielsku).
- Co się dzieje, gdy użytkownik edytuje pole w trybie YAML, które ma też kontrolkę wizualną (np. `entity`)? → Tryb YAML jest autorytatywny; po powrocie do trybu Visual kontrolki odzwierciedlają wartości z YAML (YAML wygrywa).
- Co się dzieje, gdy `window.jsyaml` nie jest dostępne w runtime? → Przycisk przełącznika trybu YAML jest ukryty; edytor działa w trybie Visual-only (zachowanie z 005).
- Co się dzieje, gdy użytkownik zmieni pole, a karta nie ma jeszcze `hass` (brak podglądu)? → Edytor nadal emituje `config-changed`; karta zaktualizuje podgląd, gdy `hass` się pojawi.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Edytor MUSI wystawiać wizualne kontrolki dla **wszystkich** pól `CardConfig` konfigurowalnych przez użytkownika, z wyłączeniem stałego `type` (zawsze `custom:energy-horizon-card`) i aliasu `forecast` (zmerżonego w `show_forecast` podczas normalizacji).
- **FR-002**: Edytor MUSI zachować bez zmian istniejące zachowanie z domeny 005-gui-editor: pełne przechowywanie `CardConfig` w prywatnym `_config`, płytkie merge'owanie zmian formularza, tryb Visual/YAML, zdarzenie `config-changed` (bubbles + composed), `getConfigElement()`/`getStubConfig()`, lokalizację etykiet przez `computeLabel`.
- **FR-003**: Edytor MUSI dodawać kontrolki dla pól **nagłówka**: `show_title` (przełącznik), `icon` (dobieracz ikony), `show_icon` (przełącznik).
- **FR-004**: Edytor MUSI dodawać kontrolki dla pól **porównania i okien czasowych**: `aggregation` (top-level; lista: `auto`/hour/day/week/month), `period_offset` (pole liczbowe), `time_window` (zagnieżdżona sekcja: `anchor`, `offset`, `duration`, `step`, `count`, `aggregation`).
  - `aggregation` (top-level) i `time_window.aggregation` to **dwa osobne pola** `CardConfig`; edytor wystawia dla nich **osobne** kontrolki. Precedencja w karcie (`buildMergedTimeWindowConfig`): `time_window.aggregation` > top-level `aggregation` > auto-pick z `duration`.
  - `auto` jest **opcją UI**, nie wartością pola: wybór `auto` zapisuje `aggregation` jako `undefined` (pole pominięte w YAML), dzięki czemu karta stosuje `pickAutoAggregation(duration)`. Wartości `hour`/`day`/`week`/`month` zapisują się dosłownie.
- **FR-005**: Edytor MUSI dodawać kontrolki dla pól **prognozy**: `show_forecast` (przełącznik).
- **FR-006**: Edytor MUSI dodawać kontrolki dla pól **stylu wykresu**: `fill_current` (przełącznik), `fill_reference` (przełącznik), `fill_current_opacity` (pole liczbowe 0–100; spójne z `clampOpacity` i wiki — domyślnie 30), `fill_reference_opacity` (pole liczbowe 0–100; domyślnie 30), `primary_color` (**pole tekstowe** — jedyny typ kontrolek; akceptuje hex, CSS `var(...)` i aliasy `ha-accent`/`ha-primary-accent`/`ha-primary`; dobieracz koloru **NIE** jest stosowany, bo zapisywałby tylko hex i utraciłby pozostałe formy przy zapisie — ryzyko utraty danych, SC-002), `connect_nulls` (przełącznik), `show_legend` (przełącznik).
- **FR-007**: Edytor MUSI dodawać kontrolki dla pól **lokalizacji i liczb**: `language` (lista dostępnych słowników: en/pl/de/fr + opcja „auto"), `number_format` (lista: comma/decimal/language/system), `precision` (pole liczbowe 0–6).
  - Opcja „auto" w UI oznacza `language: undefined` w YAML (pole pomijane) — karta wtedy śledzi język globalny HA. Wybór konkretnego języka zapisuje się dosłownie (np. `language: pl`).
- **FR-008**: Edytor MUSI dodawać kontrolki dla pól **formatów dat**: `x_axis_format` (pole tekstowe), `tooltip_format` (pole tekstowe).
- **FR-009**: Edytor MUSI dodawać kontrolkę dla pola **diagnostyki**: `debug` (przełącznik, domyślnie `false`).
- **FR-010**: Edytor MUSI zachować istniejące kontrolki z 005-gui-editor: `entity`, `title`, `comparison_preset`, `force_prefix`, `show_comparison_summary`, `show_forecast_total_panel`, `show_narrative_comment`.
- **FR-011**: Edytor MUSI wczytywać wartości początkowe wszystkich pól z bieżącej konfiguracji i wypełniać kontrolki; pola nieustawione w YAML MUSI pokazywać wartości domyślne karty (np. `precision` = 2, `aggregation` = auto, `show_title` = true).
- **FR-012**: Każde nowe pole MUSI mieć zlokalizowaną etykietę oraz (dla list rozwijanych) zlokalizowane teksty opcji we **wszystkich** obsługiwanych językach (en, pl, de, fr) w istniejących słownikach tłumaczeń; brak tłumaczenia MUSI degradować się do angielskiego. Dodanie kluczy `editor.*` do `src/translations/*.json` jest **cross-domain** względem domeny `002-i18n-localization` (właściciel `src/translations/`); edytor jest ich konsumentem.
- **FR-013**: Edytor MUSI być odporny na brakujące lub nieznane wartości pól: nieznana wartość w polu z listą → pusty/domyślny wybór bez błędu; nieznane pola w YAML → przechowywane i emitowane nietknięte.
- **FR-014**: Edytor MUSI walidować pola `x_axis_format`, `tooltip_format` oraz `time_window` (spójnie z walidacją karty) i pokazywać czytelny błąd inline przy nieprawidłowej wartości. Edytor **NIE blokuje** emisji `config-changed` — wzorzec domeny 005: zdarzenie jest emitowane przy każdej zmianie pola (pełny `_config`, w tym nieprawidłowa wartość); **karta** jest warstwą walidacji i przy nieprawidłowej wartości przechodzi w czytelny stan błędu (komunikat + brak wykresu, zgodnie z FR-014 domeny `001-time-windows-engine`) do czasu poprawy. Walidacja MUSI **wielokrotnie używać** istniejących funkcji walidacyjnych karty (domena `001-time-windows-engine` / `src/card/time-windows/*`), a nie duplikować ich logiki — źródłem prawdy o poprawności okna/formatów pozostaje karta.
- **FR-015**: `README.md` MUSI być zaktualizowany o sekcję edytora wizualnego wymieniającą **wszystkie** pola konfigurowalne wizualnie, pogrupowane w sekcje.
- **FR-016**: `README.advanced.md` MUSI być zaktualizowany — sekcja „Lovelace editor" MUSI zawierać pełną tabelę: pole → typ kontrolki → domyślna wartość → krótki opis.
- **FR-017**: Wiki MUSI odzwierciedlić pełne pokrycie edytora **w istniejącej** stronie `Configuration-and-Customization.md` (ćwiartka Diátaxis: Reference) — rozbudowa jej o pełną tabelę edytora (pole → typ kontrolki → domyślna wartość → uwagi) w podsekcji „Visual editor coverage". **Nie** tworzymy nowej, odrębnej strony „GUI Editor" (unikamy duplikatu Reference i podwójnego utrzymania). Zmiana jest cross-domain względem domeny `001-github-wiki` (kanoniczne źródło wiki = `wiki-publish/`).
  - Strona `Documentation-Maintenance.md` MUSI zostać uzupełniona (cross-domain do `001-github-wiki`): (a) sekcja **Spec anchors** o domenie `005-gui-editor`/`007-gui-editor-full-coverage`, (b) punkt **drift-check** w checklisty release: „skanuj `src/card/energy-horizon-card-editor.ts` → zaktualizuj tabelę edytora w `Configuration-and-Customization.md`".
- **FR-018**: Edytor MUSI grupować pola w **8 sekcji** o identycznych identyfikatorach jak deskryptory `EditorSection` w `data-model.md` §2: `comparison` (encja, tytuł, porównanie — pola z FR-010), `header` (FR-003), `forecast` (FR-005), `time_window` (porównanie/okna czasowe — FR-004), `chart_style` (FR-006), `localization` (lokalizacja/liczby — FR-007), `date_formats` (FR-008), `diagnostics` (FR-009) i stosować **progresywne ujawnianie**: sekcje podstawowe `comparison`, `header` i `forecast` są zawsze widoczne; sekcje zaawansowane (`time_window`, `chart_style`, `localization`, `date_formats`, `diagnostics`) są zwinięte domyślnie (akordeon `ha-expansion-panel`) i rozwijane przez użytkownika. Stan rozwinięcia sekcji nie jest persystowany — przy każdym otwarciu edytora sekcje zaawansowane startują zwinięte.
- **FR-019**: Edytor MUSI zachować gwarancję braku utraty danych: żadne pole YAML-only (poza tymi, które teraz mają kontrolki) nie może zostać usunięte przy zapisie przez formularz wizualny.

### Non-Functional Requirements

- **FR-020** (a11y): Wszystkie nowe kontrolki edytora MUSI być w pełni operowalne klawiaturą i semantycznie poprawne pod względem ARIA — wymagania te MUSI być spełnione przez natywne komponenty HA (`ha-form`, selektory, `ha-expansion-panel`), a nie przez niestandardowe UI; etykiety pól oraz komunikaty błędów inline MUSI być odczytywalne przez screen reader (zlokalizowane, bez surowych kluczy). Kontrast tekstów MUSI wynikać z natywnych tokenów HA (`--primary-text-color` itd.) i zachowywać WCAG AA.

- **CardConfig** *(istniejący — `src/card/types.ts`)*: Pełny obiekt konfiguracji. Edytor odczytuje i zapisuje ten typ. W tym rozszerzeniu wszystkie pola (poza `type` i aliasem `forecast`) mają kontrolki wizualne.
- **EditorSchema** *(rozszerzony — `src/card/energy-horizon-card-editor.ts`)*: Statyczna tablica deskryptorów pól. W tym rozszerzeniu zawiera wszystkie pola z FR-003…FR-010, pogrupowane w sekcje.
- **TimeWindowSubForm** *(nowy — sekcja `time_window` w edytorze)*: Zagnieżdżona sekcja formularza dla pól `anchor`, `offset`, `duration`, `step`, `count`, `aggregation`. Wartości są merge'owane do `CardConfig.time_window`.
- **Translation Keys** *(nowe — `src/translations/*.json`)*: Klucze w przestrzeni `editor.*` dla etykiet wszystkich nowych pól oraz tekstów opcji list (aggregation, number_format, language, force_prefix, comparison_preset). Dodane do en, pl, de, fr.
- **EditorMode** *(istniejący — 005)*: Wewnętrzny stan przełącznika (`"visual" | "yaml"`). Bez zmian.
- **YAML Serialization** *(istniejący — 005)*: Tryb YAML używa `window.jsyaml`. Bez zmian.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% pól `CardConfig` konfigurowalnych przez użytkownika (z wyłączeniem `type` i aliasu `forecast`) ma wizualną kontrolkę w edytorze.
- **SC-002**: Zero pól YAML-only jest traconych, gdy użytkownik otworzy edytor, zmieni dowolne pole formularza i zapisze — zweryfikowane różnicą zapisanego YAML przed i po sesji edycji (różni się tylko zmienione pole).
- **SC-003**: Wszystkie etykiety pól edytora i teksty opcji list są zlokalizowane w 4 językach (en, pl, de, fr); brak tłumaczenia degraduje się do angielskiego bez pokazywania surowego klucza.
- **SC-004**: `README.md`, `README.advanced.md` i wiki zawierają pełną, spójną z implementacją tabelę pól edytora (pole → kontrolka → domyślna wartość); zero pól opisanych jako „YAML-only", które mają kontrolkę wizualną (i odwrotnie).
- **SC-005**: Użytkownik, który nigdy nie edytował YAML, może skonfigurować wszystkie sekcje edytora (nagłówek, okna czasowe, prognoza, styl, lokalizacja) bez przełączania się w tryb YAML.
- **SC-006**: Edytor otwiera się i wyświetla wszystkie pola bez błędu JavaScript w 100% przypadków, gdy karta ma ważną istniejącą konfigurację.
- **SC-007**: Zmiana dowolnego pola w edytorze jest odzwierciedlona w wizualnym wyjściu karty w ciągu 500 ms (live preview).

---

## Assumptions

- Istniejące zachowanie edytora z 005-gui-editor (pełne `_config`, tryb Visual/YAML, `config-changed`, `getConfigElement`/`getStubConfig`, lokalizacja przez `computeLabel`) jest **zachowane bez zmian**; niniejsza funkcja tylko rozszerza zbiór pól.
- `type` jest stałe (`custom:energy-horizon-card`) i **nie** ma kontrolki wizualnej — nie jest konfigurowalne przez użytkownika.
- `forecast` jest aliasem `show_forecast` (zmerżony podczas normalizacji w `setConfig`); edytor wystawia **jedną** kontrolkę `show_forecast`, nie osobną dla `forecast`.
- `language` w edytorze jest listą rozwijaną z dostępnych słowników tłumaczeń (en, pl, de, fr) plus opcją „auto"; „auto" zapisuje `language: undefined` w YAML (karta śledzi język globalny HA).
- `time_window` jest wystawiane jako zagnieżdżona sekcja formularza z osobnymi kontrolkami dla `anchor`, `offset`, `duration`, `step`, `count`, `aggregation` — nie jako surowy YAML.
- Domyślne wartości pól (np. `precision` = 2, `aggregation` = auto, `show_title` = true, `show_icon` = true, `connect_nulls` = true, `show_legend` = false, `fill_current` = true, `fill_reference` = false) są zgodne z normalizacją karty w `setConfig`/`_buildRendererConfig`.
- Przestrzeń `editor.*` **istnieje od 005-gui-editor**: baza kluczy (`entity`, `title`, `comparison_preset`/`comparison_mode`, `force_prefix`, `visual_mode`, `yaml_mode`, `yaml_error`) została dodana do słowników en/pl/de w 005 (w fr brakowała — luka driftowa domeny 005). Niniejsza funkcja **rozszerza** tę przestrzeń (FR-012): etykiety wszystkich nowych pól, tytuły sekcji (`editor.section.*`), teksty opcji list oraz komunikaty błędów — dodawane do wszystkich czterech słowników (en, pl, de, fr), co jednocześnie domyka lukę w fr. Założenie zostało zwalidowane: po implementacji 007 klucze `editor.*` istnieją we wszystkich czterech słownikach.
- Dokumentacja (README, README.advanced, wiki) jest aktualizowana w ramach tej samej funkcji, zgodnie z wymogiem konstytucji o aktualizacji dokumentacji przy zmianach funkcjonalnych. W wiki pokrycie edytora ląduje w istniejącej stronie `Configuration-and-Customization.md` (Reference) — bez nowej strony; zmiany w `wiki-publish/` i `Documentation-Maintenance.md` są cross-domain względem `001-github-wiki`.
- Edytor pozostaje zgodny z konstytucją: używa natywnych komponentów HA, nie dodaje nowych zależności npm i zachowuje HA look & feel. Dostępność jest wymogiem (FR-020), nie tylko założeniem: natywne komponenty HA dostarczają operowalność klawiaturą, semantykę ARIA i kontrast WCAG AA.

---

## Clarifications

### Session 2026-09-30

- Q: Czy `forecast` (alias) ma osobną kontrolkę? → A: Nie — edytor wystawia tylko `show_forecast`; `forecast` jest zmerżony podczas normalizacji.
- Q: Czy `type` ma kontrolkę? → A: Nie — `type` jest stałe (`custom:energy-horizon-card`).
- Q: Jak wystawić `time_window` (obiekt zagnieżdżony)? → A: Jako zagnieżdżona sekcja formularza z osobnymi kontrolkami dla `anchor`, `offset`, `duration`, `step`, `count`, `aggregation`.
- Q: Czy `language` to pole tekstowe czy lista? → A: Lista dostępnych słowników (en, pl, de, fr) plus „auto".
- Q: Czy dokumentacja jest w zakresie tej funkcji? → A: Tak — README, README.advanced i wiki. W wiki pokrycie edytora ląduje w istniejącej stronie `Configuration-and-Customization.md` (Reference) + uzupełnienie `Documentation-Maintenance.md` (Spec anchors + drift-check) — **bez** nowej, odrębnej strony „GUI Editor" (unikamy duplikatu Diátaxis).
- Q: Gdy pole z walidacją (`x_axis_format`, `tooltip_format`, `time_window`) ma nieprawidłową wartość, co edytor robi z emisją konfiguracji? → A: Wzorzec domeny 005: edytor emituje pełną konfigurację (wraz z nieprawidłową wartością) przy każdej zmianie + błąd inline przy polu; karta jest warstwą walidacji (czytelny stan błędu: komunikat + brak wykresu do czasu poprawy). Edytor NIE blokuje emisji `config-changed`.
- Q: Jak edytor układa 27 pól w panelu bocznym HA? → A: Progresywne ujawnianie — sekcje podstawowe (encja, tytuł, porównanie) zawsze widoczne; sekcje zaawansowane (okno czasowe, styl wykresu, lokalizacja/liczby, formaty dat, diagnostyka) zwinięte domyślnie (akordeon); stan rozwinięcia niepersystowany (przy otwarciu edytora startują zwinięte).
