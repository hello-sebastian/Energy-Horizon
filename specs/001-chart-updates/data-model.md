# Data Model: Chart Updates – Faza 1

**Branch**: `001-chart-updates` | **Date**: 2026-03-17

---

## Przegląd zmian typów

Zmiany dotyczą dwóch plików:
1. `src/card/types.ts` — nowe pola w `CardConfig`, nowy interfejs `ChartRendererConfig`
2. `src/card/chart-renderer.ts` — wewnętrzny typ `ChartPoint` (nie eksportowany)

---

## 1. Zmiany w `src/card/types.ts`

### 1a. Rozszerzenie `CardConfig`

Dodać nowe pola do istniejącego interfejsu `CardConfig` (po linii `show_forecast?: boolean`):

```typescript
// --- Nowe pola (US3: Fill) ---
fill_current?: boolean;           // default: true  — czy wypełnienie pod serią bieżącą jest włączone
fill_reference?: boolean;         // default: false — czy wypełnienie pod serią referencyjną jest włączone
fill_current_opacity?: number;    // default: 30    — krycie wypełnienia serii bieżącej, zakres 0–100
fill_reference_opacity?: number;  // default: 30    — krycie wypełnienia serii referencyjnej, zakres 0–100

// --- Nowe pola (US4: Primary color) ---
primary_color?: string;           // kolor w notacji webowej (hex, rgb, rgba, nazwa CSS); brak = --accent-color
```

**Uwaga**: `show_forecast` już istnieje w `CardConfig` — nie trzeba dodawać ponownie.

### 1b. Nowy interfejs `ChartRendererConfig`

Dodać nowy eksportowany interfejs do `src/card/types.ts`:

```typescript
/**
 * Opcje przekazywane do ChartRenderer.update() jako konfiguracja wizualna.
 * Wydzielone z CardConfig, aby chart-renderer nie miał bezpośredniej zależności
 * od pełnej konfiguracji karty.
 */
export interface ChartRendererConfig {
  /** Kolor głównej serii. Już zresolvowany (hex/rgb/rgba). Nigdy undefined po resolucji. */
  primaryColor: string;

  /** Czy wypełnienie pod serią bieżącą jest widoczne. Default: true. */
  fillCurrent: boolean;

  /** Czy wypełnienie pod serią referencyjną jest widoczne. Default: false. */
  fillReference: boolean;

  /** Krycie wypełnienia serii bieżącej, 0–100. Default: 30. */
  fillCurrentOpacity: number;

  /** Krycie wypełnienia serii referencyjnej, 0–100. Default: 30. */
  fillReferenceOpacity: number;

  /** Czy linia prognozy jest widoczna. Default: false. */
  showForecast: boolean;

  /** Prognozowana wartość końcowa okresu. Undefined jeśli forecast niedostępny. */
  forecastTotal?: number;

  /** Jednostka miary (np. "kWh"). Pusta jeśli nieznana. */
  unit: string;

  /** Etykieta okresu na osi X (np. "2025" lub "Marzec"). */
  periodLabel: string;
}
```

---

## 2. Nowa funkcja w `src/card/ha-api.ts`

### `buildFullTimeline(period: ComparisonPeriod): number[]`

**Sygnatura**:
```typescript
export function buildFullTimeline(period: ComparisonPeriod): number[]
```

**Opis**: Generuje tablicę timestampów (ms, epoch) reprezentującą **wszystkie** oczekiwane sloty dla **pełnego** badanego okresu — niezależnie od dostępności danych.

**Zachowanie dla każdej agregacji**:

| `aggregation` | Słoty | Punkt startowy | Punkt końcowy |
|---|---|---|---|
| `day` | Każdy dzień, interwał 1 dzień | `floor(current_start)` do północy | koniec roku/miesiąca (patrz: fullEnd) |
| `week` | Każdy tydzień ISO, interwał 7 dni | Jak wyżej zaokrąglone do tygodnia | j.w. |
| `month` | Każdy miesiąc, 1. dzień miesiąca | 1. dzień `current_start.getMonth()` | 1. dzień ostatniego miesiąca okresu |

