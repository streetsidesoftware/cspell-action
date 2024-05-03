import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from 'typescript-eslint';

// @ts-check

export default tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    ...tsEslint.configs.recommended,
    {
        ignores: [
            '.github/**/*.yaml',
            '.github/**/*.yml',
            '**/__snapshots__/**',
            '**/.docusaurus/**',
            '**/.temp/**',
            '**/.yarn/**',
            '**/*.d.cts',
            '**/*.d.mts',
            '**/*.d.ts',
            '**/*.map',
            '**/build/**',
            '**/coverage/**',
            '**/dist.*/**',
            '**/dist/**',
            '**/fixtures/**',
            '**/node_modules/**',
            '**/temp/**',
            'action/**/*.cjs',
            'action/**/*.mjs',
        ],
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        files: ['**/*.{ts,cts,mts,tsx,js,mjs,cjs}'],
        rules: {
            // Note: you must disable the base rule as it can report incorrect errors
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'n/no-missing-import': [
                'off', // disabled because it is not working correctly
                {
                    tryExtensions: ['.d.ts', '.d.mts', '.d.cts', '.ts', '.cts', '.mts', '.js', '.cjs', '.mjs'],
                },
            ],
        },
    },
    {
        files: ['**/*.cts', '**/*.cjs'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        files: [
            '**/__mocks__/**',
            '**/*.spec.*',
            '**/*.test.*',
            '**/build.mjs',
            '**/rollup.config.mjs',
            '**/perf/**',
            '**/*.perf.*',
            '**/test.*',
            '**/test-*',
            '**/test*/**',
        ],
        rules: {
            'n/no-extraneous-require': 'off', // Mostly for __mocks__ and test files
            'n/no-extraneous-import': 'off',
            'n/no-unpublished-import': 'off',
            '@typescript-eslint/no-explicit-any': 'off', // any is allowed in tests
        },
    },
    {
        files: ['**/vitest.config.*', '**/jest.config.*', '**/__mocks__/**'],
        rules: {
            'n/no-extraneous-require': 'off',
            'n/no-extraneous-import': 'off',
            'no-undef': 'off',
        },
    },
);
