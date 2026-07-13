---
name: prepare-commit
description: "Analyzes staged changes and generates a conventional commit message following the format <type>(<scope>): <description>. Ensures the description is lowercase, imperative, brief, and has no trailing period. Presents the message to the user for explicit approval before committing."
---

# Prepare commit

Generate the commit message for the pending work and get it approved before committing anything.

## Git Safety Rules

- Make sure you are on the correct branch before committing.
- Never use `git add .` or `git add -A`.
- Always stage files by explicitly naming each file (for example, `git add src/auth/login.ts`).
- If files need to be staged, identify the exact files and stage only those.
- Never stage unrelated changes. Stage only the files required for the requested work.

## Steps

1. Inspect what would be committed:
   ```bash
   git status --short && git diff --cached --stat
   ```
   If nothing is staged, analyze the working tree (`git diff --stat`) and propose what to stage.
2. Build ONE single-line message following `# Commit Rules` in `CLAUDE.md`:
   - Format: `<type>(<scope>): <description>` — scope optional but preferred; use the most specific one (module, component, page, service).
   - Types: feat, fix, refactor, perf, docs, test, style  (formatting, not CSS), build, ci, chore.
   - Description: English, lowercase, imperative, brief, no trailing period.
   - One line only — no body, no extra `-m` flags.
3. Present the message to the user and **wait for explicit approval**. Never commit or push without it; approval given earlier in the session does not carry over to a new commit.
4. After approval: `git commit -m "<message>"`. Push only if the user also approved pushing.

## Examples

- `feat(orders): add phone search to the index`
- `fix(tracking): keep priority when a detail advances again`
- `ci(e2e): migrate before booting the web server`
- `refactor(payments): extract receipt rendering to a hook`
