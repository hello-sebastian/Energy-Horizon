/**
 * Picker module (911/TD-14, spec 910 FR-010/FR-013/FR-014, 903 FR-903-AB).
 *
 * Owns the card element's "Add card" picker preview behavior, absorbed from
 * the element 1:1: the demo-first render — a deterministic demo series built
 * synchronously, so the picker sees a full chart immediately with no query on
 * the critical path (FR-011/FR-014) — and the one-shot, time-limited real-data
 * upgrade (FR-007/FR-008). Both producers consume `buildReadyState`
 * (911/TD-2), so the demo state and the real-data upgrade state have identical
 * shape and land on an identical axis.
 *
 * The element keeps only the mount: `attachPicker(host, config, onState)`
 * returns a `PickerController` (the element creates one lazily, once per
 * element instance — the "fire at most once" flag spans repeated `setConfig`
 * calls on the same instance, and the picker rebuilds the element per
 * session, so a new element starts a new session). The element calls
 * `startSession(now)` in the `setConfig` preview branch and
 * `onDisconnected()` on teardown. All live values (config, state, load
 * generation, preview flag) are read from the host on every call, so
 * re-configuration mid-session behaves exactly as the old inline element code
 * did.
 */

import type { HomeAssistant } from "../../ha-types";
import type {
  CardConfig,
  CardState,
  MergedTimeWindowConfig
} from "../types";
import { createLocalize, resolveLocale } from "../localize";
import {
  buildDemoComparisonSeries,
  entityUnitOf,
  isSupportedUnit,
  queryRealDataWithLimit
} from "../picker-preview";
import {
  buildReadyState,
  resolveChartBase
} from "../pipeline/ready-state-builder";

/**
 * The element surface the picker module reads. Values are read live on every
 * call (the host is the element itself), so a config change mid-query is
 * detected through `loadGeneration`.
 */
export interface PickerHost {
  readonly hass: HomeAssistant;
  /** Picker mode (910, research R2) — the element field set by `hui-card`. */
  readonly preview: boolean;
  /** Live card config; `undefined` until the first `setConfig`. */
  readonly cardConfig: CardConfig | undefined;
  readonly state: CardState;
  readonly mergedTimeWindow: MergedTimeWindowConfig;
  /** Bumped on every `setConfig` and on teardown. */
  readonly loadGeneration: number;
  /** Bumps the load generation (discards in-flight picker results). */
  bumpLoadGeneration(): void;
}

/** The picker session controller returned by {@link attachPicker}. */
export interface PickerController {
  /**
   * Demo-first session start (910 FR-014): builds the deterministic demo
   * ready state synchronously, reports it through `onState`, then fires the
   * time-limited real-data query (at most once per controller).
   */
  startSession(now: Date): void;
  /**
   * Picker teardown (910 FR-013): bumps the host's load generation so any
   * in-flight real-data result is discarded instead of written to the
   * detached element's state.
   */
  onDisconnected(): void;
}

/**
 * Mounts the picker session on the element (911/TD-14, 903 FR-903-AB).
 * `config` is a fallback for hosts whose live `cardConfig` is absent; the
 * controller prefers the host's live config on every call.
 */
export function attachPicker(
  host: PickerHost,
  config: CardConfig | undefined,
  onState: (state: CardState) => void
): PickerController {
  return new PickerControllerImpl(host, config, onState);
}

class PickerControllerImpl implements PickerController {
  /**
   * The real-data query has already fired for this session (FR-014, R4). Per
   * controller — one per element instance (see `attachPicker`) — so it spans
   * repeated `setConfig` calls on the same instance.
   */
  private realDataFired = false;

  constructor(
    private readonly host: PickerHost,
    private readonly fallbackConfig: CardConfig | undefined,
    private readonly onState: (state: CardState) => void
  ) {}

  startSession(now: Date): void {
    const config = this.config();
    if (!config) return; // never configured — nothing to demo (defensive)
    // Picker mode (910, FR-014/FR-011): the deterministic demo series renders
    // immediately — no query on the critical path, no blank/loading/error
    // state. The existing render pipeline consumes the ready state unchanged.
    this.onState(
      buildPickerDemoState(this.host.hass, config, this.host.mergedTimeWindow, now)
    );
    // After the demo render, upgrade to real data when a time-limited query
    // succeeds in time; otherwise the demo series stays (FR-007/FR-014, R4).
    this.fireRealDataQuery(config);
  }

