# CLAUDE.md

## Purpose
This file provides persistent guidance for working in this repository.
Follow these instructions when they are relevant to the task.
Prefer concise, correct, and verifiable changes over broad speculative edits.

## Working Style
- First understand the request, then inspect the relevant code and files before changing anything.
- Make the smallest change that fully solves the problem.
- Do not make unrelated refactors unless they are necessary for correctness.
- Do not invent requirements, APIs, features, or files that are not clearly needed.
- Preserve existing architecture, naming, and patterns unless there is a strong reason to change them.
- Prefer clarity and maintainability over cleverness.

## Project Understanding
Before making edits, identify:
1. what part of the system is affected,
2. what existing pattern is already used there,
3. how the change can be verified.

If repository docs exist, read them directly instead of guessing.
Examples:
- Project overview: `@README.md`
- Commands/configuration: `@package.json`

Only reference documents here if they are broadly useful across many tasks.

## Code Changes
- Match the local style of the files you edit.
- Reuse existing utilities, components, and patterns before introducing new ones.
- Keep functions, modules, and interfaces focused and easy to read.
- Avoid adding new dependencies unless clearly justified.
- Do not hardcode secrets, tokens, keys, or environment-specific identifiers.
- Prefer existing config/env mechanisms over inline constants.

## Documentation and External References
- Prefer project-local patterns and repository code first.
- When a task depends on external libraries, frameworks, SDKs, or APIs, consult Context7 for current version-specific documentation before implementing.
- Do not rely on memory for fast-changing external APIs when Context7 is available.
- Use external documentation to confirm usage details, not to override established repository conventions unless necessary.

## Safety
- Never commit secrets or credentials.
- Treat destructive operations as high risk.
- Confirm assumptions by reading the relevant code, config, tests, and docs.
- If a change may have wide impact, inspect call sites and related files before editing.

## Validation
After making changes, run the smallest meaningful verification available.
Prefer fast, targeted checks before broad ones.

Validation order:
1. run the most relevant unit/type/lint check for the changed area,
2. inspect errors and fix them,
3. only run broader checks when needed.

If verification cannot be run, state exactly what was not verified.

## Testing and Debugging
- Reproduce the issue before fixing it when practical.
- Prefer targeted tests over full-suite runs during iteration.
- When fixing a bug, verify both the failure case and the expected non-regression path.
- If adding tests is appropriate, place them near existing related tests and follow local patterns.

## File and Scope Discipline
- Edit only files relevant to the task.
- Do not rename, move, or reorganize files unless required.
- Do not create new documentation files unless the task asks for documentation or the change requires it.
- Prefer referenced docs or skills for detailed task-specific guidance instead of expanding this file.

## Communication in Responses
- State what you changed.
- State how you verified it.
- State any remaining risk, assumption, or follow-up.
- Be explicit when something is uncertain or unverified.

## When Information Is Missing
If needed information is not obvious from the codebase:
- inspect nearby files,
- inspect config and tests,
- inspect imported modules and call sites,
- then proceed with the best grounded solution.

Do not stop at the first plausible answer if the repository can confirm it.

## Skills

- When creating or modifying any UI component, section, page layout, or visual design, invoke the `frontend-design` skill BEFORE writing code. No exceptions.

## Preferred Escalation Path
Use this file only for rules that should apply broadly in this repository.
Move detailed or occasional guidance into separate files and reference them here with `@imports`.

Examples:
- Architecture notes: `@docs/architecture.md`
- API conventions: `@docs/api-conventions.md`
- Git workflow: `@docs/git-workflow.md`

Use hooks for rules that must always happen.
Use skills for reusable domain knowledge or specialized workflows.