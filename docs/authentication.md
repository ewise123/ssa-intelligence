# Authentication & Authorization

## Overview

SSA Intelligence uses a layered auth model:

1. **oauth2-proxy** handles authentication (login, sessions, identity headers)
2. **Auth middleware** reads proxy headers, upserts the user, and attaches `req.auth`
3. **User status** (ACTIVE / PENDING) gates access to protected routes
4. **Role guards** (member / admin) restrict admin functionality
5. **Group-based visibility** scopes research jobs by team membership

## Authentication (oauth2-proxy)

### Request flow

1. User visits the public web service.
2. oauth2-proxy redirects to the identity provider for OAuth2/OIDC login.
3. After login, oauth2-proxy sets a session cookie and proxies the request upstream.
4. oauth2-proxy injects identity headers.
5. The backend reads those headers, upserts a user, and attaches `req.auth`.

### Headers the backend accepts

From `backend/src/middleware/auth.ts`:

| Purpose | Headers (checked in order) |
|---------|---------------------------|
| Email | `x-auth-request-email`, `x-email`, `x-user-email`, `x-auth-email`, `x-forwarded-email` |
| User/name | `x-auth-request-user`, `x-user`, `x-user-id`, `x-auth-user` |
| Groups | `x-auth-request-groups`, `x-groups` |

oauth2-proxy must be configured to pass these headers (e.g., `set_xauthrequest=true`).

## User Lifecycle

### Statuses

| Status | Meaning |
|--------|---------|
| **PENDING** | Default for new users. Can only access `/api/me` and `/api/invites/accept`. |
| **ACTIVE** | Full access to all routes allowed by their role. |

### How users become ACTIVE

- **Admin emails** (`ADMIN_EMAILS` env var): auto-promoted to ADMIN role + ACTIVE status on every request.
- **Super-admin** (`SUPER_ADMIN_EMAIL` env var): auto-promoted to ACTIVE status on every request.
- **Invited users**: accept an invite link to transition from PENDING → ACTIVE.
- **Existing users at migration time**: all grandfathered as ACTIVE.

### Auto-creation

When a request arrives with a valid email header that has no matching user record:

- If the email is in `ADMIN_EMAILS` → created as `ADMIN / ACTIVE`
- If the email is the `SUPER_ADMIN_EMAIL` → created as `MEMBER / ACTIVE`
- If the email domain matches `AUTH_EMAIL_DOMAIN` → created as `MEMBER / PENDING`
- Otherwise → rejected with 403

## Roles & Permissions

### Two tiers

| Role | Who | Access |
|------|-----|--------|
| **Member** | Any domain-validated user | Research, news, groups, feedback (own + group-visible) |
| **Admin** | Emails in `ADMIN_EMAILS` | Everything members can do + metrics, pricing, prompts, user/group/invite management. Can see all research jobs. |

Note: `SUPER_ADMIN_EMAIL` still exists as an env var and grants automatic ACTIVE status on first login, but it no longer gates any additional routes. All admin functionality is available to any user with `role: ADMIN`.

### Middleware guards

| Middleware | Location | Purpose |
|-----------|----------|---------|
| `authMiddleware` | `middleware/auth.ts` | Resolves identity from proxy headers, upserts user, attaches `req.auth`. Applied to all protected routes. |
| `requireActiveUser` | `middleware/auth.ts` | Returns 403 if `req.auth.status !== 'ACTIVE'`. Applied to all routes except `/api/me` and `/api/invites/accept`. |
| `requireAdmin` | `middleware/auth.ts` | Returns 403 if `req.auth.isAdmin` is false. Used for all admin routes (metrics, pricing, prompts, user/group/invite management). |

### Route middleware chains

```
# No active-user check (pending users need these)
GET  /api/me                → authMiddleware → getMe
POST /api/invites/accept    → authMiddleware → acceptInvite

# Standard protected routes
GET  /api/research          → authMiddleware → requireActiveUser → handler
POST /api/research/generate → authMiddleware → requireActiveUser → handler

# Admin routes (metrics, pricing, prompts, users, groups, invites)
GET  /api/admin/metrics     → authMiddleware → requireActiveUser → requireAdmin → handler
GET  /api/admin/users       → authMiddleware → requireActiveUser → requireAdmin → handler
POST /api/admin/invites     → authMiddleware → requireActiveUser → requireAdmin → handler
```