  onDisconnected(): void {
    this.host.bumpLoadGeneration();
  }

  /** Live host config, falling back to the config given at mount time. */
  private config(): CardConfig | undefined {
    return this.host.cardConfig ?? this.fallbackConfig;
  }

  /**
   * Picker real-data upgrade (910, FR-007/FR-008/FR-014, research R4). After
   * the deterministic demo series is rendered, fire a time-limited real-data
   * query for the configured entity. On success with a current series, update
   * the preview in place to the real data (reusing the demo state's
   * windows/timeline so the series align). On failure/timeout/empty, keep the
   * demo series. Fired at most once per picker session (element instance); a
   * stale result is discarded via the load generation if the config changes
   * in flight.
   */
  private fireRealDataQuery(config: CardConfig): void {
    if (!this.host.preview || this.realDataFired) return;
    this.realDataFired = true;

    const demoState = this.host.state;
    if (
      demoState.status !== "ready" ||
      !demoState.resolvedWindows ||
      !demoState.chartTime
    ) {
      return;
    }

    const entityId = config.entity;
    if (!entityId) return; // no entity → the demo series stays

    const gen = this.host.loadGeneration;
    const windows = demoState.resolvedWindows;
    const chartTime = demoState.chartTime;
    const merged = demoState.mergedTimeWindow ?? this.host.mergedTimeWindow;
    const hass = this.host.hass;
    const resolved = resolveLocale(hass, config);
    const localize = createLocalize(resolved.language);

    void queryRealDataWithLimit(hass, windows, entityId, resolved.timeZone).then(
      (realSeries) => {
        // Config changed while the query was in flight → discard the stale result.
        if (gen !== this.host.loadGeneration) return;
        // No usable real data → keep the deterministic demo series.
        if (
          !realSeries ||
          !realSeries.current ||
          realSeries.current.points.length === 0
        ) {
          return;
        }

        const entityUnit = entityUnitOf(hass, entityId);

        // Swap the demo series for the real one, keeping the demo state's
        // windows, timeline, and period so the real series align to the same
        // axis. The builder rebuilds the state from those same windows/merged
        // inputs, so the swap lands on an axis-identical ready state.
        this.onState(
          buildReadyState(realSeries, windows, merged, chartTime, resolved, localize, {
            rawUnit: entityUnit || realSeries.current.unit,
            patchUnit: entityUnit,
            forcePrefix: config.force_prefix
          })
        );
      }
    );
  }
}

/**
 * Builds a synchronous, ready `CardState` from the deterministic demo series
 * (910, FR-014/FR-011, research R4). Pure — the element only supplies values.
 * Used in picker mode (`preview === true`) so the card renders a full chart
 * immediately — no query on the critical path, no blank/loading/error state.
 * The existing render pipeline and the `updated()` EChartsRenderer path
 * consume the state unchanged.
 */
export function buildPickerDemoState(
  hass: HomeAssistant,
  config: CardConfig,
  mergedTimeWindow: MergedTimeWindowConfig,
  now: Date
): CardState {
  const resolved = resolveLocale(hass, config);
  const { merged, windows, chartTime } = resolveChartBase(
    mergedTimeWindow,
    now,
    resolved.timeZone
  );
  const localize = createLocalize(resolved.language);

  // Unit from the entity's state when available and supported; else "kWh"
  // (FR-009). The demo series is deterministic regardless of the unit.
  const entityUnit = entityUnitOf(hass, config.entity);
  const demoUnit = isSupportedUnit(entityUnit) ? entityUnit : "kWh";

  const series = buildDemoComparisonSeries(demoUnit, now, resolved.timeZone);
  return buildReadyState(
    series,
    windows,
    merged,
    chartTime,
    resolved,
    localize,
    {
      rawUnit: demoUnit,
      forcePrefix: config.force_prefix
    }
  );
}
