import { afterEach, describe, expect, test, vi } from 'vitest';

import { toActionParams } from './ActionParams.js';
import { __testing__, checkSpellingForContext, type Context } from './checkSpelling.js';
import { getDefaultLogger, type Logger } from './logger.js';

const { gatherFileGlobsFromContext } = __testing__;

vi.mock('./logger.js', async (importActual) => {
    const logger: Logger = {
        error: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        issueCommand: vi.fn(),
        summary: vi.fn(),
    };

    return {
        ...(await importActual<typeof import('./logger.js')>()),
        getDefaultLogger: () => logger,
    };
});

const spyConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

describe('checkSpellingForContext', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test('checkSpellingForContext unknown event', async () => {
        const params = toActionParams({ incremental_files_only: 'true' });
        const context = testContext({ githubContext: { eventName: 'unknown', payload: {} } });
        const result = await checkSpellingForContext(params, context);
        expect(result.errors).toBe(0);
        expect(getDefaultLogger().warning).toHaveBeenCalledWith(
            'Unsupported event: unknown. Using files from latest commit.',
        );
    });

    test('checkSpellingForContext bad push event', async () => {
        const params = toActionParams({ incremental_files_only: 'true' });
        const context = testContext({ githubContext: { eventName: 'push', payload: { after: 'bad_sha' } } });
        const result = await checkSpellingForContext(params, context);
        expect(result.errors).toBe(0);
        expect(getDefaultLogger().error).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('Command failed: git diff-tree') }),
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
