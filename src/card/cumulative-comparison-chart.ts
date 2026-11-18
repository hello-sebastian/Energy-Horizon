import { LitElement, html, type TemplateResult } from "lit";
import type {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig
} from "../ha-types";
import {
  resolveComparisonPreset,
  type CardConfig,
  type CardConfigInput,
  type CardState,
  type ChartRendererConfig,
  type ChartTimeContext,
  type ComparisonSeries,
  type CumulativeSeries,
  type MergedTimeWindowConfig,
  type ResolvedWindow
} from "./types";
import {
  computeInterpretationSemantics,
  parseInterpretationMode,
  parseNeutralThresholdT,
  type InterpretationSemanticsResult
} from "./interpretation-semantics";
import { buildChartTimeline } from "./timeline";
import {
  mapLtsResponseToCumulativeSeries,
  buildLtsQueriesForWindows,
  type LtsMessageResponse
} from "./ha-api";
import {
  assertLtsHardLimits,
  assertMergedTimeWindowConfig,
  buildMergedTimeWindowConfig,
  resolvePreviewShiftedWindows,
  nextPreviewShift,
  type PreviewShiftAction
} from "./time-windows";
import { EChartsRenderer } from "./echarts-renderer";
import {
  assertPointCountWithinCap,
  MAX_POINTS_PER_SERIES,
  PointCapExceededError,
  validateXAxisFormat
} from "./axis";
import {
  resolveLocale,
  createLocalize,
  MISSING_TRANSLATION_KEY,
  type LocalizeFunction,
  type ResolvedLocale
} from "./localize";
import {
  buildCardViewModel,
  type ReadyCardViewModel
} from "./view-model";
import { durationToMillis, parseDurationToken } from "./time-windows/duration-parse";
import { applyUnitScalingToSeries } from "../utils/unit-scaler";
import {
  assembleComparisonSeries,
  buildReadyState,
  chartTimeContext,
  resolveChartBase
} from "./pipeline/ready-state-builder";
import { energyHorizonCardStyles } from "./energy-horizon-card-styles";
import {
  buildSamplePreviewConfig,
  entityUnitOf,
  findSuitableEntity
} from "./picker-preview";
import { attachPicker, type PickerController } from "./picker/attach-picker";
import { buildRendererConfig } from "./renderer-config";
export { isForecastLineVisible } from "./renderer-config";
import { resolveComparisonAxisLabelHints } from "./labels/comparison-label-hints";
import { formatPeriodLabel } from "./labels/period-label";
import "./energy-horizon-card-editor.js";

export class EnergyHorizonCard extends LitElement implements LovelaceCard {
  static properties = {
    hass: { type: Object, attribute: false },
    _config: { state: true },
    _state: { state: true },
    _previewLoading: { state: true },
    preview: { type: Boolean, attribute: false }
  };

  declare hass: HomeAssistant;
  declare _config: CardConfig;
  _state: CardState = { status: "loading" };

  /**
   * Picker mode (910, research R2): set by `hui-card` when the card is rendered
   * in the "Add card" picker (`element.preview = this.preview`). Not part of
   * `_config`, not persisted. When `true`, the card renders a deterministic
   * demo series immediately (no query on the critical path, no loading/error
   * state) and hides the 909 time-window preview controls.
   */
  preview = false;

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

