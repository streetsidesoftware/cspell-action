"use strict";
// Must include .pnp before anything else
// require('../.pnp.js').setup();
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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const context_1 = require("@actions/github/lib/context");
const error_1 = require("./error");
const action_1 = require("./action");
const util_1 = require("util");
function getGithubToken() {
    const t0 = core.getInput('github_token', { required: true });
    if (t0[0] !== '$') {
        return t0;
    }
    return process.env[t0.slice(1)] || 'undefined';
}
async function run() {
    try {
        core.info('cspell-action');
        const githubContext = new context_1.Context();
        const githubToken = getGithubToken();
        await (0, action_1.action)(githubContext, (0, github_1.getOctokit)(githubToken));
        core.info('Done.');
    }
    catch (error) {
        console.error(error);
        core.setFailed((0, error_1.isAppError)(error) ? error.message : (0, error_1.isError)(error) ? error : (0, util_1.format)(error));
    }
}
exports.run = run;
