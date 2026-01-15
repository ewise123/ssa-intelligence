# Queue Cancel Fix Plan

## Goal
Ensure cancelled jobs never block the queue. Cancel should hard-delete jobs and subjobs, and the queue should ignore any stale running state.

## Decisions (pending)
- Cancelled jobs: hard delete (remove researchJob, subJobs, jobGroups).
- Cancellation effect: stop immediately, do not finish in-flight stage.

## Steps
[ ] Reproduce the stall and capture DB state (job status, subjob statuses).
[x] Update cancel endpoint to hard-delete job and related records.
[x] Add queue guard to ignore stale running jobs (no running subjobs).
[x] Add queue cleanup pass to reconcile job status after cancel/delete.
[x] Add logging around queue promotion and stalled-running detection.
[ ] Verify cancel -> new job flow: queued job should start immediately.

## Notes
- If hard delete is too aggressive, fallback is soft delete + async cleanup.
