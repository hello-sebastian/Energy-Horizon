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
comparison_mode: year_over_year
time_window:
  duration: 1y
  step: 1y
  count: 2
```

Oczekiwanie: jak YoY z nadpisaną szerokością (SC-004) — regresja względem samego `comparison_mode: year_over_year`.

## Release

- Przed wydaniem: [checklists/release-readiness.md](./checklists/release-readiness.md) (SC-005, T030).

## Powiązane dokumenty

- [spec.md](./spec.md) — wymagania
- [data-model.md](./data-model.md) — encje
- [contracts/time-windows-engine.md](./contracts/time-windows-engine.md) — API modułu
- [research.md](./research.md) — Luxon, legacy presets
- [tasks.md](./tasks.md) — T012 (SC-002), T030 (SC-005)
