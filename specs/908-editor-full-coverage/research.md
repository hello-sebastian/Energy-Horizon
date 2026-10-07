# Research: Full-Coverage Visual Editor (v1.2.0)

All spec-level clarifications were resolved in `spec.md` → `## Clarifications` (Session 2026-10-06). This document resolves the remaining **implementation-level** unknowns from the Technical Context and records the design decisions with rationale and alternatives.

---

## R1. Debounce constant (the one open implementation detail)

**Decision**: `EMIT_DEBOUNCE_MS = 300` — a short idle timeout for free-text and number fields. The displayed value and the internal `_config` update **immediately** on every keystroke; only the `config-changed` **emit** is debounced. The pending emit is force-flushed on (a) field blur, (b) explicit commit (Visual→YAML switch, save/close), and (c) a safety idle cap. Discrete controls (select, switch, slider, color, entity, icon) emit **immediately** — no debounce.

**Rationale**:
- 300 ms is short enough that the live preview feels real-time (SC-908-4: text changes reflected "within the debounce window and always on blur") yet long enough to coalesce a full word/number into one emit, avoiding a full card re-query per keystroke (Constitution V).
- The spec (FR-908-O) fixes the *behavior* (immediate display, debounced emit, flush on blur/commit/close) and explicitly leaves the constant to `/speckit-plan` — this is that decision.
- A single named constant in `config-merge.ts`/editor shell keeps it trivially tunable later without touching behavior.

**Alternatives considered**:
- *Per-keystroke emit (no debounce)* — rejected: every keystroke would fire `config-changed` → HA re-query + full card re-render; violates Constitution V and SC-908-3's spirit (config churn).
- *Longer debounce (500–800 ms)* — rejected: makes the live preview feel laggy for text; 300 ms is the standard "feels instant but coalesces" sweet spot.
- *Debounce only on blur* — rejected: the preview would not update while typing, contradicting the "live preview" value of the editor.

---

## R2. `custom` preset — minimal domain-900 touch (confirmed type-level + one template branch)

**Decision**: Add `"custom"` to `ComparisonMode` in `src/card/types.ts`, and add a `custom` branch to `getPresetTemplate()` in `src/card/time-windows/presets.ts` returning the **generic** shape: `{ anchor: "start_of_year", duration: "1y", step: "1y", count: 2 }` with **no** `currentEndIsNow` / `referenceFullPeriod` / `periodOffsetYears` flags.

**Rationale**:
- `resolveTimeWindows()` (resolve-windows.ts) already branches: `if (merged.currentEndIsNow && merged.referenceFullPeriod && count === 2) return resolveLegacy(...); return resolveGeneric(...)`. The three standard presets set the legacy flags; a `custom` template that omits them routes to `resolveGeneric`, which resolves windows purely from `anchor`/`offset`/`duration`/`step`/`count`. This is exactly the "resolve windows generically from `time_window`" semantics the spec requires — **no new resolution logic**.
- The editor's preset↔custom cleanup (FR-908-Q) initializes `time_window` with the same defaults (`anchor: start_of_year`, `duration: 1y`, `step: 1y`, `count: 2`), so the GUI and the card agree on what "custom" means out of the box.
- Backward compatible: `custom` is opt-in; existing configs using the three standard presets are unaffected.

**Alternatives considered**:
- *New dedicated resolution function for `custom`* — rejected: duplicates `resolveGeneric`; the existing generic path is the single source of truth (Constitution V: prefer simple, no parallel paths).
- *Treat `custom` as a pure editor-only value the card ignores* — rejected: the card must accept and resolve it (Cross-domain Contract → 900); otherwise a saved `custom` config would not render.

---

## R3. Preservative deep merge — field-path aware, never drops keys

**Decision**: `config-merge.ts` implements a **field-path-aware** merge:
1. Start from the **full incoming** `_config` (the authoritative object from `setConfig` / YAML parse).
2. Apply the changed field(s) by **path**: top-level scalars are set directly; the `time_window` object is merged **key-by-key** (so editing `time_window.count` preserves `time_window.offset` etc.).
3. Every key present in the incoming config that has **no** registry descriptor is **copied through unchanged** (deprecated `comparison_mode`, legacy `forecast`, unknown/future keys).
4. The result is the new `_config` and the emitted `config-changed` payload.

