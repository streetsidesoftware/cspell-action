import { existsSync } from 'fs';
import { AppError } from './error';

/**
 * [Workflow commands for GitHub Actions - GitHub Docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#setting-an-output-parameter)
 */
type InlineWorkflowCommand = 'error' | 'warning' | 'none';

export type TrueFalse = 'true' | 'false';

export interface ActionParamsInput extends Record<keyof ActionParams, string> {}

export interface ActionParams {
    github_token: string;
    files: string;
    incremental_files_only: TrueFalse;
    config: string;
    root: string;
    inline: InlineWorkflowCommand;
    /**
     * Determines if the action should be failed if any spelling issues are found.
     *
     * Allowed values are: true, false
     * @default 'warning'
     */
    strict: TrueFalse;
    /**
     * Increases the amount of information logged during the action.
     * true - show progress
     * false - less information
     * @default 'false'
     */
    verbose: TrueFalse;
    /**
     * Check files and directories starting with `.`.
     * 'true' - glob searches will match against `.dot` files.
     * 'false' - `.dot` files will NOT be checked.
     * 'explicit' - glob patterns can match explicit `.dot` patterns.
     * @default 'explicit'
     */
    check_dot_files: TrueFalse | 'explicit';
}

const defaultActionParams: ActionParams = {
    github_token: '',
    files: '',
    incremental_files_only: 'true',
    config: '',
    root: '',
    inline: 'warning',
    strict: 'true',
    verbose: 'false',
    check_dot_files: 'explicit',
};

type ValidationFunction = (params: ActionParamsInput) => string | undefined;

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

const validateStrict = validateTrueFalse('strict', 'Invalid strict setting, must be one of (true, false)');
const validateIncrementalFilesOnly = validateTrueFalse(
    'incremental_files_only',
    'Invalid incremental_files_only setting, must be one of (true, false)'
);
const validateVerbose = validateTrueFalse('verbose', 'Invalid verbose setting, must be one of (true, false)');

function validateTrueFalse(key: keyof ActionParamsInput, msg: string): ValidationFunction {
    return (params: ActionParamsInput) => {
        const value = params[key];
        const success = value === 'true' || value === 'false';
        return !success ? msg : undefined;
    };
}

const inlineWorkflowCommandSet: Record<InlineWorkflowCommand | string, boolean | undefined> = {
    error: true,
    warning: true,
    none: true,
};

function isInlineWorkflowCommand(cmd: InlineWorkflowCommand | string): cmd is InlineWorkflowCommand {
    return !!inlineWorkflowCommandSet[cmd];
}

export function validateActionParams(
    params: ActionParamsInput | ActionParams,
    logError: (msg: string) => void
): asserts params is ActionParams {
    const validations: ValidationFunction[] = [
        validateToken,
        validateConfig,
        validateRoot,
        validateInlineLevel,
        validateStrict,
        validateIncrementalFilesOnly,
        validateVerbose,
    ];
    const success = validations
        .map((fn) => fn(params))
        .map((msg) => !msg || (logError(msg), false))
        .reduce((a, b) => a && b, true);
    if (!success) {
        throw new AppError('Bad Configuration.');
    }
}

export const __testing__ = {
    defaultActionParams,
};