**Obliczanie fullEnd** (koniec pełnego okresu — niezależnie od current_end):
- `year_over_year` (tryb karty): `fullEnd = new Date(current_start.getFullYear(), 11, 31)`
- `month_over_year` (tryb karty): `fullEnd = new Date(current_start.getFullYear(), current_start.getMonth() + 1, 0)` (ostatni dzień miesiąca)

Ponieważ `buildFullTimeline` nie zna presetu karty (`comparison_preset` / znormalizowanego trybu) bezpośrednio (ma tylko `ComparisonPeriod`), `ComparisonPeriod` nie zawiera trybu. **Rozwiązanie**: Przekazać `fullEnd: Date` jako drugi argument.

**Zmieniona sygnatura**:
```typescript
export function buildFullTimeline(period: ComparisonPeriod, fullEnd: Date): number[]
```

**Pseudokod**:
```
slots = []
cursor = floor(period.current_start) to midnight
if aggregation == 'day':
  while cursor.date <= fullEnd.date:
    slots.push(cursor.getTime())
    cursor.setDate(cursor.getDate() + 1)
if aggregation == 'week':
  while cursor.date <= fullEnd.date:
    slots.push(cursor.getTime())
    cursor.setDate(cursor.getDate() + 7)
if aggregation == 'month':
  cursor = new Date(year, month, 1)
  while (cursor.year, cursor.month) <= (fullEnd.year, fullEnd.month):
    slots.push(cursor.getTime())
    cursor.setMonth(cursor.getMonth() + 1)
return slots
```

**Uwagi**:
- Funkcja jest czysta (pure function), łatwo testowalna.
- Dla `year_over_year` + `day` rok przestępny → 366 slotów (spec edge case).
- Cursor operuje na dacie lokalnej (new Date bez UTC), ponieważ HA zwraca dane w strefie lokalnej karty.

**Testy jednostkowe** (nowy plik `tests/unit/build-full-timeline.test.ts`):
- Rok zwykły → 365 slotów
- Rok przestępny → 366 slotów
- Miesiąc 30-dniowy → 30 slotów (agregacja: day)
- Agregacja week, styczeń → ~5 slotów
- Agregacja month, rok → 12 slotów

---

## 3. Zmiany w `src/card/chart-renderer.ts`

### 3a. Nowa sygnatura `ChartRenderer.update()`

**Stara sygnatura**:
```typescript
update(
  series: ComparisonSeries,
  labels: { current: string; reference: string }
): void
```

**Nowa sygnatura**:
```typescript
update(
  series: ComparisonSeries,
  fullTimeline: number[],         // tablica timestampów z buildFullTimeline()
  rendererConfig: ChartRendererConfig,
  labels: { current: string; reference: string }
): void
```

### 3b. Wewnętrzny typ `ChartPoint` (nie eksportować)

```typescript
type ChartPoint = { x: number; y: number | null };
```

### 3c. Prywatna funkcja `alignSeriesOnTimeline`

```typescript
private alignSeriesOnTimeline(
  points: TimeSeriesPoint[],
  timeline: number[],
  referenceStart?: Date    // jeśli podano: wyrównanie po indeksie slotu w ref. okresie
): (number | null)[]
```

**Opis**: Mapuje punkty serii na N slotów pełnej osi czasu. Zwraca tablicę długości `timeline.length` gdzie każda wartość to:
- `value` z `TimeSeriesPoint` jeśli istnieje punkt dla danego slotu
- `null` jeśli brak danych

**Wyrównanie dla serii bieżącej** (bez `referenceStart`):
- Dla każdego slotu `timeline[i]` szukaj punktu z `timestamp` w przedziale `[slot, slot + slotDuration)`.
- Wartość = `point.value` (kumulatywna) lub `null`.

**Wyrównanie dla serii referencyjnej** (z `referenceStart`):
- Slot `i` → expected timestamp = `referenceStart.getTime() + (timeline[i] - timeline[0])`.
- Szukaj punktu referencyjnego dla tego expected timestamp.
- Wartość = `point.value` lub `null`.

