import { describe, it, expect } from "vitest";
import {
  defaultUiState,
  withExpanded,
  withFocus,
  withScroll,
  reapplyAfterRender,
  restoreTargets,
  applyRestoreTargets,
  type EditorUiState,
  type RestoreDom
} from "../../src/card/editor/editor-ui-state";

describe("EditorUiState (data-model.md §5, research R4)", () => {
  it("defaults: general+time expanded, the rest collapsed", () => {
    const s = defaultUiState();
    expect(s.expanded.general).toBe(true);
    expect(s.expanded.time).toBe(true);
    expect(s.expanded.panels).toBe(false);
    expect(s.expanded.formatting).toBe(false);
    expect(s.expanded.chart).toBe(false);
    expect(s.expanded.style).toBe(false);
    expect(s.expanded.diagnostics).toBe(false);
    expect(s.lastFocusedField).toBeUndefined();
    expect(s.lastCaret).toBeUndefined();
    expect(s.scrollAnchor).toBeUndefined();
  });

  it("withExpanded toggles a single section without touching others", () => {
    let s = defaultUiState();
    s = withExpanded(s, "panels", true);
    expect(s.expanded.panels).toBe(true);
    expect(s.expanded.general).toBe(true);
    expect(s.expanded.time).toBe(true);
    // Collapsing again.
    s = withExpanded(s, "panels", false);
    expect(s.expanded.panels).toBe(false);
  });

  it("withExpanded does not mutate the input state", () => {
    const before = defaultUiState();
    const snapshot = JSON.parse(JSON.stringify(before));
    withExpanded(before, "style", true);
    expect(before).toEqual(snapshot);
  });

  it("withFocus records field + caret and clears on undefined", () => {
    let s = defaultUiState();
    s = withFocus(s, "title", 5);
    expect(s.lastFocusedField).toBe("title");
    expect(s.lastCaret).toBe(5);
    s = withFocus(s, undefined);
    expect(s.lastFocusedField).toBeUndefined();
    expect(s.lastCaret).toBeUndefined();
  });

  it("withScroll records the scroll anchor", () => {
    const s = withScroll(defaultUiState(), 123);
    expect(s.scrollAnchor).toBe(123);
  });

  it("state survives a simulated setConfig re-render (never derived from config)", () => {
    let s = defaultUiState();
    s = withExpanded(s, "time", true);
    s = withExpanded(s, "formatting", true);
    s = withFocus(s, "title", 7);
    s = withScroll(s, 42);

    // A passive re-render re-applies the exact same presentation state.
    const after = reapplyAfterRender(s);
    expect(after.expanded).toEqual(s.expanded);
    expect(after.lastFocusedField).toBe("title");
    expect(after.lastCaret).toBe(7);
    expect(after.scrollAnchor).toBe(42);

    // Re-applying is idempotent.
    expect(reapplyAfterRender(after)).toEqual(after);
  });

  it("a config change does not reset the UI state (the core lifecycle fix)", () => {
    // Build a state with non-default presentation.
    let s: EditorUiState = defaultUiState();
    s = withExpanded(s, "style", true);
    s = withFocus(s, "language", 3);

    // Simulate: setConfig() re-renders with a *different* config object, but
    // the UI state is re-applied verbatim (it is never derived from config).
    const reRendered = reapplyAfterRender(s);
    expect(reRendered.expanded.style).toBe(true);
    expect(reRendered.lastFocusedField).toBe("language");
    expect(reRendered.lastCaret).toBe(3);
  });
});

