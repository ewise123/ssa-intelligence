/**
 * Section 10: Appendix - TypeScript Implementation
 * Auto-generates from all completed sections
 */

import type { FoundationOutput } from './types.js';

// ============================================================================
// INPUT TYPES
// ============================================================================

// Generic section output with sources
interface SectionWithSources {
  sources_used?: string[];
  derived_metrics?: Array<{
    metric: string;
    formula: string;
    calculation: string;
    source: string;
  }>;
  fx_source?: string;
  industry_source?: string;
}

export interface Section10Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  sections: {
    section1?: SectionWithSources;
    section2?: SectionWithSources;
    section3?: SectionWithSources;
    section4?: SectionWithSources & {
      segments?: Array<{
        financial_snapshot?: {
          fx_source?: string;
          table?: Array<any>;
        };
      }>;
    };
    section5?: SectionWithSources;
    section6?: SectionWithSources;
    section7?: SectionWithSources;
    section8?: SectionWithSources;
    section9?: SectionWithSources;
  };
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface SourceReference {
  id: string;
  citation: string;
  url?: string;
  type: string;
  date: string;
  sections_used_in: string[];
}

export interface FXRate {
  currency_pair: string;
  rate: number;
  source: 'A' | 'B' | 'C';
  source_description: string;
}

export interface DerivedMetric {
  metric: string;
  formula: string;
  calculation: string;
  source: string;
  section: string;
}

export interface Section10Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  source_references: SourceReference[];
  
  fx_rates_and_industry: {
    fx_rates: FXRate[];
    industry_averages: {
      source: 'A' | 'B' | 'C';
      dataset: string;
      description: string;
    };
  };
  
  derived_metrics: DerivedMetric[];
  
  renumbering_notes?: string;
}

// ============================================================================
// AUTO-GENERATION LOGIC
// ============================================================================

/**
 * Main function to auto-generate Section 10 from all completed sections
 */
export function generateAppendix(input: Section10Input): Section10Output {
  const { foundation, sections } = input;
  
  // Step 1: Collect and consolidate sources
  const sourceReferences = consolidateSources(foundation, sections);
  
  // Step 2: Collect FX rates
  const fxRates = collectFXRates(foundation, sections);
  
  // Step 3: Collect industry averages
  const industryAverages = collectIndustryAverages(foundation, sections);
  
  // Step 4: Collect derived metrics
  const derivedMetrics = collectDerivedMetrics(sections);
  
  // Step 5: Assess confidence
  const confidence = assessConfidence(sourceReferences, fxRates, derivedMetrics);
  
  return {
    confidence,
    source_references: sourceReferences,
    fx_rates_and_industry: {
      fx_rates: fxRates,
      industry_averages: industryAverages
    },
    derived_metrics: derivedMetrics,
    renumbering_notes: undefined // Set if sources were renumbered
  };
}

/**
 * Consolidates sources from foundation and all sections
 */
function consolidateSources(
  foundation: FoundationOutput,
  sections: Section10Input['sections']
): SourceReference[] {
  // Start with foundation sources
  const sourceMap = new Map<string, SourceReference>();
  
  for (const source of foundation.source_catalog) {
    sourceMap.set(source.id, {
      ...source,
      sections_used_in: []
    });
  }
  
  // Track which sections use each source
  const sectionNames = [
    'Section 1',
    'Section 2',
    'Section 3',
    'Section 4',
    'Section 5',
    'Section 6',
    'Section 7',
    'Section 8',
    'Section 9'
  ];
  
  Object.entries(sections).forEach(([key, section], index) => {
    if (!section || !section.sources_used) return;
    
    const sectionName = sectionNames[index];
    
    for (const sourceId of section.sources_used) {
      const existing = sourceMap.get(sourceId);
      if (existing) {
        existing.sections_used_in.push(sectionName);
      } else {
        // New source not in foundation - add with limited info
        sourceMap.set(sourceId, {
          id: sourceId,
          citation: `[Citation needed - referenced in ${sectionName}]`,
          type: 'unknown',
          date: 'Unknown',
          sections_used_in: [sectionName]
        });
      }
    }
  });
  
  // Convert to array and sort by ID
  return Array.from(sourceMap.values()).sort((a, b) => {
    const numA = parseInt(a.id.substring(1));
    const numB = parseInt(b.id.substring(1));
    return numA - numB;
  });
}

