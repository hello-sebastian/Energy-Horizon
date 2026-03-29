# Tasks: Elastyczny silnik okien czasowych (Time Windows Engine)

**Input**: Design documents from `/specs/001-time-windows-engine/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/time-windows-engine.md](./contracts/time-windows-engine.md), [quickstart.md](./quickstart.md)

**Tests**: Zgodnie z konstytucją projektu — kluczowa logika okien i regresje wykresu mają pokrycie jednostkowe (Vitest).

**Organization**: Fazy według user stories ze specu (P1 → P2 → P3); infrastruktura wspólna w Setup + Foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Można równolegle (inne pliki, brak zależności od niedokończonych zadań w tej samej fazie)
- **[Story]**: Tylko w fazach User Story (US1…US5)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Zależność NPM i szkielet modułu zgodnie z [plan.md](./plan.md).

- [ ] T001 Add `luxon` dependency in `/Users/admin/Projekty Local/Energy-Horizon/package.json` and refresh lockfile via `npm install` from repository root
- [ ] T002 Create public barrel `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/index.ts` exporting APIs described in `/Users/admin/Projekty Local/Energy-Horizon/specs/001-time-windows-engine/contracts/time-windows-engine.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Typy, i18n błędów konfiguracji, czysty silnik merge → validate → resolve oraz integracja z LTS w `ha-api.ts`. **Bez ukończenia tej fazy nie wolno zamykać US1.**

**Checkpoint**: `resolveTimeWindows` + `validate` działają na mocku czasu/strefy; `ha-api.ts` potrafi zbudować zapytanie LTS dla pojedynczego `ResolvedWindow`.

- [ ] T003 Extend `/Users/admin/Projekty Local/Energy-Horizon/src/card/types.ts` with `time_window` on `CardConfig`, `context` (or equivalent) on `ComparisonSeries`, `ResolvedWindow` / role types, and `aggregation` union including `hour` where needed per `/Users/admin/Projekty Local/Energy-Horizon/specs/001-time-windows-engine/data-model.md`
- [ ] T004 [P] Add localized keys for invalid `time_window` and too many windows (FR-014 / FR-016) in `/Users/admin/Projekty Local/Energy-Horizon/src/translations/en.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/pl.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/de.json`
- [ ] T005 [P] Implement duration token parsing (Grafana-style, e.g. `1y`, `1M`, `1h`) using Luxon in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/duration-parse.ts`
- [ ] T006 Implement preset templates with legacy semantics (`currentEndIsNow`, full reference period, `period_offset`) in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/presets.ts` per `/Users/admin/Projekty Local/Energy-Horizon/specs/001-time-windows-engine/research.md`
- [ ] T007 Implement deep merge preset + YAML in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/merge-config.ts`
- [ ] T008 Implement validation (step > 0, required fields, count ≤ `maxWindows` default 24) returning i18n keys in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/validate.ts`
- [ ] T009 Implement window resolution (anchor, offset, duration, `step * index`, timezone) in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/resolve-windows.ts` with `maxWindows` parameter (FR-016)
- [ ] T010 Refactor `/Users/admin/Projekty Local/Energy-Horizon/src/card/ha-api.ts` to build `recorder/statistics_during_period` queries from `ResolvedWindow[]` (including `hour` period mapping) and keep `mapLtsResponseToCumulativeSeries` / cumulative helpers usable per window
- [ ] T011 [P] Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-merge-validate.test.ts` covering merge, invalid step, count 25, empty required fields
- [ ] T012 [P] Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts` covering leap-year month math, frozen `now`, and `maxWindows` override for internal tests — **obowiązkowo** osobny przypadek **SC-002**: cofnięcie o jeden miesiąc od **31 marca** musi dawać ostatni dzień **lutego** (rok przestępny i zwykły)

---

## Phase 3: User Story 1 — Presety i merge YAML (Priority: P1) — MVP

**Goal**: `comparison_mode` bez `time_window` zachowuje obecną semantykę; `time_window` z samym `duration` nadpisuje tylko szerokość (SC-004); błędna konfiguracja → `ha-alert`, brak wykresu (FR-014).

**Independent Test**: Te same encje i YAML co przed refaktorem → identyczne zakresy dat (YoY / MoY) oraz merge tylko `duration`.

- [ ] T013 [US1] Wire config validation in `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts` before fetch: on validation failure set `CardState` error with new i18n keys (no chart series)
- [ ] T014 [US1] Replace hard-coded `buildComparisonPeriod` usage in `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts` with `merge` → `validate` → `resolve` → two LTS calls via `Promise.all` preserving legacy preset behavior
- [ ] T015 [P] [US1] Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-presets-golden.test.ts` comparing resolved window boundaries to legacy `buildComparisonPeriod` output for `year_over_year` and `month_over_year` with fixed `Date` and `period_offset`

