# Research: GitHub Wiki (Diátaxis) dla Energy Horizon

**Feature**: `001-github-wiki` | **Date**: 2026-03-31

## 1. Diátaxis w kontekście tej karty

**Decision**: Przyjąć cztery intencje (Tutorial, How-to, Reference, Explanation) jako **osi nawigacji i nagłówków**, nie jako sztywny podział plików 1:1. Strona główna (`Home.md`) musi wyraźnie wskazać „co czytać w jakim celu” (FR-002).

**Rationale**: Diátaxis minimalizuje mieszanie celów czytelnika (nauka vs fakty); istniejące długie przewodniki w `wiki-publish/` można stopniowo przekształcić przez sekcje z etykietami intencji i krzyżowe linki, bez jednorazowego rozbijania wszystkiego na wiele małych plików (ryzyko nadmiernej fragmentacji).

**Alternatives considered**:

- **Ścisły podział fizyczny** (osobny plik na każdą ćwiartkę): odrzucone na start — wysoki koszt nawigacji i linków przy już istniejących długich stronach.
- **Tylko jeden długi dokument**: odrzucone — narusza SC-002 i czytelność referencji.

## 2. Mapowanie istniejących stron (orientacyjne)

| Plik | Dominująca intencja Diátaxis | Uwagi |
|------|------------------------------|--------|
| `Getting-Started.md` | Tutorial | FR-006; instalacja zasobu → pierwsza konfiguracja |
| `Configuration-and-Customization.md` | Reference (+ fragmenty How-to) | Centralna referencja opcji (FR-005); unikać powielania — linki do Explanation |
| `Forecast-and-Data-Internals.md` | Explanation | Model danych, prognoza (FR-003) |
| `Aggregation-and-Axis-Labels.md` | Explanation / Reference | Agregacja, etykiety osi |
| `Troubleshooting-and-FAQ.md` | How-to | Diagnostyka, typowe błędy (FR-004) |
| `Releases-and-Migration.md` | How-to / Explanation | Wersje, migracje YAML |
| `Home.md` | Meta + nawigacja | Diátaxis map, **wersja dokumentacji / karty** (FR-014, SC-006) |

**Decision**: Uzupełnić `Home.md` o sekcję **Documentation by intent** (Tutorial / How-to / Reference / Explanation) z linkami powyżej; usunąć lub zaktualizować etykiety „draft” tam, gdzie treść jest stabilna.

## 3. Źródło vs GitHub Wiki

**Decision**: **`wiki-publish/`** w repozytorium = kanon edycji i diffów; **GitHub Wiki** = publikacja po **release** karty, treść zsynchronizowana z numerem wersji (zgodnie ze spec: FR-013, FR-014).

**Rationale**: Praca równoległa nad treścią, review przez PR, powiązanie commitów z wersją; użytkownicy bez dostępu do GitHub mogą czytać wiki online.

**Alternatives considered**:

- **Edycja tylko w GitHub Wiki UI**: odrzucone przez maintainera — brak review w PR i gorsze śledzenie wersji obok kodu.
- **Automatyczny sync CI → wiki**: opcjonalnie w przyszłości; poza minimalnym zakresem — ręczny upload jest akceptowalny przy jasnym checklistcie release.

## 4. Wersjonowanie treści

**Decision**: Na `Home.md` (i ekwiwalent w `wiki-publish/`) widoczny wiersz typu **“Documentation for Energy Horizon Card vX.Y.Z”** (lub uzgodniony zakres); ta sama informacja po uploadzie na GitHub Wiki.

**Rationale**: SC-006 — identyfikacja wersji bez klonowania repozytorium (dla czytelnika wiki); spójność z tagiem release i `changelog.md`.

## 5. Nomenklatura README ↔ wiki

**Decision**: Jedna terminologia; rozbieżności rozstrzygać według **FR-007**: najpierw **kod karty** (`src/`, typy konfiguracji), potem **decyzja maintainera**; aktualizacja README i `wiki-publish/` razem.

**Rationale**: Konstytucja traktuje konfigurację jak kontrakt publiczny — dokumentacja musi używać tych samych nazw co kod i README.

## 6. Plan utrzymania (szkielet)

**Decision**: Udokumentować w jednym miejscu (preferowanie: strona lub sekcja w `wiki-publish/` linkowana z `Home.md`, ewentualnie fragment `README`):

- **Wyzwalacz zdarzeniowy**: merge release + tag semver → aktualizacja treści w `wiki-publish/` → upload na wiki → wpis w changelog / notatka w release.
- **Okresowość**: np. kwartalny przegląd priorytetów (SC-003) z krótkim śladem (issue lub wpis w changelog).
- **Spójność z kodem**: checklista przy release (porównanie z breaking changes w changelogiem; FR-009).

**Alternatives considered**: Tylko „ad hoc” bez zapisu — odrzucone — nie spełnia FR-008 ani SC-003.
