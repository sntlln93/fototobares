# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Fototobares: management system for a school photography studio — orders by school/classroom, installment payments with WhatsApp-shareable receipts, staged production with stock consumption, partial deliveries, cancellations with recycling, photo-to-child assignment by number.

- Stack: Laravel 13 (PHP 8.4) + MySQL 8, Inertia 3 + React 19 + TypeScript, Tailwind 4 + shadcn/ui, Vite 8. The React Compiler is enabled (`vite.config.js`) — do not hand-add `useMemo`/`useCallback`/`memo`; let the compiler memoize. `eslint-plugin-react-hooks` enforces its rules in CI.
- Language split: code, branches, commits and code comments in **English**; UI copy and GitHub PRs/issues/comments always in **Spanish**.
- There is no real production yet: migrations are edited in-place and re-run with `migrate:fresh --seed` instead of adding new migration files; bug fixes may be folded into redesigns.

## Environment & commands

Everything runs through Laravel Sail (Docker) — there is no local PHP, and a local node breaks vitest/rollup. **Run composer, artisan and npm through Sail.** The only exception is Playwright, which runs on the host.

```bash
./vendor/bin/sail up -d                          # required for everything below
./vendor/bin/sail artisan migrate:fresh --seed   # navigable app with demo data
./vendor/bin/sail npm run build                  # or `npm run dev` for HMR
```

App at <http://localhost>. Demo users, one per role: `agustin@fototobares.com` / `contraseña` (same password for the oficina/editor/taller users).

### Tests

```bash
# Backend — Pest, Feature tests only, DB `testing`
./vendor/bin/sail php ./vendor/bin/pest
./vendor/bin/sail php ./vendor/bin/pest tests/Feature/OrderTest.php   # one file
./vendor/bin/sail php ./vendor/bin/pest --filter "cancels an order"  # one test

# Frontend — Vitest (jsdom + RTL), *.test.ts(x) colocated under resources/js
./vendor/bin/sail npm run test
./vendor/bin/sail npm run test -- resources/js/lib/whatsapp.test.ts

# E2E — Playwright, HOST (not Sail); needs Sail up. RESETS the dev DB
# (migrate:fresh --seed) at the start of each run.
npm run test:e2e
npm run test:e2e -- e2e/tracking.spec.ts
```

### Quality

Use the `validate-code` skill — it detects the touched side(s) and runs the right tools through Sail:

- After **every** code change: run `validate-code` and fix everything until it passes.
- Before proposing a PR: run `validate-code` with `--full` (adds the test suites of the touched sides).

Underlying tools if you need one directly: `sail composer pint` / `sail composer analyse` (phpstan level 9, larastan), `sail npm run format` / `lint` (prettier/eslint), `sail npx tsc`. Pint enforces `declare(strict_types=1)`.

## Agent rules

- Never create commits or push without explicit approval. Never push directly to `develop`.
- Use the `prepare-commit` skill to structure commit messages before requesting approval.
- Never mention the agent in commits, comments or project messages.
- Read and modify any file inside this repository without asking; never read or modify files outside it without approval.
- Refactor first: check whether the structure needs cleanup before adding a feature, and do that refactor as an isolated step.
- On GitHub issues: ignore label `deferred`, prioritize label `bug`.
- Prefer shadcn/ui for frontend components.
- Generate PDFs, printables and images client-side (canvas) — no server-side generation.
- Work should be done sequentially with per-module commits.

## Commit format

```text
<type>(<scope>): <description>
```

`type` required; `scope` optional but use the most specific available. Description: lowercase, imperative, brief, no trailing period. Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `style` (formatting, not CSS), `build`, `ci`, `chore`.

## Git & CI workflow

