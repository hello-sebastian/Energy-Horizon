# Phase 0 research — `900-time-model-windows` (ISO offset)

## 1. Canonical parsing API (Luxon)

**Decision**: Parse normalized offset strings with `Duration.fromISO` after optional legacy normalization; apply with `anchorPoint.plus(duration)` in the HA zone (same as today’s `plus` for token-parsed durations).

**Rationale**: Domain spec (Public Contract, FR-900-D/Q) requires ISO 8601 duration semantics including compound forms (`P4M4D`, `-P2M`) and Luxon’s calendar-aware `plus` (month-end clamping, DST at day grain). `Duration.fromISO` is the supported Luxon entry point for ISO strings.

**Alternatives considered**:  
- **Extend only `parseDurationToken`**: Rejected — token grammar cannot express compound ISO without a full second parser.  
- **Manual regex for P/Y/M/D**: Rejected — error-prone vs Luxon; duplicates calendar rules.

## 2. Legacy `+3M` / `+1d` shim placement

**Decision**: Implement a **small pre-pass** in the single offset module: if the trimmed string matches the existing legacy single-unit pattern, map to an equivalent ISO string (`P3M`, `P1D`, …) before `Duration.fromISO`. Keep all legacy recognition in **one function** (FR-900-Q, spec Assumptions).

**Rationale**: Preserves US-900-8 scenario 3 and Edge Case 18; removal later is a one-function change.

**Alternatives considered**:  
- **Dual code paths in validate vs resolve**: Rejected — violates “one place” and risks drift.

## 3. Sub-hour and fractional rejection rules

**Decision**:  
- **Sub-hour**: After obtaining a valid `Duration`, reject when the offset’s **total absolute span** is strictly between zero and one hour (same order of magnitude as `lts-hard-limits` `MIN_DURATION_MS` for “too small” windows), matching examples `PT30M`, `PT59M`. **`P0D` / omitted offset** remains valid (backward compatible).  
- **Fractional calendar units**: Reject when the **input string** (post–legacy-normalization) contains fractional notation for year/month components (e.g. `P0.5M`, `P1.5Y`) before or after Luxon parse, consistent with spec examples.

**Rationale**: Aligns with Edge Cases 15–16 and FR-900-Q; avoids ambiguous “almost month” behavior.

**Alternatives considered**:  
- **Allow fractional if Luxon accepts**: Rejected — spec explicitly forbids.

## 4. User-visible errors (905 / 903)

**Decision**: Continue using **`status.config_invalid_time_window`** for any rejected offset (Clarifications 2026-04-22). No new `localize()` keys.

**Rationale**: Product decision recorded in spec; 904/903 unchanged for copy.

## 5. `start_of_year` offset loop (existing behavior)

**Decision**: Preserve **`computeStartOfWindow0`** behavior for `anchor === "start_of_year"` where the anchor-plus-offset candidate is shifted back by whole years until `candidate <= now`, then use unified ISO/Luxon `Duration` for the `plus` step.

**Rationale**: Spec US-900-6/7 and Edge Cases reference anchor+offset in calendar terms; existing loop handles “offset pushes start past today” for year-anchored billing; changing that is out of scope unless spec amends it.

**Alternatives considered**:  
- **Remove the loop**: Rejected — would be a behavior change not requested in FR-900-Q.

## 6. Duration/step fields vs offset

**Decision**: Keep **`parseDurationToken`** for `step` and `duration`** where YAML today uses Grafana-style tokens (`1M`, `P1M` if added later in merge output). **Only `offset`** goes through the ISO-first parser per FR-900-Q.

**Rationale**: Spec’s normative YAML shows ISO for `duration` / `step` in examples, but current code and tests use tokenized `step`/`duration`; FR-900-Q scopes **offset** explicitly. Expanding ISO to step/duration is a separate change.

**Alternatives considered**:  
- **Unify all fields on ISO only**: Rejected for this plan — scope creep vs FR-900-Q.
