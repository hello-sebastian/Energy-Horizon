/**
 * Step string → narrative period family for {@link text_summary.period} keys (FR-903-NA).
 * Classification uses only the merged YAML `step`, not resolved window geometry.
 */
export type StepKind = "day" | "week" | "month" | "year" | "reference";

/** Normalize ISO-8601-style `P…` prefixes seen in YAML examples to Grafana-style tokens. */
function normalizeStepToken(step: string): string {
  const trimmed = step.trim();
  if (!trimmed) return "";
  const rest = trimmed.startsWith("P") || trimmed.startsWith("p") ? trimmed.slice(1) : trimmed;
  return rest.trim();
}

export function classifyComparisonStep(step: string | undefined): StepKind {
  const s = typeof step === "string" ? normalizeStepToken(step) : "";
  if (s === "1d") return "day";
  if (s === "1w") return "week";
  if (s === "1M") return "month";
  if (s === "1y" || s === "1Y") return "year";
  return "reference";
}
