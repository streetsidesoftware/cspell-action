"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const wait_1 = require("./wait");
// Deliberate spelling errors
async function run() {
    try {
        const ms = core.getInput('milliseconds');
        core.debug(`Waiting ${ms} milliseconds ...`);
        core.debug(new Date().toTimeString());
        await wait_1.wait(parseInt(ms, 10));
        core.debug(new Date().toTimeString());
        core.setOutput('time', new Date().toTimeString());
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=main.js.map