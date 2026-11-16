# Contract: LTS WebSocket Response

**Feature**: `911-tech-debt-reduction` | **Owner task**: TD-3 (W1) | **Spec refs**: FR-003, edge case 4

The card reads historical data from the Home Assistant `long_term_statistics` WebSocket service. This is the **only interface in scope of change** in the whole program — TD-3 gives it a typed model. The contract below must hold for every LTS response the card receives.

## Current state (before TD-3)

- HA WebSocket responses arrive typed `unknown` (the custom `src/ha-types.ts` contract deliberately stays thin).
- The card consumes them via 3 `responses[i] as any` casts (`_loadData` loop, and the two preview-path call sites in `cumulative-comparison-chart.ts`).
- `mapLtsResponseToCumulativeSeries(response: LtsStatisticsResponse | { result?: LtsStatisticsResponse }, …)` already contains ad-hoc normalization with internal `as` casts (`ha-api.ts`):
  1. `data = response.result ?? response` — accept envelope or bare payload;
  2. `results = data.results ?? …` — the results record; `if (!results || typeof results !== "object") return undefined` (defensive bail);
  3. `points = results[entityId]`, with fallback to the first key's value when the exact entity id is absent (existing defensive behavior — golden tests cover it).

## Target contract (after TD-3)

**Type `LtsMessageResponse`** — the WebSocket message shape the card actually receives:

```text
LtsMessageResponse = {
  success?: boolean
  result?: LtsStatisticsResponse     // envelope form (Shape A)
} | LtsStatisticsResponse            // bare form (Shape B)
```

where `LtsStatisticsResponse = { results?: Record<statisticId, LtsPoint[]> }` (the existing type imported by `ha-api.ts`).

**Adapter `extractLtsResults(response: LtsMessageResponse): LtsStatisticsResponse | undefined`** — single normalization point:

1. `response.result` present → use it (Shape A), else use `response` itself (Shape B);
2. the returned object's `results` must be a non-null object — otherwise return `undefined` (defensive; Article II: malformed input degrades gracefully, never throws);
3. never throws on malformed input.

**Entity lookup** (step 3 above: `results[entityId]` with first-key fallback) stays in the mapping layer — the adapter normalizes the envelope, the mapper interprets the record.

## Rules

- `mapLtsResponseToCumulativeSeries` accepts the typed input — the 3 `as any` casts in the card element are deleted (SC-001: 0× `any` in `src/`).
- **Both observed shapes are supported** (edge case 4) — the adapter has unit tests for Shape A and Shape B.
- Existing `ha-api.test.ts` tests pass with **unchanged semantics** (golden standard, FR-019).
- The behavior on malformed/absent data is byte-for-byte today's behavior: `undefined` → the existing no-data path (no new error states, no new user-visible messages).

## Out of scope

- The WebSocket transport itself (`sendMessagePromise`, the thin `ha-types.ts` contract) — do-not-touch.
- Any change to the query side (`buildMergedTimeWindowConfig`, `resolveTimeWindows`, hard limits) — do-not-touch.
