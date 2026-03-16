# Research & Decisions: Energy Horizon Cumulative Comparison Card

## Scope

Badania dotyczą architektury i stosu technologicznego dla customowej karty Home Assistant:
- TypeScript + LitElement.
- Chart.js jako silnik wykresu (z gradientami i markerami), bundlowany lokalnie.
- Vite jako narzędzie budujące (bundle pod HA/HACS).
- Dostęp do danych wyłącznie przez WebSocket API LTS (`recorder/statistics_during_period`) z `hass.connection.sendMessagePromise`.

---

## 1. WebSocket API i Long-Term Statistics (LTS)

### Decision

- Karta **nie będzie** używać mechanizmu historii stanów (`history` / REST history), **wyłącznie** Long-Term Statistics (LTS) poprzez WebSocket.
- Podstawowa metoda pobierania danych:
  - `hass.connection.sendMessagePromise({ type: "recorder/statistics_during_period", ... })`.
- Backend HA odpowiada za:
  - Agregowanie danych wg wskazanego `period` (np. `day`, `week`, `month`).
  - Dostarczanie statystyk w formie możliwej do bezpośredniego przekształcenia w serię skumulowaną.

### Rationale

- LTS:
  - Jest zoptymalizowane do odczytów długookresowych (miesiące/lata) bez zasypywania przeglądarki tysiącami punktów.
  - Pozwala sterować poziomem agregacji (dzień/tydzień/miesiąc), co dobrze odpowiada scenariuszom „rok do roku” i „miesiąc do miesiąca”.
- WebSocket API:
  - Jest natywnie dostępne przez obiekt `hass.connection` przekazywany do karty.
  - Unika dodatkowych backendów lub niestandardowych integracji.

### Alternatives considered

- **REST API history / `history/period`**:
  - Odrzucone ze względu na duży wolumen danych i konieczność lokalnej agregacji po stronie przeglądarki.
- **Własny backend proxy / agregator**:
  - Odrzucone, bo łamie konstytucję (brak dodatkowych backendów, zgodność z HA) i podnosi złożoność wdrożenia.

---

## 2. Architektura komponentów i modułów

### Decision

Podział na dedykowane moduły:
- `cumulative-comparison-chart.ts` – główny komponent LitElement, implementujący `LovelaceCard` (i ewentualnie `LovelaceCardEditor`), zarządzający:
  - `setConfig`, `hass` setter, `getCardSize`.
  - Stanami ładowania, błędu, braku danych.
  - Integracją z `ha-api` i `chart-renderer`.
- `ha-api.ts` – serwis komunikacji z Home Assistant:
  - Budowanie zapytań `recorder/statistics_during_period` dla dwóch okresów (bieżący vs referencyjny).
  - Interpretacja odpowiedzi i mapowanie do wewnętrznego modelu `TimeSeriesPoint[]` (np. wartość, timestamp, metadane).
  - Obsługa błędów i edge case’ów (brak encji, brak danych, różne okresy).
- `chart-renderer.ts` – klasa niepowiązana bezpośrednio z Lit:
  - Przyjmuje referencję do `<canvas>` i konfigurację wykresu.
  - Inicjalizuje i aktualizuje instancję Chart.js.
  - Zapewnia interfejs `updateData(themeAwareConfig)` oraz `destroy()`.
- `types.ts` – definicje typów:
  - Konfiguracja karty (YAML/Storage UI).
  - Typy danych HA i odpowiedzi LTS.
  - Wewnętrzny model danych do wykresu (series, comparison periods, summary).

### Rationale

- Silne rozdzielenie odpowiedzialności:
  - Karta (LitElement) = lifecycle + UI + stany.
  - Serwis API = dostęp do LTS + walidacja danych.
  - Renderer = odpowiedzialny tylko za Chart.js.
  - Typy = pojedyncze źródło prawdy dla modeli.
- Ułatwia testowanie (ha-api i obliczenia prognoz mogą być testowane niezależnie od DOM).

### Alternatives considered

- **Wszystko w jednym pliku karty**:
  - Krótkoterminowo prostsze, ale trudne do utrzymania, testowania i rozwoju.
- **Abstrakcyjna warstwa repozytorium/adapterów**:
  - Na ten moment zbędna – zwiększa złożoność bez jasnej korzyści w małym projekcie (może być dodana później, jeśli pojawią się nowe źródła danych).

---

## 3. Stos technologiczny: TypeScript + Lit + Chart.js + Vite

### Decision

- Język:
  - TypeScript z `strict: true` (ścisłe typowanie konfiguracji, danych LTS, modeli wewnętrznych).
- UI:
  - LitElement (`lit`) jako baza dla web komponentu Lovelace.
- Wykres:
  - Chart.js:
    - Wersja liniowa (line chart) z wtyczkami do gradientów pod linią oraz markerów punktów.
    - Wykorzystanie wbudowanych pluginów tooltip/legend oraz ewentualnie custom pluginów do stylowania osi i siatki zgodnie z motywem HA.
- Bundling:
  - Vite (TS + web components) – output jako:
    - ES module (zalecany w nowym HA) oraz/lub
    - UMD kompatybilny z loaderem kart w HA.
  - Chart.js bundlowane lokalnie (bez CDN).

### Rationale

- LitElement jest rekomendowanym podejściem do customowych kart HA, dobrze współgra z typowymi przykładami.
- Chart.js:
  - Powszechnie znany, udokumentowany, wspierający gradienty i customizację, z rozsądnym footprintem.
  - Umożliwia szybkie uzyskanie estetycznego wykresu z markowaniem serii i tooltipami.
