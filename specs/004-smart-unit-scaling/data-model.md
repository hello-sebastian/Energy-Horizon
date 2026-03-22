# Data Model: Inteligentne skalowanie jednostek i formatowanie liczb

**Feature**: `004-smart-unit-scaling`  
**Phase**: 1 – Design  
**Date**: 2026-03-21

---

## Entities & Types

### 1. `SIPrefix` — prefiks SI (typ wewnętrzny)

```typescript
// src/utils/unit-scaler.ts

/**
 * Zbiór obsługiwanych prefiksów SI.
 * Wewnętrznie 'u' = µ (mikro, U+00B5).
 * Pusty string '' = jednostka bazowa (brak prefiksu).
 */
export type SIPrefix = 'G' | 'M' | 'k' | '' | 'm' | 'u';
```

| Wartość | Mnożnik SI  | Symbol wyświetlany |
|---------|-------------|-------------------|
| `'G'`   | 1 000 000 000 | G               |
| `'M'`   | 1 000 000   | M                |
| `'k'`   | 1 000       | k                |
| `''`    | 1           | (brak)           |
| `'m'`   | 0,001       | m                |
| `'u'`   | 0,000 001   | µ (U+00B5)       |

**Walidacja**: `SIPrefix` nie może przyjąć innej wartości; nieznane wejście → fallback do `''`.

---

### 2. `ForcePrefix` — sterowanie trybem (konfiguracja YAML)

```typescript
// src/utils/unit-scaler.ts

/**
 * Wartość pola force_prefix w YAML:
 *  - 'auto'       → automatyczny wybór prefiksu (tryb domyślny)
 *  - 'none'       → surowe dane, brak skalowania
 *  - SIPrefix     → wymuszony prefiks (tryb manual)
 *  - 'µ'          → alias dla 'u'; normalizowany do 'u' podczas parsowania
 */
export type ForcePrefix = 'auto' | 'none' | SIPrefix | 'µ';
```

**Uwaga**: `'µ'` (U+00B5) jest akceptowany jako alias wejściowy i normalizowany do `'u'` przed przetworzeniem.

---

### 3. `UnitScaleOptions` — argument skalowania (tylko prefiks SI)

```typescript
// src/utils/unit-scaler.ts

/**
 * Opcje przekazywane do scaleSeriesValues — wyłącznie wybór prefiksu SI.
 * Precyzja dziesiętna nie należy do tego obiektu; jest w CardConfig.precision.
 */
export interface UnitScaleOptions {
  /**
   * Sterowanie skalowaniem SI:
   *   'auto'  — automatyczny prefiks na podstawie max serii (domyślne gdy pominięte)
   *   'none'  — surowe dane z HA bez konwersji
   *   'u'/'µ' — wymuszony prefiks mikro (µ)
   *   'm'     — wymuszony prefiks milli
   *   'k'     — wymuszony prefiks kilo
   *   'M'     — wymuszony prefiks mega
   *   'G'     — wymuszony prefiks giga
   */
  force_prefix?: ForcePrefix;
}
```

**Walidacje**:
- `force_prefix` poza zdefiniowanym zbiorem → fallback do `'auto'`; komunikat `console.warn` w trybie debug.
- `precision` dla wyświetlania liczb: wyłącznie `CardConfig.precision` (formatowanie w karcie / `formatScaledValue`).

---

### 4. `ParsedUnit` — wynik parsowania jednostki z HA

```typescript
// src/utils/unit-scaler.ts (typ wewnętrzny, nie eksportowany)

interface ParsedUnit {
  /** Jednostka bazowa po usunięciu prefiksu SI (np. "Wh" z "kWh", "A" z "mA"). */
  baseUnit: string;
  /** Prefiks SI już zawarty w jednostce encji HA (np. 'k' z "kWh"). '' jeśli brak. */
  existingPrefix: SIPrefix;
  /** Czy jednostka nadaje się do skalowania SI (false dla h, min, s, %, °C, itp.). */
  scalable: boolean;
}
```

---

### 5. `ScaleResult` — wynik skalowania serii

```typescript
// src/utils/unit-scaler.ts

/**
 * Wynik skalowania tablicy wartości liczbowych.
 * Wszystkie wartości w tablicy używają tej samej skali.
 */
export interface ScaleResult {
  /** Wartości po skalowaniu (do wyświetlenia na osi Y i w tooltip). */
  values: (number | null)[];

  /**
   * Etykieta jednostki do wyświetlenia (np. "kWh", "mA", "µA", "Wh").
   * Używa symbolu µ (U+00B5) dla prefiksu mikro.
   */
  unit: string;

  /** Wybrany prefiks SI (wewnętrzna reprezentacja). */
  prefix: SIPrefix;

  /**
   * Mnożnik zastosowany: rawValue * factor = scaledValue.
   * Przykład: rawValue [Wh] * 0.001 = scaledValue [kWh].
   * Wartość 1 oznacza brak konwersji (tryb none lub brak prefiksu).
   */
  factor: number;
}
```

**Niezmienniki**:
- `values.length === input.length` — zawsze.
- `null` w tablicy wejściowej → `null` w wynikowej (zachowanie ECharts dla przerw).
- `factor > 0` zawsze (brak możliwości ujemnych mnożników).

---

### 6. Rozszerzenie `CardConfig` (istniejący typ)

```typescript
// src/card/types.ts — pola na poziomie głównym karty YAML

export interface CardConfig {
  // ... istniejące pola bez zmian ...

  /** Opcjonalne: precyzja formatowania liczb (wykres, podsumowanie). */
  precision?: number;

  /**
   * Skalowanie SI: `auto` (domyślnie gdy pominięte), `none`, lub wymuszony prefiks.
   */
  force_prefix?: ForcePrefix;
}
```

