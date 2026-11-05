# Idea Intake: Tymczasowe przesuwanie i zmiana okna czasowego na karcie

- **Slug**: timewindow-preview
- **Created**: 2026-11-05
- **Source**: pasted text
- **Type**: new-capability

## Idea (as captured)

> Funkcja karty umożliwiająca użytkownikowi z poziomu skonfigurowanej karty, tymczasowe przełączanie okna czasowe w przód i wtył tz. jeśli okno ma długość miesiąca to za pomocą jednego przycisku przesuwamy je na poprzedni miesiąc, a potem na jeszcze wcześniejszy. Przełączanie nie wpływa na konfigurację karty i jest tracone po przeładowaniu widoku. W ten sposób użytkownik może szybko sprawdzić zużycie w poprzednich miejsącach/okresach. Na poziomie UI funkcja miałaby formę przycisków strzałka lewo i prawo w prawym rogu wykresu. Analogicznie możnaby również dodać zmiane wielkości okna np. zobacz w szerszym ujęciu np z okna szerokości miesiąca robimy cały rok.

## Restated

A card-level feature that lets the user temporarily shift the configured time window forward or backward (e.g., a month-long window stepped to the previous month, then the one before) and optionally change the window's size (e.g., from one month to a full year), via left/right arrow buttons in the top-right corner of the chart. The shift is purely transient: it does not modify the card configuration and is discarded when the view is reloaded, so the user can quickly inspect consumption in previous months/periods.

## Origin & Context

- **Raised by**: user (pasted text, project owner)
- **Trigger**: [NEEDS CLARIFICATION: what prompted it — e.g., a user request, a personal need to compare past months, feedback]

## First-Glance Unknowns

All resolved — see Clarifications below.

## Clarifications (2026-11-05, user)

1. **Shift range**: one click = one full-window shift. No limit — as far as the user wants; when the data runs out, the chart simply shows no consumption.
2. **No/partial data in the shifted window**: standard behavior as with any missing data — the card already handles such situations.
3. **Shift step size**: follows how the window width is defined — if the width is defined on a month basis, consecutive windows may have a different number of days depending on the month length; if the width is defined as e.g. 30 days, the shift is exactly 30 days (no calendar-month snapping). Analogously for other widths.
4. **Interaction with the configured window**: the shift is a purely transient preview and must not affect the window configuration — after reloading the view in HA, the shift is discarded and the chart shows the card's default configuration.
5. **Visual indication**: yes — the user must be aware that the chart is showing a temporary preview.
6. **Persistence**: no — after reloading the dashboard, the preview returns to the card's default settings.
7. **Scope**: shift first; window-size change (e.g., month → year) is deferred to a later iteration.
