import { Octokit } from '@octokit/rest';
import { getPullRequestFiles } from './github';

describe('validate github', () => {
    const owner = 'streetsidesoftware';
    const repo = 'cspell';

    jest.setTimeout(60000);

    test('getPullRequestFiles', async () => {
        const octokit = new Octokit();
        const pull_number = 715;

        const list = await getPullRequestFiles(octokit, { owner, repo, pull_number });
        expect(list).toHaveLength(59);
    });
});
