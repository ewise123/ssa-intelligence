/**
 * Source Resolver
 * Converts S# source references to full ResearchSource objects with URLs
 */

import { FoundationOutput, SourceReference } from '../prompts/types';

export interface ResearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export class SourceResolver {
  private sourceCatalog: Map<string, SourceReference>;
  
  constructor(foundation: FoundationOutput) {
    this.sourceCatalog = new Map();
    
    // Load foundation source catalog
    if (foundation.source_catalog) {
      foundation.source_catalog.forEach(source => {
        this.sourceCatalog.set(source.id, source);
      });
    }
  }
  
  /**
   * Resolve source IDs to ResearchSource format for UI
   */
  resolveSources(sourceIds: string[]): ResearchSource[] {
    const resolved: ResearchSource[] = [];
    
    for (const id of sourceIds) {
      const source = this.sourceCatalog.get(id);
      
      if (source) {
        resolved.push({
          title: this.formatSourceTitle(source),
          url: source.url || '#',
          snippet: this.createSnippet(source),
        });
      } else {
        // Source not found - show ID as fallback
        resolved.push({
          title: id,
          url: '#',
          snippet: 'Source details not available',
        });
      }
    }
    
    return resolved;
  }
  
  /**
   * Resolve a single source ID
   */
  resolveSource(sourceId: string): ResearchSource | null {
    const sources = this.resolveSources([sourceId]);
    return sources.length > 0 ? sources[0] : null;
  }
  
  /**
   * Get all sources from catalog
   */
  getAllSources(): ResearchSource[] {
    const allIds = Array.from(this.sourceCatalog.keys());
    return this.resolveSources(allIds);
  }
  
  /**
   * Format source title for display
   */
  private formatSourceTitle(source: SourceReference): string {
    // Extract key info from citation
    const citation = source.citation;
    
    // Try to extract company/document name from citation
    // Example formats:
    // "Parker Hannifin Corporation, Form 10-K (2023)"
    // "Goldman Sachs Research Report - Parker Hannifin (2024)"
    // "Reuters: Parker Hannifin Q3 Earnings"
    
    // Use citation as-is, but limit length for UI
    if (citation.length > 60) {
      return citation.substring(0, 57) + '...';
    }
    
    return citation;
  }
  
  /**
   * Create snippet for source
   */
  private createSnippet(source: SourceReference): string {
    // Build snippet from available metadata
    const parts: string[] = [];
    
    // Add type
    if (source.type) {
      parts.push(this.formatSourceType(source.type));
    }
    
    // Add date
    if (source.date) {
      parts.push(source.date);
    }
    
    return parts.join(' • ');
  }
  
  /**
   * Format source type for display
   */
  private formatSourceType(type: string): string {
    const typeMap: Record<string, string> = {
      'filing': 'SEC Filing',
      'transcript': 'Earnings Transcript',
      'analyst_report': 'Analyst Report',
      'news': 'News Article',
      'user_provided': 'User Document',
      'government': 'Government Data',
    };
    
    return typeMap[type] || type;
  }
  
  /**
   * Extract source IDs from markdown content
   */
  extractSourceIdsFromContent(content: string): string[] {
    // Find all S# references in content
    // Matches: (S1), (S2, S3), (S10), etc.
    const regex = /\(S(\d+)(?:,\s*S(\d+))*\)/g;
    const matches = content.matchAll(regex);
    
    const sourceIds = new Set<string>();
    
    for (const match of matches) {
      // Extract all S# from the match
      const fullMatch = match[0];
      const numbers = fullMatch.match(/S\d+/g) || [];
      numbers.forEach(num => sourceIds.add(num));
    }
    
    return Array.from(sourceIds);
  }
  
  /**
   * Replace S# references in markdown with clickable links
   */
  replaceSources InContentWithLinks(content: string): string {
    // This would be used if rendering on backend
    // For now, frontend will handle this
    
    return content.replace(/\(S(\d+)\)/g, (match, num) => {
      const sourceId = `S${num}`;
      const source = this.sourceCatalog.get(sourceId);
      
      if (source && source.url) {
        return `[${match}](${source.url})`;
      }
      
      return match;
    });
  }
}

/**
 * Transform section output for UI consumption
 */
export function transformSectionForUI(
  sectionOutput: any,
  foundation: FoundationOutput
): {
  content: string;
  sources: ResearchSource[];
  confidence: number;
} {
  const resolver = new SourceResolver(foundation);
  
  // Extract markdown content
  let content = '';
  if (typeof sectionOutput === 'string') {
    content = sectionOutput;
  } else if (sectionOutput.content) {
    content = sectionOutput.content;
  } else {
    // Convert JSON to markdown-like format
    content = JSON.stringify(sectionOutput, null, 2);
  }
  
  // Extract source IDs from content and sources_used
  const sourceIdsFromContent = resolver.extractSourceIdsFromContent(content);
  const sourceIdsFromField = sectionOutput.sources_used || [];
  const allSourceIds = [...new Set([...sourceIdsFromContent, ...sourceIdsFromField])];
  
  // Resolve to full source objects
  const sources = resolver.resolveSources(allSourceIds);
  
  // Extract confidence
  let confidence = 0.6; // Default
  if (sectionOutput.confidence) {
    if (typeof sectionOutput.confidence === 'object' && sectionOutput.confidence.level) {
      const level = sectionOutput.confidence.level.toUpperCase();
      confidence = level === 'HIGH' ? 0.9 : level === 'MEDIUM' ? 0.6 : 0.4;
    } else if (typeof sectionOutput.confidence === 'number') {
      confidence = sectionOutput.confidence;
    }
  }
  
  return {
    content,
    sources,
    confidence,
  };
}
