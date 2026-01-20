import assert from 'node:assert/strict';
import { formatSectionContent } from './section-formatter.js';

const investment = formatSectionContent('investment_strategy' as any, {
  strategy_summary: 'Strategy summary',
  focus_areas: ['Focus A'],
});
assert.ok(investment.includes('Strategy summary'));
assert.ok(investment.includes('**Focus Areas**'));

const portfolio = formatSectionContent('portfolio_snapshot' as any, {
  summary: 'Portfolio summary',
  portfolio_companies: [
    {
      name: 'Alpha',
      sector: 'Tech',
      platform_or_addon: 'Platform',
      geography: 'NA',
      notes: 'Note',
      source: 'S1',
    },
  ],
});
assert.ok(portfolio.includes('**Portfolio Companies**'));
assert.ok(portfolio.includes('| Name | Sector | Type | Geography | Notes | Source |'));

console.log('section formatter tests passed');
