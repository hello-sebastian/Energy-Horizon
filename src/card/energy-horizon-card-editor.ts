import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { TemplateResult } from "lit";
import type { HomeAssistant } from "../ha-types";

/**
 * Detail shape of the value-carrying events dispatched by HA's picker/select
 * components (`ha-select` → `selected`, `ha-icon-picker` / `ha-color-picker`
 * → `value-changed`). All expose the new value as `detail.value`. Mirrors the
 * HA frontend event types without importing the HA frontend package.
 */
interface HaValueDetailEvent {
  detail: { value: unknown };
}
import type {
  CardConfig,
  CardConfigInput,
  ComparisonMode
} from "./types";
import { createLocalize } from "./localize";
import {
  FIELD_REGISTRY,
  SECTION_ORDER,
  visibleFields,
  resolveFieldValue,
  toConfigValue,
  type FieldDescriptor,
  type SectionId
} from "./editor/field-registry";
import {
  preservativeMerge,
  hasConfigDelta,
  deepEqual,
  EMIT_DEBOUNCE_MS,
  YAML_PARSE_DEBOUNCE_MS,
  YAML_EMIT_DEBOUNCE_MS
} from "./editor/config-merge";
import { normalizeForLoad, normalizeForSave } from "./editor/config-normalize";
import {
  defaultUiState,
  withExpanded,
  withFocus,
  withScroll,
  reapplyAfterRender,
  type EditorUiState
} from "./editor/editor-ui-state";
import { applyPresetSwitch } from "./editor/preset-switch";
import { editorLabelLanguage } from "./editor/editor-label-language";
import { safeParseYaml } from "./editor/yaml-safe";

type EditorMode = "visual" | "yaml";

/**
 * Full-Coverage Visual Editor (v1.2.0).
 *
 * A thin Lit shell driven entirely by the declarative {@link FIELD_REGISTRY}
 * (contracts/field-registry.md render-loop contract):
 *   - iterates the six sections in fixed order as expansion panels;
 *   - groups descriptors by `section`, filters by `visibleWhen`, applies
 *     `disabledWhen`;
 *   - renders each control from declarative `ControlSpec` metadata (HA native
 *     components with graceful degradation to standard controls, FR-908-T);
 *   - routes every change through `preservativeMerge` → emit gate
 *     (debounced for text/number, immediate for discrete, FR-908-O/N).
 *
 * The public API is unchanged from v1.1.0 (contracts/editor-public-api.md):
 * `hass`, `setConfig`, and the `config-changed` event. v1.2.0 extends
 * *behavior* (100% coverage, stable lifecycle, preservative merge, YAML as a
 * first-class input path) behind the same surface.
 */
export class EnergyHorizonCardEditor extends LitElement {
  @property({ attribute: false }) accessor hass?: HomeAssistant;

  /** The full, normalized config (authoritative object). */
  private _config?: CardConfig;

  /** The last config dispatched via `config-changed` (save form). */
  private _lastEmitted?: CardConfig;

  @state() private accessor _editorMode: EditorMode = "visual";

  @state() private accessor _yamlText = "";

  @state() private accessor _yamlError: string | null = null;

  /** Config-independent presentation state (FR-908-J). Never derived from config. */
  @state() private accessor _uiState: EditorUiState = defaultUiState();

  /** Set when a focus/caret restore is pending for the next render. */
  private _pendingFocusRestore = false;

  /** Pending debounce timers (visual emit / YAML parse / YAML emit). */
  private _emitTimer: ReturnType<typeof setTimeout> | null = null;
  private _parseTimer: ReturnType<typeof setTimeout> | null = null;
  private _yamlEmitTimer: ReturnType<typeof setTimeout> | null = null;

  // -------------------------------------------------------------------------
  // Public API (contracts/editor-public-api.md)
  // -------------------------------------------------------------------------

