/**
 * Picker-preview helpers (910).
 *
 * Pure, deterministic functions that support the card's "Add card" picker
 * preview mode. No side effects, no `Math.random`, no DOM access.
 */

import { DateTime } from "luxon";
import type {
  HomeAssistant,
  CustomCardSuggestion,
  LovelaceCardConfig
} from "../ha-types";
import type {
  ComparisonSeries,
  CumulativeSeries,
  ResolvedWindow,
  TimeSeriesPoint,
  WindowAggregation
} from "./types";
import {
  buildMergedTimeWindowConfig,
  resolveTimeWindows
} from "./time-windows";
import {
  buildChartTimeline,
  buildLtsQueriesForWindows,
  mapLtsResponseToCumulativeSeries
} from "./ha-api";
import {
  parseDurationToken,
  durationToMillis
} from "./time-windows/duration-parse";
import { pickAutoAggregation } from "./axis/auto-aggregation";

/**
 * Units supported by the card's picker preview (FR-003, research R3).
 * Exact, case-sensitive match against `attributes.unit_of_measurement`.
 */
export const SUPPORTED_UNITS = ["kWh", "Wh", "MWh", "m³", "l"] as const;

/**
 * Returns `true` when `unit` is one of the supported units (exact, case-sensitive).
 * `undefined` or any other string → `false`.
 */
export function isSupportedUnit(unit: string | undefined): boolean {
  if (unit === undefined) return false;
  return (SUPPORTED_UNITS as readonly string[]).includes(unit);
}

/**
 * Builds a deterministic demo `ComparisonSeries` for the picker preview (FR-009, R4).
 *
 * - No `Math.random` — values are a pure function of `unit`, `now`, and `timeZone`.
 * - Current series is partial (ends at `now`); reference series is complete.
 * - Aligned to the default `year_over_year` windows so the existing render
 *   pipeline (`alignSeriesOnTimeline`) maps the points correctly.
 * - Plausible household magnitudes (~15 kWh/day base, seasonal variation).
 */
export function buildDemoComparisonSeries(
  unit: string,
  now: Date,
  timeZone: string
): ComparisonSeries {
  const merged = buildMergedTimeWindowConfig({
    comparison_preset: "year_over_year"
  });
  const aggregation: WindowAggregation =
    merged.aggregation ??
    pickAutoAggregation(
      durationToMillis(parseDurationToken(merged.duration ?? "1y")!)
    );
  const windows = resolveTimeWindows(merged, now, timeZone, 24, aggregation);
  const { timeline, alignStartsMs } = buildChartTimeline(windows, merged, timeZone);

  if (timeline.length === 0) {
    return {
      current: { points: [], unit, periodLabel: "", total: 0 },
      aggregation,
      time_zone: timeZone
    };
  }

  // Last timeline slot that starts at or before `now` (the "today" slot).
  const nowMs = now.getTime();
  let nowSlotIndex = 0;
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i]! <= nowMs) {
      nowSlotIndex = i;
    } else {
      break;
    }
  }

  const t0 = timeline[0]!;
  const refAlignStart = alignStartsMs[1] ?? t0;

  // Seasonal daily-consumption factor (index = month 0–11).
  const SEASONAL = [1.4, 1.2, 1.0, 0.8, 0.6, 0.5, 0.5, 0.6, 0.8, 1.0, 1.2, 1.4];
  const BASE_DAILY = 15; // kWh

  /** Deterministic pseudo-noise in [0.9, 1.1] from slot index. */
  const noise = (i: number): number => 0.9 + 0.2 * (((i * 7919) % 100) / 100);

  /** Month (0–11) of a timeline slot in the target time zone. */
  const slotMonth = (slotTs: number): number =>
    DateTime.fromMillis(slotTs, { zone: timeZone }).month - 1;

  // Current series (partial: slots 0..nowSlotIndex).
  const currentPoints: TimeSeriesPoint[] = [];
  let currentRunning = 0;
  for (let i = 0; i <= nowSlotIndex; i++) {
    const slotTs = timeline[i]!;
    const daily = BASE_DAILY * SEASONAL[slotMonth(slotTs)]! * noise(i);
    currentRunning += daily;
    currentPoints.push({ timestamp: slotTs, value: currentRunning, rawValue: daily });
  }

  // Reference series (complete: all slots, ~10 % higher than current).
  const refPoints: TimeSeriesPoint[] = [];
  let refRunning = 0;
  for (let i = 0; i < timeline.length; i++) {
    const slotTs = timeline[i]!;
    const refTs = refAlignStart + (slotTs - t0);
    const daily = BASE_DAILY * SEASONAL[slotMonth(slotTs)]! * noise(i) * 1.1;
    refRunning += daily;
    refPoints.push({ timestamp: refTs, value: refRunning, rawValue: daily });
  }

  const current: CumulativeSeries = {
    points: currentPoints,
    unit,
    periodLabel: "",
    total:
      currentPoints.length > 0
        ? currentPoints[currentPoints.length - 1]!.value
        : 0
  };
  const reference: CumulativeSeries = {
    points: refPoints,
    unit,
    periodLabel: "",
    total: refPoints.length > 0 ? refPoints[refPoints.length - 1]!.value : 0
  };

  return { current, reference, aggregation, time_zone: timeZone };
}

