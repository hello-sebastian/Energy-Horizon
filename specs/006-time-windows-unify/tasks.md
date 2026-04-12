# Tasks: Unified time windows & chart axis (006-time-windows-unify)

**Input**: Design documents from `/Users/admin/Projekty Local/Energy-Horizon/specs/006-time-windows-unify/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/unified-time-windows-axis.md](./contracts/unified-time-windows-axis.md), [quickstart.md](./quickstart.md)

**Tests**: Success criteria SC-1, SC-2, SC-TODAY-* w spec wymagają utrwalenia zachowania w Vitest — poniżej są jawne zadania testowe.

**Organization**: Fazy wg historii użytkownika (US1–US4) + setup, fundamenty, polish.

**Analyze follow-up**: Uzupełnienia po `/speckit.analyze` — **FR-H** (T007), **FR-F** tooltips (T010), kolejność **T003→T004**, konkretny scenariusz **N=2** nierównej długości (T001+T012), **SC-4** (T028), **a11y** (T026).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Można równolegle (inne pliki, brak zależności od niedokończonych zadań w tej samej grupie)
- **[Story]**: [US1] … [US4] dla faz historii

## Path Conventions

- Kod: `src/card/`  
- Testy: `tests/unit/`  
- Speckit: `specs/006-time-windows-unify/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Przygotowanie artefaktów akceptacji i kontekstu przed zmianami w kodzie.

