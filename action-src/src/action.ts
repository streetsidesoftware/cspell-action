import * as core from '@actions/core';
import { Context as GitHubContext } from '@actions/github/lib/context';
import { Octokit } from '@octokit/core';
import { RunResult } from 'cspell';
import * as glob from 'cspell-glob';
import { format } from 'util';
import { AppError } from './error';
import { fetchFilesForCommits, getPullRequestFiles } from './github';
import { ActionParams, validateActionParams } from './ActionParams';
import { getActionParams } from './getActionParams';
import { CSpellReporterForGithubAction } from './reporter';
import { lint, LintOptions } from './spell';

interface Context {
    githubContext: GitHubContext;
    github: Octokit;
    files: string;
    useEventFiles: boolean;
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

async function checkSpelling(params: ActionParams, files: string[]): Promise<RunResult | true> {
    const options: LintOptions = {
        root: params.root || process.cwd(),
        config: params.config || undefined,
    };

    if (!files.length) {
        return true;
    }

    const collector = new CSpellReporterForGithubAction(params.inline, core);
    await lint(files, options, collector.reporter);

    return collector.result;
}

function friendlyEventName(eventName: EventNames | string): string {
    switch (eventName) {
        case 'push':
            return 'Push';
        case 'pull_request':
            return 'Pull Request';
        default:
            return `'${eventName}'`;
    }
}

function isSupportedEvent(eventName: EventNames | string): eventName is EventNames {
    return supportedEvents.has(eventName);
}

async function gatherFilesFromContext(context: Context): Promise<Set<string>> {
    if (context.useEventFiles) {
        const eventFiles = await gatherFiles(context);
        return filterFiles(context.files, eventFiles);
    }

    const files = new Set<string>(
        context.files
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a)
    );
    return files;
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

    const g = new glob.GlobMatcher(globPattern, { mode: 'include' });
    for (const p of files) {
        if (g.match(p)) {
            matchingFiles.add(p);
        }
    }

    return matchingFiles;
}

export async function action(githubContext: GitHubContext, octokit: Octokit): Promise<boolean> {
    const params = getActionParams();
    validateActionParams(params, core.error);
    const eventName = githubContext.eventName;
    if (params.incremental_files_only === 'true' && !isSupportedEvent(eventName)) {
        throw new AppError(`Unsupported event: '${eventName}'`);
    }
    const context: Context = {
        githubContext,
        github: octokit,
        files: params.files,
        useEventFiles: params.incremental_files_only === 'true',
    };

    core.info(friendlyEventName(eventName));
    core.debug(format('Options: %o', params));
    const files = await gatherFilesFromContext(context);
    const result = await checkSpelling(params, [...files]);
    if (result === true) {
        return true;
    }

    const message = `Files checked: ${result.files}, Issues found: ${result.issues} in ${result.filesWithIssues.size} files.`;
    core.info(message);

    const fnS = (n: number) => (n === 1 ? '' : 's');

    if (params.strict === 'true' && result.issues) {
        const filesWithIssues = result.filesWithIssues.size;
        const err = `${result.issues} spelling issue${fnS(result.issues)} found in ${filesWithIssues} of the ${
            result.files
        } file${fnS(result.files)} checked.`;
        core.setFailed(err);
    }

    return !(result.issues + result.errors);
}
