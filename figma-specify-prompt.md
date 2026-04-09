

## Cel

Przygotuj **specyfikację funkcji** (wraz z planem wdrożenia i podziałem na zadania) dla **Energy Horizon Card v0.5.0**: wdrożenie **nowego UI zgodnego z projektem Figma** oraz **niezbędnych zmian funkcjonalnych** (dane, wykres, i18n), bez łamania kontraktu karty Lovelace (`custom:energy-horizon-card`) i bez zmiany sposobu pobierania danych z Home Assistant (Long-Term Statistics), chyba że specyfikacja jawnie uzasadni wyjątek.

## Obowiązkowe źródło w repozytorium

1. **Przeczytaj i traktuj jako nadrzędne uzupełnienie wymagań** plik **`figma-design.md`**.  
   - Stosuj **hierarchię sekcji** (§1–§8): mapowanie warstw Figma → kod/HA, reguły wykresu (§2.1–2.2), komponenty, tokeny/kolory/typografia (§4), backlog różnic (§5), sugerowany podział pracy (§6), zatwierdzone decyzje (§7).  
   - Jeśli coś w kodzie sprzecza się z `figma-design.md`, **opisz rozjechanie** i zaproponuj decyzję (zmiana kodu vs aktualizacja dokumentu).

## Figma (plugin MCP — tylko odczyt)

2. **Skorzystaj z oficjalnego pluginu Figma (MCP)** w Cursorze, aby **zweryfikować / uzupełnić** kontekst wizualny — **bez modyfikacji** pliku w Figmie.

   Parametry źródła (z `figma-design.md`):
   - **fileKey:** `AbPnTcmRe6WhVGpJt8U6Xj`
   - **Węzeł ramki:** `113:437` (*Energy Horizon Card v0.5.0*)
   - URL referencyjny:  
     https://www.figma.com/design/AbPnTcmRe6WhVGpJt8U6Xj/Energy-Horizon-Card?node-id=113-437

   Narzędzia (wg dostępności w MCP):  
   - `get_design_context` — struktura, komponenty, screenshot  
   - `get_metadata` — drzewo warstw / nazewnictwo  
   - `get_variable_defs` — zmienne (kolory, spacing), porównanie z §4 `figma-design.md`

   **Nie** eksportuj ani nie kopiuj assetów ikon z Figmy do repo — ikony **MDI** oraz `ha-icon` / `ha-state-icon` jak w `figma-design.md`.

## User stories (funkcje dodawane / zmieniane)

Każdą user story opracuj z **kryteriami akceptacji** powiązanymi z `figma-design.md` i z numerowanymi wymaganiami wykresu poniżej.

### US-1 — Nagłówek karty z podtytułem encji

**Jako** użytkownik dashboardu HA  
**chcę** widzieć przy tytule karty **drugi wiersz z kodową nazwą encji** (*entity unfriendly title* / `entity_id`)  
**aby** odróżnić przyjazną nazwę od identyfikatora używanego w YAML i narzędziach deweloperskich.

- Obejmuje: tytuł (jak dziś), podtytuł `entity_id`, kółko **42×42 px** z ikoną **MDI 24 px** (`ha-icon` / `ha-state-icon`), bez assetów z Figmy.  
- Powiązanie: **wymaganie 1** poniżej; `figma-design.md` §2 (Card Header), §7.

### US-2 — Panel porównania okresów (layout + delta)

**Jako** użytkownik  
**chcę** widzieć bieżący i referencyjny okres w **układzie dwukolumnowym** z captionami i **jednym chipsem** różnicy (kWh | %)  
**aby** szybciej czytać porównanie bez listy wielu wierszy podsumowania.

- Obejmuje: refaktoryzację `.summary` w stronę panelu Figma, **Data status**, **Delta status**; dane z `summary.*` bez zmiany sensu biznesowego, o ile spec nie wymaga doprecyzowania.  
- Powiązanie: `figma-design.md` §2, §5 pkt 1, §6.

### US-3 — Panel Forecast | Total

**Jako** użytkownik  
**chcę** widzieć **prognozę na cały bieżący okres** obok **całkowitego zużycia w całym okresie referencyjnym**  
**aby** rozróżniać „koniec okresu” od „do dziś” z pierwszego panelu.

- Obejmuje: semantykę **§1.3** `figma-design.md`; ewentualne nowe pole w stanie karty / warstwie danych (**Total** z pełnego LTS referencji).  
- Powiązanie: `figma-design.md` §1.3, §5 pkt 2, §6 pkt 5.

### US-4 — Inteligent comment (tekst + ikona trendu)

**Jako** użytkownik  
**chcę** ten sam komunikat co dziś z **`textSummary`**, ale w **panelu z ikoną** odzwierciedlającą trend (wyżej / niżej / podobnie względem referencji)  
**aby** trend był czytelny wizualnie i spójny z resztą karty.

- Obejmuje: 3 warianty ikony MDI mapowane z `textSummary.trend` (`higher` / `lower` / `similar`; `unknown` — jak w §2); wspólna semantyka kolorów z **linią delta** na wykresie (US-6).  
- Powiązanie: **wymaganie 3**; `figma-design.md` §2, §3 Comment icon, §7.

### US-5 — Warning status (osobna sekcja)