  /**
   * Picker session controller (910, 911/TD-14) — created lazily, once per
   * element instance, so the real-data "fired at most once" flag spans
   * repeated `setConfig` calls on the same instance; the picker rebuilds the
   * element per session, so a new element starts a new session (FR-014, R4).
   */
  private _picker?: PickerController;

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
    if (this.preview) {
      // Picker mode (910, FR-014/FR-011, 911/TD-14): the picker module owns the
      // demo-first render and the one-shot real-data upgrade — 910 semantics
      // (FR-010/013/014) preserved 1:1.
      this._pickerController().startSession(new Date());
    } else {
      this._state = { status: "loading" };
    }
  }

  public getCardSize(): number {
    return 4;
  }

  /**
   * Picker side-effect safety (910, FR-013): when the element is removed from
   * the DOM (the picker tears down its preview), bump the load generation so any
   * in-flight picker real-data query discards its result instead of writing to
   * the detached element's state. The preview never writes to `_config` or any
   * storage — the sample config is only the picker's starting point (FR-010).
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._pickerController().onDisconnected();
  }

  // ── module host surface (911/TD-14, FR-903-AB) ──────────────────────────
  // Live values the picker module and the renderer-config module read, plus
  // the element concerns they cannot own (the missing-key escalation, the
  // interpretation semantics, the merged duration). Both modules treat the
  // element as a read-only host.

  /** Live card config (911/TD-14 host surface). */
  get cardConfig(): CardConfig {
    return this._config;
  }

  /** Live card state (911/TD-14 host surface). */
  get state(): CardState {
    return this._state;
  }

  /** Merged window config (911/TD-14 host surface). */
  get mergedTimeWindow(): MergedTimeWindowConfig {
    return this._mergedTimeWindow;
  }

  /** Load-generation counter (911/TD-14 host surface). */
  get loadGeneration(): number {
    return this._loadGeneration;
  }

  /** The host DOM node for the CSS theme-token reads (911/TD-14 host surface). */
  get hostNode(): HTMLElement {
    return this;
  }

  /** Bumps the load generation — discards in-flight loads (911/TD-14 host surface). */
  bumpLoadGeneration(): void {
    this._loadGeneration++;
  }

  /**
   * The missing-translation-key → error escalation (FR-903-NE) bound to the
   * current locale — the element concern the renderer-config module calls
   * instead of building its own `localize`.
   */
  localizeOrError(key: string, vars?: Record<string, string | number>): string {
    const resolved = resolveLocale(this.hass, this._config);
    const localize = createLocalize(resolved.language);
    return this._localizeOrError(localize, key, vars);
  }

  /**
   * The picker session controller (910, 911/TD-14) — created lazily, once per
   * element instance (see `_picker`).
   */
  private _pickerController(): PickerController {
    if (!this._picker) {
      this._picker = attachPicker(this, this._config, (state) => {
        this._state = state;
      });
    }
    return this._picker;
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

      if (this._state.status === "ready") {
        // The ready member carries all chart data (911/TD-11); the local
        // keeps the narrowed type stable across the calls below.
        const state = this._state;
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
        // shifted timeline is available, draw the shifted series on the shifted
        // timeline in preview mode (gray tones). The default pipeline is left untouched.
        // The element field `previewShift` is the live source of the shift (911/TD-11);
        // the snapshot in state carries the shifted series + timeline.
        const previewChartTime = state.preview?.chartTime;
        const previewActive =
          this.previewShift < 0 && previewChartTime != null;

        if (this._chartRenderer && previewActive) {
          const previewSeries = state.preview?.series;
          const previewWindows = state.preview?.windows ?? [];
          const { timeline } = previewChartTime;
          const baseConfig = this._buildRendererConfig(timeline);
          const cs = previewWindows[0]?.start;
          // 911/TD-10: single period-label implementation (FR-010).
          const previewPeriodLabel = cs
            ? formatPeriodLabel(cs, locResolved.language, locResolved.timeZone)
            : "";
          // 911/T023: explicit guard instead of non-null assertions — destructuring
          // lets the compiler and the length check agree (>= 2 ⟺ both defined).
          const [previewW0, previewW1] = previewWindows;
          const axisHints =
            previewW0 && previewW1
              ? resolveComparisonAxisLabelHints(
                  previewW0,
                  previewW1,
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
              unit: state.comparisonSeries.current.unit ?? "",
              periodLabel: this._localizeOrError(localize, "period.current"),
              total: 0
            },
            aggregation: previewWindows[0]?.aggregation ?? "day",
            time_zone:
              state.comparisonSeries.time_zone ?? locResolved.timeZone
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
        } else if (this._chartRenderer) {
          const { timeline } = state.chartTime;
          const rendererConfig = this._buildRendererConfig(timeline);
          this._chartRenderer.update(state.comparisonSeries, timeline, rendererConfig, {
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
    const { merged, windows, chartTime } = resolveChartBase(this._mergedTimeWindow, now, resolved.timeZone);

    if (this._pointCapExceeded(chartTime.timeline.length, gen)) return;

    try {
      const seriesList = await this._fetchLtsSeries(windows, localize);
      const current = seriesList[0];
      if (!current) {
        this._setNoDataState(gen);
        return;
      }

      const entityUnit = this._entityUnit();
      const series = assembleComparisonSeries(seriesList, windows, merged.aggregation ?? "day", resolved.timeZone, entityUnit);

      // Preview branch (909, T008): when previewShift < 0, load the shifted period
      // in place — isolated so a preview failure never clobbers the default pipeline.
      const preview =
        this.previewShift < 0
          ? await this._buildPreviewSnapshot(merged, now, resolved, localize, entityUnit)
          : undefined;

      if (gen !== this._loadGeneration) return;
      this._previewLoading = false;
      this._state = buildReadyState(series, windows, merged, chartTime, resolved, localize, {
        rawUnit: entityUnit,
        forcePrefix: this._config.force_prefix,
        preview: {
          shift: this.previewShift,
          series: preview?.series,
          windows: preview?.windows,
          chartTime: preview?.chartTime
        }
      });
    } catch (e) {
      console.error(e);
      if (gen !== this._loadGeneration) return;
      this._previewLoading = false;
      this._state = { status: "error", errorMessage: "status.error_api" };
    }
  }

  /**
   * The entity's unit of measurement from the HA state, or "" when absent
   * (911/TD-2: single lookup shared by the ready-state pipeline paths;
   * 911/TD-14: delegates to the pure `entityUnitOf`).
   */
  private _entityUnit(entityId?: string): string {
    const id = entityId ?? this._config.entity;
    return entityUnitOf(this.hass, id);
  }

  /**
   * Point-cap guard for the timeline (FR-017): when the timeline exceeds
   * `MAX_POINTS_PER_SERIES` slots, log (debug) and — if this load is still the
   * current one — set the `point_cap_exceeded` error state. Returns `true` when
   * the caller must abort; any other error rethrows.
   */
  private _pointCapExceeded(timelineLength: number, gen: number): boolean {
    try {
      assertPointCountWithinCap(timelineLength);
      return false;
    } catch (e) {
      if (!(e instanceof PointCapExceededError)) {
        throw e;
      }
      if (this._config.debug) {
        console.warn(
          `[Energy Horizon] Point cap exceeded: ${e.actual} timeline slots (maximum ${e.maxPoints}). Reduce aggregation step or window duration.`
        );
      }
      if (gen !== this._loadGeneration) return true;
      this._previewLoading = false;
      this._state = {
        status: "error",
        errorMessage: "status.point_cap_exceeded",
        errorParams: { max: MAX_POINTS_PER_SERIES }
      };
      return true;
    }
  }

  /**
   * No-data terminal state: the current series could not be built (empty LTS
   * result or an unrecognized response shape).
   */
  private _setNoDataState(gen: number): void {
    if (this._config.debug) {
      console.log(
        "[Energy Horizon] current series could not be built – check entity ID and results structure above"
      );
    }
    if (gen !== this._loadGeneration) return;
    this._previewLoading = false;
    this._state = { status: "no-data" };
  }

  /**
   * Fetches and maps the per-window LTS responses to cumulative series with the
   * localized period labels (911/TD-2: extracted from `_loadData` so the ready
   * state can be assembled by the pure pipeline).
   */
  private async _fetchLtsSeries(
    windows: ResolvedWindow[],
    localize: LocalizeFunction
  ): Promise<(CumulativeSeries | undefined)[]> {
    const queries = buildLtsQueriesForWindows(windows, this._config.entity);
    if (this._config.debug) {
      console.log("[Energy Horizon] Time windows:", windows);
      console.log("[Energy Horizon] LTS queries:", queries);
    }

    // Typed boundary (911/TD-3): HA WebSocket messages arrive as `unknown`;
    // `ha-api.ts` normalizes them through the `LtsMessageResponse` model.
    const responses = (await Promise.all(
      queries.map((q) =>
        this.hass.connection.sendMessagePromise(q as unknown as Record<string, unknown>)
      )
    )) as LtsMessageResponse[];

    if (this._config.debug) {
      console.log("[Energy Horizon] API responses (per window):", responses);
    }

    const labelForIndex = (i: number): string => {
      if (i === 0) return localize("period.current");
      if (i === 1) return localize("period.reference");
      return `${localize("period.reference")} (${i})`;
    };

    const seriesList: (CumulativeSeries | undefined)[] = [];
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (response === undefined) continue; // dead path: i < responses.length (911/TD-6)
      seriesList.push(
        mapLtsResponseToCumulativeSeries(
          response,
          this._config.entity,
          labelForIndex(i)
        )
      );
    }
    return seriesList;
  }

  /**
   * In-place preview load (909, T008; extracted for 911/TD-2): resolves the
   * shifted windows, queries the shifted current period — and, when present, the
   * shifted reference period — over the LTS `statistics_during_period` path, and
   * builds the preview series + chart context. Isolated: any failure (caught
   * here) keeps the default pipeline result; the caller only reads the returned
   * snapshot, which always carries the active `shift`.
   */
  private async _buildPreviewSnapshot(
    merged: MergedTimeWindowConfig,
    now: Date,
    resolved: ResolvedLocale,
    localize: LocalizeFunction,
    entityUnit: string
  ): Promise<{
    shift: number;
    series?: ComparisonSeries;
    windows?: ResolvedWindow[];
    chartTime?: ChartTimeContext;
  }> {
    const shift = this.previewShift;
    try {
      const shiftedWindows = resolvePreviewShiftedWindows(
        merged,
        now,
        resolved.timeZone,
        shift,
        24,
        merged.aggregation ?? "day"
      );
      const previewWindowCount = Math.min(2, shiftedWindows.length);
      const previewWindowList = shiftedWindows.slice(0, previewWindowCount);
      const previewQueries = buildLtsQueriesForWindows(
        previewWindowList,
        this._config.entity
      );
      // Typed boundary (911/TD-3) — same model as `_loadData` above.
      const previewResponses = (await Promise.all(
        previewQueries.map((q) =>
          this.hass.connection.sendMessagePromise(
            q as unknown as Record<string, unknown>
          )
        )
      )) as LtsMessageResponse[];
      // Build the preview chart timeline from the shifted windows so the
      // preview series align to the shifted axis (909 US3, T014). This is
      // done unconditionally (even when the shifted period has no data) so
      // the preview period label, controls, and no-data indication can be
      // rendered (FR-013, US6).
      const previewTimeline = buildChartTimeline(
        previewWindowList,
        merged,
        resolved.timeZone
      );
      const previewChartTime = chartTimeContext(previewWindowList, previewTimeline);
      // One response per window query; an absent response maps to `undefined`
      // exactly as before — `extractLtsResults` is total over nullish input (911/TD-6).
      const firstPreviewResponse = previewResponses[0];
      const previewCurrent = firstPreviewResponse
        ? mapLtsResponseToCumulativeSeries(
            firstPreviewResponse,
            this._config.entity,
            localize("period.current")
          )
        : undefined;
      if (!previewCurrent) {
        return { shift, windows: previewWindowList, chartTime: previewChartTime };
      }
      const secondPreviewResponse = previewResponses[1];
      const previewReference =
        previewWindowCount > 1 && secondPreviewResponse
          ? mapLtsResponseToCumulativeSeries(
              secondPreviewResponse,
              this._config.entity,
              localize("period.reference")
            )
          : undefined;
      const previewRaw: ComparisonSeries = {
        current: previewCurrent,
        reference: previewReference ?? undefined,
        aggregation: merged.aggregation ?? "day",
        time_zone: resolved.timeZone
      };
      return {
        shift,
        series: applyUnitScalingToSeries(previewRaw, entityUnit, {
          force_prefix: this._config.force_prefix
        }),
        windows: previewWindowList,
        chartTime: previewChartTime
      };
    } catch (previewError) {
      if (this._config.debug) {
        console.warn(
          "[Energy Horizon] Preview load failed; keeping the default pipeline.",
          previewError
        );
      }
      return { shift };
    }
  }

  /**
   * Merged window duration in ms (YAML `duration` after merge). Element
   * concern exposed on the renderer-config host surface (911/TD-14).
   */
  mergedDurationMs(): number {
    const merged =
      this._state.status === "ready"
        ? this._state.mergedTimeWindow
        : this._mergedTimeWindow;
    const dur = parseDurationToken(merged.duration ?? "1y");
    return dur ? durationToMillis(dur) : 0;
  }

  /**
   * Interpretation semantics of the current state (FR-903-Q/V). Element
   * concern exposed on the renderer-config host surface (911/TD-14).
   */
  interpretationSemantics(): InterpretationSemanticsResult {
    if (this._state.status !== "ready") {
      return { outcome: "insufficient_data" };
    }
    const summary = this._state.summary;
    return computeInterpretationSemantics({
      current_cumulative: summary.current_cumulative,
      reference_cumulative: summary.reference_cumulative,
      difference: summary.difference,
      p: summary.differencePercent,
      interpretation: this._config.interpretation ?? "consumption",
      T: this._config.neutral_threshold ?? 2
    });
  }

  /**
   * The ECharts renderer config for the current state (911/TD-14, FR-903-AB):
   * built by the pure `renderer-config` module — the element only provides
   * the host surface.
   */
  private _buildRendererConfig(fullTimeline: number[] = []): ChartRendererConfig {
    return buildRendererConfig(this, fullTimeline);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const resolved = resolveLocale(this.hass, this._config);
    const localize = createLocalize(resolved.language);

    // 911/TD-9 (FR-903-AA): the view model owns every display value the card
    // prints — render() is a thin template over it. The bound localize keeps
    // the missing-key → error escalation (FR-903-NE) as an element concern;
    // everything the VM computes is pure.
    const vm = buildCardViewModel(
      this._state,
      this._config,
      this.hass,
      (key, vars) => this._localizeOrError(localize, key, vars)
    );

    if (vm.status === "loading") {
      return html`<ha-card class="ebc-card">
        <div class="loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
          <span>${this._localizeOrError(localize, "status.loading")}</span>
        </div>
      </ha-card>`;
    }

    if (vm.status === "error") {
      return html`<ha-card class="ebc-card">
        <ha-alert alert-type="error">
          ${this._localizeOrError(
            localize,
            vm.messageKey,
            vm.errorParams
          )}
        </ha-alert>
      </ha-card>`;
    }

    if (vm.status === "no-data") {
      return html`<ha-card class="ebc-card">
        <ha-alert alert-type="info">
          ${this._localizeOrError(localize, "status.no_data")}
        </ha-alert>
      </ha-card>`;
    }

    // The early returns above leave only the ready member (911/TD-9).
    return html`<ha-card class="ebc-card">
      <div class="content ebc-content">
        ${this._renderHeader(vm, localize)}
        ${this._renderComparisonSection(vm, localize)}
        ${this._renderForecastTotalSection(vm, localize)}
        ${this._renderChartSection(vm, localize)}
        ${this._renderNarrativeSection(vm, localize)}
        ${this._renderWarningSection(vm, localize)}
      </div>
    </ha-card>`;
  }

  /** Header region (icon + title + entity id) — markup 1:1 with the old render(). */
  private _renderHeader(
    vm: ReadyCardViewModel,
    localize: LocalizeFunction
  ): TemplateResult | null {
    if (!vm.shouldRenderHeader) {
      return null;
    }
    return html`<div
      class="ebc-section ebc-section--header"
      role="region"
      aria-label=${this._localizeOrError(localize, "section.header")}
    >
      <div class="ebc-header-row">
        ${vm.showIcon
          ? html`<div class="ebc-header-icon-wrap">
              ${vm.effectiveIcon
                ? html`<ha-icon
                    class="ebc-icon"
                    .icon=${vm.effectiveIcon}
                  ></ha-icon>`
                : vm.entityState
                  ? html`<ha-state-icon
                      class="ebc-icon"
                      .hass=${this.hass}
                      .stateObj=${vm.entityState}
                    ></ha-state-icon>`
                  : null}
            </div>`
          : null}
        <div class="ebc-header-text">
          ${vm.showTitle && vm.effectiveTitle
            ? html`<div class="ebc-header-title">${vm.effectiveTitle}</div>`
            : null}
          <div class="ebc-header-entity">${this._config.entity}</div>
        </div>
      </div>
    </div>`;
  }

  /** Figma "Data series info" panel — current vs reference "to today" values + delta chip. */
  private _renderComparisonSection(
    vm: ReadyCardViewModel,
    localize: LocalizeFunction
  ): TemplateResult | null {
    if (!vm.showComparisonSection) {
      return null;
    }
    return html`<div
      class="ebc-section ebc-section--comparison"
      role="region"
      aria-label=${this._localizeOrError(localize, "section.comparison")}
    >
      <div class="ebc-comparison-grid">
        <div
          class="ebc-comparison-col"
          aria-label=${vm.currentPeriodLabelFull}
        >
          <div class="ebc-series-caption">
            <span
              class="ebc-series-swatch ebc-series-swatch--current"
              aria-hidden="true"
            ></span>
            <span class="ebc-series-caption-text">${vm.currentCaptionText}</span>
          </div>
          <div class="ebc-caption">
            ${this._localizeOrError(localize, "summary.to_this_day")}
          </div>
          <div class="ebc-value-row">
            <span class="ebc-value-num--current">${vm.currentSummaryNumber}</span>
            <span class="ebc-value-unit">${vm.displayUnit}</span>
          </div>
          ${!vm.singleWindow
            ? html`<div
                class="ebc-delta-chip ${vm.semTone}"
                aria-label=${this._localizeOrError(
                  localize,
                  "summary.difference"
                )}
              >
                <span class="ebc-delta-abs">${vm.deltaChipAbs}</span>
                <span class="ebc-delta-sep" aria-hidden="true">|</span>
                <span class="ebc-delta-pct">${vm.deltaChipPct}</span>
              </div>`
            : null}
        </div>
        <div class="ebc-comparison-divider" aria-hidden="true"></div>
        <div
          class="ebc-comparison-col"
          aria-label=${vm.referencePeriodLabelFull}
        >
          <div class="ebc-series-caption">
            <span
              class="ebc-series-swatch ebc-series-swatch--reference"
              aria-hidden="true"
            ></span>
            <span class="ebc-series-caption-text">${vm.referenceCaptionText}</span>
          </div>
          <div class="ebc-caption">
            ${this._localizeOrError(localize, "summary.to_this_day")}
          </div>
          <div class="ebc-value-row">
            ${vm.referenceSummaryNumber != null
              ? html`<span class="ebc-value-num--reference"
                    >${vm.referenceSummaryNumber}</span
                  >
                  <span class="ebc-value-unit">${vm.displayUnit}</span>`
              : html`<span class="ebc-value-num--reference">—</span>
                  <span class="ebc-value-unit">${vm.displayUnit}</span>`}
          </div>
        </div>
      </div>
    </div>`;
  }

  /**
   * Forecast | Total panel (903): gated by `show_forecast_total_panel` only —
   * independent of `show_forecast` (the chart line) and of `forecast.enabled`
   * (value computability). A disabled forecast still shows the panel with the
   * placeholder + the full reference-window total (or a placeholder in
   * single-window mode, where no reference window exists).
   */
  private _renderForecastTotalSection(
    vm: ReadyCardViewModel,
    localize: LocalizeFunction
  ): TemplateResult | null {
    if (!vm.showForecastTotalPanel) {
      return null;
    }
    return html`<div
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
            ${vm.forecastValueText != null
              ? html`<span class="ebc-surface-value-num"
                    >${vm.forecastValueText}</span
                  >
                  <span class="ebc-surface-value-unit">${vm.forecastUnit}</span>`
              : html`<span class="ebc-surface-value-num ebc-surface-value-num--muted"
                    >---</span
                  >
                  <span class="ebc-surface-value-unit">${vm.forecastUnit}</span>`}
          </div>
          <div class="ebc-forecast-confidence">${vm.forecastConfidenceText}</div>
        </div>
        <div class="ebc-comparison-divider" aria-hidden="true"></div>
        <div class="ebc-surface-col">
          <div class="ebc-caption ebc-caption--strong">
            ${this._localizeOrError(localize, "forecast.panel_total")}
          </div>
          <div class="ebc-surface-value-row">
            ${vm.panelTotalText != null
              ? html`<span class="ebc-surface-value-num"
                    >${vm.panelTotalText}</span
                  >
                  <span class="ebc-surface-value-unit">${vm.forecastUnit}</span>`
              : html`<span class="ebc-surface-value-num ebc-surface-value-num--muted"
                    >---</span
                  >
                  <span class="ebc-surface-value-unit">${vm.forecastUnit}</span>`}
          </div>
        </div>
      </div>
    </div>`;
  }

  /**
   * Chart region with the 909 preview controls. Element-only concerns live here
   * (FR-903-AA): `preview` (picker mode hides the controls), `previewShift < 0`
   * (the display gate, FR-903-Y) and `_previewLoading` (disabled controls +
   * dimmed chart overlay) — none of them are part of the view model.
   */
  private _renderChartSection(
    vm: ReadyCardViewModel,
    localize: LocalizeFunction
  ): TemplateResult {
    const previewActive = this.previewShift < 0;
    return html`<div
      class="ebc-section ebc-section--chart"
      role="region"
      aria-label=${this._localizeOrError(localize, "section.chart")}
    >
      ${this.preview
        ? null
        : html`<div class="ebc-chart-controls">
            ${previewActive
              ? html`<span class="ebc-preview-indication" role="status">
                  ${vm.previewIndicationText}
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
          </div>`}
      <div class="ebc-chart-wrap">
        <div
          class="chart-container ebc-chart ${this._previewLoading
            ? "ebc-chart--loading"
            : ""}"
        ></div>
        ${previewActive && !this._previewLoading && vm.previewChartNoData
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
    </div>`;
  }

  /** Narrative comment section (icon + rendered narrative sentence). */
  private _renderNarrativeSection(
    vm: ReadyCardViewModel,
    localize: LocalizeFunction
  ): TemplateResult | null {
    if (!vm.showNarrativeSection || vm.narrativeBody == null) {
      return null;
    }
    return html`<div
      class="ebc-section ebc-section--comment"
      role="region"
      aria-label=${this._localizeOrError(localize, "section.comment")}
    >
      <div class="ebc-comment-icon-wrap ${vm.semTone}">
        <ha-icon
          class="ebc-comment-icon ${vm.semTone}"
          .icon=${vm.semIcon}
        ></ha-icon>
      </div>
      ${vm.narrativeBody}
    </div>`;
  }

  /** Data-quality warning strip (one line per issue). */
  private _renderWarningSection(
    vm: ReadyCardViewModel,
    localize: LocalizeFunction
  ): TemplateResult | null {
    if (!vm.showWarningStrip) {
      return null;
    }
    return html`<div
      class="ebc-section ebc-section--warning"
      role="region"
      aria-label=${this._localizeOrError(localize, "section.warning")}
    >
      <ha-icon
        class="ebc-warning-icon"
        .icon=${"mdi:alert-outline"}
      ></ha-icon>
      <div class="ebc-warning-lines">
        ${vm.warningMessages.map(
          (msg) => html`<div class="ebc-warning-line">${msg}</div>`
        )}
      </div>
    </div>`;
  }


  static getConfigElement(): HTMLElement {
    return document.createElement("energy-horizon-card-editor");
  }

  /**
   * "By card" gallery stub (910, FR-007/FR-008, research R2/R5). The picker
   * calls this with the unused entities first and the used entities as
   * fallback; the returned config is merged over the picker's own
   * `{ type: "custom:energy-horizon-card" }`, so the sample config's own
   * (prefixed) `type` is safe. When no entity has a supported unit the
   * sample config carries `entity: ""` — the preview still renders the
   * deterministic demo series (FR-009).
   */
  static getStubConfig(
    hass: HomeAssistant,
    entities: string[],
    entitiesFallback: string[]
  ): LovelaceCardConfig {
    const entity = findSuitableEntity(hass, entities, entitiesFallback);
    return buildSamplePreviewConfig(entity);
  }
}

customElements.define("energy-horizon-card", EnergyHorizonCard);

declare global {
  interface HTMLElementTagNameMap {
    "energy-horizon-card": EnergyHorizonCard;
  }
}

