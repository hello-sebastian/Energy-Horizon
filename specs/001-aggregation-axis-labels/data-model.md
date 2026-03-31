# Data Model: Intelligent aggregation and X-axis labeling

**Branch**: `001-aggregation-axis-labels` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)

## Configuration (extends `CardConfig`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `aggregation` | `WindowAggregation` | No | Po merge **preset → `time_window` → `?? config.aggregation`**; gdy nadal brak — **auto-interval** (`pickAutoAggregation`) przed `resolveTimeWindows`. **v1**: jedno efektywne pole na `MergedTimeWindowConfig`, wspólne dla wszystkich okien (patrz [research.md](./research.md) R-008). |
| `x_axis_format` | `string` | No | Luxon-compatible; podzbiór tokenów z dokumentacji; gdy ustawione — etykiety osi X w trybie **forced**. |
| `tooltip_format` | `string` | No | Luxon-compatible (ten sam podzbiór co `x_axis_format`); gdy ustawione — nagłówek tooltipa w trybie **forced** (nadpisuje macierz FR-011). |

**Walidacja**:

- `x_axis_format`: dozwolone tokeny / wzorce z białą listą; błąd → `CardState` error przy **`setConfig`** (fail-fast, **przed** timeline — [research.md](./research.md) R-009).
- `tooltip_format`: ta sama walidacja co `x_axis_format`; błąd przy **`setConfig`**.
- Po zbudowaniu `timeline`: `timeline.length <= MAX_POINTS_PER_SERIES` (5000); inaczej błąd konfiguracji.

## Derived / runtime (not YAML)

| Concept | Description |
|---------|-------------|
| **Effective aggregation** | Wartość użyta w `resolveTimeWindows` i `buildTimelineSlots`: merge ręczny lub wynik `pickAutoAggregation(durationMs)`. |
| **Axis label profile** | `adaptive` \| `forced` (gdy `x_axis_format` ustawione). |
| **Label locale string** | `language` karty → `hass.locale?.language` → `"en"`. |
| **Display time zone** | `hass.config.time_zone` (string IANA), spójny z Luxon w reszcie karty. |

## `ChartRendererConfig` (extensions)

Pola do przekazania do `echarts-renderer` (orientacyjnie):

| Field | Type | Description |
|-------|------|-------------|
| `xAxisMode` | `'adaptive' \| 'forced'` | Wybór ścieżki formatowania. |
| `xAxisFormatPattern` | `string \| undefined` | Skopiowane z `x_axis_format` gdy forced. |
| `xAxisLabelLocale` | `string` | Locale do Intl / spójności z Luxon forced. |
| `haTimeZone` | `string` | Strefa HA dla wszystkich dat na osi. |
| `primaryAggregation` | `WindowAggregation` | Do gałęzi adaptacyjnej (hour vs day vs month vs year). |
| `mergedDurationMs` | `number` | Scalone `duration` (ms) — m.in. **EC2** (godzina + okno wielodniowe). |
| `tooltipFormatPattern` | `string \| undefined` | Z `tooltip_format` gdy wymuszony nagłówek tooltipa. |

*Dokładne nazewnictwo pól — do ustalenia przy implementacji (mogą być zgrupowane w jednym obiekcie `xAxisDisplay`).*

## Validation rules (summary)

1. `x_axis_format` puste lub undefined — pomijane; adaptive labels.
2. `x_axis_format` nieprawidłowe — wyjątek / stan błędu; brak cichego fallbacku do adaptive (spec Edge Case).
3. `timeline.length > 5000` — błąd; brak fetch/renderu wykresu.
4. Strefa: zawsze HA; brak przełącznika na strefę przeglądarki (poza zakresem).

## State transitions

- **Normal** → **Error (format)**: niepoprawny `x_axis_format` przy `setConfig` (przed `resolveTimeWindows` / `buildChartTimeline`).
- **Normal** → **Error (cap)**: `timeline.length > MAX_POINTS_PER_SERIES` po `buildChartTimeline` (przed dalszym renderem / fetch — jak w `tasks.md`).

## Implementation (v1)

- Jedna wspólna wartość **`aggregation`** dla wszystkich rozwiązanych okien po merge; logika pipeline w **`cumulative-comparison-chart.ts`**, spójnie z [plan.md](./plan.md) (*Single place for pipeline hooks*).