  setConfig(config: CardConfigInput): void {
    const loaded = normalizeForLoad(config);
    const savedForm = normalizeForSave(loaded);
    // Self-echo: structurally equal to the last-emitted config (robust to HA
    // round-trip normalizations). A self-echo must NOT re-serialize the YAML
    // textarea (it would steal the caret); an external change must.
    const isSelfEcho =
      this._lastEmitted !== undefined && deepEqual(savedForm, this._lastEmitted);

    this._config = loaded;
    // Passive re-render: re-apply UI state, emit nothing (FR-908-N).
    // `_lastEmitted` is intentionally NOT updated here.
    this._uiState = reapplyAfterRender(this._uiState);
    this._pendingFocusRestore = true;

    if (this._editorMode === "yaml" && this._hasYamlSupport()) {
      if (!isSelfEcho) {
        this._yamlText = this._dumpConfig(loaded);
      }
      // self-echo → leave the textarea exactly as the user left it.
    }
    this._yamlError = null;
    this.requestUpdate();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // "Close": flush any pending YAML parse/emit atomically and in order.
    this._flushYaml();
    this._flushEmit();
  }

  // -------------------------------------------------------------------------
  // YAML support
  // -------------------------------------------------------------------------

  private _hasYamlSupport(): boolean {
    return typeof window !== "undefined" && typeof window.jsyaml !== "undefined";
  }

  private _dumpConfig(config: CardConfig): string {
    if (!this._hasYamlSupport()) {
      return "";
    }
    try {
      return window.jsyaml!.dump(normalizeForSave(config));
    } catch {
      return "";
    }
  }

  // -------------------------------------------------------------------------
  // Label language chain (FR-908-X)
  // -------------------------------------------------------------------------

  private _labelLanguage(): string {
    return editorLabelLanguage(this.hass, this._config ?? ({} as CardConfig));
  }

  // -------------------------------------------------------------------------
  // Emit pipeline (FR-908-N/O, research R1/R5)
  // -------------------------------------------------------------------------

  private _emitPolicy(field: FieldDescriptor): "debounced" | "immediate" {
    if (field.emit) {
      return field.emit;
    }
    const kind = field.control.kind;
    return kind === "text" || kind === "number" ? "debounced" : "immediate";
  }

  /**
   * Applies a single field change: preservative merge (or preset↔custom
   * cleanup), then routes to the emit pipeline per the field's policy.
   */
  private _applyFieldChange(
    field: FieldDescriptor,
    rawValue: unknown,
    caret?: number
  ): void {
    if (!this._config) {
      return;
    }

    let next: CardConfig;
    if (field.key === "comparison_preset") {
      next = applyPresetSwitch(
        this._config,
        String(rawValue ?? "") as ComparisonMode
      );
    } else {
      const configValue = toConfigValue(field, rawValue);
      next = preservativeMerge(this._config, { [field.key]: configValue });
    }
    this._config = next;

    if (this._emitPolicy(field) === "debounced") {
      // Text/number: display updates immediately; the emit is debounced.
      if (field.control.kind === "text" || field.control.kind === "number") {
        this._uiState = withFocus(this._uiState, field.key, caret);
      }
      this._scheduleEmit();
    } else {
      this._flushEmit();
    }
    this._pendingFocusRestore =
      field.control.kind === "text" || field.control.kind === "number";
    this.requestUpdate();
  }

  private _scheduleEmit(): void {
    if (this._emitTimer) {
      clearTimeout(this._emitTimer);
    }
    this._emitTimer = setTimeout(() => {
      this._emitTimer = null;
      this._flushEmit();
    }, EMIT_DEBOUNCE_MS);
  }

