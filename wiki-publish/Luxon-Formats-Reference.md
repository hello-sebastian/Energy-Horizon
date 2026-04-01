# Luxon Formats Reference

**Reference** — how `x_axis_format` and `tooltip_format` are validated and applied.

This card uses Luxon `DateTime.toFormat(...)` patterns, but with a **restricted allow-list** for safety and predictable output. Invalid patterns fail fast (card shows a config error).

If you came here from the project README:

- Configure these keys: [Configuration and Customization](Configuration-and-Customization#axis-and-tooltip-formatting-luxon)
- If the card errors after setting a format, check: [Troubleshooting and FAQ](Troubleshooting-and-FAQ)

---

## What these options do

### `x_axis_format`

When set (non-empty after trim):

- the X-axis tick labels are formatted using Luxon `toFormat`
- adaptive “smart boundary” labels are disabled

### `tooltip_format`

When set (non-empty after trim):

- the tooltip header (first line) uses this Luxon pattern
- it uses the same validator as `x_axis_format`

---

## Validation rules (fail-fast)

- Empty strings are rejected (if you set the key, it must not be blank).
- Only a **subset** of Luxon tokens is allowed.
- Only specific separators/characters are allowed (spaces and common punctuation).

If validation fails, the card shows:

- `status.config_invalid_x_axis_format` or
- `status.config_invalid_tooltip_format`

---

## Allowed characters (separators)

Separators are intentionally limited. Safe examples that work well:

- spaces, `-`, `_`, `.`, `:`, `,`, `/`, `+`
- digits
- `T`
- single-quoted literals (e.g. `'Week' W`)

If you include other characters, the pattern can be rejected.

---

## Practical patterns (copy/paste)

### Daily labels (EU style)

```yaml
x_axis_format: dd.MM.yyyy
```

### Month labels

```yaml
x_axis_format: LLL yyyy
```

### Tooltip with weekday + time

```yaml
tooltip_format: cccc, dd LLL yyyy HH:mm
```

---

## Pro-tip: keep forced formats short

For long windows (months/years), forcing `x_axis_format` to include time (`HH:mm`) can create noisy labels. Prefer shorter formats on the axis and use a richer `tooltip_format` instead.

---

## Mental model reminder

When you force formats, you format the **shared comparison timeline**, not the raw timestamps of each window. That is on purpose: the comparison axis represents “elapsed position in the window”.

More context: [Mental Model: Comparisons and Timelines](Mental-Model-Comparisons-and-Timelines).

---

## External reference

Luxon token table: `https://moment.github.io/luxon/#/formatting?id=table-of-tokens`
