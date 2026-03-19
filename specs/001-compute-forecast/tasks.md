# Tasks: Ulepszone obliczanie prognozy (computeForecast)

**Input**: Design documents from `/specs/001-compute-forecast/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | contracts/compute-forecast.ts ✅ | quickstart.md ✅  
**Branch**: `001-compute-forecast`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- **Tests**: Required — SC-002 mandates min. 10 test scenarios; quickstart.md specifies 15

---

## Phase 1: Foundational (Type Update)

**Purpose**: Prerequisite type changes that MUST be complete before `ha-api.ts` implementation can compile.

**⚠️ CRITICAL**: No implementation tasks can compile until T001 is done.

- [x] T001 [P] Add `anomalousReference?: boolean` field to `ForecastStats` interface in `src/card/types.ts` (per data-model.md §ForecastStats and contracts/compute-forecast.ts lines 15–50)
- [x] T002 [P] Remove constant `MIN_POINTS_FOR_FORECAST` (= 5) from `src/card/ha-api.ts` (FR-016 — replace with inline floor = 3, non-exported)

**Checkpoint**: TypeScript types are updated; project still compiles (call-site not yet updated)

---

## Phase 2: US1 + US2 – Core Forecast Algorithm (Priority: P1) 🎯 MVP

**Goal**: `computeForecast` uses a percentage-based activation threshold (not absolute bucket count) and aligns the reference series by timestamp range (not array index). These two stories share the same function and cannot be independently implemented — combined in one phase.

**Independent Test**: Call `computeForecast` with year_over_year (365-bucket) and month_over_year (30-bucket) data, including a series with a time gap, and verify thresholds and `splitIdx` are correct.

### Tests for US1+US2 (write FIRST — verify they FAIL before implementation)

- [x] T003 [US1] Add `describe("computeForecast")` block to `tests/unit/ha-api.test.ts` with test scenarios 1–4: scenario 1 (2/365 buckets, pct≈0.003 → `enabled:false`); scenario 2 (4/30, pct≈0.13 → `enabled:true`, `confidence:"low"`); scenario 3 (7/30, pct≈0.23 → `confidence:"medium"`); scenario 4 (13/30, pct≈0.43 → `confidence:"high"`)
- [x] T004 [US1] Add guard test scenarios to describe block in `tests/unit/ha-api.test.ts`: scenario 10 (no reference series → `enabled:false`); scenario 11 (`periodTotalBuckets=0` → `enabled:false`); scenario 12 (B=0 / rawTrend=Infinity → `enabled:false`); scenario 13 (`completedBuckets=2` < 3 → `enabled:false`)
- [x] T005 [US2] Add time-gap test scenarios to describe block in `tests/unit/ha-api.test.ts`: scenario 9 (current series has missing midpoint gap — verify `splitIdx` is computed from ms range, not array index, B/C are correct); scenario 14 (all reference timestamps later than current range → `splitIdx=-1`, `enabled:false`)

### Implementation for US1+US2

- [x] T006 [US1] In `src/card/ha-api.ts`: replace `computeForecast` signature to `computeForecast(series: ComparisonSeries, periodTotalBuckets: number): ForecastStats` — implement Guard 1 (`periodTotalBuckets <= 0` or `currentPoints.length === 0` → disabled), Guard 2 (`completedBuckets = length - 1 < 3` or `pct = completedBuckets / periodTotalBuckets < 0.05` → disabled), Guard 3 (empty/null `referencePoints` → disabled)
- [x] T007 [US2] In `src/card/ha-api.ts`: implement time-based `splitIdx` — compute `currentRangeMs = currentPoints[completedBuckets-1].timestamp - currentPoints[0].timestamp`, `cutoffTs = currentPoints[0].timestamp + currentRangeMs`, find last `referencePoints[i].timestamp <= cutoffTs`; add Guard 4 (`splitIdx === -1` → disabled)
- [x] T008 [US1] In `src/card/ha-api.ts`: implement B sum (`referencePoints[0..splitIdx].rawValue ?? 0`), Guard 5 (`B <= 0` → disabled), A sum (`currentPoints[0..completedBuckets-1].rawValue ?? 0`), `rawTrend = A / B`, `confidence` from pct (`>= 0.40 → "high"`, `>= 0.20 → "medium"`, else `"low"`), `trend = Math.min(5, Math.max(0.2, rawTrend))`, C sum (`referencePoints[splitIdx+1..end]`), `forecast_total = A + C * trend`, `reference_total = B + C`; return `{ enabled: true, forecast_total, reference_total, confidence, unit }`

**Checkpoint**: `npm test` — scenarios 1–5 (threshold + splitIdx) should pass. `computeSummary` / `computeTextSummary` tests unchanged.

---

## Phase 3: US3 – Anomalous Reference Detection (Priority: P2)

**Goal**: When `rawTrend < 0.3` or `rawTrend > 3.3`, the system flags `anomalousReference: true` and caps `confidence` at `"low"` — the forecast is still returned with `enabled: true`.

**Independent Test**: Call `computeForecast` with current/reference data where A ≈ 4× B (rawTrend ≈ 4.0) and verify `anomalousReference:true`, `confidence:"low"`, `enabled:true`.

### Tests for US3 (write FIRST — verify they FAIL before implementation)

- [x] T009 [US3] Add anomaly test scenarios to describe block in `tests/unit/ha-api.test.ts`: scenario 5 (`rawTrend=4.0` → `anomalousReference:true`, `confidence:"low"`, `enabled:true`); scenario 6 (`rawTrend=0.2` → `anomalousReference:true`, `confidence:"low"`, `enabled:true`); scenario 7 (`rawTrend=1.1` → `anomalousReference` absent/false, confidence not degraded); scenario 15 (`rawTrend=3.3` exactly, boundary — NOT anomaly → `anomalousReference` absent/false)

### Implementation for US3

- [x] T010 [US3] In `src/card/ha-api.ts` inside `computeForecast`: after computing `rawTrend`, add `const anomalousReference = rawTrend < 0.3 || rawTrend > 3.3`; if true, override `confidence = "low"`; conditionally set `if (anomalousReference) result.anomalousReference = true` on the returned object (FR-009, FR-014)

**Checkpoint**: `npm test` — scenarios 5–7, 15 should now pass.

---

## Phase 4: US4 – C = 0 Edge Case (Priority: P2)

**Goal**: When the reference series ends at `splitIdx` (no remaining reference data), `C = 0` and the formula `forecast_total = A + C * trend = A + 0 = A` naturally satisfies `enabled:true`, `forecast_total = A`. No new implementation code required — only test coverage.

**Independent Test**: Call `computeForecast` with reference series where all points fall within `currentRangeMs` (so `splitIdx = referencePoints.length - 1`, C = 0). Verify `enabled:true` and `forecast_total = A`.

### Tests for US4 (write FIRST — verify they FAIL, then pass after Phase 2 impl is complete)

- [x] T011 [US4] Add C=0 test scenarios to describe block in `tests/unit/ha-api.test.ts`: scenario 8 (reference ends at splitIdx → C=0 → `enabled:true`, `forecast_total = A`); combined scenario (C=0 + rawTrend=4.0 → `enabled:true`, `forecast_total=A`, `anomalousReference:true`, `confidence:"low"`)

*(No implementation task — formula `A + C * trend` handles C=0 naturally. Test confirms correctness.)*

**Checkpoint**: All 15 test scenarios from quickstart.md should pass after T011.

---

## Phase 5: Call-site Update & Polish

**Purpose**: Wire the new `periodTotalBuckets` argument into the actual card rendering pipeline and validate no regressions.

- [x] T012 Update call-site in `_loadData()` method in `src/card/cumulative-comparison-chart.ts` — replace `const forecast = computeForecast(series)` with: `const fullEnd = this._computeFullEnd(period); const fullTimeline = buildFullTimeline(period, fullEnd); const forecast = computeForecast(series, fullTimeline.length);` (FR-015; `buildFullTimeline` already imported from `./ha-api` line 11; `_computeFullEnd` is existing private method)
- [x] T013 Run `npm test` — verify all min. 15 scenarios pass and existing `computeSummary`, `computeTextSummary`, `buildFullTimeline`, chart renderer tests are unaffected (SC-005)
- [x] T014 Run `npm run lint` — fix any TypeScript strict-mode errors or lint warnings introduced by the changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately; T001 and T002 run in parallel (different files)
- **Phase 2 (US1+US2)**: T001 and T002 must be complete — T003/T004/T005 (tests) written first and verified to FAIL, then T006 → T007 → T008 sequentially (same function, sequential edits)
- **Phase 3 (US3)**: Phase 2 implementation (T006–T008) must be complete — T009 (tests) first, then T010
- **Phase 4 (US4)**: Phase 3 (T010) must be complete — T011 (tests only); no additional implementation
- **Phase 5 (Polish)**: All implementation phases complete — T012 → T013 → T014 sequentially

### User Story Dependencies

- **US1 (P1)**: Foundational complete → no other story dependency
- **US2 (P1)**: Implemented together with US1 (same function) — no independent phase possible
- **US3 (P2)**: Depends on US1+US2 implementation (extends same function)
- **US4 (P2)**: Depends on US3 (needs anomaly logic for combined scenario test)

### Parallel Opportunities

- **T001 ‖ T002**: Different files — run in parallel (Phase 1)
- **T003, T004, T005**: Same test file — sequential, but all written before any implementation starts
- **US3 tests (T009)**: Can be written in parallel with US1+US2 implementation (T006–T008) since they're in `ha-api.test.ts` (same file = sequential commits, but LLM can prepare them during implementation)

---

## Parallel Example: US1+US2 (Phase 2)

```bash
# Step 1: Write all tests first (sequential — same file):
Task 1: T003 — threshold scenarios 1–4
Task 2: T004 — guard scenarios 10–13
Task 3: T005 — time-gap scenarios 9, 14
# Run: npm test → expect these tests to FAIL

