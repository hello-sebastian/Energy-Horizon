# Quickstart – Theming i klasy CSS karty Energy Burndown

## 1. Podstawowe użycie themingu HA

Karta automatycznie korzysta z motywów Home Assistant (jasny/ciemny) poprzez CSS custom properties:

- `--primary-color` / `--accent-color` – kolor linii bieżącego okresu,
- `--secondary-text-color` – kolor linii okresu referencyjnego oraz etykiet pomocniczych,
- `--divider-color` – kolor siatki (grid) na wykresie.

**Jak przetestować:**

1. Włącz kartę `energy-burndown-card` na dashboardzie.  
2. Przełącz interfejs HA między motywem jasnym i ciemnym.  
3. Sprawdź, że:
   - tekst i wykres są czytelne w obu motywach,
   - linie wykresu mają kolor zgodny z akcentem motywu,
   - siatka wykresu nie dominuje nad danymi, ale jest widoczna.

## 2. Klasy CSS dostępne dla zaawansowanych użytkowników

Główne sekcje karty oznaczone są następującymi klasami:

| Sekcja              | Klasa CSS      |
|---------------------|----------------|
| Cała karta          | `.ebc-card`    |
| Zawartość karty     | `.ebc-content` |
| Nagłówek tekstowy   | `.ebc-header`  |
| Statystyki liczbowe | `.ebc-stats`   |
| Prognoza            | `.ebc-forecast`|
| Wykres (kontener)   | `.ebc-chart`   |

Klasy te można wykorzystywać w zewnętrznych stylach (np. Card‑Mod), aby:

- ukrywać sekcje,
- zmieniać wysokość wykresu,
- dostosowywać marginesy lub typografię.

## 3. Szybki test z Card‑Mod (przykład)

```yaml
type: custom:energy-burndown-card
entity: sensor.energy_consumption_total
comparison_mode: year_over_year
card_mod:
  style: |
    /* Ukryj sekcję prognozy */
    .ebc-forecast {
      display: none;
    }

    /* Zwiększ wysokość wykresu */
    .ebc-chart {
      height: 260px;
    }
```

