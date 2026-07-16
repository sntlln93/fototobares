---
name: code-review
description: Reviews the current branch's diff against develop with the project checklist (correctness, layering, DTOs, frontend rules, diff security) and produces a ranked verdict. With --pr <number>, also posts the report as a Spanish PR comment.
---

# Code review

Review the diff of the current branch against `origin/develop` (`git diff origin/develop...HEAD` plus staged/unstaged changes). Read every changed hunk; open surrounding code only when needed to judge correctness. Never modify files.

## Checklist

1. **Correctness**: logic errors, broken edge cases, regressions in behavior the diff touches, missing eager loads (`Model::shouldBeStrict()` makes lazy loading throw — every Resource must eager-load what it serializes).
2. **Layering**: thin controllers (FormRequest injected, never `$request->validate()`), business logic in Actions/Services, complex queries in scopes/query classes, thin models.
3. **Conventions**: DTOs named as nouns, `declare(strict_types=1)`, code/comments in English, UI copy in Spanish.
4. **Frontend**: no page-level horizontal scroll on any viewport, files ≤ 250 lines / components ≤ 150, logic in hooks, no hand-added `useMemo`/`useCallback`/`memo` (React Compiler), prefer shadcn/ui primitives.
5. **Diff security**: any secret/credential, or any change under `.github/**`, `Dockerfile`, `docker/**` or `.env*`, is an automatic REQUIRED finding flagged **ESCALATE**.

## Report format

Verdict first: **APPROVE** or **NEEDS-FIXES**. Then findings ranked most severe first, one line each:

```text
file:line — problem — why it fails — suggested fix
```

Each finding marked REQUIRED or OPTIONAL. No diff dumps.

## Posting to a PR (`--pr <number>`)

Post the report with `gh pr comment <number>`, translated to Spanish:

```md
## Revisión

**Veredicto:** APROBADO | REQUIERE CAMBIOS

- [REQUERIDO|OPCIONAL] `file:line` — problema — corrección sugerida

Validación: <resultado de validate-code --full si se conoce>
```

Never mention agents or tooling in the comment.
