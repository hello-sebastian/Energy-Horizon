/**
 * T018 — User Story 4: Progressive disclosure through sections (FR-908-E/F).
 *
 * Asserts (spec US4 acceptance 1–4):
 * 1. The seven sections render in the fixed order
 *    `general → time → panels → formatting → chart → style → diagnostics`,
 *    with `general` and `time` expanded and the rest collapsed by default.
 * 2. Expanding "Formatting & Localization" shows exactly `language`,
 *    `force_prefix`, `number_format`, `precision`, `x_axis_format`,
 *    `tooltip_format`.
 * 3. Expanding "Diagnostics" shows exactly `debug`.
 * 4. An in-session expansion survives re-renders, but a fresh editor instance
 *    reopens collapsed (default).
 *
 * Also covers non-collapsible subsection headers and the `show_chart` dummy.
 *
 * jsdom notes: `ha-expansion-panel` is not defined, so the editor renders the
 * `<div>` fallback; a section is expanded by clicking its `.section-header`.
 */
import { describe, expect, it, beforeEach } from "vitest";
import "../helpers/setup-dom";
import { EnergyHorizonCardEditor } from "../../src/card/energy-horizon-card-editor";
import { SECTION_ICONS } from "../../src/card/editor/field-registry";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardConfigInput } from "../../src/card/types";

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

const EXPECTED_ORDER = [
  "general",
  "time",
  "panels",
  "formatting",
  "chart",
  "style",
  "diagnostics"
];

/** The `data-field` keys rendered inside a section's body. */
function fieldKeys(el: EditorEl, section: string): string[] {
  const body = el.shadowRoot!.querySelector<HTMLElement>(
    `[data-section="${section}"] .section-body`
  );
  return [...body!.querySelectorAll<HTMLElement>(".field")].map(
    (f) => f.dataset.field!
  );
}

function isExpanded(el: EditorEl, section: string): boolean {
  const s = el.shadowRoot!.querySelector<HTMLElement>(`[data-section="${section}"]`);
  return s?.dataset.expanded === "true";
}

/** Expands a section via the real user gesture (header click). */
function expandSection(el: EditorEl, section: string): void {
  const header = el.shadowRoot!.querySelector<HTMLElement>(
    `[data-section="${section}"] .section-header`
  )!;
  header.dispatchEvent(new Event("click", { bubbles: true }));
}

const MINIMAL: CardConfigInput = {
  type: "custom:energy-horizon-card",
  entity: "sensor.energy"
};