  /**
   * The emit gate (FR-908-N): dispatch `config-changed` only when the would-be
   * config (save form) structurally differs from the last-emitted config.
   */
  private _flushEmit(): void {
    if (this._emitTimer) {
      clearTimeout(this._emitTimer);
      this._emitTimer = null;
    }
    if (!this._config) {
      return;
    }
    const toEmit = normalizeForSave(this._config);
    if (hasConfigDelta(toEmit, this._lastEmitted ?? ({} as CardConfig))) {
      this._lastEmitted = toEmit;
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: toEmit },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  // -------------------------------------------------------------------------
  // YAML first-class input path (FR-908-Y, research R13)
  // -------------------------------------------------------------------------

  private _onYamlInput(e: Event): void {
    this._yamlText = (e.target as HTMLTextAreaElement).value;
    this._scheduleYamlParse();
    this._scheduleYamlEmit();
  }

  private _scheduleYamlParse(): void {
    if (this._parseTimer) {
      clearTimeout(this._parseTimer);
    }
    this._parseTimer = setTimeout(() => {
      this._parseTimer = null;
      this._runYamlParse();
    }, YAML_PARSE_DEBOUNCE_MS);
  }

  private _scheduleYamlEmit(): void {
    if (this._yamlEmitTimer) {
      clearTimeout(this._yamlEmitTimer);
    }
    this._yamlEmitTimer = setTimeout(() => {
      this._yamlEmitTimer = null;
      this._flushEmit();
    }, YAML_EMIT_DEBOUNCE_MS);
  }

  /**
   * Runs the (safe-mode) YAML parse. On success `_config` is **replaced
   * wholesale** with the parsed config (not a preservative merge); on failure
   * the last valid `_config` is kept and an inline error is shown.
   */
  private _runYamlParse(): void {
    const result = safeParseYaml(this._yamlText);
    if (result.ok) {
      this._config = normalizeForLoad(result.config);
      this._yamlError = null;
    } else {
      this._yamlError = result.error;
    }
    this.requestUpdate();
  }

  /**
   * Force-flushes the pending YAML parse/emit **atomically and in order**
   * (parse first, then emit if valid). Used on blur / mode switch / close.
   */
  private _flushYaml(): void {
    if (this._parseTimer) {
      clearTimeout(this._parseTimer);
      this._parseTimer = null;
      this._runYamlParse();
    }
    if (this._yamlEmitTimer) {
      clearTimeout(this._yamlEmitTimer);
      this._yamlEmitTimer = null;
    }
    this._flushEmit();
  }

  private _switchToYaml(): void {
    if (!this._hasYamlSupport() || !this._config) {
      return;
    }
    this._flushEmit();
    this._yamlText = this._dumpConfig(this._config);
    this._yamlError = null;
    this._editorMode = "yaml";
    this.requestUpdate();
  }

  private _switchToVisual(): void {
    if (this._editorMode !== "yaml") {
      return;
    }
    // Parse + normalize + emit (if changed), then return to visual.
    this._flushYaml();
    this._editorMode = "visual";
    this.requestUpdate();
  }

  // -------------------------------------------------------------------------
  // Control event handlers
  // -------------------------------------------------------------------------

  /**
   * Reads the new value out of a control event. HA components do NOT all
   * expose the value on `e.target`:
   *   - `ha-select` fires `selected` with `detail.value` (no `change` event);
   *   - `ha-icon-picker` / `ha-color-picker` fire `value-changed` with
   *     `detail.value` (no `change` event);
   *   - `ha-entity-picker` fires both `change` and `value-changed`;
   *   - `ha-switch` / `ha-slider` are webawesome-based and fire native
   *     `change` with the value on the target.
   * Standard fallback controls always expose the value on the target.
   */
  private _readControlValue(field: FieldDescriptor, e: Event): unknown {
    const kind = field.control.kind;
    if (kind === "boolean") {
      const target = e.target as HTMLElement & { checked?: boolean };
      return target.checked ?? false;
    }
    // `ha-select` (selected) and `ha-icon-picker` / `ha-color-picker`
    // (value-changed) carry the value in `detail.value`. The standard
    // fallback controls (native `<select>` / `<input>`) carry it on
    // `e.target.value` — prefer `detail` when present, else fall back.
    if (kind === "select" || kind === "icon" || kind === "color") {
      const detail = (e as HaValueDetailEvent).detail?.value;
      if (detail !== undefined) {
        return detail;
      }
      const target = e.target as HTMLElement & { value?: string };
      return target.value;
    }
    const target = e.target as HTMLElement & { value?: string };
    return target.value;
  }

  private _caretFromEvent(e: Event): number | undefined {
    // For ha-input (delegatesFocus), e.target is retargeted to the host.
    // Walk the composed path to find the real native <input> for the caret.
    const path = e.composedPath();
    const native = path.find(
      (el): el is HTMLInputElement =>
        el instanceof HTMLElement && el.tagName === "INPUT"
    );
    const target = (native ?? e.target) as HTMLInputElement;
    return typeof target.selectionStart === "number"
      ? target.selectionStart
      : undefined;
  }

  private _onFieldInput(field: FieldDescriptor, e: Event): void {
    const value = this._readControlValue(field, e);
    this._applyFieldChange(field, value, this._caretFromEvent(e));
  }

  private _onFieldChange(field: FieldDescriptor, e: Event): void {
    const value = this._readControlValue(field, e);
    this._applyFieldChange(field, value);
  }

  /** Handler for `ha-select`'s `selected` event (value in `detail.value`). */
  private _onFieldSelect(field: FieldDescriptor, e: Event): void {
    const value = this._readControlValue(field, e);
    this._applyFieldChange(field, value);
  }

  /**
   * Handler for `ha-icon-picker` / `ha-color-picker` `value-changed` events
   * (value in `detail.value`).
   */
  private _onFieldValueChanged(field: FieldDescriptor, e: Event): void {
    const value = this._readControlValue(field, e);
    this._applyFieldChange(field, value);
  }

  private _onFieldFocus(field: FieldDescriptor, e: FocusEvent): void {
    if (field.control.kind !== "text" && field.control.kind !== "number") {
      return;
    }
    this._uiState = withFocus(
      this._uiState,
      field.key,
      this._caretFromEvent(e)
    );
    this._pendingFocusRestore = true;
    this.requestUpdate();
  }

  private _onFieldBlur(field: FieldDescriptor): void {
    if (field.control.kind !== "text" && field.control.kind !== "number") {
      return;
    }
    // Commit the debounced emit on blur.
    this._flushEmit();
    this._uiState = withFocus(this._uiState, undefined);
    this.requestUpdate();
  }

  private _onSectionToggle(section: SectionId, e: Event): void {
    e.stopPropagation();
    const current = this._uiState.expanded[section];
    this._uiState = withExpanded(this._uiState, section, !current);
    this.requestUpdate();
  }

  /**
   * Syncs `EditorUiState` from `ha-expansion-panel`'s `expanded-changed`
   * event. The panel's own summary (role="button", tabindex=0) handles
   * click/keyboard toggling internally and fires `expanded-changed` with
   * `{ expanded }` — we must NOT attach `@click` to the whole panel, which
   * would also toggle the section when clicking any field inside it.
   */
  private _onSectionExpandedChanged(
    section: SectionId,
    e: CustomEvent
  ): void {
    const detail = (e as CustomEvent<{ expanded: boolean }>).detail;
    if (detail && typeof detail.expanded === "boolean") {
      this._uiState = withExpanded(this._uiState, section, detail.expanded);
      this.requestUpdate();
    }
  }

  /** Keyboard toggle for the fallback section header (Enter / Space). */
  private _onSectionHeaderKeydown(section: SectionId, e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._onSectionToggle(section, e);
    }
  }

