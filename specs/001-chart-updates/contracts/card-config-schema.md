# Contract: Card Configuration Schema (YAML)

**Wersja kontraktu**: 0.3.0 (dodane opcje US3–US7 + connect_nulls)  
**Dotyczy brancha**: `001-chart-updates`  
**Typ kontraktu**: Publiczne API konfiguracji karty Lovelace (YAML / Storage UI)

> Plik YAML karty jest publicznym kontraktem użytkownika — każda zmiana łamiąca kompatybilność wsteczną wymaga bumpu major wersji i opisu ścieżki migracji (zgodnie z konstytucją, §III).

---

## Pełny schemat CardConfig (po wdrożeniu tej funkcji)

```yaml
type: "custom:energy-horizon-card"

# Wymagane
entity: sensor.energy_consumption   # string — ID encji HA (statistic_id)

# Preset porównania (wymagany po normalizacji; kanoniczny klucz YAML)
comparison_preset: year_over_year      # "year_over_year" | "month_over_year" | "month_over_month"
# Legacy (nadal wczytywany): comparison_mode — jeśli podano oba, wygrywa comparison_preset

# --- Opcje ogólne ---
title: "Moje zużycie"               # string? — tytuł karty; brak = friendly_name encji
show_title: true                     # boolean? — domyślnie: true
icon: "mdi:lightning-bolt"           # string? — ikona MDI; brak = ikona z encji
show_icon: true                      # boolean? — domyślnie: true

# --- Opcje danych ---
aggregation: day                     # "day" | "week" | "month" — domyślnie: "day"
period_offset: -1                    # number? — offset okresu referencyjnego (lata); domyślnie: -1
precision: 1                         # number? — miejsca po przecinku; domyślnie: 1

# --- Opcje prognozy ---
show_forecast: true                  # boolean? — linia prognozy na wykresie; domyślnie: true; false = ukryj. Alias: forecast

# --- Opcje null gap (łączenie braków) ---
connect_nulls: true                 # boolean? — rysuje przerywane interpolacje w lukach (sloty z brakami danych); domyślnie: true

# --- Opcje kolorów i wypełnienia (NOWE w tej funkcji) ---
primary_color: "#E53935"             # string? — kolor serii bieżącej (hex/rgb/rgba/CSS name)
                                     #           brak = kolor akcentu motywu HA

fill_current: true                   # boolean? — wypełnienie pod serią bieżącą; domyślnie: true
fill_reference: false                # boolean? — wypełnienie pod serią referencyjną; domyślnie: false
fill_current_opacity: 30             # number (0–100)? — krycie wypełnienia serii bieżącej; domyślnie: 30
fill_reference_opacity: 30           # number (0–100)? — krycie wypełnienia serii referencyjnej; domyślnie: 30

# --- Opcje lokalizacji ---
language: "pl"                       # string? — kod języka; brak = język z ustawień HA
number_format: "language"            # "comma" | "decimal" | "language" | "system" — domyślnie: "language"

# --- Opcje developerskie ---
debug: false                         # boolean? — logowanie diagnostyczne do konsoli; domyślnie: false
```

---

## Tabela opcji (pełna)

| Opcja | Typ | Domyślna | Wymagana | Opis |
|---|---|---|---|---|
| `type` | string | — | ✅ | Zawsze `"custom:energy-horizon-card"` |
| `entity` | string | — | ✅ | ID encji HA (statistic_id) |
| `comparison_preset` | `"year_over_year"` \| `"month_over_year"` \| `"month_over_month"` | — | ✅ | Preset porównania (kanoniczny klucz YAML) |
| `comparison_mode` | (jak wyżej) | — | — | **Deprecated** — alias legacy; gdy oba klucze obecne, obowiązuje `comparison_preset` |
| `title` | string | friendly_name encji | — | Tytuł wyświetlany na karcie |
| `show_title` | boolean | `true` | — | Czy wyświetlać tytuł |
| `icon` | string | ikona z encji | — | Ikona MDI (np. `mdi:lightning-bolt`) |
| `show_icon` | boolean | `true` | — | Czy wyświetlać ikonę |
| `aggregation` | `"day"` \| `"week"` \| `"month"` | `"day"` | — | Jednostka agregacji osi X |
| `period_offset` | number | `-1` | — | Offset roku/okresu referencyjnego |
| `precision` | number | `1` | — | Liczba miejsc dziesiętnych w wartościach |
| `show_forecast` | boolean | `true` | — | **US5**: Linia prognozy na wykresie (`false` = ukryj); alias: `forecast` |
| `connect_nulls` | boolean | `true` | — | Włącza/wyłącza rysowanie przerywanej interpolacji w lukach dla `null` (brak danych) |
| `primary_color` | string (CSS color, `var(--…)`, lub `ha-accent` / `ha-primary-accent` / `ha-primary`) | token `--eh-series-current` (`#119894`) | — | **US4**: Kolor serii bieżącej (linia, wypełnienie, swatch); motyw HA przez `var(--accent-color)` lub aliasy |
| `fill_current` | boolean | `true` | — | **US3**: Wypełnienie pod serią bieżącą |
| `fill_reference` | boolean | `false` | — | **US3**: Wypełnienie pod serią referencyjną |
| `fill_current_opacity` | number (0–100) | `30` | — | **US3**: Krycie (%) wypełnienia serii bieżącej |
| `fill_reference_opacity` | number (0–100) | `30` | — | **US3**: Krycie (%) wypełnienia serii referencyjnej |
| `language` | string | język HA | — | Kod języka dla lokalizacji |
| `number_format` | `"comma"` \| `"decimal"` \| `"language"` \| `"system"` | `"language"` | — | Format liczb |
| `debug` | boolean | `false` | — | Logi diagnostyczne w konsoli |

