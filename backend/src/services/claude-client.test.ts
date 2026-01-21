import assert from 'node:assert/strict';
import { ClaudeClient } from '../services/claude-client.js';

const client = new ClaudeClient({ apiKey: 'test-key' });

const invalidResponse = {
  content: '{"foo":"bar",}',
  stopReason: 'stop',
  usage: { inputTokens: 0, outputTokens: 0 }
};

assert.throws(() => client.parseJSON(invalidResponse), /Invalid JSON response/);

const repaired = client.parseJSON<{ foo: string }>(invalidResponse, { allowRepair: true });
assert.equal(repaired.foo, 'bar');

console.log('claude client tests passed');
