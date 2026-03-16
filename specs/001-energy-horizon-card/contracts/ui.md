# UI Contracts: Alerts & Loading

## `<ha-alert>` Contract

- Karta używa komponentu `<ha-alert>` do sygnalizowania błędów i stanów degradacji.
- Minimalne założenia:
  - Atrybut `alert-type` przyjmuje wartości:
    - `"error"` – poważny błąd (np. brak połączenia z WebSocket, nieprawidłowa konfiguracja).
    - `"warning"` – częściowe dane (np. brak danych porównawczych, niekompletne dane referencyjne).
    - `"info"` – ogólne komunikaty (np. brak danych LTS dla danego zakresu).
  - Treść komunikatu przekazywana jest jako tekst/children wewnątrz elementu `<ha-alert>`.
- Karta NIE modyfikuje globalnego stylu `<ha-alert>` – polega na stylach dostarczonych przez Home Assistant.

## Loading Indicator

- Preferowany komponent: `<ha-circular-progress>` z atrybutami:
  - `size="small"` lub `size="medium"`,
  - `active` w czasie ładowania.
- Wymagania:
  - Podczas stanu `loading` karta wyświetla:
    - Widoczny spinner,
    - Krótki tekstowy komunikat (np. „Ładowanie danych statystyk długoterminowych...”).
  - Po przejściu do stanu `ready`, `error` lub `no-data` spinner znika.
- Jeśli w danej instalacji HA komponent `<ha-circular-progress>` nie jest dostępny, karta powinna użyć prostego fallbacku CSS (np. animowany `div`) bez zmiany pozostałej logiki.

