# Tasks: Narrative Engine Refactor

**Input**: `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/` — [plan.md](./plan.md), [spec.md](./spec.md) (§ **Narrative Engine Refactor**, **US-903-N1–N5**, **FR-903-NA–NJ**), [data-model.md](./data-model.md), [contracts/narrative-i18n.md](./contracts/narrative-i18n.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Prerequisites**: `plan.md`, `spec.md`

**Tests**: Included — **FR-903-NG**, **SC-903-N1–N6**, and constitution require unit coverage for `classifyComparisonStep`, i18n fallback, and mandatory dictionary keys.

**Note**: The earlier *Interpretation mode / neutral band* task list (v1.1.0, T001–T018) is **complete**; retrieve it from **git history** if needed. This file tracks **Narrative Engine Refactor** only.

## Format

`- [ ] TNNN [P?] [USNn?] Description with absolute file path`

---

## Phase 1: Setup (repository baseline)

**Purpose**: Confirm a green toolchain before narrative refactors.

- [x] T001 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon` and record baseline; fix only **pre-existing** failures unrelated to this feature before starting Phase 2.

---

## Phase 2: Foundational (pure narrative + i18n utilities)

**Purpose**: **`classifyComparisonStep`**, **`interpretationToEntityKind`**, **`hasTranslationKey`** — **BLOCKS** all user stories (**FR-903-NA**, **FR-903-NF**, **FR-903-NE** / **FR-905-K**).

**Checkpoint**: New unit tests pass; chart file not yet required to compile against new narrative keys.

- [x] T002 Implement `classifyComparisonStep` (and exported `StepKind` type) in `/Users/admin/Projekty Local/Energy-Horizon/src/card/narrative/classify-comparison-step.ts` per normative table in `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/spec.md` (**FR-903-NA**).
- [x] T003 Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/classify-comparison-step.test.ts` covering edge cases **EC-N1–EC-N12** (and undefined/empty `step`) from spec § Narrative Engine.
- [x] T004 Implement `interpretationToEntityKind` in `/Users/admin/Projekty Local/Energy-Horizon/src/card/narrative/interpretation-to-entity-kind.ts` (or colocate with T002 in the same folder) per **FR-903-NF**.
- [x] T005 Add `hasTranslationKey(language: string, key: string): boolean` to `/Users/admin/Projekty Local/Energy-Horizon/src/card/localize.ts` (same dictionary resolution order as `getRawTemplate`) per **FR-903-NE** / **FR-905-K**.
- [x] T006 Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/localize-has-translation-key.test.ts` (or extend an existing localize unit file) asserting fallback visibility behavior for **primary vs `en`** dictionaries.

---

## Phase 3: User Story US-903-N1 — Custom billing cycle (`step: 1M` + offset) (Priority: P1) 🎯 MVP

**Goal**: Narrative uses **month** period phrase from declared `step`, not geometry / “last year” copy (**SC-903-N2**, **EC-N1–EC-N5**).

**Independent test**: Card config with `step: 1M`, `offset` shifting window starts off calendar month boundary → rendered template uses `text_summary.period.month` fragment inside full sentence; `classifyComparisonStep("1M") === "month"`.

- [x] T007 [USN1] Add `/Users/admin/Projekty Local/Energy-Horizon/src/translations/CONTEXT.md` documenting positional grammar for `text_summary.period.*` per **FR-903-NI** / **FR-905-M**.
- [x] T008 [P] [USN1] Migrate `/Users/admin/Projekty Local/Energy-Horizon/src/translations/en.json` to three-layer `text_summary` keys per `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/data-model.md` and `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/contracts/narrative-i18n.md` (remove `*_mom` / flat consumption keys; add mandatory **11** keys including `text_summary.generic.neutral_band`).
- [x] T009 [P] [USN1] Migrate `/Users/admin/Projekty Local/Energy-Horizon/src/translations/pl.json` with the same key schema as **T008**.
- [x] T010 [P] [USN1] Migrate `/Users/admin/Projekty Local/Energy-Horizon/src/translations/de.json` with the same key schema as **T008**.
- [x] T011 [P] [USN1] Migrate `/Users/admin/Projekty Local/Energy-Horizon/src/translations/fr.json` with the same key schema as **T008**.
- [x] T012 [USN1] In `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts`: delete `resolvedWindowsAreConsecutiveCalendarMonths` and **`isMom`** usage (**FR-903-NB**); resolve narrative sentence keys with **`hasTranslationKey`** fallback `entityKind` → `generic` (**FR-903-NE**); compose **`{{referencePeriod}}`** from `localize("text_summary.period." + stepKind)`; map **`SemanticOutcome`** to trend keys per **FR-903-NH**; use **`text_summary.insufficient_data`** for insufficient comparison path (not `no_reference`). Pass `mergedTimeWindow.step` from `this._state.mergedTimeWindow ?? this._mergedTimeWindow` into **`classifyComparisonStep`**.

**Checkpoint**: **US-903-N1** acceptance scenarios hold; `npm test` green for touched modules.

---

## Phase 4: User Story US-903-N2 — Weekly report (`step: 1w`) (Priority: P1)

**Goal**: **`classifyComparisonStep("1w") === "week"`** and narrative uses **`text_summary.period.week`** (**US-903-N2** acceptance / **EC-N8**).

**Independent test**: Unit or localization test asserts week period fragment appears for `1w` step configuration.

- [x] T013 [USN2] Extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/cumulative-comparison-chart-localization.test.ts` (or add a focused narrative test file) to cover **`step: 1w`** → **`week`** period key resolution / localized substring expectations.

---

## Phase 5: User Story US-903-N3 — Non-standard window (`step: 16d` → reference) (Priority: P1)

**Goal**: **`classifyComparisonStep("16d") === "reference"`** and copy uses **`text_summary.period.reference`** (**EC-N10**).

**Independent test**: Test asserts `reference` **StepKind** and narrative uses reference period fragment (no false “year” / “week” claim).

- [x] T014 [USN3] Add tests in `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/classify-comparison-step.test.ts` or `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/cumulative-comparison-chart-localization.test.ts` for **`16d`** / **`3M`** → **`reference`** and expected **`text_summary.period.reference`** usage in composed narrative.

---

## Phase 6: User Story US-903-N4 — Translator minimal bootstrap (Priority: P2)

**Goal**: Language file with only **`generic.*`**, **`period.*`**, **`no_reference`**, **`insufficient_data`** renders without error (**SC-903-N3**).

**Independent test**: Fixture or temp JSON + test that **`interpretation: production`** resolves via **`generic.*`** when **`production.*`** keys absent.

- [x] T015 [USN4] Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/narrative-mandatory-keys.test.ts` (or extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/localize-dictionary-loading.test.ts`) that iterates every `/Users/admin/Projekty Local/Energy-Horizon/src/translations/*.json` and asserts all **11** mandatory keys from **FR-903-NG** / **FR-905-L** exist; optionally assert minimal-language fixture narrative resolves.

