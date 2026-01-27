import { afterEach, describe, expect, test, vi } from 'vitest';

import { issueCommand } from './command.js';
import { debug, error, getInput, info, setFailed, setOutput, warning } from './core.js';
import { CommandProperties } from './coreTypes.js';
import { issueFileCommand } from './file-command.js';

vi.mock(import('./file-command.js'), async (importActual) => {
    const actual = await importActual();
    return {
        ...actual,
        issueFileCommand: vi.fn(),
    };
});

vi.mock('./command.js', async (_importActual) => {
    return {
        formatCommand: vi.fn(),
        issueCommand: vi.fn(),
    };
});

const env_GITHUB_OUTPUT = process.env['GITHUB_OUTPUT'];

describe('core', () => {
    afterEach(() => {
        vi.resetAllMocks();
        process.env['GITHUB_OUTPUT'] = env_GITHUB_OUTPUT;
    });

    const empty: CommandProperties = {
        col: undefined,
        endColumn: undefined,
        endLine: undefined,
        file: undefined,
        line: undefined,
        title: undefined,
    };

    test('getInput no value', () => {
        const r = getInput('test input');
        expect(r).toBe('');
    });

    test('getInput required', () => {
        expect(() => getInput('test input', { required: true })).toThrow('Input required and not supplied: test input');
    });

    test('getInput', () => {
        process.env['INPUT_MY_TEST_INPUT'] = ' some value\n';
        const r = getInput('my test input');
        expect(r).toBe('some value');
    });

    test('getInput no trim', () => {
        process.env['INPUT_MY_TEST_INPUT'] = ' some value\n';
        const r = getInput('my test input', { trimWhitespace: false });
        expect(r).toBe(' some value\n');
    });

    test('setOutput no env', () => {
        const mock = vi.mocked(issueCommand);
        process.env['GITHUB_OUTPUT'] = '';
        setOutput('my_output', 'some value');
        expect(mock).toHaveBeenCalledWith('set-output', { name: 'my_output' }, 'some value');
    });

    test('setOutput with env', () => {
        const mock = vi.mocked(issueFileCommand);
        process.env['GITHUB_OUTPUT'] = './some/path/to/output/file.txt';
        setOutput('my_output', 'some value');
        expect(mock).toHaveBeenCalledWith(
            'OUTPUT',
            expect.stringMatching(/^my_output<<[\w-]+[\r\n]+some value[\r\n]+[\w-]+$/),
        );
    });

    test('setFailed', () => {
        const mock = vi.mocked(issueCommand);
        setFailed('failure message');
        expect(process.exitCode).toBe(1);
        process.exitCode = 0; // reset for other tests
        expect(mock).toHaveBeenCalledWith('error', {}, 'failure message');
    });

    test('setFailed with Error', () => {
        const mock = vi.mocked(issueCommand);
        setFailed(new Error('failure message'));
        expect(process.exitCode).toBe(1);
        process.exitCode = 0; // reset for other tests
        expect(mock).toHaveBeenCalledWith('error', {}, 'Error: failure message');
    });

    test('debug', () => {
        const mock = vi.mocked(issueCommand);
        debug('failure message');
        expect(mock).toHaveBeenCalledWith('debug', {}, 'failure message');
    });

    test('error', () => {
        const mock = vi.mocked(issueCommand);
        error('failure message', { title: 'My Error' });
        expect(mock).toHaveBeenCalledWith('error', { ...empty, title: 'My Error' }, 'failure message');
    });

    test('warning', () => {
        const mock = vi.mocked(issueCommand);
        warning('warning message', { title: 'Watch Out!' });
        expect(mock).toHaveBeenCalledWith('warning', { ...empty, title: 'Watch Out!' }, 'warning message');
    });

    test('warning with Error', () => {
        const mock = vi.mocked(issueCommand);
        warning(new Error('warning message'), { title: 'Watch Out!' });
        expect(mock).toHaveBeenCalledWith('warning', { ...empty, title: 'Watch Out!' }, 'Error: warning message');
    });

    test('info', () => {
        const mock = vi.mocked(issueCommand);
        const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        info('info message');
        expect(mock).toHaveBeenCalledTimes(0);
        expect(stdout).toHaveBeenCalledWith('info message\n');
    });
});
