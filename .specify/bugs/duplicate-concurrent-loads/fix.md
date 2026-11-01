# Bug Fix: Duplicate concurrent data loads on hass updates while card is loading

- **Slug**: duplicate-concurrent-loads
- **Fixed**: 2026-10-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

While `_state.status === "loading"`, every `hass` property change (1–10×/s in a live HA
install) re-entered `updated()` and started a fresh `_loadData()` — each issuing a full
parallel batch of N `recorder/statistics_during_period` requests. During the 50–500 ms load
window this produced several redundant LTS query batches against the recorder.

The fix implements the issue's proposed design: a `_loadGeneration` counter (bumped in
`setConfig()`) plus an `_inFlightGeneration` marker. `updated()` starts a load only when no
load is in flight for the current generation (coalescing), and `_loadData()` captures the
generation at start and discards its result if the generation changed before completion
(stale-load safety — this is what the closed PR #55 lacked, which is why a config change
mid-load was swallowed there).

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/card/cumulative-comparison-chart.ts` | modified | Added `_loadGeneration` (bumped at the top of `setConfig()`) and `_inFlightGeneration` (set at the start of `_loadData()`). `updated()` guards the load trigger with `_inFlightGeneration !== _loadGeneration`. `_loadData()` captures `gen` and checks `gen !== this._loadGeneration` before **every** post-`await` `_state` write: point-cap error, no-data, ready, and the `catch` error path. |
| `tests/integration/load-coalescing.test.ts` | added | 3 regression tests: coalescing of `hass` updates into one query batch; stale-load discard on config change (final data reflects the new config); stale-load rejection does not write an error state. Mocks `src/card/echarts-renderer` (zrender cannot paint in jsdom). |

## Diff Highlights

`src/card/cumulative-comparison-chart.ts` — `setConfig()`:
```ts
public setConfig(config: CardConfigInput): void {
  // Bump the generation so any in-flight load (started under the previous config)
  // discards its result once it completes — a config change is never swallowed.
  this._loadGeneration++;
  ...
```

`src/card/cumulative-comparison-chart.ts` — `updated()`:
```ts
if (this._state.status === "loading") {
  // Coalesce: only start a load if none is in flight for the current generation.
  // `hass` updates (1–10×/s) during the load window must not re-trigger the load.
  if (this._inFlightGeneration !== this._loadGeneration) {
    void this._loadData();
  }
}
```

`src/card/cumulative-comparison-chart.ts` — `_loadData()`:
```ts
const gen = this._loadGeneration;
this._inFlightGeneration = gen;
...
// before each post-await _state write (point-cap, no-data, ready, catch):
if (gen !== this._loadGeneration) return;
```

## Tests Added or Updated

- `tests/integration/load-coalescing.test.ts` › "coalesces hass updates during an in-flight load into a single query batch" — 5 `hass` updates while a load is in flight produce **no** additional `sendMessagePromise` calls; `_inFlightGeneration === _loadGeneration`.
- `tests/integration/load-coalescing.test.ts` › "discards a stale in-flight load when the config changes mid-load (regression)" — the exact regression the issue requires: load in flight → `setConfig()` → stale load resolves → card stays `loading` (stale result discarded) → new load resolves → `_state` is `ready` with the **new** config's data (total 300, not the stale 30).
- `tests/integration/load-coalescing.test.ts` › "does not write an error state from a stale in-flight load after a config change" — a stale load that **rejects** after a config change does not clobber the state; the card stays `loading` and later reaches `ready` from the current generation.

## Local Verification

- Commands run:
  - `npm test` (full suite) → **55 files, 564 tests passed** (561 pre-existing + 3 new), 0 failures.
- Type check: no errors in `src/card/cumulative-comparison-chart.ts` or `tests/integration/load-coalescing.test.ts`.
- Manual trace: initial load (gen 1) in flight → `hass` updates → `updated()` sees
  `_inFlightGeneration === _loadGeneration` → no new batch. `setConfig()` (gen 2) →
  `updated()` sees `_inFlightGeneration (1) !== _loadGeneration (2)` → one new batch.
  Stale gen-1 completion → `gen !== _loadGeneration` → every `_state` write skipped.

## Deviations from Assessment

None. The fix follows the assessment's preferred remediation exactly (generation counter +
in-flight guard + stale-result discard on all post-`await` state writes). One test-only
addition beyond the assessment: `vi.mock` of `src/card/echarts-renderer` in the new test
file, because reaching the `ready` state in jsdom instantiates a real ECharts renderer and
zrender crashes without a canvas (the same reason existing integration tests set `_state`
manually without `chartTime`).

## Follow-ups

- Consider (out of scope here): a `hass` update that changes the entity's
  `unit_of_measurement` mid-load uses the snapshot from load start for that one render —
  acceptable, but could force a new generation if it ever proves visible to users.
