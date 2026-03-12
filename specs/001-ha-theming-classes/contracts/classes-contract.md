# UI Contract – CSS klasy karty Energy Burndown

## Cel

Ten kontrakt opisuje, jakie klasy CSS są stabilnie wystawione przez kartę `energy-burndown-card`, tak aby użytkownicy mogli:

- ukrywać wybrane sekcje (np. prognozę),
- zmieniać ich rozmiar (np. wysokość wykresu),
- nadpisywać marginesy, typografię, kolory w zaawansowanych scenariuszach (np. Card‑Mod).

## Stabilne klasy CSS

- `.ebc-card` – główny kontener karty (`ha-card`)
- `.ebc-content` – wnętrze karty zawierające nagłówek, statystyki i wykres
- `.ebc-header` – nagłówek z tekstowym opisem trendu
- `.ebc-stats` – sekcja statystyk liczbowych (bieżący / referencyjny okres, różnice)
- `.ebc-forecast` – sekcja prognozy (jeśli włączona)
- `.ebc-chart` – kontener wykresu (obszar `<canvas>`)

## Przykłady użycia (np. z Card‑Mod)

### Ukrycie sekcji prognozy

```yaml
type: custom:energy-burndown-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
card_mod:
  style: |
    .ebc-forecast {
      display: none;
    }
```

### Zwiększenie wysokości wykresu

```yaml
type: custom:energy-burndown-card
entity: sensor.energy_consumption_total
comparison_mode: month_over_year
card_mod:
  style: |
    .ebc-chart {
      height: 260px;
    }
```

### Zmiana marginesów wokół statystyk

```yaml
type: custom:energy-burndown-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
card_mod:
  style: |
    .ebc-stats {
      margin-bottom: 20px;
    }
```

