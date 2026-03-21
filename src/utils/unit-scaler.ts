/**
 * Smart unit scaling and number formatting for Home Assistant energy data.
 * Pure TypeScript utility with zero external dependencies.
 * 
 * Handles SI prefix selection (auto/manual) and localized number formatting
 * via Intl.NumberFormat for all Home Assistant unit types.
 */

/**
 * Supported SI prefixes. Internally 'u' represents µ (micro, U+00B5).
 * Empty string '' = base unit (no prefix).
 */
export type SIPrefix = 'G' | 'M' | 'k' | '' | 'm' | 'u';

/**
 * Force prefix mode from YAML config.
 *  - 'auto'       → automatic prefix selection based on series max
 *  - 'none'       → raw data, no scaling
 *  - SIPrefix     → forced prefix
 *  - 'µ'          → alias for 'u'; normalized to 'u' during parsing
 */
export type ForcePrefix = 'auto' | 'none' | SIPrefix | 'µ';

/**
 * Configuration object for unit display from unit_display section in YAML.
 */
export interface UnitDisplayConfig {
  /**
   * Scaling control:
   *   'auto'  — automatic prefix selection (default)
   *   'none'  — raw data without conversion
   *   'u'/'µ' — forced micro prefix
   *   'm'     — forced milli prefix
   *   'k'     — forced kilo prefix
   *   'M'     — forced mega prefix
   *   'G'     — forced giga prefix
   */
  force_prefix?: ForcePrefix;

  /**
   * Number of decimal places for scaled values.
   * Overrides global config.precision when present.
   */
  precision?: number;
}

/**
 * Result of scaling a series of values.
 * All values in the array use the same scale.
 */
export interface ScaleResult {
  /** Values after scaling (for Y-axis and tooltip display). */
  values: (number | null)[];

  /** Unit label to display (e.g., "kWh", "mA", "µA", "Wh"). Uses µ (U+00B5) for micro. */
  unit: string;

  /** Selected SI prefix (internal representation). */
  prefix: SIPrefix;

  /**
   * Applied multiplier: rawValue * factor = scaledValue.
   * Example: rawValue [Wh] * 0.001 = scaledValue [kWh].
   * Value 1 means no conversion (none mode or no prefix).
   */
  factor: number;
}

/**
 * Internal type representing a parsed unit.
 */
interface ParsedUnit {
  /** Base unit after removing SI prefix (e.g., "Wh" from "kWh", "A" from "mA"). */
  baseUnit: string;

  /** SI prefix already contained in the HA unit (e.g., 'k' from "kWh"). Empty string if none. */
  existingPrefix: SIPrefix;

  /** Whether the unit is scalable with SI prefixes (false for h, min, s, %, °C, etc.). */
  scalable: boolean;
}

/**
 * SI prefix data: each entry maps a prefix to its factor and display symbol.
 */
const SI_PREFIX_DATA: ReadonlyArray<{
  prefix: SIPrefix;
  factor: number;
  display: string;
}> = [
  { prefix: 'G', factor: 1_000_000_000, display: 'G' },
  { prefix: 'M', factor: 1_000_000, display: 'M' },
  { prefix: 'k', factor: 1_000, display: 'k' },
  { prefix: '', factor: 1, display: '' },
  { prefix: 'm', factor: 0.001, display: 'm' },
  { prefix: 'u', factor: 0.000_001, display: '\u00B5' }, // µ Micro Sign
];

/**
 * Map of prefix symbols to their display representation.
 */
const PREFIX_DISPLAY: Record<SIPrefix, string> = {
  'G': 'G',
  'M': 'M',
  'k': 'k',
  '': '',
  'm': 'm',
  'u': '\u00B5', // µ Micro Sign (U+00B5)
};

