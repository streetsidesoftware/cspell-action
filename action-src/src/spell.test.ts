import * as spell from './spell';
import { root } from './test/helper';
import { CSpellReporterForGithubAction, Logger } from './reporter';

describe('Validate Spell Checking', () => {
    test('Linting some files', async () => {
        const options = {
            root,
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
});
