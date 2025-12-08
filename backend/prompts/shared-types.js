export function isConfidenceLevel(value) {
    return ['HIGH', 'MEDIUM', 'LOW'].includes(value);
}
export function isFxSource(value) {
    return ['A', 'B', 'C'].includes(value);
}
export function isTrendDirection(value) {
    return ['Positive', 'Negative', 'Neutral'].includes(value);
}
export function isPriority(value) {
    return ['High', 'Medium', 'Low'].includes(value);
}
export function isMagnitude(value) {
    return ['Significant', 'Moderate', 'Minor'].includes(value);
}
export function isSourceReference(value) {
    return (typeof value === 'object' &&
        typeof value.id === 'string' &&
        typeof value.citation === 'string' &&
        typeof value.type === 'string' &&
        typeof value.date === 'string');
}
export function isAnalystQuote(value) {
    if (typeof value !== 'object')
        return false;
    const wordCount = value.quote?.split(/\s+/).length || 0;
    if (wordCount > 15)
        return false;
    return (typeof value.quote === 'string' &&
        typeof value.analyst === 'string' &&
        typeof value.firm === 'string' &&
        typeof value.source === 'string');
}
export function isValidImpactScore(score) {
    return typeof score === 'number' && score >= 1 && score <= 10;
}
export function isValidSeverityScore(score) {
    return typeof score === 'number' && score >= 1 && score <= 10;
}
//# sourceMappingURL=shared-types.js.map