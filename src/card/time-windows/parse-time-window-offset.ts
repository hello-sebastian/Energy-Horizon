import { Duration, type Duration as LuxonDuration } from "luxon";

/** Same unit letters as `parseDurationToken` (Grafana-style legacy aliases). */
const LEGACY_UNIT_TO_ISO: Record<
  string,
  { iso: string; isTimePart: boolean } | undefined
> = {
  y: { iso: "Y", isTimePart: false },
  Y: { iso: "Y", isTimePart: false },
  M: { iso: "M", isTimePart: false },
  w: { iso: "W", isTimePart: false },
  W: { iso: "W", isTimePart: false },
  d: { iso: "D", isTimePart: false },
  D: { iso: "D", isTimePart: false },
  h: { iso: "H", isTimePart: true },
  H: { iso: "H", isTimePart: true },
  m: { iso: "M", isTimePart: true },
  s: { iso: "S", isTimePart: true },
  S: { iso: "S", isTimePart: true }
};

const LEGACY_TOKEN = /^([-+]?)\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/;

const HOUR_MS = 60 * 60 * 1000;

function hasFractionalYearOrMonthInDatePart(isoCandidate: string): boolean {
  const trimmed = isoCandidate.trim();
  const unsigned = trimmed.replace(/^[-+]/, "");
  const datePart = unsigned.split("T")[0] ?? unsigned;
  return /\d+\.\d+[yYmM]/.test(datePart);
}

function legacyTokenToIso(trimmed: string): string | null {
  const m = trimmed.match(LEGACY_TOKEN);
  if (!m) return null;

  const lead = m[1] ?? "";
  const numStr = m[2]!;
  const unitRaw = m[3]!;
  const mapping = LEGACY_UNIT_TO_ISO[unitRaw];
  if (!mapping) return null;

  if (numStr.includes(".")) {
    const u = unitRaw.toUpperCase();
    if (u === "Y" || u === "M") {
      throw new Error("Energy Horizon: invalid time_window offset (fractional year/month).");
    }
  }

  const n = Number(numStr);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Energy Horizon: invalid time_window offset.");
  }

  const sign = lead === "-" ? "-" : "";
  const { iso, isTimePart } = mapping;
  if (isTimePart) {
    return `${sign}PT${String(n)}${iso}`;
  }
  return `${sign}P${String(n)}${iso}`;
}

function assertNotSubHourNonZero(d: LuxonDuration): void {
  const ms = Math.abs(d.as("milliseconds"));
  if (ms > 0 && ms < HOUR_MS) {
    throw new Error("Energy Horizon: invalid time_window offset (sub-hour offsets are not supported).");
  }
}

/**
 * Parses `time_window.offset` (FR-900-Q): ISO 8601 via Luxon, legacy `+3M` / `+1d` shim,
 * rejects sub-hour totals and fractional calendar Y/M. Whitespace / omitted → zero duration.
 *
 * @throws Error — invalid offset; validate layer maps to `status.config_invalid_time_window`.
 */
export function parseTimeWindowOffset(input: string | undefined): LuxonDuration {
  if (input === undefined) {
    return Duration.fromObject({});
  }
  const trimmed = input.trim();
  if (trimmed === "") {
    return Duration.fromObject({});
  }

  let isoCandidate = legacyTokenToIso(trimmed);
  if (isoCandidate === null) {
    if (/^[-+]?P$/i.test(trimmed)) {
      throw new Error("Energy Horizon: invalid time_window offset.");
    }
    isoCandidate = trimmed;
  }

  if (hasFractionalYearOrMonthInDatePart(isoCandidate)) {
    throw new Error("Energy Horizon: invalid time_window offset (fractional year/month).");
  }

  const d = Duration.fromISO(isoCandidate);
  if (!d.isValid) {
    throw new Error("Energy Horizon: invalid time_window offset.");
  }

  assertNotSubHourNonZero(d);
  return d;
}