### 3d. Prywatna funkcja `resolveColor`

```typescript
private resolveColor(primaryColorConfig?: string): string
```

**Opis**: Zwraca resolved kolor. Priorytet: `primaryColorConfig` → CSS `--accent-color` → CSS `--primary-color` → `'#03a9f4'`.

### 3e. Prywatna funkcja `colorWithOpacity`

```typescript
private colorWithOpacity(cssColor: string, alpha: number): string
```

**Opis**: Parsuje kolor CSS i zwraca `rgba(r, g, b, alpha)` z nowym alpha. Używa canvas 1×1 px. Zwraca `'transparent'` jeśli canvas API niedostępne.

### 3f. Custom plugin `todayMarkerPlugin`

**Typ**: inline object literał, rejestrowany per-instancja Chart (przez `options.plugins`).

**Dane dla pluginu** (przechowywane jako właściwość klasy `ChartRenderer`):
```typescript
private _todaySlotIndex: number = -1;          // indeks slotu dziś (-1 = nie wyświetlaj)
private _todayCurrentY?: number;               // wartość kumulatywna dziś (seria bieżąca)
private _todayReferenceY?: number;             // wartość kumulatywna dziś (seria referencyjna)
private _primaryColorResolved: string = '#03a9f4';
```

### 3g. Zmiana hashowania danych

Aktualny hash obejmuje tylko `{c, r}`. Nowy hash musi obejmować też `rendererConfig` (żeby zmiana fill/color spowodowała re-render):

```typescript
const hash = JSON.stringify({ c: currentData, r: referenceData, cfg: rendererConfig });
```

---

## 4. Zmiany w `src/card/cumulative-comparison-chart.ts`

### 4a. Obliczanie `fullEnd` i `fullTimeline` przed wywołaniem `ChartRenderer.update()`

W metodzie `updated()` (gdzie inicializowany jest chart renderer):

```typescript
// Oblicz fullEnd na podstawie comparison_preset (presetu) i period
const fullEnd = this._computeFullEnd(this._state.period);
const fullTimeline = buildFullTimeline(this._state.period, fullEnd);

// Skompiluj ChartRendererConfig z CardConfig
const rendererConfig = this._buildRendererConfig();

// Wywołaj renderer
this._chartRenderer.update(
  this._state.comparisonSeries,
  fullTimeline,
  rendererConfig,
  { current: ..., reference: ... }
);
```

### 4b. Nowa prywatna metoda `_computeFullEnd(period: ComparisonPeriod): Date`

```typescript
private _computeFullEnd(period: ComparisonPeriod): Date {
  if (this._config.comparison_preset === 'year_over_year') {
    return new Date(period.current_start.getFullYear(), 11, 31);
  }
  // month_over_year
  return new Date(
    period.current_start.getFullYear(),
    period.current_start.getMonth() + 1,
    0   // dzień 0 następnego miesiąca = ostatni dzień bieżącego miesiąca
  );
}
```

### 4c. Nowa prywatna metoda `_buildRendererConfig(): ChartRendererConfig`

```typescript
private _buildRendererConfig(): ChartRendererConfig {
  const cfg = this._config;
  const period = this._state.period!;
  const lang = this._config.language ?? this.hass?.language ?? 'en';

  const periodLabel = cfg.comparison_preset === 'year_over_year'
    ? String(period.current_start.getFullYear())
    : new Intl.DateTimeFormat(lang, { month: 'long' }).format(period.current_start);

  const fillCurrentOpacity = clampOpacity(cfg.fill_current_opacity ?? 30);
  const fillReferenceOpacity = clampOpacity(cfg.fill_reference_opacity ?? 30);

  const unit = (this.hass.states?.[cfg.entity]?.attributes as {
    unit_of_measurement?: string;
  })?.unit_of_measurement ?? '';

  return {
    primaryColor: cfg.primary_color ?? '',    // '' = użyj CSS var w resolveColor()
    fillCurrent: cfg.fill_current ?? true,
    fillReference: cfg.fill_reference ?? false,
    fillCurrentOpacity,
    fillReferenceOpacity,
    showForecast: cfg.show_forecast !== false,
    forecastTotal: this._state.forecast?.enabled
      ? this._state.forecast.forecast_total
      : undefined,
    unit,
    periodLabel,
  };
}
```

