# Section Reruns Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow research jobs to complete with partial failures, render the report with section errors, and support targeted section reruns (including failed dependencies only).

**Architecture:** Extend backend job status derivation and orchestrator completion logic to support `completed_with_errors`, propagate dependency failures, and add a rerun endpoint that requeues only requested sections plus failed dependencies. Update the frontend to surface error states, show rerun actions per section, and treat `completed_with_errors` as a terminal report-ready state.

**Tech Stack:** Node.js (Express), TypeScript, Prisma, React, Vite, Tailwind.

### Task 1: Job Status Derivation (`completed_with_errors`)

**Files:**
- Modify: `backend/src/api/research/status-utils.ts`
- Create: `backend/src/api/research/status-utils.test.ts`

**Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import { deriveJobStatus } from './status-utils.js';

type SubJob = { status: string };

const base = { status: 'running', subJobs: [] as SubJob[] };

// Completed with errors when all terminal and at least one failed.
assert.equal(
  deriveJobStatus({
    ...base,
    status: 'completed',
    subJobs: [{ status: 'completed' }, { status: 'failed' }]
  }),
  'completed_with_errors'
);

// Completed when all terminal and none failed.
assert.equal(
  deriveJobStatus({
    ...base,
    status: 'completed',
    subJobs: [{ status: 'completed' }, { status: 'completed' }]
  }),
  'completed'
);

// Failed stays failed.
assert.equal(
  deriveJobStatus({
    ...base,
    status: 'failed',
    subJobs: [{ status: 'failed' }]
  }),
  'failed'
);

console.log('status-utils tests passed');
```

**Step 2: Run test to verify it fails**

Run: `npx tsx src/api/research/status-utils.test.ts`
Expected: FAIL with `completed_with_errors` not returned.

**Step 3: Write minimal implementation**

Update `deriveJobStatus` to:
- Return `completed_with_errors` when there are no running/pending subjobs and at least one failed, unless job status is `failed` or `cancelled`.

**Step 4: Run test to verify it passes**

Run: `npx tsx src/api/research/status-utils.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/api/research/status-utils.ts backend/src/api/research/status-utils.test.ts
git commit -m "feat(research): derive completed_with_errors status"
```

### Task 2: Orchestrator Completion + Progress

**Files:**
- Modify: `backend/src/services/orchestrator.ts`
- Create: `backend/src/services/orchestrator-utils.ts`
- Create: `backend/src/services/orchestrator-utils.test.ts`

**Step 1: Write the failing test**

Create a tiny harness to validate progress and status decisions:

```ts
import assert from 'node:assert/strict';
import { computeTerminalProgress, computeFinalStatus } from '../services/orchestrator-utils.js';

const subJobs = [
  { status: 'completed' },
  { status: 'failed' },
  { status: 'cancelled' }
];

assert.equal(computeTerminalProgress(subJobs), 1);
assert.equal(computeFinalStatus('running', subJobs), 'completed_with_errors');
console.log('orchestrator utils tests passed');
```

**Step 2: Run test to verify it fails**

Run: `npx tsx src/services/orchestrator-utils.test.ts`
Expected: FAIL (module missing).

**Step 3: Write minimal implementation**

- Create `backend/src/services/orchestrator-utils.ts` exporting:
  - `computeTerminalProgress(subJobs)` ? fraction of terminal subjobs.
  - `computeFinalStatus(jobStatus, subJobs)` ? `completed_with_errors` if terminal + any failed and not cancelled/failed.
- Use those helpers in `backend/src/services/orchestrator.ts`:
  - `updateProgress` should count `completed | failed | cancelled` as terminal.
  - `executeJob`, `checkJobCompletion`, and `cleanupStaleRunningJobs` should set `completed_with_errors` when appropriate.
  - Preserve `failed` when foundation fails (existing behavior).

**Step 4: Run test to verify it passes**

Run: `npx tsx src/services/orchestrator-utils.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/services/orchestrator.ts backend/src/services/orchestrator-utils.ts backend/src/services/orchestrator-utils.test.ts
git commit -m "feat(research): complete jobs with section errors"
```

### Task 3: Dependency Failure Propagation

**Files:**
- Modify: `backend/src/services/orchestrator.ts`
- Create: `backend/src/services/dependency-utils.ts`
- Create: `backend/src/services/dependency-utils.test.ts`

**Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import { collectBlockedStages } from './dependency-utils.js';

const deps = {
  foundation: [],
  financial_snapshot: ['foundation'],
  company_overview: ['foundation'],
  exec_summary: ['foundation', 'financial_snapshot', 'company_overview']
} as const;

const subJobs = [
  { stage: 'financial_snapshot', status: 'failed' },
  { stage: 'exec_summary', status: 'pending' }
];

const blocked = collectBlockedStages(['financial_snapshot'], subJobs, deps);
assert.deepEqual(blocked, ['exec_summary']);
console.log('dependency utils tests passed');
```

**Step 2: Run test to verify it fails**

Run: `npx tsx src/services/dependency-utils.test.ts`
Expected: FAIL (module missing).

**Step 3: Write minimal implementation**

- Implement `collectBlockedStages` to return pending/running dependents of failed stages (recursive).
- Update `handleStageFailure` (when max retries exceeded) to mark blocked stages as `failed` with `lastError: "Blocked by failed dependency: <stageId>"`.

**Step 4: Run test to verify it passes**

Run: `npx tsx src/services/dependency-utils.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/services/orchestrator.ts backend/src/services/dependency-utils.ts backend/src/services/dependency-utils.test.ts
git commit -m "feat(research): propagate dependency failures"
```

### Task 4: Section Rerun API

