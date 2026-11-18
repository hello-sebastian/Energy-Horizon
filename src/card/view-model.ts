import { html, type TemplateResult } from "lit";
import type { HomeAssistant } from "../ha-types";
import type {
  CardConfig,
  CardState,
  ReadyState
} from "./types";
import {
  numberFormatToLocale,
  resolveLocale,
  type LocalizeFunction
} from "./localize";
import { resolveLabelLocale } from "./axis/axis-label-format";
import {
  expandCurrentWindowForCaption,
  formatCompactPeriodCaption,
  hour12FromHaTimeFormat,
  resolvedWindowForCaption
} from "./labels/compact-period-caption";
import { formatPeriodLabel } from "./labels/period-label";
import { formatSigned } from "./labels/signed-number";
import { fullReferenceWindowRawTotal } from "./ha-api";
import { semanticMdiIcon, semanticToneClass } from "./trend-visual";
import { classifyComparisonStep } from "./narrative/classify-comparison-step";
import { interpretationToEntityKind } from "./narrative/interpretation-to-entity-kind";
import { forecastDisabledReasonKey } from "./narrative/forecast-disabled-reason-key";
import { resolveNarrativeSegment } from "./narrative/resolve-narrative-segment";
import { textSummaryNarrativeWithEmphasis } from "./narrative/narrative-emphasis";
import { computeInterpretationSemantics } from "./interpretation-semantics";

/** HA entity state shape (`HomeAssistant["states"]` values). */
type EntityState = NonNullable<HomeAssistant["states"]>[string];

/**
 * Card view model (911/TD-9, FR-903-AA): the single source of every display
 * value the card's `render()` prints. Built by the pure {@link buildCardViewModel}
 * from the card state, config, `hass`, and a `localize` oracle — no DOM, no
 * element access. The element keeps only element-only concerns (load
 * generation, `previewShift` display gating, `_previewLoading` overlays,
 * preview step handlers) and a thin template over this model.
 *
 * Discriminated union on `status` (mirrors `CardState`), so every card state
 * is unit-testable: `loading` / `error` / `no-data` carry their (localized)
 * message, and `ready` carries the full display data.
 */
export type CardViewModel =
  | { status: "loading" }
  | {
      status: "error";
      /** Localized message key (or plain message) shown in the error alert. */
      messageKey: string;
      /** Variables for the `messageKey` translation (e.g. `max` for too-many-windows). */
      errorParams?: Record<string, string | number>;
    }
  | { status: "no-data" }
  | ReadyCardViewModel;

/** Display data for the `ready` member of {@link CardViewModel}. */
export interface ReadyCardViewModel {
  status: "ready";

  // ── header ────────────────────────────────────────────────────────────────
  /** `show_title !== false` (YAML gate; the title text itself is always set). */
  showTitle: boolean;
  /** `show_icon !== false`. */
  showIcon: boolean;
  /** Header row visibility: an icon is available or the title shows. */
  shouldRenderHeader: boolean;
  /** Config title → entity `friendly_name` → entity ID (never empty). */
  effectiveTitle: string;
  /** Config icon (trimmed) or `undefined` (fall back to the entity icon). */
  effectiveIcon: string | undefined;
  /** The entity's HA state (drives the entity-icon fallback); may be absent. */
  entityState: EntityState | undefined;

  // ── comparison panel ──────────────────────────────────────────────────────
  /** Display unit: summary unit → entity `unit_of_measurement` → "". */
  displayUnit: string;
  /** Formatted current-window cumulative ("to this day") value. */
  currentSummaryNumber: string;
  /** Formatted reference-window value, or `null` (placeholder "—"). */
  referenceSummaryNumber: string | null;
  /** Delta chip absolute part ("" in single-window mode). */
  deltaChipAbs: string;
  /** Delta chip percent part ("" in single-window mode). */
  deltaChipPct: string;
  /** aria-label: base caption + " (suffix)" when a period suffix exists. */
  currentPeriodLabelFull: string;
  /** aria-label: base caption + " (suffix)" when a period suffix exists. */
  referencePeriodLabelFull: string;
  /** Series caption text (compact period, or the base caption). */
  currentCaptionText: string;
  /** Series caption text (compact period, or the base caption). */
  referenceCaptionText: string;
  /** `resolvedWindows.length < 2` — hides the reference value, chip, narrative. */
  singleWindow: boolean;
  /** `show_comparison_summary !== false` (summary data is always present on ready). */
  showComparisonSection: boolean;

