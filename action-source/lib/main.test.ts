import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import * as helper from './test/helper';

const root = helper.root;
const mainFile = path.join(helper.debugDir, 'test_main.js');

const timeout = 20000;

describe('Validate Main', () => {
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
        ({ file }) => {
            const env = helper.fetchGithubActionFixture(file);
            env.FIXTURE_FILE_NAME = file;
            const options: cp.ExecSyncOptions = {
                env,
                cwd: root,
            };
            const result = cp.execSync(`node ${mainFile}`, options).toString();

            expect(cleanResult(result)).toMatchSnapshot();
        },
        timeout
    );
});

function cleanResult(output: string): string {
    // Remove time
    output = output.replace(/\(\d+\.\d\dms\)$/gm, '(???.??ms)');

    const rootRegExp = new RegExp(escapeRegEx(root), 'g');
    output = output.replace(rootRegExp, '.');

    return output;
}

function escapeRegEx(s: string) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
