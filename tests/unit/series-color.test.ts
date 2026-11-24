import "../helpers/setup-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  EH_SERIES_DEFAULT_FALLBACK,
  isPaintableColor,
  resolveSeriesCurrentColor
} from "../../src/card/series-color";

/**
 * jsdom does not compute custom properties on getComputedStyle; mirror minimal behavior for tests.
 */
function installComputedStyleMock() {
  const impl = (el: Element) => {
    const html = el as HTMLElement;
    return {
      getPropertyValue(prop: string) {
        let v = html.style.getPropertyValue(prop).trim();
        if (prop === "--eh-color-resolve" && v.startsWith("var(")) {
          const m = /^var\(\s*([^),]+)\s*\)/.exec(v);
          if (m) {
            const name = m[1]!.trim();
            if (name.startsWith("--")) {
              v = html.style.getPropertyValue(name).trim();
            }
          }
        }
        return v;
      }
    } as unknown as CSSStyleDeclaration;
  };
  const prior = globalThis.getComputedStyle;
  // vitest/jsdom: `globalThis.getComputedStyle` may be missing though `window` has it
  globalThis.getComputedStyle = impl as typeof globalThis.getComputedStyle;
  return () => {
    if (prior) {
      globalThis.getComputedStyle = prior;
    } else {
      Reflect.deleteProperty(globalThis, "getComputedStyle");
    }
  };
}

