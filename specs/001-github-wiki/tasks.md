# Tasks: Kompletna dokumentacja GitHub Wiki (Diátaxis)

**Input**: Design documents from `/Users/admin/Projekty Local/Energy-Horizon/specs/001-github-wiki/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/wiki-documentation.md](./contracts/wiki-documentation.md), [quickstart.md](./quickstart.md)

**Tests**: Brak zadań testowych automatycznych — weryfikacja manualna / checklisty zgodności z kontraktem C-* i SC-*.

**Organization**: Zadania pogrupowane wg historii użytkownika (US1–US5), z fazą setup i fundamentów przed treścią.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Można równolegle (inne pliki, brak zależności od niedokończonych zadań)
- **[USn]**: Powiązanie z historią ze [spec.md](./spec.md)

## Path Conventions

- Kanoniczna treść wiki: `wiki-publish/` w katalogu głównym repozytorium  
- Spec i kontrakty: `specs/001-github-wiki/`  
- Konfiguracja karty (referencja nazw opcji): `src/card/types.ts` (i powiązane pliki edytora, jeśli potrzeba)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Przygotowanie kontekstu przed edycją treści.

- [x] T001 Read `/Users/admin/Projekty Local/Energy-Horizon/specs/001-github-wiki/research.md` (Diátaxis mapping) and `/Users/admin/Projekty Local/Energy-Horizon/specs/001-github-wiki/contracts/wiki-documentation.md` (C-001–C-050) before editing `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Strona wejścia i nawigacja zgodne z FR-002, FR-014, SC-006 — **blokują** spójne domykanie pozostałych historii.

**⚠️ CRITICAL**: Bez ukończenia tej fazy pozostałe sekcje nie mają wspólnego „szkieletu” Diátaxis i wersji.

- [x] T002 Update `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Home.md` with Diátaxis “documentation by intent” map, links to Tutorial/How-to/Reference/Explanation pages, and explicit **documentation version for card `X.Y.Z`** line per FR-002, FR-014, SC-006 and contract C-001–C-003
- [x] T003 [P] Update `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/_Sidebar.md` to align navigation and English labels with `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Home.md` per FR-002

**Checkpoint**: Home + sidebar gotowe — można wypełniać treść ćwiartek.

---

## Phase 3: User Story 1 — Zrozumieć kartę i pojęcia (Priority: P1) 🎯 MVP

**Goal**: Warstwa Explanation: statystyki, encje, porównania, prognoza, ograniczenia danych — językiem użytkownika (FR-003).

**Independent Test**: Niezależny recenzent po lekturze Explanation rozumie model bez czytania kodu; terminy zgodne z README po późniejszej harmonizacji (User Story 1 + Polish).

### Implementation

- [x] T004 [US1] Expand `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Forecast-and-Data-Internals.md` as primary **Explanation** for statistics, entity requirements, comparison semantics, forecast assumptions per FR-003
- [x] T005 [P] [US1] Update `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Aggregation-and-Axis-Labels.md` for **Explanation** / Reference mix (aggregation, axis labels); remove or justify “(draft)” in title/body per FR-001

**Checkpoint**: Explanation layer czytelna i linkowalna ze strony głównej.

---

## Phase 4: User Story 2 — Wykonać konkretne zadanie (Priority: P1)

**Goal**: How-to: YAML, diagnostyka, edytor vs YAML, typowe problemy z jasnymi warunkami końcowymi (FR-004).

**Independent Test**: Każdy opisany przepływ ma efekt w UI HA lub sekcję „gdy nie działa” w tej samej ścieżce dokumentu.

### Implementation

- [x] T006 [US2] Expand `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Troubleshooting-and-FAQ.md` with step-by-step **How-to** diagnostics, prerequisites, expected outcomes, and failure branches per FR-004
- [x] T007 [P] [US2] Update `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Releases-and-Migration.md` with migration/how-to paths linking to `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Configuration-and-Customization.md` for option names per FR-004
- [x] T008 [US2] Ensure **at least three** distinct **How-to** flows (e.g. YAML-only configuration, entity/statistics troubleshooting, advanced time windows or aggregation) each with verifiable end state in HA and a “when something goes wrong” section per SC-005 across `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Troubleshooting-and-FAQ.md` and `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Configuration-and-Customization.md`

**Checkpoint**: SC-005 satisfied for how-to depth.

---

## Phase 5: User Story 5 — Utrzymanie dokumentacji w czasie (Priority: P1)

**Goal**: Udokumentowany proces: wyzwalacze, przegląd okresowy, wykrywanie rozjazdów z kodem, nomenklatura (FR-008, FR-009, SC-003).

**Independent Test**: Nowy maintainer czyta jeden dokument i wie, co zrobić przy release i przy rozbieżności treści względem karty.

### Implementation

- [x] T009 [US5] Add `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Documentation-Maintenance.md` with release-triggered upload from `wiki-publish/` to GitHub Wiki, periodic review cadence, drift checklist vs changelog and user-visible behavior, and nomenclature resolution (code → maintainer) per FR-008, FR-009, SC-003 and contract C-040–C-042
- [x] T010 [US5] Link `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Documentation-Maintenance.md` from `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Home.md` per SC-003

**Checkpoint**: Plan utrzymania publicznie osiągalny i spójny z quickstart.

---

## Phase 6: User Story 3 — Szybko sprawdzić prawdę o konfiguracji (Priority: P2)

