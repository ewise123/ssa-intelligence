# Plan

Expand research brief generation with new preset workflows (Private Equity, Financial Services, Company Brief/Generic) while keeping the current Industrials report as the comprehensive default, and add visibility controls (Private / Group / General) backed by RBAC. The approach is to extend the data model, orchestration, and prompts/validation first, then wire API + UI changes for preset selection, section toggles, and access scoping.

## Scope
- In: New brief presets (PE/FS/Generic), section selection with dependency enforcement, user-added prompt context, visibility modes, RBAC (admin + member), report-type metadata, and UI support for preset/visibility.
- Out: External DB integration, CRM/outreach tracking, and full auth provider implementation beyond consuming headers.

## Action items
 [x] Audit current stages/dependencies and define required vs optional sections per preset (keep Industrials as current default; PE/FS/Generic use the specified section set).
 [x] Define the PE brief spec from the spreadsheet and map it to prompt builders and output schema.
 [x] Define the FS brief spec from the spreadsheet and map it to prompt builders and output schema.
 [x] Define the Generic brief spec from the spreadsheet and map it to prompt builders and output schema.
[x] Extend Prisma schema for reportType/preset, selectedSections, userAddedPrompt, visibility settings (Private/Group/General), RBAC entities, group memberships, and a reportType-aware uniqueness key.
[x] Audit current user model usage and ensure job creator attribution is stored from auth headers (email/domain, userId), with room for future comments/mentions.
[x] Implement auth/RBAC middleware that reads user identity and groups from headers, uses `ADMIN_EMAILS` overrides for admin, upserts users, and enforces visibility rules on research routes.
[x] Update job creation and orchestration to accept preset/visibility/selection (multi-group), enforce dependencies, compute progress for selected stages, and generate appendix from available sources only.
[x] Update validation/types to support per-preset schemas and variable section sets, ensuring each section's content reflects the preset's analysis framework.
[x] Update API responses to include reportType/preset/visibility metadata and update the frontend flow for preset selection, optional section toggles, user-added prompt, and visibility controls (hide group options if user has no groups).
[ ] Add an admin-only UI (page or modal) to list users and manage group memberships.
[ ] Add guardrails for invalid selections, missing required inputs, and visibility enforcement, and document defaults and error states.
[ ] Verify with API/UI smoke checks for each preset and visibility mode, confirming progress, rendering, grouping by company, and access rules.

## Decisions
- Member role can share to groups.
- General Use means all authenticated users (ssaandco.com domain).
- Section selection is allowed for all presets, with dependency enforcement.
- Report type is required for all jobs; default to Generic Brief and label legacy jobs as Industrials.
- Multiple groups can be selected per report.
- Admin emails come from `ADMIN_EMAILS` in env (for now).
