import { LitElement, html, type TemplateResult } from "lit";
import type { HomeAssistant, LovelaceCard } from "../ha-types";
import {
  resolveComparisonPreset,
  type CardConfig,
  type CardConfigInput,
  type CardState,
  type ChartRendererConfig,
  type ChartThemeResolved,
  type ComparisonSeries,
  type MergedTimeWindowConfig,
  type ResolvedWindow,
  type TimeSeriesPoint
} from "./types";
import {
  semanticMdiIcon,
  semanticToneClass
} from "./trend-visual";
import {
  computeInterpretationSemantics,
  parseInterpretationMode,
  parseNeutralInterpretationT,
  type InterpretationSemanticsResult
} from "./interpretation-semantics";
import { DateTime } from "luxon";
import {
  mapLtsResponseToCumulativeSeries,
  computeSummary,
  computeForecast,
  computeTextSummary,
  buildLtsQueriesForWindows,
  buildChartTimeline,
  comparisonPeriodFromResolvedWindows,
  firstTailAxisLabelIndex
} from "./ha-api";
import {
  assertLtsHardLimits,
  assertMergedTimeWindowConfig,
  buildMergedTimeWindowConfig,
  resolveTimeWindows
} from "./time-windows";
import { EChartsRenderer } from "./echarts-renderer";
import { resolveSeriesCurrentColor } from "./series-color";
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
  getRawTemplate,
  numberFormatToLocale,
  MISSING_TRANSLATION_KEY
} from "./localize";
import { durationToMillis, parseDurationToken } from "./time-windows/duration-parse";
import { scaleSeriesValues } from "../utils/unit-scaler";
import { energyHorizonCardStyles } from "./energy-horizon-card-styles";
import {
  expandCurrentWindowForCaption,
  formatCompactPeriodCaption,
  hour12FromHaTimeFormat,
  resolvedWindowForCaption
} from "./labels/compact-period-caption";
import { resolveComparisonAxisLabelHints } from "./labels/comparison-label-hints";
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

const TEXT_SUMMARY_PLACEHOLDER = /\{\{(\w+)\}\}/g;

/**
 * Renders a `text_summary.higher*` / `text_summary.lower*` template with
 * `ebc-comment-emphasis` on each `{{varName}}` value.
 */
export function textSummaryNarrativeWithEmphasis(
  template: string,
  vars: Record<string, string>
): TemplateResult {
  const segments: (string | TemplateResult)[] = [];
  let lastIndex = 0;
  const re = new RegExp(TEXT_SUMMARY_PLACEHOLDER.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (m.index > lastIndex) {
      segments.push(template.slice(lastIndex, m.index));
    }
    const varName = m[1]!;
    const display = vars[varName] ?? m[0];
    segments.push(html`<span class="ebc-comment-emphasis">${display}</span>`);
    lastIndex = m.index + m[0].length;
  }
  segments.push(template.slice(lastIndex));
  return html`<div class="ebc-comment-text">${segments}</div>`;
}

/** Chart forecast line: on unless explicitly `show_forecast: false` (alias `forecast` merged in setConfig). */
export function isForecastLineVisible(config: CardConfig): boolean {
  return config.show_forecast !== false;
}