/**
 * Units that are NOT scalable with SI prefixes.
 * Includes: time units, temperature, angle, pressure (with prefix), 
 * dimensionless, frequencies with prefix, and meter as base unit.
 * 
 * Note: "m" (meter) is included to prevent parsing "m" as a milli prefix.
 * "mA" will pass since "A" is not in this set.
 * "ms" (millisecond?) is intentionally excluded; since "s" is in this set,
 * parsing "ms" as prefix='m', base='s' will be rejected (base is non-scalable).
 */
const NON_SCALABLE_UNITS = new Set<string>([
  '%', '°C', '°F', 'K',
  'h', 'min', 's', 'ms', 'd',
  '°', 'lx', 'lm', 'pH', 'dB',
  'ppm', 'rpm',
  'bar', 'Pa', 'hPa', 'kPa', 'mbar',
  'm', // meter — not to be confused with milli
  'Hz', 'kHz', 'MHz', 'GHz',
]);

/**
 * Internal function: Parse a raw unit string into base unit and existing prefix.
 * 
 * Algorithm:
 * 1. If rawUnit is in NON_SCALABLE_UNITS → return non-scalable.
 * 2. For each SI prefix (descending by key length):
 *    - If rawUnit starts with prefix AND remainder is non-empty AND remainder is not in NON_SCALABLE_UNITS
 *    → return scalable with this prefix.
 * 3. Fallback → return scalable with no prefix.
 * 4. Special case: empty rawUnit → return non-scalable.
 */
function parseUnit(rawUnit: string): ParsedUnit {
  if (!rawUnit) {
    return {
      baseUnit: '',
      existingPrefix: '',
      scalable: false,
    };
  }

  if (NON_SCALABLE_UNITS.has(rawUnit)) {
    return {
      baseUnit: rawUnit,
      existingPrefix: '',
      scalable: false,
    };
  }

  // Try to match SI prefixes in descending order of key length
  // Order: G, M, k, then m, u (single-char prefixes)
  const prefixKeys = ['G', 'M', 'k', 'm', 'u'] as const;
  for (const prefix of prefixKeys) {
    if (rawUnit.startsWith(prefix)) {
      const remainder = rawUnit.slice(prefix.length);
      if (remainder && !NON_SCALABLE_UNITS.has(remainder)) {
        return {
          baseUnit: remainder,
          existingPrefix: prefix,
          scalable: true,
        };
      }
    }
  }

  // Fallback: entire unit is the base unit (no prefix detected)
  return {
    baseUnit: rawUnit,
    existingPrefix: '',
    scalable: true,
  };
}

/**
 * Internal function: Choose the best SI prefix for a given absolute maximum value.
 * 
 * Algorithm:
 * 1. If absoluteMaxInBase === 0 or isNaN → return '' (base unit).
 * 2. Iterate SI_PREFIX_DATA from highest factor (G) to lowest (u).
 *    If absoluteMaxInBase / entry.factor >= 1 → return that prefix.
 * 3. Fallback → 'u' (micro).
 */
function choosePrefix(absoluteMaxInBase: number): SIPrefix {
  if (absoluteMaxInBase === 0 || !Number.isFinite(absoluteMaxInBase)) {
    return '';
  }

  for (const entry of SI_PREFIX_DATA) {
    if (absoluteMaxInBase / entry.factor >= 1) {
      return entry.prefix;
    }
  }

  return 'u';
}

/**
 * Scale a series of values to a human-readable SI unit.
 * 
 * In auto mode, selects the best prefix based on the series maximum.
 * In force mode, applies the specified prefix (or falls back to auto if invalid).
 * In none mode, returns values unchanged.
 * 
 * Non-scalable units (time, temperature, etc.) bypass scaling.
 * 
 * @param values - Array of numeric values (null values pass through unchanged)
 * @param rawUnit - Raw unit string from HA entity attributes
 * @param unitDisplay - Configuration object with force_prefix and precision (undefined → auto mode)
 * @returns ScaleResult with scaled values, unit label, prefix, and factor
 */
