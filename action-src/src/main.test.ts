import * as process from 'process';
import * as helper from './test/helper';
import { run } from './main';
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

    test('GITHUB_TOKEN', () => {
        expect(process.env['GITHUB_TOKEN']).not.toBeUndefined();
    });

    test.each`
        test                                       | file
        ${'event pull_request main.js'}            | ${'pull_request.json'}
        ${'event pull_request_with_files main.js'} | ${'pull_request_with_files.json'}
        ${'event push main.js'}                    | ${'push.json'}
    `(
        '$test',
        async ({ test: testName, file }) => {
            await helper.pollyRun(__filename, testName, async () => {
                const env = helper.fetchGithubActionFixture(file);
                env.FIXTURE_FILE_NAME = file;
                Object.assign(process.env, env);

                await expect(run()).resolves.toBeUndefined();
            });
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
        ${'event push main.js'}                    | ${'push.json'}
    `(
        '$test',
        async ({ test: testName, file }) => {
            await helper.pollyRun(__filename, testName, async () => {
                const env = helper.fetchGithubActionFixture(file);
                env.FIXTURE_FILE_NAME = file;
                Object.assign(process.env, env);

                process.env['INPUT_GITHUB_TOKEN'] = undefined;
                process.env['GITHUB_TOKEN'] = undefined;

                await expect(run()).resolves.toEqual(expect.any(Error));
            });
        },
        timeout,
    );
});
