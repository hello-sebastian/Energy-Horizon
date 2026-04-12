# Indeks specyfikacji Speckit (`specs/`)

Katalogi `NNN-nazwa` powstają przy tworzeniu funkcji (gałąź git i folder specs zwykle **tej samej nazwy**). Prefiks `NNN` to identyfikator z chwili utworzenia, **nie** globalna kolejność produktu — wiele funkcji może mieć `001-` z różnych okresów.

**Status `reference`**: specyfikacja historyczna / referencyjna dla utrzymania; wdrożenie jest w gałęzi `main`, o ile nie trwa aktywny temat na osobnej gałęzi.

| Folder | Temat (skrót) | Główne miejsca w kodzie | Status |
|--------|---------------|-------------------------|--------|
| [001-energy-horizon-card](001-energy-horizon-card/) | Karta porównań energii (MVP) | `src/card/`, `src/index.ts` | reference |
| [001-time-windows-engine](001-time-windows-engine/) | Silnik okien czasowych | `src/card/time-windows/`, `src/card/ha-api.ts` | reference |
| [001-aggregation-axis-labels](001-aggregation-axis-labels/) | Agregacja i etykiety osi X | `src/card/axis/` | reference |
| [003-echarts-migration](003-echarts-migration/) | Migracja Chart.js → ECharts | `src/card/echarts-renderer.ts` | reference |
| [002-i18n-localization](002-i18n-localization/) | i18n / tłumaczenia | `src/card/localize.ts`, `src/translations/` | reference |
| [001-compute-forecast](001-compute-forecast/) | Prognoza (`computeForecast`) | `src/card/ha-api.ts`, wykres | reference |
| [001-chart-updates](001-chart-updates/) | Aktualizacje wykresu (Chart.js era) | `src/card/chart-renderer.ts` (legacy) | reference |
| [001-card-ui-enhancements](001-card-ui-enhancements/) | Ulepszenia UI karty | `src/card/cumulative-comparison-chart.ts`, style | reference |
| [005-gui-editor](005-gui-editor/) | Edytor GUI Lovelace | `src/card/energy-horizon-card-editor.ts` | reference |
| [004-smart-unit-scaling](004-smart-unit-scaling/) | Skalowanie jednostek | `src/utils/unit-scaler.ts` | reference |
| [001-github-wiki](001-github-wiki/) | Dokumentacja Wiki (Diátaxis) | `wiki-publish/` | reference |
| [001-ha-theming-classes](001-ha-theming-classes/) | Theming / klasy semantyczne | `src/card/energy-horizon-card-styles.ts` | reference |
| [001-separate-style-logic](001-separate-style-logic/) | Separacja stylów od logiki | style vs logika w `src/card/` | reference |
| [001-figma-ui-rollout](001-figma-ui-rollout/) | UI zgodne z Figma | `src/card/cumulative-comparison-chart.ts`, style | reference |

Szczegóły architektury **Time Windows** i linki do artefaktów: [speckit.md](../speckit.md) w katalogu głównym repozytorium.

**Nowa funkcja:** [scripts/speckit-create-feature.sh](../scripts/speckit-create-feature.sh) lub `.specify/scripts/bash/create-new-feature.sh` — patrz [`.cursor/rules/speckit-numbering.mdc`](../.cursor/rules/speckit-numbering.mdc).
