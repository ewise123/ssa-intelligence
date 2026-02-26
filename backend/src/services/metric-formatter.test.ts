import { describe, it, expect } from 'vitest';
import {
  formatMetricValue,
  formatNumber,
  formatCurrency,
  formatPercent,
  resolveMetricUnit,
  parseNumeric,
  currencySymbol,
} from './metric-formatter.js';

// ── currencySymbol ─────────────────────────────────────────────────────────

describe('currencySymbol', () => {
  it('returns $ for USD', () => {
    expect(currencySymbol('USD')).toBe('$');
  });

  it('returns € for EUR', () => {
    expect(currencySymbol('EUR')).toBe('€');
  });

  it('returns £ for GBP', () => {
    expect(currencySymbol('GBP')).toBe('£');
  });

  it('returns $ for null/undefined', () => {
    expect(currencySymbol(null)).toBe('$');
    expect(currencySymbol(undefined)).toBe('$');
  });

  it('is case-insensitive', () => {
    expect(currencySymbol('usd')).toBe('$');
    expect(currencySymbol('eur')).toBe('€');
  });

  it('returns ISO code with space for unknown currencies', () => {
    expect(currencySymbol('XYZ')).toBe('XYZ ');
  });
});

// ── formatNumber ───────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats integers with comma grouping', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('formats decimals with up to 2 places', () => {
    expect(formatNumber(12.3)).toBe('12.3');
    expect(formatNumber(12.34)).toBe('12.34');
    expect(formatNumber(12.345)).toBe('12.35'); // rounded
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });
});

// ── formatCurrency (auto-promotion) ────────────────────────────────────────

describe('formatCurrency', () => {
  describe('$M scale with auto-promotion', () => {
    it('formats sub-million values', () => {
      expect(formatCurrency(0.5, 'M')).toBe('$0.5M');
      expect(formatCurrency(875, 'M')).toBe('$875M');
    });

    it('promotes >= 1000 to billions', () => {
      expect(formatCurrency(1200, 'M')).toBe('$1.2B');
      expect(formatCurrency(15000, 'M')).toBe('$15B');
      expect(formatCurrency(1000, 'M')).toBe('$1B');
    });

    it('handles fractional billions', () => {
      expect(formatCurrency(1500, 'M')).toBe('$1.5B');
      expect(formatCurrency(2345, 'M')).toBe('$2.3B');
    });

    it('handles negative values', () => {
      expect(formatCurrency(-1200, 'M')).toBe('-$1.2B');
      expect(formatCurrency(-500, 'M')).toBe('-$500M');
    });

    it('handles zero', () => {
      expect(formatCurrency(0, 'M')).toBe('$0M');
    });
  });

  describe('$B scale', () => {
    it('formats billion values', () => {
      expect(formatCurrency(0.5, 'B')).toBe('$0.5B');
      expect(formatCurrency(1.2, 'B')).toBe('$1.2B');
      expect(formatCurrency(15, 'B')).toBe('$15B');
    });
  });

  describe('$K scale with auto-promotion', () => {
    it('formats sub-thousand values', () => {
      expect(formatCurrency(500, 'K')).toBe('$500K');
    });

    it('formats sub-1 values with 1 decimal', () => {
      expect(formatCurrency(0.5, 'K')).toBe('$0.5K');
    });

    it('promotes >= 1000 to millions', () => {
      expect(formatCurrency(1200, 'K')).toBe('$1.2M');
      expect(formatCurrency(5000, 'K')).toBe('$5M');
    });

    it('promotes >= 1M to billions', () => {
      expect(formatCurrency(1500000, 'K')).toBe('$1.5B');
    });
  });

  describe('no scale', () => {
    it('formats with comma grouping', () => {
      expect(formatCurrency(1234567)).toBe('$1,234,567');
    });
  });

  describe('custom currency symbol', () => {
    it('uses provided symbol', () => {
      expect(formatCurrency(1200, 'M', '€')).toBe('€1.2B');
      expect(formatCurrency(500, 'M', '£')).toBe('£500M');
    });
  });
});

// ── formatPercent ──────────────────────────────────────────────────────────

