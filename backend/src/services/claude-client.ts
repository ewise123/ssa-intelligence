/**
 * Claude API Client
 * Wrapper for Anthropic SDK with streaming support and error handling
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages';

// ============================================================================
// TYPES
// ============================================================================

export interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  cacheEnabled?: boolean;
}

export interface StreamingOptions {
  onStart?: () => void;
  onContent?: (delta: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export interface ClaudeResponse {
  content: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ============================================================================
// CLIENT
// ============================================================================

export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private cacheEnabled: boolean;

  constructor(config: ClaudeConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
    this.model = config.model || 'claude-sonnet-4-5';
    this.maxTokens = config.maxTokens || 16000;
    this.cacheEnabled = Boolean(config.cacheEnabled);
  }

  /**
   * Execute a prompt and get complete response
   */
  async execute(prompt: string): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: this.buildMessages(prompt)
      });

      // Extract text content
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => block.type === 'text' ? block.text : '')
        .join('\n');

      return {
        content,
        stopReason: response.stop_reason || 'unknown',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Execute a prompt with streaming support
   */
  async executeStreaming(
    prompt: string,
    options: StreamingOptions = {}
  ): Promise<ClaudeResponse> {
    try {
      let fullContent = '';
      let inputTokens = 0;
      let outputTokens = 0;
      let stopReason = 'unknown';

      options.onStart?.();

      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: this.buildMessages(prompt)
      });

      for await (const event of stream) {
        this.handleStreamEvent(event, {
          onContent: (delta) => {
            fullContent += delta;
            options.onContent?.(delta);
          },
          onMetadata: (metadata) => {
            if (metadata.inputTokens) inputTokens = metadata.inputTokens;
            if (metadata.outputTokens) outputTokens = metadata.outputTokens;
            if (metadata.stopReason) stopReason = metadata.stopReason;
          }
        });
      }

      options.onComplete?.(fullContent);

      return {
        content: fullContent,
        stopReason,
        usage: {
          inputTokens,
          outputTokens
        }
      };
    } catch (error) {
      const err = this.handleError(error);
      options.onError?.(err);
      throw err;
    }
  }

  /**
   * Parse JSON response from Claude
   */
  parseJSON<T>(response: ClaudeResponse): T {
    try {
      // Remove markdown code blocks if present
      let content = response.content.trim();
      content = content.replace(/^```json\s*/i, '');
      content = content.replace(/\s*```$/i, '');
      content = content.trim();

      return JSON.parse(content) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate JSON schema using Zod
   */
  validateAndParse<T>(response: ClaudeResponse, schema: any): T {
    const parsed = this.parseJSON(response);
    const result = schema.safeParse(parsed);

    if (!result.success) {
      throw new Error(`Schema validation failed: ${result.error.message}`);
    }

    return result.data as T;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private handleStreamEvent(
    event: MessageStreamEvent,
    handlers: {
      onContent: (delta: string) => void;
      onMetadata: (metadata: {
        inputTokens?: number;
        outputTokens?: number;
        stopReason?: string;
      }) => void;
    }
  ) {
    switch (event.type) {
      case 'content_block_delta':
        if (event.delta.type === 'text_delta') {
          handlers.onContent(event.delta.text);
        }
        break;

      case 'message_start':
        if (event.message.usage) {
          handlers.onMetadata({
            inputTokens: event.message.usage.input_tokens
          });
        }
        break;

      case 'message_delta':
        if (event.usage) {
          handlers.onMetadata({
            outputTokens: event.usage.output_tokens
          });
        }
        if (event.delta.stop_reason) {
          handlers.onMetadata({
            stopReason: event.delta.stop_reason
          });
        }
        break;
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Anthropic.APIError) {
      return new Error(`Claude API Error: ${error.message} (Status: ${error.status})`);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown error occurred while calling Claude API');
  }

  /**
   * Build messages array with optional prompt caching
   * Claude supports cache_control on text blocks; we only enable when configured.
   */
  private buildMessages(prompt: string) {
    if (!this.cacheEnabled) {
      return [{
        role: 'user' as const,
        content: prompt
      }];
    }

    return [{
      role: 'user' as const,
      content: [{
        type: 'text' as const,
        text: prompt,
        cache_control: { type: 'ephemeral' as const }
      }]
    }];
  }
}

// ============================================================================
// FACTORY
// ============================================================================

let clientInstance: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!clientInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    clientInstance = new ClaudeClient({
      apiKey,
      model: process.env.CLAUDE_MODEL,
      maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : undefined,
      cacheEnabled: (process.env.CLAUDE_CACHE_ENABLED || 'false').toLowerCase() === 'true'
    });
  }

  return clientInstance;
}
