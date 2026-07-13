/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
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

/** All .ts/.tsx file paths under `root`, recursively. */
function allFiles(root: string): string[] {
    return readdirSync(root).flatMap((name) => {
        const full = join(root, name);
        if (statSync(full).isDirectory()) return allFiles(full);
        return /\.tsx?$/.test(name) ? [full] : [];
    });
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

    it('no module imports from another page module', () => {
        // Page modules are independent: anything shared between two modules
        // belongs in features/ (domain-aware) or components/ (atomic), never in
        // the other module — not even its root entrypoints (#136). Both alias
        // (@/pages/...) and relative (../...) imports are resolved and checked.
        const importRe = /from\s+['"]([^'"]+)['"]/g;

        const offenders = subDirs(pagesDir).flatMap((module) =>
            allFiles(join(pagesDir, module)).flatMap((file) => {
                const src = readFileSync(file, 'utf8');
                const hits: string[] = [];
                for (const [, spec] of src.matchAll(importRe)) {
                    const target = spec.startsWith('@/')
                        ? join(jsDir, spec.slice(2))
                        : spec.startsWith('.')
                          ? resolve(dirname(file), spec)
                          : null;
                    if (!target) continue;
                    const rel = relative(pagesDir, target);
                    if (rel.startsWith('..')) continue;
                    if (rel.split(sep)[0] !== module) {
                        hits.push(`${relative(jsDir, file)} -> ${spec}`);
                    }
                }
                return hits;
            }),
        );

        expect(
            offenders,
            `Cross-module imports between page modules: ${offenders.join(', ')}`,
        ).toEqual([]);
    });
});
