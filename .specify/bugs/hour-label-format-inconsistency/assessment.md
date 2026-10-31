# Bug Assessment: Hour labels inconsistency — X-axis vs top panel, 12h/24h

- **Slug**: hour-label-format-inconsistency
- **Created**: 2026-10-31
- **Source**: https://github.com/hello-sebastian/Energy-Horizon/issues/52 (host: github.com — allowlisted)
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

Issue #52 "Hour labels incoisistance" (milestone 1.2.0, label: bug):

1. Hour labels on x axis inconsistency
2. Hour format ignores 24h setting in user settings
3. When language: pl — X-axis labels are 24h; when language: en — X-axis is am/pm, but top panel labels stay 24h → inconsistent.
4. "Looks like top panel labels are not linked with localization"

Reproduction config from the issue:

```yaml
type: custom:energy-horizon-card
entity: sensor.boiler_total_meter
time_window:
  anchor: start_of_day
  duration: 1d
  step: 1d
  count: 24
title: 2. 6 kolejnych godzin (Bieżąca godzina i 5 poprzednich)
```

Screenshot (attached to the issue) shows the card in Polish: top panel captions and X-axis both 24h (coincidentally consistent for `pl`), while the reporter observes the split under `en`.

## Symptom

Clock-time labels are formatted by two independent code paths with different 12h/24h policies: the X-axis (and tooltip) use `Intl.DateTimeFormat` **without** an `hour12` option, so the format follows the **locale** (pl → 24h, en → am/pm) and the HA `time_format` user setting is ignored; the top-panel period captions use Luxon with a **hard-coded 24h fallback** (`"HH:mm"`) whenever `time_format` is not explicitly `"12"`, so they never follow the locale. Result: under `en` (or with `time_format` set) the axis and the top panel disagree.

## Reproduction

1. Configure a card with hourly aggregation (e.g. `time_window: { anchor: start_of_day, duration: 1d, step: 1d, count: 24 }`) and a comparison preset so the top panel shows period captions.
2. Set HA locale to `en` (no `time_format` set) → X-axis shows `am/pm`, top panel captions show `HH:mm` (24h). Inconsistent.
3. Set HA `time_format: "12"` with locale `pl` → X-axis still shows 24h (setting ignored), top panel shows 12h. Inconsistent.
4. Set HA `time_format: "24"` with locale `en` → X-axis still shows am/pm (setting ignored), top panel shows 24h. Inconsistent.

[NEEDS CLARIFICATION: whether `time_format: "language"` (a valid HA value per `src/ha-types.ts`) should be treated as "follow locale" — assumed yes.]

## Suspected Code Paths

- `src/card/axis/axis-label-format.ts:38` — `formatAdaptiveTickLabel()`: all `hour` branches (tail at ~line 89, first/day-changed at ~line 107, plain hour at ~line 116) build `Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", ...tz })` with **no `hour12` option** → locale default, HA `time_format` ignored.
- `src/card/axis/tooltip-format.ts:27` — `formatTooltipHeader()`: `hour` case (~line 86) has the same missing `hour12` → tooltip also ignores the setting.
- `src/card/labels/compact-period-caption.ts:138` — `timeFormatToken()`: `hour12 === true ? "h:mm a" : "HH:mm"` — any non-`true` value (including `undefined` = "locale default") falls back to **hard-coded 24h**. This is the top-panel caption path.
- `src/card/labels/compact-period-caption.ts:214` — `hour12FromHaTimeFormat()`: maps `"12"` → `true`, `"24"` → `false`, everything else (`"language"`, unset) → `undefined`. The mapping itself is fine; the consumers mishandle `undefined`.
- `src/card/cumulative-comparison-chart.ts:835` — caption call site: `hour12 = hour12FromHaTimeFormat(this.hass?.locale?.time_format)` — only feeds the caption path.
- `src/card/cumulative-comparison-chart.ts:633` / `src/card/types.ts:355` — `ChartRendererConfig` carries `xAxisLabelLocale` but **no `hour12`**, so the renderer cannot pass the setting to axis/tooltip formatters.
- `src/card/echarts-renderer.ts:697,720,1117` — call sites of `formatForcedTickLabel` / `formatAdaptiveTickLabel` / `formatTooltipHeader` that would need the new option.

