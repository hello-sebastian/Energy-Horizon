# Release readiness: Time Windows Engine

**Placement**: Ten plik leży **obok** `checklists/`, a nie wewnątrz niego. Folder `checklists/` zawiera wyłącznie bramkę **jakości specyfikacji** przed kodowaniem; pozycje poniżej są uzupełniane **po** implementacji i przy zamykaniu release (**T030**) — inaczej `/speckit.implement` błędnie traktowałby niewypełnione pola jako blokadę startu prac.

**Purpose**: Domknąć kryteria, które nie są w pełni automatyczne w CI (wynik `/speckit.analyze`, 2026-03-29).  
**Feature**: [spec.md](./spec.md) — zwłaszcza **SC-005**.  
**Powiązane zadanie**: [tasks.md](./tasks.md) — **T030**

**Status implementacji (2026-03-29)**: silnik okien, integracja karty i testy Vitest są wdrożone; poniższe checklisty SC-005 / a11y wymagają jeszcze **ręcznego** podpisu recenzenta przed release (nie blokują merge technicznego).

## SC-005 — czytelność dokumentacji wiki

**Wymaganie (spec)**: Co najmniej jeden recenzent lub tester zewnętrzny względem implementacji potwierdza na podstawie dokumentacji wiki, że potrafi odtworzyć **dwa** przykłady z specyfikacji (np. „dwa kolejne miesiące” i „month_over_year”) bez wsparcia autora kodu.

- [ ] Recenzent (nie autor głównej implementacji): ____________________
- [ ] Data: ____________________
- [ ] Potwierdzenie: odtworzono przykład 1 (opis): ____________________
- [ ] Potwierdzenie: odtworzono przykład 2 (opis): ____________________
- [ ] Źródło dokumentacji użytej przy teście: `specs/001-time-windows-engine/wiki-time-windows.md` (draft) / README / inne: ____________________

## Dostępność (konstytucja IV) — skrótowy smoke

Opcjonalnie przed release (rekomendacja z analizy **N1**):

- [ ] Komunikat błędu konfiguracji (`ha-alert`) jest czytelny w motywie jasnym i ciemnym
- [ ] Tooltip / nagłówki bez utraty kontrastu w jednym wybranym motywie HA

## Notatki

Wpis do PR: link do tego pliku lub skopiowane „check” + data wystarczą jako dowód SC-005.
