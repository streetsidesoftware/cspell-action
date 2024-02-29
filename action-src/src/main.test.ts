import * as process from 'process';
import * as helper from './test/helper.js';
import { run } from './main.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const timeout = 20000;

const spyStdout = vi.spyOn(process.stdout, 'write').mockImplementation(function () {
    return true;
});

describe('Validate Main', () => {
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