/**
 * Finds the first entity with a supported unit from `entities` (unused),
 * falling back to `entitiesFallback` (used), else `""` (FR-007, R5).
 */
export function findSuitableEntity(
  hass: HomeAssistant,
  entities: string[],
  entitiesFallback: string[]
): string {
  const hasSupportedUnit = (entityId: string): boolean => {
    const unit = (hass.states?.[entityId]?.attributes as {
      unit_of_measurement?: string;
    })?.unit_of_measurement;
    return isSupportedUnit(unit);
  };

  for (const entityId of entities) {
    if (hasSupportedUnit(entityId)) return entityId;
  }
  for (const entityId of entitiesFallback) {
    if (hasSupportedUnit(entityId)) return entityId;
  }
  return "";
}

/**
 * Builds the sample preview config (FR-005/FR-009, R5).
 * Returns exactly the shape the picker expects.
 *
 * The `type` carries the `custom:` prefix: the "By entity" suggestion path
 * feeds this config straight into `<hui-card .config preview>`, which only
 * resolves a type as a custom element when it starts with `custom:`
 * (otherwise it is looked up as a core card and fails with
 * "Unknown type encountered"). The same config is also the starting
 * configuration when the user picks the suggestion, so the prefix is
 * required there too. (The "By card" gallery adds the prefix itself, and the
 * `window.customCards` entry / element tag stay unprefixed.)
 */
export function buildSamplePreviewConfig(entity: string): LovelaceCardConfig {
  return {
    type: "custom:energy-horizon-card",
    entity,
    comparison_preset: "year_over_year",
    interpretation: "consumption",
    neutral_threshold: 2
  };
}

/**
 * Builds an entity suggestion for the "By entity" picker view
 * (FR-001/FR-002/FR-004, R1). Returns `null` when the entity is missing
 * from `hass.states` or its unit is not supported. Total and non-throwing.
 */
export function buildEntitySuggestion(
  hass: HomeAssistant,
  entityId: string
): CustomCardSuggestion | null {
  try {
    const state = hass.states?.[entityId];
    if (!state) return null;
    const unit = (state.attributes as { unit_of_measurement?: string })
      ?.unit_of_measurement;
    if (!isSupportedUnit(unit)) return null;
    return { config: buildSamplePreviewConfig(entityId) };
  } catch {
    return null;
  }
}

/**
 * Time-limited real-data query for the picker preview (FR-011, R4).
 *
 * Races the LTS query against a timeout (~2.5 s). Resolves to a
 * `ComparisonSeries` on success, or `null` on timeout/error/empty.
 * Pure helper — the element wiring (T019) calls this and falls back to
 * `buildDemoComparisonSeries` when the result is `null`.
 */
export async function queryRealDataWithLimit(
  hass: HomeAssistant,
  windows: ResolvedWindow[],
  entityId: string,
  timeZone: string,
  timeoutMs: number = 2500
): Promise<ComparisonSeries | null> {
  try {
    const queries = buildLtsQueriesForWindows(windows, entityId);
    if (queries.length === 0) return null;

    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    const queryPromise = (async (): Promise<ComparisonSeries | null> => {
      const responses = await Promise.all(
        queries.map((q) =>
          hass.connection.sendMessagePromise(
            q as unknown as Record<string, unknown>
          )
        )
      );

      const current = mapLtsResponseToCumulativeSeries(
        responses[0] as Parameters<typeof mapLtsResponseToCumulativeSeries>[0],
        entityId,
        ""
      );
      if (!current) return null;

      const reference =
        windows.length > 1
          ? mapLtsResponseToCumulativeSeries(
              responses[1] as Parameters<typeof mapLtsResponseToCumulativeSeries>[0],
              entityId,
              ""
            )
          : undefined;

      return {
        current,
        ...(reference ? { reference } : {}),
        aggregation: windows[0]!.aggregation,
        time_zone: timeZone
      };
    })();

    return await Promise.race([queryPromise, timeout]);
  } catch {
    return null;
  }
}
