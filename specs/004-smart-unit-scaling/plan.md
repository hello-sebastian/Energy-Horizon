# Implementation Plan: Inteligentne skalowanie jednostek i formatowanie liczb

**Branch**: `004-smart-unit-scaling` | **Date**: 2026-03-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-smart-unit-scaling/spec.md`

---

## Summary

Implementacja czystej funkcji pomocniczej `scaleSeriesValues()` w `src/utils/unit-scaler.ts`, która:
- automatycznie (tryb `auto`) lub ręcznie (tryb `force_prefix`) dobiera prefiks SI (G, M, k, m, µ) na podstawie maksimum serii,
- parsuje jednostki z już istniejącym prefiksem (kWh → Wh + k; mA → A + m),
- pomija skalowanie dla jednostek czasu, °C, % i innych nieskalowalnych SI,
- akceptuje `"u"` jako alias `"µ"` w konfiguracji YAML; wyświetla zawsze poprawny symbol µ (U+00B5),
- formatuje liczby przez `Intl.NumberFormat` z locale z HA — zero ręcznych zamian znaków.

Wynik `ScaleResult` jest przekazywany do `ChartRendererConfig.unit` w `echarts-renderer.ts`; podsumowanie i etykiety osi Y używają tej samej skalowanej jednostki (FR-010).

---

## Technical Context

**Language/Version**: TypeScript 5.6 (ES2020+, `strict` enabled)  
**Primary Dependencies**: Lit 3.1 (LitElement), Apache ECharts 5.6.0 (modularny), Vite 6, Vitest 2 — żadna nowa zależność NPM nie jest wymagana przez tę funkcję  
**Storage**: N/A — przetwarzanie in-browser, dane read-only z HA  
**Testing**: Vitest 2 (`tests/unit/unit-scaler.test.ts`)  
**Target Platform**: Przeglądarka użytkownika wbudowana w Home Assistant (Chromium-based lub Firefox); `Intl.NumberFormat` i `Intl.DateTimeFormat` są zawsze dostępne  
**Project Type**: Lovelace card (Web Component, biblioteka in-browser)  
**Performance Goals**: `scaleSeriesValues()` musi działać synchronicznie; brak operacji async; czas < 1 ms dla serii < 10 000 punktów  
**Constraints**: Brak zależności zewnętrznych w `src/utils/unit-scaler.ts`; funkcja musi być czysto testowalna bez DOM  
**Scale/Scope**: Jedna karta, jedna seria danych; logika utility łatwa do skopiowania do innych kart

---

## Constitution Check

### Gate 1 — Zgodność z ekosystemem HA (Konstytucja §I)
✅ **PASS**: `unit_display.force_prefix` rozszerza `CardConfig` w sposób addytywny i wstecznie kompatybilny. Brak `unit_display` = domyślny `auto`. Istniejące konfiguracje YAML działają bez zmian.

### Gate 2 — Bezpieczeństwo i odporność na błędy (Konstytucja §II)
✅ **PASS**:
- `force_prefix` z niepoprawną wartością → fallback do `auto` (defensywny).
- `unit_of_measurement` puste lub nieznane → brak skalowania, wartość oryginalna (graceful degradation).
- Seria pusta lub max = 0 → jednostka bazowa z encji bez prefiksu.
- Wejście YAML `µ` (U+00B5 lub U+03BC) → normalizacja do `"u"` przed przetworzeniem; zapobiega problemom z kodowaniem.

### Gate 3 — Jakość kodu i testy (Konstytucja §III)
✅ **PASS**:
- `src/utils/unit-scaler.ts` — czysta funkcja, zero zależności zewnętrznych, pełne typowanie TS strict.
- `tests/unit/unit-scaler.test.ts` — testy jednostkowe dla każdego scenariusza akceptacji z spec.md.
- `Intl.NumberFormat` zamiast ręcznych zamian — spójność z istniejącym `formatSigned()`.

### Gate 4 — Brak nowych zależności NPM (Konstytucja §V + dodatkowe)
✅ **PASS**: Żadna nowa zależność NPM nie jest wymagana. `Intl.NumberFormat` jest natywny.

### Post-Design Re-check (po fazie 1)
✅ **PASS**: Kontrakty TypeScript (`UnitDisplayConfig`, `ScaleResult`) są addytywne — nie łamią istniejących typów w `types.ts`. `ChartRendererConfig` rozszerzony o `unitDisplay?: UnitDisplayConfig`.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-smart-unit-scaling/
├── plan.md              # Ten plik
├── research.md          # Phase 0 ✅
├── data-model.md        # Phase 1 ✅
├── quickstart.md        # Phase 1 ✅
├── contracts/
│   └── unit-scaler-api.md   # Phase 1 ✅
└── tasks.md             # Phase 2 (generowane przez /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── utils/
│   └── unit-scaler.ts       # NOWY — czysta funkcja skalowania SI + formatowania Intl
├── card/
│   ├── types.ts             # MODYFIKOWANY — dodanie UnitDisplayConfig, rozszerzenie CardConfig
│   ├── cumulative-comparison-chart.ts  # MODYFIKOWANY — wyliczenie ScaleResult przed renderem
│   └── echarts-renderer.ts  # MODYFIKOWANY — unit skalowany w osi Y i tooltip
└── ha-types.ts              # BEZ ZMIAN

tests/
└── unit/
    └── unit-scaler.test.ts  # NOWY — testy jednostkowe Vitest
```

**Structure Decision**: Opcja 1 (Single project). Nowe pliki: `src/utils/unit-scaler.ts` i `tests/unit/unit-scaler.test.ts`. Modyfikacje: 3 istniejące pliki. Katalog `src/utils/` zostaje utworzony jako nowa warstwa utility — łatwa do skopiowania do przyszłych kart.

---

## Complexity Tracking

> Brak naruszeń konstytucji — sekcja niewymagana.
