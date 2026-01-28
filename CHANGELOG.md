# Changelog

All notable changes to this repository will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]
- Refactor: consolidate FoundationOutput interface from individual prompt files into shared types.js.
- UI: add Insurance sections to Admin Prompt Library with shared FS & Insurance group.
- Feat: News Intelligence improvements - time period selection, Deep Dive enhancements, status filters.
- Feat: Add render.yaml for Render deployment with PostgreSQL.
- Fix: Make sent and archived article states mutually exclusive.
- Fix: Sent filter now correctly shows sent articles.
- Fix: Remove unused priority fields from news articles.
- UI: Add "All" option to news status filter.
- UI: Add revenue owner selection for Deep Dive search results.
- UI: Update email format to use "Link:" consistently.
- Fix: add `distribution_analysis` formatter for INSURANCE report PDF exports.
- Fix: add INSURANCE-specific KPIs to schema-only regeneration fallback path.
- Fix: increase company name resolver timeout from 5s to 15s to prevent premature timeouts.
- UI: disable prompt Test button (work in progress).
- Fix: prevent draft saves from archiving published prompts (caused fallback to code defaults).
- Fix: prevent revert from archiving published prompts (caused fallback to code defaults).
- Fix: resolvePrompt now composes base + addendum for report-type DB overrides.
- Fix: add validation for cacheReadRate/cacheWriteRate in pricing API.
- Fix: wrap pricing rate swap in transaction to prevent race conditions.
- Fix: prevent future-dated pricing rates from being applied.
- Fix: YTD cost now respects all filters (group, reportType, etc.).
- Fix: add NULLS NOT DISTINCT to prompt unique constraints (PostgreSQL 15+).
- Feat: add company name resolution with typo correction and disambiguation modal.
- Feat: add bug tracker modal with status management (submit, list, update, delete feedback).
- Docs: add prompting system guide and align existing documentation with current code.
- Docs: add oauth2-proxy auth summary and remove the legacy oauth2-proxy reference doc.
- Chore: enforce changelog updates via CONTRIBUTING, PR template, and CI check.
- Docs: add TODO tracker and link it from the README.
- Docs: populate TODO with current backlog items.
- UI: update app branding, sidebar labels/sections, and widen the left nav for the new title.
- Feat: Add CRUD functionality to Admin page
- Fix: decrement group member counts when deleting a user in the admin UI.
- Feat: add "Add User" functionality to Admin page with email domain validation.

## Release process
- When shipping a release, move the `[Unreleased]` bullets into a new section `## [X.Y.Z] - YYYY-MM-DD`.
- Keep a fresh, empty `[Unreleased]` section at the top for new changes.
- Use the release date when the version is cut (not per-commit).