  private _onScroll(e: Event): void {
    const target = e.target as HTMLElement;
    this._uiState = withScroll(this._uiState, target.scrollTop);
  }

  // -------------------------------------------------------------------------
  // Post-render restore (FR-908-K/L/M)
  // -------------------------------------------------------------------------

  protected async updated(): Promise<void> {
    await this.updateComplete;
    if (this._pendingFocusRestore) {
      this._restoreFocusAndCaret();
      this._pendingFocusRestore = false;
    }
    this._restoreScroll();
  }

  private _fieldInput(field: string): HTMLInputElement | null {
    const id = `eh-field-${field.replace(/\./g, "-")}`;
    // The form renders into the shadow root (Lit default); `querySelector`
    // on the host only searches the light DOM, so use `renderRoot`.
    // `CSS.escape` is a no-op for these generated IDs (always safe
    // identifiers: alphanumerics, `-`, `_`), but guard it so the focus-restore
    // path also works in environments without a global `CSS` (e.g. jsdom).
    const selector =
      typeof CSS !== "undefined" ? `#${CSS.escape(id)}` : `#${id}`;
    return this.renderRoot.querySelector<HTMLInputElement>(selector);
  }

  private _restoreFocusAndCaret(): void {
    const field = this._uiState.lastFocusedField;
    if (!field) {
      return;
    }
    const el = this._fieldInput(field);
    if (!el) {
      return;
    }
    if (document.activeElement !== el) {
      el.focus();
    }
    if (this._uiState.lastCaret !== undefined) {
      try {
        el.setSelectionRange(this._uiState.lastCaret, this._uiState.lastCaret);
      } catch {
        // best-effort (FR-908-L)
      }
    }
  }

  private _restoreScroll(): void {
    if (this._uiState.scrollAnchor === undefined) {
      return;
    }
    const container = this.renderRoot.querySelector<HTMLElement>(".sections");
    if (container) {
      container.scrollTop = this._uiState.scrollAnchor;
    }
  }

