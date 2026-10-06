# Data model — `900-time-model-windows` (implementation-facing)

## Configuration (YAML → merge)

| Concept | Description |
|---|---|
| **`TimeWindowYaml`** | Partial override block from card YAML (`anchor`, `duration`, `offset`, `step`, `count`, `aggregation`, …). |
| **`MergedTimeWindowConfig`** | Preset defaults merged with YAML; every present YAML field wins (FR-900-C). Includes `offset?: string` (optional). |
| **`ComparisonMode` / preset** | Named preset (`year_over_year`, …) supplying defaults only. |

**Validation artifacts**

- **`ValidateMergedResult`** (`validate.ts`): success with merged object, or `{ ok: false, errorKey }` — offset failures use `status.config_invalid_time_window`.
- **`assertMergedTimeWindowConfig` / `assertLtsHardLimits`**: throw English `Error` for Lovelace overlay; card maps to localized keys elsewhere (904 domain).

## Parsed offset (new logical type)

| Field | Type | Description |
|---|---|---|
| `raw` | `string` | Trimmed user input (for logging/tests only; avoid logging in production). |
| `luxonDuration` | `Duration` | Canonical duration applied after `anchor` resolution. |
| `isZero` | `boolean` | True when equivalent to omitted offset / `P0D` (skip `plus` or treat as no-op). |

**Relationships**

- **One** `MergedTimeWindowConfig` produces **one** optional offset string → **one** parse outcome (duration or throw).
- **`ResolvedWindow`** / **`ComparisonWindow`**: unchanged shapes; `start`/`end` derived from anchor + offset + duration + step algebra (FR-900-A/B).

## Runtime windows

| Entity | Key fields | Notes |
|---|---|---|
| **`ResolvedWindow`** | `index`, `id`, `role`, `start`, `end`, `aggregation` | Built in `resolve-windows.ts`; same as today. |
| **`timeline[]`** | ordered slot timestamps | FR-900-I/J — not changed by offset parser alone. |

## Validation rules (offset-specific)

1. Omitted or blank `offset` → valid; same as `P0D` / zero duration (US-900-6 scenario 3).  
2. Legacy single-token alias → normalized to ISO then parsed.  
3. ISO string must be accepted by `Duration.fromISO` (invalid ISO → same error as invalid `time_window`).  
4. Total absolute offset &lt; 1 hour and not zero → reject.  
5. Fractional year/month in input → reject.  
6. Valid ISO with calendar components → evaluated only via `DateTime.plus` at use site (FR-900-D).

## State transitions

Configuration is stateless: invalid YAML never produces windows; valid YAML produces deterministic `ResolvedWindow[]` for a given `(now, timeZone)`.
