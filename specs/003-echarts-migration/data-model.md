# Data Model: ECharts Migration

**Feature**: `003-echarts-migration` | **Date**: 2026-03-18

---

## Encje / klasy

### 1. `EChartsRenderer` (nowa klasa)

**Plik**: `src/card/echarts-renderer.ts`  
**Zastępuje**: `src/card/chart-renderer.ts` → `ChartRenderer`

```ts
import type { ComparisonSeries, ChartRendererConfig, TimeSeriesPoint } from './types';
import type { ECharts } from 'echarts/core';

class EChartsRenderer {
  // Prywatne pola
  private readonly container: HTMLElement;
  private instance: ECharts | undefined;
  private readonly resizeObserver: ResizeObserver;
  private lastHash: string | undefined;

  // Konstruktor
  constructor(container: HTMLElement): void

  // Publiczne metody (interfejs identyczny z ChartRenderer)
  update(
    series: ComparisonSeries,
    fullTimeline: number[],
    rendererConfig: ChartRendererConfig,
    labels: { current: string; reference: string }
  ): void

  destroy(): void

  // Prywatne metody pomocnicze
  private alignSeriesOnTimeline(
    points: TimeSeriesPoint[],
    timeline: number[],
    referenceStart?: Date
  ): (number | null)[]

  private resolveColor(primaryColorConfig: string): string

  private getThemeHost(): HTMLElement

  /** Tokeny motywu HA z `getComputedStyle` hosta karty (`.ebc-card` / `ha-card`). */
  private getHaThemeTokens(): {
    referenceLine: string;
    grid: string;
    primaryText: string;
    tooltipBackground: string;
    tooltipBorder: string;
  }

  /** Po `finished`: dopasowanie `grid.top` i `min-height` kontenera do wysokości legendy. */
  private syncLegendLayoutAfterPaint(): void

  private buildOption(
    currentValues: (number | null)[],
    referenceValues: (number | null)[],
    fullTimeline: number[],
    rendererConfig: ChartRendererConfig,
    labels: { current: string; reference: string },
    primaryColor: string,
    theme: {
      referenceLine: string;
      grid: string;
      primaryText: string;
      tooltipBackground: string;
      tooltipBorder: string;
    }
  ): ECOption

  private niceMax(dataMax: number, splitCount: number): number
}
```

#### Cykl życia

```
constructor(container)
  → echarts.init(container)
  → instance.on('finished', syncLegendLayoutAfterPaint)
  → ResizeObserver.observe(container)

update(series, fullTimeline, rendererConfig, labels)
  → alignSeriesOnTimeline × 2
  → getHaThemeTokens() → snapshot do hash (odświeżenie przy zmianie motywu HA)
  → hash check (return early if same)
  → reset stanu synchronizacji legendy + `container.style.minHeight`
  → resolveColor + buildOption → ECOption
  → instance.setOption(option, { notMerge: true })
  → (po paint) `finished` → syncLegendLayoutAfterPaint: pomiar legendy → `grid.top` + ewentualnie `min-height` kontenera → `resize()`

destroy()
  → resizeObserver.disconnect()
  → instance.off('finished', ...)
  → instance.dispose()
  → instance = undefined
```

---

### 2. `ECOption` — kształt obiektu konfiguracji ECharts

**Typ źródłowy**: `ECOption` z `echarts/core` (alias `EChartsOption`)

