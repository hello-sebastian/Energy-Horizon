# Data Model: Dokumentacja wiki (001-github-wiki)

**Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)

## Overview

Model opisuje **artefakty dokumentacji** i **proces utrzymania**, nie encje runtime Home Assistant.

## Entities

### WikiDocumentationSet

Zestaw stron opisujących kartę Energy Horizon w jednej wersji semantycznej karty.

| Field | Description | Validation / rules |
|-------|-------------|-------------------|
| `card_version` | Wersja karty, której dotyczy treść (`X.Y.Z` lub uzgodniony zakres) | Wymagane; zgodne z tagiem release lub jawnie opisany zakres (FR-014) |
| `language` | Język treści | Stałe: `en` (FR-011) |
| `source_path` | Lokalizacja kanoniczna w repo | `wiki-publish/` |
| `published_channel` | Kanał dla czytelnika końcowego | GitHub Wiki (upload po release) |
| `pages` | Lista logicznych stron | Co najmniej: Home + pokrycie ćwiartek Diátaxis (FR-001, SC-002) |

**Relationships**: Zawiera wiele `WikiPage`; powiązany z jednym `ReleaseArtifact` (wydanie karty) w sensie biznesowym (ta sama wersja semver).

### WikiPage

Pojedynczy plik Markdown w `wiki-publish/` (np. `Getting-Started.md`).

| Field | Description | Validation / rules |
|-------|-------------|-------------------|
| `file_name` | Nazwa pliku | Konwencja GitHub Wiki (spacje → `-`, linki bez `.md` w wiki) |
| `primary_diataxis` | Dominująca intencja | Jedna z: `tutorial`, `how_to`, `reference`, `explanation` (możliwa także meta dla `Home`) |
| `secondary_intents` | Dodatkowe intencje | Opcjonalnie, jeśli strona łączy typy (FR-001) |
| `title` | Tytuł wyświetlany | Pierwszy `#` lub konwencja nazwy pliku |

**Relationships**: Należy do `WikiDocumentationSet`; linkuje do innych `WikiPage` (względne ścieżki wiki).

### DiátaxisQuadrant (enum logiczny)

| Value | User goal | Przykładowe treści w projekcie |
|-------|-----------|-------------------------------|
| Tutorial | Nauczyć się ścieżką | `Getting-Started.md` |
| How-to | Rozwiązać konkretny problem | `Troubleshooting-and-FAQ.md`, fragmenty migracji |
| Reference | Sprawdzić fakty (opcje) | `Configuration-and-Customization.md` |
| Explanation | Zrozumieć dlaczego | `Forecast-and-Data-Internals.md`, agregacja |

### GlossaryTerm (opcjonalnie)

Termin współdzielony między README a wiki.

| Field | Description |
|-------|-------------|
| `term` | Kanoniczna nazwa (jak w kodzie / schema) |
| `definition_short` | Krótko w README lub link do wiki |
| `definition_full` | Rozwinięcie w Explanation/Reference |

**Validation**: Brak sprzecznych definicji między README a wiki po przeglądzie (FR-007, SC-004).

### MaintenanceProcess

| Field | Description |
|-------|-------------|
| `event_triggers` | Min. wydanie karty + publikacja z `wiki-publish/` (SC-003) |
| `periodic_review` | Np. kwartalny przegląd priorytetów |
| `drift_detection` | Checklista: changelog vs treść, zachowanie vs how-to (FR-009) |
| `nomenclature_resolution` | Kod → maintainer → harmonizacja README + wiki-publish (FR-007) |
| `audit_trail` | Zapis przeglądu (changelog, issue, lub notatka w release) |

## State transitions

- **Draft → Ready**: Treść w `wiki-publish/` po review PR; `card_version` ustawiona zgodnie z planowanym release.
- **Ready → Published**: Upload na GitHub Wiki po utworzeniu release GitHub; potwierdzenie że wersja na `Home` = wersja release.

## Data volume

- Rząd wielkości: **<20** plików Markdown w `wiki-publish/`; obrazy ograniczone do niezbędnych (np. jeden screenshot na Home).