---

## Phase 7: User Story US-903-N5 — Extensible `entityKind` (Priority: P2)

**Goal**: Future entity kinds add **3 keys × languages** + **one map branch** without render-template edits (**SC-903-N4**).

**Independent test**: Code review / static structure: `interpretationToEntityKind` is the single routing function exported for YAML → **`EntityKind`** namespace.

- [x] T016 [USN5] Document in JSDoc on `/Users/admin/Projekty Local/Energy-Horizon/src/card/narrative/interpretation-to-entity-kind.ts` (and one-line comment in `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/data-model.md` if needed) how to add a new **`EntityKind`** (e.g. `export`) per **US-903-N5** acceptance criteria.

---

## Phase 8: Polish & cross-cutting (tests, **907** docs, release)

**Purpose**: Remove stale assertions, align **907** artifacts with **FR-903-NJ** / **SC-903-N6**.

- [x] T017 Update `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/cumulative-comparison-chart-localization.test.ts` and `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/localize-dictionary-loading.test.ts` to remove expectations for removed keys (`*_mom`, flat `text_summary.higher`, etc.) and assert new key paths per **FR-903-NC** / **FR-903-ND**.
- [x] T018 [P] Per **FR-903-NJ**: add user-visible **CHANGELOG** entry under the correct **`[x.y.z]`** heading in `/Users/admin/Projekty Local/Energy-Horizon/CHANGELOG.md` (semver **must match** the published **git tag**, e.g. **`[1.1.0]`** or the next release section); review and update `/Users/admin/Projekty Local/Energy-Horizon/README.md`, `/Users/admin/Projekty Local/Energy-Horizon/README-advanced.md`, and `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/` wherever narrative, **`time_window.step`**, offsets, or translator workflows are described.
- [x] T019 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon`; fix regressions; manually smoke-test scenarios in `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/quickstart.md`.

---

## Dependencies & execution order

### Phase dependencies

| Phase | Depends on |
|-------|------------|
| 1 Setup | — |
| 2 Foundational | Phase 1 |
| 3 US-903-N1 | Phase 2 (**T012** depends on **T002–T006**, **T008–T011**, **T007**) |
| 4 US-903-N2 | Phase 3 (narrative wiring + dictionaries) |
| 5 US-903-N3 | Phase 2 (can parallelize **T014** with Phase 4 after Phase 2 if only classifier tests — prefer after Phase 3 for integration confidence) |
| 6 US-903-N4 | Phase 3 (dictionaries migrated) |
| 7 US-903-N5 | Phase 2 (**T016** can run in parallel with Phase 3+ once **T004** exists) |
| 8 Polish | Phases 3–7 complete (or at least **T012** + all translation files) |

### User story dependencies

- **US-903-N1**: MVP — requires Foundational + full i18n migration + chart wiring.
- **US-903-N2 / US-903-N3**: Validated primarily via tests once **T012** and dictionaries exist.
- **US-903-N4**: Requires migrated JSON files under `src/translations/`.
- **US-903-N5**: Documentation-only; weak dependency on **T004**.

### Parallel opportunities

- **T008–T011** after **T007** (and key list frozen): all **`[P]`** across language files.
- **T018** can proceed in parallel with **T017** once copy is stable (different files).
- **T016** ∥ **T008–T011** (docs vs JSON) after **T004**.

---

## Parallel example (after T007 + T002–T006)

```text
# Migrate all locale JSON in parallel:
T008  src/translations/en.json
T009  src/translations/pl.json
T010  src/translations/de.json
T011  src/translations/fr.json
```

---

## Implementation strategy

### MVP (US-903-N1 only)

1. Complete **Phase 1–2** (**T001–T006**).
2. Complete **Phase 3** (**T007–T012**) — correct month narrative for offset billing + merged **`step`**.
3. **STOP**: run **`npm test`**; manually verify **US-903-N1** acceptance on a dev HA dashboard.

### Full feature (all stories + release)

4. **Phases 4–7** (**T013–T016**).
5. **Phase 8** (**T017–T019**) — tests cleanup, **907** docs + **CHANGELOG**, final CI green.

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 19 (**T001–T019**) |
| **US-903-N1** | 6 implementation tasks (**T007–T012**) |
| **US-903-N2** | 1 (**T013**) |
| **US-903-N3** | 1 (**T014**) |
| **US-903-N4** | 1 (**T015**) |
| **US-903-N5** | 1 (**T016**) |
| **Setup + Foundational + Polish** | 9 (**T001–T006**, **T017–T019**) |
| **Parallel-friendly** | **T008–T011**, **T018** (with coordination), **T016** |

---

## Notes

- Primary files: `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/card/localize.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/card/narrative/*.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/*.json`.
- Do **not** change **`computeTextSummary`** / **`computeInterpretationSemantics`** beyond what **spec** allows (**Non-Goals**).
- Cross-domain refs: **`905-localization-formatting/spec.md`** (mandatory keys), **`900-time-model-windows/spec.md`** (**`mergedTimeWindow.step`** contract).
