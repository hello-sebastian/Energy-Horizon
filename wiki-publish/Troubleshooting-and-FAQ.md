# Troubleshooting and FAQ

This page combines quick diagnostics, common questions, and current limitations.

## Troubleshooting matrix

| Symptom | Likely cause | What to check |
|---|---|---|
| `Custom element doesn't exist` | Resource not loaded | Resource URL and browser console |
| Empty chart | Entity has no statistics | Developer Tools -> Statistics |
| No forecast line | `show_forecast: false`, insufficient data, or today outside window | Ensure `show_forecast` is not `false`; verify data coverage and window range |
| Wrong units | Mixed unit history | Entity unit consistency |
| Values too large/small | Auto scaling not desired | Use `force_prefix: none` |
| Card error | Invalid config or entity typo | YAML keys and entity ID |

## Debug mode

Enable diagnostic logs:

```yaml
debug: true
```

Then inspect browser console logs.

## FAQ

### Does the card require Energy Dashboard?

No. It requires an entity with long-term statistics.

### Why is chart empty?

Most often: wrong entity (no statistics) or recorder/statistics unavailable.

### Why is forecast missing?

Forecast appears only after minimal data coverage and valid reference slice.

### Should I force units?

Usually no. Keep `force_prefix: auto` unless you need fixed display units.

## Known limitations

- Card depends on quality of Home Assistant long-term statistics
- Forecast can be unavailable for sparse/inconsistent history
- Unit changes in history can distort comparison
- Card is not intended for real-time instant power visualization

## Migration notes

When new releases introduce breaking changes, this page is updated with:

- breaking changes,
- new or deprecated options,
- required config migration steps.