**Rationale**: Guarantees FR-908-P and the "no field lost" success criterion (SC-908-1). The merge is a pure function `(baseConfig, changes) => config`, trivially unit-testable. It is the inverse of the current shallow `{...this._config, ...e.detail.value}` merge, which would clobber `time_window` wholesale.

**Alternatives considered**:
- *Shallow merge (current behavior)* — rejected: clobbers the `time_window` object and any nested structure; loses unmodeled keys.
- *Replace-whole-object on each change* — rejected: same loss problem; also breaks the "YAML is the source of truth" invariant.

---

## R4. `EditorUiState` — config-independent presentation state

**Decision**: `editor-ui-state.ts` defines `EditorUiState` = `{ expanded: Record<SectionId, boolean>; lastFocusedField?: string; lastCaret?: number; scrollAnchor?: number }`. It is **component-local Lit `@state`**, **never derived from `config`**. On every `setConfig()` re-render the editor re-applies `EditorUiState` (expanded flags, focus + caret, scroll) and emits **nothing**. Only explicit user gestures mutate it.

**Rationale**: This is the core lifecycle fix (FR-908-J/K/L/M, SC-908-2). Because HA re-invokes `setConfig()` on every `config-changed`, the only way to keep panels expanded and focus stable is to hold presentation state outside the config object and re-apply it after each render. Focus/caret restoration is done in a post-render effect (requestAnimationFrame / `updateComplete`) targeting the last-focused field by a stable `id`/`name`.

**Alternatives considered**:
- *Derive expanded state from config* — rejected: a config change would reset panels (the exact bug we are fixing).
- *Store UI state in a module-level singleton* — rejected: not testable in isolation and breaks if two editor instances exist; component-local `@state` is cleaner and testable.

---

## R5. No re-render feedback loop (FR-908-N)

**Decision**: `config-changed` emission is **gated on a genuine value delta**. The editor compares the would-be emitted config against the last-emitted config (deep, field-path aware); if identical, no event is dispatched. A `setConfig()`-driven re-render never calls the emit path — it only updates `_config` and re-applies `EditorUiState`.

**Rationale**: Prevents the feedback loop (emit → `setConfig` → re-render → emit …) and satisfies SC-908-3 (zero spurious emissions on a passive re-render). The delta check is a pure function, unit-testable.

**Alternatives considered**:
- *Emit unconditionally on every render* — rejected: creates the churn/loop the spec forbids.
- *Reference-identity check only* — rejected: a re-created but equal object would still emit; deep field-path comparison is required.

---

## R6. HA runtime components & graceful degradation

**Decision**: Render controls from the registry using HA's native components where available: `ha-entity-picker` (entity, `sensor` domain per FR-908-W), `ha-icon-picker` (icon), `ha-select` (selects), `ha-textfield` (text), `ha-switch` (booleans), `ha-slider` (opacities), `ha-color-picker` (primary_color), `ha-expansion-panel` (sections). Where a specific component is unavailable at runtime, degrade to an equivalent standard control (e.g. a `<select>`/`<input>`) rather than failing.

