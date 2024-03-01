import * as process from 'process';
import * as path from 'path';
import { Context } from '@actions/github/lib/context.js';
import { action } from './action.js';
import { AppError } from './error.js';
import { fetchGithubActionFixture, root } from './test/helper.js';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const configFile = path.resolve(root, 'cspell.json');

const debug = false;

const log: typeof console.log = debug ? console.log : () => undefined;

const spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const spyLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const spyError = vi.spyOn(console, 'error').mockImplementation(() => {});

const spyStdout = vi.spyOn(process.stdout, 'write').mockImplementation(function () {
    return true;
});

describe('Validate Action', () => {
    beforeEach(() => {
        cleanEnv();
        spyWarn.mockClear();
        spyError.mockClear();
        spyLog.mockClear();
        spyStdout.mockClear();
    });

    test.each`
        test                            | file                                            | expected
        ${'bad root'}                   | ${'bad_params/bad_root.json'}                   | ${new AppError('Bad Configuration.')}
        ${'missing config'}             | ${'bad_params/missing_config.json'}             | ${new AppError('Bad Configuration.')}
        ${'bad inline'}                 | ${'bad_params/bad_inline.json'}                 | ${new AppError('Bad Configuration.')}
        ${'bad_incremental_files_only'} | ${'bad_params/bad_incremental_files_only.json'} | ${new AppError('Bad Configuration.')}
        ${'bad strict'}                 | ${'bad_params/bad_strict.json'}                 | ${new AppError('Bad Configuration.')}
    `('$test', async ({ file, expected }) => {
        const context = createContextFromFile(file);
        expect.assertions(1);
        await expect(action(context)).rejects.toEqual(expected);
    });

    test.each`
        testName                                   | file                              | expected
        ${'event pr 1594'}                         | ${'pr_1594_env.json'}             | ${true}
        ${'event push main.js'}                    | ${'push.json'}                    | ${true}
        ${'event pull_request main.js'}            | ${'pull_request.json'}            | ${true}
        ${'event pull_request_with_files main.js'} | ${'pull_request_with_files.json'} | ${true}
    `('$testName', async ({ file, expected }) => {
        const context = createContextFromFile(file);
        expect.assertions(1);
        await expect(action(context)).resolves.toBe(expected);
    });

    test.only.each`
        testName           | file                  | expected
        ${'event pr 1594'} | ${'pr_1594_env.json'} | ${true}
    `('$testName', async ({ file, expected }) => {
        const context = createContextFromFile(file);
        expect.assertions(1);
        await expect(action(context)).resolves.toBe(expected);
    });

    test.each`
        files        | expected
        ${'**'}      | ${false}
        ${'**/*.md'} | ${true}
    `('check all $files', async ({ files, expected }) => {
        const warnings: string[] = [];
        spyWarn.mockImplementation((msg: string) => warnings.push(msg));
        const context = createContextFromFile('pull_request.json', {
            INPUT_FILES: files,
            INPUT_INCREMENTAL_FILES_ONLY: 'false',
        });
        await expect(action(context)).resolves.toBe(expected);
        expect(warnings).toMatchSnapshot();
        expect(spyStdout).toHaveBeenCalled();
    });

    test.each`
        files                       | incremental | dot           | contextFile                                | expected
        ${'fixtures/sampleCode/**'} | ${false}    | ${'explicit'} | ${'pull_request_with_files.json'}          | ${true}
        ${'fixtures/sampleCode/**'} | ${true}     | ${'explicit'} | ${'bad_params/bad_unsupported_event.json'} | ${true}
        ${''}                       | ${true}     | ${'explicit'} | ${'bad_params/bad_unsupported_event.json'} | ${false}
        ${'**'}                     | ${true}     | ${'explicit'} | ${'bad_params/bad_unsupported_event.json'} | ${false}
        ${''}                       | ${false}    | ${'explicit'} | ${'pull_request_with_files.json'}          | ${false}
        ${''}                       | ${false}    | ${''}         | ${'pull_request_with_files.json'}          | ${false}
        ${''}                       | ${false}    | ${'true'}     | ${'pull_request_with_files.json'}          | ${false}
    `(
        'check files "$files" incremental: $incremental $contextFile, dot: "$dot"',
        async ({ files, incremental, contextFile, dot, expected }) => {
            const warnings: string[] = [];
            spyWarn.mockImplementation((msg: string) => warnings.push(msg));
            const params = {
                INPUT_FILES: files,
                INPUT_INCREMENTAL_FILES_ONLY: incremental ? 'true' : 'false',
                INPUT_CHECK_DOT_FILES: dot,
                INPUT_ROOT: path.resolve(root, 'fixtures'),
                INPUT_CONFIG: path.resolve(root, 'fixtures/cspell.json'),
            };
            const context = createContextFromFile(contextFile, params);
            await expect(action(context)).resolves.toBe(expected);
            expect(warnings).toMatchSnapshot();
            expect(spyLog.mock.calls).toMatchSnapshot();
            expect(spyStdout.mock.calls).toMatchSnapshot();
            expect(spyStdout.mock.calls.map((call) => call.join('').trim()).filter((a) => !!a)).toMatchSnapshot();
        },
    );
});

function cleanEnv() {
    delete process.env.GITHUB_ACTION;
    delete process.env.GITHUB_ACTOR;
    delete process.env.GITHUB_EVENT_NAME;
    delete process.env.GITHUB_EVENT_PATH;
    delete process.env.GITHUB_JOB;
    delete process.env.GITHUB_REF;
    delete process.env.GITHUB_RUN_ID;
    delete process.env.GITHUB_RUN_NUMBER;
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_WORKFLOW;
    for (const key of Object.keys(process.env)) {
        if (key.startsWith('INPUT_')) {
            delete process.env[key];
        }
    }
}

function createContextFromFile(filename: string, ...params: Record<string, string>[]): Context {
    return createContext(fetchGithubActionFixture(filename), ...params);
}

function createContext(...params: Record<string, string>[]): Context {
    Object.assign(process.env, ...params);
    setEnvIfNotExist('INPUT_ROOT', root);
    setEnvIfNotExist('INPUT_CONFIG', configFile);
    process.env.INPUT_CONFIG = path.resolve(root, process.env.INPUT_CONFIG || configFile);

    const context = new Context();

    log('Create Context: %o', {
        env: process.env,
        context,
        payload: context.payload,
    });

    return context;
}

function setEnvIfNotExist(key: string, value: string) {
    if (process.env[key] === undefined) {
        process.env[key] = value;
    }
}
