# Tasks: Inteligentne skalowanie jednostek i formatowanie liczb

**Feature**: `004-smart-unit-scaling`  
**Input**: Design documents from `/specs/004-smart-unit-scaling/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/unit-scaler-api.md ✅, quickstart.md ✅

**Tests**: Included — explicitly required by Constitution Gate 3 (spec.md). Each acceptance scenario from spec.md has a corresponding test task.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no mutual dependencies)
- **[Story]**: User story this task belongs to (US1–US5)
- Each task touches **at most 1 file**

## User Stories (from spec.md)

| ID   | Title                                  | Priority |
|------|----------------------------------------|----------|
| US1  | Automatyczne skalowanie (auto mode)    | P1 🎯 MVP |
| US2  | Ręczne wymuszenie prefiksu (force)     | P2       |
| US3  | Tryb surowych danych (none)            | P2       |
| US4  | Lokalizowane formatowanie liczb        | P1       |
| US5  | Zachowanie jednostek czasu             | P1       |

---

## Phase 1: Setup

**Purpose**: Verify project is ready. Directory `src/utils/` is created implicitly when `unit-scaler.ts` is written in Phase 2. No additional setup required for this TypeScript/Vite project.

- [X] T001 Verify `tests/unit/` directory exists and `npm test` runs without errors in repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript types and stubs that ALL subsequent tasks depend on. Must be complete before any implementation begins.

**⚠️ CRITICAL**: No user story work can begin until both tasks below are complete.

- [X] T002 Create `src/utils/unit-scaler.ts` — export types only: `SIPrefix = 'G' | 'M' | 'k' | '' | 'm' | 'u'`, `ForcePrefix = 'auto' | 'none' | SIPrefix | 'µ'`, `UnitDisplayConfig { force_prefix?: ForcePrefix; precision?: number }`, `ScaleResult { values: (number | null)[]; unit: string; prefix: SIPrefix; factor: number }` — plus constants `SI_PREFIX_DATA` and `NON_SCALABLE_UNITS` (see data-model.md for exact values). Internal type `ParsedUnit` (not exported). Function stubs only (no bodies yet): `export function scaleSeriesValues(...)` and `export function formatScaledValue(...)` — both `throw new Error('not implemented')`.
- [X] T003 Extend `src/card/types.ts` — import `UnitDisplayConfig` from `'../utils/unit-scaler'`; add `unit_display?: UnitDisplayConfig` to `CardConfig`; add `unitDisplay?: UnitDisplayConfig` to `ChartRendererConfig`. No other changes.

**Checkpoint**: `npm run build` (or `tsc --noEmit`) must pass with no type errors before Phase 3.

---

## Phase 3: US1 + US4 + US5 — Core Scaler (Priority: P1) 🎯 MVP

**Goal**: Implement pure utility functions in `src/utils/unit-scaler.ts` covering all P1 requirements: auto-scaling, localized number formatting, and non-scalable unit bypass (time units, %, °C etc.).

**Independent Test**: `npm test -- unit-scaler` — all P1 test cases pass (auto mode, Intl formatting, time unit bypass).

### Implementation for Phase 3

- [x] T004 [US1] Implement `parseUnit(rawUnit: string): ParsedUnit` internal function in `src/utils/unit-scaler.ts`. Algorithm (from research.md §3): (1) If `rawUnit` is in `NON_SCALABLE_UNITS` → `{ baseUnit: rawUnit, existingPrefix: '', scalable: false }`. (2) For each SI prefix in descending order of key length — if `rawUnit` starts with prefix symbol AND remainder is non-empty AND remainder is not in `NON_SCALABLE_UNITS` → `{ baseUnit: remainder, existingPrefix: prefix, scalable: true }`. (3) Fallback → `{ baseUnit: rawUnit, existingPrefix: '', scalable: true }`. Special case: empty `rawUnit` → `{ baseUnit: '', existingPrefix: '', scalable: false }`.
- [x] T005 [US1] Implement `choosePrefix(absoluteMaxInBase: number): SIPrefix` internal function in `src/utils/unit-scaler.ts`. Algorithm (from research.md §4): If `absoluteMaxInBase === 0` or `isNaN(absoluteMaxInBase)` → return `''`. Iterate `SI_PREFIX_DATA` from highest factor (G) to lowest (u): if `absoluteMaxInBase / entry.factor >= 1` → return that prefix. Fallback → `'u'`.
- [x] T006 [US1] [US5] Implement `scaleSeriesValues(values, rawUnit, unitDisplay)` export in `src/utils/unit-scaler.ts` — **auto mode only** (ignore force_prefix for now). Steps: (1) Normalize `force_prefix`: `undefined` or missing → `'auto'`; `'µ'` (U+00B5) or `'\u03BC'` → `'u'`. (2) Call `parseUnit(rawUnit)`. (3) If `!parsed.scalable` or `force_prefix === 'none'` → return identity result `{ values: [...values], unit: rawUnit, prefix: '', factor: 1 }`. (4) Compute `absoluteMax`: `max(abs(non-null values)) * SI_PREFIX_DATA[parsed.existingPrefix].factor`. If empty or max=0 → return unit without prefix. (5) Call `choosePrefix(absoluteMax)` → `targetPrefix`. (6) Compute `factor = SI_PREFIX_DATA[targetPrefix].factor` and `inputFactor = SI_PREFIX_DATA[parsed.existingPrefix].factor`; `scaleFactor = inputFactor / factor`. (7) Map values: `null → null`, `v → v * scaleFactor`. (8) Build `unit = PREFIX_DISPLAY[targetPrefix] + parsed.baseUnit`. Return `ScaleResult`. Handle `null` values throughout — `null` in → `null` out.
- [x] T007 [US4] Implement `formatScaledValue(value, unit, numberLocale, precision)` export in `src/utils/unit-scaler.ts`. Rules (from contracts/unit-scaler-api.md): Use ONLY `Intl.NumberFormat` — zero `replace()` calls. `precision < 0` or `NaN` → treat as `0`. Return `"${formatted} ${unit}".trim()`. If `unit = ''` return only the formatted number. Example: `new Intl.NumberFormat(numberLocale, { minimumFractionDigits: 0, maximumFractionDigits: Math.max(0, precision) }).format(value)`.

### Tests for Phase 3 (US1 + US4 + US5)

- [x] T008 [US1] Create `tests/unit/unit-scaler.test.ts` with `describe('scaleSeriesValues — auto mode')` block. Test cases (from spec.md §US1 and quickstart.md): `1500 Wh → { values: [1.5], unit: 'kWh', factor: 0.001 }`; `0.05–0.15 A → mA (×1000)`; `5000 kWh → MWh (FR-013 existing prefix)`; `500000 Wh → 500 kWh`; `null in → null out`; `empty series → { values: [], unit: 'Wh', prefix: '', factor: 1 }`; `max=0 → base unit no prefix`; `undefined unitDisplay → same as auto`.
- [x] T009 [US4] Add `describe('formatScaledValue')` block to `tests/unit/unit-scaler.test.ts`. Test cases (from spec.md §US4 and quickstart.md): `formatScaledValue(1234.5, 'kWh', 'pl', 2)` → contains `'kWh'` and does NOT contain `'.'`; `formatScaledValue(1234.5, 'kWh', 'en-US', 2)` → contains `'.'` and `'kWh'`; `formatScaledValue(50, '\u00B5A', 'en', 0)` → `'50 µA'`; `formatScaledValue(0, 'Wh', 'pl', 1)` → `'0 Wh'`; `precision < 0` → treated as 0 (no crash); `unit = ''` → no trailing space.
- [x] T010 [US5] Add `describe('scaleSeriesValues — non-scalable units')` block to `tests/unit/unit-scaler.test.ts`. Test cases (from spec.md §US5): `'h' with auto → { unit: 'h', factor: 1 }`; `'min' with force k → unit stays 'min', no scaling`; `'s' with auto and value 7200 → unit stays 's'`; `'%' with auto → no scaling`; `'°C' with auto → no scaling`.

**Checkpoint**: `npm test -- unit-scaler` must show all T008–T010 tests passing before Phase 4.

---

## Phase 4: US2 + US3 — Force Prefix & Raw Data Modes (Priority: P2)

**Goal**: Complete `scaleSeriesValues()` with manual force_prefix and none mode. US3 (none) and µ normalization may already be handled by T006 — verify and complete any missing paths.

**Independent Test**: All US2/US3 test cases pass (`force_prefix: k/m/M/G/u/µ/none`).

### Implementation for Phase 4

- [x] T011 [US2] Add manual force_prefix mode to `scaleSeriesValues()` in `src/utils/unit-scaler.ts`. When `force_prefix` is a valid `SIPrefix` (not `'auto'` or `'none'`): if `!parsed.scalable` → ignore, return identity. Else: `targetPrefix = force_prefix`; compute `scaleFactor = inputFactor / SI_PREFIX_DATA[targetPrefix].factor`; map values and build unit label. Invalid `force_prefix` value (not in known set after normalization) → fallback to `'auto'` + `console.warn(\`[unit-scaler] Unknown force_prefix: "${rawFP}" — falling back to auto\`)`.
- [x] T012 [US3] Verify `force_prefix: 'none'` path in `scaleSeriesValues()` in `src/utils/unit-scaler.ts` returns exact identity: `{ values: [...values], unit: rawUnit, prefix: '', factor: 1 }`. Verify µ normalization: `'µ'` (U+00B5) and `'\u03BC'` (Greek mu) both normalize to `'u'` at the top of `scaleSeriesValues()` before any branching.

### Tests for Phase 4

- [x] T013 [US2] Add `describe('scaleSeriesValues — force_prefix manual')` to `tests/unit/unit-scaler.test.ts`. Test cases (from spec.md §US2): `force_prefix: 'k'`, 500 Wh → `{ values: [0.5], unit: 'kWh' }`; `force_prefix: 'm'`, 1.5 A → `{ values: [1500], unit: 'mA' }`; `force_prefix: 'M'`, 500000 Wh → `{ values: [0.5], unit: 'MWh' }`; `force_prefix: 'u'`, 0.00005 A → `{ values: [50], unit: '\u00B5A' }`; force_prefix on `'h'` → ignored, returns identity; invalid `force_prefix: 'X'` → fallback to auto (no crash).
- [x] T014 [US3] Add `describe('scaleSeriesValues — force_prefix none / µ normalization')` to `tests/unit/unit-scaler.test.ts`. Test cases (from spec.md §US3): `force_prefix: 'none'`, 1500 Wh → `{ values: [1500], unit: 'Wh', factor: 1 }`; no `unit_display` field at all → same as auto (backward compat, SC-006); `force_prefix: 'µ'` (U+00B5) → normalized to `'u'`, result same as `force_prefix: 'u'`; `force_prefix: '\u03BC'` (Greek) → same normalization.

**Checkpoint**: `npm test -- unit-scaler` — all tests including US2/US3 cases pass before Phase 5.

---

## Phase 5: US1 — Integration in `cumulative-comparison-chart.ts`

**Goal**: Wire `scaleSeriesValues()` into the card render pipeline. Scaled values and unit flow through to `ChartRendererConfig`.

**Independent Test**: Card renders 1500 Wh entity showing "1.5 kWh" on Y-axis and in summary (visual check or integration test).

- [X] T015 [US1] In `src/card/cumulative-comparison-chart.ts`: add import `import { scaleSeriesValues } from '../utils/unit-scaler';`; retrieve `rawUnit` as `(this.hass?.states?.[this._config.entity]?.attributes?.unit_of_measurement as string) ?? ''`; extract `rawValues = series.current.points.map(p => p.value)` (as `(number | null)[]`); call `const scaleResult = scaleSeriesValues(rawValues, rawUnit, this._config.unit_display)`. Place this call in the render/update method, after series data is available and before `ChartRendererConfig` is constructed.
- [X] T016 [US1] In `src/card/cumulative-comparison-chart.ts`: update `ChartRendererConfig` construction to use `unit: scaleResult.unit` (replacing any existing `unit` derivation from raw HA state); pass `scaleResult.values` as the data for `current` series (replacing raw `rawValues`); set `precision: this._config.unit_display?.precision ?? this._config.precision ?? 2`. Also update `SummaryStats.unit` and `ForecastStats.unit` to `scaleResult.unit` for FR-010 consistency.

**Checkpoint**: Build passes (`npm run build` or `tsc --noEmit`) with no errors in `cumulative-comparison-chart.ts`.

---

## Phase 6: US1 — Integration Verify in `echarts-renderer.ts`

**Goal**: Ensure Y-axis label and tooltip display the already-scaled unit string from `ChartRendererConfig.unit`. Per contracts/unit-scaler-api.md: renderer has **no scaling logic** — it only reads the pre-computed `unit` string.

**Independent Test**: Y-axis label reads "kWh"; tooltip reads "1.5 kWh" for a 1500 Wh entity.

- [X] T017 [P] [US1] In `src/card/echarts-renderer.ts`: verify that Y-axis `axisLabel.formatter` (or equivalent) uses `config.unit` from `ChartRendererConfig` — not a raw HA unit. If it already does, add a comment `// unit is pre-scaled by scaleSeriesValues() in cumulative-comparison-chart.ts`. If not, update the label/tooltip to reference `config.unit`. No scaling logic may be added here — renderer is display-only.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T018 [P] Add edge case tests to `tests/unit/unit-scaler.test.ts` — `describe('scaleSeriesValues — edge cases')`: `rawUnit = ''` → `{ values: rawValues, unit: '', factor: 1 }` (no scaling); `precision: -1` in `UnitDisplayConfig` → `formatScaledValue` treats as 0 (no crash); series with all `null` values → `{ values: [null, null], unit: rawUnit, factor: 1 }`; `force_prefix: 'G'` with small values (e.g. 5 Wh) → `{ values: [5e-9], unit: 'GWh' }` (correct even if tiny).
- [ ] T019 Run `npm test && npm run lint` from repository root; fix any TypeScript `strict`-mode errors, unused imports, or ESLint violations introduced by this feature.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001)
  └── Phase 2 (T002 → T003) — Foundational: BLOCKS all phases below
        ├── Phase 3 (T004–T010) — P1 core implementation
        │     └── Phase 4 (T011–T014) — P2 force/none modes
        │           └── Phase 5 (T015–T016) — integration: comparison chart
        │                 └── Phase 6 (T017) — [P] integration: echarts renderer
        │                       └── Final (T018–T019) — polish
