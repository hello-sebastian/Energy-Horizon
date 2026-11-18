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
  SECTION_ICONS,
  SECTION_DOCS_URLS,
  visibleFields,
  resolveFieldValue,
  toConfigValue,
  type FieldDescriptor,
  type SectionId
} from "./editor/field-registry";
import { preservativeMerge } from "./editor/config-merge";
import { normalizeForLoad } from "./editor/config-normalize";
import {
  defaultUiState,
  withExpanded,
  withFocus,
  withScroll,
  reapplyAfterRender,
  restoreTargets,
  applyRestoreTargets,
  type EditorUiState,
  type RestoreDom
} from "./editor/editor-ui-state";
import { applyPresetSwitch } from "./editor/preset-switch";
import { editorLabelLanguage } from "./editor/editor-label-language";
import {
  yamlSupported,
  dumpYaml,
  safeParseYaml
} from "./editor/yaml-safe";
import { createYamlMode, type YamlMode } from "./editor/yaml-mode";
import {
  renderControl,
  renderFieldLabel,
  haTagForKind,
  haAvailable,
  fieldId,
  type ControlRenderContext
} from "./editor/control-render";

type EditorMode = "visual" | "yaml";

/**
 * Full-Coverage Visual Editor (v1.2.0).
 *
 * A thin Lit shell driven entirely by the declarative {@link FIELD_REGISTRY}
 * (contracts/field-registry.md render-loop contract):
 *   - iterates the seven sections in fixed order as expansion panels;
 *   - groups descriptors by `section`, filters by `visibleWhen`, applies
 *     `disabledWhen`, and emits non-collapsible subsection headers;
 *   - renders each control from declarative `ControlSpec` metadata via
 *     `control-render.ts` (HA native components with graceful degradation to
 *     standard controls, FR-908-T);
 *   - routes every change through `preservativeMerge` → emit gate
 *     (debounced for text/number, immediate for discrete, FR-908-O/N).
 *
 * The YAML mode's state machine (text, parse error, last-emitted config,
 * self-echo guard, and all three debounce timers) lives in the DOM-free
 * `yaml-mode.ts` module (911/TD-12); the focus/caret/scroll restore decision
 * is the pure `restoreTargets` over `EditorUiState`, applied through
 * `applyRestoreTargets`.
 *
 * The public API is unchanged from v1.1.0 (contracts/editor-public-api.md):
 * `hass`, `setConfig`, and the `config-changed` event. v1.2.0 extends
 * *behavior* (100% coverage, stable lifecycle, preservative merge, YAML as a
 * first-class input path) behind the same surface.
 */
export class EnergyHorizonCardEditor extends LitElement {
  @property({ attribute: false }) accessor hass: HomeAssistant | undefined = undefined;

  /** The full, normalized config (authoritative object). */
  private _config?: CardConfig;

  @state() private accessor _editorMode: EditorMode = "visual";

  /** Config-independent presentation state (FR-908-J). Never derived from config. */
  @state() private accessor _uiState: EditorUiState = defaultUiState();

  /** Set when a focus/caret restore is pending for the next render. */
  private _pendingFocusRestore = false;

  /**
   * The YAML mode state machine (911/TD-12): owns the YAML text, the parse
   * error, the last-emitted config, and all three debounce timers. The shell
   * holds none of that state itself.
   */
  private _yaml: YamlMode;

