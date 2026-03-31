# Contract: Time Windows Engine (pure module)

**Consumers**: `cumulative-comparison-chart.ts`, testy Vitest  
**Path (planowany)**: `src/card/time-windows/`

W konfiguracji Lovelace kanoniczny klucz YAML to `comparison_preset` (legacy: `comparison_mode`); po normalizacji w karcie tryb jest przekazywany do merge/resolve jako wartość porównawcza (np. `ComparisonMode`), nie jako surowy string z YAML.

**Prognoza (integracja z kartą)**: warstwa `ha-api.ts` (`buildChartTimeline`, `countBucketsForWindow`) wylicza **`forecastPeriodBuckets`** dla `computeForecast`: przy wielu oknach o różnej długości mianownik opiera się na **oknie 0**, nie na maksymalnej rozpiętości listy okien ani wyłącznie na długości osi X (FR-009).

## Exports (logiczne)

### `mergeTimeWindowConfig`

- **Input**: `{ mode: ComparisonMode, timeWindowPartial?: TimeWindowYaml }`
- **Output**: `MergedTimeWindowConfig` (plain object)
- **Behavior**: Deep merge preset → partial; brak mutacji wejścia.

### `assertLtsHardLimits` (lub równoważna walidacja w karcie)

- **Input**: scalona konfiguracja po `mergeTimeWindowConfig` + efektywne `aggregation` z poziomu karty (`CardConfig`).
- **Output**: brak (void) albo **rzuca** `Error` z czytelnym komunikatem po angielsku (wzór kart Lovelace).
- **Behavior**: **Gwarancja publiczna** — naruszenie twardych limitów **rekordera / LTS** (minimalna rozdzielczość **1 godzina**) powoduje **fail-fast** w `setConfig` zanim karta ustawi stan ładowania lub wywoła zapytania LTS:
  - `anchor` spoza zbioru: `start_of_year`, `start_of_month`, `start_of_hour`, `now`;
  - `duration` krótsza niż 1 h po parsowaniu;
  - jawna `aggregation` spoza `hour` \| `day` \| `week` \| `month` (wartość „brak” jest OK — wtedy domyślne `day` nie jest autokorektą błędnego tokenu).
- **Brak autokorekty** — wyłącznie odrzucenie z wyjątkiem.

### `validateMergedTimeWindowConfig`

- **Input**: `MergedTimeWindowConfig`, opcje `{ maxWindows?: number }` (domyślnie `24`)
- **Output**:  
  `{ ok: true, merged: MergedTimeWindowConfig } | { ok: false, errorKey: string, errorParams?: Record<string, string | number> }`
- **Behavior**: Nie rzuca wyjątków dla typowych błędów użytkownika (np. `step` ≤ 0, `count` > 24) — te ścieżki zwracają `ok: false`. **Hard limits LTS** są obsługiwane osobno przez `assertLtsHardLimits` / równoważne sprawdzenie w karcie (**throw**), aby użytkownik widział standardowy overlay błędu Lovelace przy edycji YAML.

### `resolveTimeWindows`

- **Input**:
  - `merged: MergedTimeWindowConfig` (po udanej walidacji)
  - `now: Date` lub luxon `DateTime`
  - `timeZone: string` (z `resolveLocale`)
  - `maxWindows?: number` (domyślnie `24`; w testach można zwiększyć)
- **Output**: `ResolvedWindow[]` posortowane rosnąco po `index`, każdy element z `start ≤ end` w ISO do zapytań LTS.
- **Throws**: wyłącznie sytuacje programistyczne (np. wewnętrzny invariant) — nie dla błędnego YAML (to walidacja wcześniej).

### `buildLtsQueriesForWindows`

- **Input**: `ResolvedWindow[]`, `entityId: string`
- **Output**: `LtsStatisticsQuery[]` (ta sama długość co okna)
- **Behavior**: 1:1 mapowanie `aggregation` → pole `period` w zapytaniu HA.

## Preset contract (testowalny)

Publicznie (dla testów): tablica przypadków złotych:

| Mode | Oczekiwane N (domyślne) | `current[0].end` vs `now` | `reference[1].end` |
|------|-------------------------|----------------------------|---------------------|
| `year_over_year` | 2 | ≈ `now` (dzień/godzina) | koniec roku kalendarzowego |
| `month_over_year` | 2 | ≈ `now` | koniec tego samego miesiąca w roku ref. |
| `month_over_month` | 2 | koniec bieżącego miesiąca kalendarzowego (pełne okno) | koniec poprzedniego pełnego miesiąca kalendarzowego |

Dokładne wartości zależą od zegara mocka — testy używają **zamrożonego `now`**.

## Zależności zewnętrzne

- **Luxon** — jedyne wejście timezone dla wyliczeń w tym kontrakcie (po stronie implementacji).
- **Home Assistant** — tylko przez wyjście `LtsStatisticsQuery[]`, nie w silniku.
