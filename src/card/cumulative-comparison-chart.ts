import { LitElement, html } from "lit";
import type { HomeAssistant, LovelaceCard } from "../ha-types";
import type { CardConfig, CardState, ComparisonSeries, ChartRendererConfig, ComparisonPeriod } from "./types";
import {
  buildComparisonPeriod,
  buildLtsQuery,
  mapLtsResponseToCumulativeSeries,
  computeSummary,
  computeForecast,
  computeTextSummary,
  buildFullTimeline
} from "./ha-api";
import { EChartsRenderer } from "./echarts-renderer";
import {
  resolveLocale,
  createLocalize,
  numberFormatToLocale,
  MISSING_TRANSLATION_KEY
} from "./localize";
import { energyHorizonCardStyles } from "./energy-horizon-card-styles";

export function formatSigned(
  value: number,
  formatter: Intl.NumberFormat,
  unit: string
): string {
  if (value > 0) {
    return `+${formatter.format(value)} ${unit}`;
  }
  if (value < 0) {
    return `\u2212${formatter.format(Math.abs(value))} ${unit}`;
  }
  return `${formatter.format(0)} ${unit}`;
}

export function buildPeriodSuffix(date: Date, mode: string, language: string): string {
  if (mode === "year_over_year") {
    return String(date.getFullYear());
  }
  if (mode === "month_over_year") {
    return new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(date);
  }
  return "";
}

function clampOpacity(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    return 30;
  }
  return n;
}

export class EnergyHorizonCard extends LitElement implements LovelaceCard {
  static properties = {
    hass: { type: Object, attribute: false },
    _config: { state: true },
    _state: { state: true }
  };

  declare hass: HomeAssistant;
  declare _config: CardConfig;
  _state: CardState = { status: "loading" };

  private _chartRenderer?: EChartsRenderer;

  static styles = energyHorizonCardStyles;

  private _localizeOrError(
    baseLocalize: (_key: string, _vars?: Record<string, string | number>) => string,
    key: string,
    vars?: Record<string, string | number>
  ): string {
    const translated = baseLocalize(key, vars);

    if (translated === key) {
      if (this._config?.debug) {
         
        console.warn(
          `[Energy Horizon] Missing translation key: "${key}" (language: "${resolveLocale(
            this.hass,
            this._config
          ).language}")`
        );
      }

      this._state = {
        status: "error",
        errorMessage: MISSING_TRANSLATION_KEY
      };

      const errorMessage = baseLocalize(MISSING_TRANSLATION_KEY, { key });
      return errorMessage === MISSING_TRANSLATION_KEY ? key : errorMessage;
    }

    return translated;
  }

  public setConfig(config: CardConfig): void {
    this._config = config;
    this._state = { status: "loading" };
  }

