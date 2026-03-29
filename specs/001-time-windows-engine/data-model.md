# Data Model: Time Windows Engine

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 1. Konfiguracja karty (`CardConfig` — rozszerzenia)

| Pole | Typ | Opis |
|------|-----|------|
| `comparison_mode` | `"year_over_year" \| "month_over_year"` | Preset (bez zmian nazw) |
| `time_window` | `TimeWindowYaml \| undefined` | Opcjonalne nadpisania (deep merge z presetem) |
| `period_offset` | `number \| undefined` | Legacy: przy **wyłącznie** presetowej ścieżce (brak efektywnego `time_window` zmieniającego semantykę) zachowanie jak dziś; dokumentacja planu określi, czy w pełni custom oknach pole jest ignorowane czy mapowane (preferencja: **ignorowane**, gdy użytkownik ustawia pełny `time_window`, aby uniknąć podwójnego przesuwania) |
| Pozostałe pola | — | Bez zmian (`entity`, `aggregation`, …) |

### `TimeWindowYaml` (surowe YAML, częściowo znane)

Pola logiczne (nazwy dokładne do uzgodnienia w implementacji — spójne z wiki):

- `anchor`: enum string, np. `start_of_year`, `start_of_month`, `start_of_hour`, `now`
- `offset`: opcjonalny string duration, np. `+9M`
- `duration`: string, np. `1y`, `1M`, `7d`, `1h`
- `step`: string (dodatni krok wstecz), np. `1y`, `1M`, `1h`
- `count`: liczba całkowita ≥ 1
- `aggregation`: opcjonalnie nadpisuje granularność dla okien (lub per okno w przyszłości — poza MVP jeśli nie w specu)

## 2. Preset (`ComparisonModePreset`)

Struktura **wewnętrzna** (nie eksponowana w YAML):

- `id`: `year_over_year` | `month_over_year`
- `template`: zestaw domyślnych pól `TimeWindowYaml` + ewentualne flagi **legacy**:
  - `currentEndIsNow: true` dla obu presetów (bieżące okno kończy się na „teraz”)
  - `referenceFullPeriod: true` — referencja do końca roku/miesiąca kalendarzowego

**Preset a liczba okien (ujednolicenie z FR-015):** Domyślnie preset `year_over_year` / `month_over_year` implikuje **dwa** okna (bieżące + referencyjne). Jeśli użytkownik w YAML ustawi `count: 1` (lub równoważnik po merge), jawne nadpisanie **ma pierwszeństwo** — powstaje jedno okno, bez błędu walidacji (FR-015). Nie należy interpretować opisu encji „co najmniej dwa okna dla trybów roku/miesiąca” jako zakazu `count: 1` po nadpisaniu.

## 3. Wynik merge (`MergedTimeWindowConfig`)

- Wynik `deepMerge(preset.template, user.time_window)`
- Używany wyłącznie po stronie karty przed walidacją

## 4. Walidacja

| Reguła | Źródło |
|--------|--------|
| `count` ∈ [1, 24] | FR-016 |
| `step` po parsowaniu > 0 (żadnych zerowych/ujemnych) | Edge cases + FR-003 |
| Wymagane pola do wyliczenia okien obecne | FR-014 |
| Błąd → `ValidationResult { ok: false, errorKey: string, params?: Record }` | Konstytucja + FR-014 |

## 5. `ResolvedWindow` (wyjście silnika)

| Pole | Typ | Opis |
|------|-----|------|
| `index` | `0..N-1` | Pozycja w tablicy |
| `id` | `string` | Stabilny identyfikator, np. `current`, `reference`, `historical_2` |
| `start` | `Date` (lub ISO string w kontrakcie) | Początek okna (LTS) |
| `end` | `Date` | Koniec okna (LTS) |
| `aggregation` | `"day" \| "week" \| "month" \| "hour"` | Mapowanie do `LtsStatisticsQuery.period` |
| `role` | `"current" \| "reference" \| "context"` | `context` dla indeksów ≥ 2 |

## 6. Model danych wykresu

Rozszerzenie obecnego `ComparisonSeries`:

- **current**: `CumulativeSeries` — okno 0
- **reference**: `CumulativeSeries | undefined` — okno 1 (undefined przy FR-015)
- **context**: `CumulativeSeries[]` — okna 2..N−1 (kolejność zgodna z `index`)
- `aggregation`, `time_zone` — jak dziś

`ChartRendererConfig` / ECharts:

- lista serii: current + reference? + context[]
- metadane: które indeksy wchodzą do tooltipa (0 i 1 tylko)
- `xMax` / długość osi: liczba „slotów” wynikająca z **najdłuższego** okna (spec FR-009)

## 7. Stan karty (`CardState`)

- `status: "error"` z `errorMessage` — walidacja `time_window` / przekroczenie 24 / błąd fetch
- Rozróżnienie komunikatów i18n: `status.config_invalid_time_window`, `status.config_too_many_windows`, itd.

## 8. Stany przejść (uproszczone)

```text
setConfig → merge → validate
  → fail → error (bez fetch)
  → ok → loading → Promise.all(fetch per window) → map → ready | no-data | error
```

**Release (SC-005):** potwierdzenie czytelności wiki dla użytkowników zewnętrznych — procedura w [checklists/release-readiness.md](./checklists/release-readiness.md) (zadanie T030 w `tasks.md`).
