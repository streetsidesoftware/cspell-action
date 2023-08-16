import * as process from 'process';
import * as helper from './test/helper';
import { run } from './main';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const timeout = 20000;

const spyStdout = vi.spyOn(process.stdout, 'write').mockImplementation(function () {
    return true;
});

describe('Validate Main', () => {
    beforeEach(() => {
        spyStdout.mockClear();
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

// function cleanResult(output: string): string {
//     // Remove time
//     output = output.replace(/\(\d+\.\d\dms\)$/gm, '(???.??ms)');

//     const rootRegExp = new RegExp(escapeRegEx(root), 'g');
//     output = output.replace(rootRegExp, '.');

//     return output;
// }

// function escapeRegEx(s: string) {
//     return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
// }
