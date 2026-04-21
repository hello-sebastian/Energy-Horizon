# Energy Horizon Card — zbiorcze źródło projektu Figma (UI v0.5.0)

Ten dokument jest **jedynym źródłem referencyjnym** dla projektu UI karty w Figmie i zastępuje wcześniejsze pliki robocze.

## 1. Zakres i cel

- Wdrożenie UI zgodnego z projektem Figma dla `Energy Horizon Card v0.5.0`.
- Zachowanie kontraktu Lovelace: `custom:energy-horizon-card`.
- Zachowanie źródła danych: Home Assistant Long-Term Statistics.
- Brak edycji pliku Figma jako części dostawy kodu.
- Brak importu assetów ikon z Figmy (ikony wyłącznie przez MDI i `ha-icon` / `ha-state-icon`).

## 2. Źródło Figma i weryfikacja (read-only)

- Figma file key: `AbPnTcmRe6WhVGpJt8U6Xj`
- Node (frame): `113:437` — *Energy Horizon Card v0.5.0*
- Node (instance): `116:763` — *Energy horizon*
- URL: https://www.figma.com/design/AbPnTcmRe6WhVGpJt8U6Xj/Energy-Horizon-Card?node-id=113-437
- Narzędzia MCP (odczyt): `get_design_context`, `get_metadata`, `get_variable_defs`

Kontekst: w eksporcie MCP główny canvas jest widoczny jako `Sketchbook` (`0:1`), a właściwa specyfikacja UI v0.5.0 jest na ramce `113:437`.

## 3. Semantyka danych (źródło prawdy)

### 3.1 Forecast vs Total

- **Forecast** = prognoza na **cały bieżący okres**.
- **Total** = całkowite zużycie za **cały okres referencyjny**.
- To rozróżnienie obowiązuje dla wszystkich presetów (nie tylko month-over-year).

### 3.2 Panel porównania

- Panel porównania pokazuje wartości „to this day” dla okna bieżącego i referencyjnego.
- Chip delty jest zawsze widoczny:
  - zero = poprawna informacja (wartość + 0%),
  - brak danych = placeholdery (`---` i `-- %`) zgodnie z formatterem i jednostką.

## 4. Struktura warstw i sekcji UI

Kolejność sekcji od góry:
1. Card Header
2. Data series info (comparison)
3. Surface Container (Forecast | Total)
4. Chart
5. Inteligent comment
6. Warning status

Mapowanie warstw na funkcję:
- **Card Header**: tytuł + podtytuł `entity_id` + ikona 42x42 / 24 px.
- **Data series info**: bieżący vs referencyjny + jeden chip delty (`kWh | %`).
- **Surface Container**: Forecast i Total zgodnie z semantyką z sekcji 3.
- **Chart (`echarts__*`)**: oś, siatka, serie, today line, delta line, dots.
- **Inteligent comment**: tekst `textSummary` + ikona trendu (3 stany).
- **Warning status**: dedykowana sekcja ostrzeżeń jakości danych.

Flagi widoczności (YAML + edytor):
- `show_comparison_summary`
- `show_forecast_total_panel`
- `show_narrative_comment`
- `show_forecast: false` ukrywa cały panel Forecast | Total.

## 5. Wykres — obowiązkowe reguły

### 5.1 Elementy warstw wykresu

- `echarts__markLine--today`: pion od zera do górnej krawędzi obszaru rysowania.
- `DeltaLineToday`: pion między bieżącą i referencyjną serią w bieżącym agregacie.
- `Current series dot` / `Refference series dot`: punkty przecięcia serii z „today”.

### 5.2 Oś X

Gdy seria bieżąca jest widoczna:
- tylko 3 etykiety: pierwszy agregat, bieżący agregat, ostatni agregat;
- pozostałe punkty bez etykiet.

Gdy seria bieżąca nie jest widoczna:
- zachowanie osi X jak baseline wydania `v0.4.0` (bez regresji).

### 5.3 Oś Y i siatka

- 5 poziomych linii `splitLine`.
- 3 etykiety Y: `0`, środek, maksimum.

### 5.4 Semantyka trendu

Stany `higher` / `lower` / `similar` mają być wspólne dla:
- koloru delty na wykresie,
- ikony i tonu panelu komentarza.

Dla `unknown` stosować neutralny wariant trendu.

## 6. Komponenty i warianty

- **Data status**: `Default | Current | Refference`.
- **Delta status**: wartość bezwzględna + procent w jednym komponencie.
- **Comment icon**: `negative | positive | neutral` (mapping z `textSummary.trend`).
- **Warning status**: dedykowana sekcja alertów danych.

## 7. Tokeny, kolory, typografia

### 7.1 Zasady implementacji

