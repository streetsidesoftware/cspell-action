import * as process from 'process';
import * as helper from './test/helper.js';
import { run } from './main.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const timeout = 20000;

console.log('%o', { ...helper });

const spyStdout = vi.spyOn(process.stdout, 'write').mockImplementation(function () {
    return true;
});

describe.only('Validate Main', () => {
    beforeEach(() => {
        spyStdout.mockClear();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    test.each`
        test                                       | file
        ${'event PR 1594'}                         | ${'pr_1594_env.json'}
        ${'event pull_request main.js'}            | ${'pull_request.json'}
        ${'event pull_request_with_files main.js'} | ${'pull_request_with_files.json'}
        ${'event push main.js'}                    | ${'push.json'}
    `(
        'action test $test $file',
        async ({ file }) => {
            const env = helper.fetchGithubActionFixture(file);
            console.log('%o', { env });
            env.FIXTURE_FILE_NAME = file;
            Object.assign(process.env, env);

            await expect(run()).resolves.toBeUndefined();
        },
        timeout,
    );
});

describe('Validate Main No Token', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    test.each`
        test                                       | file
        ${'event pull_request main.js'}            | ${'pull_request.json'}
        ${'event pull_request_with_files main.js'} | ${'pull_request_with_files.json'}
    `(
        '$test',
        async ({ file }) => {
            const env = helper.fetchGithubActionFixture(file);
            env.FIXTURE_FILE_NAME = file;
            Object.assign(process.env, env);

            process.env['INPUT_GITHUB_TOKEN'] = undefined;
            process.env['GITHUB_TOKEN'] = undefined;

            await expect(run()).resolves.toEqual(expect.any(Error));
        },
        timeout,
    );
});