- PRs target `develop` and merge with **squash**; never reuse a merged branch.
- Releases `develop → main` use a **merge commit** (never squash — a squashed release is what caused the recurring main/develop conflicts).
- Merging to `main` auto-deploys via dokploy.
- Five required checks on every PR: `quality_backend` (Pint+PhpStan), `quality_frontend` (Prettier+ESLint+tsc), `tests_backend` (Pest), `tests_frontend` (Vitest), `e2e` (Playwright). Shared setup lives in `.github/actions/setup-php|setup-node` — the single source of PHP/Node versions. Renaming a CI job requires updating the branch rulesets or PRs get blocked.

## Architecture

### Backend layering (strict)

Request flow: thin controller (`app/Http/Controllers/BO/`) → dedicated `FormRequest` (`app/Http/Requests/`) → Action/Service (`app/Actions/`, `app/Services/`) → API Resource (`app/Http/Resources/`) → Inertia page.

- **Thin controllers**: HTTP routing, authorization, responses only. No SQL, validation, or business logic. Never `$request->validate()` — always inject a FormRequest.
- **Actions/Services**: business logic in single-responsibility classes with one `execute()`/`handle()` method.
- **Thin models**: relations, casts, basic scopes only. Resources/DTOs do data shaping. Complex queries go in scopes/query classes, not controllers.
- `Model::shouldBeStrict()` is active (`AppServiceProvider`) — lazy loading **throws**. Every Resource must eager-load what it serializes. `tests/Feature/PageSmokeTest.php` auto-discovers all GET routes against the demo seed and fails on any ≥400 response; it catches missing eager loads.
- Roles: `App\Enums\UserRole` (master, administración, oficina, editor, taller), enforced with `role:` route-middleware groups in `routes/web.php`. `RoleAccessTest` covers the roles×routes matrix.

### Production domain (the non-obvious part)

Production stages belong to a **product** (`production_statuses.product_id`), not a product type. Stock consumption is configured per stage via the `production_status_stockable` pivot (stage, stockable, quantity). Advancing an order detail through stages deducts the configured amounts for every stage reached (cumulative on jumps), recorded in `stock_movements` and idempotent per (detail, stockable). Cancellation returns stock exactly per recorded movements. A stockable may hang off only one stage per product. New products are born with a single "Terminado" stage (`CreateProduct` action).

### Frontend structure

- `resources/js/pages/<module>/`: only Inertia entrypoints (`index.tsx`, `create.tsx`, `edit.tsx`, `show.tsx`) at the module root — non-CRUD feature modules use a single `index.tsx`; everything else goes in local `components/`, `hooks/`, `tests/` folders. Existing `partials/` folders are legacy — do not add new ones; migrate when touching a module.
- `components/ui/`: generic headless primitives (shadcn style, domain-agnostic). `components/` root: shared atomic components without domain/layout awareness. `features/`: shared composed components with domain/layout awareness. Global infra: `layouts/`, `hooks/`, `lib/` (pure TS helpers/enums), `types/`.
- Components stay presentational; business logic, state mutations and API calls live in custom hooks (`useSomething.ts`). Max 250 lines per file, 150 per component — refactor before adding logic. Don't over-parametrize for reuse; prefer dedicated components.
- Styling: Tailwind utilities inside components; `resources/css/app.css` is the only stylesheet. `resources/views/` holds only `app.blade.php` — no Blade views.
- **No page-level horizontal scroll, on any viewport** (app is used primarily on mobile): wide content scrolls inside its own `overflow-auto` wrapper or wraps (`flex-wrap`); mind `min-w-0` on flex items. Known smell: `grid gap-6 xl:grid-cols-*` without an explicit `grid-cols-1` base.

### E2E suite

Playwright runs with `workers: 1` against a single freshly-seeded DB per run; a setup project resets the DB and logs in as master (`storageState`). Specs mutate **disjoint** demo orders — when adding a spec, pick an order no other spec touches. Local vs CI is parametrized via `E2E_ARTISAN` / `E2E_BASE_URL`.

## Session docs (local only)

`.claude/docs/` is gitignored (only `.claude/skills/` is tracked). If `.claude/docs/status.md` exists, **read it at session start** — it is the living record of project status, recent decisions and pending work.
