import { Octokit } from '@octokit/rest';
import { getPullRequestFiles } from './github';
import { describe, expect, test } from 'vitest';

describe('validate github', () => {
    const owner = 'streetsidesoftware';
    const repo = 'cspell';
    const timeout = 60000;

    test(
        'getPullRequestFiles',
        async () => {
            expect(process.env['GITHUB_TOKEN']).not.toBeUndefined();
            const options = {
                auth: process.env['GITHUB_TOKEN'],
            };
            const octokit = new Octokit(options);
            const pull_number = 715;

            const list = await getPullRequestFiles(octokit, { owner, repo, pull_number });
            expect(list.size).toBe(59);
        },
        timeout,
    );
});