**Rationale**: Constitution I (use HA's built-in components / look & feel) and the spec's Assumptions (HA 2024+ components present; degrade, don't fail). `primary_color` accepts free text including `var(--accent-color)` — the color control is a convenience, not a validator (edge case in spec).

**Alternatives considered**:
- *Hand-rolled controls for everything* — rejected: diverges from HA look & feel (Constitution IV) and duplicates HA's components.
- *Hard-fail when a component is missing* — rejected: violates graceful degradation (Constitution II).

---

## R7. Localization — `editor.*` keys, FR-908-X language chain

**Decision**: All section titles, field labels, and select-option labels are sourced from the card's `localize()` under the `editor.*` namespace (consistent with domain 905; HA's internal `hass.localize` is **not** used). New keys are added to **all four** shipped dictionaries (`en`, `pl`, `de`, `fr`). The label language follows the FR-908-X chain: (1) card `language` field if set; (2) else `hass.locale.language`; (3) else the card's existing fallback. Changing `language` re-labels the whole form live (labels track the config value, not a cached value).

**Rationale**: Reuses the existing `createLocalize(lang)` pipeline already wired to the editor (`_computeLabel`); satisfies FR-908-U and FR-908-X and SC-908-7 (no missing-key fallback to the raw key). The language is recomputed from the current `_config.language` on each render so a live `language` edit re-labels the form.

**Alternatives considered**:
- *Use HA's `hass.localize`* — rejected: the spec/905 explicitly forbid it for editor labels (card-owned dictionaries are the source of truth).
- *Cache the language at editor open* — rejected: would not re-label on a live `language` change (FR-908-X).

---

## R8. Legacy key normalization on save (FR-908-I, FR-908-V)

**Decision**: `config-normalize.ts` provides pure load/save transforms:
- **Load**: `comparison_preset` is pre-filled from `comparison_mode` when `comparison_preset` is empty (existing `resolveComparisonPreset` behavior); `show_forecast` resolves as `config.show_forecast ?? config.forecast ?? true` for display.
- **Save**: the emitted config uses `comparison_preset` (replacing, not duplicating, `comparison_mode`) and `show_forecast` (dropping the `forecast` alias). Neither legacy key is rendered as a field.

**Rationale**: The editor is the UI *for* the YAML and normalizes temporary legacy keys away on save (same pattern for `comparison_mode` and `forecast`), while the preservative merge (R3) still copies any *other* unmodeled key through. This satisfies FR-908-I, FR-908-V, and SC-908-6.

**Alternatives considered**:
- *Render the legacy keys as fields* — rejected: the spec explicitly says they are NOT standalone fields.
- *Drop legacy keys on load* — rejected: load must pre-fill from them for display; only **save** normalizes them away.

---

## R9. `time_window` sub-block — five declarative fields (custom mode)

**Decision**: In `custom` mode the `time_window` sub-block is rendered as **five declarative registry fields**: `anchor` (select, 6 options: `start_of_year|start_of_month|start_of_week|start_of_day|start_of_hour|now`), `offset` (text, ISO 8601 free text), `duration` (text), `step` (text), `count` (number). Each is a normal registry descriptor with `visibleWhen: cfg => cfg.comparison_preset === "custom"`. The registry's **custom-renderer escape hatch** (FR-908-C) exists in the architecture so a richer ISO-8601/range-preview control can be swapped in later, but the rich control itself is a Non-Goal for v1.2.0.

**Rationale**: Matches the spec's Clarification Q4 and the `TimeWindowYaml` type (`anchor`, `offset`, `duration`, `step`, `count`). Declarative fields keep the sub-block consistent with the rest of the registry (FR-908-B: relocating = data change) while the escape hatch preserves future extensibility without a rewrite.

**Alternatives considered**:
- *A single custom renderer for the whole sub-block in v1.2.0* — rejected: the spec defers the rich control; five declarative fields are simpler and fully cover the surface.
- *Expose `time_window.aggregation`* — rejected: per-window aggregation is a Non-Goal (the card uses one effective `aggregation`); the top-level `aggregation` field is the editable one.

---

## R10. Section layout & progressive disclosure (FR-908-E/F)

**Decision**: Six sections in fixed order, rendered from the registry grouped by `section`: **S1 Basic** (always expanded) — `entity`, `title`, `show_title`, `icon`, `show_icon`, `comparison_preset`, `interpretation`, `neutral_interpretation`; **S2 Time & Aggregation** — `aggregation`, `period_offset` (standard) / `time_window.*` (custom); **S3 Layout & Visibility** — `show_comparison_summary`, `show_forecast`, `show_forecast_total_panel`, `show_narrative_comment`; **S4 Visuals** — `primary_color`, `fill_current`, `fill_current_opacity`, `fill_reference`, `fill_reference_opacity`, `connect_nulls`, `show_legend`; **S5 Formatting & Axis** — `precision`, `force_prefix`, `number_format`, `language`, `x_axis_format`, `tooltip_format`; **S6 System & Debug** — `debug`. S1 expanded by default; S2–S6 collapsed.

**Rationale**: Directly implements FR-908-E/F and User Story 4. Section membership is data (the `section` property), so moving a field is a data change (FR-908-B, SC-908-8).

**Alternatives considered**:
- *Hard-coded per-section templates* — rejected: violates FR-908-B (relocation must be a data change, not template surgery).

---

## R11. Cascading / dependent controls (FR-908-G/H)

**Decision**: Declarative `visibleWhen` / `disabledWhen` predicates on registry descriptors:
- `period_offset`: `visibleWhen: cfg => cfg.comparison_preset !== "custom"`.
- `time_window.*`: `visibleWhen: cfg => cfg.comparison_preset === "custom"`.
- `show_forecast_total_panel`: `disabledWhen: cfg => cfg.show_forecast === false`.

**Rationale**: Implements FR-908-G (preset↔time_window visibility) and FR-908-H (forecast cascade) declaratively, so the render loop applies them uniformly. The card (not the editor) still owns the actual gating of the Forecast|Total panel (domain 903).

**Alternatives considered**:
- *Imperative show/hide in the render template* — rejected: scatters the dependency logic; declarative predicates keep it in the registry (data).

---

## R12. Graceful degradation & no blocking validation (FR-908-S/T)

**Decision**: The editor opens without a JS error when (a) `hass` is absent, (b) a select's configured value is unknown/out-of-range (render empty/default selection), or (c) the config is the minimal stub. The editor performs **no** blocking semantic validation of `time_window`, `offset`, `x_axis_format`, `tooltip_format`, `neutral_interpretation`, or numeric ranges — invalid values are passed through and the **card** surfaces the standard error state (domains 900/902). Saving is never blocked by the editor.

**Rationale**: Implements FR-908-S/T and the spec's edge cases (out-of-range `count`, invalid Luxon tokens, negative `neutral_interpretation`, `var(...)` colors). Keeps the editor a faithful, non-blocking UI for the YAML (Constitution II: degrade, don't crash).

