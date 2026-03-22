# Contract: `src/utils/unit-scaler.ts` Public API

**Feature**: `004-smart-unit-scaling`  
**Phase**: 1 – Contracts  
**Date**: 2026-03-21

Plik `src/utils/unit-scaler.ts` jest **czystą biblioteką TypeScript** (zero zależności zewnętrznych, zero zależności od Lit/HA). Niniejszy kontrakt definiuje jego interfejs publiczny.

---

## Eksportowane typy

### `SIPrefix`
```typescript
export type SIPrefix = 'G' | 'M' | 'k' | '' | 'm' | 'u';
```
- `'u'` = mikro (µ, 10⁻⁶) — ASCII-safe wewnątrz; wyświetlane jako `µ` (U+00B5) w UI.
- `''` = jednostka bazowa (brak prefiksu).

---

### `ForcePrefix`
```typescript
export type ForcePrefix = 'auto' | 'none' | SIPrefix | 'µ';
```
- `'auto'` — automatyczny prefiks na podstawie max serii (domyślne).
- `'none'` — brak skalowania, surowe dane.
- `SIPrefix` — wymuszony prefiks.
- `'µ'` — alias dla `'u'`; normalizowany przed przetworzeniem.

---

### `UnitScaleOptions`
```typescript
export interface UnitScaleOptions {
  force_prefix?: ForcePrefix;
}
```
Używane jako trzeci argument `scaleSeriesValues` — odpowiada polu `force_prefix` z **głównego poziomu** konfiguracji karty YAML (nie zagnieżdżonej sekcji):
```yaml
type: custom:energy-horizon-card
entity: sensor.example
force_prefix: auto   # auto | none | u | m | k | M | G — opcjonalne
precision: 2         # opcjonalne; wyłącznie w CardConfig, nie w UnitScaleOptions
```

---

### `ScaleResult`
```typescript
export interface ScaleResult {
  values: (number | null)[];
  unit: string;
  prefix: SIPrefix;
  factor: number;
}
```

---

## Eksportowane funkcje

### `scaleSeriesValues(values, rawUnit, options)`

**Sygnatura**
```typescript
export function scaleSeriesValues(
  values: (number | null)[],
  rawUnit: string,
  options: UnitScaleOptions | undefined,
): ScaleResult
```

**Kontrakty wejścia**
| Parametr | Typ | Ograniczenia |
|----------|-----|--------------|
| `values` | `(number \| null)[]` | Może być pusta (`[]`); `null` = brak danych |
| `rawUnit` | `string` | Wartość `unit_of_measurement` z HA; może być `''` |
| `options` | `UnitScaleOptions \| undefined` | `undefined` lub brak `force_prefix` = domyślnie `auto` |

**Kontrakty wyjścia**
| Pole | Gwarancja |
|------|-----------|
| `values.length` | === `values.length` (wejście) |
| `unit` | Nigdy `undefined`; `''` gdy `rawUnit` puste |
| `factor` | Zawsze > 0 i skończony |
| `null` → `null` | Null w wejściu zachowany w wyjściu |

**Zachowanie per tryb**

| `force_prefix` | `rawUnit` skalowalny | Zachowanie |
|----------------|----------------------|------------|
| `'auto'`       | tak                  | Prefiks wybrany na podstawie `max(abs(values))` |
| `'auto'`       | nie (h, %, °C…)      | Brak skalowania; `unit = rawUnit` |
| `'none'`       | dowolny              | Brak skalowania; `unit = rawUnit`; `factor = 1` |
| `'k'` (etc.)   | tak                  | Wymuszony prefiks; konwersja z existing prefix |
| `'k'` (etc.)   | nie                  | Ignorowany; brak skalowania |
| `undefined`    | dowolny              | Jak `'auto'` |
| niepoprawna wartość | dowolny         | Jak `'auto'`; `console.warn` w debug |

