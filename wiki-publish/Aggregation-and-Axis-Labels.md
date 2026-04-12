# Aggregation and Axis Labels

**Explanation / Reference** — how the card picks LTS aggregation steps, formats axes and tooltips, and protects against oversized timelines. Aligned with the implementation in this repository.

> For copy-paste `time_window` YAML and merge rules, see the maintained draft [Time Windows (advanced)](https://github.com/hello-sebastian/energy-horizon/blob/main/specs/001-time-windows-engine/wiki-time-windows.md) in the repo.

## Automatic aggregation (`aggregation` omitted)

After **preset → `time_window` → card `aggregation`** merge, if **`aggregation` is still unset**, the card chooses **`hour`**, **`day`**, **`week`**, or **`month`** from the merged window **`duration`** so the number of timeline slots is typically in a **~20–100** readability band (when possible with LTS-supported steps). **Merged window duration of one hour or less** always selects **`hour`** so hourly windows use LTS hourly statistics.

If you set **`aggregation`** at card level or under `time_window`, that value wins per the merge rules and auto-selection is **not** applied.

## Optional `x_axis_format` (card-level)

- **Omitted**: adaptive labels (see below).
- **Set**: every visible X tick is formatted with **Luxon** `toFormat` using **Home Assistant’s time zone**. Only a **documented subset** of Luxon tokens is accepted; unsupported patterns produce a **configuration error** when the card loads (no silent fallback to adaptive).

Example:

```yaml
x_axis_format: yyyy-MM-dd HH:mm
```

## Adaptive labels (default)

Without `x_axis_format`, tick text is built with **`Intl.DateTimeFormat`** in the resolved label locale. The **first tick** is always treated as a **calendar boundary** for context. Day / month / year changes along the axis add context when needed.

## Locale cascade (labels)

Order: card **`language`** → **`hass.locale.language`** → **`en`**.

## Comparison panel period captions (current / reference)

The **short labels** next to the coloured swatches in the comparison panel (and the parenthetical part of the accessible period names) are **not** the same strings as the X-axis or tooltip header. They are built with **`formatCompactPeriodCaption`** in the repo (`src/card/labels/compact-period-caption.ts`): **abbreviated months**, **Home Assistant time zone** (`ComparisonPeriod.time_zone` / `hass.config.time_zone`), and **compressed ranges** (for example a full calendar month may show as `Mar 2026` instead of `1 Mar – 31 Mar 2026`). When the current and reference windows fall in **different calendar years**, the caption adds a **year** so the two columns stay distinguishable. For **`hour`** aggregation, clock times follow HA **`locale.time_format`** when set (`12` / `24` / `language`). Tooltip rules above (no redundant year on the shared timeline) are unchanged.

For **default presets** where the current LTS window ends at **“now”** (`currentEndIsNow` in merged `time_window`), the **current** caption still names the **full nominal** calendar month or year (via `expandCurrentWindowForCaption`) so it matches the reference column (e.g. `Apr 2026` vs `Apr 2025`) while the chart and summary values remain **year-to-date / month-to-date**. Custom `time_window` configs without that flag keep captions aligned to the actual resolved `start`–`end`.

## Time zone

Axis timestamps always use **Home Assistant’s configured time zone** (`hass.config.time_zone`), not the browser’s local zone.

## Point cap

If the shared timeline has **more than 5000** slots, the card shows a **localized error** and does not load the chart. Enable **`debug: true`** on the card to print details (including actual slot count) to the **browser console**.

## Tooltip header (hover)

The **first line** of the chart tooltip (above the value rows) is formatted for **readability**, not maximum calendar precision:

- **Default**: Precision follows effective **`aggregation`**: **month** → month name only; **day** / **week** → day + month **without year**; **hour** → time (hour and minute). If the merged window **`duration`** is **longer than one day** while using **hour** buckets, a **short date** is added after the time so the same clock time on different days is not ambiguous.
- **No redundant year**: In comparison charts, the default header **does not include the year**; which year a series refers to comes from the **legend** and series labels.
- **Shared timeline (important!)**: The header reflects the **shared chart timeline** (slot index on the comparison axis), not each series’ physical calendar date. This is intentional: the card compares “elapsed position in the window” across years/months.  
  If you need a deeper explanation of why this is correct, read [Mental Model: Comparisons and Timelines](Mental-Model-Comparisons-and-Timelines).
- **Locale**: Same cascade as X-axis labels (card `language` → HA → `en`).

### Optional `tooltip_format` (card-level)

- **Omitted**: use the default matrix above.
- **Set**: Luxon **`toFormat`** with **Home Assistant** time zone; **same supported token subset** as **`x_axis_format`**. Invalid patterns produce a **configuration error** at card load.

```yaml
tooltip_format: dd LLL yyyy
```

## “Real dates” vs comparison axis (advanced note)

The card aligns windows by **window progress**. That alignment is what makes YoY/MoY/MoM comparisons meaningful. It also means:

- The X-axis and tooltip header are about the **comparison axis**.
- Each series still comes from real calendar timestamps inside its own window.
- You should interpret rows as “same position in the period”, not “same absolute date across windows”.

This is the same reason shorter months end earlier when compared on one axis.

## Mobile / narrow layout

The X axis keeps labels **horizontal** (`rotate: 0`) and uses **label overlap hiding** so the chart remains readable on small viewports. **Manual smoke**: verify on a phone or narrow panel that an over-cap error still shows **`ha-alert`**, not a white screen.

## See also

- Repository spec: `specs/001-aggregation-axis-labels/spec.md`
- Contract: `specs/001-aggregation-axis-labels/contracts/card-config-axis.md`
