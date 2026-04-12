import type { HomeAssistant } from "../ha-types";
import type { CardConfig } from "./types";

type NumberFormat = "comma" | "decimal" | "language" | "system";

export interface ResolvedLocale {
  language: string;
  numberFormat: NumberFormat;
  timeZone: string;
}

type TranslationDictionary = Record<string, string>;

export const MISSING_TRANSLATION_KEY = "error.missing_translation";

export type LocalizeFunction = (
  _key: string,
  _vars?: Record<string, string | number>
) => string;

const FALLBACK_LANGUAGE = "en";

/**
 * All translation files under src/translations/*.json are loaded at build time.
 * Adding a new language requires only adding a new JSON file; no code changes.
 */
const translationModules = import.meta.glob<{ default: TranslationDictionary }>(
  "../translations/*.json",
  { eager: true }
);

const DICTIONARIES: Record<string, TranslationDictionary> = Object.create(null);
for (const path of Object.keys(translationModules)) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (match) {
    const lang = match[1];
    const mod = translationModules[path];
    const dict = mod?.default;
    if (dict && typeof dict === "object") {
      DICTIONARIES[lang] = dict;
    }
  }
}

const VALID_NUMBER_FORMATS: readonly NumberFormat[] = [
  "comma",
  "decimal",
  "language",
  "system"
];

function isValidNumberFormat(
  value: unknown
): value is NumberFormat {
  return (
    typeof value === "string" &&
    (VALID_NUMBER_FORMATS as readonly string[]).includes(value)
  );
}

function hasDictionary(language: string): boolean {
  return Object.prototype.hasOwnProperty.call(DICTIONARIES, language);
}

function interpolateTemplate(
  template: string,
  vars: Record<string, string | number> | undefined
): string {
  if (!vars) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

/**
 * Resolves language, number format, and time zone from HA and card config.
 * Handles missing or partial hass (e.g. during card init): returns safe defaults
 * (en, system, UTC) when hass is undefined.
 */
export function resolveLocale(
  hass: HomeAssistant | null | undefined,
  config: CardConfig
): ResolvedLocale {
  const configLanguage = config.language;
  const language: string =
    configLanguage !== undefined && configLanguage !== ""
      ? hasDictionary(configLanguage)
        ? configLanguage
        : (() => {
            if (config.debug) {
               
              console.warn(
                `[Energy Horizon] Unsupported config.language "${configLanguage}", falling back to "${FALLBACK_LANGUAGE}"`
              );
            }
            return FALLBACK_LANGUAGE;
          })()
      : hass?.locale?.language ||
        hass?.language ||
        FALLBACK_LANGUAGE;

  const configNumberFormat = config.number_format;
  const numberFormat: NumberFormat =
    configNumberFormat !== undefined
      ? isValidNumberFormat(configNumberFormat)
        ? configNumberFormat
        : (() => {
            if (config.debug) {
               
              console.warn(
                `[Energy Horizon] Invalid config.number_format "${String(configNumberFormat)}", falling back to "system"`
              );
            }
            return "system";
          })()
      : (hass?.locale?.number_format as NumberFormat | undefined) ?? "system";

  const timeZone =
    hass?.config?.time_zone ||
    // fall back to UTC if HA does not provide a time zone
    "UTC";

  return {
    language,
    numberFormat,
    timeZone
  };
}

export function numberFormatToLocale(
  numberFormat: NumberFormat,
  language: string
): string {
  switch (numberFormat) {
    case "comma":
      return "de";
    case "decimal":
      return "en";
    case "language":
      return language;
    case "system":
    default:
      return typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : language || FALLBACK_LANGUAGE;
  }
}

/**
 * Returns the untranslated template string for a key (same lookup order as
 * {@link createLocalize}). Used when UI must split on `{{placeholders}}` before
 * interpolating (e.g. wrapping values in emphasis spans).
 */
export function getRawTemplate(
  language: string,
  key: string
): string | undefined {
  const active =
    DICTIONARIES[language] ?? DICTIONARIES[FALLBACK_LANGUAGE] ?? {};
  const fallback = DICTIONARIES[FALLBACK_LANGUAGE] ?? {};

  let template = active[key];
  if (template === undefined) {
    template = fallback[key];
  }
  return template;
}

export function createLocalize(language: string): LocalizeFunction {
  const active =
    DICTIONARIES[language] ?? DICTIONARIES[FALLBACK_LANGUAGE] ?? {};
  const fallback = DICTIONARIES[FALLBACK_LANGUAGE] ?? {};

  return (key, vars) => {
    let template = active[key];

    if (template === undefined) {
      template = fallback[key];
    }

    if (template === undefined) {
      // As a safe fallback, return the key itself so the UI never renders
      // an empty string. The card can detect this and enter an error state.
      return key;
    }

    return interpolateTemplate(template, vars);
  };
}