- Preferować semantyczne zmienne HA (`var(--...)`).
- Nie utrwalać hex z makiety tam, gdzie jest zmienna motywu.
- Dopuszczalne minimalne `--eh-*` dla akcentu marki (np. seria bieżąca).
- Kolory wykresu pobierać przez `getComputedStyle` dla zgodności z motywem.

### 7.2 Referencja tokenów z Figmy

Kluczowe zmienne:
- `colors/background/card`
- `colors/background/surface-1`
- `colors/primary`
- `colors/secondary`
- `colors/context`
- `colors/accent/ehorizon` (`#119894`)
- `colors/error/bg`
- `color/ha-default/error`
- `colors/warrning/bg`
- `Size/4`, `Size/8`, `Size/16`, `Size/24`, `Size/40`

### 7.3 Typografia

- Mapować wagę/rozmiar/tracking/uppercase z makiety.
- Nie wymuszać konkretnego `font-family` z Figmy (dziedziczenie fontu z motywu HA).

## 8. User stories (zakres funkcjonalny)

- **US-1**: Header z podtytułem encji.
- **US-2**: Panel porównania + pojedynczy chip delty.
- **US-3**: Panel Forecast | Total z poprawną semantyką Total.
- **US-4**: Inteligent comment (tekst + ikona trendu).
- **US-5**: Warning status jako oddzielna sekcja.
- **US-6**: Wykres (today, delta, dots, osie).
- **US-7**: Theming HA (kolory + typografia).
- **US-8**: i18n + edytor bez regresji.
- **US-9**: Testy i regresja.
- **US-10**: Opcjonalna widoczność sekcji UI.

## 9. Wymagania szczegółowe (nagłówek + wykres)

1. Header pokazuje tytuł i `entity_id` (gdy tytuł aktywny) oraz ikonę 42x42/24.
2. Today line ma pełną wysokość obszaru wykresu.
3. Delta line jest pionem między seriami i używa 3 stanów trendu.
4. Reference dot odzwierciedla aktualny styl warstwy Figma.
5. Oś X: 3 etykiety przy widocznej serii bieżącej.
6. Oś Y: 5 linii siatki i 3 etykiety.

## 10. Wytyczne refaktoru UI (zebrane)

### 10.1 Refactor pass 1 (layout i typografia)

- Ujednolicić spacing/radius/padding paneli do tokenów.
- Dopracować geometrię siatek porównania/surface.
- Dopracować baseline value/unit.
- Dopracować komentarz (40 px ikon container, czytelna hierarchia tekstu).
- Dopracować warning status (padding, gap, alignment).

### 10.2 Refactor pass 2 (korekty jakościowe)

- Usunąć „podwójne tło” ikony komentarza.
- Wyłączyć domyślną etykietę liczbową nad today markLine.
- Dopracować current dot (czytelny ring/obrys).
- Dopracować style osi X (edge vs today).
- Ustawić confidence forecast do lewej.
- Utrzymać 16 px dla wartości/unit w Forecast|Total.
- Utrzymać domyślny kolor serii bieżącej zgodny z akcentem EH (`#119894`) z możliwością override.

## 11. Decyzje produktowe i doprecyzowania

- Warning o niepełnej referencji ma być w dedykowanej sekcji (nie jako zduplikowany pełny tekst w podsumowaniu).
- Przy `show_title: false` nie pokazywać podtytułu `entity_id`.
- Przy `show_forecast: false` ukrywać cały panel Forecast | Total.
- Oś X w trybach bez serii bieżącej nie wymusza „3 etykiet” i ma zachować baseline z `v0.4.0`.
- W refaktorze przyjęto korektę: confidence forecast wyrównane do lewej.

## 12. Implementacja i artefakty speckit

Dokument jest bazą dla:
- `specs/001-figma-ui-rollout/spec.md`
- `specs/001-figma-ui-rollout/plan.md`
- `specs/001-figma-ui-rollout/research.md`
- `specs/001-figma-ui-rollout/quickstart.md`
- `specs/001-figma-ui-rollout/contracts/lovelace-card-contract.md`
- `specs/001-figma-ui-rollout/checklists/requirements.md`
- `specs/001-figma-ui-rollout/tasks.md`

## 13. Kryteria gotowości

- Zgodność layoutu z makietą (tolerancja wizualna).
- Brak importu assetów ikon z Figmy.
- Brak hardkodowania kolorów tam, gdzie istnieją semantyczne tokeny HA.
- Spójna semantyka trendu między wykresem i komentarzem.
- Przejście `npm test` i `npm run lint`.
- Brak regresji i18n i edytora karty.

## 14. Status dokumentacji

Wcześniejsze pliki projektowe Figma zostały zastąpione tym dokumentem i usunięte z repozytorium. Ten plik jest docelowym źródłem prawdy dla projektu UI Figma.