  // ── forecast | total panel ────────────────────────────────────────────────
  /** `show_forecast_total_panel !== false` (independent of `show_forecast`). */
  showForecastTotalPanel: boolean;
  /** Forecast panel unit: forecast unit → display unit. */
  forecastUnit: string;
  /** Formatted `forecast_total` when enabled + present, else `null` ("---"). */
  forecastValueText: string | null;
  /** Confidence line (enabled) or the disabled hint. */
  forecastConfidenceText: string;
  /** Formatted full reference-window total, or `null` (placeholder, e.g. single-window). */
  panelTotalText: string | null;

  // ── narrative + semantics ─────────────────────────────────────────────────
  /** BEM tone class from the interpretation semantics (delta chip + comment). */
  semTone: string;
  /** MDI icon id from the interpretation semantics. */
  semIcon: string;
  /** Rendered narrative sentence, or `null` (no text summary / single-window). */
  narrativeBody: TemplateResult | null;
  /** `narrativeBody != null && show_narrative_comment !== false`. */
  showNarrativeSection: boolean;

  // ── warning strip ─────────────────────────────────────────────────────────
  /** Localized data-quality messages (incomplete reference, forecast disabled). */
  warningMessages: string[];
  /** `warningMessages.length > 0`. */
  showWarningStrip: boolean;

  // ── preview (909) ─────────────────────────────────────────────────────────
  /**
   * "Preview: <period label>" text for the shifted period, computed from
   * `state.preview` (empty when the snapshot carries no shifted window).
   * DISPLAY stays gated by the element field `previewShift < 0` in `render()`
   * (FR-903-Y) — the text is only printed while a preview is active.
   */
  previewIndicationText: string;
  /** Shifted timeline exists but no shifted series → no-data overlay. */
  previewChartNoData: boolean;
}

/**
 * Builds the {@link CardViewModel} for a card state (911/TD-9). Pure: no DOM,
 * no element access — the `localize` argument is the single i18n oracle.
 *
 * The element passes its bound
 * `(key, vars?) => this._localizeOrError(localize, key, vars)` so a missing
 * translation key still escalates the card to the error state (FR-903-NE) —
 * that side effect is an element concern and stays out of this module.
 */
export function buildCardViewModel(
  state: CardState,
  config: CardConfig,
  hass: HomeAssistant,
  localize: LocalizeFunction
): CardViewModel {
  if (state.status === "loading") {
    return { status: "loading" };
  }
  if (state.status === "error") {
    return {
      status: "error",
      messageKey: state.errorMessage ?? "status.error_generic",
      errorParams: state.errorParams
    };
  }
  if (state.status === "no-data") {
    return { status: "no-data" };
  }
  return buildReadyViewModel(state, config, hass, localize);
}

