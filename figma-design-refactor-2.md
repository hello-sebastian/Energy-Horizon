# Energy Horizon Card — wytyczne refaktoru UI (refactor-2)

**Cel:** zamknąć **siedem** zgłoszonych niedociągnięć wizualnych względem makiet **Energy Horizon Card v0.5.0** i potwierdzeń z pluginu Figma (MCP), przy zachowaniu [figma-design.md](figma-design.md) oraz spójności z kodem (Lit, CSS, Apache ECharts).

**Źródło wizualne (odczyt):**

- Figma: [Energy Horizon Card](https://www.figma.com/design/AbPnTcmRe6WhVGpJt8U6Xj/Energy-Horizon-Card?node-id=113-437) — `fileKey` `AbPnTcmRe6WhVGpJt8U6Xj`, ramka **`113:437`**, instancja **`116:763`** (*Energy horizon*).
- Weryfikacja: **plugin Figma (MCP)** — `get_design_context` na `116:763` (bez modyfikacji pliku w Figmie).

**Pliki nadrzędne w repo:**

- [figma-design.md](figma-design.md) — wykres §2.1–2.2, komponenty §3, tokeny §4.
- [figma-design-refactor-1.md](figma-design-refactor-1.md) — pierwsza iteracja wytycznych (refactor-2 ją **uzupełnia** i w jednym punkcie **koryguje** — patrz §6).

---

## 1. Potwierdzenie Figma (MCP) — istotne dla refactor-2

### 1.1. Inteligent comment / CommentIcon

- Kontener **40×40 px**, tło trendu **okrągłe**; ikona **MDI ~24 px** wyśrodkowana (w eksporcie: `relative size-[40px]` + warstwa ikony w `inset ~22.73%`).
- **Brak** osobnego kwadratowego „tile” w makiecie — kwadrat w produkcie pochodził od domyślnego renderu **`ha-icon`** w Lovelace.

### 1.2. Oś X wykresu (`echarts__xAxis__axisLabel`)

- **Trzy** etykiety: skrajne **11 px Regular**, kolor secondary (`#a1a1a1` w pliku); środkowa (bieżący agregat) **14 px Bold**, kolor primary (biały w makiecie).

### 1.3. Forecast | Total — wiersz wartości

- **16 px Bold** (wartość) + **16 px Regular** (jednostka), `gap` **4 px**, wyrównanie jak *Value unit* w komponencie `DataStatus` (*Default*).

### 1.4. Today pointer — kropka serii bieżącej

- Osobny asset **`Current series dot`** vs **`Refference series dot`** — w makiecie kropka bieżącej serii jest **czytelnie zarysowana** (wypełnienie serii + obramowanie), spójnie z kontrastem na tle wykresu.

---

## 2. Problem → przyczyna → zmiana → kryterium akceptacji

| # | Problem | Przyczyna w kodzie | Zmiana (implementacja) | Kryterium akceptacji |
|---|---------|-------------------|-------------------------|----------------------|
| 1 | Podwójne tło ikony komentarza (kwadrat + koło) | Style **`ha-icon`** (np. tło / cień) na tle `.ebc-comment-icon-wrap` | [energy-horizon-card-styles.ts](src/card/energy-horizon-card-styles.ts): `ha-icon` w komentarzu — `background: none`, `border-radius: 0`, `box-shadow: none`; `.ebc-comment-icon` 24×24, `overflow: visible` na wrap | W panelu komentarza widać **tylko** kółko 40 px + ikonę, bez szarego kwadratu |
| 2 | Liczba nad linią „dziś” | Domyślna etykieta **`markLine`** w ECharts | [echarts-renderer.ts](src/card/echarts-renderer.ts): `markLine.label.show: false` (także gdy brak „dziś” w zakresie) | Nad pionem **nie** ma etykiety liczbowej z ECharts |
| 3 | Niepoprawna specyfikacja kropki bieżącej serii | `markPoint`: mały wyłącznie wypełniony krąg | `symbolSize: 8`, `itemStyle`: `borderWidth: 2`, `borderColor: theme.referenceDotBorder` (jak obramowanie kropki referencji — kontrast na tle) | Kropka „dziś” na serii bieżącej jest **czytelna** i spójna z makietą (ring) |
| 4 | Wartość i jednostka nie na wspólnej linii bazowej | `align-items: flex-end` + `padding-bottom` na jednostce | `.ebc-value-row` / `.ebc-surface-value-row`: `align-items: baseline`; usunięte `padding-bottom` na jednostkach; `line-height: 1` na dużych liczbach | Liczba i jednostka w **jednym** wierszu mają **wspólną linię bazową** |
| 5 | Brak etykiet początek/koniec osi X | `axisLabel.hideOverlap: true` ukrywał skrajne etykiety; jeden styl koloru dla wszystkich ticków | Tryb **adaptacyjny** z widoczną serią bieżącą: `hideOverlap: false`; `formatter` + **`rich`**: `edge` (11 px, `theme.secondaryText`) vs `today` (14 px bold, `theme.primaryText`); [types.ts](src/card/types.ts) + karta: `ChartThemeResolved.secondaryText` | Widać **trzy** etykiety (gdy są w `xLabelStops`); skrajne **secondary**, środek **wyróżniony** jak w Figmie |
| 6 | „Pewność prognozy” ma być do lewej | `.ebc-forecast-confidence { text-align: right }` | `text-align: left` | Tekst pewności **wyrównany do lewej** w kolumnie Forecast |
| 7 | Za mały tekst Forecast / Total | `1rem` przy root HA często **14 px** zamiast **16 px** z makiet | `.ebc-surface-value-num` / `--unit`: **`font-size: 16px`** | Wiersz wartości Forecast i Total ma **16 px** jak *Data status* Default w Figmie |
| 8 | Seria bieżąca wizualnie = `--primary-color` HA zamiast akcentu marki z Figmy | `--eh-series-current: var(--primary-color, #119894)` oraz fallbacki `--accent-color` w theme | Domyślnie **`--eh-series-current: #119894`**; resolucja koloru w [`series-color.ts`](src/card/series-color.ts) (`resolveSeriesCurrentColor`); YAML `primary_color`: kolory CSS, `var(--…)`, aliasy `ha-accent` / `ha-primary-accent` / `ha-primary` | Linia, wypełnienie i **swatch** podpisów serii = ten sam kolor co `colors/accent/ehorizon` (**#119894**), chyba że użytkownik nadpisze YAML lub Card Mod |

---

## 3. Zmienione pliki (skrót)

| Plik | Zakres |
|------|--------|
| [src/card/energy-horizon-card-styles.ts](src/card/energy-horizon-card-styles.ts) | Komentarz `ha-icon`, baseline, pewność, surface 16 px; token **`--eh-series-current`** = `#119894` |
| [src/card/types.ts](src/card/types.ts) | `ChartThemeResolved.secondaryText`; JSDoc `primary_color` |
| [src/card/series-color.ts](src/card/series-color.ts) | **`resolveSeriesCurrentColor`** — domyślny teal, aliasy HA, `var()` |
| [src/card/cumulative-comparison-chart.ts](src/card/cumulative-comparison-chart.ts) | `_resolveChartTheme()` → `secondaryText`, **`resolveSeriesCurrentColor`** dla `seriesCurrent` |
| [src/card/echarts-renderer.ts](src/card/echarts-renderer.ts) | `resolveChartTheme`, `markLine.label`, oś X `rich` / `hideOverlap`, `markPoint` bieżący; **`resolveColor`** → `resolveSeriesCurrentColor` |
| [tests/unit/echarts-renderer.test.ts](tests/unit/echarts-renderer.test.ts) | Oś X + `markLine.label` |
| [tests/unit/trend-visual.test.ts](tests/unit/trend-visual.test.ts) | Mock `ChartThemeResolved` |
| [tests/unit/series-color.test.ts](tests/unit/series-color.test.ts) | Resolucja koloru serii bieżącej |

---

## 4. Kryteria „gotowe” dla refactor-2

- [ ] Ikona **Inteligent comment**: tylko **okrągłe** tło trendu, bez kwadratowego kontenera z `ha-icon`.
- [ ] Wykres: **brak** domyślnej etykiety liczbowej na `markLine` „dziś”.
- [ ] Kropka **bieżącej** serii w „dziś”: rozmiar i **obramowanie** zgodne z intencją makiet (`Current series dot`).
- [ ] Wszystkie pary **wartość + jednostka** (porównanie, Forecast, Total): **baseline** bez sztucznego `padding-bottom`.
- [ ] Oś X: **trzy** etykiety widoczne w scenariuszu z serią bieżącą; typografia **edge** vs **today** jak §1.2.
- [ ] **Pewność prognozy**: wyrównanie **do lewej**.
- [ ] **Forecast | Total**: **16 px** na liczbie i jednostce.
- [ ] **Kolor serii bieżącej**: domyślnie **#119894** (spójnie: wykres + swatch); motyw HA przez `primary_color` / Card Mod.
- [ ] Regresja: **`npm test`**, **`npm run lint`**.

---

## 5. Świadome decyzje produktowe

- **Pewność prognozy do lewej** — nadpisuje wytyczną z [figma-design-refactor-1.md](figma-design-refactor-1.md) §3.3 (*wyrównanie do prawej*), zgodnie z aktualnym wymaganiem produktowym.
- Oś X w trybie **`x_axis_format` (forced)** i gdy **brak** serii bieżącej: zachowane poprzednie zachowanie (`hideOverlap: true`, jeden kolor `primaryText`) — bez „rich” stylów, żeby nie psuć niestandardowych formatów YAML.

---

## 6. Świadome „poza tym refaktorem”

- Import assetów PNG kropek z MCP do repozytorium — **nie**; pozostają **wektorowe** symbole ECharts + tokeny motywu.
- Zmiana logiki danych prognozy / LTS — poza zakresem UI.

---

*Dokument: **figma-design-refactor-2.md** — druga iteracja dopasowania UI do Figmy v0.5.0 i raport wdrożenia refactor-2.*
