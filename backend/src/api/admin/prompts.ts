/**
 * Admin Prompts API
 * CRUD operations for Prompt Library with version history and test execution
 */

import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getClaudeClient } from '../../services/claude-client.js';
import { getCostTrackingService } from '../../services/cost-tracking.js';
import {
  listAllSections,
  listAllPrompts,
  getPromptWithStatus,
  getPromptVersionHistory,
  getCodePromptContent,
  getCodeAddendumContent,
  type SectionId,
  type ReportTypeId
} from '../../services/prompt-resolver.js';

// ============================================================================
// LIST PROMPTS
// ============================================================================

/**
 * GET /api/admin/prompts
 * List all prompts (combines code defaults + DB overrides)
 */
export const listPrompts: RequestHandler = async (req, res) => {
  try {
    const prompts = await listAllPrompts(prisma);

    // Group by section
    const sections = listAllSections();
    const grouped = sections.map(section => {
      const sectionPrompts = prompts.filter(p => p.sectionId === section.id);
      const basePrompt = sectionPrompts.find(p => p.reportType === null);
      const addendums = sectionPrompts.filter(p => p.reportType !== null);

      return {
        ...section,
        basePrompt: basePrompt || null,
        addendums
      };
    });

    return res.json({ sections: grouped });
  } catch (error) {
    console.error('Error listing prompts:', error);
    return res.status(500).json({
      error: 'Failed to list prompts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// GET PROMPT DETAIL
// ============================================================================

/**
 * GET /api/admin/prompts/:sectionId
 * Get prompt detail with versions
 */
export const getPrompt: RequestHandler = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const reportType = req.query.reportType as ReportTypeId | undefined;

    const prompt = await getPromptWithStatus(
      sectionId as SectionId,
      reportType || null,
      prisma
    );

    if (!prompt) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Get version history
    const versions = await getPromptVersionHistory(
      sectionId as SectionId,
      reportType || null,
      prisma
    );

    return res.json({
      prompt,
      versions
    });
  } catch (error) {
    console.error('Error getting prompt:', error);
    return res.status(500).json({
      error: 'Failed to get prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// CREATE/UPDATE PROMPT
// ============================================================================

/**
 * POST /api/admin/prompts
 * Create or update a prompt override (creates new version)
 */
export const createPrompt: RequestHandler = async (req, res) => {
  try {
    const { sectionId, reportType, content, name, description } = req.body;
    const userEmail = (req as any).auth?.email || 'unknown';

    if (!sectionId || typeof sectionId !== 'string') {
      return res.status(400).json({ error: 'sectionId is required' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'content is required' });
    }

    // Find existing prompt to get next version
    const existing = await prisma.prompt.findFirst({
      where: {
        sectionId,
        reportType: reportType || null
      },
      orderBy: { version: 'desc' }
    });

    const nextVersion = existing ? existing.version + 1 : 1;

    // Create new prompt version
    const prompt = await prisma.prompt.create({
      data: {
        sectionId,
        reportType: reportType || null,
        name: name || `${sectionId}${reportType ? ` (${reportType})` : ''}`,
        description: description || null,
        content,
        status: 'draft',
        version: nextVersion,
        createdBy: userEmail,
        updatedBy: userEmail
      }
    });

    // Save to version history
    await prisma.promptVersion.create({
      data: {
        sectionId,
        reportType: reportType || null,
        version: nextVersion,
        content,
        createdBy: userEmail
      }
    });

    return res.status(201).json({ prompt });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return res.status(500).json({
      error: 'Failed to create prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * PATCH /api/admin/prompts/:id
 * Update prompt content (creates new version)
 */
export const updatePrompt: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, name, description } = req.body;
    const userEmail = (req as any).auth?.email || 'unknown';

    const existing = await prisma.prompt.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // If content changed, create new version
    if (content && content !== existing.content) {
      // Get the highest version number for this section/reportType
      const latestVersion = await prisma.prompt.findFirst({
        where: {
          sectionId: existing.sectionId,
          reportType: existing.reportType
        },
        orderBy: { version: 'desc' }
      });

      const nextVersion = (latestVersion?.version || 0) + 1;

      // Only archive if the current prompt is a draft (not published)
      // Published prompts stay published until a new version is explicitly published
      if (existing.status === 'draft') {
        await prisma.prompt.update({
          where: { id },
          data: { status: 'archived' }
        });
      }

      // Create new draft version (coexists with any published version)
      const newPrompt = await prisma.prompt.create({
        data: {
          sectionId: existing.sectionId,
          reportType: existing.reportType,
          name: name || existing.name,
          description: description !== undefined ? description : existing.description,
          content,
          status: 'draft',
          version: nextVersion,
          createdBy: existing.createdBy,
          updatedBy: userEmail
        }
      });

      // Save to version history
      await prisma.promptVersion.create({
        data: {
          sectionId: existing.sectionId,
          reportType: existing.reportType,
          version: nextVersion,
          content,
          createdBy: userEmail
        }
      });

      return res.json({ prompt: newPrompt });
    }

    // Just update metadata
    const updated = await prisma.prompt.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        updatedBy: userEmail
      }
    });

    return res.json({ prompt: updated });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return res.status(500).json({
      error: 'Failed to update prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// DELETE PROMPT
// ============================================================================

/**
 * DELETE /api/admin/prompts/:id
 * Archive prompt override (reverts to code default)
 */
export const deletePrompt: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.prompt.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Archive instead of delete to preserve history
    await prisma.prompt.update({
      where: { id },
      data: { status: 'archived' }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return res.status(500).json({
      error: 'Failed to delete prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// PUBLISH PROMPT
// ============================================================================

/**
 * POST /api/admin/prompts/:id/publish
 * Publish draft prompt
 */
export const publishPrompt: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = (req as any).auth?.email || 'unknown';

    const existing = await prisma.prompt.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    if (existing.status === 'published') {
      return res.status(400).json({ error: 'Prompt is already published' });
    }

    if (existing.status === 'archived') {
      return res.status(400).json({ error: 'Cannot publish archived prompt' });
    }

    // Unpublish any existing published version for this section/reportType
    await prisma.prompt.updateMany({
      where: {
        sectionId: existing.sectionId,
        reportType: existing.reportType,
        status: 'published',
        id: { not: id }
      },
      data: { status: 'archived' }
    });

    // Publish this version
    const published = await prisma.prompt.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        updatedBy: userEmail
      }
    });

    return res.json({ prompt: published });
  } catch (error) {
    console.error('Error publishing prompt:', error);
    return res.status(500).json({
      error: 'Failed to publish prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// REVERT PROMPT
// ============================================================================

/**
 * POST /api/admin/prompts/:id/revert/:version
 * Revert to specific version
 */
export const revertPrompt: RequestHandler = async (req, res) => {
  try {
    const { id, version } = req.params;
    const userEmail = (req as any).auth?.email || 'unknown';
    const versionNum = parseInt(version, 10);

    if (isNaN(versionNum)) {
      return res.status(400).json({ error: 'Invalid version number' });
    }

    const existing = await prisma.prompt.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Find the version to revert to
    const targetVersion = await prisma.promptVersion.findFirst({
      where: {
        sectionId: existing.sectionId,
        reportType: existing.reportType,
        version: versionNum
      }
    });

    if (!targetVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Only archive if the current prompt is a draft (not published)
    // Published prompts stay published until a new version is explicitly published
    if (existing.status === 'draft') {
      await prisma.prompt.update({
        where: { id },
        data: { status: 'archived' }
      });
    }

    // Get next version number
    const latestVersion = await prisma.prompt.findFirst({
      where: {
        sectionId: existing.sectionId,
        reportType: existing.reportType
      },
      orderBy: { version: 'desc' }
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    // Create new draft with reverted content (coexists with any published version)
    const reverted = await prisma.prompt.create({
      data: {
        sectionId: existing.sectionId,
        reportType: existing.reportType,
        name: existing.name,
        description: existing.description,
        content: targetVersion.content,
        status: 'draft',
        version: nextVersion,
        createdBy: existing.createdBy,
        updatedBy: userEmail
      }
    });

    // Save to version history
    await prisma.promptVersion.create({
      data: {
        sectionId: existing.sectionId,
        reportType: existing.reportType,
        version: nextVersion,
        content: targetVersion.content,
        createdBy: userEmail
      }
    });

    return res.json({ prompt: reverted });
  } catch (error) {
    console.error('Error reverting prompt:', error);
    return res.status(500).json({
      error: 'Failed to revert prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// VERSION HISTORY
// ============================================================================

/**
 * GET /api/admin/prompts/:sectionId/versions
 * List version history
 */
export const listVersions: RequestHandler = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const reportType = req.query.reportType as ReportTypeId | undefined;

    const versions = await getPromptVersionHistory(
      sectionId as SectionId,
      reportType || null,
      prisma
    );

    return res.json({ versions });
  } catch (error) {
    console.error('Error listing versions:', error);
    return res.status(500).json({
      error: 'Failed to list versions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// TEST EXECUTION
// ============================================================================

/**
 * POST /api/admin/prompts/test
 * Run test execution with provided prompt
 */
export const testPrompt: RequestHandler = async (req, res) => {
  try {
    const { sectionId, reportType, promptContent, companyName, geography } = req.body;
    const userEmail = (req as any).auth?.email || 'unknown';

    if (!sectionId || typeof sectionId !== 'string') {
      return res.status(400).json({ error: 'sectionId is required' });
    }

    if (!promptContent || typeof promptContent !== 'string') {
      return res.status(400).json({ error: 'promptContent is required' });
    }

    if (!companyName || typeof companyName !== 'string') {
      return res.status(400).json({ error: 'companyName is required' });
    }

    if (!geography || typeof geography !== 'string') {
      return res.status(400).json({ error: 'geography is required' });
    }

    // Create test run record
    const testRun = await prisma.promptTestRun.create({
      data: {
        sectionId,
        reportType: reportType || null,
        promptContent,
        companyName,
        geography,
        status: 'running',
        createdBy: userEmail
      }
    });

    // Execute async (don't await)
    executeTestRun(testRun.id, promptContent, companyName, geography).catch(err => {
      console.error('Test run error:', err);
    });

    return res.status(201).json({ testRun });
  } catch (error) {
    console.error('Error starting test:', error);
    return res.status(500).json({
      error: 'Failed to start test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/admin/prompts/test/:id
 * Get test run result
 */
export const getTestRun: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const testRun = await prisma.promptTestRun.findUnique({
      where: { id }
    });

    if (!testRun) {
      return res.status(404).json({ error: 'Test run not found' });
    }

    return res.json({ testRun });
  } catch (error) {
    console.error('Error getting test run:', error);
    return res.status(500).json({
      error: 'Failed to get test run',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function executeTestRun(
  testRunId: string,
  promptContent: string,
  companyName: string,
  geography: string
) {
  const startTime = Date.now();

  try {
    // Replace placeholders in prompt
    const prompt = promptContent
      .replace(/\{\{companyName\}\}/g, companyName)
      .replace(/\{\{geography\}\}/g, geography)
      .replace(/\$\{companyName\}/g, companyName)
      .replace(/\$\{geography\}/g, geography);

    // Execute with Claude
    const claudeClient = getClaudeClient();
    const response = await claudeClient.execute(prompt);

    const durationMs = Date.now() - startTime;

    // Calculate cost
    const costTrackingService = getCostTrackingService(prisma);
    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5';
    const pricing = await costTrackingService.getPricing('anthropic', model);
    const costUsd = costTrackingService.calculateCost(
      {
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        cacheReadTokens: 0,
        cacheWriteTokens: 0
      },
      pricing
    );

    // Parse output (try JSON first)
    let output: any;
    try {
      output = JSON.parse(response.content);
    } catch {
      output = { rawContent: response.content };
    }

    // Update test run
    await prisma.promptTestRun.update({
      where: { id: testRunId },
      data: {
        status: 'completed',
        output,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        costUsd,
        durationMs,
        completedAt: new Date()
      }
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await prisma.promptTestRun.update({
      where: { id: testRunId },
      data: {
        status: 'failed',
        error: errorMessage,
        durationMs,
        completedAt: new Date()
      }
    });
  }
}
