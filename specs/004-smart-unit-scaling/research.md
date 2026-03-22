# Research: Inteligentne skalowanie jednostek i formatowanie liczb

**Feature**: `004-smart-unit-scaling`  
**Phase**: 0 – Research  
**Date**: 2026-03-21

---

## 1. Formatowanie liczb — Intl.NumberFormat vs. ręczna zamiana znaków

### Decision
Użyć wyłącznie `Intl.NumberFormat` z locale pobranym z istniejącej funkcji `numberFormatToLocale()` z `src/card/localize.ts`. **Absolutnie nie wolno stosować ręcznej zamiany znaków** (np. `replace('.', ',')` lub `replace(',', '.')`).

### Rationale
- `Intl.NumberFormat` jest natywnym standardem ECMAScript obsługiwanym we wszystkich nowoczesnych przeglądarkach (w tym tych wbudowanych w Home Assistant).
- Podejście oparte na `replace()` jest łamliwe: nie obsługuje separatorów tysięcy, nie radzi sobie z liczbami ujemnymi, nie uwzględnia locale-specificznych wyjątków.
- Projekt już wykorzystuje `Intl.NumberFormat` w `cumulative-comparison-chart.ts` (funkcja `formatSigned`). Nowe formatowanie musi być spójne z istniejącym wzorcem.
- `numberFormatToLocale(numberFormat, language)` → `string` — gotowy mechanizm mapowania konfiguracji HA na locale string. Użyjemy go bezpośrednio.

### Przykład użycia
```typescript
const localeStr = numberFormatToLocale(resolvedLocale.numberFormat, resolvedLocale.language);
const formatter = new Intl.NumberFormat(localeStr, {
  minimumFractionDigits: 0,
  maximumFractionDigits: precision,
});
formatter.format(scaledValue); // "1 234,5" dla pl-PL, "1,234.5" dla en-US
```

### Alternatives considered
- `toLocaleString()` — brak spójnej kontroli nad `minimumFractionDigits`; porzucone.
- Ręczna zamiana znaków — kategorycznie odrzucone; źródło błędów i niespójności.

---

## 2. Obsługa znaku µ (mikro) — kodowanie i YAML

### Decision
- **Wejście YAML**: akceptować zarówno `"u"` (ASCII, bezpieczne), jak i `"µ"` (U+00B5) jako wartość `force_prefix`.
- **Wewnętrzna reprezentacja**: zawsze `"u"` (ASCII) — prosta, przewidywalna, odporność na problemy z kodowaniem pliku YAML.
- **Wyświetlanie w UI**: zawsze `"µ"` (U+00B5, *Micro Sign*) — poprawny symbol SI widoczny dla użytkownika.

### Rationale
Problem z µ ma dwa wymiary:
1. **YAML/konfiguracja**: użytkownicy piszą `force_prefix: u` bo `µ` wymaga kopiowania spoza klawiatury. Trzeba oba akceptować.
2. **Kodowanie pliku**: µ to U+00B5 (Latin-1/Unicode); wiele edytorów i systemów może generować zamiast niego U+03BC (grec. litera mi). Trzymanie wewnętrznej reprezentacji jako `"u"` eliminuje to ryzyko.
3. **Wyświetlanie**: `"\u00B5"` to *właściwy* symbol mikro (Micro Sign) używany w SI; `"\u03BC"` (µ grecka) jest wizualnie identyczny, ale semantycznie inny. W kodzie TypeScript użyjemy literału `"\u00B5"` aby zawsze wyświetlać właściwy znak, niezależnie od kodowania pliku.

### Implementacja
```typescript
const PREFIX_DISPLAY: Record<SIPrefix, string> = {
  G: 'G', M: 'M', k: 'k', '': '', m: 'm',
  u: '\u00B5',  // µ Micro Sign — zawsze poprawny, niezależnie od kodowania pliku
};
```
Walidacja wejścia YAML: `force_prefix: µ` (U+00B5 lub U+03BC) → normalizacja do `'u'` przed przetworzeniem.

### Alternatives considered
- Przechowywanie wewnętrzne jako `"µ"` — ryzyko problemów z kodowaniem w różnych środowiskach; odrzucone.
- Wyświetlanie `"u"` w UI — niezgodne ze standardem SI; odrzucone.

---

## 3. Parsowanie jednostek z już istniejącym prefiksem SI (FR-013)

### Decision
Detekcja prefiksu przez prefix-strip: sprawdź, czy pierwsze znaki jednostki pasują do prefiksu SI **i** reszta ciągu jest niepustym ciągiem nie będącym jednostką nieskalowalną.