**Domyślne zachowanie**: brak `force_prefix` → automatyczny wybór prefiksu (`auto`).

---

### 7. `ChartRendererConfig` — etykieta jednostki

`ChartRendererConfig` zawiera pole `unit: string` z **już skalowaną** etykietą (np. `"kWh"`, `"µA"`) z `ScaleResult.unit`. Renderer nie otrzymuje osobnego obiektu opcji skalowania — tylko gotowy łańcuch do osi Y i tooltipów.

---

## Stałe (`src/utils/unit-scaler.ts`)

### `SI_PREFIX_DATA`

```typescript
const SI_PREFIX_DATA: ReadonlyArray<{
  prefix: SIPrefix;
  factor: number;
  display: string;
}> = [
  { prefix: 'G', factor: 1_000_000_000, display: 'G'       },
  { prefix: 'M', factor: 1_000_000,     display: 'M'       },
  { prefix: 'k', factor: 1_000,         display: 'k'       },
  { prefix: '',  factor: 1,             display: ''        },
  { prefix: 'm', factor: 0.001,         display: 'm'       },
  { prefix: 'u', factor: 0.000_001,     display: '\u00B5'  }, // µ Micro Sign
];
```

### `NON_SCALABLE_UNITS`

```typescript
/**
 * Jednostki, których NIE skalujemy prefiksami SI.
 * Włączone: jednostki czasu, temperatury, kąta, ciśnienia (z prefiksem),
 * bezwymiarowe, częstotliwości z prefiksem, metr jako jednostka podstawowa.
 *
 * UWAGA: "m" (metr) jest tu, by zapobiec parsowaniu "m" jako prefiksu milli.
 * "mA" przejdzie, bo "A" nie jest w tym zbiorze.
 * "ms" (milisekunda?) — celowo wyłączone; "s" jest tu, więc parsowanie "ms" jako
 * prefix='m', base='s' zostanie odrzucone (base 's' jest w NON_SCALABLE_UNITS).
 */
const NON_SCALABLE_UNITS = new Set<string>([
  '%', '°C', '°F', 'K',
  'h', 'min', 's', 'ms', 'd',
  '°', 'lx', 'lm', 'pH', 'dB',
  'ppm', 'rpm',
  'bar', 'Pa', 'hPa', 'kPa', 'mbar',
  'm',              // metr — nie mylić z milli
  'Hz', 'kHz', 'MHz', 'GHz',
]);
```

---

## Funkcje publiczne (`src/utils/unit-scaler.ts`)

### `scaleSeriesValues()`

```typescript
/**
 * Skaluje tablicę wartości liczbowych do czytelnej skali SI.
 *
 * @param values        - Tablica wartości z HA (null = brak danych, zachowane jako null)
 * @param rawUnit       - Surowa jednostka z encji HA (np. "kWh", "mA", "Wh", "h")
 * @param options      - Opcje skalowania: `force_prefix` z karty (undefined → tryb auto)
 * @returns             - ScaleResult z przeskalowanymi wartościami i etykietą jednostki
 */
export function scaleSeriesValues(
  values: (number | null)[],
  rawUnit: string,
  options: UnitScaleOptions | undefined,
): ScaleResult
```

### `formatScaledValue()`

```typescript
/**
 * Formatuje pojedynczą przeskalowaną wartość do stringa z Intl.NumberFormat.
 * NIE wykonuje zamiany znaków — używa wyłącznie Intl.
 *
 * @param value         - Wartość po skalowaniu (z ScaleResult.values)
 * @param unit          - Etykieta jednostki (z ScaleResult.unit)
 * @param numberLocale  - Locale string (z numberFormatToLocale())
 * @param precision     - Liczba miejsc dziesiętnych
 * @returns             - Np. "1 234,5 kWh" lub "50 mA"
 */
export function formatScaledValue(
  value: number,
  unit: string,
  numberLocale: string,
  precision: number,
): string
```

---

## Diagram przepływu danych

```
YAML config (force_prefix na poziomie karty)
              │
              ▼
cumulative-comparison-chart.ts
  ├── hass.states[entity].attributes.unit_of_measurement  ──► rawUnit
  ├── ComparisonSeries.current.points[].value              ──► values[]
  └── scaleSeriesValues(values, rawUnit, { force_prefix: config.force_prefix })
              │
              ▼
        ScaleResult
   { values[], unit, prefix, factor }
              │
              ├──► ChartRendererConfig.unit  (etykieta osi Y)
              └──► SummaryStats.unit         (podsumowanie)
                        │
                        ▼
              echarts-renderer.ts
              (oś Y, tooltip — unit string)
```

---

## Reguły walidacji

| Wejście                          | Zachowanie                                        |
|----------------------------------|---------------------------------------------------|
| `force_prefix` nieznana wartość  | Fallback do `auto`; `console.warn` w debug        |
| `unit_of_measurement` puste      | `rawUnit = ''` → brak skalowania; unit = ''       |
| `unit_of_measurement` w NON_SCALABLE | Brak skalowania; unit bez prefiksu          |
| Seria pusta (`values = []`)      | `ScaleResult { values: [], unit: rawUnit, prefix: '', factor: 1 }` |
| max serii = 0 lub NaN            | Jednostka bazowa, brak prefiksu                   |
| `CardConfig.precision` < 0 lub NaN w formatowaniu | W `formatScaledValue` traktowane jak 0            |
| `force_prefix: 'µ'` (U+00B5)    | Normalizacja do `'u'` przed przetworzeniem        |
| `force_prefix: 'µ'` (U+03BC)    | Normalizacja do `'u'` przed przetworzeniem        |
| `null` w values[]                | Przekazywane jako `null` w wynikowej tablicy      |
