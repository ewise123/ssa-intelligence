/**
 * Shared Types - Common types used across all sections
 * of the Company Intelligence Sheet generation system
 */
// ============================================================================
// VALIDATION HELPERS
// ============================================================================
/**
 * Type guard for confidence level
 */
export function isConfidenceLevel(value) {
    return ['HIGH', 'MEDIUM', 'LOW'].includes(value);
}
/**
 * Type guard for FX source
 */
export function isFxSource(value) {
    return ['A', 'B', 'C'].includes(value);
}
/**
 * Type guard for trend direction
 */
export function isTrendDirection(value) {
    return ['Positive', 'Negative', 'Neutral'].includes(value);
}
/**
 * Type guard for priority
 */
export function isPriority(value) {
    return ['High', 'Medium', 'Low'].includes(value);
}
/**
 * Type guard for magnitude
 */
export function isMagnitude(value) {
    return ['Significant', 'Moderate', 'Minor'].includes(value);
}
/**
 * Type guard for source reference
 */
export function isSourceReference(value) {
    return (typeof value === 'object' &&
        typeof value.id === 'string' &&
        typeof value.citation === 'string' &&
        typeof value.type === 'string' &&
        typeof value.date === 'string');
}
/**
 * Type guard for analyst quote
 */
export function isAnalystQuote(value) {
    if (typeof value !== 'object')
        return false;
    // Check quote length (max 15 words)
    const wordCount = value.quote?.split(/\s+/).length || 0;
    if (wordCount > 15)
        return false;
    return (typeof value.quote === 'string' &&
        typeof value.analyst === 'string' &&
        typeof value.firm === 'string' &&
        typeof value.source === 'string');
}
/**
 * Validates impact score is between 1-10
 */
export function isValidImpactScore(score) {
    return typeof score === 'number' && score >= 1 && score <= 10;
}
/**
 * Validates severity score is between 1-10
 */
export function isValidSeverityScore(score) {
    return typeof score === 'number' && score >= 1 && score <= 10;
}
//# sourceMappingURL=shared-types.js.map