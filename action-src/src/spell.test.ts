import path from 'node:path';

import { Issue } from 'cspell';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { CSpellReporterForGithubAction } from './reporter.js';
import * as spell from './spell.js';
import {
    createIssueCommandCollector,
    fixturesLocation,
    mockLogger,
    resolveFile,
    resolveFiles,
    root,
    sourceDir,
} from './test/helper.js';

const sc: typeof expect.stringContaining = (...s) => expect.stringContaining(...s);
const rOptions = { verbose: false, treatFlaggedWordsAsErrors: false };

vi.spyOn(console, 'warn').mockImplementation(() => undefined);

describe('Validate Spell Checking', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test('Linting some files', async () => {
        const options = {
            root,
            checkDotFiles: undefined,
        };
        const logger = mockLogger();
        const reporter = new CSpellReporterForGithubAction('none', { ...rOptions, verbose: false }, logger);
        await spell.lint(['action-src/src/spell.ts', 'fixtures/sampleCode/ts/**/*.ts'], options, reporter.reporter);
        const r = reporter;
        expect(r.result.files).toBe(2);
        expect(r.result.issues).toBe(0);
        expect(r.result.filesWithIssues.size).toBe(0);
        expect(r.issues).toEqual([]);
        expect(logger.info).not.toHaveBeenCalledWith(expect.stringContaining('spell.ts'));
        expect(logger.info).toHaveBeenCalledTimes(0);
    });

    test('Linting some files (Verbose)', async () => {
        const options = {
            root,
            checkDotFiles: undefined,
        };
        const logger = mockLogger();
        const reporter = new CSpellReporterForGithubAction(
            'none',
            { verbose: true, treatFlaggedWordsAsErrors: false },
            logger,
        );
        await spell.lint(['action-src/src/spell.ts', 'fixtures/sampleCode/ts/**/*.ts'], options, reporter.reporter);
        const r = reporter;
        expect(r.result.files).toBe(2);
        expect(r.result.issues).toBe(0);
        expect(r.result.filesWithIssues.size).toBe(0);
        expect(r.issues).toEqual([]);
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('spell.ts'));
    });

    test.each`
        glob                                  | checkDotFiles | expected
        ${'fixtures/sampleDotFiles/**'}       | ${undefined}  | ${[sc('.dot_dir/sample_nested.ts'), sc('.dot_sample.ts'), sc('ts/sample.ts')]}
        ${'fixtures/sampleDotFiles/**'}       | ${true}       | ${[sc('.dot_dir/sample_nested.ts'), sc('.dot_sample.ts'), sc('ts/sample.ts')]}
        ${'fixtures/sampleDotFiles/**'}       | ${false}      | ${[sc('ts/sample.ts')]}
        ${'fixtures/sampleDotFiles/**/.*.ts'} | ${undefined}  | ${[sc('.dot_sample.ts')]}
        ${'fixtures/sampleDotFiles/**/.*.ts'} | ${true}       | ${[sc('.dot_sample.ts')]}
        ${'fixtures/sampleDotFiles/**/.*.ts'} | ${false}      | ${[sc('.dot_sample.ts')]}
        ${'fixtures/sampleDotFiles/**/.*/**'} | ${undefined}  | ${[sc('.dot_dir/sample_nested.ts')]}
        ${'fixtures/sampleDotFiles/**/.*/**'} | ${true}       | ${[sc('.dot_dir/sample_nested.ts')]}
        ${'fixtures/sampleDotFiles/**/.*/**'} | ${false}      | ${[sc('.dot_dir/sample_nested.ts')]}
    `('Linting checkDotFiles $glob $checkDotFiles', async ({ glob, checkDotFiles, expected }) => {
        const options = {
            root,
            checkDotFiles,
        };
        const info: string[] = [];
        const logger = mockLogger({ info: vi.fn((msg) => info.push(msg)) });
        const reporter = new CSpellReporterForGithubAction('none', { ...rOptions, verbose: true }, logger);
        await spell.lint([glob], options, reporter.reporter);
        expect(info.sort()).toEqual(expected);
    });

    const defaultResult = {
        cachedFiles: 0,
        errors: 0,
        files: 0,
        filesWithIssues: new Set(),
        issues: 0,
        // skippedFiles: 0,
    };

    const sampleConfig = resolveFile('fixtures/cspell.json', sourceDir);
    const sampleConfigTs = resolveFile('fixtures/sampleCode/ts/cspell.config.yaml', sourceDir);

    const sampleCodeTsOptions = {
        root: f('sampleCode/ts'),
    };

    const samplesWithErrorsOptions = {
        root: f('reporting/samples_with_errors'),
    };

    test.each`
        globs                   | files                                            | options                       | expected
        ${[]}                   | ${['fixtures/sampleCode/ts/sample.ts']}          | ${{}}                         | ${{ files: 1, skippedFiles: 0 }}
        ${['**/*.ts']}          | ${['fixtures/sampleCode/ts/sample.ts']}          | ${{}}                         | ${{ files: 1, skippedFiles: 0 }}
        ${[]}                   | ${['fixtures/sampleCode/ts/missing.ts']}         | ${{}}                         | ${{ files: 0 }}
        ${[]}                   | ${[]}                                            | ${{}}                         | ${{ files: 0 }}
        ${[]}                   | ${undefined}                                     | ${sampleCodeTsOptions}        | ${{ files: 1, skippedFiles: 0 }}
        ${[]}                   | ${['fixtures/sampleCode/ts/cspell.config.yaml']} | ${{ config: sampleConfig }}   | ${{ files: 1, skippedFiles: 0 }}
        ${[]}                   | ${['fixtures/sampleCode/ts/cspell.config.yaml']} | ${{ config: sampleConfigTs }} | ${{ files: 0 }}
        ${['**/*.ts']}          | ${['fixtures/sampleCode/ts/cspell.config.yaml']} | ${{ config: sampleConfig }}   | ${{ files: 0 }}
        ${['**/ts/missing.ts']} | ${undefined}                                     | ${{}}                         | ${{ files: 0 }}
    `('Linting no errors $globs $files $options', async ({ globs, files, options, expected }) => {
        const opts: spell.LintOptions = {
            root,
            checkDotFiles: undefined,
            files: resolveFiles(files, sourceDir),
            ...options,
        };
        const info: string[] = [];
        const logger = mockLogger({ info: vi.fn((msg) => info.push(msg)) });
        const reporter = new CSpellReporterForGithubAction('warning', { ...rOptions, verbose: false }, logger);
        await spell.lint(globs, opts, reporter.reporter);
        expect(reporter.result).toEqual({ ...defaultResult, ...expected });
    });

    // cspell:ignore Functon countt blacklist colours errrrorrs
    test.each`
        globs | report       | options                     | expected                                                        | expectedIssues
        ${[]} | ${undefined} | ${samplesWithErrorsOptions} | ${{ files: 1, filesWithIssues: s('withErrors.ts'), issues: 4 }} | ${['Functon', 'countt', 'blacklist', 'colours']}
        ${[]} | ${'all'}     | ${samplesWithErrorsOptions} | ${{ files: 1, filesWithIssues: s('withErrors.ts'), issues: 5 }} | ${['Functon', 'countt', 'blacklist', 'colours', 'errrrorrs']}
        ${[]} | ${'typos'}   | ${samplesWithErrorsOptions} | ${{ files: 1, filesWithIssues: s('withErrors.ts'), issues: 3 }} | ${['Functon', 'blacklist', 'colours']}
        ${[]} | ${'simple'}  | ${samplesWithErrorsOptions} | ${{ files: 1, filesWithIssues: s('withErrors.ts'), issues: 4 }} | ${['Functon', 'countt', 'blacklist', 'colours']}
        ${[]} | ${'flagged'} | ${samplesWithErrorsOptions} | ${{ files: 1, filesWithIssues: s('withErrors.ts'), issues: 1 }} | ${['blacklist']}
    `('Linting report: $report $options', async ({ globs, report, options, expected, expectedIssues }) => {
        const opts: spell.LintOptions = {
            root,
            checkDotFiles: undefined,
            ...options,
            report,
        };
        const info: string[] = [];
        const collector = createIssueCommandCollector();
        const issues: Issue[] = [];
        const logger = mockLogger({ info: vi.fn((msg) => info.push(msg)), issueCommand: collector.issueCommand });
        const reporter = new CSpellReporterForGithubAction('warning', { ...rOptions, verbose: false }, logger);
        reporter.onIssue = (issue) => issues.push(issue);
        await spell.lint(globs, opts, reporter.reporter);
        expect(reporter.result).toEqual({ ...defaultResult, skippedFiles: 0, ...expected });
        expect(issues.map((issue) => issue.text)).toEqual(expectedIssues);
    });
});

function s<T>(...parts: T[]): Set<T> {
    return new Set(parts);
}

/**
 * resolve fixture path
 * @param parts
 * @returns
 */
function f(...parts: string[]): string {
    return path.resolve(fixturesLocation, ...parts);
}
