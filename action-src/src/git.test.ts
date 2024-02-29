import { promises as fs } from 'node:fs';
import { describe, expect, test } from 'vitest';
import {
    Context,
    GitError,
    gitDeepen,
    gitListCommits,
    gitListFiles,
    gitListFilesForContext,
    gitListFilesForPullRequest,
    gitListFilesForPush,
} from './git.js';

const urlFixtures = new URL('../fixtures/', import.meta.url);

const ac = expect.arrayContaining;

describe('git', () => {
    test.each`
        sha1                                          | sha2                                          | expected
        ${'92d115716b53a74cbed4757232610c2b56531741'} | ${'3fcea606a7709e6aabcdf67801c8b174a32c743c'} | ${['.github/workflows/smoke.yml']}
        ${'0000000000000000000000000000000000000000'} | ${'5c5ba0cca65718402a67fbdcfec7097d289620d2'} | ${ac(['action-src/build.mjs'])}
    `('gitListFiles $sha1 $sha2', async ({ sha1, sha2, expected }) => {
        const files = await gitListFiles(sha1, sha2);
        expect(files).toEqual(expected);
    });

    test.each`
        contextFile                        | expected
        ${'./pull_request_2_context.json'} | ${ac(['package.json'])}
        ${'./pr_1594_context.json'}        | ${ac(['action-src/build.mjs', 'package.json'])}
    `('gitListFilesForContext', async ({ contextFile, expected }) => {
        const context = await readFixtureFileJSON<Context>(contextFile);
        const files = await gitListFilesForContext(context);
        expect(files).toEqual(expected);
    });

    test('bad Requests', async () => {
        await expect(gitListFilesForPullRequest({} as any)).rejects.toThrowError(GitError);
        await expect(gitListFilesForPush(undefined as any)).rejects.toThrowError(GitError);
    });

    test('gitListCommits', async () => {
        const commits = await gitListCommits();
        console.log('%o', commits);
        expect(commits.length).toBeGreaterThanOrEqual(1);
        const hexCommits = commits.filter(isHex);
        expect(hexCommits).toEqual(commits);
    });

    test('gitDeepen', async () => {
        await expect(gitDeepen(0)).resolves.toBeUndefined();
    });
});

function readFixtureFile(file: string | URL): Promise<string> {
    return fs.readFile(new URL(file, urlFixtures), 'utf-8');
}

async function readFixtureFileJSON<T = unknown>(file: string | URL): Promise<T> {
    return JSON.parse(await readFixtureFile(file));
}

function isHex(v: string): boolean {
    return /^[a-fA-F0-9]+$/.test(v);
}