**Alternatives considered**:
- *Inline validation that blocks save* — rejected: explicitly a Non-Goal for v1.2.0 (FR-908-S); the card owns error surfacing.

---

## R13. YAML mode as a first-class input path (FR-908-Y)

**Decision**: The YAML textarea is a **first-class, independent input path**, not a draft/scratchpad. Text updates **immediately** on every keystroke (display). **Parse** is debounced at a short interval (`YAML_PARSE_DEBOUNCE_MS = 150`) for fast inline error feedback; it runs in **safe mode** (no execution of arbitrary code / object instantiation from hostile tags such as `!!python/object` — Constitution II). **Emit** (the expensive preview re-query) is debounced at a longer interval (`YAML_EMIT_DEBOUNCE_MS = 1000`) with **no-op suppression**: the parsed config is deep-compared against the last-emitted config, and `config-changed` is dispatched only when it differs structurally. On a successful parse, `_config` is **replaced wholesale** with the parsed config (the parsed YAML *is* the config — it is **not** a preservative merge; the preservative merge applies to *visual field edits*). The pending parse/emit is force-flushed on blur, on a mode switch, and on close — **atomically and in order** (parse first, then emit if valid; a failed parse on flush keeps the last valid `_config` and emits nothing). `setConfig()` **preserves `_editorMode`** (v1.1.0 reset to `"visual"`). A `setConfig()` **self-echo** (incoming config structurally equal to the last-emitted config) does **not** re-serialize the textarea; an **external change** (structurally different) re-serializes it (caret preservation best-effort). The self-echo / external classification MUST be robust to the known normalizations HA applies on the round-trip (key order, scalar type coercion) so a self-echo is never misclassified as external. On a YAML syntax error: inline error, keep the last valid `_config`, no emit.

