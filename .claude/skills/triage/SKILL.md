---
name: triage
description: Prepares GitHub issues for the autonomous issue flow. /triage #N runs an interactive definition-of-ready review with the owner and records the outcome on the issue (ready-for-agent label); /triage without arguments scans open issues and labels the incomplete ones needs-triage.
---

# Triage

## Usage

```text
/triage #N   # interactive triage of one issue
/triage      # cheap scan: label incomplete issues needs-triage
```

## Definition of ready

An issue is ready for the autonomous flow when:

1. **What** — the expected behavior is described unambiguously.
2. **Acceptance criteria** — 2–5 verifiable items.
3. **Decisions made** — the design/product choices the issue assumes, explicit ("do not revisit").
4. **Out of scope** — what is NOT included.
5. **Bugs only** — reproduction steps and current vs expected behavior.
6. **No external blockers** — nothing pending a client or product decision.

## Interactive mode (`/triage #N`)

1. Read `gh issue view <N> --comments`.
2. Evaluate against the definition of ready.
3. **Propose, don't interrogate**: draft the missing sections you can infer from the issue (acceptance criteria, scope) and present them to the owner to confirm, edit or reject — grouped, one issue at a time. Ask open questions only for what cannot be inferred.
4. Outcome:
   - **Ready** → post ONE structured comment in Spanish (`## Criterios de aceptación`, `## Decisiones tomadas`, `## Fuera de alcance`, plus `## Reproducción` for bugs). Then ask the owner directly: "¿Marco #N como `ready-for-agent`?" — add the label (and remove `needs-triage`) only on an explicit yes to that exact question. The owner having confirmed the drafted sections is NOT that permission.
   - **Blocked** → add the `blocked` label and post a short Spanish comment naming exactly which decision is missing and whose it is. Never `ready-for-agent`.
5. Create the labels on first use (`gh label create`). Never mention agents in issue comments.

## Scan mode (`/triage`, no arguments)

- `gh issue list --state open`, skipping issues labeled `deferred`, `blocked`, `ready-for-agent` or `needs-triage`.
- Judge each against the definition of ready by reading only — no questions, no comments, no `ready-for-agent`.
- Incomplete → add `needs-triage`. Looks complete → report it as a candidate for `/triage #N`.
- Prioritize `bug` (CLAUDE.md rule); cap at ~10 issues per run; finish with one line per issue: `#N — needs-triage (missing: …)` or `#N — candidate, run /triage #N to confirm`.

## Hard rule

`ready-for-agent` is the leader's mandatory intake gate. It is applied ONLY with the owner's absolute and exclusive permission: an explicit yes to the direct question "¿Marco #N como `ready-for-agent`?" at the end of interactive triage. Never by the scan, never inferred from content confirmations, never on any agent's say-so. No explicit permission → no label, regardless of how complete the issue looks.
