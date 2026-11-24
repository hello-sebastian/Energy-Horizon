/**
 * Resolves the current-series paint color (line, fill, swatch) for ECharts and theme injection.
 * Default follows Figma `colors/accent/ehorizon`; YAML `primary_color` overrides.
 */

/** Figma `colors/accent/ehorizon` when token `--eh-series-current` is unset. */
export const EH_SERIES_DEFAULT_FALLBACK = "#119894";

const COLOR_RESOLVE_PROP = "--eh-color-resolve";

const HA_ACCENT_ALIASES = new Set(["ha-accent", "ha-primary-accent"]);
const HA_PRIMARY_ALIASES = new Set(["ha-primary"]);

/**
 * HA `ha-color-picker` presets emit HA theme-color token names (HA frontend
 * `compute-color.ts`: 25 picker `THEME_COLORS` + 3 YAML-only), not CSS colors
 * — e.g. `primary` or `light-blue`. They resolve to `--<name>-color` theme
 * variables, mirroring HA's own `computeCssColor`.
 */
const HA_THEME_TOKENS = new Set([
  "primary",
  "accent",
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "light-grey",
  "grey",
  "dark-grey",
  "blue-grey",
  "black",
  "white",
  // HA YAML-only theme colors (same `--<name>-color` contract).
  "primary-text",
  "secondary-text",
  "disabled"
]);

const HEX_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE =
  /^(?:rgb|rgba)\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;

/**
 * Whether `value` is a CSS color the canvas can paint (and `CanvasGradient`'s
 * `addColorStop` accepts). Browsers use `CSS.supports`; non-browser
 * environments (jsdom has no `window.CSS`) accept the shapes this card
 * legitimately produces (hex, `rgb()`/`rgba()`). Known divergence: CSS named
 * colors (e.g. `lightblue`) are paintable in browsers, not in tests.
 */
export function isPaintableColor(value: string): boolean {
  const v = value.trim();
  if (!v) {
    return false;
  }
  if (
    typeof globalThis.CSS !== "undefined" &&
    typeof globalThis.CSS.supports === "function"
  ) {
    return globalThis.CSS.supports("color", v);
  }
  return HEX_RE.test(v) || RGB_RE.test(v);
}

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

function defaultChain(host: HTMLElement): string {
  return firstNonEmpty(
    readCssVar(host, "--eh-series-current"),
    EH_SERIES_DEFAULT_FALLBACK
  );
}

function resolveRaw(
  host: HTMLElement,
  primaryColorFromConfig: string | undefined
): string {
  const raw = (primaryColorFromConfig ?? "").trim();
  if (!raw) {
    return defaultChain(host);
  }

  const key = raw.toLowerCase();
  if (HA_ACCENT_ALIASES.has(key)) {
    return firstNonEmpty(
      readCssVar(host, "--accent-color"),
      readCssVar(host, "--primary-color"),
      defaultChain(host)
    );
  }
  if (HA_PRIMARY_ALIASES.has(key)) {
    return firstNonEmpty(
      readCssVar(host, "--primary-color"),
      readCssVar(host, "--accent-color"),
      defaultChain(host)
    );
  }

  // Color-picker preset: resolve the token to the theme's palette variable
  // (what the picker swatch shows), then to the card defaults.
  if (HA_THEME_TOKENS.has(key)) {
    const vars =
      key === "disabled"
        ? ["--disabled-color", "--disabled-text-color"] // HA defines --disabled-text-color
        : [`--${key}-color`];
    for (const name of vars) {
      const value = readCssVar(host, name);
      if (value) {
        return value;
      }
    }
    return defaultChain(host);
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
  return defaultChain(host);
}

/**
 * @param host Card root (`:host` / `ha-card`) for `getComputedStyle` and HA theme variables.
 * @param primaryColorFromConfig Raw `primary_color` from Lovelace YAML (may be empty;
 * HA color-picker presets such as `primary`/`light-blue`, hex, `rgb()`, `var(--…)`).
 * @returns Always a paintable color: a value unparseable as CSS (typo, unknown
 * name, broken theme) falls back to the brand default so the canvas — and
 * specifically `addColorStop`, which throws on unparseable input — never
 * receives it.
 */
export function resolveSeriesCurrentColor(
  host: HTMLElement,
  primaryColorFromConfig: string | undefined
): string {
  const resolved = resolveRaw(host, primaryColorFromConfig);
  return isPaintableColor(resolved) ? resolved : EH_SERIES_DEFAULT_FALLBACK;
}
