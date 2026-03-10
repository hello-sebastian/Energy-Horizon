import { LitElement, css, html } from "lit";
import type { HomeAssistant, LovelaceCard } from "../ha-types";
import type { CardConfig, CardState, ComparisonSeries } from "./types";
import {
  buildComparisonPeriod,
  buildLtsQuery,
  mapLtsResponseToSeries,
  computeSummary,
  computeForecast,
  computeTextSummary
} from "./ha-api";
import { ChartRenderer } from "./chart-renderer";

export class EnergyBurndownCard extends LitElement implements LovelaceCard {
  static properties = {
    hass: { type: Object, attribute: false },
    _config: { state: true },
    _state: { state: true }
  };

  declare hass: HomeAssistant;
  declare _config: CardConfig;
  _state: CardState = { status: "loading" };

  private _chartRenderer?: ChartRenderer;

  public setConfig(config: CardConfig): void {
    this._config = config;
    this._state = { status: "loading" };
  }

  public getCardSize(): number {
    return 4;
  }

  protected firstUpdated(): void {
    const canvas = this.renderRoot.querySelector("canvas") as
      | HTMLCanvasElement
      | null;
    if (canvas) {
      this._chartRenderer = new ChartRenderer(canvas);
    }
  }

  protected updated(changedProps: Map<string, unknown>): void {
    if (
      changedProps.has("hass") ||
      changedProps.has("_config") ||
      changedProps.has("_state")
    ) {
      if (this._state.status === "loading") {
        void this._loadData();
      }

      if (
        this._state.status === "ready" &&
        this._state.comparisonSeries &&
        this._chartRenderer
      ) {
        this._chartRenderer.update(this._state.comparisonSeries);
      }
    }
  }

  private async _loadData(): Promise<void> {
    if (!this._config || !this.hass) return;

    const now = new Date();
    const timeZone = "UTC";
    const period = buildComparisonPeriod(this._config, now, timeZone);
    const query = buildLtsQuery(period, this._config.entity);

    try {
      if (this._config.debug) {
        // eslint-disable-next-line no-console
        console.log("[Energy Burndown] API Query:", query);
      }

      const response = await this.hass.connection.sendMessagePromise(
        query as unknown as Record<string, unknown>
      );

      if (this._config.debug) {
        const data =
          (response as { result?: { results?: Record<string, unknown> } })
            ?.result ?? response;
        const results = (data as { results?: Record<string, unknown> }).results;
        // eslint-disable-next-line no-console
        console.log("[Energy Burndown] API Response (raw):", response);
        if (results && typeof results === "object") {
          // eslint-disable-next-line no-console
          console.log(
            "[Energy Burndown] Results keys (available statistic_ids):",
            Object.keys(results)
          );
          const entityData = results[this._config.entity];
          // eslint-disable-next-line no-console
          console.log(
            `[Energy Burndown] Data for entity "${this._config.entity}":`,
            entityData
              ? `${Array.isArray(entityData) ? entityData.length : 0} points`
              : "not found"
          );
        } else {
          // eslint-disable-next-line no-console
          console.log("[Energy Burndown] No 'results' in response or invalid structure");
        }
      }

      const series = mapLtsResponseToSeries(
        response as any,
        this._config.entity,
        period
      ) as ComparisonSeries | undefined;

      if (!series) {
        if (this._config.debug) {
          // eslint-disable-next-line no-console
          console.log(
            "[Energy Burndown] mapLtsResponseToSeries returned undefined – check entity ID and results structure above"
          );
        }
        this._state = { status: "no-data" };
        return;
      }

      const summary = computeSummary(series);
      const forecast = computeForecast(series);
      const textSummary = computeTextSummary(summary);

      this._state = {
        status: "ready",
        comparisonSeries: series,
        summary,
        forecast,
        textSummary
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this._state = {
        status: "error",
        errorMessage: "Nie udało się pobrać danych statystyk długoterminowych."
      };
    }
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

    const heading = this._state.textSummary?.heading;
    const summary = this._state.summary;
    const forecast = this._state.forecast;

    const locale =
      this.hass.locale?.language ?? this.hass.language ?? navigator.language;
    const precision = this._config.precision ?? 1;

    const numberFormatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });

    const percentFormatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1
    });

    const currentSummaryValue =
      summary != null
        ? `${numberFormatter.format(summary.current_cumulative)} ${
            summary.unit
          }`
        : "";

    const referenceSummaryValue =
      summary != null && summary.reference_cumulative != null
        ? `${numberFormatter.format(summary.reference_cumulative)} ${
            summary.unit
          }`
        : null;

    const differenceValue =
      summary != null && summary.difference != null
        ? `${numberFormatter.format(Math.abs(summary.difference))} ${
            summary.unit
          }`
        : null;

    const differencePercentValue =
      summary != null && summary.differencePercent != null
        ? `${percentFormatter.format(summary.differencePercent)} %`
        : null;

    const shouldShowForecast =
      forecast != null && forecast.enabled && this._config.show_forecast !== false;

    return html`<ha-card>
      <div class="content">
        ${heading ? html`<div class="heading">${heading}</div>` : null}

        ${summary
          ? html`<div class="summary">
              <div class="summary-row">
                <span class="label">Bieżący okres</span>
                <span class="value">${currentSummaryValue}</span>
              </div>

              ${referenceSummaryValue
                ? html`<div class="summary-row">
                    <span class="label">Okres referencyjny</span>
                    <span class="value">${referenceSummaryValue}</span>
                  </div>`
                : null}

              ${differenceValue
                ? html`<div class="summary-row">
                    <span class="label">Różnica</span>
                    <span class="value">${differenceValue}</span>
                  </div>`
                : null}

              ${differencePercentValue
                ? html`<div class="summary-row">
                    <span class="label">Różnica [%]</span>
                    <span class="value">${differencePercentValue}</span>
                  </div>`
                : null}

              ${summary.reference_cumulative == null
                ? html`<div class="summary-note">
                    Dane referencyjne dla tego dnia są niepełne – liczby
                    porównawcze mogą być niedostępne lub przybliżone.
                  </div>`
                : null}
            </div>`
          : null}

        ${shouldShowForecast && forecast
          ? html`<div class="forecast">
              <div class="summary-row">
                <span class="label">Prognoza bieżącego okresu</span>
                <span class="value"
                  >${numberFormatter.format(
                    forecast.forecast_total ?? 0
                  )} ${forecast.unit}</span
                >
              </div>
              ${forecast.reference_total != null
                ? html`<div class="summary-row">
                    <span class="label">Wartość historyczna</span>
                    <span class="value"
                      >${numberFormatter.format(
                        forecast.reference_total
                      )} ${forecast.unit}</span
                    >
                  </div>`
                : null}
              <div class="summary-note">
                Poziom pewności prognozy: ${forecast.confidence}.
              </div>
            </div>`
          : null}

        <div class="chart-container">
          <canvas></canvas>
        </div>
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

    .heading {
      margin-bottom: 12px;
      font-weight: 500;
    }

    .summary {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.9rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .summary-row .label {
      color: var(--secondary-text-color);
    }

    .summary-row .value {
      font-weight: 500;
    }

    .summary-note {
      margin-top: 4px;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }

    .forecast {
      margin-bottom: 12px;
      font-size: 0.9rem;
    }

    .chart-container {
      position: relative;
      height: 200px;
    }
  `;
}

customElements.define("energy-burndown-card", EnergyBurndownCard);

declare global {
  interface HTMLElementTagNameMap {
    "energy-burndown-card": EnergyBurndownCard;
  }
}

