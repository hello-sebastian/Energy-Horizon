# Implementation Plan: Energy Horizon Cumulative Comparison Card

**Branch**: `001-energy-horizon-card` | **Date**: 2026-03-10 | **Spec**: `specs/001-energy-horizon-card/spec.md`
**Input**: Feature specification from `/specs/001-energy-horizon-card/spec.md`

**Note**: Plan prepared for a custom Lovelace card implemented in TypeScript + LitElement, using Chart.js and Home Assistant Long-Term Statistics over WebSocket.

## Summary

Energy Horizon Cumulative Comparison Card dostarcza użytkownikowi jeden, syntetyczny wykres porównujący skumulowane zużycie energii w bieżącym okresie z analogicznym okresem historycznym (np. rok do roku, miesiąc do miesiąca) oraz prosty tekstowy panel ze skumulowanymi wartościami i prognozą końcowego zużycia.  
Technicznie karta będzie pojedynczym web komponentem LitElement, budowanym przez Vite jako bundle do wykorzystania w Home Assistant, wykorzystującym Chart.js (z gradientami i markerami) oraz WebSocket API `recorder/statistics_during_period` do pobierania wstępnie zagregowanych statystyk długoterminowych bez lokalnego przetwarzania tysięcy punktów w przeglądarce.

## Technical Context

**Language/Version**: TypeScript (ES2020+, `strict` enabled)  
**Primary Dependencies**: Lit (`lit`, `lit/decorators.js`), Chart.js (core + line/tooltip/legend/gradient plugins), Home Assistant Lovelace card API typings, Vite bundler  
**Storage**: Brak własnej warstwy storage; karta korzysta wyłącznie z danych statystyk długoterminowych dostarczanych przez backend Home Assistant przez WebSocket  
**Testing**: Jest: Vitest dla logiki pomocniczej (agregacje, mapowanie odpowiedzi API, obliczanie prognozy); Storybook lub prosty sandbox Lovelace do ręcznego testowania UI (opcjonalnie)  
**Target Platform**: Przeglądarka w ramach interfejsu web Home Assistant (desktop i mobile), instalacja poprzez HACS  
**Project Type**: Frontend library / custom Lovelace card (web component)  
**Performance Goals**: Render karty subiektywnie „prawie natychmiastowy” przy przejściu na dashboard; liczba punktów na wykresie typowo < 400 (np. ~365 dni), pełne przetwarzanie po stronie backendu (tylko już zagregowane statystyki w przeglądarce)  
**Constraints**: Zgodność z API Lovelace i themingiem HA; brak sztywnych kolorów (wyłącznie zmienne CSS HA z opcjonalnymi fallbackami); wszystkie zapytania do danych przez oficjalne WebSocket API i obiekt `hass.connection`; brak dodatkowego backendu; defensywne zachowanie przy brakach danych  
**Compatibility**: Minimalna wspierana wersja Home Assistant to **2024.6**; brak gwarancji kompatybilności z wersjami wcześniejszymi. Karta jest projektowana wyłącznie pod standardowy interfejs Lovelace – customowe UI i alternatywne frameworki dashboardów nie są oficjalnie wspierane.
**Scale/Scope**: Pojedyncza karta działająca jednocześnie w wielu instancjach na dashboardzie; każda instancja może wykonywać własne zapytanie do LTS, więc należy unikać duplikowania ciężkich obliczeń w przeglądarce i wspierać cache’owanie wyników na czas życia karty.

### Locale & Formatting

- Źródłem ustawień lokalizacyjnych jest obiekt `hass`:
  - Preferowane pola: `hass.locale` (jeśli dostępne) lub `hass.language` wraz z konfiguracją jednostek z `hass.config`.
- Formatowanie dat na osi czasu i w podsumowaniach:
  - Wykorzystujemy `Intl.DateTimeFormat` z locale pochodzącym z `hass` (np. `new Intl.DateTimeFormat(hass.locale.language, {...})`).
- Formatowanie liczb (wartości energii, różnice, procenty):
  - Wykorzystujemy `Intl.NumberFormat` z tym samym locale oraz maksymalną liczbą miejsc po przecinku wynikającą z `CardConfig.precision` (domyślnie 1).
- Celem jest spójność z resztą interfejsu HA: te same zasady formatowania dat/liczb powinny obowiązywać w karcie i w natywnych widokach HA.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Zgodność z Home Assistant i HACS:
  - Karta będzie rozszerzać `LitElement` i implementować interfejs `LovelaceCard` (oraz opcjonalnie `LovelaceCardEditor`), respektując oficjalne wzorce konfiguracji YAML/Storage UI oraz theming (`var(--*)`).
  - Dystrybucja przewidziana przez HACS z semantycznym wersjonowaniem, `repository.json` oraz aktualizowanym changelogiem.
