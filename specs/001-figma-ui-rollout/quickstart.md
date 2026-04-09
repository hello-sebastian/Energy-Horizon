# Quickstart: developing & verifying Figma UI v0.5.0

## Prerequisites

- Node.js matching project expectations (see repo CI).
- Optional: local Home Assistant with LTS-capable energy entity for manual QA.

## Commands (repo root)

```bash
npm test
npm run lint
npm run build
```

## Key files

| Area | Path |
|------|------|
| Card element | `src/card/cumulative-comparison-chart.ts` |
| Styles | `src/card/energy-horizon-card-styles.ts` |
| ECharts | `src/card/echarts-renderer.ts` |
| Data / summary / forecast | `src/card/ha-api.ts` |
| Types | `src/card/types.ts` |
| Editor | `src/card/energy-horizon-card-editor.ts` |
| Locales | `src/translations/*.json` |

## Design references

- **Spec**: `specs/001-figma-ui-rollout/spec.md`
- **Figma mapping**: `figma-design.md` (§1–§8)
- **Figma file**: [Energy Horizon Card](https://www.figma.com/design/AbPnTcmRe6WhVGpJt8U6Xj/Energy-Horizon-Card?node-id=113-437) — node `113:437`

## Manual acceptance (short)

1. **Themes**: Toggle HA light/dark; confirm no hardcoded-only contrast failures (SC-002).
2. **Header**: Title on → title + `entity_id` + 42/24 icon; title off → no title lines; icon per config (US-1, clarifications).
3. **Panels**: Two-column comparison + single delta chip; always-visible chip including `0` and `---` cases (US-2, FR-003).
4. **Forecast | Total** (only when `show_forecast` is not `false`): Total equals **full reference window** cumulative, not “to today” (US-3, SC-001). With forecast off, the whole second panel is absent (**Clarifications**).
5. **Comment**: Same narrative as today + trend icon states (US-4).
6. **Warning**: Incomplete reference text **only** at bottom (US-5).
7. **Chart**: Today line full height; delta segment; 3 X labels when current visible; Y 5 splits + 3 labels (US-6, SC-004).
8. **i18n**: Switch language; no missing keys (SC-003).

## Regression baseline

- For **X-axis when current series hidden**, compare behavior to **`v0.4.0`** (see `research.md` §10).
