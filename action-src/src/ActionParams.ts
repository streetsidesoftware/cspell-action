import { existsSync } from 'fs';
import { AppError } from './error';

/**
 * [Workflow commands for GitHub Actions - GitHub Docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#setting-an-output-parameter)
 */
type InlineWorkflowCommand = 'error' | 'warning' | 'none';

export type TrueFalse = 'true' | 'false';

export interface ActionParamsInput {
    github_token: string;
    files: string;
    incremental_files_only: string;
    config: string;
    root: string;
    inline: string;
    strict: string;
}

export interface ActionParams {
    github_token: string;
    files: string;
    incremental_files_only: TrueFalse;
    config: string;
    root: string;
    inline: InlineWorkflowCommand;
    strict: TrueFalse;
}

const defaultActionParams: ActionParams = {
    github_token: '',
    files: '',
    incremental_files_only: 'true',
    config: '',
    root: '',
    inline: 'warning',
    strict: 'true',
};

export function validateActionParams(
    params: ActionParamsInput | ActionParams,
    logError: (msg: string) => void
): asserts params is ActionParams {
    const validations: ((params: ActionParamsInput) => string | undefined)[] = [
        validateToken,
        validateConfig,
        validateRoot,
        validateInlineLevel,
        validateStrict,
        validateIncrementalFilesOnly,
    ];
    const success = validations
        .map((fn) => fn(params))
        .map((msg) => !msg || (logError(msg), false))
        .reduce((a, b) => a && b, true);
    if (!success) {
        throw new AppError('Bad Configuration.');
    }
}

export function applyDefaults(params: ActionParamsInput): ActionParamsInput {
    const results = { ...params };
    const alias = results as Record<string, string>;
    for (const [key, value] of Object.entries(defaultActionParams)) {
        alias[key] = alias[key] || value;
    }
    return results;
}

function validateToken(params: ActionParamsInput) {
    const token = params.github_token;
    return !token ? 'Missing GITHUB Token' : undefined;
}

function validateIncrementalFilesOnly(params: ActionParamsInput) {
    const isIncrementalOnly = params.incremental_files_only;
    const success = isIncrementalOnly === 'true' || isIncrementalOnly === 'false';
    return !success ? 'Invalid incremental_files_only setting, must be one of (true, false)' : undefined;
}

function validateConfig(params: ActionParamsInput) {
    const config = params.config;
    const success = !config || existsSync(config);
    return !success ? `Configuration file "${config}" not found.` : undefined;
}

function validateRoot(params: ActionParamsInput) {
    const root = params.root;
    const success = !root || existsSync(root);
    return !success ? `Root path does not exist: "${root}"` : undefined;
}

function validateInlineLevel(params: ActionParamsInput) {
    const inline = params.inline;
    const success = isInlineWorkflowCommand(inline);
    return !success ? `Invalid inline level (${inline}), must be one of (error, warning, none)` : undefined;
}

function validateStrict(params: ActionParamsInput) {
    const isStrict = params.strict;
    const success = isStrict === 'true' || isStrict === 'false';
    return !success ? 'Invalid strict setting, must be one of (true, false)' : undefined;
}

const inlineWorkflowCommandSet: Record<InlineWorkflowCommand | string, boolean | undefined> = {
    error: true,
    warning: true,
    none: true,
};

function isInlineWorkflowCommand(cmd: InlineWorkflowCommand | string): cmd is InlineWorkflowCommand {
    return !!inlineWorkflowCommandSet[cmd];
}

export const __testing__ = {
    defaultActionParams,
};
