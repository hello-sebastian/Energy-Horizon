/**
 * T014 — User Story 2: Edit without losing UI state across re-renders.
 *
 * Asserts (spec US2 acceptance, SC-908-2, SC-908-3):
 * 1. A passive `setConfig` re-render dispatches **zero** `config-changed`
 *    (SC-908-3, FR-908-N).
 * 2. After a re-render, the expanded sections, focus + caret of the typed
 *    field, and scroll position are all preserved (SC-908-2, FR-908-J/K/L/M).
 * 3. A **≥ 20 mixed-edit session** (text typing, switch toggles, select
 *    changes, section expand/collapse) produces zero unintended panel
 *    collapses, zero focus/caret losses in an actively-typed field, and zero
 *    scroll jumps (SC-908-2).
 *
 * jsdom notes:
 *  - `ha-expansion-panel` is not defined, so the editor renders the `<div>`
 *    fallback; section toggles are driven by a `click` on the `.section-header`.
 *  - jsdom does not move `document.activeElement` into a shadow-DOM input, so
 *    focus/caret restoration (FR-908-K/L) is verified by spying on the field's
 *    `focus()` / `setSelectionRange()` calls.
 *  - jsdom has no layout, so `scrollTop` is always 0 by default; the scroll
 *    test replaces it with a property that records every write so the
 *    re-apply (FR-908-M) is observable.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import "../helpers/setup-dom";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfig, CardConfigInput } from "../../src/card/types";

type EditorEl = EnergyHorizonCardEditor & {
  setConfig: (c: CardConfigInput) => void;
  hass: HomeAssistant;
  updateComplete: Promise<boolean>;
};

function makeHass(): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states: {},
    connection: { sendMessagePromise: async () => ({}) }
  } as HomeAssistant;
}

function mountEditor(config: CardConfigInput): EditorEl {
  const el = new EnergyHorizonCardEditor() as EditorEl;
  el.hass = makeHass();
  document.body.appendChild(el);
  el.setConfig(config);
  return el;
}

function trackEmits(el: EditorEl): void {
  (el as unknown as { __emitted?: CardConfig[] }).__emitted = [];
  el.addEventListener("config-changed", (e) => {
    const detail = (e as CustomEvent).detail as { config: CardConfig };
    (el as unknown as { __emitted: CardConfig[] }).__emitted!.push(detail.config);
  });
}

function emittedConfigs(el: EditorEl): CardConfig[] {
  return (el as unknown as { __emitted?: CardConfig[] }).__emitted ?? [];
}

/** The section element for a given section id. */
function sectionFor(el: EditorEl, section: string): HTMLElement | null {
  return el.shadowRoot!.querySelector<HTMLElement>(`[data-section="${section}"]`);
}

/** Whether a section is currently expanded. */
function isExpanded(el: EditorEl, section: string): boolean {
  const s = sectionFor(el, section);
  return s?.dataset.expanded === "true";
}

/** Toggle a section's expansion (simulates the user clicking the panel header). */
function toggleSection(el: EditorEl, section: string): void {
  const s = sectionFor(el, section)!;
  const header = s.querySelector<HTMLElement>(".section-header")!;
  header.dispatchEvent(new Event("click", { bubbles: true }));
}

/**
 * Tracks writes to the `.sections` container's `scrollTop` so the test can
 * assert that a re-render re-applies the scroll anchor (FR-908-M).
 */
function trackScroll(container: HTMLElement): {
  simulateUserScroll: (v: number) => void;
  restoreWrites: number[];
} {
  let current = 0;
  const restoreWrites: number[] = [];
  Object.defineProperty(container, "scrollTop", {
    configurable: true,
    get() {
      return current;
    },
    set(v: number) {
      current = v;
      restoreWrites.push(v);
    }
  });
  return {
    simulateUserScroll: (v: number) => {
      current = v;
    },
    restoreWrites
  };
}

const BASE: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy",
  title: "Energy"
};

const ALL_SECTIONS = [
  "basic",
  "time",
  "layout",
  "visuals",
  "formatting",
  "system"
] as const;

