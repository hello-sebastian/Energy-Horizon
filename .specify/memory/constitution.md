# Energy Horizon Lovelace Card Constitution

Konstytucja dotyczy rozwoju, utrzymania i ewolucji uniwersalnych kart Lovelace dla Home Assistant, dystrybuowanych jako integracje HACS. Ma charakter ogólny i powinna być stosowana niezależnie od konkretnego typu karty czy wizualizowanych danych.

## Core Principles

### I. Zgodność z ekosystemem Home Assistant i HACS

- Karta musi być zgodna z oficjalnymi wytycznymi Home Assistant dla kart Lovelace (API, konfiguracja YAML/Storage UI, eventy, theming).
- Projekt domyślnie zakłada instalację i aktualizację przez HACS, z poprawnie utrzymywanym `repository.json`, semantycznym wersjonowaniem i czytelnym changelogiem.
- Konfiguracja karty nie może naruszać istniejących wzorców HA (np. nazewnictwa encji, sposobu użycia `state`, `attributes`, `unit_of_measurement`).
- Karta powinna zachowywać się przewidywalnie w trybach `edit`/`view` dashboardu oraz nie wpływać negatywnie na inne karty.
- Tam gdzie to tylko mozliwe nalezy wykorzystać wbudoane rozwiązania, standardy, style wizualne, zachowania, biblioteki z Home Assistant.

### II. Bezpieczeństwo i odporność na błędy

- Cała logika działa wyłącznie w przeglądarce użytkownika i komunikuje się z Home Assistantem wyłącznie poprzez natywne API kart Lovelace oraz oficjalne mechanizmy HA – bez własnych, niestandardowych kanałów komunikacji.
- Wejścia z YAML, Storage UI oraz wartości z encji są traktowane jako dane nieufne: podlegają rygorystycznej sanityzacji i walidacji (m.in. ochrona przed XSS, filtrowanie HTML, bezpośredniego wstrzykiwania skryptów i niebezpiecznych atrybutów).
- Dane konfiguracyjne i stany nie mogą zawierać wrażliwych informacji ujawnianych w UI, logach czy komunikatach błędów.
- Karta musi być odporna na brakujące encje, niespójne dane, nietypowe jednostki oraz błędne konfiguracje – zamiast crasha: czytelny, nienachalny komunikat dla użytkownika.
- Wszystkie operacje na danych muszą być defensywne: sprawdzanie typów, zakresów, istnienia atrybutów, z sensownymi wartościami domyślnymi i wariantami „graceful degradation”, które nie blokują działania całego dashboardu.
- Błędy powinny być logowane w sposób pomagający w diagnostyce, ale bez ujawniania prywatnych danych.

### III. Jakość kodu, testy i utrzymanie

- Cały kod aplikacyjny jest tworzony w TypeScript z rygorystycznymi ustawieniami kompilatora (`strict`, ścisłe typowanie, unikanie `any`) oraz dbałością o poprawne modele typów dla encji i konfiguracji YAML.
- Kod frontendu opiera się na rekomendowanych technologiach dla kart HA (np. Web Components/Lit) oraz jest modularny, czytelny i konsekwentnie sformatowany.
- Kluczowe funkcje (np. agregacja danych, przeliczanie energii, logika zakresów czasowych) muszą być pokryte testami jednostkowymi lub przynajmniej łatwe do przetestowania.
- Zmiany funkcjonalne wymagają aktualizacji dokumentacji, przykładów konfiguracji oraz – jeśli dotyczy – zrzutów ekranu.
- API konfiguracji karty traktujemy jak kontrakt publiczny: zmiany łamiące kompatybilność są wyraźnie oznaczane w wersjonowaniu i dokumentacji, z opisem ścieżki migracji.

### IV. UX/UI, dostępność i wizualizacja danych