**Goal**: Reference: pełny opis opcji, domyślnych wartości, relacji (FR-005).

**Independent Test**: Dla opcji z referencji da się podać scenariusz „ustaw X → oczekuj Y”; pokrycie ≥90% opcji użytkownika (SC-001).

### Implementation

- [x] T011 [US3] Cross-check `/Users/admin/Projekty Local/Energy-Horizon/src/card/types.ts` (and Lovelace editor schema if present under `/Users/admin/Projekty Local/Energy-Horizon/src/card/`) and expand `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Configuration-and-Customization.md` so **Reference** covers ≥90% of user-facing configuration keys with meaning, defaults, and requires/suggests/excludes where relevant per FR-005, SC-001, contract C-004

**Checkpoint**: SC-001 checklist możliwa przy przeglądzie release.

---

## Phase 7: User Story 4 — Nauczyć się ścieżką prowadzoną (Priority: P2)

**Goal**: Tutorial: od zasobu Lovelace do pierwszej działającej konfiguracji z checkpointami (FR-006).

**Independent Test**: Nowy użytkownik karty przechodzi Getting Started i kończy z działającą kartą lub jasnym punktem stop.

### Implementation

- [x] T012 [US4] Refine `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Getting-Started.md` as **Tutorial**: prerequisites, resource install, first card YAML, comparison preset explanation, checkpoints per FR-006

**Checkpoint**: Tutorial spójny z Home mapą Diátaxis.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: README, nomenklatura, odbiór SC-004/SC-006, publikacja wiki.

- [x] T013 [P] Harmonize terminology between `/Users/admin/Projekty Local/Energy-Horizon/README.md` and `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/` using `/Users/admin/Projekty Local/Energy-Horizon/src/card/types.ts` as naming authority per FR-007
- [x] T014 [P] Update `/Users/admin/Projekty Local/Energy-Horizon/README.md` “Advanced documentation (Wiki)” section with GitHub Wiki link and note that canonical Markdown lives under `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/` per plan.md and FR-013
- [x] T015 Prepare SC-004 evidence: pick five key terms from a shared checklist and confirm README vs wiki definitions match; record outcome in PR description or issue per SC-004 — **recorded** in `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/Documentation-Maintenance.md` (“Terminology alignment record (SC-004)”); reviewer completes checkboxes at publish time
- [ ] T016 **(manual, maintainer)** Upload `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/` to GitHub Wiki following `/Users/admin/Projekty Local/Energy-Horizon/specs/001-github-wiki/quickstart.md` after the card release that matches the documented `X.Y.Z` per FR-013, FR-014 — *cannot be automated in this workspace*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately.
- **Phase 2 (Foundational)**: Depends on T001 — **blocks** Phases 3–8 content coherence.
- **Phases 3–7 (User Stories)**: All depend on Phase 2 completion. Suggested order: US1 → US2 → US5 → US3 → US4 (P1 stories US1, US2, US5 before P2 US3, US4). US3 (Reference) may benefit from US1 terminology but can proceed after Phase 2 if needed.
- **Phase 8 (Polish)**: Depends on Phases 3–7 content being draft-complete.

### User Story Dependencies

- **US1**: After Foundational; no dependency on other stories.
- **US2**: After Foundational; soft link to Reference (US3) — keep deep option lists in Configuration page.
- **US5**: After Foundational; best after US2 so troubleshooting/how-to exists before locking maintenance text.
- **US3**: After Foundational; uses `src/card/types.ts` as source of truth.
- **US4**: After Foundational; should align with US3 option names when Tutorial cites YAML keys.

### Parallel Opportunities

- T003 can run parallel to finishing T002 if Home structure is agreed (same session).
- T005 parallel to T004 (different files).
- T007 parallel to T006 (different files).
- T013 parallel to T014 (README sections/files).

### Parallel Example: User Story 1

```text
# After T004 starts, run in parallel:
Task T005: wiki-publish/Aggregation-and-Axis-Labels.md
Task T004: wiki-publish/Forecast-and-Data-Internals.md
```

---

## Implementation Strategy

### MVP First (US1 + Foundational)

1. Complete Phase 1–2 (T001–T003).
2. Complete Phase 3 US1 (T004–T005).
3. **STOP**: Review Explanation pages with independent reader if possible.

### Incremental Delivery

1. Foundational + US1 → core “why” documented.
2. Add US2 (T006–T008) → operational “how.”
3. Add US5 (T009–T010) → maintainability.
4. Add US3 (T011) → reference completeness (SC-001).
5. Add US4 (T012) → onboarding Tutorial.
6. Polish (T013–T016) → README, evidence, wiki upload at release.

### Parallel Team Strategy

- Author A: US1 files (`Forecast-and-Data-Internals.md`, `Aggregation-and-Axis-Labels.md`).
- Author B: US2 (`Troubleshooting-and-FAQ.md`, `Releases-and-Migration.md`) after Home is stable.

---

## Notes

- Nie commitować treści „draft” bez jawnej etykiety jeśli funkcja jest stabilna (edge case ze spec).
- T016 jest krokiem **manualnym** przy release; wykonuje maintainer z uprawnieniami do GitHub Wiki.
- Jeśli `Documentation-Maintenance.md` jest zbyt duże na jedną stronę wiki, można podzielić z linkami — bez zmiany wymagań FR-008.
