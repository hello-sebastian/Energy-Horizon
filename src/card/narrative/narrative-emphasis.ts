import { html, type TemplateResult } from "lit";

const TEXT_SUMMARY_PLACEHOLDER = /\{\{(\w+)\}\}/g;

/**
 * Renders a `text_summary.*.{higher|lower|neutral_band}` sentence template with
 * `ebc-comment-emphasis` on each `{{varName}}` value.
 *
 * Pure: no DOM access (Lit `html` is DOM-free) — moved out of the element
 * file so the view model can own narrative rendering (911/TD-9, FR-903-AA).
 * A placeholder with no matching var keeps its raw `{{name}}` text inside the
 * emphasis span (the safe fallback for partially-missing vars).
 */
export function textSummaryNarrativeWithEmphasis(
  template: string,
  vars: Record<string, string>
): TemplateResult {
  const segments: (string | TemplateResult)[] = [];
  let lastIndex = 0;
  const re = new RegExp(TEXT_SUMMARY_PLACEHOLDER.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (m.index > lastIndex) {
      segments.push(template.slice(lastIndex, m.index));
    }
    const varName = m[1] ?? m[0];
    const display = vars[varName] ?? m[0];
    segments.push(html`<span class="ebc-comment-emphasis">${display}</span>`);
    lastIndex = m.index + m[0].length;
  }
  segments.push(template.slice(lastIndex));
  return html`<div class="ebc-comment-text">${segments}</div>`;
}
