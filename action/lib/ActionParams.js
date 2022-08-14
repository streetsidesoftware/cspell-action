"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__testing__ = exports.validateActionParams = exports.applyDefaults = void 0;
const fs_1 = require("fs");
const error_1 = require("./error");
const defaultActionParams = {
    github_token: '',
    files: '',
    incremental_files_only: 'true',
    config: '',
    root: '',
    inline: 'warning',
    strict: 'true',
    verbose: 'false',
};
function applyDefaults(params) {
    const results = { ...params };
    const alias = results;
    for (const [key, value] of Object.entries(defaultActionParams)) {
        alias[key] = alias[key] || value;
    }
    return results;
}
exports.applyDefaults = applyDefaults;
function validateToken(params) {
    const token = params.github_token;
    return !token ? 'Missing GITHUB Token' : undefined;
}
function validateConfig(params) {
    const config = params.config;
    const success = !config || (0, fs_1.existsSync)(config);
    return !success ? `Configuration file "${config}" not found.` : undefined;
}
function validateRoot(params) {
    const root = params.root;
    const success = !root || (0, fs_1.existsSync)(root);
    return !success ? `Root path does not exist: "${root}"` : undefined;
}
function validateInlineLevel(params) {
    const inline = params.inline;
    const success = isInlineWorkflowCommand(inline);
    return !success ? `Invalid inline level (${inline}), must be one of (error, warning, none)` : undefined;
}
const validateStrict = validateTrueFalse('strict', 'Invalid strict setting, must be one of (true, false)');
const validateIncrementalFilesOnly = validateTrueFalse('incremental_files_only', 'Invalid incremental_files_only setting, must be one of (true, false)');
const validateVerbose = validateTrueFalse('verbose', 'Invalid verbose setting, must be one of (true, false)');
function validateTrueFalse(key, msg) {
    return (params) => {
        const value = params[key];
        const success = value === 'true' || value === 'false';
        return !success ? msg : undefined;
    };
}
const inlineWorkflowCommandSet = {
    error: true,
    warning: true,
    none: true,
};
function isInlineWorkflowCommand(cmd) {
    return !!inlineWorkflowCommandSet[cmd];
}
function validateActionParams(params, logError) {
    const validations = [
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
        throw new error_1.AppError('Bad Configuration.');
    }
}
exports.validateActionParams = validateActionParams;
exports.__testing__ = {
    defaultActionParams,
};
