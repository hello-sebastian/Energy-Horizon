# Quickstart: Interpretation & neutral band

**Spec**: [spec.md](./spec.md) · **Contract**: [contracts/card-interpretation.yaml](./contracts/card-interpretation.yaml)

## Production entity (solar)

```yaml
type: custom:energy-horizon-card
entity: sensor.solar_production_month
interpretation: production
# optional: neutral_interpretation: 2   # default; widen band e.g. 5
```

Higher current than reference → **positive** semantic (green / trend-up). Lower → **negative**.

## Consumption (default)

Omit `interpretation` or set:

```yaml
interpretation: consumption
```

Matches legacy behavior: higher current than reference → **negative** semantic.

## Strict vs neutral band

- Default **`neutral_interpretation`** is **2** (%): if the chip’s **`|p| ≤ 2`**, narrative + chart delta use **neutral** (“similar”), not success/warning.
- Stricter judgment only when exactly balanced:

```yaml
neutral_interpretation: 0
```

## Editor

- **Consumption / Production** appears in the visual editor (v1).
- **`neutral_interpretation`** is **YAML-only** in v1; set via YAML panel or raw dashboard YAML; preserved when editing other fields.

## Tests

```bash
npm test
```

Add / run unit tests covering the semantic helper (`SemanticOutcome` branches).
