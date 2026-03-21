# Quickstart: Inteligentne skalowanie jednostek

**Feature**: `004-smart-unit-scaling`  
**Dla**: Junior Developer implementujący zadania z `tasks.md`  
**Data**: 2026-03-21

---

## Co budujesz

Nowy plik `src/utils/unit-scaler.ts` — czysta TypeScript utility bez żadnych zależności zewnętrznych. Skaluje wartości z Home Assistant do czytelnej skali SI (Wh → kWh, mA → µA, itd.) i formatuje je przez `Intl.NumberFormat`.

---

## Szybkie uruchomienie

```bash
# Uruchom testy (z katalogu głównego projektu)
npm test

# Uruchom tylko testy unit-scaler (po stworzeniu pliku)
npm test -- unit-scaler
```

---

## Kluczowe pliki do stworzenia / modyfikacji

| Plik | Akcja | Dlaczego |
|------|-------|----------|
| `src/utils/unit-scaler.ts` | **STWÓRZ** | Główna logika skalowania i formatowania |
| `tests/unit/unit-scaler.test.ts` | **STWÓRZ** | Testy Vitest dla wszystkich scenariuszy |
| `src/card/types.ts` | **MODYFIKUJ** | Dodaj `UnitDisplayConfig`, `ForcePrefix`, `SIPrefix`; rozszerz `CardConfig` |
| `src/card/cumulative-comparison-chart.ts` | **MODYFIKUJ** | Wywołaj `scaleSeriesValues()` przed renderem |
| `src/card/echarts-renderer.ts` | **MODYFIKUJ** | Użyj skalowanej etykiety `unit` w osi Y i tooltip |

---

## Kluczowe zasady (przeczytaj uważnie)

### 1. Nigdy nie używaj replace() do formatowania liczb
```typescript
// ❌ ŹLE — łamliwe, niespójne
value.toString().replace('.', ',')

// ✅ DOBRZE — spójne z resztą karty
const fmt = new Intl.NumberFormat(numberLocale, { maximumFractionDigits: precision });
fmt.format(value); // "1 234,5" dla pl, "1,234.5" dla en-US
```

### 2. µ (mikro) — dwa aspekty
```typescript
// WEJŚCIE YAML: akceptuj oba zapisy i normalizuj do 'u'
const normalized = (fp === 'µ' || fp === '\u03BC') ? 'u' : fp;

// WYŚWIETLANIE: zawsze µ jako Unicode escape (nie ufaj kodowaniu pliku)
const display = '\u00B5'; // µ Micro Sign — ZAWSZE tak, nigdy wklejone bezpośrednio
```

### 3. Lokalizacja — użyj istniejącej infrastruktury
```typescript
// W cumulative-comparison-chart.ts, już masz resolvedLocale
const numberLocale = numberFormatToLocale(resolvedLocale.numberFormat, resolvedLocale.language);
// Przekaż numberLocale do formatScaledValue() — nie twórz własnego mechanizmu locale
```

### 4. unit-scaler.ts musi być bezstanowy
```typescript
// ✅ Czyste funkcje — zero stanu modułu, zero side effects
export function scaleSeriesValues(values, rawUnit, unitDisplay): ScaleResult { ... }
export function formatScaledValue(value, unit, locale, precision): string { ... }
```

### 5. Istniejący prefiks w jednostce (FR-013)
```typescript
// "kWh" w HA → nie traktuj 'k' jako 1000 sumy, ale jako już istniejący prefiks
// kWh × factor_k (1000) / factor_M (1_000_000) = MWh
// Przykład: [5000 kWh] auto → baza 5_000_000 Wh → M → 5 MWh
```

---

## Kolejność implementacji (zgodna z `tasks.md`)

1. **Typy** w `src/card/types.ts` — najpierw, bo reszta z nich importuje.
2. **`src/utils/unit-scaler.ts`** — stałe, `parseUnit()`, `choosePrefix()`, `scaleSeriesValues()`, `formatScaledValue()`.
3. **Testy** w `tests/unit/unit-scaler.test.ts` — napisz i upewnij się, że przechodzą przed integracją.
4. **Integracja** w `cumulative-comparison-chart.ts`.
5. **Integracja** w `echarts-renderer.ts` (jeśli potrzebne).

