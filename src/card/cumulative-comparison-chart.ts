import { LitElement, html, type TemplateResult } from "lit";
import type { HomeAssistant, LovelaceCard } from "../ha-types";
import {
  resolveComparisonPreset,
  type CardConfig,
  type CardConfigInput,
  type CardState,
  type ChartRendererConfig,
  type ChartThemeResolved,
  type ChartTimeContext,
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
  parseNeutralThresholdT,
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
  firstTailAxisLabelIndex,
  fullReferenceWindowRawTotal
} from "./ha-api";
import {
  assertLtsHardLimits,
  assertMergedTimeWindowConfig,
  buildMergedTimeWindowConfig,
  resolveTimeWindows,
  resolvePreviewShiftedWindows,
  nextPreviewShift,
  type PreviewShiftAction
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
import { classifyComparisonStep } from "./narrative/classify-comparison-step";
import { interpretationToEntityKind } from "./narrative/interpretation-to-entity-kind";
import { resolveTextSummarySentenceKey } from "./narrative/resolve-text-summary-sentence-key";
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
 * Renders a `text_summary.*.{higher|lower|neutral_band}` sentence template with
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
    _state: { state: true },
    _previewLoading: { state: true }
  };

  declare hass: HomeAssistant;
  declare _config: CardConfig;
  _state: CardState = { status: "loading" };

  /**
   * True while a preview step (back/forward/reset) is loading the shifted period (909).
   * Unlike the initial load, a preview load must NOT replace the card's content with the
   * full-card loading state — the card stays intact with its current data, the chart is
   * dimmed with a "loading" overlay, and the step controls are disabled until the new
   * series arrive (research R6: "in-place chart-only update").
   */
  _previewLoading = false;

  /**
   * Incremented on every `setConfig`. A load captures this value at start and discards its
   * result if it changed before completion (i.e. the config changed mid-load), so a stale
   * load can never overwrite state produced by a newer config.
   */
  private _loadGeneration = 0;
  /**
   * Generation of the most recently started load. Set in `_loadData` and intentionally not
   * cleared: `updated()` starts a load only when this differs from `_loadGeneration`, which
   * coalesces `hass`-triggered loads while one is in flight for the current config.
   */
  private _inFlightGeneration: number | null = null;

  /** Merged preset + `time_window` + card `aggregation` — updated in `setConfig`, used in `_loadData`. */
  private _mergedTimeWindow!: MergedTimeWindowConfig;

  private _chartRenderer?: EChartsRenderer;

  /**
   * Transient preview shift (909): `0` (or absent) = the default window; a negative integer
   * = that many nominal window widths back. Plain runtime field — **not** part of `_config`,
   * not persisted, and discarded on re-instantiation (FR-003, FR-004, FR-009). Always an
   * integer `≤ 0` (data-model validation rule 1).
   */
  private previewShift = 0;

  static styles = energyHorizonCardStyles;

  /**
   * Step the preview window by one nominal width (909). `back` always allowed (no lower
   * bound); `forward` clamped at `0` (a no-op at the default); `reset` returns to `0`.
   * Each *change* bumps the load generation so rapid stepping coalesces (research R6) and
   * any in-flight load is discarded (data-model validation rule 2).
   */
  private _onPreviewStep(action: PreviewShiftAction): void {
    const next = nextPreviewShift(this.previewShift, action);
    if (next === this.previewShift) {
      // No-op (e.g. step forward at the default) — nothing to reload.
      return;
    }
    this.previewShift = next;
    this._loadGeneration++;
    // In-place preview load (research R6): keep the card intact with its current data;
    // the chart is dimmed with a "loading" overlay and the controls are disabled until
    // the shifted series arrive. `_state` is NOT replaced with the full-card loading
    // state, so the chart container stays in the DOM and the renderer survives.
    this._previewLoading = true;
  }

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
    // Bump the generation so any in-flight load (started under the previous config)
    // discards its result once it completes — a config change is never swallowed.
    this._loadGeneration++;
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
    const neutral_threshold = parseNeutralThresholdT(rest);
    this._config = {
      ...rest,
      comparison_preset,
      interpretation,
      neutral_threshold,
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
    // A config change starts a full-card load — any in-flight preview load is
    // superseded (the generation bump above discards its result), so clear the
    // in-place preview flag. The transient preview shift is tied to the previous
    // configuration's window, so it is reset to the default: the new config
    // defines a new default, and a stale shift must not silently apply to it.
    this.previewShift = 0;
    this._previewLoading = false;
    this._state = { status: "loading" };
  }

  public getCardSize(): number {
    return 4;
  }

  protected updated(changedProps: Map<string, unknown>): void {
    if (
      changedProps.has("hass") ||
      changedProps.has("_config") ||
      changedProps.has("_state") ||
      changedProps.has("_previewLoading")
    ) {
      // A load is needed either for the initial/full-card load (`status === "loading"`)
      // or for an in-place preview step (`_previewLoading`). Both coalesce via the
      // generation mechanism: `hass` updates (1–10×/s) during the load window must not
      // re-trigger the load, and rapid preview stepping discards stale in-flight loads.
      if (this._state.status === "loading" || this._previewLoading) {
        if (this._inFlightGeneration !== this._loadGeneration) {
          void this._loadData();
        }
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

        const locResolved = resolveLocale(this.hass, this._config);
        const localize = createLocalize(locResolved.language);

        // Transient time-window preview (909 US3, T014): while `previewShift < 0` and the
        // shifted series + timeline are available, draw the shifted series on the shifted
        // timeline in preview mode (gray tones). The default pipeline is left untouched.
        const previewActive =
          this._state.previewShift != null &&
          this._state.previewShift < 0 &&
          this._state.previewChartTime != null;

        if (this._chartRenderer && previewActive) {
          const previewSeries = this._state.previewSeries;
          const previewChartTime = this._state.previewChartTime!;
          const previewWindows = this._state.previewWindows ?? [];
          const { timeline } = previewChartTime;
          const baseConfig = this._buildRendererConfig(timeline);
          const cs = previewWindows[0]?.start;
          const lux = cs
            ? DateTime.fromJSDate(cs, { zone: locResolved.timeZone })
            : null;
          let previewPeriodLabel = "";
          if (lux) {
            if (lux.month === 1 && lux.day === 1) {
              previewPeriodLabel = String(lux.year);
            } else {
              previewPeriodLabel = new Intl.DateTimeFormat(locResolved.language, {
                month: "long",
                year: "numeric"
              }).format(cs!);
            }
          }
          const axisHints =
            previewWindows.length >= 2
              ? resolveComparisonAxisLabelHints(
                  previewWindows[0]!,
                  previewWindows[1]!,
                  locResolved.timeZone
                )
              : { omitYearOnAxis: false, dayOfMonthOnlyOnAxis: false };
          // Preview no-data (FR-013, US6, T026): the shifted period has no data —
          // keep the chart in place (stable card height, x-axis with the period's
          // start/end labels, empty plot) by updating with an empty series; the
          // standard no-data indication is overlaid centered on the chart by render().
          const seriesForChart: ComparisonSeries = previewSeries ?? {
            current: {
              points: [],
              unit: this._state.comparisonSeries?.current.unit ?? "",
              periodLabel: this._localizeOrError(localize, "period.current"),
              total: 0
            },
            aggregation: previewWindows[0]?.aggregation ?? "day",
            time_zone:
              this._state.comparisonSeries?.time_zone ?? locResolved.timeZone
          };
          const rendererConfig: ChartRendererConfig = {
            ...baseConfig,
            periodLabel: previewPeriodLabel,
            windowAlignStartsMs: previewChartTime.alignStartsMs,
            currentWindowStartMs: previewWindows[0]?.start.getTime(),
            currentWindowEndMs: previewWindows[0]?.end.getTime(),
            referencePeriodStart: previewWindows[1]?.start.getTime(),
            singleWindowMode: previewWindows.length < 2,
            showReferenceComparison:
              previewWindows.length >= 2 && previewSeries?.reference != null,
            showForecast: false,
            unit: seriesForChart.current.unit,
            primaryAggregation: previewWindows[0]?.aggregation,
            tailLabelFromIndex: previewChartTime.tailLabelFromIndex,
            fullTimeline: timeline,
            comparisonAxisOmitYear: axisHints.omitYearOnAxis,
            comparisonAxisDayOfMonthOnly: axisHints.dayOfMonthOnlyOnAxis,
            previewMode: true,
            previewSeries
          };
          this._chartRenderer.update(seriesForChart, timeline, rendererConfig, {
            current: this._localizeOrError(localize, "period.current"),
            reference: this._localizeOrError(localize, "period.reference")
          });
        } else if (
          this._chartRenderer &&
          this._state.period &&
          this._state.resolvedWindows &&
          this._state.chartTime
        ) {
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

    // Capture the generation at start; if it changes before we finish (config changed
    // mid-load), we discard our result so we never clobber a newer load's state.
    const gen = this._loadGeneration;
    this._inFlightGeneration = gen;

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
        if (gen !== this._loadGeneration) return;
        this._previewLoading = false;
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
        if (gen !== this._loadGeneration) return;
        this._previewLoading = false;
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

      // Window-start alignment offset (current − reference). Correct even when the current
      // series starts late (leading zero/missing buckets); the chart already aligns by these
      // window starts, so the numeric pipeline now matches the visual one.
      const alignOffsetMs =
        windows.length > 1
          ? chartTimeRaw.alignStartsMs[0]! - chartTimeRaw.alignStartsMs[1]!
          : undefined;

      const summary = computeSummary(scaledSeries, alignOffsetMs);
      const forecast = computeForecast(
        scaledSeries,
        chartTimeRaw.forecastPeriodBuckets,
        alignOffsetMs
      );

      if (!summary.unit && entityUnit) {
        summary.unit = entityUnit;
      }
      if (forecast && !forecast.unit && entityUnit) {
        forecast.unit = entityUnit;
      }

      const textSummary = computeTextSummary(summary);

      // Preview branch (909, T008): when previewShift < 0, resolve the shifted windows via
      // the T004 helper and query the shifted current period (shiftedWindows[0]) and, when a
      // reference window exists, the shifted reference period (shiftedWindows[1]) via the
      // existing LTS `statistics_during_period` path. The default analytical pipeline above
      // (summary/forecast/interpretation/narrative) is left untouched (FR-021). A preview
      // failure is isolated so it never clobbers the default pipeline's result.
      let previewSeries: ComparisonSeries | undefined;
      let previewWindows: ResolvedWindow[] | undefined;
      let previewChartTime: ChartTimeContext | undefined;
      if (this.previewShift < 0) {
        try {
          const shiftedWindows = resolvePreviewShiftedWindows(
            merged,
            now,
            resolved.timeZone,
            this.previewShift,
            24,
            merged.aggregation ?? "day"
          );
          const previewWindowCount = Math.min(2, shiftedWindows.length);
          const previewWindowList = shiftedWindows.slice(0, previewWindowCount);
          const previewQueries = buildLtsQueriesForWindows(
            previewWindowList,
            this._config.entity
          );
          const previewResponses = await Promise.all(
            previewQueries.map((q) =>
              this.hass.connection.sendMessagePromise(
                q as unknown as Record<string, unknown>
              )
            )
          );
          // Build the preview chart timeline from the shifted windows so the
          // preview series align to the shifted axis (909 US3, T014). This is
          // done unconditionally (even when the shifted period has no data) so
          // the preview period label, controls, and no-data indication can be
          // rendered (FR-013, US6).
          const previewTimelineRaw = buildChartTimeline(
            previewWindowList,
            merged,
            resolved.timeZone
          );
          const previewTailLabelFromIndex =
            previewWindowList.length >= 2
              ? firstTailAxisLabelIndex(
                  previewTimelineRaw.timeline,
                  previewTimelineRaw.alignStartsMs[0]!,
                  previewWindowList[0]!.end
                )
              : previewTimelineRaw.timeline.length;
          previewWindows = previewWindowList;
          previewChartTime = {
            timeline: previewTimelineRaw.timeline,
            alignStartsMs: previewTimelineRaw.alignStartsMs,
            forecastPeriodBuckets: previewTimelineRaw.forecastPeriodBuckets,
            tailLabelFromIndex: previewTailLabelFromIndex
          };
          const previewCurrent = mapLtsResponseToCumulativeSeries(
            previewResponses[0] as any,
            this._config.entity,
            localize("period.current")
          );
          if (previewCurrent) {
            const previewReference =
              previewWindowCount > 1
                ? mapLtsResponseToCumulativeSeries(
                    previewResponses[1] as any,
                    this._config.entity,
                    localize("period.reference")
                  )
                : undefined;
            const previewRaw: ComparisonSeries = {
              current: previewCurrent,
              reference: previewReference ?? undefined,
              aggregation: period.aggregation,
              time_zone: period.time_zone
            };
            previewSeries = this._applyUnitScalingToSeries(
              previewRaw,
              entityUnit
            );
          }
        } catch (previewError) {
          if (this._config.debug) {
            console.warn(
              "[Energy Horizon] Preview load failed; keeping the default pipeline.",
              previewError
            );
          }
        }
      }

      if (gen !== this._loadGeneration) return;
      this._previewLoading = false;
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
        },
        previewShift: this.previewShift,
        previewSeries,
        previewWindows,
        previewChartTime
      };
    } catch (e) {
      console.error(e);
      if (gen !== this._loadGeneration) return;
      this._previewLoading = false;
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
      T: this._config.neutral_threshold ?? 2
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
    const previewCurrent =
      readVar("--secondary-text-color") || "rgba(127, 127, 127, 0.4)";
    const previewReference =
      readVar("--disabled-text-color") || "rgba(127, 127, 127, 0.55)";

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
      trendMuted,
      previewCurrent,
      previewReference
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
    const hour12 = hour12FromHaTimeFormat(this.hass?.locale?.time_format);
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
        hour12,
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
      panelReferenceCumulative: this._state.summary?.reference_cumulative,
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
      hour12,
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

    // The Forecast | Total panel is gated by `show_forecast_total_panel` only —
    // it is independent of `show_forecast` (which controls the forecast line on
    // the chart, see `isForecastLineVisible` in `_buildRendererConfig`) and of
    // `forecast.enabled` (which only decides whether the forecast *value* is
    // computable). When the forecast is not yet available the panel still
    // renders: the Forecast column shows a placeholder and the Total column
    // shows the full reference-window total (or a placeholder in single-window
    // mode, where no reference window exists).
    const showForecastTotalPanel =
      forecast != null && this._config.show_forecast_total_panel !== false;

    const forecastUnit = forecast?.unit || displayUnit;

    // Full reference-window total for the panel's Total column, computed from
    // the (unit-scaled) reference series via the same standalone helper
    // `computeForecast` uses, so the value matches `forecast.reference_total`
    // when the forecast is enabled. In single-window mode there is no reference
    // window, so the Total column shows a placeholder.
    const panelReferenceTotal =
      !singleWindow && this._state.comparisonSeries?.reference?.points?.length
        ? fullReferenceWindowRawTotal(
            this._state.comparisonSeries.reference.points
          )
        : null;

    // Warning bar: combine all data-quality messages into a single bar (one
    // line per issue) instead of stacking separate bars.
    const warningMessages: string[] = [];
    if (
      !singleWindow &&
      summary != null &&
      summary.reference_cumulative == null
    ) {
      warningMessages.push(
        this._localizeOrError(localize, "summary.incomplete_reference")
      );
    }
    if (!singleWindow && forecast != null && forecast.enabled === false) {
      const reasonKey =
        forecast.disabledReason === "insufficient_buckets" ||
        forecast.disabledReason === "below_percent_threshold"
          ? "forecast.disabled.too_early"
          : forecast.disabledReason === "zero_reference_in_range"
            ? "forecast.disabled.zero_reference"
            : forecast.disabledReason === "no_reference"
              ? "forecast.disabled.no_reference"
              : forecast.disabledReason === "no_split"
                ? "forecast.disabled.no_split"
                : "forecast.disabled.unavailable";
      warningMessages.push(this._localizeOrError(localize, reasonKey));
    }
    const showWarningStrip = warningMessages.length > 0;

    const mergedTw = this._state.mergedTimeWindow ?? this._mergedTimeWindow;
    const stepKind = classifyComparisonStep(mergedTw?.step);
    const periodPhraseKey = `text_summary.period.${stepKind}`;
    const referencePeriod = this._localizeOrError(localize, periodPhraseKey);
    const entityKind = interpretationToEntityKind(this._config.interpretation);

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
          ${this._localizeOrError(localize, "text_summary.insufficient_data")}
        </div>`;
      } else if (
        interpretationSemantics.outcome === "neutral" &&
        interpretationSemantics.neutralKind === "percent_band"
      ) {
        const summaryKey = resolveTextSummarySentenceKey(
          resolved.language,
          entityKind,
          "neutral_band"
        );
        const template = getRawTemplate(resolved.language, summaryKey);
        if (template === undefined) {
          narrativeBody = html`<div class="ebc-comment-text">
            ${this._localizeOrError(localize, summaryKey)}
          </div>`;
        } else {
          narrativeBody = textSummaryNarrativeWithEmphasis(template, {
            deltaUnit: deltaUnitStr,
            deltaPercent: deltaPercentStr,
            referencePeriod
          });
        }
      } else if (interpretationSemantics.outcome === "neutral") {
        const summaryKey = resolveTextSummarySentenceKey(
          resolved.language,
          entityKind,
          "similar"
        );
        narrativeBody = html`<div class="ebc-comment-text ebc-comment-text--muted">
          ${this._localizeOrError(localize, summaryKey, { referencePeriod })}
        </div>`;
      } else {
        const diff = summary?.difference ?? 0;
        const trend = diff > 0 ? "higher" : "lower";
        const summaryKey = resolveTextSummarySentenceKey(
          resolved.language,
          entityKind,
          trend
        );
        const template = getRawTemplate(resolved.language, summaryKey);
        if (template === undefined) {
          narrativeBody = html`<div class="ebc-comment-text">
            ${this._localizeOrError(localize, summaryKey)}
          </div>`;
        } else {
          narrativeBody = textSummaryNarrativeWithEmphasis(template, {
            deltaUnit: deltaUnitStr,
            deltaPercent: deltaPercentStr,
            referencePeriod
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

    // Transient time-window preview (909 US2, T011): a visible, screen-reader-announced
    // indication of the shifted period, shown only while `previewShift < 0`. Reuses the
    // card's period-label formatting (year for a Jan-1 start, else "Month YYYY") so the
    // shifted period reads the same way the card already formats periods.
    const previewActive =
      this._state.status === "ready" &&
      this._state.previewShift != null &&
      this._state.previewShift < 0;
    let previewIndicationText = "";
    if (previewActive) {
      const previewStart = this._state.previewWindows?.[0]?.start;
      if (previewStart) {
        const lux = DateTime.fromJSDate(previewStart, {
          zone: resolved.timeZone
        });
        const previewPeriodLabel =
          lux.month === 1 && lux.day === 1
            ? String(lux.year)
            : new Intl.DateTimeFormat(resolved.language, {
                month: "long",
                year: "numeric"
              }).format(previewStart);
        previewIndicationText = this._localizeOrError(localize, "preview.indication", {
          period: previewPeriodLabel
        });
      }
    }

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
                    ${forecast.enabled && forecast.forecast_total != null
                      ? html`<span class="ebc-surface-value-num"
                            >${numberFormatter.format(forecast.forecast_total)}</span
                          >
                          <span class="ebc-surface-value-unit">${forecastUnit}</span>`
                      : html`<span class="ebc-surface-value-num ebc-surface-value-num--muted"
                            >---</span
                          >
                          <span class="ebc-surface-value-unit">${forecastUnit}</span>`}
                  </div>
                  <div class="ebc-forecast-confidence">
                    ${forecast.enabled
                      ? this._localizeOrError(localize, "forecast.confidence", {
                          confidence: this._localizeOrError(
                            localize,
                            `forecast.confidence.${forecast.confidence}`
                          )
                        })
                      : this._localizeOrError(
                          localize,
                          "forecast.disabled.hint"
                        )}
                  </div>
                </div>
                <div class="ebc-comparison-divider" aria-hidden="true"></div>
                <div class="ebc-surface-col">
                  <div class="ebc-caption ebc-caption--strong">
                    ${this._localizeOrError(localize, "forecast.panel_total")}
                  </div>
                  <div class="ebc-surface-value-row">
                    ${panelReferenceTotal != null
                      ? html`<span class="ebc-surface-value-num"
                            >${numberFormatter.format(panelReferenceTotal)}</span
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
          <div class="ebc-chart-controls">
            ${previewActive
              ? html`<span class="ebc-preview-indication" role="status">
                  ${previewIndicationText}
                </span>`
              : null}
            ${previewActive
              ? html`<button
                  class="ebc-chart-control ebc-chart-control--reset"
                  type="button"
                  ?disabled=${this._previewLoading}
                  aria-label=${this._localizeOrError(localize, "preview.reset")}
                  @click=${() => this._onPreviewStep("reset")}
                >
                  <ha-icon icon="mdi:restart"></ha-icon>
                </button>`
              : null}
            <button
              class="ebc-chart-control"
              type="button"
              ?disabled=${this._previewLoading}
              aria-label=${this._localizeOrError(localize, "preview.step_back")}
              @click=${() => this._onPreviewStep("back")}
            >
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button
              class="ebc-chart-control"
              type="button"
              ?disabled=${this._previewLoading}
              aria-label=${this._localizeOrError(localize, "preview.step_forward")}
              @click=${() => this._onPreviewStep("forward")}
            >
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
          <div class="ebc-chart-wrap">
            <div
              class="chart-container ebc-chart ${this._previewLoading
                ? "ebc-chart--loading"
                : ""}"
            ></div>
            ${previewActive &&
            !this._previewLoading &&
            this._state.previewChartTime != null &&
            this._state.previewSeries == null
              ? html`<div class="ebc-chart-nodata-overlay" role="status">
                  <ha-alert alert-type="info">
                    ${this._localizeOrError(localize, "status.no_data")}
                  </ha-alert>
                </div>`
              : null}
            ${this._previewLoading
              ? html`<div class="ebc-chart-loading-overlay" role="status">
                  <ha-circular-progress active size="small"></ha-circular-progress>
                  <span>${this._localizeOrError(localize, "preview.loading")}</span>
                </div>`
              : null}
          </div>
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
              <div class="ebc-warning-lines">
                ${warningMessages.map(
                  (msg) => html`<div class="ebc-warning-line">${msg}</div>`
                )}
              </div>
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
      neutral_threshold: 2
    };
  }
}

customElements.define("energy-horizon-card", EnergyHorizonCard);

declare global {
  interface HTMLElementTagNameMap {
    "energy-horizon-card": EnergyHorizonCard;
  }
}

