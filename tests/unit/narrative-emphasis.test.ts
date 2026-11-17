import "../helpers/setup-dom";
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "lit";
import {
  textSummaryNarrativeWithEmphasis
} from "../../src/card/narrative/narrative-emphasis";

// 911/TD-9 (FR-903-AA): the emphasis renderer moved out of the element file
// into the pure narrative module — these tests pin its DOM output contract
// (wrapper + one emphasis span per placeholder).

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

describe("textSummaryNarrativeWithEmphasis (moved from the element, 911/TD-9)", () => {
  it("wraps the sentence in .ebc-comment-text and wraps each placeholder in an emphasis span", () => {
    render(
      textSummaryNarrativeWithEmphasis(
        "Energy use is {{deltaUnit}} ({{deltaPercent}}) higher than {{referencePeriod}}.",
        {
          deltaUnit: "+12.5 kWh",
          deltaPercent: "8.3%",
          referencePeriod: "the previous month"
        }
      ),
      container
    );

    const wrapper = container.querySelector(".ebc-comment-text");
    expect(wrapper).not.toBeNull();
    const spans = wrapper!.querySelectorAll(".ebc-comment-emphasis");
    expect(spans.length).toBe(3);
    expect(
      Array.from(spans).map((s) => s.textContent)
    ).toEqual(["+12.5 kWh", "8.3%", "the previous month"]);
  });

  it("keeps the raw placeholder text inside the span when a var is missing", () => {
    render(
      textSummaryNarrativeWithEmphasis("About the same as {{referencePeriod}}.", {
        deltaUnit: "unused"
      }),
      container
    );

    const span = container.querySelector(".ebc-comment-emphasis");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("{{referencePeriod}}");
  });

  it("renders plain text unchanged when the template has no placeholders", () => {
    render(
      textSummaryNarrativeWithEmphasis("Not enough data to compare.", {}),
      container
    );

    expect(container.querySelector(".ebc-comment-text")).not.toBeNull();
    expect(container.querySelector(".ebc-comment-emphasis")).toBeNull();
    expect(container.textContent).toBe("Not enough data to compare.");
  });

  it("handles repeated placeholders of the same var", () => {
    render(
      textSummaryNarrativeWithEmphasis("{{x}} and again {{x}}", { x: "10 kWh" }),
      container
    );

    const spans = container.querySelectorAll(".ebc-comment-emphasis");
    expect(spans.length).toBe(2);
    expect(
      Array.from(spans).map((s) => s.textContent)
    ).toEqual(["10 kWh", "10 kWh"]);
  });
});