**Przykłady**
```typescript
// Auto: 1500 Wh → 1.5 kWh
scaleSeriesValues([1500, 2000], 'Wh', { force_prefix: 'auto' })
// → { values: [1.5, 2.0], unit: 'kWh', prefix: 'k', factor: 0.001 }

// Manual: force k
scaleSeriesValues([500], 'Wh', { force_prefix: 'k' })
// → { values: [0.5], unit: 'kWh', prefix: 'k', factor: 0.001 }

// None: surowe dane
scaleSeriesValues([1500], 'Wh', { force_prefix: 'none' })
// → { values: [1500], unit: 'Wh', prefix: '', factor: 1 }

// Nieskalowalny: czas
scaleSeriesValues([2.5], 'h', { force_prefix: 'auto' })
// → { values: [2.5], unit: 'h', prefix: '', factor: 1 }

// Existing prefix: kWh
scaleSeriesValues([5000], 'kWh', { force_prefix: 'auto' })
// → { values: [5.0], unit: 'MWh', prefix: 'M', factor: ... }

// Mikro: force u (µ w display)
scaleSeriesValues([0.00005], 'A', { force_prefix: 'u' })
// → { values: [50], unit: 'µA', prefix: 'u', factor: 1_000_000 }

// YAML µ jako alias → normalizacja
scaleSeriesValues([0.00005], 'A', { force_prefix: 'µ' })
// → { values: [50], unit: 'µA', prefix: 'u', factor: 1_000_000 }

// Pusty unit
scaleSeriesValues([100], '', { force_prefix: 'auto' })
// → { values: [100], unit: '', prefix: '', factor: 1 }

// Pusta seria
scaleSeriesValues([], 'Wh', { force_prefix: 'auto' })
// → { values: [], unit: 'Wh', prefix: '', factor: 1 }

// Seria z nullami
scaleSeriesValues([1000, null, 2000], 'Wh', { force_prefix: 'auto' })
// → { values: [1.0, null, 2.0], unit: 'kWh', prefix: 'k', factor: 0.001 }
```

---

### `formatScaledValue(value, unit, numberLocale, precision)`

**Sygnatura**
```typescript
export function formatScaledValue(
  value: number,
  unit: string,
  numberLocale: string,
  precision: number,
): string
```

**Kontrakty**
- Zawsze używa `Intl.NumberFormat` — zero ręcznych zamian znaków.
- `numberLocale` pochodzi z `numberFormatToLocale()` z `src/card/localize.ts`.
- `precision` ≥ 0; jeśli < 0 lub NaN → traktowane jako 0.
- Zwraca `"${formatted} ${unit}".trim()` — zachowuje spację między liczbą a jednostką.
- Dla `unit = ''` zwraca sam sformatowany numer.

**Przykłady**
```typescript
formatScaledValue(1234.5, 'kWh', 'pl', 2) // "1 234,5 kWh"
formatScaledValue(1234.5, 'kWh', 'en-US', 2) // "1,234.5 kWh"
formatScaledValue(50, 'µA', 'en', 0)       // "50 µA"
formatScaledValue(0, 'Wh', 'pl', 1)        // "0 Wh"
```

---

## Zależności modułu

```
src/utils/unit-scaler.ts
  ├── Zależności NPM: BRAK
  ├── Zależności wewnętrzne: BRAK
  └── Używa: Intl.NumberFormat (natywne ECMAScript)
```

> Importujący (`cumulative-comparison-chart.ts`) odpowiada za dostarczenie `numberLocale`
> przez `numberFormatToLocale(resolvedLocale.numberFormat, resolvedLocale.language)`.

---

## Zmiany w istniejących kontraktach

### `src/card/types.ts` — modyfikacje

```typescript
// W istniejącym interfejsie CardConfig (płaska konfiguracja):
precision?: number;
force_prefix?: ForcePrefix;
```

`ChartRendererConfig` przekazuje wyłącznie już obliczone `unit` (string) — bez osobnego pola na opcje skalowania.

### `src/card/cumulative-comparison-chart.ts` — modyfikacje

Przed wywołaniem `EChartsRenderer.update()`:
1. Pobranie `rawUnit` z `hass.states[config.entity]?.attributes?.unit_of_measurement ?? ''`.
2. Wywołanie `scaleSeriesValues(rawValues, rawUnit, { force_prefix: config.force_prefix })`.
3. Podstawienie `result.values` jako dane serii.
4. Przekazanie `result.unit` do `ChartRendererConfig.unit`.
5. Użycie `config.precision ?? 2` w formatowaniu liczb (`Intl.NumberFormat` / `formatScaledValue`).

### `src/card/echarts-renderer.ts` — modyfikacje

- `ChartRendererConfig.unit` (już istniejące pole) zawiera skalowaną etykietę — **brak zmian w logice renderera** poza upewnieniem się, że etykieta osi Y i tooltip korzystają z tego pola.
