/**
 * Pins the `Storage` alias in the manual DOM shim (tests/helpers/setup-dom.ts).
 *
 * The project runs Vitest in the `node` environment; the shim installs one
 * jsdom realm as the global DOM. Tests must never depend on Node builtin
 * globals: Node 26 exposes a native `Storage`, but CI's pinned Node 22 does
 * not — without the shim alias, `vi.spyOn(Storage.prototype, "setItem")`
 * (picker-preview-render, SC-006/FR-010) passes locally and fails on CI.
 * These two assertions lock the systemic fix in: the bare global `Storage`
 * must exist and be the SAME class `window.Storage` resolves to.
 */
import { describe, it, expect } from "vitest";
import "../helpers/setup-dom";

const g = globalThis as Record<string, unknown>;

describe("setup-dom shim: Storage global (bug ci-tests-failing)", () => {
  it("exposes a global Storage constructor", () => {
    expect(typeof g.Storage).toBe("function");
  });

  it("is the jsdom realm's Storage (same prototype window.Storage uses)", () => {
    const win = g.window as Record<string, unknown>;
    expect(g.Storage).toBe(win.Storage);
  });
});
