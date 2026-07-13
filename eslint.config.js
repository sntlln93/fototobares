import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwindCanonical from 'eslint-plugin-tailwind-canonical-classes';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'vendor/',
            'node_modules/',
            'public/',
            'storage/',
            'test-results/',
            'playwright-report/',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    reactHooks.configs.flat.recommended,
    prettierRecommended,
    // Vendored shadcn primitives keep upstream patterns (e.g. random skeleton
    // widths) that trip the react compiler purity rule
    {
        files: ['resources/js/components/ui/**'],
        rules: {
            'react-hooks/purity': 'off',
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'no-console': 'error',
        },
    },
    // Structural limits from CLAUDE.md (#81): every file stays under 250 lines
    // so heavy logic moves into hooks and sub-components. Vendored shadcn
    // primitives and tests are exempt.
    {
        files: ['resources/js/**/*.{ts,tsx}'],
        ignores: [
            'resources/js/components/ui/**',
            'resources/js/**/*.test.{ts,tsx}',
            'resources/js/**/tests/**',
        ],
        rules: {
            'max-lines': [
                'error',
                { max: 250, skipBlankLines: false, skipComments: false },
            ],
        },
    },
    // Components stay presentational and under 150 lines; business logic lives
    // in hooks (`.ts`), which the file-length limit above already bounds.
    {
        files: ['resources/js/**/*.tsx'],
        ignores: [
            'resources/js/components/ui/**',
            'resources/js/**/*.test.tsx',
            'resources/js/**/tests/**',
        ],
        rules: {
            'max-lines-per-function': [
                'error',
                { max: 150, skipBlankLines: true, skipComments: true },
            ],
        },
    },
    // Enforce canonical Tailwind class names via Tailwind v4's canonicalization
    // API. Vendored shadcn primitives are exempt so upstream updates don't drift.
    {
        files: ['resources/js/**/*.{ts,tsx}'],
        ignores: ['resources/js/components/ui/**'],
        plugins: {
            'tailwind-canonical-classes': tailwindCanonical,
        },
        rules: {
            'tailwind-canonical-classes/tailwind-canonical-classes': [
                'error',
                { cssPath: './resources/css/app.css' },
            ],
        },
    },
    // Import boundary (#131): vendored ui/ primitives must stay domain-agnostic
    // — no reaching into pages, features, layouts or global hooks. The
    // cross-module boundary (a module must not import another module's
    // internals) is enforced by resources/js/architecture.test.ts.
    {
        files: ['resources/js/components/ui/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@/pages/*',
                                '@/pages/**',
                                '@/features/*',
                                '@/features/**',
                                '@/layouts/*',
                                '@/layouts/**',
                            ],
                            message:
                                'components/ui/ must stay domain-agnostic (no pages/features/layouts imports).',
                        },
                    ],
                },
            ],
        },
    },
);
