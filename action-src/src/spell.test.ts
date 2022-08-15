import * as spell from './spell';
import { root } from './test/helper';
import { CSpellReporterForGithubAction, Logger } from './reporter';

const sc = expect.stringContaining;

describe('Validate Spell Checking', () => {
    test('Linting some files', async () => {
        const options = {
            root,
            checkDotFiles: undefined,
        };
        const f = () => {};
        const logger: Logger = {
            error: jest.fn(f),
            debug: jest.fn(f),
            info: jest.fn(f),
            warning: jest.fn(f),
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
            error: jest.fn(f),
            debug: jest.fn(f),
            info: jest.fn(f),
            warning: jest.fn(f),
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
        ${'fixtures/sampleDotFiles/**'}       | ${undefined}  | ${[sc('ts/sample.ts')]}
        ${'fixtures/sampleDotFiles/**'}       | ${true}       | ${[sc('.dot_dir/sample_nested.ts'), sc('.dot_sample.ts'), sc('ts/sample.ts')]}
        ${'fixtures/sampleDotFiles/**'}       | ${false}      | ${[sc('ts/sample.ts')]}
        ${'fixtures/sampleDotFiles/**/.*.ts'} | ${undefined}  | ${[sc('.dot_sample.ts')]}
        ${'fixtures/sampleDotFiles/**/.*.ts'} | ${true}       | ${[sc('.dot_sample.ts')]}
        ${'fixtures/sampleDotFiles/**/.*.ts'} | ${false}      | ${[]}
        ${'fixtures/sampleDotFiles/**/.*/**'} | ${undefined}  | ${[sc('.dot_dir/sample_nested.ts')]}
        ${'fixtures/sampleDotFiles/**/.*/**'} | ${true}       | ${[sc('.dot_dir/sample_nested.ts')]}
        ${'fixtures/sampleDotFiles/**/.*/**'} | ${false}      | ${[]}
    `('Linting checkDotFiles $glob $checkDotFiles', async ({ glob, checkDotFiles, expected }) => {
        const options = {
            root,
            checkDotFiles,
        };
        const info: string[] = [];
        const f = () => {};
        const logger: Logger = {
            error: jest.fn(f),
            debug: jest.fn(f),
            info: jest.fn((msg) => info.push(msg)),
            warning: jest.fn(f),
        };
        const reporter = new CSpellReporterForGithubAction('none', { verbose: true }, logger);
        await spell.lint([glob], options, reporter.reporter);
        expect(info.sort()).toEqual(expected);
    });
});
