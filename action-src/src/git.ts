import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import type { PullRequestEvent, PushEvent } from '@octokit/webhooks-types';

const execP = promisify(exec);

export async function gitListCommits(count = 100, _since?: Date): Promise<string[]> {
    const args = ['rev-list', 'HEAD', `-${count}`];
    const cmdResult = await runGit(args);
    return cmdResult
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => !!a);
}

export async function gitDeepen(count: number): Promise<void> {
    const args = ['fetch', `--deepen=${count}`];
    await runGit(args);
}

export async function gitListFiles(sha1: string, sha2?: string): Promise<string[]> {
    const SHAs = [sha1, sha2].map(cleanSha).filter((a) => !!a);
    if (!SHAs.length) return [];

    const args = ['diff-tree', '--no-commit-id', '--name-only', '-r', ...SHAs];
    const cmdResult = await runGit(args);
    return cmdResult
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => !!a);
}

export async function gitRoot(): Promise<string> {
    return (await runGit(['rev-parse', '--show-toplevel'])).trim();
}

function cleanSha(sha: string | undefined): string {
    if (!sha) return '';
    if (['HEAD'].includes(sha)) return sha;
    const s = sha.trim().replace(/[^a-fA-F0-9]/g, '');
    return s.replace(/^0+$/, '');
}

export async function gitListFilesForPullRequest(pr: PullRequestEvent): Promise<string[]> {
    const event = pr as { before?: undefined; after?: undefined };
    const sha1 = pr?.pull_request?.base?.sha || event?.before;
    const sha2 = event?.after || pr?.pull_request?.head?.sha;
    if (!sha1 || !sha2 || !pr.pull_request) {
        throw new GitError(`Invalid PR event base.sha: ${sha1}, head.sha: ${sha2}`);
    }
    const commitCount = pr.pull_request.commits || 0;
    try {
        await deepenIfNecessary(commitCount + 1);
        return gitListFiles(sha1, sha2);
    } catch (e) {
        throw new GitError(`Error getting files for PR ${pr?.number} from git`, e);
    }
}

export async function gitListFilesForPush(push: PushEvent): Promise<string[]> {
    try {
        const commitCount = push.commits?.length || 0;
        await deepenIfNecessary(commitCount + 1);
        return gitListFiles(push.before, push.after);
    } catch (e) {
        throw new GitError(`Error getting files for Push, (Commit: ${push?.after}) from git`, e);
    }
}

async function deepenIfNecessary(commitCount: number) {
    const commits = await gitListCommits(commitCount);
    if (commits.length < commitCount) {
        await gitDeepen(commitCount);
    }
}

export async function gitListFilesForContext(context: Context): Promise<string[]> {
    if (context.event_name === 'pull_request') {
        return gitListFilesForPullRequest(context.event);
    }
    return gitListFilesForPush(context.event);
}

export interface ContextPushEvent {
    event_name: 'push';
    event: PushEvent;
}

export interface ContextPullRequestEvent {
    event_name: 'pull_request';
    event: PullRequestEvent;
}

export type Context = ContextPushEvent | ContextPullRequestEvent;

export class GitError extends Error {
    constructor(
        message: string,
        readonly cause?: unknown,
    ) {
        super(message);
        this.name = 'GitError';
    }
}

async function runGit(args: string[]): Promise<string> {
    const { stdout } = await execP(`git ${args.join(' ')}`);
    return stdout;
}
