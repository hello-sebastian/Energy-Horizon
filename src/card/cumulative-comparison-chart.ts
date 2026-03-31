import { LitElement, html } from "lit";
import type { HomeAssistant, LovelaceCard } from "../ha-types";
import {
  resolveComparisonPreset,
  type CardConfig,
  type CardConfigInput,
  type CardState,
  type ComparisonMode,
  type ComparisonSeries,
  type ChartRendererConfig,
  type MergedTimeWindowConfig,
  type ResolvedWindow,
  type TimeSeriesPoint
} from "./types";
import {
  mapLtsResponseToCumulativeSeries,
  computeSummary,
  computeForecast,
  computeTextSummary,
  buildLtsQueriesForWindows,
  buildChartTimeline,
  comparisonPeriodFromResolvedWindows
} from "./ha-api";
import {
  assertLtsHardLimits,
  assertMergedTimeWindowConfig,
  buildMergedTimeWindowConfig,
  resolveTimeWindows
} from "./time-windows";
import { EChartsRenderer } from "./echarts-renderer";
import {
  assertPointCountWithinCap,
  MAX_POINTS_PER_SERIES,
  pickAutoAggregation,
  PointCapExceededError,
  resolveLabelLocale,
  validateXAxisFormat
} from "./axis";
import {
  resolveLocale,
  createLocalize,
  numberFormatToLocale,
  MISSING_TRANSLATION_KEY
} from "./localize";
import { durationToMillis, parseDurationToken } from "./time-windows/duration-parse";
import { scaleSeriesValues } from "../utils/unit-scaler";
import { energyHorizonCardStyles } from "./energy-horizon-card-styles";
import "./energy-horizon-card-editor.js";

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

export function buildPeriodSuffix(
  date: Date,
  mode: ComparisonMode | string,
  language: string
): string {
  if (mode === "year_over_year") {
    return String(date.getFullYear());
  }
  if (mode === "month_over_year" || mode === "month_over_month") {
    return new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(date);
  }
  return "";
}

/** Suffix for summary labels when preset suffix is empty (custom `time_window`). */
export function formatWindowRangeSuffix(w: ResolvedWindow, language: string): string {
  const fmt = new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  return `${fmt.format(w.start)} – ${fmt.format(w.end)}`;
}

