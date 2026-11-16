# Prompt dla `/speckit.specify` — feature `911-tech-debt-reduction`

> **Jak użyć:** w Cursorze uruchom `/speckit.specify` i wklej jako input cały tekst z sekcji „PROMPT" poniżej (od linii `--- PROMPT ---` do `--- KONIEC PROMPTU ---`). Prompt jest samowystarczalny — nie wymaga wcześniejszego kontekstu rozmowy. Źródłem wymagań jest `architecture-audit-2026-11-15.md` (root repo).
>
> **Co prompt obejmuje:** jedno wspólne feature 911 (nie 14 osobnych, nie bug triad); actor = Maintainer; inwariant zero zmian widocznych dla użytkownika; 5 user stories priorytetyzowanych; 19 FR (14 zadań TD + 5 poprzecznych); kryteria sukcesu mierzalne; edge cases (gating TD-4↔TD-5, interakcja TD-2↔TD-11, dist/verify-dist); assumptions; out-of-scope z listą „nie ruszać"; FR-016 (aktualizacja speców domenowych 900–907 jako kryterium akceptacji); FR-017 (assess pre-flight dla TD-2/TD-11 — precedens 909); FR-018 (converge po każdej fali); 4 fale jako milestone'y.

--- PROMPT ---

## 0. Zadanie

Opracuj specyfikację feature'a **`911-tech-debt-reduction`** — programu redukcji długu technicznego w Energy Horizon Card, modelowanego jako **JEDEN** wspólny feature speckit (nie 14 osobnych feature'ów i nie bug triad).

### Kontekst i ramy (wymagane w sekcji Overview specu)

- **Źródłem wymagań jest audyt architektury** `architecture-audit-2026-11-15.md` (root repozytorium) — diagnostyka oparta o graph Codegraph (1401+ symboli, 2121 krawędzi calls, 0 cykli importów), raport graphify, przegląd kodu źródłowego (`src/` — 50 plików, 11 195 linii TS; `tests/` — 64 pliki, 15 165 linii) i Konstytucję v1.2.0. **Przeczytaj cały plik przed pisaniem specu.** W etapie `plan` audyt ma zostać dołączony do feature'a jako `research.md` — spec go tylko referencjonuje, nie duplikuje.
- **Charakter:** program maintenance / technicznego długu o **zerowej widocznej zmianie zachowania** dla użytkownika końcowego. Aktorem we wszystkich user stories jest **Maintainer** (developer / agent AI pracujący nad kartą), nie użytkownik końcowy.
- **Precedens w repo:** foldery feature'owe spoza domen (908, 909, 910) istnieją w `specs/`; numeracja sekwencyjna (globalny max 910 + 1 = **911**) — katalog `specs/911-tech-debt-reduction`, gałąź `911-tech-debt-reduction` (polityka: `.cursor/rules/speckit-numbering.mdc`).
- **Konstytucja** (`.specify/memory/constitution.md` v1.2.0) jest kryterium zgodności. Audyt wykazał naruszenia (tabela w raporcie §3: art. III — `any`, art. V — prostota/zależności, art. II — ujawnianie źródła w artefakcie, Governance — jakość dokumentacji) — feature istnieje też po to, by je wyeliminować; żadnych nowych naruszeń.
- **To nie jest bug:** nie ma usterki widocznej dla użytkownika ani reprodukcji — triada bug (`.specify/bugs/`, assess→fix→test) jest niedopuszczalna dla tego zakresu (decyzja projektu 2026-11-16).

### Język i artefakt

- Ciało `spec.md` pisz po **angielsku** (konwencja speców 900–910 — sprawdź np. `specs/900-time-model-windows/spec.md` i `specs/909-timewindow-preview/spec.md`); pole `Input` rejestruje input użytkownika dosłownie (jak w 909).
- W specu nie kopiuj audytu dosłownie — zakoduj jego wnioski jako FR-y z kryteriami akceptacji i odwołuj się do pliku audytu.

### Główny inwariant (ma rządzić całym specem)

**Zero zmian widocznych dla użytkownika:** schema konfiguracji (`CardConfig`), klucze i18n, rendering, UX i publiczne API pozostają bez zmian. Istniejące testy integracyjne (load coalescing, picker preview, lifecycle edytora, spójność tooltip/panel) są **złotym standardem zachowania** — muszą pozostać zielone bez zmiany oczekiwanych wartości.

## 1. User stories (priorytetyzowane, każda niezależnie testowalna — zgodnie z template)

### US1 (P1) — „A maintainer can fix and test the ready-state pipeline in one place" (rdzeń: TD-2)

