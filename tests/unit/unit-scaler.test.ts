import { describe, it, expect } from 'vitest';
import { scaleSeriesValues, formatScaledValue } from '../../src/utils/unit-scaler';

describe('scaleSeriesValues — auto mode', () => {
  it('should scale 1500 Wh → 1.5 kWh', () => {
    const result = scaleSeriesValues([1500], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([1.5]);
    expect(result.unit).toBe('kWh');
    expect(result.prefix).toBe('k');
    expect(result.factor).toBe(0.001);
  });

  it('should scale 0.05–0.15 A → mA (×1000)', () => {
    const result = scaleSeriesValues([0.05, 0.1, 0.15], 'A', { force_prefix: 'auto' });
    expect(result.values).toEqual([50, 100, 150]);
    expect(result.unit).toBe('mA');
    expect(result.prefix).toBe('m');
  });

  it('should scale 5000 kWh → MWh (existing prefix)', () => {
    const result = scaleSeriesValues([5000], 'kWh', { force_prefix: 'auto' });
    expect(result.values).toEqual([5]);
    expect(result.unit).toBe('MWh');
    expect(result.prefix).toBe('M');
  });

  it('should scale 500000 Wh → 500 kWh', () => {
    const result = scaleSeriesValues([500000], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([500]);
    expect(result.unit).toBe('kWh');
  });

  it('should pass through null values unchanged', () => {
    const result = scaleSeriesValues([1500, null, 2000], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([1.5, null, 2]);
    expect(result.unit).toBe('kWh');
  });

  it('should return empty series identity', () => {
    const result = scaleSeriesValues([], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([]);
    expect(result.unit).toBe('Wh');
    expect(result.prefix).toBe('');
    expect(result.factor).toBe(1);
  });

  it('should return base unit without prefix when max=0', () => {
    const result = scaleSeriesValues([0, 0, 0], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([0, 0, 0]);
    expect(result.unit).toBe('Wh');
    expect(result.prefix).toBe('');
    expect(result.factor).toBe(1);
  });

  it('should use auto scaling when options omitted or force_prefix unset (root default)', () => {
    const explicit = scaleSeriesValues([1500], 'Wh', { force_prefix: 'auto' });
    const omittedThirdArg = scaleSeriesValues([1500], 'Wh', undefined);
    const emptyOptions = scaleSeriesValues([1500], 'Wh', {});
    expect(omittedThirdArg).toEqual(explicit);
    expect(emptyOptions).toEqual(explicit);
  });

  it('should choose µ (micro) prefix for very small values', () => {
    const result = scaleSeriesValues([0.000001, 0.000002], 'A', { force_prefix: 'auto' });
    expect(result.values).toEqual([1, 2]);
    expect(result.unit).toBe('\u00B5A'); // µA
    expect(result.prefix).toBe('u');
  });

  it('should choose G (giga) prefix for very large values', () => {
    const result = scaleSeriesValues([1_000_000_000], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([1]);
    expect(result.unit).toBe('GWh');
    expect(result.prefix).toBe('G');
  });

  it('should handle mixed positive/negative values', () => {
    const result = scaleSeriesValues([-1500, 1500], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([-1.5, 1.5]);
    expect(result.unit).toBe('kWh');
  });
});

describe('formatScaledValue', () => {
  it('should format with Polish locale (comma decimal separator)', () => {
    const result = formatScaledValue(1234.5, 'kWh', 'pl', 2);
    expect(result).toContain('kWh');
    expect(result).not.toContain('.');
    // Polish locale uses comma for decimal
  });

  it('should format with en-US locale (period decimal separator)', () => {
    const result = formatScaledValue(1234.5, 'kWh', 'en-US', 2);
    expect(result).toContain('kWh');
    expect(result).toContain('.');
  });

  it('should handle micro prefix with correct symbol', () => {
    const result = formatScaledValue(50, '\u00B5A', 'en', 0);
    expect(result).toBe('50 \u00B5A');
  });

  it('should format zero correctly', () => {
    const result = formatScaledValue(0, 'Wh', 'pl', 1);
    expect(result).toBe('0 Wh');
  });

  it('should treat precision < 0 as 0', () => {
    const result = formatScaledValue(1.5, 'kWh', 'en-US', -5);
    expect(result).toBe('2 kWh'); // rounded to 0 decimals
  });

  it('should return only number when unit is empty', () => {
    const result = formatScaledValue(1234.5, '', 'en-US', 2);
    expect(result).toBe('1,234.5');
  });

  it('should apply precision correctly', () => {
    const result1 = formatScaledValue(1.23456, 'kWh', 'en-US', 2);
    const result2 = formatScaledValue(1.23456, 'kWh', 'en-US', 4);
    expect(result1).toContain('1.23');
    expect(result2).toContain('1.2346');
  });

  it('should handle large numbers with thousands separator', () => {
    const result = formatScaledValue(1234567, 'Wh', 'en-US', 0);
    expect(result).toContain('1,234,567');
  });
});

describe('scaleSeriesValues — non-scalable units', () => {
  it('should not scale time unit h (hour)', () => {
    const result = scaleSeriesValues([5], 'h', { force_prefix: 'auto' });
    expect(result.values).toEqual([5]);
    expect(result.unit).toBe('h');
    expect(result.factor).toBe(1);
    expect(result.prefix).toBe('');
  });

  it('should not scale time unit min (minute)', () => {
    const result = scaleSeriesValues([30], 'min', { force_prefix: 'auto' });
    expect(result.values).toEqual([30]);
    expect(result.unit).toBe('min');
    expect(result.factor).toBe(1);
  });

  it('should not scale time unit s (second)', () => {
    const result = scaleSeriesValues([7200], 's', { force_prefix: 'auto' });
    expect(result.values).toEqual([7200]);
    expect(result.unit).toBe('s');
    expect(result.factor).toBe(1);
  });

  it('should not scale percentage %', () => {
    const result = scaleSeriesValues([50, 100], '%', { force_prefix: 'auto' });
    expect(result.values).toEqual([50, 100]);
    expect(result.unit).toBe('%');
    expect(result.factor).toBe(1);
  });

  it('should not scale temperature °C', () => {
    const result = scaleSeriesValues([20], '°C', { force_prefix: 'auto' });
    expect(result.values).toEqual([20]);
    expect(result.unit).toBe('°C');
    expect(result.factor).toBe(1);
  });

  it('should not scale when force_prefix is applied to non-scalable unit', () => {
    const result = scaleSeriesValues([5], 'min', { force_prefix: 'k' });
    expect(result.values).toEqual([5]);
    expect(result.unit).toBe('min');
    expect(result.factor).toBe(1);
  });

  it('should not scale frequency Hz', () => {
    const result = scaleSeriesValues([50], 'Hz', { force_prefix: 'auto' });
    expect(result.values).toEqual([50]);
    expect(result.unit).toBe('Hz');
  });

  it('should not scale temperature °F', () => {
    const result = scaleSeriesValues([68], '°F', { force_prefix: 'auto' });
    expect(result.values).toEqual([68]);
    expect(result.unit).toBe('°F');
  });
});

describe('scaleSeriesValues — force_prefix manual', () => {
  it('should scale with force_prefix: k → 500 Wh = 0.5 kWh', () => {
    const result = scaleSeriesValues([500], 'Wh', { force_prefix: 'k' });
    expect(result.values).toEqual([0.5]);
    expect(result.unit).toBe('kWh');
    expect(result.prefix).toBe('k');
  });

  it('should scale with force_prefix: m → 1.5 A = 1500 mA', () => {
    const result = scaleSeriesValues([1.5], 'A', { force_prefix: 'm' });
    expect(result.values).toEqual([1500]);
    expect(result.unit).toBe('mA');
    expect(result.prefix).toBe('m');
  });

  it('should scale with force_prefix: M → 500000 Wh = 0.5 MWh', () => {
    const result = scaleSeriesValues([500000], 'Wh', { force_prefix: 'M' });
    expect(result.values).toEqual([0.5]);
    expect(result.unit).toBe('MWh');
    expect(result.prefix).toBe('M');
  });

  it('should scale with force_prefix: u → 0.00005 A = 50 µA', () => {
    const result = scaleSeriesValues([0.00005], 'A', { force_prefix: 'u' });
    expect(result.values).toEqual([50]);
    expect(result.unit).toBe('\u00B5A'); // µA
    expect(result.prefix).toBe('u');
  });

  it('should scale with force_prefix: G → 1000000000 Wh = 1 GWh', () => {
    const result = scaleSeriesValues([1000000000], 'Wh', { force_prefix: 'G' });
    expect(result.values).toEqual([1]);
    expect(result.unit).toBe('GWh');
    expect(result.prefix).toBe('G');
  });

  it('should scale with force_prefix: empty string (base unit)', () => {
    const result = scaleSeriesValues([1500], 'Wh', { force_prefix: '' });
    expect(result.values).toEqual([1500]);
    expect(result.unit).toBe('Wh');
    expect(result.prefix).toBe('');
  });

  it('should ignore force_prefix on non-scalable unit h', () => {
    const result = scaleSeriesValues([5], 'h', { force_prefix: 'k' });
    expect(result.values).toEqual([5]);
    expect(result.unit).toBe('h');
    expect(result.factor).toBe(1);
  });

  it('should fallback to auto for invalid force_prefix', () => {
    const result = scaleSeriesValues([1500], 'Wh', { force_prefix: 'X' as any });
    // Should fall back to auto mode (which picks 'k' for 1500)
    expect(result.values).toEqual([1.5]);
    expect(result.unit).toBe('kWh');
    expect(result.prefix).toBe('k');
  });

  it('should handle multiple values with force_prefix: m', () => {
    const result = scaleSeriesValues([0.05, 0.1, 0.15], 'A', { force_prefix: 'm' });
    expect(result.values).toEqual([50, 100, 150]);
    expect(result.unit).toBe('mA');
  });

  it('should preserve null values with force_prefix', () => {
    const result = scaleSeriesValues([1.5, null, 2.5], 'A', { force_prefix: 'm' });
    expect(result.values).toEqual([1500, null, 2500]);
    expect(result.unit).toBe('mA');
  });
});

describe('scaleSeriesValues — force_prefix none / µ normalization', () => {
  it('should return identity with force_prefix: none → 1500 Wh = 1500 Wh', () => {
    const result = scaleSeriesValues([1500], 'Wh', { force_prefix: 'none' });
    expect(result.values).toEqual([1500]);
    expect(result.unit).toBe('Wh');
    expect(result.factor).toBe(1);
    expect(result.prefix).toBe('');
  });

  it('should normalize µ (U+00B5) to u in force_prefix', () => {
    // U+00B5 is the Micro Sign (µ)
    const result = scaleSeriesValues([0.00005], 'A', { force_prefix: '\u00B5' });
    expect(result.values).toEqual([50]);
    expect(result.unit).toBe('\u00B5A');
    expect(result.prefix).toBe('u');
  });

  it('should normalize Greek mu (U+03BC) to u in force_prefix', () => {
    // U+03BC is Greek Small Letter Mu (μ)
    const result = scaleSeriesValues([0.00005], 'A', { force_prefix: '\u03BC' });
    expect(result.values).toEqual([50]);
    expect(result.unit).toBe('\u00B5A');
    expect(result.prefix).toBe('u');
  });

  it('should preserve null values with force_prefix: none', () => {
    const result = scaleSeriesValues([1500, null, 2000], 'Wh', { force_prefix: 'none' });
    expect(result.values).toEqual([1500, null, 2000]);
    expect(result.unit).toBe('Wh');
  });

  it('should return identity for empty series with force_prefix: none', () => {
    const result = scaleSeriesValues([], 'Wh', { force_prefix: 'none' });
    expect(result.values).toEqual([]);
    expect(result.unit).toBe('Wh');
    expect(result.factor).toBe(1);
  });
});

describe('scaleSeriesValues — edge cases', () => {
  it('should return identity for empty rawUnit', () => {
    const result = scaleSeriesValues([1500, 2000], '', { force_prefix: 'auto' });
    expect(result.values).toEqual([1500, 2000]);
    expect(result.unit).toBe('');
    expect(result.prefix).toBe('');
    expect(result.factor).toBe(1);
  });

  it('should handle series with all null values', () => {
    const result = scaleSeriesValues([null, null, null], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([null, null, null]);
    expect(result.unit).toBe('Wh');
    expect(result.prefix).toBe('');
    expect(result.factor).toBe(1);
  });

  it('should handle force_prefix G with small values (returns correct tiny scaling)', () => {
    const result = scaleSeriesValues([5], 'Wh', { force_prefix: 'G' });
    expect(result.values).toEqual([5e-9]);
    expect(result.unit).toBe('GWh');
    expect(result.prefix).toBe('G');
  });

  it('should handle force_prefix u with large values (returns correct small factor)', () => {
    const result = scaleSeriesValues([0.001], 'A', { force_prefix: 'u' });
    expect(result.values).toEqual([1000]);
    expect(result.unit).toBe('\u00B5A');
    expect(result.prefix).toBe('u');
  });

  it('should handle precision -1 in formatScaledValue (treated as 0)', () => {
    const result = formatScaledValue(1.5, 'kWh', 'en-US', -1);
    // precision < 0 should be treated as 0 (no crash)
    expect(result).toBe('2 kWh');
  });

  it('should handle NaN precision in formatScaledValue gracefully', () => {
    const result = formatScaledValue(1.5, 'kWh', 'en-US', NaN);
    // NaN precision should not crash; treated as 0
    expect(result).toBe('2 kWh');
  });

  it('should handle mixed null and zero values in series', () => {
    const result = scaleSeriesValues([0, null, 0, null, 5000], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([0, null, 0, null, 5]);
    expect(result.unit).toBe('kWh');
    expect(result.prefix).toBe('k');
  });

  it('should handle single null value in series', () => {
    const result = scaleSeriesValues([null], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([null]);
    expect(result.unit).toBe('Wh');
    expect(result.prefix).toBe('');
    expect(result.factor).toBe(1);
  });

  it('should handle single zero value in series', () => {
    const result = scaleSeriesValues([0], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([0]);
    expect(result.unit).toBe('Wh');
    expect(result.prefix).toBe('');
    expect(result.factor).toBe(1);
  });

  it('should handle very large negative values with auto mode', () => {
    const result = scaleSeriesValues([-1_000_000], 'Wh', { force_prefix: 'auto' });
    expect(result.values).toEqual([-1]);
    expect(result.unit).toBe('MWh');
    expect(result.prefix).toBe('M');
  });

  it('should handle precision 0 correctly with formatScaledValue', () => {
    const result = formatScaledValue(1.9, 'kWh', 'en-US', 0);
    expect(result).toBe('2 kWh');
  });

  it('should handle precision Infinity in formatScaledValue gracefully', () => {
    const result = formatScaledValue(1.23456789, 'kWh', 'en-US', Infinity);
    // Intl.NumberFormat with Infinity rounds; just ensure it contains the unit and doesn't crash
    expect(result).toContain('kWh');
    expect(result).toContain('1');
  });
});
