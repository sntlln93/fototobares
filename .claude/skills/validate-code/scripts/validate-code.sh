#!/usr/bin/env bash
# Conditional quality gate: detects which side of the codebase changed and
# runs only the matching tools. PHP and npm run through Sail — there is no
# local PHP and the local node breaks vitest/rollup.
#
# Usage: bash .claude/skills/validate-code/scripts/validate-code.sh [--full]
#   --full | --pr   also run the test suites of the touched side(s)
#                   (vitest / pest; playwright runs in CI only, never here —
#                   a local run resets the dev database)

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
# Output is captured, not streamed: a passing tool prints its whole file/test
# list, which is pure noise that an agent then re-reads on every later turn.
# On success only the label is emitted; on failure, a per-tool filtered log
# (falling back to the raw tail when the filter matches nothing).
filter_log() {
    local filter=$1 log=$2
    case "$filter" in
        phpstan)
            # Drop PHPStan's fixed preamble/table borders — keep only
            # "path:line:message" lines — and strip the container path prefix.
            grep -E '^[^:]+:[0-9]+:' "$log" | sed -E 's#^/var/www/html/##'
            ;;
        tsc)
            grep -E 'error TS' "$log"
            ;;
        eslint)
            sed -E 's/^[[:space:]]+//; s/[[:space:]]{2,}/ /g' "$log"
            ;;
        vitest)
            grep -E '^::error' "$log"
            ;;
        pest)
            sed -E $'s/\x1b\\[[0-9;]*[a-zA-Z]//g' "$log"
            ;;
        raw | *)
            cat "$log"
            ;;
    esac
}

run() {
    local label=$1 filter=$2
    shift 2
    local log
    log=$(mktemp)
    if "$@" >"$log" 2>&1; then
        echo "==> $label: OK"
    else
        echo "==> $label: FAILED"
        local filtered
        filtered=$(filter_log "$filter" "$log")
        if [ -z "$filtered" ]; then
            tail -n "${VALIDATE_LOG_LINES:-40}" "$log"
        else
            echo "$filtered" | head -n "${VALIDATE_LOG_LINES:-40}"
        fi
        echo
        failures+=("$label")
    fi
    rm -f "$log"
}

if $backend; then
    run "pint" "raw" "$SAIL" php ./vendor/bin/pint
    run "phpstan" "phpstan" "$SAIL" php ./vendor/bin/phpstan analyse --error-format=raw --no-progress
fi

if $frontend || $e2e; then
    run "prettier (write)" "raw" "$SAIL" npm run format
fi

if $frontend; then
    run "eslint (fix)" "eslint" "$SAIL" npm run lint -- --max-warnings=0
    run "tsc" "tsc" "$SAIL" npx tsc --noEmit
fi

if $e2e; then
    run "tsc (e2e)" "tsc" "$SAIL" npx tsc -p e2e --noEmit
fi

if $FULL; then
    $backend && run "pest" "pest" "$SAIL" php ./vendor/bin/pest --compact --colors=never
    $frontend && run "vitest" "vitest" "$SAIL" npm run test -- --reporter=github-actions --no-isolate
    # Playwright is CI-only: a local run resets the dev database. The e2e
    # required check covers it on every PR.
    $e2e && echo "==> playwright: skipped locally (runs in CI; local run would reset the dev DB)" && echo
fi

if [ ${#failures[@]} -gt 0 ]; then
    echo "FAILED: ${failures[*]}"
    exit 1
fi

echo "All checks passed."
