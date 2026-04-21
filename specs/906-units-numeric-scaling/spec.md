# 906-units-numeric-scaling
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Units & Numeric Scaling  
**Replaces**: `004-smart-unit-scaling`  
**Primary code**: `src/utils/unit-scaler.ts`  
**Last updated**: 2026-04-21  

---

<!-- NORMATIVE -->

## Current Behavior (normative)

The card applies SI prefix scaling to numeric values before displaying them on the chart Y-axis, in the comparison summary, forecast panel, and tooltip. Scaling is controlled by `force_prefix` (card-level YAML).

### SI prefixes supported

| Config value | Prefix | Factor |
|---|---|---|
| `u` | µ (micro) | × 10⁻⁶ |
| `m` | m (milli) | × 10⁻³ |
| _(base)_ | — | × 1 |
| `k` | k (kilo) | × 10³ |
| `M` | M (mega) | × 10⁶ |
| `G` | G (giga) | × 10⁹ |

### Scaling modes

- **`auto`** (default when `force_prefix` is absent or `"auto"`): prefix is selected based on the maximum value in the series. Threshold: value ≥ 1000 → step up; value < 1 → step down. When max = 0 or series is empty: no prefix, base unit.
- **Manual** (`force_prefix: k`, `m`, etc.): all values are converted to the specified scale regardless of magnitude.
- **`none`**: raw values from the HA entity are displayed without any conversion.

### Unit parsing

When `unit_of_measurement` already contains an SI prefix (e.g., `kWh`, `mA`, `MWh`), the scaler parses the base unit and current prefix (e.g., `kWh` → base `Wh`, prefix `k`) and allows further scaling (e.g., 5000 kWh → 5 MWh in auto mode).

### Excluded units

Units of time (`h`, `min`, `s`) and units that do not accept SI prefixes (`%`, `°C`, etc.) are **not scaled**; they are displayed as returned by HA regardless of `force_prefix`.

### Consistency rule

The Y-axis label and all summary/tooltip values for a given series MUST use the same scaled unit. The same `ScaledValue` output drives both the chart formatter and the text summary.

### Number formatting

Number formatting (decimal separator, thousands separator) follows the resolved locale from domain 905 (`ResolvedLocale.numberFormat`), using `Intl.NumberFormat`. Optional `precision` YAML field controls decimal places (default: implementation-sensible, typically 1–2 places).

---

## Public Contract

```yaml
# Card-level YAML (unit scaling relevant fields)
force_prefix: auto   # optional; auto | none | u | m | k | M | G; default: auto
precision: 2         # optional; number of decimal places; default: auto-selected
```

```typescript
// src/utils/unit-scaler.ts
interface ScaledValue {
  value: number;       // numeric value in the scaled unit
  unit: string;        // label string, e.g. "kWh", "mA"
  prefix: string;      // applied prefix character, e.g. "k", "" for none
}

function scaleValue(
  rawValue: number,
  unitOfMeasurement: string,
  forcePrefix: 'auto' | 'none' | 'u' | 'm' | 'k' | 'M' | 'G',
  seriesMax: number
): ScaledValue;
```

---

## Cross-domain Contracts

**Publishes to**:
- `902-chart-rendering-interaction`: `ScaledValue` used for Y-axis label formatter and series value display.
- `903-card-ui-composition`: `ScaledValue` used for summary panel values, delta chip, and forecast panel.

**Consumes from**:
- `904-configuration-surface`: `force_prefix` and `precision` YAML values.
- `905-localization-formatting`: `ResolvedLocale.numberFormat` for `Intl.NumberFormat` formatting.

---

## Non-Goals

- Scaling units of time (`h`, `min`, `s`).
- Scaling dimensionless or non-SI units (`%`, `°C`, etc.).
- Currency formatting.
- Automatic conversion between physically different units (e.g., Wh to J).

---

<!-- EXECUTION -->

## User Stories

### US-906-1 — Automatic scaling for readable charts (P1)