describe("restore decision (FR-908-K/L/M, 911/TD-12)", () => {
  it("pending focus restore → focusTarget + caret from state; scroll always", () => {
    let s = defaultUiState();
    s = withFocus(s, "title", 7);
    s = withScroll(s, 42);
    expect(restoreTargets(s, true)).toEqual({
      focusTarget: "title",
      caret: 7,
      scrollTop: 42
    });
  });

  it("not pending → no focus leg (a passive re-render must not steal focus)", () => {
    let s = defaultUiState();
    s = withFocus(s, "title", 7);
    s = withScroll(s, 42);
    const t = restoreTargets(s, false);
    expect(t.focusTarget).toBeUndefined();
    expect(t.caret).toBeUndefined();
    expect(t.scrollTop).toBe(42); // the scroll leg always applies
  });

  it("caret 0 survives (0 is a valid caret, not falsy-coerced)", () => {
    const s = withFocus(defaultUiState(), "title", 0);
    expect(restoreTargets(s, true).caret).toBe(0);
  });

  it("scroll anchor 0 survives (0 is a valid anchor)", () => {
    const s = withScroll(defaultUiState(), 0);
    expect(restoreTargets(s, false).scrollTop).toBe(0);
  });

  it("no focus record → no focus leg even when pending", () => {
    const s = withScroll(defaultUiState(), 9);
    const t = restoreTargets(s, true);
    expect(t.focusTarget).toBeUndefined();
    expect(t.caret).toBeUndefined();
    expect(t.scrollTop).toBe(9);
  });
});

describe("applyRestoreTargets (FR-908-L, 911/TD-12)", () => {
  function makeFakeInput(opts: { caretThrows?: boolean } = {}) {
    return {
      focusCalls: 0,
      carets: [] as Array<[number, number]>,
      focus() {
        this.focusCalls += 1;
      },
      setSelectionRange(start: number, end: number) {
        if (opts.caretThrows) {
          throw new Error("not a real input");
        }
        this.carets.push([start, end]);
      }
    };
  }
  type FakeInput = ReturnType<typeof makeFakeInput>;
  const makeContainer = () => ({ scrollTop: 0 });

  it("restores focus + caret on the found field and scroll on the container", () => {
    const input = makeFakeInput();
    const container = makeContainer();
    const dom: RestoreDom = {
      findFieldInput: (f) => (f === "title" ? (input as unknown as HTMLInputElement) : null),
      findScrollContainer: () => container as unknown as HTMLElement,
      activeElementIs: () => false
    };
    applyRestoreTargets(dom, { focusTarget: "title", caret: 5, scrollTop: 99 });
    expect(input.focusCalls).toBe(1);
    expect(input.carets).toEqual([[5, 5]]);
    expect(container.scrollTop).toBe(99);
  });

  it("does not refocus an already-active element, but still sets the caret", () => {
    const input = makeFakeInput();
    const dom: RestoreDom = {
      findFieldInput: () => input as unknown as HTMLInputElement,
      findScrollContainer: () => null,
      activeElementIs: () => true
    };
    applyRestoreTargets(dom, { focusTarget: "title", caret: 3 });
    expect(input.focusCalls).toBe(0);
    expect(input.carets).toEqual([[3, 3]]);
  });

  it("a missing field is tolerated; the scroll leg still runs", () => {
    const container = makeContainer();
    const dom: RestoreDom = {
      findFieldInput: () => null,
      findScrollContainer: () => container as unknown as HTMLElement,
      activeElementIs: () => false
    };
    applyRestoreTargets(dom, {
      focusTarget: "nope",
      caret: 2,
      scrollTop: 17
    });
    expect(container.scrollTop).toBe(17);
  });

  it("a missing container skips the scroll leg silently", () => {
    const dom: RestoreDom = {
      findFieldInput: () => null,
      findScrollContainer: () => null,
      activeElementIs: () => false
    };
    expect(() => applyRestoreTargets(dom, { scrollTop: 10 })).not.toThrow();
  });

  it("a setSelectionRange failure is swallowed (best-effort, FR-908-L)", () => {
    const input = makeFakeInput({ caretThrows: true });
    const dom: RestoreDom = {
      findFieldInput: () => input as unknown as HTMLInputElement,
      findScrollContainer: () => null,
      activeElementIs: () => false
    };
    expect(() =>
      applyRestoreTargets(dom, { focusTarget: "title", caret: 4 })
    ).not.toThrow();
    expect(input.focusCalls).toBe(1); // the focus leg still ran
  });
});
