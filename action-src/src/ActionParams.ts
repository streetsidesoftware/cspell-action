import { existsSync } from 'fs';

import { AppError } from './error.js';
import { ReportChoices } from './spell.js';

/**
 * [Workflow commands for GitHub Actions - GitHub Docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions#setting-an-output-parameter)
 */
type InlineWorkflowCommand = 'error' | 'warning' | 'none';

export type TrueFalse = 'true' | 'false';

export type ActionParamsInput = Record<keyof ActionParams, string>;

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
     * Determines if flagged words should be treated as errors.
     * @default 'false'
     */
    treat_flagged_words_as_errors: TrueFalse;
    /**
     * Determines if the action should be failed if any spelling issues are found.
     *
     * Allowed values are: true, false
     * @default 'false'
     */
    strict: TrueFalse;
    /**
     * Should generate spelling suggestions.
     * Note: Preferred suggestions will always be shown if available.
     * @default 'false'
     */
    suggestions: TrueFalse;
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

    /**
     * Set how unknown words are reported.
     * 'all' - all issues are reported.
     * 'simple' - only unknown words are reported.
     * 'typos' - only typos are reported.
     * 'flagged' - only flagged words are reported.
     * @default 'all'
     */
    report: ReportChoices;
}

const defaultActionParams: ActionParams = {
    files: '',
    incremental_files_only: 'true',
    config: '',
    root: '',
    inline: 'warning',
    treat_flagged_words_as_errors: 'false',
    strict: 'true',
    verbose: 'false',
    check_dot_files: 'explicit',
    use_cspell_files: 'false',
    suggestions: 'false',
    report: 'all',
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
        validateTrueFalse('treat_flagged_words_as_errors'),
        validateTrueFalse('strict'),
        validateTrueFalse('incremental_files_only'),
        validateTrueFalse('verbose'),
        validateTrueFalse('use_cspell_files'),
        validateTrueFalse('suggestions'),
        validateOptions('check_dot_files', ['true', 'false', 'explicit']),
        validateOptions('report', ['all', 'simple', 'typos', 'flagged']),
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
