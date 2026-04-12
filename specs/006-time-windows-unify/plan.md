# Implementation Plan: Unified time windows & chart axis (006-time-windows-unify)

**Branch**: `006-time-windows-unify` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-time-windows-unify/spec.md`

**Note**: Plan wygenerowany przez `/speckit.plan`. Faza zadań (`tasks.md`) — `/speckit.tasks`.

## Summary

Ujednolicić ścieżkę **merge → walidacja → resolve → timeline → mapowanie serii / prognoza / tooltip** tak, aby zachowanie odpowiadało **spec 006** (FR-A–FR-H): jeden przewidywalny model **efektywnego merge** (preset tylko jako domyślne pola; jawne nadpisania wygrywają — FR-F), **oś X** z **jedną** regułą liczby kroków dla **`windows.length >= 2`**: **Longest-window axis span** (FR-C — max nominalnych slotów przy ziarnie `windows[0].aggregation`), **etykiety i wyrównanie ordinalne** według **FR-B** (w tym tail-slot gdy najdłuższe okno ≠ bieżące), **prognoza** z **okna bieżącego** (FR-D; tolerancja `timeline.length > forecastPeriodBuckets`), **strefa czasowa HA** (FR-H), **carry-forward** serii bieżącej do znacznika „teraz” dla dnia/tygodnia/miesiąca (FR-G). Usunąć lub zredukować rozgałęzienie sterowane flagami `currentEndIsNow` / `referenceFullPeriod` + `buildChartTimeline` „legacy” tak, aby **to samo zamierzone zachowanie** wynikało z jednego opisu reguł (testowalnego), a nie z ukrytej ścieżki. Zsynchronizować dokumentację: `specs/001-*` (gdzie dotyczy), `wiki-publish/`, README / advanced README, `changelog.md`.

## Technical Context

**Language/Version**: TypeScript 5.6+, `strict`  
**Primary Dependencies**: Lit 3.1, Apache ECharts 5.6 (modular), Luxon, Vite 6, Vitest 2 (zgodnie z repo)  
**Storage**: N/A — stan w pamięci karty Lovelace  
**Testing**: Vitest (`npm test`), testy jednostkowe `src/card/time-windows/*`, `ha-api.ts`, integracja lekka wokół wykresu  
**Target Platform**: Przeglądarka — karta Lovelace Home Assistant (HACS)  
**Project Type**: Pojedynczy frontend (`src/`)  
**Performance Goals**: Bez dodatkowych przebiegów O(n²) na slotach; liczba slotów ograniczona przez okna + agregację (jak dziś)  
**Constraints**: Konstytucja — walidacja YAML, fail-fast (FR-E), brak cichego powrotu do presetu; timezone z kontekstu HA (`resolveLocale` / `hass`); brak zmian modelu LTS po stronie HA  
**Scale/Scope**: Do 24 okien; faza 1 skupia się na **N=2** + dokumentacja (ta sama reguła **Longest-window axis span** co dla **N>2**); faza 2 na pełnym usunięciu rozgałęzień i kompletnych złotych scenariuszach **N≥3**

## Constitution Check

*GATE: przed fazą 0 — spełnione; po fazie 1 — bez zmian.*

| Zasada | Ocena |
|--------|--------|
| I. HA / HACS / Lovelace | Tak — ta sama karta, te same API; ewentualne doprecyzowanie komunikatów błędów |
| II. Bezpieczeństwo / błędy | Tak — FR-E: czytelny błąd zamiast cichego merge; tooltip nadal przez istniejące escapowanie |
| III. TS strict, testy, modularność | Tak — logika w `time-windows/` + `ha-api.ts`; złote scenariusze w Vitest |
| IV. UX / a11y | Tak — spójne podpisy okresów z osią (spec); neutralizacja mylących etykiet presetu przy override (FR-F) |
| V. Wydajność / prostota | Tak — preferuj jedną funkcję wyboru timeline zamiast rozproszonych heurystyk |

**Wynik**: **PASS** — bez wpisów w Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-time-windows-unify/
├── plan.md              # Ten plik
├── research.md          # Decyzje techniczne (Phase 0)
├── data-model.md        # Encje i reguły wyprowadzania (Phase 1)
├── quickstart.md        # Deweloper: testy, pliki do dotknięcia
├── contracts/           # Kontrakt osi / timeline vs prognoza
├── checklists/          # requirements.md (jakość specu)
└── tasks.md             # /speckit.tasks — poza zakresem tej komendy
```

### Source Code (repository root)

```text
src/card/
├── time-windows/
│   ├── merge-config.ts       # Merge preset + YAML; polityka strip flag (dopasować do FR-F)
│   ├── resolve-windows.ts    # resolveLegacy vs resolveGeneric — konsolidacja pod jeden model
│   ├── validate.ts
│   ├── presets.ts
│   └── …
├── ha-api.ts                 # buildChartTimeline, buildFullTimelineForWindows, countBucketsForWindow, mapowanie LTS → sloty
├── cumulative-comparison-chart.ts  # Orkiestracja, znacznik „teraz”, seria bieżąca
├── labels/                   # Podpisy okresów — zgodność z effective windows
└── echarts-renderer.ts       # Oś, tooltip (indeksy 0+1)

tests/unit/
├── time-windows-*.test.ts
├── ha-api.test.ts
└── …
```

**Structure Decision**: Refaktor w istniejącym układzie modułów; **nie** wprowadamy nowego pakietu NPM. Nowa lub zaktualizowana logika timeline/concentrated w `ha-api.ts` i ewentualnie wydzielonym pliku pomocniczym tylko jeśli redukuje złożoność cyklomatyczną.

## Complexity Tracking

> Nie dotyczy — brak naruszeń konstytucji wymagających uzasadnienia.

## Phase 0: Research

Wyniki w [research.md](./research.md) — brak otwartych NEEDS CLARIFICATION w Technical Context; decyzje m.in. o **nominalnej** długości okna vs wall-clock oraz o konsolidacji gałęzi timeline.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) — encje, przejścia merge → resolved → timeline → series slot.  
- [contracts/unified-time-windows-axis.md](./contracts/unified-time-windows-axis.md) — kontrakt publiczny dla timeline, prognozy i polityki wielookiennej.  
- [quickstart.md](./quickstart.md) — jak uruchomić testy i gdzie dodać złote scenariusze.

## Agent context

Po zapisaniu artefaktów: `.specify/scripts/bash/update-agent-context.sh cursor-agent`.

## Post-Design Constitution Check

Bez zmian względem tabeli powyżej — **PASS**.
