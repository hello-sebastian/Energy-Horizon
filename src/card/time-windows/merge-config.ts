import type {
  CardConfig,
  ComparisonMode,
  MergedTimeWindowConfig,
  TimeWindowYaml
} from "../types";
import { getPresetTemplate } from "./presets";

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  partial: Partial<TimeWindowYaml> & Record<string, unknown>
): T {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(partial)) {
    const bv = partial[key as keyof typeof partial];
    if (bv === undefined) continue;
    const av = out[key];
    if (
      bv !== null &&
      typeof bv === "object" &&
      !Array.isArray(bv) &&
      av !== null &&
      typeof av === "object" &&
      !Array.isArray(av)
    ) {
      out[key] = deepMerge(av as Record<string, unknown>, bv as Record<string, unknown>);
    } else {
      out[key] = bv;
    }
  }
  return out as T;
}

/**
 * If the user overrides structural fields vs the preset, drop legacy YoY/MoY flags
 * so generic resolution runs (FR-005 / custom windows).
 */
function stripLegacyWhenGeneric(
  merged: MergedTimeWindowConfig,
  preset: MergedTimeWindowConfig
): void {
  const countChanged = merged.count !== preset.count;
  const anchorChanged = merged.anchor !== preset.anchor;
  const stepChanged = merged.step !== preset.step;
  const offsetSet =
    merged.offset !== undefined &&
    merged.offset !== preset.offset &&
    merged.offset !== "";

  if (countChanged || anchorChanged || stepChanged || offsetSet) {
    delete merged.currentEndIsNow;
    delete merged.referenceFullPeriod;
  }
}

export function mergeTimeWindowConfig(input: {
  mode: ComparisonMode;
  timeWindowPartial?: TimeWindowYaml;
  periodOffset?: number;
}): MergedTimeWindowConfig {
  const preset = getPresetTemplate(input.mode, input.periodOffset);
  if (!input.timeWindowPartial) {
    return { ...preset };
  }
  const merged = deepMerge(
    preset as unknown as Record<string, unknown>,
    input.timeWindowPartial as Record<string, unknown>
  ) as MergedTimeWindowConfig;
  stripLegacyWhenGeneric(merged, preset);
  return merged;
}

/**
 * Preset/YAML merge plus card-level `aggregation` (same default chain as the card’s data load path).
 */
export function buildMergedTimeWindowConfig(
  config: Pick<
    CardConfig,
    "comparison_preset" | "time_window" | "period_offset" | "aggregation"
  >
): MergedTimeWindowConfig {
  const mergedBase = mergeTimeWindowConfig({
    mode: config.comparison_preset,
    timeWindowPartial: config.time_window,
    periodOffset: config.period_offset
  });
  return {
    ...mergedBase,
    aggregation: mergedBase.aggregation ?? config.aggregation
  };
}
