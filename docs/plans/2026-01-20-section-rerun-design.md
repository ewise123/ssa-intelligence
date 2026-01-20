# Research Report Partial Completion and Section Reruns

## Context
Today a single section failure causes the entire research job to fail and the report view does not render. There is no real section rerun endpoint, so users must rerun a full job even when only one section failed. Dependencies are strict (ex: exec summary depends on financial snapshot and company overview), which makes failures cascade.

## Goals
- Let a job reach a terminal state even if some sections fail.
- Load the report view with all completed sections and show error messages for failed ones.
- Support section-specific reruns (including completed sections).
- If a section is blocked by a failed dependency, rerun only the failed dependency (not every dependency).
- Keep foundation failure as a hard failure (no report view).

## Non-goals
- Change prompt content or schema definitions.
- Add new database tables or migrations.
- Enable parallel execution across multiple jobs (queue behavior stays the same).

## Current Behavior Summary
- Orchestrator marks job failed if any stage fails.
- Dependent stages stay pending if dependencies do not complete.
- UI only shows the report view when status is "completed".
- Rerun endpoint is a placeholder.

## Proposed Changes

### Status Model
- Add a new job status: `completed_with_errors`.
- A job is terminal when all subjobs are terminal (`completed`, `failed`, or `cancelled`).
- If the job is terminal and any subjob failed (excluding foundation failure), set status to `completed_with_errors`.
- If foundation fails, set status to `failed` and keep the report view blocked.
- Set `completedAt` for both `completed` and `completed_with_errors`.
- Progress should count terminal subjobs so jobs with errors still reach 100%.

### Dependency Failure Propagation
- When a stage reaches max retries and is marked `failed`, mark any pending or running dependents as `failed` with:
  - `lastError`: `Blocked by failed dependency: <stageId>`
  - `completedAt`: now
- This prevents dangling pending stages and lets the job complete.

### Rerun API
- Replace the placeholder regenerate route with:
  - `POST /api/research/:id/rerun`
  - Body: `{ sections: StageId[] }`
- Validation:
  - Reject if job is `running` or `queued`.
  - Validate stage ids against the known stage list.
- Rerun set:
  - Start with requested sections.
  - For each requested section, include only dependencies that are currently failed (or blocked by dependency).
  - Do not rerun dependencies that already completed.
- State reset for rerun subjobs:
  - `status = pending`, `attempts = 0`, `lastError = null`
  - `startedAt = null`, `completedAt = null`, `duration = null`
  - `output = null`
  - Keep token and cost totals (new runs will increment again).
- Clear corresponding JSON fields on `ResearchJob` for rerun stages to avoid stale content.
- Set job status to `queued`, clear `currentStage`, update `queuedAt`, then kick the queue.

### Report UI Updates
- Treat `completed_with_errors` like `completed` for rendering the report view.
- Add a compact error banner listing failed sections with anchors.
- Show per-section error messages using `lastError`.
- Add section-level rerun buttons:
  - Prominent "Rerun section" button in failed section view.
  - A secondary "Rerun" action for completed sections.
  - Disable rerun when job is `running` or `queued`.

## Data Flow Summary
1. Orchestrator runs stages in dependency order.
2. On failure, it marks the stage failed and propagates failure to dependents.
3. When all stages are terminal:
   - If foundation failed: job status `failed`.
   - Else if any failed: `completed_with_errors`.
   - Else: `completed`.
4. UI renders report for completed or completed_with_errors and shows errors inline.
5. Rerun triggers a targeted reset and requeue, leaving completed sections intact.

## Error Handling
- Job failure remains only for foundation failure or cancellation.
- Failed stages include a clear `lastError` string.
- Blocked stages use a standard error string for consistent UI messaging.

## Testing Plan
- Unit: status derivation returns `completed_with_errors` when expected.
- Unit: rerun set includes only failed dependencies.
- Unit: dependency failure propagation marks blocked stages as failed.
- Integration: rerun endpoint resets only targeted stages and queues the job.
- UI: report view renders on completed_with_errors and shows rerun buttons.
