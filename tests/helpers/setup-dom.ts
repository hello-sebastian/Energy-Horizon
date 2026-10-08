import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
const win = dom.window as unknown as Record<string, unknown>;

/**
 * Test-only DOM shim.
 *
 * The project runs Vitest in the `node` environment (no `test.environment` is
 * configured), so there is no DOM by default. This module installs a single
 * jsdom realm as the global DOM so that:
 *
 *  - Lit's `class ... extends HTMLElement` binds to the SAME realm as the
 *    document. Without this, `new LitElement()` produces a node from a
 *    different realm and `document.body.appendChild(...)` throws
 *    "parameter 1 is not of type 'Node'".
 *  - `document.createElement`, `customElements`, and the event constructors
 *    all resolve in one consistent realm.
 *
 * In the browser these globals already exist; this is a no-op there.
 */
const g = globalThis as Record<string, unknown>;

g.window = dom.window;
g.document = dom.window.document;
// Alias the custom-elements registry so module-scope `customElements.define`
// registers into the SAME registry the document uses to upgrade elements.
g.customElements = win.customElements;
// Structural node classes: aliasing `HTMLElement` (in particular) makes Lit's
// `class ... extends HTMLElement` bind to the jsdom realm, so `new LitElement()`
// produces a node that `document.body.appendChild(...)` accepts.
g.HTMLElement = win.HTMLElement;
g.Element = win.Element;
g.Node = win.Node;
// Event constructors + observers used by Lit / the editor at runtime.
g.CustomEvent = win.CustomEvent;
g.Event = win.Event;
g.FocusEvent = win.FocusEvent;
g.InputEvent = win.InputEvent;
g.KeyboardEvent = win.KeyboardEvent;
g.MutationObserver = win.MutationObserver;
g.getComputedStyle = win.getComputedStyle;

// IMPORTANT: do NOT alias `ShadowRoot`, `Document`, or `CSSStyleSheet`. Lit's
// `supportsAdoptingStyleSheets` gate (css-tag.js) is
//   `global.ShadowRoot && ... && 'adoptedStyleSheets' in Document.prototype
//    && 'replace' in CSSStyleSheet.prototype`.
// Leaving `global.ShadowRoot` undefined makes the gate short-circuit to false,
// so Lit uses the safe `<style>`-element path (which jsdom supports) instead of
// the `adoptedStyleSheets` path (which jsdom breaks mid-commit, aborting before
// event-part listeners are attached). `Document`/`CSSStyleSheet` are only
// referenced *after* the short-circuit, so they are never needed at load.

// jsdom does not implement requestAnimationFrame; shim with setTimeout so any
// rAF-based scheduling (and Lit's `updateComplete`) resolves in tests.
if (typeof g.requestAnimationFrame === "undefined") {
  g.requestAnimationFrame = (cb: (t: number) => void) =>
    setTimeout(() => cb(Date.now()), 0);
  g.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

// jsdom does not implement ResizeObserver; the ECharts renderer constructs one
// in `updated()`. Provide a no-op so upgraded Lit elements don't crash.
if (typeof g.ResizeObserver === "undefined") {
  g.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

