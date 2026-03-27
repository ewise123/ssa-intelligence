/**
 * Shared rendering helpers used by section-formatter (markdown),
 * docx-section-renderers (DOCX), and the frontend researchManager.
 *
 * Keep in sync with: frontend/src/utils/rendering-helpers.ts
 */

/** Normalize cell values for table display — blanks dashes and N/A. */
export const normalizeCell = (cell: string | number | null | undefined): string => {
  if (cell === null || cell === undefined) return '';
  const s = String(cell).trim();
  if (s === '–' || s === '-' || s === '—' || /^n\/?a$/i.test(s)) return '';
  // Escape pipe characters so they don't break markdown table columns
  return s.replace(/\|/g, '\\|');
};

/** Treat dashes, N/A, and similar placeholders as empty (no real data). */
export const isEmptyValue = (v: any): boolean => {
  if (v == null || v === '') return true;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t === '' || t === '–' || t === '-' || t === '—' || /^n\/?a$/i.test(t)) return true;
  }
  return false;
};

/** Strip inline source references like "(S10)", "(S1, S2)", or "(S1, Section 2)" from display values.
 *  Preserves any trailing period after the source ref. */
export const stripInlineSource = (v: string): string =>
  v.replace(/\s*\((?:S\d+|Section\s+\d+)(?:,\s*(?:S\d+|Section\s+\d+))*\)(\.?)\s*$/, '$1').trim();

/** Detect placeholder names Claude fabricates when no real person can be identified. */
export const isPlaceholderName = (name: string): boolean => {
  if (!name) return true;
  const t = name.trim().toLowerCase();
  return /not (publicly )?(available|disclosed|known|identified)/i.test(t) ||
    /information not available/i.test(t) ||
    /undisclosed/i.test(t) ||
    /unknown/i.test(t) ||
    t === '–' || t === '-' || t === '—' || /^n\/?a$/i.test(t);
};

/** Markdown blockquote notice for sections with insufficient data. */
export const insufficientDataNotice = (reason?: string): string => {
  const lines = ['> **Limited public information available**'];
  if (reason) lines.push('>', `> ${reason}`);
  return lines.join('\n');
};
