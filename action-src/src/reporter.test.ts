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
});