  // -------------------------------------------------------------------------
  // Control rendering (declarative ControlSpec → HA / standard control)
  // -------------------------------------------------------------------------

  private _haAvailable(tag: string): boolean {
    return (
      typeof customElements !== "undefined" &&
      customElements.get(tag) !== undefined
    );
  }

  private _fieldId(field: FieldDescriptor): string {
    return `eh-field-${field.key.replace(/\./g, "-")}`;
  }

  /** Maps a control kind to the HA custom-element tag it renders, or null. */
  private _haTagForKind(kind: string): string | null {
    switch (kind) {
      case "entity":
        return "ha-entity-picker";
      case "icon":
        return "ha-icon-picker";
      case "text":
      case "number":
        return "ha-input";
      case "select":
        return "ha-select";
      case "boolean":
        return "ha-switch";
      case "slider":
        return "ha-slider";
      case "color":
        return "ha-color-picker";
      default:
        return null;
    }
  }

  /**
   * Returns true when the HA component for this control kind renders its own
   * accessible label inside its shadow DOM (via the `label` property).
   * For those we must NOT also render an external `<label for>` (it would
   * duplicate the label in real HA and the `for` attribute cannot cross the
   * shadow-DOM boundary anyway).
   */
  private _hasBuiltInLabel(kind: string): boolean {
    return (
      kind === "entity" ||
      kind === "icon" ||
      kind === "text" ||
      kind === "number" ||
      kind === "select" ||
      kind === "color"
    );
  }