As a user whose entity reports values in Wh (e.g., 1500–5000 Wh per day), I need the card to automatically display values in kWh (1.5–5 kWh) with the correct unit label, so I can read the chart without deciphering a "wall of zeros."

**Independent test**: Card with entity `unit_of_measurement: "Wh"`, values 1500–3000, `force_prefix: auto` → chart and summary show 1.5–3 kWh; Y-axis label is "kWh".

**Acceptance Scenarios**:

1. **Given** entity with `unit_of_measurement: "Wh"` and values 1500–3000 Wh, **When** `force_prefix` is `auto`, **Then** chart and summary display 1.5–3 kWh with the label "kWh".
2. **Given** entity with `unit_of_measurement: "A"` and values 0.05–0.15 A, **When** `force_prefix` is `auto`, **Then** values display as 50–150 mA with the label "mA".
3. **Given** entity with values 500000–800000 Wh, **When** `force_prefix` is `auto`, **Then** values display as 500–800 kWh (or 0.5–0.8 MWh if max ≥ 1 000 000).

---

### US-906-2 — Manual prefix override (P2)

As an advanced user who wants a fixed scale for consistency across reports, I need to configure `force_prefix: k` to always display values in kWh, regardless of the raw value magnitude.

**Independent test**: `force_prefix: k`, entity value 500 Wh → displays "0.5 kWh"; entity value 2000 Wh → displays "2 kWh".

**Acceptance Scenarios**:

1. **Given** `force_prefix: k` and entity value 500 Wh, **When** the card renders, **Then** it displays "0.5 kWh".
2. **Given** `force_prefix: m` and entity value 1.5 A, **When** the card renders, **Then** it displays "1500 mA".
3. **Given** `force_prefix: M` and entity value 500000 Wh, **When** the card renders, **Then** it displays "0.5 MWh".

---

### US-906-3 — Raw values mode (P2)

As a user who prefers exact HA values without any conversion, I need `force_prefix: none` to display values and units exactly as the entity reports them.

**Independent test**: `force_prefix: none`, entity `unit_of_measurement: "Wh"`, value 1500 → displays "1500 Wh".

**Acceptance Scenarios**:

1. **Given** `force_prefix: none` and entity `unit_of_measurement: "Wh"` with value 1500, **When** the card renders, **Then** it displays "1500 Wh" without scaling.
2. **Given** no `force_prefix` in YAML, **When** the card renders, **Then** auto mode applies.

---

### US-906-4 — Time units are never scaled (P1)

As a user with an entity using a time unit (e.g., `h`), I need the value to always display in the original unit, so the card never produces nonsense like "1000 mh" from 1 h.

**Independent test**: Entity `unit_of_measurement: "h"`, value 2.5, `force_prefix: auto` → displays "2.5 h".

**Acceptance Scenarios**:

1. **Given** entity with `unit_of_measurement: "h"` and value 2.5, **When** `force_prefix` is `auto`, **Then** it displays "2.5 h" without scaling.
2. **Given** entity with `unit_of_measurement: "min"` and any `force_prefix` value, **When** the card renders, **Then** time unit scaling is skipped; values display in the original unit.

---

## Edge Cases

1. **`unit_of_measurement` is empty or unknown**: behaves as `force_prefix: none` — value displayed without scaling; unit label is empty or taken from entity as-is.
2. **Unit does not accept SI prefixes** (`%`, `°C`): scaling is skipped; value displayed in original unit regardless of `force_prefix`.
3. **Invalid `force_prefix` value**: fallback to `auto`; no error blocking render.
4. **Value = 0**: displays "0" with the unit appropriate to the series context; scale consistent with the rest of the series.
5. **Series max = 0 or series empty**: base unit without prefix is used; no prefix selected.
6. **Mixed-magnitude series** (e.g., 0.5 Wh and 5000 Wh in the same series): scale selected based on the series maximum.
7. **Unit already has SI prefix** (`kWh`, `mA`, `MWh`): the scaler parses base + existing prefix, then applies further scaling if needed (e.g., 5000 kWh → 5 MWh in auto mode).

---

## Functional Requirements

