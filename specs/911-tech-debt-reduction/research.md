# Research: Tech-Debt Reduction Program (911)

> **Phase 0 attachment.** §1–§5 below is the architecture audit of 2026-11-15, attached verbatim as the program's requirements evidence (see `architecture-audit-2026-11-15.md` in the repo root). §6–§7 were added by `/speckit.plan` (2026-11-16): open unknowns, the plan decisions D1–D4 delegated by the spec, and the FR-017 assess pre-flight summary.

---

## 6. Phase 0 — Open unknowns and plan decisions

### Open unknowns (Technical Context)

**None.** The Technical Context in `plan.md` contains zero NEEDS CLARIFICATION markers — the toolchain (TypeScript 5.6 strict, Lit 3, ECharts 5.6, luxon, Vitest), the project shape (single-file HA card, functional core / imperative shell), and the scale (src 50 files / ~11.2k LOC) were all verified against `package.json`, `tsconfig.json`, and the source tree on 2026-11-16. No `/speckit.clarify` round is required (also recorded in `checklists/requirements.md`).

### Plan decisions delegated by the spec

The spec defers three decisions to the plan stage (recorded in `checklists/requirements.md` Notes): the FR-004↔FR-005 lint gating (edge case 5), the FR-002/FR-011 same-wave ordering (edge case 6), and the 4-wave milestones with gates (SC-009). A fourth decision (working branch / PR workflow) was added by user directive on 2026-11-16.

**D1 — FR-004 ↔ FR-005 lint gating (edge case 5)**

- **Decision**: Option (a) — in TD-4 (W1) the ESLint rule set lands as `no-explicit-any: error`, `no-non-null-assertion: warn`, `consistent-type-imports: error`; `echarts-renderer.ts` receives a **temporary scoped `eslint-disable`** for `no-explicit-any` only, with a comment referencing TD-5. The disable is **removed in TD-5 (W3)** when the file is fully typed (`EChartsOption` / `LineSeriesOption`).
- **Rationale**: TD-3 (W1) removes all `any` from the card element; after W1 the only remaining explicit `any`s in `src/` live in `echarts-renderer.ts` (the ECharts option objects). Pulling TD-5 into W1 would bloat the quick-win wave (1–2 days by definition) with the largest typing task of the program; leaving the gate red would violate the FR-018 wave gate. A one-file, traceable, mechanically-removed disable keeps every wave gate green while preserving the SC-001 end state (0× `any`).
- **Alternatives considered**: (b) pull TD-5 into W1 — rejected: breaks the W1 scope/effort definition and delays the quick wins; (c) land `no-explicit-any` as `warn` in W1 and tighten in W3 — rejected: the spec (FR-004) names `error` as the end state and a warn-phase adds a second gate change for no benefit; (d) land `no-explicit-any: error` with an `ignores` entry in the ESLint config — rejected: file-level ignores in the config are less discoverable than the in-file disable with the TD-5 reference, and they survive if TD-5 slips.

**D2 — FR-002 / FR-011 ordering within Wave 2 (edge case 6)**

- **Decision**: **TD-2 (ReadyStateBuilder) first, then TD-11 (CardState union)**, both in W2; TD-11 must not start until TD-2 is merged. After TD-2 there is a single ready-state production point (the builder), so TD-11 reshapes the type at one assembly site + consumers instead of two hand-rolled assemblies. The intermediate state after TD-2 is green and no worse than today (same flat `CardState`, one producer).
- **Rationale**: the builder's output *is* `CardState` — the two tasks are coupled (spec edge case 6). Collapsing the 3 duplicated paths into 1 production point *before* the reshape minimizes TD-11's diff and its regression surface, which is exactly where 9 of the last 10 historical bugs lived (audit §2). Confirmed by the FR-017 assess pre-flight (see §7): both assessments independently reach the same ordering.
- **Alternatives considered**: (b) TD-11 first — rejected: the ready-shape change would have to be applied by hand at two assembly sites (demo + production) and then moved again when the builder lands; doubles the risk in the bug-prone area; (c) both in one PR — rejected: FR-015 mandates 1 task = 1 PR, and a combined PR would be unreviewable (L + M effort, wide consumer diff).
- **Gate**: per the spec, the FR-017 assess pre-flight must confirm this ordering before the first W2 PR. It is confirmed (see §7). If a future re-assessment overturns it, `plan.md` is updated before that PR.

**D3 — 4-wave milestones with gates (SC-009)**

- **Decision**: W1 = TD-1, TD-3, TD-4, TD-10, TD-13 (1–2 days); W2 = TD-2 (priority), TD-7, TD-11 — order TD-2→TD-7→TD-11 per D2 (after the FR-017 assess) (~1 week); W3 = TD-5, TD-6, TD-8, TD-9, TD-12 (~1 week); W4 = TD-14 (optional, only after W2) (a few days). Every wave ends with the FR-018 gate: full gate `npm test && npm run typecheck && npm run lint && npm run build` + committed `dist/` rebuild (CI `verify-dist`) + `speckit.converge` drift check; the final converge is the program's exit gate (SC-008).
- **Rationale**: risk-ascending order. W1 = cheap wins + tooling enforcement that gates everything else (lint rules catch regressions from W2–W4; the single label source and hygiene land while the codebase is small-diff). W2 = the highest-value structural unification (audit's priority) at the heart of the bug-prone area, with the state invariants landing in the same wave so the unified pipeline is immediately typed. W3 = readability + the last typing tasks (TD-5 removes the D1 disable; TD-6's `noUncheckedIndexedAccess` lands when `any`/`!` are already gone). W4 = the optional picker extraction, only after the builder it consumes exists.
- **Alternatives considered**: (b) alphabetical/by-TD-number waves — rejected: ignores dependencies (TD-14 needs TD-2; TD-5 needs the D1 disable removed at its own landing; TD-6 needs TD-3/TD-4 done first); (c) 2 larger waves — rejected: the spec names 4 waves as milestones (SC-009) and 14 reviewable PRs need gate checkpoints between them; (d) TD-14 mandatory — rejected: the spec marks it optional (P3 story US5).

