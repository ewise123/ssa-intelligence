import { PrismaClient } from '@prisma/client';
import { getClaudeClient } from './claude-client.js';
import { getCostTrackingService } from './cost-tracking.js';

const normalizeDomain = (value: string | undefined | null): string => {
  if (!value) return '';
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
};

const extractDomain = (raw: string): string | null => {
  if (!raw) return null;
  const candidate = normalizeDomain(raw.split(/\s+/)[0]);
  if (!candidate.includes('.')) return null;
  if (candidate.includes(' ')) return null;
  if (candidate.includes('@')) return null;
  if (candidate.startsWith('http')) return null;
  return candidate;
};

interface InferDomainResult {
  domain: string | null;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function inferDomainForCompany(companyName: string): Promise<InferDomainResult> {
  try {
    if (!companyName || companyName.trim().length < 2) return { domain: null };
    const claude = getClaudeClient();
    const prompt = `
You find the official primary website domain for a company.
Return only the domain, no protocol, no path, no extra words.

Company: "${companyName}"

Answer with just the domain, e.g., "example.com"
`;
    const response = await claude.execute(prompt);
    const domain = extractDomain(response.content.trim());
    return {
      domain,
      usage: {
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
      }
    };
  } catch (err) {
    console.error('Domain inference failed:', err);
    return { domain: null };
  }
}

export async function ensureDomainForJob(prisma: PrismaClient, jobId: string, companyName: string) {
  try {
    const existing = await prisma.researchJob.findUnique({
      where: { id: jobId },
      select: { domain: true, normalizedDomain: true }
    });
    if (!existing || existing.domain) return;

    const result = await inferDomainForCompany(companyName);
    const normalized = normalizeDomain(result.domain);

    // Record cost event for domain inference
    if (result.usage && (result.usage.inputTokens > 0 || result.usage.outputTokens > 0)) {
      try {
        const costTrackingService = getCostTrackingService(prisma);
        const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5';
        await costTrackingService.recordCostEvent({
          jobId,
          stage: 'domain_inference',
          provider: 'anthropic',
          model,
          usage: result.usage,
          metadata: { companyName },
        });
      } catch (costError) {
        console.error('Failed to record cost event for domain inference:', costError);
      }
    }

    if (!normalized) return;

    await prisma.researchJob.update({
      where: { id: jobId },
      data: {
        domain: normalized,
        normalizedDomain: normalized
      }
    });
  } catch (err) {
    console.error(`Failed to store inferred domain for job ${jobId}:`, err);
  }
}
