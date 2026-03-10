import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCard } from "../ha-types";
import type { CardConfig, CardState } from "./types";

@customElement("energy-burndown-card")
export class EnergyBurndownCard
  extends LitElement
  implements LovelaceCard
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: CardConfig;
  @state() private _state: CardState = { status: "loading" };

  public setConfig(config: CardConfig): void {
    this._config = config;
    this._state = { status: "loading" };
  }

  public getCardSize(): number {
    return 4;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    if (this._state.status === "loading") {
      return html`<ha-card>
        <div class="loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
          <span>Ładowanie danych statystyk długoterminowych...</span>
        </div>
      </ha-card>`;
    }

    if (this._state.status === "error") {
      return html`<ha-card>
        <ha-alert alert-type="error">
          ${this._state.errorMessage ??
          "Wystąpił błąd podczas wczytywania danych."}
        </ha-alert>
      </ha-card>`;
    }

    if (this._state.status === "no-data") {
      return html`<ha-card>
        <ha-alert alert-type="info">
          Brak danych do wyświetlenia dla wybranego okresu.
        </ha-alert>
      </ha-card>`;
    }

    return html`<ha-card>
      <div class="content">
        <div class="placeholder">Energy Burndown Card – wykres w przygotowaniu.</div>
      </div>
    </ha-card>`;
  }

  static styles = css`
    :host {
      display: block;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
    }

    .content {
      padding: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "energy-burndown-card": EnergyBurndownCard;
  }
}