**D4 — Working branch & PR workflow**

- **Decision**: all refactoring changes (spec, plan, 14 TD tasks) live on the dedicated branch **`911-tech-debt-reduction`** (created 2026-11-16 from `chore/spec-kit-opencode`, which carries the completed 910 that TD-14 depends on). Each TD = its own PR to `main` with ≥ 1 review + changelog entry + tests (FR-015). The `gh` CLI is not available in the agent environment — the agent pushes task branches; PR creation and review are performed manually by the maintainer on GitHub.
- **Rationale**: user directive 2026-11-16 ("wszystkie zmiany związane z refactoringiem zrób na osobnym branchu"); isolates the program from the in-flight work branch. 910's code is the base for TD-14's do-not-touch semantics (spec 910 FR-010/013/014), so the branch must sit on top of it.
- **Alternatives considered**: (b) working directly on `main` — rejected (user directive); (c) a fresh branch from `main` without 910 — rejected: TD-14 would have to rebase over in-flight 910 work and its semantics contract (910 spec) is already merged on the 910 line.

---

## 7. FR-017 assess pre-flight (results feeding plan.md)

Performed 2026-11-16, before Wave 2 (spec FR-017: short assess pipeline intake→research→define→shape→decide; precedent: `.specify/assessments/timewindow-preview/` for 909). Two assessments, one per spec requirement, each with the full 5-stage pipeline:

| Assessment | Subject | Verdict | Chosen option |
|---|---|---|---|
| `.specify/assessments/ready-state-builder/` | FR-002 (TD-2) — single ready-state pipeline | **go** | Option A — pure `src/card/pipeline/ready-state-builder.ts` + `applyUnitScalingToSeries` extracted to `src/utils/unit-scaler.ts` (`force_prefix` as parameter) |
| `.specify/assessments/cardstate-union/` | FR-011 (TD-11) — CardState discriminated union | **go** | Option A — union on the existing `status` discriminant; `ReadyState` requires `comparisonSeries`, `summary`, `forecast`, `textSummary`, `period`, `resolvedWindows`, `mergedTimeWindow`, `chartTime`; `preview?: PreviewSnapshot`; `ErrorState.errorMessage` required; `previewShift` removed from state |

**Key results carried into `plan.md` / `data-model.md`:**

1. **Ordering (edge case 6): confirmed** — TD-2 first, TD-11 second, both W2; TD-11 blocked until TD-2 merges (plan decision D2). Both assessments reached the same conclusion independently.
2. **`data-model.md` §1 finalized**: `textSummary` and `mergedTimeWindow` are **required** on `ReadyState` (verified present at all ready assembly sites — demo `_buildDemoState` :327/:334/:337 and production `_loadData` tail :818/:919/:922); `ErrorState.errorMessage: string` **required** (all 5 error sites set it).
3. **`previewShift` removal is behaviorally equivalent**: the `updated()` preview-branch gate redirects from the state copy to the element field; in every interleaving the branch's effective enablers are the preview data in state, which only arrives from a load matching the current field. Golden picker/preview integration tests are the final word (risk R2 in the assessment).
4. **Builder risks pinned**: R1 behavioral drift between the three paths (mitigation: per-path characterization tests *before* moving logic); R2 `opts` flag explosion (> 4 flags → revisit); R3 the point-cap error path stays an element-shell concern with an identical user-visible error state.
5. **TD-11 migration risks pinned**: R1 a `?? fallback` may be removed only where the compiler proves presence and only as a no-op; R3 test-literal churn is construction-only — no expected-value edits permitted (FR-019).

---

# Audyt architektury — Energy Horizon Card (2026-11-15)

Diagnostyka architektury projektu wykonana na podstawie:

- **grupu Codegraph** (`.codegraph/codegraph.db`): 1401+ symboli, 2121 krawędzi `calls`, 753 `imports`, 0 cykli importów;
- **raportu graphify** (`graphify-out/GRAPH_REPORT.md`): 108 społeczności, kohesje, god nodes, hyperedge'y;
- **przeglądu kodu źródłowego** (`src/` — 50 plików, 11 195 linii TS; `tests/` — 64 pliki, 15 165 linii);
- **Konstytucji projektu** (`.specify/memory/constitution.md` v1.2.0) jako kryterium zgodności.

---

## 1. Podsumowanie

Projekt jest **dobrze zorganizowaną, dojrzewającą kartą Lovelace** z wyraźną warstwą domenową, silną kulturą testową i zinstytucjonalizowanym procesem zarządzania błędami (9 tryad bug assess→fix→test). Największym ryzykiem strukturalnym jest **„plik-bóg" elementu karty** (`cumulative-comparison-chart.ts`, 1856 linii), który miesza komponent, pipeline danych, skalowanie jednostek i logikę prezentacji, oraz **trzy niemal identyczne drogi budowania stanu ready** (produkcja / demo picker / real-data upgrade picker) — dokładnie to miejsce, w którym pojawiło się 9 z 10 załatwionych bugów.

