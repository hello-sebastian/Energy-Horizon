# Quickstart: Full-Coverage Visual Editor (v1.2.0)

**Audience**: Developers implementing the v1.2.0 editor and validating it end-to-end.

## 1. Branch and prerequisites

```bash
cd "/Users/sebastian/Projekty local/Energy-Horizon"
git checkout 1.2.0
npm install
npm test          # TZ=UTC vitest run
npm run lint
```

## 2. Read order

1. [spec.md](./spec.md) — normative requirements (FR-908-A…X), user stories, success criteria.
2. [research.md](./research.md) — implementation decisions (debounce constant, `custom` preset, merge, UI state).
3. [data-model.md](./data-model.md) — `FieldDescriptor`, `FieldRegistry`, `EditorUiState`, config pipeline, field→section map.
4. [contracts/field-registry.md](./contracts/field-registry.md) — full field inventory + render-loop contract.
5. [contracts/editor-public-api.md](./contracts/editor-public-api.md) — `setConfig` / `config-changed` contract.
6. [contracts/editor-i18n.md](./contracts/editor-i18n.md) — `editor.*` keys across the four dictionaries.

## 3. Implementation sketch

| Step | Action |
|---|---|
| A | Add `"custom"` to `ComparisonMode` (`src/card/types.ts`) and a `custom` branch to `getPresetTemplate` (`src/card/time-windows/presets.ts`) returning the generic shape (no legacy flags). Unit-test that `resolveTimeWindows` routes `custom` to `resolveGeneric`. |
| B | Create `src/card/editor/field-registry.ts`: `FieldDescriptor`/`ControlSpec` types + the full registry (all fields from [contracts/field-registry.md](./contracts/field-registry.md)). Unit-test 100% coverage (every FR-908-D key present exactly once) and section membership (FR-908-F). |
| C | Create `src/card/editor/config-merge.ts` (preservative deep merge) + `config-normalize.ts` (load/save normalization). Unit-test: unmodeled keys survive; `time_window` merges key-by-key; `comparison_mode`/`forecast` normalized on save. |
| D | Create `src/card/editor/editor-ui-state.ts` (`EditorUiState` + expand/focus/scroll helpers). Unit-test that state survives a simulated `setConfig` re-render. |
| E | Rewrite `src/card/energy-horizon-card-editor.ts`: registry-driven render loop (six `ha-expansion-panel` sections), `EditorUiState` as `@state`, debounce pipeline (`EMIT_DEBOUNCE_MS = 300`), emit gate (delta check), preset↔custom cleanup, focus/caret/scroll restore in a post-render effect. |
| F | Add `editor.*` keys to `src/translations/{en,pl,de,fr}.json` per [contracts/editor-i18n.md](./contracts/editor-i18n.md). Add a dictionary-guard test asserting the full key set exists in all four files. |
| G | Add `tests/integration/editor-lifecycle.test.ts`: a passive `setConfig` re-render emits **zero** `config-changed`; focus/scroll/expanded preserved. |

## 4. Verify (automated)

```bash
npm test          # unit + integration (TZ=UTC)
npm run lint
```

Key automated checks:
- **Coverage** (SC-908-1): registry contains every v1.1.0 user-configurable key exactly once.
- **No churn** (SC-908-3): a passive `setConfig` re-render dispatches zero `config-changed`.
- **Stability** (SC-908-2): expanded/focus/scroll survive re-renders.
- **i18n** (SC-908-7): every `editor.*` key resolves in `en`/`pl`/`de`/`fr`.
- **Mode switching** (SC-908-5): standard↔`custom` adds/removes `period_offset`/`time_window` correctly.
- **Backward compat** (SC-908-6): a v1.1.0 config with `comparison_mode` + YAML-only fields opens, saves with `comparison_preset`, loses no fields.
- **YAML live-edit** (SC-908-9): YAML keystroke → debounced emit with no-op suppression (reformat → 0 emits; value change → 1 emit); invalid YAML → inline error, no emit, preview unchanged; hostile YAML tags (`!!python/object`) → rejected in safe mode, no code execution; `setConfig` self-echo → textarea not re-serialized; Save without switching → last valid YAML **values** saved (HA re-serializes the config, so values persist but text formatting is canonicalized).

## 5. Verify (manual, in Home Assistant)

Prereq: a dev HA instance with the card deployed (`npm run build` → copy `dist/` to `www/community/Energy-Horizon/`), and a sensor entity with statistics.

1. **Full coverage** (SC-908-1): open the editor on a card whose YAML sets *every* parameter (`primary_color`, `fill_*_opacity`, `x_axis_format`, `tooltip_format`, `aggregation`, `precision`, `number_format`, `language`, `force_prefix`, `connect_nulls`, `show_legend`, `debug`, `time_window.*`). Every value is pre-filled in the matching control/section.
2. **Live preview** (SC-908-4): change a select/switch/slider → card updates within 500 ms; type in a text field → preview updates after the debounce and on blur.
3. **Stability** (SC-908-2): expand two sections, type in a text field, toggle a switch → panels stay expanded, the text field keeps focus + caret, no scroll jump, no flash.
4. **No churn** (SC-908-3): with the editor open, trigger a passive re-render (e.g. HA re-sends the same config) → no `config-changed` (check via a console listener / no redundant card re-query).
5. **Mode switching** (SC-908-5): `year_over_year` → `custom` (verify `period_offset` removed, `time_window` initialized with defaults, sub-block visible) → `month_over_month` (verify `time_window` removed, `period_offset` restored to `-1`); the section stays expanded.
6. **Backward compat** (SC-908-6): open a v1.1.0 config containing `comparison_mode` and YAML-only fields → opens without error, `comparison_preset` pre-filled, save rewrites `comparison_mode`→`comparison_preset` and drops `forecast`, no YAML-only field lost.
7. **Localization** (SC-908-7): set `language: pl` (and `de`, `fr`) → the whole form re-labels live; no raw-key fallback.
8. **Graceful degradation** (FR-908-T): a config with an unknown `force_prefix` value and an out-of-range `time_window.count` → editor opens, shows empty/default selection, does not block save; the **card** surfaces the standard error.
9. **YAML live-edit** (SC-908-9): switch to YAML mode → type a value change → preview updates within the emit debounce window (and on blur); type a syntax error → inline error appears within the parse debounce window, preview unchanged; fix the error → preview updates; click Save **without** switching to Visual → the last valid YAML **values** are saved (HA re-serializes the config, so values persist but comments/key-order/indentation are canonicalized — verify the *values*, not the verbatim text).
10. **YAML safe mode** (FR-908-Y, Constitution II): paste YAML containing a hostile tag (e.g. `!!python/object`) → the editor shows an inline error, does **not** execute anything, keeps the last valid preview, and does not emit.
11. **External change while editing YAML** (FR-908-Y): type in YAML (edits not yet emitted) → trigger an external config change (e.g. reload the dashboard) → the textarea is re-serialized from the external config, overwriting the un-emitted edits (intended, documented trade-off).

## 6. Docs / release (`907-docs-product-knowledge`)

The spec's **Documentation Plan** (README.md, README.advanced.md "Lovelace editor" rewrite, `wiki-publish/` pages, `changelog.md` `[1.2.0]`) is **owned by domain 907** and is **not** authored in this feature's code tasks. When cutting the 1.2.0 release, ensure those docs reflect: full editor coverage (six sections), the new `custom` preset, the lifecycle guarantees, and the `comparison_mode`/`forecast` GUI normalization. See spec.md → Documentation Plan.
