# Quickstart: Intelligent aggregation and X-axis labeling (developers)

**Branch**: `001-aggregation-axis-labels` | **Date**: 2026-03-31

## Prerequisites

- Node/npm as in repo root  
- Feature spec: [spec.md](./spec.md)  
- Plan: [plan.md](./plan.md)

## Commands

```bash
cd "/Users/admin/Projekty Local/Energy-Horizon"
npm install
npm test
npm run lint
```

## What to test locally

1. **Unit**: `tests/unit/auto-aggregation.test.ts`, `point-cap.test.ts`, `x-axis-format-validate.test.ts`, `axis-label-format.test.ts`, `tooltip-format.test.ts` (after implementation).  
2. **Manual smoke in HA** (after implementation):  
   - Card without `aggregation` — confirm auto step matches duration band (~20–100 buckets).  
   - `aggregation: day` — no auto-interval.  
   - Invalid `x_axis_format` — `ha-alert`, no chart.  
   - Config implying >5000 points — error state, no white screen.  
   - `x_axis_format: 'yyyy-MM-dd HH:mm'` — forced labels; narrow panel — labels stay horizontal, overlap hidden.  
   - Optional `tooltip_format: 'dd LLL yyyy'` — tooltip header follows pattern; invalid pattern → card error.  
   - Tooltip header: no redundant year in default mode; legend shows which period applies.

## Related source (orientation)

- `src/card/axis/` — new modules (see [plan.md](./plan.md))  
- `src/card/echarts-renderer.ts` — X axis `formatter`  
- `src/card/cumulative-comparison-chart.ts` — **`setConfig`**: fail-fast **`x_axis_format`** validation + effective **`aggregation`** (auto-interval) before resolve — single pipeline hook ([research.md](./research.md) R-002, R-009)  
- `src/card/ha-api.ts` — timeline / LTS queries given resolved windows (no duplicate merge logic)  
- `src/card/time-windows/merge-config.ts` — aggregation merge chain  

**v1 note**: One merged **`aggregation`** for all resolved windows until the schema supports per-window fields ([research.md](./research.md) R-008).
