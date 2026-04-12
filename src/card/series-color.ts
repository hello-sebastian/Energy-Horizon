/**
 * Resolves the current-series paint color (line, fill, swatch) for ECharts and theme injection.
 * Default follows Figma `colors/accent/ehorizon`; YAML `primary_color` overrides.
 */

/** Figma `colors/accent/ehorizon` when token `--eh-series-current` is unset. */
export const EH_SERIES_DEFAULT_FALLBACK = "#119894";

const COLOR_RESOLVE_PROP = "--eh-color-resolve";

const HA_ACCENT_ALIASES = new Set(["ha-accent", "ha-primary-accent"]);
const HA_PRIMARY_ALIASES = new Set(["ha-primary"]);

function readCssVar(host: HTMLElement, name: string): string {
  if (typeof globalThis.getComputedStyle !== "function") {
    return "";
  }
  return globalThis.getComputedStyle(host).getPropertyValue(name).trim();
}

function firstNonEmpty(...vals: string[]): string {
  for (const v of vals) {
    if (v) {
      return v;
    }
  }
  return "";
}

/**
 * @param host Card root (`:host` / `ha-card`) for `getComputedStyle` and HA theme variables.
 * @param primaryColorFromConfig Raw `primary_color` from Lovelace YAML (may be empty).
 */
export function resolveSeriesCurrentColor(
  host: HTMLElement,
  primaryColorFromConfig: string | undefined
): string {
  const raw = (primaryColorFromConfig ?? "").trim();
  if (!raw) {
    return firstNonEmpty(
      readCssVar(host, "--eh-series-current"),
      EH_SERIES_DEFAULT_FALLBACK
    );
  }

  const key = raw.toLowerCase();
  if (HA_ACCENT_ALIASES.has(key)) {
    return firstNonEmpty(
      readCssVar(host, "--accent-color"),
      readCssVar(host, "--primary-color"),
      readCssVar(host, "--eh-series-current"),
      EH_SERIES_DEFAULT_FALLBACK
    );
  }
  if (HA_PRIMARY_ALIASES.has(key)) {
    return firstNonEmpty(
      readCssVar(host, "--primary-color"),
      readCssVar(host, "--accent-color"),
      readCssVar(host, "--eh-series-current"),
      EH_SERIES_DEFAULT_FALLBACK
    );
  }

  const prev = host.style.getPropertyValue(COLOR_RESOLVE_PROP);
  host.style.setProperty(COLOR_RESOLVE_PROP, raw);
  let resolved = "";
  if (typeof globalThis.getComputedStyle === "function") {
    resolved = globalThis
      .getComputedStyle(host)
      .getPropertyValue(COLOR_RESOLVE_PROP)
      .trim();
  }
  if (prev) {
    host.style.setProperty(COLOR_RESOLVE_PROP, prev);
  } else {
    host.style.removeProperty(COLOR_RESOLVE_PROP);
  }

  if (resolved) {
    return resolved;
  }
  return firstNonEmpty(
    readCssVar(host, "--eh-series-current"),
    EH_SERIES_DEFAULT_FALLBACK
  );
}
