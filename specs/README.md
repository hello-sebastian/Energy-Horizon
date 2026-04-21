# Indeks specyfikacji Speckit (`specs/`)

Dokumentacja Energy Horizon Card jest podzielona na 8 domen domenowych (`900–907`). Każda domena zawiera plik `spec.md` będący jedynym źródłem prawdy dla danego obszaru — na podstawie specyfikacji można wygenerować kompletny `plan.md` i `tasks.md` bez zaglądania do kodu.

**Status `active`**: domena jest aktywna i aktualna; `spec.md` jest autorytatywny.

| Folder | Temat (skrót) | Główne miejsca w kodzie | Status |
|--------|---------------|-------------------------|--------|
| [900-time-model-windows](900-time-model-windows/) | Model okien czasowych, presety, merge, LTS | `src/card/time-windows/`, `src/card/ha-api.ts` | active |
| [901-data-pipeline-forecasting](901-data-pipeline-forecasting/) | Pipeline LTS, `computeForecast`, confidence | `src/card/ha-api.ts` | active |
| [902-chart-rendering-interaction](902-chart-rendering-interaction/) | ECharts, osie, tooltipy, serie, markery | `src/card/echarts-renderer.ts`, `src/card/axis/` | active |
| [903-card-ui-composition](903-card-ui-composition/) | Layout karty, sekcje, stany, theming | `src/card/cumulative-comparison-chart.ts`, style | active |
| [904-configuration-surface](904-configuration-surface/) | YAML schema + GUI editor Lovelace | `src/card/energy-horizon-card-editor.ts` | active |
| [905-localization-formatting](905-localization-formatting/) | i18n, locale cascade, format dat/liczb | `src/card/localize.ts`, `src/translations/` | active |
| [906-units-numeric-scaling](906-units-numeric-scaling/) | Jednostki SI, `force_prefix`, precision | `src/utils/unit-scaler.ts` | active |
| [907-docs-product-knowledge](907-docs-product-knowledge/) | Wiki, README, changelog governance | `wiki-publish/`, `README*`, `CHANGELOG.md` | active |

Szczegóły architektury i linki do artefaktów: [speckit.md](../speckit.md) w katalogu głównym repozytorium.

**Nowa funkcja:** `.specify/scripts/bash/create-new-feature.sh` — patrz [`.cursor/rules/speckit-numbering.mdc`](../.cursor/rules/speckit-numbering.mdc).