```ts
type ECOption = {
  animation: false;

  grid: {
    containLabel: boolean;  // true — labels nie są przycinane
    left: number;   // np. odstęp od krawędzi (px)
    right: number;
    top: number;    // startowo budżet bazowy (np. 32px); po paint może być nadpisany przez syncLegendLayoutAfterPaint
    bottom: number;
  };

  xAxis: {
    type: 'value';
    min: 0;
    max: number;            // fullTimeline.length - 1
    interval: 1;
    axisLabel: {
      show: boolean;        // true
    };
    splitLine: {
      show: false;          // FR-009: pionowe linie siatki wyłączone
    };
    name: string;           // rendererConfig.periodLabel (FR-022)
    nameLocation: 'end';
  };

  yAxis: {
    type: 'value';
    min: 0;
    max: number;            // niceMax(dataMax, 4) — obliczone przed budowaniem opcji
    splitNumber: 4;         // FR-007: 5 ticków (0 + 4 odstępy)
    axisLabel: {
      formatter: (value: number) => string;  // FR-008: unit przy najwyższym ticku
    };
    splitLine: {
      lineStyle: { color: string };  // theme.grid
    };
  };

  legend: {
    show: boolean;         // true tylko gdy `rendererConfig.showLegend === true` (YAML `show_legend: true`)
    top: 0;
    left: 'center';
    textStyle: { color: string };   // theme.primaryText
    pageTextStyle: { color: string };
  };

  tooltip: {
    trigger: 'axis';
    backgroundColor: string;  // z --ha-card-background / --card-background-color
    borderColor: string;      // z theme.grid (--divider-color)
    textStyle: { color: string };
    axisPointer: { type: 'shadow'; shadowStyle: { color: string; opacity: number } };
    appendTo: HTMLElement;  // FR-010: Shadow DOM fix
  };

  series: EChartsSeries[];  // patrz poniżej — kolejność warstw: następny podrozdział
};
```

#### Kolejność warstw (`series`) i legenda

W ECharts **późniejsze** serie w tablicy `series` są domyślnie rysowane **nad** wcześniejszymi. Renderer MUSI więc układać wpisy tak, aby **młodsze okna czasowe przykrywały starsze** (FR-020 / FR-018 w 001-time-windows-engine): praktycznie `context` od najstarszego do najmłodszego okna, potem referencja (solid + opcjonalny dashed overlay null-gap), potem bieżąca (solid + dashed), na końcu prognoza.

Kolejność w **legendzie** jest niezależna: `legend.data` ustawiane jest w kolejności bieżąca → referencja → prognoza (gdy włączona), aby zachować czytelność niezależnie od kolejności malowania.

---

### 3. `EChartsSeries` — warianty serii

#### 3a. Seria bieżąca (current)

```ts
{
  type: 'line',
  name: string,                        // labels.current
  data: (number | null)[],             // currentValues aligned on timeline
  lineStyle: { color: string, width: 1.5 },
  areaStyle: { opacity: number } | { opacity: 0 },   // FR-005
  connectNulls: false,                 // FR-002
  showSymbol: false,
  smooth: false,
  markLine: MarkLineOption,            // FR-003/FR-004: marker "dziś"
  markPoint: MarkPointOption           // FR-003: kropka na current Y
}
```

#### 3b. Seria referencyjna (reference) — opcjonalna

```ts
{
  type: 'line',
  name: string,                        // labels.reference
  data: (number | null)[],             // referenceValues aligned on timeline
  lineStyle: { color: string, width: 1.5 },
  areaStyle: { opacity: number } | { opacity: 0 },
  connectNulls: false,
  showSymbol: false,
  smooth: false,
  markPoint: MarkPointOption           // FR-003: kropka na reference Y
}
```

#### 3c. Seria prognozy — opcjonalna (FR-006)

```ts
{
  type: 'line',
  name: 'Forecast',
  data: [[todaySlotIndex, todayCurrentY], [lastSlotIndex, forecastTotal]],
  lineStyle: { type: 'dashed', color: string, width: 1.5 },
  areaStyle: { opacity: 0 },
  showSymbol: false,
  connectNulls: false
}
```

Warunek włączenia: `showForecast && todaySlotIndex >= 0 && todayCurrentY !== null && forecastTotal !== undefined`

#### 3d. Dashed null-gap overlay (opcjonalna)

Gdy w YAML ustawiono flagę logiczna `connect_nulls: true` (domyslnie), renderer dodaje dodatkowa serie liniowa "overlay" dla luki `null`:
- przerywana linia (`lineStyle.type: 'dashed'`)
- bez wypelnienia (`areaStyle.opacity: 0`)
- interpolacja liniowa liczona tylko wewnatrz spójnej luki `null` (miedzy dwoma sasiadujacymi punktami non-null)
- poza lukami pozostaja `null`

Uwaga: solid series nadal ma gapy (connectNulls: false), overlay to tylko wizualna wskazowka.

