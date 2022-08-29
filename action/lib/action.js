"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const glob = __importStar(require("cspell-glob"));
const path = __importStar(require("path"));
const ActionParams_1 = require("./ActionParams");
const getActionParams_1 = require("./getActionParams");
const github_1 = require("./github");
const reporter_1 = require("./reporter");
const spell_1 = require("./spell");
const supportedIncrementalEvents = new Set(['push', 'pull_request']);
async function gatherPullRequestFiles(context) {
    var _a;
    const { github, githubContext } = context;
    const pull_number = (_a = githubContext.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
    if (!pull_number)
        return new Set();
    return (0, github_1.getPullRequestFiles)(github, { ...githubContext.repo, pull_number });
}
async function gatherPushFiles(context) {
    var _a;
    const { github, githubContext } = context;
    const push = githubContext.payload;
    const commits = (_a = push.commits) === null || _a === void 0 ? void 0 : _a.map((c) => c.id);
    const files = commits && (await (0, github_1.fetchFilesForCommits)(github, githubContext.repo, commits));
    return files || new Set();
}
const checkDotMap = {
    true: true,
    false: false,
    explicit: undefined,
};
async function checkSpelling(params, files) {
    const options = {
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
    const collector = new reporter_1.CSpellReporterForGithubAction(params.inline, reporterOptions, core);
    await (0, spell_1.lint)(files, options, collector.reporter);
    return collector.result;
}
function friendlyEventName(eventName) {
    switch (eventName) {
        case 'push':
            return 'Push';
        case 'pull_request':
            return 'Pull Request';
        default:
            return `'${eventName}'`;
    }
}
function isSupportedEvent(eventName) {
    return supportedIncrementalEvents.has(eventName);
}
async function gatherFilesFromContext(context) {
    if (context.useEventFiles) {
        const eventFiles = await gatherFiles(context);
        return filterFiles(context.files, eventFiles);
    }
    const files = new Set(context.files
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => !!a));
    return files;
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
    const g = new glob.GlobMatcher(globPattern, { mode: 'include' });
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
async function action(githubContext, octokit) {
    const params = (0, getActionParams_1.getActionParams)();
    (0, ActionParams_1.validateActionParams)(params, core.error);
    const eventName = githubContext.eventName;
    if (params.incremental_files_only === 'true' && !isSupportedEvent(eventName)) {
        params.files = params.files || '**';
        core.warning('Unable to determine which files have changed, checking files: ' + params.files);
        params.incremental_files_only = 'false';
    }
    const context = {
        githubContext,
        github: octokit,
        files: params.files,
        useEventFiles: params.incremental_files_only === 'true',
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
    const fnS = (n) => (n === 1 ? '' : 's');
    if (params.strict === 'true' && result.issues) {
        const filesWithIssues = result.filesWithIssues.size;
        const err = `${result.issues} spelling issue${fnS(result.issues)} found in ${filesWithIssues} of the ${result.files} file${fnS(result.files)} checked.`;
        core.setFailed(err);
    }
    return !(result.issues + result.errors);
}
exports.action = action;
function outputResult(runResult) {
    const result = normalizeResult(runResult);
    core.setOutput('success', result.success);
    core.setOutput('number_of_files_checked', result.number_of_files_checked);
    core.setOutput('number_of_issues', result.number_of_issues);
    core.setOutput('number_of_files_with_issues', result.files_with_issues.length);
    core.setOutput('files_with_issues', normalizeFiles(result.files_with_issues));
    core.setOutput('result', result);
}
function normalizeResult(result) {
    const { issues: number_of_issues, files: number_of_files_checked, filesWithIssues } = result;
    return {
        success: !number_of_issues,
        number_of_issues,
        number_of_files_checked,
        files_with_issues: normalizeFiles(filesWithIssues).slice(0, 1000),
    };
}
function normalizeFiles(files) {
    const cwd = process.cwd();
    return [...files].map((file) => path.relative(cwd, file));
}