export function scaleSeriesValues(
  values: (number | null)[],
  rawUnit: string,
  unitDisplay: UnitDisplayConfig | undefined,
): ScaleResult {
  // Step 1: Normalize force_prefix
  let forcePrefixNormalized: ForcePrefix = unitDisplay?.force_prefix ?? 'auto';
  if (forcePrefixNormalized === 'µ' || forcePrefixNormalized === '\u03BC') {
    forcePrefixNormalized = 'u';
  }

  // Step 2: Parse the unit
  const parsed = parseUnit(rawUnit);

  // Step 3: If unit is not scalable or force_prefix is 'none', return identity
  if (!parsed.scalable || forcePrefixNormalized === 'none') {
    return {
      values: [...values],
      unit: rawUnit,
      prefix: '',
      factor: 1,
    };
  }

  // Step 4: Compute absolute max
  const nonNullValues = values.filter((v) => v !== null) as number[];
  if (nonNullValues.length === 0) {
    // Empty series → return base unit without prefix
    return {
      values: [...values],
      unit: rawUnit,
      prefix: '',
      factor: 1,
    };
  }

  const absoluteMaxInSeries = Math.max(...nonNullValues.map((v) => Math.abs(v)));
  const inputFactorData = SI_PREFIX_DATA.find((d) => d.prefix === parsed.existingPrefix);
  const inputFactor = inputFactorData?.factor ?? 1;
  const absoluteMaxInBase = absoluteMaxInSeries * inputFactor;

  // Step 5: Choose target prefix (only in auto mode; force mode uses the specified prefix)
  let targetPrefix: SIPrefix;
  if (forcePrefixNormalized === 'auto') {
    targetPrefix = choosePrefix(absoluteMaxInBase);
  } else {
    // force_prefix is one of: 'G', 'M', 'k', '', 'm', 'u'
    const validPrefixes: SIPrefix[] = ['G', 'M', 'k', '', 'm', 'u'];
    if (validPrefixes.includes(forcePrefixNormalized as SIPrefix)) {
      targetPrefix = forcePrefixNormalized as SIPrefix;
    } else {
      // Fallback to auto
      console.warn(`[unit-scaler] Unknown force_prefix: "${forcePrefixNormalized}" — falling back to auto`);
      targetPrefix = choosePrefix(absoluteMaxInBase);
    }
  }

  // Step 6: Compute scale factor
  const targetFactorData = SI_PREFIX_DATA.find((d) => d.prefix === targetPrefix);
  const targetFactor = targetFactorData?.factor ?? 1;
  const scaleFactor = inputFactor / targetFactor;

  // Step 7: Map values
  const scaledValues = values.map((v) => (v === null ? null : v * scaleFactor));

  // Step 8: Build unit label
  const displayPrefix = PREFIX_DISPLAY[targetPrefix] ?? '';
  const unit = displayPrefix + parsed.baseUnit;

  return {
    values: scaledValues,
    unit,
    prefix: targetPrefix,
    factor: scaleFactor,
  };
}

/**
 * Format a single scaled value as a localized string with unit.
 * 
 * Uses Intl.NumberFormat exclusively — no replace() calls.
 * Precision < 0 or NaN is treated as 0.
 * Returns "${formatted} ${unit}".trim() — if unit is empty, returns only the number.
 * 
 * @param value - Scaled numeric value (from ScaleResult.values)
 * @param unit - Unit label (from ScaleResult.unit)
 * @param numberLocale - BCP 47 locale string (e.g., "pl", "en-US")
 * @param precision - Number of decimal places
 * @returns Localized formatted string (e.g., "1234,5 kWh" or "50 mA")
 */
export function formatScaledValue(
  value: number,
  unit: string,
  numberLocale: string,
  precision: number,
): string {
  // Validate precision
  let validPrecision = precision;
  if (!Number.isFinite(validPrecision) || validPrecision < 0) {
    validPrecision = 0;
  }

  // Format number using Intl.NumberFormat
  const formatter = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.max(0, validPrecision),
  });

  const formatted = formatter.format(value);

  // Build result string
  if (!unit) {
    return formatted;
  }

  return `${formatted} ${unit}`.trim();
}
