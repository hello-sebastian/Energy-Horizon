import type { CardConfig } from "../types";
import type { ComparisonMode } from "../types";

/**
 * Full-Coverage Visual Editor (v1.2.0) — preset ↔ custom state cleanup
 * (FR-908-Q, data-model.md §7).
 *
 * The `comparison_preset` select offers the three standard presets plus
 * `custom`. Switching between the two *families* must clean up the config so
 * the saved YAML always matches the selected mode:
 *
 * - **standard → `custom`**: remove `period_offset` (a standard-only key) and
 *   initialize `time_window` with the documented defaults
 *   (`anchor: start_of_year`, `duration: "1y"`, `step: "1y"`, `count: 2`).
 * - **`custom` → standard**: remove the `time_window` object and restore
 *   `period_offset: -1`.
 *
 * Both directions are pure: they return a new config object and never mutate
 * the input. The section's expanded state is a presentation concern
 * (`EditorUiState`) and is deliberately NOT touched here — it is preserved
 * across the switch by the editor.
 */

/** The documented `time_window` defaults applied when entering `custom`. */
export const CUSTOM_TIME_WINDOW_DEFAULTS = {
  anchor: "start_of_year",
  duration: "1y",
  step: "1y",
  count: 2
} as const;

/** The documented `period_offset` default restored when leaving `custom`. */
export const STANDARD_PERIOD_OFFSET_DEFAULT = -1;

type ConfigRecord = Record<string, unknown>;

/**
 * Applies the preset ↔ custom cleanup for a change of `comparison_preset`.
 *
 * - If the new preset is `custom` and the old was standard: drop
 *   `period_offset`, set `time_window` to the defaults (only keys not already
 *   present are filled, so a user's existing `time_window` values win).
 * - If the new preset is standard and the old was `custom`: drop `time_window`,
 *   set `period_offset` to `-1`.
 * - Same-family changes (standard→standard, custom→custom) are a no-op apart
 *   from setting the preset itself.
 *
 * Every other key is copied through unchanged. Pure.
 */
export function applyPresetSwitch(
  base: CardConfig,
  newPreset: ComparisonMode
): CardConfig {
  const oldPreset = base.comparison_preset;
  const out: ConfigRecord = { ...(base as ConfigRecord) };
  out.comparison_preset = newPreset;

  const oldIsCustom = oldPreset === "custom";
  const newIsCustom = newPreset === "custom";

  if (oldIsCustom && !newIsCustom) {
    // custom → standard: remove time_window, restore period_offset.
    delete out.time_window;
    out.period_offset = STANDARD_PERIOD_OFFSET_DEFAULT;
  } else if (!oldIsCustom && newIsCustom) {
    // standard → custom: remove period_offset, initialize time_window.
    delete out.period_offset;
    const existing = out.time_window;
    const existingRecord =
      existing !== null && typeof existing === "object" && !Array.isArray(existing)
        ? (existing as ConfigRecord)
        : {};
    out.time_window = {
      ...CUSTOM_TIME_WINDOW_DEFAULTS,
      ...existingRecord
    };
  }

  return out as CardConfig;
}
