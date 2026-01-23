/**
 * Company Name Resolution API
 * Uses Claude to validate and disambiguate company names
 */

import type { RequestHandler } from 'express';
import { getClaudeClient } from '../../services/claude-client.js';

// ============================================================================
// TYPES
// ============================================================================

interface CompanyResolveRequest {
  input: string;
  context?: {
    geography?: string;
    industry?: string;
    reportType?: string;
  };
}

interface CompanySuggestion {
  canonicalName: string;
  displayName: string;
  description: string;
  domain?: string;
  industry?: string;
  matchScore: number;
}

interface CompanyResolveResponse {
  status: 'exact' | 'corrected' | 'ambiguous' | 'unknown';
  input: string;
  suggestions: CompanySuggestion[];
  confidence: number;
}

// ============================================================================
// HANDLER
// ============================================================================

export const resolveCompany: RequestHandler = async (req, res) => {
  try {
    const body = req.body as CompanyResolveRequest;
    const { input, context } = body;

    // Validate input
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input company name is required' });
    }

    const trimmedInput = input.trim();
    if (trimmedInput.length < 2) {
      return res.status(400).json({ error: 'Input must be at least 2 characters' });
    }
    const MAX_INPUT_LEN = 160;
    if (trimmedInput.length > MAX_INPUT_LEN) {
      return res.status(400).json({ error: `Input must be at most ${MAX_INPUT_LEN} characters` });
    }

    // Build the Claude prompt
    const prompt = buildResolvePrompt(trimmedInput, context);

    // Call Claude with a timeout using Promise.race
    const claude = getClaudeClient();
    const TIMEOUT_MS = 5000;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Company resolution timed out')), TIMEOUT_MS);
    });

    const response = await Promise.race([
      claude.execute(prompt),
      timeoutPromise
    ]);

    // Parse the response
    const result = claude.parseJSON<{
      status: 'exact' | 'corrected' | 'ambiguous' | 'unknown';
      confidence: number;
      suggestions: Array<{
        canonicalName: string;
        displayName: string;
        description: string;
        domain?: string;
        industry?: string;
        matchScore: number;
      }>;
    }>(response, { allowRepair: true });

    // Validate status is one of the expected values
    const VALID_STATUSES = ['exact', 'corrected', 'ambiguous', 'unknown'] as const;
    const parsedStatus = VALID_STATUSES.includes(result.status as any)
      ? result.status
      : 'unknown';

    // Build response
    const resolveResponse: CompanyResolveResponse = {
      status: parsedStatus,
      input: trimmedInput,
      suggestions: (result.suggestions || []).slice(0, 5).map((s) => ({
        canonicalName: s.canonicalName || '',
        displayName: s.displayName || s.canonicalName || '',
        description: s.description || '',
        domain: s.domain,
        industry: s.industry,
        matchScore: typeof s.matchScore === 'number' ? s.matchScore : 0.5
      })),
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5
    };

    return res.json(resolveResponse);
  } catch (error) {
    console.error('Company resolution error:', error);

    // Graceful degradation: return unknown status so frontend can proceed
    return res.json({
      status: 'unknown',
      input: req.body?.input || '',
      suggestions: [],
      confidence: 0
    } as CompanyResolveResponse);
  }
};

// ============================================================================
// HELPERS
// ============================================================================

function escapeForPrompt(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildResolvePrompt(
  input: string,
  context?: { geography?: string; industry?: string; reportType?: string }
): string {
  const escapedInput = escapeForPrompt(input);
  const contextLines: string[] = [];
  if (context?.geography) {
    contextLines.push(`Geography hint: ${escapeForPrompt(context.geography)}`);
  }
  if (context?.industry) {
    contextLines.push(`Industry hint: ${escapeForPrompt(context.industry)}`);
  }
  if (context?.reportType) {
    contextLines.push(`Report type: ${escapeForPrompt(context.reportType)}`);
  }

  const contextSection = contextLines.length > 0 ? contextLines.join('\n') + '\n' : '';

  return `You are a company name resolver. Analyze the input and determine if it matches known companies.

Input: "${escapedInput}"
${contextSection}
Return JSON:
{
  "status": "exact" | "corrected" | "ambiguous" | "unknown",
  "confidence": 0.0-1.0,
  "suggestions": [
    {
      "canonicalName": "Full official company name",
      "displayName": "Short display name",
      "description": "Brief 1-2 sentence description",
      "domain": "company.com",
      "industry": "Industry category",
      "matchScore": 0.0-1.0
    }
  ]
}

Rules:
- "exact": Input matches a well-known company name exactly (high confidence)
- "corrected": Input has a typo or variation (e.g., "Gogle" -> "Google", "Microsft" -> "Microsoft")
- "ambiguous": Input matches multiple distinct companies (e.g., "Apollo" could be Apollo Global Management, Apollo GraphQL, Apollo Hospitals, etc.)
- "unknown": Cannot confidently identify the company
- Maximum 5 suggestions
- Include description to help users distinguish between companies
- For corrected/ambiguous status, always provide at least one suggestion
- For exact matches, provide one suggestion with the canonical name
- matchScore should reflect how well the input matches each suggestion (1.0 = perfect match)

Return only valid JSON, no additional text.`;
}
