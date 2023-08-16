import * as core from '@actions/core';
import { Context as GitHubContext } from '@actions/github/lib/context';
import { Octokit } from '@octokit/core';
import { RunResult } from 'cspell';
import * as glob from 'cspell-glob';
import * as path from 'path';
import { ActionParams, validateActionParams } from './ActionParams';
import { getActionParams } from './getActionParams';
import { fetchFilesForCommits, getPullRequestFiles } from './github';
import { CSpellReporterForGithubAction } from './reporter';
import { lint, LintOptions } from './spell';

interface Context {
    githubContext: GitHubContext;
    github: Octokit;
    files: string;
    useEventFiles: boolean;
    dot: boolean;
}

type EventNames = 'push' | 'pull_request';
const supportedIncrementalEvents = new Set<EventNames | string>(['push', 'pull_request']);

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

const checkDotMap = {
    true: true,
    false: false,
    explicit: undefined,
} as const;

async function checkSpelling(params: ActionParams, files: string[]): Promise<RunResult | true> {
    const options: LintOptions = {
        root: params.root || process.cwd(),
        config: params.config || undefined,
        checkDotFiles: checkDotMap[params.check_dot_files],
    };

    if (!files.length) {
        return true;
    }

    const reporterOptions = {
        verbose: params.verbose === 'true',
    };

    const collector = new CSpellReporterForGithubAction(params.inline, reporterOptions, core);
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
    return supportedIncrementalEvents.has(eventName);
}

async function gatherFilesFromContext(context: Context): Promise<Set<string>> {
    if (context.useEventFiles) {
        const eventFiles = await gatherFiles(context);
        return filterFiles(context.files, eventFiles, context.dot);
    }

    const files = new Set<string>(
        context.files
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a),
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

function filterFiles(globPattern: string, files: Set<string>, dot: boolean): Set<string> {
    if (!globPattern) return files;

    const matchingFiles = new Set<string>();

    const g = new glob.GlobMatcher(globPattern, { mode: 'include', dot });
    for (const p of files) {
        if (g.match(p)) {
            matchingFiles.add(p);
        }
    }

    return matchingFiles;
}

/**
 * Run the action based upon the githubContext.
 * @param githubContext
 * @param octokit
 * @returns a promise that resolves to `true` if no issues were found.
 */
export async function action(githubContext: GitHubContext, octokit: Octokit): Promise<boolean> {
    const params = getActionParams();
    validateActionParams(params, core.error);
    const eventName = githubContext.eventName;
    if (params.incremental_files_only === 'true' && !isSupportedEvent(eventName)) {
        params.files = params.files || '**';
        core.warning('Unable to determine which files have changed, checking files: ' + params.files);
        params.incremental_files_only = 'false';
    }
    params.files = params.files || (params.incremental_files_only !== 'true' ? '**' : '');
    const dot = !!checkDotMap[params.check_dot_files];
    const context: Context = {
        githubContext,
        github: octokit,
        files: params.files,
        useEventFiles: params.incremental_files_only === 'true',
        dot,
    };

    core.info(friendlyEventName(eventName));
    const files = await gatherFilesFromContext(context);
    const result = await checkSpelling(params, [...files]);
    if (result === true) {
        return true;
    }

    const message = `Files checked: ${result.files}, Issues found: ${result.issues} in ${result.filesWithIssues.size} files.`;
    core.info(message);

    outputResult(result);

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

function outputResult(runResult: RunResult) {
    const result = normalizeResult(runResult);

    core.setOutput('success', result.success);
    core.setOutput('number_of_files_checked', result.number_of_files_checked);
    core.setOutput('number_of_issues', result.number_of_issues);
    core.setOutput('number_of_files_with_issues', result.files_with_issues.length);
    core.setOutput('files_with_issues', normalizeFiles(result.files_with_issues));
    core.setOutput('result', result);
}

function normalizeResult(result: RunResult) {
    const { issues: number_of_issues, files: number_of_files_checked, filesWithIssues } = result;
    return {
        success: !number_of_issues,
        number_of_issues,
        number_of_files_checked,
        files_with_issues: normalizeFiles(filesWithIssues).slice(0, 1000),
    };
}

function normalizeFiles(files: Iterable<string>): string[] {
    const cwd = process.cwd();
    return [...files].map((file) => path.relative(cwd, file));
}
