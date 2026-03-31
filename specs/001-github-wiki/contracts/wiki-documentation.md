# Contract: Wiki documentation (`wiki-publish/` → GitHub Wiki)

**Feature**: `001-github-wiki` | **Date**: 2026-03-31  
**Related**: [spec.md](../spec.md) FR-001–FR-014, SC-001–SC-006

## Purpose

Zdefiniować **wymagania**, które musi spełniać zestaw dokumentacji, aby uznać ją za zgodną ze specyfikacją — niezależnie od tego, czy recenzja jest ludzka, czy częściowo checklistą w issue release.

## 1. Struktura wejścia (`wiki-publish/`)

| Requirement | ID | Details |
|-------------|-----|---------|
| Istnieje `Home.md` | C-001 | Zawiera: krótki opis karty, **wersję dokumentacji / karty** (FR-014), mapę Diátaxis z linkami do pozostałych stron (FR-002). |
| Istnieje `_Sidebar.md` | C-002 | Spójny z linkami z `Home.md`; język angielski (FR-011). |
| Każda ćwiartka Diátaxis | C-003 | Co najmniej jedna strona lub wyraźna sekcja osiągalna w ≤2 kliknięciach ze strony głównej wiki (SC-002). |
| Reference coverage | C-004 | ≥90% publicznych opcji karty istotnych dla użytkownika ma opis w warstwie Reference (SC-001) — lista opcji do weryfikacji przy release w oparciu o typy/schema konfiguracji w `src/`. |

## 2. Język i zakres

| Requirement | ID | Details |
|-------------|-----|---------|
| Język | C-010 | Treść merytoryczna wyłącznie po angielsku (FR-011). |
| Zakres | C-011 | Bez ogólnego tutoriala HA „od zera”; odesłania do oficjalnej dokumentacji HA tam, gdzie potrzeba (FR-012). |

## 3. Zgodność z README i kodem

| Requirement | ID | Details |
|-------------|-----|---------|
| Nomenklatura | C-020 | Te same nazwy opcji/trybów co w README i w kodzie (typy konfiguracji); brak trwałych rozbieżności po przeglądzie (FR-007). |
| Rozstrzyganie konfliktu | C-021 | Najpierw weryfikacja zachowania w kodzie; jeśli niejednoznaczne — decyzja maintainera; następnie aktualizacja README i `wiki-publish/`. |

## 4. Publikacja na GitHub Wiki

| Requirement | ID | Details |
|-------------|-----|---------|
| Timing | C-030 | Upload treści z `wiki-publish/` na GitHub Wiki **po** wydaniu wersji karty, której treść dotyczy (FR-013). |
| Wersja widoczna | C-031 | Strona główna wiki pozwala ustalić wersję karty w ≤1 kroku od wejścia (SC-006). |

## 5. Plan utrzymania (dostępność treści)

| Requirement | ID | Details |
|-------------|-----|---------|
| Dostępność | C-040 | Plan utrzymania jest czytelny publicznie (wiki i/lub plik w repo powiązany z `wiki-publish/`) (SC-003). |
| Wyzwalacze | C-041 | Opisany min. jeden wyzwalacz zdarzeniowy (release) i jeden rytm okresowy (np. kwartalny przegląd). |
| Nieaktualna treść | C-042 | Opisany krok postępowania, gdy dokumentacja jest nieaktualna względem karty (SC-003). |

## 6. How-to minimal set

| Requirement | ID | Details |
|-------------|-----|---------|
| Trzy przepływy | C-050 | Co najmniej trzy odrębne how-to z warunkami końcowymi weryfikowalnymi w HA UI i sekcją „when something goes wrong” (SC-005). |

## Compliance

**Satisfied** when: wszystkie ID C-001–C-004, C-010–C-011, C-020–C-021, C-030–C-031, C-040–C-042, C-050 są spełnione albo jawnie odroczone z datą (tylko tymczasowo, zgodnie z edge cases w spec).
