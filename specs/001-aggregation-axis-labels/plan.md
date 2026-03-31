# Implementation Plan: Intelligent aggregation and X-axis labeling

**Branch**: `001-aggregation-axis-labels` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-aggregation-axis-labels/spec.md`

**Note**: Wygenerowane przez `/speckit.plan`. Faza zadań (`tasks.md`) — `/speckit.tasks`.

## Summary

Dodać **automatyczny dobór agregacji** z długości okna (`duration`) wg tabeli progów (cel ~20–100 slotów), zachowując istniejący łańcuch merge **`aggregation`** (YAML/`time_window` → karta → fallback). Rozszerzyć konfigurację o opcjonalne **`x_axis_format`** (Luxon, udokumentowany podzbiór tokenów) z walidacją przy `setConfig`. Wymusić **limit 5000 punktów na serię** przed pobraniem danych — przy przekroczeniu stan błędu (`ha-alert`) zamiast renderu wykresu. Zastąpić obecne **etykiety osi X oparte na indeksie** (`String(tick)`) formatowaniem czasu: tryb **wymuszony** — `DateTime.fromMillis(ms, zone).toFormat(x_axis_format)`; tryb **adaptacyjny** — `Intl.DateTimeFormat` + logika granic (dzień/rok) bez słowników miesięcy w repozytorium. **Strefa**: `hass.config.time_zone` (spójnie z Luxon w `resolve-windows`). **Język etykiet**: kaskada `language` karty → `hass.locale.language` → `en`. **ECharts**: `axisLabel.rotate: 0`, `hideOverlap: true` (już częściowo), formatter per indeks osi `value` mapujący na `fullTimeline[tick]`. Zaktualizować README, `wiki-publish/`, changelog (FR-010). **Tooltip**: nagłówek z **`src/card/axis/tooltip-format.ts`** (macierz zgodna z agregatem, bez roków w domyślnych porównaniach; opcjonalne **`tooltip_format`** jak **`x_axis_format`**); **`mergedDurationMs`** z merged YAML dla EC2.

## Technical Context

**Language/Version**: TypeScript 5.6+, `strict`  
**Primary Dependencies**: Lit 3.1, Apache ECharts 5.6 (modular), **Luxon** (już w projekcie), Vite 6, Vitest 2  
**Storage**: N/A (stan w pamięci komponentu / karta Lovelace)  
**Testing**: Vitest — moduły czyste (auto-interval, cap, parsowanie formatu, formatter etykiet); testy integracyjne lekkie dla `echarts-renderer` / `ChartRendererConfig`  
**Target Platform**: Przeglądarka — karta Lovelace Home Assistant (HACS)  
**Project Type**: Pojedynczy frontend (`src/card/`)  
**Performance Goals**: Brak renderu przy >5000 punktów/serię; formatowanie etykiet O(n) względem liczby slotów, bez blokowania UI na umiarkowanych n  
**Constraints**: Konstytucja — walidacja YAML, brak XSS w tooltipach (istniejący `escapeHtml`), komunikaty błędów bez danych wrażliwych; zgodność wstecz gdy `x_axis_format` i nowa ścieżka auto-interval pominięte (zachowanie jawnego `aggregation`)  
**Scale/Scope**: Jedna oś X wspólna dla serii; timeline nadal z `buildChartTimeline` / `buildFullTimelineForWindows`; zmiana dotyczy wyboru `aggregation` i treści etykiet

## Constitution Check

*GATE: przed fazą 0 — PASS; po fazie 1 — PASS.*

| Zasada | Ocena |
|--------|--------|
| I. HA / HACS / Lovelace | Tak — konfiguracja rozszerzona opcjonalnie; `hass` tylko przez oficjalne API karty |
| II. Bezpieczeństwo / błędy | Tak — walidacja `x_axis_format` i progów; błędy konfiguracji jak obecnie; etykiety przez formatowanie dat, nie `innerHTML` |
| III. TS strict, testy, modularność | Tak — logika agregacji/etykiet w modułach czystych + Vitest |
| IV. UX / a11y | Tak — poziome etykiety, `hideOverlap`, kontrast z motywem HA; tekst osi czytelny na wąskich viewportach |
| V. Wydajność / prostota | Tak — twardy limit punktów; unikać milionów formatowań poza ścieżką renderu |

**Wynik**: **PASS** — bez wpisów w Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-aggregation-axis-labels/
├── plan.md              # Ten plik
├── research.md          # Faza 0 — decyzje techniczne
├── data-model.md        # Faza 1 — encje i walidacja
├── quickstart.md        # Faza 1 — dev / testy
├── contracts/           # Faza 1 — kontrakt konfiguracji
└── tasks.md             # /speckit.tasks (poza zakresem tej komendy)
```

