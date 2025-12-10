import { describe, expect, test, vi } from 'vitest';

import { createLogger } from './logger.js';
import { CSpellReporterForGithubAction } from './reporter.js';

describe('Validate Reporter', () => {
    test('Reporting Errors', () => {
        const logger = createLogger({
            debug: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
            error: vi.fn(),
        });

        const actionReporter = new CSpellReporterForGithubAction(
            'none',
            { verbose: false, treatFlaggedWordsAsErrors: true },
            logger,
        );
        const reporter = actionReporter.reporter;

        reporter.error?.('This is an error message', new Error('Test error'));
        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('This is an error message'));
    });

    test.each`
        msgType
        ${'Warning'}
        ${'Debug'}
        ${'Info'}
    `('Info is ignored $msgType', ({ msgType }) => {
        // Currently all "info" messages are ignored.
        const logger = createLogger({
            debug: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
            error: vi.fn(),
        });

        const actionReporter = new CSpellReporterForGithubAction(
            'none',
            { verbose: false, treatFlaggedWordsAsErrors: true },
            logger,
        );
        const reporter = actionReporter.reporter;

        reporter.info?.('This is an error message', msgType);
        expect(logger.debug).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warning).not.toHaveBeenCalled();
    });
});
