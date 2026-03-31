# Quickstart: Utrzymanie `wiki-publish/` i publikacja GitHub Wiki

**Feature**: `001-github-wiki` | **Date**: 2026-03-31

## Kto powinien to czytać

Maintainerzy przygotowujący release karty lub aktualizujący dokumentację zaawansowaną.

## Edycja kanonicznej treści

1. Sklonuj repozytorium i otwórz katalog **`wiki-publish/`**.
2. Edytuj pliki **Markdown** (np. `Home.md`, `Getting-Started.md`). Obrazy trzymaj przy stronach (np. `energy-horizon-card.png`).
3. Na **`Home.md`** utrzymuj widoczną linię **wersji dokumentacji / karty** zgodną z planowanym lub aktualnym release (semver).
4. Sprawdź linki wewnętrzne (konwencja GitHub Wiki: `[Title](Page-Name)` bez `.md`).
5. Upewnij się, że terminologia jest **zgodna z README** i **nazwami opcji w kodzie** (typy konfiguracji w `src/`). Przy wątpliwości — najpierw kod, potem decyzja maintainera (FR-007).
6. Otwórz **Pull Request**; recenzja jak zwykła zmiana w repo.

## Publikacja na GitHub Wiki (po release karty)

1. Zbuduj i opublikuj release karty (semver, tag, artefakt HACS) zgodnie z procesem projektu.
2. Upewnij się, że treść w `wiki-publish/` odpowiada **tej samej wersji** co release (FR-013, FR-014).
3. W interfejsie GitHub: **Wiki** → zaktualizuj strony, wklejając lub synchronizując treść z plików w `wiki-publish/` (GitHub nie zawsze automatyzuje — **ręczny upload** jest akceptowany w tym planie).
4. Zweryfikuj stronę główną wiki: wersja widoczna w jednym kroku (SC-006).

## Checklista przy release (skrót)

- [ ] `changelog.md` i opis release odzwierciedlają zmiany wpływające na użytkownika.
- [ ] `wiki-publish/Home.md` (i sidebar) mają poprawną wersję i mapę Diátaxis.
- [ ] Referencja opcji pokrywa nowe/zmienione klucze YAML (SC-001 — użyj listy z kodu/schema).
- [ ] README nie jest w sprzeczności z wiki (FR-007).
- [ ] Trzy how-to z SC-005 nadal aktualne lub zaktualizowane.
- [ ] Upload na GitHub Wiki wykonany.

## Gdzie szukać pełniejszego opisu procesu

- [research.md](./research.md) — uzasadnienia i mapowanie Diátaxis.
- [contracts/wiki-documentation.md](./contracts/wiki-documentation.md) — lista wymagań zgodności (ID C-*).
- [plan.md](./plan.md) — podsumowanie techniczne i struktura katalogów.
