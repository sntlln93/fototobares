---
name: validate-code
description: Runs linting, formatting, and static analysis tools. Automatically detects if changes are backend or frontend to run the appropriate tools (phpstan, pint, eslint, prettier, tsc). Use this after code changes or before proposing a PR.
---

# Validate code

Run the support script from the repo root:

```bash
bash .claude/skills/validate-code/scripts/validate-code.sh          # after code changes
bash .claude/skills/validate-code/scripts/validate-code.sh --full   # before proposing a PR
```

The script detects the touched side(s) — comparing the merge-base with
`develop` plus staged, unstaged and untracked files — and runs only the
matching tools, all through Sail:

| Side detected | Default | With `--full` |
| --- | --- | --- |
| Backend (`*.php`, `composer.*`, `database/`, `routes/`) | pint (fixes), phpstan | + pest |
| Frontend (`resources/**`, `package.json`, build configs) | prettier (writes), eslint (fixes), tsc | + vitest |
| E2E (`e2e/`, `playwright.config.ts`) | prettier (writes), tsc -p e2e | (playwright is **CI-only** — a local run resets the dev DB) |

## Rules

- Fix every failure it reports and re-run until it prints `All checks passed.`
- Exit code 1 means at least one tool failed; the summary line lists which.
- Requires Sail up (`./vendor/bin/sail up -d`); the script aborts early if not.
- pint/prettier/eslint write fixes in place — review what they changed before
  staging.