- Bezpieczeństwo i odporność na błędy:
  - Brak własnych kanałów komunikacji – wszystkie dane pochodzą z `hass` i WebSocket API `recorder/statistics_during_period`.
  - Konfiguracja YAML i dane encji traktowane jako nieufne: walidacja nazw encji, zakresów dat, typów, jednostek; defensywna obsługa braku danych i błędów (renderowanie `<ha-alert>` zamiast crasha).
- Jakość kodu, testy i utrzymanie:
  - Całość logiki w TypeScript ze `strict` oraz dedykowanymi typami w `types.ts` dla konfiguracji, odpowiedzi API i wewnętrznego modelu serii.
  - Kluczowe funkcje (mapowanie odpowiedzi LTS, obliczanie serii skumulowanych, prognozy) będą izolowane w funkcjach/serwisach możliwych do testowania jednostkowego.
- UX/UI, dostępność i wizualizacja danych:
  - UI karty dostosowane do „Home Assistant look & feel” – użycie zmiennych CSS HA (`--primary-color`, `--secondary-text-color`, `--ha-card-background`, itp.) i komponentów typu `<ha-alert>`.
  - Wykres responsywny i reagujący na zmianę motywu (dark/light) poprzez aktualizację stylów Chart.js i wywołanie `.update()`.
- Wydajność, prostota i obserwowalność:
  - Wykorzystywanie gotowych agregacji LTS z backendu (limitowanie liczby punktów, brak intensywnego przeliczania w przeglądarce).
  - Jasne logowanie problemów do konsoli (z zachowaniem prywatności danych) oraz komunikaty w UI („brak danych porównawczych”, błędna konfiguracja).

Wstępna ocena: **brak naruszeń konstytucji** – plan jest spójny z zasadami; po zakończeniu projektu Phase 1 nastąpi ponowna weryfikacja w kontekście szczegółowego modelu danych i kontraktów.

## Project Structure

### Documentation (this feature)

```text
specs/001-energy-horizon-card/
├── plan.md              # Ten plik – plan implementacji
├── research.md          # Phase 0 – decyzje technologiczne i architektoniczne
├── data-model.md        # Phase 1 – definicje encji, serii, okresów porównawczych
├── quickstart.md        # Phase 1 – skrócona instrukcja użycia karty
├── contracts/           # Phase 1 – kontrakty interfejsów (Lovelace, HA WebSocket, Chart.js)
└── tasks.md             # Phase 2 – zadania implementacyjne (/speckit.tasks, poza zakresem /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── card/
│   ├── cumulative-comparison-chart.ts  # Główny komponent karty (LitElement + LovelaceCard)
│   ├── chart-renderer.ts               # Klasa odpowiedzialna za inicjalizację i aktualizację Chart.js
│   ├── ha-api.ts                       # Serwis komunikacji z WebSocket API HA (LTS statistics)
│   ├── types.ts                        # Wspólne typy TS: konfiguracja, modele danych, odpowiedzi API
│   └── theme-utils.ts                  # Pomocnicze funkcje do mapowania zmiennych CSS HA na kolory Chart.js
├── index.ts                            # Punkt wejścia bundla karty (rejestracja custom elementu)
└── vite-env.d.ts                       # Deklaracje środowiska Vite, jeśli potrzebne

tests/
├── unit/
│   ├── ha-api.test.ts                  # Testy mapowania i walidacji odpowiedzi LTS
│   ├── aggregation.test.ts             # Testy obliczeń skumulowanych serii i prognoz
│   └── theme-utils.test.ts             # Testy mapowania themingu
└── integration/
    └── card-render.test.ts             # Podstawowe testy renderowania karty (bez pełnego HA)

config/
├── vite.config.ts                      # Konfiguracja Vite (bundle dla UMD/ES, output pod HA/HACS)
└── eslint.config.js / tsconfig.json    # Konfiguracja TypeScript + linting
```

**Structure Decision**: Single frontend package zorganizowany wokół folderu `src/card/` dla logiki karty oraz dedykowanymi katalogami `tests/` i `config/`. Struktura minimalizuje złożoność (brak podziału na frontend/backend), jest typowa dla customowych kart HA i pozwala na łatwe wydzielenie poszczególnych odpowiedzialności (WebSocket API, renderowanie wykresu, typy, theming).

## Complexity Tracking

Na tym etapie **brak zidentyfikowanych naruszeń konstytucji**, dlatego tabela pozostaje pusta. Jeśli w toku implementacji pojawi się potrzeba dodania nietypowych zależności lub bardziej złożonych wzorców architektonicznych, plan zostanie uzupełniony o uzasadnienie zgodnie z wymaganiami konstytucji.