```

### Within-Phase Dependencies

- **Phase 2**: T002 → T003 (T003 imports `UnitDisplayConfig` from `unit-scaler.ts`)
- **Phase 3**: T004 → T005 → T006 → T007 (sequential, same file); T008 after T005; T009, T010 after T008 (same test file)
- **Phase 4**: T011 → T012 (same file); T013 → T014 (same test file, after T013)
- **Phase 5**: T015 → T016 (same file, T016 uses `scaleResult` from T015)
- **Phase 6**: T017 can start in parallel with T015/T016 if `ChartRendererConfig.unit` already existed (it does — see existing `types.ts`)

### Parallel Opportunities

```bash
# Phase 6 can run in parallel with Phase 5 (different files):
# Agent A: T015, T016  (cumulative-comparison-chart.ts)
# Agent B: T017        (echarts-renderer.ts — read-only verify/comment)

# Final phase tasks are independent:
# T018 (test file) and T019 (lint run) — T019 should run last
```

---

## Parallel Example: Phase 3

```bash
# Sequential (same file src/utils/unit-scaler.ts):
T004: parseUnit()
T005: choosePrefix()
T006: scaleSeriesValues() — auto mode
T007: formatScaledValue()

# Then tests (same file tests/unit/unit-scaler.test.ts — sequential):
T008: auto scaling tests
T009: formatScaledValue locale tests
T010: time unit bypass tests
```

---

## Implementation Strategy

### MVP (User Stories 1 + 4 + 5 only — P1)

1. **Phase 2** — Types & stubs (T001–T003)
2. **Phase 3** — Core scaler (T004–T010)
3. **Phase 5** — Integration (T015–T016)
4. **Phase 6** — Verify renderer (T017)
5. **STOP & VALIDATE**: `npm test` passes; visual check with Wh entity shows kWh on chart

### Full Delivery (all stories)

1. MVP above
2. **Phase 4** — Force/none modes (T011–T014)
3. **Final Phase** — Polish (T018–T019)

### Incremental Delivery

- After Phase 3: Auto scaling works — demonstrable to stakeholders (US1 done ✅)
- After Phase 4: All three modes work (US2 + US3 done ✅)
- After Phase 5+6: End-to-end in card UI (US4 + US5 visible ✅)
- After Final Phase: All edge cases covered, CI passes

---

## Notes

- `src/utils/unit-scaler.ts` has **zero external dependencies** and **zero internal imports** — pure TypeScript utility (Constitution Gate 4)
- Use `'\u00B5'` (Micro Sign) **always** in code — never paste µ directly (research.md §2)
- Never use `replace()` for number formatting — always `Intl.NumberFormat` (research.md §1)
- `scaleSeriesValues()` must never mutate the input `values[]` — always `values.map(...)` (quickstart.md pitfalls)
- Backward compat: absence of `unit_display` in YAML config → behaves as `force_prefix: 'auto'` (SC-006)
- `null` in values array = ECharts gap marker — must pass through unchanged
