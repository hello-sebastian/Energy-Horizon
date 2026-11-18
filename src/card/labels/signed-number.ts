/**
 * Signed number display for the comparison delta chip (911/TD-9; domain 903):
 * `+1.5 kWh`, `−1.5 kWh` (U+2212 minus), or unsigned `0.00 kWh` for zero —
 * the single formatting path for the chip's absolute and percent values.
 *
 * Pure: no DOM, no element access (moved out of the element file so the view
 * model can own chip formatting — FR-903-AA).
 */
export function formatSigned(
  value: number,
  formatter: Intl.NumberFormat,
  unit: string
): string {
  if (value > 0) {
    return `+${formatter.format(value)} ${unit}`;
  }
  if (value < 0) {
    return `\u2212${formatter.format(Math.abs(value))} ${unit}`;
  }
  return `${formatter.format(0)} ${unit}`;
}
