# Quickstart: 007-gui-editor-full-coverage

**Branch**: `007-gui-editor-full-coverage` | **Date**: 2026-09-30

Developer guide for implementing full GUI editor coverage. See `data-model.md` for the field/section model and `contracts/lovelace-editor-api.md` for the API contract.

---

## Prerequisites

- Node.js ≥ 18, `npm install` done.
- Working HA dev environment (or HACS install) for manual integration testing.
- Branch: `007-gui-editor-full-coverage`.
- Base domain `005-gui-editor` already implemented (`src/card/energy-horizon-card-editor.ts` exists with 7 fields, Visual/YAML toggle, `config-changed`).

---

## Files to Create

| File | Description |
|------|-------------|
| `Test/tests/unit/editor-mapping.test.ts` | Unit tests for the editor's pure mapping/validation helpers |

## Files to Modify

| File | Change |
|------|--------|
| `src/ha-types.ts` | Extend `HaFormSchema` union: `number`, `color`, `icon` selector variants; `select` gains `mode?: "list" \| "dropdown"` |
| `src/card/localize.ts` | Export `SUPPORTED_LANGUAGES` (dictionary keys) |
| `src/translations/en.json` | New `editor.*` keys (labels, sections, options, errors); `editor.comparison_preset.*`, `editor.force_prefix.*`, `editor.icon.entity` |
| `src/translations/pl.json` | Same |
| `src/translations/de.json` | Same |
| `src/translations/fr.json` | Same |
| `src/card/energy-horizon-card-editor.ts` | Section model, full schemas, `time_window` subform, validation, accordion |
| `README.md` | New "Visual editor" section (all fields by section) |
| `README.advanced.md` | "Lovelace editor" → full field → control → default table |
| `wiki-publish/Configuration-and-Customization.md` | New "Visual editor coverage" subsection |
| `wiki-publish/Documentation-Maintenance.md` | Spec anchors (005/007) + drift-check item |

---

## Implementation Order (linear, no skipping)

1. **`src/ha-types.ts`** — extend `HaFormSchema` (number/color/icon). Types only, no runtime change.
2. **`src/card/localize.ts`** — export `SUPPORTED_LANGUAGES` from the existing `DICTIONARIES`.
3. **`src/translations/{en,pl,de,fr}.json`** — add all new `editor.*` keys (keep existing 005 keys intact).
4. **`src/card/energy-horizon-card-editor.ts`** — the main change:
   - Define the 8 `EditorSection` descriptors (data-driven: `id`, `labelKey`, `advanced`, `schema`, `toForm`, `fromForm`).
   - `toForm`: apply card defaults (R-008 table in `research.md`); `aggregation`/`language` `undefined` → `"auto"`; unset `time_window` → `getPresetTemplate(comparison_preset, period_offset)` values.
   - `fromForm`: `"auto"` → `undefined`; empty `time_window_*` → omitted; untouched `time_window` → key omitted.
   - Validation: on `time_window` section change run `buildMergedTimeWindowConfig` + `validateMergedTimeWindowConfig`; on format fields run `validateXAxisFormat`; store results in `_fieldErrors` (inline display). **Never block `_emitConfigChanged()`.**
   - Render: toggle row (005) + sections; basic sections get `<h3 class="eh-section__title">`; advanced sections in `<ha-expansion-panel>` (guard: if element undefined, render unwrapped); `_openSections`/`_fieldErrors` reset in `setConfig`.
   - Selects with `mode: "dropdown"` (compact dropdown, not radio — `mode: "list"` renders radio buttons): `comparison_preset`, `force_prefix`, `icon`, `aggregation`, `time_window_anchor`, `time_window_aggregation`, `language`, `number_format`.
   - Icon: `select` with `custom_value: true` (searchable combo box — any MDI icon reachable); first option `auto` = "Entity icon (auto)" (the combo box value handler swallows `""`); `toForm`: `icon: config.icon ?? "auto"`; `fromForm`: `autoToUndefined(data.icon)`.
   - `_handleExpandedChanged`: syncs `_openSections` from the panel's `expanded-changed` event (the panel's internal `#summary` handler is the sole toggle); `header` property for the section title; collapsed sections take no space via the panel's internal `height: 0px` + `_showContent` gating; `ha-expansion-panel { display: block }` set explicitly (matches HA's own pattern; avoids Chromium overlap bug).
