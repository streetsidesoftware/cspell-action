import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { toActionParams } from './ActionParams.js';
import { __testing__, checkSpellingForContext, type Context } from './checkSpelling.js';

const { gatherFileGlobsFromContext } = __testing__;

const spyStdout = vi.spyOn(process.stdout, 'write').mockImplementation(function () {
    return true;
});

// const spyStderr = vi.spyOn(process.stderr, 'write').mockImplementation(function () {
//     return true;
// });

const spyConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

describe('checkSpellingForContext', () => {
    beforeEach(() => {
        spyStdout.mockClear();
        spyConsoleWarn.mockClear();
        // spyStderr.mockClear();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    test('checkSpellingForContext unknown event', async () => {
        const params = toActionParams({ incremental_files_only: 'true' });
        const context = testContext({ githubContext: { eventName: 'unknown', payload: {} } });
        const result = await checkSpellingForContext(params, context);
        expect(result.errors).toBe(0);
        expect(spyStdout).toHaveBeenCalledWith(
            '::warning::Unsupported event: unknown. Using files from latest commit.\n',
        );
    });

    test('checkSpellingForContext bad push event', async () => {
        const params = toActionParams({ incremental_files_only: 'true' });
        const context = testContext({ githubContext: { eventName: 'push', payload: { after: 'bad_sha' } } });
        const result = await checkSpellingForContext(params, context);
        expect(result.errors).toBe(0);
        expect(spyStdout).toHaveBeenCalledWith(
            expect.stringContaining('::error::Error: Command failed: git diff-tree'),
        );
        // Since all files are checked, there will be some spelling issues found.
        expect(spyConsoleWarn).toHaveBeenCalledWith('%s', expect.stringContaining('Unknown word'));
    });

    test('gatherFileGlobsFromContext', async () => {
        const context = testContext({ useCSpellFiles: true });
        const result = await gatherFileGlobsFromContext(context);
        expect(result).toBeUndefined();
    });
});

function testContext(partial: Partial<Context>): Context {
    return {
        githubContext: { eventName: 'push', payload: {} },
        globs: '**',
        useEventFiles: true,
        useCSpellFiles: false,
        dot: false,
        ...partial,
    };
}
