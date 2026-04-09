# Implementation Plan: Figma-aligned Energy Horizon Card UI (v0.5.0)

**Branch**: `001-figma-ui-rollout` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-figma-ui-rollout/spec.md`

**Note**: Filled by `/speckit.plan`. Related context: [figma-design.md](../../figma-design.md), [figma-specify-prompt.md](../../figma-specify-prompt.md). Figma MCP `get_design_context` on node `113:437` was used to confirm alignment with `figma-design.md`.

## Summary

Deliver **v0.5.0** visual and layout parity with the Figma frame *Energy Horizon Card v0.5.0* while keeping the **same Lovelace card type** and **LTS-based data pipeline**. Work spans **CSS/Lit markup** (sections, tokens), **summary/forecast semantics** (notably **Total** = full reference window when the **Forecast \| Total** panel is shown — panel **hidden entirely** when `show_forecast: false`, per spec **Clarifications**), **ECharts** (today line, delta segment, axis label density, reference dot), **i18n**, **editor** parity, and **tests**. Implementation follows the phased backlog in `spec.md` (F1–F6); **Phase 2** task breakdown is produced by `/speckit.tasks` (`tasks.md`), not by this command.

## Technical Context

**Language/Version**: TypeScript 5.6+ (`strict`)  
**Primary Dependencies**: Lit 3.1, Apache ECharts 5.6, Luxon 3.7, date-fns 4.x, Vite 6, Vitest 2  
**Storage**: N/A (in-browser; HA stores Lovelace config)  
**Testing**: Vitest (`npm test`), ESLint (`npm run lint`)  
**Target Platform**: Modern browsers running Home Assistant Lovelace (desktop + mobile widths)  
**Project Type**: Single frontend package — custom Lovelace card (Web Component)  
**Performance Goals**: No noticeable regression in first meaningful paint vs 0.4.x for comparable data (NFR-003)  
**Constraints**: No change to card `type`; sanitize config/state (constitution II); theme-safe colors (no mandatory raw Figma hex in primary paths)  
**Scale/Scope**: One card component + editor + chart module + locales; ~9 user stories across 6 implementation phases (spec rollout table)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|--------|
| **I. HA / HACS** | **PASS** | Same custom element and Lovelace patterns; YAML contract preserved. |
| **II. Security** | **PASS** | No new trust boundaries; continue treating config/entity data as untrusted. |
| **III. Quality / tests** | **PASS** | US-9 requires tests; strict TS maintained. |
| **IV. UX / a11y / themes** | **PASS** | Explicit US-7 + token mapping; landmarks/ARIA to be applied with section refactor. |
| **V. Performance / simplicity** | **PASS** | UI refactor; avoid extra subscriptions; ECharts options tuned, not replaced. |

**Post–Phase 1 re-check**: No new violations; `research.md` resolves implementation choices without contradicting constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-figma-ui-rollout/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   └── lovelace-card-contract.md
├── spec.md
└── tasks.md             # Phase 2 — /speckit.tasks (not created here)
```

### Source Code (repository root)

```text
src/card/
├── cumulative-comparison-chart.ts   # Main Lit card + template
├── energy-horizon-card-styles.ts    # Layout / tokens
├── energy-horizon-card-editor.ts    # GUI editor
├── echarts-renderer.ts              # Chart option building
├── chart-renderer.ts                # Adapter surface (if used)
├── ha-api.ts                        # LTS, summary, forecast, textSummary
├── types.ts                         # Config + state types
├── localize.ts
├── axis/                            # Aggregation, labels, caps
└── time-windows/                    # Presets, resolve, validate

src/translations/
└── *.json

tests/
└── (Vitest specs alongside or under tests/)

config/
├── vite.config.ts
└── eslint.config.js
```

**Structure Decision**: Single-package **frontend** card; no `backend/` split. All v0.5.0 changes stay under `src/card/`, `src/translations/`, and existing tests.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase outputs (this run)

| Phase | Artifact | Path |
|-------|----------|------|
| 0 | Research | [research.md](./research.md) |
| 1 | Data model | [data-model.md](./data-model.md) |
| 1 | Contracts | [contracts/lovelace-card-contract.md](./contracts/lovelace-card-contract.md) |
| 1 | Quickstart | [quickstart.md](./quickstart.md) |
| 2 | Tasks | `tasks.md` — **create via `/speckit.tasks`** |

## Agent context

After Phase 1, run from repo root:

```bash
.specify/scripts/bash/update-agent-context.sh cursor-agent
```
