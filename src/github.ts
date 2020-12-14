import { Octokit } from '@octokit/rest';

export interface GitContext {
    owner: string;
    repo: string;
}

export interface PullRequestRef extends GitContext {
    pull_number: number;
}

export async function getPullRequestFiles(git: Octokit, prRef: PullRequestRef): Promise<string[]> {
    const { owner, repo, pull_number } = prRef;
    const commits = await git.pulls.listCommits({ owner, repo, pull_number });

    const prFiles: Set<string> = new Set();

    for (const commitRef of commits.data) {
        const ref = commitRef.sha;
        if (!ref) continue;
        const commit = await git.repos.getCommit({ owner, repo, ref });
        const files = commit.data.files;
        if (!files) continue;
        files.forEach((f) => f.filename && prFiles.add(f.filename));
    }

    return [...prFiles];
}


export async function* fetchFilesForCommits(git: Octokit, context: GitContext, commitIds: string[]) {
    const { owner, repo } = context;
    for await (const ref of commitIds) {
        const commit = await git.repos.getCommit({ owner, repo, ref });
        const files = commit.data.files;
        if (!files) continue;
        for (const f of files) {
            if (f.filename) {
                yield f.filename;
            }
        }
    }
}