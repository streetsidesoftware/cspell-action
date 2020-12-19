import * as core from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';
import * as gitHubApi from '@actions/github';
import { getOctokit } from '@actions/github';
import { fetchFilesForCommits, getPullRequestFiles } from './github';
import { Octokit } from '@octokit/rest';
import {} from '@octokit/rest';
import {} from '@octokit/core';
import { lint } from './spell';
import * as path from 'path';
import { GitHub } from '@actions/github/lib/utils';
import { AppError } from './error';
import * as glob from 'cspell-glob';

type GitHub = ReturnType<typeof getOctokit>;

type GitHubContext = typeof gitHubApi.context;
interface Context {
    githubContext: GitHubContext;
    github: GitHub;
    files: string;
}

type EventNames = 'push' | 'pull_request';
const supportedEvents = new Set<EventNames | string>(['push', 'pull_request']);

async function gatherPullRequestFiles(context: Context): Promise<Set<string>> {
    const { github, githubContext } = context;
    const pull_number = githubContext.payload.pull_request?.number;
    if (!pull_number) return new Set();
    return getPullRequestFiles(github as Octokit, { ...githubContext.repo, pull_number });
}

interface Commit {
    id: string;
}

interface PushPayload {
    commits?: Commit[];
}

async function gatherPushFiles(context: Context): Promise<Set<string>> {
    const { github, githubContext } = context;
    const push = githubContext.payload as PushPayload;
    const commits = push.commits?.map((c) => c.id);
    const files = commits && (await fetchFilesForCommits(github as Octokit, githubContext.repo, commits));
    return files || new Set();
}

async function checkSpelling(files: string[]) {
    if (!files.length) {
        return;
    }
    const result = await lint(files, { root: process.cwd() }, core);
    result.issues.forEach((item) => {
        // format: ::warning file={name},line={line},col={col}::{message}
        issueCommand(
            'warning',
            {
                file: path.relative(process.cwd(), item.uri || ''),
                line: item.row,
                col: item.col,
            },
            `Unknown word (${item.text})`
        );
    });
}

function getGithubToken(): string {
    const t0 = core.getInput('github_token', { required: true });
    if (t0[0] !== '$') {
        return t0;
    }
    return process.env[t0.slice(1)] || 'undefined';
}

function friendlyEventName(eventName: EventNames | string): string {
    switch (eventName) {
        case 'push':
            return 'Push';
        case 'pull_request':
            return 'Pull Request';
        default:
            return `Unknown event: '${eventName}'`;
    }
}

function isSupportedEvent(eventName: EventNames | string): eventName is EventNames {
    return supportedEvents.has(eventName);
}

/**
 * Gather the set of files to be spell checked.
 * @param context Context
 */
async function gatherFiles(context: Context): Promise<Set<string>> {
    const eventName = context.githubContext.eventName;

    switch (eventName) {
        case 'push':
            return gatherPushFiles(context);
        case 'pull_request':
            return gatherPullRequestFiles(context);
    }
    return new Set();
}

function filterFiles(globPattern: string, files: Set<string>): Set<string> {
    if (!globPattern) return files;

    const matchingFiles = new Set<string>();

    const g = new glob.GlobMatcher(globPattern);
    for (const p of files) {
        if (g.match(p)) {
            matchingFiles.add(p);
        }
    }

    return matchingFiles;
}

async function action() {
    const githubContext = gitHubApi.context;
    const eventName = githubContext.eventName;
    if (!isSupportedEvent(eventName)) {
        const msg = `Unsupported event: '${eventName}'`;
        throw new AppError(msg);
    }
    const context: Context = {
        githubContext,
        github: getOctokit(getGithubToken()),
        files: core.getInput('files'),
    };

    core.info(friendlyEventName(eventName));
    const eventFiles = await gatherFiles(context);
    const files = filterFiles(context.files, eventFiles);
    await checkSpelling([...files]);
}

export async function run(): Promise<void> {
    try {
        core.info('cspell-action');
        await action();
        core.info('Done.');
    } catch (error) {
        console.error(error);
        core.setFailed(error instanceof AppError ? error.message : error);
    }
}
