# Quickstart: ECharts Migration

**Feature**: `003-echarts-migration` | **Date**: 2026-03-18

---

## Prerequisite: Instalacja zależności

```bash
# Dodaj ECharts (modular)
npm install echarts@^5.6.0

# Usuń Chart.js i adapter
npm uninstall chart.js chartjs-adapter-date-fns
```

`date-fns` POZOSTAJE w `dependencies` — używane przez inne moduły.

---

## Krok 1: Utwórz `src/card/echarts-renderer.ts`

Szkielet pliku (szczegóły w `data-model.md`):

```ts
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComparisonSeries, ChartRendererConfig, TimeSeriesPoint } from './types';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer
]);

export class EChartsRenderer {
  private readonly container: HTMLElement;
  private instance: ReturnType<typeof echarts.init> | undefined;
  private readonly resizeObserver: ResizeObserver;
  private lastHash: string | undefined;

  constructor(container: HTMLElement) {
    this.container = container;
    this.instance = echarts.init(container);
    this.resizeObserver = new ResizeObserver(() => this.instance?.resize());
    this.resizeObserver.observe(container);
  }

  update(
    series: ComparisonSeries,
    fullTimeline: number[],
    rendererConfig: ChartRendererConfig,
    labels: { current: string; reference: string }
  ): void {
    if (!this.instance) return;
    // ... implementacja (patrz data-model.md)
  }

  destroy(): void {
    this.resizeObserver.disconnect();
    this.instance?.dispose();
    this.instance = undefined;
  }

  // prywatne metody: alignSeriesOnTimeline, resolveColor, getThemeColors, buildOption, niceMax
}
```

---

## Krok 2: Zaktualizuj `src/card/cumulative-comparison-chart.ts`

Zmiany minimalne (2-4 linie):

```diff
- import { ChartRenderer } from './chart-renderer';
+ import { EChartsRenderer } from './echarts-renderer';

  // ...
  
- private _chartRenderer?: ChartRenderer;
+ private _chartRenderer?: EChartsRenderer;

  // W updated():
- const canvas = this.renderRoot.querySelector("canvas") as HTMLCanvasElement | null;
- if (canvas) {
-   this._chartRenderer = new ChartRenderer(canvas);
- }
+ const container = this.renderRoot.querySelector(".chart-container") as HTMLElement | null;
+ if (container) {
+   this._chartRenderer = new EChartsRenderer(container);
+ }
```

W template (opcjonalne — ECharts tworzy własny `<canvas>` wewnątrz kontenera):
```diff
  <div class="chart-container ebc-chart">
-   <canvas></canvas>
  </div>
```

---

## Krok 3: Uruchom testy

```bash
npm test
```

Istniejące testy NIE dotykają `chart-renderer.ts` — nie powinny się łamać.  
Nowe testy w `tests/unit/echarts-renderer.test.ts` (do napisania w `/speckit.tasks`).

---

## Krok 4: Build i weryfikacja

```bash
npm run build
```

Sprawdź w output:
- Brak stringów `chart.js` w bundle
- Brak `chartjs-adapter-date-fns` w bundle
- Rozmiar bundle gzip — porównaj z wersją przed migracją

---

## Kluczowe koncepty ECharts użyte w projekcie

| Cel | ECharts API | FR |
|-----|------------|-----|
| Renderowanie na canvas | `echarts.init(container)` + `CanvasRenderer` | FR-015 |
| Seria liniowa z null gaps (solid) | `type: 'line'`, `connectNulls: false` | FR-002 |
| Overlay dashed przez null gaps | `connect_nulls: true` (default) => dodatkowa przerywana seria z interpolacja (bez wypelnienia) | (konfigurowalne) |
| Wypełnienie pod serią | `areaStyle: { opacity: X }` | FR-005 |
| Oś Y 5 ticków | `splitNumber: 4`, `min: 0` | FR-007 |
| Unit przy najwyższym ticku Y | `axisLabel.formatter` z `niceMax` | FR-008 |
| Pionowe linie siatki wyłączone | `xAxis.splitLine.show: false` | FR-009 |
| Tooltip axis mode | `tooltip.trigger: 'axis'` | FR-010 |
| Shadow DOM tooltip fix | `tooltip.appendTo: container` | FR-010 |
| Legenda (opcjonalna) | `legend.show` ← `rendererConfig.showLegend === true` (YAML `show_legend: true`); inne wartości ukrywają legendę | FR-011 |
| Motyw HA (schematy kolorystyczne) | `resolveChartTheme()` / `resolveSeriesCurrentColor()` — `getComputedStyle` na hoście karty: `--secondary-text-color`, `--divider-color`, `--primary-text-color`, tło karty; seria bieżąca: `primary_color` lub `--eh-series-current` (domyślnie `#119894`) lub aliasy `ha-accent` / `ha-primary` | FR-013a |
| Legenda vs obszar wykresu | `instance.on('finished', …)` → `syncLegendLayoutAfterPaint()` — pomiar wysokości legendy, `grid.top`, ewent. `min-height` kontenera, `resize()` | FR-013b |
| Animacje wyłączone | `animation: false` | FR-012 |
| Marker dziś — linia | `markLine` na serii current | FR-003, FR-004 |
| Marker dziś — kropki | `markPoint` na seriach current + reference | FR-003 |
| Prognoza przerywana | osobna seria + `lineStyle.type: 'dashed'` | FR-006 |
| Resize | `ResizeObserver` → `instance.resize()` | FR-018, SC-006 |
| Cleanup | `instance.dispose()` + `resizeObserver.disconnect()` | FR-019, SC-005 |

---

## Ważne — Shadow DOM i tooltip

ECharts **domyślnie** renderuje tooltip do `document.body`. W Lit/Shadow DOM to powoduje błędy pozycjonowania. Zawsze ustaw:

```ts
tooltip: {
  appendTo: this.container  // ← element wewnątrz Shadow DOM
}
```

---

## Ważne — echarts.use() idempotentność

`echarts.use([...])` można wywołać wielokrotnie — rejestracja komponentów jest bezpieczna nawet przy wielu instancjach `EChartsRenderer`. Umieść je na poziomie modułu (poza klasą).

---

## Weryfikacja wymagań po implementacji (checklist dla implementatora)

- [ ] `import * as echarts from 'echarts'` — NIE ISTNIEJE w kodzie
- [ ] Canvas API calls (`ctx.arc`, `ctx.stroke` itp.) — NIE ISTNIEJĄ poza ECharts
- [ ] `chart.js` i `chartjs-adapter-date-fns` — USUNIĘTE z `package.json`
- [ ] `tooltip.appendTo` ustawiony na container element
- [ ] `connectNulls: false` na obu seriach danych (solid)
- [ ] `connect_nulls` steruje obecnoscia opcjonalnego dashed overlay przez luki `null`
- [ ] `markLine` używa coord-based approach dla FR-004 yTop logic
- [ ] `markPoint` ma `silent: true`
- [ ] `ResizeObserver.disconnect()` w `destroy()`
- [ ] `instance.dispose()` w `destroy()`
- [ ] `setOption` z `notMerge: true` w `update()` (czysty re-render)
- [ ] Hash guard w `update()` (early return gdy dane bez zmian); hash uwzględnia snapshot tokenów motywu HA
- [ ] `show_legend` / `ChartRendererConfig.showLegend` — legenda tylko przy ścisłym `true`
- [ ] Po `finished`: synchronizacja layoutu legendy (`grid.top`, `min-height` kontenera) gdy legenda widoczna