/** The `ready` member — every display value `render()` prints (911/TD-9). */
function buildReadyViewModel(
  state: ReadyState,
  config: CardConfig,
  hass: HomeAssistant,
  localize: LocalizeFunction
): ReadyCardViewModel {
  const summary = state.summary;
  const forecast = state.forecast;
  const textSummary = state.textSummary;

  // Locale / number formatting (pure; recomputed here so the VM stays the
  // single owner of display formatting).
  const resolved = resolveLocale(hass, config);
  const numberLocale = numberFormatToLocale(
    resolved.numberFormat,
    resolved.language
  );
  const precision = config.precision ?? 2;
  const numberFormatter = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
  const percentFormatter = new Intl.NumberFormat(numberLocale, {
    maximumFractionDigits: 1
  });

  // ── header ────────────────────────────────────────────────────────────────
  const showTitle = config.show_title !== false;
  const showIcon = config.show_icon !== false;
  const entityState = hass.states?.[config.entity];
  const effectiveTitle =
    config.title?.trim() ||
    (entityState?.attributes.friendly_name as string | undefined) ||
    config.entity;
  const effectiveIcon = config.icon?.trim() || undefined;
  const shouldRenderHeader =
    (showIcon && (!!effectiveIcon || !!entityState)) || showTitle;

  // Jeśli z API nie przyszła jednostka, spróbuj użyć tej z encji HA.
  const fallbackUnit = (
    hass.states?.[config.entity]?.attributes as {
      unit_of_measurement?: string;
    }
  )?.unit_of_measurement ?? "";
  const displayUnit = summary.unit || fallbackUnit;

  // ── period captions ───────────────────────────────────────────────────────
  const currentPeriodBase = localize("summary.current_period");
  const referencePeriodBase = localize("summary.reference_period");

  const period = state.period;
  const rw = state.resolvedWindows;
  const captionLocale = resolveLabelLocale(hass, config);
  const captionZone = period.time_zone || hass.config?.time_zone || "UTC";
  const hour12 = hour12FromHaTimeFormat(hass.locale?.time_format);

  const w0 = resolvedWindowForCaption(rw, period, 0);
  const w1 = resolvedWindowForCaption(rw, period, 1);
  const w0Caption = expandCurrentWindowForCaption(
    w0,
    state.mergedTimeWindow,
    config.comparison_preset,
    captionZone
  );
  const captionOpts = {
    zone: captionZone,
    locale: captionLocale,
    hour12
  };
  const currentPeriodSuffix = formatCompactPeriodCaption(w0Caption, w1, captionOpts);
  const referencePeriodSuffix = formatCompactPeriodCaption(w1, w0, captionOpts);

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

  // ── comparison numbers ────────────────────────────────────────────────────
  const currentSummaryNumber = numberFormatter.format(summary.current_cumulative);
  const singleWindow = state.resolvedWindows.length < 2;
  const referenceSummaryNumber =
    !singleWindow && summary.reference_cumulative != null
      ? numberFormatter.format(summary.reference_cumulative)
      : null;

  // ── forecast | total panel ────────────────────────────────────────────────
  // The panel is gated by `show_forecast_total_panel` only — independent of
  // `show_forecast` (chart line) and of `forecast.enabled` (value
  // computability): a disabled forecast still shows the panel with the
  // placeholder + the full reference-window total (or a placeholder in
  // single-window mode, where no reference window exists).
  const showForecastTotalPanel = config.show_forecast_total_panel !== false;
  const forecastUnit = forecast.unit || displayUnit;

  const panelReferenceTotal =
    !singleWindow && state.comparisonSeries.reference?.points?.length
      ? fullReferenceWindowRawTotal(state.comparisonSeries.reference.points)
      : null;
  const forecastValueText =
    forecast.enabled && forecast.forecast_total != null
      ? numberFormatter.format(forecast.forecast_total)
      : null;
  const forecastConfidenceText = forecast.enabled
    ? localize("forecast.confidence", {
        confidence: localize(`forecast.confidence.${forecast.confidence}`)
      })
    : localize("forecast.disabled.hint");
  const panelTotalText =
    panelReferenceTotal != null
      ? numberFormatter.format(panelReferenceTotal)
      : null;

  // ── warning strip ─────────────────────────────────────────────────────────
  // Combine all data-quality messages into a single bar (one line per issue).
  const warningMessages: string[] = [];
  if (!singleWindow && summary.reference_cumulative == null) {
    warningMessages.push(localize("summary.incomplete_reference"));
  }
  if (!singleWindow && forecast.enabled === false) {
    // 911/TD-8: the reason → key table lives in the pure narrative module.
    warningMessages.push(
      localize(forecastDisabledReasonKey(forecast.disabledReason))
    );
  }

  // ── semantics + narrative ─────────────────────────────────────────────────
  const interpretationSemantics = computeInterpretationSemantics({
    current_cumulative: summary.current_cumulative,
    reference_cumulative: summary.reference_cumulative,
    difference: summary.difference,
    p: summary.differencePercent,
    interpretation: config.interpretation ?? "consumption",
    T: config.neutral_threshold ?? 2
  });
  const semTone = semanticToneClass(interpretationSemantics.outcome);
  const semIcon = semanticMdiIcon(
    interpretationSemantics.outcome,
    summary.difference ?? null
  );

  const stepKind = classifyComparisonStep(state.mergedTimeWindow?.step);
  const referencePeriod = localize(`text_summary.period.${stepKind}`);
  const entityKind = interpretationToEntityKind(config.interpretation);

  let narrativeBody: TemplateResult | null = null;
  if (textSummary && !singleWindow) {
    const deltaUnitStr =
      textSummary.diffValue != null
        ? `${numberFormatter.format(textSummary.diffValue)} ${displayUnit}`
        : `— ${displayUnit}`;
    const deltaPercentStr =
      summary.differencePercent != null
        ? `${percentFormatter.format(Math.abs(summary.differencePercent))}%`
        : "—";

    // 911/TD-8: the 4-branch narrative selection (domain-903 narrative
    // engine) is the pure `resolveNarrativeSegment`; only the formatting and
    // the Lit wrap happen here.
    const segment = resolveNarrativeSegment({
      outcome: interpretationSemantics.outcome,
      neutralKind: interpretationSemantics.neutralKind,
      language: resolved.language,
      entityKind,
      values: {
        deltaUnit: deltaUnitStr,
        deltaPercent: deltaPercentStr,
        referencePeriod
      }
    });
    narrativeBody =
      segment.template !== undefined
        ? textSummaryNarrativeWithEmphasis(segment.template, segment.vars)
        : html`<div class="ebc-comment-text${segment.muted ? " ebc-comment-text--muted" : ""}">
          ${localize(segment.key, segment.vars)}
        </div>`;
  }

  const deltaChipAbs =
    !singleWindow && summary.difference != null
      ? formatSigned(summary.difference, numberFormatter, displayUnit)
      : !singleWindow
        ? `--- ${displayUnit}`
        : "";
  const deltaChipPct =
    !singleWindow && summary.differencePercent != null
      ? formatSigned(summary.differencePercent, percentFormatter, "%")
      : !singleWindow
        ? "--- %"
        : "";

  // ── preview (909) ─────────────────────────────────────────────────────────
  // The text is derived from the state snapshot; whether it is *shown* is the
  // element field `previewShift < 0` (display gate stays in `render()`).
  const previewStart = state.preview?.windows?.[0]?.start;
  let previewIndicationText = "";
  if (previewStart) {
    // 911/TD-10: single period-label implementation (FR-010).
    const previewPeriodLabel = formatPeriodLabel(
      previewStart,
      resolved.language,
      resolved.timeZone
    );
    previewIndicationText = localize("preview.indication", {
      period: previewPeriodLabel
    });
  }
  const previewChartNoData =
    state.preview?.chartTime != null && state.preview?.series == null;

  return {
    status: "ready",
    showTitle,
    showIcon,
    shouldRenderHeader,
    effectiveTitle,
    effectiveIcon,
    entityState,
    displayUnit,
    currentSummaryNumber,
    referenceSummaryNumber,
    deltaChipAbs,
    deltaChipPct,
    currentPeriodLabelFull,
    referencePeriodLabelFull,
    currentCaptionText,
    referenceCaptionText,
    singleWindow,
    showComparisonSection: config.show_comparison_summary !== false,
    showForecastTotalPanel,
    forecastUnit,
    forecastValueText,
    forecastConfidenceText,
    panelTotalText,
    semTone,
    semIcon,
    narrativeBody,
    showNarrativeSection:
      narrativeBody != null && config.show_narrative_comment !== false,
    warningMessages,
    showWarningStrip: warningMessages.length > 0,
    previewIndicationText,
    previewChartNoData
  };
}