- [ ] T001 Create golden scenario matrix (presets + representative overrides, FR-H) in `specs/006-time-windows-unify/golden-scenarios.md`; **uwzględnij jeden wiersz N=2 z nierówną liczbą slotów dziennych** (np. porównanie dwóch miesięcy kalendarzowych) jako odniesienie dla T012
- [ ] T002 [P] Add pre-flight checklist (FR-B/FR-C/FR-D invariants + file pointers) to `specs/006-time-windows-unify/quickstart.md` linking `specs/006-time-windows-unify/contracts/unified-time-windows-axis.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Jedna semantyka timeline / prognozy — **wszystkie US zależą od tej fazy.**

**⚠️ CRITICAL**: Żadna historia użytkownika nie startuje przed ukończeniem Phase 2.

**Ordering (analyze)**: **T003 przed T004** — oba dotykają `ha-api.ts` / timeline; najpierw `buildFullTimelineForWindows`, potem ujednolicenie `buildChartTimeline`, żeby uniknąć podwójnej refaktoryzacji w konflikcie.

- [ ] T003 Replace longest-window selection in `src/card/ha-api.ts` (`buildFullTimelineForWindows`) with **max nominal slot count** at `windows[0].aggregation` per `specs/006-time-windows-unify/research.md`
- [ ] T004 Unify `buildChartTimeline` in `src/card/ha-api.ts` to **one** code path for **`windows.length >= 2`**: **Longest-window axis span** (**FR-C**) + **FR-B** labeling/alignment per `specs/006-time-windows-unify/contracts/unified-time-windows-axis.md`; keep `forecastPeriodBuckets` from window 0 (**FR-D**); ensure forecast path accepts `timeline.length > forecastPeriodBuckets` (**after T003**)
- [ ] T005 [P] Reduce `resolveLegacy` vs `resolveGeneric` split in `src/card/time-windows/resolve-windows.ts` toward single explainable merge→resolve model (**FR-A**)
- [ ] T006 [P] Audit `stripLegacyWhenGeneric` and deep merge in `src/card/time-windows/merge-config.ts` for **FR-F** (explicit YAML overrides preset; no label-keyed behavior)
- [ ] T007 [P] Add Vitest cases in `tests/unit/ha-api.test.ts` asserting `buildChartTimeline` / slot builders use the passed **IANA `timeZone` string** (mock HA zone), not browser-local drift — **FR-H**

**Checkpoint**: Timeline + `forecastPeriodBuckets` spójne z kontraktem 006 — można wdrażać US1+.

---

## Phase 3: User Story 1 — One story for time, axis, summary, and tooltip (Priority: P1) 🎯 MVP

**Goal**: Podsumowanie, oś X, tooltip i prognoza opisują tę samą narrację czasu dla okien efektywnych — na bazie timeline z Phase 2 (**FR-C** długość osi, **FR-D** `forecastPeriodBuckets`) plus **FR-B** (etykiety / tail), **FR-H** (strefa), **FR-F** (copy/tooltip vs effective windows).

**Independent Test**: Dwa okna porównawcze — teksty okresów, znaczenie ticków osi i tooltip zgodne z oknem bieżącym / **effective windows**; prognoza i liczby w podsumowaniu zgodne z `forecastPeriodBuckets` / timeline z `src/card/ha-api.ts`.

### Implementation for User Story 1

- [ ] T008 [US1] Thread effective `ResolvedWindow[]`, `timeline`, and `alignStartsMs` from `buildChartTimeline` into chart/renderer state in `src/card/cumulative-comparison-chart.ts` (single source for oś + serie)
- [ ] T009 [US1] Ensure `computeForecast`, summary / `TextSummary` (or equivalent text stats), and cumulative LTS→series mapping in `src/card/cumulative-comparison-chart.ts` consume the **same** `forecastPeriodBuckets` and timeline semantics exported from `src/card/ha-api.ts` — brak rozjazdu „oś vs prognoza vs podsumowanie”. **FR-F**: copy w podsumowaniu / statystykach nie może zaprzeczać **effective windows** (preset tylko etykieta marketingowa po merge).
- [ ] T010 [P] [US1] In `src/card/echarts-renderer.ts`: align ECharts axis category/time labels with **FR-B** (current-window grain within its nominal span; **ordinal tail** when axis longer — Session 2026-04-13); **FR-H** dla strefy. **FR-F**: teksty **tooltipów** wykresu (okresy / serie) muszą wynikać z **effective** `ResolvedWindow[]` lub neutralnego copy — bez sugerowania narracji `comparison_preset`, gdy merge się z nią rozjeżdża.
- [ ] T011 [P] [US1] Align compact period captions with effective windows in `src/card/labels/compact-period-caption.ts`
- [ ] T012 [US1] Extend expectations for `buildChartTimeline` in `tests/unit/ha-api.test.ts`: **N=2** — `timeline.length` = **max** nominal slot counts of both windows at `windows[0].aggregation`; shorter window has no values past its end; **`forecastPeriodBuckets` still from window 0** (**FR-D**). **N=2 nierówna długość (wymagane w Phase 1)**: w `golden-scenarios.md` (T001) wpisz wiersz scenariusza np. **dwa miesiące kalendarzowe przy ziarnie `day`** (różna liczba dni, ta sama strefa FR-H) i dodaj test Vitest odpowiadający temu wierszowi — bez formuły „when feasible”.

**Checkpoint**: US1 zamknięty — MVP semantyczny dla N=2.

---

## Phase 4: User Story 2 — Preset users keep trusted behavior (Priority: P1)

**Goal**: Parzystość YoY / MoY / MoM i typowych nadpisań `time_window` (**SC-1**); pokrycie testowe **Longest-window axis span** dla **N≥3** (T016); **N=2** max-slot rule w T012.

**Independent Test**: `npm test` + zgodność z `specs/006-time-windows-unify/golden-scenarios.md`; dla ≥3 okien — długość osi = max liczby slotów nominalnych.

### Tests & documentation for User Story 2

- [ ] T013 [US2] Refresh golden preset assertions in `tests/unit/time-windows-presets-golden.test.ts` after timeline/resolve refactors
- [ ] T014 [P] [US2] Add or extend override scenarios (duration-only, anchor/step) in `tests/unit/time-windows-merge-validate.test.ts` and/or `tests/unit/time-windows-resolve.test.ts`
- [ ] T015 [US2] Sync documented expected boundaries in `specs/006-time-windows-unify/golden-scenarios.md` with passing tests
- [ ] T016 [P] [US2] Add Vitest in `tests/unit/ha-api.test.ts` for **≥3** `ResolvedWindow[]`: `timeline.length` equals **max** per-window nominal slot count at `windows[0].aggregation` (**Longest-window axis span / FR-C**, same rule as **N=2**); assert `forecastPeriodBuckets` still from window 0 (**FR-D**)

**Checkpoint**: US1+US2 — domyślni użytkownicy presetów bez regresji; wielookienność pokryta testem.

---

## Phase 5: User Story 3 — “Now” matches end of current series (Priority: P2)

**Goal**: **FR-G** carry-forward cumulative current series do slotu „now” (day/week/month); spójność z markLine/markPoint.

**Independent Test**: Fixture z otwartym bucketem i brakiem surowego punktu LTS w slocie „now” — linia dociera do pionu „dzisiaj”.

### Implementation for User Story 3

- [ ] T017 [US3] Implement cumulative carry-forward at the timeline slot containing “now” for series index 0 in `src/card/ha-api.ts` (LTS→slot mapping path)
- [ ] T018 [US3] Align vertical “now” marker index with carry-forward slot in `src/card/cumulative-comparison-chart.ts` (and `src/card/echarts-renderer.ts` if markLine data is built there)
- [ ] T019 [P] [US3] Add regression cases (null raw at now; week/month where feasible) in `tests/unit/ha-api.test.ts`

**Checkpoint**: US3 — wizualna spójność „teraz” vs podsumowanie.

---

## Phase 6: User Story 4 — Clear errors for bad configuration (Priority: P2)

**Goal**: **FR-E** fail-fast; brak cichego powrotu do presetu; komunikaty spójne z oknami efektywnymi (**FR-F**).

**Independent Test**: Niepoprawny YAML → `ha-alert` / stan błędu; poprawny merge mimo „dziwnej” nazwy presetu → brak odrzucenia tylko z powodu etykiety.

### Implementation for User Story 4

- [ ] T020 [US4] Verify invalid merged config surfaces only via explicit error path in `src/card/time-windows/validate.ts` and `src/card/cumulative-comparison-chart.ts` (**FR-E**)
- [ ] T021 [P] [US4] Add negative tests for invalid merge (no silent fallback) in `tests/unit/time-windows-merge-validate.test.ts`
- [ ] T022 [P] [US4] Add or adjust user-facing error keys in `src/translations/en.json` and `src/translations/pl.json`

**Checkpoint**: US4 — konfiguracja zaufana i czytelna w błędzie.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: SC-3, SC-4 — jedna prawda w docs; release notes; a11y spot-check (Konstytucja IV).

- [ ] T023 [P] Remove contradictions vs 006 in `specs/001-time-windows-engine/contracts/time-windows-engine.md`, `specs/001-aggregation-axis-labels/spec.md`, and `specs/001-compute-forecast/spec.md` (and linked contracts where needed)
- [ ] T024 [P] Update end-user mental model in `wiki-publish/Mental-Model-Comparisons-and-Timelines.md` (plus related `wiki-publish/*.md` if they duplicate axis/forecast rules)
- [ ] T025 Update `README.md`, `README.advanced.md`, and `changelog.md` for unified axis, **Longest-window axis span**, and forecast denominator (**FR-D**)
- [ ] T026 [P] Spot-check error overlay (`ha-alert`) and chart “now” marker for contrast / screen-reader-friendly labels consistent with existing card patterns (Konstytucja IV) in `src/card/cumulative-comparison-chart.ts` and `src/card/echarts-renderer.ts`
- [ ] T027 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon` and fix any failures
- [ ] T028 [P] **SC-4**: Po T024 (i przed zamknięciem release) — krótka **self-review checklist** w PR lub akapit w `golden-scenarios.md`: czytelnicy wiki mogą z YAML zbudować „this month vs previous”, MoY, YoY **bez** znajomości ścieżek kodu; linki do stron `wiki-publish/` zaktualizowanych w T024

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → start od razu  
- **Phase 2** zależy od Phase 1 (kontekst); **blokuje** Phase 3–6  
- **Phase 3 (US1)** zależy od Phase 2  
- **Phase 4 (US2)** zależy od Phase 2; sensownie po Phase 3 gdy API timeline jest stabilne  
- **Phase 5 (US3)** zależy od Phase 3 (poprawny timeline/slot „now”)  
- **Phase 6 (US4)** może równolegle z US3 po Phase 2, ale integracja w karcie często dotyka tych samych plików — sekwencja US3→US4 zwykle bezpieczniejsza  
- **Phase 7** po ukończeniu planowanych US

### User Story Dependencies

- **US1**: po Foundational  
- **US2**: po Foundational; praktycznie po US1 (łatwiejsza weryfikacja złotych scenariuszy); **T016** wymaga działającego `buildChartTimeline` z Phase 2  
- **US3**: po US1 (slot „now” na właściwym timeline)  
- **US4**: po Foundational; preferuj po US1 aby nie konfliktować przy `setConfig`

### Parallel Opportunities

- T002 równolegle z T001  
- T005, T006, T007 równolegle **po** zakończeniu **T003 i T004** (najpierw sekwencja T003→T004; uwaga: konflikty merge w PR)  
- T010, T011 równolegle po T008–T009  
- T014, T016, T021, T022, T023, T024, T026, T028 równolegle w osobnych plikach (T028 po treści T024)  
- T019 równolegle z T018 jeśli testy nie zależą od niedokończonego markLine

---

## Parallel Example: User Story 1

```bash
# Po T008–T009 — równolegle:
Task T010 → src/card/echarts-renderer.ts
Task T011 → src/card/labels/compact-period-caption.ts
# Potem T012 → tests/unit/ha-api.test.ts
```

---

## Implementation Strategy

### MVP First (US1 + Foundational)

1. Phase 1 → Phase 2 (w tym **T007** FR-H)  
2. Phase 3 (US1) — **T008** + **T009** krytyczne dla spójności prognozy  
3. **STOP**: `npm test` — oś i podsumowanie dla N=2  

### Incremental Delivery

1. Phase 4 (US2) — złote presety + overrides + **T016** (FR-C dla N≥3; spójność z T012 dla N=2)  
2. Phase 5 (US3) — carry-forward  
3. Phase 6 (US4) — walidacja  
4. Phase 7 — docs + changelog + **T026** a11y + **T028** SC-4  

### Parallel Team Strategy

Po Phase 2: jeden deweloper na US1+US2 (oś + złote + FR-C test), drugi na US4 (walidacja), trzeci na US3 po stabilnym timeline z US1.

---

## Notes

- Każde zadanie ma ścieżkę pliku w opisie.  
- Unikaj rozgałęzień „legacy” bez testu w `tests/unit/time-windows-presets-golden.test.ts`.  
- `golden-scenarios.md` jest **źródłem prawdy** dla SC-1 między produktem a testami.  
- **SC-4** — **T028** (checklist / self-review po T024, przed release).
