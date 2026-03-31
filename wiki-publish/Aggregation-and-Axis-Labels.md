# Aggregation and axis labels

This page summarizes **automatic aggregation**, **optional forced X-axis format**, **locale**, **mobile-friendly** axis layout, and the **point cap** — aligned with the implementation in the repository.

## Automatic aggregation (`aggregation` omitted)

After **preset → `time_window` → card `aggregation`** merge, if **`aggregation` is still unset**, the card chooses **`hour`**, **`day`**, **`week`**, or **`month`** from the merged window **`duration`** so the number of timeline slots is typically in a **~20–100** readability band (when possible with LTS-supported steps).

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

## Time zone

Axis timestamps always use **Home Assistant’s configured time zone** (`hass.config.time_zone`), not the browser’s local zone.

## Point cap

If the shared timeline has **more than 5000** slots, the card shows a **localized error** and does not load the chart. Enable **`debug: true`** on the card to print details (including actual slot count) to the **browser console**.

## Tooltip header (hover)

The **first line** of the chart tooltip (above the value rows) is formatted for **readability**, not maximum calendar precision:

- **Default**: Precision follows effective **`aggregation`**: **month** → month name only; **day** / **week** → day + month **without year**; **hour** → time (hour and minute). If the merged window **`duration`** is **longer than one day** while using **hour** buckets, a **short date** is added after the time so the same clock time on different days is not ambiguous.
- **No redundant year**: In comparison charts, the default header **does not include the year**; which year a series refers to comes from the **legend** and series labels.
- **Primary axis only**: The header always reflects **`fullTimeline[slot]`** for the shared X-axis (the current / primary window’s timeline), not each series’ physical calendar date at that slot—aligned with “same index = same position in the window” for comparisons.
- **Locale**: Same cascade as X-axis labels (card `language` → HA → `en`).

### Optional `tooltip_format` (card-level)

- **Omitted**: use the default matrix above.
- **Set**: Luxon **`toFormat`** with **Home Assistant** time zone; **same supported token subset** as **`x_axis_format`**. Invalid patterns produce a **configuration error** at card load.

```yaml
tooltip_format: dd LLL yyyy
```

## Mobile / narrow layout

The X axis keeps labels **horizontal** (`rotate: 0`) and uses **label overlap hiding** so the chart remains readable on small viewports. **Manual smoke**: verify on a phone or narrow panel that an over-cap error still shows **`ha-alert`**, not a white screen.

## See also

- Repository spec: `specs/001-aggregation-axis-labels/spec.md`
- Contract: `specs/001-aggregation-axis-labels/contracts/card-config-axis.md`
