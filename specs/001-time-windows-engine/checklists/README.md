# Checklisty — Time Windows Engine

## `requirements.md` (jakość specyfikacji)

- **Kiedy**: przed `/speckit.plan` / startem implementacji (`/speckit.implement`).
- **Rola**: wszystkie pozycje powinny być `[x]` — to jedyna checklista w tym katalogu, którą skrypt implementacji traktuje jako bramkę przed kodem.

## Release i smoke (poza tym katalogiem)

- **[release-readiness.md](../release-readiness.md)** — SC-005 i opcjonalny smoke a11y; **uzupełniane przy zamykaniu release** (zadanie **T030**), nie przed pierwszym commitem kodu.
- Umieszczenie poza `checklists/` jest celowe: pozycje wymagają recenzenta i działającej karty, więc nie mogą blokować `/speckit.implement`.
