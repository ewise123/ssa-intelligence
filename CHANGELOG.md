# Changelog

All notable changes to this repository will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]
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
