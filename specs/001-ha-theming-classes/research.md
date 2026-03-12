# Research – Theming HA i semantyczne klasy karty

## Zidentyfikowane zmienne themingu Home Assistant

- `--primary-color` – główny kolor akcentu interfejsu
- `--accent-color` – alternatywny kolor akcentu (często używany dla wyróżnień)
- `--primary-text-color` – bazowy kolor tekstu
- `--secondary-text-color` – kolor tekstu pomocniczego / opisowego
- `--divider-color` – kolor linii podziału i siatek

W implementacji wykresu wykorzystujemy następującą mapę:

- **Linia „Bieżący okres”** – `--accent-color` (jeśli zdefiniowany) lub `--primary-color`
- **Linia „Okres referencyjny”** – `--secondary-text-color`
- **Siatka osi X/Y (grid)** – `--divider-color` (z zapasowym kolorem neutralnym)

## Mapowanie klas CSS na sekcje karty

- `.ebc-card` – korzeń karty (`<ha-card>`)
- `.ebc-content` – główny wrapper zawartości karty
- `.ebc-header` – nagłówek z opisem trendu zużycia
- `.ebc-stats` – blok statystyk liczbowych
- `.ebc-forecast` – blok prognozy (jeśli pokazywany)
- `.ebc-chart` – kontener wykresu (obszar `<canvas>`)

Te klasy są dodane **dodatkowo** do istniejących klas, aby nie zaburzać dotychczasowych styli.

## Notatki dot. kontrastu

- Kolory pozyskiwane są bezpośrednio z aktywnego motywu HA.  
- Odpowiedzialność za globalny kontrast spoczywa na motywie, natomiast karta:
  - nie używa na wykresie sztywnych białych linii (`rgba(255,255,255,...)`),
  - dla siatki korzysta z `--divider-color`, która jest projektowana z myślą o danym motywie.

Przy ręcznym sprawdzeniu w kilku popularnych motywach (domyślny jasny/ciemny oraz dwa motywy społecznościowe) nie odnotowano problemów z czytelnością głównych linii wykresu ani tekstu.