**Files:**
- Create: `backend/src/api/research/rerun.ts`
- Modify: `backend/src/index.ts`
- Modify: `backend/src/services/orchestrator.ts`
- Create: `backend/src/services/rerun-utils.ts`
- Create: `backend/src/services/rerun-utils.test.ts`

**Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import { computeRerunStages } from './rerun-utils.js';

const deps = {
  foundation: [],
  financial_snapshot: ['foundation'],
  company_overview: ['foundation'],
  exec_summary: ['foundation', 'financial_snapshot', 'company_overview']
} as const;

const subJobs = [
  { stage: 'financial_snapshot', status: 'failed' },
  { stage: 'company_overview', status: 'completed' },
  { stage: 'exec_summary', status: 'failed' }
];

const stages = computeRerunStages(['exec_summary'], subJobs, deps);
assert.deepEqual(stages.sort(), ['exec_summary', 'financial_snapshot'].sort());
console.log('rerun utils tests passed');
```

**Step 2: Run test to verify it fails**

Run: `npx tsx src/services/rerun-utils.test.ts`
Expected: FAIL (module missing).

**Step 3: Write minimal implementation**

- Add `computeRerunStages` helper to include requested stages plus failed dependencies only.
- Add a new API handler `POST /api/research/:id/rerun`:
  - Validate auth and job state (reject running/queued).
  - Validate stage IDs.
  - Load subjobs and compute rerun set.
  - Reset subjobs (pending, attempts=0, clear errors/timestamps/output).
  - Clear corresponding `ResearchJob` JSON outputs.
  - Set job status to `queued`, clear `currentStage`, update `queuedAt`.
  - Trigger `processQueue(true)`.
- Wire route in `backend/src/index.ts` and delete the placeholder regenerate endpoint.

**Step 4: Run test to verify it passes**

Run: `npx tsx src/services/rerun-utils.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/api/research/rerun.ts backend/src/index.ts backend/src/services/orchestrator.ts backend/src/services/rerun-utils.ts backend/src/services/rerun-utils.test.ts
git commit -m "feat(research): add section rerun endpoint"
```

### Task 5: API Status + Detail Updates

**Files:**
- Modify: `backend/src/api/research/status.ts`
- Modify: `backend/src/api/research/list.ts`
- Modify: `backend/src/api/research/detail.ts`

**Step 1: Write the failing test**

Add a minimal check for status passthrough:

```ts
import assert from 'node:assert/strict';
import { deriveJobStatus } from './status-utils.js';

assert.equal(
  deriveJobStatus({ status: 'completed', subJobs: [{ status: 'failed' }] }),
  'completed_with_errors'
);
console.log('status-utils still passes');
```

**Step 2: Run test to verify it passes**

Run: `npx tsx src/api/research/status-utils.test.ts`
Expected: PASS (sanity check).

**Step 3: Write minimal implementation**

- Ensure status/list/detail responses return derived status when job is terminal with failures.
- Update error messages in `status.ts` for `completed_with_errors` to avoid showing "Job execution failed".

**Step 4: Run test to verify it passes**

Run: `npx tsx src/api/research/status-utils.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/src/api/research/status.ts backend/src/api/research/list.ts backend/src/api/research/detail.ts
git commit -m "feat(research): surface completed_with_errors in API"
```

### Task 6: Frontend Status + Rerun UI

**Files:**
- Create: `frontend/src/pages/__dev__/status-pill-sanity.ts`
- Modify: `frontend/src/types.ts`
- Modify: `frontend/src/components/StatusPill.tsx`
- Modify: `frontend/src/services/researchManager.ts`
- Modify: `frontend/src/pages/ResearchDetail.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/Home.tsx`

**Step 1: Write the failing test**

Add a quick render sanity script:

```ts
import { SectionStatus } from '../types.js';
import { StatusPill } from '../components/StatusPill.js';

console.log(StatusPill({ status: 'completed_with_errors', size: 'sm' } as any));
```

**Step 2: Run test to verify it fails**

Run: `npx --yes tsx src/pages/__dev__/status-pill-sanity.ts`
Expected: FAIL (unknown status).

**Step 3: Write minimal implementation**

- Add `completed_with_errors` to `JobStatus` union.
- Update `StatusPill` styles/labels for `completed_with_errors`.
- Update `useResearchManager` to treat `completed_with_errors` as terminal.
- Update `ResearchDetail`:
  - Render report view for `completed_with_errors`.
  - Add error summary banner listing failed sections.
  - Add rerun buttons for failed and completed sections, disabled when job is running/queued.
- Add a client call to `POST /api/research/:id/rerun` and trigger `runJob(job.id)` after rerun.
- Update `Home` to treat `completed_with_errors` as completed for listing and status.

**Step 4: Run test to verify it passes**

Run: `npx --yes tsx src/pages/__dev__/status-pill-sanity.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/types.ts frontend/src/components/StatusPill.tsx frontend/src/services/researchManager.ts frontend/src/pages/ResearchDetail.tsx frontend/src/App.tsx frontend/src/pages/Home.tsx
git commit -m "feat(research-ui): show section errors and rerun actions"
```

### Task 7: Manual Verification

**Files:**
- None

**Step 1: Run backend type-check**

Run: `npm run type-check`
Expected: PASS

**Step 2: Run frontend build**

Run: `npm run build`
Expected: PASS

**Step 3: Manual QA**

- Create a job with a known failing section (simulate by forcing error in a prompt or using invalid response).
- Confirm status becomes `completed_with_errors` and report view renders.
- Rerun a failed section and verify only failed dependencies re-run.

**Step 4: Commit final cleanups**

```bash
git add -A
git commit -m "chore: finalize section rerun feature"
```
