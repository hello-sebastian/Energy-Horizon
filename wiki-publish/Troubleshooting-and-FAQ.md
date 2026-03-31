# Troubleshooting and FAQ

**How-to** and diagnostics for the Energy Horizon card. For option names and defaults, use [Configuration and Customization](Configuration-and-Customization).

---

## How-to: confirm the entity has long-term statistics

**Goal:** After adding the card, you see **two** series (current + reference) and non-empty summary numbers.

**Prerequisites:** Home Assistant 2024.6+, recorder/LTS enabled.

**Steps:**

1. Open **Developer Tools → Statistics** (not **States**).
2. Find your energy entity. If it is **missing**, the card cannot plot — pick a different entity (e.g. utility meter with LTS).
3. Add the card with minimal YAML (see [Getting Started](Getting-Started)).
4. Save the dashboard and wait for data fetch.

**Expected outcome:** Chart renders; summary shows units consistent with the entity (e.g. kWh).

### When something goes wrong

| Symptom | What to check |
|---------|----------------|
| Empty chart | Entity has no LTS; wrong `entity:` id; recorder disabled |
| `Custom element doesn't exist` | Lovelace resource URL wrong — see [Getting Started](Getting-Started) |
| Card shows `ha-alert` / config error | Invalid YAML key or `time_window` — enable `debug: true` and read browser console |

---

## How-to: use YAML-only options (editor vs raw YAML)

**Goal:** Use options that are **not** exposed in the visual editor (e.g. `time_window`, `debug`, `x_axis_format`) without breaking the card.

**Prerequisites:** You can open the dashboard **raw configuration** or the YAML tab for the card.

**Steps:**

1. Start from a working card created in the UI **or** from [Getting Started](Getting-Started).
2. Switch to **YAML mode** for that card (or edit `ui-lovelace.yaml` if you use YAML mode dashboards).
3. Add advanced keys documented in [Configuration and Customization](Configuration-and-Customization) under **Advanced and chart options**.
4. Reload the dashboard.

**Expected outcome:** Card loads; invalid keys show a **Lovelace configuration error** (not a silent ignore).

### When something goes wrong

- **Error on load:** Remove the last option you added; compare key names with [Configuration and Customization](Configuration-and-Customization) (must match `src` / types).
- **Empty chart after `time_window`:** See [Time Windows (advanced)](https://github.com/hello-sebastian/energy-horizon/blob/main/specs/001-time-windows-engine/wiki-time-windows.md) and validation limits (duration, max windows).

---

## How-to: diagnose missing forecast or wrong units

**Goal:** Understand whether **forecast** is disabled by config or by data rules, and whether **units** come from scaling vs entity history.

**Steps:**

1. Confirm `show_forecast` is not `false` (alias `forecast` merges into it) — see [Releases and Migration](Releases-and-Migration).
2. Read [Forecast and Data Internals](Forecast-and-Data-Internals) — forecast needs sufficient buckets and elapsed fraction.
3. For unit display: check `force_prefix` (`auto` vs `none`) in [Configuration and Customization](Configuration-and-Customization).

**Expected outcome:** Either a dashed forecast line (when rules pass) or a chart without forecast but with valid series — both can be valid.

### When something goes wrong

| Symptom | Likely cause |
|---------|----------------|
| No forecast line | Sparse data; period too young; reference slice invalid — not always a bug |
| Values “wrong” by 1000× | `force_prefix` vs raw entity units; mixed historical units |

---

## Troubleshooting matrix (quick)

| Symptom | Likely cause | What to check |
|---------|--------------|---------------|
| `Custom element doesn't exist` | Resource not loaded | Resource URL and browser console |
| Empty chart | Entity has no statistics | Developer Tools → Statistics |
| No forecast line | `show_forecast: false`, insufficient data, or rules not met | [Forecast and Data Internals](Forecast-and-Data-Internals) |
| Wrong units | Mixed unit history | Entity unit consistency |
| Values too large/small | Auto scaling not desired | `force_prefix: none` |
| Card error | Invalid config or entity typo | YAML keys and entity ID |
| Timeline error / over cap | Too many LTS slots | Reduce windows or aggregation; see [Aggregation and Axis Labels](Aggregation-and-Axis-Labels) |

## Debug mode

```yaml
debug: true
```

Inspect **browser console** for diagnostic messages (no secrets — still avoid sharing logs publicly if they contain entity names you consider private).

## FAQ

### Does the card require Energy Dashboard?

No. It requires an entity with long-term statistics.

### Why is chart empty?

Most often: wrong entity (no statistics) or recorder/statistics unavailable.

### Why is forecast missing?

Forecast appears only when data coverage and window rules allow it — see [Forecast and Data Internals](Forecast-and-Data-Internals).

### Should I force units?

Usually no. Keep `force_prefix: auto` unless you need fixed display scaling.

## Known limitations

- Card depends on quality of Home Assistant long-term statistics
- Forecast can be unavailable for sparse/inconsistent history
- Unit changes in history can distort comparison
- Card is not intended for real-time instant power visualization

## Migration notes

When new releases introduce breaking changes, see [Releases and Migration](Releases-and-Migration) and the project `changelog.md` in the repository.