# Step 2: Implement (sequential — same function):
Task 4: T006 — signature + Guards 1–3
Task 5: T007 — time-based splitIdx + Guard 4
Task 6: T008 — A/B/C sums + confidence + return value
# Run: npm test → expect Phase 2 tests to PASS
```

---

## Implementation Strategy

### MVP First (US1+US2 Only — Phase 1 + Phase 2)

1. Complete Phase 1: Type update (`types.ts`, remove constant)
2. Write tests T003–T005 (TDD: verify they FAIL)
3. Implement T006 → T007 → T008 (core algorithm)
4. **STOP and VALIDATE**: `npm test` — all pct-threshold and splitIdx scenarios pass
5. Update call-site (T012) and run `npm run lint`

### Incremental Delivery

1. Phase 1 → Phase 2 → validate → **working percentage-based forecast (MVP)**
2. Phase 3 (US3) → anomaly detection added → validate
3. Phase 4 (US4) → C=0 confirmed working → validate
4. Phase 5 → call-site wired, full lint+test pass → **feature complete**

---

## Notes

- All changes confined to 4 files: `src/card/types.ts`, `src/card/ha-api.ts`, `src/card/cumulative-comparison-chart.ts`, `tests/unit/ha-api.test.ts`
- Zero new NPM dependencies
- Do NOT modify: `computeSummary`, `computeTextSummary`, `buildFullTimeline`, chart renderer, echarts-renderer
- `rawValue ?? 0` is the safe fallback for all point sums (`normalizePoints` always sets it)
- Boundary values `rawTrend === 0.3` and `rawTrend === 3.3` are NOT anomalies (condition is `< 0.3 || > 3.3`)
- Implementacja T010: `10*A < 3*B || 10*A > 33*B` przy `B > 0` — równoważne ścisłym nierównościom na `A/B`, bez błędu float na brzegu (np. A=33, B=10)
- `anomalousReference` absent from result object is contractually equivalent to `false` (quickstart.md Assumptions)
