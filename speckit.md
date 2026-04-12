# Speckit — dokumentacja wewnętrzna Energy-Horizon

Ten plik zbiera skrótową architekturę funkcji i powiązania ze Speckit (`specs/NNN-feature/`).

## Indeks wszystkich funkcji (specs/)

Tabela **wszystkich** katalogów `specs/*` z mapowaniem na kod i statusem: [specs/README.md](specs/README.md). Poniżej — rozwinięty opis wyłącznie **Time Windows** (główny moduł konfiguracji czasu).

## Silnik okien czasowych (Time Windows Engine) — `001-time-windows-engine`

**Cel**: Zastąpić sztywne rozgałęzienia oparte na pojedynczym kluczu presetu (dziś kanonicznie `comparison_preset` w YAML; legacy: `comparison_mode`) generycznym silnikiem, który z konfiguracji (preset + nadpisania YAML) buduje listę okien `[0..N−1]`, wylicza `start`/`end` i zasila warstwę pobierania danych oraz wykres.

### Przepływ danych (wysoki poziom)

1. **Wejście**: `comparison_preset` (preset porównania; w edytorze Lovelace etykieta **Comparison Preset**; odczyt legacy: `comparison_mode`) + opcjonalny blok `time_window` w YAML karty.
2. **Scalanie**: deep merge pól — wartości z `time_window` mają pierwszeństwo nad domyślnymi z presetu; nieokreślone pola pozostają z presetu.
3. **Ekspansja**: z parametrów `step` (dodatni) i `count` wygenerować N okien: dla indeksu `i` odległość wstecz wynosi `i × step` (okno bieżące: `i = 0`).
4. **Wyliczenie granic**: dla każdego okna — kotwica (`anchor`) + opcjonalny `offset` → punkt bazowy; następnie cofnięcie o wyliczoną odległość; następnie zastosowanie `duration` → para `(start, end)`. Agregacja (`aggregation`) jest atrybutem okna przekazywanym do warstwy zapytań.
5. **Pobieranie**: osobne żądania danych statystycznych per okno (dopuszczalna równoległość).
6. **Prezentacja**: serie 0 i 1 — pełna semantyka (styl, prognozy, tooltip); serie ≥ 2 — tylko tło wizualne, wyłączone z tooltipa i z logiki prognoz. Oś X = długość najdłuższego okna; krótsze serie kończą się na swoim ostatnim punkcie. **Prognoza** (`computeForecast`): mianownik ułamka ukończenia okresu = liczba slotów agregacji **okna 0** (`buildChartTimeline` → `forecastPeriodBuckets`), nie długość osi X — FR-017 w `specs/001-time-windows-engine/spec.md`.

### Presety (mapowanie koncepcyjne)

| Preset | Uproszczony model | Uwagi |
|--------|-------------------|--------|
| `year_over_year` | Kotwica: początek roku; `duration`: rok; `step`: rok; typowo `count: 2` | Zachować zgodność wsteczną z obecnym zachowaniem. |
| `month_over_year` | Kotwica: początek miesiąca; `duration`: miesiąc; `step`: rok; typowo `count: 2` | „Ten sam miesiąc rok temu”, nie „poprzedni miesiąc”. |
| `month_over_month` | Kotwica: początek miesiąca; `duration`: miesiąc; `step`: miesiąc; typowo `count: 2` | Dwa **kolejne** miesiące kalendarzowe: okno 0 = bieżący miesiąc, okno 1 = poprzedni pełny miesiąc; ścieżka generyczna (`resolveGeneric`), bez flag legacy YoY/MoY. |

### Artefakty Speckit