---

## Typowy scenariusz integracji

```typescript
// W cumulative-comparison-chart.ts, przed zbudowaniem ChartRendererConfig:

import { scaleSeriesValues, formatScaledValue } from '../utils/unit-scaler';
import { numberFormatToLocale } from './localize';

// 1. Pobierz rawUnit z HA
const rawUnit = (this.hass?.states?.[this._config.entity]?.attributes?.unit_of_measurement as string) ?? '';

// 2. Pobierz wartości z serii
const rawValues = series.current.points.map(p => p.value);

// 3. Skaluj
const scaleResult = scaleSeriesValues(rawValues, rawUnit, this._config.unit_display);

// 4. Wyznacz precision
const precision = this._config.unit_display?.precision ?? this._config.precision ?? 2;

// 5. Przekaż do ChartRendererConfig
const rendererConfig: ChartRendererConfig = {
  // ... istniejące pola ...
  unit: scaleResult.unit,   // ← skalowana etykieta np. "kWh"
  precision,
};
```

---

## Specyfikacja testów (miniatura)

Każdy test powinien być niezależny. Użyj `describe` + `it` z Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { scaleSeriesValues, formatScaledValue } from '../../src/utils/unit-scaler';

describe('scaleSeriesValues', () => {
  it('auto: 1500 Wh → 1.5 kWh', () => {
    const r = scaleSeriesValues([1500, 2000], 'Wh', { force_prefix: 'auto' });
    expect(r.values).toEqual([1.5, 2.0]);
    expect(r.unit).toBe('kWh');
  });

  it('none: 1500 Wh bez konwersji', () => {
    const r = scaleSeriesValues([1500], 'Wh', { force_prefix: 'none' });
    expect(r.values).toEqual([1500]);
    expect(r.unit).toBe('Wh');
  });

  it('jednostki czasu: nie skaluj h', () => {
    const r = scaleSeriesValues([2.5], 'h', { force_prefix: 'auto' });
    expect(r.unit).toBe('h');
    expect(r.factor).toBe(1);
  });

  it('mikro µ w YAML normalizowane do u', () => {
    const r = scaleSeriesValues([0.00005], 'A', { force_prefix: 'µ' });
    expect(r.unit).toBe('\u00B5A'); // µA
  });

  it('istniejący prefiks: 5000 kWh → 5 MWh', () => {
    const r = scaleSeriesValues([5000], 'kWh', { force_prefix: 'auto' });
    expect(r.unit).toBe('MWh');
    expect(r.values[0]).toBeCloseTo(5.0);
  });

  it('null zachowany w serii', () => {
    const r = scaleSeriesValues([1000, null, 2000], 'Wh', { force_prefix: 'auto' });
    expect(r.values[1]).toBeNull();
  });
});

describe('formatScaledValue', () => {
  it('Intl.NumberFormat dla pl', () => {
    // Nie zakładamy dokładnego separatora — test sprawdza, że nie używamy replace()
    const result = formatScaledValue(1234.5, 'kWh', 'pl', 1);
    expect(result).toContain('kWh');
    expect(result).not.toContain('.'); // pl nie używa kropki dziesiętnej
  });
});
```

---

## Częste pułapki

| Pułapka | Jak uniknąć |
|---------|-------------|
| Ręczna zamiana znaków w formacie | Zawsze `Intl.NumberFormat` |
| Wklejenie µ bezpośrednio do kodu | Używaj `'\u00B5'` |
| `scaleSeriesValues` mutuje `values[]` | Twórz nową tablicę: `values.map(v => v === null ? null : v * factor)` |
| Ignorowanie `null` w serii | Sprawdzaj `v === null ? null : v * factor` |
| Parsowanie `'m'` jako prefiksu `milli` dla jednostki `'m'` (metr) | `'m'` jest w `NON_SCALABLE_UNITS` |
| Zgadywanie prefiksu dla pustego `unit` | Jeśli `rawUnit === ''` → brak skalowania, `unit = ''` |
