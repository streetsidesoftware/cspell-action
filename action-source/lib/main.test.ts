import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const root = path.resolve(path.join(__dirname, '..', '..'));
const fixturesLocation = path.join(root, 'fixtures');
const mainFile = path.join(root, 'action', 'main.js');

describe('Validate Main', () => {
    test('GITHUB_TOKEN', () => {
        expect(process.env['GITHUB_TOKEN']).not.toBeUndefined();
    });

    test('event pull_request main.js', () => {
        const env = fetchGithubActionFixture('pull_request.json');
        const options: cp.ExecSyncOptions = {
            env,
            cwd: root,
        };
        const result = cp.execSync(`node ${mainFile}`, options).toString();

        expect(cleanResult(result)).toMatchSnapshot();
    });

    test('event push main.js', () => {
        const env = fetchGithubActionFixture('push.json');
        const options: cp.ExecSyncOptions = {
            env,
            cwd: root,
        };
        const result = cp.execSync(`node ${mainFile}`, options).toString();
        expect(cleanResult(result)).toMatchSnapshot();
    });
});

function cleanResult(output: string): string {
    // Remove time
    return output.replace(/\(\d+\.\d\dms\)$/gm, '(???.??ms)');
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
