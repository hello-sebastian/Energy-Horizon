# Implementation Plan: Kompletna dokumentacja GitHub Wiki (Diátaxis)

**Branch**: `001-github-wiki` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-github-wiki/spec.md`

**Note**: Plan wygenerowany przez `/speckit.plan`. Faza zadań (`tasks.md`) — `/speckit.tasks`.

## Summary

Dostarczyć **spójną, kompletną dokumentację** karty Energy Horizon dla zaawansowanych użytkowników Home Assistant, zorganizowaną według **Diátaxis** (Tutorial, How-to, Reference, Explanation), w języku **angielskim**, z **kanonicznym źródłem** w repozytorium (`wiki-publish/`) i **publikacją** na GitHub Wiki po każdym **wydaniu karty**. Treść musi być **jawnie wersjonowana** (semver karty), **zsynchronizowana nomenklatury** z README (konflikty: kod → decyzja maintainera), oraz objęta **udokumentowanym procesem utrzymania** (wyzwalacz release, przegląd okresowy, checklisty spójności z zachowaniem karty). Implementacja = przearanżowanie/uzupełnienie stron Markdown w `wiki-publish/`, aktualizacja `README`/linków, ewentualnie krótki dokument procesu w repo lub na wiki — **bez zmian w kodzie karty** o ile spec nie wymaga przykładów konfiguracji odzwierciedlających nowe API (same treści).

## Technical Context

**Language/Version**: Treść dokumentacji — **Markdown** (GitHub Flavored); repozytorium — **TypeScript** (karta) pozostaje bez zmian funkcjonalnych w ramach tej funkcji, poza ewentualną synchronizacją README.  
**Primary Dependencies**: GitHub Wiki (hosting publikacji); pliki w `wiki-publish/` (źródło); powiązanie z **Diátaxis** jako modelu informacji (brak biblioteki NPM — konwencja struktury).  
**Storage**: Pliki Markdown + zasoby statyczne (np. PNG) w `wiki-publish/`; historia w git; GitHub Wiki jako kopia publikowana ręcznie przy release.  
**Testing**: Weryfikacja **manualna / checklista** (pokrycie SC-001–SC-006, linki, wersja, zgodność z FR); brak automatycznych testów jednostkowych treści (opcjonalnie w przyszłości linter linków w CI — poza minimalnym zakresem spec).  
**Target Platform**: Czytnik — użytkownik końcowy HA (przeglądarka); autor — maintainer w edytorze + GitHub Wiki UI.  
**Project Type**: Dokumentacja projektu open-source (HACS card) — **artefakty treści**, nie nowy moduł runtime.  
**Performance Goals**: Czytelność i nawigacja (≤2 kliknięcia do każdej ćwiartki Diátaxis ze strony głównej wiki — SC-002); czas ładowania stron — standard GitHub Wiki.  
**Constraints**: FR-011 (EN), FR-012 (brak „HA od zera”), FR-007 (jedna nomenklatura), FR-013–FR-014 (`wiki-publish/` ↔ wersja ↔ upload).  
**Scale/Scope**: Zestaw stron pokrywający FR-001–FR-006 i ~90% opcji referencyjnych (SC-001); minimum trzy pełne how-to (SC-005); plan utrzymania spełniający SC-003.

## Constitution Check

*GATE: przed fazą 0 — spełnione; po fazie 1 — bez naruszeń.*

| Zasada | Ocena |
|--------|--------|
| I. HA / HACS / Lovelace | **Pasuje** — dokumentacja opisuje użycie karty zgodnie z API Lovelace; brak zmian kontraktu karty w tym planie (tylko opis istniejącego). |
| II. Bezpieczeństwo | **Pasuje** — treść wiki: unikać wklejania danych wrażliwych w przykładach; standardowe ostrzeżenia w troubleshooting (już w duchu konstytucji). |
| III. Jakość / dokumentacja | **Wzmocnienie** — konstytucja wymaga aktualizacji dokumentacji przy zmianach funkcji; ten plan formalizuje wiki + README + powiązanie z release. |
| IV. UX | **Pasuje** — dokumentacja wspiera zrozumienie wykresów i komunikatów (spójne terminy z UI i i18n tam, gdzie dotyczy opcji). |
| V. Wydajność | **N/A** dla treści statycznych poza zwięzłością i dobrym podziałem stron. |

**Wynik**: **PASS** — bez wpisów w Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-github-wiki/
├── plan.md              # Ten plik
├── research.md          # Diátaxis, mapowanie stron, decyzje utrzymania
├── data-model.md        # Encje dokumentacji i procesu
├── quickstart.md        # Jak edytować wiki-publish i publikować wiki
├── contracts/           # Konwenty treści i checklisty
├── checklists/
│   └── requirements.md  # Jakość specyfikacji (wcześniejsza sesja specify)
└── tasks.md             # /speckit.tasks (poza zakresem tej komendy)
```

### Source Code (repository root) — zakres dokumentacji

```text
wiki-publish/                    # Kanoniczne źródło stron wiki (Markdown)
├── Home.md                      # Wejście + Diátaxis + wersja dokumentacji (FR-002, FR-014)
├── _Sidebar.md                  # Nawigacja
├── Getting-Started.md           # Tutorial / start (FR-006)
├── Configuration-and-Customization.md  # Reference + how-to fragmenty
├── Forecast-and-Data-Internals.md      # Explanation
├── Aggregation-and-Axis-Labels.md      # Explanation / Reference
├── Troubleshooting-and-FAQ.md   # How-to (diagnostyka)
├── Releases-and-Migration.md    # How-to / Explanation (wersje, migracje)
├── energy-horizon-card.png      # Zasób statyczny
└── (ew. Documentation-Maintenance.md lub sekcja w Home — SC-003)

README.md                        # Punkt wejścia; musi pozostać zgodny nomenklaturą z wiki (FR-007)
changelog.md                     # Wyzwalacz przeglądu dokumentacji przy release
```

**Structure Decision**: Źródłem prawdy dla treści wiki jest **`wiki-publish/`** na domyślnej gałęzi; **GitHub Wiki** otrzymuje kopię przy **release** karty (procedura w [quickstart.md](./quickstart.md) i [research.md](./research.md)). Struktura plików może być stopniowo dopasowana do etykiet Diátaxis (nagłówki i mapa na `Home.md`), bez wymogu jeden-plik-na-ćwiartkę — FR-001 dopuszcza łączenie typów, byle intencja była czytelna z nawigacji.

## Complexity Tracking

> Nie dotyczy — brak naruszeń konstytucji wymagających uzasadnienia.

## Phase 0: Research

Wyniki w [research.md](./research.md) — decyzje: mapowanie Diátaxis → istniejące strony, reguły wersji i publikacji, utrzymanie nomenklatury z README.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) — encje: zestaw stron, powiązanie z wersją karty, proces utrzymania, kwadranty Diátaxis.  
- [contracts/wiki-documentation.md](./contracts/wiki-documentation.md) — wymagania treściowe i strukturalne dla `wiki-publish/` oraz publikacji.  
- [quickstart.md](./quickstart.md) — kroki dla maintainera: edycja, wersjonowanie, upload wiki, przegląd przy release.

## Agent context

Po zapisaniu artefaktów uruchom: `.specify/scripts/bash/update-agent-context.sh cursor-agent`.

## Post-Design Constitution Check

**PASS** — projekt dokumentacji wspiera zobowiązanie konstytucji do README, changelog i wiki; brak konfliktu z zasadami bezpieczeństwa ani API karty.