**Checkpoint**: MVP — karta działa jak dotąd dla istniejących użytkowników + błędy konfiguracji zgodnie z clarify.

---

## Phase 4: User Story 2 — Wiele okien, oś X, tooltip (Priority: P1)

**Goal**: ≥3 serie na wykresie; oś X = najdłuższe okno; tooltip tylko okna 0 i 1 (SC-001); serie ≥2 bez wpływu na prognozy (FR-008).

**Independent Test**: YAML z `count: 3` + mock HA → trzy serie; tooltip zawiera co najwyżej dwie wartości liczbowe.

- [ ] T016 [US2] Extend `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts` to issue `Promise.all` over N LTS queries and assemble `ComparisonSeries` with `current`, `reference`, and `context` series from responses
- [ ] T017 [US2] Update `/Users/admin/Projekty Local/Energy-Horizon/src/card/ha-api.ts` `computeSummary`, `computeForecast`, and `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts` rendering so context windows never affect forecast/summary (FR-008) and FR-015 hides reference-only UI when a single window
- [ ] T018 [US2] Update `/Users/admin/Projekty Local/Energy-Horizon/src/card/ha-api.ts` `buildFullTimeline` (or successor) so X-axis span follows the longest resolved window and shorter series end without padding (FR-009)
- [ ] T019 [US2] Update `/Users/admin/Projekty Local/Energy-Horizon/src/card/echarts-renderer.ts` and `/Users/admin/Projekty Local/Energy-Horizon/src/card/types.ts` `ChartRendererConfig` to render N line series with context styling and tooltip formatter that lists only current + reference values
- [ ] T020 [P] [US2] Extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/echarts-renderer.test.ts` for three-series chart: tooltip outputs at most two numeric value rows
- [ ] T021 [P] [US2] Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/cumulative-comparison-chart-multi-window.test.ts` (or extend existing) mocking `hass.connection.sendMessagePromise` to assert N parallel calls and assembled series count

---

## Phase 5: User Story 3 — Niestandardowe cykle rozliczeniowe (Priority: P2)

**Goal**: Kotwica + offset (np. start roku rozliczeniowego w październiku) daje poprawne `start`/`end` dla dwóch sąsiednich cykli.

**Independent Test**: Unit test z `anchor` + `offset` + `duration` + `step` + `count: 2` — daty zgodne z przykładem ze specu.

- [ ] T022 [US3] Add billing-cycle scenarios (fiscal year from October) to `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts` and adjust `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/resolve-windows.ts` if any edge case fails

---

## Phase 6: User Story 4 — Porównanie godzinowe (Priority: P3)

**Goal**: `start_of_hour`, `duration`/`step` godzinowe, `count` > 1 — każde okno to jedna pełna godzina lokalna.

**Independent Test**: Unit test: sześć okien 1h wstecz od zamrożonego `now`.