  public getCardSize(): number {
    return 4;
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
        this._state.comparisonSeries
      ) {
        if (!this._chartRenderer) {
          const container = this.renderRoot.querySelector(".chart-container") as
            | HTMLElement
            | null;
          if (container) {
            this._chartRenderer = new EChartsRenderer(container);
          }
        }

        if (this._chartRenderer && this._state.period) {
          const resolved = resolveLocale(this.hass, this._config);
          const localize = createLocalize(resolved.language);
          const fullEnd = this._computeFullEnd(this._state.period);
          const fullTimeline = buildFullTimeline(this._state.period, fullEnd);
          const rendererConfig = this._buildRendererConfig();
          this._chartRenderer.update(this._state.comparisonSeries, fullTimeline, rendererConfig, {
            current: this._localizeOrError(localize, "period.current"),
            reference: this._localizeOrError(localize, "period.reference")
          });
        }
      }
    }
  }

  private async _loadData(): Promise<void> {
    if (!this._config || !this.hass) return;

    const now = new Date();
    const resolved = resolveLocale(this.hass, this._config);
    const localize = createLocalize(resolved.language);
    const period = buildComparisonPeriod(this._config, now, resolved.timeZone);
    const currentQuery = buildLtsQuery(period, this._config.entity);
    const referencePeriod: typeof period = {
      ...period,
      current_start: period.reference_start,
      current_end: period.reference_end
    };
    const referenceQuery = buildLtsQuery(referencePeriod, this._config.entity);

    try {
      if (this._config.debug) {
         
        console.log("[Energy Horizon] API Query (current):", currentQuery);
        console.log("[Energy Horizon] API Query (reference):", referenceQuery);
      }

      const [currentResponse, referenceResponse] = await Promise.all([
        this.hass.connection.sendMessagePromise(
          currentQuery as unknown as Record<string, unknown>
        ),
        this.hass.connection.sendMessagePromise(
          referenceQuery as unknown as Record<string, unknown>
        )
      ]);

      if (this._config.debug) {
        const data =
          (currentResponse as { result?: Record<string, unknown> })?.result ??
          currentResponse;
        const results =
          (data as { results?: Record<string, unknown> }).results ??
          (data as Record<string, unknown>);
         
        console.log("[Energy Horizon] API Response (current, raw):", currentResponse);
        if (results && typeof results === "object") {
          const keys = Object.keys(results);
           
          console.log(
            "[Energy Horizon] Results keys (available statistic_ids):",
            keys
          );
          const entityData = results[this._config.entity];
           
          console.log(
            `[Energy Horizon] Data for entity "${this._config.entity}":`,
            entityData
              ? `${Array.isArray(entityData) ? entityData.length : 0} points`
              : "not found"
          );
           
          console.log(
            "[Energy Horizon] Reference API Response (raw):",
            referenceResponse
          );
        } else {
           
          console.log(
            "[Energy Horizon] No results in response or invalid structure"
          );
        }
      }

      // Period label for current series (chart legend); must be localized.
      const current = mapLtsResponseToCumulativeSeries(
        currentResponse as any,
        this._config.entity,
        localize("period.current")
      );

      if (!current) {
        if (this._config.debug) {
           
          console.log(
            "[Energy Horizon] current series could not be built – check entity ID and results structure above"
          );
        }
        this._state = { status: "no-data" };
        return;
      }

      // Period label for reference series (chart legend); must be localized.
      const reference = mapLtsResponseToCumulativeSeries(
        referenceResponse as any,
        this._config.entity,
        localize("period.reference")
      );

      const entityUnit =
        (this.hass.states?.[this._config.entity]?.attributes as {
          unit_of_measurement?: string;
        })?.unit_of_measurement ?? "";

      const series: ComparisonSeries = {
        current: entityUnit ? { ...current, unit: current.unit || entityUnit } : current,
        reference: reference
          ? entityUnit
            ? { ...reference, unit: reference.unit || entityUnit }
            : reference
          : undefined,
        aggregation: period.aggregation,
        time_zone: period.time_zone
      };

      const summary = computeSummary(series);
      const fullEnd = this._computeFullEnd(period);
      const fullTimeline = buildFullTimeline(period, fullEnd);
      const forecast = computeForecast(series, fullTimeline.length);

      if (!summary.unit && entityUnit) {
        summary.unit = entityUnit;
      }
      if (forecast && !forecast.unit && entityUnit) {
        forecast.unit = entityUnit;
      }

      const textSummary = computeTextSummary(summary);

      this._state = {
        status: "ready",
        comparisonSeries: series,
        summary,
        forecast,
        textSummary,
        period
      };
    } catch (e) {
       
      console.error(e);
      this._state = {
        status: "error",
        errorMessage: "status.error_api"
      };
    }
  }

  private _computeFullEnd(period: ComparisonPeriod): Date {
    if (this._config.comparison_mode === "year_over_year") {
      return new Date(period.current_start.getFullYear(), 11, 31);
    } else {
      // month_over_year
      return new Date(period.current_start.getFullYear(), period.current_start.getMonth() + 1, 0);
    }
  }

  private _buildRendererConfig(): ChartRendererConfig {
    const resolved = resolveLocale(this.hass ?? null, this._config);
    const language = resolved.language;
    const numberLocale = numberFormatToLocale(resolved.numberFormat, resolved.language);
    const precision = this._config.precision ?? 1;
    const localize = createLocalize(language);
    const forecastLabel = this._localizeOrError(
      localize,
      "forecast.current_forecast"
    );

    if (!this._state.period) {
      return {
        primaryColor: this._config.primary_color ?? "",
        fillCurrent: this._config.fill_current ?? true,
        fillReference: this._config.fill_reference ?? false,
        fillCurrentOpacity: clampOpacity(this._config.fill_current_opacity),
        fillReferenceOpacity: clampOpacity(this._config.fill_reference_opacity),
        connectNulls: this._config.connect_nulls ?? true,
        showLegend: this._config.show_legend ?? false,
        showForecast: this._config.show_forecast ?? false,
        forecastTotal: this._state.forecast?.forecast_total,
        unit: this._state.forecast?.unit ?? "",
        periodLabel: "",
        comparisonMode: this._config.comparison_mode,
        language,
        numberLocale,
        precision,
        forecastLabel
      };
    }

    const period = this._state.period;

    let periodLabel = "";
    if (this._config.comparison_mode === "year_over_year") {
      periodLabel = String(period.current_start.getFullYear());
    } else {
      periodLabel = new Intl.DateTimeFormat(language, { month: "long" }).format(period.current_start);
    }

    const entityState = this.hass?.states?.[this._config.entity];
    const unit = (entityState?.attributes as { unit_of_measurement?: string })?.unit_of_measurement ?? "";

    return {
      primaryColor: this._config.primary_color ?? "",
      fillCurrent: this._config.fill_current ?? true,
      fillReference: this._config.fill_reference ?? false,
      fillCurrentOpacity: clampOpacity(this._config.fill_current_opacity),
      fillReferenceOpacity: clampOpacity(this._config.fill_reference_opacity),
      connectNulls: this._config.connect_nulls ?? true,
      showLegend: this._config.show_legend ?? false,
      showForecast: this._config.show_forecast ?? false,
      forecastTotal: this._state.forecast?.forecast_total,
      unit,
      periodLabel,
      referencePeriodStart: period.reference_start.getTime(),
      comparisonMode: this._config.comparison_mode,
      language,
      numberLocale,
      precision,
      forecastLabel
    };
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const resolved = resolveLocale(this.hass, this._config);
    const localize = createLocalize(resolved.language);

    if (this._state.status === "loading") {
      return html`<ha-card class="ebc-card">
        <div class="loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
          <span>${this._localizeOrError(localize, "status.loading")}</span>
        </div>
      </ha-card>`;
    }

    if (this._state.status === "error") {
      const messageKey =
        this._state.errorMessage ?? "status.error_generic";
      return html`<ha-card class="ebc-card">
        <ha-alert alert-type="error">
          ${this._localizeOrError(localize, messageKey)}
        </ha-alert>
      </ha-card>`;
    }

    if (this._state.status === "no-data") {
      return html`<ha-card class="ebc-card">
        <ha-alert alert-type="info">
          ${this._localizeOrError(localize, "status.no_data")}
        </ha-alert>
      </ha-card>`;
    }

    const textSummary = this._state.textSummary;
    const summary = this._state.summary;
    const forecast = this._state.forecast;

    const showTitle = this._config.show_title !== false;
    const entityState = this.hass?.states?.[this._config.entity];
    const effectiveTitle = (
      this._config.title?.trim() ||
      (entityState?.attributes.friendly_name as string | undefined) ||
      this._config.entity
    ) as string;

    const showIcon = this._config.show_icon !== false;
    const effectiveIcon = this._config.icon?.trim() || undefined;

    const canRenderEntityIcon = !!entityState; // ha-state-icon will compute a default icon if attributes.icon is missing
    const shouldRenderHeader =
      (showTitle && !!effectiveTitle) ||
      (showIcon && (!!effectiveIcon || canRenderEntityIcon));

    const numberLocale = numberFormatToLocale(
      resolved.numberFormat,
      resolved.language
    );
    const precision = this._config.precision ?? 1;

    // Jeśli z API nie przyszła jednostka, spróbuj użyć tej z encji HA.
    const fallbackUnit =
      (this.hass.states?.[this._config.entity]?.attributes as {
        unit_of_measurement?: string;
      })?.unit_of_measurement ?? "";

    const numberFormatter = new Intl.NumberFormat(numberLocale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });

    const percentFormatter = new Intl.NumberFormat(numberLocale, {
      maximumFractionDigits: 1
    });

    const displayUnit = summary?.unit || fallbackUnit;

    let currentPeriodLabel = this._localizeOrError(localize, "summary.current_period");
    let referencePeriodLabel = this._localizeOrError(localize, "summary.reference_period");

    if (this._state.status === "ready" && this._state.period) {
      const lang = this._config.language ?? this.hass?.language ?? "en";
      const currentSuffix = buildPeriodSuffix(this._state.period.current_start, this._config.comparison_mode, lang);
      const referenceSuffix = buildPeriodSuffix(this._state.period.reference_start, this._config.comparison_mode, lang);
      currentPeriodLabel = `${currentPeriodLabel} (${currentSuffix})`;
      referencePeriodLabel = `${referencePeriodLabel} (${referenceSuffix})`;
    }

    const currentSummaryValue =
      summary != null
        ? `${numberFormatter.format(summary.current_cumulative)} ${
            displayUnit
          }`
        : "";

    const referenceSummaryValue =
      summary != null && summary.reference_cumulative != null
        ? `${numberFormatter.format(summary.reference_cumulative)} ${
            displayUnit
          }`
        : null;

    const differenceValue =
      summary != null && summary.difference != null
        ? formatSigned(summary.difference, numberFormatter, displayUnit)
        : null;

    const differencePercentValue =
      summary != null && summary.differencePercent != null
        ? formatSigned(summary.differencePercent, percentFormatter, "%")
        : null;

    const shouldShowForecast =
      forecast != null && forecast.enabled && this._config.show_forecast !== false;

    const forecastUnit = forecast?.unit || displayUnit;

    let heading: string | null = null;
    if (textSummary) {
      const diffText =
        textSummary.diffValue != null
          ? `${numberFormatter.format(textSummary.diffValue)} ${displayUnit}`
          : undefined;

      switch (textSummary.trend) {
        case "higher":
          heading = this._localizeOrError(
            localize,
            "text_summary.higher",
            diffText ? { diff: diffText } : undefined
          );
          break;
        case "lower":
          heading = this._localizeOrError(
            localize,
            "text_summary.lower",
            diffText ? { diff: diffText } : undefined
          );
          break;
        case "similar":
          heading = this._localizeOrError(localize, "text_summary.similar");
          break;
        case "unknown":
        default:
          heading = this._localizeOrError(localize, "text_summary.no_reference");
          break;
      }
    }

    return html`<ha-card class="ebc-card">
      <div class="content ebc-content">
        ${shouldRenderHeader
          ? html`<div class="ebc-title-row">
              ${showIcon
                ? effectiveIcon
                  ? html`<ha-icon class="ebc-icon" .icon=${effectiveIcon}></ha-icon>`
                  : entityState
                    ? html`<ha-state-icon
                        class="ebc-icon"
                        .hass=${this.hass}
                        .stateObj=${entityState}
                      ></ha-state-icon>`
                    : null
                : null}
              ${showTitle && !!effectiveTitle
                ? html`<span class="ebc-title">${effectiveTitle}</span>`
                : null}
            </div>`
          : null}

        ${heading ? html`<div class="heading ebc-header">${heading}</div>` : null}

        ${summary
          ? html`<div class="summary ebc-stats">
              <div class="summary-row">
                <span class="label">${currentPeriodLabel}</span>
                <span class="value">${currentSummaryValue}</span>
              </div>

              ${referenceSummaryValue
                ? html`<div class="summary-row">
                    <span class="label">${referencePeriodLabel}</span>
                    <span class="value">${referenceSummaryValue}</span>
                  </div>`
                : null}

              ${differenceValue
                ? html`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(localize, "summary.difference")}</span
                    >
                    <span class="value">${differenceValue}</span>
                  </div>`
                : null}

              ${differencePercentValue
                ? html`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
                        localize,
                        "summary.difference_percent"
                      )}</span
                    >
                    <span class="value">${differencePercentValue}</span>
                  </div>`
                : null}

              ${summary.reference_cumulative == null
                ? html`<div class="summary-note">
                    ${this._localizeOrError(
                      localize,
                      "summary.incomplete_reference"
                    )}
                  </div>`
                : null}
            </div>`
          : null}

        ${shouldShowForecast && forecast
          ? html`<div class="forecast ebc-forecast">
              <div class="summary-row">
                <span class="label"
                  >${this._localizeOrError(
                    localize,
                    "forecast.current_forecast"
                  )}</span
                >
                <span class="value"
                  >${numberFormatter.format(
                    forecast.forecast_total ?? 0
                  )} ${forecastUnit}</span
                >
              </div>
              ${forecast.reference_total != null
                ? html`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
                        localize,
                        "forecast.reference_consumption"
                      )}</span
                    >
                    <span class="value"
                      >${numberFormatter.format(
                        forecast.reference_total
                      )} ${forecastUnit}</span
                    >
                  </div>`
                : null}
              <div class="summary-note">
                ${this._localizeOrError(localize, "forecast.confidence", {
                  confidence: forecast.confidence
                })}
              </div>
            </div>`
          : null}

        <div class="chart-container ebc-chart"></div>
      </div>
    </ha-card>`;
  }
}

customElements.define("energy-horizon-card", EnergyHorizonCard);

declare global {
  interface HTMLElementTagNameMap {
    "energy-horizon-card": EnergyHorizonCard;
  }
}

