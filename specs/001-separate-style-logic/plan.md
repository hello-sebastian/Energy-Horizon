# Implementation Plan: Separacja warstwy stylów od logiki karty

**Branch**: `001-separate-style-logic` | **Date**: 2026-03-10 | **Spec**: `specs/001-separate-style-logic/spec.md`  
**Input**: Feature specification from `specs/001-separate-style-logic/spec.md`

## Summary

Feature wprowadza architektoniczne rozdzielenie **warstwy wizualnej** (style, layout, typografia) od **logiki karty** (pobieranie danych z HA, obliczenia, przygotowanie serii do wykresu) w `Energy Horizon Card`.  
Docelowo karta ma:
- korzystać z **dedykowanego modułu stylów** (np. `energy-burndown-card-styles.ts`),
- mieć **czytelną strukturę HTML** z semantycznymi klasami (`.ebc-card`, `.ebc-header`, `.ebc-stats`, `.ebc-forecast`, `.ebc-chart`),
- utrzymywać logikę w osobnych plikach (`cumulative-comparison-chart.ts`, `ha-api.ts`, `chart-renderer.ts`) bez zależności od konkretnych implementacji stylów.

Zmiany koncentrują się na refaktoryzacji istniejącej karty (TypeScript + LitElement) tak, aby:
- zmiany wizualne były możliwe wyłącznie przez edycję pliku stylów i struktury HTML,
- zmiany logiki obliczeń nie wymagały dotykania styli,
- zachować zgodność z wcześniej wprowadzonym featurem themingu HA (`001-ha-theming-classes`).

## Technical Context

**Language/Version**: TypeScript (strict) + ECMAScript target zgodny z HA (ES2017+), bundlowany przez Vite  
**Primary Dependencies**:  
- LitElement / lit-html – budowa web componentu karty, `static styles`, `render()`  
- Chart.js – renderowanie wykresu porównawczego (zależność pośrednia, używana przez `chart-renderer.ts`)  
- Home Assistant Lovelace API – kontrakt dla kart (konfiguracja, `hass`, `setConfig`, theming)  

**Storage**: N/A – karta nie utrzymuje własnego backendu; korzysta wyłącznie z API HA i long-term statistics  
**Testing**: Brak dedykowanego frameworka testów dla UI w ramach tego feature – weryfikacja głównie manualna (HA UI, przeglądarka, konsola). Logika jest projektowana tak, aby była łatwa do pokrycia testami jednostkowymi w przyszłości.  
**Target Platform**:  
- Przeglądarka uruchomiona w Home Assistant (desktop + mobile), webview Lovelace  
**Project Type**: Frontendowa biblioteka/web component (karta Lovelace) dystrybuowana przez HACS  
**Performance Goals**:  
- Refaktoryzacja nie może pogorszyć wydajności renderowania ani zwiększyć kosztu aktualizacji wykresu  
- Brak dodatkowych re-renderów wynikających z warstwy stylów (styles nie mogą być dynamicznie przebudowywane przy każdym update logiki)  
**Constraints**:  
- Zgodność z motywami HA (jasny/ciemny) i integracją themingu z feature’u `001-ha-theming-classes`  
- Zachowanie istniejącego publicznego API karty (konfiguracja YAML, nazwa custom elementu)  
- Brak zmian w strukturze bundlu artefaktu (`dist/energy-burndown-card.js`) poza refaktoryzacją wewnętrzną  
**Scale/Scope**:  
- Pojedyncza karta, ale z ambicją bycia wzorcem dla kolejnych kart w projekcie (architektura styl/logika powinna być łatwa do reużycia)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Zgodnie z „Energy Horizon Lovelace Card Constitution”:

- **I. Zgodność z ekosystemem Home Assistant i HACS**  
  - Zmiany dotyczą wyłącznie struktury wewnętrznej karty; API Lovelace, integracja z HACS i zasady konfiguracji pozostają niezmienione.  
  - Theming pozostaje spójny z mechanizmem HA i istniejącym featurem `001-ha-theming-classes`.  

- **II. Bezpieczeństwo i odporność na błędy**  
  - Separacja stylów od logiki upraszcza warstwę obliczeniową i zmniejsza powierzchnię potencjalnych błędów (brak logiki w `static styles`).  
  - Brak nowych wektorów wejścia danych – plik stylów nie przyjmuje konfiguracji użytkownika, operuje tylko na CSS variables/klasach.  

- **III. Jakość kodu, testy i utrzymanie**  
  - Rozdzielenie odpowiedzialności poprawia czytelność i ułatwia testowanie (logika vs. layout/styl).  
  - Architektura wpisuje się w zasadę modularności i spójnego stylu kodu TypeScript/Lit.  

- **IV. UX/UI, dostępność i wizualizacja danych**  
  - Refaktoryzacja nie zmienia merytorycznie UI, ale ułatwia dalsze iteracje UX (łatwiejsze modyfikacje wyglądu, kontrast, layout).  
  - Semantyczne klasy i przejrzysta struktura HTML wspierają dostępność i spójność wizualną.  

- **V. Wydajność, prostota i obserwowalność**  
  - Wydzielenie stylów upraszcza komponent i redukuje sprzężenia, co sprzyja prostocie i łatwości debugowania.  
  - Brak dodatkowych warstw abstrakcji poza jednym modułem stylów, więc złożoność pozostaje pod kontrolą.

