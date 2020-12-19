import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const root = path.resolve(path.join(__dirname, '..', '..'));
const fixturesLocation = path.join(root, 'fixtures');
const mainFile = path.join(root, 'action', 'main.js');

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
            const env = fetchGithubActionFixture(file);
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

function fetchGithubActionFixture(filename: string): Record<string, string> {
    const githubEnv = JSON.parse(fs.readFileSync(path.resolve(fixturesLocation, filename), 'utf-8'));
    if (githubEnv['GITHUB_EVENT_PATH']) {
        githubEnv['GITHUB_EVENT_PATH'] = path.resolve(root, githubEnv['GITHUB_EVENT_PATH']);
    }
    const env = {
        ...process.env,
        ...githubEnv,
    };

    return env;
}