## Invite System

### Flow

1. An admin creates an invite via `POST /api/admin/invites` with the target email.
2. Backend generates a 256-bit cryptographic token (`crypto.randomBytes(32)`), stores the invite with a 7-day expiry, and returns the invite URL.
3. The admin shares the URL (`/#/invite/{token}`) with the user.
4. User visits the URL. The frontend calls `POST /api/invites/accept` with the token.
5. Backend validates: token exists, not used, not expired, email matches the authenticated user.
6. Backend atomically marks the invite as used and sets the user's status to ACTIVE.

### Security properties

- **Cryptographic tokens**: 256-bit `crypto.randomBytes`, not predictable CUIDs.
- **Race-safe acceptance**: Uses `updateMany({ where: { id, used: false } })` inside an interactive transaction. If two concurrent requests race, only one succeeds.
- **Race-safe revocation**: Uses `deleteMany({ where: { id, used: false } })` to prevent revoking a concurrently-accepted invite.
- **Email binding**: The invite email must match the authenticated user's email. You can't use someone else's invite.
- **Token redaction**: List endpoint only exposes tokens/URLs for active (unused + non-expired) invites.
- **Expiry**: 7-day TTL enforced server-side.

### API endpoints

| Method | Path | Guard | Purpose |
|--------|------|-------|---------|
| `POST` | `/api/admin/invites` | admin | Create invite |
| `GET` | `/api/admin/invites` | admin | List all invites |
| `DELETE` | `/api/admin/invites/:id` | admin | Revoke unused invite |
| `POST` | `/api/invites/accept` | auth only | Accept invite (no active-user check) |

## Group-Based Visibility

Research jobs have a `visibilityScope`:

| Scope | Who can see it |
|-------|---------------|
| `PRIVATE` | Only the user who created it |
| `GROUP` | The creator + members of assigned groups |

Admins bypass visibility — they see all jobs.

The visibility filter is built by `buildVisibilityWhere()` in `auth.ts`.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ADMIN_EMAILS` | Yes | Comma-separated list of admin emails. Auto-promoted to ADMIN/ACTIVE. |
| `SUPER_ADMIN_EMAIL` | No | Single email. Auto-promoted to ACTIVE status on first login. No longer gates additional routes beyond what `ADMIN_EMAILS` provides. |
| `AUTH_EMAIL_DOMAIN` | No | Comma-separated allowed domains. Defaults to `ssaandco.com`. Use `*` to allow all. |
| `OAUTH2_PROXY_EMAIL_DOMAINS` | No | Fallback for `AUTH_EMAIL_DOMAIN`. |
| `DEV_ADMIN_EMAIL` | No | Dev-only fallback email when no proxy headers present. |
| `DEV_IMPERSONATE_EMAIL` | No | Dev-only: force requests to use this email. |
| `DEV_MODE` | No | Set to `true` to enable dev fallbacks. Only active when `NODE_ENV=development` or `DEV_MODE=true`. |

## Dev Behavior

Dev fallbacks only activate when `NODE_ENV=development` or `DEV_MODE=true`:

- Missing headers fall back to `DEV_ADMIN_EMAIL` or the first `ADMIN_EMAILS` entry (with ADMIN/ACTIVE).
- `DEV_IMPERSONATE_EMAIL` overrides the authenticated email.
- `GET /api/debug/auth` (non-prod only) returns auth header diagnostics.

## Render Deployment Notes

- **Public web service**: oauth2-proxy + routing for the public URL.
- **Private service**: backend API. Only oauth2-proxy should reach it.
- oauth2-proxy upstream should point to the private service URL.
- oauth2-proxy configuration (provider settings, client secrets, redirect URLs) lives in Render, not in this repo.

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/middleware/auth.ts` | Auth middleware, role guards, visibility filter |
| `backend/src/api/admin/invites.ts` | Invite CRUD + acceptance |
| `backend/src/api/me.ts` | Current user endpoint |
| `backend/src/lib/domain-validation.ts` | Shared email domain validation |
| `backend/src/types/auth.ts` | AuthContext type definition |
| `backend/prisma/schema.prisma` | User, Invite, UserStatus, UserRole models |
| `frontend/src/pages/InviteAccept.tsx` | Invite acceptance UI |
| `frontend/src/pages/PendingActivation.tsx` | Pending user gate UI |
