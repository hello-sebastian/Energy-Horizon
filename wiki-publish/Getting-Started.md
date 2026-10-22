# Getting Started

**Tutorial** — install the card and get a first working dashboard tile. For **why** the chart behaves as it does, see [Forecast and Data Internals](Forecast-and-Data-Internals). For **all options**, see [Configuration and Customization](Configuration-and-Customization).

## Documentation map

This wiki follows [Diátaxis](https://diataxis.fr/): you are in the **Tutorial** quadrant. Next steps:

- **How-to** problems → [Troubleshooting and FAQ](Troubleshooting-and-FAQ)  
- **Reference** lookup → [Configuration and Customization](Configuration-and-Customization)  
- **Explanation** → [Forecast and Data Internals](Forecast-and-Data-Internals), [Aggregation and Axis Labels](Aggregation-and-Axis-Labels)

---

## 1) Requirements

- Home Assistant **2024.6+**  
- Recorder and **long-term statistics** enabled  
- An entity visible in **Developer Tools → Statistics**

If the entity has no statistics, the chart will usually be empty.

---

## 2) Install the card

### HACS (recommended)

1. Open **HACS → Frontend**  
2. Click **Add repository**  
3. Add `https://github.com/hello-sebastian/Energy-Horizon`  
4. Install **Energy Horizon Card**  
5. Restart Home Assistant  

### Manual installation

1. Download `energy-horizon-card.js` from the [latest release](https://github.com/hello-sebastian/energy-horizon/releases/latest)  
2. Copy it to `config/www/`  
3. Add the resource:

```yaml
url: /local/energy-horizon-card.js
type: module
```

HACS resource URL is usually:

```yaml
url: /hacsfiles/energy-horizon-card/energy-horizon-card.js
type: module
```

---

## 3) Add your first card

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy_statistic
comparison_preset: year_over_year
aggregation: day
```

The forecast line is **on by default**. Set `show_forecast: false` only if you want to hide it.

### Optional: consecutive calendar months

For **this calendar month** vs the **previous full month** (not “same month last year”):

```yaml
type: custom:energy-horizon-card
entity: sensor.your_energy_statistic
comparison_preset: month_over_month
aggregation: day
```

### Optional: configure with the visual editor (no YAML)

Since **v1.2.0** you can configure the card entirely in the GUI:

1. Open the dashboard in **Edit** mode and click the card’s **pencil** (or three-dot menu → **Options**).
2. The editor shows **seven sections** — General, Time windows, Panels, Formatting & Localization, Chart settings, Style, Diagnostics (General and Time windows are expanded by default). Expand any section to edit its fields.
3. The **live preview** updates as you change values; click **Done** to save.

**A quick tour of the sections** (what to do in each on first configuration):

- **General** — pick the **Entity** (a sensor with long-term statistics), optionally set the **Title**/**Icon**, choose **Interpretation** (consumption vs production), and leave **Aggregation** on auto unless you need a specific bucket size.
- **Time windows** — choose the **Comparison preset** (year over year, month over year, month over month, or **custom**). Only with **custom** does the **Custom settings** subsection appear, where you set `anchor`, `duration`, `step`, `count`, and `offset`.
- **Panels** — toggle which panels are visible (comparison summary, forecast & reference total, narrative comment). The chart itself is always shown.
- **Formatting & Localization** — set the card **Language** (Auto inherits your HA profile), the **Unit** prefix, **Number format**, **Precision**, and the **Dates** formats for the axis and tooltip.
- **Chart settings** — toggle the **forecast line**, **null-gap bridging**, and the **legend**.
- **Style** — set the **Current series** and **Reference series** colors and fills (two-column layout).
- **Diagnostics** — enable **Debug** for extra console output when troubleshooting.

**Jump straight to the docs:** every section header carries a small help-circle icon that opens the wiki chapter covering that section's keys (in a new tab). **Helper texts:** non-obvious fields — the time window syntax, the Luxon date formats, aggregation, precision, and the neutral threshold — show a short helper text below the control. **Visual → YAML:** every control maps 1:1 to a YAML key — the full control → key table and a worked example are in [Configuration and Customization — Visual → YAML mapping](Configuration-and-Customization#visual--yaml-mapping).

<!-- IMAGE PLACEHOLDER: Screenshot of the visual editor in its default state (General and Time windows expanded, the rest collapsed) — the view a first-time user sees when opening the editor. -->

You do not need to touch YAML. Advanced users can switch to **YAML mode** inside the editor — both modes show the full config and switching is lossless. See [Configuration and Customization](Configuration-and-Customization#visual-editor-v120).

---

## 4) Choose the right entity

Use entities that:

- appear in **Developer Tools → Statistics**,  
- have a stable `unit_of_measurement`,  
- have enough historical data.

Good candidates: utility meters with statistics, Energy Dashboard statistics, cumulative energy sensors.

**Common mistakes:** no LTS history, changing units over time, picking an **instant power** sensor instead of **cumulative energy**. A **template** (or similar) that sums cumulative sources but stays `state_class: measurement` may yield LTS without **`sum`**—the card can still chart using **`max - min`**, but the robust fix is to set **`state_class: total_increasing`** (or an appropriate class) on the entity in Home Assistant.

---

## 5) Checkpoints (stop and verify)

| Checkpoint | Pass criteria |
|------------|----------------|
| **A — Resource** | Dashboard loads without “Custom element doesn't exist” |
| **B — Data** | Chart shows **current** and **reference** series (not empty) |
| **C — Summary** | Numeric summary shows plausible values and expected unit (e.g. kWh) |
| **D — Forecast** | If you expect forecast: dashed line appears when data rules allow (see [Forecast and Data Internals](Forecast-and-Data-Internals)); otherwise absence may be normal |

If A–C fail, go to [Troubleshooting and FAQ](Troubleshooting-and-FAQ).

---

## Migration / legacy

Older examples may use `comparison_mode` instead of `comparison_preset`. Both are read; prefer **`comparison_preset`**. If both are set, **`comparison_preset` wins**. See [Configuration and Customization](Configuration-and-Customization#migration--legacy).
