# Research: 006-time-windows-unify

## 1. Single timeline policy vs „legacy” branch in `buildChartTimeline`

**Decision**: Zastąpić rozróżnienie implementacyjne „legacy preset” vs „generic” **jednym zestawiem reguł** widocznym w kodzie jako wywołania wspólnych funkcji: dla **`windows.length >= 2`** zawsze **Longest-window axis span** (max nominalnych slotów przy ziarnie `windows[0].aggregation`); **etykiety i wyrównanie ordinalne** według **FR-B**; krótsze serie kończą się wcześniej. Testy utrwalają **zamierzone** zachowanie presetów YoY/MoY/MoM **bez** odwołania do flag w asercjach użytkownika końcowego.

**Rationale**: Spec FR-A wymaga wyjaśnialności bez „ścieżki legacy”. Flagi `currentEndIsNow` / `referenceFullPeriod` mogą pozostać wewnętrznym szczegółem preset template **tylko** jeśli nie zmieniają semantyki po merge (FR-F); docelowo redukcja rozgałęzień w `resolveTimeWindows` + `buildChartTimeline` zmniejsza ryzyko regresji przy `stripLegacyWhenGeneric`.

**Alternatives considered**:

- Zachować dwa osobne bloki na zawsze — odrzucone (sprzeczne z celem 006).
- Całkowite usunięcie flag przed migracją testów — ryzykowne; preferowana ewolucja w dwóch fazach (plan Phase 1 / Phase 2 w spec).

## 2. „Longest window” = liczba slotów przy ziarnie wykresu, nie tylko wall-clock

**Decision**: Przy **FR-C** (dla **każdego** `N ≥ 2`) długość okna do porównania „najdłuższego” liczyć jako **`countBucketsForWindow(window, timeZone)`** (lub równoważne `buildTimelineSlots` od nominalnego `start`/`end` resolved) przy **ziarnie równym `windows[0].aggregation`**, a następnie wybrać **maksimum** po wszystkich oknach. Oś budować z **takiej** liczby slotów — spójnie z nominalnymi granicami (sesja clarify: nominal bounds). Nie ma osobnej ścieżki „tylko dwa okna = długość z bieżącego”.

**Rationale**: Czysty wall-clock (`end.getTime() - start.getTime()`) może wskazać inne „najdłuższe” okno niż liczba **kroków agregacji** (np. miesiące o różnej liczbie dni przy ziarnie „day”). Spec 006 definiuje długość w **krokach wyrównanych** przy ziarnie wykresu.

**Alternatives considered**:

- Tylko wall-clock — odrzucone jako niespójne z FR-C w spec.
- Osobne ziarno per okno na osi — sprzeczne z FR-C/FR-F (jedno ziarno wykresu = okno bieżące).

## 3. Time zone authority (FR-H)

**Decision**: Kontynuować użycie **tej samej** strefy co statystyki / `hass` (istniejący `resolveLocale` → string IANA przekazywany do Luxon i zapytań). Nie używać `Intl` przeglądarki do granic bucketów ani do „now” w logice karty.

**Rationale**: Zgodność z LTS i oczekiwaniami użytkownika „domowej” instancji.

**Alternatives considered**: Browser local — odrzucone w clarify.

## 4. Carry-forward przy „now” (FR-G)

**Decision**: Zastosować **jednolitą** regułę po zmapowaniu punktów LTS na sloty: dla **serii bieżącej (index 0)**, w slocie zawierającym instant „now”, jeśli brak zamkniętego punktu LTS, wstawić **ostatnią znaną wartość skumulowaną** w obrębie tego okna (bez przedłużania poza `end` okna ani poza timeline). Dla **week** / **month** — ta sama intencja; jeśli model danych uniemożliwia poprawny carry-forward, udokumentować i ewentualnie **FR-E/FR-F** (komunikat lub jawne ograniczenie), nie cicha luka.

**Rationale**: Zamyka rozjazd podsumowanie vs koniec linii opisany w spec.

**Alternatives considered**: Wyłączenie carry-forward dla week/month — odrzucone w clarify (domyślnie analogicznie do dnia).

## 5. Preset label vs effective windows (FR-F)

**Decision**: W kodzie **nie** rozgałęziać logiki osi/tooltip/prognozy po `comparison_preset`, gdy efekt merge jest w pełni określony przez pola `time_window`. UI: unikać komunikatów sugerujących narrację presetu sprzeczną z **resolved** oknami (np. tooltip wyłącznie z etykiet okien efektywnych lub neutralny nagłówek — do ustalenia w implementacji przy istniejących komponentach).

**Rationale**: Użytkownik zaawansowany; spójność reguł > wyjątki po nazwie presetu.

## 6. Dokumentacja krzyżowa

**Decision**: Po implementacji zaktualizować **wyłącznie** w zakresie sprzeczności: `specs/001-time-windows-engine`, `specs/001-aggregation-axis-labels`, `specs/001-compute-forecast` (fragmenty o osi X vs prognoza), kontrakty oraz `wiki-publish/Mental-Model-Comparisons-and-Timelines.md` i powiązane strony; README / advanced README / changelog przy release.

**Rationale**: SC-3 / SC-4 w spec 006.