describe("editor lifecycle (T014, US2)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("a passive setConfig re-render dispatches zero config-changed (SC-908-3)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);

    // A passive re-render with an equivalent config must not emit.
    el.setConfig({ ...BASE });
    await el.updateComplete;
    expect(emittedConfigs(el).length).toBe(0);
  });

  it("expanded sections survive a re-render (SC-908-2, FR-908-J)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;

    // Expand two sections (time + visuals).
    toggleSection(el, "time");
    await el.updateComplete;
    toggleSection(el, "visuals");
    await el.updateComplete;
    expect(isExpanded(el, "time")).toBe(true);
    expect(isExpanded(el, "visuals")).toBe(true);

    // A passive re-render must not collapse them.
    el.setConfig({ ...BASE });
    await el.updateComplete;
    expect(isExpanded(el, "time")).toBe(true);
    expect(isExpanded(el, "visuals")).toBe(true);
    // basic stays expanded (default).
    expect(isExpanded(el, "basic")).toBe(true);
  });

  it("focus + caret of the typed field survive a re-render (SC-908-2, FR-908-K/L)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;

    const title = el.shadowRoot!.querySelector<HTMLInputElement>("#eh-field-title")!;
    title.focus();
    await el.updateComplete;

    // Type a new value and place the caret at the end.
    title.value = "Renamed";
    title.setSelectionRange(7, 7);
    title.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;

    // jsdom does not move `document.activeElement` into a shadow-DOM input, so
    // the restore effect (FR-908-K/L) is verified by observing the `focus()` /
    // `setSelectionRange()` calls it makes on the field.
    const focusSpy = vi.spyOn(title, "focus");
    const caretSpy = vi.spyOn(title, "setSelectionRange");

    // A passive re-render (self-echo of the new value).
    el.setConfig({ ...BASE, title: "Renamed" });
    await el.updateComplete;

    // The restore effect re-focused the field and re-applied the caret at the
    // typed position; the displayed value is not reset.
    expect(focusSpy).toHaveBeenCalled();
    expect(caretSpy).toHaveBeenCalledWith(7, 7);
    expect(title.value).toBe("Renamed");
  });

  it("scroll position survives a re-render (SC-908-2, FR-908-M)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector<HTMLElement>(".sections")!;
    const track = trackScroll(container);

    // Simulate the user scrolling to 120px.
    track.simulateUserScroll(120);
    container.dispatchEvent(new Event("scroll"));
    await el.updateComplete;

    // A passive re-render must re-apply the scroll anchor.
    el.setConfig({ ...BASE });
    await el.updateComplete;

    // The restore effect wrote the scroll anchor back to the container.
    expect(track.restoreWrites).toContain(120);
  });

  it("a ≥ 20 mixed-edit session loses no UI state (SC-908-2)", async () => {
    const el = mountEditor(BASE);
    await el.updateComplete;
    trackEmits(el);

    const container = el.shadowRoot!.querySelector<HTMLElement>(".sections")!;
    const track = trackScroll(container);
    track.simulateUserScroll(80);
    container.dispatchEvent(new Event("scroll"));
    await el.updateComplete;

    // The sections the user has expanded (must stay expanded).
    const userExpanded = new Set<string>(["basic"]);

    // Spies on the actively-typed field's focus()/setSelectionRange() so the
    // passive re-render's restore effect (FR-908-K/L) is observable. jsdom does
    // not move `document.activeElement` into a shadow-DOM input, so the restore
    // is verified by observing the calls it makes on the field.
    let focusSpy: ReturnType<typeof vi.spyOn> | null = null;
    let caretSpy: ReturnType<typeof vi.spyOn> | null = null;
    let lastTypedCaret: number | null = null;

    /**
     * Flushes any pending debounce (so the edit's emit happens), then simulates
     * HA echoing back the last-emitted config (a passive re-render), and
     * asserts the passive re-render emits nothing (SC-908-3), collapses no
     * panel, jumps no scroll, and re-focuses the actively-typed field
     * (SC-908-2).
     */
    const reRender = async (): Promise<void> => {
      vi.advanceTimersByTime(300);
      await el.updateComplete;
      const emitCountBefore = emittedConfigs(el).length;
      const lastEmitted = emittedConfigs(el).at(-1);
      if (lastEmitted) {
        el.setConfig(lastEmitted);
        await el.updateComplete;
      }
      // The passive re-render must not emit (SC-908-3).
      expect(emittedConfigs(el).length).toBe(emitCountBefore);
      // No unintended panel collapses.
      for (const section of ALL_SECTIONS) {
        const expected = userExpanded.has(section);
        expect(
          isExpanded(el, section),
          `section ${section} should be ${expected ? "expanded" : "collapsed"}`
        ).toBe(expected);
      }
      // No scroll jump (the anchor is re-applied).
      expect(track.restoreWrites).toContain(80);
      // The actively-typed field keeps focus + caret across the passive
      // re-render (SC-908-2, FR-908-K/L).
      if (focusSpy && caretSpy && lastTypedCaret !== null) {
        expect(focusSpy).toHaveBeenCalled();
        expect(caretSpy).toHaveBeenCalledWith(lastTypedCaret, lastTypedCaret);
        focusSpy.mockClear();
        caretSpy.mockClear();
      }
    };

    const typeText = async (
      key: string,
      value: string,
      caret: number
    ): Promise<void> => {
      const input = el.shadowRoot!.querySelector<HTMLInputElement>(
        `#eh-field-${key.replace(/\./g, "-")}`
      )!;
      input.focus();
      input.value = value;
      input.setSelectionRange(caret, caret);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await el.updateComplete;
      // Spy on the (reused) input node so the passive re-render's restore
      // effect is observable. The edit's own re-render already ran before the
      // spies are attached, so they start clean.
      focusSpy = vi.spyOn(input, "focus");
      caretSpy = vi.spyOn(input, "setSelectionRange");
      // Use the actual (possibly clamped) caret so the expectation matches
      // what the editor recorded (jsdom clamps a caret past the value length).
      lastTypedCaret = input.selectionStart ?? caret;
    };

    const toggleSwitch = async (key: string): Promise<void> => {
      const input = el.shadowRoot!.querySelector<HTMLInputElement>(
        `#eh-field-${key}`
      )!;
      input.checked = !input.checked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await el.updateComplete;
    };

    const changeSelect = async (key: string, value: string): Promise<void> => {
      const select = el.shadowRoot!.querySelector<HTMLSelectElement>(
        `#eh-field-${key}`
      )!;
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      await el.updateComplete;
    };

    // --- 22 mixed edits ---
    // 1. Expand "time".
    toggleSection(el, "time");
    userExpanded.add("time");
    await el.updateComplete;
    await reRender();

    // 2. Expand "visuals".
    toggleSection(el, "visuals");
    userExpanded.add("visuals");
    await el.updateComplete;
    await reRender();

    // 3. Expand "layout".
    toggleSection(el, "layout");
    userExpanded.add("layout");
    await el.updateComplete;
    await reRender();

    // 4. Expand "formatting".
    toggleSection(el, "formatting");
    userExpanded.add("formatting");
    await el.updateComplete;
    await reRender();

    // 5. Type in title (text, basic).
    await typeText("title", "Energy v2", 9);
    await reRender();

    // 6. Toggle show_title (switch, basic).
    await toggleSwitch("show_title");
    await reRender();

    // 7. Change comparison_preset (select, basic).
    await changeSelect("comparison_preset", "month_over_month");
    await reRender();

    // 8. Type in x_axis_format (text, formatting).
    await typeText("x_axis_format", "dd LLL", 7);
    await reRender();

    // 9. Toggle show_forecast (switch, layout).
    await toggleSwitch("show_forecast");
    await reRender();

    // 10. Change interpretation (select, basic).
    await changeSelect("interpretation", "production");
    await reRender();

    // 11. Type in tooltip_format (text, formatting).
    await typeText("tooltip_format", "HH:mm", 5);
    await reRender();

    // 12. Toggle show_legend (switch, visuals).
    await toggleSwitch("show_legend");
    await reRender();

    // 13. Change aggregation (select, time).
    await changeSelect("aggregation", "week");
    await reRender();

    // 14. Type in title again (text, basic).
    await typeText("title", "Energy v3", 10);
    await reRender();

    // 15. Toggle show_icon (switch, basic).
    await toggleSwitch("show_icon");
    await reRender();

    // 16. Change number_format (select, formatting).
    await changeSelect("number_format", "comma");
    await reRender();

    // 17. Type in language (text, formatting).
    await typeText("language", "pl", 2);
    await reRender();

    // 18. Toggle show_narrative_comment (switch, layout).
    await toggleSwitch("show_narrative_comment");
    await reRender();

    // 19. Change force_prefix (select, formatting).
    await changeSelect("force_prefix", "k");
    await reRender();

    // 20. Type in title again (text, basic).
    await typeText("title", "Energy v4", 10);
    await reRender();

    // 21. Toggle fill_current (switch, visuals).
    await toggleSwitch("fill_current");
    await reRender();

    // 22. Collapse "time".
    toggleSection(el, "time");
    userExpanded.delete("time");
    await el.updateComplete;
    await reRender();

    // Final: flush any remaining debounce; the session must have produced no
    // spurious panel collapses, focus/caret losses, or scroll jumps (asserted
    // after every edit above).
    vi.advanceTimersByTime(300);
    await el.updateComplete;
  });
});