### Source Code (repository root)

```text
src/card/
├── types.ts                    # CardConfig: x_axis_format?: string; ewent. stałe MAX_POINTS_PER_SERIES
├── ha-api.ts                   # Po wyliczeniu okien: ewent. auto-interval na merged przed resolve; liczenie slotów → cap
├── cumulative-comparison-chart.ts  # setConfig: walidacja formatu; przekazanie locale + xAxisProfile do renderer config
├── echarts-renderer.ts         # formatXAxisLabel: daty z fullTimeline + adaptive vs forced; axisLabel opcje; tooltip header z tooltip-format
├── time-windows/
│   ├── merge-config.ts         # Bez zmian semantyki merge (już zgodne z FR-002 dla pojedynczego pola aggregation)
│   └── resolve-windows.ts      # Opcjonalnie: przyjmować już ustawione effective aggregation (z warstwy wyżej)
└── axis/                       # NOWE (nazwa orientacyjna)
    ├── auto-aggregation.ts     # duration (ms) + tabela progów → WindowAggregation
    ├── point-cap.ts            # assertPointCountWithinCap(timelineLength) → void | throw z kodem błędu
    ├── x-axis-format-validate.ts  # Walidacja podzbioru tokenów Luxon / odrzuć przy setConfig
    ├── axis-label-format.ts    # Adaptive: Intl + granice; forced: Luxon toFormat; locale string z kaskady
    └── tooltip-format.ts       # Nagłówek tooltipa: macierz FR-011 + optional tooltip_format; EC2 (hour + duration > 1d)

tests/unit/
├── auto-aggregation.test.ts
├── point-cap.test.ts
├── x-axis-format-validate.test.ts
├── axis-label-format.test.ts
├── tooltip-format.test.ts
└── echarts-renderer*.test.ts   # Rozszerzenia istniejących lub nowe przypadki etykiet
```

**Structure Decision**: Nowy katalog `src/card/axis/` grupuje logikę niezależną od ECharts (łatwe testy), podczas gdy `echarts-renderer.ts` zawiera tylko podłączenie `formatter` i opcje osi. Alternatywa — `src/card/time-windows/auto-aggregation.ts` — odrzucona na rzecz wyraźnego rozdziału „oś/etykiety” vs „rozwiązywanie okien”.

**Single place for pipeline hooks**: Efektywne **`aggregation`** (auto-interval + merge) i walidacja **`x_axis_format`** / **`tooltip_format`** powinny być zastosowane w **jednej** ścieżce przed `resolveTimeWindows` — praktycznie `cumulative-comparison-chart.ts` (`setConfig` / inicjalizacja fetch). `ha-api.ts` pozostaje przy budowie timeline z już ustawionym `ResolvedWindow[].aggregation`; unikaj duplikacji logiki między plikami (remediacja `/speckit.analyze`).

## Complexity Tracking

> Nie dotyczy — brak naruszeń konstytucji wymagających uzasadnienia.

## Phase 0: Research

Wyniki w [research.md](./research.md).

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) — encje konfiguracji, próg punktów, profil osi.  
- [contracts/card-config-axis.md](./contracts/card-config-axis.md) — kontrakt publiczny YAML dla `x_axis_format` i zachowania auto-interval.  
- [quickstart.md](./quickstart.md) — `npm test`, przykładowe konfiguracje do ręcznego smoke w HA.  
- [research.md](./research.md) — **R-009** (walidacja formatu przy `setConfig`) i **R-008** (jedno pole `aggregation` w v1) — zsynchronizowane ze `spec.md` / `tasks.md`.

## Agent context

Po zapisaniu artefaktów uruchom: `.specify/scripts/bash/update-agent-context.sh cursor-agent`.

## Post-Design Constitution Check

Bez zmian względem tabeli powyżej — **PASS**.
