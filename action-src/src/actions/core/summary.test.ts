import { access, appendFile, writeFile } from 'node:fs/promises';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { summary, SUMMARY_ENV_VAR } from './summary.js';

vi.mock('node:fs');
vi.mock('node:fs/promises');

describe('summary', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    const summaryContent = '# Summary Header\nThis is some summary content.\n';

    test('addRaw and write no env file', async () => {
        process.env[SUMMARY_ENV_VAR] = '';
        vi.mocked(access).mockImplementation(async () => {
            throw new Error('File not found');
        });

        summary.addRaw(summaryContent);
        await expect(summary.write()).rejects.toThrow(
            'Unable to find environment variable for $GITHUB_STEP_SUMMARY. Check if your runtime environment supports job summaries.',
        );
        summary.emptyBuffer();
    });

    test('addRaw and write no access', async () => {
        process.env[SUMMARY_ENV_VAR] = './tmp/step_summary.md';
        vi.mocked(access).mockImplementation(async () => {
            throw new Error('File not found');
        });

        summary.addRaw(summaryContent);
        await expect(summary.write()).rejects.toThrow(
            "Unable to access summary file: './tmp/step_summary.md'. Check if the file has correct read/write permissions.",
        );
        summary.emptyBuffer();
    });

    test('addRaw and write', async () => {
        vi.mocked(access).mockImplementation(async () => {});
        const appendFileMock = vi.mocked(appendFile).mockImplementation(async () => {});
        const writeFileMock = vi.mocked(writeFile).mockImplementation(async () => {});
        process.env[SUMMARY_ENV_VAR] = './tmp/step_summary.md';

        summary.addRaw(summaryContent);
        await summary.write();

        expect(writeFileMock).not.toHaveBeenCalled();
        expect(appendFileMock).toHaveBeenCalledWith('./tmp/step_summary.md', summaryContent, { encoding: 'utf8' });

        summary.addRaw('Additional content.\n');
        await summary.write();

        expect(writeFileMock).not.toHaveBeenCalled();
        expect(appendFileMock).toHaveBeenCalledWith('./tmp/step_summary.md', 'Additional content.\n', {
            encoding: 'utf8',
        });

        summary.addRaw('Additional content 2.\n');
        await summary.write({ overwrite: true });

        expect(writeFileMock).toHaveBeenCalledWith('./tmp/step_summary.md', 'Additional content 2.\n', {
            encoding: 'utf8',
        });
    });
});
