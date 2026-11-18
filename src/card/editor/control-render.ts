import { html, nothing } from "lit";
import type { TemplateResult } from "lit";
import type { HomeAssistant } from "../../ha-types";
import type { CardConfig } from "../types";
import type { FieldDescriptor } from "./field-registry";

/**
 * Full-Coverage Visual Editor (v1.2.0) — declarative control rendering
 * (911/TD-12).
 *
 * `renderControl` renders one field's control from its declarative
 * `ControlSpec` metadata — HA native components with graceful degradation to
 * standard controls (FR-908-T) — and `renderFieldLabel` renders the external
 * `<label for>` only when the control has no built-in accessible label.
 * Both take a {@link ControlRenderContext} (the element's `hass` + `config`
 * plus the event handlers) so the module is decoupled from the specific
 * element and the shell (`energy-horizon-card-editor.ts`) keeps only render
 * + event routing.
 */

/** The element's per-render inputs + event handlers for control rendering. */
export interface ControlRenderContext {
  hass: HomeAssistant | undefined;
  /** The section's captured config (the authoritative object). */
  config: CardConfig;
  onFieldInput(field: FieldDescriptor, e: Event): void;
  onFieldChange(field: FieldDescriptor, e: Event): void;
  onFieldSelect(field: FieldDescriptor, e: Event): void;
  onFieldValueChanged(field: FieldDescriptor, e: Event): void;
  onFieldFocus(field: FieldDescriptor, e: FocusEvent): void;
  onFieldBlur(field: FieldDescriptor): void;
  /** Applies a changed value (used by `custom` controls' `onChange`). */
  onFieldApply(field: FieldDescriptor, value: unknown): void;
}

/** True when the given HA custom element is registered. */
export function haAvailable(tag: string): boolean {
  return (
    typeof customElements !== "undefined" &&
    customElements.get(tag) !== undefined
  );
}

/** The stable DOM id of a field's input (`eh-field-<key with . → ->`). */
export function fieldId(key: string): string {
  return `eh-field-${key.replace(/\./g, "-")}`;
}

