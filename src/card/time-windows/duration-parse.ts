import { Duration } from "luxon";

/** Maps single-letter Grafana-style units to Luxon Duration keys. */
const UNIT_TO_LUXON: Record<string, keyof Duration> = {
  y: "years",
  M: "months",
  w: "weeks",
  d: "days",
  h: "hours",
  m: "minutes",
  s: "seconds"
};

/**
 * Parses a signed duration token (e.g. `1y`, `6M`, `30d`, `1h`, `+9M`, `-2d`).
 * Returns `undefined` if the string is empty or invalid.
 */
export function parseDurationToken(input: string): Duration | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const sign = trimmed.startsWith("-") ? -1 : 1;
  const rest = trimmed.replace(/^[-+]\s*/, "").trim();
  const match = rest.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (!match) return undefined;

  const num = Number(match[1]);
  const unit = match[2]!;
  if (!Number.isFinite(num)) return undefined;

  const luxonKey = UNIT_TO_LUXON[unit];
  if (!luxonKey) return undefined;

  const value = num * sign;
  if (value === 0) return Duration.fromObject({ [luxonKey]: 0 });

  return Duration.fromObject({ [luxonKey]: value } as Record<string, number>);
}

export function durationToMillis(d: Duration): number {
  return d.as("milliseconds");
}
