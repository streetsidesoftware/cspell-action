import * as core from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';
import { Context as GitHubContext } from '@actions/github/lib/context';
import { fetchFilesForCommits, getPullRequestFiles } from './github';
import { Octokit } from '@octokit/rest';
import {} from '@octokit/rest';
import {} from '@octokit/core';
import { lint, LintOptions } from './spell';
import * as path from 'path';
import { AppError } from './error';
import * as glob from 'cspell-glob';
import { existsSync } from 'fs';

interface Context {
    githubContext: GitHubContext;
    github: Octokit;
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

async function checkSpelling(options: LintOptions, files: string[]): Promise<boolean> {
    if (!files.length) {
        return true;
    }
    const result = await lint(files, options, core);
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
    return !result.issues.length;
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

function validateRequest() {
    const validations = [validateToken(), validateConfig(), validateRoot()];
    const success = validations.reduce((a, b) => a && b, true);
    if (!success) {
        throw new AppError('Bad Configuration.');
    }
}

function validateToken() {
    const token = core.getInput('github_token', { required: true });
    return !!token;
}

function validateConfig() {
    const config = core.getInput('config');
    const success = !config || existsSync(config);
    if (!success) {
        core.error(`Configuration file "${config}" not found.`);
    }
    return success;
}

function validateRoot() {
    const root = core.getInput('root');
    const success = !root || existsSync(root);
    if (!success) {
        core.error(`Root path does not exist: "${root}"`);
    }
    return success;
}

export async function action(githubContext: GitHubContext, octokit: Octokit): Promise<boolean> {
    validateRequest();
    const eventName = githubContext.eventName;
    if (!isSupportedEvent(eventName)) {
        const msg = `Unsupported event: '${eventName}'`;
        throw new AppError(msg);
    }
    const context: Context = {
        githubContext,
        github: octokit,
        files: core.getInput('files'),
    };

    const options: LintOptions = {
        root: core.getInput('root') || process.cwd(),
        config: core.getInput('config') || undefined,
    };

    core.info(friendlyEventName(eventName));
    const eventFiles = await gatherFiles(context);
    const files = filterFiles(context.files, eventFiles);
    const noIssues = await checkSpelling(options, [...files]);
    return noIssues;
}
