# Production image for dokploy (Build Type = Dockerfile). Replaces Nixpacks
# so the runtime is pinned here instead of chosen by a builder (#126, #134).
# PHP/Node versions must stay in sync with .github/actions/setup-php|setup-node
# and docker-compose.yml (Sail) — bump them together.

########## base: php-fpm + nginx + extensions, shared by build and runtime ##########
FROM php:8.5-fpm AS base

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN install-php-extensions pdo_mysql gd bcmath intl zip opcache pcntl \
    && apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base curl \
    && rm -rf /var/lib/apt/lists/*

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-app.ini"
COPY docker/php-fpm.d/zz-app.conf /usr/local/etc/php-fpm.d/zz-app.conf

# The dokploy persistent volume mounts at /app/storage/app — the app root
# must be /app for that mount to keep working.
WORKDIR /app

########## composer: PHP dependencies on the exact runtime platform ##########
FROM base AS composer

ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --no-progress

# package:discover (post-autoload-dump) needs the full app source present.
COPY . .
RUN composer dump-autoload --optimize --no-dev

########## assets: Vite build ##########
FROM node:24-bookworm-slim AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js postcss.config.js tsconfig.json ./
COPY resources/ resources/
# Plain `vite build`, not `npm run build`: the tsc step needs
# vendor/tightenco/ziggy and type-checking is CI's job anyway.
RUN npx vite build

########## runtime ##########
FROM base AS runtime

COPY . .
# The image owns the symlink (relative, like Laravel's storage:link --relative);
# the entrypoint creates the target dir after the volume mounts.
RUN ln -sfn ../storage/app/public public/storage

COPY --from=composer /app/vendor ./vendor
COPY --from=composer /app/bootstrap/cache ./bootstrap/cache
COPY --from=assets /app/public/build ./public/build

COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
    CMD curl -fsS "http://127.0.0.1:${PORT:-80}/up" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
