/**
 * Shared metric formatting module (frontend copy).
 * Provides consistent formatting for currency, percentage, ratio, and other
 * metric types across rendering pipelines.
 *
 * Keep in sync with: backend/src/services/metric-formatter.ts
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type MetricUnitType =
  | 'currency'
  | 'percent'
  | 'ratio'
  | 'days'
  | 'years'
  | 'number'
  | 'bps';

export type MetricUnit = {
  type: MetricUnitType;
  suffix?: string;
  scale?: 'K' | 'M' | 'B';
};

export interface FormatMetricOptions {
  unitHint?: string | null;
  valueType?: string | null;
  currency?: string | null; // ISO 4217
}

// ── Currency Symbols ───────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  INR: '₹',
  BRL: 'R$',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF ',
  MXN: 'Mex$',
  ZAR: 'R',
  SGD: 'S$',
  HKD: 'HK$',
  TWD: 'NT$',
  THB: '฿',
};

export function currencySymbol(isoCode?: string | null): string {
  if (!isoCode) return '$';
  const upper = isoCode.toUpperCase();
  return CURRENCY_SYMBOLS[upper] ?? `${upper} `;
}

// ── Low-level Formatters ───────────────────────────────────────────────────

const fmt2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

/**
 * Format a number with comma grouping and up to 2 decimal places.
 * Uses en-US locale explicitly for consistency across environments.
 */
export function formatNumber(value: number): string {
  return fmt2.format(value);
}

/**
 * Format to N decimals and strip trailing ".0" for whole numbers.
 */
function trimDecimal(value: number, decimals: number = 1): string {
  if (decimals === 0) return String(Math.round(value));
  const fixed = value.toFixed(decimals);
  return fixed.endsWith('.0') ? String(Math.round(value)) : fixed;
}

/**
 * Format a currency value with auto-promotion between K → M → B.
 *
 * Examples (scale = 'M'):
 *   0.5   → "$0.5M"
 *   875   → "$875M"
 *   1200  → "$1.2B"
 *   15000 → "$15B"
 */
export function formatCurrency(
  value: number,
  scale?: 'K' | 'M' | 'B',
  symbol: string = '$',
): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (!scale) {
    return `${sign}${symbol}${formatNumber(abs)}`;
  }

  switch (scale) {
    case 'K': {
      if (abs >= 1_000_000_000) return `${sign}${symbol}${trimDecimal(abs / 1_000_000_000)}T`;
      if (abs >= 1_000_000) return `${sign}${symbol}${trimDecimal(abs / 1_000_000)}B`;
      if (abs >= 1_000) return `${sign}${symbol}${trimDecimal(abs / 1_000)}M`;
      return `${sign}${symbol}${trimDecimal(abs, abs < 1 ? 1 : 0)}K`;
    }
    case 'M': {
      if (abs >= 1_000_000) return `${sign}${symbol}${trimDecimal(abs / 1_000_000)}T`;
      if (abs >= 1_000) return `${sign}${symbol}${trimDecimal(abs / 1_000)}B`;
      return `${sign}${symbol}${trimDecimal(abs)}M`;
    }
    case 'B': {
      if (abs >= 1_000) return `${sign}${symbol}${trimDecimal(abs / 1_000)}T`;
      return `${sign}${symbol}${trimDecimal(abs)}B`;
    }
  }
}

/**
 * Format a percentage value.
 * Detects ratios (0 < |value| <= 1) and converts to percentage.
 * Uses 1 decimal, strips trailing zero for whole numbers.
 */
export function formatPercent(value: number): string {
  const pct = Math.abs(value) > 0 && Math.abs(value) < 1 ? value * 100 : value;
  const fixed = pct.toFixed(1);
  const display = fixed.endsWith('.0') ? String(Math.round(pct)) : fixed;
  return `${display}%`;
}

// ── Unit Resolution ────────────────────────────────────────────────────────

/**
 * Parse metric name, unit hint, and value type to determine the metric unit.
 * Checks parenthesized tokens in metric name first (e.g., "Revenue ($M)"),
 * then falls back to unitHint and valueType fields.
 */
