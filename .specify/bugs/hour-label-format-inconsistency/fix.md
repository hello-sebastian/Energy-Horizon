# Bug Fix: Hour labels inconsistency — X-axis vs top panel, 12h/24h

- **Slug**: hour-label-format-inconsistency
- **Fixed**: 2026-10-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Introduced a single `hour12` resolution (HA `locale.time_format`: `"12"` → `true`, `"24"` → `false`, `"language"`/unset → `undefined` = locale default) and applied it consistently to the X-axis ticks, the tooltip header, and the top-panel period captions. The captions' hard-coded Luxon `"HH:mm"` 24h fallback was replaced with `Intl.DateTimeFormat` (same engine as the axis), so all three clock surfaces now agree.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/axis/axis-label-format.ts` | modified | `formatAdaptiveTickLabel` accepts `opts.hour12`; spread into `Intl.DateTimeFormat` only when defined (all three `hour` branches: tail, first/day-changed, plain) |
| `src/card/axis/tooltip-format.ts` | modified | `FormatTooltipHeaderParams.hour12`; applied in the `hour` case |
| `src/card/labels/compact-period-caption.ts` | modified | `formatTime` rewritten: Luxon `toFormat("HH:mm"/"h:mm a")` → `Intl.DateTimeFormat` with `timeZone` + optional `hour12`; `timeFormatToken` removed; all 4 call sites pass `zone` |
| `src/card/types.ts` | modified | `ChartRendererConfig.hour12?: boolean` |
| `src/card/cumulative-comparison-chart.ts` | modified | `_buildRendererConfig` resolves `hour12FromHaTimeFormat(this.hass?.locale?.time_format)` once and sets it in both renderer-config returns (early-return + full) |
| `src/card/echarts-renderer.ts` | modified | `formatXAxisLabel` passes `hour12` via `tickOpts`; tooltip call passes `hour12: rendererConfig.hour12` |
| `tests/unit/axis-label-format.test.ts` | added tests | `hour12` matrix: true under pl → am/pm; false under en → 24h; undefined → locale default; first/day-changed tick |
| `tests/unit/tooltip-format.test.ts` | added tests | same matrix for tooltip header `hour` case |
| `tests/unit/period-label.test.ts` | added tests | caption clock: `undefined` under en → am/pm (regression for hard-coded 24h); `true` under pl → 12h; `false` under en → exact `10:12 – 15:12, 10 Apr` |

## Diff Highlights (optional)

Caption clock part — before vs after:

```ts
// before: hard-coded 24h fallback, Luxon engine
function timeFormatToken(hour12: boolean | undefined): string {
  if (hour12 === true) return "h:mm a";
  return "HH:mm";
}

// after: Intl engine (same as axis/tooltip), locale default when unset
function formatTime(dt, locale, hour12, zone): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: zone
  };
  if (hour12 !== undefined) opts.hour12 = hour12;
  return new Intl.DateTimeFormat(locale, opts).format(dt.toJSDate());
}
```

Axis tick — `hour12` threaded through:

```ts
const hour12Opts: Intl.DateTimeFormatOptions =
  opts?.hour12 !== undefined ? { hour12: opts.hour12 } : {};
// ...
new Intl.DateTimeFormat(locale, {
  hour: "numeric",
  minute: "2-digit",
  ...hour12Opts,
  ...tz
}).format(d);
```

## Tests Added or Updated

- `tests/unit/axis-label-format.test.ts` — `hour12 (HA time_format) for hour aggregation` (4 tests): pins that `true` forces 12h under `pl`, `false` forces 24h under `en`, `undefined` follows the locale default, and the first/day-changed tick honors it too.
- `tests/unit/tooltip-format.test.ts` — `hour12 (HA time_format) for hour aggregation` (3 tests): same matrix for the tooltip header.
- `tests/unit/period-label.test.ts` — 3 new caption tests: `undefined` under `en` now yields am/pm (the regression this bug was about), `true` under `pl` yields 12h, `false` under `en` yields the exact 24h string.

## Local Verification

- Commands run:
  - `npx vitest run tests/unit/axis-label-format.test.ts tests/unit/tooltip-format.test.ts tests/unit/period-label.test.ts` → 45/45 passed
  - `npm test` (full suite, `TZ=UTC vitest run`) → 53 files, 552/552 passed
  - `npm run lint` → clean
- Manual checks: none (no running HA instance in this session); behavior is pinned by the unit-test matrix above.

## Deviations from Assessment

- The assessment suggested the caption `formatTime` could keep the explicit Luxon branches or route through `Intl`; the implementation routes **all** caption clock output through `Intl.DateTimeFormat` (including explicit `true`/`false`), which is the stronger consistency guarantee with the axis.
- One implementation detail the assessment did not spell out: `Intl.DateTimeFormat` defaults to the **browser** time zone, while the old Luxon path used the window's `zone`. `formatTime` now receives and passes `timeZone: zone` explicitly — without this, captions would have shifted to the browser zone (caught by the existing `10:12 – 15:12, 10 Apr` test).

## Follow-ups

- Changelog note: `en`-locale users without `time_format` will now see am/pm in top-panel captions (previously always 24h) — intended, but user-visible.
- Open question from the assessment remains: a card-level `time_format` YAML override could be a 1.2.0 follow-up (not part of this fix).
- Verify in a live HA instance with `time_format: "12"` / `"24"` / unset under both `pl` and `en` (`/speckit-bug-test`).
