/**
 * Research Orchestrator
 * Manages execution of foundation + 10 sections with dependency resolution
 */

import { PrismaClient } from '@prisma/client';
import { ClaudeExecutor } from './claudeExecutor';
import { SourceCatalog } from './sourceCatalog';
import { ProgressTracker } from './progressTracker';
import { FoundationOutput } from '../prompts/types';

const prisma = new PrismaClient();

// Section execution order with dependencies
const SECTION_DEPENDENCIES: Record<string, string[]> = {
  // Phase 0
  'foundation': [],
  
  // Phase 1 - Core sections (no dependencies except foundation)
  'financial_snapshot': ['foundation'],
  'company_overview': ['foundation'],
  'recent_news': ['foundation'],
  
  // Phase 2
  'segment_analysis': ['foundation'],
  
  // Phase 3 - Dependent sections
  'trends': ['foundation'],
  'peer_benchmarking': ['foundation', 'financial_snapshot'], // REQUIRED
  'sku_opportunities': ['foundation'],
  
  // Phase 4 - Synthesis
  'exec_summary': ['foundation', 'financial_snapshot', 'company_overview'], // MINIMUM
  'conversation_starters': ['foundation'],
  
  // Phase 5 - Appendix
  'appendix': [], // Uses all sections
};

// Map stage names to Prisma field names
const STAGE_TO_FIELD: Record<string, string> = {
  'foundation': 'foundation',
  'exec_summary': 'executiveSummary',
  'financial_snapshot': 'financialSnapshot',
  'company_overview': 'companyOverview',
  'segment_analysis': 'segmentAnalysis',
  'trends': 'trends',
  'peer_benchmarking': 'peerBenchmarking',
  'sku_opportunities': 'skuOpportunities',
  'recent_news': 'recentNews',
  'conversation_starters': 'conversationStarters',
  'appendix': 'appendix',
};

export class ResearchOrchestrator {
  private claudeExecutor: ClaudeExecutor;
  private progressTracker: ProgressTracker;
  
  constructor(apiKey: string) {
    this.claudeExecutor = new ClaudeExecutor(apiKey);
    this.progressTracker = new ProgressTracker();
  }
  
  /**
   * Create a new research job
   */
  async createJob(params: {
    companyName: string;
    geography: string;
    focusAreas?: string[];
    userFiles?: string[];
    userId: string;
  }): Promise<string> {
    // Create parent job
    const job = await prisma.researchJob.create({
      data: {
        companyName: params.companyName,
        geography: params.geography,
        industry: params.focusAreas?.[0] || null,
        focusAreas: params.focusAreas || [],
        userFiles: params.userFiles || [],
        status: 'pending',
        progress: 0,
        overallConfidence: 'MEDIUM',
        tags: [],
        userId: params.userId,
      },
    });
    
    // Create sub-jobs for all stages (foundation + 10 sections)
    const allStages = [
      'foundation',
      'exec_summary',
      'financial_snapshot',
      'company_overview',
      'segment_analysis',
      'trends',
      'peer_benchmarking',
      'sku_opportunities',
      'recent_news',
      'conversation_starters',
      'appendix',
    ];
    
    await Promise.all(
      allStages.map(stage =>
        prisma.researchSubJob.create({
          data: {
            researchId: job.id,
            stage,
            status: 'pending',
            dependencies: SECTION_DEPENDENCIES[stage] || [],
            sourcesUsed: [],
          },
        })
      )
    );
    
    // Start execution asynchronously
    this.executeJob(job.id).catch(err => {
      console.error(`Job ${job.id} failed:`, err);
    });
    
    return job.id;
  }
  
