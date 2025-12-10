import type { RunResult } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { CSpellReporterForGithubAction, type ReporterOptions } from './reporter.js';
import { mockLogger } from './test/helper.js';

describe('Validate Reporter', () => {
    const options: ReporterOptions = { verbose: false, treatFlaggedWordsAsErrors: false, summary: false };

    test('Reporting Errors', () => {
        const logger = mockLogger();

        const actionReporter = new CSpellReporterForGithubAction('none', options, logger);
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
        const logger = mockLogger();

        const actionReporter = new CSpellReporterForGithubAction('none', options, logger);
        const reporter = actionReporter.reporter;

        reporter.info?.('This is an error message', msgType);
        expect(logger.debug).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warning).not.toHaveBeenCalled();
    });

    test('Debug is ignored', () => {
        // Currently all "debug" messages are ignored.
        const logger = mockLogger();

        const actionReporter = new CSpellReporterForGithubAction('none', options, logger);
        const reporter = actionReporter.reporter;

        reporter.debug?.('This is an error message');
        expect(logger.debug).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warning).not.toHaveBeenCalled();
    });

    test('Summary', () => {
        const logger = mockLogger();

        const actionReporter = new CSpellReporterForGithubAction('none', { ...options, summary: true }, logger);

        const result: RunResult = {
            /** Number of files processed. */
            files: 22,
            /** Set of files where issues were found. */
            filesWithIssues: new Set<string>(),
            /** Number of issues found. */
            issues: 5,
            /** Number of processing errors. */
            errors: 1,
            /** Number of files that used results from the cache. */
            cachedFiles: 1,
            /** Number of files that were skipped (not processed). */
            skippedFiles: 2,
        };
        result.filesWithIssues.add('file1.ts');

        actionReporter.reporter.result?.(result);

        expect(logger.summary).toHaveBeenCalledWith(
            expect.stringContaining(
                '## CSpell Summary\n\n- **Files checked:** 20\n- **Issues found:** 5\n- **Files with issues:** 1\n',
            ),
        );
    });
});
