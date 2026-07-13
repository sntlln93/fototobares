#!/bin/sh
set -e

cd /app

# One-off commands (e.g. `docker run <image> php artisan ...`) run as-is,
# without booting the web server or touching caches.
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

# The dokploy volume mounted at /app/storage/app shadows the image's skeleton;
# recreate what the app expects. storage/app/public must exist or the baked-in
# public/storage symlink dangles. Never run `artisan storage:link` here.
mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# storage/app is the uploads volume — never chown it recursively.
chown -R www-data:www-data storage/framework storage/logs bootstrap/cache
chown www-data:www-data storage/app storage/app/public

# Env is injected by dokploy at runtime (no .env in the image), so caches are
# built at container start, not image build. No route:cache: routes/settings.php
# registers a closure route, which cannot be serialized. No migrations, ever.
php artisan config:cache
php artisan view:cache
chown -R www-data:www-data bootstrap/cache storage/framework/views

# Same process model Nixpacks used: php-fpm daemonized, nginx in foreground
# as PID 1. A dead php-fpm surfaces as 502s and a failing HEALTHCHECK (/up).
export PORT="${PORT:-80}"
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
php-fpm -D
exec nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
