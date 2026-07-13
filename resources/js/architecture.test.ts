import { readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * Frontend architecture tests (#131) — the co-location analog of the backend
 * Pest arch suite. They encode the structural rules from CLAUDE.md so a stray
 * folder fails CI instead of silently accumulating. Import-boundary rules live
 * in eslint.config.js (eslint-plugin-boundaries); this file owns the parts that
 * are about the shape of the tree on disk.
 */

const jsDir = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(jsDir, 'pages');

/** All directory paths under `root`, recursively, relative to `jsDir`. */
function allDirs(root: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(root)) {
        const full = join(root, name);
        if (statSync(full).isDirectory()) {
            out.push(relative(jsDir, full), ...allDirs(full));
        }
    }
    return out;
}

/** Immediate subdirectory names of `dir`. */
function subDirs(dir: string): string[] {
    return readdirSync(dir).filter((name) =>
        statSync(join(dir, name)).isDirectory(),
    );
}

describe('frontend architecture', () => {
    it('has no legacy partials/ folders', () => {
        const offenders = allDirs(jsDir).filter(
            (dir) => dir.split('/').pop() === 'partials',
        );

        expect(
            offenders,
            `Legacy partials/ folders found (co-locate into components/): ${offenders.join(', ')}`,
        ).toEqual([]);
    });

    it('page modules only use components/, hooks/ and tests/ subfolders', () => {
        const allowed = new Set(['components', 'hooks', 'tests']);

        const offenders = subDirs(pagesDir).flatMap((module) =>
            subDirs(join(pagesDir, module))
                .filter((sub) => !allowed.has(sub))
                .map((sub) => `pages/${module}/${sub}`),
        );

        expect(
            offenders,
            `Non-standard module subfolders (allowed: components, hooks, tests): ${offenders.join(', ')}`,
        ).toEqual([]);
    });
});
