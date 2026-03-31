# Releases and Migration

Use this page for version-to-version upgrade guidance.

## Where to find releases

- GitHub Releases: https://github.com/hello-sebastian/energy-horizon/releases

## Migration checklist template

For each release, document:

1. Breaking changes
2. New options
3. Deprecated/removed options
4. Required YAML updates
5. Verification steps after upgrade

## Notable behavior changes

### Forecast line default (`show_forecast`)

The chart forecast overlay is **shown by default** when a forecast can be computed. Users who preferred **no** dashed forecast line without setting any option should add:

```yaml
show_forecast: false
```

The boolean alias `forecast` is accepted and merged into `show_forecast` at load time.

## Practical upgrade flow

1. Read release notes before updating.
2. Update card package/file.
3. Compare your YAML with migration notes.
4. Reload dashboard and verify chart, summary, units, and forecast.
5. If issues appear, use [Troubleshooting and FAQ](Troubleshooting-and-FAQ).