- [ ] T023 [US4] Verify `hour` aggregation end-to-end in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/resolve-windows.ts` and `/Users/admin/Projekty Local/Energy-Horizon/src/card/ha-api.ts` LTS `period` mapping; fix gaps if HA rejects unsupported combinations
- [ ] T024 [P] [US4] Add six-hour window resolution test to `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts`

---

## Phase 7: User Story 5 — Dokumentacja (Priority: P2)

**Goal**: Wiki / README wyjaśniają parametry, merge z presetem i diagram (FR-012 / FR-013).

**Independent Test**: Czytelnik odtwarza dwa przykłady YAML ze specu bez kodu.

- [ ] T025 [P] [US5] Finalize user-facing parameter descriptions and Mermaid diagrams in `/Users/admin/Projekty Local/Energy-Horizon/specs/001-time-windows-engine/wiki-time-windows.md`
- [ ] T026 [US5] Add a concise Time Windows subsection with link to wiki draft in `/Users/admin/Projekty Local/Energy-Horizon/README.md`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Jakość, regresje, spójność z GUI edytora (bez nowych pól — FR-011).

- [ ] T027 [P] Ensure `/Users/admin/Projekty Local/Energy-Horizon/src/card/energy-horizon-card-editor.ts` still serializes unknown YAML keys if needed so `time_window` survives round-trip where Storage UI allows raw YAML
- [ ] T028 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon` and fix all failures introduced by the feature
- [ ] T029 Align `/Users/admin/Projekty Local/Energy-Horizon/speckit.md` time-windows section with final module paths, **tabelą pól presetów** (FR-004) oraz zachowaniem silnika po implementacji
- [ ] T030 Przed zamknięciem release funkcji: uzupełnij `/Users/admin/Projekty Local/Energy-Horizon/specs/001-time-windows-engine/checklists/release-readiness.md` (SC-005 + opcjonalny smoke a11y) oraz zamieść dowód w PR — recenzent spoza autora głównej implementacji potwierdza na podstawie wiki/README odtworzenie **dwóch** przykładów YAML ze specu

---

## Ustalenia po `/speckit.analyze` (2026-03-29)

- **I1:** `duration-parse.ts` jest częścią drzewa modułów (zsynchronizowano z `plan.md`).
- **C2:** Jawny test SC-002 w T012 (marzec → luty).
- **C1 / SC-005:** Zadanie T030 + checklist release.
- **U1:** Zdanie o `count: 1` vs preset w `data-model.md`.
- **N1 (a11y):** Przy PR warto krótko zweryfikować `ha-alert` / kontrast w motywach HA (bez osobnego T — konstytucja IV).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phases 3–7** (US1 najpierw dla MVP) → **Phase 8**
- **US2** zależy od **US1** (wspólna ścieżka ładowania i typy serii)
- **US3**, **US4** zależą głównie od Phase 2 (logika w `resolve-windows.ts`); można równolegle po **US1**, jeśli API jest stabilne
- **US5** może równolegle z końcówką implementacji

### User Story Dependencies

| Story | Zależy od | Niezależny test |
|-------|-----------|-----------------|
| US1 | Phase 2 | Golden preset + błąd YAML |
| US2 | US1 | N zapytań + tooltip 2 wartości |
| US3 | Phase 2 (+ preferowany smoke po US1) | Test offset cyklu |
| US4 | Phase 2 | Test 6× 1h |
| US5 | — | Treść wiki + README |

### Parallel Opportunities

- **Phase 1**: T001 sequential with T002 (T002 after luxon installed if imports needed — otherwise T002 can stub imports until T001 done). *Practical:* run T001 then T002.
- **Phase 2**: T004, T005, T011, T012 [P] after T003–T009 core exists; T011/T012 parallel after T008–T009.
- **Phase 3**: T015 [P] alongside T013–T014 once T009–T010 ready.
- **Phase 4**: T020, T021 [P] after T019.
- **Phase 7**: T025 [P] early; T026 after terminology stable.

---

## Parallel Example: User Story 2

```text
# After T019 completes:
T020 — extend tests/unit/echarts-renderer.test.ts
T021 — add tests/unit/cumulative-comparison-chart-multi-window.test.ts
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Phase 1 + Phase 2  
2. Phase 3 (US1)  
3. `npm test && npm run lint`  
4. Ręczna weryfikacja na dashboardzie HA (preset bez `time_window`)

### Incremental Delivery

1. MVP (US1)  
2. US2 — pełna wartość wielookienna + wykres  
3. US3 / US4 — rozszerzenia kalendarza i godzin  
4. US5 + Phase 8 — dokumentacja i szlify

### Suggested Next Command

`/speckit.implement` — po ewentualnej ponownej analizie: `/speckit.analyze`.

---

## Task Summary

| Metric | Value |
|--------|--------|
| **Total tasks** | 30 |
| **Phase 1** | 2 |
| **Phase 2** | 10 |
| **US1** | 3 |
| **US2** | 6 |
| **US3** | 1 |
| **US4** | 2 |
| **US5** | 2 |
| **Polish** | 4 |
| **Parallel-marked [P]** | 12 |

**Format validation**: Wszystkie wiersze zadań używają `- [ ] Tnnn` oraz ścieżek bezwzględnych lub root-relative zgodnych z repo; etykiety `[US#]` tylko w fazach User Story.