describe("editor sections (T018, US4)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the seven sections in the fixed order, general+time expanded and the rest collapsed (acceptance 1)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    const ids = [...el.shadowRoot!.querySelectorAll<HTMLElement>(".editor-section")].map(
      (s) => s.dataset.section
    );
    expect(ids).toEqual(EXPECTED_ORDER);

    expect(isExpanded(el, "general")).toBe(true);
    expect(isExpanded(el, "time")).toBe(true);
    for (const section of EXPECTED_ORDER.slice(2)) {
      expect(isExpanded(el, section), `${section} should be collapsed`).toBe(false);
    }
  });

  it("expanding Formatting & Localization shows exactly its six fields (acceptance 2)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    expandSection(el, "formatting");
    await el.updateComplete;

    expect(isExpanded(el, "formatting")).toBe(true);
    expect(fieldKeys(el, "formatting")).toEqual([
      "language",
      "force_prefix",
      "number_format",
      "precision",
      "x_axis_format",
      "tooltip_format"
    ]);
  });

  it("expanding Diagnostics shows exactly `debug` (acceptance 3)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    expandSection(el, "diagnostics");
    await el.updateComplete;

    expect(isExpanded(el, "diagnostics")).toBe(true);
    expect(fieldKeys(el, "diagnostics")).toEqual(["debug"]);
  });

  it("renders each section title from its `editor.section.*` key (FR-908-E)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    // The en dictionary is the reference (FR-908-E titles).
    const expectedTitles: Record<string, string> = {
      general: "General",
      time: "Time windows",
      panels: "Panels",
      formatting: "Formatting & Localization",
      chart: "Chart settings",
      style: "Style",
      diagnostics: "Diagnostics"
    };
    for (const section of EXPECTED_ORDER) {
      const header = el.shadowRoot!.querySelector<HTMLElement>(
        `[data-section="${section}"] .section-header`
      )!;
      expect((header.textContent ?? "").trim(), `title of ${section}`).toBe(
        expectedTitles[section]
      );
    }
  });

  it("renders the section icon from SECTION_ICONS in every section header", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    for (const section of EXPECTED_ORDER) {
      const icon = el.shadowRoot!.querySelector<HTMLElement>(
        `[data-section="${section}"] .section-header ha-icon.section-icon`
      ) as (HTMLElement & { icon?: string }) | null;
      expect(icon, `section icon of ${section}`).not.toBeNull();
      expect(icon!.icon, `icon of ${section}`).toBe(SECTION_ICONS[section as keyof typeof SECTION_ICONS]);
    }
  });

  it("an in-session expansion survives re-renders, but a fresh instance reopens collapsed (acceptance 4)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    // Expand a section in-session.
    expandSection(el, "style");
    await el.updateComplete;
    expect(isExpanded(el, "style")).toBe(true);

    // A passive re-render (setConfig with the same config) must preserve it.
    el.setConfig(MINIMAL);
    await el.updateComplete;
    expect(isExpanded(el, "style"), "in-session expansion must survive re-render").toBe(true);

    // A fresh editor instance reopens collapsed (default).
    const fresh = mountEditor(MINIMAL);
    await fresh.updateComplete;
    expect(isExpanded(fresh, "style"), "fresh instance must reopen collapsed").toBe(false);
  });

  it("renders show_title in the same row as title (FR-908-Z)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    const showTitle = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-field="show_title"]'
    )!;
    const row = showTitle.closest<HTMLElement>(".field-row");
    expect(row, "show_title must live inside a .field-row").not.toBeNull();
    expect(
      row!.querySelector<HTMLElement>('[data-field="title"]'),
      "the row must contain the title field"
    ).not.toBeNull();
  });

  it("renders show_icon in the same row as icon (FR-908-Z)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    const showIcon = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-field="show_icon"]'
    )!;
    const row = showIcon.closest<HTMLElement>(".field-row");
    expect(row, "show_icon must live inside a .field-row").not.toBeNull();
    expect(
      row!.querySelector<HTMLElement>('[data-field="icon"]'),
      "the row must contain the icon field"
    ).not.toBeNull();
  });

  it("renders neutral_threshold in the same row as interpretation (FR-908-Z)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    const neutral = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-field="neutral_threshold"]'
    )!;
    const row = neutral.closest<HTMLElement>(".field-row");
    expect(row, "neutral_threshold must live inside a .field-row").not.toBeNull();
    expect(
      row!.querySelector<HTMLElement>('[data-field="interpretation"]'),
      "the row must contain the interpretation field"
    ).not.toBeNull();
  });

  it("keeps the other general fields as standalone rows (FR-908-Z)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    for (const key of ["entity", "aggregation"]) {
      const field = el.shadowRoot!.querySelector<HTMLElement>(
        `[data-field="${key}"]`
      )!;
      expect(
        field.closest(".field-row"),
        `${key} must not be inside a .field-row`
      ).toBeNull();
    }
  });

  it("still renders all eight general fields (regression)", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    const general = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-section="general"]'
    )!;
    expect(general.querySelectorAll(".field").length).toBe(8);
  });

  it("renders the Custom settings subsection header only for the custom preset", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    // Standard preset: no custom time_window fields, so no subsection header.
    const timeBody = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-section="time"] .section-body'
    )!;
    expect(
      timeBody.querySelector(".subsection-header"),
      "no subsection header for the standard preset"
    ).toBeNull();

    // Custom preset: the time_window.* fields appear under a subsection header.
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "custom"
    });
    await el.updateComplete;

    const liveTimeBody = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-section="time"] .section-body'
    )!;
    const headers = [...liveTimeBody.querySelectorAll<HTMLElement>(".subsection-header")];
    expect(headers).toHaveLength(1);
    expect(headers[0].textContent).toBe("Custom settings");
    // comparison_preset stays visible; the custom fields follow the header.
    expect(fieldKeys(el, "time")).toEqual([
      "comparison_preset",
      "time_window.anchor",
      "time_window.duration",
      "time_window.step",
      "time_window.count",
      "time_window.offset"
    ]);
  });

  it("renders the Unit and Dates subsection headers in the formatting section", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    expandSection(el, "formatting");
    await el.updateComplete;

    const body = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-section="formatting"] .section-body'
    )!;
    const headers = [...body.querySelectorAll<HTMLElement>(".subsection-header")].map(
      (h) => h.textContent
    );
    expect(headers).toEqual(["Unit", "Dates"]);
  });

  it("renders the Current series and Reference series subsection headers in the style section", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    expandSection(el, "style");
    await el.updateComplete;

    const body = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-section="style"] .section-body'
    )!;
    const headers = [...body.querySelectorAll<HTMLElement>(".subsection-header")].map(
      (h) => h.textContent
    );
    expect(headers).toEqual(["Current series", "Reference series"]);
  });

  it("renders show_chart as a permanently ON, disabled dummy switch", async () => {
    const el = mountEditor(MINIMAL);
    await el.updateComplete;

    expandSection(el, "panels");
    await el.updateComplete;

    const dummy = el.shadowRoot!.querySelector<HTMLElement>(
      '[data-field="show_chart"]'
    )!;
    const control =
      dummy.querySelector<HTMLElement>("ha-switch") ??
      dummy.querySelector<HTMLElement>('input[type="checkbox"]');
    expect(control, "show_chart must render a switch control").not.toBeNull();
    expect(control!.hasAttribute("disabled"), "dummy must be disabled").toBe(true);
    if (control!.tagName.toLowerCase() === "input") {
      expect((control as HTMLInputElement).checked).toBe(true);
    }
  });
});
