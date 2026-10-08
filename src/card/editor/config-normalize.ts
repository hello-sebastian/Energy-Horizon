import type { CardConfig, CardConfigInput } from "../types";
import { resolveComparisonPreset } from "../types";
import {
  parseInterpretationMode,
  parseNeutralInterpretationT
} from "../interpretation-semantics";

/**
 * Full-Coverage Visual Editor (v1.2.0) — load/save normalization (research R8,
 * FR-908-I, FR-908-V).
 *
 * - **Load** (`normalizeForLoad`): pre-fills `comparison_preset` from the
 *   deprecated `comparison_mode` when empty, and resolves `show_forecast` as
 *   `config.show_forecast ?? config.forecast ?? true` for display. The legacy
 *   keys are kept in the object so the preservative merge copies them through;
 *   only **save** normalizes them away.
 * - **Save** (`normalizeForSave`): emits `comparison_preset` (replacing, not
 *   duplicating, `comparison_mode`) and `show_forecast` (dropping the
 *   `forecast` alias).
 *
 * Both are pure: they return new objects and never mutate their input.
 */

/**
 * Normalizes a raw incoming config for display in the editor.
 *
 * - `comparison_preset` is pre-filled from `comparison_mode` when empty.
 * - `show_forecast` resolves as `config.show_forecast ?? config.forecast ?? true`.
 * - `interpretation` / `neutral_interpretation` are parsed to their canonical
 *   values (same behavior as the v1.1.0 editor `setConfig`).
 *
 * The deprecated `comparison_mode` and legacy `forecast` keys are preserved in
 * the returned object (the preservative merge copies them through); they are
 * only removed on save by {@link normalizeForSave}.
 */
export function normalizeForLoad(config: CardConfigInput): CardConfig {
  // The deprecated `comparison_mode` and legacy `forecast` keys are KEPT in the
  // loaded object (the preservative merge copies them through); only save
  // normalizes them away (research R8).
  const comparison_preset = resolveComparisonPreset(config);

  // `show_forecast ?? forecast ?? true`: an explicit `false` is preserved
  // (only `undefined` falls through to the alias / default).
  const show_forecast =
    config.show_forecast ?? config.forecast ?? true;

  const interpretation = parseInterpretationMode(config.interpretation, {
    debug: Boolean(config.debug),
    log: (message) => {
      console.warn(message);
    }
  });
  const neutral_interpretation = parseNeutralInterpretationT(
    config.neutral_interpretation
  );

  return {
    ...config,
    comparison_preset,
    show_forecast,
    interpretation,
    neutral_interpretation
  } as CardConfig;
}

/**
 * Normalizes a config for emission (`config-changed` detail / saved YAML).
 *
 * - Emits `comparison_preset` and **removes** the deprecated `comparison_mode`
 *   (replaces, not duplicates — FR-908-I).
 * - Emits `show_forecast` and **removes** the legacy `forecast` alias
 *   (FR-908-V).
 *
 * Every other key (including unknown / future keys) is copied through
 * unchanged. Pure: returns a new object.
 */
export function normalizeForSave(config: CardConfig): CardConfig {
  const {
    comparison_mode: _legacyComparisonMode,
    forecast: _legacyForecast,
    ...rest
  } = config as CardConfig & {
    comparison_mode?: unknown;
    forecast?: unknown;
  };
  void _legacyComparisonMode;
  void _legacyForecast;

  const comparison_preset = resolveComparisonPreset({
    comparison_preset: config.comparison_preset,
    comparison_mode: (config as CardConfigInput).comparison_mode
  });

  const show_forecast =
    config.show_forecast ??
    (config as CardConfigInput).forecast ??
    true;

  return {
    ...rest,
    comparison_preset,
    show_forecast
  } as CardConfig;
}
