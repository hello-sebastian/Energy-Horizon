# Bug Assessment: Duplicate concurrent data loads on hass updates while card is loading

- **Slug**: duplicate-concurrent-loads
- **Created**: 2026-10-31
- **Source**: https://github.com/hello-sebastian/Energy-Horizon/issues/58 (host: github.com — allowlisted)
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

Issue #58 (hello-sebastian, label `bug`, self-assigned; added to then removed from milestone 1.2.0):

> **Problem** — While the card is in the `loading` state, every `hass` update (which arrives on
> every state change, typically 1–10×/s) triggers a fresh `_loadData()` call from `updated()`.
> Each call issues the full set of parallel `recorder/statistics_during_period` requests
> (N = number of time windows). During the load window (~50–500 ms, longer on slower hardware)
> this produces several redundant batches of LTS queries against the recorder.
>
> **Impact** — Unnecessary load on the Home Assistant recorder (notably on Raspberry Pi
> installs). No data-correctness impact — concurrent loads with the same config return
> identical results.
>
> **Desired solution** — Coalesce in-flight loads (e.g. a `_loadPromise` guard) plus a
> generation counter so that a config change during an in-flight load is not swallowed:
> 1. `setConfig()` increments a `_loadGeneration` counter.
> 2. `_loadData()` captures the generation at start and discards its result if the generation
>    changed before completion.
> 3. `updated()` starts a load when there is no in-flight load for the current generation.
>
> A regression test should cover: load in flight → config change → final data reflects the
> new config.
>
> **Related** — PR #55 (rosenrot00) attempted this fix but was closed — see the discussion
> there for the regression details.

## Symptom

While `_state.status === "loading"`, every `hass` property change re-enters `updated()` and
starts a new, fully parallel batch of LTS queries, because `_loadData()` has no in-flight
guard. Expected: a single in-flight load per config generation; subsequent `hass` updates
during the load window are no-ops.

## Reproduction

1. Configure an `energy-horizon-card` with at least one time window (any preset).
2. Open the dashboard and observe the card entering the `loading` state.
3. While the load is in flight (~50–500 ms), let any entity state change (or change several
   entities rapidly) so `hass` updates arrive at 1–10×/s.
4. Observe in the browser devtools / HA logs: multiple redundant batches of
   `recorder/statistics_during_period` requests are issued for the same config.

[NEEDS CLARIFICATION: exact number of redundant batches observed in the reporter's install —
not stated in the issue; depends on load latency and update rate.]

## Suspected Code Paths

- `src/card/cumulative-comparison-chart.ts:237` — `updated(changedProps)`: fires
  `void this._loadData()` whenever `hass`, `_config`, or `_state` changed and
  `_state.status === "loading"`. No check whether a load is already in flight.
- `src/card/cumulative-comparison-chart.ts:279` — `_loadData()`: no guard, no generation
  capture; every invocation builds windows/queries and awaits `Promise.all` of
  `sendMessagePromise` calls, then unconditionally writes `this._state` (ready / no-data /
  error) on completion.
- `src/card/cumulative-comparison-chart.ts:175` — `setConfig()`: ends with
  `this._state = { status: "loading" }`, which re-arms the load trigger in `updated()`;
  there is no generation counter to distinguish "same config, stale in-flight load" from
  "new config".

## Root Cause Hypothesis

**Confidence: high.** `updated()` treats the `loading` status as "a load is needed" rather
than "a load is in progress". Since `hass` is a reactive property that changes on every
state change in HA (1–10×/s), and the load window is 50–500 ms, each update during that
window spawns an additional full batch of N parallel LTS queries. There is no
`_loadPromise`/in-flight flag and no generation counter, so nothing coalesces or invalidates
these concurrent loads. The issue's own diagnosis matches the code exactly.

## Proposed Remediation

**Preferred**: implement the issue's proposed design in
`src/card/cumulative-comparison-chart.ts`:

1. Add `private _loadGeneration = 0;` and `private _inFlightLoad?: Promise<void>;` (or a
   `_loadInFlightGeneration: number` marker).
2. In `setConfig()`, increment `_loadGeneration` (after validation succeeds, right where
   `_state` is set to `loading`).
3. In `_loadData()`, capture `const gen = this._loadGeneration;` at start. Before every
   `this._state = …` write after the `await` (ready, no-data, error, point-cap paths),
   check `if (gen !== this._loadGeneration) return;` so a stale load never overwrites state
   produced by a newer generation.
4. In `updated()`, start a load only when `_state.status === "loading"` **and** no load is
   in flight for the current generation (e.g. track `_inFlightGeneration`; skip if
   `_inFlightGeneration === this._loadGeneration`).

This keeps the existing `updated()`-driven trigger (needed for the initial load and for
`hass` becoming available) while collapsing the storm into one batch per generation.

**Alternatives**:
- Debounce the `hass`-triggered load (e.g. 100–250 ms timer). Simpler, but adds latency to
  the first render and still re-loads on every config change; the generation-counter design
  is more precise and matches the issue's request.
- Load only on `_config` change and on first `hass` availability, ignoring subsequent `hass`
  updates while loading. Risky: `hass` updates can carry the entity's
  `unit_of_measurement` used in `_loadData()` (`entityUnit`), so ignoring them could render
  stale units if the entity's attributes arrive after the first load.

**Files likely to change**:
- `src/card/cumulative-comparison-chart.ts`

**Tests to add or update**:
- Regression (required by the issue): load in flight → `setConfig()` with a different config
  → final `_state` reflects the **new** config (stale load's result is discarded).
- Coalescing: simulate N `hass` updates while a load is in flight → `sendMessagePromise`
  batches are issued exactly once per generation (assert call count on the mocked
  `connection.sendMessagePromise`).
- Stale-error safety: an in-flight load from generation N rejects after generation N+1
  started → the error state is not written (or is written only if N+1 also fails).
- Existing integration tests in `tests/integration/card-render.test.ts` (loading-state
  rendering) must keep passing.

## Risks & Considerations

- **Stale state overwrite**: the generation check must guard *every* post-`await` `_state`
  write (ready, no-data, error, point-cap), not just the success path — missing one
  reintroduces a race where an old load clobbers a newer one.
- **PR #55 regression**: the issue states a previous attempt (PR #55, closed) had a
  regression. The discussion there was not fetched (out of scope of the provided URL) —
  review it before implementing to avoid re-introducing the same failure mode.
- **`hass` attribute freshness**: `entityUnit` is read from `hass.states` inside
  `_loadData()`; coalescing means the in-flight load uses the `hass` snapshot from when it
  started. Acceptable (units rarely change mid-load), but worth a comment.
- **No API breakage, no migrations, no security impact.** Performance impact is strictly
  positive (fewer LTS queries).

## Open Questions

- [NEEDS CLARIFICATION: what exactly was the regression in PR #55 that led to its closure?
  The issue references the discussion there but does not summarize it.]
- [NEEDS CLARIFICATION: should a `hass` update that changes the entity's
  `unit_of_measurement` while a load is in flight force a reload (new generation), or is
  using the stale unit for one render acceptable?]