---

### 4. `MarkLineOption` — marker „dziś" (linia przerywana)

Dwa przypadki z `research.md`:

**Wariant A** — przynajmniej jedna seria ma wartość w slocie dzisiejszym:
```ts
markLine: {
  silent: true,
  symbol: ['none', 'none'],
  data: [[
    { coord: [todaySlotIndex, 0] },
    { coord: [todaySlotIndex, yTop] }
  ]],
  lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 }
}
```
`yTop = Math.max(currentY ?? 0, referenceY ?? 0)` (przy czym wartość `null` = 0 w tym porównaniu; `null` oznacza nieobecność, ale linię rysujemy do wartości niezerowej serii jak w FR-004).

Korekta per FR-004: jeśli `currentY === null && referenceY !== null` → `yTop = referenceY`.  
Jeśli `currentY !== null && referenceY === null` → `yTop = currentY`.  
Jeśli oba non-null → `yTop = Math.max(currentY, referenceY)`.

**Wariant B** — obie serie mają `null`:
```ts
markLine: {
  silent: true,
  symbol: ['none', 'none'],
  data: [{ xAxis: todaySlotIndex }],
  lineStyle: { type: 'dashed', color: primaryColor, width: 1.5 }
}
```
(linia biegnie do górnej krawędzi — domyślne zachowanie ECharts xAxis markLine)

---

### 5. `MarkPointOption` — kropki przy wartościach

```ts
markPoint: {
  silent: true,
  symbol: 'circle',
  symbolSize: 6,
  data: [
    { coord: [todaySlotIndex, todayY], itemStyle: { color: seriesColor } }
  ]
  // data jest pusta gdy todayY === null (marker nie jest wyświetlany)
}
```

---

### 6. Funkcja `niceMax(dataMax, splitCount)` — pomocnicza

```ts
function niceMax(dataMax: number, splitCount: number): number
```

**Wejście**: `dataMax: number` — maksimum ze wszystkich non-null wartości serii; `splitCount: number` — liczba odstępów (4 dla 5 ticków)  
**Wyjście**: `number` — zaokrąglona "ładna" wartość max identyczna z tym co ECharts obliczy wewnętrznie

**Algorytm (uproszczony)**:
1. Jeśli `dataMax <= 0`, zwróć `splitCount` (minimum sensowna wartość)
2. Oblicz `step = Math.pow(10, Math.floor(Math.log10(dataMax / splitCount)))`
3. `niceStep = step * (round up dataMax/splitCount/step to [1,2,2.5,5,10])`
4. Zwróć `Math.ceil(dataMax / niceStep) * niceStep`

Implementacja może być prosta i konserwatywna — ważne żeby wartość była ≥ `dataMax` i "ładna".

---

### 7. Relacje między encjami

```
cumulative-comparison-chart.ts
  └─ EChartsRenderer (1 instancja na lifetime karty)
       ├─ ECharts instance (echarts.init)
       ├─ ResizeObserver
       └─ buildOption() → ECOption
            ├─ current series (LineChart)
            │    ├─ markLine (dzisiejsza linia — Wariant A lub B)
            │    └─ markPoint (dzisiejsza kropka — opcjonalna)
            ├─ reference series (LineChart — opcjonalna)
            │    └─ markPoint (dzisiejsza kropka — opcjonalna)
            └─ forecast series (LineChart — opcjonalna)
```

---

### 8. Walidacje i edge cases