  constructor() {
    super();
    this._yaml = createYamlMode({
      supported: yamlSupported,
      dump: dumpYaml,
      parseYaml: safeParseYaml,
      getConfig: () => this._config,
      onConfigParsed: (config) => {
        // A YAML parse succeeds: the parsed config replaces the current
        // config wholesale (not a preservative merge).
        this._config = config;
      },
      onEmit: (config) => {
        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true
          })
        );
      },
      onChange: () => this.requestUpdate()
    });
  }

  // -------------------------------------------------------------------------
  // Public API (contracts/editor-public-api.md)
  // -------------------------------------------------------------------------

  setConfig(config: CardConfigInput): void {
    const loaded = normalizeForLoad(config);

    this._config = loaded;
    // Passive re-render: re-apply UI state, emit nothing (FR-908-N).
    // The last-emitted config is intentionally NOT updated here.
    this._uiState = reapplyAfterRender(this._uiState);
    this._pendingFocusRestore = true;
    this._yaml.clearError();

    if (this._editorMode === "yaml" && this._yaml.supported()) {
      // The state machine classifies self-echo vs. external change: a
      // self-echo must NOT re-serialize the textarea (it would steal the
      // caret); an external change must.
      this._yaml.parse(loaded);
    }
    this.requestUpdate();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // "Close": flush any pending YAML parse/emit atomically and in order.
    this._yaml.flush();
    this._yaml.flushEmit();
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
   * cleanup), then routes to the emit pipeline per the field's policy. The
   * emit pipeline itself (debounce + gate) lives in the YAML mode state
   * machine (911/TD-12).
   */
  private _applyFieldChange(
    field: FieldDescriptor,
    rawValue: unknown,
    caret?: number
  ): void {
    if (!this._config) {
      return;
    }
    // UX-only dummy fields (e.g. `show_chart`) have no config representation:
    // they are rendered permanently ON + disabled, so a change is a no-op.
    if (field.dummy) {
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
      this._yaml.scheduleEmit();
    } else {
      this._yaml.flushEmit();
    }
    this._pendingFocusRestore =
      field.control.kind === "text" || field.control.kind === "number";
    this.requestUpdate();
  }

  // -------------------------------------------------------------------------
  // YAML first-class input path (FR-908-Y, research R13)
  // -------------------------------------------------------------------------

  private _onYamlInput(e: Event): void {
    this._yaml.onInput((e.target as HTMLTextAreaElement).value);
  }

  private _switchToYaml(): void {
    if (!this._config || !this._yaml.supported()) {
      return;
    }
    // `enter()`: flush any pending emit, then ALWAYS re-serialize the config
    // into the textarea (bypassing the self-echo guard) and clear the error.
    this._yaml.enter(this._config);
    this._editorMode = "yaml";
    this.requestUpdate();
  }

  private _switchToVisual(): void {
    if (this._editorMode !== "yaml") {
      return;
    }
    // Parse + normalize + emit (if changed), then return to visual.
    this._yaml.flush();
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
      const detail = (e as unknown as HaValueDetailEvent).detail?.value;
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
    this._yaml.flushEmit();
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
  // Post-render restore (FR-908-K/L/M, decision in editor-ui-state.ts)
  // -------------------------------------------------------------------------

  protected async updated(): Promise<void> {
    await this.updateComplete;
    const targets = restoreTargets(this._uiState, this._pendingFocusRestore);
    this._pendingFocusRestore = false;
    applyRestoreTargets(this._restoreDom(), targets);
  }

  /**
   * The minimal DOM surface for the restore applier. The form renders into
   * the shadow root (Lit default); `querySelector` on the host only searches
   * the light DOM, so use `renderRoot`. `CSS.escape` is a no-op for the
   * generated IDs (always safe identifiers: alphanumerics, `-`, `_`), but
   * guard it so the focus-restore path also works in environments without a
   * global `CSS` (e.g. jsdom).
   */
  private _restoreDom(): RestoreDom {
    return {
      findFieldInput: (field) => {
        const selector =
          typeof CSS !== "undefined"
            ? `#${CSS.escape(fieldId(field))}`
            : `#${fieldId(field)}`;
        return this.renderRoot.querySelector<HTMLInputElement>(selector);
      },
      findScrollContainer: () =>
        this.renderRoot.querySelector<HTMLElement>(".sections"),
      activeElementIs: (el) => document.activeElement === el
    };
  }

  // -------------------------------------------------------------------------
  // Control rendering (declarative ControlSpec → HA / standard control)
  // -------------------------------------------------------------------------

  /**
   * Builds the per-render control context: the element's `hass` + the
   * section's captured config, plus the event handlers the controls bind to
   * (911/TD-12: the handlers are the shell's own, so event routing stays in
   * the shell).
   */
  private _controlCtx(cfg: CardConfig): ControlRenderContext {
    return {
      hass: this.hass,
      config: cfg,
      onFieldInput: (field, e) => this._onFieldInput(field, e),
      onFieldChange: (field, e) => this._onFieldChange(field, e),
      onFieldSelect: (field, e) => this._onFieldSelect(field, e),
      onFieldValueChanged: (field, e) =>
        this._onFieldValueChanged(field, e),
      onFieldFocus: (field, e) => this._onFieldFocus(field, e),
      onFieldBlur: (field) => this._onFieldBlur(field),
      onFieldApply: (field, value) => this._applyFieldChange(field, value)
    };
  }

  private _renderSection(
    section: SectionId,
    cfg: CardConfig,
    localize: (key: string) => string,
    ctx: ControlRenderContext
  ): TemplateResult {
    const expanded = this._uiState.expanded[section];
    const label = localize(`editor.section.${section}`);
    const fields = visibleFields(section, cfg, FIELD_REGISTRY);

    // Two-column grid (Style section): when any visible field declares
    // `column`, the section body renders as a CSS grid with two equal
    // columns. Columns are bottom-aligned — a field's row is set by its
    // distance from the bottom of its column — so same-feature fields
    // (equal distance from the bottom) share a row even when the columns
    // hold different field counts (e.g. `primary_color` has no reference
    // counterpart). Row 1 is reserved for subsection headers when any
    // column is headed.
    const isGrid = fields.some((f) => f.column !== undefined);
    const gridRow = new Map<string, number>();
    const gridHeaderColumn = new Map<string, number>();
    if (isGrid) {
      const headedColumns = new Set<number>();
      for (const f of fields) {
        if (f.column !== undefined && f.subsection) {
          headedColumns.add(f.column);
          gridHeaderColumn.set(f.subsection, f.column);
        }
      }
      const colCounts = new Map<number, number>();
      for (const f of fields) {
        if (f.column !== undefined) {
          colCounts.set(f.column, (colCounts.get(f.column) ?? 0) + 1);
        }
      }
      const maxCount = Math.max(...colCounts.values());
      const bottomRow = (headedColumns.size > 0 ? 1 : 0) + maxCount;
      const colIndex = new Map<number, number>();
      for (const f of fields) {
        if (f.column !== undefined) {
          const idx = colIndex.get(f.column) ?? 0;
          colIndex.set(f.column, idx + 1);
          const count = colCounts.get(f.column);
          if (count === undefined) continue; // defensive: set above for this column (911/TD-6)
          gridRow.set(f.key, bottomRow - (count - 1 - idx));
        }
      }
    }

    // Group fields into rows (FR-908-Z): a field with `inlineWith` renders in
    // the same horizontal row as the field it references (to its right), not
    // as its own row. The primary field takes the available width
    // (`.field-main`); the inline field is compact (`.field-inline`).
    const inlineByPrimary = new Map<string, FieldDescriptor[]>();
    for (const f of fields) {
      if (f.inlineWith) {
        const list = inlineByPrimary.get(f.inlineWith) ?? [];
        list.push(f);
        inlineByPrimary.set(f.inlineWith, list);
      }
    }

    const renderField = (
      field: FieldDescriptor,
      extraClass = ""
    ): TemplateResult => {
      const gridStyle = isGrid
        ? field.column
          ? `grid-column: ${field.column}; grid-row: ${gridRow.get(field.key)}`
          : "grid-column: 1 / -1"
        : "";
      return html`
      <div
        class=${extraClass ? `field ${extraClass}` : "field"}
        data-field=${field.key}
        data-control=${haTagForKind(field.control.kind) ?? "native"}
        style=${gridStyle || nothing}
      >
        ${renderFieldLabel(field, localize)}
        ${renderControl(
          ctx,
          field,
          resolveFieldValue(field, cfg),
          field.disabledWhen?.(cfg) ?? false,
          localize
        )}
        ${field.helperKey
          ? html`<p class="field-helper">${localize(field.helperKey)}</p>`
          : nothing}
      </div>
    `;
    };

    // Single pass over the visible fields (registry order). A non-collapsible
    // subsection header is emitted whenever the `subsection` of consecutive
    // fields changes; fields without a `subsection` render at the top level.
    // Inline fields are folded into their primary field's row (FR-908-Z).
    const bodyParts: TemplateResult[] = [];
    let currentSubsection: string | undefined;
    for (const field of fields) {
      if (field.subsection !== currentSubsection) {
        currentSubsection = field.subsection;
        if (field.subsection) {
          const headerColumn = gridHeaderColumn.get(field.subsection);
          const headerStyle =
            isGrid && headerColumn !== undefined
              ? `grid-column: ${headerColumn}; grid-row: 1`
              : "";
          bodyParts.push(
            html`<div
              class="subsection-header"
              style=${headerStyle || nothing}
            >${localize(field.subsection)}</div>`
          );
        }
      }
      if (field.inlineWith) {
        continue; // rendered inside its primary field's row
      }
      const inlines = inlineByPrimary.get(field.key) ?? [];
      if (inlines.length === 0) {
        bodyParts.push(renderField(field));
      } else {
        bodyParts.push(
          html`
            <div class="field-row">
              ${renderField(field, "field-main")}
              ${inlines.map((inline) =>
                renderField(
                  inline,
                  // A number field with a unit suffix (e.g. `%`) needs a wider
                  // inline slot; plain switches stay compact so the main field
                  // keeps the full remaining width.
                  inline.control.kind === "number" && inline.control.suffix
                    ? "field-inline field-inline-wide"
                    : "field-inline"
                )
              )}
            </div>
          `
        );
      }
    }
    const body = isGrid
      ? html`<div class="section-columns">${bodyParts}</div>`
      : html`${bodyParts}`;

    // NOTE: the fallback is a `<div>`-based panel (NOT `<details>`). A
    // `<details>` + `?open` binding fires the native `toggle` event whenever
    // Lit re-applies the `open` attribute on a re-render, which re-enters
    // `_onSectionToggle` and flips the section back — a feedback loop that
    // collapses panels on every passive re-render (FR-908-J, SC-908-2). A
    // `<div>` toggled by a clickable header has no such native event, so the
    // expansion state is driven purely by `EditorUiState` and survives
    // re-renders. The body stays in the DOM (hidden when collapsed) so there
    // is no flash/reset and field counts are stable.
    // Per-section documentation link (FR-908-AA): a help-circle icon in the
    // section header pointing to the wiki chapter covering the section's keys.
    // It opens in a new tab and MUST stop propagation — the header (the
    // panel's `#summary` in the HA path, the clickable `.section-header` in
    // the fallback) toggles the section on click, so without
    // `stopPropagation()` the link would also collapse/expand the section.
    const docsLink = html`
      <a
        class="section-docs-link"
        href=${SECTION_DOCS_URLS[section]}
        target="_blank"
        rel="noopener noreferrer"
        aria-label=${localize("editor.docs_link")}
        title=${localize("editor.docs_link")}
        @click=${(e: Event) => e.stopPropagation()}
      >
        <ha-icon icon="mdi:help-circle-outline"></ha-icon>
      </a>
    `;

    const panel = haAvailable("ha-expansion-panel")
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
            <ha-icon
              slot="leading-icon"
              class="section-icon"
              .icon=${SECTION_ICONS[section]}
            ></ha-icon>
            <div slot="icons" class="section-header-actions">${docsLink}</div>
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
              <ha-icon
                class="section-icon"
                .icon=${SECTION_ICONS[section]}
              ></ha-icon>
              ${label}
              <span class="section-header-actions">${docsLink}</span>
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
    /*
      Dialog-height fill (FR-908-AC/AD, SC-908-10, research R14): a flex
      column capped by the documented geometry of the HA card-editor dialog —
      209px of dialog chrome + 56px of tab-bar (Config/Visibility) budget +
      16px of tab margin = 281px, rounded up to 284px (3px of conservative
      slack: if we overestimate, only an imperceptible gap remains, never a
      double scroll). Re-derive if HA changes the dialog or tab chrome.
    */
    .editor {
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 284px);
      padding: 8px;
    }
    .toggle-row {
      display: flex;
      flex: 0 0 auto;
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
    /* THE visual-mode scroll container (FR-908-M scroll anchor): grows to
       fill the remaining height of the capped .editor column. */
    .sections {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      gap: 8px;
      min-height: 0;
      overflow-y: auto;
    }
    .editor-section {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
    }
    ha-expansion-panel.editor-section {
      --expansion-panel-content-padding: 0 12px 12px;
    }
    /* A collapsed panel keeps height: 0 but retains its content padding,
       which would leave a dark gap under the header inside the border.
       Zero the bottom padding when collapsed so the bar is symmetric. */
    ha-expansion-panel.editor-section:not([expanded]) {
      --expansion-panel-content-padding: 0 12px 0;
    }
    .section-header {
      cursor: pointer;
      padding: 8px;
      font-weight: 600;
      user-select: none;
      display: flex;
      align-items: center;
    }
    .section-header:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }
    .section-icon {
      color: var(--secondary-text-color, #555);
      margin-inline-end: 8px;
      flex: none;
    }
    .section-header-actions {
      margin-inline-start: auto;
      display: inline-flex;
      align-items: center;
      flex: none;
    }
    .section-docs-link {
      display: inline-flex;
      align-items: center;
      color: var(--secondary-text-color, #555);
      text-decoration: none;
      cursor: pointer;
      border-radius: 4px;
      padding: 2px;
    }
    .section-docs-link:hover,
    .section-docs-link:focus-visible {
      color: var(--primary-text-color, #000);
      outline: none;
    }
    .subsection-header {
      padding: 8px 12px 0;
      font-size: 0.8em;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--secondary-text-color, #555);
    }
    .section-body {
      padding-bottom: 12px;
    }
    .section-body[hidden] {
      display: none;
    }
    .field {
      display: flex;
      flex-direction: column;
      padding: 8px 12px;
    }
    .field-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 8px 12px;
    }
    .field-row .field {
      padding: 0;
    }
    .field-main {
      flex: 1 1 auto;
      min-width: 0;
    }
    .field-inline {
      flex: 0 0 auto;
    }
    .field-inline-wide {
      flex: 1 1 160px;
      min-width: 140px;
    }
    .section-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 12px;
    }
    .section-columns .field {
      padding-left: 0;
      padding-right: 0;
    }
    .section-columns .subsection-header {
      padding: 8px 0 0;
    }
    .field-number-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background-color: var(--secondary-background-color, #f5f5f5);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      padding: 0 12px;
      min-height: 40px;
      box-sizing: border-box;
    }
    .field-number-box input {
      flex: 1 1 auto;
      min-width: 0;
      border: none;
      background: transparent;
      outline: none;
      font-size: 1em;
      color: var(--primary-text-color, #000);
      padding: 8px 0;
    }
    .field-suffix {
      flex: 0 0 auto;
      font-size: 0.85em;
      color: var(--secondary-text-color, #555);
    }
    .field-label {
      font-size: 0.85em;
      color: var(--secondary-text-color, #555);
      margin-bottom: 4px;
    }
    .field-helper {
      margin: var(--helper-gap, 4px) 0 0 0;
      font-size: 0.75em;
      line-height: 1.4;
      color: var(--secondary-text-color, #555);
    }
    /* Normalization layer: HA components carry different internal shadow-DOM
       padding, so the helper's top margin is tuned per control type to keep
       the visual distance from the control's content consistent. Adding a new
       control type = one line here. */
    .field[data-control="ha-input"] .field-helper {
      --helper-gap: 2px;
    }
    .field[data-control="ha-select"] .field-helper {
      --helper-gap: 4px;
    }
    .field[data-control="ha-switch"] .field-helper {
      --helper-gap: 6px;
    }
    .field[data-control="ha-color-picker"] .field-helper {
      --helper-gap: 1px;
    }
    .field[data-control="native"] .field-helper {
      --helper-gap: 4px;
    }
    .req {
      color: var(--error-color, #c62828);
    }
    /* YAML-mode textarea: fills the same remaining height as .sections,
       keeping its 200px floor as a minimum (FR-908-AD). */
    .yaml-editor {
      width: 100%;
      flex: 1 1 auto;
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
    const config = this._config; // captured: `this._config` may change during render (911/TD-6)

    const localize = createLocalize(this._labelLanguage());
    const visualLabel = localize("editor.visual_mode");
    const yamlLabel = localize("editor.yaml_mode");
    const ctx = this._controlCtx(config);

    return html`
      <div class="editor">
        ${this._yaml.supported()
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
                    this._renderSection(section, config, localize, ctx)
                )}
              </div>
            `
          : html`
              <textarea
                class="yaml-editor"
                .value=${this._yaml.text}
                @input=${this._onYamlInput}
                @blur=${() => this._yaml.flush()}
              ></textarea>
              ${this._yaml.parseError
                ? html`<p class="error">${localize("editor.yaml_error")}: ${this._yaml.parseError}</p>`
                : ""}
            `}
      </div>
    `;
  }
}

customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);
