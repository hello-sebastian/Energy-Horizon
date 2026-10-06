# Quickstart: Narrative Engine Refactor

**Audience**: Developers implementing FR-903-NA–NI and FR-905-J–M.

## 1. Branch and prerequisites

```bash
cd "/Users/admin/Projekty Local/Energy-Horizon"
git checkout 903-card-ui-composition   # or your working branch
npm test
```

## 2. Read order

1. [spec.md](./spec.md) — § Narrative Engine Refactor (normative requirements).
2. [data-model.md](./data-model.md) — key migration table, types, resolution algorithm.
3. [contracts/narrative-i18n.md](./contracts/narrative-i18n.md) — mandatory variables per key.
4. [../905-localization-formatting/spec.md](../905-localization-formatting/spec.md) — § Narrative Key Schema.

## 3. Implementation sketch

| Step | Action |
|---|---|
| A | Add `classifyComparisonStep` + `interpretationToEntityKind` in a pure module; unit-test matrix from `spec.md` edge-case table. |
| B | Add `hasTranslationKey` to `localize.ts`; unit-test with temporary in-memory dict or fixture language. |
| C | Migrate **all** `src/translations/*.json` per [data-model.md](./data-model.md); add `src/translations/CONTEXT.md` for `period.*` grammar. |
| D | Replace `isMom` / `resolvedWindowsAreConsecutiveCalendarMonths` narrative branch in `cumulative-comparison-chart.ts` with step-based key resolution + `{{referencePeriod}}` interpolation. |
| E | Fix insufficient-data path to use `text_summary.insufficient_data` (not `no_reference`). |
| F | Update `tests/unit/cumulative-comparison-chart-localization.test.ts` and `tests/unit/localize-dictionary-loading.test.ts`; add dictionary guard test for 11 mandatory keys. |

## 4. Verify

```bash
npm test
npm run lint
```

## 5. Docs / release (`907-docs-product-knowledge`)

- **`CHANGELOG.md`**: For every **user-visible** change from this work, add an entry under the **`[x.y.z]`** section that matches the **git tag** you publish (e.g. **`[1.1.0]`** if this ships in that release line, or the next semver if released separately).
- **`README.md`**, **`README-advanced.md`**, **`wiki-publish/`**: Update when documentation currently describes **configuration**, **presets / `time_window` / `step`**, **billing offsets**, or **narrative / translation** behavior that this refactor changes — even though **no new YAML keys** are added, user guides must stay accurate.
- See **FR-903-NJ** and **SC-903-N6** in [spec.md](./spec.md).
