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