Do tego dochodzi **niedokończona migracja Chart.js → ECharts** (martwy `chart-renderer.ts` + nieużywana produkcyjna zależność `date-fns`), **15 użyć `any`**, **65 asercji non-null** oraz logika biznesowa wyliczana inline w `render()`.

Wynik ogólny: **architektura zgodna z konstytucją w ~80%**; główne naruszenia dotyczą art. III (rygorystyczne typowanie / unikanie `any`), art. V (prostota, uzasadnione zależności) i „Dodatkowych wymagań" (uzasadnienie zależności NPM).

---

## 2. Mocne strony

### S1. Warstwowanie domenowe zgodne ze specyfikacjami 900–907

Struktura `src/` odpowiada 1:1 domenom ze `specs/README.md`, a kierunek zależności jest jednokierunkowy (UI → pipeline → core), **bez żadnych cykli importów** (graphify: „Import Cycles: None detected"):

```
UI (Lit)                     src/card/cumulative-comparison-chart.ts
                             src/card/energy-horizon-card-editor.ts
   │
   ├─ renderer / osie        src/card/echarts-renderer.ts, src/card/axis/*
   ├─ prezentacja / i18n     src/card/labels/*, src/card/narrative/*, src/card/localize.ts
   ├─ pipeline danych        src/card/ha-api.ts, src/card/time-windows/*
   └─ rdzeń czysty (funkcje) src/utils/unit-scaler.ts, src/card/time-windows/presets|merge|validate…
```

- `src/card/time-windows/` (9 plików) to **czysty rdzeń funkcyjny** (prezenty, merge, resolve, walidacja, hard limits, parse offset/duration) — zero Lit/DOM, w pełni testowalny (10 plików testów).
- `src/card/ha-api.ts` — pipeline LTS (zapytania, mapowanie, agregacje, forecast) oddzielony od UI.
- `src/card/editor/` — logika edytora (config-merge, config-normalize, field-registry, ui-state, preset-switch, yaml-safe) wydzielona ze „skorupy" Lit.

**Wzorzec:** warstwowa architektura / Clean Architecture w wydaniu frontendowym; rdzeń jako czyste funkcje (Functional Core / Imperative Shell).

### S2. Edytor jako data-driven UI (Registry Pattern)

Edytor 908 to cienka skorupa Lit sterowana w pełni deklaratywnym `FIELD_REGISTRY` (`FieldDescriptor` + `ControlSpec` + sekcje + `visibleWhen`/`disabledWhen` + emit policy). Dodanie pola = dodanie danych, nie kodu. Kontrakt render loop jest zdokumentowany (`contracts/field-registry.md`, spec 908). `preservativeMerge` + bramka emit (debounced dla tekstu/liczb, immediate dla dyskretnych) to świadoma, opisana decyzja o zarządzaniu stanem. To najlepszy wzorzec w projekcie i wzór do naśladowania przy refaktoryzacjach.

### S3. Programowanie defensywne (art. II konstytucji) — rzeczywiście wdrożone

- `safeParseYaml` — wejście YAML traktowane jako nieufne (rygorystyczny parse + sanityzacja).
- `_loadGeneration` / `_inFlightGeneration` — dojrzała ochrona przed wyścigami starzonych ładów (stale load discard), pokryta testem integracyjnym (`load-coalescing.test.ts`) i tryadą `.specify/bugs/duplicate-concurrent-loads`.
- `assertLtsHardLimits` + `assertPointCountWithinCap`/`PointCapExceededError` — jawne limity zapytań LTS i liczby punktów (ochrona wydajności, czytelny błąd).
- `_localizeOrError` — brak klucza tłumaczenia nie crashuje karty; przejście w stan error.
- `normalizeForLoad`/`normalizeForSave`/`hasConfigDelta`/`deepEqual` — idempotentność kontraktu konfiguracji (self-echo detection w edytorze).
- `getEntitySuggestion` — synchroniczna, totalna, nie rzucająca (kontrakt R1, „throwing cards are dropped by the picker").
- Guardy w `computeForecast` (5 strażników z `disabledReason` — 6-wartościowa unia) i `computeSummary` (brak encji, puste serie, referencja zerowa).

### S4. Typowanie i i18n (art. III) — solidna baza

- `strict: true`; autorski, cienki kontrakt typów HA (`src/ha-types.ts`) zamiast zależności od paczki frontendu HA — świadoma decyzja anti „vendor lock-in", zgodna z konstytucją.
- Jedno zjednoczone silne i18n: `localize.ts` + `translations/*.json` (5 języków), fallback `en`, guard-testy (`localize-static-text-guard`, `narrative-mandatory-keys`, `localize-has-translation-key`).
- God nodes grafu to sensowne abstrakcje: `EnergyHorizonCardEditor` (70 krawędzi), `CardConfig` (40), `HomeAssistant` (36), `EnergyHorizonCard` (27) — nie ma „god node'ów" infrastrukturalnych; graf jest zdrowy.

### S5. Kultura testów i CI

- 64 pliki testów (15,2 tys. linii), jednostkowe + integracyjne (load coalescing, lifecycle edytora, picker preview, spójność tooltip/panel).
- Testy golden dla presetów, guard-testy kluczy i18n, testy degradacji edytora, testy dostępności.
- CI: `test` + `typecheck` + `lint` + `verify-dist` (dist zawsze zsynchronizowany ze źródłem) — zgodne z „Workflowem rozwojowym i jakością" konstytucji.

### S6. Wydajność (art. V)

- `lastHash` w `EChartsRenderer.update()` — pominięcie re-renderu wykresu przy niezmienionych danych (aktualizacje `hass` 1–10×/s nie generują re-renderów wykresu).
- Load coalescing (generacje) — aktualizacje `hass` w trakcie ładowania nie wywołują ponownego ładowania.
- Point cap na osi czasu + auto-agregacja (`pickAutoAggregation`).
- ECharts z **tree-shakingiem** (`echarts/core` + tylko używane komponenty: Line, Grid, Tooltip, Legend, MarkLine, MarkPoint, Canvas) — bundle 1,17 MB dla pełnofunkcyjnej karty.
- Picker 910: deterministyczny demo-first (brak białego stanu w ścieżce krytycznej) + czasowo ograniczone zapytanie o dane realne.

### S7. Zinstytucjonalizowana redukcja długu (Governance)

Proces assess→fix→test (9 tryad w `.specify/bugs/`) z assessmentem traktowanym jako kontrakt dla fixa i testu, plus pipeline ocen pomysłów (`.specify/assessments/`). To rzadkość i realna przewaga projektu — poniższe taski TD-x wpisują się w ten sam proces.

---

## 3. Słabe strony, sprzeczności i naruszenia konstytucji

### W1. „Plik-bóg" `cumulative-comparison-chart.ts` (1856 linii) — największy dług strukturalny

Plik jednocześnie jest: komponentem Lit, pipeline'em danych (`_loadData` — ok. 290 linii), skalowaniem jednostek (`_applyUnitScalingToSeries` — ok. 95 linii), budowniczym demo (`_buildDemoState`), logiką pickera (`_firePickerRealDataQuery`) **i** eksportuje czyste funkcje prezentacyjne na poziomie modułu (`formatSigned`, `textSummaryNarrativeWithEmphasis`, `isForecastLineVisible`, `clampOpacity`).

- **Wzorzec naruszony:** SRP, modularity (art. III: „modularny, czytelny"); art. V: „preferujemy proste, zrozumiałe rozwiązania".
- **Konsekwencja:** funkcja 910 (picker) „zanieczyściła" element trzecią drogą ładowania (W2); każdy nowy cross-cutting (np. 909 preview) rośnie w elemencie.
- **Sygnał z grafu:** codegraph 65 węzłów w pliku, ale rozłożonych na 5–6 odpowiedzialności; graphify dzieli ten obszar na kilka społeczności o średniej kohesji (0,14–0,24) — spójny obraz „wielu modułów w jednym pliku".

### W2. Trzy niemal identyczne drogi budowania stanu ready (duplikacja pipeline'u)

`_loadData()` (dane realne), `_buildDemoState()` (demo picker), `_firePickerRealDataQuery()` (upgrade picker na dane realne) — każda powtarza tę samą orkiestrację:

```
resolveTimeWindows → buildChartTimeline → tailLabelFromIndex → alignOffsetMs
→ _applyUnitScalingToSeries → computeSummary → computeForecast (+ łatanie unitów)
→ computeTextSummary → budowa CardState
```

to ok. 250 linii zduplikowanej orkiestracji. **Właśnie ta klasa kodu była źródłem 9 z 10 załatwionych bugów** (forecast late-start, month-start panel, new-month first day, tooltip/reference, y-axis clipping, zero-reference…). Każda poprawka wymaga dotknięcia 2–3 miejsc; każda nowa funkcja (np. 910) duplikuje orkiestrację po raz kolejny.

- **Wzorzec do zastosowania:** jeden czysty `ReadyStateBuilder` (Builder / Pipeline-as-pure-function), z którego korzystają wszystkie trzy drogi.

### W3. Niedokończona migracja Chart.js → ECharts: martwy kod + bezużyteczna zależność

- `src/card/chart-renderer.ts` (428 linii, 23 symbole) — deprecjowany renderer Chart.js z `declare const Chart: any` i komentarzem „Do not use ChartRenderer - use EChartsRenderer instead", wciąż obecny w `src/` (objęty lint/typecheck, wymieniony w liście plików testu static-text-guard).
- `date-fns@^4.1.0` figuruje w `dependencies` (zależność **produkcyjna**), choć jedyny ślad to skomentowany import `chartjs-adapter-date-fns` w martwym pliku. Zweryfikowano: **ani `date-fns`, ani `ChartRenderer` nie trafiają do bundle'a dist** — to czysty balast.
- **Naruszenia konstytucji:** art. V (prostota), „Dodatkowe wymagania" (każda zależność NPM musi być uzasadniona i nie duplikować funkcjonalności istniejącej — `date-fns` duplikuje `luxon`, który faktycznie używany jest w 37 miejscach), art. III (unikanie `any`).
- Ryzyko: wprowadzanie w błąd maintainerów (dwie biblioteki dat), wydłużanie lint/typecheck, fałszywy sygnał o zależnościach projektu.

### W4. Luki w rygorystycznym typowaniu (art. III: „unikanie any")

- **15 użyć `any` w `src/`:**
  - `cumulative-comparison-chart.ts`: 3× `responses[i] as any` (odpowiedzi WebSocket `sendMessagePromise` mają typ `unknown`; `mapLtsResponseToCumulativeSeries` już przyjmuje kształt `LtsStatisticsResponse | { result?: … }` — cast to uniknięcie dopisania właściwego typu odpowiedzi);
  - `echarts-renderer.ts`: ~12 (lokalne `series: any[]`, `markLineData: any[]`, `(series[i] as any).markLine = …`) — **przy zaimportowanym typie `EChartsOption` (linia 7)**, którego nie stosuje się do zmiennych lokalnych.
- **65 asercji non-null `]!`** (ha-api: 20, karta: 16, picker: 9, echarts: 8) — objaw braku `noUncheckedIndexedAccess` w `tsconfig.json`; kod „wie" z kontraktu, że indeks istnieje, ale typowanie tego nie wymusza.
- **ESLint bez reguł typowych**: w `config/eslint.config.js` jest tylko `no-unused-vars` — obietnica „unikania `any`" nie jest egzekwowana narzędziem.
- Drobiazg: `tsconfig.json` zawiera `jsx: "react-jsx"` w projekcie bez JSX (resztki template'u) — mylące.

### W5. Rozrośnięty `CardState` — stan tranzyjny zmieszany z modelem danych

Cztery pola preview (909) w stałym modelu: `previewShift`, `previewSeries`, `previewWindows`, `previewChartTime` + osobno pole elementu `previewShift` i flaga `_previewLoading` — **ten sam tranzyjny stan żyje w trzech miejscach** (pole elementu, stan, logika `updated()`). Unia `CardState.status` nie jest skorygowana (discriminated union): niezmiennik „pola preview tylko gdy `ready` i `previewShift < 0`" istnieje wyłącznie w komentarzu, nie w typach.

- **Wzorzec do zastosowania:** discriminated union `LoadingState | ErrorState | NoDataState | ReadyState` (+ `preview?: PreviewSnapshot` w `ReadyState`).
- Uwaga: to świadoma decyzja research 909 (R3 „plain element field"), ale przy dwóch kolejnych feature'ach (910) ta mieszanka się pogłębia.

### W6. Logika biznesowa inline w `render()` (mieszanie prezentacji i wyliczeń)

`render()` (~600 linii) wylicza inline:

- **mapowanie `forecast.disabledReason` → klucz i18n** (linie 1424–1436) — czysta funkcja domenowa w komponencie, bez własnego testu jednostkowego;
- **wybór zdania narracji** (4-gałęziowa selekcja `interpretationSemantics.outcome`, linie 1454–1518) — „narrative engine" domeny 903 zdefiniowany w specyfikacji, zaimplementowany w elemencie;
- captiony okresów, formatowanie liczb, bramkowanie panelu Forecast|Total, paski ostrzeżeń.

Konsekwencja: `render()` jest testowalny głównie przez integracyjne testy DOM, a czytelność komponentu cierpi. To klasowy problem „smart component", nie „presentational".

### W7. Dwa źródła etykiety okresu (duplikacja w `updated()` i `_buildRendererConfig()`)

Logika `periodLabel` (1 stycznia → sam rok, inaczej `Intl` month-long+year) jest zdublowana dosłownie w `updated()` (gałąź preview, linie 577–587) i `_buildRendererConfig()` (linie 1181–1189). Projekt ma już bug z rodziny „niekonsekwentne etykiety" (`hour-label-format-inconsistency`) — każda kolejna kopia to zaproszenie do ponownego buga.

### W8. `ha-api.ts` (805 linii) — pół dokończona migracja multi-window

- **Legacy API single-window** (`buildLtsQuery`, `mapLtsResponseToSeries`, `buildComparisonPeriod`) nie jest używane w produkcji — żyje tylko dzięki 2 testom (`ha-api.test.ts`, `time-windows-presets-golden.test.ts`). To duch architektury sprzed domeny 900, utrzymywany i testowany za darmo.
- Moduł miesza 4 odpowiedzialności: konstrukcję zapytań, mapowanie odpowiedzi LTS, konstrukcję timeline (`buildChartTimeline`/`buildFullTimeline*`), agregacje (`computeSummary`/`computeForecast`/`computeTextSummary`) + wyliczenia paneli.

### W9. Geometria wykresu rozrzucona (kohesja społeczności „Axis Rendering & Tooltip" = 0,05 — najniższa w grafie)

Stałe layoutu (`GRID_BOTTOM_PX`, `AXIS_TICK_LABEL_GAP_PX`, `X_AXIS_DESCENDER_BUFFER_PX`) mieszkają w `axis/x-axis-rich-styles.ts`, ale budżety geometryczne (komentarz „274 − 40 (legend+gap) − 38 (GRID_BOTTOM_PX) ≈ 196 px") żyją w komentarzach `echarts-renderer.ts`. Dodatkowo `EChartsLayoutSyncApi` — cast na wewnętrzny, nietypowany API ECharts (`inst as unknown as EChartsLayoutSyncApi`) — obejście uzasadnione, ale powinno mieć jedno zdokumentowane miejsce (np. `axis/layout-sync.ts`) i test kontraktowy.

### W10. Higiena artefaktów i dokumentacji

- `temp/echarts-area-fill-minimal-repro.html` — martwy plik debugowy **zagrożony w git** (śledzony).
- `dist/energy-horizon-card.js.map` (3,86 MB) trafia do repo i do użytkowników (`www/community/`) — **sourcemap publikowany do produkcji** to naruszenie ducha art. II (ujawnianie pełnego źródła + komentarzy; debuggability nie jest potrzebna użytkownikowi).
- `constitution.md` — w committed wersji nagłówek `<!-- SYNC IMPACT REPORT (materiał roboczy — do usunięcia przed commit) -->` — naruszenie Governance („dokumentacja musi być zgodna z praktyką").
- Trzy miejsca z notatkami wydawniczymi: `changelog.md` (29 KB), `release-notes-1.2.0.md`, katalog `release-notes/` — konstytucja wymaga „czytelnego changelogu" (jednego), warto ustalić jedno źródło prawdy.

### W11. Uproszczenie formatowania liczb: `numberFormatToLocale`

`comma → "de"`, `decimal → "en"` — przybliżenie formatu liczby do locale. Działa, ale jest kruche (użytkownik z en-GB i przecinkiem dostanie `de`). HA nie udostępnia native API formatu liczb — to akceptowalne obejście, ale **powinno być udokumentowane w wiki (Troubleshooting)** jako znane uproszczenie.

### W12. Edytor (1375 linii) — akceptowalny, ale z trendem wzrostowym

God node grafu (70 krawędzi, 72 symbole). Skorupa nad `FIELD_REGISTRY` jest wzorowa (S2), ale w środku siedzi: tryb YAML (parse/emit/self-echo, 3 timery debounce), przywracanie focusa/caret i scrolla. Warto wydłużyć wzorzec: kontroler trybu YAML jako osobna maszyna stanów (`editor/yaml-mode.ts`) + przywracanie focus/scroll do `editor-ui-state.ts` (model danych już istnieje).

---

### Tablica: naruszenia konstytucji

| Zasada konstytucji | Miejsce naruszenia | Task |
|---|---|---|
| III — unikanie `any`, rygorystyczne typowanie | 15× `any` (W4), 65× `!`, ESLint bez `no-explicit-any` | TD-3, TD-4, TD-5, TD-6 |
| V — prostota, każda złożoność musi przynosić wartość | plik-bóg (W1), 3× duplikat pipeline'u (W2), logiczna inline w `render()` (W6) | TD-2, TD-8, TD-9 |
| V + Dodatki — uzasadnione, lekkie zależności | `date-fns` bez użycia, martwy `chart-renderer.ts` (W3) | TD-1 |
| II — operacje defensywne, typowanie | `responses[i] as any` zamiast typowania odpowiedzi (W4) | TD-3 |
| III — modularny, czytelny kod | `ha-api.ts` z legacy API i 4 odpowiedzialnościami (W8), `CardState` bez niezmienników (W5) | TD-7, TD-11 |
| Governance — jakość dokumentacji | komentarz „do usunięcia przed commit" w committed constitution (W10) | TD-13 |

---

## 4. Taski redukcji długu technicznego

Każdy task: niezależny, realizowalny w osobnym PR, z kryteriami akceptacji. Propozycja numeracji zgodna z procesem speckit (może zostać taskiem TNNN danej domeny albo osobnym feature'm `911-tech-debt-reduction`).

### Fala 1 — quick wins (niski wysiłek, natychmiastowa wartość)

#### TD-1. Usunięcie martwego renderera Chart.js i zależności `date-fns` — [S]
- **Zakres:** usunąć `src/card/chart-renderer.ts`; usunąć `date-fns` z `dependencies` w `package.json`; zaktualizować listę `CARD_SOURCE_FILES` w `tests/unit/localize-static-text-guard.test.ts`; `npm install` (lockfile); rebuild `dist`.
- **Kryteria:** typecheck/lint/test zielone; `npm ls date-fns` → puste; w `dist/` zero śladów `ChartRenderer` (już dziś tak jest — regresja niemożliwa); changelog „Removed unused runtime dependency".
- **Ryzyko:** bardzo niskie (brak importów produkcyjnych — zweryfikowane).
- **Konstytucja:** V, Dodatki (uzasadnienie zależności), III.

#### TD-3. Typowanie odpowiedzi LTS i usunięcie `as any` z karty — [S/M]
- **Zakres:** dopisać typ `LtsMessageResponse` (kształt `result` WebSocket, uwzględniający obie obserwowane postacie: `{ results }` i „goły" `results`) + adapter `extractLtsResults(response)`; `mapLtsResponseToCumulativeSeries` przyjmuje typowany wejściowy; usunąć 3× `responses[i] as any` (linie 745, 878, 886).
- **Kryteria:** zero `as any` w `cumulative-comparison-chart.ts`; istniejące testy `ha-api.test.ts` zielone bez zmian semantyki; test adaptera dla obu kształtów odpowiedzi.
- **Konstytucja:** II (defensywne operacje), III (typy modeli).

#### TD-4. Reguły ESLint egzekwujące rygorystyczne typowanie — [S]
- **Zakres:** w `config/eslint.config.js`: `@typescript-eslint/no-explicit-any: "error"`, `no-non-null-assertion: "warn"`, `consistent-type-imports: "error"`.
- **Kryteria:** 0 błędów w `src/` (po TD-3; pozostałe `any` w echarts → TD-5); warn-y non-null dokumentowane (TD-6 je usuwa).
- **Konstytucja:** III (unikanie `any` — tym razem wymuszone narzędziem).

#### TD-10. Jedno źródło etykiety okresu `formatPeriodLabel` — [S]
- **Zakres:** nowa funkcja czysta `src/card/labels/period-label.ts` (`formatPeriodLabel(instant, locale, zone)` — krawędź 1 stycznia → rok, inaczej month-long+year); zastąpić duplikaty w `updated()` (577–587) i `_buildRendererConfig()` (1181–1189).
- **Kryteria:** 1 implementacja; testy jednostkowe (1.01, 31.12, strefy czasowe, 5 języków); testy kart zielone.
- **Konstytucja:** V (jedno miejsce = mniej magii).

#### TD-13. Higiena artefaktów i dokumentacji — [S]
- **Zakres:** usunąć nagłówek „SYNC IMPACT REPORT … do usunięcia przed commit" z `constitution.md`; usunąć `temp/` (martwy repro); usunąć `jsx: "react-jsx"` z `tsconfig.json`; decyzja o sourcemapach: `sourcemap: false` w `config/vite.config.ts` (mapy nie trafiają do `www/community/` — art. II); ustalić `changelog.md` jako jedyny kanoniczny changelog (przenieść/zarchiwizować `release-notes-1.2.0.md` i `release-notes/`); dodać sekcję „Known simplifications: number format → locale mapping" do wiki Troubleshooting.
- **Kryteria:** brak śledzonych plików temp; build bez `.map` (dist ~2,3 MB mniejszy); 1 kanoniczny changelog; constitution bez komentarzy roboczych.
- **Konstytucja:** II (nie ujawniaj źródła w artefakcie), Governance.

### Fala 2 — strukturalna (najwyższa wartość długoterminowa)

#### TD-2. Jeden czysty `ReadyStateBuilder` — unifikacja 3 dróg ładowania — [L, PRIORYTET]
- **Zakres:** nowy moduł `src/card/pipeline/ready-state-builder.ts` (czyste funkcje, zero Lit/DOM):
  `buildReadyState(series, windows, merged, chartTime, resolved, localize, opts?) → CardState`
  obejmujące: `tailLabelFromIndex`, `alignOffsetMs`, skalowanie jednostek, `computeSummary`, `computeForecast`, łatanie unitów, `computeTextSummary`;
  wydobyć `_applyUnitScalingToSeries` do `src/utils/unit-scaler.ts` (czysta funkcja — `force_prefix` jako parametr);
  `_loadData`, `_buildDemoState`, `_firePickerRealDataQuery` stają się: „załaduj serie → `buildReadyState(…)`" (każda < 60 linii).
- **Kryteria:** brak zduplikowanej orkiestracji (review: 1 wywołanie buildera na drogę); ≥15 testów jednostkowych buildera (wszystkie 4 stany: ready, no-data, forecast-disabled, single-window); testy integracyjne kart/pickera zielone bez zmian UX.
- **Efekt:** klasa bugów, która uderzyła 9-krotnie, dostaje jedno miejsce do naprawy i testu.
- **Konstytucja:** V (prostota, czytelne pipeline'y), III (modularność).

#### TD-7. Rozbicie `ha-api.ts`: usunięcie legacy API, wydzielanie timeline — [M]
- **Zakres:** usunąć `buildLtsQuery`, `mapLtsResponseToSeries`, `buildComparisonPeriod` (przenieść golden-testy presetów na API multi-window — `buildMergedTimeWindowConfig` + `resolveTimeWindows`); przenieść `buildChartTimeline`/`buildFullTimeline*`/`buildTimelineSlots`/`firstTailAxisLabelIndex` do `src/card/timeline/` (lub `time-windows/`); `ha-api.ts` zostawia: query build + LTS mapping + `computeSummary`/`computeForecast`/`computeTextSummary`/`fullReferenceWindowRawTotal`.
- **Kryteria:** `ha-api.ts` < 400 linii; 0 zmian zachowania (cała bateria testów zielona); brak importów legacy z `src/`.
- **Konstytucja:** III (modularność), V.

#### TD-11. `CardState` jako discriminated union — [M]
- **Zakres:** `CardState = LoadingState | ErrorState | NoDataState | ReadyState`, gdzie `ReadyState` ma obowiązkowe `comparisonSeries`, `summary`, `forecast`, `period`, `resolvedWindows`, `chartTime` i opcjonalny `preview?: PreviewSnapshot` (obiekt `previewShift + previewSeries + previewWindows + previewChartTime`); usunąć `previewShift` z pól stanu (element pozostaje źródłem, snapshot w stanie służy `render()`).
- **Kryteria:** niezmienniki egzekwowane przez kompilator; 0 asercji `!` na polach stanu w `render()`/`updated()`; testy kart zielone.
- **Konstytucja:** III (model typów), II (odporność — błąd „ready bez serii" staje się niemożliwy do zapisu).

### Fala 3 — czytelność i jakość

#### TD-5. Typowanie opcji ECharts przez `EChartsOption` — [M]
- **Zakres:** w `echarts-renderer.ts` zastąpić lokalne `any[]` typami `LineSeriesOption`/`EChartsOption` (typ `EChartsOption` jest już zaimportowany na linii 7); wyeliminować kasty `(series[i] as any).markLine = …` (budować serie jako obiekty typowane przed `setOption`).
- **Kryteria:** 0× `any` w `echarts-renderer.ts`; testy renderera zielone.
- **Konstytucja:** III.

#### TD-6. `noUncheckedIndexedAccess` w tsconfig — [M]
- **Zakres:** włączyć flagę; poprawić 65 asercji `]!` (priorytet: `ha-api.ts` 20, karta 16, picker 9) — tam gdzie kontrakt gwarantuje niepustość, dodać jawny guard z błędem lub helper `firstDefined(arr)`; reszta przez typowanie.
- **Kryteria:** flaga ON; 0 (albo pojedyncze, uzasadnione) asercje non-null; testy zielone — testy powinny wychwycić każdy faktyczny off-by-one.
- **Konstytucja:** III (rygorystyczne typowanie).

#### TD-8. Narrative jako czyste funkcje domeny — [M]
- **Zakres:** wydobyć do `src/card/narrative/`: (a) `forecastDisabledReasonKey(reason)` (mapowanie 6-wartościowe z linii 1424–1436), (b) `resolveNarrativeSegment(outcome, neutralKind, language, entityKind)` (4-gałęziowa selekcja z 1454–1518 → klucz + zmienne); `render()` jedynie formułuje i owija w Lit.
- **Kryteria:** testy jednostkowe obu funkcji (w tym krawędzie: brak referencji, insufficient_data, neutral band/similar); `render()` traci ~150 linii logiki.
- **Konstytucja:** V, III; spójność z domeną 903 (narrative engine w spec vs w kodzie).

#### TD-9. View-model dla `render()` — [M/L]
- **Zakres:** `buildCardViewModel(state, config, hass, localize) → CardViewModel` (czysta funkcja): captiony (wywołania `formatCompactPeriodCaption`), formatowane liczby summary/forecast, `warningMessages`, `narrativeBody` (po TD-8), bramkowanie panelu Forecast|Total, `effectiveTitle`/`effectiveIcon`; `render()` = czysty template nad VM (docelowo < 200 linii).
- **Kryteria:** VM pokryta testami jednostkowymi (stany: ready/no-data/error/preview/single-window); `render()` bez wywołań `compute*`/`format*` domenowych poza destrukcją VM.
- **Konstytucja:** V (czytelność), III (modularność).
- **Zależność:** najlepiej po TD-8 (i po TD-10).

#### TD-12. Tryb YAML edytora jako kontroler — [M]
- **Zakres:** `src/card/editor/yaml-mode.ts` — mała maszyna stanów (text, parseError, lastEmitted, self-echo, debounce parse/emit) z API `parse(config) → {text?, error?}` / `commit(text) → {config?, error?}`; przywracanie focus/scroll przenieść do `editor-ui-state.ts` (model `EditorUiState` już istnieje — rozszerzyć o `focusTarget`/`scrollTop`); skorupa `energy-horizon-card-editor.ts` zostaje: render + routing zdarzeń.
- **Kryteria:** skorupa < 1000 linii; `yaml-mode` testowany bez DOM (czyste funkcje); testy lifecycle/coverage edytora zielone.
- **Konstytucja:** III, V.

### Fala 4 — opcjonalna (po fali 2)

#### TD-14. Wydzielenie pickera (910) do `src/card/picker/` — [M]
- **Zakres:** `_firePickerRealDataQuery`, `_buildDemoState`, `_pickerRealDataFired` + glue z `picker-preview.ts` → moduł `picker/` z jednym hookiem montowanym w elemencie (`attachPicker(element, config, onState)`).
- **Przypisanie:** po TD-2 (builder) — picker staje się najprostszym konsumentem buildera.
- **Kryteria:** element < 1200 linii; testy pickera zielone; `preview` flag zachowuje semantykę 910 (FR-010/013/014).
- **Konstytucja:** Dodatki („funkcje zaawansowane nie komplikują podstawowego doświadczenia" — w kodzie: nie komplikują też elementu).

---

### Rekomendowany plan realizacji

| Fala | Taski | Szacowany wysiłek | Cel |
|---|---|---|---|
| 1 | TD-1, TD-3, TD-4, TD-10, TD-13 | 1–2 dni | usuń balast, włącz egzekucję typów, połącz etykiety |
| 2 | TD-2 (priorytet), TD-7, TD-11 | ~1 tydzień | unifikacja pipeline'u, czyste moduły danych, niezmienniki w typach |
| 3 | TD-5, TD-6, TD-8, TD-9, TD-12 | ~1 tydzień | zero `any`/`!`, narrative i render jako czyste funkcje |
| 4 | TD-14 | kilka dni | element < 1200 linii, picker jako moduł |

Zasady realizacji (zgodne z Workflowem konstytucji):
1. każdy task = osobny PR + minimum 1 recenzja + wpis w changelog;
2. każdy task musi mieć testy (nowe dla wydobytych funkcji czystych — to naturalna premia: faza 3-4 drastycznie podnosi pokrycie logiki biznesowej testami jednostkowymi zamiast DOM);
3. po każdej fali: `npm test && npm run typecheck && npm run lint && npm run build` + aktualizacja `dist/` (CI verify-dist);
4. taski TD-2 i TD-11 warto poprzedzić krótkim assessmentem w `.specify/assessments/` (zgodnie z procesem projektu) — zmieniają publiczne typy wewnętrzne i mają największy blast radius.

---

## 5. Co NOTKA: jest dobrze i nie ruszać

- **Wzorzec Registry w edytorze (908)** — wzorcowy data-driven UI; nie rozdrabniać dalej, rozbudowywać rejestr.
- **Mechanizm generacji ładów** (`_loadGeneration`/`_inFlightGeneration`) — dojrzały, przetestowany; nie zamieniać na abstrakcję „cancel token" bez potrzeby (art. V: prostota).
- **Czysty rdzeń `time-windows/`** — nie mieszać z UI; to wzorzec dla TD-2/7/8.
- **Autorski `ha-types.ts`** — świadoma decyzja anti-lock-in; nie zamieniać na import typów z HA frontend.
- **Sourcemap w dev** (`vite` dev/preview) — zostawiać lokalnie; usunąć tylko z artefaktu produkcyjnego (TD-13).