**Helper `clampOpacity`** (lokalny w pliku, nie eksportowany):
```typescript
function clampOpacity(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100) return 30;
  return n;
}
```

---

## 5. Zmiany w `src/card/energy-horizon-card-styles.ts`

Zmiana jednej wartości CSS:

```css
/* Przed: */
.chart-container {
  position: relative;
  height: 200px;
}

/* Po: */
.chart-container {
  position: relative;
  height: 290px;  /* 200px × 1.45 = 290px (US7, FR-021) */
}
```

---

## 6. Zmiana w `README.md`

Dodać sekcję dokumentacji nowych opcji YAML (FR-022, FR-023). Przykład:

```markdown
## Opcje konfiguracji wykresu

| Opcja | Typ | Domyślna | Opis |
|---|---|---|---|
| `primary_color` | string | (kolor akcentu HA) | Kolor linii serii bieżącej (hex, rgb, rgba, CSS name) |
| `fill_current` | boolean | `true` | Wypełnienie pod serią bieżącą |
| `fill_reference` | boolean | `false` | Wypełnienie pod serią referencyjną |
| `fill_current_opacity` | number (0–100) | `30` | Krycie wypełnienia serii bieżącej (%) |
| `fill_reference_opacity` | number (0–100) | `30` | Krycie wypełnienia serii referencyjnej (%) |
| `show_forecast` | boolean | `true` | Linia prognozy na wykresie (`false` = ukryj) |
```

---

## 7. Relacje między encjami (diagram przepływu danych)

```
CardConfig (YAML)
    │
    ▼
cumulative-comparison-chart.ts
    │  _buildRendererConfig()     →  ChartRendererConfig
    │  _computeFullEnd()          →  Date
    │  buildFullTimeline()        →  number[]   (importowane z ha-api.ts)
    │
    ▼
ChartRenderer.update(
    series: ComparisonSeries,     ← ha-api.ts (istniejący)
    fullTimeline: number[],       ← nowe
    rendererConfig: ChartRendererConfig,  ← nowe
    labels: { current, reference }
)
    │
    ├── alignSeriesOnTimeline(current.points, fullTimeline)       → (number|null)[]
    ├── alignSeriesOnTimeline(reference.points, fullTimeline, referenceStart) → (number|null)[]
    ├── resolveColor(rendererConfig.primaryColor)                 → string (CSS color)
    ├── colorWithOpacity(color, opacity)                          → rgba(...)
    ├── buildDatasets(...)                                        → Chart.js datasets[]
    └── todayMarkerPlugin (afterDraw)                             → canvas draw
```

---

## 8. Walidacje i granice systemu

| Pole | Walidacja | Fallback |
|---|---|---|
| `primary_color` | Dowolny string CSS; niepoprawny → CSS ignoruje, `colorWithOpacity` zwraca rgba(0,0,0,alpha) | `--accent-color` lub `#03a9f4` |
| `fill_current_opacity` | `clampOpacity()`: liczba 0–100; poza zakresem/NaN → 30 | 30 |
| `fill_reference_opacity` | Jak wyżej | 30 |
| `fill_current` | Boolean; brak → `true` | `true` |
| `fill_reference` | Boolean; brak → `false` | `false` |
| `show_forecast` | Boolean; brak → włączone (`!== false`) | `true` (wizualnie) |
| Dzisiejszy dzień poza okresem | `_todaySlotIndex = -1` → plugin nic nie rysuje | brak marker/linii |
| Brak danych dla dziś | `_todayCurrentY = undefined` → kropka pominięta | linia pionowa do chartArea.top |
