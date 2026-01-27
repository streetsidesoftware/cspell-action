import fs from 'node:fs';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { issueFileCommand, prepareKeyValueMessage } from './file-command.js';

// cspell:ignore ghadelimiter

vi.mock(import('node:fs'), async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
        ...originalModule,
    };
});

describe('file-command', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    test('issueFileCommand', () => {
        const appendFileSyncMock = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
        const existsSyncMock = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

        process.env['GITHUB_TEST_COMMAND'] = './tmp/test_command_file.txt';
        expect(() => issueFileCommand('TEST_COMMAND', 'test message')).not.toThrow();
        expect(existsSyncMock).toHaveBeenCalledWith('./tmp/test_command_file.txt');
        expect(appendFileSyncMock).toHaveBeenCalledWith('./tmp/test_command_file.txt', `test message\n`, {
            encoding: 'utf8',
        });
    });

    test('issueFileCommand errors', () => {
        expect(issueFileCommand).toEqual(expect.any(Function));

        expect(() => issueFileCommand('NON_EXISTENT_COMMAND', 'test message')).toThrow(
            'Unable to find environment variable for file command NON_EXISTENT_COMMAND',
        );

        process.env['GITHUB_TEST_COMMAND'] = './tmp/test_command_file.txt';
        expect(() => issueFileCommand('TEST_COMMAND', 'test message')).toThrow(
            'Missing file at path: ./tmp/test_command_file.txt',
        );
    });

    test('prepareKeyValueMessage string', () => {
        expect(prepareKeyValueMessage('my_value', 'some data')).toMatch(
            /^my_value<<ghadelimiter_[\w-]+[\r\n]+some data[\r\n]+ghadelimiter_[\w-]+$/,
        );
    });

    test.each`
        key           | value                        | expected
        ${'my_value'} | ${true}                      | ${'true'}
        ${'my_value'} | ${42}                        | ${'42'}
        ${'my_value'} | ${{ one: 1, two: 2, x: {} }} | ${'{"one":1,"two":2,"x":{}}'}
    `('prepareKeyValueMessage $value', ({ key, value, expected }) => {
        const regexp = new RegExp(
            '^' + key + '<<ghadelimiter_[\\w-]+[\\r\\n]+' + expected + '[\\r\\n]+ghadelimiter_[\\w-]+$',
        );
        expect(prepareKeyValueMessage(key, value)).toMatch(regexp);
    });
});