/** Use MoM-specific copy only when resolved geometry is two consecutive calendar months (FR-F). */
function resolvedWindowsAreConsecutiveCalendarMonths(
  windows: ResolvedWindow[] | undefined,
  timeZone: string
): boolean {
  if (!windows || windows.length !== 2) {
    return false;
  }
  const w0s = DateTime.fromJSDate(windows[0]!.start, { zone: timeZone }).startOf("day");
  const w1s = DateTime.fromJSDate(windows[1]!.start, { zone: timeZone }).startOf("day");
  const expectedPrev = w0s.minus({ months: 1 }).startOf("month");
  return w1s.equals(expectedPrev);
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
    const interpretation = parseInterpretationMode(rest.interpretation, {
      debug: Boolean(rest.debug),
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
      neutral_interpretation,
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

        if (
          this._chartRenderer &&
          this._state.period &&
          this._state.resolvedWindows &&
          this._state.chartTime
        ) {
          const locResolved = resolveLocale(this.hass, this._config);
          const localize = createLocalize(locResolved.language);
          const { timeline } = this._state.chartTime;
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

    const chartTimeRaw = buildChartTimeline(
      windows,
      merged,
      resolved.timeZone
    );
    const tailLabelFromIndex =
      windows.length >= 2
        ? firstTailAxisLabelIndex(
            chartTimeRaw.timeline,
            chartTimeRaw.alignStartsMs[0]!,
            windows[0]!.end
          )
        : chartTimeRaw.timeline.length;

    try {
      assertPointCountWithinCap(chartTimeRaw.timeline.length);
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
      const forecast = computeForecast(
        scaledSeries,
        chartTimeRaw.forecastPeriodBuckets
      );

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
        mergedTimeWindow: merged,
        chartTime: {
          timeline: chartTimeRaw.timeline,
          alignStartsMs: chartTimeRaw.alignStartsMs,
          forecastPeriodBuckets: chartTimeRaw.forecastPeriodBuckets,
          tailLabelFromIndex
        }
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

  private _interpretationSemantics(): InterpretationSemanticsResult {
    const summary = this._state.summary;
    if (this._state.status !== "ready" || !summary) {
      return { outcome: "insufficient_data" };
    }
    return computeInterpretationSemantics({
      current_cumulative: summary.current_cumulative,
      reference_cumulative: summary.reference_cumulative,
      difference: summary.difference,
      p: summary.differencePercent,
      interpretation: this._config.interpretation ?? "consumption",
      T: this._config.neutral_interpretation ?? 2
    });
  }

  /** Theme tokens for ECharts — read from `:host` CSS variables (US-7 / T020). */
  private _resolveChartTheme(): ChartThemeResolved {
    const host = this as unknown as HTMLElement;
    const readVar = (prop: string): string =>
      typeof globalThis.getComputedStyle === "function"
        ? globalThis.getComputedStyle(host).getPropertyValue(prop).trim()
        : "";
    const seriesCurrent = resolveSeriesCurrentColor(
      host,
      this._config.primary_color
    );
    const seriesReference =
      readVar("--secondary-text-color") || "rgba(127, 127, 127, 0.4)";
    const grid =
      readVar("--divider-color") || "rgba(127, 127, 127, 0.3)";
    const primaryText =
      readVar("--primary-text-color") || "rgba(0, 0, 0, 0.87)";
    const secondaryText =
      readVar("--secondary-text-color") || primaryText;
    const tooltipBackground =
      readVar("--ha-card-background") ||
      readVar("--card-background-color") ||
      "#ffffff";
    const trendHigher = readVar("--error-color") || "#f44336";
    const trendLower = readVar("--success-color") || "#4caf50";
    const trendSimilar =
      readVar("--secondary-text-color") || "rgba(127, 127, 127, 0.55)";
    const trendUnknown = readVar("--disabled-text-color") || trendSimilar;
    const trendMuted = readVar("--disabled-text-color") || trendSimilar;
    const todayFullHeightLine = grid || "rgba(127, 127, 127, 0.35)";
    const referenceDotBorder = tooltipBackground || "#ffffff";

    return {
      seriesCurrent,
      seriesReference,
      referenceDotBorder,
      grid,
      primaryText,
      secondaryText,
      tooltipBackground,
      tooltipBorder: grid,
      todayFullHeightLine,
      trendHigher,
      trendLower,
      trendSimilar,
      trendUnknown,
      trendMuted
    };
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
        tooltipFormatPattern: tf || undefined,
        chartTheme: this._resolveChartTheme(),
        chartTrend: "unknown",
        chartSemanticOutcome: "insufficient_data"
      };
    }

    const period = this._state.period;
    const series = this._state.comparisonSeries;
    const windows = this._state.resolvedWindows;
    const singleWindow = !windows || windows.length < 2;
    const interpretationSemantics = this._interpretationSemantics();
    const ct = this._state.chartTime;
    const w0 = windows?.[0];
    const cs = w0?.start ?? period.current_start;
    const lux = DateTime.fromJSDate(cs, { zone: resolved.timeZone });
    let periodLabel = "";
    if (lux.month === 1 && lux.day === 1) {
      periodLabel = String(lux.year);
    } else {
      periodLabel = new Intl.DateTimeFormat(language, {
        month: "long",
        year: "numeric"
      }).format(cs);
    }

    const displayUnit = series.current.unit;
    const precision = this._config.precision ?? 2;

    const axisHints =
      !singleWindow && windows?.[0] && windows[1]
        ? resolveComparisonAxisLabelHints(windows[0]!, windows[1], resolved.timeZone)
        : { omitYearOnAxis: false, dayOfMonthOnlyOnAxis: false };

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
      tailLabelFromIndex: ct?.tailLabelFromIndex,
      currentWindowStartMs: w0?.start?.getTime(),
      currentWindowEndMs: w0?.end?.getTime(),
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
      tooltipFormatPattern: tf || undefined,
      chartTheme: this._resolveChartTheme(),
      chartTrend: this._state.textSummary?.trend ?? "unknown",
      chartSemanticOutcome: singleWindow
        ? "neutral"
        : interpretationSemantics.outcome,
      comparisonAxisOmitYear: axisHints.omitYearOnAxis,
      comparisonAxisDayOfMonthOnly: axisHints.dayOfMonthOnlyOnAxis
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

    const canRenderEntityIcon = !!entityState;
    const shouldRenderHeader =
      (showIcon && (!!effectiveIcon || canRenderEntityIcon)) || showTitle;

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

    const currentPeriodBase = this._localizeOrError(localize, "summary.current_period");
    const referencePeriodBase = this._localizeOrError(localize, "summary.reference_period");

    let currentPeriodSuffix = "";
    let referencePeriodSuffix = "";

    if (this._state.status === "ready" && this._state.period) {
      const period = this._state.period;
      const rw = this._state.resolvedWindows;
      const captionLocale = resolveLabelLocale(this.hass, this._config);
      const captionZone =
        period.time_zone || this.hass?.config?.time_zone || "UTC";
      const hour12 = hour12FromHaTimeFormat(this.hass?.locale?.time_format);

      const w0 = resolvedWindowForCaption(rw, period, 0);
      const w1 = resolvedWindowForCaption(rw, period, 1);
      const mergedTw =
        this._state.mergedTimeWindow ?? this._mergedTimeWindow;
      const w0Caption = expandCurrentWindowForCaption(
        w0,
        mergedTw,
        this._config.comparison_preset,
        captionZone
      );
      const captionOpts = {
        zone: captionZone,
        locale: captionLocale,
        hour12
      };

      currentPeriodSuffix = formatCompactPeriodCaption(w0Caption, w1, captionOpts);
      referencePeriodSuffix = formatCompactPeriodCaption(w1, w0, captionOpts);
    }

    const currentPeriodLabelFull =
      currentPeriodSuffix !== ""
        ? `${currentPeriodBase} (${currentPeriodSuffix})`
        : currentPeriodBase;
    const referencePeriodLabelFull =
      referencePeriodSuffix !== ""
        ? `${referencePeriodBase} (${referencePeriodSuffix})`
        : referencePeriodBase;

    const currentCaptionText =
      currentPeriodSuffix !== "" ? currentPeriodSuffix : currentPeriodBase;
    const referenceCaptionText =
      referencePeriodSuffix !== "" ? referencePeriodSuffix : referencePeriodBase;

    const currentSummaryNumber =
      summary != null ? numberFormatter.format(summary.current_cumulative) : "";

    const singleWindow =
      this._state.status === "ready" &&
      this._state.resolvedWindows &&
      this._state.resolvedWindows.length < 2;

    const referenceSummaryNumber =
      !singleWindow &&
      summary != null &&
      summary.reference_cumulative != null
        ? numberFormatter.format(summary.reference_cumulative)
        : null;

    const shouldShowForecast =
      !singleWindow &&
      forecast != null &&
      forecast.enabled &&
      isForecastLineVisible(this._config);

    const showForecastTotalPanel =
      shouldShowForecast && this._config.show_forecast_total_panel !== false;

    const forecastUnit = forecast?.unit || displayUnit;

    const captionZoneForNarrative =
      this._state.period?.time_zone ||
      this.hass?.config?.time_zone ||
      "UTC";
    const isMom = resolvedWindowsAreConsecutiveCalendarMonths(
      this._state.resolvedWindows,
      captionZoneForNarrative
    );

    let narrativeBody: TemplateResult | null = null;
    const interpretationSemantics = this._interpretationSemantics();
    const semTone = semanticToneClass(interpretationSemantics.outcome);
    const semIcon = semanticMdiIcon(
      interpretationSemantics.outcome,
      summary?.difference ?? null
    );

    if (textSummary && !singleWindow) {
      const deltaUnitStr =
        textSummary.diffValue != null
          ? `${numberFormatter.format(textSummary.diffValue)} ${displayUnit}`
          : `— ${displayUnit}`;
      const deltaPercentStr =
        summary?.differencePercent != null
          ? `${percentFormatter.format(Math.abs(summary.differencePercent))}%`
          : "—";

      if (interpretationSemantics.outcome === "insufficient_data") {
        narrativeBody = html`<div class="ebc-comment-text ebc-comment-text--muted">
          ${this._localizeOrError(localize, "text_summary.no_reference")}
        </div>`;
      } else if (
        interpretationSemantics.outcome === "neutral" &&
        interpretationSemantics.neutralKind === "percent_band"
      ) {
        const summaryKey = isMom
          ? "text_summary.neutral_band_mom"
          : "text_summary.neutral_band";
        const template = getRawTemplate(resolved.language, summaryKey);
        if (template === undefined) {
          narrativeBody = html`<div class="ebc-comment-text">
            ${this._localizeOrError(localize, summaryKey)}
          </div>`;
        } else {
          narrativeBody = textSummaryNarrativeWithEmphasis(template, {
            deltaUnit: deltaUnitStr,
            deltaPercent: deltaPercentStr
          });
        }
      } else if (interpretationSemantics.outcome === "neutral") {
        narrativeBody = html`<div class="ebc-comment-text ebc-comment-text--muted">
          ${this._localizeOrError(
            localize,
            isMom ? "text_summary.similar_mom" : "text_summary.similar"
          )}
        </div>`;
      } else {
        const mode = this._config.interpretation ?? "consumption";
        const diff = summary?.difference ?? 0;
        const higherKey =
          mode === "production"
            ? isMom
              ? "text_summary.production.higher_mom"
              : "text_summary.production.higher"
            : isMom
              ? "text_summary.higher_mom"
              : "text_summary.higher";
        const lowerKey =
          mode === "production"
            ? isMom
              ? "text_summary.production.lower_mom"
              : "text_summary.production.lower"
            : isMom
              ? "text_summary.lower_mom"
              : "text_summary.lower";
        const summaryKey = diff > 0 ? higherKey : lowerKey;
        const template = getRawTemplate(resolved.language, summaryKey);
        if (template === undefined) {
          narrativeBody = html`<div class="ebc-comment-text">
            ${this._localizeOrError(localize, summaryKey)}
          </div>`;
        } else {
          narrativeBody = textSummaryNarrativeWithEmphasis(template, {
            deltaUnit: deltaUnitStr,
            deltaPercent: deltaPercentStr
          });
        }
      }
    }
    const deltaChipAbs =
      !singleWindow && summary != null && summary.difference != null
        ? formatSigned(summary.difference, numberFormatter, displayUnit)
        : !singleWindow && summary != null
          ? `--- ${displayUnit}`
          : "";
    const deltaChipPct =
      !singleWindow && summary != null && summary.differencePercent != null
        ? formatSigned(summary.differencePercent, percentFormatter, "%")
        : !singleWindow && summary != null
          ? "--- %"
          : "";

    const showWarningStrip =
      !singleWindow && summary != null && summary.reference_cumulative == null;

    return html`<ha-card class="ebc-card">
      <div class="content ebc-content">
        ${shouldRenderHeader
          ? html`<div
              class="ebc-section ebc-section--header"
              role="region"
              aria-label=${this._localizeOrError(localize, "section.header")}
            >
              <div class="ebc-header-row">
                ${showIcon
                  ? html`<div class="ebc-header-icon-wrap">
                      ${effectiveIcon
                        ? html`<ha-icon class="ebc-icon" .icon=${effectiveIcon}></ha-icon>`
                        : entityState
                          ? html`<ha-state-icon
                              class="ebc-icon"
                              .hass=${this.hass}
                              .stateObj=${entityState}
                            ></ha-state-icon>`
                          : null}
                    </div>`
                  : null}
                <div class="ebc-header-text">
                  ${showTitle && effectiveTitle
                    ? html`<div class="ebc-header-title">${effectiveTitle}</div>`
                    : null}
                  <div class="ebc-header-entity">${this._config.entity}</div>
                </div>
              </div>
            </div>`
          : null}

        ${summary && this._config.show_comparison_summary !== false
          ? html`<div
              class="ebc-section ebc-section--comparison"
              role="region"
              aria-label=${this._localizeOrError(localize, "section.comparison")}
            >
              <div class="ebc-comparison-grid">
                <div
                  class="ebc-comparison-col"
                  aria-label=${currentPeriodLabelFull}
                >
                  <div class="ebc-series-caption">
                    <span
                      class="ebc-series-swatch ebc-series-swatch--current"
                      aria-hidden="true"
                    ></span>
                    <span class="ebc-series-caption-text">${currentCaptionText}</span>
                  </div>
                  <div class="ebc-caption">
                    ${this._localizeOrError(localize, "summary.to_this_day")}
                  </div>
                  <div class="ebc-value-row">
                    <span class="ebc-value-num--current">${currentSummaryNumber}</span>
                    <span class="ebc-value-unit">${displayUnit}</span>
                  </div>
                  ${!singleWindow
                    ? html`<div
                        class="ebc-delta-chip ${semTone}"
                        aria-label=${this._localizeOrError(
                          localize,
                          "summary.difference"
                        )}
                      >
                        <span class="ebc-delta-abs">${deltaChipAbs}</span>
                        <span class="ebc-delta-sep" aria-hidden="true">|</span>
                        <span class="ebc-delta-pct">${deltaChipPct}</span>
                      </div>`
                    : null}
                </div>
                <div class="ebc-comparison-divider" aria-hidden="true"></div>
                <div
                  class="ebc-comparison-col"
                  aria-label=${referencePeriodLabelFull}
                >
                  <div class="ebc-series-caption">
                    <span
                      class="ebc-series-swatch ebc-series-swatch--reference"
                      aria-hidden="true"
                    ></span>
                    <span class="ebc-series-caption-text">${referenceCaptionText}</span>
                  </div>
                  <div class="ebc-caption">
                    ${this._localizeOrError(localize, "summary.to_this_day")}
                  </div>
                  <div class="ebc-value-row">
                    ${referenceSummaryNumber != null
                      ? html`<span class="ebc-value-num--reference"
                            >${referenceSummaryNumber}</span
                          >
                          <span class="ebc-value-unit">${displayUnit}</span>`
                      : html`<span class="ebc-value-num--reference">—</span>
                          <span class="ebc-value-unit">${displayUnit}</span>`}
                  </div>
                </div>
              </div>
            </div>`
          : null}

        ${showForecastTotalPanel && forecast
          ? html`<div
              class="ebc-section ebc-section--forecast-total"
              role="region"
              aria-label=${this._localizeOrError(
                localize,
                "section.forecast_total"
              )}
            >
              <div class="ebc-surface-grid">
                <div class="ebc-surface-col">
                  <div class="ebc-caption ebc-caption--strong">
                    ${this._localizeOrError(localize, "forecast.panel_forecast")}
                  </div>
                  <div class="ebc-surface-value-row">
                    <span class="ebc-surface-value-num"
                      >${numberFormatter.format(forecast.forecast_total ?? 0)}</span
                    >
                    <span class="ebc-surface-value-unit">${forecastUnit}</span>
                  </div>
                  <div class="ebc-forecast-confidence">
                    ${this._localizeOrError(localize, "forecast.confidence", {
                      confidence: forecast.confidence
                    })}
                  </div>
                </div>
                <div class="ebc-comparison-divider" aria-hidden="true"></div>
                <div class="ebc-surface-col">
                  <div class="ebc-caption ebc-caption--strong">
                    ${this._localizeOrError(localize, "forecast.panel_total")}
                  </div>
                  <div class="ebc-surface-value-row">
                    ${forecast.reference_total != null
                      ? html`<span class="ebc-surface-value-num"
                            >${numberFormatter.format(forecast.reference_total)}</span
                          >
                          <span class="ebc-surface-value-unit">${forecastUnit}</span>`
                      : html`<span class="ebc-surface-value-num ebc-surface-value-num--muted"
                            >---</span
                          >
                          <span class="ebc-surface-value-unit">${forecastUnit}</span>`}
                  </div>
                </div>
              </div>
            </div>`
          : null}

        <div
          class="ebc-section ebc-section--chart"
          role="region"
          aria-label=${this._localizeOrError(localize, "section.chart")}
        >
          <div class="chart-container ebc-chart"></div>
        </div>

        ${narrativeBody && this._config.show_narrative_comment !== false
          ? html`<div
              class="ebc-section ebc-section--comment"
              role="region"
              aria-label=${this._localizeOrError(localize, "section.comment")}
            >
              <div class="ebc-comment-icon-wrap ${semTone}">
                <ha-icon
                  class="ebc-comment-icon ${semTone}"
                  .icon=${semIcon}
                ></ha-icon>
              </div>
              ${narrativeBody}
            </div>`
          : null}

        ${showWarningStrip
          ? html`<div
              class="ebc-section ebc-section--warning"
              role="region"
              aria-label=${this._localizeOrError(localize, "section.warning")}
            >
              <ha-icon
                class="ebc-warning-icon"
                .icon=${"mdi:alert-outline"}
              ></ha-icon>
              <span>${this._localizeOrError(localize, "summary.incomplete_reference")}</span>
            </div>`
          : null}
      </div>
    </ha-card>`;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("energy-horizon-card-editor");
  }

  static getStubConfig(): Partial<CardConfig> {
    return {
      entity: "",
      comparison_preset: "year_over_year",
      interpretation: "consumption",
      neutral_interpretation: 2
    };
  }
}

customElements.define("energy-horizon-card", EnergyHorizonCard);

declare global {
  interface HTMLElementTagNameMap {
    "energy-horizon-card": EnergyHorizonCard;
  }
}

