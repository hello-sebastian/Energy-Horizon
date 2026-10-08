import type { SectionId } from "./field-registry";

/**
 * Full-Coverage Visual Editor (v1.2.0) — config-independent presentation state
 * (data-model.md §5, research R4).
 *
 * `EditorUiState` is held as component-local Lit `@state` and is **never
 * derived from `config`**. On every `setConfig()` re-render the editor
 * re-applies this state (expanded flags, focus + caret, scroll) and emits
 * nothing (FR-908-J/K/L/M, SC-908-2). Only explicit user gestures mutate it.
 *
 * All helpers are pure: they return a new state object and never mutate the
 * input, which keeps them trivially unit-testable.
 */

export interface EditorUiState {
  /** Per-section expansion. S1 (`basic`) defaults to `true`; S2–S6 to `false`. */
  expanded: Record<SectionId, boolean>;
  /** Registry `key` of the last focused text/number field. */
  lastFocusedField?: string;
  /** Caret offset within that field. */
  lastCaret?: number;
  /** `scrollTop` of the editor scroll container. */
  scrollAnchor?: number;
}

/**
 * The default UI state: S1 (`basic`) expanded, S2–S6 collapsed (FR-908-E,
 * User Story 4). No focus or scroll anchor yet.
 */
export function defaultUiState(): EditorUiState {
  return {
    expanded: {
      basic: true,
      time: false,
      layout: false,
      visuals: false,
      formatting: false,
      system: false
    }
  };
}

/** Returns a new state with the given section's expansion toggled/set. */
export function withExpanded(
  state: EditorUiState,
  section: SectionId,
  value: boolean
): EditorUiState {
  return {
    ...state,
    expanded: { ...state.expanded, [section]: value }
  };
}

/**
 * Returns a new state recording the focused field + caret. Passing an
 * undefined field clears the focus record (e.g. on blur).
 */
export function withFocus(
  state: EditorUiState,
  field: string | undefined,
  caret?: number
): EditorUiState {
  if (field === undefined) {
    return { ...state, lastFocusedField: undefined, lastCaret: undefined };
  }
  return { ...state, lastFocusedField: field, lastCaret: caret };
}

/** Returns a new state recording the scroll anchor. */
export function withScroll(
  state: EditorUiState,
  anchor: number | undefined
): EditorUiState {
  return { ...state, scrollAnchor: anchor };
}

/**
 * Simulates a `setConfig()` re-render: the state is re-applied verbatim (it is
 * never derived from the config). Returns the same logical state — used by
 * tests to assert that presentation state survives a passive re-render.
 */
export function reapplyAfterRender(state: EditorUiState): EditorUiState {
  return {
    expanded: { ...state.expanded },
    lastFocusedField: state.lastFocusedField,
    lastCaret: state.lastCaret,
    scrollAnchor: state.scrollAnchor
  };
}
