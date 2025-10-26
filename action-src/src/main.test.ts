import * as process from 'process';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { AppError } from './error.js';
import { run } from './main.js';
import * as helper from './test/helper.js';

const timeout = 20000;

vi.spyOn(process.stdout, 'write').mockImplementation(function () {
    return true;
});

const spyConsoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

describe('Validate Main', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test.each`
        test                                       | file                              | expected
        ${'event PR 1594'}                         | ${'pr_1594_env.json'}             | ${undefined}
        ${'event pull_request main.js'}            | ${'pull_request.json'}            | ${undefined}
        ${'event pull_request_with_files main.js'} | ${'pull_request_with_files.json'} | ${undefined}
        ${'event push main.js'}                    | ${'push.json'}                    | ${undefined}
        ${'error'}                                 | ${'bad_params/bad_strict.json'}   | ${new AppError('Bad Configuration.')}
    `(
        'action test $test $file',
        async ({ file, expected }) => {
            const env = helper.fetchGithubActionFixture(file);
            env.FIXTURE_FILE_NAME = file;
            Object.assign(process.env, env);

            await expect(run()).resolves.toEqual(expected);
            expect(spyConsoleError).toHaveBeenCalledTimes(expected ? 1 : 0);
        },
        timeout,
    );
});
