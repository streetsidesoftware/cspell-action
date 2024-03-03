import { debug, error, info, setFailed, setOutput, warning } from '@actions/core';
import type { Context as GitHubContext } from '@actions/github/lib/context.js';
import type { RunResult } from 'cspell';
import path from 'node:path';
import { validateActionParams } from './ActionParams.js';
import { checkDotMap } from './checkDotMap.js';
import { checkSpellingForContext, type Context } from './checkSpelling.js';
import { getActionParams } from './getActionParams.js';

const core = { debug, error, info, warning };

const defaultGlob = '**';

type EventNames = 'push' | 'pull_request';
const supportedIncrementalEvents = new Set<EventNames | string>(['push', 'pull_request']);

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

/**
 * Run the action based upon the githubContext.
 * @param githubContext
 * @param octokit
 * @returns a promise that resolves to `true` if no issues were found.
 */
export async function action(githubContext: GitHubContext): Promise<boolean> {
    const params = getActionParams();
    validateActionParams(params, core.error);
    const eventName = githubContext.eventName;
    if (params.incremental_files_only === 'true' && !isSupportedEvent(eventName)) {
        params.files = params.files || defaultGlob;
        core.warning('Unable to determine which files have changed, checking files: ' + params.files);
        params.incremental_files_only = 'false';
    }
    params.files = params.files || (params.incremental_files_only !== 'true' ? defaultGlob : '');
    const dot = !!checkDotMap[params.check_dot_files];
    const context: Context = {
        githubContext,
        globs: params.files,
        useEventFiles: params.incremental_files_only === 'true',
        useCSpellFiles: params.use_cspell_files === 'true',
        dot,
    };

    core.info(friendlyEventName(eventName));
    const result = await checkSpellingForContext(params, context);
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
        setFailed(err);
    }

    return !(result.issues + result.errors);
}

function outputResult(runResult: RunResult) {
    const result = normalizeResult(runResult);

    setOutput('success', result.success);
    setOutput('number_of_files_checked', result.number_of_files_checked);
    setOutput('number_of_issues', result.number_of_issues);
    setOutput('number_of_files_with_issues', result.files_with_issues.length);
    setOutput('files_with_issues', normalizeFiles(result.files_with_issues));
    setOutput('result', result);
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
