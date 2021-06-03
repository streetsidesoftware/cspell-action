"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = void 0;
const core = __importStar(require("@actions/core"));
const command_1 = require("@actions/core/lib/command");
const github_1 = require("./github");
const spell_1 = require("./spell");
const path = __importStar(require("path"));
const error_1 = require("./error");
const glob = __importStar(require("cspell-glob"));
const fs_1 = require("fs");
const supportedEvents = new Set(['push', 'pull_request']);
async function gatherPullRequestFiles(context) {
    var _a;
    const { github, githubContext } = context;
    const pull_number = (_a = githubContext.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
    if (!pull_number)
        return new Set();
    return github_1.getPullRequestFiles(github, { ...githubContext.repo, pull_number });
}
async function gatherPushFiles(context) {
    var _a;
    const { github, githubContext } = context;
    const push = githubContext.payload;
    const commits = (_a = push.commits) === null || _a === void 0 ? void 0 : _a.map((c) => c.id);
    const files = commits && (await github_1.fetchFilesForCommits(github, githubContext.repo, commits));
    return files || new Set();
}
async function checkSpelling(params, files) {
    const options = {
        root: params.root || process.cwd(),
        config: params.config || undefined,
    };
    if (!files.length) {
        return true;
    }
    const result = await spell_1.lint(files, options, core);
    if (params.inline !== 'none') {
        const command = params.inline;
        result.issues.forEach((item) => {
            // format: ::warning file={name},line={line},col={col}::{message}
            command_1.issueCommand(command, {
                file: path.relative(process.cwd(), item.uri || ''),
                line: item.row,
                col: item.col,
            }, `Unknown word (${item.text})`);
            console.warn(`${path.relative(process.cwd(), item.uri || '')}:${item.row}:${item.col} Unknown word (${item.text})`);
        });
    }
    return result.result;
}
function friendlyEventName(eventName) {
    switch (eventName) {
        case 'push':
            return 'Push';
        case 'pull_request':
            return 'Pull Request';
        default:
            return `Unknown event: '${eventName}'`;
    }
}
function isSupportedEvent(eventName) {
    return supportedEvents.has(eventName);
}
/**
 * Gather the set of files to be spell checked.
 * @param context Context
 */
async function gatherFiles(context) {
    const eventName = context.githubContext.eventName;
    switch (eventName) {
        case 'push':
            return gatherPushFiles(context);
        case 'pull_request':
            return gatherPullRequestFiles(context);
    }
    return new Set();
}
function filterFiles(globPattern, files) {
    if (!globPattern)
        return files;
    const matchingFiles = new Set();
    const g = new glob.GlobMatcher(globPattern);
    for (const p of files) {
        if (g.match(p)) {
            matchingFiles.add(p);
        }
    }
    return matchingFiles;
}
function getActionParams() {
    return {
        github_token: core.getInput('github_token', { required: true }),
        files: core.getInput('files'),
        config: core.getInput('config'),
        root: core.getInput('root'),
        inline: (core.getInput('inline') || 'warning').toLowerCase(),
        strict: tf(core.getInput('strict') || 'true'),
    };
}
function tf(v) {
    const mapValues = {
        true: 'true',
        t: 'true',
        false: 'false',
        f: 'false',
        '0': 'false',
        '1': 'true',
    };
    v = typeof v === 'boolean' || typeof v === 'number' ? (v ? 'true' : 'false') : v;
    v = v.toLowerCase();
    v = mapValues[v] || v;
    return v;
}
function validateActionParams(params) {
    const validations = [validateToken, validateConfig, validateRoot, validateInlineLevel, validateStrict];
    const success = validations.map((fn) => fn(params)).reduce((a, b) => a && b, true);
    if (!success) {
        throw new error_1.AppError('Bad Configuration.');
    }
    return true;
}
function validateToken(params) {
    const token = params.github_token;
    return !!token;
}
function validateConfig(params) {
    const config = params.config;
    const success = !config || fs_1.existsSync(config);
    if (!success) {
        core.error(`Configuration file "${config}" not found.`);
    }
    return success;
}
function validateRoot(params) {
    const root = params.root;
    const success = !root || fs_1.existsSync(root);
    if (!success) {
        core.error(`Root path does not exist: "${root}"`);
    }
    return success;
}
function validateInlineLevel(params) {
    const inline = params.inline;
    const success = isInlineWorkflowCommand(inline);
    if (!success) {
        core.error(`Invalid inline level (${inline}), must be one of (error, warning, none)`);
    }
    return success;
}
function validateStrict(params) {
    const isStrict = params.strict;
    const success = isStrict === 'true' || isStrict === 'false';
    if (!success) {
        core.error('Invalid strict setting, must be of of (true, false)');
    }
    return success;
}
const inlineWorkflowCommandSet = {
    error: true,
    warning: true,
    none: true,
};
function isInlineWorkflowCommand(cmd) {
    return !!inlineWorkflowCommandSet[cmd];
}
async function action(githubContext, octokit) {
    const params = getActionParams();
    if (!validateActionParams(params)) {
        return false;
    }
    const eventName = githubContext.eventName;
    if (!isSupportedEvent(eventName)) {
        const msg = `Unsupported event: '${eventName}'`;
        throw new error_1.AppError(msg);
    }
    const context = {
        githubContext,
        github: octokit,
        files: core.getInput('files'),
    };
    core.info(friendlyEventName(eventName));
    const eventFiles = await gatherFiles(context);
    const files = filterFiles(context.files, eventFiles);
    const result = await checkSpelling(params, [...files]);
    if (result === true) {
        return true;
    }
    const message = `Files checked: ${result.files}, Issues found: ${result.issues} in ${result.filesWithIssues.size} files.`;
    core.info(message);
    const fnS = (n) => (n === 1 ? '' : 's');
    if (params.strict === 'true' && result.issues) {
        const filesWithIssues = result.filesWithIssues.size;
        const err = `${result.issues} spelling issue${fnS(result.issues)} found in ${filesWithIssues} of the ${result.files} file${fnS(result.files)} checked.`;
        core.setFailed(err);
    }
    return !(result.issues + result.errors);
}
exports.action = action;
//# sourceMappingURL=action.js.map