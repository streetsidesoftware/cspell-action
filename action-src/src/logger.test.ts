import { summary as coreSummary } from '@actions/core';
import { describe, expect, test, vi } from 'vitest';

import { createLogger } from './logger.js';
import { write } from 'fs';

vi.mock('@actions/core', async (_importActual) => {
    return {
        debug: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
        issueCommand: vi.fn(),
        summary: {
            addRaw: vi.fn(),
            write: vi.fn(),
        },
    };
});

describe('Validate Logger', () => {
    test('createLogger', () => {
        const logger = createLogger({ debug: vi.fn() });
        expect(logger.debug).toBeDefined();
        expect(logger.info).toBeDefined();
        expect(logger.warning).toBeDefined();
        expect(logger.error).toBeDefined();
        expect(logger.issueCommand).toBeDefined();
        expect(logger.summary).toBeDefined();

        logger.debug('test debug');
        expect(logger.debug).toHaveBeenCalledWith('test debug');
    });

    test('summary', () => {
        const logger = createLogger();
        logger.summary('test summary');
        expect(coreSummary.addRaw).toHaveBeenCalledWith('test summary');
        expect(coreSummary.write).toHaveBeenCalled();
    });
});
