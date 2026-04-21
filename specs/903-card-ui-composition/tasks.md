# Tasks: Interpretation mode, neutral band & insufficient-data path

**Input**: `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/` — [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Prerequisites**: `plan.md`, `spec.md` (user stories **US-903-7**, **US-903-8**, **US-903-9** drive this feature)

**Tests**: Included — spec **SC-903-8**, **SC-903-9**, and constitution require unit coverage for semantic mapping.

## Format

`- [x] TNNN [P?] [USn?] Description with file path`

---

## Phase 1: Setup (repository baseline)

**Purpose**: Confirm the existing Energy Horizon toolchain before changing behavior.

- [x] T001 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon` and fix any **pre-existing** failures before feature work (establish baseline).

---

## Phase 2: Foundational (blocking — types + semantic core)

**Purpose**: **`CardConfig`**, pure **interpretation semantics** helper, and **Vitest** coverage — required before editor polish and full UI wiring.

**Checkpoint**: Helper passes all unit tests; no narrative/UI dependency yet.

- [x] T002 Extend `CardConfig` / `CardConfigInput` and config normalization in `/Users/admin/Projekty Local/Energy-Horizon/src/card/types.ts` and `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts` (and `/Users/admin/Projekty Local/Energy-Horizon/src/card/time-windows/merge-config.ts` if defaults merge there) with **`interpretation`** and **`neutral_interpretation`** per **FR-903-P** and **FR-903-V**.
- [x] T003 Implement `computeInterpretationSemantics` (or equivalent) in `/Users/admin/Projekty Local/Energy-Horizon/src/card/interpretation-semantics.ts` per `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/data-model.md` (outcomes: `positive` \| `negative` \| `neutral` \| `insufficient_data`; neutral when **`|p| ≤ T`**; reference-zero and placeholder rules from **spec.md** Edge Cases 15–17).
- [x] T004 Add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/interpretation-semantics.test.ts` covering consumption, production, neutral band, `T` default/invalid, reference = 0, missing **`p`**, and case-insensitive `interpretation` parse.

---

## Phase 3: User Story US-903-7 — Configure interpretation (P1)

**Goal**: YAML **`interpretation`** + Lovelace editor control; shallow-merge preserves **`neutral_interpretation`** and other YAML-only keys.

**Independent test**: Set `interpretation: production` in YAML or editor → config emits correct value; change another field in Visual mode → `interpretation` unchanged unless edited.

- [x] T005 [US7] Add `interpretation` field to `SCHEMA` and form wiring in `/Users/admin/Projekty Local/Energy-Horizon/src/card/energy-horizon-card-editor.ts` (select: `consumption` \| `production`, default **consumption**, radio-style UX per **904** / **FR-903-T**).
- [x] T006 [P] [US7] Add `editor.interpretation` (and option labels if split) to `/Users/admin/Projekty Local/Energy-Horizon/src/translations/en.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/pl.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/de.json`.
- [x] T007 [US7] Ensure `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts` **`getStubConfig()`** / defaults expose safe defaults for **`interpretation`** (consumption) and that **`neutral_interpretation`** is preserved on editor **`config-changed`** (shallow merge).

---

## Phase 4: User Story US-903-8 — Production semantics (P1)

**Goal**: **`interpretation: production`** → higher current than reference reads **positive** (success, trend-up copy); chart delta segment colors match narrative (**FR-903-R**).

**Independent test**: Production entity, current > ref → production **`localize()`** strings + success styling on icon and delta line.

- [x] T008 [P] [US8] Add production-oriented narrative **`localize()`** keys to `/Users/admin/Projekty Local/Energy-Horizon/src/translations/en.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/pl.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/de.json` per **FR-903-S** (outside neutral band).
- [x] T009 [US8] Wire narrative / summary row in `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts` to **`interpretation-semantics`** + **`localize()`** for production vs consumption vs neutral vs **insufficient_data** (**FR-903-Q**, **FR-903-W**).
- [x] T010 [US8] Pass semantic outcome (or color role) into `/Users/admin/Projekty Local/Energy-Horizon/src/card/echarts-renderer.ts` and extend `/Users/admin/Projekty Local/Energy-Horizon/src/card/types.ts` **`ChartRendererConfig`** (or equivalent) so **delta segment** styling matches narrative (**902** / **FR-903-R**).

---

## Phase 5: User Story US-903-9 — Consumption legacy (P1)

**Goal**: Omitted or **`consumption`** matches **prior** behavior: current > ref → warning semantics; current < ref → success.

**Independent test**: Same data as pre-1.1.0 consumption cards → same semantic colors/copy class as baseline (per **SC-903-7**).

- [x] T011 [US9] Extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/interpretation-semantics.test.ts` (or add `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/interpretation-consumption-legacy.test.ts`) asserting consumption mapping matches legacy polarity for representative totals and **`p`**.
- [x] T012 [US9] Update or extend `/Users/admin/Projekty Local/Energy-Horizon/tests/unit/trend-visual.test.ts` (and/or `/Users/admin/Projekty Local/Energy-Horizon/tests/integration/card-render.test.ts`) if they assert narrative/chart trend semantics — align expectations with **`interpretation`** default **consumption**.

---

## Phase 6: Polish & cross-cutting (i18n completeness, docs, release)

**Purpose**: Neutral-band copy, insufficient-data styling, documentation, **1.1.0** changelog.

- [x] T013 [P] Add neutral-band and **insufficient-data** narrative keys to `/Users/admin/Projekty Local/Energy-Horizon/src/translations/en.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/pl.json`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/de.json` (**FR-903-S**, **FR-903-W**).
- [x] T014 Add or adjust semantic classes / HA token usage for neutral vs insufficient-data in `/Users/admin/Projekty Local/Energy-Horizon/src/card/energy-horizon-card-styles.ts` (muted ≠ neutral-band “similar”).
- [x] T015 [P] Update `/Users/admin/Projekty Local/Energy-Horizon/README.md` and `/Users/admin/Projekty Local/Energy-Horizon/README-advanced.md` with **`interpretation`** and **`neutral_interpretation`** (see [quickstart.md](./quickstart.md)).
- [x] T016 [P] Update `/Users/admin/Projekty Local/Energy-Horizon/wiki-publish/` and `/Users/admin/Projekty Local/Energy-Horizon/CHANGELOG.md` **[1.1.0]** per **907** and [plan.md](./plan.md).
- [x] T017 [P] Reconcile `/Users/admin/Projekty Local/Energy-Horizon/specs/903-card-ui-composition/contracts/card-interpretation.yaml` with final YAML property names and comments if implementation differs.
- [x] T018 Run `npm test && npm run lint` from `/Users/admin/Projekty Local/Energy-Horizon`; fix regressions; validate [quickstart.md](./quickstart.md) examples manually if possible.

---

## Dependencies & execution order

### Phase dependencies

| Phase | Depends on |
|-------|------------|
| 1 Setup | — |
| 2 Foundational | Phase 1 (baseline green) |
| 3 US-903-7 | Phase 2 |
| 4 US-903-8 | Phase 2 (Phase 3 can overlap T008 with T005–T007 if staffed — editor vs i18n) |
| 5 US-903-9 | Phase 2; best after Phase 4 narrative wiring |
| 6 Polish | Phases 3–5 complete |

### User story dependencies

- **US-903-7**: Requires Foundational (types + helper) for meaningful preview — **T005–T007** after **T002–T004**.
- **US-903-8**: Requires **T003** + narrative/chart files — **T008–T010** after Foundational.
- **US-903-9**: Validates consumption — **T011–T012** after semantic behavior stable (**T009–T010**).

### Parallel opportunities

- **T006** ∥ **T008** ∥ **T013** ∥ **T015** ∥ **T016** ∥ **T017** (different files / docs — after respective code dependencies).
- **T006** can follow **T005** quickly (same feature area).

---

## Parallel example (after T005)

```bash
# Translations for editor (T006) can proceed in parallel with production keys (T008) once T003 API is stable:
# - src/translations/en.json (editor.* + card.summary.*)
# - pl.json, de.json
```

---

## Implementation strategy

### MVP (minimum shippable interpretation)

1. Complete **Phase 1–2** (T001–T004).
2. Complete **Phase 3** (T005–T007) — users can set mode via YAML/editor.
3. Complete **Phase 4** (T008–T010) — visible production/consumption semantics + chart parity.
4. **Stop & validate** quickstart scenarios ([quickstart.md](./quickstart.md)).

### Full 1.1.0

5. **Phase 5** (US-903-9 regression).
6. **Phase 6** — docs, changelog, full i18n for neutral + insufficient-data.

---

## Summary

| Metric | Value |
|--------|--------|
| **Total tasks** | 18 (T001–T018) |
| **US-903-7** | 3 tasks (T005–T007) |
| **US-903-8** | 3 tasks (T008–T010) |
| **US-903-9** | 2 tasks (T011–T012) |
| **Setup + Foundational + Polish** | 10 tasks (T001–T004, T013–T018) |
| **Parallel-friendly** | T006, T008, T011 (with deps), T013, T015, T016, T017 |

---

## Notes

- Primary implementation files: `/Users/admin/Projekty Local/Energy-Horizon/src/card/types.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/card/interpretation-semantics.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/card/cumulative-comparison-chart.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/card/echarts-renderer.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/card/energy-horizon-card-editor.ts`, `/Users/admin/Projekty Local/Energy-Horizon/src/translations/*.json`.
- **`neutral_interpretation`** remains **YAML-only** in v1 (no editor field) per spec — preserved via existing merge behavior (**T007**).
