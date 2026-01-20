import assert from 'node:assert/strict';
import { getReportBlueprint } from './report-blueprints.js';

const fsBlueprint = getReportBlueprint('FS');
assert.ok(fsBlueprint, 'FS blueprint missing');

const sectionIds = fsBlueprint.sections.map((section) => section.id);
assert.equal(sectionIds[0], 'exec_summary');
assert.equal(sectionIds[1], 'financial_snapshot');

console.log('report blueprints tests passed');