- Specyfikacja: `specs/001-time-windows-engine/spec.md`
- Plan: `specs/001-time-windows-engine/plan.md`
- Research: `specs/001-time-windows-engine/research.md`
- Model danych: `specs/001-time-windows-engine/data-model.md`
- Kontrakty: `specs/001-time-windows-engine/contracts/time-windows-engine.md`
- Quickstart: `specs/001-time-windows-engine/quickstart.md`
- Lista zadań: `specs/001-time-windows-engine/tasks.md` — `/speckit.tasks` (T029 zamknięte w tej sekcji + tabela presetów; T033 — dokumentacja `month_over_month` + Comparison Preset)
- Checklist release (SC-005): `specs/001-time-windows-engine/release-readiness.md` (po implementacji; T030)
- Szkic wiki: `specs/001-time-windows-engine/wiki-time-windows.md`

### Moduły `src/card/time-windows/` (implementacja)

| Plik | Rola |
|------|------|
| `duration-parse.ts` | Tokeny `1y` / `1M` / `1h` → Luxon `Duration` (FR-010) |
| `presets.ts` | Preset z YAML (`comparison_preset`; było `comparison_mode`) → szablon + flagi legacy (`currentEndIsNow`, `referenceFullPeriod`, `periodOffsetYears`) |
| `merge-config.ts` | Deep merge preset + `time_window` (FR-005); usuwa flagi legacy przy custom `anchor`/`step`/`count`/`offset` |
| `validate.ts` | `validateMergedTimeWindowConfig` — max 24, `step`/`duration` > 0, FR-014 / FR-016 |
| `resolve-windows.ts` | `resolveTimeWindows` — ścieżka legacy YoY/MoY vs generyczna (offset fiskalny: `start_of_year` + `offset`) |
| `index.ts` | Barrel: eksporty zgodne z `contracts/time-windows-engine.md` |

**Integracja**: `src/card/ha-api.ts` — `buildLtsQueriesForWindows`, `buildChartTimeline` (oś legacy vs najdłuższe okno + `forecastPeriodBuckets` dla okna 0), `buildTimelineSlots`, `countBucketsForWindow`, `comparisonPeriodFromResolvedWindows`. **Karta**: `cumulative-comparison-chart.ts` (walidacja → `Promise.all` zapytań LTS). **Wykres**: `echarts-renderer.ts` (serie kontekstowe, tooltip: current + reference + forecast label).

**Zależność NPM**: `luxon` (kalendarz / strefa w silniku).

**Testy**: `npm test` ustawia `TZ=UTC` (m.in. złoty test preset ↔ `buildComparisonPeriod`).

### Pola presetów (FR-004) — skrót dla dokumentacji wewnętrznej

| Preset | Domyślne pola logiczne (po merge z pustym `time_window`) |
|--------|-------------------------------------------------------------|
| `year_over_year` | Kotwica początku roku, `duration` ~ rok, `step` ~ rok, `count` 2, bieżące okno kończy się na **now**, referencja — pełny rok kalendarzowy z `period_offset` |
| `month_over_year` | Kotwica początku miesiąca, `duration` ~ miesiąc, `step` ~ rok, `count` 2, to samo rozróżnienie current vs reference co wyżej |
| `month_over_month` | Kotwica początku miesiąca, `duration` ~ miesiąc, `step` ~ miesiąc, `count` 2; **bez** `currentEndIsNow` / `referenceFullPeriod` — pełne miesiące kalendarzowe wg `resolveGeneric` |

Szczegóły: `research.md` (R2), `data-model.md` (preset vs `count: 1`).

### Zadania implementacyjne (orientacyjnie — szczegóły w `plan.md` / `tasks.md`)

- Interfejsy konfiguracji: `TimeWindowConfig`, `ComparisonEngineConfig` (lub równoważne nazwy) oraz funkcja scalania preset + YAML.
- Moduł / klasa silnika (np. `DataEngine`): wejście — rozwiązana konfiguracja; wyjście — tablica okien z `id`, indeksem, `start`, `end`, `aggregation`.
- Integracja z renderem wykresu: filtrowanie serii w tooltipie; długość osi X; style dla serii „wyciszonych”.
- Testy: **SC-002** (31 mar → luty); merge tylko `duration`; trzy serie, tooltip; przed release: **release-readiness.md** (SC-005).
