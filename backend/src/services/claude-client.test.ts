import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeClient } from '../services/claude-client.js';

type ClaudeClientTestHarness = ClaudeClient & {
  client: {
    messages: {
      create: ReturnType<typeof vi.fn>;
      stream: ReturnType<typeof vi.fn>;
    };
  };
};

describe('ClaudeClient', () => {
  const client = new ClaudeClient({ apiKey: 'test-key' });

  const invalidResponse = {
    content: '{"foo":"bar",}',
    stopReason: 'stop',
    usage: { inputTokens: 0, outputTokens: 0 }
  };

  it('throws on invalid JSON', () => {
    expect(() => client.parseJSON(invalidResponse)).toThrow(/Invalid JSON response/);
  });

  it('repairs invalid JSON when allowRepair is true', () => {
    const repaired = client.parseJSON<{ foo: string }>(invalidResponse, { allowRepair: true });
    expect(repaired.foo).toBe('bar');
  });

  describe('execute() options', () => {
    let mockCreate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockCreate = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'response text' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 50 }
      });

      (client as unknown as ClaudeClientTestHarness).client = {
        messages: { create: mockCreate, stream: vi.fn() }
      };
    });

    it('passes system parameter to Anthropic API when provided', async () => {
      await client.execute('test prompt', { system: 'You are a research analyst.' });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'You are a research analyst.',
          messages: expect.any(Array)
        })
      );
    });

    it('does not include system parameter when not provided', async () => {
      await client.execute('test prompt');

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('system');
    });

    it('passes tools parameter to Anthropic API when provided', async () => {
      const tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 10 }];
      await client.execute('test prompt', { tools });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tools,
          messages: expect.any(Array)
        })
      );
    });

    it('does not include tools parameter when not provided', async () => {
      await client.execute('test prompt');

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('tools');
    });

    it('passes both system and tools when provided together', async () => {
      const tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
      await client.execute('test prompt', {
        system: 'Today is 2026-03-02.',
        tools
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'Today is 2026-03-02.',
          tools,
          messages: expect.any(Array)
        })
      );
    });

    it('extracts text from responses with interleaved web search blocks', async () => {
      mockCreate.mockResolvedValue({
        content: [
          { type: 'web_search_tool_result', search_results: [] },
          { type: 'text', text: 'First part.' },
          { type: 'web_search_tool_result', search_results: [] },
          { type: 'text', text: 'Second part.' }
        ],
        stop_reason: 'end_turn',
        usage: { input_tokens: 200, output_tokens: 100 }
      });

      const result = await client.execute('search and respond', {
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }]
      });

      expect(result.content).toBe('First part.\nSecond part.');
      expect(result.usage.inputTokens).toBe(200);
      expect(result.usage.outputTokens).toBe(100);
    });
  });
});