| Przypadek | Zachowanie |
|-----------|-----------|
| `fullTimeline.length === 0` | Brak serii w ECOption; wykres pusty bez błędu JS |
| `series.reference === undefined` | Seria referencyjna pominięta; legenda/tooltip 1 pozycja |
| `todaySlotIndex === -1` | `markLine` i `markPoint` pominięte; prognoza pominięta |
| `showForecast && forecastTotal === undefined` | Seria prognozy pominięta |
| `container.offsetWidth === 0` | `echarts.init` wywoływany — ECharts renderuje pusty canvas; przy kolejnym resize automatycznie poprawia |
| `show_legend` nie jest `true` | `legend.show: false`; brak synchronizacji wysokości legendy (fallback `grid.top`) |
| Zmiana motywu HA (jasny/ciemny) | Tokeny w hash `update()` — wykres odświeża kolory bez ręcznego reloadu |
| Wielowierszowa legenda | `syncLegendLayoutAfterPaint` zwiększa `grid.top` i ewent. `min-height` kontenera |
| `primary_color` z `rgba(...)` + `fill_current_opacity` | `areaStyle.opacity` override jest niezależny od alpha w kolorze bazowym — spełnia edge case ze spec |
| `destroy()` przed `update()` | Bezpieczne — `instance` jest undefined po dispose; update nie zostanie wywołane (guard w cumulative-comparison-chart.ts) |
| Wielokrotny `update()` bez `destroy()` | `setOption` z `notMerge: true` — stara opcja jest zastępowana, nie mergowana; 1 instancja ECharts |

---

### 9. Motyw Home Assistant → ECharts (wbudowane schematy)

| Token CSS (host karty) | Zastosowanie w opcjach |
|------------------------|-------------------------|
| `--secondary-text-color` | Seria referencyjna, markPoint referencyjny (fallback jeśli brak wartości) |
| `--divider-color` | `yAxis.splitLine`, obramowanie tooltipa, cień `axisPointer` |
| `--primary-text-color` | Etykiety osi X/Y, legenda, tekst tooltipa |
| `--ha-card-background` / `--card-background-color` | Tło tooltipa |

Kolor serii bieżącej: `primary_color` z konfiguracji lub `--accent-color` / `--primary-color` (`resolveColor`).

### 10. Synchronizacja legendy (nachodzenie na wykres)

Problem: ECharts może zawijać legendę do wielu wierszy; stałe `grid.top` powodowało nakładanie legendy na serie.

Rozwiązanie: `syncLegendLayoutAfterPaint()` na `finished`:

1. Jeśli `legend.show` jest wyłączone — `grid.top` pozostaje przy stałym fallback (np. 32px); `min-height` kontenera bez dopłaty.
2. Jeśli legenda widoczna — odczyt `getBoundingRect().height` widoku legendy → `grid.top = ceil(height) + 8` px.
3. Jeśli `height > 32` (budżet bazowy) — `container.style.minHeight = 240 + max(0, height - 32)` (wartości dokładne w kodzie: `CHART_MIN_HEIGHT_BASE_PX`, `LEGEND_BASELINE_PX`).
4. `setOption({ grid: { top } }, { notMerge: false })` + `resize()`.
5. Guard na deltę ≤ 1 px, aby uniknąć pętli `finished` ↔ `setOption`.

### 11. Typy konfiguracji (z `types.ts`)

- `CardConfig.show_legend` — opcjonalne boolean; `cumulative-comparison-chart` przekazuje `showLegend: this._config.show_legend === true`.
- `ChartRendererConfig` — m.in. `showLegend: boolean` — wejście dla `EChartsRenderer.update()`.

### 12. Inne typy (bez zmian w zakresie tej funkcji)

- `ComparisonSeries` — wejście dla `EChartsRenderer.update()`
- `TimeSeriesPoint` — wejście dla `alignSeriesOnTimeline()`
- `CumulativeSeries` — pośredni w `ComparisonSeries`

---

### 13. Zmiany w `cumulative-comparison-chart.ts`

Minimalne (FR-017):

| Linia | Przed | Po |
|-------|-------|-----|
| Import | `import { ChartRenderer } from './chart-renderer';` | `import { EChartsRenderer } from './echarts-renderer';` |
| Typ pola | `private _chartRenderer?: ChartRenderer;` | `private _chartRenderer?: EChartsRenderer;` |
| Selektor | `const canvas = this.renderRoot.querySelector("canvas") as HTMLCanvasElement \| null;` | `const container = this.renderRoot.querySelector(".chart-container") as HTMLElement \| null;` |
| Konstruktor | `this._chartRenderer = new ChartRenderer(canvas);` | `this._chartRenderer = new EChartsRenderer(container);` |
| Template | `<canvas></canvas>` | (można usunąć `<canvas>` — ECharts tworzy własny) |
