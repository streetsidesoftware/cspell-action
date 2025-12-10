import path from 'node:path';

import type { PullRequestEvent, PushEvent } from '@octokit/webhooks-types';
import type { RunResult } from 'cspell';

import { ActionParams } from './ActionParams.js';
import { checkDotMap } from './checkDotMap.js';
import { toError } from './error.js';
import { gitListFiles, gitListFilesForPullRequest, gitListFilesForPush, gitRoot } from './git.js';
import { getDefaultLogger } from './logger.js';
import { CSpellReporterForGithubAction } from './reporter.js';
import { lint, LintOptions } from './spell.js';

export async function checkSpellingForContext(params: ActionParams, context: Context): Promise<RunResult> {
    const files = await gatherGitCommitFilesFromContext(context);
    const globs = await gatherFileGlobsFromContext(context);
    const result = await checkSpelling(params, globs, files);
    return result;
}

export interface GitHubContext {
    eventName: string;
    payload: object;
}

export interface Context {
    githubContext: GitHubContext;
    globs: string;
    useEventFiles: boolean;
    useCSpellFiles: boolean;
    dot: boolean;
}

async function gatherGitCommitFilesFromContext(context: Context): Promise<string[] | undefined> {
    if (context.useEventFiles) {
        const eventFiles = await gatherFiles(context);
        if (!eventFiles) return undefined;
        const root = await gitRoot();
        return [...eventFiles].map((f) => path.resolve(root, f));
    }
}

async function gatherFileGlobsFromContext(context: Context): Promise<string[] | undefined> {
    if (context.useCSpellFiles) {
        return undefined;
    }
    const files = new Set<string>(
        context.globs
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a),
    );
    return [...files];
}

/**
 * Gather the set of files to be spell checked.
 * @param context Context
 */
async function gatherFiles(context: Context): Promise<Set<string> | undefined> {
    const logger = getDefaultLogger();
    const eventName = context.githubContext.eventName;

    // console.warn('gatherFiles %o', { context: context.githubContext, eventName });

    try {
        switch (eventName) {
            case 'push':
                return new Set(await gitListFilesForPush(context.githubContext.payload as PushEvent));
            case 'pull_request':
                return new Set(await gitListFilesForPullRequest(context.githubContext.payload as PullRequestEvent));
            default:
                logger.warning(`Unsupported event: ${eventName}. Using files from latest commit.`);
                return new Set(await gitListFiles('HEAD'));
        }
    } catch (e) {
        logger.error(toError(e));
    }

    return undefined;
}

async function checkSpelling(
    params: ActionParams,
    globs: string[] | undefined,
    files: string[] | undefined,
): Promise<RunResult> {
    const options: LintOptions = {
        root: params.root || process.cwd(),
        config: params.config || undefined,
        checkDotFiles: checkDotMap[params.check_dot_files],
        files,
        showSuggestions: params.suggestions === 'true',
        report: params.report,
    };

    const reporterOptions = {
        verbose: params.verbose === 'true',
        treatFlaggedWordsAsErrors: params.treat_flagged_words_as_errors === 'true',
        summary: params.summary === 'true',
    };

    const collector = new CSpellReporterForGithubAction(params.inline, reporterOptions);
    await lint(globs || [], options, collector.reporter);

    return collector.result;
}

export const __testing__: {
    gatherFileGlobsFromContext: typeof gatherFileGlobsFromContext;
} = {
    gatherFileGlobsFromContext,
};