**Wniosek**: Plan jest zgodny z konstytucją; nie wymaga wyjątków ani wpisów w „Complexity Tracking”.

## Project Structure

### Documentation (this feature)

```text
specs/001-separate-style-logic/
├── plan.md              # Ten plik (Implementation Plan)
├── research.md          # Uzupełnienie kontekstu (architektura styl/logika, relacja do themingu)
├── data-model.md        # Model pojęciowy: warstwa stylów vs komponent karty
├── quickstart.md        # Przewodnik: jak zmieniać wygląd bez dotykania logiki
├── contracts/           # Kontrakt architektoniczny: granica styl/logika
└── tasks.md             # Listy zadań (/speckit.tasks – już istnieje)
```

### Source Code (repository root)

```text
src/
├── card/
│   ├── cumulative-comparison-chart.ts   # Główny komponent karty (logika + render HTML)
│   ├── chart-renderer.ts               # Logika integracji z Chart.js (bez styli CSS)
│   ├── ha-api.ts                       # Logika komunikacji z API HA i obróbki danych
│   ├── energy-burndown-card-styles.ts  # [NOWY] Moduł stylów karty (warstwa wizualna)
│   └── index.ts                        # Rejestracja custom elementu, eksporty
```

**Structure Decision**:  
Projekt pozostaje **pojedynczym frontendowym modułem** w katalogu `src/card/`.  
Nowy plik `energy-burndown-card-styles.ts` agreguje wszystkie style karty (w tym powiązane z themingiem HA) i jest importowany przez `cumulative-comparison-chart.ts` jako `static styles`.  
Pliki `ha-api.ts` i `chart-renderer.ts` są traktowane jako czysto logiczne – nie implementują styli, operują wyłącznie na danych, klasach i elementach DOM.

## Phase 0: Research (research.md)

Zakres researchu dla tego feature’u jest stosunkowo niewielki, ponieważ:
- kontekst technologiczny (TypeScript, LitElement, Chart.js, HA theming) został już rozpoznany w `001-energy-horizon-card` i `001-ha-theming-classes`,
- głównym celem jest uporządkowanie architektury wewnątrz istniejącej karty.

`research.md` powinien zawierać:
- krótkie porównanie typowych podejść do stylowania web components (inline `static styles`, osobny moduł, CSS Modules, shadow DOM vs. global CSS),  
- uzasadnienie wyboru: **osobny moduł TS z eksportowanym `css` dla LitElement** jako kompromis między czytelnością a prostotą,  
- opis relacji do themingu HA: moduł stylów korzysta z CSS variables HA, ale nie dotyka logiki LTS/forecastu.

## Phase 1: Design & Contracts (data-model, contracts, quickstart)

### data-model.md

W `data-model.md` należy zdefiniować co najmniej dwa główne byty:

- **StyleLayer** (warstwa stylów karty):  
  - odpowiedzialność: kolory, typografia, spacing, layout, responsywność, stany hover/aktywny,  
  - implementacja: `energy-burndown-card-styles.ts` eksportujący `CSSResult`/`css` dla LitElement,  
  - brak zależności od logiki danych.

- **CardComponent** (główny komponent karty):  
  - odpowiedzialność: konfiguracja z HA, pobieranie danych (przez `ha-api.ts`), obliczenia, stan UI,  
  - używa klas CSS i struktur HTML zdefiniowanych w specu,  
  - implementacja: `cumulative-comparison-chart.ts` (LitElement).

Model może też wspomnieć o **LogicModules** (`ha-api.ts`, `chart-renderer.ts`) jako osobnych jednostkach, które współpracują z `CardComponent`, ale nie znają szczegółów warstwy stylów.

### contracts/

W katalogu `contracts/` dla tego feature’u kluczowy jest **kontrakt architektoniczny**:

- plik np. `contracts/style-logic-boundary.md`, który opisuje:
  - co może zrobić moduł stylów (zmieniać wygląd, używać klas, CSS variables),  
  - czego nie może zrobić (wołać logiki, odczytywać `hass`, manipulować danymi),  
  - w jaki sposób `CardComponent` korzysta z modułu stylów (import, `static styles`),  
  - zasady nazewnictwa klas / sekcji (odniesienie do `.ebc-*`).

To jest „kontrakt wewnętrzny” w projekcie, ale bardzo ważny dla kontrybutorów.

### quickstart.md

`quickstart.md` powinien wyjaśniać w kilku krokach:

1. Gdzie znajduje się plik stylów (`src/card/energy-burndown-card-styles.ts`).  
2. Jak zmienić podstawowe aspekty wyglądu (kolory, marginesy, typografię) poprzez edycję tego pliku.  
3. Jak bezpiecznie zmienić layout (np. kolejność sekcji) modyfikując `render()` w `cumulative-comparison-chart.ts` bez ingerencji w logikę.  
4. Jak przetestować zmiany w HA (przeładowanie zasobów, otwarcie dashboardu, sprawdzenie konsoli).

## Complexity Tracking

Nie są planowane odstępstwa od konstytucji ani wprowadzanie dodatkowych warstw złożoności ponad:
- jeden moduł stylów (`energy-burndown-card-styles.ts`),  
- istniejące moduły logiki (`ha-api.ts`, `chart-renderer.ts`, `cumulative-comparison-chart.ts`).

Tabela pozostaje pusta – brak naruszeń wymagających uzasadnienia.

