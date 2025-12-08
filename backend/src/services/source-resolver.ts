/**
 * Source Resolver
 * Converts S# references to full source details with URLs
 */

import type { FoundationOutput, SourceReference } from '../types/prompts';

// ============================================================================
// TYPES
// ============================================================================

export interface ResolvedSource {
  id: string;           // "S1", "S2", etc.
  title: string;        // Display title
  url: string;          // Clickable URL
  citation: string;     // Full citation
  type: string;         // Source type
  date: string;         // Date string
}

export interface SourceCatalog {
  sources: Map<string, SourceReference>;
  getSource: (id: string) => SourceReference | undefined;
  resolveSource: (id: string) => ResolvedSource | undefined;
  resolveSources: (ids: string[]) => ResolvedSource[];
  getAllSources: () => ResolvedSource[];
}

// ============================================================================
// SOURCE CATALOG CLASS
// ============================================================================

export class SourceCatalogManager implements SourceCatalog {
  public sources: Map<string, SourceReference>;

  constructor(foundation: FoundationOutput) {
    this.sources = new Map();
    
    // Load sources from foundation
    if (foundation.source_catalog) {
      for (const source of foundation.source_catalog) {
        this.sources.set(source.id, source);
      }
    }
  }

  /**
   * Get raw source reference by ID
   */
  getSource(id: string): SourceReference | undefined {
    return this.sources.get(id);
  }

  /**
   * Resolve a single source ID to full details
   */
  resolveSource(id: string): ResolvedSource | undefined {
    const source = this.sources.get(id);
    if (!source) return undefined;

    return {
      id: source.id,
      title: this.extractTitle(source.citation),
      url: source.url || '#',
      citation: source.citation,
      type: source.type,
      date: source.date
    };
  }

  /**
   * Resolve multiple source IDs
   */
  resolveSources(ids: string[]): ResolvedSource[] {
    return ids
      .map(id => this.resolveSource(id))
      .filter((source): source is ResolvedSource => source !== undefined);
  }

  /**
   * Get all sources as resolved format
   */
  getAllSources(): ResolvedSource[] {
    return Array.from(this.sources.values()).map(source => ({
      id: source.id,
      title: this.extractTitle(source.citation),
      url: source.url || '#',
      citation: source.citation,
      type: source.type,
      date: source.date
    }));
  }

  /**
   * Add a new source to catalog (for sections that add sources)
   */
  addSource(source: SourceReference): void {
    this.sources.set(source.id, source);
  }

  /**
   * Extract display title from citation
   */
  private extractTitle(citation: string): string {
    // Try to extract title from citation
    // Common patterns: "Title" (Author, Year) or "Title" - Publisher
    
    // Pattern 1: Quoted title
    const quotedMatch = citation.match(/"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1];
    }

    // Pattern 2: Title before dash
    const dashMatch = citation.match(/^([^-]+)\s*-/);
    if (dashMatch) {
      return dashMatch[1].trim();
    }

    // Pattern 3: Title before comma
    const commaMatch = citation.match(/^([^,]+),/);
    if (commaMatch) {
      return commaMatch[1].trim();
    }

    // Fallback: Use first 50 characters
    return citation.length > 50 
      ? citation.substring(0, 50) + '...'
      : citation;
  }

  /**
   * Group sources by type
   */
  getSourcesByType(): Map<string, ResolvedSource[]> {
    const groups = new Map<string, ResolvedSource[]>();
    
    for (const source of this.getAllSources()) {
      const existing = groups.get(source.type) || [];
      existing.push(source);
      groups.set(source.type, existing);
    }

    return groups;
  }

  /**
   * Get sources used by a specific section
   */
  getSourcesForSection(sectionOutput: any): ResolvedSource[] {
    const sourceIds = sectionOutput?.sources_used || [];
    return this.resolveSources(sourceIds);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract source IDs from markdown content
 * Looks for patterns like (S1), (S2, S3), etc.
 */
export function extractSourceIdsFromMarkdown(content: string): string[] {
  const sourcePattern = /\(S\d+(?:,\s*S\d+)*\)/g;
  const matches = content.match(sourcePattern) || [];
  
  const ids = new Set<string>();
  for (const match of matches) {
    // Extract individual source IDs
    const innerIds = match
      .replace(/[()]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.startsWith('S'));
    
    innerIds.forEach(id => ids.add(id));
  }

  return Array.from(ids).sort((a, b) => {
    const numA = parseInt(a.substring(1));
    const numB = parseInt(b.substring(1));
    return numA - numB;
  });
}

/**
 * Replace source IDs in markdown with clickable links
 */
export function linkifySourcesInMarkdown(
  content: string,
  catalog: SourceCatalog
): string {
  const sourcePattern = /\(S(\d+)\)/g;
  
  return content.replace(sourcePattern, (match, num) => {
    const sourceId = `S${num}`;
    const source = catalog.resolveSource(sourceId);
    
    if (source && source.url && source.url !== '#') {
      return `([${sourceId}](${source.url}))`;
    }
    
    return match;
  });
}

/**
 * Deduplicate sources (for appendix generation)
 */
export function deduplicateSources(sources: SourceReference[]): SourceReference[] {
  const seen = new Map<string, SourceReference>();
  
  for (const source of sources) {
    // Normalize citation for comparison
    const normalized = source.citation
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!seen.has(normalized)) {
      seen.set(normalized, source);
    } else {
      // If duplicate found, prefer the one with lower ID number
      const existing = seen.get(normalized)!;
      const existingNum = parseInt(existing.id.substring(1));
      const newNum = parseInt(source.id.substring(1));
      
      if (newNum < existingNum) {
        seen.set(normalized, source);
      }
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Create catalog from foundation output
 */
export function createSourceCatalog(foundation: FoundationOutput): SourceCatalogManager {
  return new SourceCatalogManager(foundation);
}