/**
 * Collects all FX rates used
 */
function collectFXRates(
  foundation: FoundationOutput,
  sections: Section10Input['sections']
): FXRate[] {
  const rates: FXRate[] = [];
  
  // Add foundation FX rates
  for (const [pair, rateInfo] of Object.entries(foundation.fx_rates)) {
    rates.push({
      currency_pair: pair,
      rate: rateInfo.rate,
      source: rateInfo.source,
      source_description: getSourceDescription(rateInfo.source)
    });
  }
  
  // Could add additional rates from sections if needed
  
  return rates;
}

/**
 * Collects industry averages
 */
function collectIndustryAverages(
  foundation: FoundationOutput,
  sections: Section10Input['sections']
): {source: 'A' | 'B' | 'C'; dataset: string; description: string} {
  // Use foundation as primary source
  const source = foundation.industry_averages.source;
  const dataset = foundation.industry_averages.dataset;
  
  return {
    source,
    dataset,
    description: getIndustrySourceDescription(source, dataset)
  };
}

/**
 * Collects all derived metrics from sections
 */
function collectDerivedMetrics(
  sections: Section10Input['sections']
): DerivedMetric[] {
  const metrics: DerivedMetric[] = [];
  
  // Section 2 derived metrics
  if (sections.section2?.derived_metrics) {
    for (const metric of sections.section2.derived_metrics) {
      metrics.push({
        ...metric,
        section: 'Section 2'
      });
    }
  }
  
  // Section 4 segment-level metrics
  if (sections.section4?.derived_metrics) {
    for (const metric of sections.section4.derived_metrics) {
      metrics.push({
        ...metric,
        section: 'Section 4'
      });
    }
  }
  
  // Section 6 benchmarking calculations
  if (sections.section6?.derived_metrics) {
    for (const metric of sections.section6.derived_metrics) {
      metrics.push({
        ...metric,
        section: 'Section 6'
      });
    }
  }
  
  return metrics;
}

/**
 * Assesses confidence based on completeness
 */
function assessConfidence(
  sources: SourceReference[],
  fxRates: FXRate[],
  derivedMetrics: DerivedMetric[]
): {level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string} {
  const incompleteSources = sources.filter(s => 
    s.citation.includes('[Citation needed]')
  ).length;
  
  const missingCalculations = derivedMetrics.filter(m => 
    !m.calculation || m.calculation.length < 10
  ).length;
  
  if (incompleteSources === 0 && missingCalculations === 0) {
    return {
      level: 'HIGH',
      reason: 'All sources fully documented with complete citations; all derived metrics have detailed calculations'
    };
  }
  
  if (incompleteSources <= 2 && missingCalculations <= 2) {
    return {
      level: 'MEDIUM',
      reason: `${incompleteSources} source(s) with incomplete citations; ${missingCalculations} metric(s) with limited calculation detail`
    };
  }
  
  return {
    level: 'LOW',
    reason: `${incompleteSources} source(s) with incomplete citations; ${missingCalculations} metric(s) lacking calculation detail`
  };
}

/**
 * Helper to get FX source description
 */
function getSourceDescription(source: 'A' | 'B' | 'C'): string {
  switch (source) {
    case 'A': return 'Company-disclosed average rate';
    case 'B': return 'Bloomberg/Reuters historical average';
    case 'C': return 'Current spot rate';
  }
}

/**
 * Helper to get industry source description
 */
function getIndustrySourceDescription(
  source: 'A' | 'B' | 'C',
  dataset: string
): string {
  switch (source) {
    case 'A': return `True industry average from ${dataset}`;
    case 'B': return `Peer set average (calculated from comparable companies)`;
    case 'C': return `Estimated industry average from ${dataset}`;
  }
}

// ============================================================================
// PROMPT BUILDER (for cases where manual generation needed)
// ============================================================================

