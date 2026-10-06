# Speckit — dokumentacja wewnętrzna Energy-Horizon

Ten plik zbiera skrótową architekturę funkcji i powiązania ze Speckit (`specs/NNN-feature/`).

## Indeks wszystkich domen (specs/)

Tabela **wszystkich** katalogów `specs/*` z mapowaniem na kod i statusem: [specs/README.md](specs/README.md).

Dokumentacja Energy Horizon Card jest podzielona na 8 domen domenowych (`900–907`). Każda domena ma plik `spec.md` będący jedynym źródłem prawdy dla danego obszaru.

## Silnik okien czasowych — `900-time-model-windows`

**Cel**: Generyczny silnik, który z konfiguracji (preset + nadpisania YAML) buduje listę okien `[0..N−1]`, wylicza `start`/`end` i zasila warstwę pobierania danych oraz wykres.

### Przepływ danych (wysoki poziom)

1. **Wejście**: `comparison_preset` (preset porównania; w edytorze Lovelace etykieta **Comparison Preset**; odczyt legacy: `comparison_mode`) + opcjonalny blok `time_window` w YAML karty.
2. **Scalanie**: deep merge pól — wartości z `time_window` mają pierwszeństwo nad domyślnymi z presetu; nieokreślone pola pozostają z presetu.
3. **Ekspansja**: z parametrów `step` (dodatni) i `count` wygenerować N okien: dla indeksu `i` odległość wstecz wynosi `i × step` (okno bieżące: `i = 0`).
4. **Wyliczenie granic**: dla każdego okna — kotwica (`anchor`) + opcjonalny `offset` → punkt bazowy; następnie cofnięcie o wyliczoną odległość; następnie zastosowanie `duration` → para `(start, end)`. Agregacja (`aggregation`) jest atrybutem okna przekazywanym do warstwy zapytań.
5. **Pobieranie**: osobne żądania danych statystycznych per okno (dopuszczalna równoległość).
6. **Prezentacja**: serie 0 i 1 — pełna semantyka (styl, prognozy, tooltip); serie ≥ 2 — tylko tło wizualne, wyłączone z tooltipa i z logiki prognoz. Oś X = długość najdłuższego okna; krótsze serie kończą się na swoim ostatnim punkcie. **Prognoza** (`computeForecast`): mianownik ułamka ukończenia okresu = liczba slotów agregacji **okna 0** (`buildChartTimeline` → `forecastPeriodBuckets`), nie długość osi X — FR-900-N w `specs/900-time-model-windows/spec.md`.

### Presety (mapowanie koncepcyjne)

| Preset | Uproszczony model | Uwagi |
|--------|-------------------|--------|
| `year_over_year` | Kotwica: początek roku; `duration`: rok; `step`: rok; typowo `count: 2` | Zachować zgodność wsteczną z obecnym zachowaniem. |
| `month_over_year` | Kotwica: początek miesiąca; `duration`: miesiąc; `step`: rok; typowo `count: 2` | „Ten sam miesiąc rok temu", nie „poprzedni miesiąc". |
| `month_over_month` | Kotwica: początku miesiąca; `duration`: miesiąc; `step`: miesiąc; typowo `count: 2` | Dwa **kolejne** miesiące kalendarzowe: okno 0 = bieżący miesiąc, okno 1 = poprzedni pełny miesiąc; ścieżka generyczna (`resolveGeneric`), bez flag legacy YoY/MoY. |

### Artefakty Speckit

- Specyfikacja: `specs/900-time-model-windows/spec.md`

### Moduły `src/card/time-windows/` (implementacja)

| Plik | Rola |
|------|------|
| `duration-parse.ts` | Tokeny `1y` / `1M` / `1h` → Luxon `Duration` (FR-900-B) |
| `presets.ts` | Preset z YAML (`comparison_preset`; bylo `comparison_mode`) → szablon + flagi legacy |
| `merge-config.ts` | Deep merge preset + `time_window` (FR-900-C); usuwa flagi legacy przy custom `anchor`/`step`/`count`/`offset` |
| `validate.ts` | `validateMergedTimeWindowConfig` — max 24, `step`/`duration` > 0, FR-900-E |
| `resolve-windows.ts` | `resolveTimeWindows` — ścieżka legacy YoY/MoY vs generyczna |
| `index.ts` | Barrel: eksporty publicznego kontraktu |

**Integracja**: `src/card/ha-api.ts` — `buildLtsQueriesForWindows`, `buildChartTimeline` (oś: najdłuższe okno + `forecastPeriodBuckets` dla okna 0), `buildTimelineSlots`, `countBucketsForWindow`, `comparisonPeriodFromResolvedWindows`. **Karta**: `cumulative-comparison-chart.ts` (walidacja → `Promise.all` zapytań LTS). **Wykres**: `echarts-renderer.ts` (serie kontekstowe, tooltip: current + reference + forecast label).

**Zależność NPM**: `luxon` (kalendarz / strefa w silniku).

**Testy**: `npm test` ustawia `TZ=UTC` (m.in. złoty test preset ↔ `buildComparisonPeriod`).
