#!/usr/bin/env bash
# Conditional quality gate: detects which side of the codebase changed and
# runs only the matching tools. PHP and npm run through Sail — there is no
# local PHP and the local node breaks vitest/rollup.
#
# Usage: bash .claude/skills/validate-code/scripts/validate-code.sh [--full]
#   --full | --pr   also run the test suites of the touched side(s)
#                   (vitest / pest, and playwright when e2e files changed)

set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1

SAIL=./vendor/bin/sail
FULL=false
if [ "${1:-}" = "--full" ] || [ "${1:-}" = "--pr" ]; then
    FULL=true
fi

if ! "$SAIL" ps 2>/dev/null | grep -q "laravel.test.*Up"; then
    echo "ERROR: Sail is not running. Start it with: $SAIL up -d" >&2
    exit 1
fi

# Changed files: committed on this branch (vs the merge-base with develop)
# + staged + working tree + untracked.
base=$(git merge-base HEAD origin/develop 2>/dev/null \
    || git merge-base HEAD develop 2>/dev/null \
    || echo HEAD)
files=$(
    {
        git diff --name-only "$base" 2>/dev/null
        git diff --name-only --cached 2>/dev/null
        git ls-files --others --exclude-standard
    } | sort -u
)

backend=false
frontend=false
e2e=false
grep -qE '\.php$|^composer\.(json|lock)$|^database/|^routes/|^phpstan|^phpunit' <<<"$files" && backend=true
grep -qE '^resources/.*\.(ts|tsx|js|jsx|css)$|^package(-lock)?\.json$|^(vite|vitest|tailwind|postcss)\.config' <<<"$files" && frontend=true
grep -qE '^e2e/|^playwright\.config\.ts$' <<<"$files" && e2e=true

if ! $backend && ! $frontend && ! $e2e; then
    echo "No backend, frontend or e2e changes detected — nothing to validate."
    exit 0
fi

echo "Changed sides: backend=$backend frontend=$frontend e2e=$e2e (full=$FULL)"
echo

failures=()
run() {
    local label=$1
    shift
    echo "==> $label"
    if "$@"; then
        echo "    OK"
    else
        echo "    FAILED"
        failures+=("$label")
    fi
    echo
}

if $backend; then
    run "pint" "$SAIL" php ./vendor/bin/pint
    run "phpstan" "$SAIL" php ./vendor/bin/phpstan analyse
fi

if $frontend || $e2e; then
    run "prettier (write)" "$SAIL" npm run format
fi

if $frontend; then
    run "eslint (fix)" "$SAIL" npm run lint -- --max-warnings=0
    run "tsc" "$SAIL" npx tsc --noEmit
fi

if $e2e; then
    run "tsc (e2e)" "$SAIL" npx tsc -p e2e --noEmit
fi

if $FULL; then
    $backend && run "pest" "$SAIL" php ./vendor/bin/pest
    $frontend && run "vitest" "$SAIL" npm run test
    # Playwright runs on the host (not Sail) and resets the dev database
    $e2e && run "playwright" npx playwright test
fi

if [ ${#failures[@]} -gt 0 ]; then
    echo "FAILED: ${failures[*]}"
    exit 1
fi

echo "All checks passed."
