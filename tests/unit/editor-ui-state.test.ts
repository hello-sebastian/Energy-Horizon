import { describe, it, expect } from "vitest";
import {
  defaultUiState,
  withExpanded,
  withFocus,
  withScroll,
  reapplyAfterRender,
  type EditorUiState
} from "../../src/card/editor/editor-ui-state";

describe("EditorUiState (data-model.md §5, research R4)", () => {
  it("defaults: S1 (basic) expanded, S2–S6 collapsed", () => {
    const s = defaultUiState();
    expect(s.expanded.basic).toBe(true);
    expect(s.expanded.time).toBe(false);
    expect(s.expanded.layout).toBe(false);
    expect(s.expanded.visuals).toBe(false);
    expect(s.expanded.formatting).toBe(false);
    expect(s.expanded.system).toBe(false);
    expect(s.lastFocusedField).toBeUndefined();
    expect(s.lastCaret).toBeUndefined();
    expect(s.scrollAnchor).toBeUndefined();
  });

  it("withExpanded toggles a single section without touching others", () => {
    let s = defaultUiState();
    s = withExpanded(s, "time", true);
    expect(s.expanded.time).toBe(true);
    expect(s.expanded.basic).toBe(true);
    expect(s.expanded.layout).toBe(false);
    // Collapsing again.
    s = withExpanded(s, "time", false);
    expect(s.expanded.time).toBe(false);
  });

  it("withExpanded does not mutate the input state", () => {
    const before = defaultUiState();
    const snapshot = JSON.parse(JSON.stringify(before));
    withExpanded(before, "visuals", true);
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
    s = withExpanded(s, "visuals", true);
    s = withFocus(s, "language", 3);

    // Simulate: setConfig() re-renders with a *different* config object, but
    // the UI state is re-applied verbatim (it is never derived from config).
    const reRendered = reapplyAfterRender(s);
    expect(reRendered.expanded.visuals).toBe(true);
    expect(reRendered.lastFocusedField).toBe("language");
    expect(reRendered.lastCaret).toBe(3);
  });
});