- **FR-906-A (SI prefix set)**: The scaler MUST support prefixes µ (config `u`), m, k, M, G with factors 10⁻⁶, 10⁻³, 10³, 10⁶, 10⁹ relative to the base unit.

- **FR-906-B (Auto mode)**: In `auto` mode, the prefix MUST be selected based on the series maximum: value ≥ 1000 → step up; value < 1 → step down. When max = 0 or series is empty, no prefix is applied.

- **FR-906-C (Manual mode)**: When `force_prefix` is a specific prefix (`u`, `m`, `k`, `M`, `G`), ALL values for that series MUST be converted to the specified scale regardless of magnitude.

- **FR-906-D (None mode)**: When `force_prefix: none`, raw values from the HA entity MUST be displayed without any SI conversion.

- **FR-906-E (Unit parsing with existing prefix)**: When `unit_of_measurement` already contains an SI prefix (e.g., `kWh`, `mA`), the scaler MUST parse it into base unit + existing prefix and allow further scaling in auto or manual mode.

- **FR-906-F (Time unit exclusion)**: Units of time (`h`, `min`, `s`) MUST NOT be scaled. They MUST be displayed in their original form regardless of `force_prefix`.

- **FR-906-G (Non-SI unit exclusion)**: Units that do not accept SI prefixes (`%`, `°C`, and similar) MUST NOT be scaled; they display as returned by HA.

- **FR-906-H (Unit label consistency)**: The Y-axis label and all summary/tooltip values for the same series MUST use the same `ScaledValue.unit`. The scaling decision MUST be made once per render cycle and reused for all display surfaces.

- **FR-906-I (Locale-aware number formatting)**: All numeric values MUST be formatted using `Intl.NumberFormat` with the locale from `ResolvedLocale.numberFormat` (domain 905). Optional `precision` YAML field sets decimal places; if absent, a sensible default (implementation-defined, typically 1–2) is used.

- **FR-906-J (Pure utility function)**: The scaling logic MUST be implemented as a pure function in `src/utils/unit-scaler.ts`, independently testable with no rendering dependencies.

- **FR-906-K (Invalid `force_prefix` fallback)**: An unrecognized `force_prefix` value MUST fall back to `auto` behavior; no error blocking render.

---

## Key Entities

- **`ScaledValue`**: `{ value: number, unit: string, prefix: string }` — the output of `scaleValue()`. The single source of truth for all numeric display in the card for a given series.
- **`unit_of_measurement`**: HA entity attribute providing the base unit string (e.g., `Wh`, `kWh`, `A`). May already contain an SI prefix.
- **`force_prefix`**: Card-level YAML field controlling scaling mode: `auto` | `none` | `u` | `m` | `k` | `M` | `G`.
- **`precision`**: Optional card-level YAML field setting decimal places for all formatted values.
- **`seriesMax`**: The maximum numeric value in the series, used in auto mode for prefix selection.

---

## Success Criteria

- **SC-906-1**: For entities reporting in Wh with values 1500–5000, auto mode displays values in kWh (1.5–5) with the "kWh" unit label — verified by unit test and manual inspection.
- **SC-906-2**: Time units (`h`, `min`, `s`) display without scaling in 100% of test scenarios regardless of `force_prefix` value.
- **SC-906-3**: Y-axis labels and summary values use the same unit for a given series in all tested configurations — verified by UI inspection.
- **SC-906-4**: All scaling scenarios (auto, manual prefix, none, empty series, existing prefix in unit) have corresponding Vitest unit tests in `src/utils/unit-scaler.ts`.

---

## Assumptions

- `unit_of_measurement` is available synchronously from `hass.states[entity].attributes`.
- The existing `resolveLocale` / `numberFormatToLocale` mechanism from domain 905 is the source of locale for `Intl.NumberFormat`.
- Automatic scaling thresholds follow standard SI engineering convention (≥ 1000 → step up, < 1 → step down); HA does not define its own thresholds.
- The representative value for auto prefix selection is the series maximum.
- Documentation changes (README, wiki, changelog) for unit scaling options are covered by domain `907-docs-product-knowledge`.
