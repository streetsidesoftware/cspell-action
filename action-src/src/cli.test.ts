import { afterEach, describe, expect, test, vi } from 'vitest';

import { run } from './cli.js';

const timeout = 20000;

describe('CLI', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test(
        'action cli',
        async () => {
            vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
            vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
            const spyConsoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            await expect(run()).resolves.toEqual(undefined);
            expect(spyConsoleError).toHaveBeenCalledTimes(0);
        },
        timeout,
    );
});