export function buildSection10Prompt(input: Section10Input): string {
  const { foundation, companyName, geography, sections } = input;
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  const sectionsJson = JSON.stringify(sections, null, 2);
  
  const completedSections = Object.keys(sections)
    .map(k => k.replace('section', 'Section '))
    .join(', ');
  
  return `# Section 10: Appendix - Auto-Generation Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 10 (Appendix) by consolidating sources, FX rates, industry averages, and derived metrics from ALL completed sections for **${companyName}** in **${geography}**.

---

## INPUT CONTEXT

### Required: Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### Required: ALL Completed Sections

\`\`\`json
${sectionsJson}
\`\`\`

**Completed sections:** ${completedSections}

---

## AUTO-GENERATION LOGIC

1. **Collect all unique sources** from foundation and sections
2. **De-duplicate** by source ID
3. **Track** which sections use each source
4. **Consolidate FX rates** from foundation and sections
5. **Consolidate industry averages** from foundation and sections
6. **Collect derived metrics** from all sections
7. **Organize** by subsection (10.1, 10.2, 10.3)

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

[See prompt documentation for full schema]

---

## VALIDATION CHECKLIST

- [ ] All sources from sections included
- [ ] Sources de-duplicated
- [ ] Complete citations
- [ ] Sections_used_in populated
- [ ] All FX rates documented
- [ ] All derived metrics have formulas
- [ ] Calculations with actual numbers

---

## BEGIN AUTO-GENERATION

**Company:** ${companyName}  
**Geography:** ${geography}

**OUTPUT ONLY VALID JSON. AUTO-GENERATE APPENDIX NOW.**
`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection10Output(output: any): output is Section10Output {
  if (!output || typeof output !== 'object') return false;
  
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  if (!Array.isArray(output.source_references)) return false;
  if (!output.fx_rates_and_industry) return false;
  if (!Array.isArray(output.fx_rates_and_industry.fx_rates)) return false;
  if (!Array.isArray(output.derived_metrics)) return false;
  
  return true;
}

export function formatSection10ForDocument(output: Section10Output): string {
  let markdown = `# 10. Appendix\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
  
  // 10.1 Source References
  markdown += `## 10.1 Source References\n\n`;
  
  for (const source of output.source_references) {
    markdown += `**${source.id}:** ${source.citation}`;
    if (source.url) markdown += ` ${source.url}`;
    markdown += ` [Used in: ${source.sections_used_in.join(', ')}]\n\n`;
  }
  
  // 10.2 FX Rates & Industry Averages
  markdown += `## 10.2 FX Rates & Industry Averages\n\n`;
  markdown += `**FX Rates Used:**\n\n`;
  
  for (const rate of output.fx_rates_and_industry.fx_rates) {
    markdown += `- ${rate.currency_pair}: ${rate.rate} (${rate.source_description}) [Source: ${rate.source}]\n`;
  }
  
  markdown += `\n**Industry Averages:**\n\n`;
  const ia = output.fx_rates_and_industry.industry_averages;
  markdown += `- ${ia.description} [Source: ${ia.source}]\n\n`;
  
  // 10.3 Derived Metrics
  markdown += `## 10.3 Derived Metrics Footnotes\n\n`;
  
  for (let i = 0; i < output.derived_metrics.length; i++) {
    const metric = output.derived_metrics[i];
    markdown += `${i + 1}. **${metric.metric}** = ${metric.formula}\n`;
    markdown += `   - ${metric.calculation}\n`;
    markdown += `   - Source: ${metric.source}\n`;
    markdown += `   - Used in: ${metric.section}\n\n`;
  }
  
  if (output.renumbering_notes) {
    markdown += `**Note:** ${output.renumbering_notes}\n\n`;
  }
  
  return markdown;
}

/**
 * Gets sources by type
 */
export function getSourcesByType(
  output: Section10Output,
  type: string
): SourceReference[] {
  return output.source_references.filter(s => s.type === type);
}

/**
 * Gets sources used in specific section
 */
export function getSourcesBySection(
  output: Section10Output,
  sectionName: string
): SourceReference[] {
  return output.source_references.filter(s =>
    s.sections_used_in.includes(sectionName)
  );
}
