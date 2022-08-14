import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs';
import { Context } from '@actions/github/lib/context';
import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { action } from './action';
import { AppError } from './error';
import { fixturesLocation, root } from './test/helper';
import * as helper from './test/helper';

const configFile = path.resolve(root, 'cspell.json');

const timeout = 20000;

const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const spyError = jest.spyOn(console, 'error').mockImplementation(() => {});

const spyStdout = jest.spyOn(process.stdout, 'write').mockImplementation(function () {
    return true;
});

describe('Validate Action', () => {
    beforeEach(() => {
        cleanEnv();
        spyWarn.mockClear();
        spyError.mockClear();
        spyLog.mockClear();
        spyStdout.mockClear();
        process.env.INPUT_GITHUB_TOKEN = process.env['GITHUB_TOKEN'];
    });

    test.each`
        test                            | file                                            | expected
        ${'bad root'}                   | ${'bad_params/bad_root.json'}                   | ${new AppError('Bad Configuration.')}
        ${'missing config'}             | ${'bad_params/missing_config.json'}             | ${new AppError('Bad Configuration.')}
        ${'bad inline'}                 | ${'bad_params/bad_inline.json'}                 | ${new AppError('Bad Configuration.')}
        ${'bad_incremental_files_only'} | ${'bad_params/bad_incremental_files_only.json'} | ${new AppError('Bad Configuration.')}
        ${'bad_unsupported_event'}      | ${'bad_params/bad_unsupported_event.json'}      | ${new AppError("Unsupported event: 'fork'")}
        ${'bad strict'}                 | ${'bad_params/bad_strict.json'}                 | ${new AppError('Bad Configuration.')}
    `(
        '$test',
        async ({ file, expected }) => {
            const context = createContextFromFile(file);
            const octokit = createOctokit();
            expect.assertions(1);
            await expect(action(context, octokit)).rejects.toEqual(expected);
        },
        timeout
    );

    test.each`
        testName                                   | file                              | expected
        ${'event push main.js'}                    | ${'push.json'}                    | ${true}
        ${'event pull_request main.js'}            | ${'pull_request.json'}            | ${true}
        ${'event pull_request_with_files main.js'} | ${'pull_request_with_files.json'} | ${true}
    `(
        '$testName',
        async ({ testName, file, expected }) => {
            return helper.pollyRun(
                __filename,
                testName,
                async () => {
                    const context = createContextFromFile(file);
                    const octokit = createOctokit();
                    expect.assertions(1);
                    await expect(action(context, octokit)).resolves.toBe(expected);
                },
                { recordIfMissing: true }
            );
        },
        timeout
    );
    test.each`
        files        | expected
        ${'**'}      | ${false}
        ${'**/*.md'} | ${true}
    `(
        'check all $files',
        async ({ files, expected }) => {
            const warnings: string[] = [];
            spyWarn.mockImplementation((msg: string) => warnings.push(msg));
            const context = createContextFromFile('pull_request.json', {
                INPUT_FILES: files,
                INPUT_INCREMENTAL_FILES_ONLY: 'false',
            });
            const octokit = createOctokit();
            expect.assertions(3);
            await expect(action(context, octokit)).resolves.toBe(expected);
            expect(warnings).toMatchSnapshot();
            expect(spyStdout).toHaveBeenCalled();
        },
        timeout
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

function fetchGithubActionFixture(filename: string): Record<string, string> {
    const githubEnv = JSON.parse(fs.readFileSync(path.resolve(fixturesLocation, filename), 'utf-8'));
    if (githubEnv['GITHUB_EVENT_PATH']) {
        githubEnv['GITHUB_EVENT_PATH'] = path.resolve(root, githubEnv['GITHUB_EVENT_PATH']);
    }
    return githubEnv;
}

function getGithubToken(): string {
    const t0 = core.getInput('github_token', { required: true });
    if (t0[0] !== '$') {
        return t0;
    }
    return process.env[t0.slice(1)] || 'undefined';
}

function createContextFromFile(filename: string, ...params: Record<string, string>[]): Context {
    return createContext(fetchGithubActionFixture(filename), ...params);
}

function createContext(...params: Record<string, string>[]): Context {
    Object.assign(process.env, ...params);
    setEnvIfNotExist('INPUT_ROOT', root);
    setEnvIfNotExist('INPUT_CONFIG', configFile);
    process.env.INPUT_CONFIG = path.resolve(root, process.env.INPUT_CONFIG || configFile);

    return new Context();
}

function setEnvIfNotExist(key: string, value: string) {
    if (process.env[key] === undefined) {
        process.env[key] = value;
    }
}

function createOctokit(): Octokit {
    return new Octokit({
        auth: getGithubToken(),
        userAgent: 'cspell-action-test',
    });
}