  private _renderControl(
    field: FieldDescriptor,
    value: unknown,
    disabled: boolean,
    localize: (key: string) => string
  ): TemplateResult {
    const id = this._fieldId(field);
    const control = field.control;
    const str = (v: unknown): string =>
      v === undefined || v === null ? "" : String(v);

    // NOTE: Lit only attaches `@event` parts that are written directly in the
    // same template as the element. Factoring them into a nested attribute
    // template (e.g. `const h = html\`@change=${...}\``) silently drops the
    // listener, so the handlers are inlined per control below.
    //
    // `disabled` is applied with Lit's boolean attribute binding
    // (`?disabled=${disabled}`), NOT a bare `${...}` string interpolation: a
    // bare `${...}` with no `name=`/`?name=`/`.name=`/`@name=` prefix is a
    // child *text* part, so the `disabled` attribute would never be set and
    // `disabledWhen` (FR-908-H) would silently no-op.

    switch (control.kind) {
      case "entity":
        return this._haAvailable("ha-entity-picker")
          ? html`
              <ha-entity-picker
                id=${id}
                .hass=${this.hass}
                .label=${localize(field.labelKey)}
                .value=${str(value)}
                .config=${{ domain: control.domain }}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              ></ha-entity-picker>
            `
          : html`
              <input
                id=${id}
                type="text"
                .value=${str(value)}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              />
            `;

      case "icon":
        return this._haAvailable("ha-icon-picker")
          ? html`
              <ha-icon-picker
                id=${id}
                .hass=${this.hass}
                .label=${localize(field.labelKey)}
                .value=${str(value)}
                ?disabled=${disabled}
                @value-changed=${(e: Event) =>
                  this._onFieldValueChanged(field, e)}
              ></ha-icon-picker>
            `
          : html`
              <input
                id=${id}
                type="text"
                .value=${str(value)}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              />
            `;

      case "text":
        return this._haAvailable("ha-input")
          ? html`
              <ha-input
                id=${id}
                .label=${localize(field.labelKey)}
                .value=${str(value)}
                ?disabled=${disabled}
                @input=${(e: Event) => this._onFieldInput(field, e)}
                @focusin=${(e: FocusEvent) => this._onFieldFocus(field, e)}
                @focusout=${() => this._onFieldBlur(field)}
              ></ha-input>
            `
          : html`
              <input
                id=${id}
                type="text"
                .value=${str(value)}
                ?disabled=${disabled}
                @input=${(e: Event) => this._onFieldInput(field, e)}
                @focusin=${(e: FocusEvent) => this._onFieldFocus(field, e)}
                @focusout=${() => this._onFieldBlur(field)}
              />
            `;

      case "number":
        return this._haAvailable("ha-input")
          ? html`
              <ha-input
                id=${id}
                type="number"
                .label=${localize(field.labelKey)}
                .value=${str(value)}
                min=${control.min ?? undefined}
                max=${control.max ?? undefined}
                ?disabled=${disabled}
                @input=${(e: Event) => this._onFieldInput(field, e)}
                @focusin=${(e: FocusEvent) => this._onFieldFocus(field, e)}
                @focusout=${() => this._onFieldBlur(field)}
              ></ha-input>
            `
          : html`
              <input
                id=${id}
                type="number"
                .value=${str(value)}
                min=${control.min ?? undefined}
                max=${control.max ?? undefined}
                ?disabled=${disabled}
                @input=${(e: Event) => this._onFieldInput(field, e)}
                @focusin=${(e: FocusEvent) => this._onFieldFocus(field, e)}
                @focusout=${() => this._onFieldBlur(field)}
              />
            `;

      case "select": {
        const options = control.options.map(
          (opt) => html`
            <option value=${opt.value} ?selected=${str(value) === opt.value}>
              ${localize(opt.labelKey)}
            </option>
          `
        );
        return this._haAvailable("ha-select")
          ? html`
              <ha-select
                id=${id}
                .label=${localize(field.labelKey)}
                .value=${str(value)}
                .options=${control.options.map((o) => ({
                  value: o.value,
                  label: localize(o.labelKey)
                }))}
                ?disabled=${disabled}
                @selected=${(e: Event) => this._onFieldSelect(field, e)}
              ></ha-select>
            `
          : html`
              <select
                id=${id}
                .value=${str(value)}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              >
                ${options}
              </select>
            `;
      }

      case "boolean":
        return this._haAvailable("ha-switch")
          ? html`
              <ha-switch
                id=${id}
                .checked=${Boolean(value)}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              ></ha-switch>
            `
          : html`
              <input
                id=${id}
                type="checkbox"
                .checked=${Boolean(value)}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              />
            `;

      case "slider":
        return this._haAvailable("ha-slider")
          ? html`
              <ha-slider
                id=${id}
                .value=${Number(value ?? control.min ?? 0)}
                min=${control.min}
                max=${control.max}
                step=${control.step ?? 1}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              ></ha-slider>
            `
          : html`
              <input
                id=${id}
                type="range"
                .value=${String(Number(value ?? control.min ?? 0))}
                min=${control.min}
                max=${control.max}
                step=${control.step ?? 1}
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              />
            `;

      case "color":
        return this._haAvailable("ha-color-picker")
          ? html`
              <ha-color-picker
                id=${id}
                .label=${localize(field.labelKey)}
                .value=${str(value)}
                ?disabled=${disabled}
                @value-changed=${(e: Event) =>
                  this._onFieldValueChanged(field, e)}
              ></ha-color-picker>
            `
          : html`
              <input
                id=${id}
                type="text"
                .value=${str(value)}
                placeholder="var(--accent-color) / #rrggbb"
                ?disabled=${disabled}
                @change=${(e: Event) => this._onFieldChange(field, e)}
              />
            `;

      case "custom":
        return control.render({
          config: this._config ?? ({} as CardConfig),
          value,
          localize,
          onChange: (v) => this._applyFieldChange(field, v)
        });
    }
  }

  /**
   * Renders the external `<label for>` for a field — but only when the
   * control does not render its own accessible label. HA components with a
   * built-in `label` property (ha-input, ha-select, ha-entity-picker,
   * ha-icon-picker, ha-color-picker) render the label inside their shadow
   * DOM; an external `<label for>` cannot cross the shadow boundary and
   * would duplicate the label in real HA. Fallback native controls and
   * label-less HA components (ha-switch, ha-slider) keep the external label.
   */
  private _renderFieldLabel(
    field: FieldDescriptor,
    localize: (key: string) => string
  ): TemplateResult | typeof nothing {
    const kind = field.control.kind;
    const haTag = this._haTagForKind(kind);
    const useBuiltInLabel =
      haTag !== null && this._haAvailable(haTag) && this._hasBuiltInLabel(kind);
    if (useBuiltInLabel) {
      return nothing;
    }
    return html`
      <label class="field-label" for=${this._fieldId(field)}>
        ${localize(field.labelKey)}
        ${field.required ? html`<span class="req">*</span>` : ""}
      </label>
    `;
  }