Trzy niemal identyczne drogi budowania stanu ready (`_loadData` / `_buildDemoState` / `_firePickerRealDataQuery` w `src/card/cumulative-comparison-chart.ts`, łącznie ~250 linii zduplikowanej orkiestracji: `resolveTimeWindows → buildChartTimeline → tailLabelFromIndex → alignOffsetMs → unit scaling → computeSummary → computeForecast (+ łatanie unitów) → computeTextSummary → budowa CardState`) są źródłem **9 z 10 załatwionych bugów** w projekcie.

**Why this priority:** klasa bugów, która uderzyła 9-krotnie (forecast late-start, month-start panel, new-month first day, tooltip/reference, y-axis clipping, zero-reference), dostaje jedno miejsce do naprawy i testu; każda nowa funkcja przestaje duplikować orkiestrację.

**Independent Test:** ≥15 testów jednostkowych czystego `ReadyStateBuilder` (stany: ready, no-data, forecast-disabled, single-window + ścieżka preview) oraz istniejące testy integracyjne kart/pickera zielone bez żadnej zmiany UX.

**Acceptance Scenarios:**

1. **Given** trzy drogi ładowania z zduplikowaną orkestracją, **When** budowa stanu ready zostaje zunifikowana w jednym czystym builderze (`src/card/pipeline/ready-state-builder.ts`, zero Lit/DOM), **Then** każda droga to < 60 linii („załaduj serie → `buildReadyState(…)`") i nie ma zduplikowanej logiki pipeline'u.
2. **Given** regresja w logice pipeline'u (np. skalowanie jednostek, łatanie unitów forecast), **When** jest naprawiana w builderze, **Then** wszystkie trzy ścieżki (produkcja / demo picker / real-data upgrade picker) zachowują się identycznie, pokryte jednym zestawem testów.

### US2 (P2) — „A maintainer removes dead code and gets strict typing enforced by tooling" (quick wins: TD-1, TD-3, TD-4, TD-10, TD-13)

**Why this priority:** natychmiastowa wartość przy minimalnym ryzyku; włącza egzekucję rygorystycznego typowania narzędziem, na której opierają się późniejsze fale.

**Independent Test:** `npm ls date-fns` puste; 0 `as any` w karcie; ESLint z nowymi regułami zielony; jedna implementacja `formatPeriodLabel` z testami jednostkowymi; build produkcyjny bez `.map`; 1 kanoniczny changelog.

**Acceptance Scenarios:**

1. **Given** martwy `src/card/chart-renderer.ts` (428 linii, deprecjowany renderer Chart.js) i nieużywana produkcyjna zależność `date-fns`, **When** są usuwane (razem z aktualizacją `CARD_SOURCE_FILES` w `tests/unit/localize-static-text-guard.test.ts` i lockfile), **Then** typecheck/lint/testy zielone, w `dist/` zero śladów `ChartRenderer`, changelog z wpisem o usuniętej zależności.
2. **Given** 15 użyć `any` w `src/` i ESLint bez reguł typowych (tylko `no-unused-vars`), **When** włączane są `@typescript-eslint/no-explicit-any: error`, `no-non-null-assertion: warn`, `consistent-type-imports: error`, **Then** gate pozostaje zielony (gating względem TD-5 — patrz Edge Cases).
3. **Given** 3× `responses[i] as any` w karcie (odpowiedzi WebSocket LTS typu `unknown`) i ~12 `any` w `echarts-renderer.ts`, **When** dopisany zostaje typ `LtsMessageResponse` + adapter `extractLtsResults(response)` obsługujący obie obserwowane postacie odpowiedzi (`{ results }` i „goły" `results`), **Then** zero `as any` w `cumulative-comparison-chart.ts`, test adaptera dla obu kształtów, istniejące testy `ha-api.test.ts` zielone bez zmiany semantyki.
4. **Given** zdublowana logika etykiety okresu (1 stycznia → sam rok; inaczej `Intl` month-long+year) w `updated()` i `_buildRendererConfig()`, **When** zostaje zastąpiona jedną czystą funkcją `src/card/labels/period-label.ts` (`formatPeriodLabel(instant, locale, zone)`), **Then** 1 implementacja + testy jednostkowe (1.01, 31.12, strefy czasowe, 5 języków).
5. **Given** sourcemap produkcyjny (`dist/energy-horizon-card.js.map`, 3,86 MB) publikowany do `www/community/`, śledzony w git martwy `temp/`, komentarz roboczy „do usunięcia przed commit" w committed `constitution.md`, `jsx: "react-jsx"` w tsconfig bez JSX i trzy miejsca z notatkami wydawniczymi, **When** jest wdrażana higiena, **Then** build produkcyjny bez `.map` (dev/preview mapy zachowane), brak śledzonych plików temp, constitution bez komentarzy roboczych, 1 kanoniczny changelog (`changelog.md`), sekcja „Known simplifications: number format → locale mapping" w wiki Troubleshooting.

### US3 (P2) — „A maintainer gets state invariants enforced by the compiler" (TD-11, TD-5, TD-6)

**Why this priority:** eliminuje klasę błędów runtime — niepoprawny stan staje się nie-do-zapisania (naruszenie art. III/II).

**Independent Test:** discriminated union `CardState` kompiluje z niezmiennikami; 0× `any` w `echarts-renderer.ts`; flaga `noUncheckedIndexedAccess` ON z zielonym gate.

**Acceptance Scenarios:**

1. **Given** cztery pola preview w stałym modelu (`previewShift`, `previewSeries`, `previewWindows`, `previewChartTime`) + tranzyjny stan żyjący w trzech miejscach (pole elementu, stan, logika `updated()`) i niekorygowana unia `CardState.status`, **When** `CardState` staje się discriminated union `LoadingState | ErrorState | NoDataState | ReadyState` (gdzie `ReadyState` ma obowiązkowe `comparisonSeries`, `summary`, `forecast`, `period`, `resolvedWindows`, `chartTime` i opcjonalny `preview?: PreviewSnapshot`), **Then** niezmienniki są egzekwowane przez kompilator, 0 asercji `!` na polach stanu w `render()`/`updated()`, błąd „ready bez serii" jest niemożliwy do zapisu.
2. **Given** ~12 użyc `any` w budowaniu opcji ECharts (`series: any[]`, `markLineData: any[]`, `(series[i] as any).markLine = …`) przy zaimportowanym, ale niesużytym typie `EChartsOption`, **When** opcje są typowane `EChartsOption`/`LineSeriesOption` (serie budowane jako obiekty typowane przed `setOption`), **Then** 0× `any` w `echarts-renderer.ts`, testy renderera zielone.
3. **Given** 65 asercji non-null `]!` (ha-api: 20, karta: 16, picker: 9, echarts: 8) wynikających z braku `noUncheckedIndexedAccess`, **When** flaga zostaje włączona i asercje zastąpione jawnymi guardami z błędem lub helperem (np. `firstDefined(arr)`) albo poprawnym typowaniem, **Then** flaga ON, 0 (albo pojedyncze, uzasadnione i skomentowane) asercje non-null, testy zielone — i wychwytują każdy faktyczny off-by-one.

### US4 (P3) — „A maintainer reads and extends cohesive modules instead of a god file" (TD-7, TD-8, TD-9, TD-12)

**Why this priority:** długoterminowa czytelność i testowalność logiki biznesowej; zależy od US1/US3 (kolejność w planie).

**Independent Test:** `ha-api.ts` < 400 linii; narrative i view-model jako czyste funkcje z testami jednostkowymi; `render()` < 200 linii; `yaml-mode` testowane bez DOM; skorupa edytora < 1000 linii.

**Acceptance Scenarios:**

1. **Given** legacy API single-window (`buildLtsQuery`, `mapLtsResponseToSeries`, `buildComparisonPeriod`) używane wyłącznie przez 2 testy i moduł `ha-api.ts` (805 linii) mieszający 4 odpowiedzialności, **When** legacy API zostaje usunięte (golden-testy presetów przeniesione wcześniej na API multi-window — `buildMergedTimeWindowConfig` + `resolveTimeWindows`), a timeline (`buildChartTimeline`/`buildFullTimeline*`/`buildTimelineSlots`/`firstTailAxisLabelIndex`) przeniesiony do `src/card/timeline/`, **Then** `ha-api.ts` < 400 linii (query build + LTS mapping + `computeSummary`/`computeForecast`/`computeTextSummary`/`fullReferenceWindowRawTotal`), 0 zmian zachowania, brak importów legacy z `src/`.
2. **Given** logika biznesowa inline w `render()` (~600 linii): mapowanie `forecast.disabledReason` → klucz i18n (6-wartościowe) i 4-gałęziowa selekcja narracji (`interpretationSemantics.outcome`) zdefiniowana w specie domeny 903, **When** zostaje wydobycie do czystych funkcji w `src/card/narrative/` (`forecastDisabledReasonKey(reason)`, `resolveNarrativeSegment(outcome, neutralKind, language, entityKind)`), **Then** `render()` traci ~150 linii logiki, funkcje pokryte testami jednostkowymi (krawędzie: brak referencji, `insufficient_data`, neutral band/similar).
3. **Given** `render()` wyliczający captiony, formatowane liczby, `warningMessages`, bramkowanie panelu Forecast|Total, `effectiveTitle`/`effectiveIcon` inline, **When** wprowadzony zostaje czysty `buildCardViewModel(state, config, hass, localize) → CardViewModel`, **Then** `render()` = czysty template nad VM (docelowo < 200 linii), VM pokryty testami jednostkowymi (stany: ready/no-data/error/preview/single-window), `render()` bez wywołań `compute*`/`format*` domenowych poza destrukcją VM.
4. **Given** tryb YAML edytora (parse/emit/self-echo, 3 timery debounce) i przywracanie focusa/caret/scrolla mieszające się w skorupie `energy-horizon-card-editor.ts` (1375 linii) nad wzorcowym `FIELD_REGISTRY`, **When** kontroler trybu YAML zostaje wydzielony jako `src/card/editor/yaml-mode.ts` (mała maszyna stanów: text, parseError, lastEmitted, self-echo, debounce; API `parse(config) → {text?, error?}` / `commit(text) → {config?, error?}`), a focus/scroll przeniesiony do `editor-ui-state.ts` (rozszerzenie istniejącego modelu `EditorUiState` o `focusTarget`/`scrollTop`), **Then** skorupa < 1000 linii (render + routing zdarzeń), `yaml-mode` testowane bez DOM, testy lifecycle/coverage edytora zielone.

### US5 (P3, opcjonalna — Fala 4, wyłącznie po US1/TD-2) — „A maintainer extracts the picker (910) into a module" (TD-14)

**Why this priority:** opcjonalny dokończenie dekompozycji pliku-boga; picker staje się najprostszym konsumentem buildera.

**Independent Test:** element karty < 1200 linii; testy pickera zielone; semantyka 910 (jego FR-010/013/014) zachowana.

**Acceptance Scenarios:**

1. **Given** logika pickera (`_firePickerRealDataQuery`, `_buildDemoState`, `_pickerRealDataFired` + glue z `picker-preview.ts`) żyjąca w elemencie karty, **When** zostaje wydzielona do modułu `src/card/picker/` z jednym hookiem montowanym w elemencie (`attachPicker(element, config, onState)`), **Then** element < 1200 linii, testy pickera zielone, flagi `preview` zachowują semantykę 910.

## 2. Functional Requirements (numeracja do zachowania; odwołania TD-x = numeracja audytu)

- **FR-001 (TD-1):** System SHALL not contain dead code or unjustified production dependencies: usunąć `src/card/chart-renderer.ts` i `date-fns` z `dependencies` (`package.json`), zaktualizować `CARD_SOURCE_FILES` w `tests/unit/localize-static-text-guard.test.ts`, zaktualizować lockfile, przebudować `dist`. *Acceptance:* typecheck/lint/test zielone; `npm ls date-fns` puste; zero śladów `ChartRenderer` w `dist/`; changelog „Removed unused runtime dependency". (Konstytucja: V, Dodatki — uzasadnienie zależności, III.)
- **FR-002 (TD-2, PRIORYTET):** System SHALL build the ready state through a single pure pipeline: nowy moduł `src/card/pipeline/ready-state-builder.ts` (czyste funkcje, zero Lit/DOM) `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState` obejmujący `tailLabelFromIndex`, `alignOffsetMs`, skalowanie jednostek, `computeSummary`, `computeForecast`, łatanie unitów, `computeTextSummary`; `_applyUnitScalingToSeries` wydobycie do `src/utils/unit-scaler.ts` (czysta funkcja, `force_prefix` jako parametr); `_loadData`, `_buildDemoState`, `_firePickerRealDataQuery` → każda < 60 linii orkiestracji. *Acceptance:* 1 wywołanie buildera na drogę (zero zduplikowanej orkiestracji — weryfikacja w review); ≥15 testów jednostkowych buildera (wszystkie stany: ready, no-data, forecast-disabled, single-window + preview); testy integracyjne kart/pickera zielone bez zmian UX. (Konstytucja: V, III. Wymaga assess pre-flight — FR-017.)
- **FR-003 (TD-3):** System SHALL type LTS WebSocket responses: dopisać `LtsMessageResponse` (kształt `result`, uwzględniający obie obserwowane postacie: `{ results }` i „goły" `results`) + adapter `extractLtsResults(response)`; `mapLtsResponseToCumulativeSeries` przyjmuje typowany wejściowy; usunąć 3× `responses[i] as any`. *Acceptance:* 0 `as any` w `cumulative-comparison-chart.ts`; test adaptera dla obu kształtów; istniejące testy zielone bez zmiany semantyki. (Konstytucja: II, III.)
- **FR-004 (TD-4):** System SHALL enforce strict typing with the linter: w `config/eslint.config.js` `@typescript-eslint/no-explicit-any: "error"`, `no-non-null-assertion: "warn"`, `consistent-type-imports: "error"`. *Acceptance:* 0 błędów w `src/` przy zielonym gate (gating względem TD-5 — Edge Cases); warn-y non-null skatalogowane (usuwa TD-6). (Konstytucja: III — tym razem wymuszone narzędziem.)
- **FR-005 (TD-5):** System SHALL type ECharts options with the official types: w `echarts-renderer.ts` zastąpić lokalne `any[]` typami `LineSeriesOption`/`EChartsOption` (typ już zaimportowany na linii 7); serie budować jako obiekty typowane przed `setOption` (eliminacja `(series[i] as any).markLine = …`). *Acceptance:* 0× `any` w `echarts-renderer.ts`; testy renderera zielone. (Konstytucja: III.)
- **FR-006 (TD-6):** System SHALL enable `noUncheckedIndexedAccess` in `tsconfig.json` i poprawić 65 asercji `]!` (priorytet: `ha-api.ts` 20, karta 16, picker 9; pozostałe przez typowanie); tam gdzie kontrakt gwarantuje niepustość — jawny guard z błędem lub helper. *Acceptance:* flaga ON; 0 (albo pojedyncze, uzasadnione) asercje non-null; testy zielone. (Konstytucja: III.)
- **FR-007 (TD-7):** System SHALL slim `ha-api.ts` to a single-responsibility module: usunąć legacy `buildLtsQuery`/`mapLtsResponseToSeries`/`buildComparisonPeriod` (po wcześniejszym przeniesieniu golden-testów presetów na API multi-window), przenieść timeline do `src/card/timeline/`; `ha-api.ts` zostawia: query build + LTS mapping + `computeSummary`/`computeForecast`/`computeTextSummary`/`fullReferenceWindowRawTotal`. *Acceptance:* `ha-api.ts` < 400 linii; 0 zmian zachowania (cała bateria testów zielona); brak importów legacy z `src/`. (Konstytucja: III, V.)
- **FR-008 (TD-8):** System SHALL keep narrative logic as pure domain functions: `src/card/narrative/` z (a) `forecastDisabledReasonKey(reason)` (mapowanie 6-wartościowe), (b) `resolveNarrativeSegment(outcome, neutralKind, language, entityKind)` (4-gałęziowa selekcja → klucz + zmienne); `render()` jedynie formułuje i owija w Lit. *Acceptance:* testy jednostkowe obu funkcji (krawędzie: brak referencji, `insufficient_data`, neutral band/similar); `render()` traci ~150 linii logiki; spójność z domeną 903 (narrative engine w spec vs w kodzie). (Konstytucja: V, III.)
- **FR-009 (TD-9, zależy od TD-8 i TD-10):** System SHALL compute the render view-model as a pure function: `buildCardViewModel(state, config, hass, localize) → CardViewModel` (captiony, formatowane liczby summary/forecast, `warningMessages`, `narrativeBody`, bramkowanie panelu Forecast|Total, `effectiveTitle`/`effectiveIcon`); `render()` = czysty template nad VM. *Acceptance:* VM pokryta testami jednostkowymi (ready/no-data/error/preview/single-window); `render()` < 200 linii, bez wywołań `compute*`/`format*` domenowych poza destrukcją VM. (Konstytucja: V, III.)
- **FR-010 (TD-10):** System SHALL have a single source for the period label: czysta funkcja `src/card/labels/period-label.ts` (`formatPeriodLabel(instant, locale, zone)` — krawędź 1 stycznia → rok; inaczej month-long+year); zastąpić duplikaty w `updated()` i `_buildRendererConfig()`. *Acceptance:* 1 implementacja; testy jednostkowe (1.01, 31.12, strefy czasowe, 5 języków); testy kart zielone. (Konstytucja: V.)
- **FR-011 (TD-11):** System SHALL model card state as a discriminated union: `CardState = LoadingState | ErrorState | NoDataState | ReadyState`; `ReadyState` z obowiązkowym `comparisonSeries`, `summary`, `forecast`, `period`, `resolvedWindows`, `chartTime` i opcjonalnym `preview?: PreviewSnapshot` (`previewShift + previewSeries + previewWindows + previewChartTime`); usunąć `previewShift` z pól stanu (element pozostaje źródłem shiftu, snapshot w stanie służy `render()`). *Acceptance:* niezmienniki egzekwowane przez kompilator; 0 asercji `!` na polach stanu w `render()`/`updated()`; testy kart zielone. (Konstytucja: III, II. Wymaga assess pre-flight — FR-017; interakcja z FR-002 — Edge Cases.)
- **FR-012 (TD-12):** System SHALL extract the editor YAML mode into a controller: `src/card/editor/yaml-mode.ts` (maszyna stanów: text, parseError, lastEmitted, self-echo, debounce parse/emit; API `parse(config) → {text?, error?}` / `commit(text) → {config?, error?}`); przywracanie focus/scroll do `editor-ui-state.ts` (rozszerzenie `EditorUiState` o `focusTarget`/`scrollTop`); skorupa `energy-horizon-card-editor.ts` zostaje: render + routing zdarzeń. *Acceptance:* skorupa < 1000 linii; `yaml-mode` testowane bez DOM; testy lifecycle/coverage edytora zielone. (Konstytucja: III, V.)
- **FR-013 (TD-13):** System SHALL ship clean artifacts and consistent documentation governance: usunąć nagłówek roboczy („SYNC IMPACT REPORT … do usunięcia przed commit") z `constitution.md`; usunąć śledzony `temp/`; usunąć `jsx: "react-jsx"` z `tsconfig.json`; `sourcemap: false` w `config/vite.config.ts` dla artefaktu produkcyjnego (dev/preview — bez zmian); `changelog.md` jako jedyny kanoniczny changelog (zarchiwizować `release-notes-1.2.0.md` i `release-notes/`); dodać sekcję „Known simplifications: number format → locale mapping" do wiki Troubleshooting (zdokumentowanie istniejącego uproszczenia `numberFormatToLocale`). *Acceptance:* brak śledzonych plików temp; build bez `.map` (dist mniejszy o ~2,3 MB); 1 kanoniczny changelog; constitution bez komentarzy roboczych. (Konstytucja: II, Governance.)
- **FR-014 (TD-14, opcjonalny, Fala 4, wyłącznie po FR-002):** System SHALL extract the picker (910) into a module: `src/card/picker/` (`_firePickerRealDataQuery`, `_buildDemoState`, `_pickerRealDataFired` + glue z `picker-preview.ts`) z jednym hookiem `attachPicker(element, config, onState)` montowanym w elemencie. *Acceptance:* element < 1200 linii; testy pickera zielone; `preview` flagi zachowują semantykę 910 (FR-010/013/014 specu 910). (Konstytucja: Dodatki — funkcje zaawansowane nie komplikują podstawowego doświadczenia; w kodzie: nie komplikują też elementu.)
- **FR-015 (poprzeczny — dyscyplina PR):** Każde z 14 zadań SHALL być realizowane jako **osobny PR** + minimum 1 recenzja + wpis do changelogu + testy (nowe testy jednostkowe dla każdej wydobywanej czystej funkcji — faza 3–4 drastycznie podnosi pokrycie logiki biznesowej testami jednostkowymi zamiast DOM). (Konstytucja: Workflow rozwojowy i jakość.)
- **FR-016 (poprzeczny — dokumentacja domenowa):** Zadania zmieniające prawdę domenową SHALL aktualizować w tym samym PR odpowiedni `spec.md` domeny (900–907) — domeny są zadeklarowanym „jedynym źródłem prawdy" (`specs/README.md`). Mapowanie: FR-002 → 901+903; FR-003 → 901; FR-007 → 900+901; FR-001/FR-005 → 902; FR-008/FR-009/FR-011/FR-014 → 903; FR-010 → 905; FR-012 → 904; FR-013 → 907. (FR-004/FR-006 — wyłącznie konfiguracja, bez specu domenowego.)
- **FR-017 (poprzeczny — assess pre-flight):** Przed rozpoczęciem Fali 2 SHALL zostać wykonane krótkie assessmenty (pipeline assess: intake→research→define→shape→decide) dla FR-002 i FR-011 w `.specify/assessments/` — precedens: `timewindow-preview` przed feature 909. Wyniki (opcje, niezmienniki, ryzyka, decyzje o kolejności) SHALL trafić do `plan.md`.
- **FR-018 (poprzeczny — bramy fal):** Po każdej z 4 fal SHALL przejść pełny gate `npm test && npm run typecheck && npm run lint && npm run build` + aktualizacja `dist/` (CI `verify-dist`) + `speckit.converge` jako kontrola driftu (ocena kodu vs spec/plan/tasks; ostatni converge = gate wyjściowy programu).
- **FR-019 (poprzeczny — inwariant):** Wszystkie zadania SHALL zachowywać zero zmian widocznych dla użytkownika (schema `CardConfig`, klucze i18n, rendering, UX bez zmian; testy integracyjne jako złoty standard — bez zmiany oczekiwanych wartości; `wiki-publish/` bez zmian poza FR-013).

## 3. Key Entities

- **ReadyStateBuilder** — czysta funkcja `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState` (`src/card/pipeline/ready-state-builder.ts`); jedyny konsument: 3 drogi ładowania.
- **CardState** (nowy kształt) — discriminated union `LoadingState | ErrorState | NoDataState | ReadyState`; `ReadyState`: obowiązkowe `comparisonSeries`, `summary`, `forecast`, `period`, `resolvedWindows`, `chartTime`; opcjonalne `preview?: PreviewSnapshot`.
- **PreviewSnapshot** — `{ previewShift, previewSeries, previewWindows, previewChartTime }` (tranzyjny stan 909 w jednym obiekcie).
- **LtsMessageResponse** / **extractLtsResults** — typ + adapter odpowiedzi WebSocket LTS (obie obserwowane postacie `result`).
- **CardViewModel** — wynik `buildCardViewModel(state, config, hass, localize)`: captiony, liczby, warningi, narrative, bramki paneli, tytuł/ikonę.
- **formatPeriodLabel** — czysta funkcja etykiety okresu (`src/card/labels/period-label.ts`).
- **timeline module** — `src/card/timeline/`: `buildChartTimeline`, `buildFullTimeline*`, `buildTimelineSlots`, `firstTailAxisLabelIndex`.
- **yaml-mode controller** — `src/card/editor/yaml-mode.ts`: maszyna stanów trybu YAML edytora.
- **unit-scaler** — `src/utils/unit-scaler.ts`: wchłania `_applyUnitScalingToSeries` (`force_prefix` jako parametr).

## 4. Success Criteria (mierzalne)

1. **0× `any`** w `src/`; ESLint `no-explicit-any: error` przechodzi bez wyjątków.
2. `noUncheckedIndexedAccess: true`; 0 (lub pojedyncze, uzasadnione i skomentowane) asercje non-null.
3. `ha-api.ts` < 400 linii; każda z 3 dróg ładowania < 60 linii orkiestracji; po TD-14 element karty < 1200 linii.
4. `package.json` bez `date-fns`; `chart-renderer.ts` nie istnieje; `dist/` bez `.map` i bez śladów `ChartRenderer`.
5. 1 kanoniczny changelog; brak śledzonych plików `temp/`; constitution bez komentarzy roboczych.
6. ≥15 testów jednostkowych buildera; testy jednostkowe VM, narrative, `period-label`, `yaml-mode`, adaptera LTS.
7. Po każdym PR i po każdej fali: `npm test && npm run typecheck && npm run lint && npm run build` zielone + CI `verify-dist` zielone.
8. **0 pozostałych naruszeń** z tabeli naruszeń audytu (raport §3).
9. Realizacja w 4 falach (milestone'y): **W1:** TD-1, TD-3, TD-4, TD-10, TD-13 (1–2 dni) — balast, egzekucja typów, jedna etykieta, higiena; **W2:** TD-2 (priorytet), TD-7, TD-11 (~1 tydzień) — unifikacja pipeline'u, czyste moduły danych, niezmienniki w typach; **W3:** TD-5, TD-6, TD-8, TD-9, TD-12 (~1 tydzień) — zero `any`/`!`, narrative i render jako czyste funkcje; **W4 (opcjonalny, po TD-2):** TD-14 (kilka dni) — element < 1200 linii, picker jako moduł.

## 5. Edge Cases

1. **`dist/` jest committed** — każdy PR dotykający kodu przebudowuje `dist/` (CI `verify-dist` porównuje i odrzuca niesynchronizowany).
2. **TD-1:** usunięcie pliku wymaga aktualizacji `CARD_SOURCE_FILES` w `tests/unit/localize-static-text-guard.test.ts` (lista plików skanowanych przez static-text guard).
3. **TD-7:** golden-testy presetów (`time-windows-presets-golden.test.ts`, `ha-api.test.ts`) muszą być przeniesione na API multi-window (`buildMergedTimeWindowConfig` + `resolveTimeWindows`) **przed** usunięciem legacy API.
4. **TD-3:** adapter `extractLtsResults` musi obsługiwać obie obserwowane postacie odpowiedzi LTS (`{ results }` i „goły" `results`).
5. **TD-4 ↔ TD-5 (gating):** `no-explicit-any: error` nie może zostawić gate'a czerwonego — decyzja w planie: (a) tymczasowy scoped `eslint-disable` dla `echarts-renderer.ts` z odwołaniem do TD-5 (usuwany w TD-5), albo (b) przejęcie TD-5 do Fali 1.
6. **TD-2 ↔ TD-11 (interakcja):** output buildera to `CardState` — oba zadania się sprzęgają; muszą leżeć w tej samej fali (W2) z udokumentowaną, jawna kolejnością (decyzja planu, po assess z FR-017), aby uniknąć pośredniego stanu w którym builder produkuje stary kształt stanu.
7. **TD-14:** semantyka 910 (FR-010/013/014 specu 910, flagi `preview`) musi być zachowana 1:1.
8. **TD-9** zależy od ukończenia TD-8 i TD-10 (view-model konsumuje narrative i period label).
9. **TD-13:** sourcemap wyłączony wyłącznie dla artefaktu produkcyjnego — dev/preview zachowują mapy; wiki Troubleshooting dostaje notatkę o uproszczeniu `numberFormatToLocale` (użytkownik z `en-GB` i przecinkiem dostanie format `de` — znane, udokumentowane).
10. **Builder:** wszystkie stany karty (ready / no-data / error / single-window / preview / forecast-disabled) muszą przechodzić przez jeden builder — w tym ścieżki „brak danych" i „forecast wyłączony" (nie tylko happy path).

## 6. Assumptions

1. `luxon` pozostaje jedyną biblioteką dat (37 użyć produkcyjnych); `date-fns` ma zero użyć (zweryfikowane: nie trafia do bundle'a).
2. Tree-shaking ECharts (`echarts/core` + tylko używane komponenty: Line, Grid, Tooltip, Legend, MarkLine, MarkPoint, Canvas) pozostaje bez zmian.
3. Publiczna schema `CardConfig` i klucze i18n są bez zmian.
4. Testy integracyjne (load coalescing, picker preview, lifecycle edytora, spójność tooltip/panel) są złotym standardem zachowania i nie są modyfikowane.
5. Brak nowych zależności NPM (jedyna zmiana: usunięcie `date-fns`).
6. Mechanizmy z listy „nie ruszać" (audyt §5) pozostają: wzorzec Registry w edytorze (908), mechanizm generacji ładów (`_loadGeneration`/`_inFlightGeneration`), czysty rdzeń `src/card/time-windows/`, autorski `src/ha-types.ts`.
7. Numeracja feature: 911 = globalny max (910) + 1, tryb sekwencyjny (`init-options.json`, `create-new-feature.sh`).

## 7. Out of Scope (w tym lista „nie ruszać")

1. Jakakolwiek zmiana widoczna dla użytkownika: zachowanie, UX, schema konfiguracji, klucze i18n, wygląd karty.
2. Nowe funkcje produktowe (w tym rozbudowa preview 909 — np. zmiana rozmiaru okna w preview).
3. Prace wydajnościowe — istniejące mechanizmy (`lastHash`, load coalescing, point cap, auto-agregacja) są wystarczające.
4. Upgrade'y zależności inne niż usunięcie `date-fns`.
5. Treści `wiki-publish/` — poza notatką z FR-013 (Troubleshooting).
6. Przepisywanie speców 908–910 (semantyka 910 jest zachowywana, nie przepisana).
7. Refaktoryzacja: wzorca Registry, mechanizmu generacji ładów, rdzenia `time-windows/`, `ha-types.ts`.
8. Workflow bug triad (`.specify/bugs/`) — to program długu technicznego, nie usterka; assessment jako kontrakt fixu nie ma tu zastosowania.
9. Zmiany procesu speckit (skrypty, templates, rozszerzenia) — program korzysta z istniejącego procesu.

## 8. Wskazówki proceduralne dla etapów specify → plan → tasks

- Utwórz feature standardowym skryptem (numeracja sekwencyjna): katalog `specs/911-tech-debt-reduction/`, gałąź `911-tech-debt-reduction`.
- Ciało `spec.md` po angielsku (konwencja 900–910); pole `Input` rejestruje input dosłownie.
- Nie duplikuj audytu w specu — referencjonuj `architecture-audit-2026-11-15.md`; w etapie `plan` dołącz audyt jako `research.md`.
- Zachowaj numerację FR-001…FR-019 z odwołaniami TD-x (ścieżkowość z audytem).
- W etapie `plan`: plan **musi** zawierać decyzje: (a) gating FR-004↔FR-005, (b) kolejność FR-002/FR-011 (po assess z FR-017), (c) milestone'y 4 fal z bramami z FR-018.
- W etapie `tasks` (`speckit.tasks`): 14 zadań pogrupowanych w 4 fazy (= fale), każde zadanie oznaczone „own PR", z kryteriami akceptacji z FR oraz — zgodnie z FR-016 — linijką aktualizacji specu domenowego tam, gdzie zadanie zmienia prawdę domenową.

## 9. Glossary

- **LTS** — long-term statistics; serwis WebSocket `long_term_statistics` HA, źródło danych historycznych karty.
- **Ready state** — stan karty po udanym załadowaniu danych (gotowość do renderingu wykresu).
- **Builder** — czysta funkcja unifikująca budowę ready state (`ReadyStateBuilder`).
- **Fala (wave)** — kamień milowy planu realizacji: grupa zadań kończąca się pełnym gate i `speckit.converge`.
- **Plik-bóg (god file)** — plik z wieloma odpowiedzialnościami; tu: `src/card/cumulative-comparison-chart.ts` (1856 linii).
- **Golden test** — test kodujący oczekiwane zachowanie, niemodyfikowalny w ramach programu (bazowy standard „zero zmian").
- **Domena (900–907)** — obszary tematyczne w `specs/`, których `spec.md` jest „jedynym źródłem prawdy" dla danego obszaru.

--- KONIEC PROMPTU ---
