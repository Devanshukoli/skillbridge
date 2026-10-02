---
name: execute
description: Implement assigned work with focused changes, project-appropriate verification, and disciplined scope.
schedule: "When actionable backlog items are ready for implementation"
---

# Execute

The order prompt defines the task. Read it fully, then inspect `.agents/architectural-guide.md` and the relevant implementation, tests, and documentation before changing code. Keep the change limited to the requested outcome and preserve existing behavior.

## Worktree workflow

For Noodle-dispatched work, use the assigned Noodle worktree. If none exists, create one with `noodle worktree create <descriptive-name>` before editing. Do not make dispatched changes directly on `main`. Verify and commit in the worktree, then use `noodle worktree merge <name>` when the order calls for merging. Do not push.

## Implementation and verification

- Follow the repository's TypeScript, React, Express, and Supabase patterns. Update directly related tests and documentation when needed.
- Prefer targeted tests for the changed behavior. The project scripts are `npm test` for backend tests, `npm run lint` for TypeScript checking, and `npm run build` for the frontend and backend build. Run the checks relevant to the change and report any failures clearly.
- Do not claim verification that was not run. Do not add dependencies or unrelated cleanup without a task requirement.

## Commits and completion

When the worktree workflow requires a commit, use the repository's conventional style: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, or `chore`, with a concise scope and description. Keep commits focused; do not amend existing commits.

Finish with a concise summary of the outcome, files changed, verification performed, and any remaining limitations.
