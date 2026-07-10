# Fototobares

[![Code Quality Checks](https://github.com/sntlln93/fototobares/actions/workflows/code-quality.yml/badge.svg?branch=develop)](https://github.com/sntlln93/fototobares/actions/workflows/code-quality.yml)
[![Tests](https://github.com/sntlln93/fototobares/actions/workflows/tests.yml/badge.svg?branch=develop)](https://github.com/sntlln93/fototobares/actions/workflows/tests.yml)

Sistema de gestión para un estudio de fotografía escolar: ventas y pedidos
por escuela/curso, cobros en cuotas con comprobantes compartibles por
WhatsApp, producción por etapas con consumo de insumos, stock, entregas
parciales, cancelaciones con reciclaje y asignación de fotos por número.

## Stack

- **Backend**: Laravel 11 (PHP 8.4), MySQL 8.
- **Frontend**: Inertia + React 18 + TypeScript, Tailwind + shadcn/ui, Vite 5.
- **Entorno de desarrollo**: [Laravel Sail](https://laravel.com/docs/11.x/sail)
  (no hace falta PHP ni MySQL locales).

## Desarrollo

```bash
# primera vez (instala vendor/ sin PHP local)
docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html \
    laravelsail/php84-composer:latest composer install

cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate:fresh --seed   # deja la app navegable con datos demo
./vendor/bin/sail npm ci
./vendor/bin/sail npm run build                  # o `npm run dev` para HMR
```

La app queda en <http://localhost>. Usuario demo: `agustin@fototobares.com` /
`contraseña` (hay un usuario por rol: oficina, editor y taller, mismo
password).

> **npm siempre por Sail**: el node del contenedor es el soportado; un node
> local viejo rompe vitest/rollup. La excepción es Playwright, que corre en el
> host.

## Tests

```bash
./vendor/bin/sail php ./vendor/bin/pest   # backend (Feature)
./vendor/bin/sail npm run test            # frontend (Vitest)
npm run test:e2e                          # e2e (Playwright, host; resetea la DB de dev)
```

La suite e2e resetea la base (`migrate:fresh --seed`) al arrancar y necesita
Sail levantado. Primera vez: `npx playwright install chromium`.

## CI

Dos workflows corren en cada PR y en cada push a `develop`/`main`:

- **Code Quality Checks**: `quality_backend` (Pint + PhpStan) y
  `quality_frontend` (Prettier + ESLint + tsc).
- **Tests**: `tests_backend` (Pest), `tests_frontend` (Vitest) y `e2e`
  (Playwright contra `php artisan serve`).

Los cinco checks son requeridos para mergear. El setup compartido vive en
`.github/actions/`.

## Flujo de trabajo

- PRs a `develop` con squash; releases `develop → main` con merge commit.
- El merge a `main` deploya automáticamente (dokploy).
- Convención de commits: `<type>(<scope>): <description>` (ver `CLAUDE.md`).
