# Energy Horizon Card — wytyczne refaktoru UI (refactor-1)

**Cel:** zebrać **konkretne kierunki dopracowania** interfejsu karty Lovelace tak, aby **bliżej** odwzorowywała makietę **Energy Horizon Card v0.5.0** w Figmie, przy zachowaniu zasad z `figma-design.md`, user stories z `figma-specify-prompt.md` oraz **aktualnego** stanu kodu (Lit + CSS + ECharts).

**Źródło wizualne (odczyt tylko do odczytu):**

- Figma: [Energy Horizon Card](https://www.figma.com/design/AbPnTcmRe6WhVGpJt8U6Xj/Energy-Horizon-Card?node-id=113-437) — `fileKey` `AbPnTcmRe6WhVGpJt8U6Xj`, ramka **`113:437`** (*Energy Horizon Card v0.5.0*), instancja **`116:763`** (*Energy horizon*).
- Weryfikacja: **oficjalny plugin Figma (MCP)** — `get_design_context`, `get_metadata`, `get_variable_defs` (bez modyfikacji pliku w Figmie).

**Pliki nadrzędne w repo (muszą pozostać spójne z implementacją):**

- `figma-design.md` — hierarchia warstw, semantyka danych (Forecast / Total §1.3), wykres §2.1–2.2, komponenty §3, tokeny §4, backlog §5–§7.
- `figma-specify-prompt.md` — US-1…US-9, wymagania szczegółowe wykresu i nagłówka (pkt 1–6).

---

## 1. Co potwierdza aktualny eksport Figma (MCP) — istotne dla UI

Poniższe **uzupełnia** `figma-design.md` o **numeryczne i strukturalne** detale z bieżącego kodu generowanego przez MCP (React+Tailwind jako referencja wizualna — **nie** jako stack docelowy).

### 1.1. Makro-layout karty (*Energy horizon*)

- Kolumna główna: **`gap` ~16px** (`Size/16`), **`padding` ~24px** (`Size/24`), **`border-radius` ~16px** na kontenerze karty w makiecie.
- Kolejność sekcji (zgodna z `figma-design.md` §2): **Card Header** → panel **Data Series Surface** (porównanie okresów) → **Surface Container** (Forecast | Total) → **Chart** → **Inteligent comment** → **Warning status**.

### 1.2. Card Header

- Ikona w **kwadracie 42×42** (w makiecie „Card icon” — w produkcie: **kółko 42px** + `ha-icon` / `ha-state-icon` **24px**, bez assetów z Figmy — §7 `figma-design.md`).
- Odstęp między ikoną a blokiem tekstu w eksporcie MCP: **~19px** (w kodzie dziś często **12px** — sekcja 3.1).
- Tytuł: **16px**, **Bold**, **uppercase**, wyraźny **letter-spacing** (w eksporcie ok. **0.8px** na 16px — traktować jako „tracking jak w Label”, nie kopiować sztywno jeśli psuje czytelność języków z diakrytykami).
- Podtytuł encji: kolor semantyczny **`colors/context`** (`#696969` w pliku) → w kodzie preferencja **`var(--secondary-text-color)`** lub **`--disabled-text-color`** wg motywu (jak §4.1 `figma-design.md`).

### 1.3. Panel „Data series info” (porównanie)

- Tło: **`colors/background/surface-1`**; **padding panelu ~16px**, **zaokrąglenie ~16px**.
- Wewnętrzna siatka: **`grid` z trzema kolumnami** `minmax(0,1fr) | fit-content | minmax(0,1fr)` oraz **`gap-x` ~24px**, dodatkowo **poziomy padding wewnętrzny ~8px** na siatce — to jest **ciaśniejsze** niż sam „gap między kolumnami” w niektórych implementacjach flex.
- **Data series caption:** pasek **12×3** (już zbliżone do `.ebc-series-swatch`), potem etykieta okresu — **Series label**: **12px / Medium (500) / tracking ~5%** (§4.3).
- **Data status:** etykieta typu „TO THIS DAY” — **Label**: **12px / SemiBold (600) / uppercase / tracking ~5%**.
- Wariant **Current:** wartość **~40px** Bold + jednostka **16px** Regular, **baseline** w jednym rzędzie (`items-end`, gap ~4px).
- Wariant **Reference:** wartość **~32px** Medium + jednostka **16px** Regular — obecny kod używa **2rem / 500** dla referencji; **dopasować rozmiary** tak, aby proporcja Current/Reference była jak w makiecie (niekoniecznie identyczne px przy skalowaniu `rem`, ale **ten sam stosunek wizualny**).
- **Delta status:** tło `colors/error/bg` (w makiecie także dla wariantu negatywnego), **padding ~4px 8px**, **radius ~8px**, typografia **14px SemiBold**, separator pionowy między kWh a %.

### 1.4. Surface Container (Forecast | Total)

- Ta sama logika siatki co panel porównania (divider środkowy, dwie kolumny).
- **Forecast:** etykieta uppercase jak Label; wartość **16px Bold** + jednostka **16px** Regular w jednym rzędzie; **podpis pewności ~11px**, w makiecie w **kolumnie Forecast**, **wyrównanie do prawej** względem tej kolumny.
- **Total:** **Data status** w wariancie zbliżonym do **Default** (16px value + unit), bez linii „confidence” po prawej.

**Semantyka danych** bez zmian względem `figma-design.md` §1.3 / US-3: **Forecast** = cały bieżący okres; **Total** = **całkowite** zużycie w **całym** okresie referencyjnym (LTS).

### 1.5. Inteligent comment + Warning status

- **Inteligent comment:** panel z tłem jak surface-1, **padding ~16px**, **gap ~16px** między ikoną a tekstem, **radius ~16px**.
- W makiecie **ikona trendu** to **kompozycja ~40px** (tło / pierścień + MDI 24px). W produkcie: **nie** importować rasterów z MCP — odtworzyć **CSS-em** (np. okrągłe tło + kolor z trendu), spójnie z klasami `.ebc-trend--*` (US-4, §3 `figma-design.md`).
- Tekst narracji w makiecie jest **wielokolorowy** (fragment wtórny + **pogrubienie** na części z liczbą). Dziś `narrativeText` to **jeden string** z i18n — na etap refaktoru UI rozważyć **szablon z częściami** (np. osobne klucze lub `html` z bezpiecznym składaniem), aby uzyskać hierarchię jak w Figmie **bez** `unsafeHTML` z pełnym stringiem od tłumaczy.
- **Warning status:** tło `colors/warrning/bg`, **padding ~8px 16px**, **radius ~16px** w eksporcie; ikona ostrzeżenia + tekst. W MCP występuje też wariant z **większym gap** ikona–tekst (**24px**) — **ustalić jedną wartość** spójną z `Size/24` lub `Size/16` i dokumentować w CSS.

### 1.6. Zmienne (`get_variable_defs`) — zgodność z §4

Dla węzła karty MCP zwraca m.in.: `colors/background/card`, `colors/background/surface-1`, `colors/primary`, `colors/secondary`, `colors/context`, `colors/accent/ehorizon`, `colors/error/bg`, `color/ha-default/error`, `Color` (delta), `colors/warrning/bg`, `Size/4|8|16|24` oraz style tekstowe **Series label** / **Label**.  

**Zasada implementacji** (bez zmian): mapowanie na **`var(--…)` Home Assistant** + minimalne `--eh-*` tam, gdzie brak odpowiednika (**§4.0 `figma-design.md`**).

### 1.7. Wykres

MCP nadal pokazuje warstwy **`echarts__*`**, **Today pointer**, **DeltaLineToday**, kropki serii — szczegóły **nie zmieniają** wymagań z `figma-design.md` §2.1–2.2 i `figma-specify-prompt.md` (pion „dziś” na pełną wysokość siatki, delta w 3 stanach, 3 etykiety X, 5 splitLine + 3 etykiety Y, aktualna kropka referencji). Refaktor **layoutu karty** powinien **zachować** te same tokeny trendu co wykres (`trend-visual.ts` / theme z `getComputedStyle`).

---

## 2. Stan kodu (skrót — na dzień przygotowania dokumentu)

| Obszar | Główne pliki | Co już jest zbliżone do Figmy |
|--------|----------------|--------------------------------|
| Sekcje + markup | `src/card/cumulative-comparison-chart.ts` | Regiony ARIA, nagłówek z `entity_id`, siatka porównania z dividerem, chip delty, panel Forecast/Total, wykres, komentarz z `ha-icon` + `trendMdiIcon`, osobny pas ostrzeżenia. |
| Style | `src/card/energy-horizon-card-styles.ts` | `--ebc-pad` 24px, `--ebc-gap` 16px, ikona 42px, komentarz 40px, swatche 12×3, Series label / Label caps, delta z kolorami motywu. |
| Trend / ikony | `src/card/trend-visual.ts` | Mapowanie trend → MDI + klasy tonu. |
| Teksty | `src/translations/*.json` | Klucze sekcji, podsumowania, forecast, ostrzeżenie. |

**Ważne:** wiele elementów **funkcjonalnie** pokrywa US z `figma-specify-prompt.md`; **refactor-1** dotyczy głównie **dopolerowania wizualnego i typografii** oraz **drobiazgów layoutu**, żeby odpowiadały liczbom z §1 powyżej.

---

## 3. Wytyczne modyfikacji (priorytet: wysoki → średni)

### 3.1. Spacing i geometria (wysoki)

1. **Nagłówek:** rozważyć **`gap` ~18–20px** (zamiast 12px) między `.ebc-header-icon-wrap` a `.ebc-header-text`, aby zbliżyć się do Auto Layout z Figmy; sprawdzić na wąskiej karcie (~360px), czy nie psuje zawijania.
2. **Panele `.ebc-section--comparison` i `.ebc-section--forecast-total`:** w makiecie **radius 16px** i **padding 16px** — dziś często **12px** radius i mieszany padding forecast (**12px 14px**). **Ujednolicić** do tokenów `Size/16` (np. `border-radius: 16px`, `padding: 16px`), z wyjątkiem jeśli `ha-card` globalnie narzuca mniejszy promień — wtedy **maksymalna zgodność wewnątrz** `.ebc-content`, bez walki z motywem.
3. **Siatki `.ebc-comparison-grid` / `.ebc-surface-grid`:** zwiększyć **odstęp poziomy między kolumnami** w stronę **~24px** ( oraz ewentualny **wewnętrzny padding 8px** na wrapperze siatki jak w Figmie), zamiast **12px** — przy zachowaniu środkowego dividera **1px**.
4. **Chip delty (`.ebc-delta-chip`):** zbliżyć do makiet: **padding ~4px 8px**, **gap** między kWh a separatorem a % jak w eksporcie (**~8–16px** z flex-wrap), **font ~14px** SemiBold — przy zachowaniu kolorów z **motywu** (`.ebc-trend--*`).

### 3.2. Typografia nagłówka (średni)

1. Jeśli produktowo akceptowalne: **uppercase** tytułu karty (albo sterowane opcją konfiguracyjną później) + **letter-spacing** jak **Label** (~0.05em), spójnie z `figma-design.md` §4.3.
2. **Waga tytułu:** makietowy **Bold (700)** vs obecne **600** — rozważyć **700** dla pierwszej linii nagłówka, żeby zgrać się z **Data status** (Roboto Bold w eksporcie).

### 3.3. Panel Forecast | Total (średni)

1. **Rozbicie wartości i jednostki** w wierszu liczby (jak **Value unit** w Figmie): **osobne spany** z `display: flex; align-items: flex-end; gap: 4px` zamiast jednego ciągu `312 kWh` w jednym bloku — ułatwia też **dokładne** rozmiary 16px/16px.
2. **Pewność prognozy (`.ebc-forecast-confidence`):** przenieść wizualnie **pod kolumnę Forecast** (w gridzie), **mniejsza typografia (~11px)** i **wyrównanie do prawej** jak w makiecie; treść pozostaje w i18n, ale układ ma odzwierciedlać Figmę (nie pełna szerokość pod obiema kolumnami, chyba że ustalimy inaczej z UX).

### 3.4. Inteligent comment (średni)

1. Dodać **tło / pierścień** wokół ikony (40px) w **kolorze trendu** lub neutralnym — odpowiednik warstw „Comment icon” z Figmy, **bez** assetów MCP.
2. **Typografia treści:** rozdzielić styl **wtórny** (jak `colors/secondary`) i **akcent liczby** (bold + `primary`) przez **strukturalny markup** z tłumaczeniami (patrz §1.5).

### 3.5. Warning status (niski)

1. Dopasować **rozmiar ikony** i **vertical alignment** do makiet (MCP sugeruje ~18×15 obszar — zostać przy `mdi` w `ha-icon`, **nie** importować PNG).
2. Ujednolicić **gap** i **padding** z tokenami `Size/8` / `Size/16` / `Size/24` po decyzji projektowej (§1.5).

### 3.6. Wykres (odsyłacz — wysoki, ale poza samym CSS karty)

Realizacja wyłącznie wg **`figma-design.md` §2** oraz **wymagań 2–6** w `figma-specify-prompt.md` w modułach ECharts (`echarts-renderer.ts` itd.). Refaktor paneli **nie może** rozjechać semantyki kolorów trendu względem wykresu.

---

## 4. Kolejność prac (sugerowana)

1. **Tokeny spacing/radius/panel padding** (§3.1) — szybki zysk wizualny, niski ryzyko.
2. **Siatka 24px + chip delty** (§3.1 pkt 3–4).
3. **Forecast: layout wartości + confidence** (§3.3).
4. **Nagłówek: typografia** (§3.2) — po akceptacji produktowej uppercase.
5. **Komentarz: struktura tekstu + tło ikony** (§3.4).
6. **Wykres** — równolegle lub tuż po 1–2, jeśli zespół dzieli zadania (ten sam model trendu).

---

## 5. Kryteria „gotowe” dla refactor-1

- [ ] Odległości **karta / panele / siatki / chip** są **zgodne z makietą** z sekcji §1 z tolerancją ±2px lub uzasadnionym odstępstwem motywu HA.
- [ ] **Forecast | Total** i **porównanie okresów** mają **spójny** radius i padding jak **Surface** w Figmie.
- [ ] **Nie wprowadzono** sztywnych hex z Figmy tam, gdzie jest semantyczna zmienna HA (**§4.0 `figma-design.md`**).
- [ ] **Brak** assetów ikon z MCP w repozytorium; wyłącznie **MDI** + `ha-icon` / `ha-state-icon`.
- [ ] Narracja (**Inteligent comment**) ma **czytelną hierarchię typograficzną** jak w makiecie lub uzasadniony dokumentem kompromis (np. jeden kolor jeśli i18n blokuje podział).
- [ ] Regresja: **`npm test`**, **`npm run lint`**, edytor GUI i tłumaczenia **bez zepsutych kluczy** (US-8).

---

## 6. Świadome „nie w tym refaktorze”

- Zmiana kontraktu encji YAML, sposobu pobierania LTS, ani logiki presetów — tylko jeśli wynika z **US-3** i jest już w osobnej specyfikacji.
- **Code Connect** — opcjonalnie, jak w §8 `figma-design.md`.
- Kopiowanie **wygenerowanego kodu React/Tailwind** z MCP — wyłącznie jako **referencja miar**, nie jako kod produkcyjny.

---

*Dokument: **figma-design-refactor-1.md** — pierwsza iteracja wytycznych dopasowania UI do Figmy v0.5.0 przy zachowaniu `figma-design.md` i `figma-specify-prompt.md`.*
