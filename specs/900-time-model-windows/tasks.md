# Tasks: Time model — ISO `time_window.offset` (FR-900-Q)

**Input**: `/Users/admin/Projekty Local/Energy-Horizon/specs/900-time-model-windows/` — [plan.md](./plan.md), [spec.md](./spec.md) (**US-900-1**–**US-900-8**, **FR-900-Q**, **SC-900-6**), [data-model.md](./data-model.md), [contracts/time-window-offset.md](./contracts/time-window-offset.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Prerequisites**: `plan.md`, `spec.md`

**Tests**: Included — **SC-900-6**, **US-900-8**, edge cases **11–20** in [spec.md](./spec.md) require Vitest coverage for offset parsing and resolution.

**Format**: `- [ ] TNNN [P?] [USn?] Description with absolute file path`

**Note**: `check-prerequisites.sh --json` may fail when not on a speckit feature branch; paths above remain valid via `.specify/feature.json` → `feature_directory`.

---

## Phase 1: Setup (repository baseline)

**Purpose**: Green toolchain before changing time-window code.

- [X] T001 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon` and record baseline; fix only **pre-existing** failures unrelated to this feature before starting Phase 2.

---

## Phase 2: Foundational — single offset parser + call sites (BLOCKS all user stories)

**Purpose**: **FR-900-Q** — one module, Luxon ISO + legacy shim; **`validate.ts`** and **`resolve-windows.ts`** consume it; **`ComparisonWindow[]` unchanged**.

**Checkpoint**: `parseTimeWindowOffset` exists and throws/returns consistently; merge + resolve compile.

- [X] T002 Add `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/parse-time-window-offset.ts` implementing `parseTimeWindowOffset` per `/Users/admin/Projekty Local/Energy-Horizon/specs/900-time-model-windows/contracts/time-window-offset.md` and `/Users/admin/Projekty Local/Energy-Horizon/specs/900-time-model-windows/research.md` (ISO via `Duration.fromISO`, legacy `+1d`/`+3M` shim in one function, reject sub-hour non-zero, fractional Y/M, invalid ISO).
- [X] T003 [P] Replace **offset-only** `parseDurationToken` usage with `parseTimeWindowOffset` in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/validate.ts` (keep `parseDurationToken` for `step` and `duration`); rejected offset → `status.config_invalid_time_window` / same assert messages as today.
- [X] T004 [P] Replace **offset-only** `parseDurationToken` usage in `computeStartOfWindow0` in `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/resolve-windows.ts`; preserve `start_of_year` year-backoff loop behavior per [research.md](./research.md).
- [X] T005 Export `parseTimeWindowOffset` from `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/index.ts` for unit tests and traceability (**FR-900-Q** single entry point).

---

## Phase 3: User Story US-900-1 — Preset backward compatibility (Priority: P1) 🎯 MVP

**Goal**: No `time_window` block and `offset: P0D` / omitted `offset` behave like the pre-change product (**US-900-1**, **US-900-6** scenario 3).

**Independent test**: Preset goldens and merge tests unchanged for configs without ISO compound offset; `P0D` ≡ omitted.

- [X] T006 [US1] Extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-presets-golden.test.ts` and/or `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-merge-validate.test.ts` to assert `offset` omitted vs `P0D` yields identical validation outcome and identical `window[0].start` for a fixed `now` + zone in `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts`.

---

## Phase 4: User Story US-900-8 — Invalid offset + legacy aliases (Priority: P1)

**Goal**: `PT30M`, `P0.5M`, malformed strings fail fast with **standard** invalid `time_window` handling; legacy `+3M` / `+1d` still accepted (**US-900-8**, Clarifications 2026-04-22).

**Independent test**: Vitest covers rejections and legacy acceptance; `validateMergedTimeWindowConfig` returns `status.config_invalid_time_window` for bad offset.

- [X] T007 [P] [US8] Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-offset-iso.test.ts` with direct `parseTimeWindowOffset` cases: reject `PT30M`, `PT59M`, `P0.5M`, malformed garbage; accept legacy `+3M`, `+1d` mapping to expected Luxon duration behavior.
- [X] T008 [US8] Extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-merge-validate.test.ts` so invalid merged `offset` yields `ok: false` with `errorKey: "status.config_invalid_time_window"` (not offset-specific keys).

---

## Phase 5: User Story US-900-6 — Compound billing anchor (Priority: P1)

**Goal**: `anchor: start_of_year` + `offset: P4M4D` + `duration: P1Y` resolves to **5 May** boundaries; leap clamping **P1M28D** → **1 Mar 2024** (**US-900-6**, edge cases **11–13**).

**Independent test**: Vitest golden dates in HA zone for fixed `now`.

- [X] T009 [US6] In `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-offset-iso.test.ts` (or `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts`), add golden assertions for **P4M4D** / **P1M28D** / **31 Jan + P1M** clamping per [spec.md](./spec.md) acceptance scenarios.

---

## Phase 6: User Story US-900-2 — Multiple windows with offset (Priority: P1)

**Goal**: `count: 3` (or **N**≥2) still resolves ordered windows when `offset` is non-zero; no regression to longest-axis behavior (**US-900-2**).

**Independent test**: Three `ResolvedWindow` entries with distinct `start`/`end` when `count: 3` and ISO `offset` present.

- [X] T010 [US2] Add or extend cases in `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts` for `count: 3`, valid `step`/`duration`, and non-zero ISO `offset`, asserting three windows and backward `step` spacing from resolved `window[0].start`.

---

## Phase 7: User Story US-900-7 — Negative offset before calendar year (Priority: P2)

**Goal**: `anchor: start_of_year` + `offset: -P2M` yields **2025-11-01** for `now = 2026-04-22` in instance zone (**US-900-7**).

**Independent test**: Vitest golden `window[0].start`.

- [X] T011 [US7] Add golden test in `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-offset-iso.test.ts` for **US-900-7** acceptance scenario 1 (fixed `now`, fixed IANA zone string used elsewhere in tests).

---

## Phase 8: User Story US-900-5 — Invalid config surface (Priority: P2)

**Goal**: Invalid `offset` is consistent with other invalid `time_window` errors; `count: 25` still uses too-many-windows path (**US-900-5**, **FR-900-E**).

**Independent test**: `validateMergedTimeWindowConfig` error keys unchanged class for offset vs `step: 0` style failures.

- [X] T012 [US5] Extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-merge-validate.test.ts` to assert `count: 25` still returns `status.config_too_many_windows` and invalid `offset` still returns `status.config_invalid_time_window` (no silent truncation).

---

## Phase 9: User Story US-900-4 — Custom billing cycles (Priority: P2)

**Goal**: Multi-month offset from year start produces two adjacent full billing windows (**US-900-4**).

**Independent test**: Vitest with `duration: P1Y`, `count: 2`, anchor + offset producing October-aligned cycles (or equivalent documented in test comment).

- [X] T013 [US4] Add billing-cycle resolution case in `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts` covering **US-900-4** acceptance (explicit `start`/`end` dates in test comment + assertions).

---

## Phase 10: User Story US-900-3 — “Now” marker / carry-forward (Priority: P2)

**Goal**: Offset work does not alter **FR-900-G** behavior for open bucket / “now” alignment (**US-900-3**).

**Independent test**: Existing or new resolve test: same `now` index behavior with and without `P0D` offset for daily aggregation window.

- [X] T014 [US3] Extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-resolve.test.ts` (or the most relevant existing unit file under `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/`) with a narrow regression: resolving windows with `offset: P0D` vs omitted `offset` does not change `window[0].end` relative to mocked `now` for a representative `aggregation: "day"` config.

---

## Phase 11: Polish & cross-cutting

**Purpose**: LTS layer consistency, **907** docs, release hygiene per [spec.md](./spec.md) Assumptions.

- [X] T015 Review `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/lts-hard-limits.ts`; if `offset` can reach LTS fetch with sub-hour duration, delegate to the same `parseTimeWindowOffset` rules or document why validate-only is sufficient (no duplicate conflicting rules).
- [X] T016 [P] Update `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/` (time-window / offset examples), `/Users/admin/Projekty Local/Energy-Horizon/README.md`, and `/Users/admin/Projekty Local/Energy-Horizon/README.advanced.md` per **907-docs-product-knowledge** and spec Assumptions (ISO offset, deprecated legacy shim).
- [X] T017 Append `/Users/admin/Projekty Local/Energy-Horizon/changelog.md` under the target release section documenting ISO `offset` + legacy deprecation per **FR-900-Q** / spec **Assumptions**.
- [X] T018 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon` before merge.

---

## Dependencies & execution order

### Phase dependencies

- **Phase 1** → no deps.
- **Phase 2** → depends on Phase 1; **blocks** Phases 3–11.
- **Phases 3–10** (user stories) → all depend on Phase 2 completion. Recommended sequence: **US1** (T006) → **US8** (T007–T008) → **US6** (T009) → **US2** (T010) → **US7** (T011) → **US5** (T012) → **US4** (T013) → **US3** (T014). **US8** tests (T007) can start in parallel with **T003** only after **T002** if T007 imports only the new parser file (different file from T003).
- **Phase 11** → after all stories required for the release milestone (minimum **US1**, **US6**, **US8** for offset MVP).

### User story dependency notes

- **US1**, **US6**, **US8**: Core offset MVP; **US8** should not break **US1**.
- **US2**, **US7**, **US5**, **US4**, **US3**: Independent given Phase 2 done; order above minimizes merge conflicts in the same test files.

### Parallel opportunities

- **T003**, **T004**, **T007** [P] after **T002**: two call sites + parser unit tests + new test file (no shared file conflicts).
- **T016** [P]: documentation files can edit in parallel after implementation stabilizes.

---

## Parallel example: after T002

```text
Developer A: T003 /Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/validate.ts
Developer B: T004 /Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/resolve-windows.ts
Developer C: T007 /Users/admin/Projekty Local/Energy-Horizon/tests/unit/time-windows-offset-iso.test.ts (parser-focused cases)
```

---

## Implementation strategy

### MVP (offset correctness + safety)

1. Complete Phase 1–2 (**T001**–**T005**).
2. Complete **US-900-1** (**T006**), **US-900-8** (**T007**–**T008**), **US-900-6** (**T009**).
3. Run **T018**; stop for review if green.

### Full spec slice for 900 offset program

1. MVP above, then **US-900-2** (**T010**), **US-900-7** (**T011**), **US-900-5** (**T012**), **US-900-4** (**T013**), **US-900-3** (**T014**).
2. Phase 11 (**T015**–**T018**).

### Parallel team

After **T002**: one developer on **T003–T005**, another on **T007**; then divide **T009**–**T014** by story.

---

## Task summary

| Metric | Value |
|--------|--------|
| **Total tasks** | 18 (**T001**–**T018**) |
| **Setup + Foundational** | 5 (**T001**–**T005**) |
| **Per user story** | US1: 1 (**T006**); US2: 1 (**T010**); US3: 1 (**T014**); US4: 1 (**T013**); US5: 1 (**T012**); US6: 1 (**T009**); US7: 1 (**T011**); US8: 2 (**T007**–**T008**) |
| **Polish** | 4 (**T015**–**T018**) |
| **[P] parallel** | **T003**, **T004**, **T007**, **T016** |
| **Format** | All lines use `- [ ]`, sequential `TNNN`, story label only on Phases 3–10, absolute `/Users/admin/Projekty Local/Energy-Horizon/...` paths |

---

## Notes

- Cross-domain **904** / **901** / **903** / **905** items are scoped in [spec.md](./spec.md) Assumptions; this `tasks.md` stays in **900** code + tests + **907** docs/changelog.
- **`tasks.md` checklist format**: every task line matches `- [ ] TNNN [P?] [USn?] Description with absolute file path`.
