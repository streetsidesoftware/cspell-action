import { existsSync } from 'fs';
import { AppError } from './error.js';

/**
 * [Workflow commands for GitHub Actions - GitHub Docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#setting-an-output-parameter)
 */
type InlineWorkflowCommand = 'error' | 'warning' | 'none';

export type TrueFalse = 'true' | 'false';

export interface ActionParamsInput extends Record<keyof ActionParams, string> {}

export interface ActionParams {
    /**
     * Files or glob patterns to check.
     */
    files: string;
    incremental_files_only: TrueFalse;
    config: string;
    root: string;
    /**
     * @default 'warning'
     */
    inline: InlineWorkflowCommand;
    /**
     * Determines if the action should be failed if any spelling issues are found.
     *
     * Allowed values are: true, false
     * @default 'false'
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

    /**
     * Use the `files` setting in the CSpell configuration to determine the files to check.
     * @default 'false'
     */
    use_cspell_files: TrueFalse;
}

const defaultActionParams: ActionParams = {
    files: '',
    incremental_files_only: 'true',
    config: '',
    root: '',
    inline: 'warning',
    strict: 'true',
    verbose: 'false',
    check_dot_files: 'explicit',
    use_cspell_files: 'false',
};

type ValidationFunction = (params: ActionParamsInput) => string | undefined;

export function applyDefaults(params: Partial<ActionParamsInput>): ActionParamsInput {
    const results = { ...defaultActionParams, ...params };
    const alias = results as Record<string, string>;
    for (const [key, value] of Object.entries(defaultActionParams)) {
        alias[key] = alias[key] || value;
    }
    return results;
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

function validateTrueFalse(key: keyof ActionParamsInput): ValidationFunction {
    return validateOptions(key, ['true', 'false']);
}

function validateOptions(key: keyof ActionParamsInput, options: string[]): ValidationFunction {
    return (params: ActionParamsInput) => {
        const value = params[key];
        const success = options.includes(value);
        return !success ? `Invalid ${key} setting, must be one of (${options.join(', ')})` : undefined;
    };
}

export function toActionParams(params: Partial<ActionParamsInput>): ActionParams {
    const p = applyDefaults(params);
    validateActionParams(p, () => undefined);
    return p;
}

export function validateActionParams(
    params: ActionParamsInput | ActionParams,
    logError: (msg: string) => void,
): asserts params is ActionParams {
    const validations: ValidationFunction[] = [
        validateConfig,
        validateRoot,
        validateOptions('inline', ['error', 'warning', 'none']),
        validateTrueFalse('strict'),
        validateTrueFalse('incremental_files_only'),
        validateTrueFalse('verbose'),
        validateTrueFalse('use_cspell_files'),
        validateOptions('check_dot_files', ['true', 'false', 'explicit']),
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