describe("resolveSeriesCurrentColor", () => {
  let host: HTMLDivElement;
  let restoreComputed: () => void;

  beforeEach(() => {
    restoreComputed = installComputedStyleMock();
  });

  afterEach(() => {
    restoreComputed();
    host?.remove();
  });

  function makeHost(): HTMLDivElement {
    const el = document.createElement("div");
    document.body.appendChild(el);
    return el;
  }

  it("empty config uses --eh-series-current when set on host", () => {
    host = makeHost();
    host.style.setProperty("--eh-series-current", "#aabbcc");
    expect(resolveSeriesCurrentColor(host, "")).toBe("#aabbcc");
    expect(resolveSeriesCurrentColor(host, undefined)).toBe("#aabbcc");
    expect(resolveSeriesCurrentColor(host, "   ")).toBe("#aabbcc");
  });

  it("empty config falls back to Figma default when token missing", () => {
    host = makeHost();
    expect(resolveSeriesCurrentColor(host, "")).toBe(EH_SERIES_DEFAULT_FALLBACK);
  });

  it("ha-accent prefers --accent-color then --primary-color", () => {
    host = makeHost();
    host.style.setProperty("--eh-series-current", "#111111");
    host.style.setProperty("--primary-color", "#222222");
    host.style.setProperty("--accent-color", "#333333");
    expect(resolveSeriesCurrentColor(host, "ha-accent")).toBe("#333333");
    expect(resolveSeriesCurrentColor(host, "HA-PRIMARY-ACCENT")).toBe("#333333");
    host.style.removeProperty("--accent-color");
    expect(resolveSeriesCurrentColor(host, "ha-accent")).toBe("#222222");
  });

  it("ha-primary prefers --primary-color then --accent-color", () => {
    host = makeHost();
    host.style.setProperty("--eh-series-current", "#111111");
    host.style.setProperty("--accent-color", "#444444");
    host.style.setProperty("--primary-color", "#555555");
    expect(resolveSeriesCurrentColor(host, "ha-primary")).toBe("#555555");
    host.style.removeProperty("--primary-color");
    expect(resolveSeriesCurrentColor(host, "Ha-Primary")).toBe("#444444");
  });

  it("resolves var(--accent-color) via temporary custom property", () => {
    host = makeHost();
    host.style.setProperty("--accent-color", "rgb(10, 20, 30)");
    expect(resolveSeriesCurrentColor(host, "var(--accent-color)")).toBe(
      "rgb(10, 20, 30)"
    );
  });

  it("empty resolved value falls back to token then default", () => {
    host = makeHost();
    host.style.setProperty("--eh-series-current", "#999999");
    expect(resolveSeriesCurrentColor(host, "var(--missing-token)")).toBe(
      "#999999"
    );
    host.style.removeProperty("--eh-series-current");
    expect(resolveSeriesCurrentColor(host, "var(--missing-token)")).toBe(
      EH_SERIES_DEFAULT_FALLBACK
    );
  });

  it("plain hex passes through resolution", () => {
    host = makeHost();
    expect(resolveSeriesCurrentColor(host, "#e53935")).toBe("#e53935");
  });

  // Mirrors HA frontend `compute-color.ts`: the 25 picker THEME_COLORS plus
  // the 3 YAML-only names. A missing entry here would render presets in the
  // default color instead of the theme palette.
  const HA_THEME_TOKENS = [
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
    "primary-text",
    "secondary-text",
    "disabled"
  ];

  it.each(HA_THEME_TOKENS)(
    "resolves the color-picker preset %s to its --<name>-color theme variable",
    (token) => {
      host = makeHost();
      host.style.setProperty(`--${token}-color`, "#03a9f4");
      expect(resolveSeriesCurrentColor(host, token)).toBe("#03a9f4");
    }
  );

  it("resolves the disabled preset to --disabled-text-color when --disabled-color is unset", () => {
    host = makeHost();
    host.style.setProperty("--disabled-text-color", "#666677");
    expect(resolveSeriesCurrentColor(host, "disabled")).toBe("#666677");
  });

  it("falls back to --eh-series-current then default when a preset's variable is unset", () => {
    host = makeHost();
    host.style.setProperty("--eh-series-current", "#999999");
    expect(resolveSeriesCurrentColor(host, "primary")).toBe("#999999");
    host.style.removeProperty("--eh-series-current");
    expect(resolveSeriesCurrentColor(host, "primary")).toBe(
      EH_SERIES_DEFAULT_FALLBACK
    );
  });

  it("free-text picker values (hex, rgb/rgba) pass through unchanged", () => {
    host = makeHost();
    expect(resolveSeriesCurrentColor(host, "#aabbcc")).toBe("#aabbcc");
    expect(resolveSeriesCurrentColor(host, "#abc")).toBe("#abc");
    expect(resolveSeriesCurrentColor(host, "rgb(1, 2, 3)")).toBe("rgb(1, 2, 3)");
    expect(resolveSeriesCurrentColor(host, "rgba(1, 2, 3, 0.4)")).toBe(
      "rgba(1, 2, 3, 0.4)"
    );
  });

  it("falls back to the brand default for values unparseable as CSS", () => {
    host = makeHost();
    expect(resolveSeriesCurrentColor(host, "primry")).toBe(
      EH_SERIES_DEFAULT_FALLBACK
    );
    expect(resolveSeriesCurrentColor(host, "light-bluee")).toBe(
      EH_SERIES_DEFAULT_FALLBACK
    );
    expect(resolveSeriesCurrentColor(host, "not-a-color")).toBe(
      EH_SERIES_DEFAULT_FALLBACK
    );
  });
});

describe("isPaintableColor", () => {
  it("rejects theme token names and unparseable strings", () => {
    expect(isPaintableColor("primary")).toBe(false);
    expect(isPaintableColor("light-blue")).toBe(false);
    expect(isPaintableColor("not-a-color")).toBe(false);
    expect(isPaintableColor("")).toBe(false);
  });

  it("accepts the shapes the card produces (hex, rgb/rgba)", () => {
    expect(isPaintableColor("#aabbcc")).toBe(true);
    expect(isPaintableColor("#abc")).toBe(true);
    expect(isPaintableColor("#aabbccdd")).toBe(true);
    expect(isPaintableColor("rgb(1, 2, 3)")).toBe(true);
    expect(isPaintableColor("rgba(1, 2, 3, 0.4)")).toBe(true);
  });
});