- Vite:
  - Szybki dev server, prosta konfiguracja TS i build.
  - Łatwe konfigurowanie odpowiedniego formatu outputu dla HA/HACS.

### Alternatives considered

- **ApexCharts, ECharts, Recharts**:
  - Bogate funkcje, ale większy rozmiar lub gorsze dopasowanie do prostego line chartu LTS.
- **Brak bundlera / ręczny Rollup/Webpack**:
  - Więcej pracy konfiguracyjnej, brak benefitów Vite (szybkość, prostota).

---

## 4. Theming, kolory i tryb jasny/ciemny

### Decision

- Brak twardych kolorów (hex) poza fallbackami.
- Źródło kolorów:
  - Zmienne CSS HA: `var(--primary-color)`, `var(--secondary-text-color)`, `var(--accent-color)`, `var(--ha-card-background)`, itp.
- Mechanizm:
  - `theme-utils.ts` będzie:
    - Odczytywał aktualne wartości zmiennych CSS z elementu hosta (np. `getComputedStyle(this)`) lub `document.documentElement`.
    - Mapował je na obiekty kolorów używane przez Chart.js (kolory linii, wypełnienia gradientów, siatki, osi).
- Reagowanie na zmianę motywu:
  - Karta będzie nasłuchiwać zmian motywu HA (np. przez aktualizację `hass.themes` / zmianę `hass`).
  - Przy zmianie:
    - Oblicza nowe kolory poprzez `theme-utils`.
    - Aktualizuje konfigurację Chart.js i wywołuje `.update()`.

### Rationale

- Pełna zgodność z konstytucją (theming HA).
- Spójny wygląd z resztą dashboardu, w tym w trybach dark/light.

### Alternatives considered

- **Hard-coded palette**:
  - Odrzucone – łamanie wymagań co do themingu i kompatybilności z motywami HA.
- **Osobna konfiguracja kolorów w YAML**:
  - Możliwa jako zaawansowana opcja w przyszłości, ale domyślnie chcemy korzystać z motywów HA, aby nie przeciążać użytkownika konfiguracją.

---

## 5. Stany karty i UX (spinner, błędy, brak danych)

### Decision

- `render()` w `cumulative-comparison-chart.ts` będzie zarządzać trzema głównymi stanami:
  - **Loading** – podczas pobierania danych LTS:
    - Wyświetlany spinner (np. `<ha-circular-progress>` lub prosty CSS spinner) oraz krótki tekst.
  - **Error** – przy błędzie API, braku encji, niezgodności danych:
    - `<ha-alert alert-type="error">` z czytelnym komunikatem.
  - **Success** – poprawne dane:
    - `<canvas>` z wykresem Chart.js.
    - Sekcja z podsumowaniem: dwie wartości skumulowane + prognoza + różnica.
- Dodatkowy stan: **No comparison data**:
  - Gdy dostępne są dane tylko dla jednego z okresów.
  - UI informuje o braku danych porównawczych, ale wciąż pokazuje pojedynczą serię (jeśli to ma sens).

### Rationale

- Zgodność z konstytucją: „graceful degradation”, brak crashy dashboardu.
- Czytelne komunikaty dla użytkownika, minimalna frustracja.

### Alternatives considered

- **Ukrywanie karty przy błędach**:
  - Odrzucone – trudne do debugowania, sprzeczne z zasadami obserwowalności.

---

## 6. Prognoza końcowego zużycia

### Decision

- Prognoza będzie liczona po stronie przeglądarki na podstawie:
  - Skumulowanej serii bieżącego okresu.
  - Aktualnego dnia w okresie (np. dzień miesiąca / dzień roku).
- Podejście domyślne:
  - Prosta ekstrapolacja liniowa/srednia dzienna:
    - `forecast_total = current_cumulative / day_index * total_days_in_period`
  - Ograniczenia:
    - Minimalna liczba punktów, aby pokazywać prognozę (np. >= 5 dni).
    - Oznaczenie niskiej pewności przy bardzo małej próbie.

### Rationale

- Wystarczająco proste i zrozumiałe, spójne z P3.
- Brak konieczności skomplikowanej analizy szeregów czasowych.

### Alternatives considered

- **Zaawansowane modele (np. ARIMA, regresja nieliniowa)**:
  - Zbyt ciężkie i nieuzasadnione wobec prostego zastosowania.

---

## 7. Testowanie i rozwój lokalny

### Decision

- Testy jednostkowe:
  - Logika przetwarzania odpowiedzi LTS -> wewnętrzne serie.
  - Funkcje agregujące i prognozujące.
  - Mapowanie themingu (`theme-utils`).
- Testy integracyjne (minimalne):
  - Render karty z mockowanym `hass` i fake’owymi danymi.
  - Sprawdzenie stanów: loading, error, no-data, success.
- Środowisko dev:
  - Vite dev server z prostą stroną hostującą kartę (lub minimalnym loaderem w stylu Lovelace).

### Rationale

- Pozwala szybko wykrywać regresje w logice obliczeń i integracji z LTS без konieczności pełnego uruchamiania HA przy każdej zmianie.

### Alternatives considered

- **Brak testów automatycznych**:
  - Odrzucone – sprzeczne z konstytucją (sekcja o jakości kodu i testach).

---

## 8. Otwarte pytania / ryzyka

- Potencjalne różnice w strukturze odpowiedzi `recorder/statistics_during_period` między wersjami HA – konieczne będzie defensywne parsowanie i ewentualne feature detection.
- Dokładne API themingu i komponentów `<ha-alert>` / `<ha-circular-progress>` może wymagać zerknięcia w aktualne źródła HA (ale nie blokuje architektury).

