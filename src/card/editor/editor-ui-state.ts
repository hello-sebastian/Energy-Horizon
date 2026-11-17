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
  /**
   * Per-section expansion. `general` and `time` default to `true`; the rest
   * (`panels`, `formatting`, `chart`, `style`, `diagnostics`) to `false`.
   */
  expanded: Record<SectionId, boolean>;
  /** Registry `key` of the last focused text/number field. */
  lastFocusedField?: string;
  /** Caret offset within that field. */
  lastCaret?: number;
  /** `scrollTop` of the editor scroll container. */
  scrollAnchor?: number;
}

/**
 * The default UI state: `general` and `time` expanded, the remaining sections
 * collapsed (FR-908-E, User Story 4). No focus or scroll anchor yet.
 */
export function defaultUiState(): EditorUiState {
  return {
    expanded: {
      general: true,
      time: true,
      panels: false,
      formatting: false,
      chart: false,
      style: false,
      diagnostics: false
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

// -------------------------------------------------------------------------
// Post-render restore decision (FR-908-K/L/M, 911/TD-12)
// -------------------------------------------------------------------------

/**
 * The pure restore decision for the next render: which field to focus, which
 * caret to set, and which scroll position to restore.
 */
export interface RestoreTargets {
  /** Registry `key` of the field to focus, or undefined (no focus leg). */
  focusTarget?: string;
  /** Caret offset within that field (`0` is a valid caret). */
  caret?: number;
  /** `scrollTop` for the scroll container (`0` is a valid anchor). */
  scrollTop?: number;
}

/**
 * Decides what to restore after the next render. The focus leg applies only
 * when a focus restore is **pending** (a passive re-render must not steal
 * focus from wherever the user is); the scroll leg always applies. Pure.
 */
export function restoreTargets(
  state: EditorUiState,
  pendingFocusRestore: boolean
): RestoreTargets {
  return {
    focusTarget: pendingFocusRestore ? state.lastFocusedField : undefined,
    caret: pendingFocusRestore ? state.lastCaret : undefined,
    scrollTop: state.scrollAnchor
  };
}

/**
 * The minimal DOM surface the restore applier needs. Injected so the
 * decision stays pure and unit-testable without a real DOM (911/TD-12).
 */
export interface RestoreDom {
  /** Finds the field's input element by registry `key`, or null. */
  findFieldInput(field: string): HTMLInputElement | null;
  /** Finds the scroll container, or null. */
  findScrollContainer(): HTMLElement | null;
  /** True when the given element is the document's active element. */
  activeElementIs(el: HTMLInputElement): boolean;
}

/**
 * Applies a restore decision to the DOM. The focus leg is best-effort
 * (FR-908-L): a missing element, an already-focused element, or a
 * `setSelectionRange` failure is silently tolerated. The scroll leg runs
 * even when the field lookup fails.
 */
export function applyRestoreTargets(
  dom: RestoreDom,
  targets: RestoreTargets
): void {
  if (targets.focusTarget !== undefined) {
    const el = dom.findFieldInput(targets.focusTarget);
    if (el !== null) {
      if (!dom.activeElementIs(el)) {
        el.focus();
      }
      if (targets.caret !== undefined) {
        try {
          el.setSelectionRange(targets.caret, targets.caret);
        } catch {
          // best-effort (FR-908-L)
        }
      }
    }
  }
  if (targets.scrollTop !== undefined) {
    const container = dom.findScrollContainer();
    if (container !== null) {
      container.scrollTop = targets.scrollTop;
    }
  }
}
