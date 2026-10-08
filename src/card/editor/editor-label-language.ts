import type { HomeAssistant } from "../../ha-types";
import type { CardConfig } from "../types";
import { resolveLocale } from "../localize";

/**
 * Full-Coverage Visual Editor (v1.2.0) — FR-908-X label language chain.
 *
 * The label language is recomputed from the **current** config on every render
 * (never cached from editor open):
 *   1. the card `language` field, if set (and a dictionary exists for it);
 *   2. else `hass.locale.language` (then `hass.language`);
 *   3. else the card's existing fallback (`en`).
 *
 * This reuses the card's own `resolveLocale` so the editor and the card always
 * agree on the language. HA `hass.localize` is deliberately NOT used (FR-908-U).
 * When the `language` field changes, the whole form re-labels live because the
 * editor re-runs this on each render.
 */
export function editorLabelLanguage(
  hass: HomeAssistant | null | undefined,
  config: CardConfig
): string {
  return resolveLocale(hass, config).language;
}