- Interfejs karty jest projektowany w duchu „Home Assistant look & feel”: spójne typografie, odstępy, kolory i komponenty, z poszanowaniem motywów jasnych/ciemnych.
- Informacje prezentowane są w sposób zwięzły i hierarchiczny: kluczowe dane (np. bieżące zużycie, trend, porównania) są najbardziej wyeksponowane; szczegóły dostępne na żądanie (hover, klik, rozwinięcia).
- Wybór typów wykresów, kolorów i skali musi wspierać zrozumienie danych, a nie tylko estetykę (np. konsekwentne użycie koloru dla „zużycie”, „produkcja”, „limit”, „prognoza”).
- Karta powinna być responsywna, czytelna na różnych rozmiarach kafelków i ekranach (od telefonu po duży monitor).
- Dostępność jest wymogiem, nie opcją: odpowiedni kontrast, obsługa klawiatury, etykiety ARIA, przemyślane komunikaty dla czytników ekranu.

### V. Wydajność, prostota i obserwowalność

- Przetwarzanie danych musi być efektywne – minimalizujemy liczbę odświeżeń, unikamy zbędnych re-renderów, nie blokujemy głównego wątku ciężkimi obliczeniami.
- Preferujemy proste, zrozumiałe rozwiązania nad „magię” – każda dodatkowa złożoność musi przynosić wyraźną wartość użytkownikowi.
- Karta powinna w przejrzysty sposób reagować na typowe problemy (brak uprawnień, brak danych, błędna konfiguracja) i dostarczać sygnałów, które ułatwiają debugowanie (logi w konsoli, komunikaty w UI, sekcja „troubleshooting” w dokumentacji).
- Wszelkie mechanizmy cache’owania, agregacji lub optymalizacji danych muszą być czytelnie zaimplementowane i łatwe do wyłączenia lub przeprojektowania w przyszłości.

## Dodatkowe wymagania i ograniczenia

- Projekt utrzymuje spójny styl pracy z ekosystemem open‑source: przejrzysty `README`, jasne zasady zgłaszania problemów i kontrybucji, szacunek dla użytkowników i współtwórców.
- Biblioteki zewnętrzne dobieramy rozważnie: preferujemy lekkie, dobrze utrzymane, szeroko stosowane pakiety; unikamy nadmiernych zależności i „vendor lock‑in”, a każda nowa zależność NPM musi być uzasadniona i nie duplikować funkcjonalności dostępnej natywnie, w Home Assistant lub w istniejącym kodzie.
- Wszelkie operacje na danych energii powinny szanować lokalne uwarunkowania (strefa czasowa, jednostki, formaty dat/liczb) i jak najpełniej wykorzystywać natywne możliwości Home Assistant.
- Funkcje eksperymentalne lub „zaawansowane” muszą być wyraźnie oznaczone i domyślnie nie powinny komplikować podstawowego doświadczenia użytkownika.

## Workflow rozwojowy i jakość

- Wszystkie zmiany wprowadzane są poprzez pull requesty, z co najmniej jedną niezależną recenzją przy istotnych modyfikacjach logiki lub UI.
- Każda nowa funkcja lub istotna zmiana istniejącej musi być poparta opisem przypadku użycia oraz wpływu na UX, wydajność i kompatybilność z istniejącymi konfiguracjami.
- Przed wydaniem wersji produkcyjnej karty przeprowadzamy testy w realistycznym środowisku Home Assistant (różne encje, różne konfiguracje dashboardu, co najmniej kilka motywów).
- Pipeline wydawniczy (ręczny lub automatyczny) zapewnia: budowanie artefaktów, podstawową walidację, aktualizację wersji i changeloga, a także weryfikację poprawności metadanych HACS.

## Governance

- Niniejsza konstytucja ma pierwszeństwo przed lokalnymi preferencjami implementacyjnymi; w razie konfliktu praktyka musi zostać dopasowana do zasad konstytucji lub należy formalnie zmienić konstytucję.
- Zmiany konstytucji wymagają: (1) uzasadnienia (np. nowe wytyczne HA/HACS, nowe potrzeby użytkowników, problemy bezpieczeństwa), (2) omówienia w dokumentacji projektu, (3) planu migracji, jeśli wpływają na istniejących użytkowników.
- Każda większa decyzja projektowa (nowy typ wizualizacji, istotne rozszerzenie konfiguracji, zmiana domyślnych zachowań) powinna być weryfikowana pod kątem zgodności z tą konstytucją.
- Przeglądy okresowe projektu (np. przy większych wydaniach) powinny zawierać punkt „zgodność z konstytucją” i identyfikować miejsca wymagające refaktoryzacji.

**Version**: 1.0.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