5. **`Test/tests/unit/editor-mapping.test.ts`** — unit tests (see below).
6. **Docs** — `README.md`, `README.advanced.md`, `wiki-publish/Configuration-and-Customization.md`, `wiki-publish/Documentation-Maintenance.md` (tables must match the implemented sections/fields exactly).

---

## Key Implementation Notes

### Section rendering sketch

```ts
protected render(): TemplateResult {
  // ... 005 toggle row (Visual/YAML) unchanged ...
  if (this._editorMode === "yaml") { /* 005 textarea unchanged */ }
  return html`
    <div class="editor">
      ${this._sections.map((s) => {
        const form = html`<ha-form
          .schema=${s.schema}
          .data=${s.toForm(this._config!)}
          .hass=${this.hass}
          .computeLabel=${this._computeLabel.bind(this)}
          @value-changed=${(e: CustomEvent) => this._handleSectionValueChanged(s, e)}
        ></ha-form>`;
        if (!s.advanced) return form;
        const open = this._openSections.has(s.id);
        return html`<ha-expansion-panel
          .header=${this._t(s.labelKey)}
          .expanded=${open}
          @expanded-changed=${(e: CustomEvent<{ expanded: boolean }>) =>
            this._handleExpandedChanged(s.id, e)}
        >${form}</ha-expansion-panel>`;
      })}
    </div>`;
}
```

### Validation wiring (advisory only)

```ts
private _validateTimeWindowSection(): void {
  const merged = buildMergedTimeWindowConfig(this._config!);
  const result = validateMergedTimeWindowConfig(merged);
  this._fieldErrors.time_window = result.ok
    ? null
    : this._t(result.errorKey, result.errorParams); // localized status.* key
  // config-changed is emitted regardless (005 pattern)
}
```

### Unit tests to write (`Test/tests/unit/editor-mapping.test.ts`)

- `toForm` defaults: unset booleans → `true`/`false` per card semantics; `precision` → 2; opacities → 30; `aggregation`/`language` → `"auto"`.
- `fromForm`: `"auto"` → `undefined` (key omitted); concrete values stored literally.
- `time_window` mapping: all-empty sub-fields → `time_window` key omitted; partial override → only set sub-fields in the object.
- Unknown select value in YAML → form shows `"auto"`/empty, raw value preserved in emitted config.
- Validation: invalid `duration` (`"abc"`) → `_fieldErrors.time_window` set, config still emitted; valid merged window → no error.
- `x_axis_format` / `tooltip_format`: invalid Luxon pattern → inline error; valid → none.
- `setConfig` resets `_openSections` and `_fieldErrors`.

---

## Manual Verification (HA instance)

1. `npm run build` → deploy `dist/` to HA (or use `npm run dev` + resource pointing at the dev server).
2. Open the card editor (three-dot menu → Edit):
   - Basic sections (entity/title/comparison, header, forecast) visible; advanced sections collapsed.
   - Expand each advanced section; verify values match the card's YAML/defaults.
3. Change `primary_color` → line + fill update live (< 500 ms).
4. Change `aggregation` to `week` → chart re-buckets.
5. In time window section: set `count: 3` → third context window appears; set `duration: "abc"` → inline error + card error state; fix → chart returns.
6. Set `x_axis_format: "zzz"` → inline error; card shows its format-error state.
7. Switch to YAML mode → full config present; add a YAML-only field, switch back, change a form field, save → YAML-only field preserved (SC-002).
8. Set HA language to `de`/`fr` → all labels/options localized; no raw keys.
9. `npm run test` (unit) + `npm run lint` + `npm run build` all green.

---

## Documentation Verification

- `README.md` "Visual editor" section lists all 27 fields grouped in the 8 sections.
- `README.advanced.md` table: field → control → default → description (matches `data-model.md` §1).
- Wiki `Configuration-and-Customization.md` "Visual editor coverage" table matches the implementation; no field described as "YAML-only" that has a control (SC-004).
- `Documentation-Maintenance.md`: Spec anchors include `005-gui-editor`/`007-gui-editor-full-coverage`; drift-check checklist includes the editor scan item.