/** Maps a control kind to the HA custom-element tag it renders, or null. */
export function haTagForKind(kind: string): string | null {
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
function hasBuiltInLabel(kind: string): boolean {
  return (
    kind === "entity" ||
    kind === "icon" ||
    kind === "text" ||
    kind === "number" ||
    kind === "select" ||
    kind === "color"
  );
}

export function renderControl(
  ctx: ControlRenderContext,
  field: FieldDescriptor,
  value: unknown,
  disabled: boolean,
  localize: (key: string) => string
): TemplateResult {
  const id = fieldId(field.key);
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
      return haAvailable("ha-entity-picker")
        ? html`
            <ha-entity-picker
              id=${id}
              .hass=${ctx.hass}
              .label=${localize(field.labelKey)}
              .value=${str(value)}
              .config=${{ domain: control.domain }}
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            ></ha-entity-picker>
          `
        : html`
            <input
              id=${id}
              type="text"
              .value=${str(value)}
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            />
          `;

    case "icon":
      return haAvailable("ha-icon-picker")
        ? html`
            <ha-icon-picker
              id=${id}
              .hass=${ctx.hass}
              .label=${localize(field.labelKey)}
              .value=${str(value)}
              ?disabled=${disabled}
              @value-changed=${(e: Event) =>
                ctx.onFieldValueChanged(field, e)}
            ></ha-icon-picker>
          `
        : html`
            <input
              id=${id}
              type="text"
              .value=${str(value)}
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            />
          `;

    case "text":
      return haAvailable("ha-input")
        ? html`
            <ha-input
              id=${id}
              .label=${localize(field.labelKey)}
              .value=${str(value)}
              ?disabled=${disabled}
              @input=${(e: Event) => ctx.onFieldInput(field, e)}
              @focusin=${(e: FocusEvent) => ctx.onFieldFocus(field, e)}
              @focusout=${() => ctx.onFieldBlur(field)}
            ></ha-input>
          `
        : html`
            <input
              id=${id}
              type="text"
              .value=${str(value)}
              ?disabled=${disabled}
              @input=${(e: Event) => ctx.onFieldInput(field, e)}
              @focusin=${(e: FocusEvent) => ctx.onFieldFocus(field, e)}
              @focusout=${() => ctx.onFieldBlur(field)}
            />
          `;

    case "number": {
      // The unit suffix (e.g. `%`) is rendered INSIDE the input box, like a
      // MUI InputAdornment. `ha-input` exposes an `end` slot that renders
      // within the field; the native fallback wraps the input and the unit
      // in a bordered box so the unit sits inside the field too.
      if (haAvailable("ha-input")) {
        return html`
          <ha-input
            id=${id}
            type="number"
            .label=${localize(field.labelKey)}
            .value=${str(value)}
            min=${control.min ?? undefined}
            max=${control.max ?? undefined}
            ?disabled=${disabled}
            @input=${(e: Event) => ctx.onFieldInput(field, e)}
            @focusin=${(e: FocusEvent) => ctx.onFieldFocus(field, e)}
            @focusout=${() => ctx.onFieldBlur(field)}
          >
            ${control.suffix
              ? html`<span slot="end" class="field-suffix">${control.suffix}</span>`
              : nothing}
          </ha-input>
        `;
      }
      return html`
        <div class="field-number-box">
          <input
            id=${id}
            type="number"
            .value=${str(value)}
            min=${control.min ?? undefined}
            max=${control.max ?? undefined}
            ?disabled=${disabled}
            @input=${(e: Event) => ctx.onFieldInput(field, e)}
            @focusin=${(e: FocusEvent) => ctx.onFieldFocus(field, e)}
            @focusout=${() => ctx.onFieldBlur(field)}
          />
          ${control.suffix
            ? html`<span class="field-suffix">${control.suffix}</span>`
            : nothing}
        </div>
      `;
    }

    case "select": {
      const options = control.options.map(
        (opt) => html`
          <option value=${opt.value} ?selected=${str(value) === opt.value}>
            ${localize(opt.labelKey)}
          </option>
        `
      );
      return haAvailable("ha-select")
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
              @selected=${(e: Event) => ctx.onFieldSelect(field, e)}
            ></ha-select>
          `
        : html`
            <select
              id=${id}
              .value=${str(value)}
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            >
              ${options}
            </select>
          `;
    }

    case "boolean": {
      // UX-only dummy fields (e.g. `show_chart`): permanently ON + disabled,
      // no change handler — they explain an always-true behavior and never
      // write to the config.
      if (field.dummy) {
        return haAvailable("ha-switch")
          ? html`
              <ha-switch
                id=${id}
                .checked=${true}
                ?disabled=${true}
              ></ha-switch>
            `
          : html`
              <input
                id=${id}
                type="checkbox"
                .checked=${true}
                ?disabled=${true}
              />
            `;
      }
      return haAvailable("ha-switch")
        ? html`
            <ha-switch
              id=${id}
              .checked=${Boolean(value)}
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            ></ha-switch>
          `
        : html`
            <input
              id=${id}
              type="checkbox"
              .checked=${Boolean(value)}
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            />
          `;
    }

    case "slider":
      return haAvailable("ha-slider")
        ? html`
            <ha-slider
              id=${id}
              .value=${Number(value ?? control.min ?? 0)}
              min=${control.min}
              max=${control.max}
              step=${control.step ?? 1}
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
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
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            />
          `;

    case "color":
      return haAvailable("ha-color-picker")
        ? html`
            <ha-color-picker
              id=${id}
              .label=${localize(field.labelKey)}
              .value=${str(value)}
              ?disabled=${disabled}
              @value-changed=${(e: Event) =>
                ctx.onFieldValueChanged(field, e)}
            ></ha-color-picker>
          `
        : html`
            <input
              id=${id}
              type="text"
              .value=${str(value)}
              placeholder="var(--accent-color) / #rrggbb"
              ?disabled=${disabled}
              @change=${(e: Event) => ctx.onFieldChange(field, e)}
            />
          `;

    case "custom":
      return control.render({
        config: ctx.config,
        value,
        localize,
        onChange: (v) => ctx.onFieldApply(field, v)
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
export function renderFieldLabel(
  field: FieldDescriptor,
  localize: (key: string) => string
): TemplateResult | typeof nothing {
  const kind = field.control.kind;
  const haTag = haTagForKind(kind);
  const useBuiltInLabel =
    haTag !== null && haAvailable(haTag) && hasBuiltInLabel(kind);
  if (useBuiltInLabel) {
    return nothing;
  }
  return html`
    <label class="field-label" for=${fieldId(field.key)}>
      ${localize(field.labelKey)}
      ${field.required ? html`<span class="req">*</span>` : ""}
    </label>
  `;
}