  private _renderSection(
    section: SectionId,
    cfg: CardConfig,
    localize: (key: string) => string
  ): TemplateResult {
    const expanded = this._uiState.expanded[section];
    const label = localize(`editor.section.${section}`);
    const fields = visibleFields(section, cfg, FIELD_REGISTRY);

    const body = html`
      ${fields.map(
        (field) => html`
          <div class="field" data-field=${field.key}>
            ${this._renderFieldLabel(field, localize)}
            ${this._renderControl(
              field,
              resolveFieldValue(field, cfg),
              field.disabledWhen?.(cfg) ?? false,
              localize
            )}
          </div>
        `
      )}
    `;

    // NOTE: the fallback is a `<div>`-based panel (NOT `<details>`). A
    // `<details>` + `?open` binding fires the native `toggle` event whenever
    // Lit re-applies the `open` attribute on a re-render, which re-enters
    // `_onSectionToggle` and flips the section back — a feedback loop that
    // collapses panels on every passive re-render (FR-908-J, SC-908-2). A
    // `<div>` toggled by a clickable header has no such native event, so the
    // expansion state is driven purely by `EditorUiState` and survives
    // re-renders. The body stays in the DOM (hidden when collapsed) so there
    // is no flash/reset and field counts are stable.
    const panel = this._haAvailable("ha-expansion-panel")
      ? html`
          <ha-expansion-panel
            class="editor-section"
            data-section=${section}
            data-expanded=${expanded ? "true" : "false"}
            .header=${label}
            .expanded=${expanded}
            @expanded-changed=${(e: CustomEvent) =>
              this._onSectionExpandedChanged(section, e)}
          >
            ${body}
          </ha-expansion-panel>
        `
      : html`
          <div
            class="editor-section"
            data-section=${section}
            data-expanded=${expanded ? "true" : "false"}
          >
            <div
              class="section-header"
              role="button"
              tabindex="0"
              aria-expanded=${expanded ? "true" : "false"}
              @click=${(e: Event) => this._onSectionToggle(section, e)}
              @keydown=${(e: KeyboardEvent) =>
                this._onSectionHeaderKeydown(section, e)}
            >
              ${label}
            </div>
            <div class="section-body" ?hidden=${!expanded}>${body}</div>
          </div>
        `;

    return panel;
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  static styles = css`
    :host {
      display: block;
    }
    .editor {
      padding: 8px;
    }
    .toggle-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .toggle-row button {
      flex: 1;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
    }
    .toggle-row button.active {
      font-weight: 600;
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .sections {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 60vh;
      overflow-y: auto;
    }
    .editor-section {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
    }
    .section-header {
      cursor: pointer;
      padding: 8px;
      font-weight: 600;
      user-select: none;
    }
    .section-header:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }
    .section-body[hidden] {
      display: none;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 12px;
    }
    .field-label {
      font-size: 0.85em;
      color: var(--secondary-text-color, #555);
    }
    .req {
      color: var(--error-color, #c62828);
    }
    .yaml-editor {
      width: 100%;
      min-height: 200px;
      box-sizing: border-box;
      font-family: monospace;
    }
    .error {
      color: var(--error-color, #c62828);
      margin-top: 8px;
    }
  `;

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    const localize = createLocalize(this._labelLanguage());
    const visualLabel = localize("editor.visual_mode");
    const yamlLabel = localize("editor.yaml_mode");

    return html`
      <div class="editor">
        ${this._hasYamlSupport()
          ? html`
              <div class="toggle-row">
                <button
                  type="button"
                  class=${this._editorMode === "visual" ? "active" : ""}
                  @click=${this._switchToVisual}
                >
                  ${visualLabel}
                </button>
                <button
                  type="button"
                  class=${this._editorMode === "yaml" ? "active" : ""}
                  @click=${this._switchToYaml}
                >
                  ${yamlLabel}
                </button>
              </div>
            `
          : ""}
        ${this._editorMode === "visual"
          ? html`
              <div class="sections" @scroll=${this._onScroll}>
                ${SECTION_ORDER.map(
                  (section) =>
                    this._renderSection(section, this._config!, localize)
                )}
              </div>
            `
          : html`
              <textarea
                class="yaml-editor"
                .value=${this._yamlText}
                @input=${this._onYamlInput}
                @blur=${() => this._flushYaml()}
              ></textarea>
              ${this._yamlError
                ? html`<p class="error">${localize("editor.yaml_error")}: ${this._yamlError}</p>`
                : ""}
            `}
      </div>
    `;
  }
}

customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);
