import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
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
);
