/**
 * Claude Executor
 * Handles all Claude API calls with streaming support
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  buildFoundationPrompt,
  buildExecSummaryPrompt,
  buildFinancialSnapshotPrompt,
  buildCompanyOverviewPrompt,
  buildSegmentAnalysisPrompt,
  buildTrendsPrompt,
  buildPeerBenchmarkingPrompt,
  buildSkuOpportunitiesPrompt,
  buildRecentNewsPrompt,
  buildConversationStartersPrompt,
  generateAppendix,
} from '../prompts';

import {
  foundationOutputSchema,
  execSummaryOutputSchema,
  financialSnapshotOutputSchema,
  companyOverviewOutputSchema,
  segmentAnalysisOutputSchema,
  trendsOutputSchema,
  peerBenchmarkingOutputSchema,
  skuOpportunitiesOutputSchema,
  recentNewsOutputSchema,
  conversationStartersOutputSchema,
  appendixOutputSchema,
} from '../prompts/validation';

import { validateWithFeedback } from '../prompts/validation';

export class ClaudeExecutor {
  private anthropic: Anthropic;
  
  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey,
    });
  }
  
  /**
   * Execute a section with Claude
   */
  async executeSection(stage: string, input: any): Promise<any> {
    // Build prompt for this stage
    const prompt = this.buildPrompt(stage, input);
    
    // Execute with streaming
    const response = await this.executeWithStreaming(prompt);
    
    // Parse JSON response
    const output = this.parseResponse(response);
    
    return output;
  }
  
  /**
   * Build prompt for a specific stage
   */
  private buildPrompt(stage: string, input: any): string {
    switch (stage) {
      case 'foundation':
        return buildFoundationPrompt({
          companyName: input.companyName,
          geography: input.geography,
          focusAreas: input.focusAreas || [],
          userFiles: input.userFiles || [],
        });
      
      case 'exec_summary':
        return buildExecSummaryPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
          financial_snapshotContext: input.financial_snapshotContext,
          company_overviewContext: input.company_overviewContext,
          segment_analysisContext: input.segment_analysisContext,
          trendsContext: input.trendsContext,
          peer_benchmarkingContext: input.peer_benchmarkingContext,
          sku_opportunitiesContext: input.sku_opportunitiesContext,
          recent_newsContext: input.recent_newsContext,
        });
      
      case 'financial_snapshot':
        return buildFinancialSnapshotPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
        });
      
      case 'company_overview':
        return buildCompanyOverviewPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
        });
      
      case 'segment_analysis':
        return buildSegmentAnalysisPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
          financial_snapshotContext: input.financial_snapshotContext,
        });
      
      case 'trends':
        return buildTrendsPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
          company_overviewContext: input.company_overviewContext,
          segment_analysisContext: input.segment_analysisContext,
        });
      
      case 'peer_benchmarking':
        return buildPeerBenchmarkingPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
          financial_snapshotContext: input.financial_snapshotContext,
        });
      
      case 'sku_opportunities':
        return buildSkuOpportunitiesPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
          trendsContext: input.trendsContext,
          peer_benchmarkingContext: input.peer_benchmarkingContext,
        });
      
      case 'recent_news':
        return buildRecentNewsPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
        });
      
      case 'conversation_starters':
        return buildConversationStartersPrompt({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
          trendsContext: input.trendsContext,
          peer_benchmarkingContext: input.peer_benchmarkingContext,
          sku_opportunitiesContext: input.sku_opportunitiesContext,
        });
      
      case 'appendix':
        // Appendix is auto-generated, not prompted
        return generateAppendix({
          foundation: input.foundation,
          companyName: input.companyName,
          geography: input.geography,
          sections: {
            exec_summary: input.exec_summaryContext,
            financial_snapshot: input.financial_snapshotContext,
            company_overview: input.company_overviewContext,
            segment_analysis: input.segment_analysisContext,
            trends: input.trendsContext,
            peer_benchmarking: input.peer_benchmarkingContext,
            sku_opportunities: input.sku_opportunitiesContext,
            recent_news: input.recent_newsContext,
            conversation_starters: input.conversation_startersContext,
          },
        });
      
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }
  
  /**
   * Execute prompt with streaming API
   */
  private async executeWithStreaming(prompt: string): Promise<string> {
    let fullResponse = '';
    
    const stream = await this.anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });
    
    // Stream content
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullResponse += chunk.delta.text;
      }
    }
    
    return fullResponse;
  }
  
  /**
   * Parse JSON response from Claude
   */
  private parseResponse(response: string): any {
    // Remove markdown code fences if present
    let cleaned = response.trim();
    
    // Remove ```json and ``` if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    
    cleaned = cleaned.trim();
    
    // Parse JSON
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse JSON response:', cleaned.substring(0, 500));
      throw new Error(`Invalid JSON response from Claude: ${error}`);
    }
  }
  
  /**
   * Validate output against schema
   */
  async validateOutput(stage: string, output: any): Promise<any> {
    const schema = this.getSchema(stage);
    
    return validateWithFeedback(
      schema,
      output,
      stage
    );
  }
  
  /**
   * Get validation schema for a stage
   */
  private getSchema(stage: string): any {
    switch (stage) {
      case 'foundation':
        return foundationOutputSchema;
      case 'exec_summary':
        return execSummaryOutputSchema;
      case 'financial_snapshot':
        return financialSnapshotOutputSchema;
      case 'company_overview':
        return companyOverviewOutputSchema;
      case 'segment_analysis':
        return segmentAnalysisOutputSchema;
      case 'trends':
        return trendsOutputSchema;
      case 'peer_benchmarking':
        return peerBenchmarkingOutputSchema;
      case 'sku_opportunities':
        return skuOpportunitiesOutputSchema;
      case 'recent_news':
        return recentNewsOutputSchema;
      case 'conversation_starters':
        return conversationStartersOutputSchema;
      case 'appendix':
        return appendixOutputSchema;
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }
}
