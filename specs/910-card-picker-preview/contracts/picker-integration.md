# Contract — Card picker integration (public behavior)

This contract defines the user-facing and integration behavior the implementation must honor.
It is the "public interface" of the feature: the two picker hooks, the sample configuration, and
the picker-mode render behavior. It exposes **no new configuration keys** and **no new HA APIs**
(only the documented `window.customCards` hooks and the existing LTS query).

## 1. "By entity" view — `getEntitySuggestion` hook

Registered on the `window.customCards` entry in `src/index.ts`.

| Aspect | Contract |
|---|---|
| **Suggested when** | The entity exists in `hass.states` **and** `attributes.unit_of_measurement` is exactly one of `kWh`, `Wh`, `MWh`, `m³`, `l` (FR-001, FR-003). |
| **Not suggested when** | The entity is missing from `hass.states`, has no `unit_of_measurement`, or its unit is not in the supported set (FR-002). Returns `null`. |
| **Returned config** | The sample preview configuration (see §3) with `entity` = the selected entity (FR-004). |
| **Failure mode** | The function is total and non-throwing. Any unexpected condition returns `null` (the picker drops the card from the suggestions rather than erroring — research R1). |
| **Synchrony** | Synchronous; no async work, no queries (the picker calls it while building the suggestion list). |

**Acceptance mapping**: US1 scenarios 1–4; SC-001 (100% of supported-unit entities suggested),
SC-002 (0% of unsupported-unit entities suggested).

## 2. "By card" view — static `getStubConfig`

Implemented on the `EnergyHorizonCard` element with the full HA signature
`(hass: HomeAssistant, entities: string[], entitiesFallback: string[])`.

| Aspect | Contract |
|---|---|
| **Entity selection** | Prefer the first entity in `entities` (unused, available) whose unit is supported; if none, the first in `entitiesFallback` (used, available) whose unit is supported; if none, `""` (FR-007, FR-008). |
| **Returned config** | The sample preview configuration (see §3) with the selected `entity`. |
| **No suitable entity** | `entity: ""` — the card's picker-mode demo path then renders with the default unit (FR-008, Assumptions). |
| **Failure mode** | Total and non-throwing; any unexpected condition returns the sample config with `entity: ""`. |

**Acceptance mapping**: US2 scenarios 1–4; US3 scenarios 3–4.

## 3. Sample preview configuration (shared by both hooks)

```ts
{
  type: "energy-horizon-card",   // present in the suggestion config; omitted in the stub config
  entity: <string>,              // selected / found entity, or "" (stub only)
  comparison_preset: "year_over_year",
  interpretation: "consumption",
  neutral_threshold: 2
}
```

| Aspect | Contract |
|---|---|
| **Content** | Exactly the card's default configuration (the standard appearance, FR-005/FR-009). No extra keys. |
| **Persistence** | Never persisted as a saved configuration (FR-010). It is only the picker's starting point; when the user adds the card, the normal configuration flow starts from it. |

## 4. Picker-mode render behavior (`preview === true`)

The card element detects picker mode via the `preview` property forwarded by `hui-card`
(research R2).

| Aspect | Contract |
|---|---|
| **Initial render** | The demo series is rendered **immediately** — a chart with a current and a reference series plus the standard panels — with no query on the critical path and no blank/loading state (FR-014, FR-011, SC-004). |
| **Real-data update** | A real-data query (the existing LTS path) is fired with a short time limit (~2–3 s). If it succeeds in time and yields a current series, the preview updates **in place** to the real data (FR-007, FR-014). The update happens at most once per picker session. |
| **Fallback** | On query failure, timeout, or empty result, the demo series stays (FR-008). No loading or error state is ever shown in the picker (FR-011). |
| **No-data message** | The no-data message ("There is no data to display for the selected period") is **never** shown in picker mode (FR-005). |
| **Interactivity** | The 909 preview controls (back/forward/reset) are **not rendered** in picker mode — the preview is non-interactive (spec Assumptions, research R6). |
| **Theme & localization** | The preview respects the active HA theme (light/dark) and the card's localization (FR-012). |
| **Isolation** | The preview does not interfere with other cards, the picker, or the dashboard (FR-013). No preview state leaks between picker sessions or into the dashboard (spec Edge Cases). |
| **Normal mode** | When `preview === false` (dashboard), the demo path is never taken; the card behaves exactly as before this feature. |

**Acceptance mapping**: US2, US3, US4; SC-003 (recognizable chart in 100% of picker sessions),
SC-004 (no perceptible waiting, no loading/error state), SC-005 (purpose identifiable from the
preview), SC-006 (0 persisted configuration changes).

## 5. Demo data series (deterministic)

| Aspect | Contract |
|---|---|
| **Shape** | A `ComparisonSeries` (current + reference `CumulativeSeries`) in the existing types — consumed by the normal render pipeline unchanged (research R4). |
| **Determinism** | Same `(unit, now, timeZone)` → same output on every call (no randomness). The preview content is identical on every render (spec Assumptions). |
| **Plausibility** | Realistic magnitudes and units for the card's domain; the unit matches the configured entity's unit, or `kWh` when no entity is found (FR-009, Assumptions). |
| **Standard information** | The card shows its standard information (title, period label, comparison summary) with the demo series (FR-009). |

## 6. Out of scope (explicit)

- No new configuration keys, no editor changes, no new HA APIs.
- No change to the card's normal (dashboard) data pipeline or its 909 preview feature.
- No localization of the demo series content beyond the card's existing translations.
- No persistence of any preview content.