/** Chart forecast line: on unless explicitly `show_forecast: false` (alias `forecast` merged in setConfig). */
export function isForecastLineVisible(config: CardConfig): boolean {
  return config.show_forecast !== false;
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

  /** Merged preset + `time_window` + card `aggregation` — updated in `setConfig`, used in `_loadData`. */
  private _mergedTimeWindow!: MergedTimeWindowConfig;

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

  public setConfig(config: CardConfigInput): void {
    const raw = config as CardConfigInput & { forecast?: boolean };
    const comparison_preset = resolveComparisonPreset(raw);
    const { comparison_mode: _legacyComparisonMode, ...rest } = raw;
    const show_forecast =
      raw.show_forecast !== undefined
        ? raw.show_forecast
        : raw.forecast !== undefined
          ? raw.forecast
          : undefined;
    void _legacyComparisonMode;
    this._config = {
      ...rest,
      comparison_preset,
      ...(show_forecast !== undefined ? { show_forecast } : {})
    } as CardConfig;

    const formatRaw = this._config.x_axis_format;
    if (formatRaw !== undefined && String(formatRaw).trim() !== "") {
      try {
        validateXAxisFormat(String(formatRaw).trim());
      } catch {
        this._state = {
          status: "error",
          errorMessage: "status.config_invalid_x_axis_format"
        };
        return;
      }
    }

    const tooltipRaw = this._config.tooltip_format;
    if (tooltipRaw !== undefined && String(tooltipRaw).trim() !== "") {
      try {
        validateXAxisFormat(String(tooltipRaw).trim());
      } catch {
        this._state = {
          status: "error",
          errorMessage: "status.config_invalid_tooltip_format"
        };
        return;
      }
    }

    this._mergedTimeWindow = buildMergedTimeWindowConfig(this._config);
    assertLtsHardLimits(this._mergedTimeWindow);
    assertMergedTimeWindowConfig(this._mergedTimeWindow);
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

        if (this._chartRenderer && this._state.period && this._state.resolvedWindows) {
          const resolved = resolveLocale(this.hass, this._config);
          const localize = createLocalize(resolved.language);
          const { timeline } = buildChartTimeline(
            this._state.resolvedWindows,
            this._state.mergedTimeWindow!,
            resolved.timeZone,
            this._config.comparison_preset
          );
          const rendererConfig = this._buildRendererConfig(timeline);
          this._chartRenderer.update(this._state.comparisonSeries, timeline, rendererConfig, {
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

    const merged: MergedTimeWindowConfig = { ...this._mergedTimeWindow };
    if (merged.aggregation === undefined) {
      const dur = parseDurationToken(merged.duration ?? "1y");
      const durationMs = dur ? durationToMillis(dur) : 0;
      merged.aggregation = pickAutoAggregation(durationMs);
    }

    const windows = resolveTimeWindows(
      merged,
      now,
      resolved.timeZone,
      24,
      merged.aggregation ?? "day"
    );

    try {
      const { timeline: capTimeline } = buildChartTimeline(
        windows,
        merged,
        resolved.timeZone,
        this._config.comparison_preset
      );
      assertPointCountWithinCap(capTimeline.length);
    } catch (e) {
      if (e instanceof PointCapExceededError) {
        if (this._config.debug) {
          console.warn(
            `[Energy Horizon] Point cap exceeded: ${e.actual} timeline slots (maximum ${e.maxPoints}). Reduce aggregation step or window duration.`
          );
        }
        this._state = {
          status: "error",
          errorMessage: "status.point_cap_exceeded",
          errorParams: { max: MAX_POINTS_PER_SERIES }
        };
        return;
      }
      throw e;
    }
    const period = comparisonPeriodFromResolvedWindows(
      windows,
      resolved.timeZone,
      merged.aggregation ?? "day"
    );
    const queries = buildLtsQueriesForWindows(windows, this._config.entity);

    try {
      if (this._config.debug) {
        console.log("[Energy Horizon] Time windows:", windows);
        console.log("[Energy Horizon] LTS queries:", queries);
      }

      const responses = await Promise.all(
        queries.map((q) =>
          this.hass.connection.sendMessagePromise(q as unknown as Record<string, unknown>)
        )
      );

      if (this._config.debug) {
        console.log("[Energy Horizon] API responses (per window):", responses);
      }

      const labelForIndex = (i: number): string => {
        if (i === 0) return localize("period.current");
        if (i === 1) return localize("period.reference");
        return `${localize("period.reference")} (${i})`;
      };

      const seriesList: ReturnType<typeof mapLtsResponseToCumulativeSeries>[] = [];
      for (let i = 0; i < responses.length; i++) {
        const cum = mapLtsResponseToCumulativeSeries(
          responses[i] as any,
          this._config.entity,
          labelForIndex(i)
        );
        seriesList.push(cum);
      }

      const current = seriesList[0];
      if (!current) {
        if (this._config.debug) {
          console.log(
            "[Energy Horizon] current series could not be built – check entity ID and results structure above"
          );
        }
        this._state = { status: "no-data" };
        return;
      }

      const entityUnit =
        (this.hass.states?.[this._config.entity]?.attributes as {
          unit_of_measurement?: string;
        })?.unit_of_measurement ?? "";

      const withUnit = (
        c: NonNullable<typeof current>
      ): typeof current =>
        entityUnit ? { ...c, unit: c.unit || entityUnit } : c;

      const reference =
        windows.length > 1 ? seriesList[1] : undefined;
      const context =
        windows.length > 2
          ? seriesList
              .slice(2)
              .filter((c): c is NonNullable<typeof c> => c != null)
              .map(withUnit)
          : undefined;

      const series: ComparisonSeries = {
        current: withUnit(current),
        reference:
          reference != null ? withUnit(reference) : undefined,
        ...(context && context.length > 0 ? { context } : {}),
        aggregation: period.aggregation,
        time_zone: period.time_zone
      };

      const scaledSeries = this._applyUnitScalingToSeries(series, entityUnit);

      const summary = computeSummary(scaledSeries);
      const { forecastPeriodBuckets } = buildChartTimeline(
        windows,
        merged,
        resolved.timeZone,
        this._config.comparison_preset
      );
      const forecast = computeForecast(scaledSeries, forecastPeriodBuckets);

      if (!summary.unit && entityUnit) {
        summary.unit = entityUnit;
      }
      if (forecast && !forecast.unit && entityUnit) {
        forecast.unit = entityUnit;
      }

      const textSummary = computeTextSummary(summary);

      this._state = {
        status: "ready",
        comparisonSeries: scaledSeries,
        summary,
        forecast,
        textSummary,
        period,
        resolvedWindows: windows,
        mergedTimeWindow: merged
      };
    } catch (e) {
      console.error(e);
      this._state = {
        status: "error",
        errorMessage: "status.error_api"
      };
    }
  }

  /**
   * Scales cumulative series (and reference) for display; same factor applied to
   * point rawValue so computeForecast stays consistent. Does not touch component state.
   */
  private _applyUnitScalingToSeries(
    series: ComparisonSeries,
    rawUnit: string
  ): ComparisonSeries {
    const currentVals = series.current.points.map((p) => p.value) as (number | null)[];
    const refPoints = series.reference?.points;
    const refVals = refPoints?.map((p) => p.value) as (number | null)[] | undefined;
    const ctxSegments =
      series.context?.map((c) => c.points.map((p) => p.value) as (number | null)[]) ?? [];
    const combined: (number | null)[] = [
      ...currentVals,
      ...(refVals ?? []),
      ...ctxSegments.flat()
    ];

    const scaleResult = scaleSeriesValues(combined, rawUnit, {
      force_prefix: this._config.force_prefix
    });
    let offset = 0;
    const n = currentVals.length;
    const scaledCurrentVals = scaleResult.values.slice(offset, offset + n);
    offset += n;
    const scaledRefVals =
      refVals?.length && refPoints?.length
        ? scaleResult.values.slice(offset, offset + refVals.length)
        : undefined;
    if (refVals?.length) offset += refVals.length;
    const factor = scaleResult.factor;

    const scalePoint = (
      p: TimeSeriesPoint,
      idx: number,
      scaled: (number | null)[]
    ): TimeSeriesPoint => ({
      ...p,
      value: scaled[idx] ?? p.value,
      rawValue:
        p.rawValue != null && Number.isFinite(p.rawValue) ? p.rawValue * factor : undefined
    });

    const currentPoints = series.current.points.map((p, i) =>
      scalePoint(p, i, scaledCurrentVals)
    );
    const currentTotal =
      currentPoints.length > 0 ? currentPoints[currentPoints.length - 1]!.value : 0;

    const scaledCurrent = {
      ...series.current,
      points: currentPoints,
      unit: scaleResult.unit,
      total: currentTotal
    };

    let scaledReference: ComparisonSeries["reference"];
    if (series.reference && refPoints && scaledRefVals && scaledRefVals.length === refPoints.length) {
      const refPts = refPoints.map((p, i) => scalePoint(p, i, scaledRefVals));
      const refTotal = refPts.length > 0 ? refPts[refPts.length - 1]!.value : 0;
      scaledReference = {
        ...series.reference,
        points: refPts,
        unit: scaleResult.unit,
        total: refTotal
      };
    } else if (series.reference) {
      scaledReference = { ...series.reference, unit: scaleResult.unit };
    } else {
      scaledReference = undefined;
    }

    let scaledContext: ComparisonSeries["context"];
    if (series.context?.length) {
      scaledContext = series.context.map((ctx) => {
        const len = ctx.points.length;
        const slice = scaleResult.values.slice(offset, offset + len);
        offset += len;
        const pts = ctx.points.map((p, i) => scalePoint(p, i, slice));
        const total = pts.length > 0 ? pts[pts.length - 1]!.value : 0;
        return {
          ...ctx,
          points: pts,
          unit: scaleResult.unit,
          total
        };
      });
    }

    return {
      ...series,
      current: scaledCurrent,
      reference: scaledReference,
      ...(scaledContext ? { context: scaledContext } : {})
    };
  }

  /** Merged window duration in ms (YAML `duration` after merge). */
  private _mergedDurationMs(): number {
    const merged = this._state.mergedTimeWindow ?? this._mergedTimeWindow;
    const dur = parseDurationToken(merged?.duration ?? "1y");
    return dur ? durationToMillis(dur) : 0;
  }

  private _buildRendererConfig(fullTimeline: number[] = []): ChartRendererConfig {
    const resolved = resolveLocale(this.hass ?? null, this._config);
    const language = resolved.language;
    const numberLocale = numberFormatToLocale(resolved.numberFormat, resolved.language);
    const localize = createLocalize(language);
    const forecastLabel = this._localizeOrError(
      localize,
      "forecast.current_forecast"
    );
    const xAxisLabelLocale = resolveLabelLocale(this.hass, this._config);
    const xf = this._config.x_axis_format?.trim();
    const xAxisMode = xf ? ("forced" as const) : ("adaptive" as const);
    const mergedDurationMs = this._mergedDurationMs();
    const tf = this._config.tooltip_format?.trim();

    if (!this._state.period || !this._state.comparisonSeries) {
      return {
        primaryColor: this._config.primary_color ?? "",
        fillCurrent: this._config.fill_current ?? true,
        fillReference: this._config.fill_reference ?? false,
        fillCurrentOpacity: clampOpacity(this._config.fill_current_opacity),
        fillReferenceOpacity: clampOpacity(this._config.fill_reference_opacity),
        connectNulls: this._config.connect_nulls ?? true,
        showLegend: this._config.show_legend === true,
        showForecast: isForecastLineVisible(this._config),
        showReferenceComparison: false,
        forecastTotal: this._state.forecast?.forecast_total,
        unit: this._state.forecast?.unit ?? "",
        periodLabel: "",
        comparisonMode: this._config.comparison_preset,
        language,
        numberLocale,
        precision: this._config.precision ?? 2,
        forecastLabel,
        singleWindowMode: true,
        xAxisMode,
        xAxisFormatPattern: xAxisMode === "forced" ? xf : undefined,
        xAxisLabelLocale,
        haTimeZone: resolved.timeZone,
        primaryAggregation: "day",
        fullTimeline,
        mergedDurationMs,
        tooltipFormatPattern: tf || undefined
      };
    }

    const period = this._state.period;
    const series = this._state.comparisonSeries;
    const windows = this._state.resolvedWindows;
    const singleWindow = !windows || windows.length < 2;

    let periodLabel = "";
    if (this._config.comparison_preset === "year_over_year") {
      periodLabel = String(period.current_start.getFullYear());
    } else if (this._config.comparison_preset === "month_over_month") {
      periodLabel = new Intl.DateTimeFormat(language, {
        month: "long",
        year: "numeric"
      }).format(period.current_start);
    } else {
      periodLabel = new Intl.DateTimeFormat(language, { month: "long" }).format(
        period.current_start
      );
    }

    const displayUnit = series.current.unit;
    const precision = this._config.precision ?? 2;

    return {
      primaryColor: this._config.primary_color ?? "",
      fillCurrent: this._config.fill_current ?? true,
      fillReference: this._config.fill_reference ?? false,
      fillCurrentOpacity: clampOpacity(this._config.fill_current_opacity),
      fillReferenceOpacity: clampOpacity(this._config.fill_reference_opacity),
      connectNulls: this._config.connect_nulls ?? true,
      showLegend: this._config.show_legend === true,
      showForecast: isForecastLineVisible(this._config) && !singleWindow,
      showReferenceComparison: !singleWindow && series.reference != null,
      forecastTotal: this._state.forecast?.forecast_total,
      unit: displayUnit,
      periodLabel,
      referencePeriodStart: period.reference_start.getTime(),
      windowAlignStartsMs: windows?.map((w) => w.start.getTime()),
      comparisonMode: this._config.comparison_preset,
      language,
      numberLocale,
      precision,
      forecastLabel,
      singleWindowMode: singleWindow,
      xAxisMode,
      xAxisFormatPattern: xAxisMode === "forced" ? xf : undefined,
      xAxisLabelLocale,
      haTimeZone: resolved.timeZone,
      primaryAggregation: period.aggregation,
      fullTimeline,
      mergedDurationMs,
      tooltipFormatPattern: tf || undefined
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
          ${this._localizeOrError(
            localize,
            messageKey,
            this._state.errorParams
          )}
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
    const precision = this._config.precision ?? 2;

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
      let currentSuffix = buildPeriodSuffix(
        this._state.period.current_start,
        this._config.comparison_preset,
        lang
      );
      let referenceSuffix = buildPeriodSuffix(
        this._state.period.reference_start,
        this._config.comparison_preset,
        lang
      );
      const rw = this._state.resolvedWindows;
      if (!currentSuffix && rw?.[0]) {
        currentSuffix = formatWindowRangeSuffix(rw[0], lang);
      }
      if (!referenceSuffix && rw?.[1]) {
        referenceSuffix = formatWindowRangeSuffix(rw[1], lang);
      }
      currentPeriodLabel = `${currentPeriodLabel} (${currentSuffix})`;
      referencePeriodLabel = `${referencePeriodLabel} (${referenceSuffix})`;
    }

    const currentSummaryValue =
      summary != null
        ? `${numberFormatter.format(summary.current_cumulative)} ${
            displayUnit
          }`
        : "";

    const singleWindow =
      this._state.status === "ready" &&
      this._state.resolvedWindows &&
      this._state.resolvedWindows.length < 2;

    const referenceSummaryValue =
      !singleWindow &&
      summary != null &&
      summary.reference_cumulative != null
        ? `${numberFormatter.format(summary.reference_cumulative)} ${
            displayUnit
          }`
        : null;

    const differenceValue =
      !singleWindow &&
      summary != null &&
      summary.difference != null
        ? formatSigned(summary.difference, numberFormatter, displayUnit)
        : null;

    const differencePercentValue =
      !singleWindow &&
      summary != null &&
      summary.differencePercent != null
        ? formatSigned(summary.differencePercent, percentFormatter, "%")
        : null;

    const shouldShowForecast =
      !singleWindow &&
      forecast != null &&
      forecast.enabled &&
      isForecastLineVisible(this._config);

    const forecastUnit = forecast?.unit || displayUnit;

    const isMom = this._config.comparison_preset === "month_over_month";

    let heading: string | null = null;
    if (textSummary && !singleWindow) {
      const diffText =
        textSummary.diffValue != null
          ? `${numberFormatter.format(textSummary.diffValue)} ${displayUnit}`
          : undefined;

      switch (textSummary.trend) {
        case "higher":
          heading = this._localizeOrError(
            localize,
            isMom ? "text_summary.higher_mom" : "text_summary.higher",
            diffText ? { diff: diffText } : undefined
          );
          break;
        case "lower":
          heading = this._localizeOrError(
            localize,
            isMom ? "text_summary.lower_mom" : "text_summary.lower",
            diffText ? { diff: diffText } : undefined
          );
          break;
        case "similar":
          heading = this._localizeOrError(
            localize,
            isMom ? "text_summary.similar_mom" : "text_summary.similar"
          );
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

  static getConfigElement(): HTMLElement {
    return document.createElement("energy-horizon-card-editor");
  }

  static getStubConfig(): Partial<CardConfig> {
    return { entity: "", comparison_preset: "year_over_year" };
  }
}

customElements.define("energy-horizon-card", EnergyHorizonCard);

declare global {
  interface HTMLElementTagNameMap {
    "energy-horizon-card": EnergyHorizonCard;
  }
}

