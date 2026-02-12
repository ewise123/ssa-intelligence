# Contributing

## Changelog policy
- Every change updates `CHANGELOG.md` under the `[Unreleased]` section.
- If the change is not user-facing, add a bullet: "No user-facing changes."
- Keep entries short and action-oriented.

## Pull requests
- Confirm `CHANGELOG.md` is updated before requesting review.
- If you're using an AI coding agent, make sure it follows the changelog policy.

## Dependabot PRs
- Dependabot opens automated dependency update PRs every Monday.
- **Do not merge Dependabot PRs manually.** These must be reviewed by an LLM agent before merging.
- If CI passes and the agent approves, merge the PR. If the agent flags concerns, coordinate with the team before merging.
- See `AGENTS.md` for the full review checklist agents follow.