export function resolveMetricUnit(
  metricName: string,
  unitHint?: string | null,
  valueType?: string | null,
): MetricUnit | null {
  // Allow trailing footnote markers like * or ** after the closing paren
  const match = metricName.match(/\(([^)]+)\)\s*\**\s*$/);
  const token = match?.[1]?.toLowerCase();

  if (token) {
    if (token.includes('bps') || token === 'bp') return { type: 'bps', suffix: ' bps' };
    if (token.includes('%') || token.includes('percent')) return { type: 'percent', suffix: '%' };
    if (token === 'x') return { type: 'ratio', suffix: 'x' };
    if (token.includes('day')) return { type: 'days', suffix: ' days' };
    if (token.includes('year')) return { type: 'years', suffix: ' years' };
    if (token.includes('count') || token.includes('score')) return { type: 'number' };
    if (token.includes('$b')) return { type: 'currency', scale: 'B' };
    if (token.includes('$m')) return { type: 'currency', scale: 'M' };
    if (token.includes('$k')) return { type: 'currency', scale: 'K' };
    if (token.includes('$')) return { type: 'currency' };
  }

  const normalizedUnit = unitHint?.toLowerCase();
  if (normalizedUnit) {
    const hasCurrencyIndicator =
      normalizedUnit.includes('$') || /\b[a-z]{3}\b/.test(normalizedUnit);

    if (normalizedUnit.includes('%') || normalizedUnit.includes('percent')) return { type: 'percent', suffix: '%' };
    if (/\bbps?\b/.test(normalizedUnit)) return { type: 'bps', suffix: ' bps' };
    if (normalizedUnit.includes('day')) return { type: 'days', suffix: ' days' };
    if (normalizedUnit.includes('year')) return { type: 'years', suffix: ' years' };
    if (normalizedUnit.includes('count') || normalizedUnit.includes('score')) return { type: 'number' };
    if (hasCurrencyIndicator && /\bbillion/.test(normalizedUnit)) return { type: 'currency', scale: 'B' };
    if (hasCurrencyIndicator && /\bmillion/.test(normalizedUnit)) return { type: 'currency', scale: 'M' };
    if (hasCurrencyIndicator && /\bthousand/.test(normalizedUnit)) return { type: 'currency', scale: 'K' };
    if (hasCurrencyIndicator) return { type: 'currency' };
  }

  const normalizedType = valueType?.toLowerCase();
  if (normalizedType === 'percent') return { type: 'percent', suffix: '%' };
  if (normalizedType === 'ratio') return { type: 'ratio', suffix: 'x' };
  if (normalizedType === 'number') return { type: 'number' };
  if (normalizedType === 'currency') return { type: 'currency' };

  return null;
}

// ── Numeric Extraction ─────────────────────────────────────────────────────

/**
 * Extract a numeric value from a string, ignoring commas and non-numeric chars.
 * Handles accounting-format negatives like (1,234.5).
 */
export function parseNumeric(raw: string): number | null {
  const trimmed = raw.trim();
  const isParenNegative = /^\(.+\)$/.test(trimmed);
  const normalized = isParenNegative ? trimmed.slice(1, -1) : trimmed;
  const cleaned = normalized.replace(/,/g, '');
  const match = cleaned.match(/-?(?:\d+\.?\d*|\.\d+)/);
  if (!match) return null;
  const num = Number.parseFloat(match[0]);
  if (Number.isNaN(num)) return null;
  return isParenNegative ? -Math.abs(num) : num;
}

// ── Main Entry Point ───────────────────────────────────────────────────────

/**
 * Format a metric value for display, using the metric name and optional
 * metadata to determine the correct unit and formatting.
 *
 * @param metricName - The metric name, may include unit hint in parens e.g. "Revenue ($M)"
 * @param raw - The raw value (number, string, or null)
 * @param options - Optional unit/currency overrides
 */
export function formatMetricValue(
  metricName: string,
  raw: unknown,
  options?: FormatMetricOptions,
): string {
  if (raw === null || raw === undefined) return '';

  const unit = resolveMetricUnit(metricName, options?.unitHint, options?.valueType);

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '-') return '-';
    if (trimmed === '') return '';
    const hasLetters = /[a-z]/i.test(trimmed);
    if (hasLetters && !unit) return trimmed;
  }

  const numeric =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? parseNumeric(raw)
        : null;

  if (numeric === null) {
    return typeof raw === 'string' ? raw.trim() : String(raw);
  }

  if (!unit) return formatNumber(numeric);

  switch (unit.type) {
    case 'percent':
      return formatPercent(numeric);
    case 'bps':
      return `${formatNumber(numeric)}${unit.suffix ?? ' bps'}`;
    case 'ratio':
      return `${formatNumber(numeric)}${unit.suffix ?? 'x'}`;
    case 'days':
      return `${formatNumber(numeric)}${unit.suffix ?? ' days'}`;
    case 'years':
      return `${formatNumber(numeric)}${unit.suffix ?? ' years'}`;
    case 'currency': {
      const symbol = currencySymbol(options?.currency);
      return formatCurrency(numeric, unit.scale, symbol);
    }
    case 'number':
    default:
      return formatNumber(numeric);
  }
}
