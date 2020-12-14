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
exports.push = exports.pullRequest = void 0;
const core = __importStar(require("@actions/core"));
const gitHubApi = __importStar(require("@actions/github"));
const github_1 = require("@actions/github");
const github_2 = require("./github");
async function pullRequest(context, github) {
    var _a;
    core.info(`Pull Request: ${context.eventName}`);
    if (github) {
        core.info('github');
        const pull_number = ((_a = context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number) || 0;
        const files = await github_2.getPullRequestFiles(github, { ...context.repo, pull_number });
        core.info(files.join('\n'));
    }
}
exports.pullRequest = pullRequest;
async function push(context, github) {
    core.info(`Push: ${context.eventName}`);
    context.sha;
    const result = await github.git.getCommit({ commit_sha: context.sha, ...context.repo });
    core.info(`result: ${JSON.stringify(result, null, 2)}`);
}
exports.push = push;
async function action() {
    const context = gitHubApi.context;
    const github = github_1.getOctokit(core.getInput('github_token', { required: true }));
    core.info(`context: ${JSON.stringify(context, null, 2)}`);
    switch (context.eventName) {
        case 'push':
            return push(context, github);
        case 'pull_request':
            return pullRequest(context, github);
        default:
            core.info(`Unknown event: '${context.eventName}'`);
    }
}
async function run() {
    try {
        core.info('cspell-action');
        await action();
        core.info('Done.');
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=main.js.map