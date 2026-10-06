import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import type { TemplateResult } from "lit";
import type { HomeAssistant, HaFormSchema } from "../ha-types";
import { resolveComparisonPreset, type CardConfig, type CardConfigInput } from "./types";
import {
  parseInterpretationMode,
  parseNeutralInterpretationT
} from "./interpretation-semantics";
import { createLocalize } from "./localize";

type EditorMode = "visual" | "yaml";

export class EnergyHorizonCardEditor extends LitElement {
  @property({ attribute: false }) accessor hass?: HomeAssistant;

  private _config?: CardConfig;

  @state() private accessor _editorMode: EditorMode = "visual";

  @state() private accessor _yamlText = "";

  @state() private accessor _yamlError: string | null = null;

  setConfig(config: CardConfigInput): void {
    const raw = config;
    const comparison_preset = resolveComparisonPreset(raw);
    const { comparison_mode: _legacyComparisonMode, ...rest } = raw;
    void _legacyComparisonMode;
    const interpretation = parseInterpretationMode(rest.interpretation, {
      debug: Boolean((rest as CardConfig).debug),
      log: (message) => {
        console.warn(message);
      }
    });
    const neutral_interpretation = parseNeutralInterpretationT(
      rest.neutral_interpretation
    );
    this._config = {
      ...rest,
      comparison_preset,
      interpretation,
      neutral_interpretation
    } as CardConfig;
    this._editorMode = "visual";
    this._yamlError = null;
    this.requestUpdate();
  }

  private _formData(): Partial<CardConfig> {
    const cfg = this._config;
    if (!cfg) {
      return {};
    }
    return {
      entity: cfg.entity ?? "",
      title: cfg.title,
      comparison_preset: resolveComparisonPreset(cfg as CardConfigInput),
      interpretation: cfg.interpretation ?? "consumption",
      force_prefix: cfg.force_prefix,
      show_comparison_summary: cfg.show_comparison_summary !== false,
      show_forecast_total_panel: cfg.show_forecast_total_panel !== false,
      show_narrative_comment: cfg.show_narrative_comment !== false
    };
  }

  private _computeLabel(schema: { name: string }): string {
    const lang =
      this.hass?.locale?.language ??
      (this.hass as unknown as { language?: string })?.language ??
      "en";
    return createLocalize(lang)(`editor.${schema.name}`);
  }

  private _hasYamlSupport(): boolean {
    return typeof window.jsyaml !== "undefined";
  }

  private _editorLang(): string {
    return (
      this.hass?.locale?.language ??
      (this.hass as unknown as { language?: string })?.language ??
      "en"
    );
  }

  private _buildSchema(lang: string): ReadonlyArray<HaFormSchema> {
    const t = createLocalize(lang);
    return [
      { name: "entity", selector: { entity: { domain: "sensor" } } },
      { name: "title", selector: { text: {} } },
      {
        name: "comparison_preset",
        selector: {
          select: {
            options: [
              { value: "year_over_year", label: t("editor.year_over_year") },
              { value: "month_over_year", label: t("editor.month_over_year") },
              { value: "month_over_month", label: t("editor.month_over_month") }
            ]
          }
        }
      },
      {
        name: "interpretation",
        selector: {
          select: {
            options: [
              { value: "consumption", label: t("editor.interpretation_consumption") },
              { value: "production", label: t("editor.interpretation_production") }
            ]
          }
        }
      },
      {
        name: "force_prefix",
        selector: {
          select: {
            options: [
              { value: "", label: "" },
              { value: "auto", label: "Auto" },
              { value: "none", label: "None (raw)" },
              { value: "G", label: "G (Giga)" },
              { value: "M", label: "M (Mega)" },
              { value: "k", label: "k (Kilo)" },
              { value: "m", label: "m (milli)" },
              { value: "µ", label: "µ (micro)" }
            ]
          }
        }
      },
      { name: "show_comparison_summary", selector: { boolean: {} } },
      { name: "show_forecast_total_panel", selector: { boolean: {} } },
      { name: "show_narrative_comment", selector: { boolean: {} } }
    ];
  }

  private _handleValueChanged(e: CustomEvent): void {
    if (!this._config) return;
    const updated: CardConfig = {
      ...this._config,
      ...(e.detail.value as Partial<CardConfig>)
    };
    this._config = updated;
    this._emitConfigChanged();
  }

  private _emitConfigChanged(): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }

  private _switchToYaml(): void {
    this._yamlText = window.jsyaml!.dump(this._config ?? {});
    this._yamlError = null;
    this._editorMode = "yaml";
  }

  private _switchToVisual(): void {
    if (this._editorMode !== "yaml") {
      return;
    }
    try {
      const parsed = window.jsyaml!.load(this._yamlText);
      if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
        const lang = this._editorLang();
        this._yamlError = createLocalize(lang)("editor.yaml_error");
        return;
      }
      const p = parsed as CardConfigInput;
      const comparison_preset = resolveComparisonPreset(p);
      const interpretation = parseInterpretationMode(p.interpretation, {
        debug: Boolean((p as CardConfig).debug),
        log: (message) => {
          console.warn(message);
        }
      });
      const neutral_interpretation = parseNeutralInterpretationT(
        p.neutral_interpretation
      );
      this._config = {
        ...(p as CardConfig),
        comparison_preset,
        interpretation,
        neutral_interpretation
      } as CardConfig;
      this._yamlError = null;
      this._editorMode = "visual";
      this._emitConfigChanged();
    } catch (err) {
      this._yamlError = (err as Error).message;
    }
  }

  private _handleYamlInput(e: { target: { value: string } }): void {
    this._yamlText = e.target.value;
  }

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

    const lang = this._editorLang();
    const t = createLocalize(lang);
    const visualLabel = t("editor.visual_mode");
    const yamlLabel = t("editor.yaml_mode");

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
              <ha-form
                .schema=${this._buildSchema(lang)}
                .data=${this._formData()}
                .hass=${this.hass}
                .computeLabel=${this._computeLabel.bind(this)}
                @value-changed=${this._handleValueChanged}
              ></ha-form>
            `
          : html`
              <textarea
                class="yaml-editor"
                .value=${this._yamlText}
                @input=${this._handleYamlInput}
              ></textarea>
              ${this._yamlError
                ? html`<p class="error">${this._yamlError}</p>`
                : ""}
            `}
      </div>
    `;
  }
}

customElements.define("energy-horizon-card-editor", EnergyHorizonCardEditor);