describe('formatPercent', () => {
  it('formats percentage values', () => {
    expect(formatPercent(12.3)).toBe('12.3%');
  });

  it('drops trailing zero for whole numbers', () => {
    expect(formatPercent(12.0)).toBe('12%');
    expect(formatPercent(100)).toBe('100%');
  });

  it('detects ratios (0 < |value| < 1) and converts', () => {
    expect(formatPercent(0.15)).toBe('15%');
    expect(formatPercent(0.853)).toBe('85.3%');
  });

  it('treats exactly 1.0 as 1% not 100%', () => {
    expect(formatPercent(1.0)).toBe('1%');
    expect(formatPercent(-1.0)).toBe('-1%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });

  it('handles negative percentages', () => {
    expect(formatPercent(-5.3)).toBe('-5.3%');
  });

  it('handles negative ratios', () => {
    expect(formatPercent(-0.15)).toBe('-15%');
  });
});

// ── resolveMetricUnit ──────────────────────────────────────────────────────

describe('resolveMetricUnit', () => {
  it('detects currency from metric name', () => {
    expect(resolveMetricUnit('Revenue ($M)')).toEqual({ type: 'currency', scale: 'M' });
    expect(resolveMetricUnit('AUM ($B)')).toEqual({ type: 'currency', scale: 'B' });
    expect(resolveMetricUnit('CapEx ($K)')).toEqual({ type: 'currency', scale: 'K' });
  });

  it('detects percent from metric name', () => {
    expect(resolveMetricUnit('EBITDA Margin (%)')).toEqual({ type: 'percent', suffix: '%' });
  });

  it('detects ratio from metric name', () => {
    expect(resolveMetricUnit('Net Leverage (x)')).toEqual({ type: 'ratio', suffix: 'x' });
  });

  it('detects days from metric name', () => {
    expect(resolveMetricUnit('DSO (days)')).toEqual({ type: 'days', suffix: ' days' });
  });

  it('detects years from metric name', () => {
    expect(resolveMetricUnit('Hold Period (years)')).toEqual({ type: 'years', suffix: ' years' });
  });

  it('detects bps from metric name', () => {
    expect(resolveMetricUnit('Spread (bps)')).toEqual({ type: 'bps', suffix: ' bps' });
  });

  it('detects count/score as number', () => {
    expect(resolveMetricUnit('Active Portfolios (Count)')).toEqual({ type: 'number' });
  });

  it('falls back to unitHint', () => {
    expect(resolveMetricUnit('Revenue', '%')).toEqual({ type: 'percent', suffix: '%' });
    expect(resolveMetricUnit('Revenue', 'USD millions')).toEqual({ type: 'currency', scale: 'M' });
    expect(resolveMetricUnit('Revenue', 'bps')).toEqual({ type: 'bps', suffix: ' bps' });
  });

  it('falls back to valueType', () => {
    expect(resolveMetricUnit('Revenue', null, 'percent')).toEqual({ type: 'percent', suffix: '%' });
    expect(resolveMetricUnit('Revenue', null, 'ratio')).toEqual({ type: 'ratio', suffix: 'x' });
    expect(resolveMetricUnit('Revenue', null, 'currency')).toEqual({ type: 'currency' });
    expect(resolveMetricUnit('Revenue', null, 'number')).toEqual({ type: 'number' });
  });

  it('does not false-positive on tokens containing "x"', () => {
    // "max" contains "x" but should not be treated as ratio
    expect(resolveMetricUnit('Expense (max)')).toBeNull();
    expect(resolveMetricUnit('Tax Rate (approx)')).toBeNull();
  });

  it('requires exact "x" token for ratio detection', () => {
    expect(resolveMetricUnit('Net Leverage (x)')).toEqual({ type: 'ratio', suffix: 'x' });
  });

  it('does not false-positive on unitHint substrings', () => {
    // "usd amount" contains "m" in "amount" but should not be scale M
    expect(resolveMetricUnit('Revenue', 'usd amount')).toEqual({ type: 'currency' });
    // "usd combined" contains "b" in "combined" but should not be scale B
    expect(resolveMetricUnit('Revenue', 'usd combined')).toEqual({ type: 'currency' });
  });

  it('does not false-positive "bp" substring in unitHint', () => {
    expect(resolveMetricUnit('Revenue', 'subpart')).toBeNull();
  });

  it('matches full scale words in unitHint', () => {
    expect(resolveMetricUnit('Revenue', 'USD millions')).toEqual({ type: 'currency', scale: 'M' });
    expect(resolveMetricUnit('Revenue', 'USD billions')).toEqual({ type: 'currency', scale: 'B' });
    expect(resolveMetricUnit('Revenue', 'USD thousands')).toEqual({ type: 'currency', scale: 'K' });
  });

  it('returns null for unrecognized metrics', () => {
    expect(resolveMetricUnit('Something')).toBeNull();
  });
});

// ── parseNumeric ───────────────────────────────────────────────────────────

describe('parseNumeric', () => {
  it('parses integers', () => {
    expect(parseNumeric('123')).toBe(123);
  });

  it('parses decimals', () => {
    expect(parseNumeric('12.5')).toBe(12.5);
  });

  it('ignores commas', () => {
    expect(parseNumeric('1,234')).toBe(1234);
    expect(parseNumeric('1,234,567.89')).toBe(1234567.89);
  });

  it('handles negative numbers', () => {
    expect(parseNumeric('-42')).toBe(-42);
  });

  it('extracts numbers from strings with prefix/suffix', () => {
    expect(parseNumeric('$123M')).toBe(123);
    expect(parseNumeric('about 45.6%')).toBe(45.6);
  });

  it('returns null for non-numeric strings', () => {
    expect(parseNumeric('abc')).toBeNull();
    expect(parseNumeric('')).toBeNull();
  });
});

// ── formatMetricValue (main entry point) ───────────────────────────────────

describe('formatMetricValue', () => {
  describe('null and empty handling', () => {
    it('returns empty string for null', () => {
      expect(formatMetricValue('Revenue ($M)', null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatMetricValue('Revenue ($M)', undefined)).toBe('');
    });

    it('returns dash for dash string', () => {
      expect(formatMetricValue('Revenue ($M)', '-')).toBe('-');
    });

    it('returns empty for empty string', () => {
      expect(formatMetricValue('Revenue ($M)', '')).toBe('');
    });
  });

  describe('currency formatting with auto-promotion', () => {
    it('formats $M values', () => {
      expect(formatMetricValue('Revenue ($M)', 875)).toBe('$875M');
      expect(formatMetricValue('Revenue ($M)', 0.5)).toBe('$0.5M');
    });

    it('promotes $M to $B when >= 1000', () => {
      expect(formatMetricValue('Revenue ($M)', 1200)).toBe('$1.2B');
      expect(formatMetricValue('Revenue ($M)', 15000)).toBe('$15B');
    });

    it('formats $B values', () => {
      expect(formatMetricValue('AUM ($B)', 1.2)).toBe('$1.2B');
      expect(formatMetricValue('AUM ($B)', 15)).toBe('$15B');
    });

    it('uses custom currency symbol via options', () => {
      expect(formatMetricValue('Revenue ($M)', 875, { currency: 'EUR' })).toBe('€875M');
      expect(formatMetricValue('Revenue ($M)', 1200, { currency: 'GBP' })).toBe('£1.2B');
    });

    it('uses currency from unitHint', () => {
      expect(formatMetricValue('Revenue', 875, { unitHint: 'USD millions' })).toBe('$875M');
    });
  });

  describe('percentage formatting', () => {
    it('formats percent from metric name', () => {
      expect(formatMetricValue('EBITDA Margin (%)', 12.3)).toBe('12.3%');
      expect(formatMetricValue('EBITDA Margin (%)', 12.0)).toBe('12%');
    });

    it('detects ratio and converts', () => {
      expect(formatMetricValue('Growth Rate (%)', 0.15)).toBe('15%');
    });

    it('formats percent from string input', () => {
      expect(formatMetricValue('EBITDA Margin (%)', '12.3')).toBe('12.3%');
    });
  });

  describe('ratio formatting', () => {
    it('formats ratios', () => {
      expect(formatMetricValue('Net Leverage (x)', 3.5)).toBe('3.5x');
      expect(formatMetricValue('Net Leverage (x)', 1.25)).toBe('1.25x');
    });
  });

  describe('days/years formatting', () => {
    it('formats days', () => {
      expect(formatMetricValue('DSO (days)', 68)).toBe('68 days');
    });

    it('formats years', () => {
      expect(formatMetricValue('Hold Period (years)', 5.5)).toBe('5.5 years');
    });
  });

  describe('bps formatting', () => {
    it('formats basis points', () => {
      expect(formatMetricValue('Spread (bps)', 80)).toBe('80 bps');
    });
  });

  describe('string input parsing', () => {
    it('parses numeric strings', () => {
      expect(formatMetricValue('Revenue ($M)', '1,200')).toBe('$1.2B');
      expect(formatMetricValue('Revenue ($M)', '875')).toBe('$875M');
    });

    it('passes through text with letters when no unit', () => {
      expect(formatMetricValue('Status', 'Active')).toBe('Active');
    });

    it('handles string with currency prefix', () => {
      expect(formatMetricValue('Revenue ($M)', '$500')).toBe('$500M');
    });
  });

  describe('options override', () => {
    it('uses valueType from options', () => {
      expect(formatMetricValue('Revenue', 12.3, { valueType: 'percent' })).toBe('12.3%');
    });

    it('uses unitHint from options', () => {
      expect(formatMetricValue('Revenue', 80, { unitHint: 'bps' })).toBe('80 bps');
    });
  });

  describe('tableMode (suppress scale suffix)', () => {
    it('shows raw number with currency symbol when scale is M', () => {
      expect(formatMetricValue('Revenue ($M)', 22300, { tableMode: true })).toBe('$22,300');
    });

    it('shows raw number with currency symbol when scale is B', () => {
      expect(formatMetricValue('AUM ($B)', 1.2, { tableMode: true })).toBe('$1.2');
    });

    it('shows raw number with currency symbol when scale is K', () => {
      expect(formatMetricValue('CapEx ($K)', 500, { tableMode: true })).toBe('$500');
    });

    it('handles negative values in table mode', () => {
      expect(formatMetricValue('Revenue ($M)', -500, { tableMode: true })).toBe('-$500');
    });

    it('uses custom currency symbol in table mode', () => {
      expect(formatMetricValue('Revenue ($M)', 22300, { tableMode: true, currency: 'EUR' })).toBe('€22,300');
    });

    it('does not affect currency without explicit scale', () => {
      expect(formatMetricValue('Revenue ($)', 1234, { tableMode: true })).toBe('$1,234');
    });

    it('handles zero in table mode with scale', () => {
      expect(formatMetricValue('Revenue ($M)', 0, { tableMode: true })).toBe('$0');
    });

    it('does not affect non-currency types', () => {
      expect(formatMetricValue('EBITDA Margin (%)', 12.3, { tableMode: true })).toBe('12.3%');
      expect(formatMetricValue('Net Leverage (x)', 3.5, { tableMode: true })).toBe('3.5x');
    });

    it('still auto-promotes when tableMode is false', () => {
      expect(formatMetricValue('Revenue ($M)', 22300, { tableMode: false })).toBe('$22.3B');
    });
  });

  describe('edge cases', () => {
    it('formats zero', () => {
      expect(formatMetricValue('Revenue ($M)', 0)).toBe('$0M');
      expect(formatMetricValue('EBITDA Margin (%)', 0)).toBe('0%');
    });

    it('formats negative numbers', () => {
      expect(formatMetricValue('Revenue ($M)', -500)).toBe('-$500M');
      expect(formatMetricValue('Growth Rate (%)', -5.3)).toBe('-5.3%');
    });

    it('falls back to formatNumber for unknown units', () => {
      expect(formatMetricValue('Something', 1234)).toBe('1,234');
    });

    it('handles very small currency values', () => {
      expect(formatMetricValue('Revenue ($M)', 0.1)).toBe('$0.1M');
    });
  });
});