**Rationale**: The user's perception is "what I see is what gets saved." The v1.1.0 model (YAML as draft, commit only on YAML→Visual switch) breaks this: the user edits YAML, clicks Save, but the last-emitted config is saved, not their edits — silent data loss. Making YAML a first-class input path fixes the decisive criterion (WYSIWYG save) and adds a live preview. **Product defense (why the complexity is justified):** with 100% visual coverage, the *unique* value of YAML mode narrows to (1) a live preview of hand-written YAML and (2) the power-user preference to edit YAML directly. We deliberately make YAML a **save path** (not merely a preview/scratchpad) because power users expect WYSIWYG save; the cost of that decision is the two-tier debounce + no-op suppression + self-echo detection. That complexity is the price of honoring the WYSIWYG expectation, and it is bounded (two core protective mechanisms, not four). **WYSIWYG scope (N1):** the promise is true for *values* — the config object HA saves is the parsed YAML, so the values you typed persist. It is **not** true for *formatting*: HA re-serializes the config object on save, so comments, key order, and indentation are canonicalized, not preserved verbatim. The spec and docs must state this precisely (values persist; formatting is canonicalized) rather than over-promise verbatim text preservation. **External-change trade-off (I2):** an external `setConfig` arriving while the user is mid-edit in YAML re-serializes the textarea, overwriting the user's un-emitted (debounced) edits. This is intended (an external change is authoritative) but is a deliberate, documented UX trade-off. Two core protective mechanisms keep the preview live but not overactive, and keep the textarea stable: (1) **no-op suppression** — the real cost saver; reformatting / key reordering / quoting changes produce zero re-queries regardless of typing frequency; (2) **self-echo → no reserialization** — the textarea is touched only by the user and on explicit mode switch / external change, so the editor's own emissions never disturb the user's caret. The separated parse/emit debounce gives fast error feedback (150 ms) while the expensive preview updates rarely (1 s idle).

**Alternatives considered**:
- *Model 2 (v1.1.0: YAML as draft, commit on switch)* — rejected: silent data loss on Save; no live preview; `setConfig` resets the mode to Visual, orphaning the draft.
- *Per-keystroke emit (no debounce)* — rejected: every keystroke fires a full card re-query; violates Constitution V.
- *2 s emit debounce* — rejected: the preview lags behind typing, undermining the value of live preview; 1 s coalesces a burst while staying "live."
- *Four protective mechanisms in the spec* — rejected: the separated debounce and the error banner are implementation details, not protective mechanisms; the spec names the two essential ones (no-op suppression, self-echo → no reserialization) to keep the requirement surface minimal.

**Constants**: `YAML_PARSE_DEBOUNCE_MS = 150`, `YAML_EMIT_DEBOUNCE_MS = 1000` (in `config-merge.ts` alongside `EMIT_DEBOUNCE_MS = 300`).

---

## Consolidated decisions

| # | Decision | Drives |
|---|---|---|
| R1 | `EMIT_DEBOUNCE_MS = 300`; discrete controls emit immediately | FR-908-O, SC-908-3/4 |
| R2 | `ComparisonMode += "custom"` + generic `getPresetTemplate` branch (no legacy flags) | Cross-domain 900, FR-908-Q |
| R3 | Field-path-aware preservative deep merge; unmodeled keys copied through | FR-908-P, SC-908-1 |
| R4 | Config-independent `EditorUiState` re-applied on every render | FR-908-J/K/L/M, SC-908-2 |
| R5 | Emit gated on genuine value delta; re-render emits nothing | FR-908-N, SC-908-3 |
| R6 | HA native components with graceful degradation | Constitution I/II, Assumptions |
| R7 | `editor.*` keys in 4 dicts; FR-908-X language chain; live re-label | FR-908-U/X, SC-908-7 |
| R8 | Load pre-fill from legacy keys; save normalizes `comparison_mode`/`forecast` away | FR-908-I/V, SC-908-6 |
| R9 | `time_window` = 5 declarative fields; custom-renderer hook present | FR-908-C/G, Clarification Q4 |
| R10 | Six sections, S1 expanded, membership = data | FR-908-E/F, SC-908-8 |
| R11 | Declarative `visibleWhen`/`disabledWhen` for cascades | FR-908-G/H |
| R12 | No blocking validation; graceful degradation | FR-908-S/T |
| R13 | YAML first-class input path: two-tier debounce (150 ms parse / 1 s emit, safe-mode parser) + no-op suppression + self-echo → no reserialization; parse **replaces** `_config` (not a merge); atomic ordered flush; `setConfig` preserves mode; values persist, formatting canonicalized by HA | FR-908-Y, SC-908-9 |

**All NEEDS CLARIFICATION items resolved.** No open unknowns remain for Phase 1.
