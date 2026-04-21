import type { InterpretationMode, SemanticOutcome } from "./types";

export type NeutralKind = "percent_band" | "flat_or_zero";

export interface InterpretationSemanticsResult {
  outcome: SemanticOutcome;
  neutralKind?: NeutralKind;
}

export interface InterpretationSemanticsInput {
  current_cumulative: number;
  reference_cumulative: number | null | undefined;
  difference: number | null | undefined;
  /** Signed % from the delta chip pipeline; undefined when not computable (e.g. ref = 0). */
  p: number | null | undefined;
  interpretation: InterpretationMode;
  /** Neutral band half-width in percentage points. */
  T: number;
}

export function parseInterpretationMode(
  raw: unknown,
  opts?: { debug?: boolean; log?: (message: string) => void }
): InterpretationMode {
  if (raw == null || raw === "") {
    return "consumption";
  }
  const s = String(raw).trim().toLowerCase();
  if (s === "production") {
    return "production";
  }
  if (s === "consumption") {
    return "consumption";
  }
  if (opts?.debug && String(raw).trim() !== "") {
    opts.log?.(
      `[Energy Horizon] Unrecognized interpretation ${JSON.stringify(
        raw
      )} — using consumption.`
    );
  }
  return "consumption";
}

export function parseNeutralInterpretationT(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    return 2;
  }
  return n;
}

function signToSemantic(
  sign: number,
  interpretation: InterpretationMode
): SemanticOutcome {
  if (sign === 0 || !Number.isFinite(sign)) {
    return "neutral";
  }
  const higher = sign > 0;
  if (interpretation === "production") {
    return higher ? "positive" : "negative";
  }
  return higher ? "negative" : "positive";
}

export function computeInterpretationSemantics(
  input: InterpretationSemanticsInput
): InterpretationSemanticsResult {
  const {
    current_cumulative,
    reference_cumulative,
    difference,
    p,
    interpretation,
    T
  } = input;
  const Tsafe = Number.isFinite(T) && T >= 0 ? T : 2;

  if (reference_cumulative == null || difference == null) {
    return { outcome: "insufficient_data" };
  }

  const refZero =
    !Number.isFinite(reference_cumulative) ||
    Math.abs(reference_cumulative) < 1e-9;
  const curZero =
    !Number.isFinite(current_cumulative) ||
    Math.abs(current_cumulative) < 1e-9;

  if (refZero) {
    if (curZero) {
      return { outcome: "neutral", neutralKind: "flat_or_zero" };
    }
    return { outcome: signToSemantic(Math.sign(difference), interpretation) };
  }

  if (Number.isFinite(p) && Math.abs(p as number) <= Tsafe) {
    return { outcome: "neutral", neutralKind: "percent_band" };
  }

  if (Math.abs(difference) < 0.01) {
    return { outcome: "neutral", neutralKind: "flat_or_zero" };
  }

  return { outcome: signToSemantic(Math.sign(difference), interpretation) };
}
