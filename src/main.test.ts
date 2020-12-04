import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
    expect(process.env['GITHUB_TOKEN']).not.toBeUndefined();
    process.env['INPUT_GITHUB_TOKEN'] = process.env['GITHUB_TOKEN'];
    process.env['INPUT_MILLISECONDS'] = '500';
    const ip = path.join(__dirname, '..', 'action', 'main.js');
    const options: cp.ExecSyncOptions = {
        env: process.env,
    };
    const result = cp.execSync(`node ${ip}`, options).toString();
    expect(result).toEqual(expect.stringContaining('Waiting 500 milliseconds'));
    expect(result).toEqual(expect.stringContaining('::set-output name=time::'));
    expect(result).toEqual(expect.stringContaining('Done.'));
});
