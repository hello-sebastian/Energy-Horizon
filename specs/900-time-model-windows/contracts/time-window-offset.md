# Contract: `time_window.offset` parser (FR-900-Q)

## Scope

This contract applies to the **card’s merged configuration path** (`buildMergedTimeWindowConfig` → validate → resolve). It does **not** change the **`ComparisonWindow[]`** / `ha-api.ts` shapes.

## Module boundary (normative for implementers)

There MUST be a **single exported entry point** used by both:

1. **Validation** — `validateMergedTimeWindowConfig` / `assertMergedTimeWindowConfig`  
2. **Resolution** — `computeStartOfWindow0` (and any future call site that applies `offset`)

Suggested name: `parseTimeWindowOffset` (exact filename project convention).

## Signature (informative)

```typescript
import type { Duration } from "luxon";

/** @throws Error — English message acceptable for assert path; validate wraps to errorKey */
export function parseTimeWindowOffset(input: string | undefined): Duration;
```

Behavior:

- **`undefined`**, empty, or whitespace-only → return zero `Duration` (`Duration.fromObject({})` or Luxon-equivalent “zero”) so callers treat as “no offset”.  
- **Legacy shim**: strings matching the project’s legacy single-token pattern (e.g. `+3M`, `+1d`, `-2d`) MUST normalize to an ISO form then parse.  
- **ISO**: all other non-empty strings MUST be interpreted via `Duration.fromISO` after legacy normalization.  
- **Reject** (throw or validate `ok: false` with `status.config_invalid_time_window`): invalid ISO; sub-hour non-zero total; fractional year/month notation; any string Luxon cannot interpret as a finite duration for calendar addition.

## Application semantics

Callers MUST apply the returned `Duration` only as:

```typescript
anchorPoint.plus(duration) // zone = HA instance IANA zone on anchorPoint / now
```

`start_of_year` special looping (candidate shifted back until `<= now`) remains in `resolve-windows.ts`; it MUST use the **same** `Duration` object class as today (`Luxon` `Duration`).

## Downstream invariants

- No new fields on `MergedTimeWindowConfig`.  
- `offset` remains a **string** in merged config; parsing to `Duration` is ephemeral per validation/resolve.  
- User-visible failure: **`status.config_invalid_time_window`** only (no offset-specific keys).
