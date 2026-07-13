# Fototobares

[![Code Quality Checks](https://github.com/sntlln93/fototobares/actions/workflows/code-quality.yml/badge.svg?branch=develop)](https://github.com/sntlln93/fototobares/actions/workflows/code-quality.yml)
[![Tests](https://github.com/sntlln93/fototobares/actions/workflows/tests.yml/badge.svg?branch=develop)](https://github.com/sntlln93/fototobares/actions/workflows/tests.yml)

Sistema de gestión para un estudio de fotografía escolar: ventas y pedidos
por escuela/curso, cobros en cuotas con comprobantes compartibles por
WhatsApp, producción por etapas con consumo de insumos, stock, entregas
parciales, cancelaciones con reciclaje y asignación de fotos por número.

## Stack

- **Backend**: Laravel 13 (PHP 8.4), MySQL 8.
- **Frontend**: Inertia 3 + React 19 + TypeScript, Tailwind 4 + shadcn/ui, Vite 8.
- **Entorno de desarrollo**: [Laravel Sail](https://laravel.com/docs/sail)
  (no hace falta PHP ni MySQL locales).

## Desarrollo

```bash
# primera vez (instala vendor/ sin PHP local; el ignore es solo para el
# bootstrap: todavía no hay imagen php85-composer de Sail)
docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html \
    laravelsail/php84-composer:latest composer install --ignore-platform-req=php

cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan storage:link             # una sola vez por clon
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

Tanto Pest como Vitest incluyen **tests de arquitectura** que hacen fallar el
build ante una violación estructural, sin baseline:

- Backend (`tests/Arch/`): controllers finos, actions de una sola
  responsabilidad (`handle()`), validación por FormRequest y layering
  (el dominio no depende de `App\Http`).
- Frontend (`resources/js/architecture.test.ts`): co-locación por módulo
  (solo `components/`, `hooks/`, `tests/`), sin carpetas `partials/` y sin
  imports cross-module de los internals de otro módulo.

## CI

Dos workflows corren en cada PR y en cada push a `develop`/`main`:

- **Code Quality Checks**: `quality_backend` (Pint + PhpStan) y
  `quality_frontend` (Prettier + ESLint + tsc). ESLint además enforza los
  límites de tamaño (250 líneas por archivo, 150 por componente), las clases
  Tailwind canónicas y que `components/ui` no importe dominio.
- **Tests**: `tests_backend` (Pest, con los tests de arquitectura como paso
  _fast-fail_ `🏛️ Arch tests` antes del resto), `tests_frontend` (Vitest,
  incluye el test de arquitectura del frontend) y `e2e` (Playwright contra
  `php artisan serve`).

Los cinco checks son requeridos para mergear. El setup compartido vive en
`.github/actions/`.

## Flujo de trabajo

- PRs a `develop` con squash; releases `develop → main` con merge commit.
- El merge a `main` deploya automáticamente (dokploy, Build Type = Dockerfile:
  la imagen de producción se construye con el `Dockerfile` del repo).
- Convención de commits: `<type>(<scope>): <description>` (ver `CLAUDE.md`).