### Rationale
- HA może zwracać `unit_of_measurement: "kWh"`, `"mA"`, `"MWh"` bezpośrednio.
- Parsowanie przez mapę znanych prefiksów (G, M, k, m, µ/u, a nie h/min/s/%) jest wystarczające dla domeny energetycznej.
- Heurystyka prefix-strip jest prosta i przewidywalna; nie wymaga zewnętrznych bibliotek.

### Algorytm
```
function parseUnit(rawUnit: string): { baseUnit: string; existingPrefix: SIPrefix }
  1. Jeśli rawUnit jest w NON_SCALABLE_UNITS → { baseUnit: rawUnit, existingPrefix: '' }
  2. Dla każdego prefiksu SI (w kolejności od najdłuższego klucza):
     - candidate = rawUnit po usunięciu prefiksu z początku
     - Jeśli candidate jest niepusty I rawUnit !== candidate I candidate nie jest w NON_SCALABLE_UNITS
       → { baseUnit: candidate, existingPrefix: prefiks }
  3. Fallback → { baseUnit: rawUnit, existingPrefix: '' }
```

### Zbiór NON_SCALABLE_UNITS
Jednostki zawsze nieskalowalane SI (nie jest to zamknięta lista — system stosuje whitelist prefiksów):
```
%, °C, °F, K, h, min, s, ms, d, °, lx, lm, pH, dB, ppm, rpm, bar, Pa, hPa, kPa, m, Hz, kHz, MHz
```

> **Uwaga**: `m` (metr) jest tu wyłączony ze skalowania jako jednostka sama w sobie; `mA` — `m` + `A` — przejdzie przez parsowanie jako `prefix='m'`, `baseUnit='A'`, bo `A` nie jest w NON_SCALABLE_UNITS.

### Alternatives considered
- Pełna lista znanych jednostek SI z prefiksami (whitelist) — zbyt obszerna do utrzymania; odrzucone.
- Parsowanie przez regex — możliwe, ale mniej czytelne i trudniejsze do testowania; odrzucone.

---

## 4. Wybór prefiksu w trybie auto (FR-002)

### Decision
Reprezentatywna wartość = **maksimum serii** (zgodnie z clarifications spec.md 2026-03-21).
Progi skalowania zgodne ze standardem SI: wartość ≥ 1000 → prefiks w górę; wartość < 1 → prefiks w dół.

### Algorytm
```
function choosePrefix(maxValue: number, existingPrefixFactor: number): SIPrefix
  // maxValue już po przeliczeniu z istniejącego prefiksu na bazę (absolutna wartość bazowa)
  absoluteMax = |maxValue| * existingPrefixFactor
  Jeśli absoluteMax === 0 lub NaN → prefiks bazowy ('')
  Przejdź przez listę prefiksów malejąco (G, M, k, '', m, u):
    jeśli absoluteMax / prefixFactor >= 1 → wybierz ten prefiks
  Fallback → 'u'
```

### Zakres prefiksów
| Prefiks | Mnożnik   | Display |
|---------|-----------|---------|
| G       | 1 000 000 000 | G |
| M       | 1 000 000 | M |
| k       | 1 000     | k |
| (base)  | 1         |   |
| m       | 0,001     | m |
| u       | 0,000 001 | µ |

---

## 5. Integracja z istniejącą architekturą karty

### Decision
Nowa logika trafia wyłącznie do `src/utils/unit-scaler.ts`. Integracja z kartą odbywa się w `cumulative-comparison-chart.ts` (wyliczenie skalowania przed renderem) oraz w `echarts-renderer.ts` (przekazanie `unit` jako skalowanej etykiety osi Y i tooltip).

### Ścieżka danych
```
hass.states[entity].attributes.unit_of_measurement
  → [unit-scaler.ts] scaleSeriesValues(values, rawUnit, { force_prefix: config.force_prefix })
  → ScaleResult { values, unit, factor, prefix }
  → ChartRendererConfig.unit (przekazany do echarts-renderer)
  → oś Y ECharts, tooltip, podsumowanie
```

### Rationale
- `src/utils/unit-scaler.ts`: brak zależności od Lit/HA → łatwy do testowania i do ponownego użycia w innych kartach (cel użytkownika).
- `ChartRendererConfig.unit` już istnieje jako `string` → minimalna zmiana interfejsu: wystarczy przekazać już przeliczoną etykietę.
- `precision` z `CardConfig` steruje formatowaniem liczb; nie jest częścią `UnitScaleOptions` przekazywanych do `scaleSeriesValues`.

### Alternatives considered
- Skalowanie wewnątrz `echarts-renderer.ts` — naruszenie SRP; renderer nie powinien znać logiki biznesowej skalowania; odrzucone.
- Nowy mikroserwis/hook React — projekt używa Lit; odrzucone.
