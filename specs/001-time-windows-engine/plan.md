# Implementation Plan: Elastyczny silnik okien czasowych (Time Windows)

**Branch**: `001-time-windows-engine` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-time-windows-engine/spec.md`

**Note**: Plan wygenerowany przez `/speckit.plan`. Faza 2 (`tasks.md`) — `/speckit.tasks`.

## Summary

Zastąpić sztywną logikę `buildComparisonPeriod` + dwóch zapytań LTS generycznym **silnikiem okien czasowych**: preset z `comparison_mode` + opcjonalny deep merge z `time_window` (YAML) → walidacja (bezpiecznik 24, błędy jak FR-014) → lista okien z `start`/`end` + `aggregation` → równoległe zapytania `recorder/statistics_during_period` per okno → wyrównanie na oś X (długość najdłuższego okna) → ECharts: serie kontekstowe (indeks ≥ 2) bez tooltipa i bez wpływu na prognozy; pojedyncze okno (FR-015) bez referencji w UI; błąd walidacji — `ha-alert`, brak wykresu.

## Technical Context

**Language/Version**: TypeScript 5.6+, `strict`  
**Primary Dependencies**: Lit 3.1, Apache ECharts 5.6 (modular), **Luxon** (nowa — patrz [research.md](./research.md)), Vite 6, Vitest 2  
**Storage**: N/A (stan w pamięci komponentu)  
**Testing**: Vitest (`npm test`), testy jednostkowe silnika dat/czystych funkcji  
**Target Platform**: Przeglądarka — karta Lovelace Home Assistant (HACS)  
**Project Type**: Pojedynczy frontend (`src/`)  
**Performance Goals**: Do ~24 równoległych zapytań LTS — `Promise.all`; unikać blokowania głównego wątku (parsowanie YAML już na `setConfig` / przed fetch)  
**Constraints**: Konstytucja — walidacja wejścia, brak XSS w tooltipie (istniejący `escapeHtml`), komunikaty bez danych wrażliwych; zgodność wstecz z YAML bez `time_window`  
**Scale/Scope**: 1 karta, do 24 okien z konfiguracji; rdzeń wyliczeń bez stałego 24 w algorytmie (FR-016)

## Constitution Check

*GATE: przed fazą 0 — spełnione; po fazie 1 — bez zmian.*

| Zasada | Ocena |
|--------|--------|
| I. HA / HACS / Lovelace | Tak — nadal WebSocket `sendMessagePromise`, ta sama karta, YAML rozszerzone opcjonalnie |
| II. Bezpieczeństwo / błędy | Tak — walidacja `time_window`, FR-014/FR-016 → `CardState` error + `ha-alert`; tooltip nadal escapuje HTML |
| III. TS strict, testy, modularność | Tak — logika okien w modułach czystych + Vitest; krytyczne ścieżki kalendarza testowane (luty, przestępny) |
| IV. UX / a11y | Tak — komunikaty lokalizowalne (nowe klucze i18n); tryb jednookienny ukrywa porównania bez „fałszywej” referencji |
| V. Wydajność / prostota | Tak — limit 24 na wejściu; równoległe fetch z umiarem; Luxon uzasadniony w research |

**Wynik**: **PASS** — bez wpisów w Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-time-windows-engine/
├── plan.md              # Ten plik
├── research.md          # Decyzje (Luxon, preset vs legacy)
├── data-model.md        # Encje i walidacja
├── quickstart.md        # Jak uruchomić testy / manual smoke
├── contracts/           # Kontrakty modułów
└── tasks.md             # /speckit.tasks (poza zakresem tej komendy)
```

### Source Code (repository root)

```text
src/card/
├── types.ts                    # Rozszerzenie CardConfig, ComparisonSeries, ChartRendererConfig, nowe typy okien
├── ha-api.ts                   # Refactor: okresy + zapytania delegowane do silnika; computeSummary/Forecast/TextSummary dostosowane
├── cumulative-comparison-chart.ts  # Orchestracja: walidacja → okna → fetch N → stan → renderer
├── echarts-renderer.ts         # Wiele serii, tooltip tylko 0+1, oś X = max długość
├── energy-horizon-card-editor.ts   # Bez nowych pól GUI (FR-011)
├── localize.ts / i18n          # Nowe stringi błędów konfiguracji
└── time-windows/               # NOWE (nazwa orientacyjna)
    ├── duration-parse.ts       # Tokeny czasu w stylu Grafany (`1y`, `1M`, `1h`) → Luxon
    ├── presets.ts              # Mapowanie comparison_mode → TimeWindowTemplate
    ├── merge-config.ts         # Deep merge preset + raw time_window
    ├── validate.ts             # FR-014, FR-016, step > 0, wymagane pola
    ├── resolve-windows.ts      # Luxon: anchor, offset, duration, step×index → [{start,end,aggregation,index,id}]
    └── index.ts                # Eksport publiczny dla karty i testów

tests/unit/
├── time-windows-*.test.ts      # Nowe: merge, resolve, leap year, max 24
├── ha-api.test.ts              # Jeśli istnieje / rozszerzenia
├── echarts-renderer.test.ts    # Tooltip ≤2 wartości przy 3+ seriach
└── cumulative-comparison-chart*.test.ts  # Integracja lekka / stany błędów
```

**Structure Decision**: Nowy katalog `src/card/time-windows/` izoluje czystą logikę od Lit/ECharts; `duration-parse.ts` jest wyodrębniony od `resolve-windows.ts` dla czytelności testów (FR-010). `ha-api.ts` zostaje punktem zbornym dla mapowań LTS i kumulacji, ale **nie** trzyma już wyłącznej logiki kalendarza YoY/MoY w jednej funkcji.

## Complexity Tracking

> Nie dotyczy — brak naruszeń konstytucji wymagających uzasadnienia.

## Phase 0: Research

Wyniki scalone w [research.md](./research.md) — wszystkie punkty NEEDS CLARIFICATION rozstrzygnięte.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) — encje, preset templates, reguły walidacji, zachowanie legacy YoY (asymetria current_end = now vs pełny rok referencji).  
- [contracts/time-windows-engine.md](./contracts/time-windows-engine.md) — wejście/wyjście modułu wyliczania i walidacji.  
- [quickstart.md](./quickstart.md) — developerci: `npm test`, przykładowe YAML do ręcznego smoke w HA.

## Agent context

Po zapisaniu artefaktów uruchomiono `.specify/scripts/bash/update-agent-context.sh cursor-agent` (patrz log w terminalu).

## Post-Design Constitution Check

Bez zmian względem tabeli powyżej — **PASS**.