---

## Nowe opcje w tej funkcji (podsumowanie zmian breaking/non-breaking)

Wszystkie nowe opcje mają wartości domyślne — **brak zmian łamiących kompatybilność**.  
Istniejące konfiguracje działają bez modyfikacji:
- `fill_current: true` (domyślna) — wygląd nieznacznie zmieniony (pojawia się fill pod bieżącą serią)
- `primary_color` (brak) — domyślnie karta używa teal marki (`#119894` / `--eh-series-current`), nie `--primary-color` HA; przywrócenie koloru motywu: `primary_color: ha-primary` lub `var(--primary-color)`
- `show_forecast` — domyślnie **włączone** (linia prognozy na wykresie, gdy prognoza jest dostępna); użytkownicy preferujący brak linii bez ustawiania opcji powinni dodać `show_forecast: false`

**Widoczne różnice dla istniejących użytkowników**: (1) Domyślne `fill_current: true` powoduje pojawienie się półprzezroczystego wypełnienia (30%) pod serią bieżącą po aktualizacji. Jeśli użytkownik tego nie chce, może ustawić `fill_current: false`. (2) Domyślnie włączona linia prognozy na wykresie — aby ją ukryć jak wcześniej (bez jawnej opcji), ustaw `show_forecast: false`. (3) Domyślny kolor serii bieżącej bez `primary_color` to teal z makiet (`#119894`), a nie kolor primary z motywu HA — migracja: `primary_color: ha-primary` lub `var(--primary-color)`.

---

## Przykłady konfiguracji

### Minimalna (brak zmian relative do obecnego zachowania)

```yaml
type: "custom:energy-horizon-card"
entity: sensor.energy_consumption
comparison_preset: year_over_year
fill_current: false   # wyłącz nowe domyślne wypełnienie
```

### Z pełną wizualizacją (US3+US4+US5)

```yaml
type: "custom:energy-horizon-card"
entity: sensor.energy_consumption
comparison_preset: year_over_year
aggregation: day
primary_color: "#E53935"
fill_current: true
fill_current_opacity: 25
fill_reference: true
fill_reference_opacity: 15
show_forecast: true
```

### Miesięczna z wypełnieniem referencyjnym

```yaml
type: "custom:energy-horizon-card"
entity: sensor.energy_consumption
comparison_preset: month_over_year
aggregation: day
fill_current: true
fill_reference: true
fill_reference_opacity: 20
language: pl
```

---

## Walidacja po stronie karty

Karta musi tolerować niepoprawne wartości pól opcjonalnych bez crash-u:

| Pole | Niepoprawna wartość | Zachowanie |
|---|---|---|
| `primary_color: "not-a-color"` | Niepoprawny / nierozwiązany kolor | Pusty wynik resolucji → `--eh-series-current` / `#119894` |
| `fill_current_opacity: -5` | Poza zakresem 0–100 | Clamp do 30 (domyślna) |
| `fill_current_opacity: 150` | Poza zakresem 0–100 | Clamp do 30 (domyślna) |
| `fill_current_opacity: "abc"` | Nie-liczba | Clamp do 30 (domyślna) |
| `fill_current: "yes"` | Nie-boolean | Traktowane jak truthy → `true` |
| `show_forecast: 1` | Nie-boolean | Traktowane jak truthy → `true` |
| `connect_nulls: 0` | Nie-boolean | Traktowane jak falsy → `false` |
