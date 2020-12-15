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

    test('pull request', () => {
        const env = fetchGithubActionFixture('pull_request.json');
        const options: cp.ExecSyncOptions = {
            env,
            cwd: root,
        };
        const result = cp.execSync(`node ${mainFile}`, options).toString();
        expect(result).toEqual(expect.stringContaining('Done.'));
    });

});


function fetchGithubActionFixture(filename: string): Record<string, string> {
    const githubEnv = JSON.parse(fs.readFileSync(path.resolve(fixturesLocation, filename), 'utf-8'));
    const env = {
        ...process.env,
        ...githubEnv,
    }

    return env;
}