## Root Cause Hypothesis

**Confidence: high.** There is no single shared "clock format" resolution. The axis/tooltip path delegates 12h/24h to the ICU locale (by omitting `hour12`), while the caption path resolves HA `time_format` but treats "unset" as an explicit 24h instead of "locale default". The two policies only agree by accident for locales whose default is 24h (e.g. `pl`). The HA `time_format` setting is consumed in exactly one place (captions) and never reaches the axis/tooltip formatters.

## Proposed Remediation

**Preferred**: Introduce one shared resolution of `hour12: boolean | undefined` (where `undefined` = "follow locale") and apply it consistently in all three clock-formatting paths:

1. Keep `hour12FromHaTimeFormat()` as the single resolver (`"12"` → `true`, `"24"` → `false`, `"language"`/unset → `undefined`).
2. `formatAdaptiveTickLabel()` and `formatTooltipHeader()`: accept an optional `hour12?: boolean` and spread it into the `Intl.DateTimeFormat` options **only when defined** (so `undefined` preserves the current locale-default behavior).
3. `formatCompactPeriodCaption()`: when `hour12` is `undefined`, stop using the hard-coded Luxon `"HH:mm"`; format the clock part with `Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" })` (locale default). Keep the explicit `true`/`false` branches (or also route them through `Intl` with `hour12` set — either way the output must match the axis).
4. Thread the value: add `hour12?: boolean` to `ChartRendererConfig` (`src/card/types.ts`), set it in `_buildRendererConfig()` (`src/card/cumulative-comparison-chart.ts`) from `hour12FromHaTimeFormat(this.hass?.locale?.time_format)`, and pass it at the three call sites in `src/card/echarts-renderer.ts`.

**Alternatives**:
- Force everything to 24h (simplest, but violates the reporter's expectation that the user's 12h/24h setting and locale should be respected).
- Add a card-level `time_format` YAML override — out of scope for this bug; can be a follow-up.

**Files likely to change**:
- `src/card/axis/axis-label-format.ts`
- `src/card/axis/tooltip-format.ts`
- `src/card/labels/compact-period-caption.ts`
- `src/card/types.ts`
- `src/card/cumulative-comparison-chart.ts`
- `src/card/echarts-renderer.ts`
- `tests/unit/axis-label-format.test.ts`
- `tests/unit/tooltip-format.test.ts`
- `tests/unit/period-label.test.ts`

**Tests to add or update**:
- `axis-label-format.test.ts`: hour ticks with `hour12: true` (expect am/pm under `pl`), `hour12: false` (expect 24h under `en`), and `hour12: undefined` (locale default: 24h under `pl`, am/pm under `en`).
- `tooltip-format.test.ts`: same matrix for the tooltip header `hour` case.
- `period-label.test.ts`: caption clock part with `hour12: undefined` under `en` must produce am/pm (regression for the hard-coded `"HH:mm"`), and explicit `"12"`/`"24"` must override the locale.

## Risks & Considerations

- **Visible behavior change**: `en`-locale users without `time_format` will now see am/pm in the top-panel captions (previously 24h). This is the intended fix, but it is a user-visible change — worth a changelog note.
- `time_format: "language"` must map to `undefined` (locale default), not 24h — lock with a unit test.
- User-controlled Luxon patterns (`x_axis_format`, `tooltip_format`) are explicit overrides and must remain untouched.
- `Intl.DateTimeFormat` output for `hour12` is locale-dependent (e.g. `AM`/`PM` vs `am`/`pm`); tests should assert on the hour digit / 12h-ness rather than exact strings where possible.

## Open Questions

- [NEEDS CLARIFICATION: should a card-level `time_format` YAML override be added in 1.2.0, or is following the HA user setting sufficient for this fix?]
