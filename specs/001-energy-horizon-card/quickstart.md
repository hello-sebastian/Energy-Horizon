# Quickstart: Energy Horizon Cumulative Comparison Card

## 1. Wymagania wstępne

- Działająca instancja Home Assistant z:
  - Włączonym komponentem `recorder` i Long-Term Statistics (LTS).
  - Przynajmniej jedną encją raportującą zużycie energii (np. `sensor.house_total_energy`) z danymi dla dwóch okresów (bieżący i historyczny).
- Zainstalowany HACS.

---

## 2. Instalacja karty (HACS)

1. Otwórz HACS → `Frontend`.
2. Dodaj repozytorium karty (gdy będzie opublikowane) jako:
   - Typ: `Lovelace`.
3. Zainstaluj kartę `Energy Horizon Cumulative Comparison Card`.
4. Po instalacji:
   - Upewnij się, że zasób karty jest dodany w `Ustawienia → Panele → Zasoby` (lub automatycznie przez HACS).

---

## 3. Dodanie karty do dashboardu

1. Przejdź do wybranego dashboardu Lovelace.
2. Wejdź w tryb edycji → `Dodaj kartę`.
3. Wybierz:
   - `Karta niestandardowa` → `Energy Horizon Cumulative Comparison Card`  
     **lub**  
   - `Konfiguracja YAML` i wklej konfigurację (poniżej).

### Przykładowa konfiguracja YAML (rok do roku)

```yaml
type: custom:energy-horizon-card
entity: sensor.house_total_energy
title: Zużycie energii – rok do roku
comparison_mode: year_over_year
aggregation: day
show_forecast: true
precision: 1
```

### Przykładowa konfiguracja YAML (miesiąc do miesiąca rok do roku)

```yaml
type: custom:energy-horizon-card
entity: sensor.house_total_energy
title: Zużycie energii – miesiąc vs rok temu
comparison_mode: month_over_year
aggregation: day
show_forecast: true
precision: 1
```

---

## 4. Co zobaczysz na karcie

- **Wykres liniowy**:
  - Dwie serie skumulowanego zużycia:
    - Bieżący okres (np. bieżący rok/miesiąc).
    - Okres referencyjny (np. poprzedni rok / ten sam miesiąc rok wcześniej).
  - Kolory i tło dopasowane do motywu HA (dark/light).
- **Podsumowanie tekstowe**:
  - Bieżące skumulowane zużycie do dziś.
  - Skumulowane zużycie dla analogicznego dnia w okresie referencyjnym.
  - Różnica (wartość i procentowo), jeśli dostępne.
  - Prognozowana łączna wartość dla całego bieżącego okresu (opcjonalnie), wraz z historyczną wartością referencyjną.

---

## 5. Zachowanie przy braku danych lub błędach

- Jeśli wybrana encja nie istnieje lub nie ma danych LTS:
  - Karta wyświetli `<ha-alert>` z czytelnym komunikatem (np. „Brak danych dla wybranej encji w statystykach długoterminowych”).
- Jeśli dane są tylko dla jednego z okresów:
  - Karta pokaże pojedynczą serię oraz informację o braku danych porównawczych.
- W przypadku błędów komunikacji (WebSocket/API):
  - Karta nie blokuje całego dashboardu – pokazuje kratki `loading/error` i loguje szczegóły do konsoli przeglądarki (jeśli `debug: true`).

---

## 6. Wskazówki dotyczące wydajności

- Dla długich okresów (rok do roku):
  - Pozostań przy agregacji dziennej (`aggregation: day`), aby liczba punktów pozostała rozsądna.
- Unikaj uruchamiania wielu kopii karty z tą samą encją i identycznym zakresem czasu na jednym dashboardzie – rozważ użycie jednej karty dobrze widocznej zamiast kilku duplikatów.

---

## 7. Integracja z motywami HA

- Karta automatycznie dopasowuje się do motywu:
  - Używa zmiennych CSS Home Assistant (np. `--primary-color`, `--secondary-text-color`, `--ha-card-background`) do kolorów linii, osi, siatki i tła.
  - Reaguje na zmianę motywu (dark/light) przez przerysowanie wykresu (`Chart.js.update()`).