**Jako** użytkownik  
**chcę** ostrzeżenia (np. niepełna seria referencyjna) w **osobnym pasku/sekcji** na dole karty  
**aby** nie ginęły w bloku statystyk.

- Obejmuje: przeniesienie / dublowanie logiki `.summary-note` zgodnie z makietą; możliwość rozszerzenia o wiele komunikatów (priorytety w spec).  
- Powiązanie: `figma-design.md` §2 Warning status, §5 pkt 4.

### US-6 — Wykres: „dziś”, delta, kropki, osie

**Jako** użytkownik  
**chcę** wykresu zgodnego z makiety: pion „dziś” na pełną wysokość, **kolorowa delta** między seriami w bieżącym agregacie, zaktualizowana kropka referencji oraz **ograniczone etykiety osi** przy zachowanej siatce  
**aby** odczyt był spójny z UI i łatwiejszy na małych szerokościach.

- Obejmuje zmiany w opcjach **ECharts** (markLine, custom graphics / markPoint, axisLabel, splitLine); kolory z motywu HA + `--eh-*` tam, gdzie brak zmiennej (**§4**).  
- Powiązanie: **wymagania 2–6** poniżej; `figma-design.md` §2.1–2.2, §6 pkt 6, §7.

### US-7 — Motyw HA: kolory i typografia

**Jako** użytkownik motywu jasnego/ciemnego  
**chcę**, aby karta używała **zmiennych CSS Home Assistant** i **fontu motywu** (np. Noto / Roboto)  
**aby** karta wyglądała jak natywny Lovelace.

- Obejmuje: **§4.0–4.4** `figma-design.md`; brak sztywnych `#` tam, gdzie jest semantyczna zmienna HA; ECharts z kolorami z `getComputedStyle` gdzie potrzeba.

### US-8 — i18n i edytor (regresja)

**Jako** użytkownik wielojęzyczny / konfigurujący kartę w GUI  
**chcę** poprawnych tłumaczeń i działającego edytora po zmianach layoutu  
**aby** nie zepsuć istniejących flow.

- Obejmuje: nowe/zmienione klucze w `src/locales/*`, aktualizacja `energy-horizon-card-editor.ts` jeśli pojawią się nowe opcje.

### US-9 — Testy i regresja

**Jako** maintainer  
**chcę** testów (Vitest) pokrywających logikę danych i krytyczne ścieżki renderu  
**aby** uniknąć regresji przy refaktorze UI.

---

## Wymagania szczegółowe (wykres + nagłówek) — muszą trafić do kryteriów akceptacji

1. **Card header:** Oprócz obecnego **tytułu** wyświetl **podtytuł** *Entity unfriendly title* — **kodowa nazwa encji** (`entity_id`), odrębnie od przyjaznej nazwy; styl zgodny z semantyką podtytułu w `figma-design.md` (np. `colors/context` → zmienne HA).

2. **Pion „dziś” (`echarts__markLine--today`):** Linia od **0** (podstawa wykresu) do **górnej krawędzi obszaru rysowania** (pełna wysokość siatki); **nie** kończy się na poziomie wyższego z punktów serii w dniu bieżącym.

3. **Linia delta (DeltaLineToday):** Pionowy odcinek **między** wartością serii **bieżącej** a **referencyjnej** w **bieżącym agregacie (dziś)**; **kolor w trzech stanach** spójnych z ikoną **Inteligent comment** / `textSummary.trend` (negatywny / pozytywny / neutralny ↔ `higher` / `lower` / `similar`; `unknown` jak ustalono dla ikony).

4. **Refference series dot:** Wizualnie zsynchronizuj z **aktualną** warstwą w Figmie (stylistyka zaktualizowana w projekcie — nie polegać wyłącznie na starym eksporcie MCP).

5. **Oś X:** Gdy **jedną z wyświetlanych serii jest seria bieżąca**, pokaż **tylko trzy** etykiety tekstowe: **pierwszy agregat**, **bieżący agregat (dziś)** — z możliwym wyróżnieniem typograficznym, **ostatni agregat**; pozostałe bez etykiet.

6. **Oś Y i siatka:** Zachowaj **5** poziomych linii pomocniczych (`splitLine`); na osi Y **tylko trzy** etykiety: **0**, **wartość środkowa**, **maksimum** (jednostka czytelnie — spójnie z formatterem).

## Pliki startowe w kodzie (orientacja)

Odnieś się do:  
`src/card/cumulative-comparison-chart.ts`, `src/card/energy-horizon-card-styles.ts`, moduł renderera ECharts, `src/card/types.ts`, `src/locales/*`, `src/card/energy-horizon-card-editor.ts`.

## Dostarczony artefakt

Wygeneruj **specyfikację** zgodną z konwencją Speckit w tym repozytorium:

- Cele, **user stories** (jak wyżej, z rozbiciem na AC),
- Wymagania funkcjonalne i niefunkcjonalne (motyw HA, dostępność tam, gdzie ma sens),
- **Kryteria akceptacji** explicite obejmujące punkty **1–6** oraz odniesienia do `figma-design.md`,
- Ryzyka i zależności (m.in. ECharts, LTS),
- **Plan faz** oraz **lista zadań** pod `/speckit.implement` (atomowe, z kolejnością).

## Poza zakresem (chyba że uzasadnisz)

Zmiana brandingu innych kart HA, edycja pliku Figma, Code Connect (opcjonalnie tylko jako future work).

