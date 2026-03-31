# Data Model: Time Windows Engine

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 1. Konfiguracja karty (`CardConfig` — rozszerzenia)

| Pole | Typ | Opis |
|------|-----|------|
| `comparison_preset` | `"year_over_year" \| "month_over_year" \| "month_over_month"` | Preset porównania (kanoniczny klucz YAML); w UI edytora: **Comparison Preset**. Legacy: `comparison_mode` (nadal wspierany; priorytet ma `comparison_preset` przy obu). |
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

- `id`: `year_over_year` | `month_over_year` | `month_over_month`
- `template`: zestaw domyślnych pól `TimeWindowYaml` + ewentualne flagi **legacy** (tylko YoY / MoY):
  - `currentEndIsNow: true` dla `year_over_year` i `month_over_year` (bieżące okno kończy się na „teraz”)
  - `referenceFullPeriod: true` — referencja do końca roku/miesiąca kalendarzowego
- **`month_over_month`**: szablon `start_of_month` + `duration`/`step` = `1M`, `count: 2` **bez** flag legacy — wyliczenie przez ścieżkę generyczną; okno 0 = bieżący miesiąc kalendarzowy, okno 1 = poprzedni pełny miesiąc

**Preset a liczba okien (ujednolicenie z FR-015):** Domyślnie presety `year_over_year`, `month_over_year` i `month_over_month` implikują **dwa** okna (bieżące + referencyjne), o ile użytkownik nie nadpisze `count`. Jeśli użytkownik w YAML ustawi `count: 1` (lub równoważnik po merge), jawne nadpisanie **ma pierwszeństwo** — powstaje jedno okno, bez błędu walidacji (FR-015). Nie należy interpretować opisu encji „co najmniej dwa okna dla trybów roku/miesiąca” jako zakazu `count: 1` po nadpisaniu.

## 3. Wynik merge (`MergedTimeWindowConfig`)

- Wynik `deepMerge(preset.template, user.time_window)`
- Używany wyłącznie po stronie karty przed walidacją

## 4. Walidacja

| Reguła | Źródło |
|--------|--------|
| `count` ∈ [1, 24] | FR-016 |
| `step` po parsowaniu > 0 (żadnych zerowych/ujemnych) | Edge cases + FR-003 |
| Wymagane pola do wyliczenia okien obecne | FR-014 |
| **`anchor`** (jeśli podany): wyłącznie `start_of_year`, `start_of_month`, `start_of_hour`, `now` (zgodnie z resolve); inne wartości → błąd (hard limits LTS) | [spec.md — Hard limits / LTS](./spec.md) |
| **`duration`**: po parsowaniu skuteczna długość ≥ **1 h** (≥ 3 600 000 ms); poniżej → błąd | Hard limits LTS |
| **`aggregation`** (efektywna po merge z `CardConfig.aggregation`): dokładnie `hour` \| `day` \| `week` \| `month` albo brak (domyślne `day` tylko gdy pole nie podane); inny string z YAML → błąd | Hard limits LTS |
| Błąd → `ValidationResult { ok: false, errorKey: string, params?: Record }` | Konstytucja + FR-014 |

**Hard limits (LTS)**: naruszenia powyższych reguł kotwicy / `duration` / `aggregation` są wykrywane **fail-fast** przy konfiguracji karty (`setConfig`) — standardowy błąd Lovelace (`throw`), patrz [contracts/time-windows-engine.md](./contracts/time-windows-engine.md).

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

- **Model logiczny** (`ComparisonSeries`) bez zmian: `current`, `reference?`, `context[]` (okna 2..N−1 w kolejności rosnącego indeksu).
- **Kolejność rysowania** w tablicy `series` ECharts (starsze pod spodem, młodsze na wierzchu): najpierw `context` w kolejności **od najstarszego okna do najmłodszego** (w praktyce odwrócenie tablicy `context` względem indeksów okien), potem seria referencyjna (wraz z opcjonalnym dashed null-gap), potem bieżąca (+ dashed), na końcu prognoza — patrz FR-018 w [spec.md](./spec.md).
- **Legenda**: kolejność wpisów czytelna dla użytkownika (np. bieżąca → referencja → prognoza) ustawiana **osobno** (`legend.data`), niezależnie od kolejności warstw w `series`.
- metadane: które indeksy wchodzą do tooltipa (0 i 1 tylko)
- `xMax` / długość osi: liczba „slotów” wynikająca z **najdłuższego** okna (spec FR-009)
- **Prognoza (`computeForecast`)**: osobno od osi — `periodTotalBuckets` (mianownik ułamka ukończenia okresu) wyliczany dla **okna 0** (`buildTimelineSlots` na `ResolvedWindow[0]`); przy presetach YoY/MoY na ścieżce legacy jest to ten sam co liczba slotów pełnego okresu kalendarzowego bieżącej serii (zgodnie z `buildChartTimeline` w `ha-api.ts`). Patrz FR-017 w [spec.md](./spec.md).

## 7. Stan karty (`CardState`)

- `status: "error"` z `errorMessage` — walidacja `time_window` / przekroczenie 24 / błąd fetch
- Rozróżnienie komunikatów i18n: `status.config_invalid_time_window`, `status.config_too_many_windows`, itd.

## 8. Stany przejść (uproszczone)

```text
setConfig → merge → assertLtsHardLimits → validate
  → fail → throw (hard limits) lub error state (validation keys)
  → ok → loading → Promise.all(fetch per window) → map → ready | no-data | error
```

Szczegół: **assertLtsHardLimits** (kotwica, `duration` ≥ 1 h, dozwolona `aggregation`) — przy naruszeniu `throw` zanim karta przejdzie w `loading` / fetch LTS.

**Release (SC-005):** potwierdzenie czytelności wiki dla użytkowników zewnętrznych — procedura w [release-readiness.md](./release-readiness.md) (zadanie T030 w `tasks.md`; uzupełniane po implementacji, poza `checklists/`).
