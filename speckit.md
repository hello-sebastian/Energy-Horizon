# Speckit — dokumentacja wewnętrzna Energy-Horizon

Ten plik zbiera skrótową architekturę funkcji i powiązania ze Speckit (`specs/NNN-feature/`).

## Silnik okien czasowych (Time Windows Engine) — `001-time-windows-engine`

**Cel**: Zastąpić sztywne rozgałęzienia `comparison_mode` generycznym silnikiem, który z konfiguracji (preset + nadpisania YAML) buduje listę okien `[0..N−1]`, wylicza `start`/`end` i zasila warstwę pobierania danych oraz wykres.

### Przepływ danych (wysoki poziom)

1. **Wejście**: `comparison_mode` (preset) + opcjonalny blok `time_window` w YAML karty.
2. **Scalanie**: deep merge pól — wartości z `time_window` mają pierwszeństwo nad domyślnymi z presetu; nieokreślone pola pozostają z presetu.
3. **Ekspansja**: z parametrów `step` (dodatni) i `count` wygenerować N okien: dla indeksu `i` odległość wstecz wynosi `i × step` (okno bieżące: `i = 0`).
4. **Wyliczenie granic**: dla każdego okna — kotwica (`anchor`) + opcjonalny `offset` → punkt bazowy; następnie cofnięcie o wyliczoną odległość; następnie zastosowanie `duration` → para `(start, end)`. Agregacja (`aggregation`) jest atrybutem okna przekazywanym do warstwy zapytań.
5. **Pobieranie**: osobne żądania danych statystycznych per okno (dopuszczalna równoległość).
6. **Prezentacja**: serie 0 i 1 — pełna semantyka (styl, prognozy, tooltip); serie ≥ 2 — tylko tło wizualne, wyłączone z tooltipa i z logiki prognoz. Oś X = długość najdłuższego okna; krótsze serie kończą się na swoim ostatnim punkcie.

### Presety (mapowanie koncepcyjne)

| Preset | Uproszczony model | Uwagi |
|--------|-------------------|--------|
| `year_over_year` | Kotwica: początek roku; `duration`: rok; `step`: rok; typowo `count: 2` | Zachować zgodność wsteczną z obecnym zachowaniem. |
| `month_over_year` | Kotwica: początek miesiąca; `duration`: miesiąc; `step`: rok; typowo `count: 2` | „Ten sam miesiąc rok temu”, nie „poprzedni miesiąc”. |

### Artefakty Speckit

- Specyfikacja: `specs/001-time-windows-engine/spec.md`
- Plan: `specs/001-time-windows-engine/plan.md`
- Research: `specs/001-time-windows-engine/research.md`
- Model danych: `specs/001-time-windows-engine/data-model.md`
- Kontrakty: `specs/001-time-windows-engine/contracts/time-windows-engine.md`
- Quickstart: `specs/001-time-windows-engine/quickstart.md`
- Lista zadań: `specs/001-time-windows-engine/tasks.md` — `/speckit.tasks` (m.in. T029: aktualizacja tej sekcji + tabela presetów FR-004)
- Checklist release (SC-005): `specs/001-time-windows-engine/checklists/release-readiness.md`
- Szkic wiki: `specs/001-time-windows-engine/wiki-time-windows.md`

### Moduły `src/card/time-windows/` (plan)

| Plik | Rola |
|------|------|
| `duration-parse.ts` | Tokeny `1y` / `1M` / `1h` → Luxon (FR-010) |
| `presets.ts` | `comparison_mode` → szablon + flagi legacy (`currentEndIsNow`, `referenceFullPeriod`, `period_offset`) |
| `merge-config.ts` | Deep merge preset + `time_window` (FR-005) |
| `validate.ts` | Bezpiecznik 24, `step` > 0, FR-014 / FR-016 |
| `resolve-windows.ts` | Kotwica, offset, duration, `step×index`, strefa czasu |
| `index.ts` | Eksport publiczny (kontrakt w `contracts/time-windows-engine.md`) |

### Pola presetów (FR-004) — skrót dla dokumentacji wewnętrznej

| Preset | Domyślne pola logiczne (po merge z pustym `time_window`) |
|--------|-------------------------------------------------------------|
| `year_over_year` | Kotwica początku roku, `duration` ~ rok, `step` ~ rok, `count` 2, bieżące okno kończy się na **now**, referencja — pełny rok kalendarzowy z `period_offset` |
| `month_over_year` | Kotwica początku miesiąca, `duration` ~ miesiąc, `step` ~ rok, `count` 2, to samo rozróżnienie current vs reference co wyżej |

Szczegóły: `research.md` (R2), `data-model.md` (preset vs `count: 1`).

### Zadania implementacyjne (orientacyjnie — szczegóły w `plan.md` / `tasks.md`)

- Interfejsy konfiguracji: `TimeWindowConfig`, `ComparisonEngineConfig` (lub równoważne nazwy) oraz funkcja scalania preset + YAML.
- Moduł / klasa silnika (np. `DataEngine`): wejście — rozwiązana konfiguracja; wyjście — tablica okien z `id`, indeksem, `start`, `end`, `aggregation`.
- Integracja z renderem wykresu: filtrowanie serii w tooltipie; długość osi X; style dla serii „wyciszonych”.
- Testy: **SC-002** (31 mar → luty); merge tylko `duration`; trzy serie, tooltip; przed release: **checklists/release-readiness.md** (SC-005).
