import * as spell from './spell';
import { root } from './test/helper';
import { CSpellReporterForGithubAction, Logger } from './reporter';
import { describe, expect, test, vi } from 'vitest';

const sc = expect.stringContaining;

describe('Validate Spell Checking', () => {
    test('Linting some files', async () => {
        const options = {
            root,
            checkDotFiles: undefined,
        };
        const f = () => {};
        const logger: Logger = {
            error: vi.fn(f),
            debug: vi.fn(f),
            info: vi.fn(f),
            warning: vi.fn(f),
        };
        const reporter = new CSpellReporterForGithubAction('none', { verbose: false }, logger);
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
        const f = () => {};
        const logger: Logger = {
            error: vi.fn(f),
            debug: vi.fn(f),
            info: vi.fn(f),
            warning: vi.fn(f),
        };
        const reporter = new CSpellReporterForGithubAction('none', { verbose: true }, logger);
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
        const f = () => {};
        const logger: Logger = {
            error: vi.fn(f),
            debug: vi.fn(f),
            info: vi.fn((msg) => info.push(msg)),
            warning: vi.fn(f),
        };
        const reporter = new CSpellReporterForGithubAction('none', { verbose: true }, logger);
        await spell.lint([glob], options, reporter.reporter);
        expect(info.sort()).toEqual(expected);
    });
});
