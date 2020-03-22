"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const gitHub = require("@actions/github");
const wait_1 = require("./wait");
async function experiment() {
    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds ...`);
    core.debug(new Date().toTimeString());
    await wait_1.wait(parseInt(ms, 10));
    core.debug(new Date().toTimeString());
    core.setOutput('time', new Date().toTimeString());
}
function pullRequest(context) {
    core.info(`Pull Request: ${context.eventName}`);
}
function push(context) {
    core.info(`Pull Request: ${context.eventName}`);
}
async function action() {
    const context = gitHub.context;
    core.info(`context: ${JSON.stringify(context, null, 2)}`);
    switch (context.eventName) {
        case 'push': return push(context);
        case 'pull_request': return pullRequest(context);
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