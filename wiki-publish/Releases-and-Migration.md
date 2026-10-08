# Releases and Migration

**How-to** for upgrading the card and adjusting YAML after breaking changes. For **every option name**, authoritative spelling lives in [Configuration and Customization](Configuration-and-Customization) (keep names identical to YAML keys).

## Where to find releases

- **GitHub Releases:** https://github.com/hello-sebastian/energy-horizon/releases  
- **Changelog (repo):** https://github.com/hello-sebastian/energy-horizon/blob/main/changelog.md

## Migration checklist template

For each release, document:

1. Breaking changes  
2. New options  
3. Deprecated/removed options  
4. Required YAML updates  
5. Verification steps after upgrade  

Cross-check option names against [Configuration and Customization](Configuration-and-Customization) before pasting YAML.

## Notable behavior changes

### 1.2.0 — Full-coverage visual editor (908)

- **Full-coverage visual editor:** the Lovelace editor now exposes **every** configuration parameter, organized into six sections — **Basic Settings**, **Time & Aggregation**, **Layout & Visibility**, **Visuals & Chart Styling**, **Formatting & Axis**, **System & Debug**. No YAML is required to configure the card.
- **New `custom` comparison preset:** `comparison_preset: custom` resolves windows **generically** from the `time_window` block (no preset template, no `period_offset`). In the editor, selecting `custom` shows the `time_window` sub-block and hides `period_offset`; switching back to a standard preset restores `period_offset: -1` and removes `time_window`.
- **Editor lifecycle stability:** expanded sections, focus/caret, and scroll now persist across HA re-renders; text-input emits are debounced; no spurious `config-changed` events on passive re-renders.
- **YAML mode is a first-class input path:** live preview (debounced), the last valid YAML **values** are saved without switching to Visual, and syntax errors are shown inline. HA re-serializes the config on save, so values persist but text formatting is canonicalized.
- **`comparison_mode` → `comparison_preset` migration in the GUI:** a legacy `comparison_mode` is migrated to `comparison_preset` when saving from the visual editor.
- **`neutral_interpretation`** is now GUI-editable (Basic Settings) — no longer YAML-only.

### 1.1.0 — `interpretation` and `neutral_interpretation` (903)

- **`interpretation`:** optional; defaults to **`consumption`** (same narrative semantics as before). Set **`production`** for generation entities so “higher than reference” reads as success for the **narrative row**, **trend icon**, and **chart delta** colors. Delta chip **+/−** values are unchanged.
- **`neutral_interpretation`:** optional percent band **T** (default **2**); when the chip percent **p** satisfies **|p| ≤ T**, those same UI areas use **neutral** styling. YAML-only in 1.1.0; **GUI-editable since 1.2.0** (Basic Settings).

### Forecast line default (`show_forecast`)

The forecast overlay is **shown by default** when a forecast can be computed. To hide it:

```yaml
show_forecast: false
```

The boolean alias `forecast` is accepted and merged into `show_forecast` at load time (same meaning — prefer `show_forecast` in docs).

### `comparison_preset` vs legacy `comparison_mode`

- **Canonical key:** `comparison_preset` — see comparison modes in [Configuration and Customization](Configuration-and-Customization#comparison-behavior).  
- **Deprecated:** `comparison_mode` — still read for old dashboards. If both are set, **`comparison_preset` wins**.

## Practical upgrade flow

1. Read release notes and `changelog.md` before updating.  
2. Update the card via HACS or manual file copy.  
3. Compare your YAML with [Configuration and Customization](Configuration-and-Customization); adjust renamed or new keys.  
4. Reload the dashboard and verify chart, summary, units, and forecast.  
5. If issues appear, use [Troubleshooting and FAQ](Troubleshooting-and-FAQ).

## Advanced YAML (`time_window`)

Custom windows can be set in YAML or in the visual editor (v1.2.0: `comparison_preset: custom` → Time & Aggregation section). Full parameter tables and examples:

- Repo draft: [`specs/001-time-windows-engine/wiki-time-windows.md`](https://github.com/hello-sebastian/energy-horizon/blob/main/specs/001-time-windows-engine/wiki-time-windows.md)

After editing `time_window`, validate against the same option names you use for the rest of the card (`aggregation`, `comparison_preset`, etc.) in [Configuration and Customization](Configuration-and-Customization).
