"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const gitHubApi = require("@actions/github");
const wait_1 = require("./wait");
async function experiment() {
    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds ...`);
    core.debug(new Date().toTimeString());
    await wait_1.wait(parseInt(ms, 10));
    core.debug(new Date().toTimeString());
    core.setOutput('time', new Date().toTimeString());
}
function pullRequest(context, github) {
    core.info(`Pull Request: ${context.eventName}`);
    if (github) {
        core.info('github');
    }
}
async function push(context, github) {
    core.info(`Push: ${context.eventName}`);
    context.sha;
    // eslint-disable-next-line @typescript-eslint/camelcase
    const result = await github.git.getCommit({ commit_sha: context.sha, ...context.repo });
    core.info(`result: ${JSON.stringify(result, null, 2)}`);
}
async function action() {
    const context = gitHubApi.context;
    const github = new gitHubApi.GitHub(core.getInput('github_token', { required: true }));
    core.info(`context: ${JSON.stringify(context, null, 2)}`);
    switch (context.eventName) {
        case 'push': return push(context, github);
        case 'pull_request': return pullRequest(context, github);
        default:
            core.info(`Unknown event: '${context.eventName}'`);
    }
}
async function run() {
    try {
        core.info('cspell-action');
        action();
        experiment();
        core.info('Done.');
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=main.js.map