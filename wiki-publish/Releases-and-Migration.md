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

Custom windows are **YAML-only** for most setups. Full parameter tables and examples:

- Repo draft: [`specs/001-time-windows-engine/wiki-time-windows.md`](https://github.com/hello-sebastian/energy-horizon/blob/main/specs/001-time-windows-engine/wiki-time-windows.md)

After editing `time_window`, validate against the same option names you use for the rest of the card (`aggregation`, `comparison_preset`, etc.) in [Configuration and Customization](Configuration-and-Customization).
