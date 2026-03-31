# Quickstart: Time Windows Engine (deweloper)

**Repo**: Energy-Horizon | **Feature**: `001-time-windows-engine`

## Wymagania

- Node.js zgodny z projektem
- `npm install`

## Komendy

```bash
cd "/Users/admin/Projekty Local/Energy-Horizon"
npm test
npm run lint
```

## Co uruchomić po implementacji

1. **Vitest**: nowe pliki `tests/unit/time-windows-*.test.ts` — merge, walidacja, `resolve` z mockiem czasu i strefy (Warsaw / UTC). W `time-windows-resolve.test.ts` obowiązkowo scenariusz **SC-002**: −1 miesiąc od **31 marca** → ostatni dzień **lutego** (rok przestępny i nieprzestępny).
2. **Ręczny smoke w HA** (opcjonalnie): lokalny build karty + dashboard z trzema przykładami YAML ze specu (2 miesiące, 6 godzin, YoY z `duration`).

## Przykładowe YAML (smoke)

```yaml
type: custom:energy-horizon-card
entity: sensor.zuzycie_energii
comparison_preset: year_over_year
time_window:
  duration: 1y
  step: 1y
  count: 2
```

Oczekiwanie: jak YoY z nadpisaną szerokością (SC-004) — regresja względem samego `comparison_preset: year_over_year` (lub legacy `comparison_mode: year_over_year`).

**Month over month (kolejne miesiące)** — preset `month_over_month` (ścieżka generyczna, bez legacy YoY/MoY):

```yaml
type: custom:energy-horizon-card
entity: sensor.zuzycie_energii
comparison_preset: month_over_month
aggregation: day
```

Oczekiwanie: dwa okna — bieżący miesiąc kalendarzowy vs poprzedni pełny miesiąc; granice jak w `time-windows-presets-golden.test.ts` dla tego trybu.

**Uwagi UX:** Jeśli w YAML pominięto `comparison_preset` (i nie ma niepustego legacy `comparison_mode`), karta ustawia domyślnie `year_over_year`. Etykiety podsumowania zawierają rok/miesiąc dla presetów; przy w pełni niestandardowych oknach (`time_window`) sufiks może być zakresem dat z wyliczonych okien. Prognoza na wykresie jest domyślnie włączona (`show_forecast`); aby ją ukryć, ustaw `show_forecast: false`.

## Release

- Przed wydaniem: [release-readiness.md](./release-readiness.md) (SC-005, T030).

## Powiązane dokumenty

- [spec.md](./spec.md) — wymagania
- [data-model.md](./data-model.md) — encje
- [contracts/time-windows-engine.md](./contracts/time-windows-engine.md) — API modułu
- [research.md](./research.md) — Luxon, legacy presets
- [tasks.md](./tasks.md) — T012 (SC-002), T030 (SC-005)
