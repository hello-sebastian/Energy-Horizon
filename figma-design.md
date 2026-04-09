# Energy Horizon Card — mapowanie projektu Figma → kod / Home Assistant

**Źródło:** [Energy Horizon Card (Figma)](https://www.figma.com/design/AbPnTcmRe6WhVGpJt8U6Xj/Energy-Horizon-Card?node-id=113-437)  
**Plik:** `AbPnTcmRe6WhVGpJt8U6Xj`  
**Węzeł (ramka dostawcza):** `113:437` — *Energy Horizon Card v0.5.0*  
**Instancja karty:** `116:763` — *Energy horizon* (wewnątrz ramki)

Dokument powstał na podstawie odczytu pliku przez **oficjalny plugin Figma (MCP)** (`get_design_context`, `get_metadata`, `get_variable_defs`). **Plik Figma nie był modyfikowany.**

---

## 1. Kontekst i terminologia

### 1.1. „Design Output” a rzeczywista struktura pliku

W wyeksportowanych metadanych główny canvas widoczny jako `0:1` nosi nazwę **Sketchbook** i zawiera m.in. starsze ramki z nazwami zbliżonymi do selektorów DOM (`ha-card__ebc-card`, `ebc-content`, `echarts__grid`, …).  

Ramka z Twojego linku (`113:437`) to osobna, **złożona specyfikacja UI v0.5.0**: pionowy układ sekcji, komponenty z wariantami i zmienne kolorów/odstępów. Jeśli w interfejsie Figma masz stronę lub sekcję z etykietą „Design Output”, logicznie odpowiada jej **ta ramka / instancja *Energy horizon*** — w zrzucie XML z MCP nie pojawiła się dosłowna nazwa „Design Output”.

### 1.2. Home Assistant

- Karta jest **custom Lovelace card** (`custom:energy-horizon-card`), renderowana wewnątrz `ha-card`.
- Dane pochodzą z **Long-Term Statistics** encji (`recorder/statistics_during_period`), nie z „żywego” zużycia mocy chwila po chwili.
- Motyw HA dostarcza zmienne CSS (`--primary-text-color`, `--secondary-text-color`, …); obecna implementacja w dużej mierze na nich polega.

### 1.3. Forecast vs Total (drugi panel) — definicje (potwierdzone)

Przykład: preset **month over year**, bieżący okres = **kwiecień 2026**.

| Pole w UI (Figma) | Znaczenie danych |
|-------------------|------------------|
| **Forecast** | Prognozowane zużycie na **cały** bieżący okres czasu (tu: cały **kwiecień 2026**), tj. to co dziś reprezentuje logika prognozy końca okresu dla okna bieżącego. |
| **Total** | **Całkowite** zużycie energii w **całym** okresie **referencyjnym** (tu: cały **kwiecień 2025**), a nie wartość „do dzisiaj” ani skrót z pierwszego panelu. |

Inne presety / okna czasu: ta sama zasada semantyczna — *Total* = pełny zakres referencyjny z LTS, *Forecast* = prognoza na pełny zakres bieżący.


---

## 2. Hierarchia warstw (Figma) — znaczenie funkcjonalne

Poniżej kolejność **od góry do dołu** (zgodna z pionowym stackiem w eksporcie): odpowiada to **przepływowi informacji** na karcie: tożsamość → porównanie okresów → prognoza vs całkowite referencyjne → wykres → komentarz narracyjny → ostrzeżenie.

| Warstwa / grupa (nazwa w Figmie) | Rola UX | Odniesienie do danych / logiki |
|----------------------------------|---------|--------------------------------|
| **Energy Horizon Card v0.5.0** (`113:437`) | Ramka prezentacyjna / viewport (np. 480px) | Artefakt „jak na dashboardzie” |
| **Energy horizon** (instancja komponentu) | Cała karta | Odpowiednik `EnergyHorizonCard` + `ha-card` |
| **Card Header** | **Tytuł** (przyjazna nazwa / `title` / `friendly_name`) + **podtytuł** *Entity unfriendly title* — **kodowa nazwa encji** (`entity_id`, np. `sensor.ac_consumption`) + ikona w **kółku 42×42 px** | `show_title`, `show_icon`, `title`, `hass.states[entity].entity_id` (lub `config.entity`) na drugiej linii; styl podtytułu jak `colors/context` w Figmie; ikona: `ha-icon` / `ha-state-icon` (**MDI 24 px**) — **bez** assetów z Figmy |
| **Data series info - Container** + **Data series info - Grid** | Pierwszy „panel”: dwa szeregi czasowe obok siebie | Okno bieżące vs referencyjne: skumulowane „do dziś”, różnica |
| **Current series** / **Refference series** | Kolumny porównania | `summary.current_cumulative`, `summary.reference_cumulative`, etykiety okien czasu |
| **Data series caption** | Pasek koloru + etykieta okresu (np. „2026, April”) | W kodzie: sufiks okresu z `formatWindowRangeSuffix` / `buildPeriodSuffix` — **prezentacja** może przejść z formatu „wiersz podsumowania” na format „caption jak legenda” |
| **Data status** (warianty) | Etykieta CAPS + wartość + jednostka | `DataStatus`: *Default* (mniejsza typografia), *Current* (duża wartość), *Refference* (inna waga koloru — secondary) |
| **Delta status** | Różnica bezwzględna i względna w jednym chipie (`kWh` \| `%`) | `summary.difference`, `summary.differencePercent` — dziś są to **dwa wiersze** w `.summary`; w Figmie **jeden zespół** z separatorem |
| **Surface Container** (drugi panel) | **Forecast** vs **Total** | Zob. **§1.3** — `forecast` = prognoza na **cały** bieżący okres; `total` = **całkowite** zużycie w **całym** okresie referencyjnym. W kodzie: upewnić się, że `Total` ma dane z pełnego okna referencyjnego (LTS); obecny blok `.forecast` wymaga dopasowania pól/etykiet |
| **Chart** → **chart-container__ebc-chart** → **echarts__*** | Statyczna rekonstrukcja wykresu | Runtime: **Apache ECharts** w kontenerze `.chart-container`; nazewnictwo warstw **celowo** spójne ze starszym szkicem (Sketchbook), żeby wiązać design z optionami serii / osi / markLine |
| **Inteligent comment** | Ten sam komunikat co dziś **`textSummary`** + klucze `text_summary.*`, w osobnym panelu z **ikoną trendu** | **Trzy warianty ikony (UX):** (1) *negatywny* — zużycie **większe** niż referencyjne; (2) *pozytywny* — **mniejsze** niż referencyjne; (3) *neutralny* — **zbliżone** do referencyjnego. Mapowanie z kodu: `trend === "higher"` → negatywny, `"lower"` → pozytywny, `"similar"` → neutralny. Przy `trend === "unknown"` (`computeTextSummary` — brak referencji) — **neutralna** ikona lub brak ikony trendu (do ustalenia przy implementacji, spójnie z `text_summary.no_reference`). |
| **Warning status** | Ostrzeżenie o niepełnej serii referencyjnej | `summary.incomplete_reference` / `summary.reference_cumulative == null` — dziś `.summary-note` w bloku statystyk, nie osobny pasek jak w Figmie |

### 2.1. Wykres — nazwy warstw a zachowanie w produkcie

Warstwy pod **Chart** mapują się na elementy znane z implementacji ECharts (por. starsze ramki `echarts__*` w tym samym pliku):

| Nazwa w Figmie | Znaczenie |
|----------------|-----------|
| `echarts__grid` | Obszar rysowania |
| `echarts__yAxis__splitLine` | Linie siatki poziome (**5** linii — patrz §2.2) |
| `echarts__yAxis__axisLabel` | Etykiety osi Y — **tylko trzy:** `0`, wartość **środkowa**, **maksimum** (jednostka przy skrajnej górnej lub w legendzie — spójnie z implementacją); reszta siatki bez etykiet |
| `echarts__xAxis__axisLabel` | Etykiety osi X — patrz §2.2 (tryb z serią bieżącą: **3** etykiety); „dziś” / bieżący agregat wyróżniony typografią |
| `echarts__series--current__area` | Wypełnienie pod serią bieżącą |
| `echarts__series--current` | Linia / obszar serii bieżącej |
| `echarts__series--reference__line` | Seria referencyjna |
| `Forecast line` | Kontynuacja prognozy (wizualnie kropkowana) |
| `echarts__markLine--today` | Pionowa linia **„dziś”**: biegnie od **podstawy wykresu (0)** aż do **górnej krawędzi obszaru rysowania** (pełna wysokość siatki), **nie** kończy się na poziomie wyższego z punktów serii tego dnia |
| `DeltaLineToday` (w grupie **Today pointer**) | Odcinek **pionowy między** wartością serii **bieżącej** a **referencyjnej** w **bieżącym agregacie (dziś)** — kolor w **trzech stanach** semantycznie spójnych z **Inteligent comment** / **Comment icon** (negatywny / pozytywny / neutralny ↔ `higher` / `lower` / `similar`; `unknown` jak dla ikony komentarza) |
| `Today pointer` | Grupa: `echarts__markLine--today` + **DeltaLineToday** + kropki na przecięciach |
| `Current series dot` | Punkt na przecięciu serii bieżącej z „dziś” (`markPoint` / graphics) |
| `Refference series dot` | Punkt na przecięciu serii referencyjnej z „dziś”; **zaktualizowana stylistyka warstwy w Figmie** — implementacja ma odwzorować bieżącą makietę (nie starszy eksport MCP) |

### 2.2. Wykres — oś X, oś Y i siatka (reguły z makiet)

**Oś pozioma (X), gdy jedną z wyświetlanych serii jest seria bieżąca**

- Etykiety **ograniczyć do trzech** pozycji:
  1. **Pierwszy agregat** okna (początek osi),
  2. **Agregat bieżący** = chwila „dziś” / aktualny dział czasu (środkowa etykieta, możliwe wyróżnienie jak w Figmie),
  3. **Ostatni agregat** okna (koniec osi).
- Pozostałe punkty osi **bez** etykiet tekstowych (nawet przy gęstszej agregacji danych).

**Oś pionowa (Y) i siatka pozioma**

- Zachować **5** poziomych linii pomocniczych (`splitLine`) — pełna siatka jak dotąd co podziałkę.
- Etykiety wartości na Y **ograniczyć do trzech:** **0**, wartość **środkowa** (np. połowa zakresu), **maksimum** zakresu osi (z jednostką tam, gdzie to czytelne — uzgodnić z istniejącym formatterem).

**Uwaga implementacyjna (ECharts):** typowe domyślne zachowanie osi pokazuje więcej etykiet — potrzebna konfiguracja (`axisLabel.interval`, formatter zwracający pusty string dla indeksów poza `{0, mid, max}`, lub `axisLabel.showMinLabel` / `showMaxLabel` w połączeniu z własną logiką dla środka) oraz `splitNumber` / `min` / `max` tak, aby **splitLine** pozostały w liczbie 5 przy jednoczesnym ograniczeniu etykiet do 3.

---

## 3. Komponenty i warianty (Figma)

Komponenty to **reusable UI**; warianty opisują **stan semantyczny**, nie tylko wygląd.

| Komponent | Warianty / props (z eksportu) | Interpretacja |
|-----------|-------------------------------|---------------|
| **Data status** | `Default` \| `Current` \| `Refference` | Ta sama struktura „label + value + unit”, różna hierarchia typograficzna i kolor tekstu dla bieżącego vs referencyjnego |
| **Delta status** | `percentValue`, `unitValue` | Jedna komórka na różnicę absolutną i procentową — kolory **z motywu HA** (`--error-color`, `color-mix` na tło), nie sztywne hex z makiet |
| **Comment icon** | Warianty wizualne: **negatywny** / **pozytywny** / **neutralny** | Mapowanie z `textSummary.trend`: `higher` → negatywny (zużycie wyższe niż referencja), `lower` → pozytywny, `similar` → neutralny; `unknown` → patrz wiersz **Inteligent comment** w tabeli §2. Ikony **MDI** (np. `mdi:trending-up` / `down` / `minus` lub zestaw uzgodniony w implementacji) — **nie** eksport z Figmy |
| **Warning status** | Tekst domyślny o niepełnej serii | Równoległy kanał do obecnej notatki pod statystykami; może być rozszerzony o **wiele** komunikatów / ostrzeżeń (kolejność i priorytety do ustalenia). |
| **Delta line today** | Część **Today pointer** | Pionowy odcinek między seriami w dniu bieżącym — **te same trzy stany kolorystyczne** co **Comment icon** / **Inteligent comment** (jeden wspólny zestaw tokenów lub funkcja `trend → kolor`). |

**Auto Layout (wnioski dla wdrożenia):**

- Główna karta: **kolumna**, stały **gap** (~16px) i **padding** (~24px) — odpowiedniki: `gap` / `padding` w CSS na `.content` lub nowym wrapperze zgodnym z tokenami `Size/*`.
- **Card Header:** wiersz; **kontener ikony 42×42 px** (kółko / tło zgodne z tokenami), w środku **`ha-icon` / `ha-state-icon` przy 24 px** (`--mdc-icon-size: 24px`) — bez assetów ikon z Figmy.
- Panele **Data series info** i **Surface:** „siatka” trzech kolumn z pionowym **Divider** na środku — w CSS: `display: grid` lub flex z `border`/`gap`, zachowując proporcje `minmax(1fr) | fit-content | minmax(1fr)` z makietu.

---

## 4. Zmienne i style (design tokens)

`get_variable_defs` dla węzła karty zwraca m.in.:

### 4.0. Sugestie: kolory i fonty **w kodzie** = standardy HA

**Kolory**

- W **implementacji** unikać **sztywnych wartości `#…` / `rgb()`** tam, gdzie motyw Home Assistant dostarcza **semantycznej** zmiennej CSS.
- Wartości hex w tabeli §4.1 to **referencja z pliku Figma** (pixel parity z makietą), a nie obowiązkowe literały w `energy-horizon-card`.
- Preferencja: **`var(--…)`** z frontendu HA (`--primary-text-color`, `--secondary-text-color`, `--card-background-color`, `--error-color`, `--warning-color`, `--success-color`, `--divider-color`, `--primary-color`, itd.) oraz ewentualnie **`color-mix()`** / przezroczystość względem tła karty, zamiast kopiowania `#rrggbbaa` z Figmy.
- Tylko tam, gdzie HA **nie** definiuje odpowiednika (np. **marka karty** — teal serii bieżącej), dopuszczalna jest **jedna** lokalna zmienna CSS (np. `--eh-series-current`) z fallbackiem do wartości z makiet — nadal lepiej niż rozrzucone `#` w wielu miejscach.
- **Wykres (ECharts):** kolory serii i delty warto pobierać w runtime z `getComputedStyle` na `:host` / `ha-card` (zmienne motywu), żeby dark/light i niestandardowe motywy działały spójnie z resztą dashboardu.

**Typografia**

- **Nie wymuszać** `font-family: Roboto` w karcie, jeśli ma wyglądać jak natywny Lovelace: **dziedziczyć** font z motywu HA (w praktyce często **Roboto** albo **Noto Sans** — zależnie od motywu / języka / ustawień; oba bywają w ekosystemie HA).
- Style z Figmy (**Roboto** Medium 500 / SemiBold 600, rozmiary, caps) mapować na **semantykę**, nie na nazwę kroju: `font-weight: 500` / `600`, `font-size`, `letter-spacing`, `text-transform` — **bez** narzucania konkretnej rodziny z makiety.
- Wyjątki (np. oś wykresu w ECharts) — spójnie z powyższym: ten sam stack co reszta karty lub jawne `getComputedStyle` dla `font-family` z hosta.

### 4.1. Kolory (ścieżki zmiennych Figma → wartości referencyjne → motyw HA)

| Zmienna Figma | Wartość w Figmie (referencja) | Rola semantyczna | Kierunek mapowania w kodzie (orientacyjnie) |
|---------------|-------------------------------|------------------|---------------------------------------------|
| `colors/background/card` | `#1c1c1c` | Tło karty | `var(--card-background-color)` / tło `ha-card` |
| `colors/background/surface-1` | `#262626` | Tło paneli wewnętrznych | np. `color-mix` z `--card-background-color` i `--divider-color`, lub drugorzędne tło z motywu jeśli dostępne |
| `colors/primary` | `#ffffff` | Tekst główny | `var(--primary-text-color)` |
| `colors/secondary` | `#a1a1a1` | Tekst drugorzędny, jednostki | `var(--secondary-text-color)` |
| `colors/context` | `#696969` | Podtytuł (`entity_id`) | `var(--secondary-text-color)` lub `--disabled-text-color` — do wglądu w docelowym motywie |
| `colors/accent/ehorizon` | `#119894` | Seria bieżąca / akcent marki | Brak bezpośredniego odpowiednika HA → **lokalny** token `--eh-*` z fallbackiem; opcjonalnie powiązać z `--primary-color` jeśli celowo |
| `colors/error/bg` | `#f443360d` | Tło chipa (negatywny trend) | `color-mix(in srgb, var(--error-color) 8%, transparent)` lub analogicznie — unikać na sztywno `#f443360d` |
| `color/ha-default/error` | `#f44336` | Kolor błędu / alertu | `var(--error-color)` |
| `Color` (delta w makiecie) | `#fa4d4d` | Tekst różnicy „negatywnej” | `var(--error-color)` (lub spójnie z `ha-alert`) |
| `colors/warrning/bg` | `#ff98000d` | Tło ostrzeżenia | `color-mix` z `var(--warning-color)` (literówka *warrning* tylko w nazwie zmiennej Figma) |

### 4.2. Rozmiary (spacing)

| Zmienna | Wartość (px) |
|---------|----------------|
| `Size/4` | 4 |
| `Size/8` | 8 |
| `Size/16` | 16 |
| `Size/24` | 24 |
| `Size/40` | 40 |

### 4.3. Style tekstowe (text styles)

- **Series label (Figma):** Medium 12, `letterSpacing` ~5% — podpisy okresów przy paskach koloru.
- **Label (Figma):** SemiBold 12, **uppercase** — etykiety typu „TO THIS DAY”, „FORECAST”, „TOTAL”.

**Wdrożenie:** odwzorować **wagę** (500 / 600), **rozmiar**, **interlinię**, **tracking** i **uppercase**; **`font-family`** = **dziedziczenie z motywu** (typowo stack zbliżony do frontendu HA: m.in. **Noto Sans**, **Roboto** — zależnie od motywu). Nie traktować „Roboto” z Figmy jako wymogu importu fontu — to krok projektowy w Figmie, nie kontrakt techniczny karty.

### 4.4. Strategia mapowania tokenów → CSS

1. **Domyślna (zalecana):** semantyka wyłącznie przez **zmienne HA** + **minimalny** zestaw `--eh-*` dla rzeczy specyficznych dla Energy Horizon (np. kolor serii na wykresie); **bez** powielania tablicy hex z §4.1 w komponentach.
2. **Opcja z aliasami Figma:** zdefiniować w `:host` aliasy nazwami ze ścieżek Figma (`--colors-background-card`, …), ale **wartości** przypisać do `var(--card-background-color)` itd. — ułatwia czytanie diffów względem makiet przy zachowaniu zachowania motywu HA.
3. **Pixel parity z Figą:** tylko w testach wizualnych lub jako **fallback** w `, #1c1c1c)` po `var(...)` — nie jako pierwszy wybór produkcyjny.

---

## 5. Mapowanie: Figma → pliki / koncepty w repozytorium

| Obszar Figma | Gdzie w kodzie (stan na dziś) |
|--------------|-------------------------------|
| Cała karta | `src/card/cumulative-comparison-chart.ts` (`EnergyHorizonCard`), rejestracja `energy-horizon-card` |
| Style layoutu | `src/card/energy-horizon-card-styles.ts` |
| Wykres ECharts | Renderer / opcje w module wykresu (karta ładuje dane i kontener `.chart-container`) |
| Teksty UI | `src/locales/*` (klucze `summary.*`, `text_summary.*`, `forecast.*`, …) |
| Konfiguracja encji / presetów | YAML + typy w `src/card/types.ts` |
| Edytor GUI | `src/card/energy-horizon-card-editor.ts` |

**Główne różnice funkcjonalno‑UI (do backlogu wdrożenia v0.5.0):**

1. **Układ statystyk:** Figma — dwukolumnowy „dashboard” z captionami i jednym **Delta status**; kod — lista wierszy `.summary-row`.
2. **Prognoza / Total:** Figma — jeden rząd **Forecast | Total** (§1.3); kod — prognoza końca okresu + osobne wiersze (m.in. referencyjna prognoza, pewność); **Total** w makiecie = suma za **cały** okres referencyjny — do wyliczenia / ekspozycji w stanie karty jeśli jeszcze nie ma jednego pola.
3. **Narracja:** Figma — **Inteligent comment** (panel: ikona trendu + ten sam tekst co `textSummary`); kod — pojedynczy **heading** bez ikony — dodać trzy warianty ikony (§3, **Comment icon**).
4. **Ostrzeżenie:** Figma — osobny **Warning status** na dole; kod — notatka wewnątrz bloku statystyk.
5. **Nagłówek:** Figma — **kółko 42 px** + ikona MDI **24 px** + **tytuł** + **podtytuł** *Entity unfriendly title* (`entity_id`); kod — brak drugiej linii z ID encji — dodać podtytuł i wrapper 42 px.
6. **Wykres:** markLine „dziś” **na pełną wysokość** siatki; **linia delta** między seriami w dniu bieżącym z **3 kolorami** jak komentarz; **3 etykiety X** (pierwszy / bieżący agregat / ostatni) przy widocznej serii bieżącej; **5** linii siatki Y + **3** etykiety Y (`0`, środek, max); kropka **Refference series dot** — zsynchronizować wygląd z **aktualną** warstwą w Figmie.

---

## 6. Użycie w **speckit.specify** (plan / task)

Sugerowane kawałki pracy do specyfikacji:

1. **Tokeny i motyw:** **§4.0** — priorytet `var(--…)` motywu HA zamiast hex z Figmy; **§4.1** tabela mapowania; `--eh-*` tylko dla akcentu marki / wykresu; ECharts: kolory z `getComputedStyle`.
2. **Refaktoryzacja markupu:** sekcje semantyczne zgodne z Figmą (`Card Header`, panel porównania, panel forecast/total, chart, comment, warning) przy zachowaniu dostępności.
3. **Typografia:** **§4.0 / §4.3** — wagi, rozmiary, caps jak w Figmie; **`font-family`** z motywu (Roboto / Noto / inny stack HA), bez wymuszania kroju z makiety.
4. **Komponenty wizualne:** `Delta status`, `Data status` jako fragmenty Lit (lub funkcje `html`) z wariantami; **Inteligent comment** — ikona MDI wg `textSummary.trend` (3 warianty); nagłówek — **wrapper 42 px** + ikona 24 px z istniejącej ścieżki encji.
5. **Dane:** pole **Total** = całkowite zużycie w pełnym okresie referencyjnym (LTS); weryfikacja w warstwie agregacji / `forecast` state.
6. **Wykres:** kolory serii, delty i tekstów osi — **`var(--…)` HA** + `--eh-series-*` tylko gdy brak odpowiednika motywu (**§4.0**); **markLine „dziś”**, **DeltaLineToday**, kropki, **3 etykiety X** / **5 splitLine + 3 etykiety Y**, prognoza — wg **§2.1–2.2**.
7. **i18n:** nowe stringi dla layoutu (np. „To this day” jeśli mają być osobne klucze vs obecne `summary.*`).
8. **Testy wizualne / regresja:** Vitest + ewentualnie snapshoty DOM lub smoke test renderu.

---

## 7. Decyzje produktowe (potwierdzone) — skrót

| Temat | Ustalenie |
|-------|-----------|
| **Forecast / Total** | **§1.3** — Forecast = cały bieżący okres; Total = całkowite zużycie w **całym** okresie referencyjnym. |
| **Inteligent comment** | Ten sam **`textSummary`** + klucze `text_summary.*`; **ikona** z trzema wariantami wizualnymi ↔ `higher` / `lower` / `similar`; `unknown` → neutralnie lub bez trendu (patrz §2). |
| **Ikona w nagłówku** | **Kółko 42×42 px** (CSS), wewnątrz **`ha-icon` / `ha-state-icon`** przy **24 px** MDI — bez rasterów/SVG z Figmy. |
| **Podtytuł w nagłówku** | **Entity unfriendly title** — zawsze **kodowa nazwa encji** (`entity_id`), osobno od przyjaznego tytułu. |
| **Wykres „dziś”** | Pion **markLine** na **całą wysokość** gridu; **delta** między seriami w bieżącym agregacie — **3 kolory** jak ikona **Inteligent comment**. |
| **Oś X / Y** | X: **3** etykiety (pierwszy, bieżący, ostatni agregat) przy serii bieżącej. Y: **5** linii siatki, **3** etykiety (0, środek, max). |
| **Refference series dot** | Wygląd zgodny z **bieżącą** stylistyką warstwy w Figmie (nie stary eksport). |
| **Kolory w kodzie** | Preferencja: **zmienne CSS motywu HA**, nie literały `#` z makiet (**§4.0**, **§4.1**). |
| **Font** | **Dziedziczenie** z motywu (m.in. **Noto Sans**, **Roboto** w ekosystemie HA); style z Figmy → wagi/rozmiary, nie nazwa kroju (**§4.3**). |

---

## 8. Opcjonalne usprawnienia procesu

- **Code Connect:** powiązanie komponentów Figma z małymi komponentami Lit.
- **Stały węzeł źródłowy:** ten sam `fileKey` + `nodeId` przy releasach UI (np. MCP / skrypty).
- **Eksport tokenów:** okresowa synchronizacja zmiennych Figma z sekcją „Tokeny” w tym pliku lub wiki.
