# Data model – Theming HA i semantyczne klasy karty

## Entities

- **ThemeColors**
  - Źródło: zmienne CSS udostępniane przez Home Assistant (motywy jasny/ciemny)
  - Pola:
    - `--primary-color`
    - `--accent-color`
    - `--primary-text-color`
    - `--secondary-text-color`
    - `--divider-color`
  - Zastosowanie:
    - Dobór kolorów linii wykresu (aktualny / referencyjny okres)
    - Kolor siatki/siatki osi (grid) wykresu
    - Kolor tekstów pomocniczych (etykiety, notki)

- **CssClassMap**
  - Źródło: struktura DOM karty (`energy-burndown-card`)
  - Klasy głównych sekcji:
    - `.ebc-card` – kontener karty (`ha-card`)
    - `.ebc-content` – główna zawartość karty (wnętrze z nagłówkiem, statystykami i wykresem)
    - `.ebc-header` – nagłówek / tekstowe podsumowanie trendu
    - `.ebc-stats` – sekcja statystyk liczbowych (bieżący okres, referencyjny, różnice)
    - `.ebc-forecast` – sekcja prognozy (jeśli włączona)
    - `.ebc-chart` – kontener wykresu (obszar `<canvas>`)
  - Zastosowanie:
    - Zewnętrzne nadpisywanie wyglądu (Card‑Mod itp.)
    - Ułatwienie debugowania i analizy DOM (czytelne nazwy)