  /**
   * Execute the entire research job
   */
  private async executeJob(jobId: string): Promise<void> {
    try {
      // Update job status to running
      await prisma.researchJob.update({
        where: { id: jobId },
        data: { status: 'running' },
      });
      
      // Execute phases in order
      await this.executeNextPhase(jobId);
      
      // Mark as completed
      await prisma.researchJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          progress: 1.0,
        },
      });
      
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      
      await prisma.researchJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
        },
      });
    }
  }
  
  /**
   * Execute next runnable sections based on dependencies
   */
  private async executeNextPhase(jobId: string): Promise<void> {
    const runnableSections = await this.getNextRunnableSections(jobId);
    
    if (runnableSections.length === 0) {
      // Check if all sections are complete
      const allComplete = await this.checkAllComplete(jobId);
      if (allComplete) {
        return; // Job done!
      }
      
      // If not all complete but nothing runnable, there might be failures
      const anyFailed = await this.checkAnyFailed(jobId);
      if (anyFailed) {
        throw new Error('Some sections failed and cannot proceed');
      }
      
      return; // Nothing to do
    }
    
    // Execute all runnable sections in parallel
    await Promise.all(
      runnableSections.map(async (stage) => {
        try {
          await this.executeSection(jobId, stage);
        } catch (error) {
          console.error(`Section ${stage} failed:`, error);
          await this.handleSectionFailure(jobId, stage, error);
        }
      })
    );
    
    // After this phase completes, check for next phase
    await this.executeNextPhase(jobId);
  }
  
  /**
   * Get sections that can be executed now
   */
  private async getNextRunnableSections(jobId: string): Promise<string[]> {
    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      include: { jobs: true },
    });
    
    if (!job) return [];
    
    const completed = new Set(
      job.jobs
        .filter(j => j.status === 'completed')
        .map(j => j.stage)
    );
    
    const running = new Set(
      job.jobs
        .filter(j => j.status === 'running')
        .map(j => j.stage)
    );
    
    const pending = job.jobs.filter(j => j.status === 'pending');
    
    const runnable: string[] = [];
    
    for (const subJob of pending) {
      const deps = SECTION_DEPENDENCIES[subJob.stage] || [];
      
      // Check if all dependencies are completed
      const depsCompleted = deps.every(dep => completed.has(dep));
      
      // Check if not already running
      const notRunning = !running.has(subJob.stage);
      
      if (depsCompleted && notRunning) {
        runnable.push(subJob.stage);
      }
    }
    
    return runnable;
  }
  
  /**
   * Execute a single section
   */
  private async executeSection(jobId: string, stage: string): Promise<void> {
    // Mark as running
    await prisma.researchSubJob.updateMany({
      where: { researchId: jobId, stage },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });
    
    // Update parent job progress
    await this.updateProgress(jobId, stage);
    
    const startTime = Date.now();
    
    try {
      // Get job data
      const job = await prisma.researchJob.findUnique({
        where: { id: jobId },
      });
      
      if (!job) throw new Error('Job not found');
      
      // Build input for this section
      const input = await this.buildSectionInput(job, stage);
      
      // Execute with Claude
      const output = await this.claudeExecutor.executeSection(stage, input);
      
      // Validate output
      const validated = await this.claudeExecutor.validateOutput(stage, output);
      
      // Extract sources
      const sourcesUsed = this.extractSourceIds(validated);
      
      // Save output to parent job
      const field = STAGE_TO_FIELD[stage];
      await prisma.researchJob.update({
        where: { id: jobId },
        data: {
          [field]: validated as any,
        },
      });
      
      // Mark sub-job as completed
      await prisma.researchSubJob.updateMany({
        where: { researchId: jobId, stage },
        data: {
          status: 'completed',
          output: validated as any,
          confidence: validated.confidence?.level || 'MEDIUM',
          sourcesUsed,
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      });
      
      // Update progress
      await this.updateProgress(jobId, stage);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await prisma.researchSubJob.updateMany({
        where: { researchId: jobId, stage },
        data: {
          status: 'failed',
          lastError: error instanceof Error ? error.message : String(error),
          attempts: { increment: 1 },
          duration,
        },
      });
      
      throw error;
    }
  }
  
  /**
   * Build input context for a section
   */
  private async buildSectionInput(job: any, stage: string): Promise<any> {
    const input: any = {
      companyName: job.companyName,
      geography: job.geography,
      focusAreas: job.focusAreas || [],
    };
    
    // Add foundation if available
    if (job.foundation) {
      input.foundation = job.foundation;
    }
    
    // Add dependent section outputs
    const deps = SECTION_DEPENDENCIES[stage] || [];
    for (const dep of deps) {
      if (dep === 'foundation') continue; // Already added
      
      const field = STAGE_TO_FIELD[dep];
      if (job[field]) {
        input[`${dep}Context`] = job[field];
      }
    }
    
    return input;
  }
  
  /**
   * Extract source IDs from output
   */
  private extractSourceIds(output: any): string[] {
    const sources = new Set<string>();
    
    if (output.sources_used && Array.isArray(output.sources_used)) {
      output.sources_used.forEach((s: string) => sources.add(s));
    }
    
    return Array.from(sources);
  }
  
  /**
   * Update job progress
   */
  private async updateProgress(jobId: string, currentStage: string): Promise<void> {
    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      include: { jobs: true },
    });
    
    if (!job) return;
    
    // Total stages: 11 (foundation + 10 sections)
    const totalStages = 11;
    const completed = job.jobs.filter(j => j.status === 'completed').length;
    const progress = completed / totalStages;
    
    await prisma.researchJob.update({
      where: { id: jobId },
      data: {
        progress,
        currentStage,
      },
    });
  }
  
  /**
   * Handle section failure
   */
  private async handleSectionFailure(
    jobId: string,
    stage: string,
    error: any
  ): Promise<void> {
    const subJob = await prisma.researchSubJob.findFirst({
      where: { researchId: jobId, stage },
    });
    
    if (!subJob) return;
    
    // Check if we should retry
    if (subJob.attempts < subJob.maxAttempts) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Retry
      await this.executeSection(jobId, stage);
    } else {
      // Mark as permanently failed
      console.error(`Section ${stage} failed after ${subJob.attempts} attempts`);
    }
  }
  
  /**
   * Check if all sections are complete
   */
  private async checkAllComplete(jobId: string): Promise<boolean> {
    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      include: { jobs: true },
    });
    
    if (!job) return false;
    
    return job.jobs.every(j => j.status === 'completed');
  }
  
  /**
   * Check if any sections have failed
   */
  private async checkAnyFailed(jobId: string): Promise<boolean> {
    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      include: { jobs: true },
    });
    
    if (!job) return false;
    
    return job.jobs.some(j => j.status === 'failed' && j.attempts >= j.maxAttempts);
  }
  
  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      include: { jobs: true },
    });
    
    if (!job) {
      throw new Error('Job not found');
    }
    
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      currentStage: job.currentStage,
      jobs: job.jobs.map(j => ({
        stage: j.stage,
        status: j.status,
        confidence: j.confidence,
        sourcesUsed: j.sourcesUsed,
        lastError: j.lastError,
      })),
    };
  }
  
  /**
   * Get complete research output
   */
  async getResearchOutput(jobId: string): Promise<any> {
    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      include: { jobs: true },
    });
    
    if (!job) {
      throw new Error('Job not found');
    }
    
    return {
      id: job.id,
      status: job.status,
      metadata: {
        companyName: job.companyName,
        geography: job.geography,
        industry: job.industry,
        createdAt: job.createdAt,
      },
      sections: {
        foundation: job.foundation,
        executiveSummary: job.executiveSummary,
        financialSnapshot: job.financialSnapshot,
        companyOverview: job.companyOverview,
        segmentAnalysis: job.segmentAnalysis,
        trends: job.trends,
        peerBenchmarking: job.peerBenchmarking,
        skuOpportunities: job.skuOpportunities,
        recentNews: job.recentNews,
        conversationStarters: job.conversationStarters,
        appendix: job.appendix,
      },
      sectionStatuses: job.jobs.map(j => ({
        stage: j.stage,
        status: j.status,
        confidence: j.confidence,
        sourcesUsed: j.sourcesUsed,
        lastError: j.lastError,
      })),
    };
  }
}
